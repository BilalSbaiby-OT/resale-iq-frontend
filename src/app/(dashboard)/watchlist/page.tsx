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
import { formatStrPct } from "@/lib/str-pct"
import { isFieldLocked } from "@/lib/locked-fields"

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
      setItems(d.items)
      setWarmingUp(!!d.momentum_warming_up)
      // `locked` has been a constant false on every backend branch since
      // W1 (src/lib/locked-fields.ts). Trust locked_fields, same as deals.
      setLocked(d.locked || isFieldLocked(d.locked_fields, "max_buy_price"))
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
        <div className="flex items-center gap-3 bg-[rgba(52,199,89,0.08)] border border-[rgba(52,199,89,0.25)] rounded-xl px-4 py-3 mb-4 text-[12px] text-[#8fa3c4]">
          <Lock size={14} className="text-[var(--color-buy)] shrink-0" />
          <span>Buy-below, sell price and STR are hidden on the free plan.</span>
          <Link href="/account" className="ml-auto text-[var(--color-buy)] font-semibold whitespace-nowrap">Upgrade — €19/mo</Link>
        </div>
      )}
      <div className="flex justify-end mb-4">
        <button onClick={() => setShowAdd(true)} className="bg-[rgba(52,199,89,0.10)] border border-[var(--color-accent)] text-[var(--color-buy)] font-semibold text-[12px] px-4 py-2 rounded-lg hover:bg-emerald-400 hover:text-[#0B0D10] transition-colors">+ Watch item</button>
      </div>
      {showAdd && (
        <div className="fixed inset-0 bg-[#0B0D10]/90 z-50 flex items-center justify-center p-6">
          <div className="bg-[var(--color-bg-3)] border border-[var(--color-border-2)] rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4">
            <h2 className="font-bold text-[18px]">Watch an item</h2>
            <div>
              <label className="text-[12px] text-[var(--color-text-secondary)] block mb-1">Brand*</label>
              <input value={brand} onChange={e => setBrand(e.target.value)} placeholder="Nike" className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border-2)] rounded-lg px-3 py-2 text-[13px] text-[#e8ecf4] outline-none focus:border-[rgba(52,199,89,0.60)]" />
            </div>
            <div>
              <label className="text-[12px] text-[var(--color-text-secondary)] block mb-1">Model*</label>
              <input value={model} onChange={e => setModel(e.target.value)} placeholder="Air Max 90" className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border-2)] rounded-lg px-3 py-2 text-[13px] text-[#e8ecf4] outline-none focus:border-[rgba(52,199,89,0.60)]" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowAdd(false)} className="flex-1 border border-[var(--color-border-2)] rounded-lg py-2.5 text-[12px] text-[var(--color-text-secondary)]">Cancel</button>
              <button onClick={add} className="flex-1 bg-[var(--color-accent)] text-[var(--color-on-accent)] font-semibold text-[12.5px] rounded-lg py-2.5">Add</button>
            </div>
          </div>
        </div>
      )}
      {loading ? <div className="text-center py-12 text-[var(--color-text-secondary)] text-[12px]">Loading…</div> :
       items.length === 0 ? (
        <div className="text-center py-16 px-6 bg-[var(--color-bg-3)] border border-[var(--color-border)] rounded-xl max-w-lg mx-auto">
          <div className="font-semibold text-[16px] text-[#eef1f7]">Watch a model you might buy</div>
          <p className="text-[13px] text-[#8b99b8] mt-2 leading-relaxed">
            When the market moves — price, sell-through, or a listing under your buy-below — we can ping you. A WATCH becomes BUY when the ask is at or under buy-below and we have enough comparable departures. Pin the models you source so you do not have to re-check them.
          </p>
          <button onClick={() => setShowAdd(true)} className="mt-4 bg-[rgba(52,199,89,0.10)] border border-[var(--color-accent)] text-[var(--color-buy)] font-semibold text-[12px] px-4 py-2 rounded-lg">Watch your first model</button>
        </div>
       ) :
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map(item => (
            <div key={item.id} className="bg-[var(--color-bg-3)] border border-[var(--color-border)] rounded-xl p-4">
              <div className="flex justify-between mb-3">
                <div><div className="font-semibold text-[14px]">{item.model}</div><div className="text-[12px] text-[var(--color-text-secondary)]">{item.brand}{item.category ? ` · ${item.category}` : ""}</div></div>
                <button onClick={() => remove(item.id)} className="text-[var(--color-text-secondary)] hover:text-red-400 text-lg leading-none">×</button>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-[var(--color-surface-elevated)] rounded-lg p-2">
                  <div className="text-[12px] font-mono text-[var(--color-text-secondary)] uppercase">Buy Below</div>
                  <div className="font-mono font-bold text-[13px] mt-0.5 text-[var(--color-buy)]">
                    {locked ? <Lock size={11} className="text-[var(--color-text-secondary)]" /> : eur(item.max_buy_price)}
                  </div>
                </div>
                <div className="bg-[var(--color-surface-elevated)] rounded-lg p-2">
                  <div className="text-[12px] font-mono text-[var(--color-text-secondary)] uppercase">Avg at exit</div>
                  <div className="font-mono font-bold text-[13px] mt-0.5">
                    {locked ? <Lock size={11} className="text-[var(--color-text-secondary)]" /> : <MedianN median={item.avg_price_eur} n={item.comparable_n} nKind="comparable" />}
                  </div>
                </div>
                <div className="bg-[var(--color-surface-elevated)] rounded-lg p-2">
                  <div className="text-[12px] font-mono text-[var(--color-text-secondary)] uppercase">STR</div>
                  <div className="font-mono font-bold text-[13px] mt-0.5 text-[var(--color-watch)]">
                    {/* WAS toFixed(0), which printed "0%" for every rate under
                        0.5 — 4 of the 24 models with a publishable rate in
                        production (Samba 0.19%, AF1 0.38%, NB 9060 0.39%,
                        501 0.10%). "0%" reads as "no demand" on an item that
                        had 43 departures that week. src/lib/str-pct.ts. */}
                    {locked ? <Lock size={11} className="text-[var(--color-text-secondary)]" /> : (formatStrPct(item.str_pct) ?? "—")}
                  </div>
                </div>
              </div>
              {item.momentum_label && <div className="mb-3"><MomentumBadge momentum={item.momentum_label} /></div>}
              <div className="flex gap-2">
                <Link href={`/deals?q=${encodeURIComponent(`${item.brand} ${item.model}`)}`} className="flex-1 text-center text-[12px] font-semibold border border-[rgba(52,199,89,0.40)] text-[var(--color-buy)] py-1.5 rounded-lg hover:bg-[rgba(52,199,89,0.10)]">Find deals</Link>
                <Link href={`/verdict?q=${encodeURIComponent(`${item.brand} ${item.model}`)}`} className="flex-1 text-center text-[12px] font-semibold border border-[var(--color-border-2)] text-[#8fa3c4] py-1.5 rounded-lg hover:bg-[var(--color-surface-elevated)]">Verdict</Link>
              </div>
            </div>
          ))}
        </div>
      }
    </AppShell>
  )
}
