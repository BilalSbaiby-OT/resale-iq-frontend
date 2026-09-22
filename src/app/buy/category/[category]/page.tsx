import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import {
  BUY_DATA,
  BUY_CATEGORIES,
  catSlug,
  fmtEurBuy,
  fmtCountBuy,
  signalDisplay,
  type BuyBrand,
  type BuyCategory,
} from "@/lib/buy-data"

export const revalidate = 3600

export function generateStaticParams() {
  return BUY_CATEGORIES.map((cat) => ({ category: catSlug(cat) }))
}

interface BrandRow {
  brand: BuyBrand
  cat: BuyCategory
}

function getBrandsForCategory(categorySlug: string): { categoryName: string; rows: BrandRow[] } | null {
  const catName = BUY_CATEGORIES.find((c) => catSlug(c) === categorySlug)
  if (!catName) return null

  const rows: BrandRow[] = []
  for (const brand of BUY_DATA.brands) {
    const cat = brand.categories.find((c) => c.slug === categorySlug || catSlug(c.category) === categorySlug)
    if (cat) rows.push({ brand, cat })
  }
  rows.sort((a, b) => b.cat.sold_30d - a.cat.sold_30d)
  return { categoryName: catName, rows }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>
}): Promise<Metadata> {
  const { category: catSlugParam } = await params
  const data = getBrandsForCategory(catSlugParam)
  if (!data) return { title: "Not found — Resale IQ" }

  const { categoryName, rows } = data
  const top = rows[0]
  const total30d = rows.reduce((s, r) => s + r.cat.sold_30d, 0)

  const title = `Best Brands for ${categoryName} Resale — Buy-Below Prices | ResaleIQ`
  const description =
    `${rows.length} brands tracked for ${categoryName} resale on Vinted. ` +
    `${fmtCountBuy(total30d)} total departures in 30 days. ` +
    (top ? `${top.brand.brand} leads with ${fmtCountBuy(top.cat.sold_30d)} sold — buy below ${fmtEurBuy(top.cat.buy_below)}.` : "")

  return {
    title,
    description,
    alternates: { canonical: `https://resaleiq.dev/buy/category/${catSlugParam}` },
    openGraph: { title, description, url: `https://resaleiq.dev/buy/category/${catSlugParam}` },
  }
}

export default async function BuyCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category: catSlugParam } = await params
  const data = getBrandsForCategory(catSlugParam)
  if (!data) notFound()

  const { categoryName, rows } = data
  const top = rows[0]
  const total30d = rows.reduce((s, r) => s + r.cat.sold_30d, 0)
  const lower = categoryName.toLowerCase()

  const directAnswer =
    `${rows.length} brands had ${categoryName.toLowerCase()} depart on Vinted in the last 30 days. ` +
    `Combined, that is ${fmtCountBuy(total30d)} departures across Spain, France, Germany, Italy and Portugal. ` +
    (top
      ? `${top.brand.brand} leads with ${fmtCountBuy(top.cat.sold_30d)} ${lower} sold — buy below ${fmtEurBuy(top.cat.buy_below)} to target a 45% gross margin. `
      : "") +
    `These are confirmed departures, not active listings.`

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: `Which brand of ${lower} sells best on Vinted for resale?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: directAnswer,
          },
        },
        {
          "@type": "Question",
          name: `What is the best brand of ${lower} to buy for resale?`,
          acceptedAnswer: {
            "@type": "Answer",
            text:
              top
                ? `${top.brand.brand} has the highest ${lower} departure volume — ${fmtCountBuy(top.cat.sold_30d)} in 30 days — with a buy-below of ${fmtEurBuy(top.cat.buy_below)}. ` +
                  `However, volume and margin don't always point the same direction: ` +
                  `high-volume brands sell fast at thin margins, premium brands carry more margin per unit but sit longer. ` +
                  `Check the specific brand page for model-level data before sourcing.`
                : `Check the brand listings below for real sold-through data. Volume and margin trade off differently per brand.`,
          },
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `Best brands for ${categoryName} resale on Vinted`,
      description: directAnswer,
      url: `https://resaleiq.dev/buy/category/${catSlugParam}`,
      numberOfItems: rows.length,
      itemListElement: rows.map((r, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `${r.brand.brand} ${categoryName} — buy below ${fmtEurBuy(r.cat.buy_below)}`,
        url: `https://resaleiq.dev/buy/${r.brand.slug}/${r.cat.slug}`,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Resale IQ", item: "https://resaleiq.dev" },
        { "@type": "ListItem", position: 2, name: "Buy prices", item: "https://resaleiq.dev/buy" },
        { "@type": "ListItem", position: 3, name: `${categoryName} buy prices`, item: `https://resaleiq.dev/buy/category/${catSlugParam}` },
      ],
    },
  ]

  return (
    <div style={{ background: "#0B0D10", color: "#c3cde0", minHeight: "100vh", padding: "44px 24px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        {/* Breadcrumb */}
        <div style={{ fontSize: 13, marginBottom: 18 }}>
          <Link href="/" style={{ color: "#34C759", textDecoration: "none" }}>Resale IQ</Link>
          <span style={{ color: "#3f4a63" }}> / </span>
          <Link href="/buy" style={{ color: "#34C759", textDecoration: "none" }}>Buy prices</Link>
          <span style={{ color: "#3f4a63" }}> / </span>
          <span style={{ color: "#a9b6d0" }}>{categoryName}</span>
        </div>

        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.5px", color: "#eef1f7", lineHeight: 1.18, marginBottom: 14 }}>
          Best brands for {lower} resale — buy-below prices
        </h1>

        <p style={{ fontSize: 15.5, color: "#a9b6d0", lineHeight: 1.75, marginBottom: 28 }}>
          {directAnswer}
        </p>

        {/* Summary stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 32 }}>
          {[
            [String(rows.length), "brands tracked"],
            [fmtCountBuy(total30d), "total departed / 30d"],
            [top ? fmtEurBuy(top.cat.buy_below) : "—", `top brand buy below (${top?.brand.brand ?? "—"})`],
          ].map(([v, l]) => (
            <div key={l} style={{ background: "var(--color-surface, #131823)", border: "1px solid var(--color-border-ui, #1e2a3f)", borderRadius: 12, padding: "16px 18px" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#eef1f7" }}>{v}</div>
              <div style={{ fontSize: 12, color: "#5b6b8c", marginTop: 3 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Brand comparison table */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#eef1f7", marginBottom: 14 }}>
            {categoryName} resale: all tracked brands
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {rows.map((r, i) => {
              const sig = signalDisplay(r.cat.signal)
              return (
                <Link key={r.brand.slug} href={`/buy/${r.brand.slug}/${r.cat.slug}`} style={{ textDecoration: "none" }}>
                  <div style={{
                    background: "var(--color-surface, #131823)",
                    border: "1px solid var(--color-border-ui, #1e2a3f)",
                    borderRadius: 10,
                    padding: "14px 18px",
                    display: "grid",
                    gridTemplateColumns: "32px 1fr auto auto auto",
                    alignItems: "center",
                    gap: 14,
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#3f4a63" }}>#{i + 1}</div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: "#eef1f7" }}>{r.brand.brand}</div>
                      <div style={{ fontSize: 12, color: "#5b6b8c", marginTop: 2 }}>
                        {fmtCountBuy(r.cat.sold_30d)} sold / 30d
                        {r.cat.avg_days_to_sell != null && ` · ${r.cat.avg_days_to_sell}d to sell`}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 12, color: "#5b6b8c" }}>avg exit</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#eef1f7" }}>{fmtEurBuy(r.cat.avg_price_eur)}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 12, color: "#5b6b8c" }}>buy below</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#34C759" }}>{fmtEurBuy(r.cat.buy_below)}</div>
                    </div>
                    {r.cat.signal && (
                      <div style={{
                        fontSize: 11, fontWeight: 700, padding: "4px 8px", borderRadius: 6,
                        background: sig.bgColor, color: sig.color, whiteSpace: "nowrap",
                      }}>
                        {sig.label}
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Explainer */}
        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#eef1f7", marginBottom: 10 }}>
            Volume vs margin in {lower} resale
          </h2>
          <p style={{ fontSize: 14.5, lineHeight: 1.75, marginBottom: 12 }}>
            High-volume brands sell fast but at lower price points — meaning thinner gross margins per sale.
            Premium brands carry higher margins per unit but sit longer and require more capital tied up between
            buy and sell. The right choice depends on your cash flow, sourcing opportunity and storage capacity.
          </p>
          <p style={{ fontSize: 14.5, lineHeight: 1.75 }}>
            Category data is the shortlist. For any brand on this list, check the model before buying —
            not all models within a brand perform equally, and size matters as much as brand.
          </p>
        </section>

        {/* CTA */}
        <div style={{ padding: "22px 24px", background: "var(--color-surface, #131823)", border: "1px solid var(--color-border-2, #1e3a2f)", borderRadius: 12, textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#eef1f7", marginBottom: 8 }}>
            Check a specific {lower} item before you buy
          </div>
          <p style={{ fontSize: 13.5, color: "#8b99b8", margin: "0 0 16px" }}>
            Get a BUY / WATCH / SKIP verdict with model-level buy-below, departure momentum and size analysis. First check free.
          </p>
          <Link
            href={`/tools?q=${encodeURIComponent(categoryName)}&src=buy-cat-hub`}
            style={{ display: "inline-block", background: "#34C759", color: "#06090c", fontWeight: 700, fontSize: 14, padding: "11px 22px", borderRadius: 9, textDecoration: "none" }}
          >
            Free item check →
          </Link>
        </div>

        {/* Other categories */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: "#5b6b8c", marginBottom: 8 }}>Other categories</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {BUY_CATEGORIES.filter((c) => catSlug(c) !== catSlugParam).map((c) => (
              <Link
                key={c}
                href={`/buy/category/${catSlug(c)}`}
                style={{ color: "#8fa3c4", fontSize: 13, textDecoration: "none", padding: "4px 10px", background: "var(--color-surface, #131823)", border: "1px solid var(--color-border-ui, #1e2a3f)", borderRadius: 16 }}
              >
                {c}
              </Link>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 16, fontSize: 12, color: "#3f4a63" }}>
          Data updated {BUY_DATA.generated_at}. Source: {BUY_DATA.source}. {BUY_DATA.threshold}.
        </div>
      </div>
    </div>
  )
}
