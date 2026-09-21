"use client"
import { useState, useEffect } from "react"
import { getPlans, createCheckout } from "@/lib/api"
import { resolvePriceId, TIERS } from "@/lib/pricing"
import { getToken } from "@/lib/utils"
import { trackEvent } from "@/lib/analytics"
import { canonicalPath } from "@/lib/locale-routes"
import type { Locale } from "@/lib/i18n"

/**
 * useGuestCheckout — shared guest-checkout hook for Starter (operator tier).
 *
 * Extracted from HardPaywallCard and LimitReachedUpgrade (H47) because the
 * same fetch/state/fire pattern was duplicated verbatim — two places to break,
 * one of which would always be the one not under test. Fixes the duplicate-
 * logic gate that blocked H47's commit (check:dupes, 2026-09-16).
 *
 * Usage:
 *   const { ready, busy, start } = useGuestCheckout({ locale, src: "limit_reached" })
 *   <button onClick={start} disabled={!ready || busy}>…</button>
 */
export function useGuestCheckout({
  locale,
  src,
}: {
  locale: Locale
  /** analytics tag appended as src= to checkout_intent_guest event */
  src?: string
}) {
  const [stripePlans, setStripePlans] = useState<{ id: string; price_id?: string }[]>([])
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    getPlans()
      .then(d => setStripePlans(d.plans))
      .catch(() => {})
      .finally(() => setReady(true))
  }, [])

  const start = async () => {
    const placeholder = TIERS.find(x => x.id === "operator")?.priceId
    setBusy(true)
    const here = typeof window !== "undefined" ? window.location.pathname : "/tools"
    const eventPath = src ? `${here}?plan=operator&src=${src}` : `${here}?plan=operator`
    try {
      if (!getToken()) trackEvent("checkout_intent_guest", eventPath)
      const priceId = resolvePriceId(placeholder, stripePlans)
      if (!priceId) {
        window.location.href = `${canonicalPath(locale, "/register")}?plan=operator`
        return
      }
      const { checkout_url } = await createCheckout(priceId, { plan: "operator" })
      trackEvent("checkout_started")
      window.location.href = checkout_url
    } catch {
      // why: guest checkout fails for benign reasons (Stripe hiccup, plans not yet
      // loaded). The error is unactionable for the user, and the fallback to /register
      // keeps the button from ever being a dead end. No log because this path is expected
      // in dev and would produce noise; Stripe failures appear in the Stripe dashboard.
      window.location.href = `${canonicalPath(locale, "/register")}?plan=operator`
    } finally {
      setBusy(false)
    }
  }

  return { ready, busy, start }
}
