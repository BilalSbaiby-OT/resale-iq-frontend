"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, Lock } from "lucide-react"
import { AppShell } from "@/components/layout/app-shell"
import { KpiCard } from "@/components/ui/kpi-card"
import { MomentumBadge } from "@/components/ui/momentum-badge"
import { SizePills } from "@/components/ui/size-pills"
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
import type { KPIs, Deal, BrandRanking, RecentSold, ModelSignal } from "@/types"

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
  title: string; sub?: string; action?: { href: string; label: string }; children: React.ReactNode
}) {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 600, color: "var(--color-on-graphite)", letterSpacing: "-0.01em" }}>{title}</h2>
          {sub && <div style={{ fontSize: 13, color: "var(--color-graphite-muted)", marginTop: 4, maxWidth: "65ch" }}>{sub}</div>}
        </div>
        {action && (
          <Link
            href={action.href}
            style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 15, color: "var(--color-on-graphite)", textDecoration: "none", whiteSpace: "nowrap" }}
          >
            {action.label} <ArrowRight size={14} />
          </Link>
        )}
      </div>
      <div className="riq-scroll-x">{children}</div>
    </section>
  )
}

const CARD: React.CSSProperties = {
  background: "var(--color-graphite-elevated)",
  borderRadius: 14,
  padding: 20,
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
  const [deals, setDeals] = useState<Deal[] | null>(null)
  const [dealsLocked, setDealsLocked] = useState(false)
  const [strLocked, setStrLocked] = useState(false)
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
          <Link
            href="/verdict"
            style={{ color: "var(--color-on-graphite)", fontSize: 15, fontWeight: 500, textDecoration: "none", whiteSpace: "nowrap" }}
          >{t.freeBannerAction}</Link>
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
        <KpiCard
          label={t.kpiBuySignals}
          loading={!kpis}
          value={kpis?.market_opportunity?.top_signal?.trim() ? kpis.market_opportunity.value : "—"}
          sublabel={kpis?.market_opportunity?.top_signal?.trim() ? t.kpiTopSignal(kpis.market_opportunity.top_signal.trim()) : t.kpiNoneYet}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        <Section title={t.secOpportunitiesTitle} sub={t.secOpportunitiesSub} action={{ href: "/deals", label: t.secOpportunitiesAction }}>
          {!deals ? <SkeletonRows rows={4} height={72} /> : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
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

                    {/* Figure 1 of at most 3. */}
                    <div>
                      <div style={{ fontSize: 13, color: "var(--color-graphite-muted)" }}>{buyBelow}</div>
                      <div style={{ fontSize: 30, fontWeight: 600, color: "var(--color-on-graphite)", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.022em", lineHeight: 1.1, marginTop: 2 }}>
                        {dealsLocked
                          ? <Link href="/account" aria-label={a.locked.label} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 17, fontWeight: 500, color: "var(--color-graphite-muted)", textDecoration: "none" }}><Lock size={15} aria-hidden />{a.locked.label}</Link>
                          : eur(d.max_buy_price)}
                      </div>
                    </div>

                    {/* Figures 2 and 3. */}
                    <div style={{ display: "flex", gap: 24, fontSize: 13, color: "var(--color-graphite-muted)", fontVariantNumeric: "tabular-nums" }}>
                      <div style={{ minWidth: 0 }}>
                        <div>{t.avgAtExit}</div>
                        <div style={{ fontSize: 16, color: "var(--color-on-graphite)", marginTop: 2 }}>
                          {dealsLocked ? <LockedInline label={a.locked.label} /> : <MedianN median={d.avg_price_eur} n={d.comparable_n} nKind="comparable" />}
                        </div>
                      </div>
                      <div style={{ minWidth: 0 }}>
                        {/* STR POLICY: the abbreviation is retired. This slot
                            used to print "8.7% STR" here and "Sell-through" on
                            the scanner — one metric, two spellings, one of them
                            an untranslatable English initialism.
                            THREE STATES, per card, never board-wide: we have a
                            rate / the server withheld it / nobody measured it.
                            A board-wide `strLive` flag showed the LOCK on a
                            card whose rate was merely thin, which claims a plan
                            boundary that does not exist. See locked-fields.ts. */}
                        <div>{str != null || strLocked ? a.metric.sellThrough : t.kpiLeftShelf}</div>
                        <div style={{ fontSize: 16, color: "var(--color-on-graphite)", marginTop: 2 }}>
                          {str != null
                            ? str
                            : strLocked
                              ? <LockedInline label={a.locked.label} />
                              : (d.sold_7d != null ? formatCount(d.sold_7d, locale) : "—")}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", fontSize: 13, color: "var(--color-graphite-muted)" }}>
                      <MomentumBadge momentum={d.momentum_label} sold7={d.sold_7d} sold30={d.sold_30d} />
                      {!dealsLocked && d.est_profit_eur != null && (
                        <span title={a.tip.targetNet} style={{ fontVariantNumeric: "tabular-nums" }}>{t.targetNet(eur(d.est_profit_eur))}</span>
                      )}
                    </div>

                    <SizePills sizes={d.top_sizes ?? []} />

                    {/* One filled control per card; Watch is text. */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: "auto" }}>
                      <Link
                        href={`/verdict?q=${encodeURIComponent(q)}`}
                        style={{ flex: 1, textAlign: "center", background: "var(--color-accent)", color: "var(--color-on-accent)", borderRadius: 12, padding: "10px 16px", fontSize: 15, fontWeight: 600, textDecoration: "none" }}
                      >{t.analyze}</Link>
                      <button
                        onClick={() => watch(d.brand, d.model)} title={a.deals.watchlistAdd}
                        style={{ background: "transparent", border: "1px solid var(--color-hairline)", borderRadius: 12, color: "var(--color-graphite-muted)", fontSize: 15, padding: "10px 14px", cursor: "pointer" }}
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
