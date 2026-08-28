import { unstable_cache } from 'next/cache';
import { getSimplePoolSummaries } from '@/lib/simplepool/registry';
import { getSimplePoolVolumes } from '@/lib/simplepool/volume';
import { getShapePoolList, getShapeSummary } from '@/lib/shape/registry';
import { getGovernanceLog } from '@/lib/governance/watch';
import { getPoolSnapshot } from '@/lib/pool-data';

/**
 * Cross-instance cached readers (Next Data Cache — persists on Vercel across cold starts, unlike the
 * in-process memos). Heavy registry sweeps refresh in the background every few minutes; visitors get the cached copy.
 */
export const cachedSimplePools = unstable_cache(() => getSimplePoolSummaries(), ['simple-pool-summaries'], { revalidate: 300, tags: ['fees', 'simple-pools'] });
/** 7d swap volume per pool (Gateway stream scan, ~1 query per 10 pools) — hourly is plenty. */
export const cachedSimplePoolVolumes = unstable_cache((components: string[]) => getSimplePoolVolumes(components), ['simple-pool-volumes'], { revalidate: 3600, tags: ['volumes'] });
export const cachedShape = unstable_cache(() => getShapeSummary(), ['shape-summary'], { revalidate: 900, tags: ['shape'] });
export const cachedShapePools = unstable_cache(() => getShapePoolList(), ['shape-pool-list'], { revalidate: 600, tags: ['shape'] });
export const cachedGovernance = unstable_cache((n: number) => getGovernanceLog(n), ['governance-log'], { revalidate: 600, tags: ['governance'] });
export const cachedPoolSnapshot = unstable_cache(() => getPoolSnapshot(), ['pool-snapshot'], { revalidate: 20 });
