import Link from "next/link"
import type { Metadata } from "next"
import { CATEGORIES, catSlug } from "@/lib/seo-categories"
import { getMarketNumbers, fmtCount, fmtEur } from "@/lib/market-numbers"
import { FreshnessNotice } from "@/components/ui/freshness-notice"

// The hub for the /category estate, and the more urgent of the two: Search
// Console for 2026-07-30..08-26 recorded ZERO impressions across all nine
// category pages, while /category itself returned 404. Nine well-built pages
// with no index page and almost no inbound links is what that looks like.
//
// The axis here is the inverse of /flip: brand-first there, category-first
// here. Same exposure policy — aggregate weekly volume and average sale price
// only, never the paid signals.
export const revalidate = 900

const MARKETS = "Spain, France, Germany, Italy and Portugal"

export async function generateMetadata(): Promise<Metadata> {
  const title = `What sells best on Vinted? ${CATEGORIES.length} categories ranked`
  const description =
    `The ${CATEGORIES.length} categories Resale IQ tracks, ranked by how many items we watch leave the shelf ` +
    `each week on Vinted across 5 EU markets — and which brand leads each one.`
  return {
    title,
    description,
    alternates: { canonical: "/category" },
    openGraph: { title, description, type: "website" },
  }
}

export default async function CategoryHubPage() {
  const market = await getMarketNumbers()

  // Recompute per-category volume from the live snapshot rather than trusting
  // the baked-in totals, so this hub can never disagree with the category page
  // it links to.
  const rows = CATEGORIES.map((c) => {
    const entries = c.entries
      .map((e) => {
        const live = market.get(e.brand)
        const row = live?.categories.find((x) => x.category === c.category) ?? null
        return {
          brand: e.brand,
          slug: e.slug,
          sold_7d: row?.sold_7d ?? null,
          avg_price_eur: live?.avg_price_eur ?? null,
        }
      })
      .sort((a, b) => (b.sold_7d ?? -1) - (a.sold_7d ?? -1))

    return {
      category: c.category,
      slug: c.slug,
      entries,
      brandCount: entries.length,
      total: entries.reduce((sum, e) => sum + (e.sold_7d ?? 0), 0),
      leader: entries.find((e) => e.sold_7d != null) ?? null,
    }
  }).sort((a, b) => b.total - a.total)

  const busiest = rows.find((r) => r.total > 0) ?? null
  const grandTotal = rows.reduce((sum, r) => sum + r.total, 0)

  const answer = busiest?.leader
    ? `${busiest.category} is the busiest category Resale IQ tracks — roughly ` +
      `${fmtCount(busiest.total)} watched departures a week across ${MARKETS}, led by ${busiest.leader.brand} ` +
      `at about ${fmtCount(busiest.leader.sold_7d)} a week. Busiest is not the same as most ` +
      `profitable: high-volume categories sell quickly but competitively, so the margin per ` +
      `item is usually thinner than in slower, higher-priced ones.`
    : `Category volume is not available in the current snapshot.`

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What sells best on Vinted?",
          acceptedAnswer: { "@type": "Answer", text: answer },
        },
        {
          "@type": "Question",
          name: "How many items sell on Vinted each week in these categories?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              `Across the ${CATEGORIES.length} tracked categories, the brands Resale IQ follows ` +
              `account for roughly ${fmtCount(grandTotal)} items we watch leave the shelf per week in ${MARKETS}. ` +
              `That is tracked-brand volume only — unbranded listings and untracked brands are ` +
              `not counted, so it is not the size of these categories on Vinted overall.`,
          },
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Vinted categories ranked by weekly sales volume",
      itemListOrder: "https://schema.org/ItemListOrderDescending",
      numberOfItems: rows.length,
      itemListElement: rows.map((r, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: r.category,
        url: `https://resaleiq.dev/category/${r.slug}`,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Resale IQ", item: "https://resaleiq.dev" },
        { "@type": "ListItem", position: 2, name: "Categories", item: "https://resaleiq.dev/category" },
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
          <span style={{ color: "#5b6b8c" }}>Categories</span>
        </div>

        <h1 style={{ fontSize: 30, fontWeight: 600, letterSpacing: "-0.6px", color: "#eef1f7", margin: "0 0 14px", lineHeight: 1.2 }}>
          What sells best on Vinted?
        </h1>
        <p style={{ fontSize: 16, color: "#a9b6d0", lineHeight: 1.7, marginBottom: 10 }}>{answer}</p>
        <p style={{ fontSize: 13.5, color: "#8b99b8", lineHeight: 1.7, marginBottom: 8 }}>
          Each category below ranks every tracked brand by what it actually sells in that category
          each week. Volumes cover the tracked brands only — they are not the size of the category
          on Vinted as a whole.
        </p>
        <FreshnessNotice stamp={market.stamp} updatedAt={market.updatedAt} />

        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#eef1f7", margin: "30px 0 4px" }}>
          Categories ranked by weekly sales
        </h2>
        <p style={{ fontSize: 13, color: "#5b6b8c", marginBottom: 16 }}>
          Sorted by tracked-brand volume over the last 7 days.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {rows.map((r) => (
            <div
              key={r.slug}
              style={{
                border: "1px solid var(--color-border-ui)",
                borderRadius: 10,
                padding: "14px 16px",
                background: "var(--color-bg-2)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
                <Link
                  href={`/category/${r.slug}`}
                  style={{ color: "#eef1f7", fontSize: 16, fontWeight: 700, textDecoration: "none" }}
                >
                  Best brands for reselling {r.category.toLowerCase()} on Vinted
                </Link>
                <div style={{ fontSize: 13, color: "#8b99b8", whiteSpace: "nowrap" }}>
                  {r.total > 0 ? fmtCount(r.total) : "—"}
                  <span style={{ color: "#5b6b8c" }}> left shelf/week</span>
                  <span style={{ color: "#3f4a63" }}> · </span>
                  {r.brandCount}<span style={{ color: "#5b6b8c" }}> brands</span>
                </div>
              </div>

              {r.leader && (
                <p style={{ fontSize: 13, color: "#8b99b8", margin: "7px 0 0", lineHeight: 1.6 }}>
                  {r.leader.brand} leads at {fmtCount(r.leader.sold_7d)} a week
                  {r.leader.avg_price_eur != null ? `, averaging ${fmtEur(r.leader.avg_price_eur)} at departure` : ""}.
                </p>
              )}

              {/* Top brands in this category link straight to the brand x category
                  leaf, giving those 130 pages a second crawl path alongside /flip. */}
              <div style={{ marginTop: 9, display: "flex", flexWrap: "wrap", gap: "6px 10px" }}>
                {r.entries.slice(0, 6).map((e) => (
                  <Link
                    key={e.slug}
                    href={`/flip/${e.slug}/${catSlug(r.category)}`}
                    style={{ fontSize: 12.5, color: "#8fa3c4", textDecoration: "none" }}
                  >
                    {e.brand} {r.category.toLowerCase()} →
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#eef1f7", margin: "34px 0 10px" }}>
          Looking for a brand instead of a category?
        </h2>
        <p style={{ fontSize: 14, color: "#a9b6d0", lineHeight: 1.7, marginBottom: 12 }}>
          If you already have a brand in mind, the{" "}
          <Link href="/flip" style={{ color: "#34C759", textDecoration: "none" }}>
            brand rankings
          </Link>{" "}
          answer whether it is worth reselling and which of its categories move. The{" "}
          <Link href="/data" style={{ color: "#34C759", textDecoration: "none" }}>
            weekly market data
          </Link>{" "}
          is published free, and{" "}
          <Link href="/methodology" style={{ color: "#34C759", textDecoration: "none" }}>
            the methodology
          </Link>{" "}
          sets out how every figure is calculated and what it cannot tell you.
        </p>

        {/* EXP-13 (Tony): the /category INDEX led with a bare "See plans and
            pricing" wall as its ONLY CTA — the last public data surface still
            failing G2 (its 9 /category/[category] slug pages already lead with the
            free checker; this index was missed). Same wall-before-value fix as
            EXP-10/11/12: the no-signup free checker is the primary door
            (check->signup is ~44%, so a check feeds a signup), plans demoted to
            the secondary link. src=category-check tags the arrival. Nothing removed. */}
        <div style={{ padding: "22px 24px", background: "var(--color-surface)", border: "1px solid var(--color-border-2)", borderRadius: 12, textAlign: "center", marginTop: 26 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#eef1f7" }}>Check a specific item</div>
          <p style={{ fontSize: 13.5, color: "#8b99b8", margin: "8px 0 16px" }}>
            Category and brand volume are free. Buy-below on a specific item is on a plan.
          </p>
          <Link href="/tools/vinted-price-checker?src=category-check" style={{ display: "inline-block", background: "#34C759", color: "#06090c", fontWeight: 700, fontSize: 14, padding: "11px 22px", borderRadius: 9, textDecoration: "none" }}>
            Check this item →
          </Link>
          <Link href="/pricing?src=category_index" style={{ display: "inline-block", marginLeft: 10, color: "#8fa3c4", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
            or see plans
          </Link>
        </div>
      </main>
    </div>
  )
}
