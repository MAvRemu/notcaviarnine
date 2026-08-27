import type { Product } from '@/lib/products';

/** One-line status for products that are not live yet. */
export function ComingSoon({ product }: { product: Product }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted">
      <span className="pill border-warn/40 text-warn"><span className="dot dot-warn" />{product.statusLabel}</span>
      <span>Figures are read live from the ledger.</span>
    </div>
  );
}
