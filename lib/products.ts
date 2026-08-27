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
    status: 'soon',
    statusLabel: 'Coming soon',
    blurb: 'Weighted two-token pools anyone can create. Provide both sides, earn the swap fee.',
    spec: 'docs/SIMPLE_POOL.md',
    c9Path: '/earn/simple-pool',
  },
  {
    id: 'shape',
    name: 'Shape Liquidity',
    subtitle: 'Concentrated positions',
    href: '/shape',
    status: 'soon',
    statusLabel: 'Coming soon',
    blurb: 'Concentrated-liquidity pools. Your positions are NFTs in your wallet; fees accrue per position.',
    spec: 'docs/SHAPE_LIQUIDITY.md',
    c9Path: '/earn/shape-liquidity',
  },
  {
    id: 'lsu-pool',
    name: 'LSU Pool',
    subtitle: 'Liquid staking basket',
    href: '/lsu-pool',
    status: 'soon',
    statusLabel: 'Coming soon',
    blurb: 'The validator basket behind LSULP. Deposit stake units, receive one token for the whole basket.',
    spec: 'docs/LSU_POOL.md',
    c9Path: '/earn/lsu-pool',
  },
];

export const productById = (id: ProductId) => PRODUCTS.find((p) => p.id === id)!;
