import { ADDRESSES } from '@/lib/radix/config';
import { gatewayPost, previewManifest, type ProgrammaticField } from '@/lib/radix/gateway';
import { dDiv, dMul, toAtto, type Atto } from '@/lib/hyperstake/math';
import { CREDIT_RECEIPT } from './manifests';

/**
 * Exact quoting for the LSU Pool, mirroring lsu_pool.rs Decimal order of operations.
 * All live numbers come from one Gateway preview batching the public getters.
 */

const parseOption = (f: ProgrammaticField): string | null => {
  if (f.kind !== 'Enum') return String(f.value ?? '');
  return f.variant_id === '1' ? String(f.fields?.[0]?.value ?? '0') : null;
};

export type LsuLive = {
  valuationXrd: Atto;
  lsulpSupply: Atto;
  livePrice: Atto; // live redemption value of 1 LSU of `resource`
  cachedPrice: Atto | null;
  vaultBalance: Atto | null;
  protocolFee: Atto;
  liquidityFee: Atto;
  reserveFee: Atto;
  /** valuation after re-marking `resource` at the live price (what the contract uses mid-operation) */
  valuationRemarked: Atto;
};

export async function fetchLsuLive(resource: string): Promise<LsuLive> {
  const L = ADDRESSES.lsuPool;
  const man = [
    `CALL_METHOD Address("${L}") "get_dex_valuation_xrd";`,
    `CALL_METHOD Address("${L}") "get_liquidity_token_total_supply";`,
    `CALL_METHOD Address("${L}") "get_validator_price_lsu_xrd" Address("${resource}");`,
    `CALL_METHOD Address("${L}") "get_price_lsu_xrd_cached" Address("${resource}");`,
    `CALL_METHOD Address("${L}") "get_vault_balance" Address("${resource}");`,
    `CALL_METHOD Address("${L}") "get_protocol_fee";`,
    `CALL_METHOD Address("${L}") "get_liquidity_fee";`,
    `CALL_METHOD Address("${L}") "get_reserve_fee";`,
  ].join('\n');
  const res = await previewManifest(man);
  if (res.receipt.status !== 'Succeeded') throw new Error(res.receipt.error_message ?? 'preview failed');
  const out = res.receipt.output!.map((o) => o.programmatic_json);
  const valuation = toAtto(String(out[0].value));
  const supply = toAtto(String(out[1].value));
  const live = parseOption(out[2]);
  if (live === null) throw new Error('Not a known LSU');
  const cached = parseOption(out[3]);
  const vault = parseOption(out[4]);
  const livePrice = toAtto(live);
  const cachedPrice = cached === null ? null : toAtto(cached);
  const vaultBalance = vault === null ? null : toAtto(vault);
  const remark = cachedPrice !== null && vaultBalance !== null ? dMul(vaultBalance, livePrice - cachedPrice) : 0n;
  return {
    valuationXrd: valuation,
    lsulpSupply: supply,
    livePrice,
    cachedPrice,
    vaultBalance,
    protocolFee: toAtto(String(out[5].value)),
    liquidityFee: toAtto(String(out[6].value)),
    reserveFee: toAtto(String(out[7].value)),
    valuationRemarked: valuation + remark,
  };
}

/** LSULP minted for depositing `amount` of an LSU (contract order: amount×price → /valuation → ×supply). */
export function quoteAddLsu(l: LsuLive, amount: Atto): Atto {
  if (amount <= 0n) return 0n;
  const bucketValuation = dMul(amount, l.livePrice);
  if (l.valuationRemarked === 0n) return amount;
  return dMul(dDiv(bucketValuation, l.valuationRemarked), l.lsulpSupply);
}

export type RemoveQuote = { lsuOut: Atto; lsulpBurned: Atto; partial: boolean; feeLsu: Atto; taxable: Atto; discount: Atto };

/** LSU received for burning `lsulp`, redeeming into `resource`; `credit` = credited amount of that LSU on the receipt. */
export function quoteRemoveLsu(l: LsuLive, lsulp: Atto, credit: Atto): RemoveQuote {
  const empty = { lsuOut: 0n, lsulpBurned: 0n, partial: false, feeLsu: 0n, taxable: 0n, discount: 0n };
  if (lsulp <= 0n || l.lsulpSupply === 0n || l.livePrice === 0n) return empty;
  const vault = l.vaultBalance ?? 0n;
  if (vault === 0n) return { ...empty, partial: true };
  const share = dDiv(lsulp, l.lsulpSupply);
  const valuationLsu = dDiv(l.valuationRemarked, l.livePrice);
  const entitlement = dMul(valuationLsu, share);
  let payout = entitlement, burned = lsulp, partial = false;
  if (vault < entitlement) { payout = vault; burned = dMul(dDiv(vault, valuationLsu), l.lsulpSupply); partial = true; }
  const discount = payout < credit ? payout : credit;
  const taxable = payout - discount;
  const fee = dMul(taxable, l.liquidityFee + l.protocolFee + l.reserveFee);
  return { lsuOut: payout - fee, lsulpBurned: burned, partial, feeLsu: fee, taxable, discount };
}

/** LSU→LSU swap quote: oracle parity, capped by the paying vault, fees off the paid-out side. */
export function quoteSwapLsu(from: LsuLive, to: LsuLive, amount: Atto): { out: Atto; used: Atto; partial: boolean } {
  if (amount <= 0n || to.livePrice === 0n) return { out: 0n, used: 0n, partial: false };
  const priceRatio = dDiv(from.livePrice, to.livePrice); // to-LSU per from-LSU
  const vault = to.vaultBalance ?? 0n;
  let receive = dMul(amount, priceRatio), used = amount, partial = false;
  if (receive > vault) { receive = vault; used = dDiv(vault, priceRatio); partial = true; }
  const fee = dMul(receive, to.liquidityFee + to.protocolFee + to.reserveFee);
  return { out: receive - fee, used, partial };
}

/** The account's credit receipt (soul-bound): id + credited LSU amounts, or null. */
export async function fetchCreditReceipt(account: string): Promise<{ id: string; resources: Record<string, Atto> } | null> {
  const page = await gatewayPost<{ items: { resource_address: string; vaults: { items: { items?: string[] }[] } }[] }>(
    '/state/entity/page/non-fungibles/',
    { address: account, aggregation_level: 'Vault', opt_ins: { non_fungible_include_nfids: true }, limit_per_page: 100 },
  );
  const row = page.items.find((i) => i.resource_address === CREDIT_RECEIPT);
  const id = row?.vaults.items.flatMap((v) => v.items ?? [])[0];
  if (!id) return null;
  const data = await gatewayPost<{ non_fungible_ids: { data: { programmatic_json: ProgrammaticField } }[] }>('/state/non-fungible/data', {
    resource_address: CREDIT_RECEIPT,
    non_fungible_ids: [id],
  });
  const fields = data.non_fungible_ids[0]?.data.programmatic_json.fields ?? [];
  const map = fields[0] as unknown as { entries?: { key: { value: string }; value: { value: string } }[] };
  const resources: Record<string, Atto> = {};
  for (const e of map?.entries ?? []) resources[e.key.value] = toAtto(e.value.value);
  return { id, resources };
}
