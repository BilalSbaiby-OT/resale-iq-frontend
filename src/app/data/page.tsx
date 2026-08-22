import Link from "next/link"
import type { Metadata } from "next"
import { CATEGORIES } from "@/lib/seo-categories"
import { listingsTrackedLabel } from "@/lib/stats"
import { getMarketNumbers, fmtCount, fmtEur } from "@/lib/market-numbers"
import { FreshnessNotice } from "@/components/ui/freshness-notice"

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

export default async function DataPage() {
  const tracked = await listingsTrackedLabel()
  const market = await getMarketNumbers()
  const brands = market.brandNames.map((name) => {
    const f = market.get(name)!
    return { brand: name, ...f }
  })
  const stamp = market.stamp
  const solds = brands
    .map(b => b.sold_7d)
    .filter((n): n is number => typeof n === "number" && Number.isFinite(n))
  const totalWeekly = solds.length ? solds.reduce((s, n) => s + n, 0) : null

  // Dataset schema — makes the DATA ITSELF indexable and citable, and eligible
  // for Google Dataset Search.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Vinted Resale Market Snapshot",
    description:
      `Weekly units sold and average sale price by brand on Vinted across Spain, France, Germany, Italy and Portugal, derived from ${tracked} analyzed listings.`,
    url: "https://resaleiq.dev/data",
    creator: { "@type": "Organization", name: "Resale IQ", url: "https://resaleiq.dev" },
    license: "https://resaleiq.dev/legal",
    isAccessibleForFree: true,
    temporalCoverage: "P7D",
    spatialCoverage: "Spain, France, Germany, Italy, Portugal",
    ...(market.updatedAt ? { dateModified: new Date(market.updatedAt).toISOString() } : {}),
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
          Weekly units we **watched sell** and average observed sale price by brand across Vinted&apos;s five main EU markets
          (Spain, France, Germany, Italy, Portugal), from {tracked} analyzed listings.
          <strong style={{ color: "#c3cde0" }}> Free to cite with attribution to Resale IQ.</strong>
        </p>

        <FreshnessNotice stamp={stamp} updatedAt={market.updatedAt} stale={market.stale} />

        {market.listingsTracked != null && market.brandCount < (market.brandsTracked ?? 26) ? (
          <p
            role="status"
            style={{
              fontSize: 13, lineHeight: 1.65, color: "#c3cde0", marginTop: 14,
              padding: "12px 14px", background: "#12151d", border: "1px solid #1c2333", borderRadius: 10,
            }}
          >
            <strong style={{ color: "#eef1f7" }}>Observed sales, not catalogue size.</strong>{" "}
            We track {market.brandsTracked ?? 26} brands and {fmtCount(market.listingsTracked)} distinct listings.
            Weekly sold below counts only listings we watched go from active to sold
            {market.publishFloorSold7d != null ? ` (≥ ${market.publishFloorSold7d} watched sales to appear in this table)` : ""}.
            Most of the catalogue was already sold when we first saw it, so this weekly figure is much smaller than listings tracked.
            That is a measurement limit, not a refresh failure.
          </p>
        ) : null}

        {market.provenance && market.updatedAt && (
          <p style={{ fontSize: 12, color: "#5b6b8c", marginTop: 10, fontFamily: "monospace" }}>
            Scope EU5 (ES/FR/DE/IT/PT) · trailing 7 days · dedup listing ID · sold = watched transitions · last calculated {stamp}
          </p>
        )}

        <table
          aria-label="Weekly market snapshot"
          style={{ width: "100%", borderCollapse: "collapse", marginTop: 22, fontSize: 13.5, background: "#12151d", border: "1px solid #1c2333", borderRadius: 12, overflow: "hidden" }}
        >
          <thead>
            <tr style={{ background: "#151924", color: "#8b99b8", textAlign: "left" }}>
              <th style={{ padding: "11px 14px", fontWeight: 600 }}>Sold (7 days)</th>
              <th style={{ padding: "11px 14px", fontWeight: 600 }}>Listings tracked</th>
              <th style={{ padding: "11px 14px", fontWeight: 600 }}>Freshness</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: "12px 14px", fontFamily: "monospace", color: "#eef1f7", fontWeight: 700 }}>{fmtCount(totalWeekly)}</td>
              <td style={{ padding: "12px 14px", fontFamily: "monospace", color: "#eef1f7", fontWeight: 700 }}>{fmtCount(market.listingsTracked)}</td>
              <td style={{ padding: "12px 14px", color: market.stale ? "#fbbf24" : "#8b99b8" }}>
                {stamp ?? "—"}
                {market.stale ? " · last-good" : ""}
              </td>
            </tr>
          </tbody>
        </table>

        {stamp && (
          <p style={{ fontSize: 12.5, color: "#5b6b8c", marginTop: 10 }}>
            {market.stale ? "Snapshot taken" : "Last updated"} {stamp} · {market.brandCount} brands ·{" "}
            {fmtCount(totalWeekly)} units sold in the 7 days to that time
          </p>
        )}

        {brands.length === 0 ? (
          // Only reachable before the very first successful fetch has ever been
          // cached. Once one lands, this page always has numbers on it.
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
                    <td style={{ padding: "11px 14px", fontFamily: "monospace" }}>
                      {fmtCount(b.sold_7d)}
                    </td>
                    <td style={{ padding: "11px 14px", fontFamily: "monospace", color: "#22c55e" }}>{fmtEur(b.avg_price_eur)}</td>
                    <td style={{ padding: "11px 14px", color: "#8b99b8" }}>{b.top_categories.join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ marginTop: 26, fontSize: 13, color: "#5b6b8c", lineHeight: 1.7 }}>
          <strong style={{ color: "#8b99b8" }}>Methodology.</strong> Figures are aggregated from public Vinted listings across ES, FR, DE, IT and PT, deduplicated by listing ID. &quot;Sold / 7 days&quot; counts units we <em>watched</em> sell in the trailing week (sold_observed), not every sold listing in the catalogue. Average sale price is the mean of those observed sales. Buy-below prices, sell-through rates and per-size demand are part of the paid product and are not published here.
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
