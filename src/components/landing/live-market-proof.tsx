import Link from "next/link"
import { Lock } from "lucide-react"
import { getMarketNumbers, fmtCount, fmtEur } from "@/lib/market-numbers"
import { FreshnessNotice } from "@/components/ui/freshness-notice"

/**
 * Proof band — REAL numbers from the one warehouse.
 *
 * Never falls back to seo-brands.json. A missing live row is an em-dash, not
 * a frozen export. Methodology lives here (below the hero), not in the hero.
 */
export async function LiveMarketProof() {
  const market = await getMarketNumbers()

  const rows = market.brandNames
    .map((name) => {
      const b = market.get(name)
      if (!b) return null
      const top = b.categories[0]
      if (!top || top.sold_7d == null) return null
      return { brand: name, category: top.category, sold: top.sold_7d, avg: b.avg_price_eur }
    })
    .filter((x): x is { brand: string; category: string; sold: number; avg: number | null } => !!x)
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 3)

  const total = market.brandNames.reduce((s, name) => {
    const n = market.get(name)?.sold_7d
    return s + (typeof n === "number" ? n : 0)
  }, 0)

  if (rows.length === 0) return null

  return (
    <div style={{ width: "100%", maxWidth: 460, marginInline: "auto" }}>
      <FreshnessNotice stamp={market.stamp} updatedAt={market.updatedAt} stale={market.stale} />
      <div style={{ background: "#12151d", border: "1px solid #1c2333", borderRadius: 14, padding: 18, textAlign: "left" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 13 }}>
          <span style={{ fontSize: 11, color: "#5b6b8c", textTransform: "uppercase", letterSpacing: "1px" }}>
            Selling on Vinted this week
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10.5, color: market.stale ? "#fbbf24" : "#22c55e" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: market.stale ? "#fbbf24" : "#22c55e", display: "inline-block" }} />
            {market.stale ? "LAST GOOD" : "LIVE"}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {rows.map((r) => (
            <div key={`${r.brand}-${r.category}`} style={{
              background: "#1a2030", borderRadius: 9, padding: "11px 13px",
              display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10,
            }}>
              <span style={{ fontSize: 13, color: "#eef1f7", fontWeight: 600 }}>
                {r.brand} <span style={{ color: "#8b99b8", fontWeight: 400 }}>{r.category.toLowerCase()}</span>
              </span>
              <span style={{ fontSize: 12.5, color: "#c3cde0", whiteSpace: "nowrap" }}>
                <strong style={{ color: "#22c55e" }}>{fmtCount(r.sold)}</strong>
                <span style={{ color: "#5b6b8c" }}>/wk · avg {fmtEur(r.avg)}</span>
              </span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #1c2333", fontSize: 11.5, color: "#5b6b8c", lineHeight: 1.5 }}>
          {total > 0 && (
            <>Watched sold counts across 5 EU markets — {fmtCount(total)} items in the last 7 days.{" "}</>
          )}
          <Link href="/methodology" style={{ color: "#8fa3c4", textDecoration: "none" }}>See how we calculate it →</Link>
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
