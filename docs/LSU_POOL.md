# LSU Pool — technical specification (CaviarNine `LsuPool`, Radix mainnet)

The LSU Pool is CaviarNine's liquid-staking basket. Users deposit any *approved* validator's liquid stake units (LSUs) and receive
**LSULP**, one fungible token representing a pro-rata share of a basket of ~80 validators' stake. Holding LSULP means holding
staked XRD across the basket; redeeming gives back LSUs of a validator of your choice, which can then be unstaked normally.
LSULP is what HyperStake trades against XRD, and this pool's cached valuation is HyperStake's price feed.

Verified on mainnet 2026-08-27 and in `caviarnine-scrypto/lsu_pool` + `lsu_token_validator` (read in full). The ledger is the source of truth.

## Deployment

| Role | Address |
|---|---|
| LSU Pool component (blueprint `LsuPool`) | `component_rdx1cppy08xgra5tv5melsjtj79c0ngvrlmzl8hhs7vwtzknp9xxs63mfp` |
| Package | `package_rdx1pkfrtmv980h85c9nvhxa7c9y0z4vxzt25c3gdzywz5l52g5t0hdeey` |
| LSULP (18 dp, "LSU Pool LP") | `resource_rdx1thksg5ng70g9mmy9ne7wz0sc7auzrrwy7fmgcxzel2gvp8pj0xxfmf` |
| Credit receipt NFT ("LSU Pool Credit Receipt", RUID, soul-bound) | `resource_rdx1nt3frmqu4v57dy55e90n0k3uy352zyy89vszzamvjld6vqvr98rls9` |
| LSU Token Validator (allowlist) | `component_rdx1cz7h8j68esue87jmq4mfqpnx5403jujadewlqcn5cqxew80fwd5fgd` |
| Fee vaults (FLOOP, shared with aggregator/order book) | `component_rdx1cqvfnpl0ld49rhwyhu4v3r05962yeplmasggtzlu9r2dmh7amx6vpn` |
| Owner | C9 Admin Badge `resource_rdx1nglan7…g200m4` |

## Live figures (2026-08-27)

| | |
|---|---|
| Basket valuation (`dex_valuation_xrd`) | ≈ 307 M XRD (= Σ vault balance × cached price, verified to match) |
| LSULP supply / NAV | ≈ 250.8 M / **1.2234 XRD per LSULP** |
| Validators with a vault / with balance | 82 / 81 — composition is flat: the ten largest are each ≈ 3 % (BobbyStake, /biz/, RadUp.io, Ideomaker, Emmoglu, Cobra Stakes, AcmeNodes, Cadwynbloc, StakeSafe Rotterdam, Apollo Pool) |
| Fees (live) | protocol **0.01 %** · liquidity **0.05 %** · reserve **0.01 %** (source defaults are 1/3/1 bp — the owner raised liquidity to 5 bp) |
| `validator_max_before_fee` | 200 (counter 82 → no penalty) |
| Allowlist | `require_active = true`; **65 approved vs 81 held**; last updated Oct 2025 |
| Credit receipts ever minted | 2,028 |
| Price-cache freshness | per validator between ~20 min and ~1.2 days; the whole basket only advances when someone transacts |

## State (`struct LsuPool`)

| Field | Meaning |
|---|---|
| `vaults: KVS<Resource, Vault>` | one vault per LSU resource ever deposited; never removed, may be empty |
| `reserve_vaults` | reserve fees + flood penalties + public donations; **owner-withdrawable**, outside the valuation |
| `prices_lsu_xrd: KVS<Resource, Decimal>` | cached redemption value of 1 LSU in XRD |
| `lsu_to_validator` | permanent cache LSU → validator component |
| `dex_valuation_xrd` | running Σ vault × cached price, maintained incrementally |
| `validator_counter / validator_pointer / validator_address_map` | index of vaulted LSUs (insertion order) + round-robin cursor for price refreshes |
| `protocol_fee / liquidity_fee / reserve_fee` | each bounded to [0, 1 %] |
| `validator_max_before_fee` | threshold for the anti-flood penalty |
| `token_validator` | external component called as `validate_token(resource)` |

LSULP mint/burn roles are `global_caller(component)` with `deny_all` updaters: **no one, including the owner, can mint or burn LSULP
outside the pool's own code.**

## Roles

| Method | Rule |
|---|---|
| `add_liquidity`, `swap` | role `user` = AllowAll, **owner-updatable** (pausable) |
| `remove_liquidity` | **PUBLIC** — exit can never be blocked |
| `update_multiple_validator_prices(n)`, `get_validator_price_lsu_xrd_and_update_valuation(res)`, `deposit_reserve_fee`, `merge_credit`, all getters | PUBLIC |
| `set_token_validator`, `set_protocol_fee`, `set_liquidity_fee`, `set_reserve_fee`, `set_validator_max_before_fee`, `take_from_reserve_vaults` | OWNER |

## Price cache (the oracle HyperStake depends on)

- Per-validator price = the native validator's `get_redemption_value(1)` — the live on-ledger XRD value of one LSU.
- `get_validator_price_lsu_xrd_and_update_valuation(res)` (public): reads the live price, adjusts `dex_valuation_xrd` by
  `vault.amount × (new − old)` and stores the new price. This is the only place prices are written.
- `update_multiple_validator_prices(n)` (public): refreshes the **next `n` indices after the pointer** (round-robin), stopping early if
  it wraps. Called automatically with `n = 5` at the start of every `add_liquidity`, `remove_liquidity` and `swap`; each of those also
  refreshes the resource(s) directly involved. With 82 validators a full pass takes ≥ 17 pool transactions.
- Consequences: redemption values only rise (emissions), so between refreshes the basket is slightly **undervalued** — depositors get
  marginally more LSULP, redeemers marginally less LSU (order of APR/105k per epoch). Anyone can call the public updaters first to make a
  quote exact. Price re-marks emit **no event**; only add/remove/swap emit `ValuationChangeEvent`.

## Adding liquidity — `add_liquidity(bucket, credit_proof: Option<Proof>) → (LSULP, credit-receipt-or-empty)`

1. `update_multiple_validator_prices(5)`.
2. Resource must be a real LSU: metadata `validator` → a `GlobalValidator` whose `pool_unit` equals the resource.
3. `token_validator.validate_token(resource)` — fails with *"LSU must be for an active validator."* unless approved (or `require_active` is off).
4. **Flood penalty**: if `validator_counter > validator_max_before_fee`, `(counter − max)³` whole LSU are taken into the reserve from *every*
   deposit (201 → 1 LSU, 202 → 8, 205 → 125). Inactive today (82 < 200).
5. Live price for the deposited LSU; `bucket_valuation_xrd = amount × price`.
6. Mint `LSULP = bucket_valuation_xrd / dex_valuation_xrd × supply` (Decimal order: divide first, then multiply, 18-dp truncation).
   Bootstrap case (`dex_valuation_xrd == 0`) mints 1 LSULP per LSU.
7. Valuation += bucket value (emits `ValuationChangeEvent`).
8. **Credit receipt**: with a proof, the receipt's `resources[LSU] += amount` and an *empty* bucket is returned; without, a new soul-bound
   NFT `CreditReceipt { resources: {LSU: amount} }` is minted and returned.
9. New LSU resources get a vault and an index; counter increments.

**No fee on adding.**

## Removing liquidity — `remove_liquidity(lsulp, lsu_resource, credit_proof) → (LSU, leftover LSULP)`

1. `update_multiple_validator_prices(5)`; the chosen `lsu_resource` must have a vault (panics otherwise; empty vault → returns everything unchanged).
2. Live price for `lsu_resource`; `share = lsulp / supply`; entitlement `amount_lsu = dex_valuation_xrd / price × share`.
3. **Partial fill**: if the vault holds less than the entitlement, the whole vault is paid and only the proportional LSULP is burned — the rest
   of the LSULP comes back. Always return the entire worktop.
4. **Credit**: with a proof, `discount = min(payout, credit[lsu_resource])`, the receipt is decremented, and only `payout − discount` is taxable.
   Redeeming the same LSU you deposited, up to the deposited amount, is **fee-free**; appreciation and other LSUs are taxed.
5. Fees on the taxable amount: liquidity fee stays in the vault (LSULP appreciates), protocol fee → FLOOP fee vaults, reserve fee → reserve vault.
   Net = `payout − taxable × (0.05 % + 0.01 % + 0.01 %)`.
6. Valuation −= what left the vault (emits `ValuationChangeEvent`, `RemoveLiquidityEvent` with negative amounts).

## Swapping LSU for LSU — `swap(bucket, lsu_paying) → (lsu_paying out, unswapped remainder)`

Pure oracle parity: `price_paying/receiving = price_paying_xrd / price_receiving_xrd`; capped by the paying vault's balance (partial fill
returns the unswapped input). The LSU you sell must pass the allowlist; the LSU you receive need not. Fees (0.07 % total) are taken from
the *paid-out* LSU: liquidity fee stays, protocol → fee vaults, reserve → reserve vault. `SwapEvent.user_buy_amount` is net of fees. Selling a
never-seen LSU creates its vault (no penalty on this path).

## Credit receipt

`CreditReceipt { #[mutable] resources: HashMap<ResourceAddress, Decimal> }` — a per-LSU ledger of gross LSU deposited. RUID NFT;
**withdrawer = component only**, so it cannot leave the account ("soul-bound"); the holder may burn it or prove it. One receipt per wallet
is enough (`add_liquidity` with a proof updates it). `merge_credit(p1, p2)` moves p2's credit into p1 and empties p2 — never pass the same
receipt twice. Read with `get_nft_data(id)` or Gateway non-fungible data. Purpose: fee-free round trips in the same LSU, while a change of
validator (deposit A, redeem B) is priced like a swap.

`RefundReceipt` exists in the repo but is **dead code** (not compiled, no resource) — ignore.

## Events

| Event | Fields |
|---|---|
| `AddLiquidityEvent` | `resource_address, amount, liquidity_token_amount_change` |
| `RemoveLiquidityEvent` | `resource_address, amount (−), liquidity_token_amount_change (−)` |
| `SwapEvent` | `user_sell_resource_address, user_sell_amount, user_buy_resource_address, user_buy_amount (net)` |
| `ValuationChangeEvent` | `valuation_change, valuation_after_change, total_liquidity_token_supply` — gives a free NAV time series (valuation / supply) |
| owner events | `SetTokenValidatorEvent`, `SetProtocolFeeEvent`, `SetLiquidityFeeEvent`, `SetReserveFeeEvent` |

No events for price re-marks, `set_validator_max_before_fee`, `take_from_reserve_vaults`, `merge_credit`, or the flood penalty.

## LSU Token Validator

State `active_set: KVS<Resource, ()>`, `require_active: bool` (true). `validate_token` only checks membership when `require_active`.
OWNER: `update_active_set(resource, contain)` (asserts it is a real LSU when adding), `set_require_active(bool)`; both emit events.
PUBLIC: `get_in_active_set`, `get_is_lsu_token`, `get_require_active`. The list is curated by hand — there is no on-ledger sync with Radix's
active validator set, hence today's drift (65 approved, 81 held, 16 held-but-not-approved).

## Owner powers vs. user guarantees

| Owner can | Owner cannot |
|---|---|
| set each fee up to 1 % (worst case 3 % total) | mint or burn LSULP |
| pause `add_liquidity` and `swap` via the `user` role | block `remove_liquidity` |
| swap the token validator (could block or open deposits) | move LSU out of the main vaults |
| lower `validator_max_before_fee` (turns the cubic penalty on) | change the price source (always native redemption value) |
| withdraw the **reserve vaults** (fees + penalties, not user deposits) | |

## What the frontend must do

- **Quotes**: expected LSULP = `amount × live_price / dex_valuation_xrd × supply` using `get_validator_price_lsu_xrd` (live), and account for
  the re-mark term `vault × (live − cached)` of the deposited LSU. Redeem: `dex_valuation_xrd / price × lp / supply`, capped by
  `get_vault_balance(lsu)`. Verify by Gateway preview before signing.
- **Pre-checks**: `get_require_active` + `get_in_active_set(lsu)` before offering a deposit or swap-in; `get_validator_counter > get_validator_max_before_fee`
  → show the penalty warning; vault balance for the chosen redemption LSU (partial fill warning).
- **Credit receipt**: detect the user's receipt (Gateway: NFTs of the credit resource in the account), pass it as `Enum<1u8>(Proof)` to make
  redeeming the original LSU fee-free; offer "new receipt" only if none exists.
- **Manifests** (mirroring CaviarNine's published ones):

```
# add (no receipt)
withdraw <LSU> <amount>; TAKE_ALL_FROM_WORKTOP <LSU> Bucket("lsu");
CALL_METHOD <LsuPool> "add_liquidity" Bucket("lsu") Enum<0u8>();
ASSERT_WORKTOP_CONTAINS <LSULP> <min_lsulp>; deposit_batch ENTIRE_WORKTOP          # returns LSULP + credit receipt NFT

# add (with receipt)
withdraw <LSU>; TAKE_ALL …; CALL_METHOD <account> "create_proof_of_non_fungibles" <CreditReceipt> Array<NonFungibleLocalId>(<id>);
CREATE_PROOF_FROM_AUTH_ZONE_OF_NON_FUNGIBLES <CreditReceipt> Array<NonFungibleLocalId>(<id>) Proof("cr");
CALL_METHOD <LsuPool> "add_liquidity" Bucket("lsu") Enum<1u8>(Proof("cr")); ASSERT_WORKTOP_CONTAINS <LSULP> <min>; deposit_batch ENTIRE_WORKTOP

# remove
withdraw <LSULP> <amount>; TAKE_ALL_FROM_WORKTOP <LSULP> Bucket("lp"); [proof as above]
CALL_METHOD <LsuPool> "remove_liquidity" Bucket("lp") Address(<LSU>) Enum<0u8|1u8(Proof)>;
ASSERT_WORKTOP_CONTAINS <LSU> <min_lsu>; deposit_batch ENTIRE_WORKTOP             # leftover LSULP comes back on partial fill

# swap LSU → LSU
withdraw <LSU_A>; TAKE_ALL …; CALL_METHOD <LsuPool> "swap" Bucket("a") Address(<LSU_B>);
ASSERT_WORKTOP_CONTAINS <LSU_B> <min>; deposit_batch ENTIRE_WORKTOP

# public price refresh (any wallet)
CALL_METHOD <LsuPool> "update_multiple_validator_prices" 5u32;
```
No `lock_fee` — the wallet adds it.

## Dependencies and risks

| Dependency | Who controls | Failure mode | Mitigation |
|---|---|---|---|
| Redemption values | Radix validators (native) | none — always live when read | — |
| Cache freshness | anyone (public updaters), organically via traffic | stale basket value → HyperStake NAV frozen; small unfairness at mint/redeem | "refresh prices" button; optional keeper |
| Approved list | C9 Admin Badge | new stake from unlisted validators can't enter; existing positions unaffected | show list status; `set_require_active(false)` would need the owner |
| Fees | owner (≤ 1 % each) | could rise to 3 % total | on-ledger, observable, show live |
| Flood penalty | owner threshold | if lowered below 82, every deposit loses whole LSU | pre-check and warn |
| Zero-stake validator | edge case | price 0 → division by zero panic in remove/swap | exclude such LSUs from selectors |

## References

- Source: https://github.com/caviarnine/caviarnine-scrypto/tree/main/lsu_pool/src · `lsu_token_validator/src`
- CaviarNine docs: LSU Pool Overview · Move Stake and Instant Unstake · Credit Receipt · LSU Pool Fees · Manifests (https://docs.caviarnine.com)
- Audit: Sec3 (linked from CaviarNine docs)
