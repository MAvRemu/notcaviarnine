/**
 * Token prices from the Astrolescent aggregator (liquidity-weighted across DefiPlaza, Ociswap, CaviarNine; refreshed
 * every 10 min upstream). Server-side only. Decision 16 in docs/SIMPLE_POOL_UX.md.
 */
export type TokenPrice = {
  address: string;
  symbol: string;
  name: string;
  iconUrl?: string;
  divisibility: number;
  priceXrd: number;
  priceUsd: number;
  updatedAt?: string;
};

type Raw = Record<string, { address: string; symbol: string; name: string; iconUrl?: string; divisibility: number; tokenPriceXRD: number; tokenPriceUSD: number; updatedAt?: string }>;

const TTL = 10 * 60_000;
let memo: { at: number; p: Promise<Map<string, TokenPrice>> } | null = null;

export function getPrices(): Promise<Map<string, TokenPrice>> {
  if (memo && Date.now() - memo.at < TTL) return memo.p;
  const key = process.env.ASTROLESCENT_API_KEY;
  const url = key ? `https://api.astrolescent.com/partner/${encodeURIComponent(key)}/prices` : 'https://api.astrolescent.com/prices';
  const p = (async () => {
    const res = await fetch(url, { headers: { 'user-agent': 'notcaviarnine.com' }, next: { revalidate: 600 } });
    if (!res.ok) throw new Error(`astrolescent ${res.status}`);
    const raw = (await res.json()) as Raw;
    const m = new Map<string, TokenPrice>();
    for (const t of Object.values(raw)) {
      if (!t?.address || typeof t.tokenPriceXRD !== 'number') continue;
      m.set(t.address, { address: t.address, symbol: t.symbol, name: t.name, iconUrl: t.iconUrl, divisibility: t.divisibility, priceXrd: t.tokenPriceXRD, priceUsd: t.tokenPriceUSD, updatedAt: t.updatedAt });
    }
    return m;
  })();
  memo = { at: Date.now(), p };
  p.catch(() => (memo = null));
  return p;
}
