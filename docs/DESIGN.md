# Design system — "control room"

Not CaviarNine looks like the instrument panel of a protocol that keeps running after its operators left:
dark ground, precise type, one electric-blue accent, yellow reserved for things to watch, and numbers you can trust at a glance.
It keeps CaviarNine's black-and-cream ground but replaces their yellow as the action colour, so the two sites are unmistakably different.

## Principles

1. **One accent.** Blue `#2f6fef` is the only colour that asks for action: primary buttons, the active tab, links on hover,
   the highlighted line of a headline, the wordmark's `NOT`. Never add a second brand colour. Green / yellow / red exist only as
   *status semantics* (healthy / watch / failing), never as decoration — yellow in particular means "keep an eye on this".
2. **Numbers are instruments.** Every number is monospaced and tabular (`.num`) so columns align and values can be compared
   by eye. Units follow the number in muted type (`1.2233 XRD`).
3. **Plain language.** Copy explains what something means for the user, never the protocol identifier. "Validator list"
   not `require_active`; "price feed" not "oracle". Jargon that survives must be explained in the same sentence.
4. **Quiet surfaces, loud facts.** Cards are hairline-bordered, barely lighter than the ground. The content — a live
   number, a status dot, a headline — carries the contrast, not the container.
5. **Honest state.** Anything live shows *when* it was read (`live · 4s ago`, `state v555,255,494`). Unknown values render
   as `—` or a skeleton, never as `0`.
6. **No inversions.** The whole site stays on the dark ground. A cream section was tried and read as a mistake.

## Tokens (`app/globals.css`)

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0b0b0b` | page ground |
| `--bg-deep` | `#141412` | inputs (`.field`), hover fills, stat bands |
| `--card` | `#111110` | card surfaces |
| `--line` | `#262521` | all hairlines, dividers, inactive bars |
| `--ink` | `#f6f2e8` | primary type (cream) |
| `--ink-soft` | `#d8d3c6` | body copy |
| `--muted` | `#8d887c` | labels, secondary text |
| `--accent` | `#2f6fef` | the one accent (actions) |
| `--ok` | `#3fae6a` | healthy status only |
| `--warn` | `#e9b400` | watch status only |
| `--danger` | `#e0563f` | failing status / errors only |

Exposed to Tailwind v4 via `@theme inline` as `bg-bg`, `text-ink`, `border-line`, `text-accent`, etc.

## Typography

- **Sans**: Geist (variable `--font-geist-sans`) for everything textual.
- **Mono**: Geist Mono (`--font-geist-mono`) for every number, address, timestamp and state version.
- **Display** `.display`: Geist 700, `letter-spacing −0.035em`, `line-height 1.0`. Hero `clamp(2.5rem, 7vw, 5.75rem)`;
  section titles `text-4xl md:text-5xl`; card titles `text-3xl md:text-4xl`.
- **Eyebrow** `.label`: 11px, `letter-spacing .16em`, uppercase, 600, muted. Precedes every section and every card.
- Body 15px / 1.55. Secondary 13–14px. Captions 11px.

## Components

| Class | Role | Notes |
|---|---|---|
| `.btn` | primary action | blue pill, white text, 700; hover → cream fill + soft blue glow; disabled → `bg-deep` + muted text |
| `.btn-ghost` | secondary action | transparent, hairline border; hover → cream fill |
| `.tab` | segmented control | active = blue pill with white text |
| `.card` | container | `--card` fill, 1px `--line`, radius 18 |
| `.field` | input well | `--bg-deep`, 1px `--line`, radius 16; focus-within → accent border |
| `.input` | amount input | mono 28px, no chrome; placeholder in `--line` |
| `.pill` | tag | hairline pill, 12px 600; colour by meaning (`text-ok` stake, `text-warn` unstake, muted remove) |
| `.dot` + `.dot-ok/-warn/-danger/-muted` | status | 8px, glows in its own colour |
| `.skeleton` | loading | shimmering `--bg-deep`; never show a fake number |

Radius scale: pills 999 · cards 18 · fields 16 · tiles 12 · small chips 8.
Spacing: page gutter 24px, max width 72rem (6xl); section padding `py-20`; card padding 20px (`p-5`).

## Patterns

- **Stat tile**: eyebrow label → mono value (xl–4xl) → one-line muted sub. Accent colour on the single most important value.
- **Responsive header**: gutters 16px on mobile, wallet button 36×120 on ≤640px (`--radix-connect-button-*` vars), 44×160 above; secondary links hidden below `md`.
- **Range bar**: hairline track, gradient fill from `--ok` to `--warn`, cream marker with a dark ring; bounds labelled in
  mono under the track.
- **Share bar**: two-tone (cream = XRD, blue = LSULP), legend dots match.
- **Readout row** (status page): dot + title | big mono metric + sub | plain sentence | `verify ↗` linking to the ledger.
- **Dependency flow**: SVG boxes stroked in their status colour; edges labelled with verbs ("uses", "gated by", "owned by").
  Dashed stroke = external/pending. Text always cream; never colour the text, only the stroke.
- **Transaction status**: one tinted line (`accent/10` blue while simulating or awaiting wallet, `ok/10` committed with a
  dashboard link, `danger/10` with a humanised error).

## Voice

Short, declarative, second person. State the fact, then what it means for the user.
Lead with the reassuring truth ("The pool is open to everyone"), follow with the caveat ("Only CaviarNine can update the list").
Credit CaviarNine where due; never imply affiliation. "Verify, don't trust" is the closing note, not the opening tone.

## Identity marks

- **Wordmark**: `NOT` in accent blue + `CaviarNine` in cream, both Geist 700, same cap height, `gap-2`.
- **Icon**: black rounded square, cream `N`, blue `9` (`public/icon.svg` → `app/icon.png`, `app/apple-icon.png`,
  `app/favicon.ico`, `public/dapp-icon.png`).
- **Tagline**: "CaviarNine is gone. But contracts never die." — the second sentence in blue.

## Communication rules (what we tell the customer)

- **Two product states only**: `Live` (green) and `Coming soon` (yellow). No "read-only", "preview", "beta".
- **A coming-soon page shows**: eyebrow · title · one plain sentence · the live numbers · one line "Coming soon · figures are read live
  from the ledger" · at most one outbound link (the original CaviarNine page while it lasts). No roadmap prose, no "what we know so
  far", no research notes, no links to specs or docs — those live in the repo for developers.
- **Reassurance once, not everywhere**: the non-custodial / your-funds-are-in-the-contracts message appears in the landing status
  section and the footer, not repeated on every page.
- **Never name internals**: no "spec", "oracle", "role", "manifest", "ledger state version" in customer-facing copy. Say "price
  feed", "approved validators", "transaction", "live".
- **Numbers over narrative**: if a fact can be a live number (pools, TVL, last refresh), show the number instead of describing it.
- **Product-neutral chrome**: browser titles, meta descriptions, the landing timeline and the status header describe the console,
  not HyperStake; product-specific words only inside that product's page.
