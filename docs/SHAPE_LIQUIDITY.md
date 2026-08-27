# Shape Liquidity — placeholder (research not started)

> Status: **placeholder**. Basic description and research plan only. Will be replaced by a full protocol spec
> (`SHAPE_LIQUIDITY.md`) and product spec (`SHAPE_LIQUIDITY_UX.md`) in the same format as the HyperStake and Simple Pool docs.

## What it is (from public docs and repo names — unverified on-ledger)

CaviarNine's concentrated-liquidity DEX, branded **Shape Liquidity**; the Scrypto packages are `quantaswap` and
`quantaswap_factory`. LPs deposit into a chosen price **shape** (a range or a custom distribution across price bins) and
receive an **NFT position** rather than a fungible LP token. Fees accrue per position and are claimable. Pools are created via a
factory component (so discovery goes through the factory, unlike Simple Pools which use package-level events).
Original UI: https://www.caviarnine.io/earn/shape-liquidity — likely the largest TVL of CaviarNine's LP products.

## Why it matters more than Simple Pools
- Positions are NFTs with locked capital in specific ranges: after CaviarNine's site goes withdraw-only, LPs still need a UI to
  **claim fees, remove positions, and (ideally) re-shape** — this is the product with the most "stuck user" risk.
- Concentrated liquidity has out-of-range positions that earn nothing; users need visibility.

## Research plan (same rigour as HyperStake / Simple Pools)
1. Source: `caviarnine-scrypto/quantaswap*` — blueprint interface, events, NFT data schema, tick/bin math, fee accounting,
   roles, owner powers. Port the math to TypeScript only if quotes are needed client-side; otherwise rely on Gateway preview.
2. Ledger: factory address and all pools (census: count, pairs, fee tiers, TVL, active positions), owner badge, role rules,
   NFT resource per pool, position data layout, metadata.
3. Operations: how a position is opened/added/removed/claimed on-ledger; what happens to positions if the owner pauses pools;
   whether any keeper is needed (probably none — fully on-ledger).
4. Reads: position NFT data via Gateway (`/state/non-fungible/data`), pool state via component state, fees via preview of
   the claim/getter methods; events for volume/APR per pool.
5. Volume / APR: from swap events per pool, like Simple Pools; position-level APR from fees claimable vs position value.
6. Original UI: archive screenshots into `docs/reference/` and describe (shapes, range picker, position list).

## Product scope options (to decide after research)
- **Minimum (withdraw-safe)**: list my positions → claim fees → remove liquidity. This is the launch-critical piece.
- **Standard**: + add liquidity into an existing position / open a new position with preset shapes (concentrated, wide, one-sided).
- **Full**: + custom shape editor and pool creation via the factory. Probably not for us.

## Open questions for Marius
- Priority vs LSU Pool? (Shape Liquidity likely has far more user capital at stake.)
- Scope: minimum / standard / full?
- Should we index all Shape pools or only those with positions from connected wallets plus the top N by TVL?
