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
  const oracleTone = oracleAge === null ? 'muted' : oracleAge < 60 ? 'ok' : oracleAge < 360 ? 'warn' : 'danger';
  const prem = s ? toAtto(s.premiumToNav) : 0n;
  const inRange = s ? prem <= 0n && prem >= toAtto(s.lowerOffset) - 10n ** 18n : false;

  return (
    <div className="card p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="label">Pool health</div>
        {s && <span className="num text-[11px] text-muted">state v{s.ledgerStateVersion.toLocaleString()} · {timeAgo(s.fetchedAt)}</span>}
      </div>
      {error && <div className="mb-2 text-xs text-danger">Live data unavailable: {error}</div>}
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        <Stat k="LSULP NAV" v={s ? `${fmt(s.nav, { dp: 6 })} XRD` : undefined} />
        <Stat k="Pool price" v={s ? `${fmt(s.price, { dp: 6 })} XRD` : undefined} />
        <Stat k="vs NAV" v={s ? pct(s.premiumToNav) : undefined} tone={s ? (prem < 0n ? 'ok' : 'warn') : undefined} sub={s ? (prem < 0n ? 'LSULP trades at a discount → cheap instant stake' : 'LSULP at/above NAV') : undefined} />
        <Stat k="Range" v={s ? `${fmt(s.rangeLower, { dp: 4 })} – ${fmt(s.rangeUpper, { dp: 4 })}` : undefined} sub={s ? `${pct(toAtto(s.lowerOffset) - 10n ** 18n, 1)} to ${pct(toAtto(s.upperOffset) - 10n ** 18n, 1)} of NAV · ${inRange ? 'in range' : 'at edge'}` : undefined} />
        <Stat k="XRD liquidity" v={s ? `${fmt(s.reserveXrd, { dp: 0 })} XRD` : undefined} />
        <Stat k="LSULP liquidity" v={s ? `${fmt(s.reserveLsulp, { dp: 0 })} LSULP` : undefined} />
        <Stat k="TVL" v={s ? `${fmt(s.tvlXrd, { dp: 0 })} XRD` : undefined} />
        <Stat k="HLP supply" v={s ? fmt(s.hlpSupply, { dp: 0 }) : undefined} />
        <Stat k="LP fee APR (7d, realised)" v={stats ? (stats.aprLp ? pct(stats.aprLp, 2, false) : '—') : undefined} sub={stats ? `${stats.swaps} swaps · ${fmt(stats.liquidityFeesXrd, { dp: 0 })} XRD fees over ${(stats.coveredHours / 24).toFixed(1)}d` : undefined} />
        <Stat k="7d volume" v={stats ? `${fmt(stats.volumeXrd, { dp: 0, compact: true })} XRD` : undefined} />
      </dl>

      <div className="mt-4 space-y-2 border-t border-line pt-4 text-xs">
        <div className="label mb-1">Dependencies</div>
        <Dep tone={oracleTone} title="Oracle freshness" text={s ? `LSU Pool last touched ${timeAgo(s.lsuPoolLastTxAt)} · pointer ${s.lsuPoolValidatorPointer}/${s.lsuPoolValidatorCount} validators. Cached LSU prices advance 5 per LSU Pool transaction.` : '…'} href={dashboardUrl(ADDRESSES.lsuPool)} />
        <Dep tone={s?.requireActiveSet ? 'warn' : 'ok'} title="LSU active-set allowlist" text={s ? (s.requireActiveSet ? `Enabled, owner-controlled (C9 Admin Badge).${s.allowlistCount != null ? ` ${s.allowlistCount} allowlisted vs ${s.lsuPoolHeldCount} held${s.heldNotAllowlisted ? ` (${s.heldNotAllowlisted} drifted)` : ''}, last updated ${timeAgo(s.allowlistLastUpdatedAt)}.` : ''} Handover pending.` : 'Disabled — no allowlist maintenance needed.') : '…'} href={dashboardUrl(ADDRESSES.lsuTokenValidator)} />
        <Dep tone="ok" title="Swap / liquidity access" text="Both roles are AllowAll on-ledger: anyone can use the contracts without CaviarNine's website." href={dashboardUrl(ADDRESSES.hyperStake)} />
      </div>
    </div>
  );
}

function Stat({ k, v, sub, tone }: { k: string; v?: string; sub?: string; tone?: 'ok' | 'warn' }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wider text-muted">{k}</dt>
      <dd className={`num ${v === undefined ? 'skeleton inline-block w-20' : ''} ${tone === 'ok' ? 'text-ok' : tone === 'warn' ? 'text-warn' : ''}`}>{v ?? '0'}</dd>
      {sub && <dd className="text-[11px] text-muted">{sub}</dd>}
    </div>
  );
}

function Dep({ tone, title, text, href }: { tone: 'ok' | 'warn' | 'danger' | 'muted'; title: string; text: string; href: string }) {
  const c = tone === 'ok' ? 'bg-ok' : tone === 'warn' ? 'bg-warn' : tone === 'danger' ? 'bg-danger' : 'bg-line';
  return (
    <a href={href} target="_blank" rel="noreferrer" className="flex gap-2 rounded-lg px-1 py-1 hover:bg-bg-deep">
      <span className={`dot mt-1.5 shrink-0 ${c}`} />
      <span><span className="font-semibold">{title}</span> — <span className="text-muted">{text}</span></span>
    </a>
  );
}
