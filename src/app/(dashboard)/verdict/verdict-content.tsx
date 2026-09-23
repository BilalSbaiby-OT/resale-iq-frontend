"use client"
import { useState, useEffect, useCallback, Suspense, type ReactNode } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { canonicalPath } from "@/lib/locale-routes"
import { AppShell } from "@/components/layout/app-shell"
import { getVerdict, isPaymentRequired, PaymentRequiredError } from "@/lib/api"
import { HardPaywallCard } from "@/components/ui/hard-paywall-card"
import { CoverageMissCard } from "@/components/ui/coverage-miss-card"
import { eur, getToken, getPlanFromToken } from "@/lib/utils"
import { formatStrPctString } from "@/lib/str-pct"
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
import { verdictWord } from "@/lib/verdict-words"
import { WORKING_MODELS, FREE_MODELS } from "@/lib/working-models"
import { ModelChips } from "@/components/tools/model-chips"
import type { HeroVerdict } from "@/lib/hero-verdict"
import { seedWorthShowing } from "@/lib/seed-verdict"
import { useAuthStore } from "@/lib/auth-store"
import { coldVerdictCtaKind } from "@/lib/cold-verdict-cta"
import { FIRST_CHECK_HREF } from "@/lib/checkout"
import { checkerFace } from "@/lib/query-coverage"
import {
  collectVerdictMetrics,
  hasVerdictIntelligence,
  measuredBuyAndSell,
  reconstructedNote,
  type CollectedMetric,
} from "@/lib/verdict-intelligence"
import { parsePaywallBody } from "@/lib/hard-paywall"

function verdictStyle(label: Pick<VerdictCopy, "noData" | "notMeasured" | "limitReached" | "marketData" | "brandAverage">, locale: Locale) {
  return {
    BUY:     { color: "var(--color-buy)", bg: "rgba(34,197,94,.10)", border: "rgba(34,197,94,.35)", label: verdictWord("BUY", locale) ?? "BUY" },
    WATCH:   { color: "var(--color-watch)", bg: "rgba(245,158,11,.10)", border: "rgba(245,158,11,.35)", label: verdictWord("WATCH", locale) ?? "WATCH" },
    SKIP:    { color: "var(--color-skip)", bg: "rgba(239,68,68,.10)", border: "rgba(239,68,68,.35)", label: verdictWord("SKIP", locale) ?? "SKIP" },
    UNKNOWN: { color: "var(--color-unknown)", bg: "rgba(139,153,184,.10)", border: "rgba(139,153,184,.30)", label: label.noData },
    INSUFFICIENT_DATA: { color: "var(--color-unknown)", bg: "rgba(139,153,184,.10)", border: "rgba(139,153,184,.30)", label: label.notMeasured },
    LIMIT_REACHED: { color: "var(--color-unknown)", bg: "rgba(139,153,184,.10)", border: "rgba(139,153,184,.30)", label: label.limitReached },
    BRAND_CATEGORIES: { color: "var(--color-unknown)", bg: "rgba(139,153,184,.10)", border: "rgba(139,153,184,.30)", label: label.marketData },
    BRAND_AVERAGE:     { color: "var(--color-unknown)", bg: "rgba(139,153,184,.10)", border: "rgba(139,153,184,.30)", label: label.brandAverage },
    // OVERSUPPLIED is an ANSWER — heavy supply, ~zero departures, so don't buy.
    // Without this entry it fell through to the UNKNOWN style and rendered
    // "NO DATA" on a query we CAN answer, then upsold €19 anyway.
    OVERSUPPLIED: { color: "var(--color-skip)", bg: "rgba(239,68,68,.10)", border: "rgba(239,68,68,.35)", label: "DON'T STOCK" },
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
  const styles = verdictStyle(t, locale)
  const params = useSearchParams()
  const { user } = useAuthStore()
  const paidCold = coldVerdictCtaKind(user?.plan, getPlanFromToken()) === "paid"
  const [query, setQuery] = useState("")
  const [result, setResult] = useState<VerdictResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [unlocking, setUnlocking] = useState(false)
  const [error, setError] = useState("")
  const [paywalled, setPaywalled] = useState(false)
  const [coverageMiss, setCoverageMiss] = useState(false)
  const [comparableN, setComparableN] = useState<number | null | undefined>(undefined)

  const run = useCallback(async (raw?: string) => {
    const q = (raw ?? query).trim()
    if (!q) return
    setLoading(true); setError(""); setResult(null); setPaywalled(false); setCoverageMiss(false); setComparableN(undefined)
    try {
      setResult(await getVerdict(q))
      trackEvent("verdict_seen")
      trackEvent("analysis_completed")
    } catch (e) {
      // why: every branch either re-renders a meaningful card (paywall/coverage/error)
      // or fires trackEvent("analysis_failed") — no silent drop.
      if (isPaymentRequired(e)) {
        const body = e instanceof PaymentRequiredError ? e.body : undefined
        if (checkerFace({ verdict: "PAYWALL", query: q, apiBody: body }) === "coverage") {
          setCoverageMiss(true)
          return
        }
        // why: 402 is the product under HARD_PAYWALL, not a failed check —
        // render the checkout card. Logging it as analysis_failed would
        // count the conversion face as a drop-off.
        const paywall = parsePaywallBody(402, body)
        setComparableN(paywall?.comparable_n)
        setPaywalled(true)
        return
      }
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
        <div className="riq-checker-row mb-8" style={{ width: "100%", maxWidth: "100%", minWidth: 0 }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && run()}
            placeholder={t.placeholder}
            style={{ width: "100%", maxWidth: "100%", minWidth: 0 }}
            className="bg-[#0f1218] border border-[rgba(255,255,255,0.12)] rounded-2xl px-5 py-4 text-[17px] text-[#e8ecf4] outline-none focus:border-emerald-500/60 placeholder:text-[var(--color-text-secondary)]" />
          <button onClick={() => run()} disabled={loading || !query.trim()}
            style={{ minWidth: 0, maxWidth: "100%" }}
            className="px-6 py-4 rounded-2xl text-[16px] font-bold bg-emerald-400 text-[#06090c] hover:bg-emerald-300 transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
            <Zap size={16} />{loading ? t.checking : t.check}
          </button>
        </div>

        {error && <div className="text-[13px] text-red-400 mb-4">{error}</div>}
        {coverageMiss && (
          <div style={{ background: "var(--color-graphite)", border: "1px solid var(--color-hairline)", borderRadius: 14, padding: 20, marginBottom: 24 }}>
            <CoverageMissCard locale={locale} query={query} onPick={pickModel} disabled={loading} />
          </div>
        )}
        {paywalled && (
          <div style={{ background: "var(--color-graphite)", border: "1px solid var(--color-hairline)", borderRadius: 14, padding: 20, marginBottom: 24 }}>
            <HardPaywallCard locale={locale} query={query} comparableN={comparableN} />
          </div>
        )}

        {result && vs && (
          <div className="bg-[var(--color-bg-3)] border border-[rgba(255,255,255,0.07)] rounded-xl overflow-hidden">
            <div className="riq-verdict-head p-6 border-b border-[rgba(255,255,255,0.07)]">
              <div className="riq-verdict-head-copy">
                <div className="text-[12px] text-[var(--color-text-secondary)] uppercase tracking-wide mb-1">{t.decision}</div>
                <div className="text-[15px] font-semibold text-[#eef1f7]">{result.product || query}</div>
                {result.category && <div className="text-[12px] text-[#5b6b8c] mt-0.5">{result.category}</div>}
              </div>
              <div className="riq-verdict-head-badge">
                <div className="px-4 py-2 rounded-lg text-[15px] font-extrabold tracking-wide"
                  style={{ color: vs.color, background: vs.bg, border: `1px solid ${vs.border}` }}>
                  {vs.label}
                </div>
                {result.confidence && (
                  <div className="text-[12px] text-[#5b6b8c] uppercase tracking-wide mt-1.5">
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

            {/* D-38 (2026-09-22): 30-day demand evidence for models admitted on
                30d sales but where weekly shelf departures are not yet observable.
                This is NOT the weekly "left shelf" count — label and copy are
                deliberately different. Only shown when sold_7d is absent/zero
                AND the backend supplied sold_30d_evidence with a demand_note. */}
            {result.sold_30d_evidence != null && (result.sold_7d == null || result.sold_7d === 0) && result.demand_note && result.verdict !== "BRAND_CATEGORIES" && (
              <div className="px-6 py-3 border-b border-[rgba(255,255,255,0.07)] text-[12.5px] text-[#8b99b8]">
                {result.demand_note}
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
                  href={paidCold ? "/account" : "/pricing"}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-bold bg-emerald-400 text-[#06090c] hover:bg-emerald-300 transition-colors"
                >
                  {paidCold ? t.managePlan : t.seePlans}
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
                <ModelChips onPick={pickModel} disabled={loading} label={t.tryTheseInstead} examples={FREE_MODELS} testId="riq-working-models" />
                {result.category_aggregates && result.category_aggregates.length > 0 && (
                  <div className="flex flex-col gap-2 mt-4">
                    {result.category_aggregates.map(a => (
                      <button
                        key={a.category}
                        onClick={() => { const nq = `${result.brand} ${a.category}`; setQuery(nq); run(nq) }}
                        className="flex items-center justify-between bg-[var(--color-surface-elevated)] border border-[rgba(255,255,255,0.12)] rounded-lg px-4 py-3 text-left hover:border-emerald-500/60 transition-colors"
                      >
                        <span className="text-[13px] font-medium text-[#e8ecf4]">{a.category}</span>
                        <span className="text-[12.5px] text-[#8b99b8]">
                          {a.avg_price_eur != null ? eur(a.avg_price_eur) : "—"} {t.avg} · {a.sold_7d != null ? t.leftShelfCount(a.sold_7d.toLocaleString()) : "—"}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : result.verdict === "BRAND_AVERAGE" ? (
              <>
                {/*
                  BUY BELOW must lead (2026-09-22). This grid used to open with
                  AVG AT EXIT and never showed a buy-below at all, so searching
                  "Stone Island hoodie" returned an average with no actionable
                  number — while the homepage advertised Stone Island Hoodies as
                  STRONG BUY. A reseller standing in a shop needs the max price
                  to pay; that is the entire product. The backend now returns
                  buy_below on aggregates (avg × 0.95 × 0.70, the same published
                  rule used everywhere else), and `limitation` still states this
                  is the brand/category average rather than that exact model.
                */}
                <div className="riq-metric-grid border-b border-[rgba(255,255,255,0.07)]">
                  <Metric label={t.buyBelow} value={result.buy_below != null ? eur(result.buy_below) : "—"} />
                  <Metric label={t.avgAtExit} value={result.sell_avg != null ? eur(result.sell_avg) : "—"} />
                  <Metric label={t.leftShelf} value={result.sold_7d != null ? result.sold_7d.toLocaleString() : "—"} />
                  <Metric label={t.listedNow} value={result.active_listings != null ? result.active_listings.toLocaleString() : "—"} />
                </div>
                <div className="p-6">
                  {/*
                    FREE_MODELS, not WORKING_MODELS: this chip row was offering
                    Levi's 501 and NB 550, which are PAYWALLED. Suggesting
                    "try one of these instead" and then walling the suggestion
                    is the worst possible sequence for a first-time visitor.
                  */}
                  <ModelChips onPick={pickModel} disabled={loading} label={t.tryTheseInstead} examples={FREE_MODELS} testId="riq-working-models" />
                </div>
              </>
            ) : result.verdict === "OVERSUPPLIED" ? (
              // A real, free answer: heavy supply, nothing leaving the shelf.
              // Must NOT show the "unlock full numbers" upsell — there is
              // nothing locked here, and asking €19 right after telling someone
              // we have no per-item data is what produced 287 checkout sessions
              // and 0 payments.
              <div className="p-6">
                <p className="text-[14px] leading-[1.6] text-[var(--color-text-secondary)]">
                  {result.message}
                </p>
                <div style={{ marginTop: 16 }}>
                  <Link
                    href={canonicalPath(locale, "/")}
                    style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      minHeight: 44, padding: "12px 18px", borderRadius: 10,
                      background: "var(--color-buy)", color: "var(--color-on-buy)",
                      fontSize: 14, fontWeight: 600, textDecoration: "none",
                    }}
                  >
                    See what IS selling this week →
                  </Link>
                </div>
              </div>
            ) : result.verdict === "UNKNOWN" || result.verdict === "INSUFFICIENT_DATA" ? (
              <>
                {hasVerdictIntelligence(result) && (
                  <VerdictInsightBody
                    result={result}
                    t={t}
                    opportunityState={opportunityState}
                    planLabel={checker.planLabel}
                    unlockRest={checker.unlockRest}
                  />
                )}
                <div className="p-6 text-[13px] text-[#8b99b8]">
                  <p>{result.verdict === "UNKNOWN" ? t.unknownBody : (result.confidence_note || result.message || t.unknownBody)}</p>
                  <ModelChips onPick={pickModel} disabled={loading} label={t.tryTheseInstead} examples={FREE_MODELS} testId="riq-working-models" />
                  <div style={{ marginTop: 10 }}>
                    <Link
                      href={canonicalPath(locale, "/data")}
                      style={{ fontSize: 12.5, color: "#8fa3c4", textDecoration: "none" }}
                    >
                      → See the 28 brands we track
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <VerdictInsightBody
                result={result}
                t={t}
                opportunityState={opportunityState}
                planLabel={checker.planLabel}
                unlockRest={checker.unlockRest}
                unlock={
                  <UnlockPanel result={result} onUnlock={unlock} unlocking={unlocking} isAuthenticated={getToken() != null} isPaid={paidCold} />
                }
                after={
                  <div className="px-6 pb-6 pt-1 border-t border-[rgba(255,255,255,0.07)]">
                    <ModelChips onPick={pickModel} disabled={loading} label={t.checkAnother} examples={WORKING_MODELS} testId="riq-check-another" />
                  </div>
                }
              />
            )}
          </div>
        )}

        {showSeed && (
          <SeedVerdictCard t={t} locale={locale} styles={styles} query={seedQuery} result={seed} />
        )}

        {!result && !loading && (
          <div className="text-[13px] text-[#5b6b8c] bg-[var(--color-surface)] border border-[#1c2333] rounded-xl p-6 mt-6">
            {paidCold ? (
              // C155(tony): activation guidance for paid users who haven't run a check yet.
              // Research: Notion/Linear/Superhuman pattern — show the user the product in a
              // useful state from day 1. The #1 reason 11/25 accounts ran zero verdicts:
              // they didn't have a mental model of WHEN to use the checker.
              // This adds 3 concrete reseller scenarios (market, kilo sale, online buy) so
              // a brand-new account sees "oh — I check something BEFORE I buy it."
              // Each scenario is a button that pre-fills and runs the search immediately.
              <div className="mb-4">
                <p className="text-[13px] font-semibold text-[#c8d0e0] mb-1">Run a check before you buy</p>
                <p className="text-[12px] text-[#5b6b8c] mb-3">
                  Type any brand + item you&apos;re thinking of buying. We&apos;ll tell you the max price to pay to profit on resale.
                </p>
                <div className="flex flex-col gap-2 mb-4" data-testid="riq-activation-scenarios">
                  {[
                    { label: "Found a Stone Island hoodie at a market?", query: "Stone Island Hoodie" },
                    { label: "Kilo sale has Carhartt jackets?", query: "Carhartt Detroit Jacket" },
                    { label: "Weighing up Fred Perry polos?", query: "Fred Perry Polo Shirt" },
                  ].map(({ label, query }) => (
                    <button
                      key={query}
                      onClick={() => pickModel(query)}
                      disabled={loading}
                      className="w-full text-left px-3 py-2.5 rounded-lg border border-[#1c2333] hover:border-[rgba(52,199,89,0.35)] hover:bg-[rgba(52,199,89,0.04)] transition-colors group"
                    >
                      <span className="text-[12px] text-[#5b6b8c] group-hover:text-[#8fa3c4]">{label}</span>
                      <span className="ml-2 text-[11.5px] font-semibold text-[#34C759] opacity-70 group-hover:opacity-100">Check {query} →</span>
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-[#3a4458] mb-3">Or pick a top-moving item to see what a verdict looks like:</p>
              </div>
            ) : null}
            <p>{!paidCold ? t.empty : null}</p>
            <ModelChips onPick={pickModel} disabled={loading} label={paidCold ? 'Or start with one of these:' : t.tryTheseInstead} examples={paidCold ? WORKING_MODELS : FREE_MODELS} testId="riq-working-models" />
            {/* IQ-060: paid sessions (operator/power) already have the checker
                open. Selling Starter €19 here is the founder-reported lie.
                Anonymous / free keep the pricing nudge. */}
            {paidCold ? (
              <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <Link
                  href={FIRST_CHECK_HREF}
                  data-testid="riq-cold-open-check"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold"
                  style={{ background: "rgba(52,199,89,0.10)", color: "#34C759", border: "1px solid rgba(52,199,89,0.25)" }}
                >
                  {t.openCheck}
                </Link>
                <Link
                  href="/account"
                  data-testid="riq-cold-manage"
                  className="text-[12px] text-[#8fa3c4]"
                  style={{ textDecoration: "none" }}
                >
                  {t.managePlan}
                </Link>
              </div>
            ) : (
              <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <Link
                  href="/pricing"
                  data-testid="riq-cold-pricing-cta"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold"
                  style={{ background: "rgba(52,199,89,0.10)", color: "#34C759", border: "1px solid rgba(52,199,89,0.25)" }}
                >
                  {t.seePlans} →
                </Link>
                <span className="text-[12px] text-[var(--color-text-secondary)]">€19/mo · no free tier</span>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  )
}

function metricLabel(id: CollectedMetric["id"], t: VerdictCopy): string {
  switch (id) {
    case "buy_below": return t.buyBelow
    case "sell_avg": return t.avgAtExit
    case "sold_7d": return t.leftShelf
    case "active_listings": return t.listedNow
    case "n": return "n"
    case "comps": return t.comps
    case "opportunity": return t.opportunity
  }
}

function metricValue(row: CollectedMetric, result: VerdictResult, t: VerdictCopy): ReactNode {
  if (row.id === "buy_below") {
    const shown = eur(row.numeric)
    return row.kind === "reconstructed" ? `${shown} · ${t.estimate}` : shown
  }
  if (row.id === "sell_avg") {
    if (row.kind === "measured") {
      return <MedianN median={result.sell_median ?? result.sell_avg ?? row.numeric} n={result.n} nKind="comparable" />
    }
    return `${eur(row.numeric)} · ${t.estimate}`
  }
  if (row.id === "n") {
    return row.kind === "reconstructed"
      ? `${row.numeric.toLocaleString()} · ${t.estimate}`
      : row.numeric.toLocaleString()
  }
  if (row.id === "opportunity") return `${Math.round(row.numeric)}/100`
  return row.numeric.toLocaleString()
}

/**
 * Whatever the API actually sent: measured first, reconstructed/proxy only
 * when measured is absent. STR-null used to skip this entire grid and leave
 * a paid user staring at UnlockPanel chrome.
 */
function VerdictInsightBody({
  result, t, opportunityState, planLabel, unlockRest, unlock, after,
}: {
  result: VerdictResult
  t: VerdictCopy
  opportunityState: ReturnType<typeof fieldState>
  planLabel: string
  unlockRest: string
  unlock?: ReactNode
  after?: ReactNode
}) {
  const rows = collectVerdictMetrics(result)
  const strText = result.sell_through_rate ? formatStrPctString(result.sell_through_rate) : null
  const pair = measuredBuyAndSell(result)
  const note = reconstructedNote(result)
  const extras: ReactNode[] = []
  if (strText) {
    extras.push(<Metric key="str" label={t.sellThrough} value={strText} />)
  }
  if (pair) {
    extras.push(
      <Metric key="net" label={t.targetNet} value={eur(Math.max(0, pair.sell - pair.buy))} accent="var(--color-buy)" />,
    )
  } else if (opportunityState === "locked" && !rows.some((r) => r.id === "opportunity")) {
    extras.push(
      <Metric
        key="opp"
        label={t.opportunity}
        value={<LockedMetricValue label={planLabel} cta={unlockRest} />}
      />,
    )
  }

  const shown = rows.filter((r) => r.id !== "n" || !rows.some((x) => x.id === "sell_avg" && x.kind === "measured"))

  return (
    <>
      {result.reasons && result.reasons.length > 0 && (
        <div className="p-6 border-b border-[rgba(255,255,255,0.07)]">
          <div className="text-[12px] text-[var(--color-text-secondary)] uppercase tracking-wide mb-3">{t.why}</div>
          <ul className="flex flex-col gap-2">
            {result.reasons.map((r, i) => (
              <li key={i} className="flex gap-2 text-[13px] text-[#a9b6d0]">
                <span className="text-emerald-400 mt-0.5">•</span>{r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {(shown.length > 0 || extras.length > 0) && (
        <div data-testid="riq-verdict-insights" className="riq-metric-grid border-b border-[rgba(255,255,255,0.07)]">
          {shown.map((row) => (
            <Metric
              key={row.id}
              label={metricLabel(row.id, t)}
              value={metricValue(row, result, t)}
              accent={row.id === "buy_below" ? "var(--color-buy)" : undefined}
            />
          ))}
          {extras}
        </div>
      )}

      {!strText && (result.sold_7d != null || result.active_listings != null) && (
        <div className="px-6 py-3 border-b border-[rgba(255,255,255,0.07)] text-[12.5px] text-[#8b99b8]">
          {t.strPaused}
        </div>
      )}
      {note && (
        <div className="px-6 py-3 border-b border-[rgba(255,255,255,0.07)] text-[12.5px] text-[#8b99b8]">
          {t.estimate}: {note}
        </div>
      )}

      {(result.momentum || (result.top_sizes && result.top_sizes.length > 0)) && (
        <div className="p-6 flex flex-wrap items-center gap-x-8 gap-y-3">
          {result.momentum && (
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-[var(--color-text-secondary)] uppercase tracking-wide">{t.demand}</span>
              <MomentumBadge momentum={result.momentum} size="md" />
            </div>
          )}
          {result.top_sizes && result.top_sizes.length > 0 && (
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[12px] text-[var(--color-text-secondary)] uppercase tracking-wide">{t.hotSizes}</span>
              <span className="flex flex-wrap gap-1">
                {result.top_sizes.slice(0, 5).map(s => (
                  <span key={s} className="px-2 py-0.5 rounded bg-[var(--color-surface-elevated)] border border-[rgba(255,255,255,0.12)] text-[12px] text-[#a9b6d0]">{s}</span>
                ))}
              </span>
            </div>
          )}
        </div>
      )}

      {unlock ? <div className="px-6 pb-2">{unlock}</div> : null}
      {after}
    </>
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
    <div data-testid="riq-seed-verdict" className="bg-[var(--color-bg-3)] border border-[rgba(255,255,255,0.07)] rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-[rgba(255,255,255,0.07)] bg-[var(--color-surface)]">
        <div className="text-[12px] text-[var(--color-text-secondary)] uppercase tracking-wide mb-1.5">{t.seedLabel}</div>
        <div className="text-[12.5px] text-[#8b99b8] leading-5">{t.seedIntro(product)}</div>
      </div>

      <div className="riq-verdict-head p-6 border-b border-[rgba(255,255,255,0.07)]">
        <div className="riq-verdict-head-copy">
          <div className="text-[12px] text-[var(--color-text-secondary)] uppercase tracking-wide mb-1">{t.decision}</div>
          <div className="text-[15px] font-semibold text-[#eef1f7]">{product}</div>
          {result.category && <div className="text-[12px] text-[#5b6b8c] mt-0.5">{result.category}</div>}
        </div>
        <div className="riq-verdict-head-badge">
          <div className="px-4 py-2 rounded-lg text-[15px] font-extrabold tracking-wide"
            style={{ color: vs.color, background: vs.bg, border: `1px solid ${vs.border}` }}>
            {vs.label}
          </div>
          {result.confidence && (
            <div className="text-[12px] text-[#5b6b8c] uppercase tracking-wide mt-1.5">
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

      <div className="riq-metric-grid">
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
    <div className="riq-metric-cell">
      <div className="riq-metric-label text-[12px] text-[var(--color-text-secondary)] uppercase tracking-wide mb-1.5">{label}</div>
      <div className="text-[18px] font-bold" style={{ color: accent || "#e8ecf4" }}>{value}</div>
    </div>
  )
}
