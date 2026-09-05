"use client"
import { useState } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { getCalc } from "@/lib/api"
import { eur } from "@/lib/utils"
import type { CalcResult } from "@/types"
import { Crown, Lightbulb } from "lucide-react"

export default function CalculatorPage() {
  const [mode, setMode] = useState<"single" | "reverse">("single")
  const [brand, setBrand] = useState("")
  const [model, setModel] = useState("")
  const [buyPrice, setBuyPrice] = useState("")
  const [targetProfit, setTargetProfit] = useState("")
  const [result, setResult] = useState<CalcResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [maxBuy, setMaxBuy] = useState<number | null>(null)
  const [error, setError] = useState("")

  const calculate = async () => {
    const n = Number.parseFloat(buyPrice)
    if (!Number.isFinite(n) || n < 0.01) {
      setResult(null)
      setMaxBuy(null)
      setError("Enter a buy price greater than 0.")
      return
    }
    setError("")
    setLoading(true)
    try {
      const r = await getCalc(brand || "Item", model || brand || "Item", n)
      const usable = Array.isArray(r.platforms) && r.platforms.some(p => typeof p.sell_price === "number")
      if (!usable) {
        setResult(null)
        setError("No price data for this product. Try a brand and model we track.")
        return
      }
      setResult(r)
    } catch (e) {
      // why: surfaced in the form alert — a silent catch was the original bug
      setResult(null)
      setError(e instanceof Error ? e.message : "Calculation failed")
    }
    finally { setLoading(false) }
  }

  const calculateReverse = async () => {
    const n = Number.parseFloat(targetProfit)
    if (!Number.isFinite(n) || n < 0.01) {
      setMaxBuy(null)
      setResult(null)
      setError("Enter a target profit greater than 0.")
      return
    }
    setError("")
    setLoading(true)
    try {
      const r = await getCalc(brand || "Item", model || brand || "Item", 1)
      const sp = r.platforms?.[0]?.sell_price
      if (typeof sp !== "number") {
        setMaxBuy(null)
        setError("No price data for this product. Try a brand and model we track.")
        return
      }
      const net = sp * 0.95
      setMaxBuy(net - n)
    } catch (e) {
      // why: surfaced in the form alert — a silent catch was the original bug
      setMaxBuy(null)
      setError(e instanceof Error ? e.message : "Calculation failed")
    }
    finally { setLoading(false) }
  }

  return (
    <AppShell title="Profit Calculator" subtitle="Calculate net profit across all platforms">
      <div className="max-w-3xl">
        <div className="flex gap-2 mb-5">
          {(["single", "reverse"] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setResult(null); setMaxBuy(null); setError("") }}
              className={`px-4 py-2 rounded-lg text-[12px] font-semibold border transition-all ${mode === m ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" : "bg-[#141820] border-[#263147] text-[#8fa3c4]"}`}>
              {m === "single" ? "Single Item" : "Reverse Mode"}
            </button>
          ))}
        </div>

        <div className="bg-[#141820] border border-[#1e2535] rounded-xl p-6 mb-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            {[["Brand", brand, setBrand, "e.g. Nike"], ["Model", model, setModel, "e.g. Air Max 90"]].map(([label, val, set, ph]) => (
              <div key={String(label)}>
                <label className="text-[10px] text-[#546380] tracking-wide block mb-1.5">{String(label)}</label>
                <input value={String(val)} onChange={e => (set as (v: string) => void)(e.target.value)} placeholder={String(ph)}
                  className="w-full bg-[#1a2030] border border-[#263147] rounded-lg px-3 py-2.5 text-[13px] text-[#e8ecf4] outline-none focus:border-emerald-500/60 placeholder:text-[#546380]" />
              </div>
            ))}
            {mode === "single" ? (
              <div>
                <label className="text-[10px] text-[#546380] tracking-wide block mb-1.5">Your buy price (€) *</label>
                <input value={buyPrice} onChange={e => setBuyPrice(e.target.value)} type="number" min="0.01" placeholder="45"
                  className="w-full bg-[#1a2030] border border-[#263147] rounded-lg px-3 py-2.5 text-[13px] tabular-nums text-[#e8ecf4] outline-none focus:border-emerald-500/60 placeholder:text-[#546380]" />
              </div>
            ) : (
              <div>
                <label className="text-[10px] text-[#546380] tracking-wide block mb-1.5">Target profit (€)</label>
                <input value={targetProfit} onChange={e => setTargetProfit(e.target.value)} type="number" min="1" placeholder="20"
                  className="w-full bg-[#1a2030] border border-[#263147] rounded-lg px-3 py-2.5 text-[13px] tabular-nums text-[#e8ecf4] outline-none focus:border-emerald-500/60 placeholder:text-[#546380]" />
              </div>
            )}
          </div>
          <button onClick={mode === "single" ? calculate : calculateReverse} disabled={loading}
            className="w-full bg-emerald-500/10 border border-emerald-500 text-emerald-400 font-semibold text-[13px] py-3 rounded-lg hover:bg-emerald-400 hover:text-[#0B0D10] transition-colors disabled:opacity-50">
            {loading ? "Calculating…" : mode === "single" ? "Calculate profit" : "Find max buy price"}
          </button>
          {error && (
            <p role="alert" style={{ color: "#ef4444", fontSize: 13, marginTop: 12, marginBottom: 0 }}>{error}</p>
          )}
        </div>

        {maxBuy !== null && (
          <div className="bg-[#141820] border border-emerald-500/30 rounded-xl p-5 mb-4">
            <div className="text-[11px] text-[#546380] mb-1">Max buy price to hit your target profit:</div>
            <div className="font-mono font-bold text-3xl text-emerald-400">{eur(maxBuy)}</div>
          </div>
        )}

        {result && (
          <div className="bg-[#141820] border border-[#1e2535] rounded-xl overflow-hidden">
            <div className="grid grid-cols-3 gap-0 border-b border-[#1e2535]">
              {[["Best Net Profit", `+${eur(result.best_net_profit)}`, "text-emerald-400 text-2xl"],
                ["Best ROI", `${result.best_roi_pct?.toFixed(0)}%`, "text-amber-400 text-2xl"],
                ["Best Platform", result.best_platform, "text-blue-400 text-xl"]
              ].map(([label, val, color]) => (
                <div key={String(label)} className="p-5 text-center border-r border-[#1e2535] last:border-0">
                  <div className="text-[9px] font-mono text-[#546380] uppercase tracking-[1.5px] mb-2">{label}</div>
                  <div className={`font-mono font-extrabold ${color}`}>{val}</div>
                </div>
              ))}
            </div>
            <table className="w-full">
              <thead>
                <tr>{["Platform","Sell Price","Fee","Net Profit","ROI","Note"].map(h => (
                  <th key={h} className="text-[9px] font-mono text-[#546380] uppercase tracking-[1.5px] px-3 py-2.5 text-left border-b border-[#1e2535] bg-[#1a2030]">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {result.platforms.map((p, i) => (
                  <tr key={p.platform} className={`border-b border-[#1e2535] last:border-0 ${i === 0 ? "bg-emerald-500/5" : "hover:bg-[#1a2030]"}`}>
                    <td className="px-3 py-2.5 font-semibold"><span className="inline-flex items-center gap-1.5">{p.platform}{i === 0 && <Crown size={12} className="text-amber-400" />}</span></td>
                    <td className="px-3 py-2.5 font-mono text-[12px]">{eur(p.sell_price)}</td>
                    <td className="px-3 py-2.5 font-mono text-[12px] text-red-400">-{eur(p.platform_fee)}</td>
                    <td className={`px-3 py-2.5 font-mono font-bold text-[13px] ${p.net_profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>{p.net_profit >= 0 ? "+" : ""}{eur(p.net_profit)}</td>
                    <td className="px-3 py-2.5 font-mono text-[12px] text-amber-400">{p.roi_pct?.toFixed(0)}%</td>
                    <td className="px-3 py-2.5 text-[11px] text-[#546380]">{p.fee_note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {result.tip && <div className="px-4 py-3 border-t border-[#1e2535] text-[12px] text-[#8fa3c4] bg-emerald-500/5 flex items-center gap-2"><Lightbulb size={14} className="text-amber-400 shrink-0" /> {result.tip}</div>}
          </div>
        )}
      </div>
    </AppShell>
  )
}
