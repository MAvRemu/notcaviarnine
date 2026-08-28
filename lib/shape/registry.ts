import { RESOURCES } from '@/lib/radix/config';
import { field, getEntityDetails, streamTransactions } from '@/lib/radix/gateway';
import { getPrices, type TokenPrice } from '@/lib/prices/astrolescent';

/** QuantaSwap ("Shape Liquidity") factory — emits NewPoolEvent per pool. Research pending: docs/SHAPE_LIQUIDITY.md */
export const SHAPE_FACTORY = 'component_rdx1cqv7hjfuy785cw0s6v4wt7n09e0ufnyz42vnm52hlmu4ue9nngtvsq';

export type ShapePool = { component: string; receiptResource: string; tokenX: string; tokenY: string; binSpan: number; createdAt: string };
export type ShapePoolRow = ShapePool & { symbolX: string; symbolY: string; iconX?: string; iconY?: string; tvlXrd: number | null; hasLiquidity: boolean; xrdPerX: number | null; xrdPerY: number | null };
export type ShapeSummary = { pools: number; poolsWithLiquidity: number; poolsWithXrd: number; xrdInPools: number; /** priced TVL in XRD across pools where both tokens have a price (dust/absurd pools excluded) */ tvlXrd: number; fetchedAt: string };

const TTL = 30 * 60_000;
let memo: { at: number; p: Promise<ShapeSummary> } | null = null;
let listMemo: { at: number; p: Promise<ShapePoolRow[]> } | null = null;

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

/** Priced per-pool list for the Shape pages. Cached 10 min in-process (wrapped by the Data Cache in lib/cached). */
export function getShapePoolList(): Promise<ShapePoolRow[]> {
  if (listMemo && Date.now() - listMemo.at < 10 * 60_000) return listMemo.p;
  const p = (async () => {
    const prices = await getPrices().catch(() => new Map<string, TokenPrice>());
    const pools: ShapePool[] = [];
    let cursor: string | undefined;
    for (let i = 0; i < 20; i++) {
      const res = await streamTransactions({ emitters: [SHAPE_FACTORY], limit: 100, cursor, receiptEvents: true });
      for (const t of res.items) for (const e of t.receipt?.events ?? []) {
        if (e.name !== 'NewPoolEvent' || e.emitter.entity?.entity_address !== SHAPE_FACTORY) continue;
        const g = (k: string) => field(e.data.fields, k)!;
        pools.push({ component: g('component_address'), receiptResource: g('liquidity_receipt_address'), tokenX: g('token_x_address'), tokenY: g('token_y_address'), binSpan: Number(g('bin_span')), createdAt: t.round_timestamp });
      }
      if (!res.next_cursor) break;
      cursor = res.next_cursor;
    }
    const seen = new Set<string>();
    const unique = pools.filter((x) => !seen.has(x.component) && seen.add(x.component));
    const reserves = new Map<string, Record<string, number>>();
    const addrs = unique.map((x) => x.component);
    for (let i = 0; i < addrs.length; i += 20) {
      const d = await getEntityDetails(addrs.slice(i, i + 20), { explicitMetadata: [] });
      for (const it of d.items) reserves.set(it.address, Object.fromEntries((it.fungible_resources?.items ?? []).map((f) => [f.resource_address, Number(f.amount ?? '0')])));
    }
    const sym = (a: string) => prices.get(a)?.symbol ?? a.slice(-6);
    return unique.map((x) => {
      const r = reserves.get(x.component) ?? {};
      const px = prices.get(x.tokenX)?.priceXrd ?? null, py = prices.get(x.tokenY)?.priceXrd ?? null;
      const hasLiquidity = Object.values(r).some((v) => v > 0);
      let tvl: number | null = null;
      if (px !== null && py !== null) { const v = (r[x.tokenX] ?? 0) * px + (r[x.tokenY] ?? 0) * py; tvl = v < 1e9 ? v : null; }
      return { ...x, symbolX: sym(x.tokenX), symbolY: sym(x.tokenY), iconX: prices.get(x.tokenX)?.iconUrl, iconY: prices.get(x.tokenY)?.iconUrl, tvlXrd: tvl, hasLiquidity, xrdPerX: px, xrdPerY: py };
    }).sort((a, b) => (b.tvlXrd ?? -1) - (a.tvlXrd ?? -1));
  })();
  listMemo = { at: Date.now(), p };
  p.catch(() => (listMemo = null));
  return p;
}
