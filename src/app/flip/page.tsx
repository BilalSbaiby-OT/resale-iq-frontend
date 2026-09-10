import Link from "next/link"
import type { Metadata } from "next"
import { BRANDS, catSlug } from "@/lib/seo-categories"
import { getMarketNumbers, fmtCount, fmtEur } from "@/lib/market-numbers"
import { FreshnessNotice } from "@/components/ui/freshness-notice"
import { WeeklyBrief } from "@/components/ui/weekly-brief"

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
  const title = `Which brands are worth reselling on Vinted? (${BRANDS.length} ranked)`
  // Kept under ~155 chars so Google does not truncate it in the SERP.
  const description =
    `${BRANDS.length} brands ranked by watched departures each week on Vinted across ` +
    `5 EU markets, with average prices at departure and the categories that move.`
  return {
    title,
    description,
    alternates: { canonical: "/flip" },
    openGraph: { title, description, type: "website" },
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
  const dearest = [...rows]
    .filter((r) => r.avg_price_eur != null)
    .sort((a, b) => (b.avg_price_eur ?? 0) - (a.avg_price_eur ?? 0))[0]

  const answer = top
    ? `${top.brand} has the most watched departures of any brand Resale IQ tracks — about ${fmtCount(top.sold_7d)} ` +
      `items a week across ${MARKETS}.` +
      (dearest?.avg_price_eur != null
        ? ` ${dearest.brand} carries the highest average price at departure at ${fmtEur(dearest.avg_price_eur)}.`
        : "") +
      ` High volume and high price rarely sit in the same brand: the fast movers sell at thin ` +
      `margins, the expensive ones carry more margin per unit but tie up cash for longer.`
    : `Weekly volume is not available for the tracked brands in this snapshot.`

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Which brand sells the most on Vinted?",
          acceptedAnswer: { "@type": "Answer", text: answer },
        },
        {
          // The coverage-bias guard, stated in the schema itself rather than
          // only in the visible copy. This number is tracked-brand volume; it
          // is not the size of Vinted, and must never be quoted as if it were.
          "@type": "Question",
          name: "How many items do these brands sell on Vinted each week?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              `The ${BRANDS.length} brands Resale IQ tracks account for roughly ${fmtCount(total)} ` +
              `items we watch leave the shelf per week across ${MARKETS}. That is tracked-brand volume only — ` +
              `unbranded listings and brands outside the tracked set are not counted, so it is ` +
              `not a measure of Vinted as a whole.`,
          },
        },
      ],
    },
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
          Which brands are worth reselling on Vinted?
        </h1>
        <p style={{ fontSize: 16, color: "#a9b6d0", lineHeight: 1.7, marginBottom: 10 }}>{answer}</p>
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
