import { getGovernanceLog } from '@/lib/governance/watch';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const log = await getGovernanceLog(60);
    return Response.json({ log }, { headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600' } });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'failed' }, { status: 502 });
  }
}
