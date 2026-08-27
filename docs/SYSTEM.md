# System overview

Not CaviarNine is a **non-custodial web frontend** for the HyperStake LSULP/XRD pool on Radix mainnet. It reads public
ledger state, helps the user build a transaction, and hands it to the Radix Wallet to sign. It never holds keys or funds.

```
┌────────────┐   manifest   ┌──────────────┐   signed tx   ┌────────────────┐
│  Browser   │ ───────────▶ │ Radix Wallet │ ────────────▶ │ Radix network  │
│ (Next.js)  │              └──────────────┘               │  HyperStake    │
│            │ ◀──────────── JSON reads ───────────────────│  TwoResourcePool│
└─────┬──────┘              Radix Gateway API             │  LSU Pool      │
      │ /api/*                                             └────────────────┘
┌─────▼──────┐   events     ┌──────────────┐
│ Vercel fns │ ◀─────────── │ Gateway      │
│  + Neon    │   (indexer)  └──────────────┘
└────────────┘
```

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router, TypeScript) | server reads + client wallet UI in one deploy |
| Styling | Tailwind v4 + CSS tokens | see `docs/DESIGN.md` |
| Wallet | `@radixdlt/radix-dapp-toolkit` (`<radix-connect-button>`) | the official, wallet-verified connect flow |
| Ledger reads | plain `fetch` against the Gateway (`lib/radix/gateway.ts`) | no SDK surface to keep in sync |
| Math | native `BigInt` (`lib/hyperstake/math.ts`) | exact replica of on-ledger `Decimal` arithmetic |
| DB | Neon Postgres via Drizzle (`lib/db`) | event index for APR/volume only; app degrades without it |
| Hosting | Vercel, git-connected to `MAvRemu/notcaviarnine` `main` | daily cron for the indexer |
| Analytics | Vercel Analytics | cookie-less |

## Repository map

```
app/
  page.tsx                landing (ISR 60 s): hero, live stats, how it works, status, quote
  app/page.tsx            the app (dynamic): swap · add · remove · position · health · activity
  disclaimer/, terms/     legal pages
  api/pool/route.ts       PoolSnapshot JSON (15 s in-process memo) + lazy indexer kick
  api/history/route.ts    HyperStake events, cursor-paginated; ?account= filters to one wallet
  api/index/route.ts      indexer trigger (Vercel Cron daily; CRON_SECRET-protected when set)
  icon.png, apple-icon.png, favicon.ico
lib/
  radix/config.ts         network, addresses (verified on-ledger), token metadata, links
  radix/gateway.ts        entity details, tx stream, preview, account fungibles, KVS keys
  radix/rdt.ts            lazy client-only dApp Toolkit singleton
  hyperstake/math.ts      swap math port, LP contribution/redemption math, slippage helper
  hyperstake/manifests.ts RTM builders (swap / add / remove / get_info)
  hyperstake/state.ts     PoolState reader (get_info preview + entity state + allowlist)
  indexer/events.ts       decode SwapEvent / LiquidityChangeEvent from receipts
  indexer/run.ts          incremental indexer (ascending stream from last state version)
  stats.ts                realised LP fee APR (DB, falling back to Gateway)
  pool-data.ts            PoolSnapshot aggregate + memo + maybeIndex()
  db/schema.ts, client.ts Drizzle schema (events, indexer_state), Neon HTTP client
  format.ts               fmt / pct / timeAgo / minutesSince / input sanitising
components/
  radix/                  RdtProvider (wallet context), ConnectButton
  app/                    AppShell, PoolProvider, Swap/Add/Remove panels, Balances, HealthPanel, History, TokenInput…
  landing/                StatsStrip, StatusSection (flow diagram + readouts + timeline)
scripts/
  verify-math.mts         proves math port == ledger (get_info price + swap replays)
  index-once.mts          initial backfill
  setup-dapp-definition.mts  sets dApp-definition metadata (needs .env.admin.local)
public/.well-known/radix.json  two-way dApp verification
docs/                      this folder
.claude/skills/radix       Radix skill for AI agents (guides in references/)
```

## Data flows

### Reading pool state (`fetchPoolState`)
1. `POST /transaction/preview` of `CALL_METHOD <HyperStake> "get_info"` → `PoolInfo` (price, reserves, oracle price,
   offsets, fees). Free-credit preview; no signer.
2. `POST /state/entity/details` for HLP + LSULP (total supply), LSU Pool (state, held LSUs), LSU Token Validator
   (`require_active`, `active_set` KVS address).
3. `POST /stream/transactions` filtered on the LSU Pool, `limit 1` → oracle freshness.
4. `POST /state/key-value-store/keys` on the allowlist → count, drift vs held LSUs, last-update state version →
   timestamp via the first tx at that version.
5. Derived: `premiumToNav = price/nav − 1`, `tvl = xrd + lsulp × nav`, `hlpValue = tvl / hlpSupply`.

`/api/pool` memoises this for 15 s per function instance and returns it with `s-maxage=15`. The app polls it every 20 s and on
tab focus. The landing page fetches it server-side with `revalidate = 60`.

### Quoting
The client re-implements the pool's exact arithmetic (`quoteSwap`, `quoteAddLiquidity`, `quoteRemoveLiquidity`) on the
latest `PoolState`, so quotes are instant and match the ledger to the last digit for the same state. Before signing, the exact
manifest is **previewed** through the Gateway; failures (e.g. insufficient balance) are surfaced in plain language and the
wallet is never opened.

### Writing (all through the wallet)
Manifest shape mirrors CaviarNine's own frontend:
```
withdraw → TAKE_ALL_FROM_WORKTOP → CALL_METHOD HyperStake <swap|add_liquidity|remove_liquidity>
→ ASSERT_WORKTOP_CONTAINS <min outputs> → deposit_batch(ENTIRE_WORKTOP)
```
No `lock_fee` (the wallet adds it). `ENTIRE_WORKTOP` guarantees partial-fill remainders return to the user. Minimums are
the local quote minus the user's tolerance (default 0.5 %, presets 0.1/0.5/1, custom), enforced on-ledger.

### Indexing
`runIndexer` walks `/stream/transactions` **ascending** with `event_global_emitters_filter = [HyperStake]` from the last
indexed state version, decodes `SwapEvent` / `LiquidityChangeEvent`, and upserts into `hyperstake_events`
(unique on `intent_hash + event_index`). A fresh DB starts ~30 days back. Triggers: Vercel Cron `17 3 * * *` (Hobby plans allow
one daily run) and a lazy kick from `/api/pool` when the last run is >1 h old (`after()` so the response isn't delayed).
Swap rows carry `liquidity_fee_xrd` (LSULP fees converted at the swap's oracle price) and `tvl_xrd_after`.

### Caching layers
1. **Next Data Cache (`unstable_cache`, cross-instance, survives cold starts)** — `lib/cached.ts` + `lib/prices/astrolescent.ts`:
   pool snapshot 20 s · Simple Pool summaries 5 min (tags `fees`,`simple-pools`) · Shape summary 15 min · admin-key log 10 min ·
   Astrolescent prices 10 min (tag `prices`) · token metadata 24 h (tag `tokens`). Stale-while-revalidate: visitors always get the cached copy.
2. **In-process memos** inside the readers (15 s–30 min) — only matter within one warm instance.
3. **Watchtower invalidation** — `lib/governance/invalidate.ts` runs after `/api/pool` responses; when the newest admin-key action
   changed a fee or a list, it calls `revalidateTag('fees'|'simple-pools')` so cached values refresh immediately.
Never cache anything that feeds a quote or a minimum output beyond the 20 s snapshot; per-account data is never cached.

### Stats
`getFeeStats(tvl, 7d)`: sum of `liquidity_fee_xrd` and XRD-equivalent volume over the window; APR = fees / TVL × 365/days
covered. Falls back to five Gateway pages when the DB is empty or unconfigured.

### Activity
`/api/history` returns decoded events newest-first with `nextCursor`. Pool-wide uses only the emitter filter; "Mine" adds
`affected_global_entities_filter = [account]` (the Gateway ANDs the two). The panel infinite-scrolls and merges new head
items every 30 s.

## Configuration

| Var | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_RADIX_NETWORK_ID` | Vercel + `.env.local` | `1` (mainnet) |
| `NEXT_PUBLIC_RADIX_GATEWAY_URL` | Vercel + `.env.local` | `https://mainnet.radixdlt.com` |
| `NEXT_PUBLIC_DAPP_DEFINITION_ADDRESS` | Vercel + `.env.local` | our dApp-definition account |
| `DATABASE_URL` | Vercel (Neon integration) | optional; enables indexer/stats |
| `CRON_SECRET` | Vercel | protects `/api/index` |
| `ASTROLESCENT_API_KEY` | Vercel + `.env.local` | token prices for Simple Pools TVL/USD (partner key "dot") |
| `DAPP_DEFINITION_ADMIN_PRIVATE_KEY_HEX` | `.env.admin.local` only | one-off metadata script; never on Vercel |

`vercel env pull` **overwrites** `.env.local` — keep anything local-only in `.env.admin.local`.

## Trust boundaries

- The site can only *propose* transactions; the wallet shows the full manifest and the user signs. Worst case for a
  compromised frontend is a bad quote, which the on-ledger minimum-output assertion bounds to the user's tolerance.
- Addresses are constants verified against the HyperStake component's own state; the app never resolves addresses at runtime
  from third parties.
- The DB is derived data only. Losing it costs the APR figure, nothing else.
- Own dApp-definition account with `claimed_websites` + `/.well-known/radix.json` gives two-way verification in the wallet.

## Operations

```bash
npm run dev · npm run build · npm run lint
npx tsx scripts/verify-math.mts                 # after touching math.ts
DATABASE_URL=… npx drizzle-kit push             # schema
DATABASE_URL=… npx tsx scripts/index-once.mts   # backfill
npx tsx scripts/setup-dapp-definition.mts       # after domain live; SITE_ORIGIN=… to override
```
Deploys: push to `main`. Domain: `notcaviarnine.com` (A `76.76.21.21`, `www` CNAME `cname.vercel-dns.com`).
