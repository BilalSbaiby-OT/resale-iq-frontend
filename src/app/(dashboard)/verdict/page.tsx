"use client"
import { useState, useEffect, useCallback, Suspense, type ReactNode } from "react"
import { useSearchParams } from "next/navigation"
import { AppShell } from "@/components/layout/app-shell"
import { getVerdict } from "@/lib/api"
import { eur } from "@/lib/utils"
import type { VerdictResult } from "@/types"
import { Zap, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { UnlockPanel } from "@/components/ui/unlock-panel"
import { MedianN } from "@/components/ui/median-n"

const VERDICT_STYLE: Record<string, { color: string; bg: string; border: string; label: string }> = {
  BUY:     { color: "#34d399", bg: "rgba(52,211,153,.10)", border: "rgba(52,211,153,.35)", label: "BUY" },
  WATCH:   { color: "#fbbf24", bg: "rgba(251,191,36,.10)", border: "rgba(251,191,36,.35)", label: "WATCH" },
  SKIP:    { color: "#f87171", bg: "rgba(248,113,113,.10)", border: "rgba(248,113,113,.35)", label: "SKIP" },
  UNKNOWN: { color: "#8b99b8", bg: "rgba(139,153,184,.10)", border: "rgba(139,153,184,.30)", label: "NO DATA" },
  // Distinct from NO DATA on purpose: we found the product, we just will not
  // put a call on it. "NOT MEASURED" says the gap is ours, not the market's.
  INSUFFICIENT_DATA: { color: "#8b99b8", bg: "rgba(139,153,184,.10)", border: "rgba(139,153,184,.30)", label: "NOT MEASURED" },
}

const MOMENTUM_ICON: Record<string, typeof TrendingUp> = {
  HOT: TrendingUp, RISING: TrendingUp, STABLE: Minus, FADING: TrendingDown, DEAD: TrendingDown,
}

export default function VerdictPage() {
  return (
    <Suspense fallback={<AppShell title="Quick Verdict" subtitle="Type any product — get an instant buy / skip call from live market data"><div /></AppShell>}>
      <VerdictInner />
    </Suspense>
  )
}

function VerdictInner() {
  const params = useSearchParams()
  const [query, setQuery] = useState("")
  const [result, setResult] = useState<VerdictResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [unlocking, setUnlocking] = useState(false)
  const [error, setError] = useState("")

  const run = useCallback(async (raw?: string) => {
    const q = (raw ?? query).trim()
    if (!q) return
    setLoading(true); setError(""); setResult(null)
    try {
      setResult(await getVerdict(q))
    } catch {
      setError("Couldn't fetch a verdict. Try again.")
    } finally { setLoading(false) }
  }, [query])

  // Spends one of the free tier's daily unlocks. The server decides whether the
  // claim succeeds and only then sends the paid fields — this just re-asks with
  // unlock=true and swaps in whatever comes back.
  const unlock = useCallback(async () => {
    const q = (result?.product || query).trim()
    if (!q) return
    setUnlocking(true)
    try {
      setResult(await getVerdict(q, true))
    } catch {
      setError("Couldn't unlock that one. Try again.")
    } finally { setUnlocking(false) }
  }, [result, query])

  // Deep-link: /verdict?q=Adidas Samba (e.g. the watchlist VERDICT button) —
  // prefill and run automatically.
  useEffect(() => {
    const q = params.get("q")
    if (q) { setQuery(q); run(q) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const vs = result ? (VERDICT_STYLE[result.verdict] ?? VERDICT_STYLE.UNKNOWN) : null
  const MomIcon = result?.momentum ? (MOMENTUM_ICON[result.momentum] ?? Minus) : Minus

  return (
    <AppShell title="Quick Verdict" subtitle="Type any product — get an instant buy / skip call from live market data">
      <div className="max-w-2xl">
        {/* Search */}
        <div className="flex gap-2 mb-6">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && run()}
            placeholder="e.g. Adidas Samba, Nike Air Force 1, Levi's 501"
            className="flex-1 bg-[#1a2030] border border-[#263147] rounded-lg px-4 py-3 text-[14px] text-[#e8ecf4] outline-none focus:border-emerald-500/60 placeholder:text-[#546380]" />
          <button onClick={() => run()} disabled={loading || !query.trim()}
            className="px-5 py-3 rounded-lg text-[13px] font-bold bg-emerald-400 text-[#06090c] hover:bg-emerald-300 transition-colors disabled:opacity-40 flex items-center gap-2">
            <Zap size={15} />{loading ? "Checking…" : "Get verdict"}
          </button>
        </div>

        {error && <div className="text-[13px] text-red-400 mb-4">{error}</div>}

        {result && vs && (
          <div className="bg-[#141820] border border-[#1e2535] rounded-xl overflow-hidden">
            {/* Verdict header */}
            <div className="p-6 flex items-center justify-between border-b border-[#1e2535]">
              <div>
                <div className="text-[15px] font-semibold text-[#eef1f7]">{result.product || query}</div>
                {result.category && <div className="text-[12px] text-[#5b6b8c] mt-0.5">{result.category}</div>}
              </div>
              <div className="text-right">
                <div className="px-4 py-2 rounded-lg text-[15px] font-extrabold tracking-wide"
                  style={{ color: vs.color, background: vs.bg, border: `1px solid ${vs.border}` }}>
                  {vs.label}
                </div>
                {result.confidence && (
                  <div className="text-[10px] text-[#5b6b8c] uppercase tracking-wide mt-1.5">
                    Confidence {result.confidence}
                  </div>
                )}
              </div>
            </div>

            {result.verdict === "UNKNOWN" || result.verdict === "INSUFFICIENT_DATA" ? (
              // INSUFFICIENT_DATA belongs here, NOT in the metrics branch below.
              // The server withholds every number behind it, so the grid would
              // render a row of em-dashes — the same thing the `locked` branch
              // avoids for the same reason. The backend's own message explains
              // WHY (thin sample, or a brand whose sales we cannot observe yet),
              // and it is the only useful thing on the card.
              <div className="p-6 text-[13px] text-[#8b99b8]">
                {result.message || "Not enough market data on this product yet. Try a more common brand + model."}
              </div>
            ) : result.locked ? (
              // Server withheld every number. Rendering the metric grid here
              // would just print a row of em-dashes, which reads as "we have no
              // data" rather than "this is behind a plan".
              <div className="p-6 pt-5">
                <div className="text-[13px] leading-6 text-[#8b99b8]">
                  This is the headline call on{" "}
                  <span className="font-semibold text-[#eef1f7]">{result.product || query}</span>,
                  computed from live sold listings across 5 EU markets.
                </div>
                <UnlockPanel result={result} onUnlock={unlock} unlocking={unlocking} />
              </div>
            ) : (
              <>
                {/* Metrics grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-[#1e2535] border-b border-[#1e2535]">
                  <Metric label="Buy below" value={result.buy_below != null ? eur(result.buy_below) : "—"} accent="#34d399" />
                  <Metric label="Median sold" value={<MedianN median={result.sell_avg} n={result.n ?? result.sold_7d} />} />
                  {result.sell_through_rate
                    ? <Metric label="Sell-through" value={result.sell_through_rate} />
                    : <Metric label="Sold / 7d" value={result.sold_7d != null ? result.sold_7d.toLocaleString() : "—"} />}
                  {result.buy_below != null && result.sell_avg != null
                    ? <Metric label="Buying room" value={eur(Math.max(0, result.sell_avg - result.buy_below))} accent="#34d399" />
                    : result.sell_through_rate
                    ? <Metric label="Opportunity" value={result.opportunity_score != null ? `${Math.round(result.opportunity_score)}/100` : "—"} />
                    : <Metric label="Listed now" value={result.active_listings != null ? result.active_listings.toLocaleString() : "—"} />}
                </div>

                {/* Momentum + sizes */}
                <div className="p-6 flex flex-wrap items-center gap-x-8 gap-y-3 border-b border-[#1e2535]">
                  {result.momentum && (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[#546380] uppercase tracking-wide">Momentum</span>
                      <span className="flex items-center gap-1 text-[13px] font-semibold text-[#e8ecf4]">
                        <MomIcon size={14} /> {result.momentum}
                      </span>
                    </div>
                  )}
                  {result.top_sizes && result.top_sizes.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[#546380] uppercase tracking-wide">Hot sizes</span>
                      <span className="flex gap-1">
                        {result.top_sizes.slice(0, 5).map(s => (
                          <span key={s} className="px-2 py-0.5 rounded bg-[#1a2030] border border-[#263147] text-[11px] text-[#a9b6d0]">{s}</span>
                        ))}
                      </span>
                    </div>
                  )}
                </div>

                {/* Reasons */}
                {result.reasons && result.reasons.length > 0 && (
                  <div className="p-6">
                    <div className="text-[11px] text-[#546380] uppercase tracking-wide mb-3">Why</div>
                    <ul className="flex flex-col gap-2">
                      {result.reasons.map((r, i) => (
                        <li key={i} className="flex gap-2 text-[13px] text-[#a9b6d0]">
                          <span className="text-emerald-400 mt-0.5">•</span>{r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {!result && !loading && (
          <div className="text-[13px] text-[#5b6b8c] bg-[#12151d] border border-[#1c2333] rounded-xl p-6">
            Enter a brand and model. You get BUY, WATCH or SKIP plus the reason — from watched sold listings, not a model guessing.
          </div>
        )}
      </div>
    </AppShell>
  )
}

function Metric({ label, value, accent }: { label: string; value: ReactNode; accent?: string }) {
  return (
    <div className="p-5">
      <div className="text-[10px] text-[#546380] uppercase tracking-wide mb-1.5">{label}</div>
      <div className="text-[18px] font-bold" style={{ color: accent || "#e8ecf4" }}>{value}</div>
    </div>
  )
}
