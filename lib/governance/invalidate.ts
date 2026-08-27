import { revalidateTag } from 'next/cache';
import { cachedGovernance } from '@/lib/cached';

/**
 * The watchtower as a cache trigger: when the admin key changes a fee (or a list), mark the affected cached data
 * stale immediately instead of waiting for its time window. Safe to call from route handlers (e.g. in `after()`).
 */
let lastSeenStateVersion = 0;

export async function invalidateOnGovernanceChange() {
  const log = await cachedGovernance(12).catch(() => null);
  const newest = log?.[0];
  if (!newest || newest.stateVersion <= lastSeenStateVersion) return;
  if (lastSeenStateVersion !== 0) {
    const kinds = new Set(newest.actions.map((a) => a.kind));
    if (kinds.has('fee')) revalidateTag('fees', 'max');
    if (kinds.has('list')) revalidateTag('simple-pools', 'max');
  }
  lastSeenStateVersion = newest.stateVersion;
}
