'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { SwapToken } from '@/lib/swap/astrolescent';
import { TokenSelect, XRD_ADDRESS, CURATED, filterImposters } from './token-picker';
import { TxStatus, type TxState } from '@/components/app/tx-status';
import { humanizeError } from '@/components/app/swap-panel';
import { useWallet } from '@/components/radix/rdt-provider';
import { getAccountFungibles, previewManifest } from '@/lib/radix/gateway';
import { fmtNum, sanitizeDecimalInput } from '@/lib/format';
import { sizeBucket, trackEvent } from '@/lib/analytics';

type Quote = {
  outputTokens: number;
  minOutput: string;
  priceImpact: number; // fraction, negative = worse
  swapFee: number; // in output token
  routes: { via: string; share: number }[];
  manifest: string;
  /** account the manifest was built for */
  builtFor: string | null;
};

const TOLERANCE_PRESETS = [10, 50, 100];
const EMPTY_BALANCES: Record<string, string> = {};

export function SwapWidget() {
  const { account, sendTransaction } = useWallet();
  const [tokens, setTokens] = useState<SwapToken[]>([]);
  const [tokensError, setTokensError] = useState(false);
  const [from, setFrom] = useState<SwapToken | null>(null);
  const [to, setTo] = useState<SwapToken | null>(null);
  const [amount, setAmount] = useState('');
  const [slippageBps, setSlippageBps] = useState(50);
  const [balances, setBalances] = useState<Record<string, string>>({});
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [tx, setTx] = useState<TxState>({ phase: 'idle' });
  const seq = useRef(0);

  useEffect(() => {
    fetch('/api/swap/tokens')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((list: SwapToken[]) => {
        const clean = filterImposters(list);
        setTokens(clean);
        setFrom(clean.find((t) => t.address === XRD_ADDRESS) ?? clean[0] ?? null);
        setTo(clean.find((t) => t.address === CURATED[1].address) ?? clean[1] ?? null); // LSULP — the deepest pair here
      })
      .catch(() => setTokensError(true));
  }, []);

  const refreshBalances = useCallback(() => {
    if (account) getAccountFungibles(account.address).then(setBalances).catch(() => {});
  }, [account]);
  useEffect(refreshBalances, [refreshBalances]);
  const heldBalances = account ? balances : EMPTY_BALANCES;

  // Debounced quote; rebuilt when the wallet connects (the manifest embeds the account); refreshed every 30 s.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    const n = ++seq.current;
    const t = setTimeout(async () => {
      if (!from || !to || !amount || Number(amount) <= 0) { setQuote(null); setQuoting(false); setQuoteError(null); return; }
      setQuoting(true);
      setQuoteError(null);
      try {
        const res = await fetch('/api/swap/quote', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ inputToken: from.address, outputToken: to.address, inputAmount: amount, fromAddress: account?.address, slippageBps }),
        });
        const j = await res.json();
        if (n !== seq.current) return;
        if (!res.ok) { setQuote(null); setQuoteError(j.error ?? 'Quote failed'); }
        else setQuote({ ...j, builtFor: account?.address ?? null });
      } catch {
        if (n === seq.current) { setQuote(null); setQuoteError('Quote failed — network error'); }
      } finally {
        if (n === seq.current) setQuoting(false);
      }
    }, 450);
    return () => clearTimeout(t);
  }, [from, to, amount, slippageBps, account?.address, tick]);

  const balanceOf = (t: SwapToken | null) => (t ? heldBalances[t.address] ?? null : null);
  const insufficient = useMemo(() => {
    const b = balanceOf(from);
    return b !== null && amount !== '' && Number(amount) > Number(b);
  }, [from, amount, balances]); // eslint-disable-line react-hooks/exhaustive-deps

  const rate = quote && Number(amount) > 0 ? quote.outputTokens / Number(amount) : null;
  const impactPct = quote ? quote.priceImpact * 100 : null;
  const canSubmit = Boolean(account && quote && quote.builtFor === account.address && !insufficient && !quoting && tx.phase !== 'signing' && tx.phase !== 'previewing');

  const flip = () => {
    const f = from; setFrom(to); setTo(f);
    setAmount(quote ? sanitizeDecimalInput(String(quote.outputTokens), to?.divisibility ?? 18) : '');
  };

  async function submit() {
    if (!account || !from || !to || !quote || quote.builtFor !== account.address) return;
    const xrdEq = from.address === XRD_ADDRESS ? Number(amount) : to.address === XRD_ADDRESS ? quote.outputTokens : NaN;
    const ev = { product: 'swap' as const, action: 'swap' as const, pair: `${from.symbol}→${to.symbol}`.slice(0, 40), size: Number.isFinite(xrdEq) ? sizeBucket(xrdEq) : 'non-xrd' };
    trackEvent('tx_started', ev);
    setTx({ phase: 'previewing' });
    try {
      const p = await previewManifest(quote.manifest);
      if (p.receipt.status !== 'Succeeded') {
        trackEvent('tx_preview_failed', { ...ev, reason: humanizeError(p.receipt.error_message).slice(0, 60) });
        setTx({ phase: 'error', error: humanizeError(p.receipt.error_message) });
        return;
      }
    } catch (e) {
      trackEvent('tx_preview_failed', { ...ev, reason: 'preview error' });
      setTx({ phase: 'error', error: e instanceof Error ? e.message : 'Preview failed' });
      return;
    }
    trackEvent('tx_wallet_opened', ev);
    setTx({ phase: 'signing' });
    const res = await sendTransaction(quote.manifest, `NotCaviarNine · swap ${amount} ${from.symbol} → ${to.symbol}`);
    if (res.ok) { trackEvent('tx_committed', ev); setTx({ phase: 'done', txId: res.txId }); setAmount(''); setQuote(null); refreshBalances(); }
    else { trackEvent('tx_rejected', { ...ev, reason: res.error.slice(0, 60) }); setTx({ phase: 'error', error: res.error }); }
  }

  if (tokensError) return <div className="card p-5 text-sm text-muted">The token list is unavailable right now — try again in a minute.</div>;

  const usdIn = from?.priceUsd && Number(amount) > 0 ? Number(amount) * from.priceUsd : null;
  const usdOut = to?.priceUsd && quote ? quote.outputTokens * to.priceUsd : null;

  return (
    <div className="space-y-3">
      <div className="card space-y-1 p-4">
        {/* From */}
        <div className="field px-4 py-3.5">
          <div className="flex items-center justify-between">
            <span className="label">From</span>
            {balanceOf(from) !== null && (
              <button
                type="button"
                className="text-xs text-muted hover:text-ink"
                onClick={() => { const b = balanceOf(from); if (b) setAmount(sanitizeDecimalInput(b, from?.divisibility ?? 18)); }}
              >
                <span className="num">{fmtNum(Number(balanceOf(from)), { compact: true })}</span> {from?.symbol} · max
              </button>
            )}
          </div>
          <div className="mt-1.5 flex items-center gap-3">
            <input
              className="num min-w-0 flex-1 bg-transparent text-3xl font-semibold outline-none placeholder:text-muted/40"
              inputMode="decimal"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(sanitizeDecimalInput(e.target.value, from?.divisibility ?? 18))}
              aria-label="Amount to pay"
            />
            <TokenSelect tokens={tokens} balances={heldBalances} value={from} excluded={to?.address} onSelect={setFrom} label="From" />
          </div>
          <div className="num mt-1 h-4 text-xs text-muted">{usdIn !== null ? `$${fmtNum(usdIn)}` : ''}</div>
        </div>

        {/* flip */}
        <div className="relative z-10 -my-4 flex justify-center">
          <button type="button" onClick={flip} className="chip h-9 w-9 justify-center border-line bg-card !px-0 text-base" aria-label="Flip direction">↓</button>
        </div>

        {/* To */}
        <div className="field px-4 py-3.5">
          <div className="flex items-center justify-between">
            <span className="label">To</span>
            {rate !== null && from && to && <span className="num text-xs text-muted">1 {from.symbol} = {fmtNum(rate)} {to.symbol}</span>}
          </div>
          <div className="mt-1.5 flex items-center gap-3">
            <div className={`num flex min-w-0 flex-1 items-center gap-3 truncate text-3xl font-semibold ${quote ? '' : 'text-muted/40'} ${quoting ? 'opacity-50' : ''}`}>
              {quoting && !quote ? (
                <span aria-label="Fetching quote" className="inline-block h-6 w-6 shrink-0 animate-spin rounded-full border-2 border-line border-t-accent" />
              ) : (
                quote ? fmtNum(quote.outputTokens) : '0'
              )}
              {quoting && quote && <span aria-label="Updating quote" className="inline-block h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-line border-t-accent" />}
            </div>
            <TokenSelect tokens={tokens} balances={heldBalances} value={to} excluded={from?.address} onSelect={setTo} label="To" />
          </div>
          <div className="num mt-1 h-4 text-xs text-muted">
            {usdOut !== null ? `$${fmtNum(usdOut)}` : ''}
            {impactPct !== null && (
              <span className={impactPct < -5 ? 'text-danger' : impactPct < -1 ? 'text-warn' : ''}> {impactPct > 0 ? '+' : ''}{impactPct.toFixed(2)}%</span>
            )}
          </div>
        </div>

        {/* tolerance + min received, one quiet line */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 pt-2 text-xs">
          <div className="flex items-center gap-1">
            <span className="label mr-1">Tolerance</span>
            {TOLERANCE_PRESETS.map((b) => (
              <button key={b} type="button" onClick={() => setSlippageBps(b)} className="chip" data-selected={slippageBps === b}>
                {(b / 100).toFixed(b % 100 ? 1 : 0)}%
              </button>
            ))}
          </div>
          <span className="num text-muted">{quote && to ? `min ${fmtNum(Number(quote.minOutput))} ${to.symbol}` : ''}</span>
        </div>

        {impactPct !== null && impactPct < -5 && (
          <p className="rounded-xl border border-danger/40 px-3 py-2 text-xs text-danger">
            This swap moves the price by {Math.abs(impactPct).toFixed(1)}% — you get significantly less than market rate. Try a smaller amount.
          </p>
        )}
        {quoteError && <p className="px-1 pt-1 text-sm text-warn">{quoteError}</p>}
        <TxStatus state={tx} onDismiss={() => setTx({ phase: 'idle' })} />

        <div className="pt-2">
          <button className="btn w-full" disabled={!canSubmit} onClick={submit}>
            {!account ? 'Connect wallet to swap' : insufficient ? `Insufficient ${from?.symbol}` : tx.phase === 'signing' ? 'Waiting for wallet…' : tx.phase === 'previewing' ? 'Simulating…' : quoting ? 'Fetching best route…' : from && to ? `Swap ${from.symbol} → ${to.symbol}` : 'Swap'}
          </button>
        </div>

        <p className="pt-1 text-center text-xs text-muted">
          Best route by <a href="https://astrolescent.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink">Astrolescent</a>
        </p>
      </div>

      {/* route split, like the aggregator shows it */}
      {quote && to && quote.routes.length > 0 && (
        <div className="card divide-y divide-line text-sm">
          {quote.routes.map((r) => (
            <div key={r.via} className="flex items-center justify-between px-4 py-2.5">
              <span><span className="num text-muted">{Math.round(r.share * 100)}%</span> <span className="ml-2">{r.via}</span></span>
              <span className="num text-muted">≈ {fmtNum(quote.outputTokens * r.share)} {to.symbol}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
