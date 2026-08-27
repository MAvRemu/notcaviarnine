# CaviarNine protocol map — how the four products and their shared contracts interact

Verified on Radix mainnet 2026-08-27 (Gateway state + previews) and in `caviarnine-scrypto` source. This is the reference for the
"What still depends on CaviarNine" diagram.

## The pieces

| Piece | Blueprint | Address | Owner | Public-user role |
|---|---|---|---|---|
| HyperStake | `HyperStake` | `component_rdx1cpz0z…gdwtf` | C9 Admin Badge | `swap_user`, `liquidity_user` = AllowAll (owner-updatable) |
| Simple Pools (×229) | `WeightedPool` | package `package_rdx1pkhxu8z…zagr7` | C9 Admin Badge (each pool) | `user` = AllowAll (owner-updatable); `remove_liquidity` PUBLIC |
| Shape Liquidity (×375) | `QuantaSwap` | package `package_rdx1p4r9rkp…83wa3`; factory `component_rdx1cqv7hj…ngtvsq` | C9 Admin Badge (each pool + factory) | `user` = AllowAll (owner-updatable); `remove_liquidity`, `remove_specific_liquidity`, `burn_liquidity_receipt` PUBLIC |
| LSU Pool | `LsuPool` | `component_rdx1cppy08…s63mfp` | C9 Admin Badge | `user` = AllowAll (owner-updatable) |
| LSU Token Validator | `LsuTokenValidator` | `component_rdx1cz7h8j…fwd5fgd` | C9 Admin Badge | — (`require_active = true`, 65 approved) |
| Token Validator (Shape) | `TokenValidator` | `component_rdx1cqp2xu…kxv8t` | C9 Admin Badge | — (blacklist, whitelist, min divisibility 6, recallable tokens blocked) |
| Fee Controller (Shape) | `FeeController` | `component_rdx1cq02u5…kre5cr` | C9 Admin Badge (`fee_manager`) | — sets Shape protocol/liquidity fee rates |
| FLOOP fee vaults (Shape + Simple Pools) | `FeeVaults` | `component_rdx1crmhka…kwdhlua` | C9 Admin Badge | anyone can `swap` FLOOP for the collected fees |
| FLOOP fee vaults (LSU Pool + aggregator/orderbook) | `FeeVaults` | `component_rdx1cqvfnp…amx6vpn` | C9 Admin Badge | idem |
| CAVIAR fee vaults (HyperStake) | `FeeVaults` | `component_rdx1cpa08p…tg6cpcn` | C9 Admin Badge | idem, swap token CAVIAR |
| C9 Admin Badge | NFT resource, supply 3 | `resource_rdx1nglan7…g200m4` | (its own owner rule: 4 of a C9 multisig resource) | — |

## How they connect

```
Your wallet ─uses─▶ This website ─reaches─▶ HyperStake ──price──◀ LSU Pool ──gated by──▶ LSU Token Validator (approved list)
                                        ├─▶ Simple Pools (WeightedPool ×229)
                                        ├─▶ Shape Liquidity (QuantaSwap ×375) ──fee rates──▶ Fee Controller
                                        │                                      ──new pools gated by──▶ Token Validator
                                        └─▶ LSU Pool (deposit LSU → LSULP)

Protocol fees:  HyperStake ──10 %+10 %──▶ CAVIAR fee vaults      Simple Pools ──10 %+10 %──▶ FLOOP fee vaults A
                Shape ──0.03 % of trade──▶ FLOOP fee vaults A     LSU Pool ──0.01 %──▶ FLOOP fee vaults B
Fee vaults: anyone swaps FLOOP/CAVIAR for the collected tokens at a falling price; the FLOOP/CAVIAR is 100 % burned (owner can
            redirect a share to a treasury/reserve).

One C9 Admin Badge owns every component above: it can change fee rates/shares, pause the `user` role (add/swap) on any product,
maintain both validators' lists, and move fee-vault settings. It can NOT withdraw pool reserves or block removals.
```

### Product-by-product facts that matter for users

**HyperStake** depends on the **LSU Pool** for its price (NAV = `dex_valuation_xrd / LSULP supply`). The LSU Pool's cached
valuation only advances when someone transacts with the LSU Pool (5 validators per tx). No other product depends on HyperStake.

**LSU Pool** depends on the **LSU Token Validator** (only approved validators' LSUs can be deposited; 65 approved vs 81 held,
last updated Oct 2025) and on Radix's native validators for redemption values. Fees: 0.05 % to LPs, 0.01 % protocol → FLOOP
vaults B, 0.01 % reserve (owner-withdrawable reserve vaults). Adding liquidity is free; swaps/redeeming to a different LSU
cost 0.07 %. Credit receipts (NFT) let the original depositor redeem the same LSU fee-free.

**Simple Pools** are independent of everything except the FLOOP fee vaults (10 %+10 % of each pool's fee) and the admin key.
No token validation at creation. Fee and weights are immutable per pool; fee shares are owner-adjustable (0–10 % each).

**Shape Liquidity** is the most connected: each pool asks the **Fee Controller** for its rates on every swap (today 0.03 %
protocol + 0.05 % liquidity by default; per-pair overrides possible — the CaviarNine UI shows e.g. 0.30 % pools), sends the
protocol part to FLOOP vaults A, and the factory refuses tokens the **Token Validator** blacklists (or recallable/low-divisibility
tokens not on its whitelist). Positions are NFTs ("liquidity receipts"); `remove_liquidity` and burning a receipt are PUBLIC, so
exiting can never be blocked. Adding/swapping are `user`-role (owner could pause).

**What "CaviarNine leaving" can and cannot do** — the admin key is the single point of control for: fee rates (Shape) and fee
shares (HyperStake, Simple Pools), pausing entries, validator/token lists, fee-vault economics. It cannot take reserves or stop
`remove_liquidity` on any product. Ownership of the badge itself sits behind a 4-key CaviarNine multisig resource.

### Two things the docs claim that the ledger contradicts / refines
- Docs: "Shape Liquidity fees can differ per pool (0.30 %)". Ledger: rates come from the Fee Controller per *pair*, default
  0.03 % protocol + 0.05 % liquidity; the UI's "0.30 %" pools are per-pair overrides. Read the live rate via `get_fees`.
- Docs: two FLOOP fee vaults. Ledger: yes — A (`…kwdhlua`) is used by Shape and Simple Pools, B (`…amx6vpn`) by the LSU Pool.
  HyperStake uses a third, CAVIAR vault (`…tg6cpcn`).
