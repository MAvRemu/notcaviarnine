import type { Metadata } from 'next';
import { ProductShell } from '@/components/shell/product-shell';
import { ComingSoon } from '@/components/shell/coming-soon';
import { productById } from '@/lib/products';
import { getPoolSnapshot } from '@/lib/pool-data';
import { fmt, pct, timeAgo, minutesSince } from '@/lib/format';
import { ADDRESSES, LINKS, dashboardUrl } from '@/lib/radix/config';
import { toAtto } from '@/lib/hyperstake/math';

export const metadata: Metadata = { title: 'LSU Pool' };
export const dynamic = 'force-dynamic';

export default async function LsuPoolPage() {
  const snap = await getPoolSnapshot().catch(() => null);
  const s = snap?.state;
  const oracleMin = minutesSince(s?.lsuPoolLastTxAt);
  return (
    <ProductShell>
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <div>
          <div className="label">LSU Pool · liquid staking basket</div>
          <h1 className="display mt-1 text-2xl">The basket behind LSULP</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">Deposit an approved validator&apos;s stake units, receive LSULP — one token for a basket of {s ? s.lsuPoolValidatorCount : '…'} validators. LSULP is what HyperStake trades against XRD, and this pool&apos;s valuation is HyperStake&apos;s price feed.</p>
        </div>
        <ComingSoon product={productById('lsu-pool')} what="Minting and redeeming LSULP ship after Simple Pools; until then use CaviarNine's page or HyperStake to get LSULP." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <T k="Basket value" v={s ? `${fmt(s.lsuPoolValuationXrd, { dp: 0, compact: true })} XRD` : '—'} sub="cached validator valuations" />
          <T k="LSULP supply" v={s ? fmt(s.lsulpSupply, { dp: 0, compact: true }) : '—'} sub={s ? `1 LSULP = ${fmt(s.nav, { dp: 4 })} XRD` : undefined} />
          <T k="Validators" v={s ? `${s.lsuPoolHeldCount ?? '—'} held` : '—'} sub={s?.allowlistCount != null ? `${s.allowlistCount} approved · ${s.heldNotAllowlisted ?? 0} no longer approved` : undefined} tone={s?.heldNotAllowlisted ? 'warn' : undefined} />
          <T k="Price feed" v={s ? timeAgo(s.lsuPoolLastTxAt) : '—'} sub="last refresh · anyone can trigger one" tone={oracleMin === null ? undefined : oracleMin < 180 ? 'ok' : 'warn'} />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="card p-5 text-sm">
            <div className="label mb-3">How it works</div>
            <ul className="list-disc space-y-1 pl-5 text-muted">
              <li>Your validator LSUs go into the basket; you get LSULP worth the same XRD value at the pool&apos;s cached prices.</li>
              <li>Redeem LSULP for any validator&apos;s LSUs that the pool holds. Small fees: 0.05 % to LPs, 0.01 % protocol, 0.01 % reserve.</li>
              <li>Prices are cached and advance 5 validators per pool transaction — the &ldquo;price feed&rdquo; above. When it goes stale, HyperStake&apos;s NAV goes stale with it.</li>
              <li>Only validators on CaviarNine&apos;s approved list can be deposited; that list is owner-controlled and was last updated {s?.allowlistLastUpdatedAt ? new Date(s.allowlistLastUpdatedAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : '…'}.</li>
            </ul>
          </section>
          <section className="card p-5 text-sm">
            <div className="label mb-3">Planned here</div>
            <ul className="list-disc space-y-1 pl-5 text-muted">
              <li>Mint LSULP from your LSUs and redeem LSULP to a validator of your choice.</li>
              <li>Validator list with approved / not-approved status and each one&apos;s share of the basket.</li>
              <li>A &ldquo;refresh prices&rdquo; button (any wallet can sign it) and, if needed, an automated keeper — so HyperStake&apos;s price feed never goes stale again.</li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-3 text-xs">
              <a className="btn btn-ghost h-9" href={LINKS.c9LsuPool} target="_blank" rel="noreferrer">CaviarNine LSU Pool ↗</a>
              <a className="btn btn-ghost h-9" href={dashboardUrl(ADDRESSES.lsuPool)} target="_blank" rel="noreferrer">Component on ledger ↗</a>
            </div>
          </section>
        </div>
        {s && <div className="text-[11px] text-muted">Premium/discount of LSULP on HyperStake right now: <span className="num">{pct(toAtto(s.premiumToNav))}</span> vs NAV.</div>}
      </main>
    </ProductShell>
  );
}
function T({ k, v, sub, tone }: { k: string; v: string; sub?: string; tone?: 'ok' | 'warn' }) { return (<div className="card p-5"><div className="label">{k}</div><div className={`num mt-1 text-2xl ${tone === 'ok' ? 'text-ok' : tone === 'warn' ? 'text-warn' : ''}`}>{v}</div>{sub && <div className="mt-1 text-[11px] text-muted">{sub}</div>}</div>); }
