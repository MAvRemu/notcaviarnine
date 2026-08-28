import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ProductShell } from '@/components/shell/product-shell';
import { cachedSimplePools } from '@/lib/cached';
import { PageHeader } from '@/components/ui';
import { ComingSoon } from '@/components/shell/coming-soon';
import { PoolTable } from '@/components/pools/pool-table';
import { YourPools } from '@/components/pools/your-pools';
import { isLive, productById } from '@/lib/products';
import { getPrices } from '@/lib/prices/astrolescent';
import { RESOURCES } from '@/lib/radix/config';
import { fmtNum } from '@/lib/format';

export const metadata: Metadata = { title: 'Simple Pools' };
export const revalidate = 300;

export default function PoolsPage() {
  const product = productById('pools');
  return (
    <ProductShell>
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <PageHeader eyebrow="Simple Pools · two-token pools" title="Two-token pools" lede={<>Weighted pools anyone can create. Provide both sides, earn the swap fee.</>} />
        {!isLive('pools') && <ComingSoon product={product} />}
        <Suspense fallback={<div className="space-y-3"><div className="skeleton h-10" />{[...Array(8)].map((_, i) => <div key={i} className="skeleton h-12" />)}</div>}>
          <Pools />
        </Suspense>
      </main>
    </ProductShell>
  );
}

async function Pools() {
  const [pools, prices] = await Promise.all([cachedSimplePools().catch(() => []), getPrices().catch(() => null)]);
  const xrdUsd = prices?.get(RESOURCES.XRD)?.priceUsd ?? null;
  const live = pools.filter((p) => p.hasLiquidity);
  const tvl = live.reduce((a, p) => a + (p.tvlXrd ?? 0), 0);
  return (
    <>
      <div className="text-sm text-muted"><span className="num text-ink">{pools.length}</span> pools · <span className="num text-ink">{live.length}</span> with liquidity{tvl > 0 && <> · total value ≈ <span className="num text-ink">{fmtNum(tvl, { compact: true })} XRD</span></>}</div>
      {isLive('pools') && <YourPools pools={pools} />}
      <PoolTable pools={pools} xrdUsd={xrdUsd} />
    </>
  );
}
