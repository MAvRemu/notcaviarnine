'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PRODUCTS } from '@/lib/products';

export function ProductSwitcher() {
  const path = usePathname();
  return (
    <nav className="-mx-1 flex gap-1 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Products">
      {PRODUCTS.map((p) => {
        const active = path === p.href || path.startsWith(p.href + '/');
        return (
          <Link key={p.id} href={p.href} className="tab flex shrink-0 items-center gap-1.5 !py-1.5 !text-[13px]" data-active={active} title={p.subtitle}>
            {p.name}
            {p.status !== 'live' && <span className={`dot !h-1.5 !w-1.5 ${p.status === 'soon' ? 'dot-muted' : 'dot-warn'}`} aria-label={p.statusLabel} />}
          </Link>
        );
      })}
    </nav>
  );
}
