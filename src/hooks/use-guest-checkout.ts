"use client"
import { useState, useEffect } from "react"
import { getPlans, createCheckout } from "@/lib/api"
import { resolvePriceId, TIERS } from "@/lib/pricing"
import { getToken } from "@/lib/utils"
import { trackEvent } from "@/lib/analytics"
import { canonicalPath } from "@/lib/locale-routes"
import { useAuthStore } from "@/lib/auth-store"
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
  query,
}: {
  locale: Locale
  /** analytics tag appended as src= to checkout_intent_guest event */
  src?: string
  /** The item the visitor was checking when they hit the paywall.
   *  Saved to localStorage before redirect so /billing/success can
   *  pre-fill their first check, and /pricing?checkout=cancelled can
   *  show what they were about to unlock. C196. */
  query?: string
}) {
  const [stripePlans, setStripePlans] = useState<{ id: string; price_id?: string }[]>([])
  // H84 CRO: initialise ready=true because BAKED_PRICE_IDS always provides a
  // fallback operator price_id. Previously the button was disabled (cursor:wait)
  // on first paint while getPlans() resolved — on blog pages the paywall card
  // renders from SSR immediately, so users who clicked the CTA within the first
  // ~300ms saw no response and abandoned. Revenue 2026-09-23.
  const [ready, setReady] = useState(true)
  const [busy, setBusy] = useState(false)
  // H80 CRO: read authenticated user's email to prefill Stripe checkout.
  // useAuthStore is safe to call in a hook that already runs client-side only.
  const { user } = useAuthStore()

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
      // C196 CRO: save the item query before redirecting to Stripe so
      // /billing/success pre-fills the first check and the cancelled-
      // recovery card can show "you were about to unlock [item]".
      // Same localStorage key as register-form.tsx — both flows read it
      // on /billing/success. Private mode silently fails.
      try {
        if (query?.trim()) localStorage.setItem("riq_intent_query", query.trim())
      } catch { /* private mode / storage quota */ }
      const priceId = resolvePriceId(placeholder, stripePlans)
      if (!priceId) {
        window.location.href = `${canonicalPath(locale, "/register")}?plan=operator`
        return
      }
      const { checkout_url } = await createCheckout(priceId, {
        plan: "operator",
        // H80 CRO: pass user's email (if logged in) so Stripe pre-populates
        // the email field — closes the 23/25 no-email-typed gap.
        customer_email: user?.email || undefined,
      })
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
