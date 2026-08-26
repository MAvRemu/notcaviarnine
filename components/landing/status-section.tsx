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
          The frontend is the easy part. Here is everything the protocol needs to keep working, who controls it today, and what we
          do about it. We update this section as the handover evolves.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <Item tone="ok" title="Swaps & liquidity" href={dashboardUrl(ADDRESSES.hyperStake)}>
            The <code>swap_user</code> and <code>liquidity_user</code> roles are <b>AllowAll</b> on-ledger. Nobody can switch the pool off
            for this site&apos;s users, and no permission from CaviarNine is needed. Only the owner badge can change fee shares or
            those roles — see &ldquo;Owner badge&rdquo;.
          </Item>
          <Item tone={oracleMin === null ? 'muted' : oracleMin < 60 ? 'ok' : oracleMin < 360 ? 'warn' : 'danger'} title="Oracle freshness" href={dashboardUrl(ADDRESSES.lsuPool)}>
            HyperStake prices LSULP from the LSU Pool&apos;s <em>cached</em> validator LSU valuations, refreshed 5 validators per LSU
            Pool transaction. Last LSU Pool transaction: <b>{s ? timeAgo(s.lsuPoolLastTxAt) : '…'}</b>
            {s ? ` (${s.lsuPoolValidatorCount} validators tracked)` : ''}. Refreshing is public — anyone can call it — so we can run a
            keeper if organic traffic ever dries up.
          </Item>
          <Item tone={s?.requireActiveSet ? 'warn' : 'ok'} title="LSU active-set allowlist" href={dashboardUrl(ADDRESSES.lsuTokenValidator)}>
            The LSU Pool only accepts LSUs of validators on an allowlist (<code>require_active = {s ? String(s.requireActiveSet) : '…'}</code>),
            which only the <b>C9 Admin Badge</b> holder can update. If nobody maintains it, the list drifts from the live validator set
            over time. This does not affect HyperStake swaps or HLP, but it is the protocol&apos;s biggest long-term dependency.
          </Item>
          <Item tone="warn" title="Owner badge (C9 Admin Badge)" href={dashboardUrl(ADDRESSES.c9AdminBadge)}>
            Controls fee shares, the allowlist and role updates for HyperStake and the LSU Pool. Held by CaviarNine (3 badges).
            A handover to the Radix Accountability Council was requested on 21 Aug 2026; CaviarNine said they would
            &ldquo;come back with a considered answer&rdquo;. <b>Pending.</b>
          </Item>
          <Item tone="ok" title="Fee destinations" href={dashboardUrl(ADDRESSES.feeVaults)}>
            10% of swap fees go to CaviarNine&apos;s fee vaults (CAVIAR buyback/burn) and 10% to their treasury, as encoded on-ledger. This
            site takes no fee and cannot change that split.
          </Item>
          <Item tone="ok" title="This frontend" href={LINKS.frontendRepo}>
            Open source, static, no accounts, no custody. Reads from the Radix Gateway; every write is a transaction manifest you
            review and sign in your own wallet. Contract source: <a className="underline" href={LINKS.hyperStakeSource} target="_blank" rel="noreferrer">caviarnine-scrypto</a>.
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
