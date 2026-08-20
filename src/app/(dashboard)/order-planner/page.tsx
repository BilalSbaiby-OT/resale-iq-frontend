"use client"
import { useEffect, useState, useCallback } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { getToken } from "@/lib/utils"
import { AlertTriangle } from "lucide-react"

interface PlanItem {
  brand: string; model: string; category: string; top_sizes: string[]
  forecast_weekly_demand: number; current_weekly_demand: number
  trend: "GROWING" | "HOLDING" | "COOLING" | "FADING" | "UNKNOWN"
  week1_sell_probability: number; fast_sale_price: number | null
  target_unit_cost: number; unit_profit: number | null
  order_score: number; suggested_units: number
}
interface Plan {
  horizon_weeks: number; budget_eur: number | null; allocated_eur: number
  expected_week1_profit: number; items: PlanItem[]; disclaimer: string
  provisional?: boolean
}

const TREND_STYLE: Record<string, { color: string; icon: string }> = {
  GROWING: { color: "#22c55e", icon: "▲" },
  HOLDING: { color: "#3b82f6", icon: "■" },
  COOLING: { color: "#f59e0b", icon: "▼" },
  FADING: { color: "#ef4444", icon: "▼" },
  UNKNOWN: { color: "#546380", icon: "?" },
}

function scoreColor(s: number) {
  if (s >= 85) return "#22c55e"
  if (s >= 70) return "#06b6d4"
  if (s >= 50) return "#f59e0b"
  return "#ef4444"
}

export default function OrderPlannerPage() {
  const [budget, setBudget] = useState("150")
  const [weeks, setWeeks] = useState(3)
  const [plan, setPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const q = new URLSearchParams({ weeks: String(weeks), top_n: "12" })
      const b = parseFloat(budget)
      if (b > 0) q.set("budget", String(b))
      const res = await fetch(`/api/order-plan?${q}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (res.ok) setPlan(await res.json())
    } finally { setLoading(false) }
  }, [budget, weeks])

  useEffect(() => { load() }, []) // initial load

  return (
    <AppShell title="Order Planner" subtitle={`What to order today for stock arriving in ~${weeks} weeks`}>
      {/* Controls */}
      <div style={{ display: "flex", gap: 12, alignItems: "flex-end", background: "#141820", border: "1px solid #1e2535", borderRadius: 12, padding: 16, marginBottom: 16, flexWrap: "wrap" }}>
        <div>
          <label style={{ fontSize: 10, color: "#546380", display: "block", marginBottom: 6, letterSpacing: 1 }}>ORDER BUDGET (€)</label>
          <input value={budget} onChange={e => setBudget(e.target.value)} type="number" min="0"
            style={{ background: "#1a2030", border: "1px solid #263147", borderRadius: 8, padding: "9px 12px", fontFamily: "monospace", fontSize: 14, color: "#e8ecf4", width: 130, outline: "none" }} />
        </div>
        <div>
          <label style={{ fontSize: 10, color: "#546380", display: "block", marginBottom: 6, letterSpacing: 1 }}>ARRIVES IN</label>
          <div style={{ display: "flex", gap: 6 }}>
            {[2, 3, 4].map(w => (
              <button key={w} onClick={() => setWeeks(w)} style={{
                padding: "9px 14px", borderRadius: 8, fontFamily: "monospace", fontSize: 12, fontWeight: 700, cursor: "pointer",
                background: weeks === w ? "rgba(34,197,94,.12)" : "#1a2030",
                border: `1px solid ${weeks === w ? "#22c55e" : "#263147"}`,
                color: weeks === w ? "#22c55e" : "#8fa3c4",
              }}>{w} wks</button>
            ))}
          </div>
        </div>
        <button onClick={load} disabled={loading} style={{
          padding: "10px 22px", borderRadius: 8, fontSize: 13, fontWeight: 600,
          background: "#22c55e", color: "#0B0D10", border: "none", cursor: "pointer", opacity: loading ? 0.6 : 1,
        }}>{loading ? "Forecasting…" : "Build order plan"}</button>
      </div>

      {/* Hero stats */}
      {plan?.provisional && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(251,191,36,.07)", border: "1px solid rgba(251,191,36,.3)", borderRadius: 10, padding: "10px 14px", marginBottom: 14 }}>
          <span style={{ fontSize: 13, color: "#fbbf24", fontWeight: 700 }}>Provisional</span>
          <span style={{ fontSize: 12.5, color: "#c3cde0", lineHeight: 1.5 }}>
            Sell-through is still being measured, so week-1 sell probabilities use a conservative estimate. Cost, demand and margin are live — treat P(sell) as a floor until sold-date history matures.
          </span>
        </div>
      )}
      {plan && (
        <div className="riq-grid-3" style={{ marginBottom: 16 }}>
          {[
            ["BUDGET ALLOCATED", `€${plan.allocated_eur.toFixed(0)}`, "#e8ecf4", plan.budget_eur ? `of €${plan.budget_eur.toFixed(0)}` : "no budget set"],
            ["EXPECTED WEEK-1 PROFIT", `€${plan.expected_week1_profit.toFixed(0)}`, "#22c55e", "probability-weighted"],
            ["FORECAST HORIZON", `${plan.horizon_weeks} weeks`, "#3b82f6", "damped-momentum model"],
          ].map(([l, v, c, sub]) => (
            <div key={l as string} style={{ background: "#141820", border: "1px solid #1e2535", borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: 1.5, color: "#546380" }}>{l}</div>
              <div style={{ fontFamily: "monospace", fontSize: 26, fontWeight: 800, color: c as string, marginTop: 4 }}>{v}</div>
              <div style={{ fontSize: 10, color: "#546380", marginTop: 2 }}>{sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* Plan table */}
      <div style={{ background: "#141820", border: "1px solid #1e2535", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Product", "Score", "Demand wk" + weeks, "Trend", "P(sell 7d)", "Cost ≤", "List @", "Profit/unit", "Order", "Sizes"].map(h => (
                <th key={h} style={{ fontSize: 9, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 1.5, color: "#546380", textAlign: "left", padding: "10px 12px", background: "#1a2030", borderBottom: "1px solid #1e2535" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!plan || loading ? (
              <tr><td colSpan={10} style={{ textAlign: "center", padding: 40, color: "#546380", fontFamily: "monospace", fontSize: 12 }}>
                {loading ? "Running demand forecast…" : "Set a budget and build your plan."}</td></tr>
            ) : plan.items.map((e, i) => {
              const t = TREND_STYLE[e.trend] ?? TREND_STYLE.UNKNOWN
              return (
                <tr key={i} style={{ borderBottom: "1px solid #1e2535", background: e.suggested_units > 0 ? "rgba(34,197,94,.04)" : "transparent" }}>
                  <td style={{ padding: "11px 12px" }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{e.brand} {e.model}</div>
                    <div style={{ fontSize: 10, color: "#546380" }}>{e.category}</div>
                  </td>
                  <td style={{ padding: "11px 12px", fontFamily: "monospace", fontWeight: 800, fontSize: 15, color: scoreColor(e.order_score) }}>{e.order_score.toFixed(0)}</td>
                  <td style={{ padding: "11px 12px", fontFamily: "monospace", fontSize: 12 }}>
                    {e.forecast_weekly_demand.toLocaleString()}/wk
                    <div style={{ fontSize: 9, color: "#546380" }}>now {e.current_weekly_demand.toLocaleString()}</div>
                  </td>
                  <td style={{ padding: "11px 12px", fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: t.color }}>{t.icon} {e.trend}</td>
                  <td style={{ padding: "11px 12px", fontFamily: "monospace", fontSize: 13, color: e.week1_sell_probability >= 0.7 ? "#22c55e" : e.week1_sell_probability >= 0.5 ? "#f59e0b" : "#ef4444" }}>
                    {(e.week1_sell_probability * 100).toFixed(0)}%
                  </td>
                  <td style={{ padding: "11px 12px", fontFamily: "monospace", fontWeight: 700, color: "#22c55e" }}>€{e.target_unit_cost.toFixed(0)}</td>
                  <td style={{ padding: "11px 12px", fontFamily: "monospace" }}>€{e.fast_sale_price?.toFixed(0) ?? "—"}</td>
                  <td style={{ padding: "11px 12px", fontFamily: "monospace", color: "#f59e0b", fontWeight: 700 }}>+€{e.unit_profit?.toFixed(2) ?? "—"}</td>
                  <td style={{ padding: "11px 12px" }}>
                    {e.suggested_units > 0 ? (
                      <span style={{ fontFamily: "monospace", fontWeight: 800, fontSize: 13, padding: "3px 10px", borderRadius: 12, background: "rgba(34,197,94,.15)", border: "1px solid rgba(34,197,94,.4)", color: "#22c55e" }}>×{e.suggested_units}</span>
                    ) : <span style={{ color: "#546380", fontSize: 11 }}>—</span>}
                  </td>
                  <td style={{ padding: "11px 12px" }}>
                    {e.top_sizes.slice(0, 3).map((s, j) => (
                      <span key={s} style={{ fontSize: 9, fontFamily: "monospace", padding: "2px 6px", borderRadius: 4, marginRight: 3, background: j === 0 ? "rgba(59,130,246,.12)" : "#1a2030", border: `1px solid ${j === 0 ? "rgba(59,130,246,.35)" : "#263147"}`, color: j === 0 ? "#60a5fa" : "#8fa3c4" }}>{s}</span>
                    ))}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {plan && (
        <div style={{ marginTop: 12, fontSize: 10, color: "#546380", lineHeight: 1.6 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><AlertTriangle size={11} style={{ color: "#f59e0b" }} /> {plan.disclaimer}</span><br />
          <b style={{ color: "#8fa3c4" }}>How to read it:</b> Cost ≤ is the max you should pay your supplier per unit ·
          List @ is the fast-sale price (5% under market) · P(sell 7d) assumes you list at that price in the shown sizes.
        </div>
      )}
    </AppShell>
  )
}
