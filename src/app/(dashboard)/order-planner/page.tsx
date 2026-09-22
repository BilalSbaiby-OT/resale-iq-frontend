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
  str_withheld?: boolean
}
interface Plan {
  horizon_weeks: number; budget_eur: number | null; allocated_eur: number
  expected_week1_profit: number; items: PlanItem[]; disclaimer: string
  provisional?: boolean
}

const TREND_STYLE: Record<string, { color: string; icon: string }> = {
  GROWING: { color: "var(--color-buy)", icon: "▲" },
  HOLDING: { color: "var(--color-blue)", icon: "■" },
  COOLING: { color: "var(--color-watch)", icon: "▼" },
  FADING: { color: "var(--color-skip)", icon: "▼" },
  UNKNOWN: { color: "var(--color-text-secondary)", icon: "?" },
}

function scoreColor(s: number) {
  if (s >= 85) return "var(--color-buy)"
  if (s >= 70) return "var(--color-cyan)"
  if (s >= 50) return "var(--color-watch)"
  return "var(--color-skip)"
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
      <div style={{ display: "flex", gap: 12, alignItems: "flex-end", background: "var(--color-graphite-elevated)", border: "1px solid var(--color-hairline)", borderRadius: 12, padding: 16, marginBottom: 16, flexWrap: "wrap" }}>
        <div>
          <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 6, letterSpacing: 1 }}>ORDER BUDGET (€)</label>
          <input value={budget} onChange={e => setBudget(e.target.value)} type="number" min="0"
            style={{ background: "var(--color-surface-elevated)", border: "1px solid var(--color-border-2)", borderRadius: 8, padding: "9px 12px", fontFamily: "monospace", fontSize: 14, color: "var(--color-on-graphite)", width: 130, outline: "none" }} />
        </div>
        <div>
          <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 6, letterSpacing: 1 }}>ARRIVES IN</label>
          <div style={{ display: "flex", gap: 6 }}>
            {[2, 3, 4].map(w => (
              <button key={w} onClick={() => setWeeks(w)} style={{
                padding: "9px 14px", borderRadius: 8, fontFamily: "monospace", fontSize: 12, fontWeight: 700, cursor: "pointer",
                background: weeks === w ? "rgba(52,199,89,.12)" : "var(--color-bg-4)",
                border: `1px solid ${weeks === w ? "var(--color-buy)" : "var(--color-hairline)"}`,
                color: weeks === w ? "var(--color-buy)" : "var(--color-graphite-muted)",
              }}>{w} wks</button>
            ))}
          </div>
        </div>
        <button onClick={load} disabled={loading} style={{
          padding: "10px 22px", borderRadius: 8, fontSize: 13, fontWeight: 600,
          background: "var(--color-buy)", color: "var(--color-graphite)", border: "none", cursor: "pointer", opacity: loading ? 0.6 : 1,
        }}>{loading ? "Forecasting…" : "Build order plan"}</button>
      </div>

      {/* Hero stats */}
      {plan?.provisional && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,159,10,.07)", border: "1px solid rgba(255,159,10,.3)", borderRadius: 10, padding: "10px 14px", marginBottom: 14 }}>
          <span style={{ fontSize: 13, color: "var(--color-watch)", fontWeight: 700 }}>Provisional</span>
          <span style={{ fontSize: 12.5, color: "var(--color-text-body)", lineHeight: 1.5 }}>
            Sell-through is still being measured, so week-1 sell probabilities use a conservative prior and suggested units cap at 1 per model. Cost and demand are live — do not treat P(sell) as measured sell-through.
          </span>
        </div>
      )}
      {plan && (
        <div className="riq-grid-3" style={{ marginBottom: 16 }}>
          {[
            ["BUDGET ALLOCATED", `€${plan.allocated_eur.toFixed(0)}`, "var(--color-on-graphite)", plan.budget_eur ? `of €${plan.budget_eur.toFixed(0)}` : "no budget set"],
            ["EXPECTED WEEK-1 PROFIT", `€${plan.expected_week1_profit.toFixed(0)}`, "var(--color-buy)", "probability-weighted"],
            ["FORECAST HORIZON", `${plan.horizon_weeks} weeks`, "var(--color-blue)", "damped-momentum model"],
          ].map(([l, v, c, sub]) => (
            <div key={l as string} style={{ background: "var(--color-graphite-elevated)", border: "1px solid var(--color-hairline)", borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 12, fontFamily: "monospace", letterSpacing: 1.5, color: "var(--color-text-secondary)" }}>{l}</div>
              <div style={{ fontFamily: "monospace", fontSize: 26, fontWeight: 800, color: c as string, marginTop: 4 }}>{v}</div>
              <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>{sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* Plan table */}
      <div style={{ background: "var(--color-graphite-elevated)", border: "1px solid var(--color-hairline)", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Product", "Score", "Demand wk" + weeks, "Trend", "P(sell 7d)", "Cost ≤", "List @", "Profit/unit", "Order", "Sizes"].map(h => (
                <th key={h} style={{ fontSize: 12, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 1.5, color: "var(--color-text-secondary)", textAlign: "left", padding: "10px 12px", background: "var(--color-surface-elevated)", borderBottom: "1px solid var(--color-hairline)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!plan || loading ? (
              <tr><td colSpan={10} style={{ textAlign: "center", padding: 40, color: "var(--color-text-secondary)", fontFamily: "monospace", fontSize: 12 }}>
                {loading ? "Running demand forecast…" : "Set a budget and build your plan."}</td></tr>
            ) : plan.items.map((e, i) => {
              const t = TREND_STYLE[e.trend] ?? TREND_STYLE.UNKNOWN
              return (
                <tr key={i} style={{ borderBottom: "1px solid var(--color-hairline)", background: e.suggested_units > 0 ? "rgba(52,199,89,.04)" : "transparent" }}>
                  <td style={{ padding: "11px 12px" }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{e.brand} {e.model}</div>
                    <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{e.category}</div>
                  </td>
                  <td style={{ padding: "11px 12px", fontFamily: "monospace", fontWeight: 800, fontSize: 15, color: scoreColor(e.order_score) }}>{e.order_score.toFixed(0)}</td>
                  <td style={{ padding: "11px 12px", fontFamily: "monospace", fontSize: 12 }}>
                    {e.forecast_weekly_demand.toLocaleString()}/wk
                    <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>now {e.current_weekly_demand.toLocaleString()}</div>
                  </td>
                  <td style={{ padding: "11px 12px", fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: t.color }}>{t.icon} {e.trend}</td>
                  <td title={e.str_withheld ? "Sell-through withheld — this is a 0.25 prior, not a measured rate" : undefined} style={{ padding: "11px 12px", fontFamily: "monospace", fontSize: 13, color: e.week1_sell_probability >= 0.7 ? "var(--color-buy)" : e.week1_sell_probability >= 0.5 ? "var(--color-watch)" : "var(--color-skip)" }}>
                    {(e.week1_sell_probability * 100).toFixed(0)}%{e.str_withheld ? <span style={{ fontSize: 12, color: "var(--color-watch)", marginLeft: 4 }}>prior</span> : null}
                  </td>
                  <td style={{ padding: "11px 12px", fontFamily: "monospace", fontWeight: 700, color: "var(--color-buy)" }}>€{e.target_unit_cost.toFixed(0)}</td>
                  <td style={{ padding: "11px 12px", fontFamily: "monospace" }}>€{e.fast_sale_price?.toFixed(0) ?? "—"}</td>
                  <td style={{ padding: "11px 12px", fontFamily: "monospace", color: "var(--color-watch)", fontWeight: 700 }}>+€{e.unit_profit?.toFixed(2) ?? "—"}</td>
                  <td style={{ padding: "11px 12px" }}>
                    {e.suggested_units > 0 ? (
                      <span style={{ fontFamily: "monospace", fontWeight: 800, fontSize: 13, padding: "3px 10px", borderRadius: 12, background: "rgba(52,199,89,.15)", border: "1px solid rgba(52,199,89,.4)", color: "var(--color-buy)" }}>×{e.suggested_units}</span>
                    ) : <span style={{ color: "var(--color-text-secondary)", fontSize: 12 }}>—</span>}
                  </td>
                  <td style={{ padding: "11px 12px" }}>
                    {e.top_sizes.slice(0, 3).map((s, j) => (
                      <span key={s} style={{ fontSize: 12, fontFamily: "monospace", padding: "2px 6px", borderRadius: 4, marginRight: 3, background: j === 0 ? "rgba(10,132,255,.12)" : "var(--color-bg-4)", border: `1px solid ${j === 0 ? "rgba(10,132,255,.35)" : "var(--color-hairline)"}`, color: j === 0 ? "var(--color-blue)" : "var(--color-graphite-muted)" }}>{s}</span>
                    ))}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {plan && (
        <div style={{ marginTop: 12, fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><AlertTriangle size={11} style={{ color: "var(--color-watch)" }} /> {plan.disclaimer}</span><br />
          <b style={{ color: "var(--color-graphite-muted)" }}>How to read it:</b> Cost ≤ is the max you should pay your supplier per unit ·
          List @ is the fast-sale price (5% under market) · P(sell 7d) assumes you list at that price in the shown sizes.
        </div>
      )}
    </AppShell>
  )
}
