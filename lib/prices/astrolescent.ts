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

import { unstable_cache } from 'next/cache';
import { fixIconUrl } from '@/lib/token-icons';

/** Persistent (cross-instance) cache of the price table as a plain record; 10-minute window, tag `prices`. */
export const getPricesRecord = unstable_cache(fetchPricesRecord, ['astrolescent-prices'], { revalidate: 600, tags: ['prices'] });

export async function getPrices(): Promise<Map<string, TokenPrice>> {
  const rec = await getPricesRecord();
  return new Map(Object.entries(rec));
}

async function fetchPricesRecord(): Promise<Record<string, TokenPrice>> {
  const key = process.env.ASTROLESCENT_API_KEY;
  const url = key ? `https://api.astrolescent.com/partner/${encodeURIComponent(key)}/prices` : 'https://api.astrolescent.com/prices';
  const res = await fetch(url, { headers: { 'user-agent': 'notcaviarnine.com' }, cache: 'no-store' });
  if (!res.ok) throw new Error(`astrolescent ${res.status}`);
  const raw = (await res.json()) as Raw;
  const out: Record<string, TokenPrice> = {};
  for (const t of Object.values(raw)) {
    if (!t?.address || typeof t.tokenPriceXRD !== 'number') continue;
    out[t.address] = { address: t.address, symbol: t.symbol, name: t.name, iconUrl: fixIconUrl(t.address, t.iconUrl), divisibility: t.divisibility, priceXrd: t.tokenPriceXRD, priceUsd: t.tokenPriceUSD, updatedAt: t.updatedAt };
  }
  return out;
}
