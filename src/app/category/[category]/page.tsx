import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import type { Metadata } from "next"
import { CATEGORIES, getCategory, catSlug, type CategoryEntry } from "@/lib/seo-categories"
import { getMarketNumbers, fmtCount, fmtEur } from "@/lib/market-numbers"
import { FreshnessNotice } from "@/components/ui/freshness-notice"

// Programmatic SEO, cross-brand cut: one page per category, ranking every
// tracked brand by that category's own weekly sales volume. This is the axis
// the brand pages can't answer — "I want to flip sneakers, which brand?" —
// and the ranking is data nobody else publishes.
//
// Exposure policy is unchanged from /flip: aggregate weekly volume and average
// brand sale price only. No buy-below prices, no scores, no model names.
export const revalidate = 900

const MARKETS = "Spain, France, Germany, Italy and Portugal"

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ category: string }> }
): Promise<Metadata> {
  const { category } = await params
  const c = getCategory(category)
  if (!c) return { title: "Not found — Resale IQ" }
  const market = await getMarketNumbers()
  const entries = withLiveVolumes(c.entries, c.category, market)
  const top = entries.find(e => e.sold_7d != null)
  const title = `Best brands for reselling ${c.category} on Vinted (${c.entries.length} ranked)`
  const description = top && top.sold_7d != null
    ? `${c.entries.length} brands ranked by how many ${c.category.toLowerCase()} they actually sell each week on Vinted across 5 EU markets. ${top.brand} leads with ${fmtCount(top.sold_7d)} a week.`
    : `${c.entries.length} brands ranked for ${c.category.toLowerCase()} on Vinted across 5 EU markets.`
  return {
    title,
    description,
    alternates: { canonical: `/category/${c.slug}` },
    openGraph: { title, description, type: "article" },
  }
}

interface LiveEntry {
  brand: string
  slug: string
  sold_7d: number | null
  avg_price_eur: number | null
}

/** Overlay live volumes. Missing live ≠ frozen JSON. */
function withLiveVolumes(entries: CategoryEntry[], category: string, market: Awaited<ReturnType<typeof getMarketNumbers>>): LiveEntry[] {
  return entries
    .map((e) => {
      const live = market.get(e.brand)
      const row = live?.categories.find((c) => c.category === category)
      return {
        brand: e.brand,
        slug: e.slug,
        sold_7d: row?.sold_7d ?? null,
        avg_price_eur: live?.avg_price_eur ?? null,
      }
    })
    .sort((a, b) => (b.sold_7d ?? -1) - (a.sold_7d ?? -1))
}

export default async function CategoryPage(
  { params }: { params: Promise<{ category: string }> }
) {
  const { category } = await params
  const c = getCategory(category)
  if (!c) notFound()
  if (category !== c.slug) redirect(`/category/${c.slug}`)

  const market = await getMarketNumbers()
  const entries = withLiveVolumes(c.entries, c.category, market)
  const total = entries.reduce(
    (sum, e) => (e.sold_7d != null ? sum + e.sold_7d : sum),
    0,
  )
  const lower = c.category.toLowerCase()
  const top = entries.find(e => e.sold_7d != null) ?? entries[0]
  const dearest = [...entries].filter(e => e.avg_price_eur != null).sort((a, b) => (b.avg_price_eur ?? 0) - (a.avg_price_eur ?? 0))[0]

  const answer =
    top && top.sold_7d != null
      ? `Across the tracked brands, ${top.brand} sells the most ${lower} on Vinted — about ` +
        `${fmtCount(top.sold_7d)} a week across ${MARKETS}. ` +
        (dearest?.avg_price_eur != null
          ? `${dearest.brand} carries the highest average sale price at ${fmtEur(dearest.avg_price_eur)}. `
          : "") +
        `Volume and price pull in opposite directions: the high-volume brands sell fast at thin margins, ` +
        `the expensive ones carry more margin per unit but sit longer.`
      : `${c.category} demand across ${MARKETS} is tracked live. Weekly volume for this snapshot is not yet available for ranked brands.`

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: `Which brand sells the most ${lower} on Vinted?`,
          acceptedAnswer: { "@type": "Answer", text: answer },
        },
        {
          "@type": "Question",
          name: `How many ${lower} sell on Vinted each week?`,
          acceptedAnswer: {
            "@type": "Answer",
            text:
              `The ${entries.length} brands Resale IQ tracks account for roughly ${fmtCount(total)} ` +
              `${lower} sold per week across ${MARKETS}. That is tracked-brand volume, not the whole category — ` +
              `unbranded and untracked listings are not counted.`,
          },
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `Brands ranked by weekly ${lower} sales on Vinted`,
      itemListOrder: "https://schema.org/ItemListOrderDescending",
      numberOfItems: entries.length,
      itemListElement: entries.slice(0, 10).map((e, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: e.brand,
        url: `https://resaleiq.dev/flip/${e.slug}/${catSlug(c.category)}`,
      })),
    },
  ]

  const others = CATEGORIES.filter((x) => x.slug !== c.slug)

  return (
    <div style={{ background: "#0B0D10", color: "#c3cde0", minHeight: "100vh", padding: "44px 24px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <div style={{ fontSize: 13, marginBottom: 18 }}>
          <Link href="/" style={{ color: "#22c55e", textDecoration: "none" }}>Resale IQ</Link>
          <span style={{ color: "#3f4a63" }}> / </span>
          <Link href="/data" style={{ color: "#22c55e", textDecoration: "none" }}>Market data</Link>
        </div>

        <FreshnessNotice stamp={market.stamp} updatedAt={market.updatedAt} stale={market.stale} />
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "#eef1f7", lineHeight: 1.18, marginBottom: 14 }}>
          Best brands for reselling {lower} on Vinted
        </h1>
        <p style={{ fontSize: 16, color: "#a9b6d0", lineHeight: 1.7, marginBottom: 24 }}>{answer}</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 28 }}>
          {[
            [fmtCount(total), `${lower} sold / week`],
            [String(entries.length), "brands ranked"],
            [dearest ? `${fmtEur(dearest.avg_price_eur)}` : "—", dearest ? `highest avg (${dearest.brand})` : "highest avg"],
          ].map(([v, l]) => (
            <div key={l} style={{ background: "#12151d", border: "1px solid #1c2333", borderRadius: 12, padding: "16px 18px" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#eef1f7" }}>{v}</div>
              <div style={{ fontSize: 12, color: "#5b6b8c", marginTop: 3 }}>{l}</div>
            </div>
          ))}
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#eef1f7", marginBottom: 12 }}>
          {c.category} on Vinted, ranked by weekly volume
        </h2>
        <div style={{ overflowX: "auto", marginBottom: 10 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, minWidth: 460 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "#5b6b8c", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.4px" }}>
                <th style={{ padding: "8px 10px 8px 0", fontWeight: 600 }}>#</th>
                <th style={{ padding: "8px 10px", fontWeight: 600 }}>Brand</th>
                <th style={{ padding: "8px 10px", fontWeight: 600, textAlign: "right" }}>Sold / week</th>
                <th style={{ padding: "8px 10px", fontWeight: 600, textAlign: "right" }}>Share</th>
                <th style={{ padding: "8px 0 8px 10px", fontWeight: 600, textAlign: "right" }}>Avg price</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => (
                <tr key={e.slug} style={{ borderTop: "1px solid #1c2333" }}>
                  <td style={{ padding: "10px 10px 10px 0", color: "#5b6b8c" }}>{i + 1}</td>
                  <td style={{ padding: "10px" }}>
                    <Link href={`/flip/${e.slug}/${catSlug(c.category)}`} style={{ color: "#8fa3c4", textDecoration: "none", fontWeight: 600 }}>
                      {e.brand}
                    </Link>
                  </td>
                  <td style={{ padding: "10px", textAlign: "right", color: "#eef1f7", fontWeight: 600 }}>
                    {fmtCount(e.sold_7d)}
                  </td>
                  <td style={{ padding: "10px", textAlign: "right", color: "#5b6b8c" }}>
                    {total > 0 && e.sold_7d != null ? `${Math.round((e.sold_7d / total) * 100)}%` : "—"}
                  </td>
                  <td style={{ padding: "10px 0 10px 10px", textAlign: "right", color: "#a9b6d0" }}>
                    {fmtEur(e.avg_price_eur)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: 12, color: "#5b6b8c", lineHeight: 1.6, marginBottom: 28 }}>
          Units sold in the last 7 days across Vinted ES, FR, DE, IT and PT, for the brands Resale IQ tracks.
          Average price is the brand&apos;s average across all its categories, not {lower} alone. Refreshed every 15 minutes.
        </p>

        <section style={{ marginBottom: 22 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#eef1f7", marginBottom: 10 }}>
            How to read this ranking
          </h2>
          <p style={{ fontSize: 14.5, lineHeight: 1.75, marginBottom: 12 }}>
            The top of the table is where the buyers are, not where the profit is. A brand selling{" "}
            {fmtCount(top?.sold_7d)} {lower} a week is easy to shift, which also means the supply side is crowded
            and the price is well known to everyone sourcing. The margin usually lives one or two rows down, or at the
            expensive end of the list where fewer people can afford the buy-in.
          </p>
          <p style={{ fontSize: 14.5, lineHeight: 1.75 }}>
            Read the share column as competition. A brand holding {top?.sold_7d != null && total > 0 ? `${Math.round((top.sold_7d / total) * 100)}%` : "—"}
            of {lower} volume is the default choice for every reseller in the market. That is fine if you can source
            below everyone else, and a trap if you cannot.
          </p>
        </section>

        <div style={{ padding: "22px 24px", background: "#0f1720", border: "1px solid #1c3327", borderRadius: 12, textAlign: "center", marginBottom: 30 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#eef1f7" }}>Check a specific item free</div>
          <p style={{ fontSize: 13.5, color: "#8b99b8", margin: "8px 0 16px" }}>
            Category volume tells you demand exists. The verdict tells you whether this item, at this price, makes money.
          </p>
          <Link href="/tools/vinted-price-checker" style={{ display: "inline-block", background: "#22c55e", color: "#06090c", fontWeight: 700, fontSize: 14, padding: "11px 22px", borderRadius: 9, textDecoration: "none" }}>
            Free price checker →
          </Link>
        </div>

        <div>
          <div style={{ fontSize: 12.5, color: "#5b6b8c", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>Other categories</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {others.map((o) => (
              <Link key={o.slug} href={`/category/${o.slug}`} style={{
                fontSize: 13, color: "#a9b6d0", textDecoration: "none",
                background: "#12151d", border: "1px solid #1c2333",
                borderRadius: 8, padding: "7px 12px",
              }}>
                {o.category}
              </Link>
            ))}
          </div>
          {/* Reciprocal links into the guides — see the same block on
              /flip/[brand]. The blog carries 84% of site impressions and now
              links into these pages; this closes the loop rather than ending it. */}
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <Link href="/blog/what-sells-best-on-vinted" style={{ color: "#8fa3c4", fontSize: 14, textDecoration: "none" }}>
              → What sells best on Vinted, by category and brand
            </Link>
            <Link href="/blog/seasonal-reselling-calendar" style={{ color: "#8fa3c4", fontSize: 14, textDecoration: "none" }}>
              → The seasonal calendar: what to buy, and when
            </Link>
            <Link href="/manual" style={{ color: "#8fa3c4", fontSize: 14, textDecoration: "none" }}>
              → The Vinted reselling manual: how to price, source and turn stock
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
