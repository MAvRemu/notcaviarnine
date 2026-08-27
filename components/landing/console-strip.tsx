import Link from 'next/link';
import { Suspense } from 'react';
import { PRODUCTS, type Product } from '@/lib/products';
import { cachedPoolSnapshot, cachedShape, cachedSimplePools } from '@/lib/cached';
import { getPricesRecord } from '@/lib/prices/astrolescent';
import { RESOURCES } from '@/lib/radix/config';
import { fmt, fmtNum, pct } from '@/lib/format';

/** One live number per product. Each card streams on its own so a slow source never blocks the others. */
export function ConsoleStrip() {
  return (
    <section className="hairline border-y">
      <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-line px-6 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
        {PRODUCTS.map((p) => (
          <Link key={p.id} href={p.href} className="group flex flex-col gap-1 py-7 pr-6 sm:[&:nth-child(2n)]:pl-6 lg:[&:not(:first-child)]:pl-6">
            <div className="flex items-center justify-between">
              <span className="label">{p.name}</span>
              <span className={`dot ${p.status === 'live' ? 'dot-ok' : 'dot-warn'}`} title={p.statusLabel} />
            </div>
            <Suspense fallback={<><div className="skeleton h-7 w-32" /><div className="skeleton mt-1 h-3 w-40" /></>}>
              <CardValue product={p} />
            </Suspense>
          </Link>
        ))}
      </div>
      <Suspense fallback={<div className="mx-auto max-w-6xl px-6 pb-4"><div className="skeleton h-3 w-72" /></div>}>
        <TotalLine />
      </Suspense>
    </section>
  );
}

const usd = (xrd: number, rate: number | null) => (rate ? `≈ $${fmtNum(xrd * rate, { compact: true })}` : '');

async function xrdUsd(): Promise<number | null> {
  try { return (await getPricesRecord())[RESOURCES.XRD]?.priceUsd ?? null; } catch { return null; }
}

/** Sum of the four products, in dollars — the number people actually read. */
async function TotalLine() {
  let total: number | null = null, rate: number | null = null;
  try {
    const [snap, pools, shape, r] = await Promise.all([cachedPoolSnapshot(), cachedSimplePools(), cachedShape(), xrdUsd()]);
    const simple = pools.filter((x) => x.hasLiquidity).reduce((a, x) => a + (x.tvlXrd ?? 0), 0);
    total = Number(snap.state.tvlXrd) + simple + shape.tvlXrd + Number(snap.state.lsuPoolValuationXrd);
    rate = r;
  } catch {
    total = null;
  }
  if (total === null) return null;
  return (
    <div className="mx-auto flex max-w-6xl flex-wrap items-baseline justify-between gap-2 px-6 pb-4 text-xs text-muted">
      <span>
        Across the four products: <span className="num text-ink">{fmtNum(total, { compact: true })} XRD</span>
        {rate && <> <span className="num text-ink">{usd(total, rate)}</span></>}
      </span>
      {rate && <span className="num">1 XRD = ${rate.toFixed(4)} · prices by Astrolescent</span>}
    </div>
  );
}
