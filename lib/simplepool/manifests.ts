import { assertAddress, assertContains, depositAll, joinManifest, takeAll, withdraw } from '@/lib/radix/manifest-utils';
import type { Atto } from '@/lib/hyperstake/math';

export function simplePoolAddLiquidityManifest(o: {
  account: string;
  swapComponent: string;
  resourceX: string;
  amountX: Atto;
  resourceY: string;
  amountY: Atto;
  lpResource: string;
  minLp: Atto;
}) {
  const account = assertAddress(o.account, 'account_');
  return joinManifest([
    withdraw(account, assertAddress(o.resourceX, 'resource_'), o.amountX),
    withdraw(account, assertAddress(o.resourceY, 'resource_'), o.amountY),
    takeAll(o.resourceX, 'bucket_x'),
    takeAll(o.resourceY, 'bucket_y'),
    `CALL_METHOD
    Address("${assertAddress(o.swapComponent, 'component_')}")
    "add_liquidity"
    Bucket("bucket_x")
    Bucket("bucket_y")
;`,
    assertContains(o.lpResource, o.minLp),
    depositAll(account),
  ]);
}

export function simplePoolRemoveLiquidityManifest(o: {
  account: string;
  swapComponent: string;
  lpResource: string;
  amountLp: Atto;
  resourceX: string;
  minX: Atto;
  resourceY: string;
  minY: Atto;
}) {
  const account = assertAddress(o.account, 'account_');
  return joinManifest([
    withdraw(account, assertAddress(o.lpResource, 'resource_'), o.amountLp),
    takeAll(o.lpResource, 'bucket_lp'),
    `CALL_METHOD
    Address("${assertAddress(o.swapComponent, 'component_')}")
    "remove_liquidity"
    Bucket("bucket_lp")
;`,
    assertContains(o.resourceX, o.minX),
    assertContains(o.resourceY, o.minY),
    depositAll(account),
  ]);
}
