/**
 * Token swaps via the Astrolescent aggregator (server-side only — the partner key stays here).
 * Astrolescent returns a ready-to-sign manifest; we validate it instruction-by-instruction and
 * tighten its minimum-output assert to the user's tolerance before it ever reaches the wallet.
 * Docs: docs.astrolescent.com → Infrastructure → API. Fee component set up by Astrolescent (Timan),
 * owner badge held by the operator; fees claimable at astrolescent.com/fees.
 */
import { unstable_cache } from 'next/cache';
import { ASTROLESCENT_FEE_COMPONENT } from '@/lib/radix/config';
import { fixIconUrl } from '@/lib/token-icons';

/** Our fee on aggregator swaps (0.1%). Astrolescent adds its own 0.1% — total user cost ~0.2%. */
export const SITE_SWAP_FEE = 0.001;

const BASE = 'https://api.astrolescent.com';

function partnerUrl(path: string) {
  const key = process.env.ASTROLESCENT_API_KEY;
  if (!key) throw new Error('ASTROLESCENT_API_KEY not configured');
  return `${BASE}/partner/${encodeURIComponent(key)}/${path}`;
}

export type SwapToken = { address: string; symbol: string; name: string; iconUrl?: string; divisibility: number; priceUsd?: number };

/** All tokens tradeable on Astrolescent (~740), cached for an hour. */
export const getSwapTokens = unstable_cache(fetchSwapTokens, ['astrolescent-tokens'], { revalidate: 3600, tags: ['swap-tokens'] });

async function fetchSwapTokens(): Promise<SwapToken[]> {
  const res = await fetch(partnerUrl('tokens'), { headers: { 'user-agent': 'notcaviarnine.com' }, cache: 'no-store' });
  if (!res.ok) throw new Error(`astrolescent tokens ${res.status}`);
  const raw = (await res.json()) as SwapToken[];
  return raw
    .filter((t) => t?.address?.startsWith('resource_rdx1') && t.symbol)
    .map((t) => ({ address: t.address, symbol: t.symbol, name: t.name ?? t.symbol, iconUrl: fixIconUrl(t.address, t.iconUrl || undefined), divisibility: t.divisibility ?? 18 }));
}

type RawSwap = {
  inputTokens: number;
  outputTokens: number;
  priceImpact: number;
  swapFee: string;
  manifest: string;
  routes: { pools: { type: string }[]; tokensIn: number }[];
};

export type SwapQuote = {
  outputTokens: number;
  /** Guaranteed minimum after our tolerance, as a decimal string (what the manifest asserts). */
  minOutput: string;
  priceImpact: number;
  /** Total fee taken inside the route, denominated in the output token. */
  swapFee: number;
  /** e.g. [{ via: 'Ociswap', share: 0.5 }] — plain names, aggregated per venue. */
  routes: { via: string; share: number }[];
  manifest: string;
};

const VENUES: [RegExp, string][] = [
  [/^Oci/i, 'Ociswap'],
  [/^Astro/i, 'Astrolescent'],
  [/^Defi|^Plaza/i, 'DefiPlaza'],
  [/^C9|Caviar|Quanta|Simple|Hyper|Lsu/i, 'CaviarNine'],
];
const venueName = (poolType: string) => VENUES.find(([re]) => re.test(poolType))?.[1] ?? poolType;

export async function fetchSwapQuote(o: {
  inputToken: string;
  outputToken: string;
  inputAmount: string; // human units, decimal string
  fromAddress: string; // the account the manifest withdraws from / deposits to
  slippageBps: number;
  outputDivisibility: number;
}): Promise<SwapQuote> {
  const res = await fetch(partnerUrl('swap'), {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'user-agent': 'notcaviarnine.com' },
    body: JSON.stringify({
      inputToken: o.inputToken,
      outputToken: o.outputToken,
      inputAmount: Number(o.inputAmount),
      fromAddress: o.fromAddress,
      feeComponent: ASTROLESCENT_FEE_COMPONENT,
      fee: SITE_SWAP_FEE,
    }),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`astrolescent swap ${res.status}`);
  const raw = (await res.json()) as RawSwap;
  if (!raw?.manifest || typeof raw.outputTokens !== 'number' || raw.outputTokens <= 0) throw new Error('No route found for this pair');

  validateManifest(raw.manifest, o.fromAddress);

  // Tighten the aggregator's fixed ~3% min-output guard to the user's tolerance.
  const dp = Math.min(18, Math.max(0, o.outputDivisibility));
  const minOutput = (raw.outputTokens * (1 - o.slippageBps / 10_000)).toFixed(dp).replace(/0+$/, '').replace(/\.$/, '') || '0';
  const manifest = tightenAssert(raw.manifest, o.outputToken, minOutput);

  const totalIn = raw.routes.reduce((s, r) => s + (r.tokensIn || 0), 0) || 1;
  const shares = new Map<string, number>();
  for (const r of raw.routes) {
    const via = venueName(r.pools[0]?.type ?? '?');
    shares.set(via, (shares.get(via) ?? 0) + (r.tokensIn || 0) / totalIn);
  }

  return {
    outputTokens: raw.outputTokens,
    minOutput,
    priceImpact: raw.priceImpact,
    swapFee: Number(raw.swapFee) || 0,
    routes: [...shares.entries()].map(([via, share]) => ({ via, share })).sort((a, b) => b.share - a.share),
    manifest,
  };
}

/* ---------------------------------- manifest safety ---------------------------------- */

const ALLOWED = new Set(['CALL_METHOD', 'TAKE_FROM_WORKTOP', 'TAKE_ALL_FROM_WORKTOP', 'ASSERT_WORKTOP_CONTAINS', 'RETURN_TO_WORKTOP']);

/**
 * Defense-in-depth on a third-party manifest. Beyond this, the min-output assert (below) plus the
 * wallet's own preview are the real guarantees: nothing can siphon output without failing the assert.
 */
export function validateManifest(manifest: string, fromAddress: string) {
  const instructions = manifest.split(';').map((s) => s.trim()).filter(Boolean);
  let sawDepositBatch = false;
  for (const ins of instructions) {
    const op = ins.match(/^([A-Z_]+)/)?.[1];
    if (!op || !ALLOWED.has(op)) throw new Error(`Unexpected instruction in aggregator manifest: ${op ?? ins.slice(0, 30)}`);
    if (sawDepositBatch) throw new Error('Instructions after deposit_batch');
    if (op !== 'CALL_METHOD') continue;
    const address = ins.match(/Address\("([a-z0-9_]+)"\)/)?.[1];
    const method = ins.match(/Address\("[a-z0-9_]+"\)\s*"([a-z_0-9]+)"/)?.[1];
    if (!address || !method) throw new Error('Unparseable CALL_METHOD in aggregator manifest');
    if (address.startsWith('account_')) {
      if (address !== fromAddress) throw new Error('Manifest touches a different account');
      if (method === 'withdraw') continue;
      if (method === 'deposit_batch') {
        if (!ins.includes('ENTIRE_WORKTOP')) throw new Error('deposit_batch must return the entire worktop');
        sawDepositBatch = true;
        continue;
      }
      throw new Error(`Unexpected account method: ${method}`);
    }
    if (!address.startsWith('component_')) throw new Error(`Unexpected call target: ${address.slice(0, 20)}`);
  }
  if (!sawDepositBatch) throw new Error('Manifest does not deposit back to your account');
}

/** Replace (or insert) the min-output ASSERT_WORKTOP_CONTAINS right before the final deposit_batch. */
export function tightenAssert(manifest: string, outputToken: string, minOutput: string) {
  const assertIns = `ASSERT_WORKTOP_CONTAINS\n    Address("${outputToken}")\n    Decimal("${minOutput}")\n;`;
  const re = new RegExp(`ASSERT_WORKTOP_CONTAINS\\s+Address\\("${outputToken}"\\)\\s+Decimal\\("[\\d.]+"\\)\\s*;`);
  if (re.test(manifest)) return manifest.replace(re, assertIns);
  // No assert present — insert ours before the closing deposit_batch.
  const i = manifest.lastIndexOf('CALL_METHOD');
  if (i < 0 || !manifest.slice(i).includes('deposit_batch')) throw new Error('Cannot anchor min-output assert');
  return manifest.slice(0, i) + assertIns + '\n\n' + manifest.slice(i);
}
