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
    </section>
  );
}

const usd = (xrd: number, rate: number | null) => (rate ? `≈ $${fmtNum(xrd * rate, { compact: true })}` : '');

async function xrdUsd(): Promise<number | null> {
  try {
    return (await getPricesRecord())[RESOURCES.XRD]?.priceUsd ?? null;
  } catch {
    return null;
  }
}

async function CardValue({ product }: { product: Product }) {
  let v = '—', sub = '';
  try {
    const rate = await xrdUsd();
    if (product.id === 'hyperstake') {
      const snap = await cachedPoolSnapshot();
      v = snap.stats?.aprLp ? `${pct(snap.stats.aprLp, 1, false)} APR` : `${fmt(snap.state.tvlXrd, { dp: 0, compact: true })} XRD`;
      sub = `${usd(Number(snap.state.tvlXrd), rate)} in the pool`;
    } else if (product.id === 'lsu-pool') {
      const s = (await cachedPoolSnapshot()).state;
      v = `${fmt(s.lsuPoolValuationXrd, { dp: 0, compact: true })} XRD`;
      sub = `${usd(Number(s.lsuPoolValuationXrd), rate)} staked`;
    } else if (product.id === 'pools') {
      const live = (await cachedSimplePools()).filter((x) => x.hasLiquidity);
      const tvl = live.reduce((a, x) => a + (x.tvlXrd ?? 0), 0);
      v = `${live.length} pools`;
      sub = `${usd(tvl, rate)} in liquidity`;
    } else if (product.id === 'shape') {
      const s = await cachedShape();
      v = `${s.poolsWithLiquidity} pools`;
      sub = `${usd(s.tvlXrd, rate)} in liquidity`;
    }
  } catch {
    /* leave dashes */
  }
  return (
    <>
      <div className="num text-2xl leading-none group-hover:text-accent-text">{v}</div>
      <div className="text-xs text-muted">{sub}</div>
    </>
  );
}

/** Total value held in the four products, in dollars — shown big in the hero. */
export function HeroTotal() {
  return (
    <Suspense fallback={<div className="space-y-2"><div className="skeleton h-3 w-40" /><div className="skeleton h-12 w-48" /><div className="skeleton h-3 w-32" /></div>}>
      <HeroTotalValue />
    </Suspense>
  );
}

async function HeroTotalValue() {
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
    <div>
      <div className="label">In CaviarNine&apos;s contracts right now</div>
      <div className="num mt-2 text-5xl leading-none md:text-6xl">{rate ? `$${fmtNum(total * rate, { compact: true })}` : `${fmtNum(total, { compact: true })} XRD`}</div>
      <div className="mt-2 text-xs text-muted">{rate ? `${fmtNum(total, { compact: true })} XRD · ` : ''}live on the ledger · four products</div>
    </div>
  );
}
