"use client"
import { useEffect, useState, useCallback, useMemo, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { AppShell } from "@/components/layout/app-shell"
import { MomentumBadge } from "@/components/ui/momentum-badge"
import { MomentumWarmupNotice } from "@/components/ui/momentum-warmup-notice"
// ScoreBar is deliberately gone from this card. It was a fourth figure — a
// decorative 0-100 gauge nobody acts on — competing with the buy-below price,
// and `opportunity_score` is a gated field, so on a free account it rendered
// an empty bar that looked like a score of zero. It still lives on /trends.
import { SizePills } from "@/components/ui/size-pills"
import { LiveDealsModal } from "@/components/ui/live-deals-modal"
import { MedianN } from "@/components/ui/median-n"
import { getDeals, addToWatchlist, getBatchPriceHistory } from "@/lib/api"
import type { PricePoint } from "@/lib/api"
import { eur } from "@/lib/utils"
import { formatStrPct } from "@/lib/str-pct"
import { isFieldLocked } from "@/lib/locked-fields"
import { useLocale } from "@/components/i18n/locale-provider"
import { appCopy } from "@/lib/app-copy"
import { categoryName, formatCount, localizeConfidenceNote } from "@/lib/verdict-words"
import type { Deal } from "@/types"
import { Star, Lock } from "lucide-react"

/**
 * THE DEAL SCANNER — and the reason this file was rewritten.
 *
 * Live on production 2026-09-06, authenticated, locale=Español: "Deal
 * Scanner", "Find live deals", "BUY BELOW", "SELL-THROUGH", "HOT", "RISING",
 * "All Categories", "Search model or brand…". Every one of them an English
 * literal typed straight into JSX. This component never called `useLocale()`
 * once — not a dictionary miss, not a provider that failed to reach it (the
 * provider has been mounted in the root layout the whole time and the sidebar
 * beside this page renders in Spanish correctly). There was simply nothing
 * here to translate. See src/lib/app-copy.ts for the full diagnosis.
 *
 * THE VISUAL PASS. It was four metric tiles per card, each a filled box with a
 * mono uppercase micro-label, plus a coloured 4px left border, plus a tinted
 * momentum chip, plus a coloured score bar — on a three-across grid. Every
 * element was competing and none was winning. Now: ONE figure is large (the
 * buy-below price, which is the only number the customer acts on), at most
 * three figures total, no tiles, no left border, hairlines instead of boxes,
 * and exactly one filled accent control per card. Target net moved to the
 * quiet meta line — it is derived from buy-below, so it was never a peer of it.
 */

function Sparkline({ points, width = 72, height = 24 }: { points: PricePoint[]; width?: number; height?: number }) {
  if (points.length < 2) return null
  const prices = points.map(p => p.avg_price)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const range = max - min || 1
  const coords = prices.map((p, i) => ({
    x: (i / (prices.length - 1)) * width,
    y: height - ((p - min) / range) * (height - 4) - 2,
  }))
  const d = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ")
  // The trend line is not a verdict. It was full-strength #22c55e / #ef4444 —
  // the same green as the primary CTA — so a sparkline read as an
  // instruction. Muted to a hairline-weight mark that says direction only.
  const trending = prices[prices.length - 1] >= prices[0]
  const color = trending ? "rgba(52,211,153,.55)" : "rgba(248,113,113,.55)"
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }} aria-hidden>
      <path d={d} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** A secondary figure: quiet label above, value below. No box. */
function Figure({ label, value, title }: { label: string; value: React.ReactNode; title?: string }) {
  return (
    <div title={title} style={{ minWidth: 0 }}>
      <div style={{ fontSize: 13, color: "var(--color-graphite-muted)", fontWeight: 400 }}>{label}</div>
      <div style={{ fontSize: 16, color: "var(--color-on-graphite)", fontVariantNumeric: "tabular-nums", marginTop: 2 }}>{value}</div>
    </div>
  )
}

function DealsContent() {
  const locale = useLocale()
  const t = appCopy[locale]
  const [liveDeal, setLiveDeal] = useState<Deal | null>(null)
  const searchParams = useSearchParams()
  const [all, setAll] = useState<Deal[]>([])
  const [warmingUp, setWarmingUp] = useState(false)
  const [buyLocked, setBuyLocked] = useState(false)
  const [strLocked, setStrLocked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sparklines, setSparklines] = useState<Record<string, PricePoint[]>>({})
  const [q, setQ] = useState(searchParams.get("q") || "")
  const [category, setCategory] = useState(searchParams.get("category") || "")
  const [brand, setBrand] = useState(searchParams.get("brand") || "")
  const [momentum, setMomentum] = useState(searchParams.get("momentum") || "")
  // Sorted by the TRANSLATED label, otherwise a Spanish list reads
  // alphabetised by its English original. `localeCompare` also gets accents
  // right, which a raw `.sort()` does not.
  const categories = [...new Set(all.map(d => d.category).filter(Boolean))]
    .sort((a, b) => (categoryName(a, locale) ?? "").localeCompare(categoryName(b, locale) ?? "", locale))
  const brands = [...new Set(all.map(d => d.brand).filter(Boolean))].sort((a, b) => a.localeCompare(b, locale))

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const d = await getDeals({ limit: 200 })
      setAll(d.deals)
      setWarmingUp(!!d.momentum_warming_up)
      // Same rule the panel already applies: `locked` is a constant false on
      // every backend branch, so the server's own `locked_fields` list is the
      // only trustworthy signal. Without this a withheld buy-below fell
      // through to `eur(undefined)` and printed a bare "—" — a plan boundary
      // rendered as missing data. See src/lib/locked-fields.ts.
      setBuyLocked(d.locked || isFieldLocked(d.locked_fields, "max_buy_price"))
      // Both spellings: /api/deals gates the rate as `str_pct`, the verdict
      // payload as `sell_through_rate` (src/lib/locked-fields.ts).
      setStrLocked(isFieldLocked(d.locked_fields, "str_pct") || isFieldLocked(d.locked_fields, "sell_through_rate"))
    }
    catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (all.length === 0) return
    const pairs = all.slice(0, 20).map(d => `${d.brand}::${d.model}`)
    getBatchPriceHistory(pairs, 30)
      .then(r => setSparklines(r.data))
      .catch(() => {})
  }, [all])

  // Derived, not stored. This was `useState` + a `useEffect` that called
  // `setFiltered` on every keystroke — an extra render per character and the
  // cascading-render pattern react-hooks/set-state-in-effect flags. Filtering
  // is a pure function of the four inputs, so it belongs in render.
  const filtered = useMemo(() => {
    let f = all
    if (q) f = f.filter(d => d.model.toLowerCase().includes(q.toLowerCase()) || d.brand.toLowerCase().includes(q.toLowerCase()))
    if (category) f = f.filter(d => d.category === category)
    if (brand) f = f.filter(d => d.brand === brand)
    if (momentum) f = f.filter(d => d.momentum_label === momentum)
    return f
  }, [all, q, category, brand, momentum])

  const [notice, setNotice] = useState<string | null>(null)
  const handleWatchlist = async (deal: Deal) => {
    try { await addToWatchlist(deal.brand, deal.model); setNotice(t.deals.watchlistAdded) }
    catch { setNotice(t.deals.watchlistAlready) }
  }
  useEffect(() => {
    if (!notice) return
    const id = setTimeout(() => setNotice(null), 2600)
    return () => clearTimeout(id)
  }, [notice])

  const control = {
    background: "transparent",
    border: "1px solid var(--color-hairline)",
    borderRadius: 12,
    padding: "8px 12px",
    fontSize: 15,
    color: "var(--color-on-graphite)",
    outline: "none",
  } as const

  return (
    <AppShell title={t.deals.title} subtitle={t.deals.subtitle(formatCount(filtered.length, locale))}>
      <MomentumWarmupNotice warmingUp={warmingUp} />

      {/* Filters — hairline controls on the page background, not a boxed
          toolbar. The toolbar used to be a filled panel with its own border,
          which made the filters look heavier than the results. */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 24 }}>
        <input
          value={q} onChange={e => setQ(e.target.value)} placeholder={t.deals.searchPlaceholder}
          aria-label={t.deals.searchPlaceholder}
          style={{ ...control, width: 220 }}
        />
        <select value={category} onChange={e => setCategory(e.target.value)} aria-label={t.deals.allCategories} style={control}>
          <option value="">{t.deals.allCategories}</option>
          {/* The VALUE stays the catalogue's English key — it is what the
              filter compares against and what the URL carries. Only the label
              is translated. Translating the value would silently break every
              /deals?category=… link. */}
          {categories.map(c => <option key={c} value={c}>{categoryName(c, locale)}</option>)}
        </select>
        <select value={brand} onChange={e => setBrand(e.target.value)} aria-label={t.deals.allBrands} style={control}>
          <option value="">{t.deals.allBrands}</option>
          {brands.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <div style={{ display: "flex", gap: 4 }}>
          {["", "HOT", "RISING", "STABLE"].map(m => (
            <button
              key={m} onClick={() => setMomentum(m)}
              aria-pressed={momentum === m}
              style={{
                padding: "8px 12px", borderRadius: 12, fontSize: 15, cursor: "pointer",
                border: "1px solid transparent",
                background: momentum === m ? "rgba(255,255,255,.08)" : "transparent",
                color: momentum === m ? "var(--color-on-graphite)" : "var(--color-graphite-muted)",
                transition: "background var(--motion-fast) var(--motion-ease), color var(--motion-fast) var(--motion-ease)",
              }}
            >{m ? t.momentum[m as keyof typeof t.momentum] : t.deals.allMomentum}</button>
          ))}
        </div>
        {/* The chips are rank buckets, so say so where a touch device — which
            never gets the badge's hover — can still read it. */}
        <div style={{ flexBasis: "100%", fontSize: 13, lineHeight: 1.45, color: "var(--color-graphite-muted)" }}>
          {t.deals.momentumCaption}
        </div>
        {(q || category || brand || momentum) && (
          <button
            onClick={() => { setQ(""); setCategory(""); setBrand(""); setMomentum("") }}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15, color: "var(--color-graphite-muted)", padding: "8px 4px" }}
          >{t.deals.clear}</button>
        )}
        <span style={{ marginLeft: "auto", fontSize: 13, color: "var(--color-graphite-muted)", fontVariantNumeric: "tabular-nums" }}>
          {t.deals.count(formatCount(filtered.length, locale))}
        </span>
      </div>

      {notice && (
        <div role="status" style={{ marginBottom: 16, fontSize: 15, color: "var(--color-graphite-muted)" }}>{notice}</div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 16 }}>
          {Array(6).fill(0).map((_, i) => (
            <div key={i} style={{ background: "var(--color-graphite-elevated)", borderRadius: 14, height: 184 }} className="animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: "80px 0", textAlign: "center", fontSize: 17, color: "var(--color-graphite-muted)" }}>{t.deals.empty}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 16 }}>
          {filtered.map((d, i) => {
            const str = formatStrPct(d.str_pct)
            const note = localizeConfidenceNote(d.confidence_note, locale)
            return (
              <div
                key={i}
                data-testid="riq-deal-card"
                style={{
                  background: "var(--color-graphite-elevated)",
                  borderRadius: 14,
                  padding: 20,
                  display: "flex", flexDirection: "column", gap: 16,
                }}
              >
                <div>
                  <div style={{ fontSize: 17, fontWeight: 600, color: "var(--color-on-graphite)", lineHeight: 1.3 }}>{d.model}</div>
                  <div style={{ fontSize: 13, color: "var(--color-graphite-muted)", marginTop: 2 }}>
                    {d.brand}{d.category ? ` · ${categoryName(d.category, locale)}` : ""}
                  </div>
                </div>

                {/* FIGURE 1 — the only number the customer acts on. */}
                <div>
                  <div style={{ fontSize: 13, color: "var(--color-graphite-muted)" }}>{t.metric.buyBelow}</div>
                  <div style={{ fontSize: 30, fontWeight: 600, color: "var(--color-on-graphite)", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.022em", lineHeight: 1.1, marginTop: 2 }}>
                    {buyLocked
                      ? (
                        // Withheld is not unknown. A bare em-dash here reads as
                        // "this product has no answer"; the lock plus a route to
                        // /account reads as "this answer is in a plan".
                        <Link
                          href="/account" data-testid="riq-locked-buy"
                          aria-label={t.locked.label}
                          style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 17, fontWeight: 500, color: "var(--color-graphite-muted)", textDecoration: "none" }}
                        >
                          <Lock size={15} aria-hidden />{t.locked.label}
                        </Link>
                      )
                      : eur(d.max_buy_price)}
                  </div>
                </div>

                {/* FIGURES 2 and 3. Never more — `str` and `listedNow` are the
                    same slot, because they answer the same question with
                    whichever evidence exists. */}
                <div style={{ display: "flex", gap: 24 }}>
                  <Figure label={t.metric.avgAtExit} value={<MedianN median={d.avg_price_eur} n={d.comparable_n} nKind="comparable" />} />
                  {/* THREE STATES, never two: we have the rate / the server
                      withheld it / nobody measured it. Collapsing "withheld"
                      into "not measured" hides an upgrade path; collapsing
                      "not measured" into "withheld" claims a plan boundary
                      that does not exist. See src/lib/locked-fields.ts. */}
                  {str != null
                    ? <Figure label={t.metric.sellThrough} value={str} />
                    : strLocked
                      ? <Figure label={t.metric.sellThrough} value={
                          <Link href="/account" aria-label={t.locked.label} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 15, color: "var(--color-graphite-muted)", textDecoration: "none" }}>
                            <Lock size={13} aria-hidden />{t.locked.label}
                          </Link>
                        } />
                      : <Figure label={t.metric.listedNow} value={d.active_listings != null ? formatCount(d.active_listings, locale) : "—"} />}
                </div>

                {/* Provisional ranking stays provisional — IN THE READER'S
                    LANGUAGE. This rendered `{d.confidence_note}` raw: a
                    backend English sentence dropped into a Spanish card with
                    nothing between the payload and the JSX, which is the exact
                    defect `localizeConfidenceNote` exists to close and which
                    the free checker has routed through it since #56.
                    KNOWN GAP, and it is in the helper, not here: production
                    /api/deals currently sends "Real data, thinner sample. 19
                    sold comparables is below our HIGH bar of 30 — the price is
                    honest, just less precise." (verified 14:38Z 2026-09-06, 4
                    of 8 board rows). None of the helper's five patterns match
                    that shape, so it falls through to the documented
                    pass-the-original branch and this note is still English in
                    /es until a sixth pattern is added to verdict-words.ts —
                    owned by another lane, reported rather than forked here. A
                    second copy of the matcher would be worse than the leak. */}
                {note ? (
                  <div style={{ fontSize: 13, color: "var(--color-graphite-muted)", lineHeight: 1.45 }}>{note}</div>
                ) : d.str_pct == null && (
                  <div style={{ fontSize: 13, color: "var(--color-graphite-muted)", lineHeight: 1.45 }}>{t.deals.thinSample}</div>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: "var(--color-graphite-muted)", flexWrap: "wrap" }}>
                  <MomentumBadge momentum={d.momentum_label} sold7={d.sold_7d} sold30={d.sold_30d} />
                  {d.est_profit_eur != null && (
                    <span title={t.tip.targetNet} style={{ fontVariantNumeric: "tabular-nums" }}>
                      {t.metric.targetNet} +{eur(d.est_profit_eur)}
                    </span>
                  )}
                  {sparklines[`${d.brand}::${d.model}`] && (
                    <span title={t.tip.priceTrend} style={{ marginLeft: "auto" }}>
                      <Sparkline points={sparklines[`${d.brand}::${d.model}`]} />
                    </span>
                  )}
                </div>

                <SizePills sizes={d.top_sizes ?? []} />

                {/* ONE filled control per card. Watchlist is a ghost icon. */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: "auto" }}>
                  <button
                    onClick={() => setLiveDeal(d)}
                    style={{
                      flex: 1, padding: "10px 16px", borderRadius: 12, border: "none", cursor: "pointer",
                      background: "var(--color-accent)", color: "var(--color-on-accent)",
                      fontSize: 15, fontWeight: 600,
                      transition: "opacity var(--motion-fast) var(--motion-ease)",
                    }}
                  >{t.deals.findLive}</button>
                  <button
                    onClick={() => handleWatchlist(d)}
                    aria-label={t.deals.watchlistAdd} title={t.deals.watchlistAdd}
                    style={{
                      background: "transparent", border: "1px solid var(--color-hairline)", borderRadius: 12,
                      padding: "10px 12px", cursor: "pointer", color: "var(--color-graphite-muted)",
                      display: "inline-flex", alignItems: "center",
                      transition: "color var(--motion-fast) var(--motion-ease)",
                    }}
                  ><Star size={16} /></button>
                  {d.sourcing_links && d.sourcing_links.length > 0 && d.sourcing_links.map((l) => (
                    <a
                      key={l.market} href={l.url} target="_blank" rel="noopener noreferrer"
                      title={t.tip.openMarket(l.market)}
                      style={{ fontSize: 13, padding: "10px 8px", color: "var(--color-graphite-muted)", textDecoration: "none" }}
                    >{l.market}</a>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
      {liveDeal && <LiveDealsModal deal={liveDeal} onClose={() => setLiveDeal(null)} />}
    </AppShell>
  )
}

export default function DealsPage() {
  return <Suspense><DealsContent /></Suspense>
}
