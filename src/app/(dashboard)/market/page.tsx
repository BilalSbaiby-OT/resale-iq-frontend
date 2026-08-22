"use client"
import { useEffect, useState } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { getMarketSignals, type MarketSignal } from "@/lib/api"
import { eur } from "@/lib/utils"
import Link from "next/link"

const SIGNAL_STYLE: Record<string, string> = {
  "STRONG BUY": "text-emerald-400 bg-emerald-500/12 border-emerald-500/40",
  "BUY": "text-sky-400 bg-sky-500/10 border-sky-500/30",
  "MONITOR": "text-amber-400 bg-amber-500/10 border-amber-500/30",
  "HOLD": "text-[#8b99b8] bg-[#8b99b8]/8 border-[#8b99b8]/25",
}

function TrendArrow({ dir }: { dir: string | null }) {
  if (dir === "rising") return <span className="text-emerald-400">▲</span>
  if (dir === "falling") return <span className="text-red-400">▼</span>
  return <span className="text-[#546380]">—</span>
}

export default function MarketPage() {
  const [rows, setRows] = useState<MarketSignal[]>([])
  const [totals, setTotals] = useState({ strong: 0, buy: 0 })
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState<keyof MarketSignal>("investment_score")
  const [dir, setDir] = useState(-1)

  useEffect(() => {
    getMarketSignals()
      .then(d => {
        setRows([...d.strong_buy, ...d.buy])
        setTotals({ strong: d.total_strong_buy, buy: d.total_buy })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const sorted = [...rows].sort((a, b) => {
    const av = (a[sort] as number) ?? 0, bv = (b[sort] as number) ?? 0
    if (typeof av === "string" || typeof bv === "string")
      return String(av).localeCompare(String(bv)) * dir
    return (av - bv) * dir
  })
  const toggleSort = (col: keyof MarketSignal) => {
    if (sort === col) setDir(d => d * -1)
    else { setSort(col); setDir(-1) }
  }

  const HEADERS: [string, keyof MarketSignal | ""][] = [
    ["Brand", "brand"], ["Category", "category"], ["Signal", "signal"],
    ["Score", "investment_score"], ["7d Sold", "units_sold_all_7d"],
    ["Demand", "overall_demand_score"], ["Speed", "overall_speed_score"],
    ["Sell For", "recommended_list_price"], ["Trend", "trend_direction"],
  ]

  return (
    <AppShell
      title="Market Signals"
      subtitle="Brand × category demand — where to point your sourcing this week"
    >
      {/* Summary strip */}
      <div className="riq-grid-3" style={{ marginBottom: 16 }}>
        {[
          ["STRONG BUY", totals.strong, "#22c55e", "high-conviction combos"],
          ["BUY", totals.buy, "#38bdf8", "worth sourcing now"],
          ["SHOWING", rows.length, "#e8ecf4", "top signals by investment score"],
        ].map(([l, v, c, sub]) => (
          <div key={l as string} style={{ background: "#141820", border: "1px solid #1e2535", borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: 1.5, color: "#546380" }}>{l}</div>
            <div style={{ fontFamily: "monospace", fontSize: 26, fontWeight: 800, color: c as string, marginTop: 4 }}>{v as number}</div>
            <div style={{ fontSize: 10, color: "#546380", marginTop: 2 }}>{sub}</div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 12.5, color: "#8b99b8", marginBottom: 12, lineHeight: 1.6 }}>
        Each row is a brand + category the market is moving on, scored by investment potential
        (demand velocity × liquidity × momentum). Use it to decide <em>what kind</em> of stock to
        hunt for — then jump to the <Link href="/deals" style={{ color: "#22c55e", textDecoration: "none" }}>Deal Scanner</Link> for the exact models.
      </p>

      {loading ? (
        <div style={{ color: "#546380", fontSize: 13, padding: 40, textAlign: "center" }}>Loading market signals…</div>
      ) : rows.length === 0 ? (
        <div style={{ color: "#546380", fontSize: 13, padding: 40, textAlign: "center" }}>No signals available yet — the analyzer refreshes hourly.</div>
      ) : (
        <div className="bg-[#141820] border border-[#1e2535] rounded-xl overflow-hidden">
          <div className="riq-scroll-x"><table className="w-full" style={{ minWidth: 720 }}>
            <thead>
              <tr>
                {HEADERS.map(([h, col]) => (
                  <th key={h} onClick={() => col && toggleSort(col)}
                    className={`text-[9px] font-mono text-[#546380] uppercase tracking-[1.5px] px-3 py-2.5 text-left bg-[#1a2030] border-b border-[#1e2535] ${col ? "cursor-pointer hover:text-[#e8ecf4]" : ""} ${sort === col ? "text-emerald-400" : ""}`}>
                    {h}{sort === col ? (dir === -1 ? " ↓" : " ↑") : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((r, i) => (
                <tr key={`${r.brand}-${r.category}-${i}`} className="border-b border-[#161c28] hover:bg-[#171d28]">
                  <td className="px-3 py-2.5 text-[13px] font-semibold text-[#e8ecf4] whitespace-nowrap">
                    <Link href={`/flip/${encodeURIComponent(r.brand.toLowerCase())}`} className="hover:text-emerald-400" style={{ textDecoration: "none", color: "inherit" }}>{r.brand}</Link>
                  </td>
                  <td className="px-3 py-2.5 text-[12.5px] text-[#c3cde0] whitespace-nowrap">{r.category}</td>
                  <td className="px-3 py-2.5">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border whitespace-nowrap ${SIGNAL_STYLE[r.signal] ?? SIGNAL_STYLE.HOLD}`}>{r.signal}</span>
                  </td>
                  <td className="px-3 py-2.5 text-[13px] font-mono font-bold text-emerald-400 tabular-nums">{r.investment_score != null ? Math.round(r.investment_score) : "—"}</td>
                  <td className="px-3 py-2.5 text-[12.5px] font-mono text-[#c3cde0] tabular-nums">{r.units_sold_all_7d != null ? r.units_sold_all_7d.toLocaleString() : "—"}</td>
                  <td className="px-3 py-2.5 text-[12.5px] font-mono text-[#8b99b8] tabular-nums">{r.overall_demand_score != null ? Math.round(r.overall_demand_score) : "—"}</td>
                  <td className="px-3 py-2.5 text-[12.5px] font-mono text-[#8b99b8] tabular-nums">{r.overall_speed_score != null ? Math.round(r.overall_speed_score) : "—"}</td>
                  <td className="px-3 py-2.5 text-[12.5px] font-mono text-[#c3cde0] tabular-nums">{r.recommended_list_price ? eur(r.recommended_list_price) : "—"}</td>
                  <td className="px-3 py-2.5 text-[12.5px] text-center"><TrendArrow dir={r.trend_direction} /></td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      )}
    </AppShell>
  )
}
