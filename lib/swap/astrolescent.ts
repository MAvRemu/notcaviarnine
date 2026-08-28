/**
 * Token swaps via the Astrolescent aggregator (server-side only — the partner key stays here).
 * Astrolescent returns a ready-to-sign manifest; we validate it instruction-by-instruction and
 * tighten its minimum-output assert to the user's tolerance before it ever reaches the wallet.
 * Docs: docs.astrolescent.com → Infrastructure → API. Fee component set up by Astrolescent (Timan),
 * owner badge held by the operator; fees claimable at astrolescent.com/fees.
 */
import { unstable_cache } from 'next/cache';
import { partnerUrl } from './quote';

export { SITE_SWAP_FEE, fetchSwapQuote, validateManifest, tightenAssert, type SwapQuote } from './quote';
import { fixIconUrl } from '@/lib/token-icons';



export type SwapToken = { address: string; symbol: string; name: string; iconUrl?: string; divisibility: number; priceUsd?: number };

/** All tokens tradeable on Astrolescent (~740), cached for an hour. */
export const getSwapTokens = unstable_cache(fetchSwapTokens, ['astrolescent-tokens-v2'], { revalidate: 3600, tags: ['swap-tokens'] });

async function fetchSwapTokens(): Promise<SwapToken[]> {
  const res = await fetch(partnerUrl('tokens'), { headers: { 'user-agent': 'notcaviarnine.com' }, cache: 'no-store' });
  if (!res.ok) throw new Error(`astrolescent tokens ${res.status}`);
  const raw = (await res.json()) as SwapToken[];
  return raw
    .filter((t) => t?.address?.startsWith('resource_rdx1') && t.symbol)
    .map((t) => ({ address: t.address, symbol: t.symbol, name: t.name ?? t.symbol, iconUrl: fixIconUrl(t.address, t.iconUrl || undefined), divisibility: t.divisibility ?? 18 }));
}

