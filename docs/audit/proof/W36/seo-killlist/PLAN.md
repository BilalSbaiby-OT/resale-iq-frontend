# SEO kill list — the 36 zero-model URLs, ready to execute

Written by `seo` (content-social lane), 2026-08-31. **Read-only research against
`resale-iq/src` — this file makes zero edits to that tree.** It is a plan for
whichever agent picks up the frontend-eng lane next (or a dedicated PR) to
execute as one clean change. Built on `docs/audit/MARKETING-AUDIT.md` §2/§3 —
does not re-derive those numbers, only re-verifies the exact slugs and adds the
execution mechanics.

Re-verified directly against `src/data/seo-brands.json` (read 2026-08-31): the 6
brands below all carry `models_tracked: 0`. Every other brand in the file has
`models_tracked` between 2 and 78. No other brand qualifies for this list.

---

## 1 — The single generation point

One JSON file drives all three consumers. Fix it there and the fix cascades
everywhere automatically — this is a **one-file, four-effect change**:

```
src/data/seo-brands.json                 ← the 6 brand entries live here
        │
        ├─→ src/lib/seo-categories.ts     BRANDS export (verbatim), and
        │                                  CATEGORIES (inverts BRANDS by
        │                                  category — see §4, cascade note)
        │
        ├─→ src/app/flip/[brand]/page.tsx              generateStaticParams()
        │     (brand hub page, 6 URLs)                   line 20-22
        │
        ├─→ src/app/flip/[brand]/[category]/page.tsx    generateStaticParams()
        │     (brand×category page, 30 URLs)              (not read this pass —
        │                                                   same BRANDS import,
        │                                                   same pattern)
        │
        └─→ src/app/sitemap.ts             brandPages (6) + brandCategoryPages
                                            (30), both `BRANDS.map(...)` /
                                            `BRANDS.flatMap(...)` — no separate
                                            sitemap source to edit
```

Removing the 6 brand objects from `seo-brands.json` (or filtering them at the
top of `seo-categories.ts` — either works, same effect) stops all three
consumers from producing the URL, in one edit. There is no second file that
needs a matching change to avoid drift.

---

## 2 — The 36 URLs, decision, and why

**Decision for all 36: DELETE outright**, not noindex, not sitemap-only removal.
Reasoning below the table.

| # | URL | Brand page? | GSC impressions (2026-06-01..08-28) | Indexed? | Decision |
|---|---|---|---|---|---|
| 1 | `/flip/pull-bear` | brand hub | 1 | **Indexed** (spot-checked 08-31) | DELETE |
| 2 | `/flip/pull-bear/hoodies` | category | 0 | not in GSC page report | DELETE |
| 3 | `/flip/pull-bear/jeans` | category | 0 | not in GSC page report | DELETE |
| 4 | `/flip/pull-bear/jackets` | category | 0 | not in GSC page report | DELETE |
| 5 | `/flip/pull-bear/t-shirts` | category | 0 | not in GSC page report | DELETE |
| 6 | `/flip/pull-bear/tracksuits` | category | 0 | not in GSC page report | DELETE |
| 7 | `/flip/zara` | brand hub | 0 (absent from top-53) | unchecked; sibling `/flip/zara/jeans` = "unknown to Google" | DELETE |
| 8 | `/flip/zara/jeans` | category | 0 | **"URL is unknown to Google"** (spot-checked 08-31) | DELETE |
| 9 | `/flip/zara/jackets` | category | 0 | not in GSC page report | DELETE |
| 10 | `/flip/zara/shirts` | category | 0 | not in GSC page report | DELETE |
| 11 | `/flip/zara/t-shirts` | category | 0 | not in GSC page report | DELETE |
| 12 | `/flip/zara/hoodies` | category | 0 | not in GSC page report | DELETE |
| 13 | `/flip/bershka` | brand hub | 2 | unchecked | DELETE |
| 14 | `/flip/bershka/jeans` | category | 0 | not in GSC page report | DELETE |
| 15 | `/flip/bershka/t-shirts` | category | 0 | not in GSC page report | DELETE |
| 16 | `/flip/bershka/jackets` | category | 0 | not in GSC page report | DELETE |
| 17 | `/flip/bershka/hoodies` | category | 0 | not in GSC page report | DELETE |
| 18 | `/flip/bershka/tracksuits` | category | 0 | not in GSC page report | DELETE |
| 19 | `/flip/mango` | brand hub | 1 | unchecked | DELETE |
| 20 | `/flip/mango/jeans` | category | 0 | not in GSC page report | DELETE |
| 21 | `/flip/mango/jackets` | category | 0 | not in GSC page report | DELETE |
| 22 | `/flip/mango/shirts` | category | 0 | not in GSC page report | DELETE |
| 23 | `/flip/mango/t-shirts` | category | 0 | not in GSC page report | DELETE |
| 24 | `/flip/mango/hoodies` | category | 0 | not in GSC page report | DELETE |
| 25 | `/flip/hugo-boss` | brand hub | 0 (absent from top-53) | unchecked | DELETE |
| 26 | `/flip/hugo-boss/shirts` | category | 0 | not in GSC page report | DELETE |
| 27 | `/flip/hugo-boss/t-shirts` | category | 0 | not in GSC page report | DELETE |
| 28 | `/flip/hugo-boss/hoodies` | category | 0 | not in GSC page report | DELETE |
| 29 | `/flip/hugo-boss/jackets` | category | 0 | not in GSC page report | DELETE |
| 30 | `/flip/hugo-boss/jeans` | category | 0 | not in GSC page report | DELETE |
| 31 | `/flip/calvin-klein` | brand hub | 3 | unchecked | DELETE |
| 32 | `/flip/calvin-klein/t-shirts` | category | 0 | not in GSC page report | DELETE |
| 33 | `/flip/calvin-klein/hoodies` | category | 0 | not in GSC page report | DELETE |
| 34 | `/flip/calvin-klein/shirts` | category | 0 | not in GSC page report | DELETE |
| 35 | `/flip/calvin-klein/jeans` | category | 0 | not in GSC page report | DELETE |
| 36 | `/flip/calvin-klein/bags` | category | 0 | not in GSC page report | DELETE |

Impression counts and the two spot-checks are `MARKETING-AUDIT.md` §2, re-cited
here, not re-pulled. Category slugs re-derived directly from
`src/data/seo-brands.json` + the `catSlug()` function in `seo-categories.ts`
(read 2026-08-31) — every one of the 30 category URLs above was computed, not
guessed, so this table can be diffed against a build's actual route list.

### Why delete, not noindex, not sitemap-only

The task allows three outcomes per URL. Considered all three, chose one:

- **Sitemap-only removal** (keep the page live and indexable, just stop
  advertising it): rejected. The page still renders "Models tracked: —" and
  still invites a visitor to check a real item in the extension, which then
  fails with "we have no model-level data for this item yet"
  (`SUPPORT-AUDIT.md` §3, §5-1). Leaving the page reachable — by direct link,
  by the `/flip` hub, by a bookmark — leaves the broken promise in place; it
  only stops Google from being the one to send someone into it.
- **Noindex, keep live**: rejected for the same reason, plus it is strictly
  worse than sitemap-only (Google still crawls it, spends budget on it, and it
  can still surface via `site:` search or an internal link even once
  deindexed). The one argument *for* noindex — preserving the real, non-zero
  `sold_7d`/`avg_price_eur` aggregate numbers these 6 brands do have — doesn't
  hold up: those aggregates are marketing copy sitting on top of a checker that
  cannot answer for the brand. That is exactly the "empty shell" `MARKETING-AUDIT.md`
  §2 names as the problem, not a reason to keep the shell reachable.
- **Delete**: matches `CLAUDE.md`'s explicit rule (*"kill 0-model pages, never
  add brands"*) and removes the failure mode at its root — a page that cannot
  be reached cannot disappoint anyone who reaches it. Cost is close to zero:
  0 of 36 URLs are indexed with real traffic; the single exception,
  `/flip/pull-bear` (1 impression, confirmed indexed), will show a transient
  "not found" in Search Console until Google recrawls and drops it — a one-URL,
  one-impression cost against removing a page that hands every visitor a dead
  end in the product.

---

## 3 — Mechanical execution (for whoever applies this)

1. In `src/data/seo-brands.json`, remove the 6 brand objects whose slug is
   `pull-bear`, `zara`, `bershka`, `mango`, `hugo-boss`, `calvin-klein`. (Or, if
   the data-eng lane can backfill `models_tracked` for any of them cheaply,
   backfilling is a valid alternative to deletion for that specific brand only
   — but per `MARKETING-AUDIT.md` §2 that's a pipeline question out of this
   plan's lane; treat it as the fallback, not the default.)
2. Rebuild and diff the sitemap (`/sitemap.xml`) — it should go from 230 URLs
   to 194 (230 − 36), with no brand or brand×category entry for the 6 slugs.
3. Rebuild and confirm `generateStaticParams()` for both
   `src/app/flip/[brand]/page.tsx` and `src/app/flip/[brand]/[category]/page.tsx`
   no longer produce the 36 routes — `curl -I` each of the 36 URLs above
   post-deploy and confirm they 404 (the existing `notFound()` call in
   `[brand]/page.tsx` line 56 already handles an unknown slug — no new code
   path needed for the brand pages; verify the category page has the same
   `notFound()` guard before assuming it, since this plan did not read that
   file this pass).
4. **Cascade check, don't skip this:** `CATEGORIES` in `seo-categories.ts` is
   built by inverting `BRANDS` per category (`buildCategories()`, iterates every
   `b.categories`). Removing these 6 brands also removes their entries from the
   **`/category/{category}` hub pages** — e.g. `/category/jeans` currently
   lists `pull-bear`, `zara`, `bershka`, `mango`, `hugo-boss`, `calvin-klein`
   among its brand entries; after this change it won't. The 9 `/category/*`
   pages themselves are not deleted (they're one-per-category, not
   one-per-brand), and `/category/*` currently has **zero GSC impressions
   already** (`MARKETING-AUDIT.md` §2), so this is a safe, low-risk side effect
   — but confirm no `/category/*` page ends up with an empty entries list after
   the removal (check `jeans`, `jackets`, `t-shirts`, `hoodies`, `tracksuits`,
   `shirts`, `bags` specifically — these are exactly the categories the 6
   removed brands sold in).
5. Optional but recommended: a permanent redirect from `/flip/pull-bear`
   specifically to `/flip` (the hub) rather than a bare 404, since it is the
   one URL in this set with a live indexed impression — a redirect preserves
   whatever residual link equity/UX that one URL has instead of dead-ending it.
   `next.config.ts` already has an `async redirects()` block (confirmed present,
   not read in detail this pass) — add the entry there. The other 35 have no
   comparable justification; a plain 404 is correct for them.

---

## 4 — Separately: the 79/230 indexation problem, and what fixes it

Not part of the kill list (these pages have real content, just no links to
them), but the task asked to say concretely what fixes it, so: **already
diagnosed and speced, not yet shipped.** `resale-iq-seo/seo-memory.md` P2 + P3
(read 2026-08-31) are the fix:

- **P2 — link the blog into the money pages.** The blog holds 84% of all
  impressions and is the site's only section with real ranking authority
  (`MARKETING-AUDIT.md` §2), but it currently links to nothing but `/blog`,
  `/register` and `/` (D3, link-extraction on
  `/blog/days-to-sell-vs-profit-margin`, 2026-08-28) — zero in-body links into
  `/flip`, `/category` or `/tools`. Fix: contextual in-body links from the top
  7 posts into the specific `/flip`, `/category` or `/tools` page each post is
  actually about, descriptive anchors, reciprocal links back.
- **P3 — the `/flip` and `/category` hubs need to actually work as hubs.**
  Both exist now (they 404'd until 2026-08-29 — `sitemap.ts`'s own comment
  confirms this cost 0 impressions across all 9 category URLs from
  2026-07-30..08-26), but linking depth from the site's one authoritative
  section is still near-zero (D3 above), which is consistent with the audit's
  own read: 148 of 230 URLs sit at "Discovered — currently not indexed," and
  that count is almost exactly the `/flip/*` (156) + `/category/*` (9) estate
  (165) minus what deletion above removes.

**Effect of §1-3 of this plan on the 79/230 number:** deleting the 36 dead URLs
drops the sitemap to 194 and should mechanically improve the *indexed-of-listed*
ratio even with zero new linking, because 30 of the removed URLs were sitting
in the discovered-not-crawled bucket contributing to the denominator without
ever being able to contribute to the numerator. But the larger fix for the
remaining ~130 `/flip/*` + 9 `/category/*` URLs is P2+P3 — internal links, not
sitemap hygiene. P2/P3 touch `resale-iq/src` (blog post bodies, hub pages) —
out of this plan's own lane (content-social/seo write only `growth`, `seo` repos
and `docs/`); hand this section to whichever agent owns `resale-iq/src` next.

---

## Sources

- `src/data/seo-brands.json`, `src/lib/seo-categories.ts`,
  `src/app/flip/[brand]/page.tsx`, `src/app/sitemap.ts`, `next.config.ts` — all
  read directly, 2026-08-31, read-only (no edits made).
- `docs/audit/MARKETING-AUDIT.md` §2, §3 — impressions, indexation spot-checks,
  the 36-URL brand/category breakdown (re-verified against source, not
  re-pulled from GSC).
- `docs/audit/SUPPORT-AUDIT.md` §3, §5-1 — the product-trust argument for
  deletion over noindex.
- `resale-iq-seo/seo-memory.md` P2, P3, D3 — the internal-linking fix, already
  speced, not re-derived here.
- `CLAUDE.md` (repo root) — "kill 0-model pages, never add brands."
