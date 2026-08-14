import Link from "next/link"
import type { Metadata } from "next"
import { CATEGORIES } from "@/lib/seo-categories"

// Public, citable open data. Rendered server-side and revalidated hourly (ISR),
// so the page HTML always contains fresh numbers for crawlers — no redeploy
// needed for the data to update. This is the page we want ChatGPT/Perplexity/
// Google to quote when asked "what sells on Vinted".
export const revalidate = 900

export const metadata: Metadata = {
  title: "Vinted Market Data — Weekly Resale Statistics by Brand",
  description:
    "Free Vinted market data: weekly units sold and average sale price by brand across Spain, France, Germany, Italy and Portugal. Updated daily by Resale IQ.",
  alternates: { canonical: "/data" },
}

interface Brand {
  brand: string
  sold_7d: number
  avg_price_eur: number
  top_categories: string[]
  models_tracked: number
}
interface Snapshot {
  updated_at: string
  brand_count: number
  brands: Brand[]
  markets: string[]
}

async function getSnapshot(): Promise<Snapshot | null> {
  const base = process.env.BACKEND_URL || "http://localhost:8080"
  try {
    const r = await fetch(`${base}/api/public/market-snapshot`, { next: { revalidate: 900 } })
    if (!r.ok) return null
    return await r.json()
  } catch {
    return null
  }
}

export default async function DataPage() {
  const snap = await getSnapshot()
  const brands = snap?.brands ?? []
  const updated = snap?.updated_at ? new Date(snap.updated_at) : null
  const totalWeekly = brands.reduce((s, b) => s + (b.sold_7d || 0), 0)

  // Dataset schema — makes the DATA ITSELF indexable and citable, and eligible
  // for Google Dataset Search.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Vinted Resale Market Snapshot",
    description:
      "Weekly units sold and average sale price by brand on Vinted across Spain, France, Germany, Italy and Portugal, derived from 900,000+ analyzed listings.",
    url: "https://resaleiq.dev/data",
    creator: { "@type": "Organization", name: "Resale IQ", url: "https://resaleiq.dev" },
    license: "https://resaleiq.dev/legal",
    isAccessibleForFree: true,
    temporalCoverage: "P7D",
    spatialCoverage: "Spain, France, Germany, Italy, Portugal",
    ...(updated ? { dateModified: updated.toISOString() } : {}),
    variableMeasured: [
      { "@type": "PropertyValue", name: "units sold (7 days)" },
      { "@type": "PropertyValue", name: "average sale price (EUR)" },
      { "@type": "PropertyValue", name: "top categories" },
    ],
  }

  return (
    <div style={{ background: "#0B0D10", color: "#c3cde0", minHeight: "100vh", padding: "44px 24px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <Link href="/" style={{ color: "#22c55e", fontSize: 13, textDecoration: "none" }}>← Resale IQ</Link>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "#eef1f7", margin: "20px 0 10px" }}>
          Vinted market data
        </h1>
        <p style={{ fontSize: 15.5, color: "#8b99b8", lineHeight: 1.65, maxWidth: 660 }}>
          Weekly units sold and average sale price by brand across Vinted&apos;s five main EU markets
          (Spain, France, Germany, Italy, Portugal), from 900,000+ analyzed listings.
          <strong style={{ color: "#c3cde0" }}> Free to cite with attribution to Resale IQ.</strong>
        </p>

        {updated && (
          <p style={{ fontSize: 12.5, color: "#5b6b8c", marginTop: 10 }}>
            Last updated {updated.toISOString().slice(0, 16).replace("T", " ")} UTC · {snap?.brand_count} brands ·{" "}
            {totalWeekly.toLocaleString()} units sold in the last 7 days
          </p>
        )}

        {brands.length === 0 ? (
          <p style={{ marginTop: 28, color: "#8b99b8" }}>Market data is being refreshed — check back shortly.</p>
        ) : (
          <div style={{ marginTop: 26, overflowX: "auto", border: "1px solid #1c2333", borderRadius: 12 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, minWidth: 620 }}>
              <thead>
                <tr style={{ background: "#12151d", color: "#8b99b8", textAlign: "left" }}>
                  <th style={{ padding: "11px 14px", fontWeight: 600 }}>#</th>
                  <th style={{ padding: "11px 14px", fontWeight: 600 }}>Brand</th>
                  <th style={{ padding: "11px 14px", fontWeight: 600 }}>Sold / 7 days</th>
                  <th style={{ padding: "11px 14px", fontWeight: 600 }}>Avg sale price</th>
                  <th style={{ padding: "11px 14px", fontWeight: 600 }}>Top categories</th>
                </tr>
              </thead>
              <tbody>
                {brands.map((b, i) => (
                  <tr key={b.brand} style={{ borderTop: "1px solid #161b26" }}>
                    <td style={{ padding: "11px 14px", color: "#5b6b8c" }}>{i + 1}</td>
                    <td style={{ padding: "11px 14px", color: "#eef1f7", fontWeight: 600 }}>{b.brand}</td>
                    <td style={{ padding: "11px 14px", fontFamily: "monospace" }}>{b.sold_7d.toLocaleString()}</td>
                    <td style={{ padding: "11px 14px", fontFamily: "monospace", color: "#22c55e" }}>€{b.avg_price_eur}</td>
                    <td style={{ padding: "11px 14px", color: "#8b99b8" }}>{b.top_categories.join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ marginTop: 26, fontSize: 13, color: "#5b6b8c", lineHeight: 1.7 }}>
          <strong style={{ color: "#8b99b8" }}>Methodology.</strong> Figures are aggregated from public live and sold
          Vinted listings across ES, FR, DE, IT and PT, deduplicated by listing ID across markets and recomputed
          continuously. &quot;Sold / 7 days&quot; counts units sold in the trailing week; &quot;avg sale price&quot; is
          the mean observed sale price. Buy-below prices, sell-through rates and per-size demand are part of the paid
          product and are not published here.
        </div>

        <div style={{ marginTop: 28, padding: "22px 24px", background: "#0f1720", border: "1px solid #1c3327", borderRadius: 12, textAlign: "center" }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#eef1f7" }}>Want the numbers that make you money?</div>
          <p style={{ fontSize: 13.5, color: "#8b99b8", margin: "8px 0 16px" }}>
            Buy-below price, sell-through and best sizes for any item — plus live deals under your price.
          </p>
          <Link href="/register" style={{ display: "inline-block", background: "#22c55e", color: "#06090c", fontWeight: 700, fontSize: 14, padding: "11px 22px", borderRadius: 9, textDecoration: "none" }}>
            See plans →
          </Link>
        </div>

        {/* /data is the parent of the category rankings — without these links the
            hubs are only reachable from deep brand pages. */}
        <div style={{ marginTop: 30 }}>
          <div style={{ fontSize: 12.5, color: "#5b6b8c", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Brands ranked by category
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {CATEGORIES.map((c) => (
              <Link key={c.slug} href={`/category/${c.slug}`} style={{
                fontSize: 13, color: "#a9b6d0", textDecoration: "none",
                background: "#12151d", border: "1px solid #1c2333",
                borderRadius: 8, padding: "7px 12px",
              }}>
                {c.category}
              </Link>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 26, display: "flex", gap: 16, flexWrap: "wrap" }}>
          <Link href="/manual" style={{ color: "#8fa3c4", fontSize: 13.5, textDecoration: "none" }}>→ The reselling manual</Link>
          <Link href="/tools" style={{ color: "#8fa3c4", fontSize: 13.5, textDecoration: "none" }}>→ Free reseller tools</Link>
          <Link href="/blog" style={{ color: "#8fa3c4", fontSize: 13.5, textDecoration: "none" }}>→ Reselling guides</Link>
        </div>
      </div>
    </div>
  )
}
