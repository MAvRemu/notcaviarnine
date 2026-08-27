import Link from 'next/link';
import type { Product } from '@/lib/products';
import { LINKS } from '@/lib/radix/config';

/** Banner shown at the top of read-only / coming-soon product pages. */
export function ComingSoon({ product, what }: { product: Product; what: string }) {
  return (
    <div className="card flex flex-wrap items-center justify-between gap-3 border-warn/30 px-5 py-4">
      <div className="flex items-start gap-3">
        <span className="dot dot-warn mt-1.5 shrink-0" />
        <div>
          <div className="font-semibold">{product.statusLabel}</div>
          <p className="text-sm text-muted">{what} Everything shown is read live from the ledger. Your funds are in the contracts, not on any website — you can always exit through your wallet or another interface.</p>
        </div>
      </div>
      <a className="btn btn-ghost h-9 text-xs" href={`${LINKS.frontendRepo}/blob/main/${product.spec}`} target="_blank" rel="noreferrer">Read the spec ↗</a>
      <span className="sr-only"><Link href="/#status">status</Link></span>
    </div>
  );
}
