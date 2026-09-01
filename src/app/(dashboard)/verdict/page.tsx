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
import { watchedSampleNote } from "@/lib/watched-sample"
import { trackEvent } from "@/lib/analytics"

const VERDICT_STYLE: Record<string, { color: string; bg: string; border: string; label: string }> = {
  BUY:     { color: "var(--color-buy)", bg: "rgba(34,197,94,.10)", border: "rgba(34,197,94,.35)", label: "BUY" },
  WATCH:   { color: "var(--color-watch)", bg: "rgba(245,158,11,.10)", border: "rgba(245,158,11,.35)", label: "WATCH" },
  SKIP:    { color: "var(--color-skip)", bg: "rgba(239,68,68,.10)", border: "rgba(239,68,68,.35)", label: "SKIP" },
  UNKNOWN: { color: "var(--color-unknown)", bg: "rgba(139,153,184,.10)", border: "rgba(139,153,184,.30)", label: "NO DATA" },
  // Distinct from NO DATA on purpose: we found the product, we just will not
  // put a call on it. "NOT MEASURED" says the gap is ours, not the market's.
  INSUFFICIENT_DATA: { color: "var(--color-unknown)", bg: "rgba(139,153,184,.10)", border: "rgba(139,153,184,.30)", label: "NOT MEASURED" },
  // A quota state, not a verdict about the item — was silently falling back
  // to VERDICT_STYLE.UNKNOWN ("NO DATA") below, which reads as "we don't
  // track this product" to a paying-eligible signed-in customer who just hit
  // their own daily cap. Never amber (that's WATCH); same neutral as UNKNOWN.
  // docs/audit/MONETIZATION.md #2.
  LIMIT_REACHED: { color: "var(--color-unknown)", bg: "rgba(139,153,184,.10)", border: "rgba(139,153,184,.30)", label: "LIMIT REACHED" },
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
      trackEvent("verdict_seen")
      trackEvent("analysis_completed")
    } catch (e) {
      trackEvent("analysis_failed")
      setError(e instanceof Error ? e.message : "We couldn't find enough comparable sales to finish that check. Try again, or a more specific model name.")
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
  const sampleNote = result
    ? watchedSampleNote(result.sold_7d ?? result.n, result.active_listings, result.verdict)
    : null
  const honestyNote = sampleNote
    || result?.confidence_note
    || (result?.confidence === "LOW" && (result.n ?? result.sold_7d) != null
      ? `Only ${result.n ?? result.sold_7d} comparable sold items`
      : null)

  return (
    <AppShell title="Quick Verdict" subtitle="Type any product — BUY / WATCH / SKIP from watched sold listings">
      <div className="max-w-2xl">
        {/* Search */}
        <div className="flex gap-2 mb-6">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && run()}
            placeholder="e.g. Adidas Samba, Nike Air Force 1, New Balance 530"
            className="flex-1 bg-[#1a2030] border border-[#263147] rounded-lg px-4 py-3 text-[14px] text-[#e8ecf4] outline-none focus:border-emerald-500/60 placeholder:text-[#546380]" />
          <button onClick={() => run()} disabled={loading || !query.trim()}
            className="px-5 py-3 rounded-lg text-[13px] font-bold bg-emerald-400 text-[#06090c] hover:bg-emerald-300 transition-colors disabled:opacity-40 flex items-center gap-2">
            <Zap size={15} />{loading ? "Looking up watched sales…" : "Check market"}
          </button>
        </div>

        {error && <div className="text-[13px] text-red-400 mb-4">{error}</div>}

        {result && vs && (
          <div className="bg-[#141820] border border-[#1e2535] rounded-xl overflow-hidden">
            {/* Verdict header */}
            <div className="p-6 flex items-center justify-between border-b border-[#1e2535]">
              <div>
                <div className="text-[11px] text-[#546380] uppercase tracking-wide mb-1">Decision</div>
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
                    {result.provisional ? " · provisional" : ""}
                  </div>
                )}
              </div>
            </div>

            {honestyNote && (
              <div className="px-6 py-3 border-b border-[#1e2535] text-[12.5px] text-[#c4a574] bg-[#16140f]">
                {honestyNote}
              </div>
            )}

            {result.verdict === "UNKNOWN" || result.verdict === "INSUFFICIENT_DATA" || result.verdict === "LIMIT_REACHED" ? (
              // INSUFFICIENT_DATA/LIMIT_REACHED belong here, NOT in the metrics
              // branch below. The server withholds every number behind them, so
              // the grid would render a row of em-dashes — the same thing the
              // `locked` branch avoids for the same reason. Before this branch
              // included LIMIT_REACHED, that verdict fell through to the metrics
              // grid and rendered as four "—" tiles under a silent "NO DATA" —
              // indistinguishable from a genuine coverage gap, and the server's
              // own message ("Free tier: N verdicts/day...") was computed and
              // sent but never shown anywhere. docs/audit/MONETIZATION.md #2.
              <div className="p-6 text-[13px] text-[#8b99b8]">
                {result.message || "Not enough market data on this product yet. Try a more common brand + model."}
                {result.verdict === "LIMIT_REACHED" && (
                  <div className="mt-3">
                    <a href="/account" className="text-[12.5px] text-[#8fa3c4] underline decoration-[#2a3550] underline-offset-2">See plans →</a>
                  </div>
                )}
              </div>
            ) : result.locked ? (
              // Server withheld the paid numbers. Confidence + comparable count
              // stay visible so the headline does not look like magical AI.
              <div className="p-6 pt-5">
                <div className="text-[13px] leading-6 text-[#8b99b8]">
                  This is the headline call on{" "}
                  <span className="font-semibold text-[#eef1f7]">{result.product || query}</span>,
                  computed from watched sold listings across 5 EU markets.
                </div>
                <UnlockPanel result={result} onUnlock={unlock} unlocking={unlocking} />
              </div>
            ) : (
              <>
                {/* WHY before numbers — DECISION → REASON → NUMBER → EVIDENCE */}
                {result.reasons && result.reasons.length > 0 && (
                  <div className="p-6 border-b border-[#1e2535]">
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

                <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-[#1e2535] border-b border-[#1e2535]">
                  <Metric label="Buy below" value={result.buy_below != null ? eur(result.buy_below) : "—"} accent="var(--color-buy)" />
                  <Metric label="Avg sold" value={<MedianN median={result.sell_median ?? result.sell_avg} n={result.n ?? result.sold_7d} />} />
                  {result.sell_through_rate
                    ? <Metric label="Sell-through" value={result.sell_through_rate} />
                    : <Metric label="Sold / 7d" value={result.sold_7d != null ? result.sold_7d.toLocaleString() : "—"} />}
                  {result.buy_below != null && result.sell_avg != null
                    ? <Metric label="Target net" value={eur(Math.max(0, result.sell_avg - result.buy_below))} accent="var(--color-buy)" />
                    : result.sell_through_rate
                    ? <Metric label="Opportunity" value={result.opportunity_score != null ? `${Math.round(result.opportunity_score)}/100` : "—"} />
                    : <Metric label="Listed now" value={result.active_listings != null ? result.active_listings.toLocaleString() : "—"} />}
                </div>

                <div className="p-6 flex flex-wrap items-center gap-x-8 gap-y-3">
                  {result.momentum && (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[#546380] uppercase tracking-wide">Demand</span>
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
