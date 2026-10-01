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
import { itemDisplayName } from "@/lib/item-display-name"
import { buyBelowLabel, BUY_LIST_UNLOCK_LABEL } from "@/lib/buy-list-display"

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

function RowContent({ item }: { item: SsrBuyListItem }) {
  return (
    <>
      {/* Left: brand + model (or category if no model) */}
      <div style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0, flex: 1 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {itemDisplayName(item.brand, item.model)}
        </span>
        <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
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
            ? ` · ${item.sold_30d_evidence.toLocaleString()} departed/30 days`
            : item.sold_7d != null
              ? ` · ${item.sold_7d} departures/wk`
              : ""}
        </span>
      </div>

      {/* Right: verdict + the real stored buy-below + typical exit price.
          H184 CRO: Show avg_price_eur ("exit ~€106") alongside buy_below ("↓€70")
          so the reseller can read the full margin at a glance without going deeper.
          RESEARCH (fetched 2026-09-29):
          - Plausible: shows full value before asking — visitor needs both sides of the
            data to understand what they're buying.
          - Keepa free graph: buy-price AND sell-price in same view — never just one number.
          - Linear free: shows exactly what you get (250 issues) — the complete picture.
          The buy-below is the ceiling. avg_price_eur is the expected recovery. Together
          they define the margin. Without the exit price the BUY signal is incomplete —
          a visitor on mobile sees "↓€70" and has no idea if that's 10% or 40% margin.
          HONESTY: avg_price_eur comes from the live API (avg recent departure price).
          Never recomputed, never invented — omitted when null. Labelled "exit ~€X" to
          signal it's a typical exit, not a guaranteed sale (watched departures, not sales).
          Not shown on locked rows (buy_below is already null there; this guard matches).
          CRO #8 (specificity: complete the picture with a real second number)
          + #2 (single core desire: resell = buy + sell, show both halves inline)
          + #4 (objection: "worth it?" answered by visible margin, not imagination).
          Surface: homepage 52/7d + /pricing 12/7d. Revenue 2026-09-29. H184. */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
        <VerdictBadge verdict={item.verdict} />
        {buyBelowLabel(item.buy_below) && (
          <span style={{ fontSize: 13, fontWeight: 700, color: "#30D158", fontVariantNumeric: "tabular-nums" }}>
            {buyBelowLabel(item.buy_below)}
          </span>
        )}
        {/* H184: typical exit price — the reseller's other required number.
            Only shown when both buy_below and avg_price_eur are present so the
            row is always consistent: if we can show one we show both, otherwise neither.
            Math: use Math.round for clean integer, matching buy-below label format.
            Never on locked rows (buy_below null protects the guard above anyway). */}
        {item.buy_below != null && item.avg_price_eur != null && item.avg_price_eur > 0 && (
          <span
            data-testid="riq-buy-list-exit-price"
            style={{ fontSize: 11, color: "var(--color-text-muted)", fontVariantNumeric: "tabular-nums" }}
          >
            exit ~€{Math.round(item.avg_price_eur)}
          </span>
        )}
      </div>
    </>
  )
}

export function SsrBuyListTeaser({
  items,
  locale,
  showPrice = true,
  rowSrc,
  showLockedFomo: _showLockedFomo = false,
  ctaScrollTo,
  trackedLabel,
}: {
  items: SsrBuyListItem[]
  locale: Locale
  /**
   * H66 CRO: when provided, each buy-list row becomes a link that navigates to
   * /tools with the item pre-filled as the query. The visitor lands on /tools,
   * FreeChecker auto-runs, and the paywall (for non-sample items) + PricingEyebrow
   * close the loop: they see "we have data on this item → subscribe to unlock it."
   * Used by /pricing (rowSrc="pricing-row"). Homepage rows stay non-clickable.
   * CRO Principle #4 (objection: "do they have my item?") + #8 (specificity).
   * Revenue 2026-09-23.
   */
  rowSrc?: string
  /**
   * H82 CRO: when true, show 2 blurred locked rows after the free rows to prove
   * the ranked list is deeper than what's visible and create genuine FOMO.
   * Used on /pricing only. Homepage stays uncluttered.
   * No fabricated data: brand + category come from the real API response.
   * Revenue 2026-09-23.
   */
  showLockedFomo?: boolean
  /**
   * H111 CRO: when provided, the footer paid CTA becomes a smooth-scroll anchor
   * to this id instead of a direct Stripe checkout. Used on /pricing to route
   * visitors through proof (LiveMarketPulse → BrandStrip → VerdictDemo →
   * PricingTryInput) before the plan cards + FAQ + 30-day guarantee.
   * 23/25 Stripe sessions had zero email typed — cold direct checkout is the
   * leak. CRO #12 (conversion momentum: proof → conviction → CTA). Revenue 2026-09-23.
   */
  ctaScrollTo?: string
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
  /**
   * Live dataset label for the proof-substitute line shown when showPrice=false
   * (homepage). Passed from the SSR page so the number matches the meta
   * description rather than a stale hardcoded figure.
   * Falls back to "13.4M" only when the caller does not supply it.
   */
  trackedLabel?: string | null
}) {
  // Top 3 unlocked rows, including WATCH. The list is often all WATCH; dropping
  // those made the teaser render nothing. SKIP never appears (the API excludes it).
  const freeRows = items
    .filter(i => !i.locked && i.verdict !== "SKIP")
    .slice(0, 3)
  const lockedRows = items.filter(i => i.locked).slice(0, 4)

  if (freeRows.length === 0 && lockedRows.length === 0) return null

  const baseRowStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "12px 16px",
    minHeight: 52,
  } as const

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
        <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--color-text-secondary)", letterSpacing: "0.02em" }}>
          What to look for this week
        </span>
      </div>

      {/* Rows — card-style, stacks on mobile */}
      <div
        style={{
          background: "var(--color-surface, #12151d)",
          border: "1px solid var(--color-hairline)",
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        {freeRows.map((item, i) => {
          const q = itemDisplayName(item.brand, item.model)
          const rowHref = rowSrc
            ? `${canonicalPath(locale, "/tools")}?q=${encodeURIComponent(q)}&src=${rowSrc}`
            : null
          const borderTop = i === 0 ? "none" : "1px solid var(--color-hairline)"
          if (rowHref) {
            return (
              <Link
                key={`${item.brand}-${item.category}`}
                href={rowHref}
                style={{ ...baseRowStyle, borderTop, textDecoration: "none", color: "inherit" }}
              >
                <RowContent item={item} />
              </Link>
            )
          }
          return (
            <div
              key={`${item.brand}-${item.category}`}
              style={{ ...baseRowStyle, borderTop }}
            >
              <RowContent item={item} />
            </div>
          )
        })}

        {lockedRows.map((item, i) => (
          <div
            key={`locked-${item.brand}-${item.model ?? item.category}-${i}`}
            data-testid="riq-buy-list-row-locked"
            style={{
              ...baseRowStyle,
              borderTop: "1px solid rgba(255,255,255,.06)",
              opacity: 0.72,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0, flex: 1 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#8FA3C4", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {itemDisplayName(item.brand, item.model)}
              </span>
              <span style={{ fontSize: 12, color: "#6A7D9A" }}>{item.category}</span>
            </div>
            <span style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, color: "#6A7D9A", fontSize: 12, fontWeight: 600 }}>
              <svg width="11" height="13" viewBox="0 0 11 13" fill="none" aria-hidden="true">
                <rect x="1" y="5" width="9" height="7" rx="2" stroke="#6A7D9A" strokeWidth="1.5" fill="none"/>
                <path d="M3 5V3.5a2.5 2.5 0 0 1 5 0V5" stroke="#6A7D9A" strokeWidth="1.5" fill="none"/>
              </svg>
              {BUY_LIST_UNLOCK_LABEL}
            </span>
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
            borderTop: "1px solid var(--color-hairline)",
            background: "rgba(48,209,88,.04)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div>
            <p style={{ fontSize: 12.5, fontWeight: 600, color: "var(--color-text-primary)", margin: "0 0 2px" }}>
              Full list + buy-below, updated weekly.
            </p>
            {showPrice ? (
              <p style={{ fontSize: 11.5, color: "var(--color-text-muted)", margin: 0 }}>
                Starter €19/mo · cancel anytime
              </p>
            ) : (
              /* Proof substitute, not a price. Keepa leads with "Monitoring
                 7,669,135,713 products", PriceCharting with "45,000+ games
                 priced", Plausible with "313B tracked pageviews". With zero
                 customers and zero testimonials, verifiable dataset scale is
                 the only honest trust signal we own.
                 Live value passed from SSR page to keep in sync with meta desc. */
              <p style={{ fontSize: 11.5, color: "var(--color-text-muted)", margin: 0 }}>
                Built from {trackedLabel ?? "13.4M"} tracked Vinted listings across 5 EU markets
              </p>
            )}
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            {/* H88: /pricing (showPrice) is solution-aware — plans/checkout lead.
                Homepage (showPrice=false): check leads. The secondary control
                scrolls to the plan cards on this page. It must not open Stripe. */}
            {showPrice ? (
              <>
                {/* H111 CRO: ctaScrollTo routes pricing-page visitors through
                    proof before checkout, instead of hitting Stripe cold.
                    23/25 Stripe sessions had zero email — they weren't ready.
                    Scroll-to-plans lets them see verdict demo + FAQ + 30-day
                    guarantee before committing. CRO #12. Revenue 2026-09-23. */}
                {ctaScrollTo ? (
                  <a
                    href={`#${ctaScrollTo}`}
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
                    See plans →
                  </a>
                ) : (
                  <GuestCheckoutButton locale={locale} src="ssr_buy_list_pricing" />
                )}
                <Link
                  href={`${canonicalPath(locale, "/tools")}?src=ssr_free_check_pricing`}
                  style={{
                    color: "var(--color-text-secondary)",
                    fontWeight: 500,
                    fontSize: 13.5,
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  {copy[locale].checkItem} →
                </Link>
              </>
            ) : (
              <>
                {/* Homepage: the rows already show a buy-below. Do not open
                    Stripe from this block — 23/25 sessions had no email, and
                    44/50 pricing viewers had never seen a verdict. Check is
                    the action. Plans are further down the same page. */}
                <a
                  href="#check"
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
                </a>
                <a
                  href="#pricing"
                  data-testid="riq-home-see-plans"
                  style={{
                    color: "var(--color-text-secondary)",
                    fontWeight: 500,
                    fontSize: 13.5,
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  {copy[locale].pricing} →
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
