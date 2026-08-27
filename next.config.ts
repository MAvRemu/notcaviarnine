import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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
