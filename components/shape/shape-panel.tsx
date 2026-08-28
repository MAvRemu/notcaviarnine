'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchShapeLive, fetchShapePositions, shapeAddLiquidityManifest, shapeRemoveAllManifest, toAttoSafe, type ShapeLive, type ShapePosition } from '@/lib/shape/live';
import { alignTick, planBins, priceToTick, tickToPrice, type ShapeKind } from '@/lib/shape/tick';
import { fetchBalances } from '@/lib/simplepool/live';
import { applySlippage, fromAtto, toAtto, truncToDivisibility, type Atto } from '@/lib/hyperstake/math';
import { previewManifest } from '@/lib/radix/gateway';
import { useWallet } from '@/components/radix/rdt-provider';
import { TokenInput } from '@/components/app/token-input';
import { TxStatus, type TxState } from '@/components/app/tx-status';
import { humanizeError } from '@/components/app/swap-panel';
import { BinsChart, type ChartBin } from './bins-chart';
import { fmtNum, sanitizeDecimalInput } from '@/lib/format';
import { sizeBucket, trackEvent } from '@/lib/analytics';

const CONCENTRATIONS = [
  { key: 'narrow', label: 'Narrow', bins: 5 },
  { key: 'balanced', label: 'Balanced', bins: 15 },
  { key: 'wide', label: 'Wide', bins: 31 },
] as const;

const SHAPES: { key: ShapeKind; label: string; bars: number[] }[] = [
  { key: 'spot', label: 'Spot', bars: [1, 1, 1, 1, 1] },
  { key: 'curve', label: 'Curve', bars: [0.3, 0.7, 1, 0.7, 0.3] },
  { key: 'bidask', label: 'Bid-Ask', bars: [1, 0.6, 0.35, 0.6, 1] },
];

export function ShapePanel({ component, symbolX, symbolY, iconX, iconY, xrdPerX, xrdPerY }: {
  component: string; symbolX: string; symbolY: string; iconX?: string; iconY?: string; xrdPerX: number | null; xrdPerY: number | null;
}) {
  const { account, sendTransaction } = useWallet();
  const [live, setLive] = useState<ShapeLive | null>(null);
  const [positions, setPositions] = useState<ShapePosition[] | null>(null);
  const [balances, setBalances] = useState<Record<string, Atto> | null>(null);
  const [tx, setTx] = useState<TxState>({ phase: 'idle' });
  const [simple, setSimple] = useState(true);
  const [shape, setShape] = useState<ShapeKind>('curve');
  const [conc, setConc] = useState<(typeof CONCENTRATIONS)[number]['key']>('balanced');
  const [binsCount, setBinsCount] = useState(15);
  const [midPrice, setMidPrice] = useState('');
  const [ax, setAx] = useState('');
  const [ay, setAy] = useState('');
  const slippageBps = 50;

  const refresh = useCallback(async () => {
    try { setLive(await fetchShapeLive(component)); } catch { /* keep */ }
  }, [component]);
  useEffect(() => { queueMicrotask(refresh); const id = setInterval(refresh, 30_000); return () => clearInterval(id); }, [refresh]);

  const refreshMine = useCallback(async () => {
    if (!account || !live) { setPositions(null); setBalances(null); return; }
    try {
      setBalances(await fetchBalances(account.address, [live.tokenX, live.tokenY]));
      setPositions(await fetchShapePositions(account.address, component, live.receiptResource));
    } catch { /* keep */ }
  }, [account, live, component]);
  useEffect(() => { queueMicrotask(refreshMine); }, [refreshMine]);

  const busy = tx.phase === 'previewing' || tx.phase === 'signing';
  const parse = (v: string) => { try { return v ? toAtto(v) : 0n; } catch { return 0n; } };
  const aX = parse(ax), aY = parse(ay);

  const currentTick = live?.currentTick ?? null;
  const effBins = simple ? CONCENTRATIONS.find((c) => c.key === conc)!.bins : binsCount;
  const effShape: ShapeKind = simple ? 'spot' : shape;
  const midTick = useMemo(() => {
    if (!live) return null;
    if (!simple && midPrice) { const p = Number(midPrice); if (p > 0) return alignTick(priceToTick(p), live.binSpan); }
    return currentTick !== null ? currentTick : alignTick(priceToTick(1), live.binSpan);
  }, [live, simple, midPrice, currentTick]);
  const planned = useMemo(() => {
    if (!live || midTick === null) return [];
    return planBins({ shape: effShape, midTick, binsCount: effBins, span: live.binSpan, currentTick: currentTick ?? midTick });
  }, [live, midTick, effShape, effBins, currentTick]);
  const allocation = useMemo(() => {
    if (!live || !planned.length) return [];
    const xs = Number(fromAtto(aX)), ys = Number(fromAtto(aY));
    const wx = planned.filter((b) => b.side !== 'y').reduce((a, b) => a + b.weight, 0);
    const wy = planned.filter((b) => b.side !== 'x').reduce((a, b) => a + b.weight, 0);
    return planned
      .map((b) => ({ tick: b.tick, x: b.side !== 'y' && wx > 0 ? (xs * b.weight) / wx : 0, y: b.side !== 'x' && wy > 0 ? (ys * b.weight) / wy : 0, side: b.side }))
      .filter((p) => (p.side === 'both' ? p.x > 0 && p.y > 0 : p.x > 0 || p.y > 0));
  }, [planned, aX, aY, live]);

  const range = planned.length && live ? `${fmtNum(tickToPrice(planned[0].tick))} – ${fmtNum(tickToPrice(planned[planned.length - 1].tick + live.binSpan))}` : '—';
  const needX = planned.some((b) => b.side !== 'y'), needY = planned.some((b) => b.side !== 'x');

  const chartBins: ChartBin[] = useMemo(() => {
    if (!live) return [];
    const m = new Map<number, ChartBin>();
    for (const [t, x] of live.binsAbove) m.set(t, { tick: t, x: Number(x) });
    for (const [t, y] of live.binsBelow) m.set(t, { ...(m.get(t) ?? { tick: t }), y: Number(y) });
    if (currentTick !== null) m.set(currentTick, { tick: currentTick, x: Number(live.activeX), y: Number(live.activeY) });
    const yPerX = live.price ?? 0;
    for (const a of allocation) {
      const cur = m.get(a.tick) ?? { tick: a.tick };
      m.set(a.tick, { ...cur, planned: a.y + a.x * yPerX });
    }
    return [...m.values()];
  }, [live, currentTick, allocation]);

  async function run(manifest: string, message: string, action: 'add' | 'remove', sizeXrd: number, done: () => void) {
    const ev = { product: 'shape' as const, action: action as 'add' | 'remove', size: sizeBucket(sizeXrd) };
    trackEvent('tx_started', ev);
    setTx({ phase: 'previewing' });
    try {
      const p = await previewManifest(manifest);
      if (p.receipt.status !== 'Succeeded') { trackEvent('tx_preview_failed', { ...ev, reason: humanizeError(p.receipt.error_message).slice(0, 60) }); setTx({ phase: 'error', error: humanizeError(p.receipt.error_message) }); return; }
    } catch (e) { trackEvent('tx_preview_failed', { ...ev, reason: 'preview error' }); setTx({ phase: 'error', error: e instanceof Error ? e.message : 'Preview failed' }); return; }
    trackEvent('tx_wallet_opened', ev);
    setTx({ phase: 'signing' });
    const res = await sendTransaction(manifest, message);
    if (res.ok) { trackEvent('tx_committed', ev); setTx({ phase: 'done', txId: res.txId }); done(); refresh(); refreshMine(); }
    else { trackEvent('tx_rejected', { ...ev, reason: res.error.slice(0, 60) }); setTx({ phase: 'error', error: res.error }); }
  }

  const submitAdd = () => {
    if (!account || !live || !allocation.length) return;
    const reuse = positions?.find((p) => p.bins.length + allocation.length <= 200);
    const posStrings = allocation.map((p) => ({ tick: p.tick, x: p.x > 0 ? p.x.toFixed(live.divisibilityX) : '0', y: p.y > 0 ? p.y.toFixed(live.divisibilityY) : '0' }));
    const sumX = posStrings.reduce((a, p) => a + Number(p.x), 0), sumY = posStrings.reduce((a, p) => a + Number(p.y), 0);
    // withdraw a hair more than the positions sum to absorb per-position rounding; leftovers return via ENTIRE_WORKTOP
    const padX = sumX > 0 ? 10n ** BigInt(18 - live.divisibilityX) * BigInt(posStrings.length) : 0n;
    const padY = sumY > 0 ? 10n ** BigInt(18 - live.divisibilityY) * BigInt(posStrings.length) : 0n;
    run(
      shapeAddLiquidityManifest({
        account: account.address, component, tokenX: live.tokenX, tokenY: live.tokenY,
        amountX: sumX > 0 ? truncToDivisibility(toAttoSafe(sumX.toFixed(live.divisibilityX)) + padX, live.divisibilityX) : 0n,
        amountY: sumY > 0 ? truncToDivisibility(toAttoSafe(sumY.toFixed(live.divisibilityY)) + padY, live.divisibilityY) : 0n,
        positions: posStrings,
        receipt: reuse ? { resource: live.receiptResource, id: reuse.id } : undefined,
      }),
      `NotCaviarNine · add shape liquidity ${symbolX}/${symbolY}`,
      'add',
      sumY * (xrdPerY ?? 0) + sumX * (xrdPerX ?? 0),
      () => { setAx(''); setAy(''); },
    );
  };

  const removeAll = (p: ShapePosition) => {
    if (!account || !live) return;
    run(
      shapeRemoveAllManifest({
        account: account.address, component, receiptResource: live.receiptResource, id: p.id,
        tokenX: live.tokenX, minX: truncToDivisibility(applySlippage(toAttoSafe(p.totalX), slippageBps), live.divisibilityX),
        tokenY: live.tokenY, minY: truncToDivisibility(applySlippage(toAttoSafe(p.totalY), slippageBps), live.divisibilityY),
      }),
      `NotCaviarNine · remove shape position ${symbolX}/${symbolY}`,
      'remove',
      Number(p.totalY) * (xrdPerY ?? 0) + Number(p.totalX) * (xrdPerX ?? 0),
      () => undefined,
    );
  };

  return (
    <div className="space-y-6">
      <section className="card p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="label">Liquidity by price · {symbolY} per {symbolX}</div>
          {live && currentTick !== null && <span className="num text-xs text-muted">spot {fmtNum(live.price ?? 0)}</span>}
        </div>
        <BinsChart bins={chartBins} currentTick={currentTick} priceOfX={(x, t) => x * tickToPrice(t)} />
        <div className="mt-1 flex flex-wrap gap-4 text-xs text-muted">
          <span><span className="mr-1 inline-block h-2 w-2 rounded-sm bg-[#2f6fef]" />{symbolY} side</span>
          <span><span className="mr-1 inline-block h-2 w-2 rounded-sm bg-[#8d887c]" />{symbolX} side</span>
          <span><span className="mr-1 inline-block h-2 w-2 rounded-sm bg-ink" />active bin</span>
          {allocation.length > 0 && <span><span className="mr-1 inline-block h-2 w-2 rounded-sm border border-dashed border-accent-text" />your deposit</span>}
        </div>
      </section>

      <section className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="label">Add liquidity</div>
          <button type="button" className="chip" data-selected={simple} onClick={() => setSimple(!simple)}>Simple mode</button>
        </div>
        <div className="space-y-3">
          {simple ? (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="label">Concentration</span>
              {CONCENTRATIONS.map((c) => (
                <button key={c.key} type="button" className="chip" data-selected={conc === c.key} onClick={() => setConc(c.key)}>{c.label} · ±{Math.floor(c.bins / 2)} bins</button>
              ))}
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <span className="label">Shape</span>
                {SHAPES.map((s) => (
                  <button key={s.key} type="button" className="chip !h-12 gap-2" data-selected={shape === s.key} onClick={() => setShape(s.key)}>
                    <svg width="34" height="22" viewBox="0 0 34 22">{s.bars.map((h, i) => <rect key={i} x={i * 7} y={22 - h * 20} width={5} height={h * 20} rx={1} fill="currentColor" />)}</svg>
                    {s.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="field block px-4 py-3">
                  <span className="label">Mid price</span>
                  <input className="input !text-lg" inputMode="decimal" placeholder={live?.price ? fmtNum(live.price) : '…'} value={midPrice} onChange={(e) => setMidPrice(sanitizeDecimalInput(e.target.value))} />
                </label>
                <div className="field px-4 py-3">
                  <span className="label">Bins</span>
                  <div className="mt-1 flex items-center gap-3">
                    <button type="button" className="chip" onClick={() => setBinsCount(Math.max(1, binsCount - 2))}>−</button>
                    <span className="num text-lg">{binsCount}</span>
                    <button type="button" className="chip" onClick={() => setBinsCount(Math.min(101, binsCount + 2))}>+</button>
                  </div>
                </div>
              </div>
            </>
          )}
          <div className="num text-xs text-muted">Range {range} · one bin ≈ {live ? (live.binSpan / 10).toFixed(1) : '…'}% of price</div>
          {needX && <TokenInput label={symbolX} symbol={symbolX} icon={iconX} value={ax} onChange={setAx} balance={balances?.[live?.tokenX ?? ''] ?? null} maxDp={live?.divisibilityX} />}
          {needY && <TokenInput label={symbolY} symbol={symbolY} icon={iconY} value={ay} onChange={setAy} balance={balances?.[live?.tokenY ?? ''] ?? null} maxDp={live?.divisibilityY} />}
          <p className="text-xs text-muted">Positions above the price hold {symbolX}, below hold {symbolY}; the active bin needs both. Anything the pool doesn&apos;t take comes straight back.</p>
          <TxStatus state={tx} onDismiss={() => setTx({ phase: 'idle' })} />
          <button className="btn w-full" disabled={!account || !live || !allocation.length || busy} onClick={submitAdd}>
            {!account ? 'Connect wallet to add liquidity' : busy ? 'Working…' : allocation.length ? `Add across ${allocation.length} bins` : 'Enter amounts'}
          </button>
        </div>
      </section>

      {account && positions && positions.length > 0 && live && (
        <section className="card p-5">
          <div className="label mb-3">Your positions</div>
          <ul className="divide-y divide-line text-sm">
            {positions.map((p) => {
              const inRange = currentTick !== null && p.bins.some((b) => b.tick === currentTick);
              return (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <div className="flex items-center gap-2"><span className={`dot ${inRange ? 'dot-ok' : 'dot-warn'}`} />{p.bins.length} bins · {inRange ? 'earning (in range)' : 'out of range'}</div>
                    <div className="num mt-1 text-xs text-muted">≈ {fmtNum(Number(p.totalX))} {symbolX} + {fmtNum(Number(p.totalY))} {symbolY}</div>
                  </div>
                  <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => removeAll(p)}>Withdraw all</button>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
