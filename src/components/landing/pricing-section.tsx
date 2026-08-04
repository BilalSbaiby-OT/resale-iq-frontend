"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Check } from "lucide-react"
import { TIERS, resolvePriceId } from "@/lib/pricing"
import { getPlans, createCheckout } from "@/lib/api"
import { getToken } from "@/lib/utils"

export function PricingSection() {
  const router = useRouter()
  const [plans, setPlans] = useState<{ id: string; price_id?: string }[]>([])
  const [busy, setBusy] = useState<string | null>(null)

  useEffect(() => { getPlans().then(d => setPlans(d.plans)).catch(() => {}) }, [])

  const choose = async (tierId: string, placeholder?: string) => {
    if (!placeholder) { window.location.href = "mailto:hello@resaleiq.app?subject=Business%20plan%20early%20access"; return }
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
    <section id="pricing" style={{ padding: "72px 24px", maxWidth: 1080, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 44 }}>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "1.5px", color: "#22c55e", textTransform: "uppercase" }}>Pricing</div>
        <h2 style={{ fontSize: 34, fontWeight: 800, color: "#eef1f7", marginTop: 10, letterSpacing: "-0.6px" }}>One bad sourcing decision costs more than a month of Pro.</h2>
        <p style={{ fontSize: 15, color: "#8b99b8", marginTop: 10 }}>No free tier — just the data that pays for itself on your first flip. Cancel anytime.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, alignItems: "start" }}>
        {TIERS.map(t => (
          <div key={t.id} style={{
            position: "relative",
            background: t.highlight ? "linear-gradient(180deg,#141a24,#10141c)" : "#12151d",
            border: `1px solid ${t.highlight ? "#22c55e" : "#1c2333"}`,
            borderRadius: 16, padding: "28px 24px",
            transform: t.highlight ? "scale(1.04)" : "none",
            boxShadow: t.highlight ? "0 12px 40px rgba(34,197,94,.12)" : "none",
          }}>
            {t.highlight && (
              <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "#22c55e", color: "#06090c", fontSize: 11, fontWeight: 800, letterSpacing: "0.5px", padding: "4px 14px", borderRadius: 20 }}>MOST POPULAR</div>
            )}
            <div style={{ fontSize: 15, fontWeight: 700, color: "#eef1f7" }}>{t.name}</div>
            <div style={{ fontSize: 12.5, color: "#8b99b8", marginTop: 4, minHeight: 34 }}>{t.tagline}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, margin: "18px 0" }}>
              <span style={{ fontSize: 40, fontWeight: 800, color: "#eef1f7", letterSpacing: "-1px" }}>€{t.price}</span>
              <span style={{ fontSize: 14, color: "#5b6b8c" }}>/month</span>
            </div>
            <button onClick={() => choose(t.id, t.priceId)} disabled={busy === t.id} style={{
              width: "100%", padding: "11px 0", borderRadius: 9, fontSize: 13.5, fontWeight: 700, cursor: "pointer",
              border: t.highlight ? "none" : "1px solid #263147",
              background: t.highlight ? "#22c55e" : t.anchor ? "transparent" : "#1a2030",
              color: t.highlight ? "#06090c" : "#eef1f7", transition: "opacity .15s",
            }}>{busy === t.id ? "…" : t.cta}</button>
            <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 11 }}>
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
        Try the buy/sell verdict tool free, no signup — then pick a plan when you see the data.
      </p>
    </section>
  )
}
