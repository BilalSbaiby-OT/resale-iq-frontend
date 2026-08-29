STATUS: IN_PROGRESS
OWNER: seo             # released — the remaining step is the owner's, not an agent's
PUSH: yes
UPDATED: 2026-08-29
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
  BLOCKED ON OWNER — and NO AGENT CAN DO THIS STEP. Do not retry it:
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
BLOCKED ON DEPLOY — a human must click Redeploy in Coolify.
  SEO P1-P4 is MERGED AND PUSHED to main (738d66f). Production is still serving the
  OLD build: verified 2026-08-29 that resaleiq.dev/flip returns 404, /data has 0 <h2>,
  and the depop post is still 378 words (should be ~1859).
  ROOT CAUSE: `gh api repos/BilalSbaiby-OT/resale-iq-frontend/hooks` returns [] — there
  is NO webhook on the repo, so Coolify auto-deploy was never wired up. Pushing will
  never trigger a build on its own. Coolify's dashboard (62.238.51.83:8000) also times
  out from the dev machine, so no agent can trigger it from here.
  EXACT ACTION FOR A HUMAN:
    1. Open http://62.238.51.83:8000 (Coolify) from a network that can reach port 8000.
    2. Project "My first project" > production > frontend app p6t87shftvl2455pd3gdgee1.
    3. Click Redeploy. Then turn ON auto-deploy / add the GitHub webhook so this stops
       being manual.
    4. Verify live: curl -s -o /dev/null -w '%{http_code}' https://resaleiq.dev/flip
       must return 200, and /category too.
  (was: SEO DONE, NOT MERGED, branch seo/p1-p4, commits a8b7afd, 1012da0, f7d3142)
  Search Console is connected now; first pull 2026-08-29. Shipped: /flip + /category hubs
  (both were 404, orphaning 73% of the sitemap), 23 blog->money-page internal links both
  directions, vinted-vs-depop rebuilt 350->1859 words, title/meta fixes, BreadcrumbList on
  4 templates, h2 structure on /data + /manual. tsc/build clean, lint identical to main.
  NOT pushed — awaiting owner's go-ahead to deploy.
  Full detail + resume prompt: ~/Desktop/resale-iq-seo/WORK-QUEUE.md and seo-memory.md
  REQUEST FOR THE OTHER AGENT: src/app/page.tsx is your lane — a homepage footer link to
  /flip and /category would move both hubs from crawl depth 2 to depth 1.
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
