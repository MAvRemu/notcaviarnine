'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SimplePoolSummary } from '@/lib/simplepool/registry';
import { fetchBalances, fetchLiveSimplePool, type LiveSimplePool } from '@/lib/simplepool/live';
import { simplePoolAddLiquidityManifest, simplePoolRemoveLiquidityManifest } from '@/lib/simplepool/manifests';
import { applySlippage, fromAtto, matchRatio, quoteAddLiquidity, quoteRemoveLiquidity, toAtto, truncToDivisibility, type Atto } from '@/lib/hyperstake/math';
import { previewManifest } from '@/lib/radix/gateway';
import { useWallet } from '@/components/radix/rdt-provider';
import { TokenInput } from '@/components/app/token-input';
import { TxStatus, type TxState } from '@/components/app/tx-status';
import { humanizeError } from '@/components/app/swap-panel';
import { fmt } from '@/lib/format';
import { sizeBucket, trackEvent } from '@/lib/analytics';

const PRESETS = [10, 50, 100];

/** Add / remove liquidity for one Simple Pool. Mirrors the HyperStake panels; reserves are re-read live every 20 s. */
export function PoolActions({ pool }: { pool: SimplePoolSummary }) {
  const { account, sendTransaction } = useWallet();
  const [tab, setTab] = useState<'add' | 'remove'>('add');
  const [live, setLive] = useState<LiveSimplePool | null>(null);
  const [balances, setBalances] = useState<Record<string, Atto> | null>(null);
  const [slippageBps, setSlippageBps] = useState(50);
  const [tx, setTx] = useState<TxState>({ phase: 'idle' });
  const [ax, setAx] = useState('');
  const [ay, setAy] = useState('');
  const [lp, setLp] = useState('');

  const refresh = useCallback(async () => {
    try { setLive(await fetchLiveSimplePool(pool)); } catch { /* keep previous */ }
  }, [pool]);
  const refreshBalances = useCallback(async () => {
    if (!account) { setBalances(null); return; }
    try { setBalances(await fetchBalances(account.address, [pool.resourceX, pool.resourceY, pool.lpResource])); } catch { /* keep */ }
  }, [account, pool]);

  useEffect(() => {
    queueMicrotask(refresh);
    const id = setInterval(refresh, 20_000);
    return () => clearInterval(id);
  }, [refresh]);
  useEffect(() => {
    let gone = false;
    fetchBalancesSafe();
    async function fetchBalancesSafe() { if (!gone) await refreshBalances(); }
    return () => { gone = true; };
  }, [refreshBalances]);

  const parse = (v: string) => { try { return v ? toAtto(v) : 0n; } catch { return 0n; } };
  const aX = parse(ax), aY = parse(ay), aLp = parse(lp);
  const empty = live ? live.reserveX === 0n && live.reserveY === 0n : false;

  const onX = (v: string) => { setAx(v); if (live && live.reserveX > 0n) setAy(v ? fromAtto(truncToDivisibility(matchRatio(parse(v), live.reserveX, live.reserveY), live.divisibilityY)) : ''); };
  const onY = (v: string) => { setAy(v); if (live && live.reserveY > 0n) setAx(v ? fromAtto(truncToDivisibility(matchRatio(parse(v), live.reserveY, live.reserveX), live.divisibilityX)) : ''); };

  const addQ = useMemo(() => (live ? quoteAddLiquidity(live.reserveX, live.reserveY, live.lpSupply, aX, aY) : null), [live, aX, aY]);
  const minLp = addQ ? applySlippage(addQ.lpOut, slippageBps) : 0n;
  const remQ = useMemo(() => (live ? quoteRemoveLiquidity(live.reserveX, live.reserveY, live.lpSupply, aLp) : null), [live, aLp]);
  const minX = remQ && live ? truncToDivisibility(applySlippage(remQ.outX, slippageBps), live.divisibilityX) : 0n;
  const minY = remQ && live ? truncToDivisibility(applySlippage(remQ.outY, slippageBps), live.divisibilityY) : 0n;

  const busy = tx.phase === 'previewing' || tx.phase === 'signing';
  const insufficientAdd = balances ? aX > (balances[pool.resourceX] ?? 0n) || aY > (balances[pool.resourceY] ?? 0n) : false;
  const insufficientRem = balances ? aLp > (balances[pool.lpResource] ?? 0n) : false;

  async function run(manifest: string, message: string, done: () => void, sizeXrd: number) {
    const ev = { product: 'pools' as const, action: tab, size: sizeBucket(sizeXrd) };
    trackEvent('tx_started', ev);
    setTx({ phase: 'previewing' });
    try {
      const p = await previewManifest(manifest);
      if (p.receipt.status !== 'Succeeded') { trackEvent('tx_preview_failed', { ...ev, reason: humanizeError(p.receipt.error_message).slice(0, 60) }); setTx({ phase: 'error', error: humanizeError(p.receipt.error_message) }); return; }
    } catch (e) { trackEvent('tx_preview_failed', { ...ev, reason: 'preview error' }); setTx({ phase: 'error', error: e instanceof Error ? e.message : 'Preview failed' }); return; }
    trackEvent('tx_wallet_opened', ev);
    setTx({ phase: 'signing' });
    const res = await sendTransaction(manifest, message);
    if (res.ok) { trackEvent('tx_committed', ev); setTx({ phase: 'done', txId: res.txId }); done(); refresh(); refreshBalances(); }
    else { trackEvent('tx_rejected', { ...ev, reason: res.error.slice(0, 60) }); setTx({ phase: 'error', error: res.error }); }
  }

  const submitAdd = () => account && addQ && run(
    simplePoolAddLiquidityManifest({ account: account.address, swapComponent: pool.swapComponent, resourceX: pool.resourceX, amountX: aX, resourceY: pool.resourceY, amountY: aY, lpResource: pool.lpResource, minLp }),
    `NotCaviarNine · add liquidity ${pool.symbolX}/${pool.symbolY}`,
    () => { setAx(''); setAy(''); },
    (pool.tvlXrd ?? 0) > 0 && live && live.lpSupply > 0n && addQ.lpOut > 0n ? (Number(fromAtto(addQ.lpOut)) / Number(fromAtto(live.lpSupply))) * (pool.tvlXrd ?? 0) : 0,
  );
  const submitRemove = () => account && remQ && run(
    simplePoolRemoveLiquidityManifest({ account: account.address, swapComponent: pool.swapComponent, lpResource: pool.lpResource, amountLp: aLp, resourceX: pool.resourceX, minX, resourceY: pool.resourceY, minY }),
    `NotCaviarNine · remove liquidity ${pool.symbolX}/${pool.symbolY}`,
    () => setLp(''),
    (pool.tvlXrd ?? 0) > 0 && live && live.lpSupply > 0n ? (Number(fromAtto(aLp)) / Number(fromAtto(live.lpSupply))) * (pool.tvlXrd ?? 0) : 0,
  );

  const lpBalance = balances?.[pool.lpResource] ?? null;
  const share = live && live.lpSupply > 0n && lpBalance ? Number((lpBalance * 1_000_000n) / live.lpSupply) / 10_000 : 0;
  const setPct = (p: number) => lpBalance !== null && setLp(fromAtto((lpBalance * BigInt(p)) / 100n));

  return (
    <section className="card p-5">
      <div className="mb-4 flex items-center gap-1">
        <button className="tab" data-active={tab === 'add'} onClick={() => setTab('add')}>Add liquidity</button>
        <button className="tab" data-active={tab === 'remove'} onClick={() => setTab('remove')}>Remove</button>
      </div>

      {tab === 'add' ? (
        <div className="space-y-3">
          {empty && <p className="rounded-lg border border-warn/40 bg-warn/10 px-3 py-2 text-xs">This pool is empty — the first deposit sets the price. Enter both sides at the ratio you believe is fair.</p>}
          <TokenInput label={pool.symbolX} symbol={pool.symbolX} icon={pool.iconX} value={ax} onChange={empty ? setAx : onX} balance={balances?.[pool.resourceX] ?? null} maxDp={live?.divisibilityX} />
          <TokenInput label={pool.symbolY} symbol={pool.symbolY} icon={pool.iconY} value={ay} onChange={empty ? setAy : onY} balance={balances?.[pool.resourceY] ?? null} maxDp={live?.divisibilityY} />
          <div className="space-y-1 rounded-2xl border border-line px-4 py-3 text-sm">
            <Row k="You receive (est.)" v={addQ ? `${fmt(addQ.lpOut, { dp: 6 })} LP` : '—'} />
            <Row k="Minimum LP" v={addQ ? fmt(minLp, { dp: 6 }) : '—'} />
            <Row k="Your pool share after" v={addQ && live && addQ.lpOut > 0n ? `${(Number(fromAtto((addQ.lpOut + (lpBalance ?? 0n)) * 10n ** 18n / (live.lpSupply + addQ.lpOut))) * 100).toFixed(4)}%` : '—'} />
            {addQ && (addQ.remainderX > 0n || addQ.remainderY > 0n) && (
              <div className="pt-1 text-xs text-muted">Excess {addQ.remainderX > 0n ? `${fmt(addQ.remainderX, { dp: 6 })} ${pool.symbolX}` : `${fmt(addQ.remainderY, { dp: 6 })} ${pool.symbolY}`} is returned to you in the same transaction.</div>
            )}
          </div>
          <Tolerance value={slippageBps} onChange={setSlippageBps} />
          <TxStatus state={tx} onDismiss={() => setTx({ phase: 'idle' })} />
          <button className="btn w-full" disabled={!account || !addQ || addQ.lpOut <= 0n || insufficientAdd || busy} onClick={submitAdd}>
            {!account ? 'Connect wallet to add liquidity' : insufficientAdd ? 'Insufficient balance' : busy ? 'Working…' : 'Add liquidity'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <TokenInput label="LP to redeem" symbol="LP" value={lp} onChange={setLp} balance={lpBalance} />
          <div className="flex gap-2">
            {[25, 50, 75, 100].map((p) => (
              <button key={p} type="button" onClick={() => setPct(p)} disabled={lpBalance === null} className="chip flex-1 justify-center">{p}%</button>
            ))}
          </div>
          <div className="space-y-1 rounded-2xl border border-line px-4 py-3 text-sm">
            <Row k="You receive (est.)" v={remQ ? `${fmt(remQ.outX, { dp: 6 })} ${pool.symbolX} + ${fmt(remQ.outY, { dp: 6 })} ${pool.symbolY}` : '—'} />
            <Row k="Minimums" v={remQ ? `${fmt(minX, { dp: 6 })} · ${fmt(minY, { dp: 6 })}` : '—'} />
            {share > 0 && <Row k="Your pool share now" v={`${share.toFixed(4)}%`} />}
          </div>
          <Tolerance value={slippageBps} onChange={setSlippageBps} />
          <TxStatus state={tx} onDismiss={() => setTx({ phase: 'idle' })} />
          <button className="btn w-full" disabled={!account || !remQ || (remQ.outX <= 0n && remQ.outY <= 0n) || insufficientRem || busy} onClick={submitRemove}>
            {!account ? 'Connect wallet to remove liquidity' : insufficientRem ? 'Insufficient LP' : busy ? 'Working…' : 'Remove liquidity'}
          </button>
          <p className="text-xs text-muted">Returns your share of both reserves. No fee on removal.</p>
        </div>
      )}
    </section>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4">
      <span className="text-muted">{k}</span>
      <span className="num text-right">{v}</span>
    </div>
  );
}

function Tolerance({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="label">Min-receive tolerance</span>
      {PRESETS.map((b) => (
        <button key={b} type="button" className="chip" data-selected={value === b} onClick={() => onChange(b)}>{(b / 100).toFixed(b % 100 ? 1 : 0)}%</button>
      ))}
    </div>
  );
}
