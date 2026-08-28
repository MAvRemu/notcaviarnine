'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { LsuRow } from '@/lib/lsupool/composition';
import { fetchCreditReceipt, fetchLsuLive, quoteAddLsu, quoteRemoveLsu, quoteSwapLsu, type LsuLive } from '@/lib/lsupool/live';
import { lsuAddLiquidityManifest, lsuRefreshPricesManifest, lsuRemoveLiquidityManifest, lsuSwapManifest } from '@/lib/lsupool/manifests';
import { applySlippage, fromAtto, toAtto, type Atto } from '@/lib/hyperstake/math';
import { RESOURCES } from '@/lib/radix/config';
import { gatewayPost, previewManifest } from '@/lib/radix/gateway';
import { useWallet } from '@/components/radix/rdt-provider';
import { TokenInput } from '@/components/app/token-input';
import { TxStatus, type TxState } from '@/components/app/tx-status';
import { humanizeError } from '@/components/app/swap-panel';
import { fmt } from '@/lib/format';
import { sizeBucket, trackEvent } from '@/lib/analytics';

type Tab = 'add' | 'remove' | 'swap';
const PRESETS = [10, 50, 100];

/** Add LSU → LSULP, redeem LSULP → LSU, or move stake LSU → LSU. Quotes replay the contract's exact math via preview. */
export function LsuActions({ rows, requireActive, nav }: { rows: LsuRow[]; requireActive: boolean; nav: string }) {
  const { account, sendTransaction } = useWallet();
  const [tab, setTab] = useState<Tab>('add');
  const [tx, setTx] = useState<TxState>({ phase: 'idle' });
  const [slippageBps, setSlippageBps] = useState(50);
  const [balances, setBalances] = useState<Record<string, Atto> | null>(null);
  const [credit, setCredit] = useState<{ id: string; resources: Record<string, Atto> } | null>(null);

  // selections + amounts
  const approvedRows = useMemo(() => rows.filter((r) => !requireActive || r.approved), [rows, requireActive]);
  const [addLsuSel, setAddLsu] = useState('');
  const [addAmt, setAddAmt] = useState('');
  const [remLsu, setRemLsu] = useState(rows[0]?.lsuResource ?? '');
  const [remAmt, setRemAmt] = useState('');
  const [swapFromSel, setSwapFrom] = useState('');
  const [swapTo, setSwapTo] = useState(rows[0]?.lsuResource ?? '');
  const [swapAmt, setSwapAmt] = useState('');

  const myLsus = useMemo(() => rows.filter((r) => (balances?.[r.lsuResource] ?? 0n) > 0n), [rows, balances]);
  const addLsu = addLsuSel || myLsus[0]?.lsuResource || approvedRows[0]?.lsuResource || '';
  const swapFrom = swapFromSel || myLsus[0]?.lsuResource || rows[0]?.lsuResource || '';

  // live contract numbers for the resources in play
  const [live, setLive] = useState<Record<string, LsuLive>>({});
  const need = useMemo(() => [tab === 'add' ? addLsu : '', tab === 'remove' ? remLsu : '', ...(tab === 'swap' ? [swapFrom, swapTo] : [])].filter(Boolean), [tab, addLsu, remLsu, swapFrom, swapTo]);
  useEffect(() => {
    let gone = false;
    (async () => {
      for (const r of need) {
        if (live[r] && Date.now() - (live[r] as LsuLive & { at?: number }).at! < 20_000) continue;
        try {
          const l = await fetchLsuLive(r);
          if (!gone) setLive((prev) => ({ ...prev, [r]: Object.assign(l, { at: Date.now() }) }));
        } catch { /* not an LSU or gateway hiccup */ }
      }
    })();
    return () => { gone = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [need.join(','), tab]);

  // wallet holdings: LSULP + any known LSU
  const refreshBalances = useCallback(async () => {
    if (!account) { setBalances(null); setCredit(null); return; }
    try {
      const res = await gatewayPost<{ items: { resource_address: string; amount: string }[] }>('/state/entity/page/fungibles/', {
        address: account.address, aggregation_level: 'Global', limit_per_page: 100,
      });
      const known = new Set([RESOURCES.LSULP, ...rows.map((r) => r.lsuResource)]);
      const out: Record<string, Atto> = {};
      for (const i of res.items) if (known.has(i.resource_address)) out[i.resource_address] = toAtto(i.amount);
      setBalances(out);
      setCredit(await fetchCreditReceipt(account.address));
    } catch { /* keep */ }
  }, [account, rows]);
  useEffect(() => { queueMicrotask(refreshBalances); }, [refreshBalances]);

  const nameOf = useCallback((res: string) => rows.find((r) => r.lsuResource === res)?.validatorName ?? res.slice(0, 14), [rows]);
  const parse = (v: string) => { try { return v ? toAtto(v) : 0n; } catch { return 0n; } };
  const busy = tx.phase === 'previewing' || tx.phase === 'signing';

  async function run(manifest: string, message: string, action: 'add' | 'remove' | 'swap', sizeXrd: number, done: () => void) {
    const ev = { product: 'lsu-pool' as const, action: action as 'add' | 'remove' | 'swap', size: sizeBucket(sizeXrd) };
    trackEvent('tx_started', ev);
    setTx({ phase: 'previewing' });
    try {
      const p = await previewManifest(manifest);
      if (p.receipt.status !== 'Succeeded') { trackEvent('tx_preview_failed', { ...ev, reason: humanizeError(p.receipt.error_message).slice(0, 60) }); setTx({ phase: 'error', error: humanizeError(p.receipt.error_message) }); return; }
    } catch (e) { trackEvent('tx_preview_failed', { ...ev, reason: 'preview error' }); setTx({ phase: 'error', error: e instanceof Error ? e.message : 'Preview failed' }); return; }
    trackEvent('tx_wallet_opened', ev);
    setTx({ phase: 'signing' });
    const res = await sendTransaction(manifest, message);
    if (res.ok) { trackEvent('tx_committed', ev); setTx({ phase: 'done', txId: res.txId }); done(); refreshBalances(); }
    else { trackEvent('tx_rejected', { ...ev, reason: res.error.slice(0, 60) }); setTx({ phase: 'error', error: res.error }); }
  }

  // ---- quotes
  const addLive = live[addLsu]; const addA = parse(addAmt);
  const addOut = addLive ? quoteAddLsu(addLive, addA) : 0n;
  const remLive = live[remLsu]; const remA = parse(remAmt);
  const remCredit = credit?.resources[remLsu] ?? 0n;
  const remQ = remLive ? quoteRemoveLsu(remLive, remA, remCredit) : null;
  const swLiveF = live[swapFrom]; const swLiveT = live[swapTo]; const swA = parse(swapAmt);
  const swQ = swLiveF && swLiveT ? quoteSwapLsu(swLiveF, swLiveT, swA) : null;

  const lsulpBalance = balances?.[RESOURCES.LSULP] ?? null;

  return (
    <section className="card p-5">
      <div className="mb-4 flex items-center gap-1">
        <button className="tab" data-active={tab === 'add'} onClick={() => setTab('add')}><span className="sm:hidden">Add</span><span className="hidden sm:inline">Add stake</span></button>
        <button className="tab" data-active={tab === 'remove'} onClick={() => setTab('remove')}><span className="sm:hidden">Redeem</span><span className="hidden sm:inline">Redeem LSULP</span></button>
        <button className="tab" data-active={tab === 'swap'} onClick={() => setTab('swap')}><span className="sm:hidden">Move</span><span className="hidden sm:inline">Move stake</span></button>
      </div>

      {tab === 'add' && (
        <div className="space-y-3">
          <LsuSelect label="Validator stake to deposit" value={addLsu} onChange={setAddLsu} options={myLsus.length ? myLsus : approvedRows} balances={balances} nameOf={nameOf} />
          {account && myLsus.length === 0 && <p className="text-xs text-muted">No stake units found in this wallet. Stake XRD with a validator first, or buy LSULP directly on HyperStake.</p>}
          {requireActive && addLsu && !rows.find((r) => r.lsuResource === addLsu)?.approved && (
            <p className="rounded-lg border border-warn/40 bg-warn/10 px-3 py-2 text-xs">This validator is not on the approved list — the deposit would be rejected.</p>
          )}
          <TokenInput label="Amount" symbol="LSU" value={addAmt} onChange={setAddAmt} balance={balances?.[addLsu] ?? null} />
          <div className="space-y-1 rounded-2xl border border-line px-4 py-3 text-sm">
            <Row k="You receive (est.)" v={addLive ? `${fmt(addOut, { dp: 6 })} LSULP` : '—'} />
            <Row k="Minimum LSULP" v={addLive ? fmt(applySlippage(addOut, slippageBps), { dp: 6 }) : '—'} />
            <Row k="1 LSULP" v={`${fmt(nav, { dp: 4 })} XRD`} />
          </div>
          <p className="text-xs text-muted">No fee on deposits. Your deposit is tracked on a receipt in your wallet — redeeming the same validator later is fee-free.</p>
          <Tolerance value={slippageBps} onChange={setSlippageBps} />
          <TxStatus state={tx} onDismiss={() => setTx({ phase: 'idle' })} />
          <button className="btn w-full" disabled={!account || !addLive || addOut <= 0n || busy || addA > (balances?.[addLsu] ?? 0n)} onClick={() =>
            account && run(
              lsuAddLiquidityManifest({ account: account.address, lsuResource: addLsu, amount: addA, minLsulp: applySlippage(addOut, slippageBps), creditReceiptId: credit?.id }),
              `NotCaviarNine · deposit ${nameOf(addLsu)} stake`, 'add', Number(fromAtto(addA)) * 1.22, () => setAddAmt(''),
            )}>
            {!account ? 'Connect wallet to deposit' : busy ? 'Working…' : 'Deposit stake'}
          </button>
        </div>
      )}

      {tab === 'remove' && (
        <div className="space-y-3">
          <TokenInput label="LSULP to redeem" symbol="LSULP" value={remAmt} onChange={setRemAmt} balance={lsulpBalance} />
          <div className="flex gap-2">
            {[25, 50, 75, 100].map((p) => (
              <button key={p} type="button" onClick={() => lsulpBalance !== null && setRemAmt(fromAtto((lsulpBalance * BigInt(p)) / 100n))} disabled={lsulpBalance === null} className="chip flex-1 justify-center">{p}%</button>
            ))}
          </div>
          <LsuSelect label="Receive stake of validator" value={remLsu} onChange={setRemLsu} options={rows} balances={null} nameOf={nameOf} showVault />
          <div className="space-y-1 rounded-2xl border border-line px-4 py-3 text-sm">
            <Row k="You receive (est.)" v={remQ ? `${fmt(remQ.lsuOut, { dp: 6 })} LSU` : '—'} />
            <Row k="Minimum" v={remQ ? fmt(applySlippage(remQ.lsuOut, slippageBps), { dp: 6 }) : '—'} />
            <Row k="Fee (0.07%)" v={remQ ? (remQ.feeLsu > 0n ? `${fmt(remQ.feeLsu, { dp: 6 })} LSU` : 'free — covered by your receipt') : '—'} />
            {remQ?.partial && <div className="pt-1 text-xs text-warn">The pool holds less of this validator than your entitlement — you would get the whole vault and keep the unused LSULP.</div>}
          </div>
          <Tolerance value={slippageBps} onChange={setSlippageBps} />
          <TxStatus state={tx} onDismiss={() => setTx({ phase: 'idle' })} />
          <button className="btn w-full" disabled={!account || !remQ || remQ.lsuOut <= 0n || busy || remA > (lsulpBalance ?? 0n)} onClick={() =>
            account && remQ && run(
              lsuRemoveLiquidityManifest({ account: account.address, amountLsulp: remA, lsuResource: remLsu, minLsu: applySlippage(remQ.lsuOut, slippageBps), creditReceiptId: credit?.id }),
              `NotCaviarNine · redeem LSULP for ${nameOf(remLsu)} stake`, 'remove', Number(fromAtto(remA)) * 1.22, () => setRemAmt(''),
            )}>
            {!account ? 'Connect wallet to redeem' : busy ? 'Working…' : 'Redeem LSULP'}
          </button>
          <p className="text-xs text-muted">You receive validator stake units, not XRD. For XRD right now, sell LSULP on HyperStake instead; unstaking these units the normal way takes ~7 days.</p>
        </div>
      )}

      {tab === 'swap' && (
        <div className="space-y-3">
          <LsuSelect label="From your stake" value={swapFrom} onChange={setSwapFrom} options={myLsus.length ? myLsus : rows} balances={balances} nameOf={nameOf} />
          <TokenInput label="Amount" symbol="LSU" value={swapAmt} onChange={setSwapAmt} balance={balances?.[swapFrom] ?? null} />
          <LsuSelect label="To validator" value={swapTo} onChange={setSwapTo} options={rows.filter((r) => r.lsuResource !== swapFrom)} balances={null} nameOf={nameOf} showVault />
          <div className="space-y-1 rounded-2xl border border-line px-4 py-3 text-sm">
            <Row k="You receive (est.)" v={swQ ? `${fmt(swQ.out, { dp: 6 })} LSU` : '—'} />
            <Row k="Minimum" v={swQ ? fmt(applySlippage(swQ.out, slippageBps), { dp: 6 }) : '—'} />
            {swQ?.partial && <div className="pt-1 text-xs text-warn">Capped by the pool&apos;s balance of that validator — unused input comes back.</div>}
          </div>
          <Tolerance value={slippageBps} onChange={setSlippageBps} />
          <TxStatus state={tx} onDismiss={() => setTx({ phase: 'idle' })} />
          <button className="btn w-full" disabled={!account || !swQ || swQ.out <= 0n || busy || swA > (balances?.[swapFrom] ?? 0n)} onClick={() =>
            account && swQ && run(
              lsuSwapManifest({ account: account.address, fromLsu: swapFrom, amount: swA, toLsu: swapTo, minOut: applySlippage(swQ.out, slippageBps) }),
              `NotCaviarNine · move stake to ${nameOf(swapTo)}`, 'swap', Number(fromAtto(swA)) * 1.22, () => setSwapAmt(''),
            )}>
            {!account ? 'Connect wallet to move stake' : busy ? 'Working…' : 'Move stake'}
          </button>
          <p className="text-xs text-muted">Switch validators instantly instead of waiting ~7 days to unstake and restake. Fee 0.07%.</p>
        </div>
      )}
    </section>
  );
}

/** Refresh the price cache — anyone can sign it. Shown when the feed is stale. */
export function RefreshPricesButton() {
  const { account, sendTransaction } = useWallet();
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');
  if (!account) return null;
  return (
    <button
      className="chip"
      disabled={state === 'busy'}
      onClick={async () => {
        setState('busy');
        const res = await sendTransaction(lsuRefreshPricesManifest(10), 'NotCaviarNine · refresh LSU prices (public maintenance)');
        setState(res.ok ? 'done' : 'error');
      }}
      title="Signs a public maintenance call that refreshes 10 cached validator prices. Costs only the network fee."
    >
      {state === 'busy' ? 'refreshing…' : state === 'done' ? 'refreshed ✓' : 'refresh prices'}
    </button>
  );
}

function LsuSelect({ label, value, onChange, options, balances, nameOf, showVault }: {
  label: string; value: string; onChange: (v: string) => void; options: LsuRow[];
  balances: Record<string, Atto> | null; nameOf: (r: string) => string; showVault?: boolean;
}) {
  return (
    <label className="field block px-4 py-3">
      <span className="label">{label}</span>
      <select className="num mt-1 w-full bg-transparent text-sm outline-none" value={value} onChange={(e) => onChange(e.target.value)}>
        {!options.some((o) => o.lsuResource === value) && value && <option value={value}>{nameOf(value)}</option>}
        {options.map((o) => (
          <option key={o.lsuResource} value={o.lsuResource}>
            {o.validatorName}
            {balances ? ` — you hold ${fmt(balances[o.lsuResource] ?? 0n, { dp: 2 })}` : showVault ? ` — pool holds ${o.balance.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : ''}
            {!o.approved ? ' (not approved)' : ''}
          </option>
        ))}
      </select>
    </label>
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
