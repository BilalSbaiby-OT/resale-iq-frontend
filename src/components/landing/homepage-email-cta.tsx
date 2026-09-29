"use client"
import { useState, useEffect } from "react"
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
 *
 * H132 CRO: Read riq_capture_email on mount — skip the email input for
 * return visitors who already gave their email on /pricing, /tools, or blog.
 * BEFORE: every visitor (first-time or return) saw the email input, even if
 * riq_capture_email was already set. A visitor who typed their email on /pricing
 * then visited the homepage had to type it again. All other capture surfaces
 * (HardPaywallCard, pricing-section, pricing-try-input) read on mount — this was
 * the only writer that didn't read.
 * AFTER: if riq_capture_email is set, the input is hidden and the checkout button
 * renders directly — one click to Stripe instead of type-then-click.
 * When no email is known, the input still shows exactly as before.
 * CRO #6 (cognitive load: return visitors skip duplicate input) + #9 (every
 * section guides action — the email input was blocking action for people who
 * already completed it). Revenue 2026-09-28.
 */
export function HomepageEmailCta({ locale, pricingText }: { locale: Locale; pricingText: string }) {
  const [email, setEmail] = useState("")
  // H132 CRO: read captured email from localStorage so return visitors skip the input.
  // Same pattern used in HardPaywallCard, pricing-section, pricing-try-input.
  // useEffect (client-only) avoids SSR mismatch — first render is always "" then
  // synchronises to the stored value before paint completes.
  useEffect(() => {
    try {
      const stored = localStorage.getItem("riq_capture_email") ?? ""
      if (stored) setEmail(stored)
    } catch { /* private mode */ }
  }, [])

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
      {/* H132 CRO: only show the email input when no email is captured yet.
          Return visitors (email in localStorage from /pricing, /tools, blog) go
          directly to the checkout button — one click to Stripe with email pre-filled.
          First-time visitors see the input exactly as before. */}
      {!email && (
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
      )}
      <GuestCheckoutButton
        locale={locale}
        label="Stop guessing — know the max to pay before you buy →"
        src="homepage_checkout"
        customerEmail={email.trim() || undefined}
      />
      {/* H149 CRO: price + trust signals under homepage primary CTA (homepage 52/7d).
          BEFORE: homepage final ask showed no price, no guarantee, no cancel-anytime —
          weaker than the /pricing Starter card which shows "Instant access · cancel anytime
          · 30-day refund policy." A visitor who never navigated to /pricing (most of them)
          saw a cold green button with no commitment context.
          AFTER: "Starter €19/mo · cancel anytime · 30-day refund policy" mirrors the
          exact copy in pricing-section.tsx H90, placed right below the CTA where doubt
          fires. /terms s.3 confirms the 30-day full refund — this is honest.
          CRO #4 (objection: what if it fails? — refund removes the risk framing) +
          #10 (price in CTA context: solution-aware visitor sees commitment level without
          navigating to /pricing to find it).
          Revenue 2026-09-29. H149. */}
      <p style={{ fontSize: 11.5, color: "var(--color-text-dim)", margin: "2px 0 0", textAlign: "center", lineHeight: 1.5 }}>
        Starter €19/mo · cancel anytime ·{" "}
        <a href="/terms" style={{ color: "var(--color-text-dim)", textDecoration: "underline" }}>
          30-day refund policy
        </a>
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
