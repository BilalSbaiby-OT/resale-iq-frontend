"use client"
import { useEffect, useState } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { getBrandRankings } from "@/lib/api"
import { eur } from "@/lib/utils"
import type { BrandRanking } from "@/types"
import Link from "next/link"

export default function BrandsPage() {
  const [brands, setBrands] = useState<BrandRanking[]>([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState<keyof BrandRanking>("sold_7d")
  const [dir, setDir] = useState(-1)

  useEffect(() => { getBrandRankings(30).then(d => { setBrands(d.brands); setLoading(false) }).catch(() => setLoading(false)) }, [])

  const sorted = [...brands].sort((a, b) => {
    const av = a[sort] as number ?? 0, bv = b[sort] as number ?? 0
    return (av - bv) * dir
  })

  const toggleSort = (col: keyof BrandRanking) => { if (sort === col) setDir(d => d * -1); else { setSort(col); setDir(-1) } }

  const SPEED_COLORS: Record<string, string> = {
    "Very Fast": "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    "Fast": "text-emerald-400 bg-emerald-500/8 border-emerald-500/25",
    "Medium": "text-amber-400 bg-amber-500/10 border-amber-500/30",
    "Slow": "text-red-400 bg-red-500/10 border-red-500/30",
  }

  return (
    <AppShell title="Brand Rankings" subtitle={`${brands.length} brands tracked — click any to scan deals`}>
      <div className="bg-[#141820] border border-[#1e2535] rounded-xl overflow-hidden">
        <div className="riq-scroll-x"><table className="w-full" style={{ minWidth: 620 }}>
          <thead>
            <tr>
              {[["#", "rank"], ["Brand", "brand"], ["Avg Price", "avg_price_eur"], ["7d Sold", "sold_7d"], ["Sell Speed", "speed_score"], ["Profit", "profit_label"], ["Score", "demand_score"], ["Categories", ""]].map(([h, col]) => (
                <th key={h} onClick={() => col && toggleSort(col as keyof BrandRanking)}
                  className={`text-[9px] font-mono text-[#546380] uppercase tracking-[1.5px] px-3 py-2.5 text-left bg-[#1a2030] border-b border-[#1e2535] ${col ? "cursor-pointer hover:text-[#e8ecf4]" : ""} ${sort === col ? "text-emerald-400" : ""}`}>
                  {h}{sort === col ? (dir === -1 ? " ↓" : " ↑") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={8} className="text-center py-12 text-[#546380] text-[12px]">Loading brand rankings…</td></tr> :
              sorted.map((b, i) => (
                <tr key={b.brand} onClick={() => window.location.href = `/deals?brand=${encodeURIComponent(b.brand)}`}
                  className="hover:bg-[#1a2030] cursor-pointer transition-colors border-b border-[#1e2535] last:border-0">
                  <td className="px-3 py-2.5 font-mono text-[11px] text-[#546380]">#{b.rank}</td>
                  <td className="px-3 py-2.5 font-semibold text-[14px]">{b.brand}</td>
                  <td className="px-3 py-2.5 font-mono text-[12px]">{eur(b.avg_price_eur)}</td>
                  <td className="px-3 py-2.5 font-mono font-bold text-[12px]">{(b.sold_7d ?? 0).toLocaleString()}</td>
                  <td className="px-3 py-2.5"><span className={`text-[9px] font-mono font-bold px-2 py-1 rounded border ${SPEED_COLORS[b.speed_label] ?? ""}`}>{b.speed_label}</span></td>
                  <td className="px-3 py-2.5"><span className={`text-[9px] font-mono font-bold px-2 py-1 rounded border ${b.profit_label === "High" ? SPEED_COLORS["Very Fast"] : b.profit_label === "Medium" ? SPEED_COLORS["Medium"] : SPEED_COLORS["Slow"]}`}>{b.profit_label}</span></td>
                  <td className="px-3 py-2.5 font-mono text-[12px]">{b.demand_score?.toFixed(0) ?? "—"}</td>
                  <td className="px-3 py-2.5 text-[11px] text-[#8fa3c4]">{b.categories?.slice(0, 3).join(", ")}</td>
                </tr>
              ))
            }
          </tbody>
        </table></div>
      </div>
    </AppShell>
  )
}
