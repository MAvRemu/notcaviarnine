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
export function sanitizeDecimalInput(s: string): string {
  const cleaned = s.replace(/,/g, '.').replace(/[^\d.]/g, '');
  const [i, ...rest] = cleaned.split('.');
  const f = rest.join('').slice(0, 18);
  return rest.length ? `${i || '0'}.${f}` : i;
}

/** Minutes elapsed since an ISO timestamp (null if missing). Kept out of render bodies for purity lint. */
export function minutesSince(iso: string | null | undefined): number | null {
  if (!iso) return null;
  return (Date.now() - new Date(iso).getTime()) / 60000;
}
