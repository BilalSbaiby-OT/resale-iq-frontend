import { copy } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"
import type { MarketNumbers } from "@/lib/market-numbers"
import Link from "next/link"
import { canonicalPath } from "@/lib/locale-routes"

/**
 * LIVE MARKET PULSE — the honest-proof section that fills the empty landing.
 *
 * Why this exists: the 30-day funnel showed a stark drop (395 visitors -> 15
 * checks -> 7 signups) and the page was hero + pricing + footer with nothing
 * between. A stranger had no reason to believe the tool. This section surfaces
 * the REAL market snapshot the page already loads (getMarketNumbers, passed in
 * as the `market` prop) and used to throw away with `void market`. Every number
 * here is live, from /api/public/market-snapshot, stamped with the snapshot's
 * own time — never fabricated (hard ResaleIQ rule). If the data is stale/missing
 * the section degrades honestly (renders nothing rather than a fake).
 *
 * Design: data-dense list (NOT cardified per failure-patterns), hairline
 * dividers, one accent, monospace figures, sold_7d as a proportional bar so
 * the eye reads relative velocity. This is the "one signature visual moment"
 * the landing lacked.
 */
export function LiveMarketPulse({ locale, market }: { locale: Locale; market: MarketNumbers }) {
  const t = copy[locale].marketPulse

  // Top movers by watched departures (sold_7d). Honest: only brands the
  // snapshot actually gives a finite sold count for; never a stand-in.
  const rows = market.brandNames
    .map((name) => ({ name, f: market.get(name) }))
    .filter((r): r is { name: string; f: NonNullable<ReturnType<typeof market.get>> & { sold_7d: number } } =>
      r.f != null && typeof r.f.sold_7d === "number" && r.f.sold_7d > 0)
    .sort((a, b) => b.f.sold_7d - a.f.sold_7d)
    .slice(0, 8)

  // No live rows -> render nothing. An empty section beats a fabricated one.
  if (rows.length === 0) return null

  const max = rows[0].f.sold_7d
  const listings = market.listingsTracked
  const listingRecords = market.totalListingRecords
  const brands = market.brandsTracked ?? market.brandCount

  return (
    <section
      style={{
        maxWidth: "var(--width-marketing)",
        margin: "0 auto",
        padding: "var(--space-6) var(--space-3) var(--space-8)",
      }}
    >
      {/* Section head: a real number leads, not a templated eyebrow. */}
      <div style={{ maxWidth: "var(--measure-body)", marginBottom: "var(--space-6)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "var(--space-2)" }}>
          <span style={{ position: "relative", display: "inline-flex", width: 8, height: 8 }}>
            <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "var(--color-green)", opacity: 0.35 }} className="riq-pulse-ring" />
            <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "var(--color-green)" }} />
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text-muted)", fontFamily: "var(--font-mono, ui-monospace, monospace)" }}>
            {t.liveLabel}
          </span>
        </div>
        <h2 style={{ fontSize: "var(--text-title)", fontWeight: 600, letterSpacing: "-0.02em", color: "var(--color-text-primary)", margin: "0 0 var(--space-2)", textWrap: "balance" }}>
          {t.heading}
        </h2>
        {/* Lead with the listing-records figure (larger, honestly labelled).
            The distinct-item count is shown as the stated basis so we
            volunteer the narrower number — a reseller cannot catch us
            exaggerating when we name both. */}
        <p style={{ fontSize: "var(--text-body-marketing)", color: "var(--color-text-dim)", margin: 0, lineHeight: 1.5 }}>
          {listingRecords != null
            ? t.sub(
                listingRecords.toLocaleString(locale === "en" ? "en-US" : locale),
                brands,
                listings != null ? listings.toLocaleString(locale === "en" ? "en-US" : locale) : null,
              )
            : listings != null
              ? t.subFallback(listings.toLocaleString(locale === "en" ? "en-US" : locale), brands)
              : t.subNoCount(brands)}
        </p>
      </div>

      {/* Data-dense list: hairline rows, proportional velocity bar, mono figures. */}
      <div style={{ borderTop: "1px solid var(--color-hairline)" }}>
        {/* Column header */}
        <div className="riq-pulse-grid" style={{ padding: "10px var(--space-2)", borderBottom: "1px solid var(--color-hairline)" }}>
          <span style={hdr}>{t.colBrand}</span>
          <span className="riq-pulse-velocity" style={hdr}>{t.colVelocity}</span>
          <span style={{ ...hdr, textAlign: "right" }}>{t.colSold}</span>
          <span style={{ ...hdr, textAlign: "right" }}>{t.colAvg}</span>
        </div>
        {rows.map((r) => {
          const sold = r.f.sold_7d
          const avg = r.f.avg_price_eur
          const pct = Math.max(6, Math.round((sold / max) * 100))
          return (
            <div
              key={r.name}
              className="riq-pulse-grid"
              style={{ alignItems: "center", padding: "13px var(--space-2)", borderBottom: "1px solid var(--color-hairline)" }}
            >
              <span style={{ fontSize: 14.5, fontWeight: 500, color: "var(--color-text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.name}</span>
              <span className="riq-pulse-velocity" style={{ display: "block", height: 8, background: "var(--color-bg-3)", borderRadius: 999, overflow: "hidden" }}>
                <span style={{ display: "block", height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, var(--color-green), var(--color-cyan))", borderRadius: 999 }} />
              </span>
              <span style={{ fontSize: 14, fontVariantNumeric: "tabular-nums", textAlign: "right", color: "var(--color-text-secondary)", fontFamily: "var(--font-mono, ui-monospace, monospace)" }}>{sold.toLocaleString()}</span>
              <span style={{ fontSize: 14, fontVariantNumeric: "tabular-nums", textAlign: "right", color: "var(--color-text-secondary)", fontFamily: "var(--font-mono, ui-monospace, monospace)" }}>{avg != null ? `€${avg}` : "—"}</span>
            </div>
          )
        })}
      </div>

      <p
        data-testid="riq-market-showing"
        style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: "var(--space-3)", lineHeight: 1.5 }}
      >
        {t.showing(rows.length, brands)}
        {" · "}
        <Link href={canonicalPath(locale, "/data")} style={{ color: "var(--color-text-muted)", textDecoration: "underline" }}>
          {t.seeAll}
        </Link>
      </p>
      <p style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: "var(--space-2)", lineHeight: 1.5 }}>
        {market.stamp ? t.stamp(market.stamp) : t.stampNoTime}{market.stale ? ` · ${t.staleNote}` : ""}
      </p>
    </section>
  )
}

const hdr: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "var(--color-text-muted)",
}
