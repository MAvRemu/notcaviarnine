import type { PoolSnapshot } from '@/lib/pool-data';
import type { SimplePoolSummary } from '@/lib/simplepool/registry';
import type { ShapeSummary } from '@/lib/shape/registry';
import { SHAPE_FACTORY } from '@/lib/shape/registry';
import { SIMPLE_POOL_PACKAGE } from '@/lib/simplepool/registry';
import type { GovernanceEntry } from '@/lib/governance/watch';
import { isLive } from '@/lib/products';
import { minutesSince, timeAgo } from '@/lib/format';
import { ADDRESSES, LINKS, dashboardUrl } from '@/lib/radix/config';

type Tone = 'ok' | 'watch' | 'muted';
const dot: Record<Tone, string> = { ok: 'dot-ok', watch: 'dot-warn', muted: 'dot-muted' };
const stroke: Record<Tone, string> = { ok: '#3fae6a', watch: '#e9b400', muted: '#4a4844' };

export function StatusSection({ snap, pools, shape, governance }: { snap: PoolSnapshot | null; pools: SimplePoolSummary[] | null; shape: ShapeSummary | null; governance: GovernanceEntry[] | null }) {
  const lastAction = governance?.[0] ?? null;
  const lastMin = minutesSince(lastAction?.timestamp);
  const recentDays = lastMin === null ? null : lastMin / 1440;
  const livePools = pools?.filter((p) => p.hasLiquidity).length ?? null;
  const s = snap?.state;
  const oracleMin = minutesSince(s?.lsuPoolLastTxAt);
  const oracleTone: Tone = oracleMin === null ? 'muted' : oracleMin < 180 ? 'ok' : 'watch';
  const allowTone: Tone = s?.requireActiveSet ? 'watch' : 'ok';
  const drift = s?.heldNotAllowlisted ?? 0;
  const watchCount = [oracleTone, allowTone, 'watch' /* owner key */, 'watch' /* fee vaults */].filter((t) => t === 'watch').length;

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
      metricSub: lastAction ? `last used ${timeAgo(lastAction.timestamp)}` : 'one key · four products',
      text: 'One key, held by CaviarNine, can change fee splits and the approved-validator list across all four products. It cannot touch your funds or block withdrawals. Every use of the key is listed below.',
      href: dashboardUrl(ADDRESSES.c9AdminBadge),
    },
    {
      tone: 'ok',
      title: 'Simple Pools',
      metric: livePools !== null ? `${livePools} live pools` : '—',
      metricSub: isLive('pools') ? 'browse and provide liquidity' : 'coming soon',
      text: 'Anyone can create one; adding and swapping are open, and removing liquidity is a public method that no one can switch off. Fee split (80/10/10) is owner-controlled.',
      href: dashboardUrl(SIMPLE_POOL_PACKAGE),
    },
    {
      tone: 'watch',
      title: 'Shape Liquidity',
      metric: shape ? `${shape.pools} pools` : '—',
      metricSub: isLive('shape') ? 'live' : 'coming soon',
      text: 'Concentrated-liquidity positions held as NFTs in your wallet. Nothing on the ledger changes while we build the interface.',
      href: dashboardUrl(SHAPE_FACTORY),
    },
    {
      tone: 'watch',
      title: 'Fee vaults',
      metric: '20%',
      metricSub: 'of each fee goes to CaviarNine',
      text: 'LPs keep 80% of every swap fee. Of the rest, half is auctioned for FLOOP/CAVIAR and burned (anyone can trigger it) and half lands in a treasury the admin key can withdraw. The key can change these shares; it cannot touch the 80%. This website adds no fee.',
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
          <Flow allow={allowTone} pools={livePools} shape={shape?.pools ?? null} />
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
              <span className="text-xs text-muted group-hover:text-accent-text">verify ↗</span>
            </a>
          ))}
        </div>

        {/* Admin key activity — every transaction that presented the C9 Admin Badge */}
        <div className="mt-12">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <div className="label">Admin key activity</div>
              <p className="mt-1 text-sm text-muted">Every action needs the CaviarNine admin key; the ledger records each use. Read live, newest first.</p>
            </div>
            {recentDays !== null && (
              <span className={`pill ${recentDays < 7 ? 'border-warn/40 text-warn' : 'border-line text-muted'}`}>
                <span className={`dot ${recentDays < 7 ? 'dot-warn' : 'dot-muted'}`} />
                {recentDays < 7 ? 'used in the last 7 days' : `quiet for ${Math.round(recentDays)} days`}
              </span>
            )}
          </div>
          {governance && governance.length > 0 ? (
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {governance.slice(0, 8).map((e) => (
                <li key={e.intentHash} className="grid gap-2 py-3 text-sm md:grid-cols-[120px_1fr_auto] md:items-baseline">
                  <span className="num text-xs text-muted">{e.timestamp.slice(0, 10)}</span>
                  <div className="space-y-1">
                    {e.actions.map((a, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className={`dot mt-1.5 shrink-0 ${a.severity === 'watch' ? 'dot-warn' : 'dot-muted'}`} />
                        <span><span className="text-muted">{a.target} · </span>{a.text}</span>
                      </div>
                    ))}
                  </div>
                  <a className="text-xs text-muted hover:text-accent-text" href={dashboardUrl(e.intentHash)} target="_blank" rel="noreferrer">tx ↗</a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted">Activity log unavailable right now.</p>
          )}
        </div>

        {/* Timeline */}
        <ol className="mt-12 grid gap-6 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <Milestone when="2023–2025" what="CaviarNine deploys the LSU Pool, Shape Liquidity, Simple Pools and HyperStake on Radix" />
          <Milestone when="21 Aug 2026" what="CaviarNine announces it is leaving Radix; its website goes withdraw-only" tone="watch" />
          <Milestone when="Aug 2026" what="NotCaviarNine goes live with HyperStake" tone="ok" />
          <Milestone when="Next" what={[!isLive('pools') && 'Simple Pools', !isLive('lsu-pool') && 'LSU Pool', !isLive('shape') && 'Shape Liquidity'].filter(Boolean).join(', ') ? `${[!isLive('pools') && 'Simple Pools', !isLive('lsu-pool') && 'LSU Pool', !isLive('shape') && 'Shape Liquidity'].filter(Boolean).join(', ')} open here, one by one` : 'All four products live here'} />
        </ol>
      </div>
    </section>
  );
}

function Milestone({ when, what, tone }: { when: string; what: string; tone?: Tone }) {
  return (
    <li className="border-l border-line pl-4">
      <div className={`num text-xs ${tone === 'watch' ? 'text-accent-text' : tone === 'ok' ? 'text-ok' : 'text-muted'}`}>{when}</div>
      <div className="mt-1 text-ink-soft">{what}</div>
    </li>
  );
}

/**
 * Layered dependency map: users → four products → shared plumbing → one admin key.
 * Colours mean control (green = open to everyone, yellow = owner-controlled), never freshness.
 */
function Flow({ allow, pools, shape }: { allow: Tone; pools: number | null; shape: number | null }) {
  const W = 1040, H = 460;
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
  const label = (x: number, y: number, t: string, anchor: 'middle' | 'start' | 'end' = 'middle') => (
    <text key={`${x}-${y}-${t}`} x={x} y={y} textAnchor={anchor} fill="#f6f2e8" fillOpacity={0.55} fontSize={11}>{t}</text>
  );
  // product row: Simple Pools · HyperStake · LSU Pool · Shape Liquidity
  const PW = 210, PY = 120;
  const PX = [40, 290, 540, 790];
  const centers = PX.map((x) => x + PW / 2);
  const BUS_Y = 216, PLUMB_Y = 248, CTRL_Y = 360, KEY_Y = 380;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="min-w-[820px] w-full" role="img" aria-label="Layered map: your wallet uses this website to reach Simple Pools, HyperStake, the LSU Pool and Shape Liquidity. HyperStake takes its price from the LSU Pool. Fees flow to fee vaults; the LSU Pool and Shape Liquidity depend on approved lists. One CaviarNine admin key controls fee rates and approved lists and can pause new deposits and swaps, but never withdrawals.">
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#f6f2e8" fillOpacity={0.6} />
        </marker>
      </defs>

      {/* users */}
      {box(300, 16, 190, 'Your wallet', 'you sign every step', 'ok')}
      {line('M490 44 L550 44')}
      {label(520, 34, 'uses')}
      {box(550, 16, 190, 'This website', 'open source · no custody', 'ok')}
      {centers.map((cx) => line(`M645 72 C645 100 ${cx} 92 ${cx} ${PY}`))}

      {/* products */}
      {box(PX[0], PY, PW, 'Simple Pools', pools !== null ? `${pools} live pools` : 'two-token pools', 'ok')}
      {box(PX[1], PY, PW, 'HyperStake', 'instant stake & unstake', 'ok')}
      {box(PX[2], PY, PW, 'LSU Pool', 'staking basket · sets LSULP value', 'ok')}
      {box(PX[3], PY, PW, 'Shape Liquidity', shape !== null ? `${shape} pools` : 'concentrated positions', 'ok')}
      {line(`M${PX[2]} ${PY + 28} L${PX[1] + PW} ${PY + 28}`)}
      {label((PX[2] + PX[1] + PW) / 2, PY + 18, 'price')}

      {/* fee stubs (behind the bar) */}
      {centers.map((cx) => line(`M${cx - 25} ${PY + 56} L${cx - 25} ${BUS_Y}`, 'muted', false))}
      {line(`M${centers[0] - 25} ${BUS_Y} L${centers[3] - 25} ${BUS_Y}`, 'muted', false)}
      {line(`M270 ${BUS_Y} L270 ${PLUMB_Y}`, 'watch')}
      {label(282, BUS_Y + 20, 'fees', 'start')}
      {/* approved-list arrows from LSU Pool and Shape */}
      {line(`M${centers[2] + 25} ${PY + 56} L${centers[2] + 25} ${PLUMB_Y}`, allow)}
      {line(`M${centers[3] + 25} ${PY + 56} L${centers[3] + 25} ${PLUMB_Y}`, allow)}
      {label(centers[3] + 37, BUS_Y + 20, 'gated by', 'start')}

      {/* shared plumbing */}
      {box(145, PLUMB_Y, 250, 'Fee vaults', 'burn share auctioned · treasury share withdrawable', 'watch')}
      {box(620, PLUMB_Y, 300, 'Approved lists', 'validators for LSU Pool · tokens for Shape', allow)}

      {/* control */}
      {line(`M270 ${CTRL_Y} L270 ${PLUMB_Y + 56}`, 'watch')}
      {line(`M770 ${CTRL_Y} L770 ${PLUMB_Y + 56}`, 'watch')}
      {line(`M270 ${CTRL_Y} L770 ${CTRL_Y}`, 'watch', false)}
      {line(`M520 ${KEY_Y} L520 ${CTRL_Y}`, 'watch', false)}
      {box(390, KEY_Y, 260, 'CaviarNine admin key', 'one key · every contract above', 'watch', true)}
      {label(520, KEY_Y + 72, 'controls fee rates and approved lists · can pause new deposits & swaps · cannot touch reserves or withdrawals')}
    </svg>
  );
}
