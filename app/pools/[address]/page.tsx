import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductShell } from '@/components/shell/product-shell';
import { cachedSimplePools } from '@/lib/cached';
import { ComingSoon } from '@/components/shell/coming-soon';
import { productById } from '@/lib/products';
import { SIMPLE_POOL_FEE_VAULTS } from '@/lib/simplepool/registry';
import { dashboardUrl } from '@/lib/radix/config';
import { fmtNum } from '@/lib/format';

export const metadata: Metadata = { title: 'Simple Pool' };
export const revalidate = 120;

export default async function PoolDetail({ params }: PageProps<'/pools/[address]'>) {
  const { address } = await params;
  const pools = await cachedSimplePools().catch(() => []);
  const p = pools.find((x) => x.swapComponent === address || x.poolComponent === address || x.lpResource === address);
  if (!p) notFound();
  const spot = p.reserveX > 0 && p.reserveY > 0 ? (p.reserveY / p.weightY) / (p.reserveX / p.weightX) : null;
  return (
    <ProductShell>
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <Link href="/pools" className="label hover:text-ink">← All pools</Link>
            <h1 className="display mt-1 text-2xl">{p.symbolX} / {p.symbolY}</h1>
            <div className="num mt-1 text-xs text-muted">{Math.round(p.weightX * 100)} / {Math.round(p.weightY * 100)} · fee {(p.fee * 100).toFixed(2)}% · created {p.createdAt.slice(0, 10)}</div>
          </div>
          {p.divergence !== null && Math.abs(p.divergence) > 0.05 && (
            <div className="pill border-warn/40 text-warn"><span className="dot dot-warn" />pool price {(p.divergence * 100).toFixed(0)}% from market</div>
          )}
        </div>
        <ComingSoon product={productById('pools')} />
        <div className="grid grid-cols-1 gap-6 lg:max-w-2xl">
          <section className="card p-5">
            <div className="label mb-3">Pool facts</div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <F k="Price" v={spot !== null ? `1 ${p.symbolX} = ${fmtNum(spot)} ${p.symbolY}` : '—'} sub={spot ? `1 ${p.symbolY} = ${fmtNum(1 / spot)} ${p.symbolX}` : undefined} />
              <F k="TVL" v={p.tvlXrd !== null ? `${fmtNum(p.tvlXrd)} XRD` : '—'} sub={p.priceSource === 'astrolescent' ? 'priced by Astrolescent' : p.priceSource === 'xrd-leg' ? 'priced via XRD pool' : 'no price available'} />
              <F k={`${p.symbolX} reserve`} v={fmtNum(p.reserveX)} />
              <F k={`${p.symbolY} reserve`} v={fmtNum(p.reserveY)} />
              <F k="Fee split" v={`${(p.fee * 100).toFixed(2)}%`} sub="80% to LPs · 10% protocol · 10% treasury" />
              <F k="Access" v="Open to everyone" sub="removing liquidity is always public" />
            </dl>
            <div className="mt-4 space-y-1 border-t border-line pt-3 text-xs">
              <A label="Swap component" a={p.swapComponent} /><A label="Native pool" a={p.poolComponent} /><A label="LP token" a={p.lpResource} /><A label="Fee vaults" a={SIMPLE_POOL_FEE_VAULTS} />
            </div>
          </section>
        </div>
      </main>
    </ProductShell>
  );
}
function F({ k, v, sub }: { k: string; v: string; sub?: string }) { return (<div><dt className="text-xs uppercase tracking-wider text-muted">{k}</dt><dd className="num">{v}</dd>{sub && <dd className="text-xs text-muted">{sub}</dd>}</div>); }
function A({ label, a }: { label: string; a: string }) { return (<div className="flex justify-between gap-3"><span className="text-muted">{label}</span><a className="num truncate hover:text-accent-text" href={dashboardUrl(a)} target="_blank" rel="noreferrer">{a.slice(0, 18)}…{a.slice(-6)} ↗</a></div>); }
