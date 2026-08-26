import { and, desc, gte, sql } from 'drizzle-orm';
import { db, hasDb } from '@/lib/db/client';
import { events } from '@/lib/db/schema';
import { ADDRESSES } from '@/lib/radix/config';
import { streamTransactions } from '@/lib/radix/gateway';
import { decodeHyperStakeEvents, type HyperStakeEvent } from '@/lib/indexer/events';
import { toAtto, fromAtto, E18 } from '@/lib/hyperstake/math';

export type FeeStats = {
  source: 'db' | 'gateway';
  windowDays: number;
  /** actual covered window (gateway fallback may cover less) */
  coveredHours: number;
  swaps: number;
  volumeXrd: string;
  liquidityFeesXrd: string;
  /** annualised: fees / tvl × 365/days */
  aprLp: string | null;
};

/**
 * Realised LP fee APR over a window. Uses the DB when configured; otherwise
 * pulls the last ~500 swaps straight from the Gateway (covers ≥ 24h at
 * current activity) and annualises whatever window that spans.
 */
export async function getFeeStats(tvlXrd: string, windowDays = 7): Promise<FeeStats> {
  const since = new Date(Date.now() - windowDays * 86400_000);
  let rows: Pick<HyperStakeEvent, 'kind' | 'timestamp' | 'liquidityFeeXrd' | 'inputAmount' | 'inputResource' | 'oraclePrice'>[] = [];
  let source: FeeStats['source'] = 'gateway';

  if (hasDb()) {
    const d = db()!;
    const r = await d
      .select({
        kind: events.kind,
        timestamp: events.timestamp,
        liquidityFeeXrd: events.liquidityFeeXrd,
        inputAmount: events.inputAmount,
        inputResource: events.inputResource,
        oraclePrice: events.oraclePrice,
      })
      .from(events)
      .where(and(gte(events.timestamp, since), sql`${events.kind} = 'swap'`))
      .orderBy(desc(events.timestamp));
    rows = r.map((x) => ({
      kind: x.kind,
      timestamp: x.timestamp.toISOString(),
      liquidityFeeXrd: x.liquidityFeeXrd ?? '0',
      inputAmount: x.inputAmount ?? '0',
      inputResource: x.inputResource ?? undefined,
      oraclePrice: x.oraclePrice ?? '0',
    }));
    source = 'db';
  }
  if (!rows.length) {
    // Gateway fallback: up to 5 pages descending.
    let cursor: string | undefined;
    for (let i = 0; i < 5; i++) {
      const res = await streamTransactions({ emitters: [ADDRESSES.hyperStake], limit: 100, cursor, receiptEvents: true });
      const evs = res.items.flatMap(decodeHyperStakeEvents).filter((e) => e.kind === 'swap');
      rows.push(...evs);
      const oldest = res.items[res.items.length - 1];
      if (!res.next_cursor || !oldest || new Date(oldest.round_timestamp) < since) break;
      cursor = res.next_cursor;
    }
    rows = rows.filter((r) => new Date(r.timestamp) >= since);
    source = 'gateway';
  }

  let fees = 0n, volume = 0n;
  let oldest = Date.now();
  for (const r of rows) {
    fees += toAtto(r.liquidityFeeXrd ?? '0');
    const inp = toAtto(r.inputAmount ?? '0');
    volume += r.inputResource && r.inputResource.endsWith('xxfmf') /* LSULP */ ? (inp * toAtto(r.oraclePrice ?? '0')) / E18 : inp;
    oldest = Math.min(oldest, new Date(r.timestamp).getTime());
  }
  const coveredHours = rows.length ? (Date.now() - oldest) / 3600_000 : 0;
  const tvl = toAtto(tvlXrd);
  const apr =
    tvl > 0n && coveredHours > 1
      ? fromAtto((fees * E18 * BigInt(Math.round((365 * 24 * 1000) / coveredHours))) / tvl / 1000n)
      : null;
  return {
    source,
    windowDays,
    coveredHours: Math.round(coveredHours * 10) / 10,
    swaps: rows.length,
    volumeXrd: fromAtto(volume),
    liquidityFeesXrd: fromAtto(fees),
    aprLp: apr,
  };
}
