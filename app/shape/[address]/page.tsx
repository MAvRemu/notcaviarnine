import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductShell } from '@/components/shell/product-shell';
import { ShapePanel } from '@/components/shape/shape-panel';
import { cachedShapePools } from '@/lib/cached';
import { isLive } from '@/lib/products';
import { dashboardUrl } from '@/lib/radix/config';
import { fmtNum } from '@/lib/format';

export const metadata: Metadata = { title: 'Shape pool' };
export const revalidate = 120;

export default async function ShapePoolPage({ params }: { params: Promise<{ address: string }> }) {
  if (!isLive('shape')) notFound();
  const { address } = await params;
  const pools = await cachedShapePools().catch(() => []);
  const p = pools.find((x) => x.component === address || x.receiptResource === address);
  if (!p) notFound();
  return (
    <ProductShell>
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <Link href="/shape" className="label hover:text-ink">← All pools</Link>
            <h1 className="display mt-1 text-2xl">{p.symbolX} / {p.symbolY}</h1>
            <div className="num mt-1 text-xs text-muted">bins ≈ {(p.binSpan / 10).toFixed(1)}% · {p.tvlXrd !== null ? `${fmtNum(p.tvlXrd, { compact: true })} XRD TVL` : 'unpriced'} · created {p.createdAt.slice(0, 10)}</div>
          </div>
          <a className="text-xs text-muted hover:text-ink" href={dashboardUrl(p.component)} target="_blank" rel="noreferrer">on ledger ↗</a>
        </div>
        <ShapePanel component={p.component} symbolX={p.symbolX} symbolY={p.symbolY} iconX={p.iconX} iconY={p.iconY} xrdPerX={p.xrdPerX} xrdPerY={p.xrdPerY} />
      </main>
    </ProductShell>
  );
}
