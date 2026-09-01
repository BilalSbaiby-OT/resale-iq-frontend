# Design reference — how to use this directory

Everything here is a self-contained HTML+CSS file. No build step, no
external assets, no CDN — open any file directly in a browser. `designer`
reviews every UI PR against these; `frontend-eng` and `extension-eng`
implement from them.

## Files → what they map to

| File | Maps to (implement in / review against) | Notes |
|---|---|---|
| `design/tokens.json` | `src/app/globals.css`, `tailwind.config.ts`, `extension/content.css` | Every value cites its `path:line` source. Read `known_splits` before "fixing" a colour that looks inconsistent — WATCH's drifted third value was closed 2026-09-01 (`docs/product/DESIGN-REVIEW.md` §2, executed in `src/`); SKIP's site/extension split is deliberate (dark-card contrast) and stays. See `system_state` for the new quota/system colour role. |
| `design/extension-panel/confident.html` | `extension/content.js` `paint()` — the branch where `d.buy_below != null` and `d.confidence === "HIGH"`. Card chrome maps 1:1 to `extension/content.css` `.riq-card`/`.riq-buy`. | HIGH band: n ≥ 30, quality ≥ 70, snapshot < 48h (methodology.tsx). |
| `design/extension-panel/low-confidence.html` | Same `paint()` function, `d.confidence === "MEDIUM"` branch. | MEDIUM band: n ≥ 10, quality ≥ 40 (or HIGH but stale). Introduces a new visual element not yet in `content.css`: a dedicated "confidence pill" in the honesty tan (`#c4a574`) — currently the extension only shows confidence as a small uppercase label (`.riq-conf`), no pill. `extension-eng` needs new CSS for `.riq-conf-pill` / `.riq-honesty-note`; see the file's inline styles for exact values. |
| `design/extension-panel/insufficient.html` | `src/app/(dashboard)/verdict/page.tsx:139-148` (INSUFFICIENT_DATA branch, "NOT MEASURED" label) and the equivalent `extension/content.js` path where `d.buy_below == null` with no verdict. | No BUY/WATCH/SKIP tag rendered — the current extension code still shows `body` with `.riq-num.riq-muted` "not tracked" for this case (content.js `paint()`, `body` const), which reads as a broken lookup. This design replaces that with a full sentence in the number's slot plus an honest `n` and threshold line. This is the one state where implementation requires a real code change, not just a style pass — flagging for `extension-eng`. |
| `design/extension-panel/not-covered.html` | `src/app/(dashboard)/verdict/page.tsx:18` (UNKNOWN, "NO DATA") and `src/components/tools/free-checker.tsx:110-116`. | Distinct copy from `insufficient.html` on purpose — "not tracked" (coverage gap) vs "not enough data yet" (sample-size gap) are different failures and the current UI collapses both into similar grey "no data" text. This file names the six zero-model brands explicitly (`src/data/seo-brands.json` slugs: pull-bear, zara, bershka, mango, hugo-boss, calvin-klein) and says what happens next. |
| `design/landing/hero.html` | `src/app/page.tsx` hero section (~lines 57-103), `src/components/tools/free-checker.tsx`, `src/components/landing/extension-hero.tsx`. | This file's own headline (*"...that tells you when it doesn't know"*) was never landed in `t.heroTitle` — `docs/product/DESIGN-REVIEW.md` §4 explicitly recommends against the swap (a confident demo is still the right first "holy shit" moment) in favour of an **additive** honest-stat line. That line shipped 2026-09-01: `t.heroHonesty` in `src/lib/i18n.ts`, rendered under `t.heroFrom` in `page.tsx`. Headline stays `t.heroTitle` as-is. |
| `design/landing/pricing.html` | `src/components/landing/pricing-section.tsx`, `src/lib/pricing.ts` `TIERS`. | **Three tiers, not four** — confirmed landed (AM-3, Business €99 removed). `docs/audit/MONETIZATION.md` #0 independently verified the Pro-tier feature list matches backend entitlement gates exactly (REST API, Live Deal Finder, Order Planner, Price Compare all gate correctly). The Pro tier still *sells* Order Planner/REST API, which `demand-intel/CLAUDE.md`'s Hard-no list still names — `DECISIONS.md` A5 has this open as a docs-vs-reality reconciliation for the founder, not an entitlement bug; changing the tier copy is gated behind that decision, not a `design/` or `frontend-eng` call. |
| `design/extension-panel/quota-reached.html` | `extension/background.js:84,89` (429/LIMIT_REACHED) + `content.js` `paintStatus()` (extension, **not implemented this pass** — see below) · `src/components/tools/free-checker.tsx` LIMIT_REACHED branch, `src/app/(dashboard)/verdict/page.tsx` (**implemented 2026-09-01**, both site surfaces). | Site: real fields only (`message`, `limit`); `used_today` deliberately never rendered per this file's own design note (FUNNEL.md F-1, shared-IP quota). Extension: `content.js`/`background.js` are the Chrome-extension lane, flagged in `agent/LANES.md` as needing an explicit assignment before any agent edits it — not touched this pass. |
| `design/extension-panel/system-status.html` | `extension/content.js` `paintStatus()` (verify/rate/down branches, **not implemented this pass**, same lane-boundary reason as above) · `src/components/tools/free-checker.tsx` (**partially implemented 2026-09-01**: the severity split — self-serve neutral vs. genuine-error red — applied to the site's own form-validation-vs-fetch-failure split; a client-side fetch timeout added for the "still checking…" / PENDING case). | The site's `/api/verdict` never returns HTTP 429/403 for the anonymous checker (confirmed against `e2e/mock-backend.mjs` and `docs/audit/MONETIZATION.md`) — those two mockup states map only to authenticated endpoints and the extension, not this component. |

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

- Original pass did not touch `src/` or `extension/` — per the founder's
  directive, other agents own those trees concurrently, and everything here
  was a reference, not a patch. **Update, 2026-09-01:** the token-defect and
  LIMIT_REACHED-state findings below were executed directly in `src/`
  (branch `claude/designer/landing-truth`) on explicit instruction — see the
  quota-reached.html/system-status.html rows above for exactly what landed.
  `extension/*.js` (`content.js`, `background.js`) was still not touched —
  `agent/LANES.md` flags the Chrome extension as needing an explicit
  assignment before any agent edits it, and this pass had none. Only
  `extension/content.css` comments changed (no logic, no values).
- The exact backend cutoff for `INSUFFICIENT_DATA` (n < 8 per this task's
  brief) is not present anywhere in the frontend code I could find —
  `tokens.json` → `confidence_ladder.INSUFFICIENT_DATA.exact_n_cutoff`
  records this as UNKNOWN per OS §0 rule 2. `data-eng`/`backend-eng` should
  confirm the real constant and put it in `METRICS.md` before this number
  gets quoted anywhere public.
- **Update, 2026-09-01 (`docs/product/DESIGN-REVIEW.md` §2, executed in `src/`):**
  WATCH's three-way split is closed — the drifted `#eab308` is deleted from
  `free-checker.tsx` and `extension-hero.tsx`, both now read the real
  `--color-watch` token (`#f59e0b`); `#fbbf24` inside the extension panel
  stays, renamed `--riq-watch-oncard`, a documented dark-card contrast
  variant of the same token (the relationship `tokens.json` already granted
  SKIP's `#f87171`/`--riq-skip-oncard`). `design/landing/hero.html` updated
  to match. SKIP's split was never a defect — two deliberate values, kept.
- A new `system_state` colour role was added (`tokens.json`): a quota/system
  message (LIMIT_REACHED, rate-limit, unverified, connection failure) must
  never borrow a verdict colour, particularly not amber — `free-checker.tsx:44`
  was the one line that did, wearing WATCH's exact hex for an unrelated quota
  wall. Fixed in the same pass.
