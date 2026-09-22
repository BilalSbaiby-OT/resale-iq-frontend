"use client"
import { useEffect, useState } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { KpiCard } from "@/components/ui/kpi-card"
import { MomentumBadge } from "@/components/ui/momentum-badge"
import { SkeletonRows } from "@/components/ui/skeleton"
import { getMarketSignals, type MarketSignal } from "@/lib/api"
import { eur } from "@/lib/utils"
import Link from "next/link"

/**
 * MARKET SIGNALS — brand × category demand board (demand_index).
 *
 * Rebuilt 2026-09-23 to match the product's design language. The previous
 * version used hardcoded hex values (#141820, #8b99b8, font-mono Tailwind
 * strings) from an older visual pass — creating a jarring discontinuity
 * when navigating from the polished dashboard. Now uses the same CSS tokens,
 * card radius, and typography scale as deals/page.tsx and dashboard-content.tsx.
 *
 * The table is kept (not cards) because a 20-row signal board is scanned, not
 * read sequentially — the column structure carries more information per pixel
 * than stacked cards would. But the chrome around it is aligned with the rest
 * of the product.
 */

const SIGNAL_COLOR: Record<string, string> = {
  "STRONG BUY": "var(--color-buy)",
  "BUY": "#38bdf8",
  "MONITOR": "var(--color-watch)",
  "HOLD": "var(--color-graphite-muted)",
}
const SIGNAL_BG: Record<string, string> = {
  "STRONG BUY": "rgba(34,197,94,.12)",
  "BUY": "rgba(56,189,248,.10)",
  "MONITOR": "rgba(245,158,11,.10)",
  "HOLD": "rgba(139,153,184,.08)",
}

function TrendArrow({ dir }: { dir: string | null }) {
  if (dir === "rising") return <span style={{ color: "var(--color-buy)" }}>▲</span>
  if (dir === "falling") return <span style={{ color: "#f87171" }}>▼</span>
  return <span style={{ color: "var(--color-graphite-muted)" }}>—</span>
}

function SignalChip({ signal }: { signal: string }) {
  const color = SIGNAL_COLOR[signal] ?? "var(--color-graphite-muted)"
  const bg = SIGNAL_BG[signal] ?? "rgba(139,153,184,.08)"
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      background: bg, border: `1px solid ${color}40`,
      color, fontWeight: 700, fontSize: 11, letterSpacing: "0.05em",
      borderRadius: 6, padding: "2px 8px", whiteSpace: "nowrap",
    }}>
      {signal}
    </span>
  )
}

const TH: React.CSSProperties = {
  fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
  color: "var(--color-graphite-muted)", padding: "10px 12px", textAlign: "left",
  background: "var(--color-graphite-elevated)", borderBottom: "1px solid var(--color-hairline)",
  whiteSpace: "nowrap", cursor: "pointer", userSelect: "none",
}
const TD: React.CSSProperties = {
  fontSize: 13, padding: "12px 12px", color: "var(--color-on-graphite)",
  borderBottom: "1px solid var(--color-hairline)", whiteSpace: "nowrap", verticalAlign: "middle",
}

export default function MarketPage() {
  const [rows, setRows] = useState<MarketSignal[]>([])
  const [totals, setTotals] = useState({ strong: 0, buy: 0 })
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<"auth" | "network" | null>(null)
  const [sort, setSort] = useState<keyof MarketSignal>("investment_score")
  const [dir, setDir] = useState(-1)

  useEffect(() => {
    getMarketSignals()
      .then(d => {
        setRows([...d.strong_buy, ...d.buy])
        setTotals({ strong: d.total_strong_buy, buy: d.total_buy })
        setLoading(false)
      })
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : String(e)
        setLoadError(/401|403|auth/i.test(msg) ? "auth" : "network")
        setLoading(false)
      })
  }, [])

  const sorted = [...rows].sort((a, b) => {
    const av = (a[sort] as number) ?? 0, bv = (b[sort] as number) ?? 0
    if (typeof av === "string" || typeof bv === "string")
      return String(av).localeCompare(String(bv)) * dir
    return ((av as number) - (bv as number)) * dir
  })
  const toggleSort = (col: keyof MarketSignal) => {
    if (sort === col) setDir(d => d * -1)
    else { setSort(col); setDir(-1) }
  }

  const HEADERS: [string, keyof MarketSignal | ""][] = [
    ["Brand", "brand"], ["Category", "category"], ["Signal", "signal"],
    ["Score", "investment_score"], ["7d Left shelf", "units_sold_all_7d"],
    ["Demand", "overall_demand_score"], ["Speed", "overall_speed_score"],
    ["Sell For", "recommended_list_price"], ["Trend", "trend_direction"],
  ]

  return (
    <AppShell
      title="Market Signals"
      subtitle="Brand × category demand — where to point your sourcing this week"
    >
      {/* KPI strip — same card as the rest of the product */}
      <div className="riq-grid-3" style={{ marginBottom: 24 }}>
        <KpiCard label="Strong buy" value={totals.strong} sublabel="High-conviction combos" accent="var(--color-buy)" />
        <KpiCard label="Buy" value={totals.buy} sublabel="Worth sourcing now" accent="#38bdf8" />
        <KpiCard label="Showing" value={rows.length} sublabel="Top signals by investment score" />
      </div>

      <p style={{ fontSize: 13, color: "var(--color-graphite-muted)", marginBottom: 16, lineHeight: 1.6, maxWidth: "70ch" }}>
        Each row is a brand + category scored by demand velocity × liquidity × momentum.
        Use it to decide <em>what kind</em> of stock to hunt for — then jump to the{" "}
        <Link href="/deals" style={{ color: "var(--color-buy)", textDecoration: "none" }}>Deal Scanner</Link>{" "}
        for the exact models.
      </p>

      {loading ? (
        <SkeletonRows rows={8} height={44} />
      ) : loadError ? (
        <div style={{
          background: "var(--color-graphite-elevated)", border: "1px solid var(--color-hairline)",
          borderRadius: 14, padding: 32, textAlign: "center",
        }}>
          <div style={{ fontSize: 17, fontWeight: 600, color: "var(--color-on-graphite)", marginBottom: 8 }}>
            {loadError === "auth" ? "Market signals are part of a paid plan" : "Couldn't load market signals"}
          </div>
          <div style={{ fontSize: 14, color: "var(--color-graphite-muted)", marginBottom: 20, maxWidth: 420, margin: "0 auto 20px" }}>
            {loadError === "auth"
              ? "We score every brand × category combination tracked across EU5 Vinted — ranked by investment potential. Starter unlocks the full board."
              : "This is a connection problem on our side. Try again in a moment."}
          </div>
          {loadError === "auth"
            ? <Link href="/pricing" style={{ display: "inline-flex", alignItems: "center", background: "var(--color-buy)", color: "#06090c", borderRadius: 12, padding: "10px 20px", fontSize: 15, fontWeight: 700, textDecoration: "none" }}>Unlock market signals →</Link>
            : <button onClick={() => window.location.reload()} style={{ background: "transparent", border: "1px solid var(--color-hairline)", color: "var(--color-on-graphite)", borderRadius: 12, padding: "10px 20px", fontSize: 15, cursor: "pointer" }}>Retry</button>}
        </div>
      ) : rows.length === 0 ? (
        <div style={{ padding: "80px 0", textAlign: "center", fontSize: 15, color: "var(--color-graphite-muted)" }}>
          No signals yet — the analyzer refreshes roughly every 2 hours.
        </div>
      ) : (
        <div style={{ background: "var(--color-graphite-elevated)", border: "1px solid var(--color-hairline)", borderRadius: 14, overflow: "hidden" }}>
          <div className="riq-scroll-x">
            <table style={{ width: "100%", minWidth: 720, borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {HEADERS.map(([h, col]) => (
                    <th
                      key={h}
                      onClick={() => col && toggleSort(col as keyof MarketSignal)}
                      style={{
                        ...TH,
                        color: sort === col ? "var(--color-buy)" : "var(--color-graphite-muted)",
                      }}
                    >
                      {h}{sort === col ? (dir === -1 ? " ↓" : " ↑") : ""}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((r, i) => (
                  <tr
                    key={`${r.brand}-${r.category}-${i}`}
                    style={{ background: "transparent", transition: "background var(--motion-fast)" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,.025)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ ...TD, fontWeight: 600 }}>
                      <Link
                        href={`/deals?brand=${encodeURIComponent(r.brand)}`}
                        style={{ textDecoration: "none", color: "var(--color-on-graphite)" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "var(--color-buy)")}
                        onMouseLeave={e => (e.currentTarget.style.color = "var(--color-on-graphite)")}
                      >
                        {r.brand}
                      </Link>
                    </td>
                    <td style={{ ...TD, color: "var(--color-graphite-muted)" }}>{r.category}</td>
                    <td style={TD}><SignalChip signal={r.signal} /></td>
                    <td style={{ ...TD, fontWeight: 700, color: "var(--color-buy)", fontVariantNumeric: "tabular-nums" }}>
                      {r.investment_score != null ? Math.round(r.investment_score) : "—"}
                    </td>
                    <td style={{ ...TD, fontVariantNumeric: "tabular-nums" }}>
                      {r.units_sold_all_7d != null ? r.units_sold_all_7d.toLocaleString("en-GB") : "—"}
                    </td>
                    <td style={{ ...TD, color: "var(--color-graphite-muted)", fontVariantNumeric: "tabular-nums" }}>
                      {r.overall_demand_score != null ? Math.round(r.overall_demand_score) : "—"}
                    </td>
                    <td style={{ ...TD, color: "var(--color-graphite-muted)", fontVariantNumeric: "tabular-nums" }}>
                      {r.overall_speed_score != null ? Math.round(r.overall_speed_score) : "—"}
                    </td>
                    <td style={{ ...TD, fontVariantNumeric: "tabular-nums" }}>
                      {r.recommended_list_price ? eur(r.recommended_list_price) : "—"}
                    </td>
                    <td style={{ ...TD, textAlign: "center" }}>
                      <TrendArrow dir={r.trend_direction} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AppShell>
  )
}
