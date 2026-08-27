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
  try {
    const [snap, pools, shape, rate] = await Promise.all([cachedPoolSnapshot(), cachedSimplePools(), cachedShape(), xrdUsd()]);
    const hyper = Number(snap.state.tvlXrd);
    const simple = pools.filter((x) => x.hasLiquidity).reduce((a, x) => a + (x.tvlXrd ?? 0), 0);
    const lsu = Number(snap.state.lsuPoolValuationXrd);
    const total = hyper + simple + shape.tvlXrd + lsu;
    return (
      <div className="mx-auto flex max-w-6xl flex-wrap items-baseline justify-between gap-2 px-6 pb-4 text-xs text-muted">
        <span>
          Across the four products: <span className="num text-ink">{fmtNum(total, { compact: true })} XRD</span>
          {rate && <> <span className="num text-ink">{usd(total, rate)}</span></>}
        </span>
        {rate && <span className="num">1 XRD = ${rate.toFixed(4)} · prices by Astrolescent</span>}
      </div>
    );
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
      const s = snap.state;
      v = `${fmt(s.tvlXrd, { dp: 0, compact: true })} XRD`;
      sub = `${usd(Number(s.tvlXrd), rate)} TVL · LSULP ${pct(s.premiumToNav)} vs NAV${snap.stats?.aprLp ? ` · ${pct(snap.stats.aprLp, 1, false)} APR` : ''}`;
    } else if (product.id === 'lsu-pool') {
      const s = (await cachedPoolSnapshot()).state;
      v = `${fmt(s.lsuPoolValuationXrd, { dp: 0, compact: true })} XRD`;
      sub = `${usd(Number(s.lsuPoolValuationXrd), rate)} staked · ${s.lsuPoolHeldCount} validators`;
    } else if (product.id === 'pools') {
      const live = (await cachedSimplePools()).filter((x) => x.hasLiquidity);
      const tvl = live.reduce((a, x) => a + (x.tvlXrd ?? 0), 0);
      v = `${live.length} pools`;
      sub = `${fmtNum(tvl, { compact: true })} XRD ${usd(tvl, rate)} TVL`;
    } else if (product.id === 'shape') {
      const s = await cachedShape();
      v = `${s.poolsWithLiquidity} pools`;
      sub = `${fmtNum(s.tvlXrd, { compact: true })} XRD ${usd(s.tvlXrd, rate)} TVL`;
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
