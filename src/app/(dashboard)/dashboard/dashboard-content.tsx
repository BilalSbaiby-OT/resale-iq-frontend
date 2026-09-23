"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, Lock } from "lucide-react"
import { AppShell } from "@/components/layout/app-shell"
import { KpiCard } from "@/components/ui/kpi-card"
import { MomentumBadge } from "@/components/ui/momentum-badge"
import { MedianN } from "@/components/ui/median-n"
import { SkeletonRows } from "@/components/ui/skeleton"
import { OutcomePrompt } from "@/components/ui/outcome-prompt"
import { getKPIs, getDeals, getBrandRankings, getTrendsSummary, getRecentSold, addToWatchlist, isPaymentRequired } from "@/lib/api"
import { eur, ago } from "@/lib/utils"
import { useAuthStore } from "@/lib/auth-store"
import { copy, type Locale } from "@/lib/i18n"
import { appCopy } from "@/lib/app-copy"
import { categoryName, formatCount } from "@/lib/verdict-words"
import { isFieldLocked } from "@/lib/locked-fields"
import { formatStrPct } from "@/lib/str-pct"
import { FIRST_CHECK_HREF } from "@/lib/checkout"
import { useRouter } from "next/navigation"
import type { KPIs, Deal, BrandRanking, RecentSold, ModelSignal } from "@/types"

/**
 * C206: Quick-check input at the top of the dashboard.
 * Problem: 11 of 25 accounts ran 0 verdicts. The dashboard had no way to
 * check an item — you had to navigate to /verdict separately.
 * Fix: a single-line query input that routes directly to /verdict?q=...
 * Logged-in users can answer "should I buy this?" without leaving the page
 * they land on after login. Same pattern as Linear's command palette.
 */
function QuickCheckInput({ locale }: { locale: Locale }) {
  const [query, setQuery] = useState("")
  const router = useRouter()
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    router.push(`/verdict?q=${encodeURIComponent(q)}&src=dashboard_quick_check`)
  }
  return (
    <form
      onSubmit={handleSubmit}
      data-testid="riq-dashboard-quick-check"
      style={{
        display: "flex",
        gap: 10,
        marginBottom: 28,
        alignItems: "center",
      }}
    >
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Check an item — e.g. Stone Island Hoodie"
        aria-label="Check an item"
        style={{
          flex: 1,
          background: "var(--color-graphite-elevated)",
          border: "1px solid var(--color-border-ui)",
          borderRadius: 10,
          color: "var(--color-on-graphite)",
          fontSize: 15,
          padding: "12px 16px",
          outline: "none",
        }}
      />
      <button
        type="submit"
        disabled={!query.trim()}
        style={{
          background: "var(--color-accent)",
          color: "var(--color-on-accent)",
          border: "none",
          borderRadius: 10,
          padding: "12px 20px",
          fontSize: 15,
          fontWeight: 600,
          cursor: query.trim() ? "pointer" : "default",
          opacity: query.trim() ? 1 : 0.5,
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        Check →
      </button>
    </form>
  )
}

/**
 * A withheld value inside a dense card row.
 *
 * The opportunity cards give each figure a few characters, so the lock has to
 * be the whole affordance — there is no room for a sentence and no room for a
 * second CTA. The route out is the card's own buy-below lock (which links to
 * /account) and the paywall banner at the top of the page, both already on
 * screen whenever this renders; adding a third link per figure would turn one
 * upgrade ask into eight.
 *
 * `aria-label` carries the meaning for a screen reader, because a bare icon
 * would otherwise read as nothing at all — which is exactly the failure this
 * change exists to remove, just in another modality. It was ALSO an English
 * literal, so the screen reader was announcing English inside a Spanish app —
 * the same failure a third time, in a third modality.
 */
function LockedInline({ label }: { label: string }) {
  return (
    <span
      data-testid="riq-locked-inline"
      aria-label={label}
      title={label}
      style={{ display: "inline-flex", alignItems: "center", verticalAlign: "-2px" }}
    >
      <Lock size={12} color="var(--color-graphite-muted)" aria-hidden />
    </span>
  )
}

/**
 * Section shell. Hairline + whitespace, no filled panel and no inner border —
 * the page was a stack of bordered boxes inside bordered boxes, which is what
 * made a dashboard of five sections read as thirty compartments.
 */
function Section({ title, sub, action, children }: {
  title: string
  sub?: string
  /** `primary` promotes the link to THE filled control of the page. At most one. */
  action?: { href: string; label: string; primary?: boolean }
  children: React.ReactNode
}) {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="riq-section-head" style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 600, color: "var(--color-on-graphite)", letterSpacing: "-0.01em" }}>{title}</h2>
          {sub && <div style={{ fontSize: 13, color: "var(--color-graphite-muted)", marginTop: 4, maxWidth: "65ch" }}>{sub}</div>}
        </div>
        {action && (
          <Link
            href={action.href}
            data-testid={action.primary ? "riq-primary-path" : undefined}
            style={action.primary
              ? { display: "inline-flex", alignItems: "center", gap: 6, background: "var(--color-accent)", color: "var(--color-on-accent)", borderRadius: 12, padding: "10px 16px", fontSize: 15, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap", alignSelf: "center" }
              : { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 15, color: "var(--color-on-graphite)", textDecoration: "none", whiteSpace: "nowrap" }}
          >
            {action.label} <ArrowRight size={14} />
          </Link>
        )}
      </div>
      {children}
    </section>
  )
}

const CARD: React.CSSProperties = {
  background: "var(--color-graphite-elevated)",
  borderRadius: 14,
  padding: 20,
}

// Compact verdict badge for the hero buy-list strip.
const VERDICT_C: Record<string, string> = {
  "STRONG BUY": "#30D158", BUY: "#30D158", RISING: "#30D158", WATCH: "#FF9F0A", SKIP: "#8E8E93",
}
const VERDICT_BG_C: Record<string, string> = {
  "STRONG BUY": "rgba(48,209,88,.18)", BUY: "rgba(48,209,88,.15)", RISING: "rgba(48,209,88,.15)", WATCH: "rgba(255,159,10,.15)", SKIP: "rgba(142,142,147,.12)",
}
function VerdictChip({ v }: { v: string }) {
  const c = VERDICT_C[v] ?? "#8E8E93"
  const bg = VERDICT_BG_C[v] ?? "rgba(142,142,147,.12)"
  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", background: bg, border: `1px solid ${c}40`, color: c, fontWeight: 700, fontSize: 10, letterSpacing: "0.04em", borderRadius: 6, padding: "2px 6px", whiteSpace: "nowrap" }}>{v}</span>
  )
}

interface PublicBuyItem {
  brand: string; model?: string; category?: string; verdict: string; momentum: string
  locked: boolean; sold_7d: number | null; sold_30d_evidence: number | null; avg_price_eur: number | null
}

export function DashboardContent({ locale }: { locale: Locale }) {
  const t = copy[locale].dashboard
  const a = appCopy[locale]
  // Reuses the free checker's own "buy-below" term rather than a fresh
  // translation — this file's header comment: "the two terms that must not
  // drift in translation: buy-below and watched departures".
  const buyBelow = copy[locale].checker.buyBelow
  // Each section loads independently — one slow endpoint never blanks the page.
  const [kpis, setKpis] = useState<KPIs | null>(null)
  const [publicBuys, setPublicBuys] = useState<PublicBuyItem[] | null>(null)
  const [deals, setDeals] = useState<Deal[] | null>(null)
  const [dealsLocked, setDealsLocked] = useState(false)
  const [strLocked, setStrLocked] = useState(false)
  const [paywalled, setPaywalled] = useState(false)
  const [brands, setBrands] = useState<BrandRanking[] | null>(null)
  const [trending, setTrending] = useState<ModelSignal[] | null>(null)
  const [sold, setSold] = useState<RecentSold[] | null>(null)
  const { user } = useAuthStore()
  const plan = user?.plan || "free"
  const [showWelcome] = useState(
    () => typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("welcome") === "1")

  useEffect(() => {
    // A 402 means "not entitled", not "no data". Catching it into an empty
    // array — as every one of these used to — renders a paywalled section as
    // an empty one, which reads to the customer as a broken or dead product
    // rather than an upgrade prompt.
    const onFail = <T,>(set: (v: T) => void, empty: T) => (e: unknown) => {
      if (isPaymentRequired(e)) setPaywalled(true)
      set(empty)
    }
    getKPIs().then(setKpis).catch(onFail(setKpis, null))
    // Public buy-list: top N ranked items, 3 free rows, no JWT needed.
    // This renders the "what to buy today" answer while authenticated deals load.
    fetch("/api/public/buy-list?limit=6")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.items?.length) setPublicBuys((d.items as PublicBuyItem[]).slice(0, 5)) })
      .catch(() => {})
    getDeals({ limit: 8 })
      // `d.locked` alone is not enough and never was: the flag is a constant
      // false on every backend branch (src/lib/locked-fields.ts has the
      // production curl). So `dealsLocked` was permanently false, the lock
      // affordance below was unreachable, and a withheld max_buy_price fell
      // through to `eur(undefined)` — which returns "—". The opportunity board
      // rendered a column of dashes where the buy-below price should be, and
      // called it data. Ask the server's own list of withheld fields instead;
      // keep the flag in the OR so an older payload cannot regress.
      .then(d => {
        setDeals(d.deals)
        setDealsLocked(d.locked || isFieldLocked(d.locked_fields, "max_buy_price"))
        // Both spellings: /api/deals gates the rate as `str_pct`, the verdict
        // payload as `sell_through_rate` (src/lib/locked-fields.ts).
        setStrLocked(isFieldLocked(d.locked_fields, "str_pct") || isFieldLocked(d.locked_fields, "sell_through_rate"))
      })
      .catch(onFail(setDeals, [] as Deal[]))
    getBrandRankings(8).then(d => setBrands(d.brands)).catch(onFail(setBrands, [] as BrandRanking[]))
    getTrendsSummary()
      .then(d => setTrending((d.trending_models ?? []).slice(0, 7)))
      .catch(onFail(setTrending, [] as ModelSignal[]))
    getRecentSold(7).then(d => setSold(d.data)).catch(onFail(setSold, [] as RecentSold[]))
  }, [])

  // `alert()` was an English literal in a browser chrome dialog — untranslatable
  // and unstyleable. An inline status line says the same thing in the reader's
  // language and does not seize the tab.
  const [notice, setNotice] = useState<string | null>(null)
  useEffect(() => {
    if (!notice) return
    const id = setTimeout(() => setNotice(null), 2600)
    return () => clearTimeout(id)
  }, [notice])

  /** A KPI figure in the reader's digit grouping; strings pass through. */
  const kpiNumber = (v: number | string | null | undefined) =>
    typeof v === "number" && Number.isFinite(v) ? formatCount(v, locale) : v

  // The buy-signal COUNT and the leading model's NAME are two independent
  // facts from two independent columns. Read separately so one being absent
  // can never blank the other.
  const signalCount = typeof kpis?.market_opportunity?.value === "number" && Number.isFinite(kpis.market_opportunity.value)
    ? kpis.market_opportunity.value
    : null
  const topSignal = kpis?.market_opportunity?.top_signal?.trim() || null

  const watch = async (b: string, m: string) => {
    try { await addToWatchlist(b, m); setNotice(a.deals.watchlistAdded) }
    catch { setNotice(a.deals.watchlistAlready) }
  }


  return (
    <AppShell title={t.title} subtitle={t.subtitle}>
      {/* The LocaleSwitcher that used to sit here is gone, and its comment
          ("the rest of the dashboard's chrome is unlocalized, so the switcher
          is scoped to this page") is stale: sidebar.tsx reads `useLocale()`
          and mounts a switcher on every authenticated route. Keeping this one
          gave the panel — and only the panel — TWO language controls, which
          the design brief allows exactly one of. */}

      {/* Asks about one past verdict. Renders nothing when there is nothing to ask. */}
      <OutcomePrompt />

      {/* C206: Quick-check input — answers "should I buy this?" on the dashboard front door.
          11 of 25 accounts ran 0 verdicts because checking required navigating to /verdict.
          This input submits directly to /verdict?q=... with src=dashboard_quick_check
          so funnel analytics can measure activation from the dashboard. */}
      <QuickCheckInput locale={locale} />

      {showWelcome && (
        <div
          data-testid="riq-paid-first-check"
          style={{ ...CARD, display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 600, color: "var(--color-on-graphite)" }}>{t.welcomeHeading}</div>
            <div style={{ fontSize: 15, color: "var(--color-graphite-muted)", marginTop: 4, maxWidth: "65ch" }}>{t.welcomeBody}</div>
          </div>
          <Link
            href={FIRST_CHECK_HREF}
            data-testid="riq-paid-first-check-cta"
            style={{ background: "var(--color-accent)", color: "var(--color-on-accent)", borderRadius: 12, padding: "10px 16px", fontSize: 15, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}
          >{t.welcomeCta}</Link>
        </div>
      )}

      {notice && (
        <div role="status" style={{ marginBottom: 16, fontSize: 15, color: "var(--color-graphite-muted)" }}>{notice}</div>
      )}

      {paywalled && (
        <div style={{ ...CARD, display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <div style={{ flex: 1, fontSize: 15, color: "var(--color-on-graphite)" }}>{t.paywalledBanner}</div>
          <Link
            href="/account"
            style={{ background: "var(--color-accent)", color: "var(--color-on-accent)", borderRadius: 12, padding: "10px 16px", fontSize: 15, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}
          >{t.seePlansAction}</Link>
        </div>
      )}

      {plan === "free" && !paywalled && (
        <div style={{ ...CARD, display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 600, color: "var(--color-on-graphite)" }}>{t.freeBannerHeading}</div>
            <div style={{ fontSize: 15, color: "var(--color-graphite-muted)", marginTop: 4, maxWidth: "65ch" }}>{t.freeBannerBody}</div>
          </div>
          {/* TWO ACTIONS: one primary (upgrade), one secondary (use the tool).
              The banner copy already says "unlock with a plan" — the CTA must
              land on /pricing, not /verdict. Check item stays as a ghost so
              users who ignore the upgrade still find the product.
              /pricing is the actual funnel step between this banner and
              checkout_started; linking to /account or /verdict skips it. */}
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
            <Link
              href="/pricing"
              data-testid="riq-free-banner-upgrade"
              style={{ background: "var(--color-accent)", color: "var(--color-on-accent)", borderRadius: 12, padding: "10px 16px", fontSize: 15, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}
            >{t.seePlansAction}</Link>
            <Link
              href="/verdict"
              style={{ color: "var(--color-graphite-muted)", fontSize: 14, fontWeight: 400, textDecoration: "none", whiteSpace: "nowrap" }}
            >{t.freeBannerAction}</Link>
          </div>
        </div>
      )}

      {/* HERO BUY-LIST — answers "what should I buy today" on arrival.
          Uses /api/public/buy-list (3 free rows, no JWT). The authenticated
          Opportunities section below adds buy-below and deeper filters once
          loaded. Having NOTHING answered until /api/deals returned was the
          main activation failure: 11 of 25 accounts ran zero verdicts. */}
      {publicBuys && publicBuys.length > 0 && (
        <div
          data-testid="riq-hero-buy-list"
          style={{ ...CARD, marginBottom: 24, padding: "16px 20px" }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-on-graphite)", letterSpacing: "-0.01em" }}>
              What to buy today
            </div>
            <div style={{ fontSize: 12, color: "var(--color-graphite-muted)" }}>Ranked by demand · EU5 Vinted</div>
          </div>
          <div>
            {publicBuys.map((item, i) => {
              const v = [
                "STRONG BUY", "BUY", "RISING", "WATCH", "SKIP",
              ].includes(item.verdict) ? item.verdict : item.momentum
              const label = item.model ? `${item.brand} ${item.model}` : `${item.brand} ${item.category ?? ""}`
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 0",
                    borderBottom: i < publicBuys.length - 1 ? "1px solid var(--color-hairline)" : "none",
                    opacity: item.locked ? 0.55 : 1,
                    minHeight: 40,
                  }}
                >
                  <span style={{ fontSize: 13, color: "var(--color-graphite-muted)", width: 18, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{i + 1}</span>
                  <Link
                    href={item.locked ? "/account" : `/verdict?q=${encodeURIComponent(label.trim())}`}
                    style={{ flex: 1, textDecoration: "none", minWidth: 0 }}
                  >
                    <span style={{ fontSize: 15, fontWeight: 600, color: "var(--color-on-graphite)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>{label.trim()}</span>
                    {!item.locked && item.sold_30d_evidence != null && (
                      <span style={{ fontSize: 12, color: "var(--color-graphite-muted)", display: "block", marginTop: 1 }}>
                        {item.sold_30d_evidence.toLocaleString()} watched departures / 30d
                      </span>
                    )}
                  </Link>
                  {item.locked
                    ? <Lock size={12} color="var(--color-graphite-muted)" aria-label="Upgrade to unlock" />
                    : <VerdictChip v={v} />}
                  <span style={{ fontSize: 13, color: "var(--color-graphite-muted)", fontVariantNumeric: "tabular-nums", flexShrink: 0, width: 52, textAlign: "right" }}>
                    {item.locked ? "—" : (item.avg_price_eur != null ? `€${item.avg_price_eur}` : "—")}
                  </span>
                </div>
              )
            })}
          </div>
          <div style={{ marginTop: 12, display: "flex", gap: 10, alignItems: "center" }}>
            <Link
              href="/deals"
              data-testid="riq-hero-buy-list-scanner"
              style={{ fontSize: 14, fontWeight: 600, color: "var(--color-accent)", textDecoration: "none" }}
            >
              Open deal scanner →
            </Link>
            <span style={{ color: "var(--color-hairline)", fontSize: 14 }}>·</span>
            <Link href="/account" style={{ fontSize: 13, color: "var(--color-graphite-muted)", textDecoration: "none" }}>
              Unlock buy-below
            </Link>
          </div>
        </div>
      )}

      {/* KPI row.
          THE VALUE is API data; THE WORDS ARE OURS. This row used to prefer
          the API's own `label` and `sublabel` and fall back to the dictionary
          only when they were missing — so on production, where the payload
          always carries them, the dictionary never won and the panel printed
          backend English ("left the shelf / 7d", "watched", "by 7-day sales
          volume") beside correctly-translated Spanish headings. `noSold()`
          laundering "sold" out of an English label cannot make it Spanish.
          The category VALUE is catalogue data ("Sneakers"), translated with
          the same `categoryName()` the verdict card already uses. */}
      {/* Three KPIs. The fourth used to be labeled left-shelf/Salidas but
          wired to avg_profit_margin (a 0–1 share). Spanish then printed
          "0,6" under "Salidas / 7d" — a rate wearing a count's name. */}
      <div className="riq-grid-kpi" style={{ marginBottom: 32 }}>
        <KpiCard label={t.kpiListingsTracked} loading={!kpis} value={kpiNumber(kpis?.items_analyzed?.value)} sublabel={t.kpiAcrossMarkets} />
        <KpiCard label={t.kpiTopCategory} loading={!kpis} value={categoryName(kpis?.top_category?.value, locale)} sublabel={t.kpiByVolume} />
        {/* THREE FACTS, THREE STATES — see i18n.ts `kpiNoSignalsBody`.
            This card used to collapse all three into a bare "—" plus "None
            yet", keyed off `top_signal` alone. On production at 14:38Z on
            2026-09-06 /api/kpis answered {"value":2,"top_signal":" "}: two
            models HAD cleared the threshold and the panel showed a dash,
            because the leading model's NAME was missing — a different fact
            about a different field. The count is a measurement and is now
            always printed; only the sublabel varies. */}
        <KpiCard
          label={t.kpiBuySignals}
          loading={!kpis}
          value={signalCount != null ? formatCount(signalCount, locale) : t.kpiNotMeasured}
          sublabel={
            signalCount == null || signalCount === 0
              ? t.kpiNoSignalsBody
              : topSignal
                ? t.kpiTopSignal(topSignal)
                : t.kpiTopUnavailable
          }
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {/* THE ONE PRIMARY PATH.
            An outside reviewer walked this board logged in and reported three
            solid accent "Analyze" buttons stacked down the page, each on its
            own card. Three equal primary actions is no primary action: the eye
            has nothing to land on and every card argues for itself. The page
            now has exactly ONE filled control — Deal Scanner, the route that
            actually leads somewhere with filters and the full board — and the
            per-card action below is a hairline ghost. Compare /deals, whose
            cards have said "ONE filled control per card" since they were
            written; the panel simply never applied its own rule. */}
        <Section title={t.secOpportunitiesTitle} sub={t.secOpportunitiesSub} action={{ href: "/deals", label: t.secOpportunitiesAction, primary: true }}>
          {!deals ? <SkeletonRows rows={4} height={72} /> : deals.length === 0 ? (
            <div style={{ ...CARD, textAlign: "center", padding: 32 }}>
              <div style={{ fontSize: 15, color: "var(--color-graphite-muted)", marginBottom: 16 }}>{t.emptyOpportunities}</div>
              <Link
                href={FIRST_CHECK_HREF}
                data-testid="riq-empty-first-check"
                style={{ display: "inline-flex", background: "var(--color-accent)", color: "var(--color-on-accent)", borderRadius: 12, padding: "10px 16px", fontSize: 15, fontWeight: 600, textDecoration: "none" }}
              >{t.welcomeCta}</Link>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 240px), 1fr))", gap: 16 }}>
              {deals.map((d, i) => {
                const q = `${d.brand} ${d.model}`
                const str = formatStrPct(d.str_pct)
                return (
                  <div key={i} style={{ ...CARD, display: "flex", flexDirection: "column", gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 600, color: "var(--color-on-graphite)", lineHeight: 1.3 }}>{d.model}</div>
                      <div style={{ fontSize: 13, color: "var(--color-graphite-muted)", marginTop: 2 }}>
                        {d.brand}{d.category ? ` · ${categoryName(d.category, locale)}` : ""}
                      </div>
                    </div>

                    {/* METRIC 1 OF 2: buy-below.
                        The only figure on the card the customer acts on — it
                        is the whole decision "do I pay this or walk away", and
                        it is the number the paywall withholds. */}
                    <div>
                      <div style={{ fontSize: 13, color: "var(--color-graphite-muted)" }}>{buyBelow}</div>
                      <div style={{ fontSize: 30, fontWeight: 600, color: "var(--color-on-graphite)", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.022em", lineHeight: 1.1, marginTop: 2 }}>
                        {/* THREE STATES, and the third one is new. `eur(null)`
                            returns "—", so a row that arrives without a
                            buy-below printed a bare em-dash at 30px where the
                            headline number goes — the same "working product
                            looks broken" failure as the Buy signals card, on
                            the same wall, and visible on the local board at
                            16:47 today. Withheld is not unknown and unknown is
                            not zero: the lock says "this is in a plan", the
                            sentence says "we cannot price this one yet, and
                            here is why". /api/deals filters unpriced rows
                            server-side (`publishable_opportunity`), so this
                            should be unreachable in production — which is
                            exactly why it must not be a dash if that filter
                            ever changes. */}
                        {dealsLocked
                          ? <Link href="/account" aria-label={a.locked.label} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 17, fontWeight: 500, color: "var(--color-graphite-muted)", textDecoration: "none" }}><Lock size={15} aria-hidden />{a.locked.label}</Link>
                          : d.max_buy_price == null
                            ? <span style={{ display: "inline-block", fontSize: 15, fontWeight: 400, color: "var(--color-graphite-muted)", lineHeight: 1.4, letterSpacing: 0 }}>{t.buyBelowUnpriced}</span>
                            : eur(d.max_buy_price)}
                      </div>
                    </div>

                    {/* METRIC 2 OF 2: does it actually move.
                        TWO METRICS, NOT FOUR. This card carried buy-below, avg
                        at exit, sell-through AND target net, and the reviewer
                        counted them before reading any of them. The two that
                        survive are the two that decide the purchase: what you
                        may pay, and whether the thing sells. The two that went
                        are both restatements of those — avg-at-exit is the
                        INPUT buy-below is computed from, and target net is
                        arithmetic on the pair of them, so a card showing all
                        four shows the same trade three times. Both are still
                        one click away on /verdict (the Analyze destination)
                        and on the full /deals board.
                        THREE STATES, per card, never board-wide: we have a
                        rate / the server withheld it / nobody measured it. A
                        board-wide flag showed the LOCK on a card whose rate was
                        merely thin, claiming a plan boundary that does not
                        exist. See locked-fields.ts. The abbreviation "STR" is
                        retired — it was an untranslatable English initialism
                        beside a fully translated label. */}
                    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, fontSize: 13, color: "var(--color-graphite-muted)", fontVariantNumeric: "tabular-nums" }}>
                      <div style={{ minWidth: 0 }}>
                        <div>{str != null || strLocked ? a.metric.sellThrough : t.kpiLeftShelf}</div>
                        <div style={{ fontSize: 16, color: "var(--color-on-graphite)", marginTop: 2 }}>
                          {str != null
                            ? str
                            : strLocked
                              ? <LockedInline label={a.locked.label} />
                              : (d.sold_7d != null ? formatCount(d.sold_7d, locale) : "—")}
                        </div>
                      </div>
                      {/* Not a third metric: an ordinal rank chip, one word and
                          a dot, and the only thing on the card that lets a grid
                          be scanned rather than read. */}
                      <MomentumBadge momentum={d.momentum_label} sold7={d.sold_7d} sold30={d.sold_30d} />
                    </div>

                    {/* NO FILLED CONTROL HERE. The page's one primary path is
                        the Deal Scanner button in the section header above;
                        Analyze is a ghost, still obviously a button, and Watch
                        stays quieter still. Repeating an accent-filled Analyze
                        on every card is what made three cards read as three
                        competing primaries. */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: "auto" }}>
                      <Link
                        href={`/verdict?q=${encodeURIComponent(q)}`}
                        data-testid="riq-card-analyze"
                        style={{ flex: 1, textAlign: "center", background: "transparent", border: "1px solid var(--color-hairline)", color: "var(--color-on-graphite)", borderRadius: 12, padding: "10px 16px", fontSize: 15, fontWeight: 500, textDecoration: "none" }}
                      >{t.analyze}</Link>
                      <button
                        onClick={() => watch(d.brand, d.model)} title={a.deals.watchlistAdd}
                        style={{ background: "transparent", border: "none", borderRadius: 12, color: "var(--color-graphite-muted)", fontSize: 15, padding: "10px 8px", cursor: "pointer" }}
                      >{t.watchAction}</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Section>

        <Section title={t.secBrandsTitle} sub={t.secBrandsSub} action={{ href: "/brands", label: t.secBrandsAction }}>
          {!brands ? <SkeletonRows rows={6} height={30} /> : (
            <div>
              {brands.map(b => (
                <Link
                  key={b.brand} href={`/deals?brand=${encodeURIComponent(b.brand)}`}
                  style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 0", textDecoration: "none", borderBottom: "1px solid var(--color-hairline)" }}
                >
                  <span style={{ fontSize: 13, color: "var(--color-graphite-muted)", width: 20, fontVariantNumeric: "tabular-nums" }}>{b.rank}</span>
                  <span style={{ flex: 1, fontSize: 15, color: "var(--color-on-graphite)" }}>{b.brand}</span>
                  <span style={{ fontSize: 15, color: "var(--color-graphite-muted)", fontVariantNumeric: "tabular-nums" }}>
                    {/* n={null}, deliberately. This row was passing b.sold_7d
                        — a departure count sitting in the sample slot beside a
                        price, the same collision #54 fixed on /verdict. A brand
                        aggregates many models, so it has no single comp set to
                        report; the honest render is the mean with no n at all,
                        not a plausible-looking wrong one. See types/index.ts. */}
                    <MedianN median={b.avg_price_eur} n={null} />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </Section>

        <div className="riq-grid-2">
          <Section title={t.secTrendingTitle} sub={t.secTrendingSub} action={{ href: "/trends", label: t.secTrendingAction }}>
            {!trending ? <SkeletonRows rows={5} height={32} /> : (
              <div>
                {trending.map((r, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 0", borderBottom: "1px solid var(--color-hairline)" }}>
                    <span style={{ fontSize: 13, color: "var(--color-graphite-muted)", width: 16, fontVariantNumeric: "tabular-nums" }}>{i + 1}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, color: "var(--color-on-graphite)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.model}</div>
                      <div style={{ fontSize: 13, color: "var(--color-graphite-muted)" }}>{r.brand}</div>
                    </div>
                    <MomentumBadge momentum={r.momentum_label} sold7={r.sold_7d} sold30={r.sold_30d} />
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section title={t.secRecentTitle} sub={t.secRecentSub}>
            {!sold ? <SkeletonRows rows={5} height={28} /> : (
              <div>
                {sold.map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 0", borderBottom: "1px solid var(--color-hairline)" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, color: "var(--color-on-graphite)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.brand}</div>
                      <div style={{ fontSize: 13, color: "var(--color-graphite-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.model || s.title}{s.size ? ` · ${s.size}` : ""}</div>
                    </div>
                    <span style={{ fontSize: 15, color: "var(--color-on-graphite)", fontVariantNumeric: "tabular-nums" }}>{eur(s.price_eur)}</span>
                    <span style={{ fontSize: 13, color: "var(--color-graphite-muted)", fontVariantNumeric: "tabular-nums", width: 64, textAlign: "right" }}>{ago(s.sold_at)}</span>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      </div>
    </AppShell>
  )
}
