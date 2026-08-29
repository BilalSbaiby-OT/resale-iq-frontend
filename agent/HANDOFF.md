STATUS: IN_PROGRESS
OWNER: seo           # seo | growth | none — claim before your first edit (see agent/LANES.md)
PUSH: yes
UPDATED: 2026-08-29
LAST SESSION DID: P2 deal alerts + median·n + /data weekly table
SEO DONE, NOT MERGED (branch seo/p1-p4, 3 commits: a8b7afd, 1012da0, f7d3142).
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
