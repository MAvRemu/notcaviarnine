import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ProductShell } from '@/components/shell/product-shell';
import { ComingSoon } from '@/components/shell/coming-soon';
import { productById } from '@/lib/products';
import { getShapeSummary, SHAPE_FACTORY } from '@/lib/shape/registry';
import { dashboardUrl } from '@/lib/radix/config';

export const metadata: Metadata = { title: 'Shape Liquidity' };
export const revalidate = 600;
const nf0 = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

export default function ShapePage() {
  return (
    <ProductShell>
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <div>
          <div className="label">Shape Liquidity · concentrated positions</div>
          <h1 className="display mt-1 text-2xl">Concentrated liquidity positions</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">CaviarNine&apos;s concentrated-liquidity pools. Positions are NFTs tied to a price shape; fees accrue per position. First up: see your positions, claim fees and remove liquidity.</p>
        </div>
        <ComingSoon product={productById('shape')} what="Research is in progress; nothing to do here yet." />
        <Suspense fallback={<div className="grid gap-4 sm:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="card p-5"><div className="skeleton h-3 w-24" /><div className="skeleton mt-3 h-7 w-32" /></div>)}</div>}>
          <ShapeStats />
        </Suspense>
        <div className="card p-5 text-sm text-muted">
          <div className="label mb-2">What we know so far</div>
          <ul className="list-disc space-y-1 pl-5">
            <li>Pools are created by a factory (<a className="underline hover:text-ink" href={dashboardUrl(SHAPE_FACTORY)} target="_blank" rel="noreferrer">on ledger ↗</a>) and each pool issues its own position NFT resource.</li>
            <li>Like every other CaviarNine contract, the code stays on ledger and positions stay in your wallet — the website going away does not lock anything.</li>
            <li>Order of work: see positions → claim fees → remove liquidity → add liquidity with preset shapes. Pool creation is not planned.</li>
          </ul>
        </div>
      </main>
    </ProductShell>
  );
}
function T({ k, v, sub }: { k: string; v: string; sub?: string }) { return (<div className="card p-5"><div className="label">{k}</div><div className="num mt-1 text-2xl">{v}</div>{sub && <div className="mt-1 text-[11px] text-muted">{sub}</div>}</div>); }

async function ShapeStats() {
  const s = await getShapeSummary().catch(() => null);
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <T k="Pools created" v={s ? nf0.format(s.pools) : '—'} sub="via the CaviarNine factory" />
      <T k="Pools holding XRD" v={s ? nf0.format(s.poolsWithXrd) : '—'} />
      <T k="XRD in pools" v={s ? `${nf0.format(s.xrdInPools)} XRD` : '—'} sub="XRD side only · full valuation coming" />
    </div>
  );
}
