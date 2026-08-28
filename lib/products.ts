/** The four CaviarNine products this site covers. Single source of truth for nav, landing and status. */
export type ProductId = 'hyperstake' | 'pools' | 'shape' | 'lsu-pool';
export type ProductStatus = 'live' | 'soon';

export type Product = {
  id: ProductId;
  name: string; // CaviarNine's product name, kept for recognition
  subtitle: string; // plain-language descriptor
  href: string;
  status: ProductStatus;
  statusLabel: string;
  blurb: string;
  spec: string; // docs path in the repo
  c9Path: string; // original CaviarNine route (for redirects / reference)
};

/**
 * Feature switch: comma-separated product ids in NEXT_PUBLIC_LIVE_PRODUCTS are fully enabled.
 * Default: only HyperStake. Inlined at build time — flipping requires a redeploy with the env var set,
 * e.g. NEXT_PUBLIC_LIVE_PRODUCTS=hyperstake,pools,shape,lsu-pool
 */
const LIVE = new Set((process.env.NEXT_PUBLIC_LIVE_PRODUCTS ?? 'hyperstake').split(',').map((s) => s.trim()));
/** Switchable feature ids: the four products plus the aggregator swap. */
export type SwitchId = ProductId | 'swap';
export const isLive = (id: SwitchId) => LIVE.has(id);

export const PRODUCTS: Product[] = [
  {
    id: 'hyperstake',
    name: 'HyperStake',
    subtitle: 'Instant stake & unstake',
    href: '/hyperstake',
    status: 'live',
    statusLabel: 'Live',
    blurb: 'Swap XRD ⇄ LSULP without the 7-day unstake wait, or provide LSULP/XRD liquidity and earn the swap fee.',
    spec: 'docs/HYPERSTAKE.md',
    c9Path: '/earn/hyper-stake',
  },
  {
    id: 'pools',
    name: 'Simple Pools',
    subtitle: 'Two-token pools',
    href: '/pools',
    status: LIVE.has('pools') ? 'live' : 'soon',
    statusLabel: LIVE.has('pools') ? 'Live' : 'Coming soon',
    blurb: 'Weighted two-token pools anyone can create. Provide both sides, earn the swap fee.',
    spec: 'docs/SIMPLE_POOL.md',
    c9Path: '/earn/simple-pool',
  },
  {
    id: 'shape',
    name: 'Shape Liquidity',
    subtitle: 'Concentrated positions',
    href: '/shape',
    status: LIVE.has('shape') ? 'live' : 'soon',
    statusLabel: LIVE.has('shape') ? 'Live' : 'Coming soon',
    blurb: 'Concentrated-liquidity pools. Your positions are NFTs in your wallet; fees accrue per position.',
    spec: 'docs/SHAPE_LIQUIDITY.md',
    c9Path: '/earn/shape-liquidity',
  },
  {
    id: 'lsu-pool',
    name: 'LSU Pool',
    subtitle: 'Liquid staking basket',
    href: '/lsu-pool',
    status: LIVE.has('lsu-pool') ? 'live' : 'soon',
    statusLabel: LIVE.has('lsu-pool') ? 'Live' : 'Coming soon',
    blurb: 'The validator basket behind LSULP. Deposit stake units, receive one token for the whole basket.',
    spec: 'docs/LSU_POOL.md',
    c9Path: '/earn/lsu-pool',
  },
];

export const productById = (id: ProductId) => PRODUCTS.find((p) => p.id === id)!;
