import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import seo from "@/data/seo-brands.json"

// Programmatic SEO: one page per brand x top-category, targeting
// "are <brand> <category> worth reselling on Vinted".
// Numbers come from the public market-snapshot API at render time (ISR), so the
// figures stay current without a redeploy. Exposure policy identical to /data:
// aggregate volumes only — never buy-below prices, scores or model names.
export const revalidate = 900

interface BrandSeo { brand: string; slug: string; top_categories: string[] }
const BRANDS = seo.brands as BrandSeo[]

const catSlug = (c: string) =>
  c.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")

export function generateStaticParams() {
  return BRANDS.flatMap((b) =>
    (b.top_categories || []).map((c) => ({ brand: b.slug, category: catSlug(c) }))
  )
}

function resolve(brandSlug: string, categorySlug: string) {
  const b = BRANDS.find((x) => x.slug === brandSlug)
  if (!b) return null
  const category = (b.top_categories || []).find((c) => catSlug(c) === categorySlug)
  if (!category) return null
  return { b, category }
}

export async function generateMetadata(
  { params }: { params: Promise<{ brand: string; category: string }> }
): Promise<Metadata> {
  const { brand, category } = await params
  const r = resolve(brand, category)
  if (!r) return { title: "Not found — Resale IQ" }
  const title = `Are ${r.b.brand} ${r.category} worth reselling on Vinted?`
  const description =
    `${r.b.brand} ${r.category} resale data from 30M+ Vinted listings across 5 EU markets — weekly sales volume, average sale price and how to judge whether to buy.`
  return {
    title, description,
    alternates: { canonical: `/flip/${r.b.slug}/${category}` },
    openGraph: { title, description, type: "article" },
  }
}

interface SnapBrand {
  brand: string
  sold_7d: number
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

export default async function BrandCategoryPage(
  { params }: { params: Promise<{ brand: string; category: string }> }
) {
  const { brand, category } = await params
  const r = resolve(brand, category)
  if (!r) notFound()
  const { b, category: catName } = r

  const snap = await getSnapshot()
  const live = snap.find((s) => s.brand === b.brand)
  const catRow = live?.categories?.find((c) => c.category === catName)
  const catSold = catRow?.sold_7d ?? null
  const brandSold = live?.sold_7d ?? null
  const avgPrice = live?.avg_price_eur ?? null
  const share = catSold && brandSold ? Math.round((catSold / brandSold) * 100) : null

  const answer = catSold
    ? `${b.brand} ${catName} sell roughly ${catSold.toLocaleString()} units a week across the five main EU Vinted markets` +
      (avgPrice ? `, with ${b.brand} averaging about €${avgPrice} per sale` : "") +
      `. That is real, current demand — whether an individual item is worth buying depends on its condition, size and the price you pay.`
    : `${b.brand} ${catName} is one of ${b.brand}'s strongest categories on Vinted across the five main EU markets. Whether a specific item is worth buying depends on its condition, size and the price you pay.`

  const jsonLd = [
    {
      "@context": "https://schema.org", "@type": "FAQPage",
      mainEntity: [
        { "@type": "Question", name: `Are ${b.brand} ${catName} worth reselling on Vinted?`,
          acceptedAnswer: { "@type": "Answer", text: answer } },
        { "@type": "Question", name: `How much do ${b.brand} ${catName} sell for on Vinted?`,
          acceptedAnswer: { "@type": "Answer", text: avgPrice
            ? `${b.brand} items average around €${avgPrice} per sale across Spain, France, Germany, Italy and Portugal. ${catName} pricing varies by model, condition and size.`
            : `Prices vary by model, condition and size. Check recently sold listings rather than active ones, since active listings show asking prices, not real sale prices.` } },
      ],
    },
  ]

  const siblings = (b.top_categories || []).filter((c) => c !== catName)

  return (
    <div style={{ background: "#0B0D10", color: "#c3cde0", minHeight: "100vh", padding: "44px 24px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ fontSize: 13, marginBottom: 18 }}>
          <Link href="/" style={{ color: "#22c55e", textDecoration: "none" }}>Resale IQ</Link>
          <span style={{ color: "#3f4a63" }}> / </span>
          <Link href={`/flip/${b.slug}`} style={{ color: "#22c55e", textDecoration: "none" }}>{b.brand}</Link>
        </div>

        <h1 style={{ fontSize: 32, fontWeight: 800, color: "#eef1f7", lineHeight: 1.18, marginBottom: 14 }}>
          Are {b.brand} {catName} worth reselling on Vinted?
        </h1>
        <p style={{ fontSize: 16, color: "#a9b6d0", lineHeight: 1.7, marginBottom: 24 }}>{answer}</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 26 }}>
          {[
            [catSold ? catSold.toLocaleString() : "—", `${catName} sold / week`],
            [avgPrice ? `€${avgPrice}` : "—", `avg ${b.brand} sale price`],
            [share ? `${share}%` : "—", `of ${b.brand} volume`],
          ].map(([v, l]) => (
            <div key={l} style={{ background: "#12151d", border: "1px solid #1c2333", borderRadius: 12, padding: "16px 18px" }}>
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
          <p style={{ fontSize: 14.5, lineHeight: 1.75 }}>
            Look up the exact model rather than the category. Resale IQ returns a BUY / WATCH / SKIP verdict with the buy-below
            price, typical sale price, sell-through rate and the sizes that sell fastest — computed from 30M+ listings across
            Spain, France, Germany, Italy and Portugal.
          </p>
        </section>

        <div style={{ padding: "22px 24px", background: "#0f1720", border: "1px solid #1c3327", borderRadius: 12, textAlign: "center" }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#eef1f7" }}>Check a {b.brand} item free</div>
          <p style={{ fontSize: 13.5, color: "#8b99b8", margin: "8px 0 16px" }}>
            Get the headline verdict on any item — no signup needed.
          </p>
          <Link href="/tools/vinted-price-checker" style={{ display: "inline-block", background: "#22c55e", color: "#06090c", fontWeight: 700, fontSize: 14, padding: "11px 22px", borderRadius: 9, textDecoration: "none" }}>
            Free price checker →
          </Link>
        </div>

        {siblings.length > 0 && (
          <div style={{ marginTop: 30 }}>
            <div style={{ fontSize: 12.5, color: "#5b6b8c", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>Other {b.brand} categories</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {siblings.map((c) => (
                <Link key={c} href={`/flip/${b.slug}/${catSlug(c)}`} style={{ color: "#8fa3c4", fontSize: 14, textDecoration: "none" }}>
                  → Are {b.brand} {c} worth reselling?
                </Link>
              ))}
              <Link href="/data" style={{ color: "#8fa3c4", fontSize: 14, textDecoration: "none" }}>→ Full Vinted market data</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
