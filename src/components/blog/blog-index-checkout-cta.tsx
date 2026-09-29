"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Check } from "lucide-react"
import { GuestCheckoutButton } from "@/components/ui/guest-checkout-button"
import { getToken, getPlanFromToken } from "@/lib/utils"
import { canonicalPath } from "@/lib/locale-routes"
import type { Locale } from "@/lib/i18n"

/**
 * H96 CRO: direct Stripe checkout on /blog index — remove the /pricing
 * redirect that was adding a navigation step for 130 weekly visitors.
 *
 * H102 CRO: email-capture before /blog index checkout — same fix as C199
 * (blog posts) and H98 (homepage). 23/25 Stripe sessions abandoned with no
 * email typed. /blog index (130 visitors/7d) is the highest-traffic surface
 * that was still missing the email pre-fill. Adding the optional email input
 * before the CTA removes one required field from Stripe's own form.
 * Email stored in localStorage (riq_capture_email) for future recovery.
 * CRO #6 (cognitive load: fewer required fields on Stripe) + #12 (conversion
 * momentum: email capture is a micro-commitment that reduces Stripe-page drop).
 * Revenue 2026-09-23.
 *
 * H171 CRO: feature bullets + guarantee badge on /blog index CTA.
 * Before: bare email input + green button — zero value proposition. 130 weekly
 * visitors arrived from ChatGPT, read an article, saw a naked checkout button
 * with no context for what €19/mo buys. Every other CTA surface (HardPaywallCard,
 * VerdictUpsellCta, PricingSection, InlineVerdictCard) shows feature bullets and
 * a guarantee line; /blog index was the one high-traffic surface left bare.
 * After: 3 concrete bullets (verdict + unlimited + sell-through) + guarantee badge
 * directly above the email input. Pattern from HardPaywallCard and PricingSection.
 * Honesty: no fabricated numbers, no invented reviews — feature bullets are factual.
 * CRO #4 (objection: "what do I actually get?") + #7 (trust before CTA: proof
 * before the ask) + #10 (CTA discipline: name what they buy, not just a price).
 * Surface: /blog 130/7d — the highest-traffic landing surface.
 * Revenue 2026-09-29. H171.
 */
const BLOG_INDEX_FEATURES = [
  "BUY / WATCH / SKIP verdict + exact buy-below price for any item",
  "Unlimited checks — 8,400+ models across 5 EU markets",
  "Sell-through rate, weekly demand, top sizes — all unlocked",
] as const

export function BlogIndexCheckoutCta({ locale = "en" }: { locale?: Locale }) {
  const [paid, setPaid] = useState(false)
  const [checked, setChecked] = useState(false)
  const [email, setEmail] = useState("")

  useEffect(() => {
    const token = getToken()
    if (token) {
      const plan = getPlanFromToken()
      // operator = Starter, power = Pro — both are paid
      setPaid(Boolean(plan && plan !== "free"))
    }
    // Pre-populate from localStorage if the visitor already typed it elsewhere
    try {
      const saved = localStorage.getItem("riq_capture_email")
      if (saved?.trim()) setEmail(saved.trim())
    } catch { /* private mode */ }
    setChecked(true)
  }, [])

  if (paid) {
    return (
      <Link
        href={canonicalPath(locale, "/dashboard")}
        style={{
          display: "inline-block",
          background: "#34C759",
          color: "#06090c",
          fontWeight: 700,
          fontSize: 14,
          padding: "11px 22px",
          borderRadius: 9,
          textDecoration: "none",
        }}
      >
        Open dashboard →
      </Link>
    )
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        width: "100%",
        maxWidth: 440,
        margin: "0 auto",
      }}
    >
      {/* H171 CRO: feature bullets — what €19/mo actually buys.
          Blog index CTA was a naked button with no context; visitors couldn't
          answer "what do I get?" before clicking. These 3 bullets mirror the
          HardPaywallCard offer block, condensed for a non-paywall surface.
          Honest: all claims match what Starter delivers. No invented numbers. */}
      <div
        data-testid="riq-blog-index-feature-bullets"
        style={{
          width: "100%",
          background: "rgba(52,199,89,.06)",
          border: "1px solid rgba(52,199,89,.18)",
          borderRadius: 12,
          padding: "12px 14px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 0 }}>
          {BLOG_INDEX_FEATURES.map((f) => (
            <div key={f} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <Check size={13} color="#34C759" strokeWidth={2.5} style={{ marginTop: 2, flexShrink: 0 }} aria-hidden />
              <span style={{ fontSize: 13, color: "#c3cde0", lineHeight: 1.5 }}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      <input
        type="email"
        value={email}
        onChange={(e) => {
          const v = e.target.value
          setEmail(v)
          try {
            if (v.trim()) localStorage.setItem("riq_capture_email", v.trim())
          } catch { /* private mode */ }
        }}
        placeholder="Your email (optional — pre-fills Stripe)"
        autoComplete="email"
        style={{
          width: "100%",
          background: "var(--color-surface-elevated)",
          border: "1px solid var(--color-border-ui)",
          borderRadius: 10,
          padding: "11px 14px",
          fontSize: 14,
          color: "var(--color-text-primary)",
          outline: "none",
          boxSizing: "border-box",
        }}
      />
      <GuestCheckoutButton
        locale={locale}
        label={checked ? "Start — €19/mo →" : "Start — €19/mo →"}
        src="blog_index_cta"
        customerEmail={email.trim() || undefined}
      />
      {/* H171 CRO: guarantee badge — same trust signal as HardPaywallCard (H153)
          and VerdictUpsellCta (H166). Resolves "what if it's not worth it?" at
          the exact decision moment. CRO #4 (objection: what if it fails?). */}
      <p
        data-testid="riq-blog-index-guarantee"
        style={{ fontSize: 11.5, color: "#5b6b8c", margin: 0, display: "flex", alignItems: "center", gap: 5 }}
      >
        <Check size={11} color="#5b6b8c" strokeWidth={2} aria-hidden />
        <a href="/terms" style={{ color: "#5b6b8c", textDecoration: "underline" }}>
          Full refund within 30 days of your first payment — see Terms
        </a>
      </p>
    </div>
  )
}
