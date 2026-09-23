"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
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
 */
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
    </div>
  )
}
