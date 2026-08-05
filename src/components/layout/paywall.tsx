"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Lock, Check } from "lucide-react"
import { TIERS, resolvePriceId } from "@/lib/pricing"
import { getPlans, createCheckout } from "@/lib/api"
import { useAuthStore } from "@/lib/auth-store"

// Hard paywall — shown to any authenticated account without an active paid
// plan. There is no free tier: the app is inaccessible until they subscribe.
export function Paywall() {
  const router = useRouter()
  const { logout } = useAuthStore()
  const [plans, setPlans] = useState<{ id: string; price_id?: string }[]>([])
  const [busy, setBusy] = useState<string | null>(null)

  useEffect(() => { getPlans().then(d => setPlans(d.plans)).catch(() => {}) }, [])

  const subscribe = async (placeholder?: string) => {
    if (!placeholder) { window.location.href = "mailto:hello@resaleiq.app?subject=Business%20plan"; return }
    setBusy(placeholder)
    try {
      const priceId = resolvePriceId(placeholder, plans)
      if (!priceId) return
      const { checkout_url } = await createCheckout(priceId)
      window.location.href = checkout_url
    } catch { /* stay */ } finally { setBusy(null) }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0B0D10", color: "#eef1f7", display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 28 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#22c55e,#0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#06090c" }}>R</div>
        <span style={{ fontSize: 16, fontWeight: 700 }}>Resale IQ</span>
      </div>

      <div style={{ textAlign: "center", maxWidth: 560, marginBottom: 34 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(34,197,94,.1)", border: "1px solid rgba(34,197,94,.3)", borderRadius: 20, padding: "5px 14px", fontSize: 12, color: "#22c55e", marginBottom: 18 }}>
          <Lock size={13} /> Choose a plan to unlock your dashboard
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.6px" }}>The data that pays for itself on your first flip.</h1>
        <p style={{ fontSize: 15, color: "#8b99b8", marginTop: 10 }}>30M+ listings, live deal finder, 3-week Order Planner, and buy/sell verdicts — the full toolkit. Cancel anytime.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, maxWidth: 940, width: "100%" }}>
        {TIERS.map(t => (
          <div key={t.id} style={{
            position: "relative", background: t.highlight ? "linear-gradient(180deg,#141a24,#10141c)" : "#12151d",
            border: `1px solid ${t.highlight ? "#22c55e" : "#1c2333"}`, borderRadius: 16, padding: "26px 22px",
            boxShadow: t.highlight ? "0 12px 40px rgba(34,197,94,.12)" : "none",
          }}>
            {t.highlight && <div style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", background: "#22c55e", color: "#06090c", fontSize: 10.5, fontWeight: 800, padding: "4px 12px", borderRadius: 20 }}>MOST POPULAR</div>}
            <div style={{ fontSize: 15, fontWeight: 700 }}>{t.name}</div>
            <div style={{ fontSize: 12, color: "#8b99b8", marginTop: 3, minHeight: 32 }}>{t.tagline}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, margin: "16px 0" }}>
              <span style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-1px" }}>€{t.price}</span>
              <span style={{ fontSize: 13, color: "#5b6b8c" }}>/mo</span>
            </div>
            <button onClick={() => subscribe(t.priceId)} disabled={busy === t.priceId} style={{
              width: "100%", padding: "11px 0", borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: "pointer",
              border: t.highlight ? "none" : "1px solid #263147",
              background: t.highlight ? "#22c55e" : t.anchor ? "transparent" : "#1a2030",
              color: t.highlight ? "#06090c" : "#eef1f7",
            }}>{busy === t.priceId ? "…" : t.cta}</button>
            <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 9 }}>
              {t.features.slice(0, 5).map(f => (
                <div key={f} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <Check size={14} color={t.highlight ? "#22c55e" : "#5b6b8c"} strokeWidth={2.5} style={{ marginTop: 1, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "#c3cde0", lineHeight: 1.4 }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 26, fontSize: 12, color: "#5b6b8c" }}>
        Secure checkout by Stripe · <button onClick={logout} style={{ background: "none", border: "none", color: "#8b99b8", cursor: "pointer", textDecoration: "underline" }}>Sign out</button>
      </div>
    </div>
  )
}
