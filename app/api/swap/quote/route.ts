import { fetchSwapQuote, getSwapTokens } from '@/lib/swap/astrolescent';
import { DAPP_DEFINITION_ADDRESS } from '@/lib/radix/config';
import { isLive } from '@/lib/products';

export const dynamic = 'force-dynamic';

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
  let body: { inputToken?: string; outputToken?: string; inputAmount?: string; fromAddress?: string; slippageBps?: number };
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
  try {
    const tokens = await getSwapTokens();
    const out = tokens.find((t) => t.address === outputToken);
    if (!out || !tokens.some((t) => t.address === inputToken)) return Response.json({ error: 'Unknown token' }, { status: 400 });
    const quote = await fetchSwapQuote({
      inputToken,
      outputToken,
      inputAmount,
      fromAddress: fromAddress ?? DAPP_DEFINITION_ADDRESS,
      slippageBps,
      outputDivisibility: out.divisibility,
    });
    return Response.json(quote);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Quote failed';
    const friendly = /no route/i.test(msg) ? msg : /astrolescent swap/.test(msg) ? 'The aggregator could not quote this swap right now.' : msg;
    return Response.json({ error: friendly }, { status: 502 });
  }
}
