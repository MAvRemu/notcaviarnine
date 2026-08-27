# HyperStake — technical specification (as deployed on Radix mainnet)

HyperStake is CaviarNine's oracle-anchored AMM for **LSULP ⇄ XRD**. It lets stakers enter and exit the LSU Pool basket
instantly (no 7-day unstake), and lets LPs earn the fee that impatience pays. Everything below was read from the live ledger
on 2026-08-26 and from the public source (`caviarnine-scrypto/hyper_stake`). Source of truth is always the ledger.

## Components and addresses

| Role | Address |
|---|---|
| HyperStake component (blueprint `HyperStake`) | `component_rdx1cpz0zcyyl2fvtc5wdvfjjl3w0mjcydm4fefymudladklf6rn5gdwtf` |
| Package | `package_rdx1pk7qn3gm9g7s6ss93xgvmytua5awt7ujqkpmcse93zn4dvfel7s8rh` |
| Native TwoResourcePool (holds the real reserves) | `pool_rdx1chmckjpr0ks5lk6h7mqvmrw56wt4w6tsuy6n2jhd8fhr8vc5en5e90` |
| HLP — pool unit (LP token) | `resource_rdx1th0f0khh9g8hwa0qtxsarmq8y7yeekjnh4n74494d5zf4k5vw8qv6m` |
| LSULP — LSU Pool LP token (resource_x) | `resource_rdx1thksg5ng70g9mmy9ne7wz0sc7auzrrwy7fmgcxzel2gvp8pj0xxfmf` |
| XRD (resource_y) | `resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd` |
| LSU Pool (oracle source, blueprint `LsuPool`) | `component_rdx1cppy08xgra5tv5melsjtj79c0ngvrlmzl8hhs7vwtzknp9xxs63mfp` |
| LSU Token Validator (allowlist) | `component_rdx1cz7h8j68esue87jmq4mfqpnx5403jujadewlqcn5cqxew80fwd5fgd` |
| Fee Vaults (protocol + treasury fee sink) | `component_rdx1cpa08p8gkvg966cvqglmtcfknp45ex5rtj69j3dd422sqcvtg6cpcn` |
| Owner badge: C9 Admin Badge (NFT, supply 3) | `resource_rdx1nglan7djf0stpdm5pf3hzctlha366l3s5xllu9z04z6puctdg200m4` |
| CaviarNine dApp definition | `account_rdx12yrjl8m5a4cn9aap2ez2lmvw6g64zgyqnlj4gvugzstye4gnj6assc` |

## Production parameters (component state)

| Field | Value | Meaning |
|---|---|---|
| `upper_offset` | `1` | upper price bound = NAV × 1.000 |
| `lower_offset` | `0.985` | lower price bound = NAV × 0.985 (−1.5 %) |
| `fee` | `0.001` | 0.1 % of input, taken before the swap |
| `protocol_fee_share` | `0.1` | 10 % of the fee → Fee Vaults (protocol) |
| `treasury_fee_share` | `0.1` | 10 % of the fee → Fee Vaults (treasury) |
| *(implied)* liquidity share | `0.8` | 80 % of the fee stays in the pool for LPs |

## Roles and authority

| Role | Rule | Effect |
|---|---|---|
| `swap_user` | **AllowAll** | anyone may call `swap` |
| `liquidity_user` | **AllowAll** | anyone may call `add_liquidity` / `remove_liquidity` |
| `_owner_` | requires C9 Admin Badge | can update the two roles above, fee parameters, metadata |
| Metadata setter/locker | Owner | |

The frontend needs no permission; only the owner can change fees or restrict access.

## Public interface

```rust
swap(tokens: Bucket) -> (Bucket /* output */, Bucket /* unused input */)
add_liquidity(tokens_x: Bucket /* LSULP */, tokens_y: Bucket /* XRD */) -> (Bucket /* HLP */, Option<Bucket> /* excess */)
remove_liquidity(lp_tokens: Bucket /* HLP */) -> (Bucket /* LSULP */, Bucket /* XRD */)
get_info() -> PoolInfo
```

`PoolInfo` (tuple order as returned by preview):
`price, resource_x, resource_y, reserve_x, reserve_y, oracle_price, upper_offset, lower_offset, fee, protocol_fee_share,
treasury_fee_share, pool_component, lp_resource`.

Events emitted by the HyperStake component:
- `SwapEvent { input_resource, output_resource, input_amount, output_amount, input_reserve, output_reserve, oracle_price,
  liquidity_fee, protocol_fee, treasury_fee }` — reserves are **pre-swap**.
- `LiquidityChangeEvent { amount_lp, amount_x, amount_y }` — negative on removal.

## Oracle: LSULP net asset value

```
oracle_price (XRD per LSULP) = LsuPool.get_dex_valuation_xrd() / LSULP.total_supply
```
`dex_valuation_xrd` is a **cached** sum of each validator LSU's XRD redemption value held by the LSU Pool. It is refreshed
5 validators at a time (`update_multiple_validator_prices(5)`, cycling a pointer over 82 tracked validators) on every LSU Pool
add/remove/swap, and the method is public — anyone can call it. There is no self-update; staleness = time since the last LSU
Pool transaction. In August 2026 organic traffic refreshes it every 10–15 minutes.

## Pricing model: a virtual curve anchored to NAV

Instead of a fixed tick range, HyperStake rebuilds a **virtual constant-product curve on every call** so that the real
reserves are exhausted exactly at the bounds:

```
upper_limit = sqrt(oracle_price × upper_offset)          # √ of upper price
lower_limit = sqrt(oracle_price × lower_offset)          # √ of lower price
```

Given real reserves `x` (LSULP) and `y` (XRD), solve for liquidity `L` (quadratic, I512 arithmetic, base 1e36):

```
a = lower/upper − 1
b = x·lower + y/upper
c = x·y
L = (−b − √(b² − 4ac)) / (2a)
virtual_x = x + L / upper
virtual_y = y + L · lower
price     = virtual_y / virtual_x                          # XRD per LSULP; == get_info().price
```

Swap against the virtual reserves, capped by the real ones:

```
in_after_fee = input × (1 − fee)
out          = in_after_fee · v_out / (v_in + in_after_fee)
if out > real_out:                                        # bound reached → partial fill
    in_after_fee = v_in · real_out / (v_out − real_out)
    input_used   = in_after_fee / (1 − fee)
    out          = real_out
remainder    = input − input_used                          # returned in the second bucket
fee          = input_used × fee
protocol     = fee × protocol_fee_share;  treasury = fee × treasury_fee_share  → Fee Vaults
liquidity    = fee − protocol − treasury                  → stays in the pool
```

Consequences:
- LSULP always trades **between 98.5 % and 100 % of NAV**. XRD→LSULP (instant stake) buys at a discount; LSULP→XRD
  (instant unstake) sells at a discount — that discount is the fee for skipping the 7-day unstake.
- The range *moves with NAV* automatically; there is no rebalance transaction and no keeper needed for pricing.
- Real inventory changes only through swaps and LP actions. Manifests must return `ENTIRE_WORKTOP` because fills can be partial.
- All arithmetic is 18-decimal integer math with truncation toward zero. `lib/hyperstake/math.ts` mirrors it with `BigInt`;
  `scripts/verify-math.mts` proves equality against `get_info().price` and replays live `SwapEvent`s exactly.

## Liquidity (native TwoResourcePool semantics)

- `add_liquidity(x, y)`: the pool takes the largest amounts matching the current ratio `reserve_x : reserve_y`, mints
  `HLP = supply × min(x/reserve_x, y/reserve_y)`, and returns the excess side.
- `remove_liquidity(hlp)`: returns `reserve_x × hlp/supply` LSULP and `reserve_y × hlp/supply` XRD. No fee.
- HLP value in XRD = `(reserve_y + reserve_x × oracle_price) / supply`.
- LP return = accrued liquidity fees (80 % of 0.1 % of volume) minus the inventory drift between LSULP and XRD as the pool
  is arbitraged along the curve. Realised 7-day fee APR is computed from indexed `SwapEvent`s (see `docs/SYSTEM.md`).

## Live figures (2026-08-26)

| | |
|---|---|
| Reserves | 12.93 M LSULP + 2.09 M XRD |
| TVL | ≈ 17.9 M XRD |
| HLP supply / holders | 7.71 M / 246 accounts |
| LSULP NAV | 1.2233 XRD |
| Pool price | 1.2071 XRD (−1.32 % vs NAV) |
| 7-day volume / LP fees | 72.3 M XRD / 57.8 K XRD → ≈ 16.9 % realised APR |

## Dependencies and governance risks

| Dependency | Who controls it | Failure mode | Mitigation |
|---|---|---|---|
| Swap & LP access | nobody (AllowAll) | owner could restrict roles | monitor role assignments |
| Price feed freshness | anyone (public method) | low LSU Pool activity → stale NAV | keeper calling `update_multiple_validator_prices` |
| LSU allowlist (`require_active = true`) | C9 Admin Badge only | list drifts from live validator set; new stake can't enter via unlisted validators. 65 listed vs 81 held, last updated Oct 2025 | needs owner action or `set_require_active(false)`; handover to Radix Accountability Council requested 21 Aug 2026 |
| Fee parameters / shares | C9 Admin Badge | could be changed | on-ledger, observable |
| CaviarNine assets (icons, docs) | CaviarNine | may disappear | mirrored in this repo |

## Transaction manifests used by this frontend

```
# swap (XRD → LSULP shown; mirror for LSULP → XRD)
CALL_METHOD Address("<account>") "withdraw" Address("<XRD>") Decimal("<amount>");
TAKE_ALL_FROM_WORKTOP Address("<XRD>") Bucket("bucket1");
CALL_METHOD Address("<HyperStake>") "swap" Bucket("bucket1");
ASSERT_WORKTOP_CONTAINS Address("<LSULP>") Decimal("<min_out>");
CALL_METHOD Address("<account>") "deposit_batch" Expression("ENTIRE_WORKTOP");

# add liquidity
withdraw LSULP; withdraw XRD; TAKE_ALL × 2;
CALL_METHOD <HyperStake> "add_liquidity" Bucket("bucket1") Bucket("bucket2");
ASSERT_WORKTOP_CONTAINS <HLP> <min_hlp>; deposit_batch ENTIRE_WORKTOP

# remove liquidity
withdraw HLP; TAKE_ALL;
CALL_METHOD <HyperStake> "remove_liquidity" Bucket("bucket1");
ASSERT_WORKTOP_CONTAINS <LSULP> <min_x>; ASSERT_WORKTOP_CONTAINS <XRD> <min_y>; deposit_batch ENTIRE_WORKTOP
```
No `lock_fee` — the Radix Wallet inserts fee payment. Identical in shape to the manifests CaviarNine's own site produced.

## References

- HyperStake source: https://github.com/caviarnine/caviarnine-scrypto/blob/main/hyper_stake/hyper_stake/src/hyper_stake.rs
- Swap math: https://github.com/caviarnine/caviarnine-scrypto/blob/main/hyper_stake/hyper_stake/src/hyper_stake/swap_math.rs
- LSU Pool: https://github.com/caviarnine/caviarnine-scrypto/blob/main/lsu_pool/src/lsu_pool.rs
- LSU Token Validator: https://github.com/caviarnine/caviarnine-scrypto/blob/main/lsu_token_validator/src/lsu_token_validator.rs
- Product docs: https://docs.caviarnine.com/products-caviar/hyperstake
- CaviarNine's announcement: https://t.me/caviarxrd/70246
