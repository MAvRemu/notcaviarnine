import { ADDRESSES, RESOURCES } from '@/lib/radix/config';
import { fromAtto, type Atto } from './math';

/**
 * Transaction manifest builders for HyperStake.
 *
 * Shape deliberately mirrors the manifests CaviarNine's own frontend produced
 * (observed 2026-08-26): withdraw → TAKE_ALL_FROM_WORKTOP → call → assert
 * minimum outputs → deposit_batch(ENTIRE_WORKTOP). No lock_fee: the Radix
 * Wallet adds fee payment itself. ENTIRE_WORKTOP guarantees partial-fill
 * remainders are returned to the user.
 */

const assertAddress = (address: string, prefix: string) => {
  if (!/^[a-z0-9_]+$/.test(address) || !address.startsWith(prefix))
    throw new Error(`Invalid ${prefix} address: ${address}`);
  return address;
};

const dec = (a: Atto) => {
  if (a < 0n) throw new Error('Negative amount');
  return `Decimal("${fromAtto(a)}")`;
};

const withdraw = (account: string, resource: string, amount: Atto) => `CALL_METHOD
    Address("${account}")
    "withdraw"
    Address("${resource}")
    ${dec(amount)}
;`;

const takeAll = (resource: string, bucket: string) => `TAKE_ALL_FROM_WORKTOP
    Address("${resource}")
    Bucket("${bucket}")
;`;

const assertContains = (resource: string, min: Atto) =>
  min > 0n
    ? `ASSERT_WORKTOP_CONTAINS
    Address("${resource}")
    ${dec(min)}
;`
    : '';

const depositAll = (account: string) => `CALL_METHOD
    Address("${account}")
    "deposit_batch"
    Expression("ENTIRE_WORKTOP")
;`;

const join = (parts: string[]) => parts.filter(Boolean).join('\n') + '\n';

export function swapManifest(o: {
  account: string;
  inputResource: string;
  inputAmount: Atto;
  outputResource: string;
  minOutput: Atto;
}) {
  const account = assertAddress(o.account, 'account_');
  return join([
    withdraw(account, o.inputResource, o.inputAmount),
    takeAll(o.inputResource, 'bucket1'),
    `CALL_METHOD
    Address("${ADDRESSES.hyperStake}")
    "swap"
    Bucket("bucket1")
;`,
    assertContains(o.outputResource, o.minOutput),
    depositAll(account),
  ]);
}

export function addLiquidityManifest(o: {
  account: string;
  amountLsulp: Atto;
  amountXrd: Atto;
  minHlp: Atto;
}) {
  const account = assertAddress(o.account, 'account_');
  return join([
    withdraw(account, RESOURCES.LSULP, o.amountLsulp),
    withdraw(account, RESOURCES.XRD, o.amountXrd),
    takeAll(RESOURCES.LSULP, 'bucket1'),
    takeAll(RESOURCES.XRD, 'bucket2'),
    `CALL_METHOD
    Address("${ADDRESSES.hyperStake}")
    "add_liquidity"
    Bucket("bucket1")
    Bucket("bucket2")
;`,
    assertContains(RESOURCES.HLP, o.minHlp),
    depositAll(account),
  ]);
}

export function removeLiquidityManifest(o: {
  account: string;
  amountHlp: Atto;
  minLsulp: Atto;
  minXrd: Atto;
}) {
  const account = assertAddress(o.account, 'account_');
  return join([
    withdraw(account, RESOURCES.HLP, o.amountHlp),
    takeAll(RESOURCES.HLP, 'bucket1'),
    `CALL_METHOD
    Address("${ADDRESSES.hyperStake}")
    "remove_liquidity"
    Bucket("bucket1")
;`,
    assertContains(RESOURCES.LSULP, o.minLsulp),
    assertContains(RESOURCES.XRD, o.minXrd),
    depositAll(account),
  ]);
}

/** Read-only manifest used with /transaction/preview. */
export const getInfoManifest = () =>
  `CALL_METHOD Address("${ADDRESSES.hyperStake}") "get_info";`;
