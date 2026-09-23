"use client"
import { useState } from "react"
import Link from "next/link"
import { GuestCheckoutButton } from "@/components/ui/guest-checkout-button"
import type { Locale } from "@/lib/i18n"
import { canonicalPath } from "@/lib/locale-routes"

/**
 * HomepageEmailCta — email-capture + checkout CTA below the homepage buy list.
 *
 * H98 CRO: 23 of 25 Stripe sessions had NO email typed — the email field is the
 * highest-friction moment on Stripe's own page (C199 confirmed this on blog posts).
 * The homepage GuestCheckoutButton previously went to Stripe cold, with no email
 * pre-filled. This component adds an optional email input before the CTA button:
 * - Visitor types their email → it pre-fills Stripe's customer_email field
 * - Visitor skips email → checkout still works (email is optional, same as C199)
 * - Email stored in localStorage (riq_capture_email) for future recovery
 *
 * Same pattern as BlogInlineChecker C199 (email capture before above-fold CTA)
 * but applied to the homepage primary checkout CTA. Keeps the guarantee line
 * and secondary /pricing link.
 *
 * CRO #6 (cognitive load: removing one required field from Stripe) +
 * #4 (objection handling: email capture shows commitment, reduces cold-start
 *    friction on Stripe's own form before the visitor sees it).
 * Revenue 2026-09-23.
 */
export function HomepageEmailCta({ locale, pricingText }: { locale: Locale; pricingText: string }) {
  const [email, setEmail] = useState("")

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setEmail(v)
    try {
      if (v.trim()) localStorage.setItem("riq_capture_email", v.trim())
    } catch { /* private mode */ }
  }

  return (
    <div
      style={{
        maxWidth: 520,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
      }}
    >
      {/* Optional email field — pre-fills Stripe. Visitor can ignore it. */}
      <input
        type="email"
        value={email}
        onChange={handleEmailChange}
        placeholder="Your email (optional — pre-fills Stripe)"
        autoComplete="email"
        style={{
          width: "100%",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border-ui)",
          borderRadius: 10,
          padding: "12px 16px",
          fontSize: 14,
          color: "var(--color-text-primary)",
          outline: "none",
          boxSizing: "border-box",
        }}
      />
      <GuestCheckoutButton
        locale={locale}
        label="Stop guessing — know the max to pay before you buy →"
        src="homepage_checkout"
        customerEmail={email.trim() || undefined}
      />
      <p style={{ fontSize: 12, color: "var(--color-text-dim)", margin: 0, textAlign: "center" }}>
        30-day money-back guarantee — miss your first flip? Full refund.
      </p>
      <Link
        href={`${canonicalPath(locale, "/pricing")}?src=homepage_cta`}
        style={{ fontSize: 12.5, color: "var(--color-text-dim)", textDecoration: "none" }}
      >
        {pricingText} →
      </Link>
    </div>
  )
}
