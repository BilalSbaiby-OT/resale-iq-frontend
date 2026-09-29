"use client"
/**
 * PricingStickyCtA — persistent bottom bar on /pricing during proof scroll.
 *
 * WHY: /pricing has 5+ proof sections between the buy-list teaser and the plan
 * cards: LiveMarketPulse, BrandStrip, PricingVerdictDemo, PricingTryInput,
 * RoiExampleCard. A visitor who is convinced at the VerdictDemo (~800px scroll)
 * has NO persistent CTA — they must scroll up or continue scrolling down to
 * reach the plan cards. The skip-to-plans link at the top is long gone.
 *
 * Blog has BlogStickyBar (H141) which made the checkout action visible throughout
 * the read. /pricing — higher-intent, product-aware visitors — had no equivalent.
 *
 * WHAT IT DOES:
 *  - Appears after 400px scroll (buy-list teaser is past the viewport).
 *  - Disappears when #pricing-plans is visible (visitor can see the real CTAs).
 *  - Direct scroll anchor to #pricing-plans — CRO #10 (solution-aware → commit).
 *  - Pre-fills email from riq_capture_email (same pattern as BlogStickyBar H142).
 *  - "Plans from €19/mo" with a scroll anchor — no cold Stripe hit, preserves
 *    the proof → conviction → plan-card → checkout momentum (CRO #12).
 *
 * RULES:
 *  - Never shows when the plan cards are visible (no redundant pressure).
 *  - Never POST /stripe/checkout directly from here — scrolls to #pricing-plans.
 *  - No fabricated numbers. No fake urgency. One clear action.
 *
 * CRO #9 (friction: convinced visitor can act immediately without scrolling back)
 * + #10 (CTA discipline: solution-aware → anchor to plans, not a cold buy)
 * + #12 (momentum: conviction → earned CTA, not an interrupt)
 * + #6 (cognitive load: one button, one scroll, no new choices introduced)
 *
 * H152 CRO. Surface: /pricing 12/7d. Revenue 2026-09-29.
 */
import { useEffect, useState } from "react"
import { canonicalPath } from "@/lib/locale-routes"
import type { Locale } from "@/lib/i18n"

export function PricingStickyCta({ locale = "en" }: { locale?: Locale }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const scrollY = window.scrollY
        // Show after 400px (proof sections have started).
        // Hide when #pricing-plans is at or above the viewport midpoint —
        // visitor can already see the plan cards.
        const plansEl = document.getElementById("pricing-plans")
        let plansVisible = false
        if (plansEl) {
          const rect = plansEl.getBoundingClientRect()
          plansVisible = rect.top < window.innerHeight * 0.75
        }
        setVisible(scrollY > 400 && !plansVisible)
        ticking = false
      })
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll() // run once on mount in case page is already scrolled
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  if (!visible) return null

  return (
    <div
      data-testid="riq-pricing-sticky-cta"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: "rgba(11,13,16,0.97)",
        borderTop: "1px solid rgba(52,199,89,.25)",
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      } as React.CSSProperties}
    >
      <span
        style={{
          fontSize: 13,
          color: "#8FA3C4",
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        <strong style={{ color: "#34C759" }}>Starter €19/mo</strong>
        {" "}— unlock every item in the catalog, cancel anytime.
      </span>
      <a
        href={`${canonicalPath(locale, "/pricing")}#pricing-plans`}
        data-testid="riq-pricing-sticky-scroll"
        style={{
          background: "#30D158",
          color: "#000",
          fontWeight: 700,
          fontSize: 13.5,
          padding: "9px 18px",
          borderRadius: 9,
          textDecoration: "none",
          whiteSpace: "nowrap",
          flexShrink: 0,
          display: "inline-block",
        }}
      >
        See plans →
      </a>
    </div>
  )
}
