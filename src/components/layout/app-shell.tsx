"use client"
import { useEffect, useRef, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Sidebar } from "./sidebar"
import { Topbar } from "./topbar"
import { Paywall } from "./paywall"
import { useAuthStore } from "@/lib/auth-store"
import { TRIAL_BANNER_BY_LOCALE } from "@/lib/trial-copy"
import { useLocale } from "@/components/i18n/locale-provider"
import { navCopy } from "@/lib/nav-copy"

interface AppShellProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
}

// Pages that require a PAID subscription. Everything not listed here is
// accessible to free-tier users — the backend enforces the real limits (10
// checks/day always, 7-day full trial, then 10 full unlocks/month), so the
// frontend no longer blanket-blocks
// the dashboard. The old approach showed the Paywall on every single route,
// which meant a free user could never actually use their entitlements.
const PAID_ONLY = ["/deals", "/order-planner", "/calculator", "/compare", "/market", "/search"]
// Compare is Pro paid only (require_pro_paid — trial does not pass).
const PRO_PAID_ONLY = ["/compare"]
// Order Planner is Pro or an active trial (require_order_planner_access).
const PRO_OR_TRIAL = ["/order-planner"]
// Admin / ops / traffic: owner email only. Paying Pro is not the owner.
const OWNER_ONLY_PREFIX = "/admin"

export function AppShell({ children, title = "Dashboard", subtitle }: AppShellProps) {
  const { isAuthenticated, isLoading, checkAuth, user } = useAuthStore()
  const locale = useLocale()
  const t = navCopy[locale].shell
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

  useEffect(() => {
    if (checked && isAuthenticated && user && user.email_verified === false) {
      router.replace("/check-email")
    }
  }, [checked, isAuthenticated, user, router])

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

  if (user && user.email_verified === false) {
    return null
  }

  const isPaid = user?.plan === "operator" || user?.plan === "power"
  const isPower = user?.plan === "power"
  const isTrial = user?.trial_active === true
  const needsPaid = PAID_ONLY.some(p => pathname.startsWith(p))
  const needsProPaid = PRO_PAID_ONLY.some(p => pathname.startsWith(p))
  const needsProOrTrial = PRO_OR_TRIAL.some(p => pathname.startsWith(p))
  if (!isPaid && !isTrial && needsPaid) return <Paywall />
  if (needsProPaid && !isPower) return <Paywall pro />
  if (needsProOrTrial && !isPower && !isTrial) return <Paywall pro />
  if (pathname.startsWith(OWNER_ONLY_PREFIX) && user?.is_owner !== true) {
    return (
      <div style={{ minHeight: "100vh", background: "#0B0D10", color: "#8b99b8", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#eef1f7", marginBottom: 8 }}>{t.ownerRequired}</div>
          <div style={{ fontSize: 13, maxWidth: 360, lineHeight: 1.5 }}>{t.ownerBody}</div>
          <a href="/dashboard" style={{ display: "inline-block", marginTop: 16, color: "#22c55e", fontSize: 13, fontWeight: 650, textDecoration: "none" }}>{t.backToDashboard}</a>
        </div>
      </div>
    )
  }


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
                <span style={{ fontWeight: 650 }}>{t.freeTrial}</span>
                <span style={{ color: "#8b99b8" }}> — {t.daysLeft(user?.trial_days_left ?? 0)} {TRIAL_BANNER_BY_LOCALE[locale]}</span>
              </div>
              <a href="/account" style={{ background: "#22c55e", color: "#06090c", borderRadius: 7, padding: "6px 14px", fontSize: 12, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>
                {t.upgradeNow}
              </a>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  )
}
