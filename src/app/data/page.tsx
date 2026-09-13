import Link from "next/link"
import type { Metadata } from "next"
import { CATEGORIES, BRANDS } from "@/lib/seo-categories"
import { listingsTrackedLabel } from "@/lib/stats"
import { getMarketNumbers, fmtCount, fmtEur } from "@/lib/market-numbers"
import { FreshnessNotice } from "@/components/ui/freshness-notice"
import { WeeklyBrief } from "@/components/ui/weekly-brief"
import { HubFaq } from "@/components/seo/hub-faq"
import { definedTermJsonLd, faqPageJsonLd } from "@/lib/faq-schema"

// Public, citable open data. Must render at request time: docker build cannot
// reach the snapshot API, so a static / ISR shell bakes "being refreshed" with
// no brands. Runtime BACKEND_URL can. Crawlers still see the numbers in HTML.
export const dynamic = "force-dynamic"

// Shared so <title>, og:title and twitter:title cannot drift. Root layout
// pins homepage openGraph/twitter strings; Next.js does not copy a child
// `title` into those tags, so /data used to share as the generic homepage.
const TITLE = "Weekly Brand Volumes on Vinted — What Sells Best in 2026"
const DESCRIPTION =
  "Weekly Vinted brand volumes: watched departures and average asking prices at departure across Spain, France, Germany, Italy and Portugal. Updated from live listings."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/data" },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
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

  const watchedDeparture =
    'A watched departure is a listing we watched leave the shelf — not a confirmed sale receipt. "Sold / 7 days" on this table counts those transitions in the trailing week, not every sold listing on Vinted.'

  const faqs = [
    {
      q: "What is a watched departure?",
      a: watchedDeparture,
    },
    {
      q: "What are weekly brand volumes on Vinted?",
      a:
        `"Sold / 7 days" counts units we watched sell in the trailing week (sold_observed) — ` +
        `listings that went from active to sold — not every sold listing in the catalogue. ` +
        `Average sale price is the mean of those observed sales.` +
        (totalWeekly != null
          ? ` This snapshot sums to ${fmtCount(totalWeekly)} watched departures across ${market.brandCount} brands.`
          : "") +
        ` Buy-below prices, sell-through rates and per-size demand are part of the paid product and are not published here.`,
    },
    {
      q: "Which Vinted markets does this table cover?",
      a:
        "Spain, France, Germany, Italy and Portugal (ES/FR/DE/IT/PT). Figures are aggregated from public Vinted listings " +
        "on those five domains, deduplicated by listing ID. The table does not cover the UK or other Vinted domains.",
    },
    {
      q: "How do I read this table?",
      a:
        "Each row is one tracked brand. Sold / 7 days is watched departures that week. Avg sale price is the mean " +
        "asking price at those departures, in euros. Top categories are the busiest categories for that brand in the snapshot. " +
        "An em-dash means this snapshot has no figure for that cell — not that the brand sold nothing. " +
        "Brands are ordered by weekly watched sales." +
        (market.publishFloorSold7d != null
          ? ` A brand needs at least ${market.publishFloorSold7d} watched sales to appear in this table.`
          : ""),
    },
    {
      q: "How often is this table updated?",
      a:
        "The table renders from the live snapshot. A freshness stamp shows when the figures were last calculated. " +
        "If the live feed is unavailable, the last complete snapshot is shown and labelled. " +
        "Volumes are always a trailing 7-day window, not a calendar week.",
    },
    {
      q: "Is this the size of Vinted as a whole?",
      a:
        "No. This is tracked-brand volume only. Unbranded listings and brands outside the tracked set are not counted, " +
        "so the weekly total is much smaller than listings tracked — a measurement limit, not a refresh failure.",
    },
  ]

  // Dataset schema — makes the DATA ITSELF indexable and citable, and eligible
  // for Google Dataset Search. FAQPage sits beside it; do not replace it.
  const jsonLd = [
    {
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
    },
    faqPageJsonLd(faqs),
    definedTermJsonLd({
      name: "Watched departure",
      description: watchedDeparture,
      url: "https://resaleiq.dev/data",
    }),
  ]

  return (
    <div style={{ background: "var(--color-bg)", color: "var(--color-text-body)", minHeight: "100vh", padding: "44px 24px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <Link href="/" style={{ color: "var(--color-buy)", fontSize: 13, textDecoration: "none" }}>← Resale IQ</Link>
        <h1 style={{ fontSize: 32, fontWeight: 600, color: "var(--color-text-primary)", margin: "20px 0 10px", letterSpacing: "-0.6px" }}>
          Weekly brand volumes on Vinted
        </h1>
        <p style={{ fontSize: 15.5, color: "#8b99b8", lineHeight: 1.65, maxWidth: 660 }}>
          Weekly units we <strong style={{ color: "#c3cde0", fontWeight: 600 }}>watched sell</strong> and average observed sale price by brand across Vinted&apos;s five main EU markets
          (Spain, France, Germany, Italy, Portugal), from {tracked} analyzed listings.
          <strong style={{ color: "#c3cde0" }}> Free to cite with attribution to Resale IQ.</strong>
        </p>

        <h2 style={{ fontSize: 19, fontWeight: 600, color: "#eef1f7", margin: "22px 0 8px", letterSpacing: "-0.3px" }}>
          What is a watched departure?
        </h2>
        <p style={{ fontSize: 15.5, color: "#8b99b8", lineHeight: 1.65, maxWidth: 660, margin: "0 0 6px" }}>
          {watchedDeparture}
        </p>

        <FreshnessNotice stamp={stamp} updatedAt={market.updatedAt} stale={market.stale} />

        <WeeklyBrief market={market} />

        {market.listingsTracked != null && market.brandCount < (market.brandsTracked ?? 26) ? (
          <p
            role="status"
            style={{
              fontSize: 13, lineHeight: 1.65, color: "#c3cde0", marginTop: 14,
              padding: "12px 14px", background: "var(--color-surface)", border: "1px solid var(--color-border-ui)", borderRadius: 10,
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

        <h2 style={{ fontSize: 19, fontWeight: 600, color: "#eef1f7", margin: "26px 0 0", letterSpacing: "-0.3px" }}>
          This week&apos;s snapshot
        </h2>

        <table
          aria-label="Weekly market snapshot"
          style={{ width: "100%", borderCollapse: "collapse", marginTop: 22, fontSize: 13.5, background: "var(--color-surface)", border: "1px solid var(--color-border-ui)", borderRadius: 12, overflow: "hidden" }}
        >
          <thead>
            <tr style={{ background: "var(--color-surface-elevated)", color: "#8b99b8", textAlign: "left" }}>
              <th style={{ padding: "11px 14px", fontWeight: 600 }}>Sold (7 days)</th>
              <th style={{ padding: "11px 14px", fontWeight: 600 }}>Listings tracked</th>
              <th style={{ padding: "11px 14px", fontWeight: 600 }}>Freshness</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: "12px 14px", fontFamily: "monospace", color: "#eef1f7", fontWeight: 700 }}>{fmtCount(totalWeekly)}</td>
              <td style={{ padding: "12px 14px", fontFamily: "monospace", color: "#eef1f7", fontWeight: 700 }}>{fmtCount(market.listingsTracked)}</td>
              <td style={{ padding: "12px 14px", color: market.stale ? "#FF9F0A" : "#8b99b8" }}>
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
          <>
          <h2 style={{ fontSize: 19, fontWeight: 600, color: "#eef1f7", margin: "30px 0 0", letterSpacing: "-0.3px" }}>
            Weekly sales and average price by brand
          </h2>
          <div style={{ marginTop: 18, overflowX: "auto", border: "1px solid var(--color-border-ui)", borderRadius: 12 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, minWidth: 620 }}>
              <thead>
                <tr style={{ background: "var(--color-surface)", color: "#8b99b8", textAlign: "left" }}>
                  <th style={{ padding: "11px 14px", fontWeight: 600 }}>#</th>
                  <th style={{ padding: "11px 14px", fontWeight: 600 }}>Brand</th>
                  <th style={{ padding: "11px 14px", fontWeight: 600 }}>Sold / 7 days</th>
                  <th style={{ padding: "11px 14px", fontWeight: 600 }}>Avg sale price</th>
                  <th style={{ padding: "11px 14px", fontWeight: 600 }}>Top categories</th>
                </tr>
              </thead>
              <tbody>
                {brands.map((b, i) => (
                  <tr key={b.brand} style={{ borderTop: "1px solid var(--color-border-ui)" }}>
                    <td style={{ padding: "11px 14px", color: "#5b6b8c" }}>{i + 1}</td>
                    <td style={{ padding: "11px 14px", color: "#eef1f7", fontWeight: 600 }}>
                      {(() => {
                        const slug = BRANDS.find(x => x.brand === b.brand)?.slug
                        return slug
                          ? <Link href={`/flip/${slug}`} style={{ color: "#eef1f7", textDecoration: "none" }}>{b.brand}</Link>
                          : b.brand
                      })()}
                    </td>
                    <td style={{ padding: "11px 14px", fontFamily: "monospace" }}>
                      {fmtCount(b.sold_7d)}
                    </td>
                    <td style={{ padding: "11px 14px", fontFamily: "monospace", color: "var(--color-buy)" }}>{fmtEur(b.avg_price_eur)}</td>
                    <td style={{ padding: "11px 14px", color: "#8b99b8" }}>{b.top_categories.join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}

        <h2 style={{ fontSize: 19, fontWeight: 700, color: "#eef1f7", margin: "30px 0 8px" }}>
          How these numbers are produced
        </h2>
        <div style={{ fontSize: 13, color: "#5b6b8c", lineHeight: 1.7 }}>
          Figures are aggregated from public Vinted listings across ES, FR, DE, IT and PT, deduplicated by listing ID. &quot;Sold / 7 days&quot; counts units we <em>watched</em> sell in the trailing week (sold_observed), not every sold listing in the catalogue. Average sale price is the mean of those observed sales. Buy-below prices, sell-through rates and per-size demand are part of the paid product and are not published here.
        </div>

        <HubFaq items={faqs} />

        <div style={{ marginTop: 28, padding: "22px 24px", background: "var(--color-surface)", border: "1px solid var(--color-border-2)", borderRadius: 12, textAlign: "center" }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#eef1f7" }}>Want the numbers that make you money?</div>
          <p style={{ fontSize: 13.5, color: "#8b99b8", margin: "8px 0 16px" }}>
            Buy-below price, sell-through and best sizes for any item — plus live deals under your price.
          </p>
          {/* EXP-11 (Tony): /data is the site's 2nd-largest organic entry page AND
              the top LLM-cited landing surface (Perplexity cites /data; ChatGPT
              lands visitors here). It led with a bold "See plans" pricing wall and
              demoted the free check to grey text pointing at /tools (an index, not
              the checker). That is the EXP-10 wall-before-value leak on our best
              LLM surface — it fails the G2 gate. Primary door is now the no-signup
              free checker (check->signup is 43.8%, so a check feeds a signup);
              plans becomes the secondary link. src=data-check tags the arrival. */}
          <Link href="/tools/vinted-price-checker?src=data-check" style={{ display: "inline-block", background: "var(--color-buy)", color: "var(--color-on-buy)", fontWeight: 700, fontSize: 14, padding: "11px 22px", borderRadius: 9, textDecoration: "none" }}>
            Check this item →
          </Link>
          <Link href="/pricing?src=data" style={{ display: "inline-block", marginLeft: 10, color: "#8fa3c4", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
            or see plans
          </Link>
        </div>

        {/* /data is the parent of the category rankings — without these links the
            hubs are only reachable from deep brand pages. */}
        <div style={{ marginTop: 30 }}>
          <h2 style={{ fontSize: 19, fontWeight: 700, color: "#eef1f7", margin: "0 0 10px" }}>
            Brands ranked by category
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {CATEGORIES.map((c) => (
              <Link key={c.slug} href={`/category/${c.slug}`} style={{
                fontSize: 13, color: "#a9b6d0", textDecoration: "none",
                background: "var(--color-surface)", border: "1px solid var(--color-border-ui)",
                borderRadius: 8, padding: "7px 12px",
              }}>
                {c.category}
              </Link>
            ))}
          </div>
        </div>

        {/* /data is the highest-authority page that links into the programmatic
            estate, so the two hubs go here. The homepage already links /data, which
            puts /flip and /category at crawl depth 2 without touching page.tsx —
            that file belongs to the other agent's lane (agent/LANES.md). */}
        <div style={{ marginTop: 26, display: "flex", gap: 16, flexWrap: "wrap" }}>
          <Link href="/flip" style={{ color: "#8fa3c4", fontSize: 13.5, textDecoration: "none" }}>→ Every brand ranked</Link>
          <Link href="/category" style={{ color: "#8fa3c4", fontSize: 13.5, textDecoration: "none" }}>→ Every category ranked</Link>
          <Link href="/tools" style={{ color: "#8fa3c4", fontSize: 13.5, textDecoration: "none" }}>→ Analyze an item</Link>
          <Link href="/methodology" style={{ color: "#8fa3c4", fontSize: 13.5, textDecoration: "none" }}>→ Methodology</Link>
          <Link href="/manual" style={{ color: "#8fa3c4", fontSize: 13.5, textDecoration: "none" }}>→ The reselling manual</Link>
          <Link href="/blog" style={{ color: "#8fa3c4", fontSize: 13.5, textDecoration: "none" }}>→ Reselling guides</Link>
        </div>
      </div>
    </div>
  )
}
