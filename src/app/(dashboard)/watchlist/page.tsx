"use client"
import { useEffect, useState } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { getWatchlist, addToWatchlist, removeFromWatchlist } from "@/lib/api"
import { MomentumBadge } from "@/components/ui/momentum-badge"
import { MomentumWarmupNotice } from "@/components/ui/momentum-warmup-notice"
import { eur } from "@/lib/utils"
import type { WatchlistItem } from "@/types"
import Link from "next/link"
import { Lock } from "lucide-react"
import { MedianN } from "@/components/ui/median-n"

export default function WatchlistPage() {
  const [items, setItems] = useState<WatchlistItem[]>([])
  const [warmingUp, setWarmingUp] = useState(false)
  const [locked, setLocked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [brand, setBrand] = useState(""); const [model, setModel] = useState("")

  const load = async () => {
    setLoading(true)
    try {
      const d = await getWatchlist()
      setItems(d.items); setWarmingUp(!!d.momentum_warming_up); setLocked(d.locked)
    } catch {
      setItems([])
    } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const add = async () => { if (!brand || !model) return; try { await addToWatchlist(brand, model); setBrand(""); setModel(""); setShowAdd(false); load() } catch { alert("Already in watchlist") } }
  const remove = async (id: number) => { if (!confirm("Remove?")) return; await removeFromWatchlist(id); load() }

  return (
    <AppShell title="Watchlist" subtitle="Track brands and models you want to source">
      <MomentumWarmupNotice warmingUp={warmingUp} />
      {locked && items.length > 0 && (
        <div className="flex items-center gap-3 bg-emerald-500/8 border border-emerald-500/25 rounded-xl px-4 py-3 mb-4 text-[12px] text-[#8fa3c4]">
          <Lock size={14} className="text-emerald-400 shrink-0" />
          <span>Buy-below, sell price and STR are hidden on the free plan.</span>
          <Link href="/account" className="ml-auto text-emerald-400 font-semibold whitespace-nowrap">Upgrade — €19/mo</Link>
        </div>
      )}
      <div className="flex justify-end mb-4">
        <button onClick={() => setShowAdd(true)} className="bg-emerald-500/10 border border-emerald-500 text-emerald-400 font-semibold text-[12px] px-4 py-2 rounded-lg hover:bg-emerald-400 hover:text-[#0B0D10] transition-colors">+ Watch item</button>
      </div>
      {showAdd && (
        <div className="fixed inset-0 bg-[#0B0D10]/90 z-50 flex items-center justify-center p-6">
          <div className="bg-[#141820] border border-[#263147] rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4">
            <h2 className="font-bold text-[18px]">Watch an item</h2>
            <div>
              <label className="text-[10px] text-[#546380] block mb-1">Brand*</label>
              <input value={brand} onChange={e => setBrand(e.target.value)} placeholder="Nike" className="w-full bg-[#1a2030] border border-[#263147] rounded-lg px-3 py-2 text-[13px] text-[#e8ecf4] outline-none focus:border-emerald-500/60" />
            </div>
            <div>
              <label className="text-[10px] text-[#546380] block mb-1">Model*</label>
              <input value={model} onChange={e => setModel(e.target.value)} placeholder="Air Max 90" className="w-full bg-[#1a2030] border border-[#263147] rounded-lg px-3 py-2 text-[13px] text-[#e8ecf4] outline-none focus:border-emerald-500/60" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowAdd(false)} className="flex-1 border border-[#263147] rounded-lg py-2.5 text-[12px] text-[#546380]">Cancel</button>
              <button onClick={add} className="flex-1 bg-emerald-400 text-[#0B0D10] font-semibold text-[12.5px] rounded-lg py-2.5">Add</button>
            </div>
          </div>
        </div>
      )}
      {loading ? <div className="text-center py-12 text-[#546380] text-[12px]">Loading…</div> :
       items.length === 0 ? (
        <div className="text-center py-16 px-6 bg-[#141820] border border-[#1e2535] rounded-xl max-w-lg mx-auto">
          <div className="font-semibold text-[16px] text-[#eef1f7]">Watch a model you might buy</div>
          <p className="text-[13px] text-[#8b99b8] mt-2 leading-relaxed">
            When the market moves — price, sell-through, or a listing under your buy-below — we can ping you. A WATCH becomes BUY when the ask is at or under buy-below and we have enough comparable sold items. Pin the models you source so you do not have to re-check them.
          </p>
          <button onClick={() => setShowAdd(true)} className="mt-4 bg-emerald-500/10 border border-emerald-500 text-emerald-400 font-semibold text-[12px] px-4 py-2 rounded-lg">Watch your first model</button>
        </div>
       ) :
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map(item => (
            <div key={item.id} className="bg-[#141820] border border-[#1e2535] rounded-xl p-4">
              <div className="flex justify-between mb-3">
                <div><div className="font-semibold text-[14px]">{item.model}</div><div className="text-[11px] text-[#546380]">{item.brand}{item.category ? ` · ${item.category}` : ""}</div></div>
                <button onClick={() => remove(item.id)} className="text-[#546380] hover:text-red-400 text-lg leading-none">×</button>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-[#1a2030] rounded-lg p-2">
                  <div className="text-[9px] font-mono text-[#546380] uppercase">Buy Below</div>
                  <div className="font-mono font-bold text-[13px] mt-0.5 text-emerald-400">
                    {locked ? <Lock size={11} className="text-[#546380]" /> : eur(item.max_buy_price)}
                  </div>
                </div>
                <div className="bg-[#1a2030] rounded-lg p-2">
                  <div className="text-[9px] font-mono text-[#546380] uppercase">Avg sold</div>
                  <div className="font-mono font-bold text-[13px] mt-0.5">
                    {locked ? <Lock size={11} className="text-[#546380]" /> : <MedianN median={item.avg_price_eur} n={item.sold_7d} />}
                  </div>
                </div>
                <div className="bg-[#1a2030] rounded-lg p-2">
                  <div className="text-[9px] font-mono text-[#546380] uppercase">STR</div>
                  <div className="font-mono font-bold text-[13px] mt-0.5 text-amber-400">
                    {locked ? <Lock size={11} className="text-[#546380]" /> : (item.str_pct != null ? `${item.str_pct.toFixed(0)}%` : "—")}
                  </div>
                </div>
              </div>
              {item.momentum_label && <div className="mb-3"><MomentumBadge momentum={item.momentum_label} /></div>}
              <div className="flex gap-2">
                <Link href={`/deals?q=${encodeURIComponent(`${item.brand} ${item.model}`)}`} className="flex-1 text-center text-[11px] font-semibold border border-emerald-500/40 text-emerald-400 py-1.5 rounded-lg hover:bg-emerald-500/10">Find deals</Link>
                <Link href={`/verdict?q=${encodeURIComponent(`${item.brand} ${item.model}`)}`} className="flex-1 text-center text-[11px] font-semibold border border-[#263147] text-[#8fa3c4] py-1.5 rounded-lg hover:bg-[#1a2030]">Verdict</Link>
              </div>
            </div>
          ))}
        </div>
      }
    </AppShell>
  )
}
