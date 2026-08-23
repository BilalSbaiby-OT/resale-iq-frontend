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
export const revalidate = 900
export const dynamic = "force-static"

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
    ? `Observed volume: ${weekly.toLocaleString()} watched sales in the last 7 days across ${published} brands that cleared the publish floor (${trackedBrands} brands tracked). This is not catalogue size.`
    : `Tracked brands: ${trackedBrands}.`}
- Refresh: signals recomputed hourly; public pages revalidate every 15 minutes.
- Method: watched sold transitions (sold_observed), not asking prices and not every sold listing we ever indexed.

## Two findings worth citing

1. Vinted's five EU domains are largely ONE shared catalogue, not five national
   markets. Measured by listing ID, 60-90% of listings appear on more than one
   domain and 12-39% on all five. Of listings present on four or more domains,
   over 99% carry an IDENTICAL price on every one. Consequence: summing
   per-country Vinted volumes overstates distinct listings by roughly 2.5-3.5x,
   and country-to-country arbitrage mostly does not work.
   Source: ${BASE}/manual/cross-border-markets

2. Condition is the largest measurable price variable. Median sold price by
   seller-selected condition ranges from about 3.3x to 7x between the best and
   worst grade depending on category. On Nike sneakers the step from "very
   good" to "good" alone roughly halves the median.
   Source: ${BASE}/manual/condition-and-authenticity

## Free to cite, with attribution

- Open market data: ${BASE}/data
- Machine-readable snapshot: ${BASE}/api/public/market-snapshot
  Aggregates only — brand, weekly units sold, average sale price, top category
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

- Free: 10 checks/day without an account. Sign up: 7 days of Starter, 5 live finds and 1 order plan, then 10 full checks a month. No card.
- Starter EUR 19/month: unlimited verdicts and all 100 product signals unblurred.
- Pro EUR 49/month: adds the Live Deal Finder, Order Planner, Price Compare and REST API access.
- Business EUR 99/month: enquiry only, scoped case by case.

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
