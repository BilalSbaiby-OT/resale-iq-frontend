"use client"
import { useEffect, useState } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { MomentumBadge } from "@/components/ui/momentum-badge"
import { MomentumWarmupNotice } from "@/components/ui/momentum-warmup-notice"
import { ScoreBar } from "@/components/ui/score-bar"
import { getTrendsSummary } from "@/lib/api"
import { eur } from "@/lib/utils"
import type { TrendsSummary } from "@/types"
import Link from "next/link"
import { Flame, Star } from "lucide-react"

export default function TrendsPage() {
  const [data, setData] = useState<TrendsSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTrendsSummary().then(d => { setData(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  return (
    <AppShell title="Market Trends" subtitle="Category performance and trending models — recomputed roughly every 2 hours">
      <MomentumWarmupNotice warmingUp={data?.momentum_warming_up} />
      <div className="mb-5">
        <div className="bg-[#141820] border border-[#1e2535] rounded-xl mb-4">
          <div className="px-4 py-3 border-b border-[#1e2535] font-bold text-[13px]">Top Categories by 7-Day Departure Volume</div>
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {loading ? Array(5).fill(0).map((_, i) => <div key={i} className="h-20 bg-[#1a2030] rounded-xl animate-pulse" />) :
              data?.categories?.slice(0, 10).map(c => (
                <Link key={c.category} href={`/deals?category=${encodeURIComponent(c.category)}`}
                  className="bg-[#1a2030] border border-[#263147] rounded-xl p-3 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all cursor-pointer">
                  <div className="font-bold text-[13px] mb-1">{c.category}</div>
                  <div className="font-mono text-[18px] font-extrabold text-emerald-400">{c.sold_7d != null ? c.sold_7d.toLocaleString() : "—"}</div>
                  <div className="text-[10px] text-[#546380]">units/7d · avg {c.avg_price ? eur(c.avg_price) : "—"}</div>
                </Link>
              ))
            }
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-[#141820] border border-[#1e2535] rounded-xl">
            <div className="px-4 py-3 border-b border-[#1e2535]">
              <div className="font-bold text-[13px] flex items-center gap-1.5"><Flame size={14} className="text-amber-400" /> Trending Right Now</div>
              {/* HOT ∪ RISING is p>=.70, i.e. the top 30% of the rank. Name the
                  rank, not the two bucket keys the chip no longer displays. */}
              <div className="text-[10px] text-[#8fa3c4]">Top 30% by departure rank</div>
            </div>
            <div className="divide-y divide-[#1e2535]">
              {loading ? <div className="text-center py-8 text-[#546380] text-[12px]">Loading…</div> :
                (data?.trending_models ?? []).filter(m => m.momentum_label === "HOT" || m.momentum_label === "RISING").slice(0, 10).map((m, i) => (
                  <div key={i} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[#1a2030]">
                    <span className="font-mono text-[11px] text-[#546380] w-4">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] text-[#546380]">{m.brand} {m.momentum_label && <MomentumBadge momentum={m.momentum_label} sold7={m.sold_7d} sold30={m.sold_30d} />}</div>
                      <div className="font-semibold text-[13px] truncate">{m.model}</div>
                    </div>
                    <ScoreBar score={m.opportunity_score} />
                  </div>
                ))
              }
            </div>
          </div>

          <div className="bg-[#141820] border border-[#1e2535] rounded-xl">
            <div className="px-4 py-3 border-b border-[#1e2535]">
              <div className="font-bold text-[13px] flex items-center gap-1.5"><Star size={14} className="text-emerald-400" /> Best Opportunity Scores</div>
              <div className="text-[10px] text-[#8fa3c4]">Highest scoring models</div>
            </div>
            <div className="divide-y divide-[#1e2535]">
              {loading ? <div className="text-center py-8 text-[#546380] text-[12px]">Loading…</div> :
                [...(data?.trending_models ?? [])]
                  .filter((m): m is typeof m & { opportunity_score: number } => typeof m.opportunity_score === "number")
                  .sort((a, b) => b.opportunity_score - a.opportunity_score)
                  .slice(0, 10)
                  .map((m, i) => (
                  <div key={i} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[#1a2030]">
                    <span className="font-mono text-[11px] text-[#546380] w-4">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] text-[#546380]">{m.brand}</div>
                      <div className="font-semibold text-[13px] truncate">{m.model} <span className="text-[#546380]">· {m.category}</span></div>
                    </div>
                    <ScoreBar score={m.opportunity_score} />
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
