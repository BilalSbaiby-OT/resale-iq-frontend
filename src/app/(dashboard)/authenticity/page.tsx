"use client"
import { useState } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { scoreAuthenticity } from "@/lib/api"
import { eur } from "@/lib/utils"
import type { AuthenticityResult } from "@/types"
import { Check } from "lucide-react"

const SCORE_STYLES = (s: number) => s >= 75 ? { ring: "border-emerald-500", text: "text-emerald-400", bg: "bg-emerald-500/10" } : s >= 50 ? { ring: "border-amber-500", text: "text-amber-400", bg: "bg-amber-500/8" } : s >= 25 ? { ring: "border-amber-400", text: "text-amber-400", bg: "bg-amber-500/8" } : { ring: "border-red-500", text: "text-red-400", bg: "bg-red-500/10" }

export default function AuthenticityPage() {
  const [url, setUrl] = useState("")
  const [form, setForm] = useState({ listed_price: "", brand: "", model: "", category: "", title: "", seller_days: "", seller_rating: "", seller_sales: "" })
  const [result, setResult] = useState<AuthenticityResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [showManual, setShowManual] = useState(false)
  const [err, setErr] = useState("")
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const analyzeUrl = async () => {
    if (!url.trim()) return
    setLoading(true); setErr("")
    try {
      const r = await scoreAuthenticity({ url: url.trim() })
      setResult(r)
    } catch (e) { setErr(e instanceof Error ? e.message : "Couldn't read that listing — try manual entry.") }
    finally { setLoading(false) }
  }

  const analyze = async () => {
    if (!form.listed_price) return
    setLoading(true); setErr("")
    try {
      const r = await scoreAuthenticity({
        listed_price: parseFloat(form.listed_price),
        brand: form.brand || undefined, model: form.model || undefined, category: form.category || undefined, title: form.title || undefined,
        seller_days_on_platform: form.seller_days ? parseInt(form.seller_days) : undefined,
        seller_rating: form.seller_rating ? parseFloat(form.seller_rating) : undefined,
        seller_total_sales: form.seller_sales ? parseInt(form.seller_sales) : undefined,
      })
      setResult(r)
    } catch { setErr("Analysis failed") }
    finally { setLoading(false) }
  }

  const styles = result ? SCORE_STYLES(result.confidence_score) : null

  return (
    <AppShell title="Authenticity Intelligence" subtitle="Paste a Vinted link — we fetch the real listing and score it live">
      <div className="max-w-2xl">
        <div className="bg-amber-500/8 border border-amber-500/30 rounded-xl px-4 py-3 mb-5 text-[12px] text-amber-400">
          Automated estimate from public listing signals — advisory, never a verdict. Always request extra photos before buying.
        </div>

        {/* URL MODE — the primary, real path */}
        <div className="bg-[var(--color-bg-3)] border border-[var(--color-border)] rounded-xl p-5 mb-4">
          <label className="text-[12px] font-semibold text-[#e8ecf4] block mb-2">Paste a Vinted listing URL</label>
          <div className="flex gap-2">
            <input value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === "Enter" && analyzeUrl()}
              placeholder="https://www.vinted.es/items/..." className="flex-1 bg-[var(--color-surface-elevated)] border border-[var(--color-border-2)] rounded-lg px-3 py-2.5 font-mono text-[13px] text-[#e8ecf4] outline-none focus:border-emerald-500/60 placeholder:text-[var(--color-text-secondary)]" />
            <button onClick={analyzeUrl} disabled={loading || !url.trim()} className="bg-emerald-400 text-[#0B0D10] font-semibold text-[12.5px] px-5 rounded-lg hover:bg-emerald-300 transition-colors disabled:opacity-50 whitespace-nowrap">
              {loading ? "…" : "Check"}
            </button>
          </div>
          {result?.fetched_listing && (
            <div className="mt-3 text-[12px] text-[#8fa3c4] bg-[var(--color-surface-elevated)] rounded-lg px-3 py-2 flex items-center gap-1.5">
              <Check size={12} className="text-emerald-400 shrink-0" /> Read live: <span className="text-[#e8ecf4]">{result.fetched_listing.brand} · €{result.fetched_listing.price_eur} · {result.fetched_listing.condition}</span>
              {result.fetched_listing.exact_match ? " (exact listing)" : " (closest match)"}
            </div>
          )}
          {err && <div className="mt-3 text-[12px] text-red-400">{err}</div>}
          <button onClick={() => setShowManual(s => !s)} className="mt-3 text-[12px] text-[var(--color-text-secondary)] hover:text-[#8fa3c4]">
            {showManual ? "− Hide manual entry" : "+ Or enter details manually"}
          </button>
        </div>

        {/* MANUAL MODE — collapsible fallback */}
        <div className="bg-[var(--color-bg-3)] border border-[var(--color-border)] rounded-xl p-5 mb-4" style={{ display: showManual ? "block" : "none" }}>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[["Listed price (€)*","listed_price","45","number"],["Brand","brand","Gucci","text"],["Model","model","GG Belt","text"],["Category","category","Bags","text"],["Seller account age (days)","seller_days","365","number"],["Seller rating (0-5)","seller_rating","4.8","number"],["Seller total sales","seller_sales","42","number"]].map(([l,k,ph,t]) => (
              <div key={String(k)} className={k === "listed_price" ? "col-span-2" : ""}>
                <label className="text-[12px] text-[var(--color-text-secondary)] tracking-wide block mb-1.5">{l}</label>
                <input type={String(t)} value={form[k as keyof typeof form]} onChange={e => set(String(k), e.target.value)} placeholder={String(ph)} className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border-2)] rounded-lg px-3 py-2 text-[13px] text-[#e8ecf4] outline-none focus:border-emerald-500/60 placeholder:text-[var(--color-text-secondary)]" />
              </div>
            ))}
            <div className="col-span-2">
              <label className="text-[12px] text-[var(--color-text-secondary)] tracking-wide block mb-1.5">Listing title (optional)</label>
              <input value={form.title} onChange={e => set("title", e.target.value)} placeholder="Copy the listing title here…" className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border-2)] rounded-lg px-3 py-2 text-[13px] text-[#e8ecf4] outline-none focus:border-emerald-500/60 placeholder:text-[var(--color-text-secondary)]" />
            </div>
          </div>
          <button onClick={analyze} disabled={loading} className="w-full bg-emerald-500/10 border border-emerald-500 text-emerald-400 font-semibold text-[13px] py-3 rounded-lg hover:bg-emerald-400 hover:text-[#0B0D10] transition-colors disabled:opacity-50">
            {loading ? "Analysing…" : "Analyse listing"}
          </button>
        </div>

        {result && styles && (
          <>
            <div className="bg-[var(--color-bg-3)] border border-[var(--color-border)] rounded-xl p-5 mb-4">
              <div className={`w-32 h-32 rounded-full border-4 ${styles.ring} ${styles.bg} flex flex-col items-center justify-center mx-auto mb-4`}>
                <div className={`font-mono font-extrabold text-4xl ${styles.text}`}>{result.confidence_score}</div>
                <div className={`text-[12px] font-bold tracking-wide ${styles.text}`}>{result.confidence_label}</div>
              </div>
              {result.flags.length > 0 ? (
                <div className="space-y-2">
                  {result.flags.map((f, i) => <div key={i} className="flex gap-2 bg-[var(--color-surface-elevated)] rounded-lg px-3 py-2 text-[12px] text-[#8fa3c4]"><span></span><span>{f}</span></div>)}
                </div>
              ) : <div className="text-center text-[12px] text-[var(--color-text-secondary)]">No specific concerns detected</div>}
              <div className="mt-4 bg-amber-500/8 border border-amber-500/25 rounded-lg p-3 text-[12px] text-amber-400">{result.disclaimer}</div>
            </div>
            <div className="bg-[var(--color-bg-3)] border border-[var(--color-border)] rounded-xl p-5">
              <div className="font-bold text-[13px] mb-3">Score Breakdown</div>
              <div className="space-y-2">
                {Object.entries(result.breakdown).map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2 border-b border-[var(--color-border)] last:border-0 text-[12px]">
                    <span className="text-[#8fa3c4]">{k.replace(/_/g, " ")}</span>
                    <span className="font-mono font-bold">{v}/100</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  )
}
