"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Check } from "lucide-react"
import { TIERS, resolvePriceId } from "@/lib/pricing"
import { PaybackCalculator } from "./payback-calculator"
import { getPlans, createCheckout } from "@/lib/api"
import { getToken } from "@/lib/utils"

export function PricingSection() {
  const router = useRouter()
  const [plans, setPlans] = useState<{ id: string; price_id?: string }[]>([])
  const [busy, setBusy] = useState<string | null>(null)

  useEffect(() => { getPlans().then(d => setPlans(d.plans)).catch(() => {}) }, [])

  const choose = async (tierId: string, placeholder?: string) => {
    // Free rung: no Stripe involved, just get them an account.
    if (tierId === "free") { router.push("/register?plan=free"); return }
    // Enquiry-only tier (no Stripe price): open a real mailbox we actually own.
    // Was hello@resaleiq.app (wrong domain, every Business lead lost), then a
    // personal Outlook address. Now the company address, which sends AND
    // receives: Resend SMTP out, Porkbun forwarding in. Verified round-trip
    // 2026-08-14.
    if (!placeholder) { window.location.href = "mailto:support@resaleiq.dev?subject=Resale%20IQ%20Business%20plan%20enquiry"; return }
    if (!getToken()) { router.push(`/register?plan=${tierId === "power" ? "power" : "operator"}`); return }
    setBusy(tierId)
    try {
      const priceId = resolvePriceId(placeholder, plans)
      if (!priceId) { router.push("/register"); return }
      const { checkout_url } = await createCheckout(priceId)
      window.location.href = checkout_url
    } catch { router.push("/register") } finally { setBusy(null) }
  }

  return (
    <section id="pricing" style={{ padding: "72px 24px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 44 }}>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "1.5px", color: "#22c55e", textTransform: "uppercase" }}>Pricing</div>
        <h2 style={{ fontSize: 34, fontWeight: 800, color: "#eef1f7", marginTop: 10, letterSpacing: "-0.6px" }}>Pay less for stock than you sell it for.</h2>
        <p style={{ fontSize: 15, color: "#8b99b8", marginTop: 10 }}>Start free — 7 days unlimited, then 10 checks a month. No card.</p>
      </div>

      <PaybackCalculator />

      {/* 4 tiers. At 1080px wide with a 260px minimum this resolved to 3
          columns, orphaning Free alone on a second row, left-aligned against a
          full-width row above — it read as a mistake. Widened the section and
          dropped the minimum so all four sit on one row at desktop, and added
          justifyContent so any wrapped row centres instead of hanging left. */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(232px, 1fr))",
        gap: 18, alignItems: "stretch", justifyContent: "center",
      }}>
        {TIERS.map(t => (
          <div key={t.id} style={{
            position: "relative",
            background: t.highlight ? "linear-gradient(180deg,#141a24,#10141c)" : "#12151d",
            border: `1px solid ${t.highlight ? "#22c55e" : "#1c2333"}`,
            borderRadius: 16, padding: "28px 24px",
            boxShadow: t.highlight ? "0 12px 40px rgba(34,197,94,.12)" : "none",
          }}>
            {t.highlight && (
              <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "#22c55e", color: "#06090c", fontSize: 11, fontWeight: 800, letterSpacing: "0.5px", padding: "4px 14px", borderRadius: 20 }}>MOST POPULAR</div>
            )}
            <div style={{ fontSize: 15, fontWeight: 700, color: "#eef1f7" }}>{t.name}</div>
            <div style={{ fontSize: 12.5, color: "#8b99b8", marginTop: 4, minHeight: 34 }}>{t.tagline}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, margin: "18px 0 4px" }}>
              <span style={{ fontSize: 40, fontWeight: 800, color: "#eef1f7", letterSpacing: "-1px" }}>
                {t.free ? "€0" : `€${t.price}`}
              </span>
              <span style={{ fontSize: 14, color: "#5b6b8c" }}>{t.free ? "forever" : "/month"}</span>
            </div>
            {/* Per-day price. A monthly figure is compared against other
                subscriptions; a daily one is compared against a coffee, and
                against the margin on a single flip. Same number, honest framing. */}
            <div style={{ fontSize: 12, color: "#5b6b8c", marginBottom: 14, minHeight: 17 }}>
              {t.free ? "No card required" : `about €${(t.price / 30).toFixed(2)} a day`}
            </div>
            <button onClick={() => choose(t.id, t.priceId)} disabled={busy === t.id} style={{
              width: "100%", padding: "11px 0", borderRadius: 9, fontSize: 13.5, fontWeight: 700, cursor: "pointer",
              border: t.highlight ? "none" : "1px solid #263147",
              background: t.highlight ? "#22c55e" : t.anchor ? "transparent" : "#1a2030",
              color: t.highlight ? "#06090c" : "#eef1f7", transition: "opacity .15s",
            }}>{busy === t.id ? "…" : t.cta}</button>
            {t.stepUp && (
              <div style={{ marginBottom: 16, background: "rgba(34,197,94,.07)", border: "1px solid rgba(34,197,94,.25)", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "#22c55e", marginBottom: 5 }}>{t.stepUp}</div>
                {t.stepUpWhy && (
                  <div style={{ fontSize: 12, color: "#a9b6d0", lineHeight: 1.55 }}>{t.stepUpWhy}</div>
                )}
              </div>
            )}
            {t.ceiling && (
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid #1c2333", fontSize: 12, color: "#5b6b8c", lineHeight: 1.5 }}>
                <span style={{ color: "#8b99b8", fontWeight: 600 }}>Where it stops: </span>{t.ceiling}
              </div>
            )}
            <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 11 }}>
              {t.features.map(f => (
                <div key={f} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                  <Check size={15} color={t.highlight ? "#22c55e" : "#5b6b8c"} strokeWidth={2.5} style={{ marginTop: 1, flexShrink: 0 }} />
                  <span style={{ fontSize: 12.5, color: "#c3cde0", lineHeight: 1.4 }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p style={{ textAlign: "center", fontSize: 12, color: "#4d5a75", marginTop: 26 }}>
        Every plan unlocks the full data — verdicts, buy-below prices, sizes, and live deals. Cancel anytime.
      </p>
    </section>
  )
}
