/**
 * Network + on-ledger addresses. Mainnet only for launch 1.
 *
 * Every address below was read live from the Radix Gateway on 2026-08-26
 * (HyperStake component state → pool, LSU pool, fee vaults; LSU pool state →
 * token validator). Do NOT derive these from the Scrypto repo's build.rs
 * fallbacks — they are placeholders.
 */

export const NETWORK_ID = Number(process.env.NEXT_PUBLIC_RADIX_NETWORK_ID ?? 1);
export const GATEWAY_URL =
  process.env.NEXT_PUBLIC_RADIX_GATEWAY_URL ?? 'https://mainnet.radixdlt.com';
export const DAPP_DEFINITION_ADDRESS =
  process.env.NEXT_PUBLIC_DAPP_DEFINITION_ADDRESS ??
  'account_rdx128uzjf2yykk23z0yvenydh32k8svkxuzqaecvhmz4czyu9h7leqr0q';

export const ADDRESSES = {
  /** HyperStake swap component (blueprint HyperStake). */
  hyperStake:
    'component_rdx1cpz0zcyyl2fvtc5wdvfjjl3w0mjcydm4fefymudladklf6rn5gdwtf',
  /** Native TwoResourcePool holding the real LSULP/XRD reserves. */
  hyperStakePool:
    'pool_rdx1chmckjpr0ks5lk6h7mqvmrw56wt4w6tsuy6n2jhd8fhr8vc5en5e90',
  /** CaviarNine LSU Pool (issues LSULP; oracle source). */
  lsuPool:
    'component_rdx1cppy08xgra5tv5melsjtj79c0ngvrlmzl8hhs7vwtzknp9xxs63mfp',
  /** LSU Token Validator (active-set allowlist, owner-controlled). */
  lsuTokenValidator:
    'component_rdx1cz7h8j68esue87jmq4mfqpnx5403jujadewlqcn5cqxew80fwd5fgd',
  /** CaviarNine fee vaults (receives protocol + treasury fee share). */
  feeVaults:
    'component_rdx1cpa08p8gkvg966cvqglmtcfknp45ex5rtj69j3dd422sqcvtg6cpcn',
  /** C9 Admin Badge — owner of HyperStake and the LSU Token Validator. */
  c9AdminBadge:
    'resource_rdx1nglan7djf0stpdm5pf3hzctlha366l3s5xllu9z04z6puctdg200m4',
  /** CaviarNine's dApp definition account. */
  c9DappDefinition:
    'account_rdx12yrjl8m5a4cn9aap2ez2lmvw6g64zgyqnlj4gvugzstye4gnj6assc',
} as const;

export const RESOURCES = {
  XRD: 'resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd',
  LSULP: 'resource_rdx1thksg5ng70g9mmy9ne7wz0sc7auzrrwy7fmgcxzel2gvp8pj0xxfmf',
  HLP: 'resource_rdx1th0f0khh9g8hwa0qtxsarmq8y7yeekjnh4n74494d5zf4k5vw8qv6m',
} as const;

export type ResourceSymbol = keyof typeof RESOURCES;

export const TOKENS: Record<
  ResourceSymbol,
  { symbol: ResourceSymbol; name: string; address: string; icon: string }
> = {
  XRD: { symbol: 'XRD', name: 'Radix', address: RESOURCES.XRD, icon: '/icons/xrd.png' },
  LSULP: {
    symbol: 'LSULP',
    name: 'LSU Pool LP',
    address: RESOURCES.LSULP,
    icon: '/icons/lsulp.png',
  },
  HLP: {
    symbol: 'HLP',
    name: 'HyperStake LP',
    address: RESOURCES.HLP,
    icon: '/icons/hlp.png',
  },
};

export const symbolOf = (address: string): ResourceSymbol | undefined =>
  (Object.keys(RESOURCES) as ResourceSymbol[]).find((k) => RESOURCES[k] === address);

/** Radix Dashboard deep links. */
export const dashboardUrl = (address: string) =>
  address.startsWith('txid_')
    ? `https://dashboard.radixdlt.com/transaction/${address}`
    : `https://dashboard.radixdlt.com/${address.startsWith('account_') ? 'account' : address.startsWith('resource_') ? 'resource' : address.startsWith('pool_') ? 'pool' : 'component'}/${address}`;

export const LINKS = {
  scryptoRepo: 'https://github.com/caviarnine/caviarnine-scrypto',
  hyperStakeSource:
    'https://github.com/caviarnine/caviarnine-scrypto/blob/main/hyper_stake/hyper_stake/src/hyper_stake.rs',
  c9Docs: 'https://docs.caviarnine.com/products-caviar/hyperstake',
  c9Announcement: 'https://t.me/caviarxrd/70246',
  frontendRepo: 'https://github.com/MAvRemu/notcaviarnine',
} as const;
