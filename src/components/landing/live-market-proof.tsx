import Link from "next/link"
import { Lock } from "lucide-react"
import { getMarketNumbers, fmtCount, fmtEur } from "@/lib/market-numbers"
import { FreshnessNotice } from "@/components/ui/freshness-notice"
import { buildSellingThisWeekRows } from "@/lib/market-proof"
import { hoursSince } from "@/lib/snapshot-freshness"
import { BRANDS, catSlug } from "@/lib/seo-categories"

/**
 * Proof band — REAL numbers from the one warehouse.
 *
 * Never falls back to seo-brands.json. A missing live row is an em-dash, not
 * a frozen export. Methodology lives here (below the hero), not in the hero.
 */
export async function LiveMarketProof() {
  const market = await getMarketNumbers()

  const rows = buildSellingThisWeekRows(
    market.brandNames.map((name) => {
      const b = market.get(name)
      return { name, data: b ?? { avg_price_eur: null, categories: [] } }
    }),
    3,
  )

  const total = market.brandNames.reduce((s, name) => {
    const n = market.get(name)?.sold_7d
    return s + (typeof n === "number" ? n : 0)
  }, 0)

  const ageH = hoursSince(market.updatedAt)
  const freshnessLabel = market.stale
    ? "LAST GOOD"
    : ageH == null
      ? (market.stamp ?? "SNAPSHOT")
      : ageH < 1
        ? "UPDATED <1h"
        : `UPDATED ${Math.round(ageH)}h AGO`

  if (rows.length === 0) return null

  return (
    <div style={{ width: "100%", maxWidth: 460, marginInline: "auto" }}>
      <FreshnessNotice stamp={market.stamp} updatedAt={market.updatedAt} stale={market.stale} />
      <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border-ui)", borderRadius: 14, padding: 18, textAlign: "left" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 13 }}>
          <span style={{ fontSize: 11, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>
            Selling on Vinted this week
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10.5, color: market.stale ? "var(--color-watch)" : "var(--color-text-secondary)" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: market.stale ? "var(--color-watch)" : "var(--color-buy)", display: "inline-block" }} />
            {freshnessLabel}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {rows.map((r) => (
            <div key={`${r.brand}-${r.category}`} style={{
              background: "var(--color-surface-elevated)", borderRadius: 9, padding: "11px 13px",
              display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10,
            }}>
              <span style={{ fontSize: 13, color: "var(--color-text-primary)", fontWeight: 600 }}>
                {(() => {
                  const slug = BRANDS.find((b) => b.brand === r.brand)?.slug
                  const name = slug
                    ? <Link href={`/flip/${slug}`} style={{ color: "inherit", textDecoration: "none" }}>{r.brand}</Link>
                    : r.brand
                  const catHref = slug
                    ? `/flip/${slug}/${catSlug(r.category)}`
                    : `/category/${catSlug(r.category)}`
                  return <>
                    {name}{" "}
                    <Link href={catHref} style={{ color: "var(--color-unknown)", fontWeight: 400, textDecoration: "none" }}>
                      {r.category.toLowerCase()}
                    </Link>
                  </>
                })()}
              </span>
              <span style={{ fontSize: 12.5, color: "var(--color-text-body)", whiteSpace: "nowrap" }}>
                <strong style={{ color: "var(--color-buy)" }}>{fmtCount(r.sold)}</strong>
                <span style={{ color: "var(--color-text-muted)" }}>/wk · avg {fmtEur(r.avg)}</span>
              </span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--color-border-ui)", fontSize: 11.5, color: "var(--color-text-muted)", lineHeight: 1.5 }}>
          {total > 0 && (
            <>Watched sold counts across 5 EU markets — {fmtCount(total)} items in the last 7 days.{" "}</>
          )}
          <Link href="/methodology" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>See how we calculate it →</Link>
        </div>
      </div>

      <div style={{ marginTop: 10, background: "#0f1720", border: "1px solid #1c3327", borderRadius: 12, padding: "13px 15px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
          <Lock size={12} style={{ color: "#fbbf24" }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: "#eef1f7" }}>What a plan adds, per model</span>
        </div>
        <p style={{ fontSize: 12, color: "#8b99b8", lineHeight: 1.55, margin: 0 }}>
          The most you can pay and still profit, the price it actually sells at, how fast it
          moves, and which sizes clear first — for the specific item in your hand, not the brand.
        </p>
      </div>
    </div>
  )
}
