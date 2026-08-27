'use client';

import { useMemo, useState } from 'react';
import { usePool } from './pool-context';
import { TokenInput } from './token-input';
import { TxStatus, type TxState } from './tx-status';
import { SlippageControl } from './slippage-control';
import { humanizeError } from './swap-panel';
import { useWallet } from '@/components/radix/rdt-provider';
import { applySlippage, dMul, fromAtto, quoteRemoveLiquidity, toAtto } from '@/lib/hyperstake/math';
import { removeLiquidityManifest } from '@/lib/hyperstake/manifests';
import { previewManifest } from '@/lib/radix/gateway';
import { fmt } from '@/lib/format';

export function RemoveLiquidityPanel() {
  const { params, hlpSupply, balances, slippageBps, refresh, refreshBalances } = usePool();
  const { account, sendTransaction } = useWallet();
  const [hlp, setHlp] = useState('');
  const [tx, setTx] = useState<TxState>({ phase: 'idle' });
  const amount = useMemo(() => { try { return hlp ? toAtto(hlp) : 0n; } catch { return 0n; } }, [hlp]);
  const q = useMemo(() => (params ? quoteRemoveLiquidity(params.reserveX, params.reserveY, hlpSupply, amount) : null), [params, hlpSupply, amount]);
  const minX = q ? applySlippage(q.outX, slippageBps) : 0n;
  const minY = q ? applySlippage(q.outY, slippageBps) : 0n;
  const insufficient = balances ? amount > balances.HLP : false;
  const canSubmit = Boolean(account && q && (q.outX > 0n || q.outY > 0n) && !insufficient && tx.phase !== 'signing' && tx.phase !== 'previewing');
  const valueXrd = q && params ? q.outY + dMul(q.outX, params.oraclePrice) : 0n;

  const setPct = (p: number) => balances && setHlp(fromAtto((balances.HLP * BigInt(p)) / 100n));

  async function submit() {
    if (!account || !q) return;
    const manifest = removeLiquidityManifest({ account: account.address, amountHlp: amount, minLsulp: minX, minXrd: minY });
    setTx({ phase: 'previewing' });
    try {
      const p = await previewManifest(manifest);
      if (p.receipt.status !== 'Succeeded') { setTx({ phase: 'error', error: humanizeError(p.receipt.error_message) }); return; }
    } catch (e) { setTx({ phase: 'error', error: e instanceof Error ? e.message : 'Preview failed' }); return; }
    setTx({ phase: 'signing' });
    const res = await sendTransaction(manifest, 'Not CaviarNine · remove HyperStake liquidity');
    if (res.ok) { setTx({ phase: 'done', txId: res.txId }); setHlp(''); refresh(); refreshBalances(); }
    else setTx({ phase: 'error', error: res.error });
  }

  return (
    <div className="space-y-3">
      <TokenInput label="HLP to redeem" symbol="HLP" value={hlp} onChange={setHlp} balance={balances?.HLP ?? null} />
      <div className="flex gap-2">
        {[25, 50, 75, 100].map((p) => (
          <button key={p} type="button" onClick={() => setPct(p)} disabled={!balances} className="chip flex-1 justify-center">
            {p}%
          </button>
        ))}
      </div>
      <div className="space-y-1 rounded-2xl border border-line px-4 py-3 text-sm">
        <Row k="You receive (est.)" v={q ? `${fmt(q.outX, { dp: 6 })} LSULP + ${fmt(q.outY, { dp: 6 })} XRD` : '—'} />
        <Row k="≈ value at NAV" v={q ? `${fmt(valueXrd, { dp: 2 })} XRD` : '—'} />
        <Row k="Minimums" v={q ? `${fmt(minX, { dp: 6 })} LSULP · ${fmt(minY, { dp: 6 })} XRD` : '—'} />
      </div>
      <SlippageControl />
      <TxStatus state={tx} onDismiss={() => setTx({ phase: 'idle' })} />
      <button className="btn w-full" disabled={!canSubmit} onClick={submit}>
        {!account ? 'Connect wallet to remove liquidity' : insufficient ? 'Insufficient HLP' : tx.phase === 'signing' ? 'Waiting for wallet…' : tx.phase === 'previewing' ? 'Simulating…' : 'Remove liquidity'}
      </button>
      <p className="text-xs text-muted">Returns your share of both reserves. No fee on removal.</p>
    </div>
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
