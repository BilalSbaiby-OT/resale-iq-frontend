# ISSUE_CATALOG — Resale IQ frontend product audit

**Date:** 2026-09-21  
**Repo:** `resale-iq-frontend` @ `0c534be` (`Frontend audit: paid checker CTAs, JWT, data honesty` / PR #131)  
**Live:** https://resaleiq.dev/deploy-id → `{"commit":"0c534beaefc641541a9a5bc7545d0cb323a8d7fe","short":"0c534be"}`  
**Scope:** Frontend + live production. Backend `demand-intel` was not in this checkout; live `/api/*` was probed from outside.  
**Method:** Code inspection + live curls. No invented requirements. Status vocabulary is CONFIRMED / PARTIAL / NOT FOUND.

Severity: **P0** trust/payment/paying-user lie or live catalog collapse · **P1** conversion/activation or systematic locale lie · **P2** empty-looking product / onboarding · **P3** polish/a11y · **P4** nit.

Fix size: **S** < half a day, one surface · **M** a few files / copy pass · **L** data coverage or a real product surface.

Owner: **FE** / **BE** / **data** / **ops** / **content**.

#131 already shipped: FreeChecker JWT, paid GuestCheckout skip on `/tools` + `/pricing`, extension 402 as paywall, several null≠0 honesty fixes. This catalog is **what is still true after that merge**, plus live production.

---

## User-reported (verify each)

| # | Report | Status | Primary issue IDs |
|---|--------|--------|-------------------|
| 1 | Catalog lacking; add Miu Miu; users search unknown models and leave | **CONFIRMED** | IQ-001, IQ-002, IQ-003, IQ-004 |
| 2 | German (and other locales) still bad | **CONFIRMED** | IQ-010, IQ-011, IQ-012, IQ-013, IQ-014 |
| 3 | Opportunities often have no data (no buy_below etc.) | **PARTIAL** (real sparse data + UI that looks broken) | IQ-001, IQ-020, IQ-021 |
| 4 | Landing doesn’t teach how to use / why valuable; untracked ≠ low demand | **PARTIAL** | IQ-030, IQ-002, IQ-031 |
| 5 | “Find live deals” click → nothing comes out | **CONFIRMED** | IQ-040 |
| 6 | Mobile UI bad on all sites | **PARTIAL** | IQ-050, IQ-051, IQ-052 |
| 7 | `/verdict` still shows See plans €19 for Pro (power) | **PARTIAL** — UnlockPanel **NOT FOUND** for Pro; **cold screen CONFIRMED** | IQ-060 |
| 8 | No correct onboarding / how-to-use | **PARTIAL** | IQ-070, IQ-030, IQ-071 |
| 9 | Tools need refining | **PARTIAL** | IQ-080, IQ-081, IQ-011 |
| 10 | Empty/sparse opportunity cards | **CONFIRMED** | IQ-020, IQ-021 |

---

## P0

### IQ-001 — Public warehouse publishes 3 of 28 tracked brands
- **Status:** CONFIRMED (live)
- **Severity:** P0
- **Surface:** `GET /api/public/market-snapshot` → `/data`, homepage pulse, `/flip/{brand}` numbers
- **Evidence:** Live 2026-09-21 12:54Z snapshot: `brands_tracked: 28`, `brands_published: 3`, `publish_floor_sold_7d: 5`. Published rows: Stone Island (21), New Balance (10), Reebok (5). `/data` HTML: “36 watched departures across **3** brands”. Nike, Adidas, Gucci, Fred Perry **absent** from the table. `/flip/nike` FAQ already admits “when this snapshot has a row”; live hub is em-dashes.
- **User impact:** The public proof surface looks like a 3-brand toy. Brand hubs for Nike/Gucci are thin. Matches “catalog lacking” and “no data on opportunities” without anyone searching Miu Miu.
- **Fix size:** L (pipeline / publish floor / scrape health — not a FE rewrite)
- **Owner:** data + BE. FE should not invent the missing 25 rows.

### IQ-002 — Unknown / off-catalog search is a Starter paywall, not a coverage answer
- **Status:** CONFIRMED (live)
- **Severity:** P0
- **Surface:** Homepage / `/tools` `FreeChecker` → `GET /api/verdict`
- **Evidence:** Anon live: Samba / AF1 / NB 530 → `WATCH` + `buy_below`. **Miu Miu, Gucci, Nike Dunk, Levi's 501, Balenciaga, The North Face, `unknownxyz123` all → `PAYWALL`** with `"A Resale IQ subscription is required to check items."` FE then renders `HardPaywallCard` (“€19 unlocks this check”) — `src/components/ui/hard-paywall-card.tsx`. UNKNOWN copy (`i18n.ts` `unknownFallback`) is unreachable for anonymous visitors on anything outside the three free SKUs.
- **User impact:** Searching Miu Miu (or any untracked / paid model) looks like “pay €19 to see the number”. After paying, many of those queries still have no model-level data. Users leave at the paywall, or pay and bounce. This is the catalog complaint as experienced.
- **Fix size:** M (BE: coverage/thin vs paywall order; FE: refuse-with-catalog before Stripe for untracked brands)
- **Owner:** BE + FE

### IQ-003 — Miu Miu is not in the catalog; copy never names the miss
- **Status:** CONFIRMED
- **Severity:** P2 (coverage) / P1 when combined with IQ-002
- **Surface:** `src/data/seo-brands.json` (32 brand hubs), `seo-models.json` (32 named models), `FREE_MODELS` / `WORKING_MODELS`
- **Evidence:** Zero hits for Miu Miu / miu-miu. Catalog brands are ASICS…Zara (32). UNKNOWN fallback talks about “26 clothing & sneaker brands… not electronics” (`src/lib/i18n.ts:250`) — a Miu Miu bag reads as the wrong category, not an untracked luxury brand.
- **User impact:** High-intent luxury search has no honest “we don’t track this brand yet”.
- **Fix size:** L to add the brand in the warehouse (data); S to name “brand not tracked” vs “wrong category”
- **Owner:** data (inventory) + FE (copy)

### IQ-004 — Homepage “+19 more” goes to a 3-row `/data` table
- **Status:** CONFIRMED (live)
- **Severity:** P1
- **Surface:** `BrandStrip` → `/data`
- **Evidence:** Live `/` `data-testid="riq-brand-more"` = **“+19 more”** (`brandStripMoreCount` uses `brandsTracked` 28 minus 9 SVG marks — `src/lib/brand-marks.ts`). Strip **fills unpublished brands** (Nike, Zara marks) from `CATALOG_BRANDS_WITH_MARKS` even when the snapshot has no row. Destination `/data` lists **three** brands.
- **User impact:** Dead catalog CTA. Logos promise Nike/Zara weekly numbers that `/data` does not show.
- **Fix size:** S (chip should use `brandCount` published, or `/data` must publish the rest — that’s IQ-001)
- **Owner:** FE (chip) / data (rows)

---

## P1

### IQ-010 — Locale pricing FAQ denies the free checker (DE/FR/ES/IT/PT)
- **Status:** CONFIRMED (code + live)
- **Severity:** P1
- **Surface:** `/de/pricing`, `/fr/pricing`, `/es/pricing`, `/it/pricing`, `/pt/pricing`
- **Evidence:** EN `i18n.ts:367`: “Is there a free item checker?” → **“Yes. Check Adidas Samba or Nike Air Force 1…”**. DE `i18n.ts:1685` live: **“Gibt es eine kostenlose Artikelprüfung? Nein.”** FR “Non.” ES “No.” IT “No.” PT “Não.” Same product, opposite fact. Live `/de/pricing` HTML contains the Nein paragraph.
- **User impact:** German (and EU) visitors are told there is no free check while the homepage chips three free models. Trust + activation.
- **Fix size:** S (align five locales to EN fact: three named free SKUs)
- **Owner:** FE / content

### IQ-011 — `/de/tools` (and ES/FR/IT/PT) is half English
- **Status:** CONFIRMED (code + live)
- **Severity:** P1
- **Surface:** `/[locale]/tools`
- **Evidence:** Live `/de/tools`: title German (“Prüfe den Markt, bevor du kaufst”), checker DE, body **“Resale IQ is demand intelligence for people who resell…”** from `src/lib/tools-hub-aeo.ts` (`TOOLS_HUB_BODY`, FAQs, buy-below term, “Get the numbers”). Same EN block on `/es/tools`. Tool children `/tools/[slug]` are English-only; `/de/tools/vinted-price-checker` **307s** to `/tools/vinted-price-checker` and sets `NEXT_LOCALE=de`.
- **User impact:** Locale URL promises German; most of the page is English. Matches “German still bad”.
- **Fix size:** M (locale tables for hub AEO + teaser cite)
- **Owner:** FE / content

### IQ-012 — Language switcher is a no-op on `/de/pricing`, `/de/data`, `/de/tools`
- **Status:** CONFIRMED
- **Severity:** P1
- **Surface:** `src/components/i18n/locale-switcher.tsx:68`
- **Evidence:** `LOCALE_ROUTED_ROOTS = {"", "methodology", "register", "support"}`. `locale-routes.ts` already lists `/pricing`, `/data`, `/tools`, `/best`, `/vs`, `/for` as locale-routed. Picking Français on `/de/pricing` sets the cookie and **reloads the same DE URL**.
- **User impact:** The one control that should fix a bad locale appears broken on the money pages.
- **Fix size:** S (extend the set from `LOCALE_ROUTED_EXACT` + blog clones)
- **Owner:** FE

### IQ-013 — Footer / data CTAs drop the locale prefix
- **Status:** CONFIRMED
- **Severity:** P2
- **Surface:** `landing-content.tsx:207-214`; `data/page.tsx:270` (`${prefix}/tools/vinted-price-checker`)
- **Evidence:** Locale homepage footer `href="/tools"`, `"/data"`, `"/flip"` (unprefixed). `/de/data` primary CTA → `/de/tools/vinted-price-checker` which 307s to English (IQ-011).
- **User impact:** DE visitor is bounced to EN mid-journey.
- **Fix size:** S
- **Owner:** FE

### IQ-014 — DE copy quality: du/Sie mix, Denglish, English enums
- **Status:** CONFIRMED
- **Severity:** P2
- **Surface:** `copy.de` in `i18n.ts`, `seo-data-copy.ts`, blog clones
- **Evidence:** Pricing subhead uses **Ihnen**; rest is du. FAQ: “LIMIT ERREICHT”, “UNKNOWN”, “sourcing”. `/de/data`: awkward “Einheiten die wir vom Regal gehen sahen”. Register/blog clones use Sie. `check:locale-english` passes — it only bans a token list, not quality.
- **User impact:** Reads machine-translated. Founder report “German still bad” is not just missing keys.
- **Fix size:** M (native DE pass)
- **Owner:** content + FE

### IQ-020 — Opportunity / deal cards with null buy-below
- **Status:** PARTIAL (UI honest; still looks empty)
- **Severity:** P2
- **Surface:** `/dashboard` Top opportunities; `/deals`
- **Evidence:** Dashboard three-state: lock / “Not priced yet — too few comparable departures” / value (`dashboard-content.tsx:340-344`, `i18n.ts:655`). `/deals` lock vs thin-sample footnote. Trends drop null `opportunity_score` (#131); deals **removed ScoreBar** so empty gauges would not print 0 (`deals/page.tsx` header comment). Live Samba: `sold_7d: null`, `buy_below` from **“2408 active comparables, not watched sales”** — warehouse is thin even on the flagship SKU.
- **User impact:** “Opportunities” with no ceiling read as a broken board, especially with IQ-001.
- **Fix size:** M (filter/demote unpriced rows; data: comps)
- **Owner:** FE + data

### IQ-021 — Sparse opportunity card chrome (title + lock / em-dash)
- **Status:** CONFIRMED
- **Severity:** P2
- **Surface:** `/dashboard`, `/deals`
- **Evidence:** Dashboard cards are two metrics only. Deals cards: no score. Empty dashboard copy exists (`emptyOpportunities`) but populated-yet-unpriced rows still render as cards.
- **User impact:** Same as IQ-020; user report #10.
- **Fix size:** M
- **Owner:** FE

### IQ-030 — Homepage does not teach the job (no how-to, no coverage vs thin)
- **Status:** PARTIAL
- **Severity:** P1
- **Surface:** `/` `landing-content.tsx`
- **Evidence:** Hero → checker → brand strip → pulse → compact pricing → 3 FAQs. No numbered how-it-works. `HOME_FAQS` (`src/app/page.tsx:15-30`) cover what/coverage/buy-below, **not** “paste a listing / type Brand + Model / untracked vs not enough departures”. `heroHonesty` (“About 4 in 10…”) is **defined and unused** (`i18n.ts:150-151`) — do **not** put that conversion-tax line back (OBJECTIVE.md); the gap is teaching, not a stale refusal rate. Compact `PricingSection` hides the pricing FAQ that mentions UNKNOWN.
- **User impact:** First-time visitor must infer the product from an empty checker. Untracked is not framed before they hit IQ-002.
- **Fix size:** M (3-step how-to + one FAQ distinguishing coverage vs thin sample)
- **Owner:** FE / content

### IQ-031 — Untracked is not “low demand” (and must not be sold as that)
- **Status:** NOT FOUND as a missing marketing claim; CONFIRMED as a missing **distinction**
- **Severity:** P2
- **Surface:** Checker UNKNOWN vs INSUFFICIENT vs methodology
- **Evidence:** Methodology: untracked brand = coverage, not a market signal (`methodology-copy`). FreeChecker INSUFFICIENT: “Not enough watched departures…”. UNKNOWN: 26-brand coverage. Extension UNKNOWN fallback: “model-level data for this brand yet” (`extension/content.js`). No UI says “untracked = low demand / not worth tracking” — **correct per methodology**. User still cannot tell coverage-gap from thin-sample from paywall (IQ-002).
- **User impact:** Confusion, not a missing slogan. Do not invent a “low demand” story for Miu Miu.
- **Fix size:** S (three named refusal reasons)
- **Owner:** FE + BE (`reason`)

### IQ-040 — “Find live deals” is ungated; Starter gets an empty Pro modal
- **Status:** CONFIRMED
- **Severity:** P1 (Starter) / P3 (Pro, genuinely no listings)
- **Surface:** `/deals` → `LiveDealsModal`
- **Evidence:** Only occurrence of the string: `app-copy.ts` `findLive: "Find live deals"`. Button on **every** card (`deals/page.tsx:340-348`), no `plan === "power"` check. Modal `GET /api/live-deals`; **402** → “Live Deal Finder is a Pro feature…” + Upgrade (`live-deals-modal.tsx:41-43, 78-86`). Empty Pro: “No listings that match… under buy-below right now.” Missing `max_buy_price` header: “buy-below withheld”. Dashboard free banner “live deals unlock with a plan” (`i18n.ts:624`) implies Starter; finder is Pro.
- **User impact:** Click → spinner → nothing / upsell. Matches the report exactly.
- **Fix size:** S (hide/relabel for non-Pro; clearer empty)
- **Owner:** FE

### IQ-050 — Dashboard KPI skeleton never clears on `/api/kpis` failure
- **Status:** CONFIRMED
- **Severity:** P1
- **Surface:** `/dashboard`
- **Evidence:** `getKPIs().catch(onFail(setKpis, null))` (`dashboard-content.tsx:124`). Cards use `loading={!kpis}` (`:260-272`). `KpiCard` shows skeletons while `loading` (`kpi-card.tsx:24-28`). Failed fetch → `null` forever → infinite skeleton.
- **User impact:** Dashboard looks hung. Feels like “mobile/all sites broken”.
- **Fix size:** S (error/empty vs loading)
- **Owner:** FE

### IQ-060 — Cold `/verdict` still sells “See plans → €19/mo” to paid users
- **Status:** PARTIAL
- **Severity:** P1
- **Surface:** `/verdict` `verdict-content.tsx:375-396`
- **Evidence:** Idle screen (no result): **no `isPaidPlan` check**. CTA `riq-cold-pricing-cta` → `/pricing`, subcopy hardcoded **“€19/mo · no free tier”**. Login lands here with **no `?q=`** (`login-form.tsx:32`).  
  **UnlockPanel after a check:** `unlockPanelBranch` → `"entitled"` for authenticated + missing `unlocks_remaining` (`unlock-panel-state.ts:50-52`) — **“Full numbers… still maturing”**, no Starter CTA. That is the #131 / historical Pro bug, **fixed for the panel**. e2e `paid-checker-cta.spec.ts` covers `/tools` + `/pricing`, **not** cold `/verdict`.
- **User impact:** Pro/Starter who log in (or finish a check and clear the card) see a Starter nudge on the primary product screen. Founder report still reproduces on the cold path.
- **Fix size:** S
- **Owner:** FE

### IQ-070 — Login / first session is not a guided first check
- **Status:** PARTIAL
- **Severity:** P2
- **Surface:** `/login` → `/verdict`; vs verify-email + billing success
- **Evidence:** Verify-email: `/verdict?q=Nike+Air+Force+1`. Billing success: “Check your first item” → `FIRST_CHECK_HREF` (AF1). Login: bare `/verdict` + cold chips (`WORKING_MODELS` = 530 / 501 / 550, **not** the free-taste three). Dashboard `?welcome=1` exists but login does not send it. No in-app tour. Day-2 email called out as missing in `verdict-content.tsx` comments.
- **User impact:** Paying user after login sees empty checker + See plans (IQ-060), not a working AF1 check.
- **Fix size:** S (reuse `FIRST_CHECK_HREF`) / M for a real how-to
- **Owner:** FE

---

## P2

### IQ-071 — `/verdict` UNKNOWN and INSUFFICIENT_DATA share one “26 brands” body
- **Status:** CONFIRMED
- **Severity:** P2
- **Surface:** `verdict-content.tsx:263-266`
- **Evidence:** `UNKNOWN || INSUFFICIENT_DATA` → `unknownBody` (“We track **26** clothing & sneaker brands…”). FreeChecker has a dedicated insufficient branch. Paying users with thin comps are told we don’t cover the category.
- **Fix size:** S
- **Owner:** FE

### IQ-072 — Brand-count copy is 26 / 28 / 32 / 3 depending on surface
- **Status:** CONFIRMED
- **Severity:** P2
- **Surface:** checker, `/verdict`, `/data`, `/api-docs`, brand strip
- **Evidence:** `seo-brands.json` **32**. `unknownFallback` **26**. “See the **28** brands we track” (`free-checker.tsx:608`, `verdict-content.tsx:276`). Live snapshot `brands_tracked` **28**, `brand_count` **3**. `/api-docs` “26 brands”. Homepage +19 more uses 28.
- **User impact:** Catalog size is not a number the product can agree with itself on.
- **Fix size:** S (one warehouse field interpolated)
- **Owner:** FE (+ data for API)

### IQ-073 — `WORKING_MODELS` ≠ `FREE_MODELS`
- **Status:** CONFIRMED
- **Severity:** P3
- **Surface:** `/verdict` chips vs homepage chips
- **Evidence:** `working-models.ts`: free = Samba, AF1, NB 530. Signed-in = 530, Levi's 501, NB 550. Comment: 501/550 **402 for anonymous**. `/verdict` UNKNOWN chips still offer 501/550.
- **Fix size:** S
- **Owner:** FE

### IQ-074 — UnlockPanel / live-deals / watchlist / search / compare / paywall are English-only
- **Status:** CONFIRMED
- **Severity:** P2
- **Surface:** Dashboard product, not marketing
- **Evidence:** `unlock-panel.tsx` hardcoded EN, `GuestCheckoutButton locale="en"`. `live-deals-modal.tsx` EN. Watchlist “Upgrade — €19/mo”. Search/compare market names EN. `paywall.tsx` “Item checks need a plan”. App-shell login prompt EN (`app-shell.tsx:179-180`). Nav is translated (`nav-copy.ts`); the pages behind it often are not. Matches the old “French homepage, English app” report for anyone who converted.
- **Fix size:** M
- **Owner:** FE

### IQ-075 — `/verdict` LIMIT_REACHED “See plans” can hit Starter
- **Status:** PARTIAL
- **Severity:** P2
- **Surface:** `verdict-content.tsx:219-224`
- **Evidence:** Daily cap copy + See plans → `/account`. Starter is supposed to be unlimited verdicts per entitlement docs; if BE still 402s a paid session, FE should not upsell Starter again (same class as #131 `checkerRefusalIsPaid`).
- **Fix size:** S once BE contract confirmed
- **Owner:** FE + BE

### IQ-080 — Two calculators, same word, different math
- **Status:** CONFIRMED
- **Severity:** P2
- **Surface:** `/tools/vinted-profit-calculator` vs `/calculator`
- **Evidence:** Public tool: fee toy (`public-profit-calculator.tsx`). Dashboard: `/api/calc`. Reverse calc is **not** `× 0.70` buy-below (#131 labelled only). Tools hub still sells “calculator” as if it were the product number.
- **Fix size:** S (rename public tool “Fee estimator”)
- **Owner:** FE / product

### IQ-081 — Price-checker page duplicates “Get the numbers →”
- **Status:** CONFIRMED
- **Severity:** P3
- **Surface:** `/tools/vinted-price-checker` `tools/[slug]/page.tsx:240-255`
- **Evidence:** Two identical labels, one `aria-label="Get the numbers from search"`.
- **Fix size:** S
- **Owner:** FE

### IQ-082 — `/tools` default checker hides the free-scope line
- **Status:** CONFIRMED
- **Severity:** P3
- **Surface:** `FreeChecker` `variant="hero"` only shows `heroFreeScope`
- **Evidence:** `/tools` uses default variant (`tools/page.tsx`). Homepage has “Free: Samba + AF1 + NB 530…”. Tools FAQ names them; body is vague (“some well-known models”).
- **Fix size:** S
- **Owner:** FE

### IQ-090 — HardPaywallCard unlock line is English on locale checkers
- **Status:** CONFIRMED
- **Severity:** P3
- **Surface:** `hard-paywall-card.tsx:67-68`
- **Evidence:** “€{price} unlocks this check — BUY, WATCH or SKIP plus the max to pay.” not in `i18n.ts`.
- **Fix size:** S
- **Owner:** FE

### IQ-091 — Backend `confidence_note` / `message` passed through in English
- **Status:** CONFIRMED
- **Severity:** P2
- **Surface:** Checker results, `/deals`, extension
- **Evidence:** Live Samba: `"Priced from 2408 active comparables, not watched sales"`. `i18n.ts` header documents backend-owned strings. FreeChecker UNKNOWN **ignores** `message` (`free-checker.tsx:589-593`); extension uses it. Deals `confidence_note` pass-through documented.
- **User impact:** DE UI labels + English diagnosis. Also: flagship SKU is **not** priced from watched departures this snapshot (`sold_7d: null`).
- **Fix size:** M (BE reasons + FE locale) / data (Samba comps)
- **Owner:** BE + data + FE

### IQ-092 — Order Planner + REST API still sold (charter “hard no”)
- **Status:** CONFIRMED (product decision, not a silent bug)
- **Severity:** P2 (policy) / P3 (if kept, they still have weak empty states)
- **Surface:** Pricing Pro list, support FAQ, `/api-docs`, sidebar, `/order-planner`
- **Evidence:** CLAUDE.md hard no: REST API · Order Planner. Live product still lists both (`pricing.ts`, `support-copy.ts`, `i18n` Pro features, `api-docs/page.tsx` “26 brands”, account REST API key UI). Order Planner `fetch /api/order-plan` — failed load leaves `plan` null with no error string (`order-planner/page.tsx:43-53`). #131 left this as founder decision.
- **Fix size:** S to hide / L to actually kill
- **Owner:** ops / founder + FE

### IQ-093 — Programmatic SEO thin when warehouse has no row
- **Status:** CONFIRMED (live Nike hub)
- **Severity:** P2 (SEO quality) / expected template when data exists
- **Surface:** `/flip/{brand}`, `/flip/{brand}/model/{slug}`, week-2 `/best` `/vs` `/for`
- **Evidence:** Numbers from `market-numbers.ts` only; missing → em-dash (honest). Live `/flip/nike` has no weekly volume. 17/32 SEO brands have **no** model chips. Week-2 landings share `packLanding` skeleton (`seo-copy-factory.ts`) with slug-specific paragraphs — templated, not doorway clones. Model pages EN-only by design.
- **User impact:** Ranked URLs with “—” where a number should be. Not fake zeros.
- **Fix size:** L (data) / M (noindex empty hubs)
- **Owner:** data + SEO

---

## P3 — a11y, mobile, extension, performance

### IQ-050 (see P1) KPI skeleton
### IQ-051 — Tools / dashboard mobile leftover
- **Status:** PARTIAL
- **Severity:** P3
- **Surface:** `/tools`, dashboard, `/data`
- **Evidence:** Homepage checker **does** stack <640px (`globals.css:481-513`); marketing H1 has a mobile token. `/tools` H1 is a raw 30–34px (`tools/page.tsx`, `tools/[slug]/page.tsx`) — no `h1-marketing-sm`. `/data` table `minWidth: 620`. Dashboard wraps **all** sections in `riq-scroll-x` (`dashboard-content.tsx:82`). Topbar search hidden ≤899px (`globals.css:241`). Extension panel fixed 232px bottom-left (`extension/content.css`).
- **User impact:** Not “no mobile CSS”; dense tools + sideways dashboard + overlay on Vinted. Report #6 is real as a cluster, not a missing viewport tag (layout.tsx has one).
- **Fix size:** M
- **Owner:** FE + extension-eng

### IQ-052 — Live deals modal a11y
- **Status:** CONFIRMED
- **Severity:** P3
- **Surface:** `live-deals-modal.tsx`
- **Evidence:** Close `×` has no `aria-label` (`:69`). No `role="dialog"` / focus trap. Thumbs `alt=""`. Escape works.
- **Fix size:** S
- **Owner:** FE

### IQ-053 — No skip link site-wide
- **Status:** CONFIRMED
- **Severity:** P3
- **Surface:** Root layout vs `#main` on landing
- **Evidence:** Grep skip-link: zero. `#main` exists on landing.
- **Fix size:** S
- **Owner:** FE

### IQ-054 — AppShell spinner if `/auth/me` never returns
- **Status:** CONFIRMED
- **Severity:** P2
- **Surface:** `app-shell.tsx` + `api.ts` (no timeout on `getMe`)
- **Evidence:** Checker aborts at 10s; auth does not. Hung API → full-screen RESALE·IQ spinner.
- **Fix size:** S
- **Owner:** FE

### IQ-055 — Extension rate-limit painted as “Sign in”
- **Status:** CONFIRMED
- **Severity:** P2
- **Surface:** `extension/content.js:472`
- **Evidence:** `res?.limited` (including rate) → `/login` + signIn. DESIGN-REVIEW.md §3. Quota vs 429 collision.
- **Fix size:** S
- **Owner:** extension-eng

### IQ-056 — Extension vs web UNKNOWN copy
- **Status:** CONFIRMED
- **Severity:** P3
- **Surface:** `content.js` vs `unknownFallback`
- **Evidence:** Extension: “model-level data for this brand yet”. Web: 26 brands / not electronics.
- **Fix size:** S
- **Owner:** FE

### IQ-057 — Quota / timeout amber vs WATCH amber
- **Status:** CONFIRMED (known, DESIGN-REVIEW)
- **Severity:** P3
- **Surface:** FreeChecker LIMIT_REACHED / timeout colors
- **Evidence:** DESIGN-REVIEW.md §2: LIMIT_REACHED shares WATCH amber. Timeout `#FF9F0A` (`free-checker.tsx:539`).
- **Fix size:** S
- **Owner:** FE / designer

### IQ-058 — `fmtCount` / `fmtEur` forced `en-GB` on locale pages
- **Status:** CONFIRMED
- **Severity:** P3
- **Surface:** `/de/data`, locale FreeChecker
- **Evidence:** `market-numbers.ts:208-209`, `free-checker.tsx:39-40`. DE should see `1.234` not `1,234`.
- **Fix size:** S
- **Owner:** FE

### IQ-059 — Welcome / pricing-eyebrow banners English
- **Status:** CONFIRMED
- **Severity:** P3
- **Surface:** `welcome-banner.tsx`, `pricing-eyebrow.tsx`
- **Fix size:** S
- **Owner:** FE

### IQ-100 — WebMCP
- **Status:** Healthy after #131
- **Severity:** —
- **Evidence:** JWT on `register-check-vinted-item-tool.tsx`; declarative forms on FreeChecker + public calculator; no checkout tools. Residual: agent still hits IQ-002 PAYWALL for non-allowlist queries.
- **Owner:** —

---

## Auth / plan gating (operator vs power)

| Check | Result |
|--------|--------|
| `locked_fields` not CSS blur | CONFIRMED healthy (`locked-fields.ts`, UnlockPanel comments) |
| FreeChecker paid skip GuestCheckout | CONFIRMED #131 (`checker-unlock-state.ts`) |
| Pricing cards Current plan / Manage | CONFIRMED #131 (`pricing-cta-state.ts`) |
| `/account` paid → Manage subscription only | CONFIRMED (`account/page.tsx:220-228`) |
| UnlockPanel Pro subscribe | **NOT FOUND** (entitled branch) |
| Cold `/verdict` €19 | **CONFIRMED** IQ-060 |
| Live Deal Finder shown to Starter | **CONFIRMED** IQ-040 |
| `/deals` paid-or-trial; `/compare` Pro-paid; `/order-planner` Pro-or-trial | CONFIRMED `app-shell.tsx:26-30` |
| Watchlist “Upgrade — €19/mo” | Only when `locked_fields` max_buy_price; paid should not see it if BE omits the lock |

---

## Pricing / checkout / activation

| Check | Result |
|--------|--------|
| Pro self-serve checkout | Healthy (no Talk-to-us on Pro) |
| Guest checkout cancel → locale `/pricing?checkout=cancelled` | Healthy (`checkout.ts`) |
| Billing success first-check AF1, no auto-eject | Healthy |
| Register logo → home | Healthy (UX-RULES #2 closed) |
| Demand Intel in customer UI | **NOT FOUND** (comments + checkout tests only) |
| Stripe dashboard name | Out of scope (AI/STRIPE.md); FE product copy is Resale IQ |
| `www.resaleiq.dev` duplicate homepage | **NOT FOUND** — live 308 to apex |

---

## Copy leftovers

| Topic | Result |
|--------|--------|
| Demand Intel brand | NOT FOUND in `src/` UI |
| Free taste models Samba / AF1 / NB 530 | CONFIRMED consistent on homepage, `/flip`, extension paywall, trial/support after #131. Gaps: `/tools` body vague (IQ-082); `/verdict` chips (IQ-073); locale pricing FAQ denies free checker (IQ-010) |
| REST API / Order Planner in Pro copy | CONFIRMED sold (IQ-092) vs charter hard no |

---

## NOT FOUND / already fixed (do not re-open)

- FreeChecker always showing GuestCheckout to Pro — **fixed #131** (`checkerUnlockBranch` paid).
- UnlockPanel “create a free account” for Pro — **fixed** (`unlock-panel-state.ts`).
- Extension 402 as “couldn’t reach Resale IQ” — **fixed #131**.
- `sold_7d` labelled as comparable `n` on brand rankings — **fixed #131**.
- Trial/support naming two free models — **fixed #131** (all three).
- Language switcher missing entirely — **exists**; incomplete (IQ-012).
- Register with no home link — **fixed**.
- www vs apex duplicate index — **308**.
- Putting `heroHonesty` “4 in 10” on the homepage — unused **on purpose** (OBJECTIVE). Do not ship it.

---

## Suggested order (profit, not completeness)

1. **IQ-001** — restore published brand rows (or the whole site looks empty).  
2. **IQ-002** — don’t Stripe-wall untracked queries.  
3. **IQ-060 + IQ-070** — paid `/verdict` cold path.  
4. **IQ-040** — Find live deals gating.  
5. **IQ-010 + IQ-012 + IQ-011** — DE/EU locale truth.  
6. **IQ-030** — teach the checker in 3 steps (no refusal-rate banner).  
7. **IQ-020 / IQ-021** — stop showing unpriced rows as “opportunities”.  
8. **IQ-050** — KPI error state.

No giant rewrite. Most of the P1 FE items are S.
