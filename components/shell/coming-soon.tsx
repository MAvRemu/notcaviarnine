import type { Product } from '@/lib/products';

/** Banner shown at the top of read-only / coming-soon product pages. */
export function ComingSoon({ product, what }: { product: Product; what: string }) {
  return (
    <div className="card flex items-start gap-3 border-warn/30 px-5 py-4">
      <span className="dot dot-warn mt-1.5 shrink-0" />
      <div>
        <div className="font-semibold">{product.statusLabel}</div>
        <p className="text-sm text-muted">{what} Everything shown is read live from the ledger. Your funds are in the contracts, not on any website — you can always exit through your wallet or another interface.</p>
      </div>
    </div>
  );
}
