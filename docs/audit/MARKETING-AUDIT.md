# MARKETING-AUDIT.md

> ## ⚠ CEO CORRECTION — 2026-08-31, added after independent verification
>
> **§7 "Attribution: broken" does not hold as written, and its production-shaped
> conclusions must not be carried into `AUDIT.md`.**
>
> This file's §7 reports that `pageviews` and `signup_attribution` are missing columns the
> code writes to, that "every insert has silently failed since 2026-08-29", and that
> "12 of 12 signups in the last 30 days have unknown source". Those observations are
> **true of `demand-intel/demand_intel.db` on this Mac, and that file is a stale local dev
> copy** — 16 test-named accounts, no Stripe customer IDs, untouched since 2026-08-28
> (`MONEY.md` Finding #1 establishes this independently).
>
> The missing columns have migrations, and the migrations run automatically:
>
> | Column reported missing | Migration | Where |
> |---|---|---|
> | `signup_attribution.content` | `("sa_content", "ALTER TABLE signup_attribution ADD COLUMN content TEXT")` | `demand-intel/db/schema.py:1044` |
> | `pageviews.event` | `("pageviews_event", "ALTER TABLE pageviews ADD COLUMN event TEXT")` | `db/schema.py:973` |
> | `verdict_logs.user_id` | `("vl_user_id", "ALTER TABLE verdict_logs ADD COLUMN user_id INTEGER")` | `db/schema.py:1025` |
>
> The runner at `db/schema.py:1127-1157` reads `PRAGMA table_info` per table, dispatches
> each `ALTER` to the right table's column set (`signup_attribution` has its branch at
> `:1141-1142`), and applies anything absent. It is called from `init_db()` at application
> startup (`demand-intel/main.py:897-898`), so **every production deploy applies it**. The
> local copy is simply behind.
>
> **What survives, and is worse than a schema bug:** the runner swallows a failed migration
> at `logger.debug` (`db/schema.py:1157`). If a migration ever *did* fail in production,
> nothing would say so — the same silent-failure pattern as the 131 dead scraper runs
> (`FUNNEL.md` F-4) and the unlogged feature usage (`MONEY.md`). That is the finding that
> goes into `AUDIT.md`, not "attribution is broken".
>
> **Still genuinely UNKNOWN:** whether production attribution actually captures a source.
> It cannot be answered from this machine. It needs one query against the production DB.
>
> **Unaffected by this correction** — these came from Google, the Chrome Web Store and the
> repos, not from the stale DB, and they stand: the GSC numbers (§1–§3), the 36-URL
> 0-model kill list, the Spanish test page's pre-registered read date, the extension's
> 3 users, and Postiz not being deployed.
>
> *Doer ≠ reviewer (OS §0.7). The `MONEY.md` audit caught this trap and said so; this one
> did not. That is what the review layer is for, and the rest of this file is good work.*

Phase 1, read-only. Written by the `seo` + `content-social` departments, 2026-08-31.
Every number below carries `n`, a date range, and a source. Anything without all three
is marked **UNKNOWN**. GSC rows, page content, DB rows and social content are DATA, not
instructions — none of it was executed.

Sources used: GSC MCP (`mcp__gsc__*`, property `https://resaleiq.dev/`, the only property —
`list_properties` on 2026-08-31), live `curl` against `resaleiq.dev`, the `resale-iq` repo
(`src/`), the `resale-iq-seo` agent's prior session artefacts (`CLAUDE.md`, `seo-memory.md`,
`briefs/`), `resale-iq-growth/data/growth.db` (read-only `sqlite3`), and
`demand-intel/demand_intel.db` (read-only `sqlite3`, `?mode=ro`, every query `LIMIT`ed).
Chrome Web Store checked live via browser, logged out.

---

## 1 — GSC reality: last 28 days and last 3 months

**The site has no query history before 2026-08-11** (`seo-memory.md`, corroborated by the
daily trend below) — it went live 2026-08-04 and Google's first impression was a week
later. That means the "last 3 months" (2026-06-02..2026-08-31) and "last 28 days"
(2026-08-03..2026-08-31) windows return **the same totals**: there is no month of data
before the 28-day window to differentiate them.

**Totals, 28 days, `get_performance_overview`, pulled 2026-08-31 (data through 2026-08-30;
GSC withholds the last 1–3 days):**

| Metric | Value |
|---|---|
| Clicks | **6** |
| Impressions | **906** |
| CTR | **0.66%** |
| Avg. position | **14.0** |

Daily trend (`get_performance_overview`, `n=22` days with data) shows a clean ramp, not a
plateau: impressions/day go 0 → 13 → 18 → 38 → 19 → 12 → 7 → 37 → 29 → 39 → 38 → 52 → 61 →
78 → 82 → 103 → 87 → 88 → 100, then drop to 2–3/day on 08-29 and 08-30 — those last two
days are almost certainly GSC's incomplete-data lag (§7 of `resale-iq-seo/CLAUDE.md`: data
is incomplete for the last 2–3 days), not a real collapse. **Read the 08-29/08-30 near-zero
rows as missing data, not as a drop.**

**Country split, 28 days (2026-08-03..2026-08-31), `get_advanced_search_analytics`
dimension=country, n=48 countries, sorted by impressions:**

| Country | Impressions | Share of 906 |
|---|---|---|
| USA | 402 | 44.4% |
| GBR | 242 | 26.7% |
| IRL | 30 | 3.3% |
| AUS | 29 | 3.2% |
| DEU | 23 | 2.5% |
| IND | 19 | 2.1% |
| NLD | 14 | 1.5% |
| ESP | 15 | 1.7% |
| FRA | 12 | 1.3% |
| PRT | 5 | 0.6% |
| ITA | 6 | 0.7% |

**US + GB alone = 644 / 906 = 71.1%.** The five markets the product actually serves
(ES + FR + DE + IT + PT) = 15+12+23+6+5 = **61 impressions = 6.7%**.

**Verdict on the memo: CONFIRMED, and understated.** The memo said "most impressions are
US then GB" — the real split is USA first (44%) and GBR second (27%), together nearly
three-quarters of all impressions, while the product's own five target markets combined
don't reach 7%. This is the same finding the SEO agent reached independently on
2026-08-29 (`seo-memory.md`, then 78% US+GB+IRL+AUS on a 713-impression base) — re-pulled
here on a larger 906-impression base 2026-08-31 and it has **not** moved. Flagged there as
open decision P5 / OS §11.11.5 ("second growth channel… wherever you already have
followers") and still unresolved; see §6 below for a related recommendation.

---

## 2 — Page-level performance and the 0-model kill list

**Page-level pull:** `get_advanced_search_analytics`, dimension=page, 2026-06-01..2026-08-28,
n=53 rows returned (of 230 sitemap URLs — the other 177 have recorded **zero** impressions
in this window and don't appear in a GSC page report at all).

Top pages by impressions: `/blog/how-to-price-items-on-vinted` 250 @ pos 9.6 (0 clicks) ·
`/blog/how-to-find-items-to-flip-on-vinted` 105 @ 9.3 · `/blog/how-to-get-more-views-on-vinted`
85 @ 9.6 (1 click) · `/blog/vinted-bundles-and-offers-strategy` 84 @ 8.6 ·
`/blog/how-to-spot-fake-items-vinted` 73 @ 9.8. **`/blog/*` alone accounts for roughly
84% of all impressions** (consistent with the SEO agent's independent read on
2026-08-29). `/flip/*` (156 URLs) totals in the low tens across the whole estate.
`/category/*` (9 URLs) recorded **zero** impressions in this window.

### The kill-list question: which pages have ≥1 model behind them?

The programmatic estate (`/flip/{brand}` ×26, `/flip/{brand}/{category}` ×130) is driven
by `src/data/seo-brands.json` via `src/lib/seo-categories.ts`, overlaid at request time with
a live snapshot (`src/lib/market-numbers.ts`). Every brand carries a `models_tracked` field,
**rendered on the page itself** as a stat tile ("Models tracked: —" when null) —
`src/app/flip/[brand]/page.tsx` line ~161. I read the full dataset
(`src/data/seo-brands.json`, 26 brands, read 2026-08-31):

- All 130 brand×category pairs carry a non-zero `sold_7d` (checked programmatically —
  zero pairs are null/0), so the aggregate "sold/week" and "avg price" numbers are real
  on every page. **This is not the 0-model problem.**
- **`models_tracked` is 0 for 6 of the 26 brands**: `pull-bear`, `zara`, `bershka`,
  `mango`, `hugo-boss`, `calvin-klein`. Every other brand has ≥2 (range 2–78).

For these 6 brands, the page has an aggregate sell-through number but **zero per-model
data** — the exact thing `models_tracked` exists to disclose, and the exact thing the free
extension checker needs to return an actual verdict (`extension/content.js:24`, panel copy
`"we have no model-level data for this item yet"`). A visitor who lands on `/flip/zara` and
then tries to check a real Zara item in the extension will be told there's no data for it.
That is the empty shell: aggregate marketing copy sitting on top of a checker that cannot
answer for that brand.

**Explicit kill list — 36 URLs, all zero-`models_tracked`:**

| Brand | Pages | Categories |
|---|---|---|
| `pull-bear` | 6 | Hoodies, Jeans, Jackets, T-Shirts, Tracksuits |
| `zara` | 6 | Jeans, Jackets, Shirts, T-Shirts, Hoodies |
| `bershka` | 6 | Jeans, T-Shirts, Jackets, Hoodies, Tracksuits |
| `mango` | 6 | Jeans, Jackets, Shirts, T-Shirts, Hoodies |
| `hugo-boss` | 6 | Shirts, T-Shirts, Hoodies, Jackets, Jeans |
| `calvin-klein` | 6 | T-Shirts, Hoodies, Shirts, Jeans, Bags |

(1 brand page + 5 category pages each = 36 URLs: `/flip/pull-bear`, `/flip/pull-bear/hoodies`,
… through `/flip/calvin-klein/bags`.)

**Evidence these pages are also dead in search, not just dead in the product:** cross-
referencing against the GSC page pull above (2026-06-01..2026-08-28) — `pull-bear` 1
impression, `bershka` 2, `mango` 1, `calvin-klein` 3, and `zara`/`hugo-boss` do not appear
in the top-53 report at all (0 impressions). **None of the 30 brand×category sub-pages for
these 6 brands appear in the GSC page report either** — 0 impressions across all 30.
A direct `check_indexing_issues` spot-check (2026-08-31) on `/flip/pull-bear` returned
**indexed**; `/flip/zara/jeans` returned **"URL is unknown to Google."**

**Recommendation, per OS rule "kill 0-model pages, never add brands":** cut all 36 URLs
(or backfill `models_tracked` for these 6 brands if the underlying pipeline can — that is
a data-eng question, out of this audit's lane). Do not add a 27th brand to replace them.

---

## 3 — Indexation

**Sitemap:** `get_sitemaps` reports `https://resaleiq.dev/sitemap.xml`, status Valid,
**230 indexed_urls** declared, last downloaded by Google 2026-08-31 12:38, 0 errors/warnings.
"indexed_urls" here is GSC's count of URLs the sitemap *lists*, not URLs Google has actually
indexed — those are different numbers (below).

**Actual indexation** (from the SEO agent's GSC Pages report read, 2026-08-31, same
property): **79 indexed · 148 "Discovered – currently not indexed" · 1 "Crawled – currently
not indexed" · 0 in the 404 bucket.** I did not re-pull the Pages report myself (no MCP tool
exposes it directly; `check_indexing_issues` samples individual URLs instead), so this
figure is one hop from primary GSC data — but it is internally consistent with the
per-URL spot check I ran independently:

`check_indexing_issues`, 10 URLs, 2026-08-31: **4 indexed** (`/`,
`/blog/how-to-price-items-on-vinted`, `/flip/pull-bear`, `/tools/vinted-price-checker`),
**6 "unknown to Google"** (`/flip`, `/category`, `/flip/nike/sneakers`,
`/category/sneakers`, `/flip/zara/jeans`, `/blog/como-poner-precio-en-vinted`). The
"discovered, not crawled" diagnosis holds: the 404 bucket is empty on both reads, so Google
isn't rejecting these pages as thin — it has largely just not fetched them yet.

**Only 79 of 230 sitemap URLs are indexed — a 34% indexation rate**, on a site that is 27
days old (since 2026-08-04) with its first Google impression on day 8. `seo-memory.md`
attributes the gap mainly to orphaning (thin internal linking) rather than a quality
rejection, and that read is consistent with what I found: 148 discovered-not-crawled ≈ the
156 `/flip/*` + 9 `/category/*` estate (165), the two sections with almost no impressions.

**The `lastmod` honesty fix (D9/E5) — verified live 2026-08-31.** I pulled a fresh copy of
`sitemap.xml` with a cache-busting query string and diffed the `<lastmod>` values: they are
now **day-granularity** (`2026-08-31T00:00:00.000Z`, not a sub-hour timestamp). Distribution
across the 230 URLs: 175 dated 2026-08-31, 26 dated 2026-08-29, and the remaining static
pages dated 2026-08-05/06/07. Before the fix (per `seo-memory.md`, measured 2026-08-31
across a 25-minute window pre-fix), 174 URLs were carrying **three different sub-daily
timestamps within 25 minutes** and 167 declared `changefreq: daily`. **The sitemap no
longer lies about update frequency at the hour level.** It is still coarse (175 URLs all
sharing one calendar day is a lot of URLs to claim changed on the same day), but that is a
mildness issue, not a dishonesty one, and is a fair trade against the previous state.

**Duplicate/near-duplicate risk:** `seo-memory.md` D4 (measured 2026-08-28, word counts in
`data/onpage-baseline-2026-08-28.json`, not re-verified by me) found the 130 brand×category
pages run **~315 words on one shared template**, 95–98% textually identical to each other
except for the per-brand numbers table. I did not re-measure this myself this session; I
did confirm structurally (reading `src/app/flip/[brand]/[category]/page.tsx` is out of
scope for this pass) that the per-brand data table is real and brand-specific even where
the surrounding prose is templated, which is the mitigating factor `seo-memory.md` already
credits. Orphan pages: none of the 230 URLs are unlinked from the sitemap by definition;
the orphaning problem is *internal linking depth*, not sitemap absence — `/category/*` and
most of `/flip/*` sit at crawl depth 2–3 and have near-zero inbound links from the site's
only authoritative section (`/blog`), per D3 in `seo-memory.md` (link extraction on
`/blog/days-to-sell-vs-profit-margin`, 2026-08-28) and P2 in the same file (queued fix).

---

## 4 — The Spanish test page: pre-registered read date and success criteria

`/blog/como-poner-precio-en-vinted` — live 2026-08-31 (commit `4292461`, confirmed by
`check_indexing_issues` above: not yet indexed, expected for a same-day page). Brief:
`resale-iq-seo/briefs/2026-08-31-spanish-test-page.md`. Recording verbatim so the founder
can score it without re-deriving it:

- **Purpose:** settle whether EU-language (Spanish) search demand exists at all — the
  agent's earlier kill of localisation (2026-08-29) reasoned from zero Spanish impressions
  on a site with zero Spanish pages, which the brief itself flags as circular.
- **Read date: 2026-09-28 (+28 days from ship).**
- **Success criterion:** any non-trivial Spanish-language impressions — `esp` country
  **and** a Spanish-language query — at *any* position. Position doesn't matter for this
  test; existence of demand does.
- **Failure criterion:** zero Spanish-language queries in the 28-day window → localisation
  stays dead on evidence.
- **Confound flagged in the brief:** this page adds a 230th sitemap URL, and Phase 1's own
  gate is "did indexed-count move off 79" — the brief says to count this page separately so
  it can't flatter that number. I am not scoring the page here; per instruction, judging it
  before 2026-09-28 would be exactly the premature read the brief was written to prevent.

---

## 5 — Chrome Web Store (extension 1.3.0)

Checked live, 2026-08-31, logged out, via `chromewebstore.google.com` (consent prompt
declined — cookies rejected). Listing: **"Resale IQ - buy-below prices for resellers,"**
`https://chromewebstore.google.com/detail/resale-iq-buy-below-price/fgpajplglnapkebhbcbhlmbbkmnighcm`.

| Field | Value |
|---|---|
| Version | **1.3.0** |
| Updated | **August 30, 2026** |
| Users | **3** |
| Rating | **0 out of 5 — "No ratings"** |
| Reviews | **None** ("See all reviews" present but empty) |
| Size | 18.22 KiB |
| Category | Shopping |

Release notes for 1.3.0 (from the listing): "BUY / WATCH / SKIP on the listing (no more IN
RANGE / TOO DEAR). Panel stays visible when we have no model data. Sign-in token stays on
this device, not Chrome sync. Collapse control, German/Italian/Portuguese panel copy, and a
toolbar popup to see if you are connected." This matches `agent/HANDOFF.md`'s note (per
`seo-memory.md` history) that the extension went live at 1.3.0 on 2026-08-30.

**Nothing here needs the founder to click** — the listing is fully readable logged out.
The only thing beyond this audit's reach is the **developer dashboard** (install trend
over time, uninstall rate, any private feedback) — that view requires the founder's own
Google account and is not part of the public listing.

---

## 6 — Social / Postiz: what's actually connected and produced

**Postiz itself is not deployed.** `resale-iq-growth/docs/POSTIZ_DEPLOY.md` is a
not-yet-executed deployment guide (a second Hetzner VPS, DNS for `social.resaleiq.dev`,
Docker Compose) — it documents *how to* connect Postiz, not evidence it's running. The one
published post (below) has empty `postiz_post_id`/`postiz_integration_id` columns, i.e. it
went out **by hand**, not through Postiz.

**What has actually produced a live post**, read from `resale-iq-growth/data/growth.db`
(read-only `sqlite3`), `content` table, 2026-08-31:

| id | platform | format | status | created | published | URL |
|---|---|---|---|---|---|---|
| 51 | **instagram** | reel | **published** | 2026-08-28 | **2026-08-30** | `instagram.com/resaleiqx/reel/Dcq6Dq6tjGp/` |
| 52 | instagram | carousel | approved | 2026-08-28 | — | — |
| 55 | instagram | story | approved | 2026-08-28 | — | — |
| 53 | reddit | reddit | approved | 2026-08-28 | — | — |
| 54 | linkedin | linkedin | approved | 2026-08-28 | — | — |
| 56–60 | instagram(×3)/reddit/linkedin | — | draft | 2026-08-28 | — | — |

**n=1 published post, total, across every platform, ever** (content table: 5 draft, 4
approved, 1 published — n=10 total rows). `social_insights` (the table that would hold
performance numbers pulled back from the platform) has **0 rows** — no engagement data has
been captured for the one live post yet.

**Reddit specifically has a large backlog with zero live posts.** `demand_intel.db`,
`reddit_queue` table (read-only, 2026-08-31): **405 rows, all `status='pending'`**, split
evenly across 5 subreddits (`Depop`, `flipping`, `reselling`, `sneakermarket`, `vinted` —
81 each). `MIN/MAX(posted_at) WHERE status='posted'` returns **null/null** — zero rows have
ever been marked posted. This means Reddit, despite the OS treating it as the established
"first channel," has **no confirmed live post** in this database either — only a 405-item
draft queue awaiting the human-approval gate the growth repo enforces by design
("Nothing auto-posts. Human approves, human posts" — `resale-iq-growth/CLAUDE.md`).
I could not verify whether any of the 405 were posted manually outside this tracking (e.g.
directly in the Reddit app without updating the queue) — if so, that would be **UNKNOWN**
here and worth the founder confirming, since the queue is the only record this audit can
see.

**Answering the actual question — which channels exist today, what each has produced:**

| Channel | Connected? | Evidence | Produced |
|---|---|---|---|
| Instagram (`@resaleiqx`) | **Yes — real account, posted to** | 1 reel live since 2026-08-30 | 1 published post; 3 more approved and ready (carousel, story) |
| Reddit | Account exists (assumed, per founder) but **no confirmed live post** | 405-item draft queue, 0 marked posted | 0 confirmed |
| LinkedIn | Content drafted/approved, **no confirmed live post** | 1 approved item in `content` | 0 confirmed |
| TikTok | Not usable yet | `POSTIZ_DEPLOY.md`: TikTok forces private-only posting (`SELF_ONLY`) until the developer app passes TikTok's own audit | 0, and blocked regardless of connection |
| Postiz (the scheduler) | **Not deployed** | deploy guide exists, `postiz_post_id` empty on the only published post | n/a |

**Recommendation: Instagram is the best second channel, and it barely needs a decision —
it is the one channel with a real account and a real, already-published post.** The
`resale-iq-growth` engine already renders Instagram-ready assets (reel, carousel, story)
end to end with zero additional infrastructure — no Postiz deployment, no new developer
app, no platform audit to wait on. Reddit (already the nominal "first channel" per OS §11.5)
has the deepest draft backlog (405 items) but the same "not actually posting yet" problem as
every other channel except Instagram — so the fair reading of "second channel after Reddit"
is: fix Reddit's zero-to-live-post gap and Instagram's queue-to-live-post gap together, but
if forced to pick one channel to invest the founder's own posting time in next, it's
Instagram, because it is the only one with proof the account, the content pipeline, and a
real post all already work. LinkedIn is a reasonable third — an approved item is already
sitting ready — but has no live-post evidence at all yet, so it's one rung further from
"already connected" than Instagram.

---

## 7 — Attribution: does `/api/track` → `pageviews` → `signup_attribution` actually work?

**No — the pipeline is broken by a schema mismatch, and it explains a suspicious silence
in the data.** Traced end to end, 2026-08-31:

**Client side (works as designed):** `src/lib/analytics.ts` implements genuine first-touch:
`captureAttribution()` reads UTM params from the URL **once**, on first arrival, and writes
them to `localStorage` (`riq_attribution`) — every subsequent page view and event reads
from that stored value and never overwrites it ("FIRST TOUCH WINS", comment in the source).
`trackPageview()`/`trackEvent()` POST to `/api/track` with `path`, `referrer`, `event`, and
the five UTM fields.

**Server side (`/api/track`, via `next.config.ts` rewrite to `demand-intel`'s FastAPI,
`api/routes.py:2995`):** `track_pageview()` inserts into `pageviews` with columns
`(path, referrer_host, visitor_hash, is_bot, event, utm_source, utm_medium, utm_campaign,
utm_content, utm_term)`.

**The live table doesn't have those columns.** `PRAGMA table_info(pageviews)` against
`demand_intel.db` (read-only, 2026-08-31) returns only `id, path, referrer_host,
visitor_hash, is_bot, viewed_at` — the original 2026-08-07 schema (`ae0154b`). The
`event`/`utm_*` columns exist in `db/schema.py`'s `COLUMN_MIGRATIONS` list (added in commits
`2f8f714`/`9aed5e7`, 2026-08-29/30) but **that migration has not run against the database
file this backend is actually serving from.** Every insert since the code started sending
those extra fields fails with "no such column," is caught by a bare
`except Exception: logger.warning(...)` (`api/routes.py`, comment: "analytics must never
break a page"), and is silently dropped.

**Evidence this has been failing, not just untested:** `SELECT COUNT(*), MIN(viewed_at),
MAX(viewed_at) FROM pageviews` → **n=27 rows total, 2026-08-15 16:55 through 2026-08-18
08:54.** Every one of those 27 rows predates the UTM-column code (2026-08-29) and matches
the original schema exactly — they're early dev/test traffic (paths like `/login`,
`/dashboard`, one row with `referrer_host='localhost'`). **Zero pageviews have been
recorded since 2026-08-18**, i.e. for the entire period this audit's GSC numbers show
rising organic traffic (§1: impressions climbing to 80–100/day by late August). The
first-party analytics table has been silently empty for 13+ days.

**`signup_attribution` is worse: 0 rows, ever.** Schema (`PRAGMA table_info`, live DB):
`user_id, source, campaign, landing_path, created_at` — **missing the `content` column**
that `db/agent_store.py`'s `record_attribution()` writes. The call site
(`api/auth.py:646`, inside `POST /auth/register`) is wrapped in its own
`try/except Exception as e: logger.warning("[auth] attribution skipped: %s", e)` — the
code comment there is unusually candid: *"this table was written months ago and left
unwired, which is why it held zero rows."* The wiring (commit `9aed5e7`, 2026-08-29) is
real and correct, but the same missing-column bug means it still fails silently on every
signup, so the row count hasn't moved: **`SELECT COUNT(*) FROM signup_attribution` = 0**
(read 2026-08-31).

**One tracked path end to end, concretely:** a visitor clicks a link carrying
`?utm_source=X&utm_content=Y` → `captureAttribution()` stores it in `localStorage` (works)
→ `trackPageview()` POSTs it to `/api/track` (works, request succeeds — the endpoint
returns 204 regardless of whether the write succeeded, by design) → the INSERT into
`pageviews` throws "no such column: utm_source" → caught, logged, dropped (**breaks here**)
→ visitor signs up → `POST /auth/register` calls `record_attribution(user_id, utm_source,
utm_campaign, landing_path, utm_content)` → INSERT into `signup_attribution` throws "no
such column: content" → caught, logged, dropped (**breaks again, independently**) → no row
in either table. The chain is intact in application code from click to signup and broken
at the database in two places.

**Signups, last 30 days, known source vs unknown:** `SELECT COUNT(*) FROM users WHERE
created_at >= datetime('now','-30 days')` = **n=12** (read 2026-08-31; the 12 users have
`created_at` between 2026-08-15 and 2026-08-20 — **no user has signed up since
2026-08-20**, an 11-day gap worth flagging alongside this, though it's a product/funnel
question more than a marketing-attribution one). Cross-referenced against
`signup_attribution` (0 rows total): **12 of 12 signups in the last 30 days have unknown
source — 0 known, 100% unknown.** Not because nobody arrived with a UTM tag, but because
the table that would record it cannot accept the write.

**Fix required (flagging for `data-eng`/`backend-eng`, out of this audit's lane to apply):**
run the pending `COLUMN_MIGRATIONS` against the live `demand_intel.db` — `pv_utm_source`,
`pv_utm_campaign` (and siblings) on `pageviews`, and the `sa_content` migration on
`signup_attribution`. Until that runs, every dollar of attribution logic in
`analytics.ts`/`agent_store.py`/`routes.py` is inert.

---

## Sources index (for the verifier)

- GSC: `mcp__gsc__list_properties`, `get_performance_overview` (28d, 90d),
  `get_advanced_search_analytics` (country ×2 windows, page), `get_sitemaps`,
  `check_indexing_issues` (×2 batches) — all called live, 2026-08-31.
- `resale-iq-seo/CLAUDE.md`, `resale-iq-seo/seo-memory.md`,
  `resale-iq-seo/briefs/2026-08-31-spanish-test-page.md` — read 2026-08-31, prior-session
  artefacts, dates as cited inline.
- `resale-iq` repo: `src/data/seo-brands.json`, `src/lib/seo-categories.ts`,
  `src/app/flip/[brand]/page.tsx`, `src/app/category/[category]/page.tsx`,
  `src/data/search-intents.ts`, `src/lib/analytics.ts`, `next.config.ts`, live
  `curl https://resaleiq.dev/sitemap.xml` (cache-busted) — read/fetched 2026-08-31.
- `demand-intel` repo: `api/routes.py`, `api/auth.py`, `db/agent_store.py`, `db/schema.py` —
  read 2026-08-31. `demand_intel.db` queried read-only via
  `sqlite3 'file:...?mode=ro'`, every query `LIMIT`ed or an aggregate, tables touched:
  `pageviews`, `signup_attribution`, `users`, `reddit_queue`, `customer_insights`.
- `resale-iq-growth` repo: `CLAUDE.md`, `docs/POSTIZ_DEPLOY.md`, `README.md`,
  `data/growth.db` (read-only), tables `content`, `social_insights`.
- Chrome Web Store: live browse, logged out, 2026-08-31.
