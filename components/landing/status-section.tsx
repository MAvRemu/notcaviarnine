import type { PoolSnapshot } from '@/lib/pool-data';
import type { SimplePoolSummary } from '@/lib/simplepool/registry';
import type { ShapeSummary } from '@/lib/shape/registry';
import { SHAPE_FACTORY } from '@/lib/shape/registry';
import { SIMPLE_POOL_PACKAGE } from '@/lib/simplepool/registry';
import { minutesSince, timeAgo } from '@/lib/format';
import { ADDRESSES, LINKS, dashboardUrl } from '@/lib/radix/config';

type Tone = 'ok' | 'watch' | 'muted';
const dot: Record<Tone, string> = { ok: 'dot-ok', watch: 'dot-warn', muted: 'dot-muted' };
const stroke: Record<Tone, string> = { ok: '#3fae6a', watch: '#e9b400', muted: '#4a4844' };

export function StatusSection({ snap, pools, shape }: { snap: PoolSnapshot | null; pools: SimplePoolSummary[] | null; shape: ShapeSummary | null }) {
  const livePools = pools?.filter((p) => p.hasLiquidity).length ?? null;
  const s = snap?.state;
  const oracleMin = minutesSince(s?.lsuPoolLastTxAt);
  const oracleTone: Tone = oracleMin === null ? 'muted' : oracleMin < 180 ? 'ok' : 'watch';
  const allowTone: Tone = s?.requireActiveSet ? 'watch' : 'ok';
  const drift = s?.heldNotAllowlisted ?? 0;
  const watchCount = [oracleTone, allowTone, 'watch' /* owner key */].filter((t) => t === 'watch').length;

  const rows: {
    tone: Tone;
    title: string;
    metric: string;
    metricSub?: string;
    text: string;
    href: string;
  }[] = [
    {
      tone: 'ok',
      title: 'HyperStake',
      metric: 'Open to everyone',
      text: 'The pool is public on the ledger. No one — not CaviarNine, not us — can switch it off for you or gate who uses it.',
      href: dashboardUrl(ADDRESSES.hyperStake),
    },
    {
      tone: oracleTone,
      title: 'HyperStake price feed',
      metric: s ? timeAgo(s.lsuPoolLastTxAt) : '—',
      metricSub: 'last refresh',
      text: 'The LSULP value is refreshed every time someone uses CaviarNine’s staking pool. Anyone can trigger a refresh, so we can automate it if activity drops.',
      href: dashboardUrl(ADDRESSES.lsuPool),
    },
    {
      tone: allowTone,
      title: 'LSU Pool validator list',
      metric: s?.allowlistCount != null ? `${s.allowlistCount} of ${s.lsuPoolHeldCount}` : '—',
      metricSub: s?.allowlistLastUpdatedAt ? `validators approved · last updated ${new Date(s.allowlistLastUpdatedAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}` : 'validators approved',
      text:
        drift > 0
          ? `New stake can only enter through validators CaviarNine approved. ${drift} validators already in the pool are no longer on that list. Only CaviarNine can update it. Existing positions, swaps and HLP are unaffected.`
          : 'New stake can only enter through validators CaviarNine approved. Only CaviarNine can update the list. Existing positions, swaps and HLP are unaffected.',
      href: dashboardUrl(ADDRESSES.lsuTokenValidator),
    },
    {
      tone: 'watch',
      title: 'Admin key',
      metric: 'CaviarNine',
      metricSub: 'one key · four products',
      text: 'One key, held by CaviarNine, can change fee splits and the approved-validator list across all four products. It cannot touch your funds or block withdrawals.',
      href: dashboardUrl(ADDRESSES.c9AdminBadge),
    },
    {
      tone: 'ok',
      title: 'Simple Pools',
      metric: livePools !== null ? `${livePools} live pools` : '—',
      metricSub: 'browse now · actions coming',
      text: 'Anyone can create one; adding and swapping are open, and removing liquidity is a public method that no one can switch off. Fee split (80/10/10) is owner-controlled.',
      href: dashboardUrl(SIMPLE_POOL_PACKAGE),
    },
    {
      tone: 'muted',
      title: 'Shape Liquidity',
      metric: shape ? `${shape.pools} pools` : '—',
      metricSub: 'coming soon',
      text: 'Concentrated-liquidity positions held as NFTs in your wallet. We are working through the contracts; seeing, claiming and removing positions comes first.',
      href: dashboardUrl(SHAPE_FACTORY),
    },
    {
      tone: 'ok',
      title: 'Fees',
      metric: '0.1%',
      metricSub: '80% to LPs · 20% to CaviarNine',
      text: 'The split is fixed in the contract. This website adds no fee and cannot change it.',
      href: dashboardUrl(ADDRESSES.feeVaults),
    },
    {
      tone: 'ok',
      title: 'This website',
      metric: 'Non-custodial',
      metricSub: 'open source',
      text: 'We never hold your funds or keys. Every action is a transaction you review and approve in your own Radix Wallet.',
      href: LINKS.frontendRepo,
    },
  ];

  return (
    <section id="status" className="hairline border-y bg-bg-deep/60">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="label mb-3">Status · who keeps what running</div>
            <h2 className="display text-4xl md:text-5xl">What still depends on CaviarNine</h2>
            <p className="mt-4 max-w-2xl text-ink-soft">
              The website was the easy part. This is how the four products connect, what&apos;s healthy, and what we&apos;re watching.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-line px-4 py-2 text-sm">
            <span className="dot dot-ok" />
            <span>Operational</span>
            <span className="text-muted">·</span>
            <span className="dot dot-warn" />
            <span>{watchCount} to watch</span>
            {s && <span className="num ml-2 text-xs text-muted">live · {timeAgo(s.fetchedAt)}</span>}
          </div>
        </div>

        {/* Flow diagram */}
        <div className="mt-12 overflow-x-auto">
          <Flow oracle={oracleTone} allow={allowTone} pools={livePools} shape={shape?.pools ?? null} />
        </div>

        {/* Readouts */}
        <div className="mt-12 divide-y divide-line border-y border-line">
          {rows.map((r) => (
            <a
              key={r.title}
              href={r.href}
              target="_blank"
              rel="noreferrer"
              className="group grid gap-3 py-5 transition-colors hover:bg-bg-deep md:grid-cols-[220px_260px_1fr_auto] md:items-baseline md:gap-6"
            >
              <div className="flex items-center gap-3 font-semibold">
                <span className={`dot ${dot[r.tone]}`} />
                {r.title}
              </div>
              <div>
                <div className="num text-2xl leading-none">{r.metric}</div>
                {r.metricSub && <div className="mt-1 text-xs text-muted">{r.metricSub}</div>}
              </div>
              <p className="text-sm text-ink-soft">{r.text}</p>
              <span className="text-xs text-muted group-hover:text-accent">verify ↗</span>
            </a>
          ))}
        </div>

        {/* Timeline */}
        <ol className="mt-12 grid gap-6 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <Milestone when="Apr 2025" what="HyperStake launched by CaviarNine" />
          <Milestone when={s?.allowlistLastUpdatedAt ? new Date(s.allowlistLastUpdatedAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : 'Oct 2025'} what="Validator list last updated" tone="watch" />
          <Milestone when="21 Aug 2026" what="CaviarNine announces it is leaving Radix" />
          <Milestone when="Aug 2026" what="Not CaviarNine goes live" tone="ok" />
        </ol>
      </div>
    </section>
  );
}

function Milestone({ when, what, tone }: { when: string; what: string; tone?: Tone }) {
  return (
    <li className="border-l border-line pl-4">
      <div className={`num text-xs ${tone === 'watch' ? 'text-accent' : tone === 'ok' ? 'text-ok' : 'text-muted'}`}>{when}</div>
      <div className="mt-1 text-ink-soft">{what}</div>
    </li>
  );
}

/**
 * Plain-language dependency map of all four products: your wallet uses this website to reach four
 * CaviarNine contracts; HyperStake prices from the LSU Pool; the LSU Pool only accepts approved
 * validators; one CaviarNine admin key controls fees and that list.
 */
function Flow({ oracle, allow, pools, shape }: { oracle: Tone; allow: Tone; pools: number | null; shape: number | null }) {
  const W = 980, H = 420;
  const box = (x: number, y: number, w: number, label: string, sub: string, tone: Tone, dashed = false) => (
    <g key={label}>
      <rect x={x} y={y} width={w} height={56} rx={12} fill="none" stroke={stroke[tone]} strokeWidth={1.5} strokeDasharray={dashed ? '4 4' : undefined} />
      <text x={x + w / 2} y={y + 24} textAnchor="middle" fill="#f6f2e8" fontSize={14} fontWeight={600}>{label}</text>
      <text x={x + w / 2} y={y + 42} textAnchor="middle" fill="#f6f2e8" fillOpacity={0.55} fontSize={11}>{sub}</text>
    </g>
  );
  const line = (d: string, tone: Tone = 'muted', arrow = true) => (
    <path key={d} d={d} fill="none" stroke={stroke[tone]} strokeWidth={1.5} markerEnd={arrow ? 'url(#arrow)' : undefined} />
  );
  const label = (x: number, y: number, t: string) => (
    <text key={`${x}-${y}-${t}`} x={x} y={y} textAnchor="middle" fill="#f6f2e8" fillOpacity={0.55} fontSize={11}>{t}</text>
  );
  // columns: wallet 20–200 · website 250–450 · products 520–720 · right 790–970
  const PX = 520, PW = 200;
  const rows = [70, 160, 250, 340]; // HyperStake, LSU Pool, Simple Pools, Shape
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="min-w-[760px] w-full" role="img" aria-label="Dependency map: your wallet uses this website to reach HyperStake, the LSU Pool, Simple Pools and Shape Liquidity. HyperStake takes its price from the LSU Pool, which only accepts approved validators. One CaviarNine admin key controls fees and that list.">
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#f6f2e8" fillOpacity={0.6} />
        </marker>
      </defs>
      {box(20, 205, 180, 'Your wallet', 'you sign every step', 'ok')}
      {line('M200 233 L250 233')}
      {label(225, 223, 'uses')}
      {box(250, 205, 200, 'This website', 'open source · no custody', 'ok')}
      {/* fan-out to the four products */}
      {rows.map((y) => line(`M450 233 C485 233 485 ${y + 28} ${PX} ${y + 28}`))}
      {label(485, 58, 'reaches')}
      {box(PX, rows[0], PW, 'HyperStake', 'instant stake & unstake · live', 'ok')}
      {box(PX, rows[1], PW, 'LSU Pool', 'staking basket · sets LSULP value', oracle)}
      {box(PX, rows[2], PW, 'Simple Pools', pools !== null ? `${pools} live pools · read-only` : 'two-token pools · read-only', 'ok')}
      {box(PX, rows[3], PW, 'Shape Liquidity', shape !== null ? `${shape} pools · coming soon` : 'concentrated positions · coming soon', 'muted')}
      {/* LSU Pool → HyperStake price */}
      {line(`M${PX + PW / 2 + 60} ${rows[1]} L${PX + PW / 2 + 60} ${rows[0] + 56}`, oracle)}
      {label(PX + PW / 2 + 60 + 22, rows[1] - 12, 'price')}
      {/* LSU Pool → approved validators */}
      {line(`M${PX + PW} ${rows[1] + 28} L790 ${rows[1] + 28}`, allow)}
      {label(755, rows[1] + 18, 'gated by')}
      {box(790, rows[1], 180, 'Approved validators', 'list kept by the admin key', allow)}
      {/* admin key: one bus collecting all four products + validators */}
      {rows.map((y) => line(`M${PX + PW} ${y + 44} L745 ${y + 44}`, 'watch', false))}
      {line(`M745 ${rows[0] + 44} L745 ${rows[3] + 44}`, 'watch', false)}
      {line(`M745 ${rows[3] + 44} L790 ${rows[3] + 44}`, 'watch')}
      {label(767, rows[3] + 34, 'fees')}
      {line(`M880 ${rows[1] + 56} L880 ${rows[3] + 16}`, 'watch')}
      {label(905, (rows[1] + 56 + rows[3] + 16) / 2, 'maintains')}
      {box(790, rows[3] + 16, 180, 'CaviarNine admin key', 'sets fees · approves validators', 'watch', true)}
    </svg>
  );
}
