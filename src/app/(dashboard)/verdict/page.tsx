"use client"
import { useState, useEffect, useCallback, Suspense, type ReactNode } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { getVerdict } from "@/lib/api"
import { eur } from "@/lib/utils"
import type { VerdictResult } from "@/types"
import { Zap, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { UnlockPanel } from "@/components/ui/unlock-panel"
import { MedianN } from "@/components/ui/median-n"
import { watchedSampleNote } from "@/lib/watched-sample"
import { trackEvent } from "@/lib/analytics"
import { useLocale } from "@/components/i18n/locale-provider"
import { navCopy } from "@/lib/nav-copy"
import { verdictCopy, type VerdictCopy } from "@/lib/verdict-copy"
import { copy } from "@/lib/i18n"
import { WORKING_MODELS } from "@/lib/working-models"

function verdictStyle(label: Pick<VerdictCopy, "noData" | "notMeasured" | "limitReached" | "marketData" | "brandAverage">) {
  return {
    BUY:     { color: "var(--color-buy)", bg: "rgba(34,197,94,.10)", border: "rgba(34,197,94,.35)", label: "BUY" },
    WATCH:   { color: "var(--color-watch)", bg: "rgba(245,158,11,.10)", border: "rgba(245,158,11,.35)", label: "WATCH" },
    SKIP:    { color: "var(--color-skip)", bg: "rgba(239,68,68,.10)", border: "rgba(239,68,68,.35)", label: "SKIP" },
    UNKNOWN: { color: "var(--color-unknown)", bg: "rgba(139,153,184,.10)", border: "rgba(139,153,184,.30)", label: label.noData },
    INSUFFICIENT_DATA: { color: "var(--color-unknown)", bg: "rgba(139,153,184,.10)", border: "rgba(139,153,184,.30)", label: label.notMeasured },
    LIMIT_REACHED: { color: "var(--color-unknown)", bg: "rgba(139,153,184,.10)", border: "rgba(139,153,184,.30)", label: label.limitReached },
    BRAND_CATEGORIES: { color: "var(--color-unknown)", bg: "rgba(139,153,184,.10)", border: "rgba(139,153,184,.30)", label: label.marketData },
    BRAND_AVERAGE:     { color: "var(--color-unknown)", bg: "rgba(139,153,184,.10)", border: "rgba(139,153,184,.30)", label: label.brandAverage },
  }
}

const MOMENTUM_ICON: Record<string, typeof TrendingUp> = {
  HOT: TrendingUp, RISING: TrendingUp, STABLE: Minus, FADING: TrendingDown, DEAD: TrendingDown,
}

function WorkingModelsRow({
  onPick, disabled, label,
}: {
  onPick: (q: string) => void
  disabled: boolean
  label: string
}) {
  return (
    <div className="mt-4" data-testid="riq-working-models">
      <div className="text-[11px] text-[#5b6b8c] uppercase tracking-wide mb-2">{label}</div>
      <div className="flex flex-wrap gap-2">
        {WORKING_MODELS.map(ex => (
          <button
            key={ex}
            type="button"
            onClick={() => onPick(ex)}
            disabled={disabled}
            className="bg-[#1a2030] border border-[#263147] text-[#c3cde0] text-[12.5px] px-3 py-1.5 rounded-full hover:border-emerald-500/60 disabled:opacity-50"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function VerdictPage() {
  return (
    <Suspense fallback={<AppShell title="Check"><div /></AppShell>}>
      <VerdictInner />
    </Suspense>
  )
}

function VerdictInner() {
  const locale = useLocale()
  const t = verdictCopy[locale]
  const checker = copy[locale].checker
  const checkLabel = navCopy[locale].items.check
  const styles = verdictStyle(t)
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
      setError(e instanceof Error ? e.message : t.errorGeneric)
    } finally { setLoading(false) }
  }, [query, t.errorGeneric])

  const pickModel = (q: string) => { setQuery(q); run(q) }

  const unlock = useCallback(async () => {
    const q = (result?.product || query).trim()
    if (!q) return
    setUnlocking(true)
    try {
      setResult(await getVerdict(q, true))
    } catch {
      setError(t.unlockError)
    } finally { setUnlocking(false) }
  }, [result, query, t.unlockError])

  useEffect(() => {
    const q = params.get("q")
    if (q) { setQuery(q); run(q) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const vs = result ? (styles[result.verdict as keyof typeof styles] ?? styles.UNKNOWN) : null
  const MomIcon = result?.momentum ? (MOMENTUM_ICON[result.momentum] ?? Minus) : Minus
  const sampleNote = result
    ? watchedSampleNote(result.sold_7d ?? result.n, result.active_listings, result.verdict, locale)
    : null
  const honestyNote = sampleNote
    || (result?.confidence === "LOW" && (result.n ?? result.sold_7d) != null
      ? `Only ${result.n ?? result.sold_7d} comparable departures`
      : null)

  return (
    <AppShell title={checkLabel}>
      <div className="max-w-xl mx-auto pt-8">
        <h1 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 700, letterSpacing: "-1.6px", lineHeight: 1.05, margin: "0 0 28px" }}>
          {t.heading}
        </h1>
        <div className="flex gap-2 mb-8">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && run()}
            placeholder={t.placeholder}
            className="flex-1 bg-[#0f1218] border border-[#2a3348] rounded-2xl px-5 py-4 text-[17px] text-[#e8ecf4] outline-none focus:border-emerald-500/60 placeholder:text-[#546380]" />
          <button onClick={() => run()} disabled={loading || !query.trim()}
            className="px-6 py-4 rounded-2xl text-[16px] font-bold bg-emerald-400 text-[#06090c] hover:bg-emerald-300 transition-colors disabled:opacity-40 flex items-center gap-2">
            <Zap size={16} />{loading ? t.checking : t.check}
          </button>
        </div>

        {error && <div className="text-[13px] text-red-400 mb-4">{error}</div>}

        {result && vs && (
          <div className="bg-[#141820] border border-[#1e2535] rounded-xl overflow-hidden">
            <div className="p-6 flex items-center justify-between border-b border-[#1e2535]">
              <div>
                <div className="text-[11px] text-[#546380] uppercase tracking-wide mb-1">{t.decision}</div>
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
                    {t.confidence} {result.confidence}
                    {result.provisional ? ` · ${t.provisional}` : ""}
                  </div>
                )}
              </div>
            </div>

            {honestyNote && result.verdict !== "BRAND_CATEGORIES" && (
              <div className="px-6 py-3 border-b border-[#1e2535] text-[12.5px] text-[#c4a574] bg-[#16140f]">
                {honestyNote}
              </div>
            )}

            {result.verdict === "LIMIT_REACHED" ? (
              <div className="p-6 text-[13px] text-[#8b99b8] leading-6">
                <p>{t.limitReachedBody}</p>
                {result.used_today != null && result.limit != null && (
                  <p className="mt-1.5 text-[12px] text-[#5b6b8c]">
                    {t.usedOfLimit(result.used_today, result.limit)}
                  </p>
                )}
                <Link
                  href="/account"
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-bold bg-emerald-400 text-[#06090c] hover:bg-emerald-300 transition-colors"
                >
                  {t.seePlans}
                </Link>
              </div>
            ) : result.verdict === "BRAND_CATEGORIES" ? (
              <div className="p-6">
                <div className="text-[13px] leading-6 text-[#8b99b8] mb-4">
                  {checker.brandCategoriesIntro(
                    result.brand ?? query,
                    new Intl.ListFormat(locale, { style: "long", type: "conjunction" }).format(result.categories ?? []),
                  )}
                </div>
                <WorkingModelsRow onPick={pickModel} disabled={loading} label={t.tryTheseInstead} />
                {result.category_aggregates && result.category_aggregates.length > 0 && (
                  <div className="flex flex-col gap-2 mt-4">
                    {result.category_aggregates.map(a => (
                      <button
                        key={a.category}
                        onClick={() => { const nq = `${result.brand} ${a.category}`; setQuery(nq); run(nq) }}
                        className="flex items-center justify-between bg-[#1a2030] border border-[#263147] rounded-lg px-4 py-3 text-left hover:border-emerald-500/60 transition-colors"
                      >
                        <span className="text-[13px] font-medium text-[#e8ecf4]">{a.category}</span>
                        <span className="text-[12.5px] text-[#8b99b8]">
                          {a.avg_price_eur != null ? eur(a.avg_price_eur) : "—"} {t.avg} · {t.leftShelfCount(a.sold_7d.toLocaleString())}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : result.verdict === "BRAND_AVERAGE" ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 divide-x divide-[#1e2535] border-b border-[#1e2535]">
                  <Metric label={t.avgAtExit} value={result.sell_avg != null ? eur(result.sell_avg) : "—"} />
                  <Metric label={t.leftShelf} value={result.sold_7d != null ? result.sold_7d.toLocaleString() : "—"} />
                  <Metric label={t.listedNow} value={result.active_listings != null ? result.active_listings.toLocaleString() : "—"} />
                </div>
                <div className="p-6">
                  <WorkingModelsRow onPick={pickModel} disabled={loading} label={t.tryTheseInstead} />
                </div>
              </>
            ) : result.verdict === "UNKNOWN" || result.verdict === "INSUFFICIENT_DATA" ? (
              <div className="p-6 text-[13px] text-[#8b99b8]">
                <p>{t.unknownBody}</p>
                <WorkingModelsRow onPick={pickModel} disabled={loading} label={t.tryTheseInstead} />
              </div>
            ) : result.sell_through_rate == null ? (
              <div className="p-6 pt-5">
                <div className="text-[13px] leading-6 text-[#8b99b8]">
                  {t.headlineCall(result.product || query)}
                </div>
                <UnlockPanel result={result} onUnlock={unlock} unlocking={unlocking} />
                <WorkingModelsRow onPick={pickModel} disabled={loading} label={t.tryTheseInstead} />
              </div>
            ) : (
              <>
                {result.reasons && result.reasons.length > 0 && (
                  <div className="p-6 border-b border-[#1e2535]">
                    <div className="text-[11px] text-[#546380] uppercase tracking-wide mb-3">{t.why}</div>
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
                  <Metric label={t.buyBelow} value={result.buy_below != null ? eur(result.buy_below) : "—"} accent="var(--color-buy)" />
                  <Metric label={t.avgAtExit} value={<MedianN median={result.sell_median ?? result.sell_avg} n={result.n ?? result.sold_7d} />} />
                  {result.sell_through_rate
                    ? <Metric label={t.sellThrough} value={result.sell_through_rate} />
                    : <Metric label={t.leftShelf} value={result.sold_7d != null ? result.sold_7d.toLocaleString() : "—"} />}
                  {result.buy_below != null && result.sell_avg != null
                    ? <Metric label={t.targetNet} value={eur(Math.max(0, result.sell_avg - result.buy_below))} accent="var(--color-buy)" />
                    : result.sell_through_rate
                    ? <Metric label={t.opportunity} value={result.opportunity_score != null ? `${Math.round(result.opportunity_score)}/100` : "—"} />
                    : <Metric label={t.listedNow} value={result.active_listings != null ? result.active_listings.toLocaleString() : "—"} />}
                </div>

                <div className="p-6 flex flex-wrap items-center gap-x-8 gap-y-3">
                  {result.momentum && (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[#546380] uppercase tracking-wide">{t.demand}</span>
                      <span className="flex items-center gap-1 text-[13px] font-semibold text-[#e8ecf4]">
                        <MomIcon size={14} /> {result.momentum}
                      </span>
                    </div>
                  )}
                  {result.top_sizes && result.top_sizes.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[#546380] uppercase tracking-wide">{t.hotSizes}</span>
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
            <p>{t.empty}</p>
            <WorkingModelsRow onPick={pickModel} disabled={loading} label={t.tryTheseInstead} />
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
