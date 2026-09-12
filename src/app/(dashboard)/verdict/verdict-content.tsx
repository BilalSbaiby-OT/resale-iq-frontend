"use client"
import { useState, useEffect, useCallback, Suspense, type ReactNode } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { getVerdict } from "@/lib/api"
import { eur, getToken } from "@/lib/utils"
import type { VerdictResult } from "@/types"
import { Zap, Lock } from "lucide-react"
import { fieldState } from "@/lib/locked-fields"
import { UnlockPanel } from "@/components/ui/unlock-panel"
import { MedianN } from "@/components/ui/median-n"
import { MomentumBadge } from "@/components/ui/momentum-badge"
import { watchedSampleNote } from "@/lib/watched-sample"
import { trackEvent } from "@/lib/analytics"
import { useLocale } from "@/components/i18n/locale-provider"
import { navCopy } from "@/lib/nav-copy"
import { verdictCopy, type VerdictCopy } from "@/lib/verdict-copy"
import { copy, type Locale } from "@/lib/i18n"
import { WORKING_MODELS } from "@/lib/working-models"
import { ModelChips } from "@/components/tools/model-chips"
import type { HeroVerdict } from "@/lib/hero-verdict"
import { seedWorthShowing } from "@/lib/seed-verdict"

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

/*
 * The momentum arrows are gone, and so is the raw enum they sat beside.
 *
 * `↑ RISING` made the same claim twice — once in English the reader may not
 * speak, once in a glyph that needs no translation at all — and the backend
 * measures neither. `momentum_label` is a percentile bucket
 * (`momentum_label_from_percentile`), invariant to whether sales are climbing
 * or collapsing: replayed on the live board with every model's weekly sales cut
 * 99%, all 100 labels came back identical. A trend arrow is the least
 * defensible way to render a number that cannot see a trend.
 *
 * This card now shows the same `MomentumBadge` as /deals, /dashboard, /trends
 * and /watchlist, so the rank reads identically wherever a customer meets it.
 */

type SeedProps = { seedQuery: string; seedResult: HeroVerdict | null }

export function VerdictContent({ seedQuery, seedResult }: SeedProps) {
  return (
    <Suspense fallback={<AppShell title="Check"><div /></AppShell>}>
      <VerdictInner seedQuery={seedQuery} seedResult={seedResult} />
    </Suspense>
  )
}

function VerdictInner({ seedQuery, seedResult }: SeedProps) {
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
      // why: not swallowed — the failure is counted (analysis_failed, the
      // funnel's own drop-off signal) and shown to the customer verbatim when
      // the API gave a reason. Rethrowing here would replace a readable
      // message with a blank error boundary.
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
      // why: an unlock that fails must SAY so on the card, because the visitor
      // has to know whether their lifetime unlock budget was spent. The
      // rendered message is the report; a rethrow would blank the result they
      // were looking at and tell them less.
      setError(t.unlockError)
    } finally { setUnlocking(false) }
  }, [result, query, t.unlockError])

  useEffect(() => {
    const q = params.get("q")
    if (q) { setQuery(q); run(q) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const vs = result ? (styles[result.verdict as keyof typeof styles] ?? styles.UNKNOWN) : null
  const opportunityState = fieldState(result?.opportunity_score, result?.locked_fields, "opportunity_score")
  // TWO REAL COUNTS, NEVER INTERCHANGEABLE — and this card shows both, so each
  // has to be the right one under its own label:
  //   sold_7d — every watched departure in the window (Samba: 43). What the
  //             sample sentence below counts.
  //   n       — `comparable_n`, the fenced subset of clean comps the price and
  //             the confidence band are computed from (Samba: 20). What the
  //             "n" beside the exit price counts, and what confidence_note
  //             quotes ("Only 20 watched departures").
  // The `??` fallbacks that used to be on both lines let each render the other
  // one under its own label. Nothing substitutes for a missing count now: the
  // line just does not render.
  const sampleNote = result
    ? watchedSampleNote(result.sold_7d, result.active_listings, result.verdict, locale)
    : null
  const honestyNote = sampleNote
    || (result?.confidence === "LOW" && result.n != null
      ? `Only ${result.n} comparable departures`
      : null)

  // THE WORKED EXAMPLE. Shown only on a genuinely cold screen: no result, not
  // loading, and no `?q=` in the URL (a deep link is about to run its own
  // query, and the seed must not flash in the tick before the effect fires).
  // A seed without a buy-below is not worth the space — the priced item-level
  // answer IS the demonstration — so it is dropped rather than rendered hollow.
  const seed = seedWorthShowing(seedResult)
  const showSeed = seed && !result && !loading && !params.get("q")

  return (
    <AppShell title={checkLabel}>
      <div className="max-w-3xl mx-auto pt-8">
        <h1 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 700, letterSpacing: "-1.6px", lineHeight: 1.05, margin: "0 0 28px" }}>
          {t.heading}
        </h1>
        <div className="flex gap-2 mb-8">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && run()}
            placeholder={t.placeholder}
            className="flex-1 bg-[#0f1218] border border-[rgba(255,255,255,0.12)] rounded-2xl px-5 py-4 text-[17px] text-[#e8ecf4] outline-none focus:border-emerald-500/60 placeholder:text-[#546380]" />
          <button onClick={() => run()} disabled={loading || !query.trim()}
            className="px-6 py-4 rounded-2xl text-[16px] font-bold bg-emerald-400 text-[#06090c] hover:bg-emerald-300 transition-colors disabled:opacity-40 flex items-center gap-2">
            <Zap size={16} />{loading ? t.checking : t.check}
          </button>
        </div>

        {error && <div className="text-[13px] text-red-400 mb-4">{error}</div>}

        {result && vs && (
          <div className="bg-[#141820] border border-[rgba(255,255,255,0.07)] rounded-xl overflow-hidden">
            <div className="p-6 flex items-center justify-between border-b border-[rgba(255,255,255,0.07)]">
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
              <div className="px-6 py-3 border-b border-[rgba(255,255,255,0.07)] text-[12.5px] text-[#FF9F0A] bg-[#16140f]">
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
                <ModelChips onPick={pickModel} disabled={loading} label={t.tryTheseInstead} examples={WORKING_MODELS} testId="riq-working-models" />
                {result.category_aggregates && result.category_aggregates.length > 0 && (
                  <div className="flex flex-col gap-2 mt-4">
                    {result.category_aggregates.map(a => (
                      <button
                        key={a.category}
                        onClick={() => { const nq = `${result.brand} ${a.category}`; setQuery(nq); run(nq) }}
                        className="flex items-center justify-between bg-[#1a2030] border border-[rgba(255,255,255,0.12)] rounded-lg px-4 py-3 text-left hover:border-emerald-500/60 transition-colors"
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
                <div className="grid grid-cols-2 sm:grid-cols-3 divide-x divide-[rgba(255,255,255,0.07)] border-b border-[rgba(255,255,255,0.07)]">
                  <Metric label={t.avgAtExit} value={result.sell_avg != null ? eur(result.sell_avg) : "—"} />
                  <Metric label={t.leftShelf} value={result.sold_7d != null ? result.sold_7d.toLocaleString() : "—"} />
                  <Metric label={t.listedNow} value={result.active_listings != null ? result.active_listings.toLocaleString() : "—"} />
                </div>
                <div className="p-6">
                  <ModelChips onPick={pickModel} disabled={loading} label={t.tryTheseInstead} examples={WORKING_MODELS} testId="riq-working-models" />
                </div>
              </>
            ) : result.verdict === "UNKNOWN" || result.verdict === "INSUFFICIENT_DATA" ? (
              <div className="p-6 text-[13px] text-[#8b99b8]">
                <p>{t.unknownBody}</p>
                <ModelChips onPick={pickModel} disabled={loading} label={t.tryTheseInstead} examples={WORKING_MODELS} testId="riq-working-models" />
              </div>
            ) : result.sell_through_rate == null ? (
              <div className="p-6 pt-5">
                <div className="text-[13px] leading-6 text-[#8b99b8]">
                  {t.headlineCall(result.product || query)}
                </div>
                <UnlockPanel result={result} onUnlock={unlock} unlocking={unlocking} isAuthenticated={getToken() != null} />
                <ModelChips onPick={pickModel} disabled={loading} label={t.tryTheseInstead} examples={WORKING_MODELS} testId="riq-working-models" />
              </div>
            ) : (
              <>
                {result.reasons && result.reasons.length > 0 && (
                  <div className="p-6 border-b border-[rgba(255,255,255,0.07)]">
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

                <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-[rgba(255,255,255,0.07)] border-b border-[rgba(255,255,255,0.07)]">
                  <Metric label={t.buyBelow} value={result.buy_below != null ? eur(result.buy_below) : "—"} accent="var(--color-buy)" />
                  {/* n here is comparable_n, not sold_7d — see the sampleNote
                      comment above. nKind makes the tooltip say which, because
                      the sample sentence on this same card quotes the other. */}
                  <Metric label={t.avgAtExit} value={<MedianN median={result.sell_median ?? result.sell_avg} n={result.n} nKind="comparable" />} />
                  {result.sell_through_rate
                    ? <Metric label={t.sellThrough} value={result.sell_through_rate} />
                    : <Metric label={t.leftShelf} value={result.sold_7d != null ? result.sold_7d.toLocaleString() : "—"} />}
                  {result.buy_below != null && result.sell_avg != null
                    ? <Metric label={t.targetNet} value={eur(Math.max(0, result.sell_avg - result.buy_below))} accent="var(--color-buy)" />
                    : result.sell_through_rate
                    /* opportunity_score is a locked_fields member. When the
                       server withheld it, "—" claimed we had nothing to say
                       about an item we had simply declined to rate for this
                       plan — the same lie score-bar.tsx already refuses to
                       tell with `score ?? 0`. Show the lock and the way past
                       it instead; only a genuinely unrated item keeps a dash. */
                    ? <Metric
                        label={t.opportunity}
                        value={
                          opportunityState === "value"
                            ? `${Math.round(result.opportunity_score!)}/100`
                            : opportunityState === "locked"
                            ? <LockedMetricValue label={checker.planLabel} cta={checker.unlockRest} />
                            : "—"
                        } />
                    : <Metric label={t.listedNow} value={result.active_listings != null ? result.active_listings.toLocaleString() : "—"} />}
                </div>

                <div className="p-6 flex flex-wrap items-center gap-x-8 gap-y-3">
                  {result.momentum && (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[#546380] uppercase tracking-wide">{t.demand}</span>
                      {/* No sold_30d on the verdict payload, so the hover states
                          the rank without a share it cannot compute. */}
                      <MomentumBadge momentum={result.momentum} size="md" />
                    </div>
                  )}
                  {result.top_sizes && result.top_sizes.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[#546380] uppercase tracking-wide">{t.hotSizes}</span>
                      <span className="flex gap-1">
                        {result.top_sizes.slice(0, 5).map(s => (
                          <span key={s} className="px-2 py-0.5 rounded bg-[#1a2030] border border-[rgba(255,255,255,0.12)] text-[11px] text-[#a9b6d0]">{s}</span>
                        ))}
                      </span>
                    </div>
                  )}
                </div>

                {/* EXP-5 activation nudge. A priced verdict used to end here with
                    no next step, so the visitor's first real answer was also
                    their last action — 0 of 7 signups ever ran a check on a
                    second day (measured 2026-09-06). This reuses the SAME
                    one-click ModelChips path the cold/UNKNOWN/brand branches
                    already use, so a 2nd analysis is one tap away the moment the
                    first one lands. Frontend only — the in-session 2nd check.
                    The cross-day return (the strict activation metric) needs a
                    day-2 email trigger, specced for Eng on the BOARD. */}
                <div className="px-6 pb-6 pt-1 border-t border-[rgba(255,255,255,0.07)]">
                  <ModelChips onPick={pickModel} disabled={loading} label={t.checkAnother} examples={WORKING_MODELS} testId="riq-check-another" />
                </div>
              </>
            )}
          </div>
        )}

        {showSeed && (
          <SeedVerdictCard t={t} locale={locale} styles={styles} query={seedQuery} result={seed} />
        )}

        {!result && !loading && (
          <div className="text-[13px] text-[#5b6b8c] bg-[#12151d] border border-[#1c2333] rounded-xl p-6 mt-6">
            <p>{t.empty}</p>
            <ModelChips onPick={pickModel} disabled={loading} label={t.tryTheseInstead} examples={WORKING_MODELS} testId="riq-working-models" />
          </div>
        )}
      </div>
    </AppShell>
  )
}

/**
 * The worked example on the cold first screen.
 *
 * A SEPARATE CARD ON PURPOSE, not the result card with a flag passed in. The
 * result card carries an UnlockPanel, an unlock button that spends real quota,
 * and eight rendering branches keyed off fields this payload does not have.
 * Wiring a demo through all of that would put a spend-my-unlock control on a
 * row the visitor never asked for. This renders exactly the four fields the
 * anonymous allowlist actually contains and nothing else.
 *
 * It fires NO analytics. `verdict_seen` and `analysis_completed` belong to
 * run(), which only a real query reaches — a seeded screen that counted itself
 * as an analysis would corrupt the one funnel this company steers by.
 *
 * The heading says "not your check" in all six locales rather than dressing
 * this up as the visitor's own result, because it isn't one.
 *
 * toLocaleString is passed the locale explicitly. Without it the server picks
 * the container's default and the browser picks the visitor's, and this card —
 * unlike everything else on this page — is server-rendered, so the two have to
 * agree or React tears the whole tree down on hydration.
 */
function SeedVerdictCard({
  t, locale, styles, query, result,
}: {
  t: VerdictCopy
  locale: Locale
  styles: ReturnType<typeof verdictStyle>
  query: string
  result: HeroVerdict
}) {
  const vs = styles[result.verdict as keyof typeof styles] ?? styles.UNKNOWN
  const product = result.product || query
  const sample = watchedSampleNote(result.sold_7d, result.active_listings, result.verdict, locale)
  return (
    <div data-testid="riq-seed-verdict" className="bg-[#141820] border border-[rgba(255,255,255,0.07)] rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-[rgba(255,255,255,0.07)] bg-[#12151d]">
        <div className="text-[10px] text-[#546380] uppercase tracking-wide mb-1.5">{t.seedLabel}</div>
        <div className="text-[12.5px] text-[#8b99b8] leading-5">{t.seedIntro(product)}</div>
      </div>

      <div className="p-6 flex items-center justify-between border-b border-[rgba(255,255,255,0.07)]">
        <div>
          <div className="text-[11px] text-[#546380] uppercase tracking-wide mb-1">{t.decision}</div>
          <div className="text-[15px] font-semibold text-[#eef1f7]">{product}</div>
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
            </div>
          )}
        </div>
      </div>

      {sample && (
        <div className="px-6 py-3 border-b border-[rgba(255,255,255,0.07)] text-[12.5px] text-[#FF9F0A] bg-[#16140f]">
          {sample}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-[rgba(255,255,255,0.07)]">
        <Metric label={t.buyBelow} value={eur(result.buy_below)} accent="var(--color-buy)" />
        <Metric label={t.avgAtExit} value={eur(result.sell_avg)} />
        <Metric label={t.leftShelf} value={result.sold_7d != null ? result.sold_7d.toLocaleString(locale) : "—"} />
        <Metric label={t.listedNow} value={result.active_listings != null ? result.active_listings.toLocaleString(locale) : "—"} />
      </div>
    </div>
  )
}

/**
 * The value half of a Metric when the server withheld the number.
 *
 * Sits inside the existing Metric shell rather than replacing it, so the
 * four-column grid keeps its shape and the field's own label stays visible —
 * the visitor should learn that we measure opportunity, not that a column
 * vanished. No number, blurred or otherwise: the value is absent from the
 * payload, never redacted client-side.
 *
 * The unlock route for this card is the UnlockPanel above, which is already
 * mounted on the gated branch and carries the account-aware ask (anonymous /
 * unverified / budget left / exhausted). Repeating a competing CTA in a
 * 5-line-tall grid cell would be a second, worse version of that panel, so
 * this points at it in words and lets it do the selling.
 */
function LockedMetricValue({ label, cta }: { label: string; cta: string }) {
  return (
    <span data-testid="riq-locked-metric" title={cta} className="inline-flex items-center gap-1.5">
      <Lock size={14} className="text-amber-400" aria-hidden />
      <span className="text-[15px] font-bold text-[#c3cde0]">{label}</span>
    </span>
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
