"use client"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

// H46: message-match banner for visitors who arrived from /pricing cold CTA.
// A pricing-page visitor is already solution-aware — they've seen the €19 plan
// and clicked through to /tools. The eyebrow acknowledges that context and
// directs them to immediately run a check, bridging the pricing-page promise
// ("see your buy-below number") and the tools-page action.
// Pattern mirrors WelcomeBanner (src/components/tools/welcome-banner.tsx).

function EyebrowInner() {
  const params = useSearchParams()
  if (params.get("src") !== "pricing-cold-cta") return null
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

export function PricingEyebrow() {
  return (
    <Suspense fallback={null}>
      <EyebrowInner />
    </Suspense>
  )
}
