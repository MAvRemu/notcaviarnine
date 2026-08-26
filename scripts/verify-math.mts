/**
 * Verifies the TS swap-math port against on-ledger truth:
 *  1) get_info().price via Gateway preview must equal poolPrice() exactly.
 *  2) A real SwapEvent (pre-swap reserves + input) must reproduce output_amount.
 * Run: npx tsx scripts/verify-math.mts
 */
import { ADDRESSES, RESOURCES } from '../lib/radix/config';
import { previewManifest, streamTransactions, field } from '../lib/radix/gateway';
import { fromAtto, poolPrice, quoteSwap, toAtto, type PoolParams } from '../lib/hyperstake/math';

const info = await previewManifest(
  `CALL_METHOD Address("${ADDRESSES.hyperStake}") "get_info";`,
);
const f = info.receipt.output![0].programmatic_json.fields!;
const v = (i: number) => String(f[i].value);
const p: PoolParams = {
  reserveX: toAtto(v(3)),
  reserveY: toAtto(v(4)),
  oraclePrice: toAtto(v(5)),
  upperOffset: toAtto(v(6)),
  lowerOffset: toAtto(v(7)),
  fee: toAtto(v(8)),
  protocolFeeShare: toAtto(v(9)),
  treasuryFeeShare: toAtto(v(10)),
};
const onLedger = v(0);
const ours = fromAtto(poolPrice(p));
console.log('price on-ledger', onLedger);
console.log('price ours     ', ours, onLedger === ours ? '✓ EXACT' : '✗ MISMATCH');

// 2) replay recent swaps
const s = await streamTransactions({ emitters: [ADDRESSES.hyperStake], limit: 25, receiptEvents: true });
let ok = 0, n = 0;
for (const t of s.items) {
  for (const e of t.receipt?.events ?? []) {
    if (e.name !== 'SwapEvent' || e.emitter.entity?.entity_address !== ADDRESSES.hyperStake) continue;
    const g = (k: string) => field(e.data.fields, k)!;
    const xForY = g('input_resource') === RESOURCES.LSULP;
    const q = quoteSwap(
      {
        ...p,
        reserveX: toAtto(xForY ? g('input_reserve') : g('output_reserve')),
        reserveY: toAtto(xForY ? g('output_reserve') : g('input_reserve')),
        oraclePrice: toAtto(g('oracle_price')),
      },
      xForY ? 'x_for_y' : 'y_for_x',
      toAtto(g('input_amount')),
    );
    n++;
    const match = fromAtto(q.output) === g('output_amount');
    const feeMatch = fromAtto(q.liquidityFee) === g('liquidity_fee');
    if (match && feeMatch) ok++;
    else console.log('  diff', t.intent_hash.slice(0, 20), 'out', fromAtto(q.output), 'vs', g('output_amount'), '| fee', fromAtto(q.liquidityFee), 'vs', g('liquidity_fee'));
  }
}
console.log(`swap replay: ${ok}/${n} exact`);
