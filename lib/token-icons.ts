/**
 * Icon fixes for token metadata that points at dead hosts. Instabridge shut down and
 * assets.instabridge.io is NXDOMAIN (checked 2026-08-28), but its URLs are still baked into the
 * on-ledger metadata and Astrolescent's token list for the x-tokens. We serve local icons for the
 * majors (cryptocurrency-icons, MIT) and drop any URL on a dead host so browsers don't even try.
 */

const OVERRIDES: Record<string, string> = {
  // xUSDC
  resource_rdx1t4upr78guuapv5ept7d7ptekk9mqhy605zgms33mcszen8l9fac8vf: '/tokens/xusdc.svg',
  // xUSDT
  resource_rdx1thrvr3xfs2tarm2dl9emvs26vjqxu6mqvfgvqjne940jv0lnrrg7rw: '/tokens/xusdt.svg',
  // xwBTC
  resource_rdx1t580qxc7upat7lww4l2c4jckacafjeudxj5wpjrrct0p3e82sq4y75: '/tokens/xwbtc.svg',
  // xETH
  resource_rdx1th88qcj5syl9ghka2g9l7tw497vy5x6zaatyvgfkwcfe8n9jt2npww: '/tokens/xeth.svg',
};

const DEAD_HOSTS = ['assets.instabridge.io'];

/** Local override for known tokens; otherwise the given URL unless it points at a dead host. */
export function fixIconUrl(address: string, url: string | undefined): string | undefined {
  const override = OVERRIDES[address];
  if (override) return override;
  if (!url) return undefined;
  try {
    if (DEAD_HOSTS.includes(new URL(url).hostname)) return undefined;
  } catch {
    return undefined;
  }
  return url;
}
