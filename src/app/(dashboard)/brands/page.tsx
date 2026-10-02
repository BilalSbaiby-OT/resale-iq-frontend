"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { getBrandRankings } from "@/lib/api"
import { eur } from "@/lib/utils"
import type { BrandRanking } from "@/types"
import { N_ } from "@/lib/ui-translate"
import { useT } from "@/components/i18n/locale-provider"

const SPEED_STYLE: Record<string, React.CSSProperties> = {
  "Very Fast": { color: "#30D158", background: "rgba(48,209,88,.15)", border: "1px solid rgba(48,209,88,.3)" },
  "Fast":      { color: "#30D158", background: "rgba(48,209,88,.15)", border: "1px solid rgba(48,209,88,.3)" },
  "Medium":    { color: "#FF9F0A", background: "rgba(255,159,10,.15)", border: "1px solid rgba(255,159,10,.3)" },
  "Slow":      { color: "#8E8E93", background: "rgba(142,142,147,.12)", border: "1px solid rgba(142,142,147,.25)" },
}

// API enum labels → translated on the frontend (the backend sends English words).
const API_LABEL: Record<string, string> = {
  "Very Fast": N_("Very Fast"), Fast: N_("Fast"), Medium: N_("Medium"), Slow: N_("Slow"), High: N_("High"), Low: N_("Low"),
}

function profitStyle(label: string): React.CSSProperties {
  if (label === "High")   return SPEED_STYLE["Very Fast"]
  if (label === "Medium") return SPEED_STYLE["Medium"]
  return SPEED_STYLE["Slow"]
}

const TH: React.CSSProperties = {
  fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase",
  color: "var(--color-graphite-muted)", padding: "10px 12px", textAlign: "left",
  background: "var(--color-graphite-elevated)", borderBottom: "1px solid var(--color-hairline)",
  whiteSpace: "nowrap", cursor: "pointer", userSelect: "none",
}
const TD: React.CSSProperties = {
  fontSize: 13, padding: "10px 12px", color: "var(--color-on-graphite)",
  borderBottom: "1px solid var(--color-hairline)", whiteSpace: "nowrap", verticalAlign: "middle",
}

export default function BrandsPage() {
  const tx = useT()
  const [brands, setBrands] = useState<BrandRanking[]>([])
  const [loading, setLoading] = useState(true)
  // An auth/network failure is NOT "no brands exist". The old catch swallowed
  // the error and left brands=[], so a 401 rendered as "0 brands tracked" over
  // an empty void — indistinguishable from a broken server, while the database
  // actually holds ranked brands. Track the failure so the UI can say which it is.
  // No count is printed on the locked states: a client component has no live
  // source for the tracked total, so a typed number would drift.
  const [loadError, setLoadError] = useState<"auth" | "network" | null>(null)
  const [sort, setSort] = useState<keyof BrandRanking>("sold_7d")
  const [dir, setDir] = useState(-1)

  useEffect(() => {
    getBrandRankings(30)
      .then(d => { setBrands(d.brands); setLoading(false) })
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : String(e)
        setLoadError(/401|403|auth/i.test(msg) ? "auth" : "network")
        setLoading(false)
      })
  }, [])

  const sorted = [...brands].sort((a, b) => {
    const av = a[sort] as number ?? 0, bv = b[sort] as number ?? 0
    return (av - bv) * dir
  })

  const toggleSort = (col: keyof BrandRanking) => { if (sort === col) setDir(d => d * -1); else { setSort(col); setDir(-1) } }

  const HEADERS: [string, keyof BrandRanking | ""][] = [
    ["#", "rank"], [tx("Brand"), "brand"], [tx("Avg Price"), "avg_price_eur"],
    [tx("7d Left shelf"), "sold_7d"], [tx("Sell Speed"), "speed_score"],
    [tx("Profit"), "profit_label"], [tx("Score"), "demand_score"], [tx("Categories"), ""],
  ]

  return (
    <AppShell title={tx("Brand Rankings")} subtitle={loadError ? tx("Brands we track — unlock to see the ranking") : tx(`{0} brands ranked — click any to scan deals`, [brands.length])}>
      <div style={{ background: "var(--color-graphite-elevated)", border: "1px solid var(--color-hairline)", borderRadius: 14, overflow: "hidden" }}>
        <div className="riq-scroll-x">
          <table style={{ width: "100%", minWidth: 620, borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {HEADERS.map(([h, col]) => (
                  <th key={h} onClick={() => col && toggleSort(col as keyof BrandRanking)}
                    style={{
                      ...TH,
                      color: sort === col ? "var(--color-buy)" : "var(--color-graphite-muted)",
                      cursor: col ? "pointer" : "default",
                    }}>
                    {h}{sort === col ? (dir === -1 ? " ↓" : " ↑") : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ ...TD, textAlign: "center", padding: "48px 12px" }}>{tx("Loading brand rankings…")}</td></tr>
              ) : loadError ? (
                <tr><td colSpan={8} style={{ padding: "32px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 17, fontWeight: 600, color: "var(--color-on-graphite)", marginBottom: 8 }}>
                    {loadError === "auth" ? tx("Brand rankings are part of a paid plan") : tx("Couldn't load brand rankings")}
                  </div>
                  <div style={{ fontSize: 14, color: "var(--color-graphite-muted)", marginBottom: 20, maxWidth: 420, margin: "0 auto 20px" }}>
                    {loadError === "auth"
                      ? tx("We track brands across Vinted ES, FR, DE, IT and PT — ranked by what actually left the shelf this week. Starter unlocks the full table.")
                      : tx("This is a connection problem on our side, not an empty dataset. Try again in a moment.")}
                  </div>
                  {loadError === "auth"
                    ? <Link href="/pricing" style={{ display: "inline-flex", alignItems: "center", background: "var(--color-buy)", color: "#06090c", borderRadius: 12, padding: "10px 20px", fontSize: 15, fontWeight: 700, textDecoration: "none" }}>{tx("Unlock the brand ranking →")}</Link>
                    : <button onClick={() => window.location.reload()} style={{ background: "transparent", border: "1px solid var(--color-hairline)", color: "var(--color-on-graphite)", borderRadius: 12, padding: "10px 20px", fontSize: 15, cursor: "pointer" }}>{tx("Retry")}</button>}
                </td></tr>
              ) : sorted.length === 0 ? (
                <tr><td colSpan={8} style={{ ...TD, textAlign: "center", padding: "48px 12px" }}>{tx("No brand rankings yet — the weekly ranking rebuilds as departures are observed.")}</td></tr>
              ) : sorted.map((b) => (
                <tr key={b.brand}
                  style={{ background: "transparent", transition: "background var(--motion-fast)", cursor: "pointer" }}
                  onClick={() => window.location.href = `/deals?brand=${encodeURIComponent(b.brand)}`}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,.025)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <td style={{ ...TD, color: "var(--color-graphite-muted)", fontVariantNumeric: "tabular-nums" }}>#{b.rank}</td>
                  <td style={{ ...TD, fontWeight: 600 }}>{b.brand}</td>
                  <td style={{ ...TD, fontVariantNumeric: "tabular-nums" }}>{eur(b.avg_price_eur)}</td>
                  <td style={{ ...TD, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{typeof b.sold_7d === "number" && Number.isFinite(b.sold_7d) ? b.sold_7d.toLocaleString(tx.locale) : "—"}</td>
                  <td style={TD}>
                    <span style={{ ...SPEED_STYLE[b.speed_label] ?? {}, fontSize: 12, fontWeight: 700, padding: "2px 8px", borderRadius: 6, display: "inline-block", fontVariantNumeric: "tabular-nums" }}>
                      {tx(API_LABEL[b.speed_label] ?? b.speed_label)}
                    </span>
                  </td>
                  <td style={TD}>
                    <span style={{ ...profitStyle(b.profit_label), fontSize: 12, fontWeight: 700, padding: "2px 8px", borderRadius: 6, display: "inline-block" }}>
                      {tx(API_LABEL[b.profit_label] ?? b.profit_label)}
                    </span>
                  </td>
                  <td style={{ ...TD, fontVariantNumeric: "tabular-nums" }}>{b.demand_score?.toFixed(0) ?? "—"}</td>
                  <td style={{ ...TD, color: "var(--color-graphite-muted)", fontSize: 12 }}>{b.categories?.slice(0, 3).join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  )
}
