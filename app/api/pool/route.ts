import { after } from 'next/server';
import { getPoolSnapshot, maybeIndex } from '@/lib/pool-data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const snap = await getPoolSnapshot();
    after(() => maybeIndex(snap));
    return Response.json(snap, {
      headers: { 'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=60' },
    });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'failed' }, { status: 502 });
  }
}
