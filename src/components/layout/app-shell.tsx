"use client"
import { useEffect, useRef, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Sidebar } from "./sidebar"
import { Topbar } from "./topbar"
import { Paywall } from "./paywall"
import { useAuthStore } from "@/lib/auth-store"

interface AppShellProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
}

// Pages that require a PAID subscription. Everything not listed here is
// accessible to free-tier users — the backend enforces the real limits (3
// verdicts/day, 10 lifetime unlocks), so the frontend no longer blanket-blocks
// the dashboard. The old approach showed the Paywall on every single route,
// which meant a free user could never actually use their entitlements.
const PAID_ONLY = ["/deals", "/order-planner", "/calculator"]

export function AppShell({ children, title = "Dashboard", subtitle }: AppShellProps) {
  const { isAuthenticated, isLoading, checkAuth, user } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const [checked, setChecked] = useState(false)
  const [navOpen, setNavOpen] = useState(false)

  useEffect(() => {
    checkAuth().then(ok => {
      if (!ok) router.push("/login")
      setChecked(true)
    })
  }, [])

  // Re-fetch the user on every route change so an admin plan upgrade, Stripe
  // webhook, or billing-success redirect is picked up without a full reload.
  useEffect(() => {
    if (checked && isAuthenticated) checkAuth()
  }, [pathname])

  // Close the mobile drawer when the route ACTUALLY changes — not on the initial
  // mount / hydration settle, which would otherwise slam the drawer shut the
  // instant the user opens it.
  const lastPath = useRef(pathname)
  useEffect(() => {
    if (lastPath.current !== pathname) {
      lastPath.current = pathname
      setNavOpen(false)
    }
  }, [pathname])

  if (!checked || isLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#0B0D10" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: "5px", color: "#22c55e", marginBottom: 16, animation: "pulse-dot 2s ease-in-out infinite" }}>RESALE·IQ</div>
          <div style={{ width: 32, height: 32, border: "2px solid #263147", borderTopColor: "#22c55e", borderRadius: "50%", animation: "shimmer 0.8s linear infinite", margin: "0 auto" }} />
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  const isPaid = user?.plan === "operator" || user?.plan === "power"
  const isTrial = user?.trial_active === true
  const needsPaid = PAID_ONLY.some(p => pathname.startsWith(p))
  if (!isPaid && !isTrial && needsPaid) return <Paywall />

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#0B0D10" }}>
      <Sidebar className={`riq-sidebar${navOpen ? " open" : ""}`} />
      {/* Scrim behind the drawer on mobile */}
      <div className={`riq-scrim${navOpen ? " open" : ""}`} onClick={() => setNavOpen(false)} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <Topbar title={title} subtitle={subtitle} onMenu={() => setNavOpen(v => !v)} />
        <main className="riq-main" style={{ flex: 1, overflowY: "auto", padding: 20, background: "#0B0D10" }}>
          {isTrial && !isPaid && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, background: "linear-gradient(90deg,rgba(34,197,94,.08),rgba(14,165,233,.06))", border: "1px solid rgba(34,197,94,.2)", borderRadius: 10, padding: "10px 16px", marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: "#eef1f7", flex: 1 }}>
                <span style={{ fontWeight: 650 }}>Free trial</span>
                <span style={{ color: "#8b99b8" }}> — {user?.trial_days_left ?? 0} day{(user?.trial_days_left ?? 0) !== 1 ? "s" : ""} left of full access</span>
              </div>
              <a href="/account" style={{ background: "#22c55e", color: "#06090c", borderRadius: 7, padding: "6px 14px", fontSize: 12, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>
                Upgrade now
              </a>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  )
}
