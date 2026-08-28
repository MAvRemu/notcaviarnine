import { ADDRESSES, RESOURCES } from '@/lib/radix/config';
import { assertAddress, assertContains, depositAll, joinManifest, proofOfNonFungibles, takeAll, withdraw } from '@/lib/radix/manifest-utils';
import type { Atto } from '@/lib/hyperstake/math';

/** LSU Pool credit receipt resource (soul-bound NFT tracking deposits for fee-free same-LSU redemption). */
export const CREDIT_RECEIPT = 'resource_rdx1nt3frmqu4v57dy55e90n0k3uy352zyy89vszzamvjld6vqvr98rls9';

const creditArg = (proofName?: string) => (proofName ? `Enum<1u8>(Proof("${proofName}"))` : 'Enum<0u8>()');

export function lsuAddLiquidityManifest(o: { account: string; lsuResource: string; amount: Atto; minLsulp: Atto; creditReceiptId?: string }) {
  const account = assertAddress(o.account, 'account_');
  return joinManifest([
    withdraw(account, assertAddress(o.lsuResource, 'resource_'), o.amount),
    takeAll(o.lsuResource, 'lsu'),
    o.creditReceiptId ? proofOfNonFungibles(account, CREDIT_RECEIPT, o.creditReceiptId, 'credit') : '',
    `CALL_METHOD
    Address("${ADDRESSES.lsuPool}")
    "add_liquidity"
    Bucket("lsu")
    ${creditArg(o.creditReceiptId ? 'credit' : undefined)}
;`,
    assertContains(RESOURCES.LSULP, o.minLsulp),
    depositAll(account),
  ]);
}

export function lsuRemoveLiquidityManifest(o: { account: string; amountLsulp: Atto; lsuResource: string; minLsu: Atto; creditReceiptId?: string }) {
  const account = assertAddress(o.account, 'account_');
  return joinManifest([
    withdraw(account, RESOURCES.LSULP, o.amountLsulp),
    takeAll(RESOURCES.LSULP, 'lp'),
    o.creditReceiptId ? proofOfNonFungibles(account, CREDIT_RECEIPT, o.creditReceiptId, 'credit') : '',
    `CALL_METHOD
    Address("${ADDRESSES.lsuPool}")
    "remove_liquidity"
    Bucket("lp")
    Address("${assertAddress(o.lsuResource, 'resource_')}")
    ${creditArg(o.creditReceiptId ? 'credit' : undefined)}
;`,
    assertContains(o.lsuResource, o.minLsu),
    depositAll(account),
  ]);
}

export function lsuSwapManifest(o: { account: string; fromLsu: string; amount: Atto; toLsu: string; minOut: Atto }) {
  const account = assertAddress(o.account, 'account_');
  return joinManifest([
    withdraw(account, assertAddress(o.fromLsu, 'resource_'), o.amount),
    takeAll(o.fromLsu, 'lsu_in'),
    `CALL_METHOD
    Address("${ADDRESSES.lsuPool}")
    "swap"
    Bucket("lsu_in")
    Address("${assertAddress(o.toLsu, 'resource_')}")
;`,
    assertContains(o.toLsu, o.minOut),
    depositAll(account),
  ]);
}

/** Public price-cache refresh — anyone can sign this; it costs only the network fee. */
export function lsuRefreshPricesManifest(n = 10) {
  return `CALL_METHOD
    Address("${ADDRESSES.lsuPool}")
    "update_multiple_validator_prices"
    ${n}u32
;
`;
}
