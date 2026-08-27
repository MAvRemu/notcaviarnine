import { RESOURCES } from '@/lib/radix/config';
import { field, getEntityDetails, streamTransactions } from '@/lib/radix/gateway';
import { getPrices, type TokenPrice } from '@/lib/prices/astrolescent';

/** QuantaSwap ("Shape Liquidity") factory — emits NewPoolEvent per pool. Research pending: docs/SHAPE_LIQUIDITY.md */
export const SHAPE_FACTORY = 'component_rdx1cqv7hjfuy785cw0s6v4wt7n09e0ufnyz42vnm52hlmu4ue9nngtvsq';

export type ShapePool = { component: string; receiptResource: string; tokenX: string; tokenY: string; binSpan: number; createdAt: string };
export type ShapeSummary = { pools: number; poolsWithLiquidity: number; poolsWithXrd: number; xrdInPools: number; /** priced TVL in XRD across pools where both tokens have a price (dust/absurd pools excluded) */ tvlXrd: number; fetchedAt: string };

const TTL = 30 * 60_000;
let memo: { at: number; p: Promise<ShapeSummary> } | null = null;

export function getShapeSummary(): Promise<ShapeSummary> {
  if (memo && Date.now() - memo.at < TTL) return memo.p;
  const p = (async () => {
    const byComponent = new Map<string, ShapePool>();
    let cursor: string | undefined;
    for (let i = 0; i < 20; i++) {
      const res = await streamTransactions({ emitters: [SHAPE_FACTORY], limit: 100, cursor, receiptEvents: true });
      for (const t of res.items) for (const e of t.receipt?.events ?? []) {
        // NewPoolEvent is emitted by both the factory and the new pool; keep one per component.
        if (e.name !== 'NewPoolEvent' || e.emitter.entity?.entity_address !== SHAPE_FACTORY) continue;
        const g = (k: string) => field(e.data.fields, k)!;
        const component = g('component_address');
        if (!byComponent.has(component)) byComponent.set(component, { component, receiptResource: g('liquidity_receipt_address'), tokenX: g('token_x_address'), tokenY: g('token_y_address'), binSpan: Number(g('bin_span')), createdAt: t.round_timestamp });
      }
      if (!res.next_cursor) break;
      cursor = res.next_cursor;
    }
    const pools = [...byComponent.values()];
    const prices = await getPrices().catch(() => new Map<string, TokenPrice>());
    let xrd = 0, withXrd = 0, withLiq = 0, tvl = 0;
    const addrs = pools.map((x) => x.component);
    for (let i = 0; i < addrs.length; i += 20) {
      const d = await getEntityDetails(addrs.slice(i, i + 20), { explicitMetadata: [] });
      for (const it of d.items) {
        const items = it.fungible_resources?.items ?? [];
        const x = Number(items.find((f) => f.resource_address === RESOURCES.XRD)?.amount ?? '0');
        if (x > 0) { withXrd++; xrd += x; }
        if (items.some((f) => Number(f.amount ?? '0') > 0)) withLiq++;
        let v = 0, ok = items.length > 0;
        for (const f of items) { const px = prices.get(f.resource_address)?.priceXrd; if (px === undefined) { ok = false; break; } v += Number(f.amount ?? '0') * px; }
        if (ok && v > 0 && v < 1e9) tvl += v; // > 1e9 XRD in one pool = mispriced dust, not real value
      }
    }
    return { pools: pools.length, poolsWithLiquidity: withLiq, poolsWithXrd: withXrd, xrdInPools: xrd, tvlXrd: tvl, fetchedAt: new Date().toISOString() };
  })();
  memo = { at: Date.now(), p };
  p.catch(() => (memo = null));
  return p;
}
