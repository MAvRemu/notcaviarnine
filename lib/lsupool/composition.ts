import { unstable_cache } from 'next/cache';
import { ADDRESSES } from '@/lib/radix/config';
import { getEntityDetails, getKeyValueStoreKeys, gatewayPost, field } from '@/lib/radix/gateway';

/** One row per validator LSU the pool tracks: name, balance, cached price, value, approved flag. Cached 1 h. */
export type LsuRow = {
  lsuResource: string;
  validatorName: string;
  balance: number;
  cachedPrice: number;
  valueXrd: number;
  approved: boolean;
};

export const getLsuComposition = unstable_cache(fetchComposition, ['lsu-composition'], { revalidate: 3600, tags: ['lsu'] });

async function fetchComposition(): Promise<{ rows: LsuRow[]; requireActive: boolean }> {
  // cached prices KVS + allowlist KVS addresses come from component state
  const comp = await getEntityDetails([ADDRESSES.lsuPool, ADDRESSES.lsuTokenValidator]);
  const lsuState = comp.items.find((i) => i.address === ADDRESSES.lsuPool)?.details?.state?.fields;
  const tvState = comp.items.find((i) => i.address === ADDRESSES.lsuTokenValidator)?.details?.state?.fields;
  const pricesKvs = field(lsuState, 'prices_lsu_xrd')!;
  const allowKvs = field(tvState, 'active_set')!;
  const requireActive = field(tvState, 'require_active') === 'true';
  const balances = Object.fromEntries(
    (comp.items.find((i) => i.address === ADDRESSES.lsuPool)?.fungible_resources?.items ?? []).map((f) => [f.resource_address, Number(f.amount ?? '0')]),
  );

  const [priceKeys, allowKeys] = await Promise.all([getKeyValueStoreKeys(pricesKvs), getKeyValueStoreKeys(allowKvs)]);
  const approved = new Set(allowKeys.keys);
  const prices: Record<string, number> = {};
  for (let i = 0; i < priceKeys.keys.length; i += 50) {
    const r = await gatewayPost<{ entries: { key: { programmatic_json: { value: string } }; value: { programmatic_json: { value: string } } }[] }>(
      '/state/key-value-store/data',
      { key_value_store_address: pricesKvs, keys: priceKeys.keys.slice(i, i + 50).map((k) => ({ key_json: { kind: 'Reference', value: k } })) },
    );
    for (const e of r.entries) prices[e.key.programmatic_json.value] = Number(e.value.programmatic_json.value);
  }

  // validator names: LSU metadata `validator` → validator metadata `name`
  const lsus = Object.keys(prices);
  const validatorOf: Record<string, string> = {};
  for (let i = 0; i < lsus.length; i += 20) {
    const d = await getEntityDetails(lsus.slice(i, i + 20), { explicitMetadata: ['validator'] });
    for (const it of d.items) {
      const v = it.metadata?.items.find((m) => m.key === 'validator')?.value.typed.value;
      if (v) validatorOf[it.address] = String(v);
    }
  }
  const validators = [...new Set(Object.values(validatorOf))];
  const nameOf: Record<string, string> = {};
  for (let i = 0; i < validators.length; i += 20) {
    const d = await getEntityDetails(validators.slice(i, i + 20), { explicitMetadata: ['name'] });
    for (const it of d.items) nameOf[it.address] = String(it.metadata?.items.find((m) => m.key === 'name')?.value.typed.value ?? '?');
  }

  const rows = lsus
    .map((lsu) => ({
      lsuResource: lsu,
      validatorName: nameOf[validatorOf[lsu] ?? ''] ?? lsu.slice(0, 16),
      balance: balances[lsu] ?? 0,
      cachedPrice: prices[lsu] ?? 0,
      valueXrd: (balances[lsu] ?? 0) * (prices[lsu] ?? 0),
      approved: approved.has(lsu),
    }))
    .sort((a, b) => b.valueXrd - a.valueXrd);
  return { rows, requireActive };
}
