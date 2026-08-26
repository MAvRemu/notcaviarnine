import { ADDRESSES } from '@/lib/radix/config';
import { streamTransactions } from '@/lib/radix/gateway';
import { decodeHyperStakeEvents } from '@/lib/indexer/events';

export const dynamic = 'force-dynamic';

/**
 * HyperStake activity straight from the Gateway, newest first, cursor-paginated.
 *   /api/history?cursor=…            → pool-wide
 *   /api/history?account=…&cursor=…  → only txs that touched that account AND emitted a HyperStake event
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const account = url.searchParams.get('account');
  const cursor = url.searchParams.get('cursor') ?? undefined;
  if (account && !/^account_rdx1[a-z0-9]+$/.test(account))
    return Response.json({ error: 'bad account' }, { status: 400 });
  if (cursor && !/^[A-Za-z0-9_=-]{1,512}$/.test(cursor))
    return Response.json({ error: 'bad cursor' }, { status: 400 });
  try {
    const res = await streamTransactions({
      emitters: [ADDRESSES.hyperStake],
      ...(account ? { affected: [account] } : {}),
      cursor,
      limit: 30,
      receiptEvents: true,
    });
    const items = res.items.flatMap(decodeHyperStakeEvents);
    return Response.json(
      { items, nextCursor: res.next_cursor ?? null, ledgerStateVersion: res.ledger_state.state_version },
      { headers: { 'Cache-Control': account || cursor ? 'no-store' : 'public, s-maxage=10, stale-while-revalidate=30' } },
    );
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'failed' }, { status: 502 });
  }
}
