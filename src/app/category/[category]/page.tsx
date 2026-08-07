import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { CATEGORIES, getCategory, catSlug, type CategoryEntry } from "@/lib/seo-categories"

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
  const top = c.entries[0]
  const title = `Best brands for reselling ${c.category} on Vinted (${c.entries.length} ranked)`
  const description =
    `${c.entries.length} brands ranked by how many ${c.category.toLowerCase()} they actually sell each week on ` +
    `Vinted across 5 EU markets. ${top.brand} leads with ${top.sold_7d.toLocaleString()} a week.`
  return {
    title,
    description,
    alternates: { canonical: `/category/${c.slug}` },
    openGraph: { title, description, type: "article" },
  }
}

interface SnapBrand {
  brand: string
  avg_price_eur: number
  categories?: { category: string; sold_7d: number }[]
}

async function getSnapshot(): Promise<SnapBrand[]> {
  const base = process.env.BACKEND_URL || "http://localhost:8080"
  try {
    const r = await fetch(`${base}/api/public/market-snapshot`, { next: { revalidate: 900 } })
    if (!r.ok) return []
    return (await r.json()).brands ?? []
  } catch { return [] }
}

/** Overlay live volumes on the build-time ranking, then re-rank. */
function withLiveVolumes(entries: CategoryEntry[], category: string, snap: SnapBrand[]): CategoryEntry[] {
  if (snap.length === 0) return entries
  return entries
    .map((e) => {
      const live = snap.find((s) => s.brand === e.brand)
      const row = live?.categories?.find((c) => c.category === category)
      return {
        ...e,
        sold_7d: row?.sold_7d ?? e.sold_7d,
        avg_price_eur: live?.avg_price_eur ?? e.avg_price_eur,
      }
    })
    .sort((a, b) => b.sold_7d - a.sold_7d)
}

export default async function CategoryPage(
  { params }: { params: Promise<{ category: string }> }
) {
  const { category } = await params
  const c = getCategory(category)
  if (!c) notFound()

  const entries = withLiveVolumes(c.entries, c.category, await getSnapshot())
  const total = entries.reduce((sum, e) => sum + e.sold_7d, 0)
  const lower = c.category.toLowerCase()
  const top = entries[0]
  const dearest = [...entries].sort((a, b) => b.avg_price_eur - a.avg_price_eur)[0]

  const answer =
    `Across the tracked brands, ${top.brand} sells the most ${lower} on Vinted — about ` +
    `${top.sold_7d.toLocaleString()} a week across ${MARKETS}. ` +
    `${dearest.brand} carries the highest average sale price at €${dearest.avg_price_eur}. ` +
    `Volume and price pull in opposite directions: the high-volume brands sell fast at thin margins, ` +
    `the expensive ones carry more margin per unit but sit longer.`

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
              `The ${entries.length} brands Resale IQ tracks account for roughly ${total.toLocaleString()} ` +
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

        <h1 style={{ fontSize: 32, fontWeight: 800, color: "#eef1f7", lineHeight: 1.18, marginBottom: 14 }}>
          Best brands for reselling {lower} on Vinted
        </h1>
        <p style={{ fontSize: 16, color: "#a9b6d0", lineHeight: 1.7, marginBottom: 24 }}>{answer}</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 28 }}>
          {[
            [total.toLocaleString(), `${lower} sold / week`],
            [String(entries.length), "brands ranked"],
            [`€${dearest.avg_price_eur}`, `highest avg (${dearest.brand})`],
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
                    {e.sold_7d.toLocaleString()}
                  </td>
                  <td style={{ padding: "10px", textAlign: "right", color: "#5b6b8c" }}>
                    {total > 0 ? `${Math.round((e.sold_7d / total) * 100)}%` : "—"}
                  </td>
                  <td style={{ padding: "10px 0 10px 10px", textAlign: "right", color: "#a9b6d0" }}>
                    €{e.avg_price_eur}
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
            {top.sold_7d.toLocaleString()} {lower} a week is easy to shift, which also means the supply side is crowded
            and the price is well known to everyone sourcing. The margin usually lives one or two rows down, or at the
            expensive end of the list where fewer people can afford the buy-in.
          </p>
          <p style={{ fontSize: 14.5, lineHeight: 1.75 }}>
            Read the share column as competition. A brand holding {Math.round((top.sold_7d / Math.max(total, 1)) * 100)}%
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
          <Link href="/manual" style={{ color: "#8fa3c4", fontSize: 14, textDecoration: "none" }}>
            → The Vinted reselling manual: how to price, source and turn stock
          </Link>
        </div>
      </div>
    </div>
  )
}
