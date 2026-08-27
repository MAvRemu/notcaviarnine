import { unstable_cache } from 'next/cache';
import { getSimplePoolSummaries } from '@/lib/simplepool/registry';
import { getShapeSummary } from '@/lib/shape/registry';
import { getGovernanceLog } from '@/lib/governance/watch';
import { getPoolSnapshot } from '@/lib/pool-data';

/**
 * Cross-instance cached readers (Next Data Cache — persists on Vercel across cold starts, unlike the
 * in-process memos). Heavy registry sweeps refresh in the background every few minutes; visitors get the cached copy.
 */
export const cachedSimplePools = unstable_cache(() => getSimplePoolSummaries(), ['simple-pool-summaries'], { revalidate: 300 });
export const cachedShape = unstable_cache(() => getShapeSummary(), ['shape-summary'], { revalidate: 900 });
export const cachedGovernance = unstable_cache((n: number) => getGovernanceLog(n), ['governance-log'], { revalidate: 600 });
export const cachedPoolSnapshot = unstable_cache(() => getPoolSnapshot(), ['pool-snapshot'], { revalidate: 20 });
