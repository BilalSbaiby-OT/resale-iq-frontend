import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import seo from "@/data/seo-brands.json"
import { listingsTrackedLabel } from "@/lib/stats"
import { getMarketNumbers, categoryFigure, fmtCount, fmtEur } from "@/lib/market-numbers"
import { FreshnessNotice } from "@/components/ui/freshness-notice"

// Programmatic SEO: one page per brand x top-category, targeting
// "are <brand> <category> worth reselling on Vinted".
// Numbers come from the public market-snapshot API at render time (ISR), so the
// figures stay current without a redeploy. Exposure policy identical to /data:
// aggregate volumes only — never buy-below prices, scores or model names.
export const revalidate = 900

interface BrandSeo {
  brand: string
  slug: string
  sold_7d: number
  avg_price_eur: number
  top_categories: string[]
  categories: { category: string; sold_7d: number }[]
}
const BRANDS = seo.brands as BrandSeo[]

const catSlug = (c: string) =>
  c.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")

export function generateStaticParams() {
  return BRANDS.flatMap((b) =>
    (b.categories || []).map((c) => ({ brand: b.slug, category: catSlug(c.category) }))
  )
}

function resolve(brandSlug: string, categorySlug: string) {
  const b = BRANDS.find((x) => x.slug === brandSlug)
  if (!b) return null
  const row = (b.categories || []).find((c) => catSlug(c.category) === categorySlug)
  if (!row) return null
  return { b, category: row.category, baselineSold: row.sold_7d }
}

export async function generateMetadata(
  { params }: { params: Promise<{ brand: string; category: string }> }
): Promise<Metadata> {
  const { brand, category } = await params
  const r = resolve(brand, category)
  if (!r) return { title: "Not found — Resale IQ" }
  const title = `Are ${r.b.brand} ${r.category} worth reselling on Vinted?`
  const description =
    `${r.b.brand} ${r.category} resale data from ${await listingsTrackedLabel()} Vinted listings across 5 EU markets — weekly watched departures, average asking price at departure and how to judge whether to buy.`
  return {
    title, description,
    alternates: { canonical: `/flip/${r.b.slug}/${category}` },
    openGraph: { title, description, type: "article" },
  }
}

export default async function BrandCategoryPage(
  { params }: { params: Promise<{ brand: string; category: string }> }
) {
  const tracked = await listingsTrackedLabel()
  const { brand, category } = await params
  const r = resolve(brand, category)
  if (!r) notFound()
  const { b, category: catName } = r

  // Figures from the warehouse only. No `?? baselineSold`: that fell back to the
  // BUILD-TIME export, so a figure frozen months ago rendered as if it were
  // current with nothing on the page saying so. The warehouse has the last-good
  // snapshot behind it — a real measurement with a real timestamp — and when
  // even that has no row for this brand the honest answer is null, which the
  // prose and the stat cards below already handle.
  const market = await getMarketNumbers()
  const figures = market.get(b.brand)
  const catRow = categoryFigure(figures, catName)
  const catSold = catRow?.sold_7d ?? null
  const brandSold = figures?.sold_7d ?? null
  const avgPrice = figures?.avg_price_eur ?? null
  const share = catSold && brandSold ? Math.round((catSold / brandSold) * 100) : null

  const answer = catSold
    ? `${b.brand} ${catName} see roughly ${catSold.toLocaleString()} watched departures a week across the five main EU Vinted markets` +
      (avgPrice ? `, with ${b.brand} averaging about €${avgPrice} in asking price at departure` : "") +
      `. That is real, current demand — whether an individual item is worth buying depends on its condition, size and the price you pay.`
    : `${b.brand} ${catName} is tracked across the five main EU Vinted markets. Live weekly volume is not on this snapshot — check a specific model rather than trusting a frozen category average.`

  const jsonLd = [
    {
      "@context": "https://schema.org", "@type": "FAQPage",
      mainEntity: [
        { "@type": "Question", name: `Are ${b.brand} ${catName} worth reselling on Vinted?`,
          acceptedAnswer: { "@type": "Answer", text: answer } },
        { "@type": "Question", name: `How much do ${b.brand} ${catName} sell for on Vinted?`,
          acceptedAnswer: { "@type": "Answer", text: avgPrice
            ? `${b.brand} items average around €${avgPrice} in asking price at the moment listings left the shelf, across Spain, France, Germany, Italy and Portugal. ${catName} pricing varies by model, condition and size.`
            : `Prices vary by model, condition and size. Check listings that recently left the shelf rather than active ones, since active listings show hopeful asking prices, not the price at departure.` } },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Resale IQ", item: "https://resaleiq.dev" },
        { "@type": "ListItem", position: 2, name: "Brands", item: "https://resaleiq.dev/flip" },
        { "@type": "ListItem", position: 3, name: b.brand, item: `https://resaleiq.dev/flip/${b.slug}` },
        { "@type": "ListItem", position: 4, name: catName, item: `https://resaleiq.dev/flip/${b.slug}/${catSlug(catName)}` },
      ],
    },
  ]

  const siblings = (b.categories || []).map((c) => c.category).filter((c) => c !== catName)

  return (
    <div style={{ background: "#0B0D10", color: "#c3cde0", minHeight: "100vh", padding: "44px 24px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ fontSize: 13, marginBottom: 18 }}>
          <Link href="/" style={{ color: "#34C759", textDecoration: "none" }}>Resale IQ</Link>
          <span style={{ color: "#3f4a63" }}> / </span>
          <Link href={`/flip/${b.slug}`} style={{ color: "#34C759", textDecoration: "none" }}>{b.brand}</Link>
        </div>

        <FreshnessNotice stamp={market.stamp} updatedAt={market.updatedAt} stale={market.stale} />

        <h1 style={{ fontSize: 32, fontWeight: 600, letterSpacing: "-0.6px", color: "#eef1f7", lineHeight: 1.18, marginBottom: 14 }}>
          Are {b.brand} {catName} worth reselling on Vinted?
        </h1>
        <p style={{ fontSize: 16, color: "#a9b6d0", lineHeight: 1.7, marginBottom: 24 }}>{answer}</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 26 }}>
          {[
            [fmtCount(catSold), `${catName} left shelf / week`],
            [fmtEur(avgPrice), `avg ${b.brand} price at exit`],
            [share != null ? `${share}%` : "—", `of ${b.brand} volume`],
          ].map(([v, l]) => (
            <div key={l} style={{ background: "var(--color-surface)", border: "1px solid var(--color-border-ui)", borderRadius: 12, padding: "16px 18px" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#eef1f7" }}>{v}</div>
              <div style={{ fontSize: 12, color: "#5b6b8c", marginTop: 3 }}>{l}</div>
            </div>
          ))}
        </div>

        <section style={{ marginBottom: 22 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#eef1f7", marginBottom: 10 }}>What decides whether it&apos;s profitable</h2>
          <p style={{ fontSize: 14.5, lineHeight: 1.75, marginBottom: 12 }}>
            Category demand tells you people are buying. It doesn&apos;t tell you whether <em>this</em> item, in <em>this</em> size,
            at <em>this</em> price, will make you money. Three things decide that: the buy-below price (the most you can pay and
            still profit after fees), the sell-through rate for the specific model, and whether the size is one that actually moves.
          </p>
          <p style={{ fontSize: 14.5, lineHeight: 1.75 }}>
            A strong category with the wrong size is still dead stock. That is why per-size demand matters as much as brand demand.
          </p>
        </section>

        <section style={{ marginBottom: 26 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#eef1f7", marginBottom: 10 }}>How to check before you buy</h2>
          <p style={{ fontSize: 14.5, lineHeight: 1.75, marginBottom: 12 }}>
            Look up the exact model rather than the category. Resale IQ returns a BUY / WATCH / SKIP verdict with the buy-below
            price, typical price at departure, departure momentum and the sizes that move fastest — computed from {tracked} listings across
            Spain, France, Germany, Italy and Portugal.
          </p>
          <p style={{ fontSize: 14.5, lineHeight: 1.75 }}>
            If you are new to this, the{" "}
            <Link href="/manual" style={{ color: "#34C759", textDecoration: "none" }}>reselling manual</Link>{" "}
            walks through the margin maths, the fee structure and the sourcing rules that decide whether a
            category like this is actually worth your money.
          </p>
        </section>

        <div style={{ padding: "22px 24px", background: "var(--color-surface)", border: "1px solid var(--color-border-2)", borderRadius: 12, textAlign: "center" }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#eef1f7" }}>Check a {b.brand} item free</div>
          <p style={{ fontSize: 13.5, color: "#8b99b8", margin: "8px 0 16px" }}>
            Get the headline verdict on any item — no signup needed.
          </p>
          <Link href="/tools/vinted-price-checker" style={{ display: "inline-block", background: "#34C759", color: "#06090c", fontWeight: 700, fontSize: 14, padding: "11px 22px", borderRadius: 9, textDecoration: "none" }}>
            Free price checker →
          </Link>
        </div>

        <div style={{ marginTop: 30 }}>
          <div style={{ fontSize: 13, color: "#5b6b8c", marginBottom: 10, letterSpacing: "0.1px" }}>Keep reading</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Link href={`/category/${category}`} style={{ color: "#8fa3c4", fontSize: 14, textDecoration: "none" }}>
              → Which brands sell best in {catName}?
            </Link>
            {siblings.map((c) => (
              <Link key={c} href={`/flip/${b.slug}/${catSlug(c)}`} style={{ color: "#8fa3c4", fontSize: 14, textDecoration: "none" }}>
                → Are {b.brand} {c} worth reselling?
              </Link>
            ))}
            <Link href="/methodology" style={{ color: "#8fa3c4", fontSize: 14, textDecoration: "none" }}>→ How these numbers are calculated</Link>
            <Link href="/tools" style={{ color: "#8fa3c4", fontSize: 14, textDecoration: "none" }}>→ Analyze an item</Link>
            <Link href="/data" style={{ color: "#8fa3c4", fontSize: 14, textDecoration: "none" }}>→ Full Vinted market data</Link>
            <Link href="/pricing?src=flip" style={{ color: "#8fa3c4", fontSize: 14, textDecoration: "none" }}>→ See plans and pricing</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
