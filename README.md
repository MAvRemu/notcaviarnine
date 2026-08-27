# Not CaviarNine

**CaviarNine is gone. But contracts never die.**

An independent, non-custodial frontend for CaviarNine's [HyperStake](https://docs.caviarnine.com/products-caviar/hyperstake)
LSULP/XRD pool on Radix mainnet — built after CaviarNine [announced](https://t.me/caviarxrd/70246) it is leaving Radix and
switching its website to withdraw-only. The smart contracts stay live; this site lets you keep using them.

Live: https://notcaviarnine.com · App: https://notcaviarnine.com/app

## What it does

- **Swap** XRD ⇄ LSULP (instant stake / instant unstake) with an on-ledger minimum-output assertion.
- **Add / remove liquidity** (HLP) with minimum-receive assertions.
- **Health dashboard**: LSULP NAV, pool price, premium/discount, range, reserves, TVL, realised 7d LP fee APR, oracle freshness,
  LSU active-set status.
- **Activity feed**: pool-wide and per-connected-account, straight from the Gateway.

Every write is a transaction manifest the user reviews and signs in the Radix Wallet (official `<radix-connect-button>`).
No custody, no accounts, no backend state except an event index used for APR/volume.

## Architecture

```
app/                 Next.js 16 App Router
  page.tsx           landing (ISR 60s) — hero, live stats, how it works, status, announcement
  app/page.tsx       the app (client-heavy; RDT wallet + pool context)
  api/pool           pool snapshot (get_info preview + entity state + fee stats), 15s memo
  api/history        recent HyperStake events (pool-wide or ?account=)
  api/index          incremental event indexer (Vercel Cron daily + lazy when >1h stale)
lib/radix/           config (addresses), gateway client (plain fetch), RDT singleton
lib/hyperstake/      math.ts — exact BigInt port of swap_math.rs (verified vs ledger)
                     manifests.ts — RTM builders mirroring CaviarNine's own manifests
                     state.ts — PoolState reader
lib/indexer/, lib/db/  Gateway stream → Neon Postgres (Drizzle); lib/stats.ts computes APR
components/          UI (Tailwind v4, cream/black/yellow — CaviarNine's palette inverted)
scripts/             verify-math.mts (replays live swaps), index-once.mts (backfill)
.claude/skills/radix Radix skill + guides for AI agents working on this repo
```

## Docs

- [docs/SYSTEM.md](docs/SYSTEM.md) — architecture, data flows, configuration, operations
- [docs/HYPERSTAKE.md](docs/HYPERSTAKE.md) — protocol spec: addresses, parameters, math, roles, risks
- [docs/DESIGN.md](docs/DESIGN.md) — visual identity and component system
- [docs/SIMPLE_POOL.md](docs/SIMPLE_POOL.md) / [docs/SIMPLE_POOL_UX.md](docs/SIMPLE_POOL_UX.md) — Simple Pools (WeightedPool) protocol spec and product spec (planned)
- [docs/SHAPE_LIQUIDITY.md](docs/SHAPE_LIQUIDITY.md), [docs/LSU_POOL.md](docs/LSU_POOL.md) — placeholders with description and research plan

## Develop

```bash
npm i
cp .env.example .env.local            # or: vercel env pull
npm run dev
npx tsx scripts/verify-math.mts       # proves the math port matches on-ledger swaps
DATABASE_URL=... npx drizzle-kit push # create tables
DATABASE_URL=... npx tsx scripts/index-once.mts
```

Secrets: `.env.local` (Vercel-managed; the CLI overwrites it) and `.env.admin.local` (dApp-definition admin key, local only —
never on Vercel). Both gitignored.

## Trust & verification

- Addresses in `lib/radix/config.ts` were read live from the Gateway; the HyperStake component's own state points to the pool,
  LSU Pool, fee vaults and token validator used here.
- `swap_user` / `liquidity_user` roles are `AllowAll` on-ledger — no permission from CaviarNine is required.
- Contract source: https://github.com/caviarnine/caviarnine-scrypto

Not affiliated with CaviarNine. Use at your own risk — see `/disclaimer`.

## License

MIT — see [LICENSE](LICENSE). The HyperStake smart contracts are CaviarNine's and carry their own license in
[caviarnine-scrypto](https://github.com/caviarnine/caviarnine-scrypto); this repository contains only the frontend.
