'use client';

import { track } from '@vercel/analytics';

/**
 * Product analytics. Anonymous by design: no wallet addresses, no exact amounts (magnitude buckets only).
 * Sent to Vercel Web Analytics (custom events) and mirrored to our own /api/event so they can be queried in the DB.
 */
export type EventName =
  | 'wallet_connected'
  | 'tab_selected'
  | 'tx_started'          // user pressed the action button
  | 'tx_preview_failed'   // Gateway preview rejected the manifest
  | 'tx_wallet_opened'    // manifest handed to the wallet
  | 'tx_rejected'         // wallet returned an error / user declined
  | 'tx_committed';       // wallet returned a transaction id

export type EventProps = {
  product?: 'hyperstake' | 'pools' | 'shape' | 'lsu-pool' | 'swap';
  action?: 'swap' | 'add' | 'remove';
  direction?: 'XRD→LSULP' | 'LSULP→XRD';
  /** token pair for aggregator swaps, e.g. "XRD→ASTRL" */
  pair?: string;
  /** order of magnitude of the XRD-equivalent size, e.g. "1k-10k" */
  size?: string;
  reason?: string;
};

export function sizeBucket(xrd: number): string {
  if (!Number.isFinite(xrd) || xrd <= 0) return '0';
  if (xrd < 100) return '<100';
  if (xrd < 1_000) return '100-1k';
  if (xrd < 10_000) return '1k-10k';
  if (xrd < 100_000) return '10k-100k';
  if (xrd < 1_000_000) return '100k-1M';
  return '>1M';
}

export function trackEvent(name: EventName, props: EventProps = {}) {
  try {
    track(name, props as Record<string, string>);
  } catch {}
  try {
    void fetch('/api/event', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name, props }), keepalive: true });
  } catch {}
}
