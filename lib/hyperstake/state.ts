import { ADDRESSES, RESOURCES } from '@/lib/radix/config';
import {
  field,
  getEntityDetails,
  getKeyValueStoreKeys,
  previewManifest,
  stateVersionToTime,
  streamTransactions,
} from '@/lib/radix/gateway';
import { getInfoManifest } from './manifests';
import { dDiv, dMul, E18, fromAtto, poolPrice, toAtto, type PoolParams } from './math';

/**
 * Everything the UI needs about the pool, in one server-side read.
 * All Decimal values are serialised as strings (18-dp) so this can be
 * returned from a Route Handler and re-hydrated with toAtto() on the client.
 */
export type PoolState = {
  fetchedAt: string;
  ledgerStateVersion: number;
  /** PoolParams, as strings */
  reserveLsulp: string;
  reserveXrd: string;
  nav: string; // oracle price, XRD per LSULP
  price: string; // pool mid price, XRD per LSULP (matches get_info().price)
  upperOffset: string;
  lowerOffset: string;
  fee: string;
  protocolFeeShare: string;
  treasuryFeeShare: string;
  /** Derived */
  premiumToNav: string; // (price / nav − 1), e.g. "-0.0132" = 1.32 % discount
  rangeLower: string; // nav × lowerOffset
  rangeUpper: string; // nav × upperOffset
  tvlXrd: string; // reserveXrd + reserveLsulp × nav
  hlpSupply: string;
  hlpValueXrd: string; // tvl / supply
  lsulpSupply: string;
  lsuPoolValuationXrd: string;
  /** Oracle / governance health */
  lsuPoolLastTxAt: string | null;
  lsuPoolValidatorCount: number;
  lsuPoolValidatorPointer: number;
  requireActiveSet: boolean;
  /** LSU resources currently on the owner-maintained allowlist */
  allowlistCount: number | null;
  /** distinct validator LSU resources the LSU Pool actually holds (balance > 0) */
  lsuPoolHeldCount: number | null;
  /** LSU resources held by the pool but NOT on the allowlist */
  heldNotAllowlisted: number | null;
  allowlistLastUpdatedAt: string | null;
};

export function toPoolParams(s: PoolState): PoolParams {
  return {
    reserveX: toAtto(s.reserveLsulp),
    reserveY: toAtto(s.reserveXrd),
    oraclePrice: toAtto(s.nav),
    upperOffset: toAtto(s.upperOffset),
    lowerOffset: toAtto(s.lowerOffset),
    fee: toAtto(s.fee),
    protocolFeeShare: toAtto(s.protocolFeeShare),
    treasuryFeeShare: toAtto(s.treasuryFeeShare),
  };
}

export async function fetchPoolState(): Promise<PoolState> {
  const [info, details, lsuTxs] = await Promise.all([
    previewManifest(getInfoManifest()),
    getEntityDetails([
      RESOURCES.HLP,
      RESOURCES.LSULP,
      ADDRESSES.lsuPool,
      ADDRESSES.lsuTokenValidator,
    ]),
    streamTransactions({ affected: [ADDRESSES.lsuPool], limit: 1 }),
  ]);

  if (info.receipt.status !== 'Succeeded')
    throw new Error(`get_info preview failed: ${info.receipt.error_message}`);
  // PoolInfo is a Tuple whose fields carry no names in the receipt output;
  // order is fixed by the Rust struct (see hyper_stake.rs::PoolInfo).
  const f = info.receipt.output![0].programmatic_json.fields!;
  const v = (i: number) => String(f[i].value);
  const params: PoolParams = {
    reserveX: toAtto(v(3)),
    reserveY: toAtto(v(4)),
    oraclePrice: toAtto(v(5)),
    upperOffset: toAtto(v(6)),
    lowerOffset: toAtto(v(7)),
    fee: toAtto(v(8)),
    protocolFeeShare: toAtto(v(9)),
    treasuryFeeShare: toAtto(v(10)),
  };
  const price = toAtto(v(0));
  // Defensive: our port must agree with the ledger; if it doesn't, trust the ledger.
  if (poolPrice(params) !== price) console.warn('[hyperstake] poolPrice mismatch vs get_info');

  const byAddr = Object.fromEntries(details.items.map((i) => [i.address, i]));
  const hlpSupply = toAtto(byAddr[RESOURCES.HLP]?.details?.total_supply ?? '0');
  const lsulpSupply = toAtto(byAddr[RESOURCES.LSULP]?.details?.total_supply ?? '0');
  const lsuFields = byAddr[ADDRESSES.lsuPool]?.details?.state?.fields;
  const tvFields = byAddr[ADDRESSES.lsuTokenValidator]?.details?.state?.fields;

  // Allowlist vs. what the pool actually holds (best-effort; never fail the snapshot on this).
  const held = (byAddr[ADDRESSES.lsuPool]?.fungible_resources?.items ?? [])
    .filter((f) => Number(f.amount ?? '0') > 0)
    .map((f) => f.resource_address);
  let allowlistCount: number | null = null,
    heldNotAllowlisted: number | null = null,
    allowlistLastUpdatedAt: string | null = null;
  try {
    const kvs = field(tvFields, 'active_set');
    if (kvs) {
      const { keys, lastUpdatedStateVersion } = await getKeyValueStoreKeys(kvs);
      const set = new Set(keys);
      allowlistCount = keys.length;
      heldNotAllowlisted = held.filter((r) => !set.has(r)).length;
      if (lastUpdatedStateVersion) allowlistLastUpdatedAt = await stateVersionToTime(lastUpdatedStateVersion);
    }
  } catch (e) {
    console.warn('[hyperstake] allowlist read failed', e);
  }

  const tvl = params.reserveY + dMul(params.reserveX, params.oraclePrice);
  const premium = dDiv(price, params.oraclePrice) - E18;

  return {
    fetchedAt: new Date().toISOString(),
    ledgerStateVersion: details.ledger_state.state_version,
    reserveLsulp: fromAtto(params.reserveX),
    reserveXrd: fromAtto(params.reserveY),
    nav: fromAtto(params.oraclePrice),
    price: fromAtto(price),
    upperOffset: fromAtto(params.upperOffset),
    lowerOffset: fromAtto(params.lowerOffset),
    fee: fromAtto(params.fee),
    protocolFeeShare: fromAtto(params.protocolFeeShare),
    treasuryFeeShare: fromAtto(params.treasuryFeeShare),
    premiumToNav: fromAtto(premium),
    rangeLower: fromAtto(dMul(params.oraclePrice, params.lowerOffset)),
    rangeUpper: fromAtto(dMul(params.oraclePrice, params.upperOffset)),
    tvlXrd: fromAtto(tvl),
    hlpSupply: fromAtto(hlpSupply),
    hlpValueXrd: fromAtto(hlpSupply === 0n ? 0n : dDiv(tvl, hlpSupply)),
    lsulpSupply: fromAtto(lsulpSupply),
    lsuPoolValuationXrd: field(lsuFields, 'dex_valuation_xrd') ?? '0',
    lsuPoolLastTxAt: lsuTxs.items[0]?.round_timestamp ?? null,
    lsuPoolValidatorCount: Number(field(lsuFields, 'validator_counter') ?? 0),
    lsuPoolValidatorPointer: Number(field(lsuFields, 'validator_pointer') ?? 0),
    requireActiveSet: field(tvFields, 'require_active') === 'true',
    allowlistCount,
    lsuPoolHeldCount: held.length,
    heldNotAllowlisted,
    allowlistLastUpdatedAt,
  };
}
