# Simple Pools — technical specification (CaviarNine `WeightedPool`, Radix mainnet)

What CaviarNine's site calls a **Simple Pool** is an instance of the `WeightedPool` blueprint: a two-token weighted
constant-product AMM (Balancer-style) that keeps its reserves in a native Radix `TwoResourcePool`. Anyone can create one for
any pair with a chosen weight and fee. Everything below was read from the live ledger on 2026-08-27 and from the public source
(`caviarnine-scrypto/weighted_pool`). The ledger is the source of truth.

## Deployment

| Role | Address |
|---|---|
| Package (blueprint `WeightedPool` v1.0.0) | `package_rdx1pkhxu8zy5t7h3rww6jsftca22e2jdgqpc28rje7lnmkjxxf50zagr7` |
| Fee Vaults used by all Simple Pools | `component_rdx1crmhkatyjrw0070nsusdm4adwr5s3eaysmevxlvaxx6fspxkwdhlua` |
| Owner badge (package, every pool, every LP token) | C9 Admin Badge `resource_rdx1nglan7djf0stpdm5pf3hzctlha366l3s5xllu9z04z6puctdg200m4` |
| Example: hUSDC/XRD pool (swap component) | `component_rdx1cqth4gp6fedux4rrjzk6gu04c24sfnhzrh9t052ufsh7n5ljrslltw` |
| … its native pool / LP token | `pool_rdx1c5dcv0r8tz0tzw8radv3grwvdj6jkya84c93k30mqmx70tyatlye0n` / `resource_rdx1tk9hawstw3k86c7qynvvr5tssttnsy4uurkz7d36fkz8cug9yw9925` |

Each Simple Pool is **three entities**: the `WeightedPool` swap component (holds parameters, does the math), a native
`TwoResourcePool` (holds the two vaults, mints/burns the LP token) and the LP fungible resource (symbol `LP`,
name `LP X/Y`). The swap component is the `pool_manager` of the native pool; the C9 Admin Badge owns all three.

## Census (2026-08-27) — see `docs/data/simple-pools-2026-08-27.json`

| | |
|---|---|
| Pools created | **229** (first 2025-02-17, last 2026-06-26) |
| Pools with an XRD leg | 62 |
| Pools with any liquidity | 70 · with > 1,000 XRD: 22 · with > 100k XRD: 8 · **empty: 159** |
| Total TVL (XRD-leg pools) | ≈ **3.35 M XRD** |
| Distinct pairs / tokens | 151 / 99 — **44 pairs have more than one pool** (different fee or weight) |
| Weights | 220 × 50/50; a handful of 90/10, 85/15, 80/20, 70/30, 60/40, 55/45, 20/80 |
| Fees | 0.30 % (72) · 0.05 % (56) · 1 % (53) · 0.40 % (17) · 2 % (15) · 0.5 % (5) · 0.75 % (4) · 0.15 % (3) · 0.10 % (3) · 0.20 % (1) |

Top pools by TVL: xUSDT/XRD 0.15 % (986k), hUSDC/XRD 0.05 % (838k), xwBTC/XRD 2 % (443k), hETH/XRD 0.05 % (260k),
hUSDT/XRD 0.30 % (175k), xETH/XRD 1 % (142k), MSXRD/XRD 0.05 % (121k), hBNB/XRD 0.30 % (106k), hSOL/XRD 0.05 % (69k),
XRD/xUSDC 80/20 0.30 % (48k).

## Parameters and their bounds (enforced by the blueprint)

| Field | Where | Range | Mutable? |
|---|---|---|---|
| `weight_x` / `weight_y` | component state + locked metadata | 0.1 – 0.9, sum = 1 | never |
| `fee` | state + locked metadata | 0.0001 – 0.02 (0.01 % – 2 %) | never |
| `protocol_fee_share` | state | 0 – 0.1, default 0.1 | owner |
| `treasury_fee_share` | state | 0 – 0.1, default 0.1 | owner |
| resources, native pool, LP resource | locked metadata | — | never |

Fee split of every swap: `liquidity = fee × (1 − protocol_share − treasury_share)` stays in the pool (LPs);
protocol and treasury shares go to Fee Vaults. Today that is **80 % / 10 % / 10 %** on every pool.

## Roles and authority

| Method | Rule | Notes |
|---|---|---|
| `swap`, `add_liquidity` | role `user` = **AllowAll**, updatable by owner | owner *could* restrict entry |
| `remove_liquidity`, `get_info`, `get_redemption_value` | PUBLIC, not updatable | **exit can never be blocked** |
| `set_protocol_fee_share`, `set_treasury_fee_share` | OWNER (C9 Admin Badge) | capped at 10 % each |
| `new`, `new_with_tokens` (blueprint functions) | anyone | pool creation is permissionless |

## Interface

```rust
// blueprint functions
new(resource_x, resource_y, weight_x: Decimal, fee: Decimal, reservation: Option<GlobalAddressReservation>) -> Global<WeightedPool>
new_with_tokens(token_x: Bucket, token_y: Bucket, weight_x, fee, reservation) -> (Global<WeightedPool>, Bucket /* LP */)
// methods
swap(input: Bucket) -> Bucket                                   // single output bucket, whole input consumed
add_liquidity(token_x: Bucket, token_y: Bucket) -> (Bucket /* LP */, Option<Bucket> /* change */)
remove_liquidity(lp: Bucket) -> (Bucket /* x */, Bucket /* y */)
get_info() -> PoolInfo
get_redemption_value(amount: Decimal) -> IndexMap<ResourceAddress, Decimal>
```

`PoolInfo` (tuple order as returned by preview): `price, resource_x, resource_y, reserve_x, reserve_y, weight_x, weight_y,
fee, protocol_fee_share, treasury_fee_share, pool_component, lp_resource`.

### Events
- `NewPoolEvent { swap_component, pool_component, lp_resource, resource_x, resource_y, weight_x, weight_y, fee }` —
  emitted by the **package function** (`emitter.type = "Function"`), so all pools are discoverable with one Gateway
  filter: `event_global_emitters_filter: [package]`. This is the pool registry; there is no factory component.
- `SwapEvent { input_resource, output_resource, input_amount, output_amount, input_reserve, output_reserve, liquidity_fee,
  protocol_fee, treasury_fee }` — emitted by the pool; reserves are **pre-swap**; fees are in the input token.
- Native `ContributionEvent` / `RedemptionEvent` are emitted by the `TwoResourcePool` (emitter = `pool_…`), giving exact
  LP add/remove amounts and pool units minted/burned.

### Metadata
Swap component (locked): `resource_x, resource_y, weight_x, weight_y, fee, lp_resource, pool_component`.
LP resource: `symbol = LP`, `name = LP X/Y`, `description`, `swap_component`, `pool`, `icon_url` (hosted on caviarnine.com —
mirror it), `info_url`. Native pool: `pool_unit`, `pool_resources`, `swap_component`.

## Pricing and swap math

Weighted constant-product invariant `x^wx · y^wy = k`. Spot price (get_info().price, y per x):

```
price = (reserve_y / weight_y) / (reserve_x / weight_x)
```

Swap of `input` (all of it is consumed — there is no partial fill and no remainder bucket):

```
fee            = input × fee_rate                       protocol = fee × protocol_share ; treasury = fee × treasury_share
in_after_fee   = input − fee
reserve_ratio  = reserve_in / (reserve_in + in_after_fee)
out            = reserve_out × (1 − reserve_ratio ^ (weight_in / weight_out))
```

Implementation detail that matters for a faithful port: `pow(a, x) = exp(x · ln(a))` with a **series `ln` valid only for
0.625 ≤ a ≤ 1.6** and a series `exp`. For 50/50 pools the exponent is 1 and the formula collapses to the exact
`out = reserve_out × in / (reserve_in + in)` — no approximation. For unequal weights the pool **panics if a single swap
exceeds ~60 % of the input reserve** (`reserve_ratio < 0.625`); the UI must cap input accordingly. Fee buckets are taken
with `OUTGOING` (round toward zero); the output withdraw likewise. All Decimal ops truncate.

## Liquidity (native TwoResourcePool semantics — weights play no role here)

- **Add (`contribute`)** with both reserves > 0: the pool takes the largest pair that matches the *current reserve ratio*
  and returns the excess of the other side as change. Pool units minted = `supply × used_x / reserve_x`.
  Edge cases handled by the engine: first deposit into an empty pool mints `√(x·y)` units; a pool with one empty side
  accepts only the non-empty side pro-rata; non-zero supply with zero reserves is an error.
- **Remove (`redeem`)**: returns `reserve_x × lp/supply` and `reserve_y × lp/supply`. Public, no fee, never blockable.
- Value of one LP unit in XRD (XRD-leg pool) = `TVL_xrd / supply`, with `TVL_xrd = reserve_xrd / weight_xrd`
  (the non-XRD side is worth `reserve_xrd × (w_other / w_xrd)` by the pool's own price).
- Divisibility: many tokens are 6-dp (hUSDC, hUSDT…); amounts must be trimmed to the resource's divisibility or the
  withdraw fails. Very small redemptions can round to zero on one side.

## Volume and fee APR (how the frontend computes them)

Indexed from `SwapEvent`s per pool.

**Volume** — XRD-leg pool: sum of the XRD side of each swap (`input_amount` if XRD in, else `output_amount`). Non-XRD
pool: sum of `input_amount` expressed in the pool's token X (state the unit; never imply XRD).

**Realised LP fee APR** — unitless, works for every pool without any external price:
```
growth_i = liquidity_fee_i / input_reserve_i × weight_in       (fee is a fraction of one side; weight scales to the whole pool)
APR      = Σ growth_i × 365 / days_covered
```
Validated on hUSDC/XRD over 7 days (1,028 swaps): 4.11 % vs 4.09 % from `Σ fee_xrd / TVL_xrd × 365/7`. Before impermanent
loss; label as "Fee APR · 7d, realised".

## Discovery, reads and indexing plan

1. **Registry**: `POST /stream/transactions` `{ event_global_emitters_filter: [package], opt_ins.receipt_events }` → decode
   `NewPoolEvent`s (3 pages today). Cache in DB table `simple_pools`; re-scan incrementally from the last state version.
2. **Live state per pool**: `POST /state/entity/details` on the *native pool* addresses (batched 20/call) → reserves;
   on LP resources → `total_supply`; token metadata (`symbol, name, icon_url, divisibility`) once, cached.
   `get_info` via preview is available but unnecessary — everything is derivable from state + locked metadata.
3. **Events**: `event_global_emitters_filter: [swap_component]` per pool for `SwapEvent`s; index only pools with
   liquidity > threshold (≈ 70 today), ascending from the last indexed version, same cron/lazy trigger as HyperStake.
4. **Positions**: fungibles of the connected account ∩ known LP resources → `redeem` preview or the pro-rata formula.

## Transaction manifests

```
# add liquidity
CALL_METHOD Address("<account>") "withdraw" Address("<X>") Decimal("<ax>");
CALL_METHOD Address("<account>") "withdraw" Address("<Y>") Decimal("<ay>");
TAKE_ALL_FROM_WORKTOP Address("<X>") Bucket("bx");
TAKE_ALL_FROM_WORKTOP Address("<Y>") Bucket("by");
CALL_METHOD Address("<swap_component>") "add_liquidity" Bucket("bx") Bucket("by");
ASSERT_WORKTOP_CONTAINS Address("<LP>") Decimal("<min_lp>");
CALL_METHOD Address("<account>") "deposit_batch" Expression("ENTIRE_WORKTOP");   # returns LP + change

# remove liquidity
CALL_METHOD Address("<account>") "withdraw" Address("<LP>") Decimal("<lp>");
TAKE_ALL_FROM_WORKTOP Address("<LP>") Bucket("b");
CALL_METHOD Address("<swap_component>") "remove_liquidity" Bucket("b");
ASSERT_WORKTOP_CONTAINS Address("<X>") Decimal("<min_x>");
ASSERT_WORKTOP_CONTAINS Address("<Y>") Decimal("<min_y>");
CALL_METHOD Address("<account>") "deposit_batch" Expression("ENTIRE_WORKTOP");

# (later) create pool with initial liquidity
withdraw X; withdraw Y; TAKE_ALL × 2;
CALL_FUNCTION Address("<package>") "WeightedPool" "new_with_tokens" Bucket("bx") Bucket("by") Decimal("<weight_x>") Decimal("<fee>") None;
deposit_batch ENTIRE_WORKTOP
```
No `lock_fee` — the wallet adds it. Note `swap` returns one bucket and consumes the entire input, so a swap manifest would
need only one assertion (out of scope for launch).

## Dependencies and risks

| Dependency | Who controls | Failure mode | Mitigation |
|---|---|---|---|
| Removing liquidity | nobody (PUBLIC) | none — always possible | — |
| Adding / swapping | owner can change `user` role | entries could be paused by CaviarNine | monitor role assignments; show status |
| Fee shares | owner, capped 10 % + 10 % | could drop to 0 (good for LPs) or stay | on-ledger, observable |
| Token quality | anyone can pool any token | scam/duplicate tokens with C9-looking names | show address, divisibility, supply; warn on unknown tokens |
| Duplicate pools | permissionless creation | liquidity fragmented across fee tiers | list grouped by pair, rank by TVL |
| Unequal weights | math limits | swap > ~60 % of a reserve panics | not relevant for LP-only launch |
| C9-hosted assets | CaviarNine | LP icon / info_url may vanish | host own LP icon |
| Aggregator routing | CaviarNine | their aggregator supplied most volume; volume may fall after shutdown | show honest realised APR |
| Token prices for TVL | Astrolescent API (off-ledger) | feed down or stale → no XRD/USD values | 10-min cache, fail open to on-ledger pool-spot derivation, sanity bound vs pool price |

## References

- Source: https://github.com/caviarnine/caviarnine-scrypto/tree/main/weighted_pool/weighted_pool/src
- Native pools: `radixdlt-scrypto/radix-engine/src/blueprints/pool/v1/v1_1/two_resource_pool_blueprint.rs`
- CaviarNine docs: https://docs.caviarnine.com (Simple Pools, Create a Pool)

### 7d volume / fee APR (implemented 2026-08-28, DB-less)
`lib/simplepool/volume.ts` scans the Gateway stream per pool for `SwapEvent`s from the last 7 days
and values the input side in XRD via the price table. Fee APR = volume × fee / TVL × 365/7
(`app/pools/page.tsx`), computed for the top 40 pools by TVL; the long tail shows "—".
Cached 1 h (`cachedSimplePoolVolumes`, tag `volumes`). Hard-won Gateway facts:
- `event_global_emitters_filter` with multiple addresses is **AND**, not OR — batching pools into
  one query silently returns nothing. One query per pool.
- A swap does **not** list the swap component in `affected_global_entities` (its vaults live in the
  native pool, so its own state never changes) — only the emitter filter finds swaps.
- The public Gateway 429s bursts: ≤2 concurrent, 250 ms spacing, exponential backoff.
- The filter cap is 10 **including** `kind_filter`.
- All C9 swap fees also emit `SwapVaultDepositEvent` from the shared fee-vault component
  `component_rdx1crmhkatyjrw0070nsusdm4adwr5s3eaysmevxlvaxx6fspxkwdhlua` — one stream for all C9
  activity, but too many pages/week to be the primary source.
