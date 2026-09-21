import Link from "next/link"
import type { Metadata } from "next"
import { CATEGORIES, BRANDS } from "@/lib/seo-categories"
import { OG_IMAGES } from "@/lib/og-image"
import { listingsTrackedLabel } from "@/lib/stats"
import { getMarketNumbers, fmtCount, fmtEur } from "@/lib/market-numbers"
import { FreshnessNotice } from "@/components/ui/freshness-notice"
import { WeeklyBrief } from "@/components/ui/weekly-brief"
import { HubFaq } from "@/components/seo/hub-faq"
import { definedTermJsonLd, faqPageJsonLd } from "@/lib/faq-schema"
import { dataChrome, dataFaqs } from "@/data/seo-data-copy"
import type { Locale } from "@/lib/i18n"
import { canonicalPath, hreflangLanguages } from "@/lib/locale-routes"

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
  alternates: { canonical: "/data", languages: hreflangLanguages("/data") },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website", url: "/data", images: OG_IMAGES },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: OG_IMAGES },
}

export async function DataPage({ locale = "en" }: { locale?: Locale } = {}) {
  const t = dataChrome[locale]
  const prefix = locale === "en" ? "" : `/${locale}`
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
  const refreshIso = market.updatedAt ? new Date(market.updatedAt).toISOString() : null
  const floorLabel =
    market.publishFloorSold7d != null ? fmtCount(market.publishFloorSold7d) : ""

  const watchedDeparture = dataFaqs(locale, {
    totalWeekly: fmtCount(totalWeekly),
    brandCount: market.brandCount,
    floor: floorLabel,
  })[0]?.a ?? ""

  const faqs = dataFaqs(locale, {
    totalWeekly: fmtCount(totalWeekly),
    brandCount: market.brandCount,
    floor: floorLabel,
  })

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
        <Link href={canonicalPath(locale, "")} style={{ color: "var(--color-buy)", fontSize: 13, textDecoration: "none" }}>{t.back}</Link>
        <h1 style={{ fontSize: 32, fontWeight: 600, color: "var(--color-text-primary)", margin: "20px 0 10px", letterSpacing: "-0.6px" }}>
          {t.h1}
        </h1>
        <p style={{ fontSize: 15.5, color: "#8b99b8", lineHeight: 1.65, maxWidth: 660 }}>
          {t.ledeBefore}{tracked}{t.ledeCite}
        </p>

        <aside
          data-testid="riq-data-benchmark"
          aria-label={t.citeH2}
          style={{
            marginTop: 20,
            padding: "18px 20px",
            background: "var(--color-surface)",
            border: "1px solid var(--color-border-2)",
            borderRadius: 12,
          }}
        >
          <h2 style={{ fontSize: 17, fontWeight: 700, color: "#eef1f7", margin: "0 0 12px" }}>{t.citeH2}</h2>
          <dl style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 18px", margin: 0, fontSize: 14 }}>
            <div>
              <dt style={{ color: "#8b99b8", fontSize: 12.5 }}>{t.dtRefresh}</dt>
              <dd style={{ margin: "4px 0 0", color: "#eef1f7", fontFamily: "monospace", fontWeight: 700 }}>
                <time data-testid="riq-data-refresh" dateTime={refreshIso ?? undefined}>
                  {stamp ?? "—"}
                </time>
                {market.stale ? ` · ${t.lastGood}` : ""}
              </dd>
            </div>
            <div>
              <dt style={{ color: "#8b99b8", fontSize: 12.5 }}>{t.dtListings}</dt>
              <dd style={{ margin: "4px 0 0", color: "#eef1f7", fontFamily: "monospace", fontWeight: 700 }}>{tracked}</dd>
            </div>
            <div>
              <dt style={{ color: "#8b99b8", fontSize: 12.5 }}>{t.dtBrands}</dt>
              <dd style={{ margin: "4px 0 0", color: "#eef1f7", fontFamily: "monospace", fontWeight: 700 }}>{market.brandCount}</dd>
            </div>
            <div>
              <dt style={{ color: "#8b99b8", fontSize: 12.5 }}>{t.dtWeekly}</dt>
              <dd style={{ margin: "4px 0 0", color: "#eef1f7", fontFamily: "monospace", fontWeight: 700 }}>{fmtCount(totalWeekly)}</dd>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <dt style={{ color: "#8b99b8", fontSize: 12.5 }}>{t.dtMarkets}</dt>
              <dd style={{ margin: "4px 0 0", color: "#eef1f7" }}>{t.marketsValue}</dd>
            </div>
          </dl>
          <p style={{ fontSize: 13, color: "#8b99b8", lineHeight: 1.65, margin: "12px 0 0" }}>{t.citeNote}</p>
        </aside>

        <h2 style={{ fontSize: 19, fontWeight: 600, color: "#eef1f7", margin: "22px 0 8px", letterSpacing: "-0.3px" }}>
          {t.watchedH2}
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
            <strong style={{ color: "#eef1f7" }}>{t.observedTitle}</strong>{" "}
            {t.observedP}
            {market.publishFloorSold7d != null ? ` (≥ ${market.publishFloorSold7d})` : ""}
          </p>
        ) : null}

        {market.provenance && market.updatedAt && (
          <p style={{ fontSize: 12, color: "#5b6b8c", marginTop: 10, fontFamily: "monospace" }}>
            {t.provenance} {stamp}
          </p>
        )}

        <h2 style={{ fontSize: 19, fontWeight: 600, color: "#eef1f7", margin: "26px 0 0", letterSpacing: "-0.3px" }}>
          {t.snapshotH2}
        </h2>

        <table
          aria-label="Weekly market snapshot"
          style={{ width: "100%", borderCollapse: "collapse", marginTop: 22, fontSize: 13.5, background: "var(--color-surface)", border: "1px solid var(--color-border-ui)", borderRadius: 12, overflow: "hidden" }}
        >
          <thead>
            <tr style={{ background: "var(--color-surface-elevated)", color: "#8b99b8", textAlign: "left" }}>
              <th style={{ padding: "11px 14px", fontWeight: 600 }}>{t.soldCol}</th>
              <th style={{ padding: "11px 14px", fontWeight: 600 }}>{t.listingsCol}</th>
              <th style={{ padding: "11px 14px", fontWeight: 600 }}>{t.freshnessCol}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: "12px 14px", fontFamily: "monospace", color: "#eef1f7", fontWeight: 700 }}>{fmtCount(totalWeekly)}</td>
              <td style={{ padding: "12px 14px", fontFamily: "monospace", color: "#eef1f7", fontWeight: 700 }}>{fmtCount(market.listingsTracked)}</td>
              <td style={{ padding: "12px 14px", color: market.stale ? "#FF9F0A" : "#8b99b8" }}>
                <time dateTime={refreshIso ?? undefined}>{stamp ?? "—"}</time>
                {market.stale ? ` · ${t.lastGood}` : ""}
              </td>
            </tr>
          </tbody>
        </table>

        {stamp && (
          <p style={{ fontSize: 12.5, color: "#5b6b8c", marginTop: 10 }}>
            {market.stale ? t.stampStale : t.stampLive} {stamp} · {market.brandCount} · {fmtCount(totalWeekly)}
          </p>
        )}

        {brands.length === 0 ? (
          <p style={{ marginTop: 28, color: "#8b99b8" }}>{t.empty}</p>
        ) : (
          <>
          <h2 style={{ fontSize: 19, fontWeight: 600, color: "#eef1f7", margin: "30px 0 0", letterSpacing: "-0.3px" }}>
            {t.brandH2}
          </h2>
          <div style={{ marginTop: 18, overflowX: "auto", border: "1px solid var(--color-border-ui)", borderRadius: 12 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, minWidth: 620 }}>
              <thead>
                <tr style={{ background: "var(--color-surface)", color: "#8b99b8", textAlign: "left" }}>
                  <th style={{ padding: "11px 14px", fontWeight: 600 }}>{t.colRank}</th>
                  <th style={{ padding: "11px 14px", fontWeight: 600 }}>{t.colBrand}</th>
                  <th style={{ padding: "11px 14px", fontWeight: 600 }}>{t.colSold}</th>
                  <th style={{ padding: "11px 14px", fontWeight: 600 }}>{t.colAvg}</th>
                  <th style={{ padding: "11px 14px", fontWeight: 600 }}>{t.colCats}</th>
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
          {t.howH2}
        </h2>
        <div style={{ fontSize: 13, color: "#5b6b8c", lineHeight: 1.7 }}>
          {t.howP}
        </div>

        <HubFaq items={faqs} />

        <div style={{ marginTop: 28, padding: "22px 24px", background: "var(--color-surface)", border: "1px solid var(--color-border-2)", borderRadius: 12, textAlign: "center" }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#eef1f7" }}>{t.ctaTitle}</div>
          <p style={{ fontSize: 13.5, color: "#8b99b8", margin: "8px 0 16px" }}>
            {t.ctaP}
          </p>
          <Link href={`${prefix}/tools/vinted-price-checker?src=data-check`} style={{ display: "inline-block", background: "var(--color-buy)", color: "var(--color-on-buy)", fontWeight: 700, fontSize: 14, padding: "11px 22px", borderRadius: 9, textDecoration: "none" }}>
            {t.checkCta}
          </Link>
          <Link href={`${prefix}/pricing?src=data`} style={{ display: "inline-block", marginLeft: 10, color: "#8fa3c4", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
            {t.plansCta}
          </Link>
        </div>

        <div style={{ marginTop: 30 }}>
          <h2 style={{ fontSize: 19, fontWeight: 700, color: "#eef1f7", margin: "0 0 10px" }}>
            {t.catH2}
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

        <div style={{ marginTop: 26, display: "flex", gap: 16, flexWrap: "wrap" }}>
          <Link href={`${prefix}/flip`} style={{ color: "#8fa3c4", fontSize: 13.5, textDecoration: "none" }}>{t.footerFlip}</Link>
          <Link href="/category" style={{ color: "#8fa3c4", fontSize: 13.5, textDecoration: "none" }}>{t.footerCat}</Link>
          <Link href={`${prefix}/tools`} style={{ color: "#8fa3c4", fontSize: 13.5, textDecoration: "none" }}>{t.footerTools}</Link>
          <Link href={`${prefix}/methodology`} style={{ color: "#8fa3c4", fontSize: 13.5, textDecoration: "none" }}>{t.footerMethod}</Link>
          <Link href="/manual" style={{ color: "#8fa3c4", fontSize: 13.5, textDecoration: "none" }}>{t.footerManual}</Link>
          <Link href="/blog" style={{ color: "#8fa3c4", fontSize: 13.5, textDecoration: "none" }}>{t.footerBlog}</Link>
        </div>
      </div>
    </div>
  )
}

export default async function EnglishDataPage() {
  return <DataPage locale="en" />
}
