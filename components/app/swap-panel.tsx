'use client';

import { useMemo, useState } from 'react';
import { usePool } from './pool-context';
import { TokenInput } from './token-input';
import { TxStatus, type TxState } from './tx-status';
import { SlippageControl } from './slippage-control';
import { useWallet } from '@/components/radix/rdt-provider';
import { applySlippage, dDiv, fromAtto, quoteSwap, toAtto, E18 } from '@/lib/hyperstake/math';
import { swapManifest } from '@/lib/hyperstake/manifests';
import { RESOURCES, type ResourceSymbol } from '@/lib/radix/config';
import { previewManifest } from '@/lib/radix/gateway';
import { fmt, pct } from '@/lib/format';

type Side = Extract<ResourceSymbol, 'XRD' | 'LSULP'>;

export function SwapPanel() {
  const { params, balances, slippageBps, refresh, refreshBalances, snapshot } = usePool();
  const { account, sendTransaction } = useWallet();
  const [from, setFrom] = useState<Side>('XRD');
  const [amount, setAmount] = useState('');
  const [tx, setTx] = useState<TxState>({ phase: 'idle' });
  const to: Side = from === 'XRD' ? 'LSULP' : 'XRD';

  const input = useMemo(() => { try { return amount ? toAtto(amount) : 0n; } catch { return 0n; } }, [amount]);
  const quote = useMemo(
    () => (params && input > 0n ? quoteSwap(params, from === 'LSULP' ? 'x_for_y' : 'y_for_x', input) : null),
    [params, input, from],
  );
  const minOut = quote ? applySlippage(quote.output, slippageBps) : 0n;
  const nav = params?.oraclePrice ?? 0n;
  // Price impact vs NAV: how far the effective XRD/LSULP price sits from the oracle.
  const vsNav = quote && quote.effectivePrice > 0n && nav > 0n ? dDiv(quote.effectivePrice, nav) - E18 : null;
  const balance = balances ? balances[from] : null;
  const insufficient = balance !== null && input > balance;
  const canSubmit = Boolean(account && quote && quote.output > 0n && !insufficient && tx.phase !== 'signing' && tx.phase !== 'previewing');

  const flip = () => { setFrom(to); setAmount(quote ? fromAtto(quote.output) : ''); };

  async function submit() {
    if (!account || !quote) return;
    const manifest = swapManifest({
      account: account.address,
      inputResource: RESOURCES[from],
      inputAmount: input,
      outputResource: RESOURCES[to],
      minOutput: minOut,
    });
    setTx({ phase: 'previewing' });
    try {
      const p = await previewManifest(manifest);
      if (p.receipt.status !== 'Succeeded') {
        setTx({ phase: 'error', error: humanizeError(p.receipt.error_message) });
        return;
      }
    } catch (e) {
      setTx({ phase: 'error', error: e instanceof Error ? e.message : 'Preview failed' });
      return;
    }
    setTx({ phase: 'signing' });
    const res = await sendTransaction(manifest, `Not CaviarNine · swap ${fmt(input, { dp: 2 })} ${from} → ${to}`);
    if (res.ok) { setTx({ phase: 'done', txId: res.txId }); setAmount(''); refresh(); refreshBalances(); }
    else setTx({ phase: 'error', error: res.error });
  }

  return (
    <div className="space-y-3">
      <TokenInput label="You pay" symbol={from} value={amount} onChange={setAmount} balance={balance} />
      <div className="flex justify-center">
        <button type="button" onClick={flip} className="rounded-full border border-line bg-card px-3 py-1 text-xs font-semibold hover:bg-ink hover:text-bg" aria-label="Flip direction">
          ↓↑ flip
        </button>
      </div>
      <TokenInput
        label="You receive (est.)"
        symbol={to}
        value={quote ? fmt(quote.output, { dp: 6 }).replace(/,/g, '') : ''}
        readOnly
        balance={balances ? balances[to] : null}
        hint={quote?.partial ? `Partial fill: the ${to} reserve is exhausted at the range edge; ${fmt(quote.remainder, { dp: 4 })} ${from} will be returned untouched.` : undefined}
      />

      <div className="space-y-1 rounded-2xl border border-line px-4 py-3 text-sm">
        <Row k="Pool price" v={params ? `${fmt(snapshot?.state.price ?? '0', { dp: 6 })} XRD / LSULP` : '—'} />
        <Row k="NAV (oracle)" v={params ? `${fmt(nav, { dp: 6 })} XRD / LSULP` : '—'} />
        <Row k="Your effective price" v={quote && quote.effectivePrice > 0n ? `${fmt(quote.effectivePrice, { dp: 6 })} XRD / LSULP` : '—'} />
        <Row k="vs NAV" v={vsNav !== null ? pct(vsNav) : '—'} tone={vsNav !== null ? (from === 'XRD' ? (vsNav < 0n ? 'ok' : 'warn') : vsNav > 0n ? 'ok' : 'warn') : undefined} />
        <Row k={`Fee (${params ? pct(params.fee, 2, false) : '—'})`} v={quote ? `${fmt(quote.fee, { dp: 6 })} ${from}` : '—'} />
        <Row k="Minimum received" v={quote ? `${fmt(minOut, { dp: 6 })} ${to}` : '—'} />
      </div>

      <SlippageControl />

      <TxStatus state={tx} onDismiss={() => setTx({ phase: 'idle' })} />

      <button className="btn w-full" disabled={!canSubmit} onClick={submit}>
        {!account ? 'Connect wallet to swap' : insufficient ? `Insufficient ${from}` : tx.phase === 'signing' ? 'Waiting for wallet…' : tx.phase === 'previewing' ? 'Simulating…' : `Swap ${from} → ${to}`}
      </button>
      <p className="text-xs text-muted">
        Swapping XRD → LSULP is an instant stake into the LSU Pool basket; LSULP → XRD is an instant unstake (no 7-day wait). Output is
        enforced on-ledger: the transaction fails if you would receive less than the minimum.
      </p>
    </div>
  );
}

function Row({ k, v, tone }: { k: string; v: string; tone?: 'ok' | 'warn' }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted">{k}</span>
      <span className={`num ${tone === 'ok' ? 'text-ok' : tone === 'warn' ? 'text-warn' : ''}`}>{v}</span>
    </div>
  );
}

export function humanizeError(msg?: string) {
  if (!msg) return 'Transaction would fail';
  if (/AssertionFailed|WorktopError|ASSERT_WORKTOP/i.test(msg)) return 'Price moved beyond your tolerance — quote refreshed, try again.';
  if (/InsufficientBalance|ResourceError\(InsufficientBalance/i.test(msg)) return 'Insufficient balance for this amount.';
  return msg.length > 220 ? msg.slice(0, 220) + '…' : msg;
}
