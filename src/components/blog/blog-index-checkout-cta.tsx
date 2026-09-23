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
 * BEFORE: SmartCTA "Get the numbers" → /pricing (cold visitors must scroll
 * past the entire pricing page again before they can click a CTA).
 * AFTER: GuestCheckoutButton → Stripe directly, with "Start — €19/mo →"
 * as the label. CRO #10 (commitment ladder: solution-aware cold blog
 * visitor should go straight to Stripe, not a second landing page).
 * CRO #12 (conversion momentum: they saw the buy list, they read a guide,
 * the CTA should convert the built intent, not defer it).
 *
 * Authed paid users stay on the dashboard path — same as SmartCTA did.
 * Revenue 2026-09-23.
 */
export function BlogIndexCheckoutCta({ locale = "en" }: { locale?: Locale }) {
  const [paid, setPaid] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const token = getToken()
    if (token) {
      const plan = getPlanFromToken()
      // operator = Starter, power = Pro — both are paid
      setPaid(Boolean(plan && plan !== "free"))
    }
    setChecked(true)
  }, [])

  if (!checked) {
    // SSR / first paint: render the checkout button (correct default for 99%+)
    return (
      <GuestCheckoutButton
        locale={locale}
        label="Start — €19/mo →"
        src="blog_index_cta"
      />
    )
  }

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
    <GuestCheckoutButton
      locale={locale}
      label="Start — €19/mo →"
      src="blog_index_cta"
    />
  )
}
