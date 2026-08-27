# Simple Pools — product & UX specification

Scope for this iteration (decided 2026-08-27): **LP-only** (find a pool, add, remove), **existing pools only** (no creation),
realised volume/APR from indexed swaps, XRD-denominated values only for pools with an XRD leg, positions by scanning the
connected wallet. Protocol facts live in `docs/SIMPLE_POOL.md`. Visual rules live in `docs/DESIGN.md`.

## Decisions taken

| # | Question | Decision |
|---|---|---|
| 1 | Swap tab per pool? | No — LP only for now |
| 2 | Pool creation? | Not now; spec kept in the protocol doc for later |
| 3 | Volume / APR | Indexed `SwapEvent`s; APR = Σ(fee/reserve×weight) annualised, 7d and 30d, labelled "realised" |
| 4 | Value denomination | XRD only when the pool has an XRD leg; otherwise token amounts, no value |
| 5 | Positions | Scan connected account for known LP resources; no per-account indexing |
| 6 | Docs | Split: protocol vs product (this file) |
| 7 | Routes | `/pools` list → `/pools/<swap_component>` detail, mirroring CaviarNine's URL shape |

## Information architecture

```
/                 landing (adds a "Simple Pools" entry next to HyperStake)
/app              HyperStake (unchanged)
/pools            list · search · sort · filters · "your positions" strip
/pools/<address>  detail · add · remove · pool facts · activity
```
Header gets a product switch: **HyperStake · Simple Pools** (pill tabs, same wallet button).

## Screen 1 — `/pools`

**Header row**: eyebrow "Simple Pools · 229 pools · 70 with liquidity", one-line explainer
("Two-token pools anyone can create. Provide both sides, earn the swap fee."), summary tiles: total TVL (XRD), 7d volume (XRD),
pools with liquidity, your positions (count + XRD value, when connected).

**Your positions** (only when connected and non-empty): compact strip above the table — pool pair, LP amount, redeemable
X + Y, ≈ XRD, "Manage →".

**Search**: one input matching symbol, name, or any address (token, swap component, native pool, LP resource) — paste-friendly.

**Filters** (chips): `Has liquidity` (default on), `XRD pairs`, `Stablecoins`, `Show empty pools` (off). Fee tier chips
(0.05 % · 0.3 % · 1 % · 2 % · other).

**Table** (sortable; default sort TVL desc):

| Pool | Weights | Fee | TVL | 7d volume | Fee APR 7d | Your position | |
|---|---|---|---|---|---|---|---|
| icons + `hUSDC / XRD` | `50 / 50` | `0.05%` | `838k XRD` | `1.63M XRD` | `4.1%` | `—` or `12.3k XRD` | → |

- Pairs with **several pools** (44 today) are grouped: one row per pool, with a subtle "3 pools for this pair" tag, so
  users pick the fee tier consciously. Sort within a pair by TVL.
- Non-XRD pools show TVL/volume as `12,400 FLOOP` in muted type with an `≈` absent; APR still shows (unitless).
- Empty pools are hidden by default; when shown they are muted with `no liquidity` in the TVL cell.
- Unknown token (no `symbol`/`icon_url` metadata) renders the address tail in mono with a warn dot and tooltip
  "This token has no metadata — verify the address."
- Loading: skeleton rows. No history yet: APR/volume cells show `—` with tooltip "indexing…", never `0%`.

Mobile: table collapses to cards (pair + fee on the first line; TVL, APR on the second).

## Screen 2 — `/pools/<swap_component>`

Two-column on desktop (action left, facts right), stacked on mobile — same skeleton as `/app`.

**Left card — Add / Remove tabs**
- *Add*: two `TokenInput`s. Enter one side → the other follows the **reserve ratio** (not the weights). MAX buttons.
  Readout rows: "You receive (est.) N LP", "Minimum LP", "Pool ratio 1 X : n Y", "Your share after", "1 LP ≈ … XRD" (XRD pools).
  If one side is limited, the excess is stated: "n Y is returned to you in the same transaction". Tolerance control (0.1/0.5/1/custom)
  → `ASSERT_WORKTOP_CONTAINS LP ≥ min`. Preview via Gateway before opening the wallet; wallet message
  `Not CaviarNine · add liquidity hUSDC/XRD`.
- *Remove*: LP input with 25/50/75/100 %. Readout: "You receive (est.) x X + y Y", "≈ value" (XRD pools), "Minimums".
  Asserts on both outputs. No fee.
- Amount inputs respect each token's **divisibility** (6-dp tokens are common); the input sanitiser trims accordingly.
- Empty pool (reserves 0): Add shows "This pool is empty — the first deposit sets the price. Use the pool's weights as a guide."
  and lets both sides be entered freely (engine mints √(x·y)); Remove disabled.
- One-sided pool: explain that only the non-empty side can be added.

**Position card** (connected): LP balance, redeemable X + Y, ≈ XRD, share of pool %, link to the LP resource.

**Right column**
- *Pool facts* card: big price (`1 hUSDC = 1,104.2 XRD` and the inverse in muted), TVL, reserves share bar (cream/blue),
  weights, fee and its split ("0.05 % · 80 % to LPs · 20 % to CaviarNine"), LP supply, created date, addresses
  (swap component, native pool, LP token — each `↗` to the dashboard). Stat tiles: Fee APR 7d / 30d, volume 7d / 30d, swaps 7d.
- *Activity* card: infinite-scroll feed of swaps / add LP / remove LP for this pool (pool-wide, plus "Mine" when connected),
  same component as HyperStake with pool-specific token symbols.
- *Dependencies* line (collapsed): "open access · fee split 80/10/10 · owner CaviarNine". Note that removal is always public.

## Status & landing changes
- Landing: a second product block "Simple Pools — 70 live pools, 3.4 M XRD" linking to `/pools`.
- Status section gains one readout row: "Simple Pools — open to everyone · exit always public · fee split owner-controlled".

## Data & backend

| Need | Source | Freshness |
|---|---|---|
| Pool registry | `NewPoolEvent`s from the package (DB `simple_pools`) | incremental scan hourly / on demand |
| Reserves, LP supply | Gateway entity details, batched | 30 s server memo; client polls 20 s on detail page |
| Token metadata | Gateway, cached in DB `tokens` (symbol, name, icon, divisibility) | daily |
| Swaps → volume, APR | `SwapEvent`s per pool (DB `simple_pool_events`) for pools with liquidity > 1,000 XRD-equiv or any pool opened by a user | hourly + lazy |
| Positions | account fungibles ∩ LP resources | on connect / after tx |

API: `/api/pools` (list with live TVL + cached stats), `/api/pools/<address>` (detail), `/api/pools/<address>/history`
(cursor), indexer extended with a `simple_pools` job. Without `DATABASE_URL`: list still works from live reads; volume/APR `—`.

## Edge cases to handle explicitly
- Token with `divisibility < 18` (round inputs down; show the precision).
- Pool where `symbol` metadata is missing or duplicated (e.g. two "USDC"): always show address tail next to the symbol.
- LP resource with `icon_url` on caviarnine.com: use our own icon.
- Preview failure messages mapped to plain language (insufficient balance, price moved, pool empty).
- Gateway rate limits: batch reads, memoise per instance, back off on 429.

## Decisions, round 2 (2026-08-27)

| # | Question | Decision |
|---|---|---|
| 8 | List density | Dense sortable table on desktop, cards on mobile |
| 9 | Default filter | Hide empty pools (159 of 229) by default; "Show empty pools" chip |
| 10 | Stablecoin filter | Hard-coded list: xUSDC, xUSDT, hUSDC, hUSDT |
| 11 | Duplicate pairs | Flat list, one row per pool, "×N pools" tag on the pair |
| 12 | Indexing | Continuous for pools > 1,000 XRD TVL (22 today); others indexed on first visit |
| 13 | APR window | 7d default, 30d toggle |
| 14 | Unknown token | Soft warning: warn dot + tooltip, address tail always visible |
| 15 | Deep links | Redirect `/earn/simple-pool/<address>` → `/pools/<address>` |

## Reference: CaviarNine's Simple Pool page (archived 2026-08-27)

Screenshot: `docs/reference/caviarnine-simple-pool-2026-08-27.png`. What their UI does, for parity checks:

- **Header**: title, one-line tagline, an **XRD / USD** denomination toggle, a search box ("filter by token"), and a
  **Create a pool** button.
- **Table columns**: Pool composition (two overlapping token icons + `A / B`), Pool (a two-colour weight bar, purple/blue),
  Pool fees, Total Value Locked, Vol 7d (default sort, descending), APY 7d, Your liquidity.
- **Values are shown for every pool, including non-XRD pairs** (hWBTC/hUSDC 10.67 M, hUSDC/hWBTC 2.94 M, hUSDC/hETH 2.82 M)
  — they price tokens through their aggregator. Note: under our decision 4 these would show *no* value, yet they are the
  three largest pools on the list. See "Pricing follow-up" below.
- **Detail panel** docked to the right (not a separate page): pair header with fee badge and copyable address, the weight bar
  with both reserves and their USD value, "Current price", *Add Liquidity* section with a "Connect wallet to view your
  liquidity" placeholder, two amount inputs, a 0–100 % slider, and a full-width yellow **Add liquidity** button.
- APY is labelled "APY 7d" (they likely compound); we deliberately show **realised fee APR** instead.

### Pricing decision (2026-08-27) — Astrolescent + on-ledger fallback

**Decision 16.** Token prices come from the **Astrolescent price API** (`GET https://api.astrolescent.com/partner/<key>/prices`),
a liquidity-weighted average across DefiPlaza, Ociswap and CaviarNine, refreshed every 10 minutes, with `tokenPriceXRD` and
`tokenPriceUSD` per token. Marius holds a dev key (project name "dot", granted by Timan/Astrolescent on 2025-05-27; free, no
plans to charge; they earn from swaps routed via their `/swap` API). Key lives in `ASTROLESCENT_API_KEY` (Vercel + `.env.local`).
Coverage against the census: 35 of 52 tokens with liquidity, 53 fully-priced pools, **21.1 M XRD** of TVL shown vs 3.35 M with
XRD-leg-only pricing (hWBTC/hUSDC 10.6 M, hUSDC/hWBTC 2.9 M, hUSDC/hETH 2.8 M).

Rules:
- Fetched **server-side only**, cached 10 min (`s-maxage=600`), attribution "Prices by Astrolescent" in the list footer.
- **Fail open**: if the feed errors or is >1 h stale, derive prices on-ledger from the deepest XRD-leg pool holding the token
  (one hop, pool TVL > 10k XRD); pools still unpriced show token amounts only (decision 4).
- **Sanity bound**: when a pool's own spot price differs >5 % from the feed price, show a warn dot on the row and, on the detail
  page, "Pool price is X % away from market — adding liquidity here means selling at the pool's price." (Example today: MSXRD/XRD
  spot values the pool at 121k XRD vs 768k at market — a 6× gap.)
- **USD toggle** (XRD / USD, like CaviarNine) uses `tokenPriceUSD`; greys out when the feed is unavailable.
- Courtesy: tell Timan the "dot" key is now also used by notcaviarnine.com.
