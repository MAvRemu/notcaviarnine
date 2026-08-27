# Security policy

Not CaviarNine is a non-custodial frontend: it never holds keys or funds. The worst-case impact of a frontend bug is a user
signing a transaction that does not match what they intended, so anything that could alter a transaction manifest, a quote,
or the minimum-output assertion is treated as critical.

## Reporting a vulnerability

Please report privately via **GitHub private vulnerability reporting**
(https://github.com/MAvRemu/notcaviarnine/security/advisories/new) or by email to **info@notcaviarnine.com**.

Do not open a public issue for security problems. You should get an acknowledgement within 72 hours. There is no bug bounty;
credit is given in the fix release if you want it.

## Scope

- This repository (frontend, API routes, indexer) and its deployment at notcaviarnine.com.
- **Out of scope**: the CaviarNine smart contracts (report to CaviarNine), the Radix Gateway/Wallet (report to RDX Works),
  third-party price data (Astrolescent).

## What we do

- Manifests are built only from constant addresses, the wallet-provided account and strictly parsed amounts; every action
  asserts a minimum output on-ledger and returns the entire worktop to the user's own account.
- Every transaction is previewed on the Gateway before the wallet is opened, and the previewed manifest is the one sent.
- CSP, frame-ancestors 'none', HSTS and related headers are set for every response.
- `main` is protected: signed commits, pull requests only, Dependabot enabled.
