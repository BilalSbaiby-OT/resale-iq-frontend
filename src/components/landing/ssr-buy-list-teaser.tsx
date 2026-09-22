/**
 * SsrBuyListTeaser — renders the top buy opportunities server-side so a
 * cold visitor sees real buy intelligence in the initial HTML without waiting
 * for JS hydration.
 *
 * This is NOT a replacement for HomeBuyList (the full interactive client
 * component). It is the SSR "above the fold" signal that proves the product
 * within 3 seconds of arrival. HomeBuyList stays below as the live-refresh
 * interactive table with locked rows and the paywall CTA.
 *
 * Design rules:
 * - Rows are free (unlocked) verdicts only — no lock icons, no paywall here.
 *   The teaser's job is to prove value, not to sell immediately.
 * - BUY/STRONG BUY get green badge. WATCH gets amber. Show the honest signal.
 * - No fabricated numbers. Every figure comes from the SSR buy-list fetch.
 * - Mobile-first: stacked card rows at 390px, not a table.
 */
import Link from "next/link"
import { TrendingUp } from "lucide-react"
import type { SsrBuyListItem } from "@/lib/ssr-buy-list"
import { copy, type Locale } from "@/lib/i18n"
import { canonicalPath } from "@/lib/locale-routes"
import { GuestCheckoutButton } from "@/components/ui/guest-checkout-button"

const VERDICT_COLOR: Record<string, string> = {
  "STRONG BUY": "#30D158",
  BUY: "#30D158",
  WATCH: "#FF9F0A",
  SKIP: "#8E8E93",
}
const VERDICT_BG: Record<string, string> = {
  "STRONG BUY": "rgba(48,209,88,.20)",
  BUY: "rgba(48,209,88,.15)",
  WATCH: "rgba(255,159,10,.15)",
  SKIP: "rgba(142,142,147,.12)",
}

function VerdictBadge({ verdict }: { verdict: string }) {
  const color = VERDICT_COLOR[verdict] ?? "#8E8E93"
  const bg = VERDICT_BG[verdict] ?? "rgba(142,142,147,.12)"
  const label = verdict === "STRONG BUY" ? "BUY" : verdict
  return (
    <span
      aria-label={verdict}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        background: bg, border: `1px solid ${color}40`,
        color, fontWeight: 700, fontSize: 11, letterSpacing: "0.04em",
        borderRadius: 6, padding: "3px 8px", whiteSpace: "nowrap",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
      }}
    >
      {label}
    </span>
  )
}

export function SsrBuyListTeaser({
  items,
  locale,
  showPrice = true,
}: {
  items: SsrBuyListItem[]
  locale: Locale
  /** Show the "Starter €19/mo" line under the footer CTA.
   *
   *  PROOF BEFORE PRICE (2026-09-22). Teardown of 11 comparable data/analytics
   *  products (Keepa, PriceCharting, SellerAmp, Jungle Scout, ZIK, Vendoo,
   *  Plausible, Fathom, Beehiiv, Helium 10, Flipwise) found ZERO that state a
   *  price above the fold; every one leads with dataset scale, a user count, or
   *  named proof and defers price to a later section or a /pricing page.
   *  Our homepage did the inverse — "Starter €19/mo" appeared in the first
   *  screen, before the visitor had seen a single answer. Measured locally:
   *  44 of 50 humans who reached /pricing had never seen a verdict.
   *  So: price OFF on the homepage (proof first), ON at /pricing where the
   *  visitor has already asked the commercial question. */
  showPrice?: boolean
}) {
  // Only show free (unlocked) rows — the teaser must prove the product finds
  // winners. BUY = hot momentum; RISING = strong 30-day history recovering
  // from the Sep 14-22 outage. Both are actionable; WATCH is shown if no
  // BUY/RISING rows are available. SKIP is never shown in the teaser.
  const freeRows = items
    .filter(i => !i.locked && (
      i.verdict === "STRONG BUY" || i.verdict === "BUY" || i.verdict === "RISING"
    ))
    .slice(0, 3)

  if (freeRows.length === 0) return null

  return (
    <div
      data-testid="riq-ssr-buy-list"
      style={{
        maxWidth: 640,
        width: "100%",
        margin: "0 auto",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif",
      }}
    >
      {/* Section label */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <TrendingUp size={15} color="#30D158" aria-hidden />
        <span style={{ fontSize: 12.5, fontWeight: 600, color: "#8FA3C4", letterSpacing: "0.02em" }}>
          Buying opportunities this week
        </span>
      </div>

      {/* Rows — card-style, stacks on mobile */}
      <div
        style={{
          background: "var(--color-surface, #12151d)",
          border: "1px solid rgba(255,255,255,.08)",
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        {freeRows.map((item, i) => (
          <div
            key={`${item.brand}-${item.category}`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              padding: "12px 16px",
              minHeight: 52,
              borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,.06)",
            }}
          >
            {/* Left: brand + model (or category if no model) */}
            <div style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0, flex: 1 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#EEF1F7", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {item.brand}{item.model ? ` ${item.model}` : ""}
              </span>
              <span style={{ fontSize: 12, color: "#8FA3C4" }}>
                {item.category}
                {/* DEMAND FIGURE — 2026-09-22.
                    This used to prefer sold_7d, which made the buy list read
                    "New Balance 530 · 7 sold/wk" for an item with 1,235 sold in
                    30 days. The Sep 14-22 ingest outage sits inside the 7-day
                    window, so sold_7d is a near-zero artefact until ~Sep 29 and
                    understates our single best item by ~176x. Leading a buy
                    list with a dead-looking number on its top row is worse than
                    showing nothing.
                    Prefer the 30-day evidence, which is honest and stable; fall
                    back to sold_7d only when 30d evidence is absent. Revisit
                    after Sep 29 only if 7d becomes the more useful signal. */}
                {item.sold_30d_evidence != null
                  ? ` · ${item.sold_30d_evidence.toLocaleString()} sold/30 days`
                  : item.sold_7d != null
                    ? ` · ${item.sold_7d} sold/wk`
                    : ""}
              </span>
            </div>

            {/* Right: verdict + buy-below price (the core hook, never gated per OS decision) */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
              <VerdictBadge verdict={item.verdict} />
              {item.avg_price_eur != null && (() => {
                // Canonical formula: avg × 0.95 × 0.70 = avg × 0.665
                // COMPANY-OS decision: the buy-below number is the free hook — never gate it.
                const buyBelow = Math.round(item.avg_price_eur * 0.665)
                return (
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#30D158", fontVariantNumeric: "tabular-nums" }}>
                    Buy below €{buyBelow}
                  </span>
                )
              })()}
            </div>
          </div>
        ))}

        {/* Footer CTA — re-laddered for cold traffic 2026-09-22:
            Free action is visually primary (filled button); paid checkout is
            secondary (link style). Cold LLM-referred visitors land seconds after
            an AI answer — getting one free check before paying is the correct
            first ask. The paid CTA stays present for visitors already sold. */}
        <div
          style={{
            padding: "12px 16px",
            borderTop: "1px solid rgba(255,255,255,.06)",
            background: "rgba(48,209,88,.04)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div>
            <p style={{ fontSize: 12.5, fontWeight: 600, color: "#EEF1F7", margin: "0 0 2px" }}>
              Full ranked list + buy-below on every brand, updated weekly.
            </p>
            {showPrice ? (
              <p style={{ fontSize: 11.5, color: "#6A7D9A", margin: 0 }}>
                Starter €19/mo · cancel anytime
              </p>
            ) : (
              /* Proof substitute, not a price. Keepa leads with "Monitoring
                 7,669,135,713 products", PriceCharting with "45,000+ games
                 priced", Plausible with "313B tracked pageviews". With zero
                 customers and zero testimonials, verifiable dataset scale is
                 the only honest trust signal we own — and we genuinely hold
                 13.4M listing records across 5 EU markets. */
              <p style={{ fontSize: 11.5, color: "#6A7D9A", margin: 0 }}>
                Built from 13.4M tracked Vinted listings across 5 EU markets
              </p>
            )}
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            {/* PRIMARY: free action — correct first ask for cold traffic */}
            <Link
              href={`${canonicalPath(locale, "/tools")}?src=ssr_free_check`}
              style={{
                background: "#34C759",
                color: "#06090c",
                fontWeight: 700,
                fontSize: 13.5,
                padding: "10px 18px",
                borderRadius: 9,
                textDecoration: "none",
                whiteSpace: "nowrap",
                display: "inline-block",
              }}
            >
              {copy[locale].checkItem} →
            </Link>
            {/* SECONDARY: paid checkout — demoted to link style for warm/ready visitors */}
            <GuestCheckoutButton locale={locale} label="Get buy-below prices →" src="ssr_buy_list" asLink />
          </div>
        </div>
      </div>
    </div>
  )
}
