import { gatewayPost } from '@/lib/radix/gateway';
import { toAtto, type Atto } from '@/lib/hyperstake/math';

/** Exact live state of one Simple Pool, safe for quoting and manifests (string amounts → atto BigInt). */
export type LiveSimplePool = {
  reserveX: Atto;
  reserveY: Atto;
  lpSupply: Atto;
  divisibilityX: number;
  divisibilityY: number;
  fetchedAt: number;
};

type Item = {
  address: string;
  details?: { type: string; total_supply?: string; divisibility?: number };
  fungible_resources?: { items: { resource_address: string; amount?: string }[] };
};

export async function fetchLiveSimplePool(o: { poolComponent: string; lpResource: string; resourceX: string; resourceY: string }): Promise<LiveSimplePool> {
  const res = await gatewayPost<{ items: Item[] }>('/state/entity/details', {
    addresses: [o.poolComponent, o.lpResource, o.resourceX, o.resourceY],
    aggregation_level: 'Global',
  });
  const by = Object.fromEntries(res.items.map((i) => [i.address, i]));
  const reserves = Object.fromEntries((by[o.poolComponent]?.fungible_resources?.items ?? []).map((f) => [f.resource_address, f.amount ?? '0']));
  return {
    reserveX: toAtto(reserves[o.resourceX] ?? '0'),
    reserveY: toAtto(reserves[o.resourceY] ?? '0'),
    lpSupply: toAtto(by[o.lpResource]?.details?.total_supply ?? '0'),
    divisibilityX: by[o.resourceX]?.details?.divisibility ?? 18,
    divisibilityY: by[o.resourceY]?.details?.divisibility ?? 18,
    fetchedAt: Date.now(),
  };
}

/** Balances of arbitrary resources for one account. */
export async function fetchBalances(account: string, resources: string[]): Promise<Record<string, Atto>> {
  const res = await gatewayPost<{ items: { resource_address: string; amount: string }[] }>('/state/entity/page/fungibles/', {
    address: account,
    aggregation_level: 'Global',
    limit_per_page: 100,
  });
  const out: Record<string, Atto> = {};
  for (const r of resources) out[r] = 0n;
  for (const i of res.items) if (resources.includes(i.resource_address)) out[i.resource_address] = toAtto(i.amount);
  return out;
}
