import { fetchSwapQuote } from '@/lib/swap/quote';
import { DAPP_DEFINITION_ADDRESS } from '@/lib/radix/config';
import { isLive } from '@/lib/products';

export const dynamic = 'force-dynamic';
// Edge: near-zero cold start, runs close to the user and to Astrolescent's EU-fronted API —
// the Node functions sit in iad1 (pinned by the us-east Neon DB) and were adding seconds per quote.
export const runtime = 'edge';

const RESOURCE = /^resource_rdx1[a-z0-9]{10,80}$/;
const ACCOUNT = /^account_rdx1[a-z0-9]{10,80}$/;
const AMOUNT = /^\d{1,15}(\.\d{1,18})?$/;

/**
 * Quote (and manifest) for an aggregator swap. The partner key and fee component stay server-side;
 * the returned manifest is validated and its min-output assert tightened to the requested tolerance.
 * Without a connected wallet the dApp-definition account stands in so prices can be shown — the
 * client never submits that manifest.
 */
export async function POST(req: Request) {
  if (!isLive('swap')) return new Response(null, { status: 404 });
  let body: { inputToken?: string; outputToken?: string; inputAmount?: string; fromAddress?: string; slippageBps?: number; outputDivisibility?: number };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Bad request' }, { status: 400 });
  }
  const { inputToken, outputToken, inputAmount, fromAddress } = body;
  const slippageBps = Math.round(Number(body.slippageBps ?? 50));
  if (
    !inputToken || !RESOURCE.test(inputToken) ||
    !outputToken || !RESOURCE.test(outputToken) || outputToken === inputToken ||
    !inputAmount || !AMOUNT.test(inputAmount) || Number(inputAmount) <= 0 ||
    (fromAddress !== undefined && !ACCOUNT.test(fromAddress)) ||
    !Number.isFinite(slippageBps) || slippageBps < 0 || slippageBps > 5000
  ) {
    return Response.json({ error: 'Bad request' }, { status: 400 });
  }
  // Divisibility comes from the client (which has the token list); the server only clamps it.
  // A wrong value can't hurt: the min-output decimal just gets a different precision, and the
  // ledger rejects over-precise decimals outright.
  const outputDivisibility = Math.min(18, Math.max(0, Math.round(Number(body.outputDivisibility ?? 18)) || 18));
  const t0 = Date.now();
  try {
    const quote = await fetchSwapQuote({
      inputToken,
      outputToken,
      inputAmount,
      fromAddress: fromAddress ?? DAPP_DEFINITION_ADDRESS,
      slippageBps,
      outputDivisibility,
    });
    // visible in devtools → Timing, so slow quotes can be attributed (us vs the aggregator)
    return Response.json(quote, { headers: { 'server-timing': `aggregator;dur=${Date.now() - t0}` } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Quote failed';
    const friendly = /no route/i.test(msg) ? msg : /astrolescent swap/.test(msg) ? 'The aggregator could not quote this swap right now.' : msg;
    return Response.json({ error: friendly }, { status: 502 });
  }
}
