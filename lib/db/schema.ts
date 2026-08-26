import {
  bigint,
  index,
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

/**
 * One row per HyperStake event (SwapEvent / LiquidityChangeEvent), indexed
 * from the Gateway transaction stream. Amounts are stored as numeric(40,18)
 * — Radix Decimal is 18 dp.
 */
export const events = pgTable(
  'hyperstake_events',
  {
    id: serial('id').primaryKey(),
    stateVersion: bigint('state_version', { mode: 'number' }).notNull(),
    eventIndex: integer('event_index').notNull(),
    intentHash: text('intent_hash').notNull(),
    timestamp: timestamp('timestamp', { withTimezone: true }).notNull(),
    kind: text('kind').$type<'swap' | 'add' | 'remove'>().notNull(),
    /** swap: input resource; liquidity: null */
    inputResource: text('input_resource'),
    outputResource: text('output_resource'),
    inputAmount: numeric('input_amount', { precision: 40, scale: 18 }),
    outputAmount: numeric('output_amount', { precision: 40, scale: 18 }),
    /** swap only: pre-swap reserves + oracle */
    inputReserve: numeric('input_reserve', { precision: 40, scale: 18 }),
    outputReserve: numeric('output_reserve', { precision: 40, scale: 18 }),
    oraclePrice: numeric('oracle_price', { precision: 40, scale: 18 }),
    liquidityFee: numeric('liquidity_fee', { precision: 40, scale: 18 }),
    protocolFee: numeric('protocol_fee', { precision: 40, scale: 18 }),
    treasuryFee: numeric('treasury_fee', { precision: 40, scale: 18 }),
    /** liquidity fee expressed in XRD (LSULP fees × oracle) */
    liquidityFeeXrd: numeric('liquidity_fee_xrd', { precision: 40, scale: 18 }),
    /** liquidity only (signed: negative on remove) */
    amountLp: numeric('amount_lp', { precision: 40, scale: 18 }),
    amountLsulp: numeric('amount_lsulp', { precision: 40, scale: 18 }),
    amountXrd: numeric('amount_xrd', { precision: 40, scale: 18 }),
    /** TVL in XRD right after the event, when derivable (swap only). */
    tvlXrdAfter: numeric('tvl_xrd_after', { precision: 40, scale: 18 }),
  },
  (t) => [
    uniqueIndex('hs_events_tx_idx').on(t.intentHash, t.eventIndex),
    index('hs_events_ts_idx').on(t.timestamp),
    index('hs_events_sv_idx').on(t.stateVersion),
  ],
);

export const indexerState = pgTable('hyperstake_indexer_state', {
  id: integer('id').primaryKey(),
  lastStateVersion: bigint('last_state_version', { mode: 'number' }).notNull(),
  lastRunAt: timestamp('last_run_at', { withTimezone: true }).notNull(),
  lastError: text('last_error'),
});
