"use client"
import { useEffect, useState, useCallback, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { AppShell } from "@/components/layout/app-shell"
import { MomentumBadge } from "@/components/ui/momentum-badge"
import { MomentumWarmupNotice } from "@/components/ui/momentum-warmup-notice"
import { ScoreBar } from "@/components/ui/score-bar"
import { SizePills } from "@/components/ui/size-pills"
import { LiveDealsModal } from "@/components/ui/live-deals-modal"
import { getDeals, addToWatchlist } from "@/lib/api"
import { eur } from "@/lib/utils"
import type { Deal } from "@/types"
import { Star } from "lucide-react"

function DealsContent() {
  const [liveDeal, setLiveDeal] = useState<Deal | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const [all, setAll] = useState<Deal[]>([])
  const [warmingUp, setWarmingUp] = useState(false)
  const [filtered, setFiltered] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState(searchParams.get("q") || "")
  const [category, setCategory] = useState(searchParams.get("category") || "")
  const [brand, setBrand] = useState(searchParams.get("brand") || "")
  const [momentum, setMomentum] = useState(searchParams.get("momentum") || "")
  const categories = [...new Set(all.map(d => d.category).filter(Boolean))].sort()
  const brands = [...new Set(all.map(d => d.brand).filter(Boolean))].sort()

  const load = useCallback(async () => {
    setLoading(true)
    try { const d = await getDeals({ limit: 200 }); setAll(d.deals); setWarmingUp(!!d.momentum_warming_up) }
    catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    let f = all
    if (q) f = f.filter(d => d.model.toLowerCase().includes(q.toLowerCase()) || d.brand.toLowerCase().includes(q.toLowerCase()))
    if (category) f = f.filter(d => d.category === category)
    if (brand) f = f.filter(d => d.brand === brand)
    if (momentum) f = f.filter(d => d.momentum_label === momentum)
    setFiltered(f)
  }, [all, q, category, brand, momentum])

  const handleWatchlist = async (deal: Deal) => {
    try { await addToWatchlist(deal.brand, deal.model); alert(`Added to watchlist`) }
    catch { alert("Already in watchlist") }
  }

  const BORDER: Record<string, string> = { HOT: "border-l-red-500", RISING: "border-l-amber-500" }

  return (
    <AppShell title="Deal Scanner" subtitle={`${filtered.length} opportunities`}>
      <MomentumWarmupNotice warmingUp={warmingUp} />
      {/* Filters */}
      <div className="bg-[#141820] border border-[#1e2535] rounded-xl p-4 mb-5 flex flex-wrap gap-3 items-center">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search model or brand…"
          className="bg-[#1a2030] border border-[#263147] rounded-lg px-3 py-2 text-[12px] font-mono text-[#e8ecf4] w-52 outline-none focus:border-blue-500 placeholder:text-[#546380]" />
        <select value={category} onChange={e => setCategory(e.target.value)}
          className="bg-[#1a2030] border border-[#263147] rounded-lg px-3 py-2 text-[12px] font-mono text-[#e8ecf4] outline-none">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={brand} onChange={e => setBrand(e.target.value)}
          className="bg-[#1a2030] border border-[#263147] rounded-lg px-3 py-2 text-[12px] font-mono text-[#e8ecf4] outline-none">
          <option value="">All Brands</option>
          {brands.map(b => <option key={b}>{b}</option>)}
        </select>
        <div className="flex gap-1.5">
          {["", "HOT", "RISING", "STABLE"].map(m => (
            <button key={m} onClick={() => setMomentum(m)} className={`px-3 py-1.5 rounded-full text-[10px] font-mono font-bold border transition-all ${
              momentum === m ? "bg-emerald-500/15 border-emerald-500 text-emerald-400" : "bg-[#1a2030] border-[#263147] text-[#8fa3c4] hover:bg-[#222d42]"
            }`}>{m || "All"}</button>
          ))}
        </div>
        <span className="text-[10px] text-[#546380] font-mono ml-1">{filtered.length} deals</span>
        {(q || category || brand || momentum) && (
          <button onClick={() => { setQ(""); setCategory(""); setBrand(""); setMomentum("") }}
            className="text-[10px] text-[#546380] hover:text-[#e8ecf4] font-mono">× Clear</button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-[#141820] border border-[#1e2535] rounded-xl h-48 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-[#546380] font-mono text-[12px]">No deals match filters. Try removing some.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((d, i) => (
            <div key={i} className={`bg-[#141820] border border-[#1e2535] border-l-4 rounded-xl p-4 flex flex-col gap-3 hover:border-[#263147] transition-colors ${BORDER[d.momentum_label ?? ""] ?? "border-l-transparent"}`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-[15px]">{d.model}</div>
                  <div className="text-[11px] text-[#546380] mt-0.5">{d.brand} · {d.category}</div>
                </div>
                <ScoreBar score={d.opportunity_score} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Buy Below", value: eur(d.max_buy_price), color: "text-emerald-400" },
                  { label: "Est. Profit", value: d.est_profit_eur != null ? `+${eur(d.est_profit_eur)}` : "—", color: "text-amber-400" },
                  // Sell-through is withheld product-wide, and Hermes put the
                  // problem better than "show a placeholder": the gap is not
                  // data quality, it is the ABSENCE OF A SIGNAL where the user
                  // expects one. A competitor showing "sells in ~3 days" wins
                  // that slot against our apology every time.
                  //
                  // So the slot carries supply instead. Beside the 7d Sold tile
                  // the reseller reads 247 sold against 3,200 listed and forms
                  // the judgement themselves — two counts we stand behind,
                  // rather than a ratio we do not.
                  d.str_pct != null
                    ? { label: "STR / Week", value: `${d.str_pct.toFixed(0)}%`, color: "" }
                    : { label: "Listed Now", value: d.active_listings != null ? d.active_listings.toLocaleString() : "—", color: "" },
                  { label: "7d Sold", value: (d.sold_7d ?? 0).toLocaleString(), color: "" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-[#1a2030] rounded-lg p-2">
                    <div className="text-[9px] font-mono uppercase tracking-wide text-[#546380]">{label}</div>
                    <div className={`font-mono font-bold text-base mt-1 ${color}`}>{value}</div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center">
                {d.momentum_label && <MomentumBadge momentum={d.momentum_label} />}
                <SizePills sizes={d.top_sizes ?? []} />
                <button onClick={() => handleWatchlist(d)} className="opacity-40 hover:opacity-100 transition-opacity text-amber-400" title="Add to watchlist"><Star size={16} /></button>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-[#1e2535]">
                <button onClick={() => setLiveDeal(d)}
                  className="flex-1 text-[11px] font-mono font-bold py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-400 hover:text-[#0B0D10] transition-colors"
                  title="Find live buyable listings under your buy-price, right now">
                  FIND LIVE DEALS
                </button>
                {d.sourcing_links && d.sourcing_links.length > 0 && (
                  <div className="flex items-center gap-1">
                    {d.sourcing_links.map((l) => (
                      <a key={l.market} href={l.url} target="_blank" rel="noopener noreferrer"
                        title={`Open ${l.market} search`}
                        className="text-[9px] font-mono font-semibold px-1.5 py-1 rounded-md bg-[#1a2030] border border-[#263147] text-[#60a5fa] hover:bg-[#222d42] transition-colors">
                        {l.market}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {liveDeal && <LiveDealsModal deal={liveDeal} onClose={() => setLiveDeal(null)} />}
    </AppShell>
  )
}

export default function DealsPage() {
  return <Suspense><DealsContent /></Suspense>
}
