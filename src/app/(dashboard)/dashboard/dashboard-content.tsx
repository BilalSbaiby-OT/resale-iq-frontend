"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, Lock } from "lucide-react"
import { AppShell } from "@/components/layout/app-shell"
import { KpiCard } from "@/components/ui/kpi-card"
import { MomentumBadge } from "@/components/ui/momentum-badge"
import { ScoreBar } from "@/components/ui/score-bar"
import { SizePills } from "@/components/ui/size-pills"
import { MedianN } from "@/components/ui/median-n"
import { SkeletonRows } from "@/components/ui/skeleton"
import { OutcomePrompt } from "@/components/ui/outcome-prompt"
import { LocaleSwitcher } from "@/components/i18n/locale-switcher"
import { getKPIs, getDeals, getBrandRankings, getTrendsSummary, getRecentSold, addToWatchlist, isPaymentRequired } from "@/lib/api"
import { eur, ago } from "@/lib/utils"
import { useAuthStore } from "@/lib/auth-store"
import { copy, type Locale } from "@/lib/i18n"
import type { KPIs, Deal, BrandRanking, RecentSold, ModelSignal } from "@/types"

/* Section shell: uniform card with header + optional action link */
function Section({ title, sub, action, children }: {
  title: string; sub?: string; action?: { href: string; label: string }; children: React.ReactNode
}) {
  return (
    <div style={{ background: "#12151d", border: "1px solid #1c2333", borderRadius: 10, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", borderBottom: "1px solid #1c2333" }}>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 650, color: "#eef1f7" }}>{title}</div>
          {sub && <div style={{ fontSize: 11, color: "#4d5a75", marginTop: 1 }}>{sub}</div>}
        </div>
        {action && (
          <Link href={action.href} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "#22c55e", textDecoration: "none", fontWeight: 550 }}>
            {action.label} <ArrowRight size={13} />
          </Link>
        )}
      </div>
      <div className="riq-scroll-x">{children}</div>
    </div>
  )
}

export function DashboardContent({ locale }: { locale: Locale }) {
  const t = copy[locale].dashboard
  // Reuses the free checker's own "buy-below" term rather than a fresh
  // translation — this file's header comment: "the two terms that must not
  // drift in translation: buy-below and watched departures".
  const buyBelow = copy[locale].checker.buyBelow
  // Each section loads independently — one slow endpoint never blanks the page.
  const [kpis, setKpis] = useState<KPIs | null>(null)
  const [deals, setDeals] = useState<Deal[] | null>(null)
  const [dealsLocked, setDealsLocked] = useState(false)
  const [paywalled, setPaywalled] = useState(false)
  const [brands, setBrands] = useState<BrandRanking[] | null>(null)
  const [trending, setTrending] = useState<ModelSignal[] | null>(null)
  const [sold, setSold] = useState<RecentSold[] | null>(null)
  const { user } = useAuthStore()
  const plan = user?.plan || "free"

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
    getDeals({ limit: 8 })
      .then(d => { setDeals(d.deals); setDealsLocked(d.locked) })
      .catch(onFail(setDeals, [] as Deal[]))
    getBrandRankings(8).then(d => setBrands(d.brands)).catch(onFail(setBrands, [] as BrandRanking[]))
    getTrendsSummary()
      .then(d => setTrending((d.trending_models ?? []).slice(0, 7)))
      .catch(onFail(setTrending, [] as ModelSignal[]))
    getRecentSold(7).then(d => setSold(d.data)).catch(onFail(setSold, [] as RecentSold[]))
  }, [])

  const watch = async (b: string, m: string) => {
    try { await addToWatchlist(b, m); alert(`Added ${b} ${m} to watchlist`) }
    catch { alert("Already in watchlist") }
  }

  // Sell-through is withheld product-wide right now. Rather than render a
  // column of dashes, drop it until at least one row carries a real value.
  const strLive = (deals ?? []).some(d => d.str_pct != null)

  return (
    <AppShell title={t.title} subtitle={t.subtitle}>
      {/* This route (only) reads its locale from NEXT_LOCALE via
          requestLocale() — see src/proxy.ts's W19 note. The rest of the
          dashboard's chrome (Topbar/Sidebar) is unlocalized and out of W19's
          scope, so the switcher is scoped to this page rather than AppShell:
          mounting it in shared chrome would show a control that silently
          does nothing on every other dashboard route. */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <LocaleSwitcher locale={locale} />
      </div>
      {/* Asks about one past verdict. Renders nothing when there is nothing to ask. */}
      <OutcomePrompt />
      {paywalled && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(251,191,36,.07)", border: "1px solid rgba(251,191,36,.25)", borderRadius: 10, padding: "12px 16px", marginBottom: 14 }}>
          <Lock size={15} color="#fbbf24" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1, fontSize: 12.5, color: "#eef1f7" }}>
            {t.paywalledBanner}
          </div>
          <Link href="/account" style={{ background: "#fbbf24", color: "#0B0D10", borderRadius: 7, padding: "6px 14px", fontSize: 12, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>
            {t.seePlansAction}
          </Link>
        </div>
      )}

      {plan === "free" && (
        <div style={{ display: "flex", alignItems: "center", gap: 14, background: "#12151d", border: "1px solid #1c3327", borderRadius: 10, padding: "13px 16px", marginBottom: 18 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 650, color: "#eef1f7" }}>{t.freeBannerHeading}</div>
            <div style={{ fontSize: 11.5, color: "#8b99b8" }}>{t.freeBannerBody}</div>
          </div>
          <Link href="/verdict" style={{ background: "#22c55e", color: "#06090c", borderRadius: 7, padding: "8px 16px", fontSize: 12, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>
            {t.freeBannerAction}
          </Link>
        </div>
      )}

      {/* KPI row */}
      <div className="riq-grid-kpi" style={{ marginBottom: 18 }}>
        <KpiCard label={kpis?.avg_profit_margin?.label ?? t.kpiLeftShelf} loading={!kpis} value={kpis?.avg_profit_margin?.value} unit={kpis?.avg_profit_margin?.unit ?? ""} sublabel={kpis?.avg_profit_margin?.sublabel} />
        <KpiCard label={t.kpiListingsTracked} loading={!kpis} value={kpis?.items_analyzed?.formatted} sublabel={t.kpiAcrossMarkets} />
        <KpiCard label={t.kpiTopCategory} loading={!kpis} value={kpis?.top_category?.value} sublabel={kpis?.top_category?.sublabel ?? t.kpiByVolume} />
        <KpiCard label={kpis?.market_opportunity?.label ?? t.kpiBuySignals} loading={!kpis} value={kpis?.market_opportunity?.value} sublabel={kpis?.market_opportunity?.sublabel ?? (kpis?.market_opportunity?.top_signal ? t.kpiTopSignal(kpis.market_opportunity.top_signal) : t.kpiActionableNow)} />
      </div>

      {/* Opportunities + Brands */}
      <div className="riq-grid-main" style={{ marginBottom: 14 }}>
        <Section title={t.secOpportunitiesTitle} sub={t.secOpportunitiesSub} action={{ href: "/deals", label: t.secOpportunitiesAction }}>
          {!deals ? <SkeletonRows rows={6} height={72} /> : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 10, padding: 12 }}>
              {deals.map((d, i) => {
                const q = `${d.brand} ${d.model}`
                return (
                  <div key={i} style={{ background: "#0f1218", border: "1px solid #1c2333", borderRadius: 10, padding: "14px 14px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: "#eef1f7", lineHeight: 1.25 }}>{d.model}</div>
                      <div style={{ fontSize: 11, color: "#4d5a75", marginTop: 3 }}>{d.brand}{d.category ? ` · ${d.category}` : ""}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.6px", textTransform: "uppercase", color: "#4d5a75" }}>{buyBelow}</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: "#34d399", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.4px" }}>
                        {dealsLocked
                          ? <Link href="/account" style={{ color: "#4d5a75", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}><Lock size={14} /></Link>
                          : eur(d.max_buy_price)}
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 12, color: "#8b99b8", fontVariantNumeric: "tabular-nums" }}>
                      <span>{t.avgAtExit} {dealsLocked ? "—" : <MedianN median={d.avg_price_eur} n={d.sold_7d} />}</span>
                      <span style={{ color: "var(--color-watch)", fontWeight: 600 }} title="Gap at buy-below after fees — constructed ~30%, not a forecast">
                        {dealsLocked ? "—" : (d.est_profit_eur != null ? t.targetNet(eur(d.est_profit_eur)) : "—")}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <MomentumBadge momentum={d.momentum_label} />
                      {strLive
                        ? <span style={{ fontSize: 11, color: "#8b99b8" }}>{d.str_pct != null ? `${d.str_pct.toFixed(1)}% STR` : t.strDash}</span>
                        : <span style={{ fontSize: 11, color: "#8b99b8" }}>{d.sold_7d != null ? t.leftShelfCount(d.sold_7d.toLocaleString()) : ""}</span>}
                    </div>
                    <SizePills sizes={d.top_sizes ?? []} />
                    <div style={{ display: "flex", gap: 6, marginTop: "auto" }}>
                      <Link href={`/verdict?q=${encodeURIComponent(q)}`}
                        style={{ flex: 1, textAlign: "center", background: "#22c55e", color: "#06090c", borderRadius: 7, padding: "7px 8px", fontSize: 11.5, fontWeight: 700, textDecoration: "none" }}>
                        {t.analyze}
                      </Link>
                      <button onClick={() => watch(d.brand, d.model)} title="Add to watchlist"
                        style={{ background: "transparent", border: "1px solid #232c42", borderRadius: 7, color: "#8b99b8", fontSize: 11, padding: "7px 10px", cursor: "pointer" }}>
                        {t.watchAction}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Section>

        <Section title={t.secBrandsTitle} sub={t.secBrandsSub} action={{ href: "/brands", label: t.secBrandsAction }}>
          {!brands ? <SkeletonRows rows={6} height={30} /> : (
            <div style={{ padding: "4px 0" }}>
              {brands.map(b => (
                <Link key={b.brand} href={`/deals?brand=${encodeURIComponent(b.brand)}`}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 16px", textDecoration: "none", borderBottom: "1px solid #181e2d" }}>
                  <span style={{ fontSize: 11, color: "#4d5a75", width: 20, fontVariantNumeric: "tabular-nums" }}>{b.rank}</span>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#eef1f7" }}>{b.brand}</span>
                  <span style={{ fontSize: 12, color: "#8b99b8", fontVariantNumeric: "tabular-nums" }}>
                    <MedianN median={b.avg_price_eur} n={b.sold_7d} />
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: b.speed_label?.includes("Fast") ? "#34d399" : "#fbbf24" }}>{b.speed_label}</span>
                </Link>
              ))}
            </div>
          )}
        </Section>
      </div>

      {/* Trending + Recently left the shelf */}
      <div className="riq-grid-2">
        <Section title={t.secTrendingTitle} sub={t.secTrendingSub} action={{ href: "/trends", label: t.secTrendingAction }}>
          {!trending ? <SkeletonRows rows={5} height={32} /> : (
            <div style={{ padding: "4px 0" }}>
              {trending.map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 16px", borderBottom: "1px solid #181e2d" }}>
                  <span style={{ fontSize: 11, color: "#4d5a75", width: 16, fontVariantNumeric: "tabular-nums" }}>{i + 1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#eef1f7", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.model}</div>
                    <div style={{ fontSize: 10.5, color: "#4d5a75" }}>{r.brand}</div>
                  </div>
                  <MomentumBadge momentum={r.momentum_label} />
                  <ScoreBar score={r.opportunity_score} width={46} />
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title={t.secRecentTitle} sub={t.secRecentSub}>
          {!sold ? <SkeletonRows rows={5} height={28} /> : (
            <div style={{ padding: "4px 0" }}>
              {sold.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 16px", borderBottom: "1px solid #181e2d" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#eef1f7", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.brand}</div>
                    <div style={{ fontSize: 10.5, color: "#4d5a75", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.model || s.title}{s.size ? ` · ${s.size}` : ""}</div>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#34d399", fontVariantNumeric: "tabular-nums" }}>{eur(s.price_eur)}</span>
                  <span style={{ fontSize: 11, color: "#4d5a75", fontVariantNumeric: "tabular-nums", width: 64, textAlign: "right" }}>{ago(s.sold_at)}</span>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>
    </AppShell>
  )
}
