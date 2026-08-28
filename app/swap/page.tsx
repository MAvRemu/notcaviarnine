import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductShell } from '@/components/shell/product-shell';
import { PageHeader } from '@/components/ui';
import { SwapWidget } from '@/components/swap/swap-widget';
import { isLive } from '@/lib/products';

export const metadata: Metadata = { title: 'Swap' };

export default function SwapPage() {
  if (!isLive('swap')) notFound();
  return (
    <ProductShell>
      <main className="mx-auto max-w-lg space-y-6 px-4 py-6 sm:px-6">
        <PageHeader eyebrow="Swap · any Radix token" title="Swap" lede={<>Any token, best price — routed across every Radix exchange in one transaction.</>} />
        <SwapWidget />
      </main>
    </ProductShell>
  );
}
