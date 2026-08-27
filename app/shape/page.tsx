import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ProductShell } from '@/components/shell/product-shell';
import { cachedShape } from '@/lib/cached';
import { PageHeader } from '@/components/ui';
import { ComingSoon } from '@/components/shell/coming-soon';
import { productById } from '@/lib/products';


export const metadata: Metadata = { title: 'Shape Liquidity' };
export const revalidate = 600;
const nf0 = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

export default function ShapePage() {
  return (
    <ProductShell>
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <PageHeader eyebrow="Shape Liquidity · concentrated positions" title="Concentrated liquidity positions" lede={<>Concentrated-liquidity pools. Your positions are NFTs in your wallet and earn fees per position.</>} />
        <ComingSoon product={productById('shape')} />
        <Suspense fallback={<div className="grid gap-4 sm:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="card p-5"><div className="skeleton h-3 w-24" /><div className="skeleton mt-3 h-7 w-32" /></div>)}</div>}>
          <ShapeStats />
        </Suspense>
      </main>
    </ProductShell>
  );
}
function T({ k, v, sub }: { k: string; v: string; sub?: string }) { return (<div className="card p-5"><div className="label">{k}</div><div className="num mt-1 text-2xl">{v}</div>{sub && <div className="mt-1 text-xs text-muted">{sub}</div>}</div>); }

async function ShapeStats() {
  const s = await cachedShape().catch(() => null);
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <T k="Pools created" v={s ? nf0.format(s.pools) : '—'} sub="via the CaviarNine factory" />
      <T k="Pools holding XRD" v={s ? nf0.format(s.poolsWithXrd) : '—'} />
      <T k="XRD in pools" v={s ? `${nf0.format(s.xrdInPools)} XRD` : '—'} sub="XRD side only" />
    </div>
  );
}
