import type { Metadata } from 'next';
import { ProductShell } from '@/components/shell/product-shell';
import { ComingSoon } from '@/components/shell/coming-soon';
import { productById } from '@/lib/products';
import { getPoolSnapshot } from '@/lib/pool-data';
import { fmt, timeAgo, minutesSince } from '@/lib/format';
import { ADDRESSES, LINKS, dashboardUrl } from '@/lib/radix/config';

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
          <p className="mt-2 max-w-2xl text-sm text-muted">Deposit an approved validator&apos;s stake units, receive LSULP — one token for a basket of {s ? s.lsuPoolHeldCount : '…'} validators.</p>
        </div>
        <ComingSoon product={productById('lsu-pool')} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <T k="Basket value" v={s ? `${fmt(s.lsuPoolValuationXrd, { dp: 0, compact: true })} XRD` : '—'} sub="cached validator valuations" />
          <T k="LSULP supply" v={s ? fmt(s.lsulpSupply, { dp: 0, compact: true }) : '—'} sub={s ? `1 LSULP = ${fmt(s.nav, { dp: 4 })} XRD` : undefined} />
          <T k="Validators" v={s ? `${s.lsuPoolHeldCount ?? '—'} held` : '—'} sub={s?.allowlistCount != null ? `${s.allowlistCount} approved · ${s.heldNotAllowlisted ?? 0} no longer approved` : undefined} tone={s?.heldNotAllowlisted ? 'warn' : undefined} />
          <T k="Price feed" v={s ? timeAgo(s.lsuPoolLastTxAt) : '—'} sub="last refresh · anyone can trigger one" tone={oracleMin === null ? undefined : oracleMin < 180 ? 'ok' : 'warn'} />
        </div>
        <div className="flex flex-wrap gap-3 text-xs">
          <a className="btn btn-ghost h-9" href={LINKS.c9LsuPool} target="_blank" rel="noreferrer">Get LSULP on CaviarNine ↗</a>
          <a className="btn btn-ghost h-9" href={dashboardUrl(ADDRESSES.lsuPool)} target="_blank" rel="noreferrer">On ledger ↗</a>
        </div>
      </main>
    </ProductShell>
  );
}
function T({ k, v, sub, tone }: { k: string; v: string; sub?: string; tone?: 'ok' | 'warn' }) { return (<div className="card p-5"><div className="label">{k}</div><div className={`num mt-1 text-2xl ${tone === 'ok' ? 'text-ok' : tone === 'warn' ? 'text-warn' : ''}`}>{v}</div>{sub && <div className="mt-1 text-[11px] text-muted">{sub}</div>}</div>); }
