"use client"
import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getToken } from "@/lib/utils"
import { CheckCircle2, Clock, AlertTriangle, Loader2 } from "lucide-react"

/**
 * Post-checkout landing. Verifies the Stripe session server-side and applies
 * the plan upgrade immediately — no dependency on webhook delivery. This is
 * what guarantees a paying customer actually receives their plan.
 */
function BillingSuccessContent() {
  const params = useSearchParams()
  const router = useRouter()
  const [state, setState] = useState<"verifying" | "ok" | "unpaid" | "error">("verifying")
  const [plan, setPlan] = useState("")

  useEffect(() => {
    const sessionId = params.get("session_id")
    if (!sessionId) { setState("error"); return }
    ;(async () => {
      try {
        const res = await fetch(`/stripe/verify-session?session_id=${encodeURIComponent(sessionId)}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        })
        const d = await res.json()
        if (res.ok && d.paid) {
          setPlan(d.plan); setState("ok")
          setTimeout(() => { window.location.href = "/dashboard" }, 2500)
        } else if (res.ok) {
          setState("unpaid")
        } else { setState("error") }
      } catch { setState("error") }
    })()
  }, [params])

  const box: React.CSSProperties = { maxWidth: 420, margin: "120px auto", background: "#12151d", border: "1px solid #1c2333", borderRadius: 14, padding: 36, textAlign: "center" }

  return (
    <div style={{ minHeight: "100vh", background: "#0B0D10", color: "#eef1f7" }}>
      <div style={box}>
        {state === "verifying" && (<>
          <div style={{ marginBottom: 12, display: "flex", justifyContent: "center" }}><Loader2 size={32} className="animate-spin" style={{ color: "#8b99b8" }} /></div>
          <div style={{ fontSize: 17, fontWeight: 700 }}>Confirming your payment…</div>
          <div style={{ fontSize: 12.5, color: "#8b99b8", marginTop: 6 }}>Verifying with Stripe — a few seconds.</div>
        </>)}
        {state === "ok" && (<>
          <div style={{ marginBottom: 12, display: "flex", justifyContent: "center" }}><CheckCircle2 size={34} style={{ color: "#22c55e" }} /></div>
          <div style={{ fontSize: 18, fontWeight: 750 }}>Welcome to {plan.charAt(0).toUpperCase() + plan.slice(1)}</div>
          <div style={{ fontSize: 12.5, color: "#8b99b8", marginTop: 6 }}>Your account is upgraded. Taking you to your dashboard…</div>
        </>)}
        {state === "unpaid" && (<>
          <div style={{ marginBottom: 12, display: "flex", justifyContent: "center" }}><Clock size={34} style={{ color: "#f59e0b" }} /></div>
          <div style={{ fontSize: 17, fontWeight: 700 }}>Payment not confirmed yet</div>
          <div style={{ fontSize: 12.5, color: "#8b99b8", marginTop: 6 }}>If you completed payment, refresh this page in a moment.</div>
          <button onClick={() => window.location.reload()} style={{ marginTop: 16, padding: "9px 20px", borderRadius: 8, background: "#22c55e", color: "#06090c", border: "none", fontWeight: 700, cursor: "pointer" }}>Refresh</button>
        </>)}
        {state === "error" && (<>
          <div style={{ marginBottom: 12, display: "flex", justifyContent: "center" }}><AlertTriangle size={34} style={{ color: "#f59e0b" }} /></div>
          <div style={{ fontSize: 17, fontWeight: 700 }}>Couldn't verify the session</div>
          <div style={{ fontSize: 12.5, color: "#8b99b8", marginTop: 6 }}>Your payment is safe. Contact support or retry from your account page.</div>
          <button onClick={() => router.push("/account")} style={{ marginTop: 16, padding: "9px 20px", borderRadius: 8, background: "#1a2030", color: "#eef1f7", border: "1px solid #263147", fontWeight: 600, cursor: "pointer" }}>Go to account</button>
        </>)}
      </div>
    </div>
  )
}

export default function BillingSuccessPage() {
  return <Suspense><BillingSuccessContent /></Suspense>
}
