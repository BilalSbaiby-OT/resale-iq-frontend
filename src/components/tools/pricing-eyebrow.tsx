"use client"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { GuestCheckoutButton } from "@/components/ui/guest-checkout-button"
import type { Locale } from "@/lib/i18n"

// H46: message-match banner for visitors who arrived from /pricing cold CTA.
// A pricing-page visitor is already solution-aware — they've seen the €19 plan
// and clicked through to /tools. The eyebrow acknowledges that context and
// directs them to immediately run a check, bridging the pricing-page promise
// ("see your buy-below number") and the tools-page action.
// Pattern mirrors WelcomeBanner (src/components/tools/welcome-banner.tsx).

function EyebrowInner({ locale = "en" }: { locale?: Locale }) {
  const params = useSearchParams()
  const src = params.get("src")

  if (src === "pricing-try-free" || src === "pricing-row") {
    return (
      // H60 CRO: pricing-try-free visitors are product-aware (saw /pricing) AND
      // now experience-aware (just ran a live verdict). CRO #10: match CTA
      // commitment to awareness stage — "Get Starter €19/mo" is the right
      // commitment level here, not "See how it works". Add GuestCheckoutButton
      // so they can go straight to checkout without another click to /pricing.
      // Revenue 2026-09-23.
      <div
        data-testid="riq-pricing-try-free-eyebrow"
        style={{
          marginBottom: 18,
          background: "rgba(48,209,88,.06)",
          border: "1px solid rgba(48,209,88,.22)",
          borderRadius: 12,
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 16, flexShrink: 0, lineHeight: 1.4 }} aria-hidden>✓</span>
          <p style={{ fontSize: 13.5, color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.55 }}>
            <strong style={{ color: "var(--color-text-primary)" }}>This is a real verdict — live data, no demo mode.</strong>{" "}
            Starter €19/mo unlocks buy-below prices on every brand and model you source.
          </p>
        </div>
        <GuestCheckoutButton locale={locale} label="Get Starter €19/mo →" src="pricing-try-free-eyebrow" />
      </div>
    )
  }

  if (src !== "pricing-cold-cta") return null
  return (
    <div
      data-testid="riq-pricing-eyebrow"
      style={{
        marginBottom: 18,
        background: "rgba(99,102,241,.07)",
        border: "1px solid rgba(99,102,241,.22)",
        borderRadius: 12,
        padding: "12px 16px",
      }}
    >
      <p style={{ fontSize: 13.5, color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.55 }}>
        <strong style={{ color: "var(--color-text-primary)" }}>You saw what Starter gets you.</strong>{" "}
        Type a brand and model below — the buy-below price is what you get from Starter, live.
      </p>
    </div>
  )
}

export function PricingEyebrow({ locale = "en" }: { locale?: Locale } = {}) {
  return (
    <Suspense fallback={null}>
      <EyebrowInner locale={locale} />
    </Suspense>
  )
}
