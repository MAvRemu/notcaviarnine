import { ADDRESSES, RESOURCES } from '@/lib/radix/config';
import { field, type StreamTransaction } from '@/lib/radix/gateway';
import { dMul, fromAtto, toAtto } from '@/lib/hyperstake/math';

/** Normalised HyperStake event, decoded from a Gateway receipt. */
export type HyperStakeEvent = {
  stateVersion: number;
  eventIndex: number;
  intentHash: string;
  timestamp: string;
  kind: 'swap' | 'add' | 'remove';
  inputResource?: string;
  outputResource?: string;
  inputAmount?: string;
  outputAmount?: string;
  inputReserve?: string;
  outputReserve?: string;
  oraclePrice?: string;
  liquidityFee?: string;
  protocolFee?: string;
  treasuryFee?: string;
  liquidityFeeXrd?: string;
  amountLp?: string;
  amountLsulp?: string;
  amountXrd?: string;
  tvlXrdAfter?: string;
};

export function decodeHyperStakeEvents(tx: StreamTransaction): HyperStakeEvent[] {
  const out: HyperStakeEvent[] = [];
  if (tx.transaction_status !== 'CommittedSuccess') return out;
  (tx.receipt?.events ?? []).forEach((e, eventIndex) => {
    if (e.emitter.entity?.entity_address !== ADDRESSES.hyperStake) return;
    const g = (k: string) => field(e.data.fields, k);
    const base = {
      stateVersion: tx.state_version,
      eventIndex,
      intentHash: tx.intent_hash,
      timestamp: tx.round_timestamp,
    };
    if (e.name === 'SwapEvent') {
      const inputResource = g('input_resource')!;
      const oracle = toAtto(g('oracle_price')!);
      const liqFee = toAtto(g('liquidity_fee')!);
      const liqFeeXrd = inputResource === RESOURCES.LSULP ? dMul(liqFee, oracle) : liqFee;
      // reserves are pre-swap; post-swap ≈ in + used, out − output
      const inRes = toAtto(g('input_reserve')!) + toAtto(g('input_amount')!);
      const outRes = toAtto(g('output_reserve')!) - toAtto(g('output_amount')!);
      const [lsulp, xrd] = inputResource === RESOURCES.LSULP ? [inRes, outRes] : [outRes, inRes];
      out.push({
        ...base,
        kind: 'swap',
        inputResource,
        outputResource: g('output_resource'),
        inputAmount: g('input_amount'),
        outputAmount: g('output_amount'),
        inputReserve: g('input_reserve'),
        outputReserve: g('output_reserve'),
        oraclePrice: g('oracle_price'),
        liquidityFee: g('liquidity_fee'),
        protocolFee: g('protocol_fee'),
        treasuryFee: g('treasury_fee'),
        liquidityFeeXrd: fromAtto(liqFeeXrd),
        tvlXrdAfter: fromAtto(xrd + dMul(lsulp, oracle)),
      });
    } else if (e.name === 'LiquidityChangeEvent') {
      const lp = g('amount_lp')!;
      out.push({
        ...base,
        kind: lp.startsWith('-') ? 'remove' : 'add',
        amountLp: lp,
        amountLsulp: g('amount_x'),
        amountXrd: g('amount_y'),
      });
    }
  });
  return out;
}
