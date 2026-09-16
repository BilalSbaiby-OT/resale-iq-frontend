import Link from "next/link"
import type { Metadata } from "next"
import { BRANDS, catSlug } from "@/lib/seo-categories"
import { OG_IMAGES } from "@/lib/og-image"
import { getMarketNumbers, fmtCount, fmtEur } from "@/lib/market-numbers"
import { FreshnessNotice } from "@/components/ui/freshness-notice"
import { WeeklyBrief } from "@/components/ui/weekly-brief"
import { HubFaq } from "@/components/seo/hub-faq"
import { definedTermJsonLd, faqPageJsonLd } from "@/lib/faq-schema"

// The hub for the /flip estate. Until this page existed, /flip returned 404 and
// the 26 brand pages + 130 brand x category pages had no index anywhere on the
// site — their only discovery path was sitemap.xml plus a partial list on /data.
// Search Console for 2026-07-30..08-26 measured the result: ~30 impressions
// across all 156 URLs, against ~600 for the blog. An estate that large needs a
// hub that links every member of it, which is what this page is.
//
// Exposure policy matches /flip/[brand] and /category/[category]: aggregate
// weekly volume and average brand sale price only. No buy-below prices, no
// scores, no model names — those are the paid signals.
export const revalidate = 900

const MARKETS = "Spain, France, Germany, Italy and Portugal"

export async function generateMetadata(): Promise<Metadata> {
  const title = `What sells best on Vinted in 2026? ${BRANDS.length} brands ranked`
  // Kept under ~155 chars so Google does not truncate it in the SERP.
  const description =
    `What sells best on Vinted in 2026 among ${BRANDS.length} tracked brands: weekly watched ` +
    `departures across 5 EU markets, average prices at departure, and the categories that move.`
  return {
    title,
    description,
    alternates: { canonical: "/flip" },
    openGraph: { title, description, type: "website", url: "/flip", images: OG_IMAGES },
    // Root layout pins twitter.title to the homepage string. og:title was
    // already set here; twitter was not, so X/Slack still showed the generic.
    twitter: { card: "summary_large_image", title, description, images: OG_IMAGES },
  }
}

export default async function FlipHubPage() {
  const market = await getMarketNumbers()

  // Live volumes overlay the baked-in JSON, same as the brand and category
  // pages. A brand missing from the live snapshot sorts last and renders an
  // em-dash — never a zero, which would read as "this brand sells nothing".
  const rows = BRANDS.map((b) => {
    const live = market.get(b.brand)
    return {
      brand: b.brand,
      slug: b.slug,
      sold_7d: live?.sold_7d ?? null,
      avg_price_eur: live?.avg_price_eur ?? null,
      categories: (b.categories || []).map((c) => c.category),
    }
  }).sort((a, b) => (b.sold_7d ?? -1) - (a.sold_7d ?? -1))

  const ranked = rows.filter((r) => r.sold_7d != null)
  const total = ranked.reduce((sum, r) => sum + (r.sold_7d ?? 0), 0)
  const top = ranked[0]
  const second = ranked[1]
  const third = ranked[2]
  const dearest = [...rows]
    .filter((r) => r.avg_price_eur != null)
    .sort((a, b) => (b.avg_price_eur ?? 0) - (a.avg_price_eur ?? 0))[0]

  // 134–167 word self-contained block for "what sells best on Vinted 2026".
  // Live numbers only. Coverage bias stated in the same passage so a citation
  // cannot quote the ranking as Vinted-wide.
  const sellsBest2026 = top
    ? `What sells best on Vinted in 2026, among the brands Resale IQ tracks, is ${top.brand}: about ${fmtCount(top.sold_7d)} watched departures in the last 7 days across ${MARKETS}` +
      (top.avg_price_eur != null ? `, at an average asking price at departure of ${fmtEur(top.avg_price_eur)}` : "") +
      `.` +
      (second && third
        ? ` ${second.brand} (${fmtCount(second.sold_7d)}/week) and ${third.brand} (${fmtCount(third.sold_7d)}/week) follow.`
        : "") +
      ` These are listings we watched leave the shelf, not confirmed sale receipts, and they cover ${BRANDS.length} tracked brands on Vinted's five EU domains — not the whole catalogue, and not unbranded listings.` +
      (dearest?.avg_price_eur != null
        ? ` Volume and ticket size rarely sit in the same brand: ${dearest.brand} has the highest average asking price at departure at ${fmtEur(dearest.avg_price_eur)}.`
        : "") +
      ` Fast movers recycle cash; expensive ones carry more margin per unit but sit longer. A reseller who wants volume should start with the top of this list; a reseller who wants ticket size should start with the dearest. Neither ranking is Vinted as a whole. Weekly brand volumes stay public on /data. Item-level buy-below, sizes and BUY/WATCH/SKIP are not published on this page.`
    : `Weekly volume is not available for the tracked brands in this snapshot.`

  const howWeRank =
    `We rank the tracked brands by watched departures in the last 7 days across ${MARKETS}. ` +
    "A watched departure is a listing we watched leave the shelf — not a confirmed sale receipt — and the ranking is tracked-brand volume, not Vinted as a whole."

  const watchedDeparture =
    "A watched departure is a listing we watched leave the shelf — not a confirmed sale receipt. " +
    `Volumes on this page are items watched leaving the shelf in the last 7 days across ${MARKETS}. ` +
    "They cover the tracked brands only, not the whole Vinted catalogue."

  // Visible FAQ and FAQPage JSON-LD share this array. New questions stay
  // qualitative except where this page already prints a live figure.
  const faqs = [
    {
      q: "What sells best on Vinted?",
      a: sellsBest2026,
    },
    {
      q: "How do you rank what sells best?",
      a: howWeRank,
    },
    {
      q: "How often does this data update?",
      a:
        "These rankings count watched departures in the last 7 days. The page renders from the live snapshot; " +
        "if the scrape is more than two hours old, a freshness warning still shows the last-good numbers. " +
        "Weekly brand volumes stay public at https://resaleiq.dev/data.",
    },
    {
      q: "What is a watched departure?",
      a: watchedDeparture,
    },
    {
      q: "How do I use this ranking for buy-below?",
      a:
        "Use it to pick a brand by volume or by ticket size: the top of this list recycles cash; " +
        "the dearest brands carry more margin per unit but sit longer. The average asking price at departure " +
        "is public ceiling context, not a buy-below. Item-level buy-below, sizes and BUY/WATCH/SKIP are not " +
        "published on this page — they are on a paid plan at https://resaleiq.dev/pricing.",
    },
    {
      // Coverage-bias guard. Tracked-brand volume is not the size of Vinted.
      q: "How many items do these brands sell on Vinted each week?",
      a:
        `The ${BRANDS.length} brands Resale IQ tracks account for roughly ${fmtCount(total)} ` +
        `items we watch leave the shelf per week across ${MARKETS}. That is tracked-brand volume only — ` +
        `unbranded listings and brands outside the tracked set are not counted, so it is ` +
        `not a measure of Vinted as a whole.`,
    },
  ]

  const jsonLd = [
    faqPageJsonLd(faqs),
    definedTermJsonLd({
      name: "Watched departure",
      description: watchedDeparture,
      url: "https://resaleiq.dev/flip",
    }),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Brands ranked by weekly sales volume on Vinted",
      itemListOrder: "https://schema.org/ItemListOrderDescending",
      numberOfItems: rows.length,
      itemListElement: rows.slice(0, 10).map((r, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: r.brand,
        url: `https://resaleiq.dev/flip/${r.slug}`,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Resale IQ", item: "https://resaleiq.dev" },
        { "@type": "ListItem", position: 2, name: "Brands", item: "https://resaleiq.dev/flip" },
      ],
    },
  ]

  return (
    <div style={{ background: "#0B0D10", color: "#c3cde0", minHeight: "100vh", padding: "48px 24px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main style={{ maxWidth: 860, margin: "0 auto" }}>
        <div style={{ fontSize: 13, marginBottom: 18 }}>
          <Link href="/" style={{ color: "#34C759", textDecoration: "none" }}>Resale IQ</Link>
          <span style={{ color: "#3f4a63" }}> / </span>
          <span style={{ color: "#5b6b8c" }}>Brands</span>
        </div>

        <h1 style={{ fontSize: 30, fontWeight: 600, color: "#eef1f7", margin: "0 0 14px", lineHeight: 1.2, letterSpacing: "-0.6px" }}>
          What sells best on Vinted in 2026?
        </h1>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: "#eef1f7", margin: "0 0 8px", letterSpacing: "-0.4px" }}>
          How we rank what sells best
        </h2>
        <p style={{ fontSize: 15.5, color: "#a9b6d0", lineHeight: 1.7, marginBottom: 16 }}>{howWeRank}</p>
        <p style={{ fontSize: 16, color: "#a9b6d0", lineHeight: 1.7, marginBottom: 10 }}>{sellsBest2026}</p>
        <p style={{ fontSize: 13.5, color: "#8b99b8", lineHeight: 1.7, marginBottom: 8 }}>
          Every brand below links to its own page — weekly volume, average sale price and the
          categories that actually move. Volumes are what the {BRANDS.length} tracked brands sell
          across {MARKETS}; they are not the size of Vinted as a whole.
        </p>
        <FreshnessNotice stamp={market.stamp} updatedAt={market.updatedAt} />

        <WeeklyBrief market={market} />

        <h2 style={{ fontSize: 20, fontWeight: 600, color: "#eef1f7", margin: "30px 0 4px", letterSpacing: "-0.4px" }}>
          Every tracked brand, ranked by weekly sales
        </h2>
        <p style={{ fontSize: 13, color: "#5b6b8c", marginBottom: 16 }}>
          Sorted by items watched leaving the shelf in the last 7 days. An em-dash means the current snapshot has no
          figure for that brand — not that it sells nothing.
        </p>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {rows.map((r, ri) => (
            <div
              key={r.slug}
              style={{
                borderTop: ri === 0 ? "none" : "1px solid var(--color-border-ui)",
                padding: "16px 4px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
                <Link
                  href={`/flip/${r.slug}`}
                  style={{ color: "#eef1f7", fontSize: 16, fontWeight: 600, textDecoration: "none", letterSpacing: "-0.2px" }}
                >
                  Is {r.brand} worth reselling on Vinted?
                </Link>
                <div style={{ fontSize: 13, color: "#8b99b8", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                  {fmtCount(r.sold_7d)}<span style={{ color: "#5b6b8c" }}> left shelf/week</span>
                  <span style={{ color: "#3f4a63" }}> · </span>
                  {fmtEur(r.avg_price_eur)}<span style={{ color: "#5b6b8c" }}> avg</span>
                </div>
              </div>

              {/* The 130 brand x category leaves get their crawl path from here.
                  Without these links they are reachable only via the brand page. */}
              {r.categories.length > 0 && (
                <div style={{ marginTop: 9, display: "flex", flexWrap: "wrap", gap: "6px 10px" }}>
                  {r.categories.map((c) => (
                    <Link
                      key={c}
                      href={`/flip/${r.slug}/${catSlug(c)}`}
                      style={{ fontSize: 12.5, color: "#8fa3c4", textDecoration: "none" }}
                    >
                      {r.brand} {c.toLowerCase()} →
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <HubFaq items={faqs} />

        <h2 style={{ fontSize: 20, fontWeight: 600, color: "#eef1f7", margin: "34px 0 10px", letterSpacing: "-0.4px" }}>
          Looking for a category instead of a brand?
        </h2>
        <p style={{ fontSize: 14, color: "#a9b6d0", lineHeight: 1.7, marginBottom: 12 }}>
          If you already know you want to flip sneakers or jeans and need to know which brand to
          buy, the{" "}
          <Link href="/category" style={{ color: "#34C759", textDecoration: "none" }}>
            category rankings
          </Link>{" "}
          answer it from the other direction. The{" "}
          <Link href="/data" style={{ color: "#34C759", textDecoration: "none" }}>
            full weekly market data
          </Link>{" "}
          is published free, and{" "}
          <Link href="/methodology" style={{ color: "#34C759", textDecoration: "none" }}>
            the methodology
          </Link>{" "}
          explains exactly how every number here is calculated. See{" "}
          <Link href="/pricing?src=flip" style={{ color: "#34C759", textDecoration: "none" }}>
            plans and pricing
          </Link>{" "}
          for the full per-model verdicts.
        </p>
      </main>
    </div>
  )
}
