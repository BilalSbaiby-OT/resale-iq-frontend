# Design reference — how to use this directory

Everything here is a self-contained HTML+CSS file. No build step, no
external assets, no CDN — open any file directly in a browser. `designer`
reviews every UI PR against these; `frontend-eng` and `extension-eng`
implement from them.

## Files → what they map to

| File | Maps to (implement in / review against) | Notes |
|---|---|---|
| `design/tokens.json` | `src/app/globals.css`, `tailwind.config.ts`, `extension/content.css` | Every value cites its `path:line` source. Read `known_splits` before "fixing" a colour that looks inconsistent — some splits (WATCH amber, SKIP red) are real and currently live in three different values across site vs. extension; that is flagged, not resolved, here. Resolving it is a `src/`-touching change, out of `design/`'s remit. |
| `design/extension-panel/confident.html` | `extension/content.js` `paint()` — the branch where `d.buy_below != null` and `d.confidence === "HIGH"`. Card chrome maps 1:1 to `extension/content.css` `.riq-card`/`.riq-buy`. | HIGH band: n ≥ 30, quality ≥ 70, snapshot < 48h (methodology.tsx). |
| `design/extension-panel/low-confidence.html` | Same `paint()` function, `d.confidence === "MEDIUM"` branch. | MEDIUM band: n ≥ 10, quality ≥ 40 (or HIGH but stale). Introduces a new visual element not yet in `content.css`: a dedicated "confidence pill" in the honesty tan (`#c4a574`) — currently the extension only shows confidence as a small uppercase label (`.riq-conf`), no pill. `extension-eng` needs new CSS for `.riq-conf-pill` / `.riq-honesty-note`; see the file's inline styles for exact values. |
| `design/extension-panel/insufficient.html` | `src/app/(dashboard)/verdict/page.tsx:139-148` (INSUFFICIENT_DATA branch, "NOT MEASURED" label) and the equivalent `extension/content.js` path where `d.buy_below == null` with no verdict. | No BUY/WATCH/SKIP tag rendered — the current extension code still shows `body` with `.riq-num.riq-muted` "not tracked" for this case (content.js `paint()`, `body` const), which reads as a broken lookup. This design replaces that with a full sentence in the number's slot plus an honest `n` and threshold line. This is the one state where implementation requires a real code change, not just a style pass — flagging for `extension-eng`. |
| `design/extension-panel/not-covered.html` | `src/app/(dashboard)/verdict/page.tsx:18` (UNKNOWN, "NO DATA") and `src/components/tools/free-checker.tsx:110-116`. | Distinct copy from `insufficient.html` on purpose — "not tracked" (coverage gap) vs "not enough data yet" (sample-size gap) are different failures and the current UI collapses both into similar grey "no data" text. This file names the six zero-model brands explicitly (`src/data/seo-brands.json` slugs: pull-bear, zara, bershka, mango, hugo-boss, calvin-klein) and says what happens next. |
| `design/landing/hero.html` | `src/app/page.tsx` hero section (~lines 57-103), `src/components/tools/free-checker.tsx`, `src/components/landing/extension-hero.tsx`. | Headline changed to the OS §6 message: *"The Vinted price check that tells you when it doesn't know."* Live copy currently uses a different H1 (`t.heroTitle` from `src/lib/i18n`) — updating it is an i18n-file change across all locales, not just `page.tsx`; flag for `frontend-eng` + whoever owns `src/lib/i18n`. |
| `design/landing/pricing.html` | `src/components/landing/pricing-section.tsx`, `src/lib/pricing.ts` `TIERS`. | **Three tiers, not four.** Business (€99, `id: "business"`, anchor tier) is removed here on the assumption the other agent's founder-approved removal lands in `pricing.ts`. If that PR hasn't merged yet, this reference is already ahead of `src/` — check `git log -- src/lib/pricing.ts` before treating a diff against this file as a regression. |

## What "reviewer diff" means here

For the extension panel states: open the reference file and the live
extension side by side on the same simulated (or real) Vinted listing.
Check, in order:
1. Card chrome (232px width, 12px radius, `13px 15px` padding, left-accent
   border, shadow) is pixel-identical — that part must never drift, it's
   what makes all four states read as one product.
2. The state-specific content (number vs. sentence vs. coverage note)
   matches the reference's information hierarchy: verdict/confidence →
   number or its replacement → `n` and date range → explanation → link.
3. Colour used for confidence is never a verdict colour (green/amber/red)
   — confidence is tan (`#c4a574`) or neutral (`#8b99b8`/`#5b6b8c`), verdict
   is BUY/WATCH/SKIP's own colour. Mixing these two channels is the single
   most common way this design gets flattened during implementation.

For landing: diff against `hero.html` and `pricing.html` at 1080px (desktop)
and ≤560px (mobile breakpoint already in `globals.css` `.riq-hero`).

## Accessibility checklist (qa-eng re-checks, this is what to expect)

- Contrast: body/label text pairs in every file meet WCAG AA against their
  actual background (verified visually against `--riq-bg: #12151d` and the
  light Vinted-mock `--page-bg: #f4f5f7`).
- All interactive elements (hide button, "how this is calculated" link,
  CTA buttons) have a visible `:focus-visible` outline and an `aria-label`
  where the visible text alone doesn't say what the control does.
- No colour-only signal: every verdict/confidence state pairs its colour
  with a text label (never just a coloured dot or border).

## Known gaps / things this pass did not do

- Did not touch `src/` or `extension/` — per the founder's directive, two
  other agents own those trees concurrently. Everything above is a
  reference, not a patch.
- The exact backend cutoff for `INSUFFICIENT_DATA` (n < 8 per this task's
  brief) is not present anywhere in the frontend code I could find —
  `tokens.json` → `confidence_ladder.INSUFFICIENT_DATA.exact_n_cutoff`
  records this as UNKNOWN per OS §0 rule 2. `data-eng`/`backend-eng` should
  confirm the real constant and put it in `METRICS.md` before this number
  gets quoted anywhere public.
- WATCH and SKIP each render as three different colour values across
  site/extension/dashboard (`tokens.json` → `known_splits`). This design
  pass used the extension's own values (`#fbbf24`/`#f87171`) inside the
  extension-panel files, and the dashboard's values (`#eab308`) inside the
  landing files, matching what's actually live on each surface — it does
  not unify them. That's a real follow-up, flagged, not silently fixed.
