"use client"
import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { setToken, getToken } from "@/lib/utils"
import { verifyCheckoutSession, getMe } from "@/lib/api"
import { useAuthStore } from "@/lib/auth-store"
import { FIRST_CHECK_HREF, FIRST_CHECK_QUERY } from "@/lib/checkout"
import { CheckCircle2, Clock, AlertTriangle, Loader2, ArrowRight, Tag, BarChart2, TrendingUp } from "lucide-react"

/**
 * Post-checkout landing. Stripe often returns in a different webview with empty
 * localStorage. session_id is enough: the API upgrades the bound account and
 * may return a login token so this page can sign them in.
 *
 * H-AFTER-PAYMENT (Revenue 2026-09-19): a paid user who lands here and is
 * auto-redirected to /dashboard has no idea what to do next. The dashboard
 * for a brand-new account is an empty state. Do not auto-eject. The only
 * primary action is a pre-filled first check.
 */

function BillingSuccessContent() {
  const params = useSearchParams()
  const router = useRouter()
  const [state, setState] = useState<"verifying" | "ok" | "unpaid" | "error">("verifying")
  const [plan, setPlan] = useState("")
  const [guestNeedsPassword, setGuestNeedsPassword] = useState(false)
  const [firstCheckHref, setFirstCheckHref] = useState(FIRST_CHECK_HREF)
  const [firstCheckLabel, setFirstCheckLabel] = useState<string | null>(null)

  useEffect(() => {
    const sessionId = params.get("session_id")
    if (!sessionId) { setState("error"); return }
    // A guest is someone who reached this page with no stored token — they paid
    // without registering. Captured BEFORE verify-session mints one.
    const wasGuest = !getToken()
    ;(async () => {
      try {
        const d = await verifyCheckoutSession(sessionId)
        if (d.paid) {
          if (d.access_token) {
            setToken(d.access_token)
            try {
              const user = await getMe(d.access_token)
              useAuthStore.setState({ user, isAuthenticated: true, isLoading: false })
            } catch {
              useAuthStore.setState({ isAuthenticated: true, isLoading: false })
            }
          }
          setPlan(d.plan)
          setGuestNeedsPassword(Boolean(wasGuest && d.access_token))
          setState("ok")
          try {
            const saved = localStorage.getItem("riq_intent_query")
            if (saved) {
              setFirstCheckHref("/verdict?q=" + encodeURIComponent(saved))
              setFirstCheckLabel(saved)
              localStorage.removeItem("riq_intent_query")
            }
          } catch { /* private mode fallback */ }
        } else {
          setState("unpaid")
        }
      } catch { setState("error") }
    })()
  }, [params])

  const box: React.CSSProperties = { maxWidth: 420, margin: "120px auto", background: "var(--color-surface)", border: "1px solid var(--color-border-ui)", borderRadius: 14, padding: 36, textAlign: "center" }

  return (
    <div style={{ minHeight: "100vh", background: "#0B0D10", color: "#eef1f7" }}>
      <div style={box}>
        {state === "verifying" && (<>
          <div style={{ marginBottom: 12, display: "flex", justifyContent: "center" }}><Loader2 size={32} className="animate-spin" style={{ color: "#8b99b8" }} /></div>
          <div style={{ fontSize: 17, fontWeight: 700 }}>Confirming your payment…</div>
          <div style={{ fontSize: 12.5, color: "#8b99b8", marginTop: 6 }}>Verifying with Stripe — a few seconds.</div>
        </>)}
        {state === "ok" && (<>
          <div style={{ marginBottom: 12, display: "flex", justifyContent: "center" }}><CheckCircle2 size={34} style={{ color: "#34C759" }} /></div>
          <div style={{ fontSize: 18, fontWeight: 750 }}>You&apos;re in — {plan === "operator" ? "Starter" : plan === "power" ? "Pro" : plan}</div>
          <div style={{ fontSize: 12.5, color: "#8b99b8", marginTop: 6 }}>Here&apos;s what&apos;s unlocked:</div>

          {/* Linear pattern: show 3 specific things they unlocked — removes blank-state anxiety.
              Vercel rule: cap at one primary CTA. Secondary items are ghost links.
              C150(tony): replaces "Your account is upgraded." (abstract) with concrete proof. */}
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8, textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, background: "rgba(52,199,89,.08)", border: "1px solid rgba(52,199,89,.2)", borderRadius: 10, padding: "10px 14px" }}>
              <Tag size={15} style={{ color: "#34C759", marginTop: 1, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "#eef1f7" }}>Buy-below price on any item</div>
                <div style={{ fontSize: 12, color: "#8b99b8", marginTop: 2 }}>The max you should pay to profit — for every brand and model we track.</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, background: "rgba(52,199,89,.08)", border: "1px solid rgba(52,199,89,.2)", borderRadius: 10, padding: "10px 14px" }}>
              <BarChart2 size={15} style={{ color: "#34C759", marginTop: 1, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "#eef1f7" }}>Deal scanner with sell-through rate</div>
                <div style={{ fontSize: 12, color: "#8b99b8", marginTop: 2 }}>Ranked buy opportunities across EU Vinted — filtered by demand, updated daily.</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, background: "rgba(52,199,89,.08)", border: "1px solid rgba(52,199,89,.2)", borderRadius: 10, padding: "10px 14px" }}>
              <TrendingUp size={15} style={{ color: "#34C759", marginTop: 1, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "#eef1f7" }}>Brand and model trend signals</div>
                <div style={{ fontSize: 12, color: "#8b99b8", marginTop: 2 }}>See what&apos;s moving before you buy — rising, hot, or cooling across 135 brands.</div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
            {/* ONE primary CTA (Vercel rule). Pre-seeds their intent or Nike AF1 sample. */}
            <a
              href={firstCheckHref}
              data-testid="riq-billing-first-check"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 10, background: "#34C759", color: "#06090c", textDecoration: "none", fontWeight: 700, fontSize: 14, width: "100%", justifyContent: "center" }}
            >
              {firstCheckLabel ? `Check ${firstCheckLabel} now` : "Run your first check"}
              <ArrowRight size={16} />
            </a>
            <div style={{ fontSize: 12, color: "#8b99b8", maxWidth: 280, lineHeight: 1.5, textAlign: "center" }}>
              {firstCheckLabel ? `Get the buy-below price for ${firstCheckLabel}.` : `We pre-filled ${FIRST_CHECK_QUERY} so you see a real buy-below number immediately.`}
            </div>
            {guestNeedsPassword && (
              <a
                href="/account?welcome=1"
                data-testid="riq-billing-set-password"
                style={{ fontSize: 12.5, color: "#8fa3c4", textDecoration: "none" }}
              >
                Set a password so you can sign back in →
              </a>
            )}
            <a
              href="/dashboard?welcome=1"
              data-testid="riq-billing-dashboard"
              style={{ fontSize: 12.5, color: "#8fa3c4", textDecoration: "none" }}
            >
              Go to dashboard →
            </a>
          </div>
        </>)}
        {state === "unpaid" && (<>
          <div style={{ marginBottom: 12, display: "flex", justifyContent: "center" }}><Clock size={34} style={{ color: "#FF9F0A" }} /></div>
          <div style={{ fontSize: 17, fontWeight: 700 }}>Payment not confirmed yet</div>
          <div style={{ fontSize: 12.5, color: "#8b99b8", marginTop: 6 }}>If you completed payment, refresh this page in a moment.</div>
          <button onClick={() => window.location.reload()} style={{ marginTop: 16, padding: "9px 20px", borderRadius: 8, background: "#34C759", color: "#06090c", border: "none", fontWeight: 700, cursor: "pointer" }}>Refresh</button>
        </>)}
        {state === "error" && (<>
          <div style={{ marginBottom: 12, display: "flex", justifyContent: "center" }}><AlertTriangle size={34} style={{ color: "#FF9F0A" }} /></div>
          <div style={{ fontSize: 17, fontWeight: 700 }}>Couldn&apos;t verify the session</div>
          <div style={{ fontSize: 12.5, color: "#8b99b8", marginTop: 6 }}>Your payment is safe. Contact support or retry from your account page.</div>
          <button onClick={() => router.push("/account")} style={{ marginTop: 16, padding: "9px 20px", borderRadius: 8, background: "var(--color-surface-elevated)", color: "#eef1f7", border: "1px solid var(--color-border-2)", fontWeight: 600, cursor: "pointer" }}>Go to account</button>
        </>)}
      </div>
    </div>
  )
}

export default function BillingSuccessPage() {
  return <Suspense><BillingSuccessContent /></Suspense>
}
