"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Lock, TrendingUp } from "lucide-react"
import { GuestCheckoutButton } from "@/components/ui/guest-checkout-button"
import { AW26_REPORT_URL } from "@/lib/hard-paywall"
import type { Locale } from "@/lib/i18n"

/**
 * HomeBuyList — ranked teaser of top buying opportunities.
 *
 * CEO directive 2026-09-21: show a ranked BUY LIST immediately so the
 * visitor sees "Stone Island Hoodies — BUY — €71 avg" in 3 seconds.
 *
 * Data source: /api/public/buy-list — top N brand+category by opportunity_score.
 * Free rows: verdict + avg_price_eur visible.
 * Locked rows: brand/category visible, numbers behind paywall.
 * max_buy_price is NEVER shown free — that is the paid answer.
 *
 * Fix 2026-09-22 (Elon): resolved 6 visible defects:
 *  1. Column headers overlapping → 4-col grid with explicit min widths
 *  2. Blank verdict pill → derive verdict from price spread when API returns ""
 *  3. Em-dash departs/wk → replaced with "Listings" col (comparable_n is real)
 *  4. Mobile overflow → overflow-x scroll wrapper with scroll affordance
 *  5. Majority-locked rows → request 6, cap display at 5 (3 free + 2 locked)
 *  6. Apple HIG: sentence-case headers, 44px tap targets, system font
 */

interface BuyListItem {
  brand: string
  category: string
  verdict: "BUY" | "WATCH" | "SKIP" | string
  momentum: string
  locked: boolean
  sold_7d: number | null
  avg_price_eur: number | null
  comparable_n: number | null
  months_supply: number | null
  price_p25?: number | null
  price_p75?: number | null
}

// Apple HIG dark-theme signal colours.
// "STRONG BUY" needs its own entry: without one it falls back to the grey
// default, so our strongest signal would render in the SKIP colour.
const VERDICT_COLOR: Record<string, string> = {
  "STRONG BUY": "#30D158",  // system green
  BUY:   "#30D158",  // system green
  WATCH: "#FF9F0A",  // system orange
  SKIP:  "#8E8E93",  // system grey
}

const VERDICT_BG: Record<string, string> = {
  "STRONG BUY": "rgba(48,209,88,.22)",
  BUY:   "rgba(48,209,88,.15)",
  WATCH: "rgba(255,159,10,.15)",
  SKIP:  "rgba(142,142,147,.12)",
}

/**
 * Return the backend's real verdict.
 *
 * The tracker is live again and `/api/public/buy-list` now joins demand_index,
 * so rows arrive carrying a genuine "STRONG BUY" / "BUY" signal.
 *
 * "STRONG BUY" was missing from the accepted list below, so every STRONG BUY
 * row fell through to the price-spread heuristic and was relabelled — the three
 * free rows rendered WATCH / WATCH / SKIP while the API was returning STRONG
 * BUY for all three. That inverted our best signal into a "don't buy" on the
 * one table the homepage exists to sell.
 *
 * The spread heuristic is gone: it INVENTED a verdict from price dispersion and
 * presented it as our demand signal. A number we made up is worse than no
 * number. No signal now renders no pill.
 */
function deriveVerdict(item: BuyListItem): string {
  if (item.verdict && ["STRONG BUY", "BUY", "WATCH", "SKIP"].includes(item.verdict)) {
    return item.verdict
  }
  return ""
}

function VerdictBadge({ verdict }: { verdict: string }) {
  if (!verdict) return null
  const color = VERDICT_COLOR[verdict] ?? "#8E8E93"
  const bg    = VERDICT_BG[verdict]   ?? "rgba(142,142,147,.12)"
  return (
    <span
      aria-label={verdict}
      style={{
        display:       "inline-flex",
        alignItems:    "center",
        justifyContent: "center",
        background:    bg,
        border:        `1px solid ${color}40`,
        color,
        fontWeight:    700,
        fontSize:      11,
        letterSpacing: "0.04em",
        borderRadius:  6,
        padding:       "3px 8px",
        whiteSpace:    "nowrap",
        fontFamily:    "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
      }}
    >
      {verdict}
    </span>
  )
}

// 4-column grid — Item | Verdict | Listings | Avg price
// "Buy below" is always locked; removed as a standalone column so we don't
// waste a column showing nothing but a padlock on every row.
// Sized to fit within 390px viewport: 4×col + 3×gap(8) + 2×padding(14) = 344px < 390px
const COLS = "minmax(100px,1fr) 65px 62px 65px"

const HEADER_STYLE: React.CSSProperties = {
  fontSize:      12,
  fontWeight:    600,
  color:         "#5A6A80",
  letterSpacing: "0.02em",
  // sentence-case (not ALL-CAPS per Apple HIG)
  textTransform: "none",
  whiteSpace:    "nowrap",
  overflow:      "hidden",
  textOverflow:  "ellipsis",
}

export function HomeBuyList({ locale }: { locale: Locale }) {
  const [items, setItems]       = useState<BuyListItem[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(false)

  useEffect(() => {
    let live = true
    // Request 6 items — we'll display 5 (3 free + 2 locked) so the majority
    // is always real, not padlocked.
    fetch("/api/public/buy-list?limit=6")
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!live || !d?.items?.length) { setError(true); return }
        // Slice to 5 rows maximum to keep table short enough for above-fold CTA
        const capped = (d.items as BuyListItem[]).slice(0, 5)
        setItems(capped)
      })
      .catch(() => { if (live) setError(true) })
      .finally(() => { if (live) setLoading(false) })
    return () => { live = false }
  }, [])

  if (loading) return null
  if (error || items.length === 0) return null

  const lockedCount = items.filter(i => i.locked).length

  return (
    <div
      data-testid="riq-home-buy-list"
      style={{
        maxWidth:  680,
        margin:    "0 auto var(--space-3, 20px)",
        padding:   "0 0 8px",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      {/* Section header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <TrendingUp size={16} color="#30D158" aria-hidden />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#EEF1F7", letterSpacing: "-0.1px" }}>
            What to buy right now
          </span>
        </div>
        <span style={{ fontSize: 11, color: "#5A6A80" }}>
          Ranked by demand · EU5 Vinted
        </span>
      </div>

      {/* Buy list table — horizontally scrollable on narrow viewports */}
      <div
        style={{
          background:   "var(--color-surface, #1C1C1E)",
          border:       "1px solid var(--color-border-ui, #2C2C2E)",
          borderRadius: 12,
          overflow:     "hidden",
        }}
      >
        {/* Scroll wrapper — on mobile the table can scroll horizontally if needed */}
        <div
          style={{
            overflowX:            "auto",
            WebkitOverflowScrolling: "touch" as React.CSSProperties["WebkitOverflowScrolling"],
          }}
        >
          {/* min-width: 4 cols × 65 + 3 gaps × 8 + 2 paddings × 12 = 312px — fits in 375px+ */}
          <div style={{ minWidth: 310 }}>
            {/* Header row */}
            <div
              style={{
                display:            "grid",
                gridTemplateColumns: COLS,
                padding:            "8px 14px",
                borderBottom:       "1px solid var(--color-border-ui, #2C2C2E)",
                background:         "rgba(255,255,255,.025)",
                gap:                8,
              }}
            >
              {[
                { label: "Item",      align: "left"  as const },
                { label: "Verdict",   align: "left"  as const },
                { label: "Listings",  align: "right" as const },
                { label: "Avg",       align: "right" as const },
              ].map(({ label, align }) => (
                <span key={label} style={{ ...HEADER_STYLE, textAlign: align }}>{label}</span>
              ))}
            </div>

            {items.map((item, i) => {
              const verdict = deriveVerdict(item)
              return (
                <div
                  key={`${item.brand}-${item.category}-${i}`}
                  data-testid={item.locked ? "riq-buy-list-row-locked" : "riq-buy-list-row-free"}
                  style={{
                    display:            "grid",
                    gridTemplateColumns: COLS,
                    gap:                8,
                    padding:            "11px 14px",
                    borderBottom:       i < items.length - 1 ? "1px solid rgba(44,44,46,.8)" : "none",
                    alignItems:         "center",
                    background:         item.locked ? "rgba(10,10,10,.25)" : "transparent",
                    opacity:            item.locked ? 0.65 : 1,
                    minHeight:          44,  // Apple HIG min tap target
                    transition:         "background 0.15s ease",
                  }}
                >
                  {/* Item: Brand + category */}
                  <div style={{ overflow: "hidden" }}>
                    <span style={{
                      fontSize:   14,
                      fontWeight: 600,
                      color:      item.locked ? "#6A7D9A" : "#EEF1F7",
                      marginRight: 6,
                    }}>
                      {item.brand}
                    </span>
                    <span style={{ fontSize: 12, color: "#5A6A80" }}>
                      {item.category}
                    </span>
                  </div>

                  {/* Verdict */}
                  <div style={{ textAlign: "left" }}>
                    {item.locked
                      ? <Lock size={13} color="#3A3A3C" aria-label="Locked" />
                      : <VerdictBadge verdict={verdict} />
                    }
                  </div>

                  {/* Listings (comparable_n) — real number even for locked rows (teaser) */}
                  <span style={{
                    fontSize:   13,
                    color:      item.locked ? "#3A3A3C" : "#A0ABBA",
                    fontFamily: "ui-monospace, 'SF Mono', monospace",
                    textAlign:  "right",
                  }}>
                    {item.comparable_n != null ? item.comparable_n.toLocaleString("en-GB") : "—"}
                  </span>

                  {/* Avg price */}
                  <span style={{
                    fontSize:   13,
                    color:      item.locked ? "#3A3A3C" : "#A0ABBA",
                    fontFamily: "ui-monospace, 'SF Mono', monospace",
                    textAlign:  "right",
                  }}>
                    {item.locked
                      ? <Lock size={11} color="#3A3A3C" aria-hidden />
                      : (item.avg_price_eur != null ? `€${item.avg_price_eur}` : "—")
                    }
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Paywall footer — visible CTA above the fold */}
        <div
          style={{
            padding:        "14px 16px",
            borderTop:      "1px solid var(--color-border-ui, #2C2C2E)",
            background:     "rgba(48,209,88,.04)",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "space-between",
            flexWrap:       "wrap",
            gap:            10,
          }}
        >
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#EEF1F7", margin: "0 0 2px" }}>
              {lockedCount} more rows locked — plus buy-below price on every item.
            </p>
            <p style={{ fontSize: 12, color: "#6A7D9A", margin: 0 }}>
              Starter €19/mo — cancel anytime. Instant access.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <GuestCheckoutButton
              locale={locale}
              label="Unlock all →"
              src="buy_list_paywall"
            />
            <a
              href={AW26_REPORT_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 12, color: "#60A5FA", textDecoration: "none", whiteSpace: "nowrap" }}
            >
              AW26 report €49 →
            </a>
          </div>
        </div>
      </div>

      {/* "See full data" link */}
      <p style={{ textAlign: "center", margin: "10px 0 0", fontSize: 12 }}>
        <Link href="/data" style={{ color: "#5A6A80", textDecoration: "none" }}>
          Public brand volumes → /data
        </Link>
        <span style={{ color: "#3A3A3C", margin: "0 8px" }}>·</span>
        <Link href="/pricing" style={{ color: "#5A6A80", textDecoration: "none" }}>
          See all plans
        </Link>
      </p>
    </div>
  )
}
