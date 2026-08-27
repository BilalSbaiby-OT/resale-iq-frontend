"use client"
import { useEffect, useState } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { AdminNav } from "@/components/layout/admin-nav"
import { getTraffic, type TrafficStats } from "@/lib/api"
import { BarChart3, Users, Eye, Bot } from "lucide-react"

const RANGES = [7, 30, 90]

export default function TrafficPage() {
  return (
    <AppShell>
      <TrafficDashboard />
    </AppShell>
  )
}

function TrafficDashboard() {
  const [data, setData] = useState<TrafficStats | null>(null)
  const [days, setDays] = useState(30)
  const [err, setErr] = useState("")

  useEffect(() => {
    setErr("")
    getTraffic(days).then(setData).catch(e => setErr(e instanceof Error ? e.message : "Failed to load"))
  }, [days])

  const maxDay = Math.max(1, ...(data?.daily ?? []).map(d => d.views))

  return (
      <div className="max-w-5xl">
        <AdminNav />
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 size={18} className="text-emerald-400" />
          <h1 className="text-[21px] font-bold">Traffic</h1>
        </div>
        <p className="text-[#8b99b8] text-[13px] mb-5">
          First-party analytics — no third-party tracker, no cookies. Bots excluded from all figures.
        </p>

        <div className="flex gap-2 mb-5">
          {RANGES.map(r => (
            <button key={r} onClick={() => setDays(r)}
              className={`text-[12.5px] px-3 py-1.5 rounded-lg border transition-colors ${
                days === r
                  ? "bg-emerald-400 text-[#0B0D10] border-emerald-400 font-bold"
                  : "bg-[#12151d] border-[#1c2333] text-[#8b99b8] hover:border-emerald-500/40"
              }`}>
              {r}d
            </button>
          ))}
        </div>

        {err && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-[13px] text-red-300">{err}</div>
        )}

        {!err && !data && <p className="text-[#8b99b8] text-[13px]">Loading…</p>}

        {data && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              {[
                { icon: Eye, label: "Pageviews", value: data.views },
                { icon: Users, label: "Unique visitors", value: data.visitors },
                { icon: Bot, label: "Bot hits (excluded)", value: data.bot_views },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-[#12151d] border border-[#1c2333] rounded-xl p-4">
                  <div className="flex items-center gap-2 text-[#5b6b8c] mb-1.5">
                    <Icon size={13} /><span className="text-[11px] uppercase tracking-wide">{label}</span>
                  </div>
                  <div className="text-[24px] font-bold">{value.toLocaleString()}</div>
                </div>
              ))}
            </div>

            {data.views === 0 && (
              <div className="bg-[#12151d] border border-[#1c2333] rounded-xl p-5 mb-6 text-[13px] text-[#8b99b8]">
                No traffic recorded yet. Tracking starts from the moment this deployed —
                it cannot show history from before that, because nothing was measuring it.
              </div>
            )}

            <div className="bg-[#12151d] border border-[#1c2333] rounded-xl overflow-hidden mb-4">
              <div className="px-4 py-3 border-b border-[#1e2535] font-bold text-[13px]">Daily</div>
              <div className="p-4 flex items-end gap-1 h-32">
                {data.daily.map(d => (
                  <div key={d.day} className="flex-1 bg-emerald-500/70 rounded-t hover:bg-emerald-400 transition-colors"
                    style={{ height: `${Math.max(3, (d.views / maxDay) * 100)}%` }}
                    title={`${d.day}: ${d.views} views, ${d.visitors} visitors`} />
                ))}
                {data.daily.length === 0 && <span className="text-[#5b6b8c] text-[12px]">No data</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-[#12151d] border border-[#1c2333] rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-[#1e2535] font-bold text-[13px]">Top pages</div>
                <div className="max-h-[420px] overflow-y-auto">
                  {data.top_pages.map(p => (
                    <div key={p.path} className="flex items-center justify-between px-4 py-2 border-b border-[#161c28] last:border-0">
                      <span className="text-[12.5px] text-[#c9d4e8] truncate mr-3">{p.path}</span>
                      <span className="text-[12px] text-[#8b99b8] shrink-0">{p.views} <span className="text-[#4d5a75]">/ {p.visitors}u</span></span>
                    </div>
                  ))}
                  {data.top_pages.length === 0 && <p className="px-4 py-3 text-[12px] text-[#5b6b8c]">No pages yet</p>}
                </div>
              </div>

              <div className="bg-[#12151d] border border-[#1c2333] rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-[#1e2535] font-bold text-[13px]">Where they came from</div>
                <div className="max-h-[420px] overflow-y-auto">
                  {data.sources.map(s => (
                    <div key={s.source} className="flex items-center justify-between px-4 py-2 border-b border-[#161c28] last:border-0">
                      <span className="text-[12.5px] text-[#c9d4e8] truncate mr-3">{s.source}</span>
                      <span className="text-[12px] text-[#8b99b8] shrink-0">{s.views}</span>
                    </div>
                  ))}
                  {data.sources.length === 0 && <p className="px-4 py-3 text-[12px] text-[#5b6b8c]">No sources yet</p>}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
  )
}
