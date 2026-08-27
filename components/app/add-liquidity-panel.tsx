'use client';

import { useMemo, useState } from 'react';
import { usePool } from './pool-context';
import { TokenInput } from './token-input';
import { TxStatus, type TxState } from './tx-status';
import { SlippageControl } from './slippage-control';
import { humanizeError } from './swap-panel';
import { useWallet } from '@/components/radix/rdt-provider';
import { applySlippage, fromAtto, matchRatio, quoteAddLiquidity, toAtto } from '@/lib/hyperstake/math';
import { addLiquidityManifest } from '@/lib/hyperstake/manifests';
import { previewManifest } from '@/lib/radix/gateway';
import { fmt } from '@/lib/format';

export function AddLiquidityPanel() {
  const { params, hlpSupply, balances, slippageBps, refresh, refreshBalances, snapshot } = usePool();
  const { account, sendTransaction } = useWallet();
  const [lsulp, setLsulp] = useState('');
  const [xrd, setXrd] = useState('');
  const [tx, setTx] = useState<TxState>({ phase: 'idle' });

  const parse = (s: string) => { try { return s ? toAtto(s) : 0n; } catch { return 0n; } };
  const aX = parse(lsulp), aY = parse(xrd);

  // Enter one side → the other follows the pool ratio (like the original UI).
  const onLsulp = (v: string) => { setLsulp(v); if (params && params.reserveX > 0n) setXrd(v ? fromAtto(matchRatio(parse(v), params.reserveX, params.reserveY)) : ''); };
  const onXrd = (v: string) => { setXrd(v); if (params && params.reserveY > 0n) setLsulp(v ? fromAtto(matchRatio(parse(v), params.reserveY, params.reserveX)) : ''); };

  const q = useMemo(() => (params ? quoteAddLiquidity(params.reserveX, params.reserveY, hlpSupply, aX, aY) : null), [params, hlpSupply, aX, aY]);
  const minHlp = q ? applySlippage(q.lpOut, slippageBps) : 0n;
  const insufficient = balances ? aX > balances.LSULP || aY > balances.XRD : false;
  const canSubmit = Boolean(account && q && q.lpOut > 0n && !insufficient && tx.phase !== 'signing' && tx.phase !== 'previewing');

  async function submit() {
    if (!account || !q) return;
    const manifest = addLiquidityManifest({ account: account.address, amountLsulp: aX, amountXrd: aY, minHlp });
    setTx({ phase: 'previewing' });
    try {
      const p = await previewManifest(manifest);
      if (p.receipt.status !== 'Succeeded') { setTx({ phase: 'error', error: humanizeError(p.receipt.error_message) }); return; }
    } catch (e) { setTx({ phase: 'error', error: e instanceof Error ? e.message : 'Preview failed' }); return; }
    setTx({ phase: 'signing' });
    const res = await sendTransaction(manifest, 'Not CaviarNine · add HyperStake liquidity');
    if (res.ok) { setTx({ phase: 'done', txId: res.txId }); setLsulp(''); setXrd(''); refresh(); refreshBalances(); }
    else setTx({ phase: 'error', error: res.error });
  }

  const share = q && hlpSupply > 0n ? Number(fromAtto((q.lpOut * 10n ** 18n) / (hlpSupply + q.lpOut))) * 100 : 0;

  return (
    <div className="space-y-3">
      <TokenInput label="LSULP" symbol="LSULP" value={lsulp} onChange={onLsulp} balance={balances?.LSULP ?? null} />
      <TokenInput label="XRD" symbol="XRD" value={xrd} onChange={onXrd} balance={balances?.XRD ?? null} />
      <div className="space-y-1 rounded-2xl border border-line px-4 py-3 text-sm">
        <Row k="You receive (est.)" v={q ? `${fmt(q.lpOut, { dp: 6 })} HLP` : '—'} />
        <Row k="Minimum HLP" v={q ? fmt(minHlp, { dp: 6 }) : '—'} />
        <Row k="Pool ratio" v={params && params.reserveX > 0n ? `1 LSULP : ${fmt(matchRatio(10n ** 18n, params.reserveX, params.reserveY), { dp: 6 })} XRD` : '—'} />
        <Row k="Your pool share after" v={q && q.lpOut > 0n ? `${share.toFixed(4)}%` : '—'} />
        <Row k="1 HLP is worth" v={snapshot ? `${fmt(snapshot.state.hlpValueXrd, { dp: 4 })} XRD` : '—'} />
        {q && (q.remainderX > 0n || q.remainderY > 0n) && (
          <div className="pt-1 text-xs text-muted">Excess {q.remainderX > 0n ? `${fmt(q.remainderX, { dp: 6 })} LSULP` : `${fmt(q.remainderY, { dp: 6 })} XRD`} is returned to you in the same transaction.</div>
        )}
      </div>
      <SlippageControl />
      <TxStatus state={tx} onDismiss={() => setTx({ phase: 'idle' })} />
      <button className="btn w-full" disabled={!canSubmit} onClick={submit}>
        {!account ? 'Connect wallet to add liquidity' : insufficient ? 'Insufficient balance' : tx.phase === 'signing' ? 'Waiting for wallet…' : tx.phase === 'previewing' ? 'Simulating…' : 'Add liquidity'}
      </button>
      <p className="text-xs text-muted">HLP is your share of both reserves; it earns 80% of every swap fee.</p>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4">
      <span className="text-muted">{k}</span>
      <span className="num">{v}</span>
    </div>
  );
}
