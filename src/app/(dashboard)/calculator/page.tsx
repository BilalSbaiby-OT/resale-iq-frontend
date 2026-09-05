"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { PublicProfitCalculator } from "@/components/tools/public-profit-calculator"
import { getCalc } from "@/lib/api"
import { eur } from "@/lib/utils"
import { useAuthStore } from "@/lib/auth-store"
import { useLocale } from "@/components/i18n/locale-provider"
import type { CalcResult } from "@/types"

export default function CalculatorPage() {
  const { isAuthenticated, isLoading: authLoading, checkAuth } = useAuthStore()
  const locale = useLocale()
  const [authChecked, setAuthChecked] = useState(false)
  const [mode, setMode] = useState<"single" | "reverse">("single")
  const [brand, setBrand] = useState("")
  const [model, setModel] = useState("")
  const [buyPrice, setBuyPrice] = useState("")
  const [targetProfit, setTargetProfit] = useState("")
  const [result, setResult] = useState<CalcResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [maxBuy, setMaxBuy] = useState<number | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    checkAuth().then(() => setAuthChecked(true))
    // why: same mount-once auth probe as AppShell; checkAuth is a stable store action.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  if (!authChecked || authLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "var(--color-bg)" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: "5px", color: "var(--color-buy)" }}>RESALE·IQ</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--color-bg)", color: "var(--color-text-primary)" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "28px 24px 80px" }}>
          <Link href="/" style={{ color: "inherit", textDecoration: "none", fontSize: 15, fontWeight: 500 }}>Resale IQ</Link>
          <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.4px", margin: "32px 0 8px" }}>Profit calculator</h1>
          <p style={{ fontSize: 15, color: "var(--color-text-secondary)", margin: "0 0 28px", lineHeight: 1.5 }}>
            Net profit after Vinted fees. No account required.
          </p>
          <PublicProfitCalculator locale={locale} />
        </div>
      </div>
    )
  }

  return (
    <AppShell title="Profit Calculator" subtitle="Calculate net profit across all platforms">
      <div className="max-w-2xl">
        {/* Mode switch is navigation, not the action. It used to be an
            emerald-outlined pill sitting directly above an emerald-outlined
            submit button — two accents, and the weaker-looking one was the
            real CTA. Neutral here, filled accent on the button below. */}
        <div className="flex gap-2 mb-6">
          {(["single", "reverse"] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setResult(null); setMaxBuy(null); setError("") }}
              className={`px-4 py-2 rounded-lg text-[13px] font-semibold border transition-colors ${mode === m ? "bg-[var(--color-surface-elevated)] border-[var(--color-border-2)] text-[var(--color-text-primary)]" : "bg-transparent border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"}`}>
              {m === "single" ? "Single Item" : "Reverse Mode"}
            </button>
          ))}
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            {[["Brand", brand, setBrand, "e.g. Nike"], ["Model", model, setModel, "e.g. Air Max 90"]].map(([label, val, set, ph]) => (
              <div key={String(label)}>
                <label className="text-[13px] text-[var(--color-text-secondary)] block mb-1.5">{String(label)}</label>
                <input value={String(val)} onChange={e => (set as (v: string) => void)(e.target.value)} placeholder={String(ph)}
                  className="w-full bg-[var(--color-bg-2)] border border-[var(--color-border-2)] rounded-lg px-3.5 py-3 text-[15px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-buy)] placeholder:text-[var(--color-text-muted)]" />
              </div>
            ))}
            {mode === "single" ? (
              <div>
                <label className="text-[13px] text-[var(--color-text-secondary)] block mb-1.5">Your buy price (€) *</label>
                <input value={buyPrice} onChange={e => setBuyPrice(e.target.value)} type="number" min="0.01" placeholder="45"
                  className="w-full bg-[var(--color-bg-2)] border border-[var(--color-border-2)] rounded-lg px-3.5 py-3 text-[15px] tabular-nums text-[var(--color-text-primary)] outline-none focus:border-[var(--color-buy)] placeholder:text-[var(--color-text-muted)]" />
              </div>
            ) : (
              <div>
                <label className="text-[13px] text-[var(--color-text-secondary)] block mb-1.5">Target profit (€)</label>
                <input value={targetProfit} onChange={e => setTargetProfit(e.target.value)} type="number" min="1" placeholder="20"
                  className="w-full bg-[var(--color-bg-2)] border border-[var(--color-border-2)] rounded-lg px-3.5 py-3 text-[15px] tabular-nums text-[var(--color-text-primary)] outline-none focus:border-[var(--color-buy)] placeholder:text-[var(--color-text-muted)]" />
              </div>
            )}
          </div>
          <button onClick={mode === "single" ? calculate : calculateReverse} disabled={loading}
            className="w-full bg-[var(--color-buy)] text-[var(--color-on-buy)] font-bold text-[15px] py-3.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? "Calculating…" : mode === "single" ? "Calculate profit" : "Find max buy price"}
          </button>
          {error && (
            <p role="alert" className="text-[var(--color-skip)] text-[13.5px] mt-3.5 mb-0">{error}</p>
          )}
        </div>

        {maxBuy !== null && (
          <div className="mb-6">
            <div className="text-[13px] text-[var(--color-text-secondary)] mb-2">Max buy price to hit your target profit</div>
            <div className="font-bold text-[40px] leading-none tracking-tight text-[var(--color-buy)] tabular-nums">{eur(maxBuy)}</div>
          </div>
        )}

        {result && (
          <div>
            {/* Was a three-up grid of emerald / amber / blue figures — three
                headline numbers in three colours, so none of them led. One
                number leads now and the other two are the sentence under it. */}
            <div className="mb-8">
              <div className="text-[13px] text-[var(--color-text-secondary)] mb-2">Best net profit</div>
              <div className={`font-bold text-[40px] leading-none tracking-tight tabular-nums ${result.best_net_profit >= 0 ? "text-[var(--color-buy)]" : "text-[var(--color-skip)]"}`}>
                {result.best_net_profit >= 0 ? "+" : ""}{eur(result.best_net_profit)}
              </div>
              <div className="text-[14px] text-[var(--color-text-secondary)] mt-3">
                {result.best_roi_pct?.toFixed(0)}% ROI, selling on {result.best_platform}.
              </div>
            </div>

            {/* riq-scroll-x is the app's existing rule for wide tables on
                phones (globals.css): the table scrolls inside its own box at a
                usable min width instead of crushing six columns into 390px. */}
            <div className="riq-scroll-x border border-[var(--color-border)] rounded-xl">
              <table className="w-full">
                <thead>
                  <tr>{["Platform","Sell price","Fee","Net profit","ROI","Note"].map(h => (
                    <th key={h} className="text-[12px] font-medium text-[var(--color-text-muted)] px-4 py-3 text-left border-b border-[var(--color-border)]">{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {result.platforms.map((p) => (
                    <tr key={p.platform} className="border-b border-[var(--color-border)] last:border-0">
                      <td className="px-4 py-3 text-[14px] font-semibold text-[var(--color-text-primary)]">{p.platform}</td>
                      <td className="px-4 py-3 text-[14px] tabular-nums text-[var(--color-text-secondary)]">{eur(p.sell_price)}</td>
                      <td className="px-4 py-3 text-[14px] tabular-nums text-[var(--color-text-secondary)]">-{eur(p.platform_fee)}</td>
                      {/* The only coloured column: net profit is the verdict. */}
                      <td className={`px-4 py-3 text-[14px] tabular-nums font-semibold ${p.net_profit >= 0 ? "text-[var(--color-buy)]" : "text-[var(--color-skip)]"}`}>{p.net_profit >= 0 ? "+" : ""}{eur(p.net_profit)}</td>
                      <td className="px-4 py-3 text-[14px] tabular-nums text-[var(--color-text-secondary)]">{p.roi_pct?.toFixed(0)}%</td>
                      <td className="px-4 py-3 text-[13px] text-[var(--color-text-muted)]">{p.fee_note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {result.tip && <p className="mt-4 text-[14px] leading-relaxed text-[var(--color-text-secondary)]">{result.tip}</p>}
          </div>
        )}
      </div>
    </AppShell>
  )
}
