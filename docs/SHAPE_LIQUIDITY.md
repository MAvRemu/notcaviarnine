# Shape Liquidity — technical specification (CaviarNine `QuantaSwap`, Radix mainnet)

Shape Liquidity is CaviarNine's concentrated-liquidity DEX. Each pool holds two tokens in discrete price **bins**; liquidity providers place
tokens in the bins they choose (a "shape"), receive an **NFT receipt** listing their claims per bin, and earn the swap fee of the bins the
price actually trades through. Verified on mainnet 2026-08-27 and in `caviarnine-scrypto/quantaswap`, `quantaswap_factory`,
`fee_controller` (read in full). The ledger is the source of truth.

## Deployment

| Role | Address |
|---|---|
| Package (blueprint `QuantaSwap`) | `package_rdx1p4r9rkp0cq67wmlve544zgy0l45mswn6h798qdqm47x4762h383wa3` |
| Factory (`QuantaSwapFactory`) — creates pools, keeps the registry | `component_rdx1cqv7hjfuy785cw0s6v4wt7n09e0ufnyz42vnm52hlmu4ue9nngtvsq` |
| Fee Controller — sets protocol/liquidity fee rates per pair | `component_rdx1cq02u55jpx685eejm0lj25rk5qcc002dahc37lmghlrh8cc0kre5cr` |
| Token Validator — gate for new pools (blacklist/whitelist, min. divisibility 6, recallable tokens blocked) | `component_rdx1cqp2xu6cwryg5n2k4xsuzk57qvj2zy4z53mg53587jaszxdv3kxv8t` |
| FLOOP fee vaults (protocol fee sink, shared with Simple Pools) | `component_rdx1crmhkatyjrw0070nsusdm4adwr5s3eaysmevxlvaxx6fspxkwdhlua` |
| Owner of factory, fee controller, validator and every pool | C9 Admin Badge `resource_rdx1nglan7…g200m4` |

Each pool is one `QuantaSwap` component plus its own **liquidity-receipt NFT resource** (RUID, `"Liquidity Receipt X/Y"`).

## Census (2026-08-27) — `docs/data/shape-pools-2026-08-27.json`

| | |
|---|---|
| Pools created | **375** (Nov 2023 → Aug 2026; factory `pools.pointer = 375`) |
| Pools with liquidity | 313 · above 10k XRD: 52 · above 100k XRD: 34 |
| TVL (Astrolescent prices, one dust pool with an absurd price excluded) | ≈ **107.6 M XRD** |
| Open positions (receipt NFTs in circulation) | **1,282** across 137 pools |
| Bin spans in use | 50 (126 pools) · 10 (124) · 100 (56) · 1 (44) · 20 (17) · 300 (8) |
| Live fee rates (Fee Controller) | protocol **0.03 %** on every pair; liquidity **0.01 %** (hUSDC/hUSDT, hUSDC/xUSDC), **0.05 %** (XRD/hUSDC, hWBTC/hETH, hWBTC/hUSDC, hETH/hUSDC), **0.30 %** (hSOL/hUSDC, LSULP/BTC4, 3TR/XRD, fUSD/hUSDC); defaults 0.03 % / 0.30 % |

Largest pools: hWBTC/hETH 34.6 M, LSULP/BTC4 15.2 M, XRD/hUSDC 12.9 M (30 positions), hUSDC/hUSDT 10.2 M, hWBTC/hUSDC 5.9 M,
hETH/hUSDC 5.8 M, hSOL/hUSDC 5.1 M, hUSDC/xUSDC 3.9 M, 3TR/XRD 3.4 M, fUSD/hUSDC 1.6 M, DFP2/XRD 1.2 M.

## Data model

**Ticks.** `Tick(u32)` in `[0, 54000]`, `27000` = price 1. `sqrt_price(tick) = 1.0005^(tick − 27000)`, so **`price(tick) = 1.001^(tick − 27000)`**
— one tick is 0.1 % in price. Representable prices: `1.001^−27000 ≈ 1.9e-12` … `1.001^27000 ≈ 5.3e11` (y per x).

**Bins.** A bin is identified by its lower tick and spans `bin_span` ticks; ticks must be multiples of `bin_span`. Bin span 1 ≈ 0.1 % wide,
10 ≈ 1 %, 50 ≈ 5 %, 100 ≈ 10 %. Bins **above** the current price hold only token X; bins **below** hold only Y; the single **active bin**
holds both. Dormant bins live in `bin_map: KVS<Tick, {amount, total_claim}>`; the active bin lives in component fields
`active_x, active_y, active_total_claim, lower_limit, upper_limit` (limits are **sqrt-prices**; square them to get prices).
A **tick index** (64-ary bitmap trie) tracks which bins hold liquidity and finds the next bin up/down in O(1); it — not `bin_map`,
which keeps stale zero entries — is authoritative.

**Price inside the active bin.** Virtual reserves are solved so X is exhausted at `upper_limit` and Y at `lower_limit` (same quadratic as
HyperStake's `swap_math`): `a = ll/ul − 1, b = x·ll + y/ul, c = x·y, L = (−b − √(b²−4ac))/(2a)`, `vx = x + L/ul, vy = y + L·ll`,
**`price = vy / vx`**. `get_active_bin_price_range()` returns `(ll², ul²)`.

**Liquidity receipt.** `LiquidityReceipt { #[mutable] liquidity_claims: HashMap<u32 tick, Decimal claim> }` — max **200** entries.
A claim is a pro-rata share of a bin: `tokens = claim / bin.total_claim × bin.amount` (dormant) or `claim / active_total_claim × (active_x, active_y)`.
Mint/burn/update roles are the pool component only, with `deny_all` updaters — **nobody, including the owner, can mint, edit or seize a position.**
Receipts are ordinary transferable NFTs; burning requires an empty claims map.

## Roles

| Method | Rule |
|---|---|
| `mint_liquidity_receipt`, `add_liquidity`, `add_liquidity_to_receipt`, `swap` | role `user` = AllowAll, **owner-updatable** (pausable) |
| `remove_liquidity`, `remove_specific_liquidity`, `burn_liquidity_receipt`, all getters | **PUBLIC** — exit can never be blocked |
| Pool owner | may change the `user` rule and metadata; **has no method to withdraw reserves, change `bin_span`, or touch receipts** |
| Fee Controller `fee_manager` (Admin Badge) | protocol fee ≤ 1 %, liquidity fee ≤ 5 % per pair, effective next swap |
| Factory owner | default rules for *future* pools, token validator |

## Interface

```rust
// factory
new_pool(token_x, token_y, bin_span: u32, reservation: Option<GlobalAddressReservation>) -> Global<QuantaSwap>   // user role; validates both tokens
get_pool_count() -> u64; get_pools(start, end) -> Vec<ComponentAddress>; get_pool_pair(pool); get_pools_by_pair(x, y, start, end)

// pool — liquidity
mint_liquidity_receipt() -> Bucket
add_liquidity(tokens_x: Bucket, tokens_y: Bucket, positions: Vec<(u32 tick, Decimal amount_x, Decimal amount_y)>) -> (receipt, leftover_x, leftover_y)
add_liquidity_to_receipt(receipt: Bucket, tokens_x, tokens_y, positions) -> (receipt, leftover_x, leftover_y)
remove_specific_liquidity(receipt: Bucket, claims: Vec<(u32 tick, Decimal claim)>) -> (receipt, tokens_x, tokens_y)   // over-claim = remove all of that tick
remove_liquidity(receipt: Bucket) -> (tokens_x, tokens_y)                                                             // removes everything and burns
burn_liquidity_receipt(receipt: Bucket)                                                                                // must be empty
// pool — trading
swap(tokens: Bucket) -> (tokens_bought, tokens_leftover)                                                               // no min-output parameter
// pool — reads
get_price() -> Option<Decimal>; get_active_tick() -> Option<u32>; get_active_bin_price_range() -> Option<(Decimal, Decimal)>
get_active_amounts() -> Option<(Decimal, Decimal)>; get_amount_x/y() -> Decimal (vault totals incl. dust)
get_bins_above(start, stop, number) / get_bins_below(...) -> Vec<(u32, Decimal)>                                         // always pass `number`
get_liquidity_claims(id) -> HashMap<u32, Decimal>; get_redemption_value(id) -> (x, y); get_redemption_bin_values(id) -> Vec<(tick, x, y)>
get_bin_span, get_token_x_address, get_token_y_address, get_liquidity_receipt_address, get_fee_controller_address, get_fee_vaults_address
```

### Events (per pool; `NewPoolEvent` is emitted by both factory and pool)
`SwapEvent { amount_change_x, amount_change_y, price_after }` (pool-perspective deltas; input side includes the liquidity fee, excludes protocol fee) ·
`ProtocolFeeEvent { token_address, amount }` · `LiquidityFeeEvent { token_address, amount }` ·
`ValuationEvent { amount_after_x, amount_after_y, price_after }` (after every add/remove/swap — a free TVL/price time series) ·
`AddLiquidityEvent { liquidity_receipt_id, amount_change_x, amount_change_y, added_x: Vec<(tick, amt)>, added_y }` ·
`RemoveLiquidityEvent { … removed_x, removed_y }` (negative) · `MintLiquidityReceiptEvent { id }` · `BurnLiquidityReceiptEvent { id }`.

## Adding liquidity — exact semantics

For each `(tick, amount_x, amount_y)`: tick must be valid for the span; amounts ≥ 0. Then:
- pool empty → **first deposit sets the price**: both amounts are taken as given at that tick, `claim = max(x, y)`; the ratio is not checked;
- `tick > current` and `x > 0` → X only (`claim = x / bin.amount × total_claim`, or `x` if the bin is empty);
- `tick < current` and `y > 0` → Y only;
- `tick == current` and **both** `> 0` → active bin at the current ratio `active_y/active_x`; the non-limiting side's excess is returned;
- anything else is **silently skipped** (e.g. X at a bin below price, or a single side at the active tick even when the active bin is one-sided).

Buckets must cover the sums (else panic); leftovers come back as the 2nd/3rd bucket. Rounding: pool takes with ceil (`INCOMING`), pays with
floor (`OUTGOING`); Decimal math truncates. Claims for the same tick merge. **Tokens with < 18 decimals**: amounts must respect divisibility.

## Swap — exact semantics (X → Y shown; Y → X mirrors)

1. Empty pool → input returned, no fees, no events.
2. `(p, l) = FeeController.get_fees(package, [x, y])`. Fees are taken **from the input, sequentially**: `protocol = in × p`, then
   `liquidity = (in − protocol) × l`.
3. Per bin, on virtual reserves: `out = in_net × vy / (vx + in_net)`. If `out ≥ active_y` the bin is exhausted: charge only the input that
   drains it (`in_bin = vx × active_y / (vy − active_y)`, minimum 1 atto), credit the bin with `in_bin / (1 − l)`, move to the next bin down
   (the old bin becomes an X-only dormant bin), repeat. Otherwise fill in-bin and stop.
4. Stops when the input is exhausted or **no more bins exist** — never panics; the unfilled input is returned and both fee buckets are refunded
   pro-rata. No iteration cap: a large swap may cross many bins (cost-bounded).
5. Protocol fee → FLOOP fee vaults; liquidity fee → pool vault, already credited to the bins traded through.

**There is no minimum-output argument** — the frontend must assert with `ASSERT_WORKTOP_CONTAINS`.

## Fee accounting for LPs
Liquidity fees are credited to bins by inflating the amount added to each bin the swap traverses (`/(1 − l)`), while `total_claim` stays
constant — every claim in a traded bin **appreciates**. Fees are therefore earned only by bins the price actually moves through, in the
**input token**, and are realised on removal (or read via `get_redemption_value`). There is no separate fee counter.

Realised fee yield for a pool (indexing plan): per swap, `LiquidityFeeEvent.amount` in the input token; per pool, APR ≈ Σ fees (priced) / TVL
(from `ValuationEvent` × prices) × 365/days. Per position, the honest number is the change in `get_redemption_value` versus the deposited
amounts (includes price effects) — CaviarNine's "Active APY" only counts bins that traded in the last 7 days.

## Owner powers vs. user guarantees

| Owner can | Owner cannot |
|---|---|
| pause new deposits and swaps (`user` role) on any pool | withdraw pool reserves — no such method exists |
| set fees via the Fee Controller: protocol ≤ 1 %, liquidity ≤ 5 % per pair | mint, edit or seize position NFTs |
| blacklist/whitelist tokens for **new** pools | change `bin_span` or fee-vault/controller addresses (compile-time) |
| change default rules for future pools | block `remove_liquidity`, `remove_specific_liquidity`, `burn_liquidity_receipt` |

## What the frontend must do

- **Positions**: find the connected account's receipt NFTs (per pool: `get_liquidity_receipt_address`), read `liquidity_claims`, and value
  them with `get_redemption_bin_values(id)` via Gateway preview (sorted by tick; X-only above, Y-only below, both at the active bin).
- **Withdraw path first**: `remove_liquidity(receipt)` (all) or `remove_specific_liquidity(receipt, claims)` (partial). Assert minimum X and
  Y outputs; return the entire worktop. Warn when removing 100 % of the active bin's claims — the pool price jumps to the next bin.
- **Add path**: compute per tick which side is needed (`> current` X, `< current` Y, `==` both at ratio `active_y/active_x`) and validate
  ticks against `bin_span`; offer preset shapes (spot range / curve / bid-ask) as lists of `(tick, x, y)`; enforce ≤ 200 claims per receipt;
  reuse the user's existing receipt with `add_liquidity_to_receipt`.
- **Reads**: `get_price`, `get_active_tick`, `get_active_bin_price_range`, `get_bins_above/below` with an explicit `number` (default is unbounded),
  fee rates via `FeeController.get_fees(package, [x, y])` (per pair; can change any time).
- **Manifests**

```
# remove everything
withdraw <receipt NFT id>; TAKE_ALL_FROM_WORKTOP <receipt> Bucket("r");
CALL_METHOD <pool> "remove_liquidity" Bucket("r");
ASSERT_WORKTOP_CONTAINS <X> <min_x>; ASSERT_WORKTOP_CONTAINS <Y> <min_y>; deposit_batch ENTIRE_WORKTOP

# remove some bins
… CALL_METHOD <pool> "remove_specific_liquidity" Bucket("r") Array<Tuple>(Tuple(<tick>u32, Decimal("<claim>")), …);
ASSERT_WORKTOP_CONTAINS …; deposit_batch ENTIRE_WORKTOP           # receipt comes back

# add with a shape
withdraw <X>; withdraw <Y>; TAKE_ALL × 2;
CALL_METHOD <pool> "add_liquidity" Bucket("x") Bucket("y") Array<Tuple>(Tuple(<tick>u32, Decimal("<x>"), Decimal("<y>")), …);
deposit_batch ENTIRE_WORKTOP                                        # receipt + leftovers

# swap (no min-output in the contract → assert)
withdraw <X>; TAKE_ALL …; CALL_METHOD <pool> "swap" Bucket("x"); ASSERT_WORKTOP_CONTAINS <Y> <min_y>; deposit_batch ENTIRE_WORKTOP
```
No `lock_fee` — the wallet adds it.

## Dependencies and risks

| Dependency | Who controls | Failure mode | Mitigation |
|---|---|---|---|
| Removing positions | nobody (PUBLIC) | none | — |
| Adding / swapping | owner (`user` role) | could be paused | show status |
| Fee rates | Fee Controller (owner), ≤ 1 % / ≤ 5 % | could rise sharply per pair | read live before quoting; show |
| Token list for new pools | owner | irrelevant to existing pools | — |
| Price data for TVL | Astrolescent / on-ledger | outliers (dust pools) | ignore pools with TVL > 1e9 XRD or < 1 XRD reserves |
| Out-of-range positions | market | earn nothing until price returns | show "in range / out of range" per position |
| Large swaps | protocol | cross many bins → high fee/cost, partial fills | preview; show bins crossed and leftover |

## References
- Source: https://github.com/caviarnine/caviarnine-scrypto/tree/main/quantaswap · `quantaswap_factory` · `fee_controller` · `token_validator`
- CaviarNine docs: Shape Liquidity (bins, adding/removing, Your Liquidity, Active APY) — https://docs.caviarnine.com
- Audit: Hacken (10/10, linked from CaviarNine docs)
