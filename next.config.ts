import type { NextConfig } from 'next';

/**
 * Security headers. CSP is the "pragmatic" profile (decision 2026-08-27): strict everywhere except script-src,
 * which allows 'self' + inline (Next hydration) + Vercel Analytics. Fonts are self-hosted by next/font, so no font hosts.
 * A stricter nonce-based policy is sent report-only to observe violations before enforcing.
 */
const CONNECT = [
  "'self'",
  // Vercel's preview-deployment feedback toolbar (not injected on production)
  'https://vercel.live',
  'wss://*.pusher.com',
  'https://mainnet.radixdlt.com',
  'https://radix-connect-relay.radixdlt.com',
  'https://api.astrolescent.com',
  'https://va.vercel-scripts.com',
  'https://vitals.vercel-insights.com',
].join(' ');
const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "frame-src https://vercel.live",
  `connect-src ${CONNECT}`,
  "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com https://vercel.live",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' https: data: blob:",
  "font-src 'self' data:",
  "manifest-src 'self'",
  "worker-src 'self' blob:",
  'upgrade-insecure-requests',
].join('; ');
const CSP_REPORT_ONLY = [
  "default-src 'self'",
  "script-src 'self' https://va.vercel-scripts.com https://vercel.live",
  `connect-src ${CONNECT}`,
  "img-src 'self' https: data: blob:",
  "style-src 'self' 'unsafe-inline'",
  "frame-ancestors 'none'",
  'report-uri /api/csp-report',
].join('; ');

const SECURITY_HEADERS = [
  { key: 'Content-Security-Policy', value: CSP },
  { key: 'Content-Security-Policy-Report-Only', value: CSP_REPORT_ONLY },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: '/(.*)', headers: SECURITY_HEADERS }];
  },
  async redirects() {
    return [
      { source: '/app', destination: '/hyperstake', permanent: true },
      // CaviarNine's URL patterns → ours
      { source: '/earn/hyper-stake', destination: '/hyperstake', permanent: false },
      { source: '/earn/hyperstake', destination: '/hyperstake', permanent: false },
      { source: '/earn/simple-pool', destination: '/pools', permanent: false },
      { source: '/earn/simple-pool/:address', destination: '/pools/:address', permanent: false },
      { source: '/earn/shape-liquidity', destination: '/shape', permanent: false },
      { source: '/earn/shape-liquidity/:path*', destination: '/shape', permanent: false },
      { source: '/earn/lsu-pool', destination: '/lsu-pool', permanent: false },
    ];
  },
};

export default nextConfig;
