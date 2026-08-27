import Link from 'next/link';
import type { PoolSnapshot } from '@/lib/pool-data';
import type { SimplePoolSummary } from '@/lib/simplepool/registry';
import type { ShapeSummary } from '@/lib/shape/registry';
import { PRODUCTS, type ProductId } from '@/lib/products';
import { fmt, pct } from '@/lib/format';

const nf0 = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const compact = (n: number) => (n >= 1e6 ? (n / 1e6).toFixed(2) + 'M' : n >= 1e4 ? (n / 1e3).toFixed(0) + 'K' : nf0.format(n));

/** One live number per product — the hero's proof that the contracts are alive. */
export function ConsoleStrip({ snap, pools, shape }: { snap: PoolSnapshot | null; pools: SimplePoolSummary[] | null; shape: ShapeSummary | null }) {
  const s = snap?.state;
  const live = pools?.filter((p) => p.hasLiquidity) ?? null;
  const poolsTvl = live?.reduce((a, p) => a + (p.tvlXrd ?? 0), 0) ?? null;
  const data: Record<ProductId, { v: string; sub: string; tone?: 'ok' | 'warn' }> = {
    hyperstake: { v: s ? `${fmt(s.tvlXrd, { dp: 0, compact: true })} XRD` : '—', sub: s ? `TVL · LSULP ${pct(s.premiumToNav)} vs NAV · ${snap?.stats?.aprLp ? pct(snap.stats.aprLp, 1, false) + ' fee APR' : ''}` : 'loading' },
    pools: { v: live ? `${live.length} pools` : '—', sub: poolsTvl ? `with liquidity · ≈ ${compact(poolsTvl)} XRD` : 'with liquidity' },
    shape: { v: shape ? `${nf0.format(shape.pools)} pools` : '—', sub: shape ? `${compact(shape.xrdInPools)} XRD on the XRD side` : '' },
    'lsu-pool': { v: s ? `${fmt(s.lsuPoolValuationXrd, { dp: 0, compact: true })} XRD` : '—', sub: s ? `staked across ${s.lsuPoolHeldCount} validators` : '' },
  };
  return (
    <section className="hairline border-y">
      <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-line px-6 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
        {PRODUCTS.map((p) => {
          const d = data[p.id];
          return (
            <Link key={p.id} href={p.href} className="group flex flex-col gap-1 py-7 pr-6 sm:[&:nth-child(2n)]:pl-6 lg:[&:not(:first-child)]:pl-6">
              <div className="flex items-center justify-between">
                <span className="label">{p.name}</span>
                <span className={`dot ${p.status === 'live' ? 'dot-ok' : 'dot-warn'}`} title={p.statusLabel} />
              </div>
              <div className="num text-2xl leading-none group-hover:text-accent">{d.v}</div>
              <div className="text-[11px] text-muted">{d.sub}</div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
