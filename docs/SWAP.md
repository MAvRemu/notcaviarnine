# Swap (Astrolescent aggregator)

The `/swap` page is the one part of the site that is **not** a CaviarNine-contract frontend: it routes
token swaps across every Radix DEX (Ociswap, DefiPlaza, CaviarNine, Astrolescent's own pools) via the
[Astrolescent](https://astrolescent.com) aggregator API. Behind the `swap` id in
`NEXT_PUBLIC_LIVE_PRODUCTS` (see `lib/products.ts`); the route 404s and the nav tab hides when off.

## How a swap flows

1. Client (`components/swap/swap-widget.tsx`) POSTs `{inputToken, outputToken, inputAmount, fromAddress?, slippageBps}`
   to **our** `/api/swap/quote` (debounced 450 ms, re-quoted every 30 s, and rebuilt when the wallet
   connects because the manifest embeds the account).
2. The route handler (`app/api/swap/quote/route.ts`) calls
   `POST api.astrolescent.com/partner/<key>/swap` server-side — the partner key never reaches the
   browser — passing our fee component and fee (see Fees).
3. Astrolescent returns the quoted output, price impact (a *fraction*, negative = worse), the route
   split, and a **complete transaction manifest**.
4. `lib/swap/astrolescent.ts` then:
   - **validates** the manifest (`validateManifest`): instruction whitelist
     (`CALL_METHOD`, `TAKE(_ALL)_FROM_WORKTOP`, `ASSERT_WORKTOP_CONTAINS`, `RETURN_TO_WORKTOP`),
     account calls only `withdraw`/`deposit_batch(ENTIRE_WORKTOP)` and only on the requesting account,
     nothing after the deposit, all other calls target components only;
   - **tightens the min-output guard** (`tightenAssert`): Astrolescent bakes in a fixed ~3% tolerance
     and ignores slippage parameters, so we rewrite the `ASSERT_WORKTOP_CONTAINS` decimal to
     `output × (1 − slippageBps/10000)` (inserted before the final `deposit_batch` if absent).
     The assert is the real safety: any attempt to siphon output fails the transaction.
5. Client previews the manifest via the Gateway (`/transaction/preview`); only a `Succeeded` preview
   reaches the wallet (`sendTransaction`).

Quotes without a connected wallet use the dApp-definition account as a stand-in `fromAddress` so
prices render pre-connect; that manifest is never submitted (`quote.builtFor` must equal the
connected account).

## Fees — and where the money goes

- Astrolescent takes **0.1%** of output on all API swaps (their `fee_bucket`, their component).
- We pass `feeComponent` + `fee: 0.001` (constant `SITE_SWAP_FEE`), adding **0.1%** for us
  (`extfee_bucket` in the manifest). Total user cost ≈ **0.2%**, disclosed in the UI footer.
- Our fee component (`ASTROLESCENT_FEE_COMPONENT` in `lib/radix/config.ts`):
  `component_rdx1cr48rvu657lxnzc0tqwqpdx4y25h78vsqrrrecv67v0x6je36d6x9v` — an instance of
  Astrolescent's fee blueprint created for us on 2025-08-27; the **owner badge** sits on the
  operator's personal account (not the dApp-definition account). Astrolescent's docs say they keep
  30% of a partner fee; in practice the manifest deposits the full 0.1% into our component, so any
  cut is settled at claim time.
- **Claiming**: https://astrolescent.com/fees?component=component_rdx1cr48rvu657lxnzc0tqwqpdx4y25h78vsqrrrecv67v0x6je36d6x9v
  (sign with the account holding the owner badge).

## Token list

- `GET /api/swap/tokens` → Astrolescent `partner/<key>/tokens` (~740 tokens), cached 1 h
  (`unstable_cache`, tag `swap-tokens`), merged with the 10-min USD price cache (tag `prices`).
- The picker (`components/swap/token-picker.tsx`) pins curated majors **by exact address**
  (XRD, LSULP, xUSDC, xUSDT, xwBTC, xETH, ASTRL) and drops tokens whose symbol matches a curated
  major but whose address doesn't (`filterImposters`) — the live list contains e.g. a fake "XRD".
  Sort order: wallet-held → curated → alphabetical; rows show an address snippet; renders 80 rows max.

## API responses (observed 2026-08-28)

`POST partner/<key>/swap` body: `inputToken`, `outputToken`, `inputAmount` (human units, number),
`fromAddress`, optional `feeComponent` + `fee` (0.001 = 0.1%). Response:
`outputTokens` (number), `priceImpact` (fraction: −0.236 on a 1M-XRD test swap ≈ −23.6%),
`swapFee` (string, output token, all fees combined), `manifest`, `routes[]` with
`pools[].type` (venue-prefixed: `OciSimple`, `OciPrecision`, `Astro_Multi`, …) and `tokensIn`
(input-side split). Slippage parameters in the request are silently ignored.

## Analytics

Standard tx funnel events with `product: 'swap'` and a `pair` prop (`"XRD→ASTRL"`); size buckets
only when one leg is XRD, otherwise `size: 'non-xrd'`. No addresses, no exact amounts.

## Testing / caveats

- `lib/swap/astrolescent.ts` validation was unit-tested against captured real manifests
  (fee + no-fee variants, wrong-account / mangled-deposit / injected-instruction negatives).
- Quote math is display-only floats — fine here because the manifest (including the min-output
  decimal) is what actually executes, and the assert is exact on-ledger.
- Not wallet-tested until the preview branch is exercised; test a small XRD → xUSDC swap first and
  verify the fee lands: your component's XRD/xUSDC vault should grow by 0.1% of output
  (visible on the claim page).
