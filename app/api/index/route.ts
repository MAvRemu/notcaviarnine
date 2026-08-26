import { runIndexer } from '@/lib/indexer/run';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Indexer trigger. Called by Vercel Cron (daily backstop on Hobby) and lazily
 * from /api/pool when the last run is >1h old. If CRON_SECRET is set, requests
 * must carry it (Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`).
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return new Response('unauthorized', { status: 401 });
  }
  const result = await runIndexer();
  return Response.json(result, { status: result.ok ? 200 : 500 });
}
