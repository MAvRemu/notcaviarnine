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
      metricSub: 'handover pending',
      text: 'The admin key sets fee splits and maintains the validator list. A transfer to the Radix Accountability Council was requested on 21 Aug 2026; CaviarNine is considering it.',
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
      text: 'Concentrated-liquidity positions held as NFTs in your wallet. We are researching the contracts; the first goal is a withdraw-safe path (see, claim, remove).',
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
              The website was the easy part. This is the chain behind a HyperStake swap, what&apos;s healthy across all four products, and what we&apos;re watching.
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
          <Flow oracle={oracleTone} allow={allowTone} />
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
          <Milestone when="21 Aug 2026" what="CaviarNine announces it is leaving Radix; admin-key handover requested" />
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
 * Plain-language dependency flow. Top row: the path of a swap. Bottom row:
 * where the price comes from and who controls the gate in front of it.
 */
function Flow({ oracle, allow }: { oracle: Tone; allow: Tone }) {
  const W = 960, H = 250;
  const box = (x: number, y: number, w: number, label: string, sub: string, tone: Tone, dashed = false) => (
    <g key={label}>
      <rect x={x} y={y} width={w} height={56} rx={12} fill="none" stroke={stroke[tone]} strokeWidth={1.5} strokeDasharray={dashed ? '4 4' : undefined} />
      <text x={x + w / 2} y={y + 24} textAnchor="middle" fill="#f6f2e8" fontSize={14} fontWeight={600}>{label}</text>
      <text x={x + w / 2} y={y + 42} textAnchor="middle" fill="#f6f2e8" fillOpacity={0.55} fontSize={11}>{sub}</text>
    </g>
  );
  const arrow = (x1: number, y1: number, x2: number, y2: number, label?: string, tone: Tone = 'muted') => (
    <g key={`${x1}-${y1}-${x2}-${y2}`}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke[tone]} strokeWidth={1.5} markerEnd="url(#arrow)" />
      {label && (
        <text x={(x1 + x2) / 2} y={y1 === y2 ? y1 - 10 : (y1 + y2) / 2 + 4} textAnchor="middle" fill="#f6f2e8" fillOpacity={0.55} fontSize={11}>
          {label}
        </text>
      )}
    </g>
  );
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="min-w-[720px] w-full" role="img" aria-label="Dependency flow: your wallet uses this website to swap in the HyperStake pool; the pool prices from CaviarNine's staking pool, which only accepts validators CaviarNine approved, controlled by CaviarNine's admin key.">
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#f6f2e8" fillOpacity={0.6} />
        </marker>
      </defs>
      {/* top row: the swap path */}
      {box(20, 30, 180, 'Your wallet', 'you sign every step', 'ok')}
      {arrow(200, 58, 260, 58, 'uses')}
      {box(260, 30, 200, 'This website', 'open source · no custody', 'ok')}
      {arrow(460, 58, 520, 58, 'swaps in')}
      {box(520, 30, 200, 'HyperStake pool', 'LSULP ⇄ XRD · open to all', 'ok')}
      {arrow(720, 58, 780, 58, 'holds')}
      {box(780, 30, 160, 'LSULP + XRD', 'the real reserves', 'ok')}

      {/* bottom row: where the price comes from and who gates it */}
      {arrow(620, 150, 620, 90, 'price', oracle)}
      {box(520, 150, 200, 'CaviarNine staking pool', 'sets the LSULP value', oracle)}
      {arrow(520, 178, 460, 178, 'gated by', allow)}
      {box(260, 150, 200, 'Approved validators', 'list maintained by owner', allow)}
      {arrow(260, 178, 200, 178, 'owned by', 'watch')}
      {box(20, 150, 180, 'CaviarNine admin key', 'handover pending', 'watch', true)}
    </svg>
  );
}
