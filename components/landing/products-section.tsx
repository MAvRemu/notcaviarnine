import Link from 'next/link';
import { PRODUCTS } from '@/lib/products';

export function ProductsSection() {
  return (
    <section id="products" className="mx-auto max-w-6xl px-6 py-20">
      <div className="label mb-3">What you can do here</div>
      <h2 className="display text-4xl md:text-5xl">Four CaviarNine products, one console</h2>
      <p className="mt-4 max-w-2xl text-ink-soft">Same contracts, same liquidity, same fee rules — read live from the ledger. HyperStake is fully working today; the other three are opening up one by one.</p>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {PRODUCTS.map((p) => (
          <div key={p.id} className="card flex flex-col p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="label">{p.subtitle}</div>
                <h3 className="mt-1 text-2xl font-semibold">{p.name}</h3>
              </div>
              <span className={`pill ${p.status === 'live' ? 'border-ok/40 text-ok' : p.status === 'read-only' ? 'border-warn/40 text-warn' : 'text-muted'}`}>
                <span className={`dot ${p.status === 'live' ? 'dot-ok' : p.status === 'read-only' ? 'dot-warn' : 'dot-muted'}`} />{p.statusLabel}
              </span>
            </div>
            <p className="mt-3 flex-1 text-sm text-ink-soft">{p.blurb}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href={p.href} className={`btn h-10 ${p.status === 'live' ? '' : 'btn-ghost'}`}>{p.status === 'live' ? `Open ${p.name}` : p.status === 'read-only' ? 'Browse (read-only)' : 'Preview'}</Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
