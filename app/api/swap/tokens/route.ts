import { getSwapTokens } from '@/lib/swap/astrolescent';
import { getPricesRecord } from '@/lib/prices/astrolescent';
import { isLive } from '@/lib/products';

export const dynamic = 'force-dynamic';

/** Tradeable token list for the swap picker (server-cached 1h upstream), with USD prices merged in. */
export async function GET() {
  if (!isLive('swap')) return new Response(null, { status: 404 });
  try {
    const [tokens, prices] = await Promise.all([getSwapTokens(), getPricesRecord().catch(() => ({}) as Record<string, { priceUsd: number }>)]);
    const withPrices = tokens.map((t) => ({ ...t, priceUsd: prices[t.address]?.priceUsd }));
    return Response.json(withPrices, { headers: { 'cache-control': 'public, max-age=300, s-maxage=300' } });
  } catch {
    return Response.json({ error: 'Token list unavailable' }, { status: 502 });
  }
}
