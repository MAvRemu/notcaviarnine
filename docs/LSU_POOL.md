# LSU Pool — placeholder (partially researched)

> Status: **placeholder** with the facts already verified while building HyperStake. To be completed into a full protocol
> spec and a product spec (`LSU_POOL_UX.md`) in the HyperStake/Simple Pool format.

## What it is (verified on-ledger 2026-08-26)

CaviarNine's liquid-staking basket. Users deposit any *approved* validator's LSU and receive **LSULP**, a single fungible token
representing a share of a pool of many validators' stake. LSULP is what HyperStake trades against XRD, and its NAV
(`dex_valuation_xrd / LSULP supply`) is HyperStake's oracle.

| Entity | Address |
|---|---|
| LSU Pool component (blueprint `LsuPool`) | `component_rdx1cppy08xgra5tv5melsjtj79c0ngvrlmzl8hhs7vwtzknp9xxs63mfp` |
| LSULP | `resource_rdx1thksg5ng70g9mmy9ne7wz0sc7auzrrwy7fmgcxzel2gvp8pj0xxfmf` (≈260.5 M supply) |
| Credit receipt NFT (LP accounting) | `resource_rdx1nt3frmqu4v57dy55e90n0k3uy352zyy89vszzamvjld6vqvr98rls9` |
| LSU Token Validator (allowlist) | `component_rdx1cz7h8j68esue87jmq4mfqpnx5403jujadewlqcn5cqxew80fwd5fgd` |
| Owner | C9 Admin Badge |

Live figures: 82 validator LSUs tracked, 81 held, `dex_valuation_xrd ≈ 318.7 M XRD`, fees `protocol 0.01 % · liquidity 0.05 % ·
reserve 0.01 %`, `validator_max_before_fee = 200`, allowlist `require_active = true` with **65 approved vs 81 held, last updated
Oct 2025**.

### Interface (from `lsu_pool/src/lsu_pool.rs`)
- User: `add_liquidity(lsu: Bucket, credit_proof: Option<Proof>) -> (LSULP, credit NFT)`,
  `remove_liquidity(lsulp: Bucket, lsu_resource, credit_proof: Option<Proof>) -> (LSU, …)`,
  `swap(bucket, lsu_paying) -> (Bucket, Bucket)` (LSU ⇄ LSU through the pool).
- Public maintenance: `update_multiple_validator_prices(n)` — refreshes `n` cached validator prices (5 per organic tx).
- Getters: `get_dex_valuation_xrd`, `get_liquidity_token_total_supply`, `get_vault_balance`, `get_price_lsu_xrd_cached`,
  `get_validator_price_lsu_xrd`, `is_lsu_token`, `get_validator_counter/pointer`, fee getters, credit-receipt getters.
- Owner: `set_token_validator`, `set_*_fee`, `take_from_reserve_vaults`, `set_validator_max_before_fee`.

### Known operational issues (both owner-independent for us)
- **Oracle freshness**: cached prices only advance with transactions; observed a 14 h gap on 2026-08-27. A public keeper calling
  `update_multiple_validator_prices` fixes this without any admin rights → candidate for a small cron job + status indicator.
- **Allowlist drift**: only the owner can approve new validators; 16 held validators are no longer approved. Not fixable by us.

## Research plan
1. Source: full read of `lsu_pool.rs`, `consts.rs`, `lsu_token_validator.rs` — the credit-receipt model (what it tracks, when it is
   required), fee mechanics on add/remove/swap, `validator_max_before_fee` semantics, reserve vaults, events.
2. Ledger: per-validator holdings and cached prices (KVS reads), fee vault destinations, role rules, events for volume.
3. Math: LSULP mint/burn formulas, fees, price-cache effects; port to TS if quotes are shown; verify against live events.
4. UX candidates: "Top up LSULP" (deposit LSU → LSULP, the link-out we have today), "Redeem LSULP for a validator's LSU",
   validator list with approved/not-approved status, pool composition chart, oracle-freshness indicator + "refresh prices" button
   (anyone can sign it; useful when HyperStake's NAV is stale).
5. Keeper: design and cost the `update_multiple_validator_prices` cron (fee per call ≈ 2–8 XRD observed) and decide who pays.

## Open questions for Marius
- Do we want the keeper (paid from a small XRD budget) or just a user-triggered "refresh" button?
- Scope: LSULP mint/redeem only, or also LSU ⇄ LSU swaps and the credit-receipt flows?
- Order of work: Shape Liquidity first (more capital at risk) or LSU Pool first (directly improves HyperStake's oracle)?
