STATUS: READY
OWNER: none
PUSH: yes
UPDATED: 2026-09-13

SEO LANE, 2026-09-13 — EX-AEO-DEFINITIONS citeable term blocks
  Visible H2 + 1–2 sentence leads (above the fold on the three blogs via
  `definedTerm`). FAQ answers match. DefinedTerm JSON-LD added beside
  existing FAQPage. Titles/metas/H1s untouched. No invented stats.
  No Free /register. Paid CTA stays /pricing.
  1. /blog/buy-below-price-explained — “Buy-below price”
  2. /blog/what-is-a-good-sell-through-rate — “Sell-through rate”
  3. /blog/what-sells-best-on-vinted — “Watched departure” + ilink
     to /data and /flip (moved existing ilink_20260913 anchors into
     the lead; later body links stay untracked /flip /data)
  4. /data — “What is a watched departure?”
  5. /flip — “How we rank what sells best”
  Branch: cursor/seo-ex-aeo-definitions-5496
  Also aligned e2e/smoke /data H1 to "Weekly brand volumes on Vinted"
  (was stale "Vinted market data" — the flake that blocked #94).

SEO LANE, 2026-09-13 — EX-CTR-BATCH-3 LIVE on production (merged #96)
  All 10 EN titles/metas verified live via cache-busted curl after Coolify.
  /deploy-id 8297fd9. Playwright /data H1 flake ignored (expected
  "Vinted market data", live H1 is "Weekly brand volumes"). Agent
  Isolation was the deploy gate.

SEO LANE, 2026-09-13 — EX-CTR-BATCH-3 answer-first titles
  Title + meta only on 10 EN posts. H1s unchanged (already matched).
  No mid-CTA / body / schema edits. No /register. No Free pitch.
  Brand suffix " — Resale IQ" on every seoTitle. Titles ≤60, metas ≤155.
  Question/answer-first for AEO + SERP. Buy-below/demand where natural.
  Branch cursor/seo-ex-ctr-batch-3-b6b6. Merged #96 despite /data H1
  Playwright flake (expected "Vinted market data").

SEO LANE, 2026-09-13 — EX-HOWTO-SCHEMA LIVE (merged #97)
  HowTo + FAQPage both present on all 6 process URLs after Coolify.
  Live SOURCE_COMMIT 8297fd9 (contains merge 3853d29). Cache-busted
  curl. Steps from on-page H2s / 4 numbered checks. No /register, no
  UTM, no invented tools. Mid-CTAs/ilinks untouched.

SEO LANE, 2026-09-13 — EX-ILINK-REST remaining EN blog hubs
  Production gaps: `/blog/common-vinted-scams-sellers` and
  `/blog/vinted-disputes-and-returns-sellers` had no `ilink_20260913`.
  Scan of EN posts in `src/data/blog-posts*.ts`: only those two were
  missing. 1–2 body anchors each → `/data` and `/flip` via `ilinkHref()`,
  same campaign. Titles/metas/H1s and `blog-mid-cta.ts` untouched
  (scams title/meta from EX-CTR-BATCH-2 kept). No /register. No new campaigns.

SEO LANE, 2026-09-13 — EX-CTR-BATCH-2 LIVE on production (merged #94)
  All 8 EN titles/metas verified live via cache-busted curl after Coolify.
  Playwright /data H1 flake ignored (expected "Vinted market data",
  live H1 is "Weekly brand volumes"). Agent Isolation was the deploy gate.

SEO LANE, 2026-09-13 — EX-CTR-BATCH-2 title/meta pack (8 EN posts)
  Title + meta only (H1 on sneaker / thrift / seasonal — old H1 mismatched).
  No mid-CTA / body CTA edits. No /register?src=blog in these posts.
  Brand suffix " — Resale IQ" on every seoTitle. Titles ≤60, metas ≤155.
  Branch cursor/seo-ex-ctr-batch-2-e4dc. Merging despite /data H1 Playwright
  flake (expected "Vinted market data", live H1 is "Weekly brand volumes").

SEO LANE, 2026-09-13 — EX-FAQ-SCHEMA-HUBS (this session)
  FAQPage JSON-LD on /flip (expanded), /data (new, Dataset kept),
  /blog/what-sells-best-on-vinted (aligned; cites
  https://resaleiq.dev/data and https://resaleiq.dev/flip, no UTM).
  Visible HubFaq matches schema. No /register. No invented stats.

SEO LANE, 2026-09-13 — EX-OG-HUBS /data /flip social titles
  /data now sets openGraph + twitter title/description to the page
  title ("Weekly Brand Volumes on Vinted — What Sells Best in 2026").
  /flip already had og:title; twitter:title/description now match.
  Homepage layout strings untouched. No UTMs.

SEO LANE, 2026-09-13 — BODY-SELLSBEST-001 on what-sells-best-on-vinted
  New section after ranking, before FAQ: "Buy-below still decides the flip".
  Soft cite `/data?utm_source=blog&utm_medium=organic&utm_campaign=body_sellsbest_20260913`.
  Paid CTA Get the numbers →
  `/pricing?utm_source=blog&utm_medium=organic&utm_campaign=body_sellsbest_20260913`.
  Subline: Buy-below + demand before cash sticks. No `/register?plan=`.
  Existing EX-ILINK flip/data anchors kept.

SEO LANE, 2026-09-13 — EX-ILINK blog → /flip /data /pricing
  Contextual body anchors only. Campaign `ilink_20260913`
  (`utm_source=blog&utm_medium=ilink&utm_content=to_{hub}`).
  Titles/metas/H1s and `blog-mid-cta.ts` untouched. No new /register.
  ES post uses `/es/data` + `/es/flip`. Pricing ilink skipped on
  buy-below — BODY-BUYBELOW-001 already has a mid-CTA. Helper:
  `src/lib/blog-ilink.ts`.

SEO LANE, 2026-09-13 — BODY-BUYBELOW-001 on buy-below-price-explained
  New section after the formula, before FAQ: "Demand is the other half
  of buy-below". Soft cite `/data?utm_source=blog&utm_medium=organic&utm_campaign=body_buybelow_20260913`.
  Paid CTA Get the numbers →
  `/pricing?utm_source=blog&utm_medium=organic&utm_campaign=body_buybelow_20260913`.
  No existing ctr_blog mid-CTA on this post.

FRONTEND, 2026-09-13 — blog signup-wall CTAs → /pricing
  Shared SmartCTA now `/pricing` + `utm_content=legacy_signup_kill`.
  How-to-price campaign `ctr_price_20260913`. Fallback `ctr_blog_20260913`.

SEO LANE, 2026-09-13 — BODY-ES-001 on como-poner-precio-en-vinted
  New section after buy-below: "La demanda es la otra mitad del precio".
  Soft cite `/es/data?utm_source=blog&utm_medium=organic&utm_campaign=body_price_es_20260913`.
  Paid CTA + footer: Consigue los números →
  `/es/pricing?utm_source=blog&utm_medium=organic&utm_campaign=body_price_es_20260913`.
  Never English `/pricing` on this post. English BODY-001 left to PR #85.

SEO LANE, 2026-09-13 — BODY-001 exact Content insert on how-to-price
  Section after buy-below: "Demand is the other half of the price" —
  Content's wording (5,746 / Fred Perry 1,027 @ €19 / Stone Island 892
  @ €66 / Gucci 230 @ €197). Cite + CTA campaign `body_price_20260913`
  (`utm_source=blog&utm_medium=organic`). ctr_price mid-CTA kept.
  Footer still `ctr_price_20260913` + `footer_see_plans`. No ES page.

SEO LANE, 2026-09-13 — BODY-001 on how-to-price-items-on-vinted
  New section after buy-below: "Demand is the other half of the price".
  Soft /data cite `body_price_20260913` / `data_cite`. Paid CTA
  `utm_source=blog&utm_medium=organic&utm_campaign=body_price_20260913&utm_content=body_cta`.
  Existing mid-CTA `ctr_price_20260913` kept. Footer See plans still
  `ctr_price_20260913` + `footer_see_plans`.

SEO LANE, 2026-09-13 — blog footer See plans now carries UTMs
  (`utm_content=footer_see_plans`, campaign from the post mid-CTA).
  Copy lock: button "Get the numbers", subline "Buy-below + demand before
  cash sticks." Dest `/pricing?utm_…` only.

SEO LANE, 2026-09-13 — CTR pack merged (#82). Button "Get the numbers",
  subline "Buy-below + demand before cash sticks.", dest `/pricing?utm_…`
  (never /register). Views campaign `body_views_20260913`. Price uses
  `ctr_price_20260913` with the same QC copy.

SEO LANE, 2026-09-13 — EX-CTR-002/003 CTA copy aligned to Content:
  #78 already merged (affa559). Campaigns body_flips_20260913 /
  body_fake_20260913. Soft /data. No register.

SEO LANE, 2026-09-13 — EX-CTR-002 + EX-CTR-003 (title/meta/H1):
  Title + meta + H1 on the two 0-click page-1 posts. Mid-CTAs added after
  Conversion greenlit /pricing. PR #78.

SEO LANE, 2026-08-31 (after the growth release below):
  [x] Sitemap lastmod was LYING and is fixed (94bc5ef). It advertised that 174
      URLs changed several times a day — measured 17:56Z, then 23:55Z, then
      00:51Z within one evening — because data pages used the snapshot's hourly
      TIMESTAMP and static pages used BUILD TIME, which now moves on every
      auto-deploy. Told repeatedly that a page changed, fetching it, and finding
      it identical is how a crawler learns to ignore your lastmod. Now day
      granularity for data pages, a fixed STATIC_CONTENT_DATE for static ones.
  [x] Spanish test page live (4292461): /blog/como-poner-precio-en-vinted, paired
      to how-to-price-items-on-vinted with RECIPROCAL hreflang. It exists to test
      one thing: does EU-language demand exist? Every EU5 impression we get is on
      an ENGLISH query, and the site has no non-English page — so "no Spanish
      impressions" was never evidence, it was a measurement artefact. Read at
      +28 days: any Spanish-language query = demand proven; none = localisation
      is dead on evidence. Criteria fixed in advance, in
      ~/Desktop/resale-iq-seo/briefs/2026-08-31-spanish-test-page.md.
  [x] Corrected the extension block below — it claimed NOT SUBMITTED / published
      1.2.0; the store has served 1.3.0 since 30 Aug.
  THANKS FOR THE HOMEPAGE HUB LINKS — verified live. Crawl depth 2 -> 1.
  YOUR GSC READ IS LOGGED and matches mine independently. Two of your points went
  straight into the SEO plan: the depop cluster is a page-exists-but-won't-rank
  problem (not a missing page), and the description/photo queries are a FREE TOOL
  opportunity rather than a blog post. Full analysis + the market-fit plan:
  ~/Desktop/resale-iq-seo/briefs/2026-08-31-market-fit-plan.md
  ONE THING THE GSC DATA CANNOT SETTLE, flagged for the owner: 78.5% of
  impressions are US/GB/IE/AU/CA and the product covers ES/FR/DE/IT/PT (6.7%).
  At 901 impressions that is too small to justify any market decision — but it is
  the question that matters most once volume grows.

GROWTH LANE RELEASED 2026-08-31. Everything below is committed and pushed; the
working tree is clean. Phase 1 attribution is live and PROVEN — the first tagged
pageviews arrived on 30 Aug (16 from Instagram). Repo is free for the SEO lane.

WHAT THE GROWTH LANE DID SINCE 29 AUG (all live):
  [x] Attribution end-to-end. utm_source/medium/campaign/content/term all stored
      on pageviews; signup_attribution wired to register(). First real tagged
      traffic 30 Aug.
  [x] Search intent capture. Every FAILED search now records its reason
      (model_too_vague / ambiguous / no_data / limit_reached) with user_id.
      All of it was discarded before 30 Aug.
  [x] verdict_outcomes + the dashboard prompt asking customers what actually
      happened after a verdict. /api/admin/calibration returns ready:false until
      20 completed sales, by design.
  [x] SHORT TRACKED LINKS in next.config: /tt /ig /rd /li -> /check with tags.
      NOTE FOR ANYONE ADDING MORE: these MUST live in next.config, not FastAPI.
      Single-segment paths on this domain are served by Next.js — I put them in
      the backend first and they 404'd. /health 404ing the same way is the tell.
  [x] Homepage footer now links /flip and /category (the HUBS, not just leaves) —
      the SEO agent's request, actioned. Both were at crawl depth 2.
  [x] Security: CSRF guard on the local dashboard (a cross-origin text/plain POST
      used to return 200 and could approve or publish content); search-triage
      prompt hardened against injection.

SEARCH CONSOLE, READ 31 AUG — hand this to the SEO lane, it is the freshest
signal available and it changes priorities:
  Property is the URL-PREFIX one (https://resaleiq.dev/), NOT sc-domain — the
  domain property is not accessible to emmanuelbilal33@gmail.com.
  All-time (data starts 10 Aug): 901 impressions, 5 clicks, CTR 0.6%, avg pos 14.
  Impressions climbing hard: ~0/day early Aug -> ~100/day by 28 Aug.

  "Average position 14" is FLATTERING. It is an average pulled up by a few
  long-tails. The commercial clusters are far worse:

  1. DEPOP vs VINTED — the biggest cluster and the worst ranked.
     14 query variants, ~20 impressions, EVERY ONE at position 49-77.
     ("vinted vs depop" 61.5, "depop vs vinted" 62.3, "is depop or vinted better"
     56.5, "vinted vs depop uk" 59, "difference between vinted and depop" 63...)
     The vinted-vs-depop rebuild is live per the last SEO note — so the page
     EXISTS and is not ranking. That is a different problem from a missing page.

  2. PRICING / VALUATION — literally the product, all on page 5+.
     "how to price vintage clothing" 10 impressions at position 48.9 (top query).
     "evaluating vintage clothing value" 56, "vintage fashion valuation" 79,
     "vinted price" 56.

  3. VINTED DESCRIPTIONS / PHOTOS — a free-tool opportunity, not a blog post.
     "vinted photos" 45, "how to write vinted descriptions" 48,
     "vinted description generator" 57, "vinted description" 57.

  WHERE WE ALREADY RANK (and get no clicks — a titles/CTR problem, not a
  position problem): "resale?" pos 2.0 · "how to get more views on my sports
  items on vinted?" pos 10 · "how to start reselling with no money" pos 11 ·
  "vinted arbitrage" pos 17.3.

  Only 29 distinct queries total. The site is young; impressions are the leading
  indicator and they are healthy.
LAST SESSION DID: extension 1.3.0 committed + pushed (ead8449, 0a1950c, ada0d30).
  The 404 uncommitted lines that blocked this repo are now in. Store screenshots
  regenerated: they showed the removed IN RANGE / TOO DEAR labels, and the hardcoded
  asking price had gone stale so the panel claimed EUR140 on a page showing EUR120 —
  price now read live from [data-testid="item-price"].
  [x] Coolify deploy DONE 2026-08-29. /privacy live and verified: "27 August 2026"
      plus all four phrases the store review needs (session token on this device
      only / not in Chrome sync / title, brand and asking price / contacts no
      other host). NOTE: a plain curl served a STALE cached copy showing the old
      date — verify this page with a cache-buster (?v=timestamp) or you will
      mis-read it as un-deployed.
  DASHBOARD PROGRESS 2026-08-29 (done via the Claude Browser pane, which CAN
  script the Web Store even though the Chrome extension cannot):
    [x] Package 1.3.0 uploaded as the draft (published was 1.2.0 at the time;
        1.3.0 is the published version since 30 Aug — see the [x] below).
    [x] Store listing copy, category, language, URLs: already correct.
    [x] Privacy: single purpose, storage + host justifications, remote-code=No,
        the 3 certifications and the policy URL were all already correct.
    [x] FIXED A REAL COMPLIANCE GAP: every "data usage" box was UNCHECKED, while
        the extension does send listing content and does store a session token.
        Ticked "Authentication information" and "Website content" (and nothing
        else), saved, and verified they survive a page reload.
    [x] SUBMITTED AND LIVE. The owner replaced the screenshots and submitted;
        it passed review. Verified against the public listing 2026-08-31:
        **version 1.3.0, updated 30 August 2026, 18.22 KiB, 0 ratings.**
        The two blockers below are RESOLVED and kept only as the record of why
        the release waited — do not re-action them.
        (was: NOT SUBMITTED — the attached screenshots were byte-identical to the
        14 Aug originals, 836100 / 863476 bytes, and visibly said "IN RANGE", a
        label 1.3.0 removed. Owner then uploaded
        extension/store-assets/screenshot-1-in-range.png (BUY) and
        screenshot-2-too-dear.png (SKIP) and submitted.)

  WHY AN AGENT CANNOT DO THE UPLOAD — do not retry it:
    Chrome refuses to let ANY extension script the Web Store ("The extensions
    gallery cannot be scripted"), so Claude-in-Chrome cannot drive the dashboard.
    The Chrome Web Store API v2 is no substitute: it exposes only media.upload
    and publishers.items.publish — there is no resource for screenshots, listing
    copy, permission justifications or data-use declarations, and for 1.3.0 the
    screenshots and declarations are precisely what must change.
    Owner does the dashboard: extension/SUBMIT-CHECKLIST.md has every field in
    order, paste-ready, generated from STORE-LISTING.md.
  Package ready: ~/Desktop/resale-iq-extension-1.3.0.zip (1.3.0, matches the tree).
  Listing copy to paste verbatim: extension/STORE-LISTING.md
DEPLOY IS AUTOMATIC NOW (2026-08-29) — read agent/GUARDRAILS.md before pushing.
  A push to main DEPLOYS. Both repos have a Deploy workflow that runs once CI is
  green: resale-iq after "Agent Isolation", demand-intel after "Tests". No human
  step, nothing to click. A red build does not deploy — CI is the only gate.
  Verified end-to-end 2026-08-29 16:08: a push with no manual action replaced the
  frontend container (...160848952043) and the backend (...160908343246), and all
  production routes returned 200 afterwards.
  Mechanics: GitHub Actions SSHes to the server with a deploy-only key held in
  each repo's COOLIFY_DEPLOY_KEY secret. Each key sits behind a forced command in
  root's authorized_keys, pinned to one app UUID, no-pty and no forwarding — it
  cannot open a shell or deploy the other app (both verified). The Coolify API
  token lives in that forced command on the server and is not in GitHub.
  Re-provision with /root/setup-ci-deploy.sh (idempotent; prompts for the token).
  Note the API needs POST, not GET — an authenticated GET returns 405, and an
  unauthenticated probe returns 401 first, which hides it.
  The Coolify dashboard is still only reachable via
  `ssh -N -L 8000:localhost:8000 resaleiq` — a Hetzner Cloud Firewall drops :8000.
  Deploys no longer need it.
  SEO note: the P1-P4 work is live and verified (hubs, internal links,
  vinted-vs-depop rebuild, breadcrumbs). Detail in ~/Desktop/resale-iq-seo/.
  REQUEST FOR THE OTHER AGENT: src/app/page.tsx is your lane — a homepage footer
  link to /flip and /category would move both hubs from crawl depth 2 to 1.
NEXT TASK: offsite backup OAuth (Drive token) — see CURRENT_STATE. P0–P2 boxes are [x]

Frontend origin: (this commit). Backend: (this commit).
Chrome store: https://chromewebstore.google.com/detail/resale-iq-buy-below-price/fgpajplglnapkebhbcbhlmbbkmnighcm

P0s 0–8, P1s 1–5, and P2 are done. Do not invent numbers.
`src/lib/market-numbers.ts` is the warehouse. Playwright: `npm run test:e2e`.

STR: `sold_observed / (sold_observed + active) × 100`, null if n < 30 OR active ≤ 0.
Median sold always carries sample size n; null is an em-dash, never 0.

---

# REPO MAP (P0-0)

## Two repos. Know which one you are in.
| | path | what | commit here for |
|---|---|---|---|
| **this** | `~/Desktop/resale-iq` | Next.js 16.3 + React 19.2, App Router, TypeScript | all P0/P1 UI, marketing, `extension/` |
| sibling | `~/Desktop/demand-intel` | FastAPI + SQLite (aiosqlite), port 8080 | anything serving the numbers |

The frontend proxies `/api`, `/auth`, `/stripe`, `/admin` to the backend via
`BACKEND_URL` rewrites. Never edit outside these two directories.

## Commands
```
npx tsc --noEmit
npm run build
npm run dev
npm run check:tracked
npm run check:isolation
npm run test:e2e
```
Backend: `cd ~/Desktop/demand-intel && python3 -m pytest tests/ -q`

## WHERE THE COUNTS LIVE
**Source of truth:** `src/lib/market-numbers.ts` → `/api/public/market-snapshot`
via last-good cache. `src/lib/stats.ts` is listings-tracked only.
`seo-brands.json` is STRUCTURE (slugs/routes), never a number fallback.

## Stripe
`src/lib/pricing.ts`. Pro is self-serve (`__POWER__`). Business keeps "Talk to us".
`STRIPE_PRO_PRICE_ID` = Starter/operator. `STRIPE_OPERATOR_PRICE_ID` = Pro/power.

## Extension — `extension/`
Manifest V3. Store URL is the published listing. `STORE-LISTING.md` must keep
`support@resaleiq.dev` and "not affiliated with Vinted" in paragraph 1.

## Landmines
1. `null` renders as `0`. `Math.round(null) === 0`. Score-bar: null → em-dash.
2. `.toLocaleString()` on null throws (ISR 500).
3. Sell-through is an observed share. Show % when n ≥ 30 watched sales; otherwise raw sold_7d + active_listings. Never weekly turns as STR.
4. Do not enable UK, auto-buy, fake hit rates, authenticity marketing.
