"use client"
/**
 * PricingStickyCtA — persistent bottom bar on /pricing during proof scroll.
 *
 * H174 CRO FIX: After the 2026-09-29 declutter (d282b78), plan cards are
 * NOW FIRST on /pricing (id="pricing-plans"). The original H152 logic showed
 * the sticky when scrollY > 400 AND #pricing-plans was visible — which was
 * correct when plans were below proof sections, but is wrong after the
 * reorder. With plans at the top:
 *
 *  BEFORE FIX:
 *   - At load: plans visible → sticky hidden ✓
 *   - After 400px scroll (still within plans section): plans visible → hidden ✓
 *   - After scrolling PAST plans into proof sections: plans.rect.top < 0, which
 *     is still < window.innerHeight * 0.75 → plansVisible = true → hidden ✗
 *   - Result: sticky NEVER shows while visitor reads proof sections. The bar
 *     was permanently hidden for any visitor who scrolled past the plan cards.
 *
 *  AFTER FIX:
 *   - Show when visitor has scrolled PAST the plan cards (plans.rect.bottom < 0)
 *     — they've seen the price, they're now in proof territory, the persistent
 *     CTA is useful.
 *   - Hide when visitor is back near the top (plans visible or above plans area)
 *     OR when visitor scrolls past #pricing-proof bottom (proof over, not needed).
 *
 * This restores the intended behavior: visible throughout the proof section
 * scroll, giving a convinced visitor a direct path to Stripe without scrolling
 * all the way back to the plan cards at the top.
 *
 * Changed: direct GuestCheckoutButton instead of scroll anchor. A visitor who
 * has scrolled past the plans and is reading proof is PRODUCT-AWARE — the right
 * CTA is "Start now" (direct Stripe), not "See plans" (scroll back to what they
 * already scrolled past). CRO #10 (CTA discipline: product-aware visitor → commit).
 *
 * CRO #9 (friction: no scroll-back required) + #10 (solution-aware → direct CTA)
 * + #12 (momentum: plan seen → proof read → earned CTA, not an interrupt)
 * + #6 (cognitive load: one action, email pre-filled from localStorage)
 *
 * H174 CRO. Surface: /pricing 12/7d. Revenue 2026-09-29.
 */
import { useEffect, useState } from "react"
import { GuestCheckoutButton } from "@/components/ui/guest-checkout-button"
import type { Locale } from "@/lib/i18n"

export function PricingStickyCta({ locale = "en" }: { locale?: Locale }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const plansEl = document.getElementById("pricing-plans")
        const proofEl = document.getElementById("pricing-proof")

        let show = false
        if (plansEl) {
          const rect = plansEl.getBoundingClientRect()
          // Show when the plan cards have FULLY scrolled above the viewport
          // (bottom edge is above the top of the screen). This means the visitor
          // has seen the plan cards and scrolled past them into the proof sections.
          const plansPastViewport = rect.bottom < 0
          // Hide again when the visitor scrolls beyond the proof sections
          // (optional safety: don't show if proof section is not yet loaded)
          let proofReachable = true
          if (proofEl) {
            const proofRect = proofEl.getBoundingClientRect()
            // Still useful as long as proof section is visible or above viewport
            proofReachable = proofRect.bottom > -200
          }
          show = plansPastViewport && proofReachable
        }

        setVisible(show)
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
        background: "var(--color-surface)",
        borderTop: "1px solid var(--color-border)",
        color: "var(--color-text-secondary)",
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
          color: "var(--color-text-secondary)",
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        <strong style={{ color: "var(--color-buy-ink)" }}>Starter €19/mo</strong>
        {" "}— unlock every item in the catalog, cancel anytime.
      </span>
      {/* H174 CRO: direct GuestCheckoutButton replaces scroll anchor.
          Visitor who has scrolled past plan cards is product-aware — the right
          ask is direct Stripe, not "scroll back to plans" (they already saw them).
          Email pre-filled from riq_capture_email (same pattern as every CTA surface).
          CRO #10 (CTA discipline: product-aware → commit, not navigate). */}
      <GuestCheckoutButton
        locale={locale}
        label="Start — €19/mo →"
        src="pricing_sticky_cta"
      />
    </div>
  )
}
