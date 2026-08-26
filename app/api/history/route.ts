import { ADDRESSES } from '@/lib/radix/config';
import { streamTransactions } from '@/lib/radix/gateway';
import { decodeHyperStakeEvents } from '@/lib/indexer/events';

export const dynamic = 'force-dynamic';

/**
 * Recent HyperStake activity straight from the Gateway.
 *   /api/history            → pool-wide (last 100 txs)
 *   /api/history?account=…  → only txs that touched that account AND emitted a HyperStake event
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const account = url.searchParams.get('account');
  if (account && !/^account_rdx1[a-z0-9]+$/.test(account))
    return Response.json({ error: 'bad account' }, { status: 400 });
  try {
    const res = await streamTransactions({
      emitters: [ADDRESSES.hyperStake],
      ...(account ? { affected: [account] } : {}),
      limit: account ? 50 : 40,
      receiptEvents: true,
    });
    const items = res.items.flatMap(decodeHyperStakeEvents);
    return Response.json(
      { items, ledgerStateVersion: res.ledger_state.state_version },
      { headers: { 'Cache-Control': account ? 'no-store' : 'public, s-maxage=10, stale-while-revalidate=30' } },
    );
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'failed' }, { status: 502 });
  }
}
