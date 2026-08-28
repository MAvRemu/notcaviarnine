import { fromAtto, toAtto, type Atto } from '@/lib/hyperstake/math';

/** Format an atto BigInt (or 18-dp string) for display. */
export function fmt(v: Atto | string | null | undefined, opts: { dp?: number; compact?: boolean; sign?: boolean } = {}): string {
  if (v === null || v === undefined) return '—';
  const a = typeof v === 'string' ? toAtto(v) : v;
  const dp = opts.dp ?? 2;
  const neg = a < 0n;
  const abs = neg ? -a : a;
  const n = Number(fromAtto(abs));
  let s: string;
  if (opts.compact && n >= 1_000_000) s = (n / 1_000_000).toFixed(2) + 'M';
  else if (opts.compact && n >= 10_000) s = (n / 1_000).toFixed(1) + 'K';
  else s = n.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp });
  return (neg ? '−' : opts.sign ? '+' : '') + s;
}

/** Percentage from an 18-dp ratio string/atto (e.g. "-0.0132" → "−1.32 %"). */
export function pct(v: Atto | string | null | undefined, dp = 2, sign = true): string {
  if (v === null || v === undefined) return '—';
  const a = typeof v === 'string' ? toAtto(v) : v;
  const n = Number(fromAtto(a)) * 100;
  return `${sign && n > 0 ? '+' : ''}${n.toFixed(dp)}%`.replace('-', '−');
}

export const shortAddr = (a: string, n = 6) => `${a.slice(0, a.indexOf('1') + 1 + n)}…${a.slice(-n)}`;

export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return '—';
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${Math.floor(s)}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

/** Clamp user input to ≤18 dp and strip junk; returns '' if not parseable. */
export function sanitizeDecimalInput(s: string, maxDp = 18): string {
  const cleaned = s.replace(/,/g, '.').replace(/[^\d.]/g, '');
  const [i, ...rest] = cleaned.split('.');
  const f = rest.join('').slice(0, Math.max(0, maxDp));
  return rest.length && maxDp > 0 ? `${i || '0'}.${f}` : i;
}

/** Minutes elapsed since an ISO timestamp (null if missing). Kept out of render bodies for purity lint. */
export function minutesSince(iso: string | null | undefined): number | null {
  if (!iso) return null;
  return (Date.now() - new Date(iso).getTime()) / 60000;
}

/**
 * Format a plain JS number by magnitude: ≥1e12 → "n/a" (dust/garbage), ≥1e6 compact, ≥1,000 no decimals,
 * ≥1 two decimals, <1 four significant digits. Used for token amounts and prices from float sources.
 */
export function fmtNum(n: number | null | undefined, opts: { compact?: boolean } = {}): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return '—';
  const a = Math.abs(n);
  if (a >= 1e12) return 'n/a';
  if (opts.compact && a >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (opts.compact && a >= 1e4) return (n / 1e3).toFixed(1) + 'K';
  if (a >= 1000) return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (a >= 1) return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (a === 0) return '0';
  return n.toLocaleString('en-US', { maximumSignificantDigits: 4 });
}
