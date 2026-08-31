# Humanize pass — claim-neutral copy changes, W36

Branch: `claude/content/humanize-frontend`, off `claude/frontend-eng/truth-pass-and-cut-business`
(do not undo the truth pass — verified `docs/audit/proof/W36/truth/CHANGES.md` first and confirmed
none of it is touched here). Verified green on this branch: `npx tsc --noEmit`, `npm run build`,
`npm run check:tracked`, `check:warehouse`, `check:market-proof`, `check:isolation`.

## What this pass actually found

The brief was to rewrite the front end so it reads like a person wrote it — strip tricolons, empty
intensifiers (seamlessly, effortlessly, unlock, leverage, elevate…), hedge-stacking, "whether you're
X or Y" openers, and feature lists that describe mechanism instead of outcome.

I read the whole surface before editing anything: `/`, `/methodology` (the reference, not touched),
`src/lib/i18n.ts` (landing hero, all 3 locales), `src/components/landing/*` (extension-hero,
live-market-proof, payback-calculator, pricing-section), `src/lib/pricing.ts`, pricing/paywall
(`src/components/layout/paywall.tsx`), `src/components/ui/unlock-panel.tsx`, the full dashboard
(`dashboard`, `account`, `verdict`, `deals`, `watchlist`, `portfolio`, `brands`, `trends`, `market`,
`search`, `compare`, `calculator`, `authenticity`, `order-planner`), all six auth pages (register,
login, forgot-password, check-email, verify-email, reset-password), `error.tsx` / `not-found.tsx`,
`/manual` index, `/blog` index + `[slug]` wrapper, `/tools` index, `/flip/[brand]` +
`src/lib/flip-narrative.ts`, `/category/[category]`, `/data`, `/api-docs`, `/support`, root
`layout.tsx` metadata, `src/components/tools/free-checker.tsx`, `welcome-banner.tsx`, `smart-cta.tsx`,
the dashboard chrome (`app-shell.tsx`, `sidebar.tsx`), and the shared UI strings (`outcome-prompt.tsx`,
`momentum-warmup-notice.tsx`, `freshness-notice.tsx`, `median-n.tsx`, `watched-sample.ts`,
`trial-copy.ts`) — plus the Chrome extension panel copy (`extension/content.js`, all 6 languages).

Also grepped the whole `src/` and `extension/` tree for every tell on the banned list, plus a second
pass for `utilize / in order to / a wide range of / ensure that / the ultimate / unparalleled /
industry-leading / next-generation / one-stop shop / take control / rest assured / dive right in`
and similar — zero hits outside the six lines below.

**Finding, stated plainly rather than papered over:** most of this front end was already rewritten in
this voice before this pass started. The commit history and inline comments (e.g. paywall.tsx:
"TONE RULE — this must be encouraging, never alarming... no invented statistics"; payback-calculator.tsx:
"HONESTY RULE — we do NOT claim a hit rate... any such figure would be fabricated"; flip-narrative.ts:
an entire module built specifically to replace templated brand-page prose with numbers-driven,
per-brand sentences) show deliberate, prior anti-AI-tell work, and it holds up under a full read: no
tricolons, no "whether you're a beginner or a pro", no feature lists dressed as outcomes, numbers
that admit their own limits instead of rounding up. Manufacturing 25 "before was robotic, after is
human" pairs against copy that was already this specific would be exactly the kind of invented
result OS §0 rule 2/6 exists to catch. What follows is every genuine change made, not a padded list.

## Changes

| # | File | Old | New | Why |
|---|---|---|---|---|
| 1 | `src/app/not-found.tsx` | "The link may be broken or the page may have moved. Let's get you back on track." | "The link may be broken, or the page may have moved." | Cut the stock transitional close — the two buttons directly below (Dashboard / Home) already do the "getting back on track"; the sentence was doing nothing but padding. |
| 2 | `src/components/layout/paywall.tsx` | "...Upgrade to unlock the scale toolkit — cancel anytime." | "...Upgrade for the tools that let you source at volume — cancel anytime." | "Unlock the scale toolkit" is a vague noun phrase; the new line names the actual outcome (source at volume) and echoes the headline directly above it ("Source at volume. Track five markets, search 26."). |
| 3 | `src/app/(auth)/register/page.tsx` | "Start free, or pick a plan to unlock the full toolkit. Cancel anytime." | "Start free, or pick a plan for the full toolkit. Cancel anytime." | "Unlock" as a bare marketing verb, not the literal unlock mechanic used elsewhere on the page (the free-tier "unlocks" quota is a real, named feature and was left alone everywhere it means that). |
| 4 | `src/app/api-docs/page.tsx` | "The API is included with Pro. Generate your key from your account page in seconds." | "The API is included with Pro. Generate your key from your account page." | "In seconds" is an unverifiable time claim with no measurement behind it — the exact shape OS §0 rule 2 flags for a number with no source. Cut, not replaced with another guess. |
| 5 | `src/app/layout.tsx` (JSON-LD Organization description) | "...buy-below price and best sizes. Vinted is the first marketplace." | "...buy-below price and best sizes. Vinted is the first marketplace it covers." | As written this reads as "Vinted is the first marketplace [in existence]," which is false and confusing. `src/app/llms.txt/route.ts:41` already states the real claim in full ("Vinted is the first marketplace we cover; the intelligence layer is not Vinted-only") — this brings the compressed copy back in line with it, no new claim added. |
| 6 | `src/lib/i18n.ts` (`en.heroBody`, landing hero) | "...then BUY, WATCH or SKIP. Vinted is the first marketplace." | "...then BUY, WATCH or SKIP. Vinted is the first marketplace it covers." | Same ambiguity, same fix, same source sentence in `llms.txt`. **Not applied to `fr`/`es`** in the same file — those two locales don't share the ambiguity as written (`fr`: "Vinted d'abord" already reads as "Vinted first"; `es`: "Vinted es el primer marketplace" has the same gap but I don't have working fluency to guarantee a clean fix and the brief says leave non-English copy alone). Flagged below for the founder. |

Six files, six strings. No number, date range, or `n` was touched anywhere in this pass — everything
above is a rewording, not a fact change.

## Left alone on purpose

- **`/methodology`** — not touched, per instruction. It's the reference voice this pass was
  measured against.
- **The "sold vs asking" framing** — per the truth pass's note, this is the CEO's in-progress rewrite;
  nothing echoing it was touched.
- **Non-English pages** — `/blog/como-poner-precio-en-vinted` (the live Spanish test) was read, not
  edited. It is fine on its own terms and touching it risks the test's validity.
- **`fr`/`es` in `src/lib/i18n.ts`** — see row 6. The Spanish hero line carries the same minor
  ambiguity as the English one did; left alone rather than risk a bad translation. Worth a native
  speaker's five-minute look, not urgent.
- **Long-form content bodies** (`src/data/manual.ts`, `manual-2.ts`, `blog-posts.ts`, `blog-posts-2.ts`,
  `blog-posts-3.ts` — 2,391 lines) — grepped for every tell on the list; the "optimise / boost" hits
  that came back were legitimate uses (a Vinted feature literally named "Boosted Listings"; "optimise
  for sell-through" as a real trade-off, not filler) or a blog-post title asking a genuine question.
  Rewriting 2,391 lines of already-clean prose to hit a page-count target was not done.

## Number with no visible source, flagged per OS §0 rule 2

None found in this pass that weren't already caught and fixed by the truth pass (see
`docs/audit/proof/W36/truth/CHANGES.md` §5 — the cross-domain arbitrage percentages, already pulled).
Everything customer-facing I read traces to `market-numbers.ts`, `stats.ts`, or a named `config.py`
constant cited in a comment.
