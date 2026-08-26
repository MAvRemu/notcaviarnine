import { desc, sql } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { events, indexerState } from '@/lib/db/schema';
import { ADDRESSES } from '@/lib/radix/config';
import { streamTransactions } from '@/lib/radix/gateway';
import { decodeHyperStakeEvents } from './events';

const STATE_ID = 1;
const PAGE = 100;
const MAX_PAGES_PER_RUN = 30; // ≈ 3000 txs; enough to catch up a day of activity
const BACKFILL_DAYS = 30;

export type IndexRunResult = {
  ok: boolean;
  inserted: number;
  pages: number;
  fromStateVersion: number;
  toStateVersion: number;
  caughtUp: boolean;
  error?: string;
};

/**
 * Incremental indexer. Walks the Gateway stream *ascending* from the last
 * indexed state version, decoding HyperStake events into Postgres. On a
 * fresh DB it starts BACKFILL_DAYS ago (found by a binary-ish probe on the
 * descending stream). Idempotent: (intent_hash, event_index) is unique.
 */
export async function runIndexer(): Promise<IndexRunResult> {
  const d = db();
  if (!d) return { ok: false, inserted: 0, pages: 0, fromStateVersion: 0, toStateVersion: 0, caughtUp: false, error: 'no DATABASE_URL' };

  const [state] = await d.select().from(indexerState).where(sql`${indexerState.id} = ${STATE_ID}`);
  let from = state?.lastStateVersion ?? 0;
  if (!from) from = await findBackfillStart();

  let inserted = 0, pages = 0, cursor: string | undefined, last = from, caughtUp = false;
  try {
    while (pages < MAX_PAGES_PER_RUN) {
      const res = await streamTransactions({
        emitters: [ADDRESSES.hyperStake],
        order: 'Asc',
        fromStateVersion: from + 1,
        cursor,
        limit: PAGE,
        receiptEvents: true,
      });
      pages++;
      const rows = res.items.flatMap(decodeHyperStakeEvents).map((e) => ({
        stateVersion: e.stateVersion,
        eventIndex: e.eventIndex,
        intentHash: e.intentHash,
        timestamp: new Date(e.timestamp),
        kind: e.kind,
        inputResource: e.inputResource,
        outputResource: e.outputResource,
        inputAmount: e.inputAmount,
        outputAmount: e.outputAmount,
        inputReserve: e.inputReserve,
        outputReserve: e.outputReserve,
        oraclePrice: e.oraclePrice,
        liquidityFee: e.liquidityFee,
        protocolFee: e.protocolFee,
        treasuryFee: e.treasuryFee,
        liquidityFeeXrd: e.liquidityFeeXrd,
        amountLp: e.amountLp,
        amountLsulp: e.amountLsulp,
        amountXrd: e.amountXrd,
        tvlXrdAfter: e.tvlXrdAfter,
      }));
      if (rows.length) {
        const r = await d.insert(events).values(rows).onConflictDoNothing().returning({ id: events.id });
        inserted += r.length;
      }
      if (res.items.length) last = Math.max(last, res.items[res.items.length - 1].state_version);
      if (!res.next_cursor) { caughtUp = true; break; }
      cursor = res.next_cursor;
    }
    await d
      .insert(indexerState)
      .values({ id: STATE_ID, lastStateVersion: last, lastRunAt: new Date(), lastError: null })
      .onConflictDoUpdate({ target: indexerState.id, set: { lastStateVersion: last, lastRunAt: new Date(), lastError: null } });
    return { ok: true, inserted, pages, fromStateVersion: from, toStateVersion: last, caughtUp };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await d
      .insert(indexerState)
      .values({ id: STATE_ID, lastStateVersion: last, lastRunAt: new Date(), lastError: msg })
      .onConflictDoUpdate({ target: indexerState.id, set: { lastStateVersion: last, lastRunAt: new Date(), lastError: msg } });
    return { ok: false, inserted, pages, fromStateVersion: from, toStateVersion: last, caughtUp, error: msg };
  }
}

/** Find a state version ≈ BACKFILL_DAYS ago by probing the descending stream. */
async function findBackfillStart(): Promise<number> {
  const target = Date.now() - BACKFILL_DAYS * 86400_000;
  let cursor: string | undefined;
  let sv = 0;
  // Walk back page by page (~100 txs each). Activity is a few hundred/day →
  // at most a few dozen pages for 30 days.
  for (let i = 0; i < 200; i++) {
    const res = await streamTransactions({ emitters: [ADDRESSES.hyperStake], order: 'Desc', cursor, limit: PAGE });
    const lastItem = res.items[res.items.length - 1];
    if (!lastItem) break;
    sv = lastItem.state_version;
    if (new Date(lastItem.round_timestamp).getTime() < target || !res.next_cursor) break;
    cursor = res.next_cursor;
  }
  return Math.max(0, sv - 1);
}

export async function indexerStatus() {
  const d = db();
  if (!d) return null;
  const [s] = await d.select().from(indexerState).orderBy(desc(indexerState.id)).limit(1);
  return s ?? null;
}
