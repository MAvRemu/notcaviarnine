import type { PoolSnapshot } from '@/lib/pool-data';
import { minutesSince, timeAgo } from '@/lib/format';
import { ADDRESSES, LINKS, dashboardUrl } from '@/lib/radix/config';

export function StatusSection({ snap }: { snap: PoolSnapshot | null }) {
  const s = snap?.state;
  const oracleMin = minutesSince(s?.lsuPoolLastTxAt);
  return (
    <section id="status" className="hairline border-y bg-card">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="label mb-3">Status · who maintains what</div>
        <h2 className="display text-4xl md:text-5xl">What still depends on CaviarNine, honestly</h2>
        <p className="mt-4 max-w-3xl text-ink-soft">
          The frontend is the easy part. This is what the protocol still needs, who controls it today, and where things stand.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <Item tone="ok" title="Swaps & liquidity" href={dashboardUrl(ADDRESSES.hyperStake)}>
            Swap and liquidity roles are <b>AllowAll</b> on-ledger: nobody can switch the pool off for this site&apos;s users, and no
            permission from CaviarNine is needed.
          </Item>
          <Item tone={oracleMin === null ? 'muted' : oracleMin < 60 ? 'ok' : oracleMin < 360 ? 'warn' : 'danger'} title="Oracle freshness" href={dashboardUrl(ADDRESSES.lsuPool)}>
            LSULP is priced from the LSU Pool&apos;s <em>cached</em> validator valuations, refreshed by its transactions. Last one:{' '}
            <b>{s ? timeAgo(s.lsuPoolLastTxAt) : '…'}</b>. Refreshing is public, so we can run a keeper if traffic ever dries up.
          </Item>
          <Item tone={s?.requireActiveSet ? 'warn' : 'ok'} title="LSU active-set allowlist" href={dashboardUrl(ADDRESSES.lsuTokenValidator)}>
            The LSU Pool only accepts LSUs on an allowlist (<code>require_active = {s ? String(s.requireActiveSet) : '…'}</code>) that
            only the <b>C9 Admin Badge</b> can update. Unmaintained, it drifts from the live validator set. It does not affect swaps or
            HLP, but it is the biggest long-term dependency.
          </Item>
          <Item tone="warn" title="Owner badge (C9 Admin Badge)" href={dashboardUrl(ADDRESSES.c9AdminBadge)}>
            Controls fees, the allowlist and roles. Held by CaviarNine. A handover to the Radix Accountability Council was requested
            on 21 Aug 2026; CaviarNine will &ldquo;come back with a considered answer&rdquo;. <b>Pending.</b>
          </Item>
          <Item tone="ok" title="Fee destinations" href={dashboardUrl(ADDRESSES.feeVaults)}>
            10% of swap fees go to CaviarNine&apos;s fee vaults and 10% to their treasury, encoded on-ledger. This site takes no fee.
          </Item>
          <Item tone="ok" title="This frontend" href={LINKS.frontendRepo}>
            Open source, no accounts, no custody. Every action is a transaction you review and sign in your own wallet.
            Contract source: <a className="underline" href={LINKS.hyperStakeSource} target="_blank" rel="noreferrer">caviarnine-scrypto</a>.
          </Item>
        </div>
      </div>
    </section>
  );
}

function Item({ tone, title, href, children }: { tone: 'ok' | 'warn' | 'danger' | 'muted'; title: string; href: string; children: React.ReactNode }) {
  const c = tone === 'ok' ? 'bg-ok' : tone === 'warn' ? 'bg-warn' : tone === 'danger' ? 'bg-danger' : 'bg-line';
  return (
    <div className="rounded-2xl border border-line bg-bg p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-semibold"><span className={`dot ${c}`} />{title}</div>
        <a className="text-xs text-muted hover:text-ink" href={href} target="_blank" rel="noreferrer">on ledger ↗</a>
      </div>
      <p className="mt-2 text-sm text-ink-soft">{children}</p>
    </div>
  );
}
