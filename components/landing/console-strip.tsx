import Link from 'next/link';
import { Suspense } from 'react';
import { PRODUCTS, type Product } from '@/lib/products';
import { cachedPoolSnapshot, cachedShape, cachedSimplePools } from '@/lib/cached';
import { fmt, fmtNum, pct } from '@/lib/format';

/** One live number per product. Each card streams on its own so a slow source never blocks the others. */
export function ConsoleStrip() {
  return (
    <section className="hairline border-y">
      <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-line px-6 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
        {PRODUCTS.map((p) => (
          <Link key={p.id} href={p.href} className="group flex flex-col gap-1 py-7 pr-6 sm:[&:nth-child(2n)]:pl-6 lg:[&:not(:first-child)]:pl-6">
            <div className="flex items-center justify-between">
              <span className="label">{p.name}</span>
              <span className={`dot ${p.status === 'live' ? 'dot-ok' : 'dot-warn'}`} title={p.statusLabel} />
            </div>
            <Suspense fallback={<><div className="skeleton h-7 w-32" /><div className="skeleton mt-1 h-3 w-40" /></>}>
              <CardValue product={p} />
            </Suspense>
          </Link>
        ))}
      </div>
    </section>
  );
}

async function CardValue({ product }: { product: Product }) {
  let v = '—', sub = '';
  try {
    if (product.id === 'hyperstake') {
      const snap = await cachedPoolSnapshot();
      const s = snap.state;
      v = `${fmt(s.tvlXrd, { dp: 0, compact: true })} XRD`;
      sub = `TVL · LSULP ${pct(s.premiumToNav)} vs NAV${snap.stats?.aprLp ? ` · ${pct(snap.stats.aprLp, 1, false)} fee APR` : ''}`;
    } else if (product.id === 'lsu-pool') {
      const s = (await cachedPoolSnapshot()).state;
      v = `${fmt(s.lsuPoolValuationXrd, { dp: 0, compact: true })} XRD`;
      sub = `staked across ${s.lsuPoolHeldCount} validators`;
    } else if (product.id === 'pools') {
      const live = (await cachedSimplePools()).filter((x) => x.hasLiquidity);
      const tvl = live.reduce((a, x) => a + (x.tvlXrd ?? 0), 0);
      v = `${live.length} pools`;
      sub = `with liquidity · ≈ ${fmtNum(tvl, { compact: true })} XRD`;
    } else if (product.id === 'shape') {
      const s = await cachedShape();
      v = `${s.pools} pools`;
      sub = `${fmtNum(s.xrdInPools, { compact: true })} XRD on the XRD side`;
    }
  } catch {
    /* leave dashes */
  }
  return (
    <>
      <div className="num text-2xl leading-none group-hover:text-accent-text">{v}</div>
      <div className="text-xs text-muted">{sub}</div>
    </>
  );
}
