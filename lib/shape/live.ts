import { gatewayPost, previewManifest, type ProgrammaticField } from '@/lib/radix/gateway';
import { toAtto, type Atto } from '@/lib/hyperstake/math';
import { assertAddress, assertContains, assertNfId, depositAll, joinManifest, takeAll, withdraw, withdrawNonFungibles } from '@/lib/radix/manifest-utils';

/** Live state of one Shape pool, read from component state + preview getters. */
export type ShapeLive = {
  binSpan: number;
  currentTick: number | null;
  price: number | null; // y per x
  activeX: string;
  activeY: string;
  tokenX: string;
  tokenY: string;
  receiptResource: string;
  divisibilityX: number;
  divisibilityY: number;
  binsAbove: [number, string][]; // (tick, amount_x)
  binsBelow: [number, string][]; // (tick, amount_y)
};

export async function fetchShapeLive(component: string): Promise<ShapeLive> {
  const man = [
    `CALL_METHOD Address("${component}") "get_bin_span";`,
    `CALL_METHOD Address("${component}") "get_active_tick";`,
    `CALL_METHOD Address("${component}") "get_price";`,
    `CALL_METHOD Address("${component}") "get_active_amounts";`,
    `CALL_METHOD Address("${component}") "get_token_x_address";`,
    `CALL_METHOD Address("${component}") "get_token_y_address";`,
    `CALL_METHOD Address("${component}") "get_liquidity_receipt_address";`,
    `CALL_METHOD Address("${component}") "get_bins_above" Enum<0u8>() Enum<0u8>() Enum<1u8>(40u32);`,
    `CALL_METHOD Address("${component}") "get_bins_below" Enum<0u8>() Enum<0u8>() Enum<1u8>(40u32);`,
  ].join('\n');
  const res = await previewManifest(man);
  if (res.receipt.status !== 'Succeeded') throw new Error(res.receipt.error_message ?? 'preview failed');
  const out = res.receipt.output!.map((o) => o.programmatic_json);
  const opt = (f: ProgrammaticField) => (f.variant_id === '1' ? f.fields![0] : null);
  const active = opt(out[3]);
  const tokenX = String(out[4].value), tokenY = String(out[5].value);
  const vec = (f: ProgrammaticField): [number, string][] => ((f as unknown as { elements?: { fields: { value: string }[] }[] }).elements ?? []).map((e) => [Number(e.fields[0].value), String(e.fields[1].value)]);
  const div = await gatewayPost<{ items: { address: string; details?: { divisibility?: number } }[] }>('/state/entity/details', {
    addresses: [tokenX, tokenY], aggregation_level: 'Global',
  });
  const d = Object.fromEntries(div.items.map((i) => [i.address, i.details?.divisibility ?? 18]));
  return {
    binSpan: Number(out[0].value),
    currentTick: opt(out[1]) ? Number(opt(out[1])!.value) : null,
    price: opt(out[2]) ? Number(opt(out[2])!.value) : null,
    activeX: active ? String(active.fields![0].value) : '0',
    activeY: active ? String(active.fields![1].value) : '0',
    tokenX, tokenY,
    receiptResource: String(out[6].value),
    divisibilityX: d[tokenX], divisibilityY: d[tokenY],
    binsAbove: vec(out[7]),
    binsBelow: vec(out[8]),
  };
}

export type ShapePosition = { id: string; bins: { tick: number; x: string; y: string }[]; totalX: string; totalY: string };

/** The account's positions in this pool: receipt ids + per-bin redemption values (live preview). */
export async function fetchShapePositions(account: string, component: string, receiptResource: string): Promise<ShapePosition[]> {
  const page = await gatewayPost<{ items: { resource_address: string; vaults: { items: { items?: string[] }[] } }[] }>(
    '/state/entity/page/non-fungibles/',
    { address: account, aggregation_level: 'Vault', opt_ins: { non_fungible_include_nfids: true }, limit_per_page: 100 },
  );
  const ids = page.items.find((i) => i.resource_address === receiptResource)?.vaults.items.flatMap((v) => v.items ?? []) ?? [];
  if (!ids.length) return [];
  const man = ids.map((id) => `CALL_METHOD Address("${component}") "get_redemption_bin_values" NonFungibleLocalId("${assertNfId(id)}");`).join('\n');
  const res = await previewManifest(man);
  if (res.receipt.status !== 'Succeeded') throw new Error(res.receipt.error_message ?? 'preview failed');
  return ids.map((id, i) => {
    const f = res.receipt.output![i].programmatic_json as unknown as { elements?: { fields: { value: string }[] }[] };
    const bins = (f.elements ?? []).map((e) => ({ tick: Number(e.fields[0].value), x: String(e.fields[1].value), y: String(e.fields[2].value) }));
    const sum = (k: 'x' | 'y') => bins.reduce((a, b) => a + Number(b[k]), 0).toString();
    return { id, bins, totalX: sum('x'), totalY: sum('y') };
  });
}

// ---------- manifests

export function shapeAddLiquidityManifest(o: {
  account: string; component: string; tokenX: string; tokenY: string;
  amountX: Atto; amountY: Atto; positions: { tick: number; x: string; y: string }[];
  receipt?: { resource: string; id: string };
}) {
  const account = assertAddress(o.account, 'account_');
  const positions = o.positions.map((p) => `Tuple(${p.tick}u32, Decimal("${p.x}"), Decimal("${p.y}"))`).join(', ');
  return joinManifest([
    o.amountX > 0n ? withdraw(account, assertAddress(o.tokenX, 'resource_'), o.amountX) : '',
    o.amountY > 0n ? withdraw(account, assertAddress(o.tokenY, 'resource_'), o.amountY) : '',
    `TAKE_ALL_FROM_WORKTOP Address("${o.tokenX}") Bucket("bx");`,
    `TAKE_ALL_FROM_WORKTOP Address("${o.tokenY}") Bucket("by");`,
    ...(o.receipt
      ? [withdrawNonFungibles(account, o.receipt.resource, [o.receipt.id]), takeAll(o.receipt.resource, 'receipt'),
         `CALL_METHOD
    Address("${assertAddress(o.component, 'component_')}")
    "add_liquidity_to_receipt"
    Bucket("receipt")
    Bucket("bx")
    Bucket("by")
    Array<Tuple>(${positions})
;`]
      : [`CALL_METHOD
    Address("${assertAddress(o.component, 'component_')}")
    "add_liquidity"
    Bucket("bx")
    Bucket("by")
    Array<Tuple>(${positions})
;`]),
    depositAll(account),
  ]);
}

export function shapeRemoveAllManifest(o: { account: string; component: string; receiptResource: string; id: string; tokenX: string; minX: Atto; tokenY: string; minY: Atto }) {
  const account = assertAddress(o.account, 'account_');
  return joinManifest([
    withdrawNonFungibles(account, o.receiptResource, [o.id]),
    takeAll(o.receiptResource, 'receipt'),
    `CALL_METHOD
    Address("${assertAddress(o.component, 'component_')}")
    "remove_liquidity"
    Bucket("receipt")
;`,
    assertContains(o.tokenX, o.minX),
    assertContains(o.tokenY, o.minY),
    depositAll(account),
  ]);
}
export const toAttoSafe = (s: string) => { try { return toAtto(s); } catch { return 0n; } };
