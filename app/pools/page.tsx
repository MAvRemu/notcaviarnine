import type { Metadata } from 'next';
import { ProductShell } from '@/components/shell/product-shell';
import { ComingSoon } from '@/components/shell/coming-soon';
import { PoolTable } from '@/components/pools/pool-table';
import { productById } from '@/lib/products';
import { getSimplePoolSummaries } from '@/lib/simplepool/registry';
import { getPrices } from '@/lib/prices/astrolescent';
import { RESOURCES } from '@/lib/radix/config';

export const metadata: Metadata = { title: 'Simple Pools' };
export const revalidate = 300;

export default async function PoolsPage() {
  const product = productById('pools');
  const [pools, prices] = await Promise.all([getSimplePoolSummaries().catch(() => []), getPrices().catch(() => null)]);
  const xrdUsd = prices?.get(RESOURCES.XRD)?.priceUsd ?? null;
  const live = pools.filter((p) => p.hasLiquidity);
  const tvl = live.reduce((a, p) => a + (p.tvlXrd ?? 0), 0);
  return (
    <ProductShell>
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <div>
          <div className="label">Simple Pools · {pools.length} pools · {live.length} with liquidity</div>
          <h1 className="display mt-1 text-2xl">Two-token pools</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">Weighted pools anyone can create. Provide both sides at the pool ratio and earn the swap fee. {tvl > 0 && <>Total value ≈ <span className="num text-ink">{new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(tvl)} XRD</span>.</>}</p>
        </div>
        <ComingSoon product={product} what="Browsing works today; adding and removing liquidity ships next." />
        <PoolTable pools={pools} xrdUsd={xrdUsd} />
      </main>
    </ProductShell>
  );
}
