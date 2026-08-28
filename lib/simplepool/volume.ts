/**
 * 7-day swap volume per Simple Pool, read straight from the Gateway transaction stream —
 * no DB. The stream can only be filtered per entity (max 10 per query incl. kind_filter,
 * so we omit that one), so pools are scanned in batches of 10 emitters; SwapEvents are
 * attributed to their emitting pool and the input side is valued in XRD via the price table.
 * Wrapped in a 1 h Data Cache entry (lib/cached.ts), so the Gateway cost is paid once an hour.
 */
import { streamTransactions, field, type ProgrammaticField } from '@/lib/radix/gateway';
import { getPrices } from '@/lib/prices/astrolescent';

export type PoolVolume = {
  volume7dXrd: number;
  swaps7d: number;
  /** true when the page cap was hit — the number is a lower bound */
  capped: boolean;
};

const BATCH = 10;
const MAX_PAGES = 6; // 600 swap txs per 10 pools per week before we call it "+"
const CONCURRENCY = 4;

export async function getSimplePoolVolumes(components: string[]): Promise<Record<string, PoolVolume>> {
  const since = new Date(Date.now() - 7 * 864e5).toISOString();
  const prices = await getPrices().catch(() => null);
  const inSet = new Set(components);
  const out: Record<string, PoolVolume> = {};
  for (const c of components) out[c] = { volume7dXrd: 0, swaps7d: 0, capped: false };

  const batches: string[][] = [];
  for (let i = 0; i < components.length; i += BATCH) batches.push(components.slice(i, i + BATCH));

  const run = async (batch: string[]) => {
    let cursor: string | undefined;
    let pages = 0;
    do {
      const res = await streamTransactions({
        emitters: batch,
        fromTimestamp: since,
        order: 'Asc',
        receiptEvents: true,
        omitKindFilter: true,
        cursor,
      });
      for (const it of res.items) {
        if (it.transaction_status !== 'CommittedSuccess') continue;
        for (const e of it.receipt?.events ?? []) {
          if (e.name !== 'SwapEvent') continue;
          const emitter = e.emitter?.entity?.entity_address;
          if (!emitter || !inSet.has(emitter)) continue;
          const f = e.data?.fields as ProgrammaticField[] | undefined;
          const inRes = field(f, 'input_resource');
          const outRes = field(f, 'output_resource');
          const inAmt = Number(field(f, 'input_amount') ?? 0);
          const outAmt = Number(field(f, 'output_amount') ?? 0);
          const pIn = inRes ? prices?.get(inRes)?.priceXrd : undefined;
          const pOut = outRes ? prices?.get(outRes)?.priceXrd : undefined;
          const xrd = pIn ? inAmt * pIn : pOut ? outAmt * pOut : 0;
          out[emitter].volume7dXrd += xrd;
          out[emitter].swaps7d += 1;
        }
      }
      cursor = res.next_cursor;
      pages += 1;
    } while (cursor && pages < MAX_PAGES);
    if (cursor) for (const c of batch) out[c].capped = true;
  };

  // limited-concurrency worker pool over the batches
  let i = 0;
  await Promise.all(
    [...Array(Math.min(CONCURRENCY, batches.length))].map(async () => {
      while (i < batches.length) await run(batches[i++]);
    }),
  );
  return out;
}
