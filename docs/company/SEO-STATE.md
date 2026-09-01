# SEO-STATE — what Google Search Console actually shows

**Written:** 2026-09-01. **Source of every number below:** `resale-iq-seo/data/gsc/2026-09-01-*.json`,
pulled today via the site's own OAuth-authenticated pull script (`./scripts/gsc-pull`), property
`https://resaleiq.dev/` (URL-prefix, no domain property exists). Every figure carries its window.

---

## The single most surprising thing: this site has almost no search history at all

I pulled both a 28-day window (2026-08-02 → 2026-08-29) and a 90-day window (2026-06-01 →
2026-08-29). **They returned identical totals** — same 5 clicks, same 903 impressions, same CTR
(0.55%), same average position (14.0), same 20 rows of daily data, same 48 countries, same 54
pages. `2026-09-01-28d-manifest.json` and `2026-09-01-90d-manifest.json` are byte-identical on
`totals`. The daily breakdown (`2026-09-01-90d-date.json`) starts at **2026-08-10** (0 impressions
that day, the first day with any row at all) and the 60 days before that (2026-06-01–2026-08-09)
contributed **zero** rows to any dimension.

**In the entire span Google Search Console has data for this property — about three weeks —
resaleiq.dev has recorded 5 clicks, total, site-wide.** Everything below is analysis of a
five-click, three-week-old search footprint. Treat every rate computed from it (CTR splits,
country splits below the top two rows) as directional, not a finding — n=5 is far under any
reasonable floor.

## Second most surprising thing: the GSC MCP tool has never actually worked

`mcp__gsc__list_properties` (and every other `mcp__gsc__*` call) fails with:
```
GSC_OAUTH_CLIENT_SECRETS_FILE is set to '/Users/bilalsbaiby/Desktop/resale-iq-seo/.secrets/gsc-oauth-client.json' but the file does not exist.
```
The registration in `~/.claude.json` (user scope, `mcpServers.gsc.env`) still points at
`~/Desktop/resale-iq-seo/.secrets/`. That directory is empty — the actual credentials
(`gsc-oauth-client.json`, `token.json`) live at `~/work/resale-iq-seo/.secrets/`, the path the repo
tree was moved to. This is a stale-path config issue, not a "no data" or "no access" situation: the
account is authenticated and working (the pull script proves it — it re-used the cached token with
no login prompt) but the **live MCP tool** the roster is meant to call is broken until someone with
authority over `~/.claude.json` fixes the two `env` paths and restarts. I did not edit that file
myself — it's outside every repo I have write authority over and touches OAuth config, which reads
as "security settings." **Parking this in `APPROVALS.md` is the right move; I'm noting it here
because it means today's numbers come from the pull script's on-disk snapshots
(`resale-iq-seo/data/gsc/2026-09-01-*.json`), not from a live `mcp__gsc__*` call**, and every future
session hits the same wall until it's fixed.

---

## 1. What is actually happening in search (2026-08-02 → 2026-08-29, 28d = 90d, see above)

- **5 clicks, 903 impressions, CTR 0.55%, average position 14.0.** Source: `2026-09-01-28d-manifest.json`.
- Daily trend (`2026-09-01-28d-date.json`): impressions ramp from 0 (Aug 10) to a peak of 103 (Aug
  25), settling in the 80–100/day range through Aug 28, then **drop to 2 on Aug 29** (last day
  before the 3-day GSC lag boundary — too recent to read as a trend break).
- 54 distinct pages received at least one impression in this window (`2026-09-01-28d-page.json`);
  the sitemap (`https://resaleiq.dev/sitemap.xml`, checked live today) lists **230** URLs. So **176
  of 230 sitemap URLs (76%) got zero impressions** in the entire window GSC has data for.
- Nothing is close to converting. Of the 54 pages with impressions, only **4** logged a click at
  all: `/` (2 clicks/32 impr), `/data` (2/38), `/blog/how-to-get-more-views-on-vinted` (1/85), and
  one country/page pair contributing the 5th. Every other page — including
  `/blog/how-to-price-items-on-vinted` at 250 impressions and position 9.6, and
  `/blog/how-to-find-items-to-flip-on-vinted` at 105 impressions and position 9.3 — has **0 clicks**
  despite front-page-adjacent positions. That's a title/snippet problem on the highest-impression
  pages, not a ranking problem.
- 29 distinct queries are visible (`2026-09-01-28d-query.json`); all are non-branded
  ("vinted vs depop", "how to price vintage clothing", "vinted description generator" …). None of
  the visible queries are branded ("resale iq"). Given 903 impressions vs. 29 disclosed queries, most
  of the volume sits in GSC's undisclosed long-tail bucket (queries too rare to name individually —
  normal GSC behavior at this volume, not a bug).

## 2. The UK claim — checked, and it is true, but it isn't the signal it's being used as

`resale-iq/CLAUDE.md` line 38: *"It was removed because Search Console shows GB is the
second-largest source of impressions after the US."*

**Country split, 28d = 90d** (`2026-09-01-28d-country.json`, 48 countries, clicks/impressions/CTR):

| Country | Clicks | Impressions | CTR | Avg position |
|---|---|---|---|---|
| USA | 0 | 402 | 0% | 11.8 |
| **GBR** | 1 | **241** | 0.41% | 12.6 |
| IRL | 0 | 30 | 0% | 9.4 |
| AUS | 0 | 29 | 0% | 9.3 |
| DEU | 0 | 23 | 0% | 8.1 |
| IND | 0 | 18 | 0% | 64.9 |
| ESP | 1 | 15 | 6.7% | 15.3 |
| NLD | 0 | 14 | 0% | 6.7 |
| FRA | 1 | 11 | 9.1% | 21.0 |
| FIN | 1 | 10 | 10% | 7.4 |
| ITA | 0 | 6 | 0% | 9.0 |
| PRT | 0 | 5 | 0% | 7.6 |

**Verdict: the claim is correct.** GBR is the 2nd-largest source of impressions (241) after USA
(402), out of 48 countries. It is a real, checkable fact — not stale or fabricated.

But look at what it's built on: GBR's 241 impressions produced **1 click** (0.41% CTR), and the
queries behind those impressions (`2026-09-01-28d-country_query.json`) are generic comparison
searches — "depop vs vinted", "vinted vs depop", "is depop or vinted better" — not searches that
imply intent to use a resale-pricing tool. This is impression volume on generic content, not
evidence of latent UK demand for the product. The "ban on considering UK" language in
`resale-iq/CLAUDE.md` is careful about this (says "lifts the ban on *considering*", not "proves
demand") — that nuance should stay attached whenever this fact gets cited again.

## 3. The ES/FR/DE/IT/PT mismatch, quantified

Product coverage is ES/FR/DE/IT/PT only (`market-numbers.ts`, per `resale-iq/CLAUDE.md`). From the
same country table:

- **Our 5 served markets combined: 60 impressions (6.6% of the 903 total), 2 clicks.**
- **USA + GBR alone (markets we do not serve): 643 impressions (71.2% of the total), 1 click.**

Two-thirds of everything the site is showing up for is in a market it cannot serve, versus one
click in fifteen shown to markets it can. n=5 total site clicks means the click-side comparison
(2 vs 1) is not statistically anything — flagging it only because it's the literal count, not
because it's meaningful. The impression-share mismatch (71% unserved vs. 7% served) is the real,
larger-sample finding, and it's consistent with what an English-only site would produce: Google
ranks it for English-language queries, which cluster in English-speaking countries, regardless of
which markets the product actually prices.

## 4. Indexing health — partial, and here is exactly where it's incomplete

The GSC Index Coverage / URL Inspection tools (`mcp__gsc__inspect_url_enhanced`,
`mcp__gsc__check_indexing_issues`, `mcp__gsc__get_sitemaps`) are unreachable — same broken MCP
config as above. **I have no confirmed indexed/excluded count and I am not going to estimate one.**

What Search Analytics data *can* show — a weaker, indirect signal, labeled as such — is which URLs
ever surfaced for any query in Google's ~3-week data window:

- `/flip` estate: 157 sitemap URLs (1 hub + 26 `/flip/[brand]` + 130 `/flip/[brand]/[category]`,
  counted live from the sitemap today). **21 of 157 (13%) ever got an impression**
  (`2026-09-01-90d-page.json`), each in the 1–7 impression range, **0 clicks on any of them.** 136
  never appeared once.
- `/category` estate: 10 sitemap URLs (1 hub + 9 `/category/[category]`). **0 of 10 ever got a
  single impression** in the entire window.

That is consistent with a thin-content exclusion, but it is also consistent with these pages simply
being new/low-authority and not yet ranking for anything — Search Analytics presence is not the
same signal as Index Coverage status, and I won't collapse the two. **This needs an actual Index
Coverage check once the MCP path is fixed.** Given the standing instruction not to add pages, and
that `content-social` rewrote copy across this whole estate today, the right sequencing is: fix the
tool → check real coverage status → *then* decide whether the rewrite helped, before anyone
considers touching page count.

## 5. Locale/hreflang visibility — confirmed invisible to Google, and it's a routing problem

Checked live against `resaleiq.dev` today (all via `curl`, no MCP dependency):

- `robots.txt` and `sitemap.xml` (230 URLs) contain **no locale-prefixed paths** — no `/es`, `/fr`,
  `/de`, `/it`, `/pt`. Direct requests to those five paths all return **404**.
- No `<link rel="hreflang">` tags anywhere in the homepage HTML.
- Sending `Accept-Language: es`, `Accept-Language: es-ES,es;q=0.9`, and `Accept-Language:
  de-DE,de;q=0.9` all return **identical HTML** — `<html lang="en" …>`, and the body text still
  reads "Vinted"/English, not translated content. No `Vary: Accept-Language` header either.

**There is exactly one crawlable URL per page, it is English, and there is no signal in the HTTP
response that a Spanish/French/German/Italian/Portuguese version exists at any level Googlebot
would see** — no separate URL, no hreflang annotation, no content variation on the same URL via
content negotiation. Whatever `de`/`it`/`pt` locale work shipped today and whatever
`frontend-eng` is localizing right now, **none of it is visible to Google as things stand.** This
matches the task's hypothesis exactly: it's a routing/architecture gap, not a content gap, and no
amount of translated copy fixes it without either locale-prefixed URLs (`/es/…`) or
`hreflang` + content negotiation Google can actually observe.

---

## Plan — three moves, in order, each with its evidence

This is measurement-and-plan, not a content sprint, per the founder's sequence (site working → roster
sign-off → acquisition). None of these add a page — all three are consistent with the standing
"kill 0-model pages, never add brands" instruction; none of them touch page count.

**1. Route locale by URL, not by (currently non-functional) content negotiation, and add hreflang.**
   Evidence: §5 — zero locale URLs, zero hreflang tags, and even a fully-specified
   `Accept-Language` header returns the English page unchanged. This is the highest-leverage item
   because it's the blocker for everything else: today's/`frontend-eng`'s ES/DE/IT/PT work cannot
   earn a single impression in those markets until Google has a URL to crawl and rank per locale.
   This is a routing change (§ per the task's own framing), owned by `frontend-eng`/`tech-lead`, and
   per AM-7 needs roster sign-off since it touches the whole site's URL structure.

**2. Fix the GSC MCP path so the roster can see what it's deciding on, and re-run the UK/GB read
   with real tooling once it's live.** Evidence: the tool has been broken since setup (stale
   `~/Desktop` path vs. the actual `~/work` tree) and every strategic claim sourced to "Search
   Console shows…" in this company (including the UK-ban claim in `resale-iq/CLAUDE.md`) has been
   running on manual script pulls, not the tool the roster is told it has. This is a two-line env
   fix in `~/.claude.json` plus a restart — outside my write authority (global user config, reads as
   security-adjacent), parked in `APPROVALS.md`. Low cost, unblocks every future measurement task
   including this one.

**3. Before `content-social` or anyone invests further in the `/flip`/`/category` estate, get a real
   Index Coverage read on it (blocked on #2).** Evidence: §4 — 136 of 157 `/flip` URLs and all 10
   `/category` URLs have never earned a single Google impression in the ~3 weeks of data that
   exist. That's consistent with thin-content exclusion but not proven by Search Analytics alone.
   Rewriting copy across an estate you can't confirm is indexed is copy no one will ever measure the
   effect of. Check coverage first; the standing "don't add pages" rule already covers the
   opposite failure mode.

**What I'm explicitly not recommending:** any new page, any content sprint, or reading the GB
impression share as UK demand (§2) — the product doesn't serve the UK and the queries behind those
impressions are generic comparison searches, not signup intent.
