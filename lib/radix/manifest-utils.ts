import { fromAtto, type Atto } from '@/lib/hyperstake/math';

/** Shared RTM builders. Shape mirrors CaviarNine's manifests: withdraw → TAKE_ALL → call → assert mins → deposit_batch(ENTIRE_WORKTOP). */

export const assertAddress = (address: string, prefix: string) => {
  if (!/^[a-z0-9_]+$/.test(address) || !address.startsWith(prefix)) throw new Error(`Invalid ${prefix} address: ${address}`);
  return address;
};

export const dec = (a: Atto) => {
  if (a < 0n) throw new Error('Negative amount');
  return `Decimal("${fromAtto(a)}")`;
};

export const withdraw = (account: string, resource: string, amount: Atto) => `CALL_METHOD
    Address("${account}")
    "withdraw"
    Address("${resource}")
    ${dec(amount)}
;`;

export const withdrawNonFungibles = (account: string, resource: string, ids: string[]) => `CALL_METHOD
    Address("${account}")
    "withdraw_non_fungibles"
    Address("${resource}")
    Array<NonFungibleLocalId>(${ids.map((id) => `NonFungibleLocalId("${assertNfId(id)}")`).join(', ')})
;`;

/** NF local ids are interpolated into manifests — enforce the exact grammar so nothing can escape the literal. */
export const assertNfId = (id: string) => {
  if (!/^(#\d{1,20}#|<[A-Za-z0-9_]{1,64}>|\[[0-9a-f]{2,128}\]|\{[0-9a-f-]{8,64}\})$/.test(id)) throw new Error(`Invalid NFT id: ${id}`);
  return id;
};

export const takeAll = (resource: string, bucket: string) => `TAKE_ALL_FROM_WORKTOP
    Address("${resource}")
    Bucket("${bucket}")
;`;

export const assertContains = (resource: string, min: Atto) =>
  min > 0n
    ? `ASSERT_WORKTOP_CONTAINS
    Address("${resource}")
    ${dec(min)}
;`
    : '';

export const proofOfNonFungibles = (account: string, resource: string, id: string, proofName: string) => `CALL_METHOD
    Address("${account}")
    "create_proof_of_non_fungibles"
    Address("${resource}")
    Array<NonFungibleLocalId>(NonFungibleLocalId("${assertNfId(id)}"))
;
CREATE_PROOF_FROM_AUTH_ZONE_OF_NON_FUNGIBLES
    Address("${resource}")
    Array<NonFungibleLocalId>(NonFungibleLocalId("${assertNfId(id)}"))
    Proof("${proofName}")
;`;

export const depositAll = (account: string) => `CALL_METHOD
    Address("${account}")
    "deposit_batch"
    Expression("ENTIRE_WORKTOP")
;`;

export const joinManifest = (parts: string[]) => parts.filter(Boolean).join('\n') + '\n';
