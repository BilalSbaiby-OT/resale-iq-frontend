"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Lock, Check, Unlock } from "lucide-react"
import { TIERS, resolvePriceId } from "@/lib/pricing"
import { getPlans, createCheckout, getMe } from "@/lib/api"
import { useAuthStore } from "@/lib/auth-store"

// Shown to any authenticated account without an active PAID plan.
//
// It is no longer a hard wall. A free account has real entitlements — 10
// lifetime unlocks on the verdict tool — so leading with "choose a plan"
// and nothing else told someone who had just deliberately chosen Free that
// their account was worthless. They signed up and immediately hit a sales
// page. What they actually have now comes first; the plans stay underneath.
export function Paywall() {
  const router = useRouter()
  const { logout } = useAuthStore()
  const [plans, setPlans] = useState<{ id: string; price_id?: string }[]>([])
  const [busy, setBusy] = useState<string | null>(null)
  const [verified, setVerified] = useState<boolean | null>(null)

  useEffect(() => { getPlans().then(d => setPlans(d.plans)).catch(() => {}) }, [])
  useEffect(() => { getMe().then(u => setVerified(u.email_verified !== false)).catch(() => {}) }, [])

  const subscribe = async (placeholder?: string) => {
    if (!placeholder) { window.location.href = "mailto:parapluis@outlook.com?subject=Resale%20IQ%20Business%20plan%20enquiry"; return }
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

      {/* What a free account actually has. Shown FIRST — the previous screen
          opened with a paywall badge, so someone who had just chosen Free was
          told to pay before being told what they already own. */}
      <div style={{ width: "100%", maxWidth: 560, marginBottom: 26, background: "#0f1720", border: "1px solid #1c3327", borderRadius: 14, padding: "20px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <Unlock size={15} style={{ color: "#22c55e" }} />
          <span style={{ fontSize: 15.5, fontWeight: 700, color: "#eef1f7" }}>Your free account is active</span>
        </div>
        <p style={{ fontSize: 13.5, color: "#8b99b8", lineHeight: 1.65, marginBottom: 14 }}>
          You get unlimited BUY / WATCH / SKIP verdicts, plus{" "}
          <strong style={{ color: "#eef1f7" }}>10 full unlocks</strong> — buy-below price, typical
          sale price, sell-through and best sizes. They do not expire.
        </p>
        {verified === false && (
          <div style={{ background: "rgba(251,191,36,.07)", border: "1px solid rgba(251,191,36,.3)", borderRadius: 9, padding: "11px 13px", marginBottom: 14 }}>
            <div style={{ fontSize: 12.5, color: "#fbbf24", fontWeight: 700, marginBottom: 3 }}>One step first</div>
            <div style={{ fontSize: 12.5, color: "#a9b6d0", lineHeight: 1.55 }}>
              Confirm your email to switch the unlocks on — we sent a link when you signed up.{" "}
              <Link href="/account" style={{ color: "#22c55e", textDecoration: "none" }}>Resend it</Link>.
            </div>
          </div>
        )}
        <Link href="/verdict" style={{ display: "inline-block", background: "#22c55e", color: "#06090c", fontWeight: 700, fontSize: 13.5, padding: "10px 20px", borderRadius: 9, textDecoration: "none" }}>
          Check your first item →
        </Link>
      </div>

      <div style={{ textAlign: "center", maxWidth: 560, marginBottom: 34 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(34,197,94,.1)", border: "1px solid rgba(34,197,94,.3)", borderRadius: 20, padding: "5px 14px", fontSize: 12, color: "#22c55e", marginBottom: 18 }}>
          <Lock size={13} /> Upgrade for the full dashboard
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.6px" }}>The data that pays for itself on your first flip.</h1>
        <p style={{ fontSize: 15, color: "#8b99b8", marginTop: 10 }}>500,000+ listings, live deal finder, 3-week Order Planner, and buy/sell verdicts — the full toolkit. Cancel anytime.</p>
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
