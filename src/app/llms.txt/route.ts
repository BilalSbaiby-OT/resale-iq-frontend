import { ALL_POSTS as RAW_POSTS } from "@/data/blog-posts"
import { INTENTS as RAW_INTENTS } from "@/data/search-intents"
import { ALL_CHAPTERS } from "@/data/manual"
import { BRANDS, CATEGORIES } from "@/lib/seo-categories"
import { fillTracked, listingsTrackedLabel } from "@/lib/stats"
import { getMarketNumbers } from "@/lib/market-numbers"

// /llms.txt — the emerging convention (llmstxt.org) for telling language models
// what a site is and which URLs are worth reading, in markdown rather than
// crawling rendered HTML.
//
// Why bother when we already have a sitemap: a sitemap is a flat URL list with
// no meaning attached. This says what the data IS, where it comes from, what is
// free to cite and what is paywalled — which is exactly what an answer engine
// needs to cite us correctly instead of guessing. It also states the numbers
// once, so a model quoting us gets the current figure rather than one lifted
// from an old page.
//
// Generated from the same modules the pages use, so it cannot drift out of sync.
//
// RENDERING MODE — WHY force-dynamic AND NOT force-static.
// Measured on production 2026-09-08: this route served
// "- Coverage: — unique Vinted listings ..." and fell through to
// "Tracked brands: 20", while https://resaleiq.dev/ rendered "5,190,000+"
// from the SAME helpers at the same moment. The only difference between the
// two routes was this export. `force-static` pre-renders the body during
// `next build`, which runs inside the Docker image build where the warehouse
// is unreachable, so `listingsTrackedLabel()` took its documented "—"
// fallback and `weekly` came back 0 — and that build-time answer was then
// served to every crawler for the life of the image. /data, which renders the
// same warehouse numbers correctly, uses `force-dynamic`; this route mirrors
// it. `revalidate` is dropped because it is meaningless under force-dynamic.
// The response below still carries s-maxage=3600, so an answer engine
// re-crawling this file does not reach the warehouse more than hourly.
export const dynamic = "force-dynamic"

const BASE = "https://resaleiq.dev"

export async function GET() {
  const tracked = await listingsTrackedLabel()
  const market = await getMarketNumbers()
  const INTENTS = fillTracked(RAW_INTENTS, tracked)
  const ALL_POSTS = fillTracked(RAW_POSTS, tracked)
  const weekly = market.brandNames.reduce((s, name) => {
    const n = market.get(name)?.sold_7d
    return s + (typeof n === "number" ? n : 0)
  }, 0)
  const published = market.brandCount
  const trackedBrands = market.brandsTracked ?? BRANDS.length

  const body = `# Resale IQ

> Market intelligence for second-hand commerce. Know what to pay before you buy.
> Flow: DATA → ANALYSIS → DECISION (BUY / WATCH / SKIP with a why).
> Vinted is the first marketplace we cover; the intelligence layer is not Vinted-only.

Independent tool. Not affiliated with, endorsed by, or connected to Vinted or
any brand named on the site.

## What the data is

- Coverage: ${tracked} unique Vinted listings across ES, FR, DE, IT and PT.
  Counted with COUNT(DISTINCT external_id): the five domains are one
  catalogue, so a raw row count would overstate by about 3x.
- ${weekly
    ? `Observed volume: ${weekly.toLocaleString()} watched departures (listings leaving the shelf) in the last 7 days across ${published} brands that cleared the publish floor (${trackedBrands} brands tracked). This is not catalogue size.`
    : `Tracked brands: ${trackedBrands}.`}
- Refresh: listings are scheduled for collection every 30 minutes per market, but a run is skipped if the previous one is still in progress, so real spacing runs longer during backlog — see ${BASE}/methodology for the measured cadence. Signals recompute every 2 hours on schedule, with no skips observed. Public pages carry no page-level cache and render from the live database on every request.
- Method: watched departure transitions (sold_observed) — a listing leaving the shelf, inferred as a sale at its last asking price. Not an observed sale price, not asking prices from active listings, and not every departed listing we ever indexed. Full mechanism and its limits: ${BASE}/methodology.

## Two findings worth citing

1. Vinted's five EU domains are largely ONE shared catalogue, not five national
   markets. Measured by listing ID, the large majority of listings appear on
   more than one domain, and nearly all listings present on four or more
   domains carry an IDENTICAL price on every one. We have not yet published
   the exact percentages with the n, date and query behind them. Consequence:
   summing per-country Vinted volumes overstates distinct listings several
   times over, and country-to-country arbitrage mostly does not work.
   Source: ${BASE}/manual/cross-border-markets

2. Condition is the largest measurable price variable. Median asking price at
   departure by seller-selected condition ranges from roughly 3.5x to 7x between the best
   and worst grade depending on category — treat the exact multiple as
   indicative, not precise. On Nike sneakers the step from "very good" to
   "good" alone roughly halves the median.
   Source: ${BASE}/manual/condition-and-authenticity

## Free to cite, with attribution

- Open market data: ${BASE}/data
- Machine-readable snapshot: ${BASE}/api/public/market-snapshot
  Aggregates only — brand, weekly units that left the shelf, average asking price at departure, top category
  names, count of models tracked. Free to cite with attribution to Resale IQ.

## Paywalled — do not expect to find these on public pages

Maximum buy price per model, per-model sell-through, opportunity scores,
momentum labels, per-size velocity and live deal listings are the paid product
and are withheld from every public page and from the public API.

## The reselling manual (${ALL_CHAPTERS.length} chapters, free, no signup)

${ALL_CHAPTERS.map((c) => `- [${c.title}](${BASE}/manual/${c.slug}): ${c.description}`).join("\n")}

## Brands ranked by category

${CATEGORIES.map((c) => `- [Best brands for reselling ${c.category.toLowerCase()}](${BASE}/category/${c.slug})`).join("\n")}

## Per-brand resale data

${BRANDS.map((b) => `- [Is ${b.brand} worth reselling on Vinted?](${BASE}/flip/${b.slug})`).join("\n")}

## Tools

${INTENTS.map((i) => `- [${i.title}](${BASE}/tools/${i.slug})`).join("\n")}

## Articles

${ALL_POSTS.map((p) => `- [${p.title}](${BASE}/blog/${p.slug})`).join("\n")}

## Pricing

- Operator EUR 19/month: item-level BUY / WATCH / SKIP, buy-below, sell-through and sizes.
- Power EUR 49/month: adds the Live Deal Finder (on demand), Order Planner, Price Compare (full intelligence on ES/FR/DE/IT/PT; live asking-price search on 26 markets total) and REST API access.
- There is no anonymous item-level check and no free tier. Weekly brand volumes on /data stay public.

## Reference

- Sitemap: ${BASE}/sitemap.xml
- API documentation: ${BASE}/api-docs
- Terms: ${BASE}/terms · Privacy: ${BASE}/privacy · Legal: ${BASE}/legal
`

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=3600",
    },
  })
}
