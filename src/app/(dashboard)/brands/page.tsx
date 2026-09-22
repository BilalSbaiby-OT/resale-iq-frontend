"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { getBrandRankings } from "@/lib/api"
import { eur } from "@/lib/utils"
import type { BrandRanking } from "@/types"

export default function BrandsPage() {
  const [brands, setBrands] = useState<BrandRanking[]>([])
  const [loading, setLoading] = useState(true)
  // An auth/network failure is NOT "no brands exist". The old catch swallowed
  // the error and left brands=[], so a 401 rendered as "0 brands tracked" over
  // an empty void — indistinguishable from a broken server, while the database
  // actually holds 55 brands. Track the failure so the UI can say which it is.
  const [loadError, setLoadError] = useState<"auth" | "network" | null>(null)
  const [sort, setSort] = useState<keyof BrandRanking>("sold_7d")
  const [dir, setDir] = useState(-1)

  useEffect(() => {
    getBrandRankings(30)
      .then(d => { setBrands(d.brands); setLoading(false) })
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : String(e)
        setLoadError(/401|403|auth/i.test(msg) ? "auth" : "network")
        setLoading(false)
      })
  }, [])

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
    <AppShell title="Brand Rankings" subtitle={loadError ? "55 brands tracked — unlock to see the ranking" : `${brands.length} brands tracked — click any to scan deals`}>
      <div className="bg-[var(--color-bg-3)] border border-[var(--color-border)] rounded-xl overflow-hidden">
        <div className="riq-scroll-x"><table className="w-full" style={{ minWidth: 620 }}>
          <thead>
            <tr>
              {[["#", "rank"], ["Brand", "brand"], ["Avg Price", "avg_price_eur"], ["7d Left shelf", "sold_7d"], ["Sell Speed", "speed_score"], ["Profit", "profit_label"], ["Score", "demand_score"], ["Categories", ""]].map(([h, col]) => (
                <th key={h} onClick={() => col && toggleSort(col as keyof BrandRanking)}
                  className={`text-[12px] font-mono text-[var(--color-text-secondary)] uppercase tracking-[1.5px] px-3 py-2.5 text-left bg-[var(--color-surface-elevated)] border-b border-[var(--color-border)] ${col ? "cursor-pointer hover:text-[#e8ecf4]" : ""} ${sort === col ? "text-emerald-400" : ""}`}>
                  {h}{sort === col ? (dir === -1 ? " ↓" : " ↑") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={8} className="text-center py-12 text-[var(--color-text-secondary)] text-[12px]">Loading brand rankings…</td></tr> :
              loadError ? (
                <tr><td colSpan={8} className="text-center py-12 px-4">
                  <div className="text-[15px] text-[var(--color-text-primary)] font-semibold mb-2">
                    {loadError === "auth" ? "Brand rankings are part of a paid plan" : "Couldn't load brand rankings"}
                  </div>
                  <div className="text-[13px] text-[var(--color-text-secondary)] mb-4 max-w-[420px] mx-auto">
                    {loadError === "auth"
                      ? "We track 55 brands across Vinted ES, FR, DE, IT and PT — ranked by what actually left the shelf this week. Starter unlocks the full table."
                      : "This is a connection problem on our side, not an empty dataset. Try again in a moment."}
                  </div>
                  {loadError === "auth"
                    ? <Link href="/pricing" className="inline-flex items-center justify-center min-h-[44px] px-5 rounded-lg bg-[var(--color-buy)] text-[var(--color-on-buy)] font-bold text-[14px]">Unlock 55 brands →</Link>
                    : <button onClick={() => window.location.reload()} className="inline-flex items-center justify-center min-h-[44px] px-5 rounded-lg border border-[var(--color-border-2)] text-[var(--color-text-primary)] font-semibold text-[14px]">Retry</button>}
                </td></tr>
              ) :
              sorted.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-[13px] text-[var(--color-text-secondary)]">
                  No brand rankings yet — the weekly ranking rebuilds as departures are observed.
                </td></tr>
              ) :
              sorted.map((b, i) => (
                <tr key={b.brand} onClick={() => window.location.href = `/deals?brand=${encodeURIComponent(b.brand)}`}
                  className="hover:bg-[var(--color-surface-elevated)] cursor-pointer transition-colors border-b border-[var(--color-border)] last:border-0">
                  <td className="px-3 py-2.5 font-mono text-[12px] text-[var(--color-text-secondary)]">#{b.rank}</td>
                  <td className="px-3 py-2.5 font-semibold text-[14px]">{b.brand}</td>
                  <td className="px-3 py-2.5 font-mono text-[12px]">{eur(b.avg_price_eur)}</td>
                  <td className="px-3 py-2.5 font-mono font-bold text-[12px]">{typeof b.sold_7d === "number" && Number.isFinite(b.sold_7d) ? b.sold_7d.toLocaleString("en-GB") : "—"}</td>
                  <td className="px-3 py-2.5"><span className={`text-[12px] font-mono font-bold px-2 py-1 rounded border ${SPEED_COLORS[b.speed_label] ?? ""}`}>{b.speed_label}</span></td>
                  <td className="px-3 py-2.5"><span className={`text-[12px] font-mono font-bold px-2 py-1 rounded border ${b.profit_label === "High" ? SPEED_COLORS["Very Fast"] : b.profit_label === "Medium" ? SPEED_COLORS["Medium"] : SPEED_COLORS["Slow"]}`}>{b.profit_label}</span></td>
                  <td className="px-3 py-2.5 font-mono text-[12px]">{b.demand_score?.toFixed(0) ?? "—"}</td>
                  <td className="px-3 py-2.5 text-[12px] text-[#8fa3c4]">{b.categories?.slice(0, 3).join(", ")}</td>
                </tr>
              ))
            }
          </tbody>
        </table></div>
      </div>
    </AppShell>
  )
}
