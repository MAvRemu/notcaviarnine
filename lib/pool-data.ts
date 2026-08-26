import { fetchPoolState, type PoolState } from '@/lib/hyperstake/state';
import { getFeeStats, type FeeStats } from '@/lib/stats';
import { hasDb } from '@/lib/db/client';
import { indexerStatus, runIndexer } from '@/lib/indexer/run';

export type PoolSnapshot = {
  state: PoolState;
  stats: FeeStats | null;
  indexer: { lastRunAt: string; lastStateVersion: number; lastError: string | null } | null;
};

/**
 * Server-side aggregate used by both the landing page and /api/pool.
 * Small in-process memo so a burst of requests hits the Gateway once.
 */
let memo: { at: number; p: Promise<PoolSnapshot> } | null = null;
const TTL_MS = 15_000;

export function getPoolSnapshot(): Promise<PoolSnapshot> {
  if (memo && Date.now() - memo.at < TTL_MS) return memo.p;
  const p = (async () => {
    const state = await fetchPoolState();
    const [stats, idx] = await Promise.all([
      getFeeStats(state.tvlXrd, 7).catch(() => null),
      indexerStatus().catch(() => null),
    ]);
    return {
      state,
      stats,
      indexer: idx
        ? { lastRunAt: idx.lastRunAt.toISOString(), lastStateVersion: idx.lastStateVersion, lastError: idx.lastError }
        : null,
    };
  })();
  memo = { at: Date.now(), p };
  p.catch(() => (memo = null));
  return p;
}

/** Lazy indexer kick: run if the DB is configured and the last run is >1h old. */
export async function maybeIndex(snapshot: PoolSnapshot) {
  if (!hasDb()) return;
  const last = snapshot.indexer?.lastRunAt ? new Date(snapshot.indexer.lastRunAt).getTime() : 0;
  if (Date.now() - last < 3600_000) return;
  await runIndexer().catch(() => undefined);
}
