# Design system — "control room"

Not CaviarNine looks like the instrument panel of a protocol that keeps running after its operators left:
dark ground, precise type, one warning-yellow accent, and numbers you can trust at a glance.
It is CaviarNine's own palette (black / cream / yellow) kept, not inverted — the continuity is the point.

## Principles

1. **One accent.** Yellow `#e9b400` is the only colour that asks for attention. It marks primary actions, the active tab,
   "watch" states and the highlighted line of a headline. Never add a second brand colour. Green and red exist only as
   *status semantics* (healthy / failing), never as decoration.
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
| `--accent` | `#e9b400` | the one accent |
| `--ok` | `#3fae6a` | healthy status only |
| `--warn` | `#e9b400` | watch status (same hue as accent, on purpose) |
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
| `.btn` | primary action | yellow pill, black text, 700; hover → cream fill + soft yellow glow; disabled → `bg-deep` + muted text |
| `.btn-ghost` | secondary action | transparent, hairline border; hover → cream fill |
| `.tab` | segmented control | active = yellow pill with black text |
| `.card` | container | `--card` fill, 1px `--line`, radius 18 |
| `.field` | input well | `--bg-deep`, 1px `--line`, radius 16; focus-within → accent border |
| `.input` | amount input | mono 28px, no chrome; placeholder in `--line` |
| `.pill` | tag | hairline pill, 12px 600; colour by meaning (`text-ok` stake, `text-accent` unstake, muted remove) |
| `.dot` + `.dot-ok/-warn/-danger/-muted` | status | 8px, glows in its own colour |
| `.skeleton` | loading | shimmering `--bg-deep`; never show a fake number |

Radius scale: pills 999 · cards 18 · fields 16 · tiles 12 · small chips 8.
Spacing: page gutter 24px, max width 72rem (6xl); section padding `py-20`; card padding 20px (`p-5`).

## Patterns

- **Stat tile**: eyebrow label → mono value (xl–4xl) → one-line muted sub. Accent colour on the single most important value.
- **Range bar**: hairline track, gradient fill from `--ok` to `--accent`, cream marker with a dark ring; bounds labelled in
  mono under the track.
- **Share bar**: two-tone (cream = XRD, yellow = LSULP), legend dots match.
- **Readout row** (status page): dot + title | big mono metric + sub | plain sentence | `verify ↗` linking to the ledger.
- **Dependency flow**: SVG boxes stroked in their status colour; edges labelled with verbs ("uses", "gated by", "owned by").
  Dashed stroke = external/pending. Text always cream; never colour the text, only the stroke.
- **Transaction status**: one tinted line (`accent/10` while simulating or awaiting wallet, `ok/10` committed with a
  dashboard link, `danger/10` with a humanised error).

## Voice

Short, declarative, second person. State the fact, then what it means for the user.
Lead with the reassuring truth ("The pool is open to everyone"), follow with the caveat ("Only CaviarNine can update the list").
Credit CaviarNine where due; never imply affiliation. "Verify, don't trust" is the closing note, not the opening tone.

## Identity marks

- **Wordmark**: `NOT` in accent yellow + `CaviarNine` in cream, both Geist 700, same cap height, `gap-2`.
- **Icon**: black rounded square, cream `N`, yellow `9` (`public/icon.svg` → `app/icon.png`, `app/apple-icon.png`,
  `app/favicon.ico`, `public/dapp-icon.png`).
- **Tagline**: "CaviarNine is gone. But contracts never die." — the second sentence in yellow.
