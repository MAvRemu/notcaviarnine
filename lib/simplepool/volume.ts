/**
 * 7-day swap volume per Simple Pool, read straight from the Gateway transaction stream — no DB.
 *
 * One query per pool: `event_global_emitters_filter` with multiple addresses is AND, not OR
 * (verified 2026-08-28 — a batch of two returns only txs where BOTH emitted), so batching is
 * impossible. Note also that `affected_global_entities` does NOT include the swap component on a
 * swap (its vaults live in the native pool, so its own state never changes) — the emitter filter
 * is the only reliable handle. SwapEvent input sides are valued in XRD via the price table.
 * Wrapped in a 1 h Data Cache entry (lib/cached.ts), so the ~80-query cost is paid once an hour.
 */
import { streamTransactions, field, type ProgrammaticField } from '@/lib/radix/gateway';
import { getPrices } from '@/lib/prices/astrolescent';

export type PoolVolume = {
  volume7dXrd: number;
  swaps7d: number;
  /** true when the page cap was hit — the number is a lower bound */
  capped: boolean;
};

const MAX_PAGES = 5; // 500 swap txs per pool per week before we call it "+"
const CONCURRENCY = 2;
const SPACING_MS = 250; // stay well under the public Gateway's burst limit

/** The public Gateway rate-limits bursts (429). Back off and retry a few times. */
async function withBackoff<T>(fn: () => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (e) {
      const status = (e as { status?: number }).status;
      if (status !== 429 || attempt >= 3) throw e;
      await new Promise((r) => setTimeout(r, 800 * 2 ** attempt));
    }
  }
}

export async function getSimplePoolVolumes(components: string[]): Promise<Record<string, PoolVolume>> {
  const since = new Date(Date.now() - 7 * 864e5).toISOString();
  const prices = await getPrices().catch(() => null);
  const out: Record<string, PoolVolume> = {};
  for (const c of components) out[c] = { volume7dXrd: 0, swaps7d: 0, capped: false };

  const run = async (component: string) => {
    let cursor: string | undefined;
    let pages = 0;
    do {
      const res = await withBackoff(() =>
        streamTransactions({
          emitters: [component],
          fromTimestamp: since,
          order: 'Asc',
          receiptEvents: true,
          cursor,
        }),
      );
      for (const it of res.items) {
        if (it.transaction_status !== 'CommittedSuccess') continue;
        for (const e of it.receipt?.events ?? []) {
          if (e.name !== 'SwapEvent' || e.emitter?.entity?.entity_address !== component) continue;
          const f = e.data?.fields as ProgrammaticField[] | undefined;
          const inRes = field(f, 'input_resource');
          const outRes = field(f, 'output_resource');
          const inAmt = Number(field(f, 'input_amount') ?? 0);
          const outAmt = Number(field(f, 'output_amount') ?? 0);
          const pIn = inRes ? prices?.get(inRes)?.priceXrd : undefined;
          const pOut = outRes ? prices?.get(outRes)?.priceXrd : undefined;
          const xrd = pIn ? inAmt * pIn : pOut ? outAmt * pOut : 0;
          out[component].volume7dXrd += xrd;
          out[component].swaps7d += 1;
        }
      }
      cursor = res.next_cursor;
      pages += 1;
      await new Promise((r) => setTimeout(r, SPACING_MS));
    } while (cursor && pages < MAX_PAGES);
    if (cursor) out[component].capped = true;
  };

  // limited-concurrency worker pool over the pools
  let i = 0;
  await Promise.all(
    [...Array(Math.min(CONCURRENCY, components.length))].map(async () => {
      while (i < components.length) await run(components[i++]);
    }),
  );
  return out;
}
