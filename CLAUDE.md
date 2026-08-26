# not-caviarnine — working notes

Next.js 16 (App Router, TypeScript, Tailwind v4) app, deployed on Vercel as **notcaviarnine.com**.
Independent frontend for CaviarNine's HyperStake (LSULP/XRD) contracts on Radix mainnet. See README.md for architecture.

## How to work on it

```bash
npm run dev
npm run build
npm run lint
npx tsx scripts/verify-math.mts   # must print "✓ EXACT" and "N/N exact" — run after touching lib/hyperstake/math.ts
```

## Rules of the road

- **Radix work → use the `/radix` skill** in `.claude/skills/radix` (guides in `references/`). Source checkouts are symlinked in
  `.repos/` (gitignored). Never import from `.repos`.
- Addresses live only in `lib/radix/config.ts`; they were verified live on-ledger. Never take them from the Scrypto repo's `build.rs`.
- Manifests mirror CaviarNine's originals: withdraw → TAKE_ALL_FROM_WORKTOP → call → ASSERT_WORKTOP_CONTAINS(min) →
  `deposit_batch(ENTIRE_WORKTOP)`. No `lock_fee` (the wallet adds it). Always return the entire worktop (partial fills).
- Decimal math is BigInt atto-units (`lib/hyperstake/math.ts`), mirroring Radix `Decimal`/I512 truncation. Don't use floats for
  anything that ends up in a manifest.
- Wallet: official `@radixdlt/radix-dapp-toolkit`, instantiated lazily on the client only (`lib/radix/rdt.ts`).
- Reads: Gateway via plain `fetch` (`lib/radix/gateway.ts`); `get_info` via `/transaction/preview`.
- DB (Neon, Drizzle) is only an event index for APR/volume/history; the app must degrade gracefully without `DATABASE_URL`.

## Secrets

- `.env.local` — Vercel-managed (`vercel env pull` **overwrites it**). Public `NEXT_PUBLIC_*` + `DATABASE_URL`.
- `.env.admin.local` — dApp-definition admin key (backup in `~/.config/notcaviarnine/dapp-admin.env`). Local scripts only.
  dApp definition account: `account_rdx128uzjf2yykk23z0yvenydh32k8svkxuzqaecvhmz4czyu9h7leqr0q`.
