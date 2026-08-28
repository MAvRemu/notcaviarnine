import { RESOURCES } from '@/lib/radix/config';
import { field, getEntityDetails, streamTransactions } from '@/lib/radix/gateway';
import { getPrices, type TokenPrice } from '@/lib/prices/astrolescent';
import { unstable_cache } from 'next/cache';

/** WeightedPool package — every Simple Pool is created by its `new` function, which emits NewPoolEvent. */
export const SIMPLE_POOL_PACKAGE = 'package_rdx1pkhxu8zy5t7h3rww6jsftca22e2jdgqpc28rje7lnmkjxxf50zagr7';
export const SIMPLE_POOL_FEE_VAULTS = 'component_rdx1crmhkatyjrw0070nsusdm4adwr5s3eaysmevxlvaxx6fspxkwdhlua';

export type SimplePool = {
  swapComponent: string;
  poolComponent: string;
  lpResource: string;
  resourceX: string;
  resourceY: string;
  weightX: number;
  weightY: number;
  fee: number; // 0.0005 = 0.05 %
  createdAt: string;
  createdTx: string;
};

export type SimplePoolSummary = SimplePool & {
  reserveX: number;
  reserveY: number;
  symbolX: string;
  symbolY: string;
  iconX?: string;
  iconY?: string;
  /** TVL in XRD when both sides can be priced (Astrolescent, else XRD-leg), otherwise null */
  tvlXrd: number | null;
  tvlUsd: number | null;
  priceSource: 'astrolescent' | 'xrd-leg' | null;
  /** pool spot vs market price divergence (fraction), when computable */
  divergence: number | null;
  hasLiquidity: boolean;
  /** 7d swap volume in XRD (merged in by the pools page; null = not computed) */
  volume7dXrd?: number | null;
  /** annualized fee APR from 7d volume (volume × fee / TVL × 365/7) */
  feeApr7d?: number | null;
  /** volume page cap hit — the figures are lower bounds */
  volumeCapped?: boolean;
};

const REG_TTL = 30 * 60_000;
let regMemo: { at: number; p: Promise<SimplePool[]> } | null = null;

/** All pools ever created (≈230; 3 Gateway pages). Cached 30 min. */
export function getSimplePoolRegistry(): Promise<SimplePool[]> {
  if (regMemo && Date.now() - regMemo.at < REG_TTL) return regMemo.p;
  const p = (async () => {
    const pools: SimplePool[] = [];
    let cursor: string | undefined;
    for (let i = 0; i < 20; i++) {
      const res = await streamTransactions({ emitters: [SIMPLE_POOL_PACKAGE], limit: 100, cursor, receiptEvents: true });
      for (const t of res.items) {
        for (const e of t.receipt?.events ?? []) {
          if (e.name !== 'NewPoolEvent') continue;
          const g = (k: string) => field(e.data.fields, k)!;
          pools.push({
            swapComponent: g('swap_component'),
            poolComponent: g('pool_component'),
            lpResource: g('lp_resource'),
            resourceX: g('resource_x'),
            resourceY: g('resource_y'),
            weightX: Number(g('weight_x')),
            weightY: Number(g('weight_y')),
            fee: Number(g('fee')),
            createdAt: t.round_timestamp,
            createdTx: t.intent_hash,
          });
        }
      }
      if (!res.next_cursor) break;
      cursor = res.next_cursor;
    }
    return pools;
  })();
  regMemo = { at: Date.now(), p };
  p.catch(() => (regMemo = null));
  return p;
}

/** Symbol/icon for a set of tokens; persistent cache (tag `tokens`), 24 h. Keyed by the sorted address list. */
const getTokenMeta = unstable_cache(
  async (addresses: string[]): Promise<Record<string, { symbol: string; icon?: string }>> => {
    const out: Record<string, { symbol: string; icon?: string }> = {};
    for (let i = 0; i < addresses.length; i += 20) {
      const d = await getEntityDetails(addresses.slice(i, i + 20), { explicitMetadata: ['symbol', 'name', 'icon_url'] });
      for (const it of d.items) {
        const m = Object.fromEntries((it.metadata?.items ?? []).map((x) => [x.key, x.value.typed.value]));
        out[it.address] = { symbol: m.symbol ?? m.name ?? it.address.slice(-6), icon: m.icon_url };
      }
    }
    return out;
  },
  ['token-meta'],
  { revalidate: 86_400, tags: ['tokens'] },
);

const SUM_TTL = 5 * 60_000;
let sumMemo: { at: number; p: Promise<SimplePoolSummary[]> } | null = null;

/** Registry + live reserves + prices → summaries. Cached 5 min. */
export function getSimplePoolSummaries(): Promise<SimplePoolSummary[]> {
  if (sumMemo && Date.now() - sumMemo.at < SUM_TTL) return sumMemo.p;
  const p = (async () => {
    const [pools, prices] = await Promise.all([getSimplePoolRegistry(), getPrices().catch(() => new Map<string, TokenPrice>())]);
    // reserves, batched 20 per call
    const reserves = new Map<string, Record<string, number>>();
    const addrs = pools.map((x) => x.poolComponent);
    for (let i = 0; i < addrs.length; i += 20) {
      const d = await getEntityDetails(addrs.slice(i, i + 20), { explicitMetadata: [] });
      for (const it of d.items) {
        reserves.set(it.address, Object.fromEntries((it.fungible_resources?.items ?? []).map((f) => [f.resource_address, Number(f.amount ?? '0')])));
      }
    }
    // token symbols for tokens Astrolescent doesn't know — metadata never changes in practice, cached 24 h
    const unknown = [...new Set(pools.flatMap((x) => [x.resourceX, x.resourceY]).filter((a) => !prices.has(a)))].sort();
    const meta = new Map(Object.entries(await getTokenMeta(unknown)));
    const sym = (a: string) => prices.get(a)?.symbol ?? meta.get(a)?.symbol ?? a.slice(-6);
    const icon = (a: string) => prices.get(a)?.iconUrl ?? meta.get(a)?.icon;
    const xrdUsd = prices.get(RESOURCES.XRD)?.priceUsd ?? null;

    // XRD-leg fallback prices: deepest XRD pool per token
    const legPrice = new Map<string, { px: number; depth: number }>();
    for (const x of pools) {
      const r = reserves.get(x.poolComponent) ?? {};
      const xrdSide = x.resourceX === RESOURCES.XRD ? 'x' : x.resourceY === RESOURCES.XRD ? 'y' : null;
      if (!xrdSide) continue;
      const [tok, wTok, wXrd] = xrdSide === 'x' ? [x.resourceY, x.weightY, x.weightX] : [x.resourceX, x.weightX, x.weightY];
      const rXrd = r[RESOURCES.XRD] ?? 0, rTok = r[tok] ?? 0;
      if (rXrd < 10_000 || rTok <= 0) continue;
      const px = (rXrd / wXrd) / (rTok / wTok);
      const cur = legPrice.get(tok);
      if (!cur || rXrd > cur.depth) legPrice.set(tok, { px, depth: rXrd });
    }

    return pools.map((x) => {
      const r = reserves.get(x.poolComponent) ?? {};
      const reserveX = r[x.resourceX] ?? 0, reserveY = r[x.resourceY] ?? 0;
      const hasLiquidity = reserveX > 0 || reserveY > 0;
      const pxA = prices.get(x.resourceX)?.priceXrd, pyA = prices.get(x.resourceY)?.priceXrd;
      let tvlXrd: number | null = null, priceSource: SimplePoolSummary['priceSource'] = null, divergence: number | null = null;
      if (pxA !== undefined && pyA !== undefined) {
        tvlXrd = reserveX * pxA + reserveY * pyA; priceSource = 'astrolescent';
        if (reserveX > 0 && reserveY > 0) {
          const spot = (reserveY / x.weightY) / (reserveX / x.weightX); // y per x
          const market = pxA / pyA;
          divergence = spot / market - 1;
        }
      } else {
        const px = x.resourceX === RESOURCES.XRD ? 1 : legPrice.get(x.resourceX)?.px;
        const py = x.resourceY === RESOURCES.XRD ? 1 : legPrice.get(x.resourceY)?.px;
        if (px !== undefined && py !== undefined) { tvlXrd = reserveX * px + reserveY * py; priceSource = 'xrd-leg'; }
      }
      return {
        ...x, reserveX, reserveY, symbolX: sym(x.resourceX), symbolY: sym(x.resourceY), iconX: icon(x.resourceX), iconY: icon(x.resourceY),
        tvlXrd, tvlUsd: tvlXrd !== null && xrdUsd ? tvlXrd * xrdUsd : null, priceSource, divergence, hasLiquidity,
      };
    });
  })();
  sumMemo = { at: Date.now(), p };
  p.catch(() => (sumMemo = null));
  return p;
}
