/**
 * PricingTryInput — "Try your own item" client input below the sample verdict.
 *
 * WHY: The PricingVerdictDemo (H105) shows a static Nike AF1 sample, which
 * proves the product format but doesn't connect to the visitor's OWN items.
 * A visitor sourcing Stone Island or Carhartt sees AF1 data and thinks "nice,
 * but does it work for mine?" — and the page has no answer.
 *
 * This closes that gap: a text input lets them type their item, then routes to
 * /tools?q=X&src=pricing_try. The paywall fires there with their exact item
 * named in the context copy, converting the abstract "maybe it works" into
 * "I can see my item is in-universe — I just need to unlock it."
 *
 * HOW IT WORKS:
 *  - Pure navigation on submit — no API call, no JS dependency, no spinner.
 *  - /tools auto-runs the query via its useEffect on ?q= (already built).
 *  - HardPaywallCard at /tools carries the item name into checkout copy.
 *  - src=pricing_try is a funnel source for analytics.
 *
 * H114 CRO: Added "free live samples" chips — AF1/Samba/NB530 are the 3
 * public sample queries that return FULL verdicts with no account required.
 * The pricing page never surfaced them — visitors had no way to experience
 * a real verdict before the paywall. These chips make the free path
 * discoverable at the exact moment of "does it actually work?"
 * Plausible.io pattern: trial access before payment proves value;
 * Beehiiv: free tier shows the product, then ask to upgrade.
 * ResaleIQ equivalent: free sample queries are the "trial" — they just
 * weren't labelled or linked at the purchase decision point.
 * CRO #4 (objection: does it work?) + #7 (trust before CTA) + #12
 * (demonstration → conviction → ask). Revenue 2026-09-23. H114.
 *
 * CRO principles:
 *  #3 (message match): visitor's own item in the paywall headline.
 *  #4 (objection: does it work for MY items?): they try and find out.
 *  #7 (trust before CTA): free live verdict = product proves itself.
 *  #8 (specificity): live data for their item, not a generic claim.
 *  #12 (conversion momentum): demo → personalized → paywall → checkout.
 *
 * Revenue 2026-09-23. H108 / H114.
 */
"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { canonicalPath } from "@/lib/locale-routes"
import type { Locale } from "@/lib/i18n"

/** Three public sample queries — full verdicts, no account, no paywall. */
const FREE_SAMPLES: { label: string; q: string }[] = [
  { label: "Nike Air Force 1", q: "Nike Air Force 1" },
  { label: "Adidas Samba", q: "Adidas Samba" },
  { label: "New Balance 530", q: "New Balance 530" },
]

export function PricingTryInput({ locale }: { locale: Locale }) {
  const [q, setQ] = useState("")
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = q.trim()
    if (!trimmed) return
    router.push(canonicalPath(locale, `/tools?q=${encodeURIComponent(trimmed)}&src=pricing_try`))
  }

  return (
    <div
      data-testid="riq-pricing-try-input"
      style={{
        maxWidth: 1040,
        margin: "0 auto",
        padding: "0 24px 28px",
      }}
    >
      <p
        style={{
          fontSize: 13,
          color: "#8b99b8",
          margin: "0 0 10px",
          fontWeight: 500,
        }}
      >
        Check your own item — type any brand + garment:
      </p>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          gap: 8,
          maxWidth: 480,
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "var(--color-surface)",
            border: "1px solid var(--color-border-ui)",
            borderRadius: 10,
            padding: "0 12px",
          }}
        >
          <Search size={14} color="#5b6b8c" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="e.g. Stone Island Hoodie"
            autoComplete="off"
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: 14,
              color: "var(--color-text-primary)",
              padding: "10px 0",
            }}
          />
        </div>
        <button
          type="submit"
          disabled={!q.trim()}
          style={{
            background: "#30D158",
            color: "#000",
            border: "none",
            borderRadius: 10,
            padding: "10px 18px",
            fontSize: 14,
            fontWeight: 700,
            cursor: q.trim() ? "pointer" : "not-allowed",
            opacity: q.trim() ? 1 : 0.45,
            whiteSpace: "nowrap",
          }}
        >
          Check it →
        </button>
      </form>

      {/* H114 CRO: free live sample chips — full verdicts, no account needed.
          The 3 public sample queries (AF1/Samba/NB530) return buy-below price,
          sell-through and demand without any paywall. They are the product's
          "free trial" moment. Surfacing them here answers the #1 objection at
          the purchase decision point: "does it actually work?"
          src=pricing_free_sample tracks this funnel entry separately. */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginTop: 12,
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: 12, color: "#5b6b8c", whiteSpace: "nowrap" }}>
          Or try free live examples:
        </span>
        {FREE_SAMPLES.map(({ label, q: sampleQ }) => (
          <a
            key={sampleQ}
            href={canonicalPath(locale, `/tools?q=${encodeURIComponent(sampleQ)}&src=pricing_free_sample`)}
            style={{
              fontSize: 12,
              color: "#34C759",
              border: "1px solid rgba(52,199,89,.35)",
              borderRadius: 6,
              padding: "3px 9px",
              textDecoration: "none",
              whiteSpace: "nowrap",
              fontWeight: 600,
              lineHeight: 1.6,
            }}
          >
            {label}
          </a>
        ))}
        <span style={{ fontSize: 11.5, color: "#4a5970", whiteSpace: "nowrap" }}>
          — no account required
        </span>
      </div>
    </div>
  )
}
