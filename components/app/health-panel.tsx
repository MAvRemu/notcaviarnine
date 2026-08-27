'use client';

import { usePool } from './pool-context';
import { fmt, minutesSince, pct, timeAgo } from '@/lib/format';
import { ADDRESSES, dashboardUrl } from '@/lib/radix/config';
import { toAtto } from '@/lib/hyperstake/math';

export function HealthPanel() {
  const { snapshot, error } = usePool();
  const s = snapshot?.state;
  const stats = snapshot?.stats;
  const oracleAge = minutesSince(s?.lsuPoolLastTxAt);
  const oracleTone = oracleAge === null ? 'muted' : oracleAge < 180 ? 'ok' : 'warn';
  const prem = s ? toAtto(s.premiumToNav) : 0n;

  // Where the price sits inside the range (0 = lower bound, 1 = upper bound).
  let pos = 0.5;
  if (s) {
    const lo = Number(s.rangeLower), hi = Number(s.rangeUpper), p = Number(s.price);
    pos = Math.min(1, Math.max(0, (p - lo) / (hi - lo)));
  }
  // Reserve balance: XRD share of TVL.
  const xrdShare = s && toAtto(s.tvlXrd) > 0n ? Number((toAtto(s.reserveXrd) * 10000n) / toAtto(s.tvlXrd)) / 100 : 50;
  const feesXrd = stats ? fmt(stats.liquidityFeesXrd, { dp: 0 }) : null;

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="label">Pool health</div>
        {s && <span className="num text-xs text-muted">live · {timeAgo(s.fetchedAt)}</span>}
      </div>
      {error && <div className="mb-3 text-xs text-danger">Live data unavailable: {error}</div>}

      {/* Hero: price vs NAV with range bar */}
      <div className="field p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="label">LSULP price vs fair value</div>
            <div className={`num mt-1 text-4xl leading-none ${prem < 0n ? 'text-ok' : 'text-warn'}`}>{s ? pct(s.premiumToNav) : <span className="skeleton">−0.00%</span>}</div>
            <div className="mt-1 text-xs text-muted">{s ? (prem < 0n ? 'Discount — instant staking is cheaper than NAV' : 'At or above NAV') : ''}</div>
          </div>
          <div className="sm:text-right">
            <div className="label">Pool · NAV</div>
            <div className="num mt-1 text-sm">{s ? `${fmt(s.price, { dp: 4 })} · ${fmt(s.nav, { dp: 4 })}` : '—'}</div>
            <div className="text-xs text-muted">XRD per LSULP</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="relative h-2 rounded-full bg-line">
            <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-ok/60 to-warn/60" style={{ width: `${pos * 100}%` }} />
            <div className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-bg bg-ink shadow" style={{ left: `${pos * 100}%` }} />
          </div>
          <div className="num mt-2 flex justify-between text-xs text-muted">
            <span>{s ? `${fmt(s.rangeLower, { dp: 4 })} · −1.5%` : ''}</span>
            <span>trading range</span>
            <span>{s ? `${fmt(s.rangeUpper, { dp: 4 })} · NAV` : ''}</span>
          </div>
        </div>
      </div>

      {/* Reserves */}
      <div className="mt-4">
        <div className="flex items-baseline justify-between">
          <div className="label">Reserves</div>
          <div className="num text-sm">{s ? `${fmt(s.tvlXrd, { dp: 0 })} XRD` : '—'} <span className="text-muted">TVL</span></div>
        </div>
        <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-line">
          <div className="bg-ink" style={{ width: `${xrdShare}%` }} />
          <div className="bg-accent" style={{ width: `${100 - xrdShare}%` }} />
        </div>
        <div className="num mt-2 flex justify-between text-xs text-muted">
          <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-ink" />{s ? `${fmt(s.reserveXrd, { dp: 0 })} XRD` : '—'} · {xrdShare.toFixed(0)}%</span>
          <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-accent" />{s ? `${fmt(s.reserveLsulp, { dp: 0 })} LSULP` : '—'} · {(100 - xrdShare).toFixed(0)}%</span>
        </div>
      </div>

      {/* Tiles */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Tile k="LP fee APR · 7d" v={stats ? (stats.aprLp ? pct(stats.aprLp, 2, false) : '—') : undefined} sub={stats ? `realised · ${stats.swaps} swaps` : undefined} accent />
        <Tile k="Fees to LPs · 7d" v={feesXrd ? `${feesXrd} XRD` : undefined} sub={stats ? `${fmt(stats.volumeXrd, { dp: 0, compact: true })} XRD volume` : undefined} />
        <div className="col-span-2 sm:col-span-1">
          <Tile k="HLP" v={s ? fmt(s.hlpSupply, { dp: 0, compact: true }) : undefined} sub={s ? `1 HLP ≈ ${fmt(s.hlpValueXrd, { dp: 3 })} XRD` : undefined} />
        </div>
      </div>

      {/* Dependencies — compact, collapsible */}
      <details className="mt-4 border-t border-line pt-3 text-xs">
        <summary className="flex items-center justify-between text-muted hover:text-ink">
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="flex items-center gap-1.5 whitespace-nowrap"><span className={`dot dot-${oracleTone}`} />price feed {s ? timeAgo(s.lsuPoolLastTxAt) : ''}</span>
            <span className="flex items-center gap-1.5 whitespace-nowrap"><span className={`dot ${s?.requireActiveSet ? 'dot-warn' : 'dot-ok'}`} />validators {s?.allowlistCount != null ? `${s.allowlistCount}/${s.lsuPoolHeldCount}` : ''}</span>
            <span className="flex items-center gap-1.5 whitespace-nowrap"><span className="dot dot-ok" />open access</span>
          </span>
          <span className="label">details</span>
        </summary>
        <div className="mt-3 space-y-2 text-muted">
          <Dep href={dashboardUrl(ADDRESSES.lsuPool)} title="Price feed" text={s ? `LSULP value last refreshed ${timeAgo(s.lsuPoolLastTxAt)}. It refreshes whenever CaviarNine’s staking pool is used; anyone can trigger it.` : '…'} />
          <Dep href={dashboardUrl(ADDRESSES.lsuTokenValidator)} title="Validator list" text={s ? (s.requireActiveSet ? `${s.allowlistCount ?? '—'} of ${s.lsuPoolHeldCount ?? '—'} validators approved${s.heldNotAllowlisted ? ` (${s.heldNotAllowlisted} in the pool but no longer approved)` : ''}; last updated ${timeAgo(s.allowlistLastUpdatedAt)}. Only CaviarNine can change it. Swaps and HLP are unaffected.` : 'No approval list — nothing to maintain.') : '…'} />
          <Dep href={dashboardUrl(ADDRESSES.hyperStake)} title="Access" text="The pool is open to everyone on the ledger; no permission from CaviarNine is needed." />
        </div>
      </details>
    </div>
  );
}

function Tile({ k, v, sub, accent }: { k: string; v?: string; sub?: string; accent?: boolean }) {
  return (
    <div className="rounded-lg border border-line p-3">
      <div className="label">{k}</div>
      <div className={`num mt-1 text-xl leading-none ${accent ? 'text-accent-text' : ''} ${v === undefined ? 'skeleton inline-block w-16' : ''}`}>{v ?? '0'}</div>
      {sub && <div className="mt-1 text-xs text-muted">{sub}</div>}
    </div>
  );
}

function Dep({ href, title, text }: { href: string; title: string; text: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="block rounded-lg px-1 py-1 hover:bg-bg-deep hover:text-ink-soft">
      <span className="font-semibold text-ink-soft">{title}</span> — {text}
    </a>
  );
}
