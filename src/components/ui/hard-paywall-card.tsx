"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Lock } from "lucide-react"
import { copy, type Locale } from "@/lib/i18n"
import { canonicalPath } from "@/lib/locale-routes"
import { getPlans, createCheckout } from "@/lib/api"
import { resolvePriceId, TIERS } from "@/lib/pricing"
import { trackEvent } from "@/lib/analytics"
import { getToken } from "@/lib/utils"
import { operatorPrice, type PaywallPlan } from "@/lib/hard-paywall"
import { useTrackedLabel } from "@/lib/use-tracked-label"

/**
 * The conversion face for HARD_PAYWALL=1: anon/unpaid /api/verdict is 402.
 * Guest checkout goes straight to Stripe (same path as /pricing) — the
 * register wall was the #1 measured drop.
 */
export function HardPaywallCard({ locale, plans }: { locale: Locale; plans?: PaywallPlan[] }) {
  const t = copy[locale].checker
  const price = operatorPrice(plans)
  const tracked = useTrackedLabel()
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
    try {
      if (!getToken()) trackEvent("checkout_intent_guest", `${here}?plan=operator`)
      const priceId = resolvePriceId(placeholder, stripePlans)
      if (!priceId) {
        window.location.href = `${canonicalPath(locale, "/register")}?plan=operator`
        return
      }
      const { checkout_url } = await createCheckout(priceId)
      trackEvent("checkout_started")
      window.location.href = checkout_url
    } catch {
      // why: guest checkout can fail (Stripe hiccup, plans not loaded). Same
      // fallback as /pricing: send them to /register?plan=operator so the
      // button is never a dead end.
      window.location.href = `${canonicalPath(locale, "/register")}?plan=operator`
    } finally {
      setBusy(false)
    }
  }

  return (
    <div data-testid="riq-hard-paywall">
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <Lock size={15} style={{ color: "#34C759" }} aria-hidden />
        <span style={{ fontSize: 15.5, fontWeight: 700, color: "#eef1f7" }}>{t.paywallHeadline}</span>
      </div>
      <p style={{ fontSize: 13.5, color: "#8b99b8", lineHeight: 1.65, marginBottom: 14 }}>{t.paywallBody.replace("{{TRACKED}}", tracked)}</p>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
        <button
          type="button"
          onClick={start}
          disabled={!ready || busy}
          style={{
            background: "#34C759",
            color: "#06090c",
            fontWeight: 700,
            fontSize: 13.5,
            padding: "10px 18px",
            borderRadius: 9,
            border: "none",
            cursor: ready && !busy ? "pointer" : "wait",
          }}
        >
          {t.paywallCta(price)}
        </button>
        <Link href={canonicalPath(locale, "/login")} style={{ color: "#8fa3c4", fontSize: 13 }}>
          {t.paywallLogin}
        </Link>
        {/* PRICING LINK. The paywall card's only navigation options were
            "start checkout" (Stripe) and "already have account?" (login).
            No link to /pricing meant a visitor who wants to compare tiers
            before committing could not — so they left. One quiet line. */}
        <Link href={canonicalPath(locale, "/pricing")} data-testid="riq-paywall-see-plans" style={{ color: "#8fa3c4", fontSize: 13 }}>
          {t.seePlans}
        </Link>
      </div>
    </div>
  )
}
