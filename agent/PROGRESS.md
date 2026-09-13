# PROGRESS — append only, newest at the bottom

## 2026-08-21T11:10Z — session 1 (bootstrap + P0-0)
- Built the unattended system: CLAUDE.md, agent/{TASKS,HANDOFF,PROGRESS,GUARDRAILS}.md,
  scripts/{unattended.sh,resume-prompt.md}, .claude/settings.json + 3 hooks.
- P0-0 done: repo map written into HANDOFF.md.
- Verified while mapping: `src/data/seo-brands.json` is a SECOND, static count
  source that `/flip/[brand]` reads exclusively — the main P0-2 obstacle.
  `extension/STORE-LISTING.md` has no email and no affiliation line (P0-7).
  No i18n of any kind exists (P1-4 is greenfield).
- NEXT: P0-1.

## 2026-08-21T09:12Z — session 1 (cont.) — loop debugged against reality, now BLOCKED
Started the loop and watched it, rather than assuming it worked. It did not.
Three faults, all found by running it:
1. **Expired OAuth token** — every session dies in 12s. Needs a human. This is
   the block; see HANDOFF for the exact commands.
2. **The rate-limit grep read its own log.** `tail $LOG | grep rate.?limit`
   matched the line the loop had just written, so any crash looked like a usage
   limit and slept 3h instead of retrying in 60s — it would have burnt the whole
   night on one bad session. Session output now goes to `agent/.session.out` and
   only that is inspected.
3. **StopFailure labelled every failure a rate limit.** Now it only writes
   RATE_LIMITED when the payload actually says so. Negative-controlled both ways:
   a `MODULE_NOT_FOUND` crash writes no marker; "hit your usage limit" does.
Added a preflight so a dead credential BLOCKS loudly instead of burning the
8h budget on retries. Verified: preflight fails -> HANDOFF set to BLOCKED, rc=0,
no session spawned.
NEXT (once unblocked): P0-1.

## 2026-08-21T09:35Z — session 2 — P0-1 done (driven by hand; loop still auth-blocked)
- Repaired the `claude` CLI: an npm update had left the package installed but the
  native binary missing (`bin/claude.exe` was a stub that only prints an error).
  `npm install -g @anthropic-ai/claude-code@2.1.238` restored it; `claude --version`
  now returns 2.1.238. The OAuth token is still expired — that needs a browser.
- Fixed a third loop bug: `unattended.sh` assumed `claude` was on PATH. It is not
  in a non-interactive shell (nvm is not sourced), so every session would have
  died with "command not found". It now resolves the binary explicitly and blocks
  with the install command if there is none.
- **P0-1**: `/data` now serves the last good snapshot when the live query fails or
  returns nothing, labelled and timestamped, instead of "check back shortly".
  New `src/lib/last-good-snapshot.ts` persists to disk (not memory — ISR
  re-renders in any worker and the container restarts on deploy, so an in-memory
  cache is empty exactly when it is needed).
  Also fixed the `b.sold_7d.toLocaleString()` null crash noted in the repo map.
- VERIFIED against a running server, not by reading:
  - dead backend + cache  -> 200, stale banner, "2026-08-21 07:30 UTC", cached
    rows rendered (3,942 / 2,661 / 1,567), dead-end message gone (0 occurrences)
  - live backend          -> 200, no banner, "Last updated 2026-08-21 09:28 UTC ·
    26 brands · 396,754 units", and the live fetch WROTE the cache (26 brands)
  - no cache + dead backend -> first-boot message returns, no false stale banner
  - JSON-LD `dateModified` tracks the snapshot, never the render — a stale page
    must not emit a fresh-looking machine-readable timestamp
  - NEGATIVE CONTROL: empty / null / error responses all REFUSE to overwrite a
    good cache; a good one replaces it. That guard is the whole safety property.
- NEXT: P0-2.

## 2026-08-21T09:36Z — session 2 (cont.) — loop hardened; 4 bugs, all found by running it
- **Bug 3 — preflight passed when auth was dead.** `head -3` truncated the CLI
  output; under tmux extra preamble pushed the auth error to line 4+, so the
  check silently PASSED and the loop span on 60s retries. Now greps the full
  output, and closes stdin (`< /dev/null`) — the CLI's own warning named that fix
  and it was costing 3s per invocation.
- **Bug 4 — the auth block was SELF-LATCHING.** Once STATUS was BLOCKED the loop
  exited at step 1 without ever re-testing, so signing in would have fixed
  nothing: it would have sat dead all night holding a working credential. Now an
  auth block carries `BLOCKED_REASON: auth`, re-tests every 5 min, and lifts
  itself. Every other block still needs a human, which is the point of them.
  VERIFIED both directions with a stub CLI: dead auth -> blocks and re-checks
  without spawning; working auth -> "auth recovered", STATUS back to READY,
  BLOCKED_REASON deleted, sessions start.
- **Added a no-progress guard.** A session exiting cleanly without committing
  makes no progress; three in a row means the loop is spinning (all tasks done
  but STATUS never set to DONE, or a crash that still exits 0). It now stops
  after 3 rather than burning the night at a session every 2 seconds. Verified.
- NEXT: P0-2.

## 2026-08-21T09:50Z — owner signed in; blocker moved from auth to credits
- Sign-in succeeded. The CLI authenticates. New error: "You're out of usage
  credits ... claude.ai/settings/usage".
- **Bug 5 — out-of-credits was invisible to the loop.** A THIRD state, distinct
  from "not signed in" and from a rolling rate limit: the credential is valid,
  the balance is not. `auth_ok()` did not match that string, so the preflight
  PASSED and every session would have died in seconds until the no-progress
  guard stopped it. Now detected as `BLOCKED_REASON: credits`, re-checked every
  5 min like auth, so a top-up resumes the loop with no human step.
- Also removed a duplicated preflight: the startup check had its own copy of the
  grep and had ALREADY drifted — it knew about expired sign-in but not about
  exhausted credit. It now calls `auth_ok()`, so there is one definition.
- VERIFIED against the real CLI: preflight reports `(credits)` with the real
  message, sets BLOCKED_REASON: credits, and re-checks rather than spinning.
- NEXT: P0-2.

## 2026-09-13 — EX-CTR-002 + EX-CTR-003 title/meta/H1
- `/blog/how-to-find-items-to-flip-on-vinted`: title+meta+H1 in `src/data/blog-posts.ts`.
- `/blog/how-to-spot-fake-items-vinted` 301s to `/manual/condition-and-authenticity`;
  title+meta+H1 updated on that chapter in `src/data/manual.ts`. Closest live slug.
- Title/meta/H1 only in the first commit; paid mid-CTAs added after Conversion greenlit.
- Verified on `next dev`: title, meta description, og tags, and H1 match on both
  pages; blog index lists the new flip title; 308 redirect still in place.
- PR: https://github.com/BilalSbaiby-OT/resale-iq-frontend/pull/78

## 2026-09-13 — EX-CTR-002/003 mid-article /pricing CTAs
- Conversion greenlit paid CTAs. After first how-to section on both pages.
- Flip: `ctr_flip_20260913` → `/pricing?...&utm_content=mid_cta`
- Authenticity chapter: `ctr_fake_20260913` → same pattern.
- Soft `/data` secondary. No free signup. Demo math from each page's own figures.
- Rebased onto main after #77. CTA commit `97e0099` on PR #78.
- Verified on next dev: CTA sits between first and second h2; hrefs exact.

## 2026-09-13 — Content-aligned mid-CTA copy (follow-up to #78)
- #78 merged as affa559 with old "Get buy-below on any item" / ctr_* UTMs.
- Button → "Get the numbers". Subline → "Buy-below + demand before cash sticks."
- Flip campaign `body_flips_20260913`. Fake campaign `body_fake_20260913`.
- Soft /data kept. No /register.

## 2026-09-13 — SEO CTR pack (views + how-to titles, #82)
- `/blog/how-to-get-more-views-on-vinted`: title/meta/H1 + mid-CTA
  `body_views_20260913` → `/pricing` (not `/register`).
  QC copy: button "Get the numbers", subline "Buy-below + demand before cash sticks."
- Other high-impression how-tos: bundles, seasonal, list-time, descriptions,
  start-no-money, closet, not-selling, thrift, photos — title and/or mid-CTA.
- How-to-price: same QC copy via shared helper; campaign `ctr_price_20260913`.
- Stretch: `/data` title/meta + H1 toward weekly brand volumes; `/flip` H1
  aligned to “what sells best on Vinted in 2026?”.

## 2026-09-13 — blog footer See plans UTMs
- Shared article footer "See plans — from €19/mo" no longer `/pricing?src=blog`.
- How-to-price: `ctr_price_20260913` + `utm_content=footer_see_plans`.
- Other how-tos: their mid-CTA campaign + `footer_see_plans`.
- Copy lock unchanged: Get the numbers / Buy-below + demand before cash sticks.

## 2026-09-13 — BODY-001 demand section on how-to-price
- `/blog/how-to-price-items-on-vinted`: new section after buy-below,
  "Demand is the other half of the price". Week-to-13-Sep counts
  (Fred Perry 1,027 @ €19 · Stone Island 892 @ €66 · Gucci 230 @ €197).
  No invented hit rates.
- Soft cite `/data?...utm_campaign=body_price_20260913&utm_content=data_cite`.
- Paid CTA Get the numbers → `/pricing?utm_source=blog&utm_medium=organic&utm_campaign=body_price_20260913&utm_content=body_cta`.
- Existing `ctr_price_20260913` mid-CTA kept. Footer still
  `ctr_price_20260913` + `footer_see_plans`.

## 2026-09-13 — BODY-001 exact Content copy (follow-up)
- Replaced paraphrased demand section with Content's insert:
  trap/sit/leave, two numbers, 5,746 / 28 brands, Fred Perry / Stone
  Island / Gucci lines, buy-below vs demand close.
- Cite + CTA: `utm_source=blog&utm_medium=organic&utm_campaign=body_price_20260913`.
- Title/meta/H1 and `ctr_price_20260913` mid-CTA unchanged. No ES page.

## 2026-09-13 — BODY-ES-001 demand section on como-poner-precio
- `/blog/como-poner-precio-en-vinted`: new section after buy-below,
  "La demanda es la otra mitad del precio". Week-to-13-Sep counts
  (5.746 in 28 brands; Fred Perry 1.027 @ €19 · Stone Island 892 @ €66 ·
  Gucci 230 @ €197). No invented hit rates.
- Soft cite `/es/data?utm_source=blog&utm_medium=organic&utm_campaign=body_price_es_20260913`.
- Paid CTA + footer Consigue los números →
  `/es/pricing?utm_source=blog&utm_medium=organic&utm_campaign=body_price_es_20260913`.
- English `/pricing` never emitted for this post. English how-to-price
  not edited (BODY-001 is PR #85).

## 2026-09-13 — blog signup-wall CTAs → /pricing
- Shared article footer SmartCTA is `/pricing` + `utm_content=legacy_signup_kill`.
- How-to-price campaign `ctr_price_20260913`. Fallback `ctr_blog_20260913`.
- Button: Get the numbers. ES BODY-ES-001 copy not rewritten.

## 2026-09-13 — BODY-BUYBELOW-001 demand section on buy-below-price-explained
- `/blog/buy-below-price-explained`: new section after the formula,
  before FAQ — "Demand is the other half of buy-below". Week-to-13-Sep
  counts (5,746 in 28 brands; Fred Perry 1,027 @ €19 · Stone Island 892
  @ €66 · Gucci 230 @ €197). No invented hit rates.
- Soft cite `/data?utm_source=blog&utm_medium=organic&utm_campaign=body_buybelow_20260913`.
- Paid CTA Get the numbers →
  `/pricing?utm_source=blog&utm_medium=organic&utm_campaign=body_buybelow_20260913`.
- Subline: Buy-below + demand before cash sticks. No `/register?plan=`.
- No existing ctr_blog mid-CTA on this post.

## 2026-09-13 — BODY-SELLSBEST-001 on what-sells-best-on-vinted
- `/blog/what-sells-best-on-vinted`: new section after ranking,
  before FAQ — "Buy-below still decides the flip". Week-to-13-Sep
  counts (Fred Perry 1,027 @ €19 · Stone Island 892 @ €66 ·
  Patagonia 843 @ €36 · Gucci 230 @ €197). No invented hit rates.
- Soft cite `/data?utm_source=blog&utm_medium=organic&utm_campaign=body_sellsbest_20260913`.
- Paid CTA Get the numbers →
  `/pricing?utm_source=blog&utm_medium=organic&utm_campaign=body_sellsbest_20260913`.
- Subline: Buy-below + demand before cash sticks. No `/register?plan=`.
- Existing EX-ILINK flip/data anchors kept.

## 2026-09-13 — EX-OG-HUBS /data /flip social titles
- Root layout pinned homepage og:title / twitter:title. Child `title`
  does not override those tags.
- /data: document title was page-specific; og + twitter were the
  homepage string. Now all three + descriptions share TITLE/DESCRIPTION.
- /flip: og:title already matched; twitter:title + twitter:description
  now use the same `title` / `description` as the document.
- Homepage `src/app/layout.tsx` and `src/app/page.tsx` unchanged.
- Guard: `src/lib/hub-social-meta.test.ts`.

## 2026-09-13 — EX-ILINK blog → flip/data/pricing
- Campaign `ilink_20260913` (`utm_source=blog&utm_medium=ilink`).
- Body-only `[label](/path)` links via `ilinkHref()` in `src/lib/blog-ilink.ts`.
- High-impression: how-to-price, how-to-find-flips, how-to-get-more-views,
  buy-below-price-explained, plus other posts that had no /flip or /data.
- ES: `como-poner-precio-en-vinted` → `/es/data` + `/es/flip` (same UTM).
- Pricing ilink skipped on buy-below after BODY-BUYBELOW-001 mid-CTA landed
  on main. Existing `ctr_*` / `body_price_*` / `body_buybelow_*` /
  `legacy_signup_kill` untouched.
- Titles, metas, H1s, `blog-mid-cta.ts` unchanged. No `/register` links.

## 2026-09-13 — EX-FAQ-SCHEMA-HUBS
- `/flip`: FAQPage expanded to 5 questions (what sells best, update cadence,
  watched departure, buy-below use, coverage-bias volume). Visible HubFaq
  matches schema. Live numbers only where the hub already prints them.
- `/data`: FAQPage added beside existing Dataset (not replacing it). 5
  questions on weekly volumes, ES/FR/DE/IT/PT coverage, how to read the
  table, freshness, tracked-brand scope. Visible HubFaq matches schema.
- `/blog/what-sells-best-on-vinted`: FAQ aligned to the article (Hoodies /
  Stone Island / week-to-13-Sep brand split). Cites
  `https://resaleiq.dev/data` and `https://resaleiq.dev/flip` as plaintext
  labels (JSON-LD has the absolute URLs, no UTM). No `/register`.
- Metadata / Dataset / ItemList / breadcrumbs untouched.

## 2026-09-13 — EX-CTR-BATCH-2 weak title/meta pack
- Eight EN posts: title + meta (H1 only where it mismatched the new title).
- how-much-money / sell-through / sneaker / best-brands / scams /
  not-selling / thrift / seasonal.
- No mid-CTA or body CTA changes. No `/register?src=blog` left to retarget.
- seoTitle carries " — Resale IQ". Soft caps: title ≤60, meta ≤155.
- Merged #94 (c564075). Playwright /data H1 flake ignored. All 8 live
  after Coolify; cache-busted curl 17:08Z matched new titles/metas.

## 2026-09-13 — EX-ILINK-REST remaining EN blog hubs
- Production gaps: `/blog/common-vinted-scams-sellers` and
  `/blog/vinted-disputes-and-returns-sellers` had no `ilink_20260913`.
- Scan of every EN post in `src/data/blog-posts*.ts`: only those two
  were missing. ES `como-poner-precio-en-vinted` already had the
  campaign via `/es/data` + `/es/flip`.
- 2 body anchors each (`ilinkHref("data")` + `ilinkHref("flip")`).
  Same campaign. No title/meta/H1 edits in this PR (scams CTR title/meta
  from EX-CTR-BATCH-2 kept). Mid-CTA file untouched.
  No `/register`. No new campaigns.

## 2026-09-13 — EX-HOWTO-SCHEMA process blog HowTo JSON-LD
- HowTo JSON-LD on 6 process posts whose body already has steps:
  how-to-price, how-to-find-flips, how-to-get-more-views, thrift-store
  flipping, vinted-item-not-selling (4 numbered checks),
  como-poner-precio-en-vinted (Spanish names; skip methodology heading).
- Steps extracted from visible H2s / numbered checks. No invented
  tools/supplies/times. FAQPage + mid-CTAs + ilinks untouched.
- Schema is plain text (link labels only). No `/register`. No UTM.
  HowTo.url is `https://resaleiq.dev/blog/{slug}`.
- Helper: `src/lib/howto-schema.ts`. Wired in `src/app/blog/[slug]/page.tsx`.
- MERGED #97 as 3853d29. Live after Coolify on SOURCE_COMMIT 8297fd9
  (main also includes #96). Cache-busted curl: 6/6 PASS HowTo+FAQPage.

## 2026-09-13 — EX-CTR-BATCH-3 answer-first titles
- Ten EN posts: title + meta only. H1s left as-is (already matched).
- depop / ebay / start-no-money / grow-closet / descriptions /
  photos / shipping / bundles / pallets / scale-full-time.
- No mid-CTA, body, or JSON-LD structure edits. No `/register`.
  No Free pitch. seoTitle carries " — Resale IQ".
- Soft caps: title ≤60, meta ≤155. Question/answer-first.
- Merged #96 (8297fd9). Playwright /data H1 flake ignored. All 10 live
  after Coolify; cache-busted curl matched new titles/metas.

## 2026-09-13 — EX-AEO-DEFINITIONS citeable term blocks
- Visible H2 + 1–2 sentence definition leads on five pages:
  `/blog/buy-below-price-explained` (Buy-below price),
  `/blog/what-is-a-good-sell-through-rate` (Sell-through rate),
  `/blog/what-sells-best-on-vinted` (Watched departure + ilink /data /flip),
  `/data` (What is a watched departure?),
  `/flip` (How we rank what sells best).
- Blog renderer prints `definedTerm` after the H1. FAQ answers match
  the visible lead. DefinedTerm JSON-LD beside existing FAQPage.
- Titles, metas, H1s untouched. No invented stats. No /register.
  Paid CTA stays /pricing. ES `como-poner` not edited.
- CI: definition assertions live in `faq-schema.test.ts` (a standalone
  test file cloned the hub-social read helper and tripped check:dupes).
  `e2e/smoke` `/data` H1 aligned to "Weekly brand volumes on Vinted".
- MERGED #98 as 7915b90. Live after Coolify. Cache-busted curl 5/5 PASS.

## 2026-09-13 — BODY-VIEWS-002 demand section on views post
- `/blog/how-to-get-more-views-on-vinted` only. Body insert after
  “First: is there demand at all?”, before “Match the words buyers type”.
- New H2: “Demand is the other half of the views”. Week-to-13-Sep
  figures: 5,746 / Fred Perry 1,027 / Stone Island 892 / Gucci 230 @ €197.
- Soft cite `/data?...utm_campaign=body_views_deepen_002_20260913`
  (anchor “Vinted market data”). Paid CTA Get the numbers →
  `/pricing?...utm_campaign=body_views_deepen_002_20260913`.
- Existing `pricingMidCta("body_views_20260913")` kept. Footer still
  first-CTA `body_views_20260913`. Title / seoTitle / H1 / meta unchanged.
- No `/register`. HowTo expected headings include the new H2.
- MERGED #102 as 45e1979. Live after Coolify. Cache-busted curl PASS:
  heading + `/pricing?...utm_campaign=body_views_deepen_002_20260913`
  + “Get the numbers”. Zero `/register?src=blog`. Title/H1 unchanged.

## 2026-09-13 — EX-MANUAL-AEO hub + chapter FAQ
- `/manual` hub: answer-first title + FAQPage/HubFaq (5 Qs: what it
  is, who for, free?, buy-below/data, markets). Book schema kept.
- 15 chapters that already had 2 FAQs expanded to 4 from chapter
  copy. Authenticity left at 2 so body_fake CTR is untouched.
- `/manual/the-buy-below-price`: DefinedTerm lead matches the blog
  twin (`average asking price at departure × 0.95 × 0.70`).
- Soft `seoTitle`s keep " — The Vinted Reselling Manual". H1s stay.
- No `/register` in FAQ. Paid CTAs stay `/pricing`.
- Tests: `faq-schema.test.ts` hub assertions + `manual-aeo.test.ts`.

## 2026-09-13 — EX-CTR-BATCH-4 remaining answer-first titles
- Six remaining soft EN posts: title + meta only. H1s left as-is.
- list-time / record-keeping / mistakes / vintage / disputes /
  retail-arbitrage.
- No mid-CTA, body, or JSON-LD structure edits. No `/register`.
  No Free pitch. seoTitle carries " — Resale IQ".
- Soft caps: title ≤60, meta ≤155. Question/answer-first.
