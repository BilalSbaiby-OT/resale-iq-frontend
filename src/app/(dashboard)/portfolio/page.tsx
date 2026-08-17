"use client"
import { useEffect, useState } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { getPortfolio, getPortfolioStats, addPortfolioItem, updatePortfolioItem, deletePortfolioItem } from "@/lib/api"
import { eur } from "@/lib/utils"
import type { PortfolioItem, PortfolioStats } from "@/types"

const STATUS_STYLES = { sourced: "bg-blue-500/10 border-blue-500/30 text-blue-400", listed: "bg-amber-500/10 border-amber-500/30 text-amber-400", sold: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" }

export default function PortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [stats, setStats] = useState<PortfolioStats | null>(null)
  const [filter, setFilter] = useState("")
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ brand: "", model: "", category: "Sneakers", size: "", condition: "good", cost_eur: "", platform: "vinted", notes: "" })

  const load = async () => {
    setLoading(true)
    const [p, s] = await Promise.all([getPortfolio(filter || undefined), getPortfolioStats()])
    setItems(p.items); setStats(s); setLoading(false)
  }

  useEffect(() => { load() }, [filter])

  const addItem = async () => {
    if (!form.brand || !form.model || !form.cost_eur) return
    await addPortfolioItem({ ...form, cost_eur: parseFloat(form.cost_eur) })
    setShowAdd(false); setForm({ brand: "", model: "", category: "Sneakers", size: "", condition: "good", cost_eur: "", platform: "vinted", notes: "" }); load()
  }

  const markListed = async (id: number) => {
    const p = prompt("List price (€)?"); if (!p) return
    await updatePortfolioItem(id, { status: "listed", list_price_eur: parseFloat(p) }); load()
  }
  const markSold = async (id: number) => {
    const p = prompt("Sold price (€)?"); if (!p) return
    await updatePortfolioItem(id, { status: "sold", sold_price_eur: parseFloat(p) }); load()
  }
  const del = async (id: number) => { if (!confirm("Delete?")) return; await deletePortfolioItem(id); load() }

  return (
    <AppShell title="Portfolio & P&L" subtitle="Track every item from sourcing to sold">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
        {[["Total Items", stats?.total_items ?? "—", ""], ["Total Invested", stats?.total_invested ? eur(stats.total_invested) : "—", "text-amber-400"], ["Realized Profit", stats?.realized_profit ? eur(stats.realized_profit) : "—", "text-emerald-400"], ["Avg ROI", stats?.avg_roi_pct ? `${stats.avg_roi_pct.toFixed(0)}%` : "—", "text-emerald-400"], ["Avg Days Held", stats?.avg_days_held ? `${Math.round(stats.avg_days_held)}d` : "—", ""]].map(([l, v, c]) => (
          <div key={String(l)} className="bg-[#141820] border border-[#1e2535] rounded-xl p-3">
            <div className="text-[9px] font-mono text-[#546380] uppercase tracking-[1.5px] mb-1">{l}</div>
            <div className={`font-mono font-bold text-[20px] ${c}`}>{v}</div>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mb-4">
        {["", "sourced", "listed", "sold"].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-4 py-1.5 rounded-lg text-[11.5px] font-semibold border transition-all capitalize ${filter === s ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" : "bg-[#141820] border-[#263147] text-[#8fa3c4]"}`}>{s || "All"}</button>
        ))}
        <button onClick={() => setShowAdd(true)} className="ml-auto bg-emerald-500/10 border border-emerald-500 text-emerald-400 font-semibold text-[12px] px-4 py-1.5 rounded-lg hover:bg-emerald-400 hover:text-[#0B0D10] transition-colors">+ Add item</button>
      </div>
      {showAdd && (
        <div className="fixed inset-0 bg-[#0B0D10]/90 z-50 flex items-center justify-center p-6">
          <div className="bg-[#141820] border border-[#263147] rounded-2xl p-6 w-full max-w-md flex flex-col gap-3">
            <h2 className="font-bold text-[18px]">Add Portfolio Item</h2>
            {[["Brand*","brand","Nike"],["Model*","model","Air Max 90"],["Size","size","42"],["Cost (€)*","cost_eur","45"]].map(([l,k,ph]) => (
              <div key={String(k)}>
                <label className="text-[10px] text-[#546380] block mb-1">{l}</label>
                <input value={form[k as keyof typeof form]} onChange={e => setForm({...form, [k]: e.target.value})} placeholder={String(ph)} className="w-full bg-[#1a2030] border border-[#263147] rounded-lg px-3 py-2 text-[13px] text-[#e8ecf4] outline-none focus:border-emerald-500/60" />
              </div>
            ))}
            <div className="flex gap-2 mt-1">
              <button onClick={() => setShowAdd(false)} className="flex-1 border border-[#263147] rounded-lg py-2.5 text-[12px] text-[#546380] hover:bg-[#1a2030]">Cancel</button>
              <button onClick={addItem} className="flex-1 bg-emerald-400 text-[#0B0D10] font-semibold text-[12.5px] rounded-lg py-2.5 hover:bg-emerald-300">Add item</button>
            </div>
          </div>
        </div>
      )}
      <div className="bg-[#141820] border border-[#1e2535] rounded-xl overflow-hidden">
        <div className="riq-scroll-x"><table className="w-full" style={{ minWidth: 640 }}>
          <thead><tr>{["Item","Size","Cost","List","Platform","Status","Profit","Days","Actions"].map(h => <th key={h} className="text-[9px] font-mono text-[#546380] uppercase tracking-[1.5px] px-3 py-2.5 text-left bg-[#1a2030] border-b border-[#1e2535]">{h}</th>)}</tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={9} className="text-center py-8 text-[#546380] text-[12px]">Loading…</td></tr> :
            items.length === 0 ? <tr><td colSpan={9} className="text-center py-12 text-[#546380] text-[12px]">No items. Track your first item from sourcing to sold.</td></tr> :
            items.map(item => {
              const profit = item.sold_price_eur ? item.sold_price_eur - item.cost_eur : null
              return (
                <tr key={item.id} className="border-b border-[#1e2535] last:border-0 hover:bg-[#1a2030]">
                  <td className="px-3 py-2.5"><div className="font-semibold text-[13px]">{item.brand} {item.model}</div><div className="text-[10px] text-[#546380]">{item.category} · {item.condition}</div></td>
                  <td className="px-3 py-2.5 font-mono text-[12px]">{item.size || "—"}</td>
                  <td className="px-3 py-2.5 font-mono text-[12px]">{eur(item.cost_eur)}</td>
                  <td className="px-3 py-2.5 font-mono text-[12px]">{eur(item.list_price_eur)}</td>
                  <td className="px-3 py-2.5 text-[11px] text-[#8fa3c4]">{item.platform}</td>
                  <td className="px-3 py-2.5"><span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLES[item.status]}`}>{item.status}</span></td>
                  <td className={`px-3 py-2.5 font-mono font-bold text-[13px] ${profit != null ? profit >= 0 ? "text-emerald-400" : "text-red-400" : "text-[#546380]"}`}>{profit != null ? `${profit >= 0 ? "+" : ""}${eur(profit)}` : "—"}</td>
                  <td className="px-3 py-2.5 font-mono text-[12px] text-[#546380]">{item.days_held != null ? `${item.days_held}d` : "—"}</td>
                  <td className="px-3 py-2.5 flex gap-1">
                    {item.status === "sourced" && <button onClick={() => markListed(item.id)} className="text-[10px] px-2 py-1 border border-amber-500/40 text-amber-400 rounded hover:bg-amber-500/10">List</button>}
                    {item.status === "listed" && <button onClick={() => markSold(item.id)} className="text-[10px] px-2 py-1 border border-emerald-500/40 text-emerald-400 rounded hover:bg-emerald-500/10">Sold</button>}
                    <button onClick={() => del(item.id)} className="text-[10px] px-2 py-1 border border-red-500/30 text-red-400 rounded hover:bg-red-500/10">Del</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table></div>
      </div>
    </AppShell>
  )
}
