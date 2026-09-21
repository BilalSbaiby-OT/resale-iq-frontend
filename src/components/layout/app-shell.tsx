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
import { planChip } from "@/lib/entitlement"
import { GuestCheckoutButton } from "@/components/ui/guest-checkout-button"

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
// Pages that show seed/demo content to cold visitors (including unauthenticated).
// AppShell must NOT redirect these users to /login — the seed verdict is the
// product for a brand-new account, and showing a login wall after paying
// destroys conversion momentum (CRO #12). Auth check runs in background.
const AUTH_SANDBOX = ["/verdict"]

export function AppShell({ children, title = "Dashboard", subtitle, skipAuth = false }: AppShellProps & { skipAuth?: boolean }) {
  const { isAuthenticated, isLoading, checkAuth, user } = useAuthStore()
  const locale = useLocale()
  const t = navCopy[locale].shell
  const router = useRouter()
  const pathname = usePathname()
  const [checked, setChecked] = useState(false)
  const [navOpen, setNavOpen] = useState(false)

  // Determine if this route is an auth sandbox — seed content must be
  // visible to cold visitors even when unauthenticated.
  const isSandbox = skipAuth || AUTH_SANDBOX.some(p => pathname.startsWith(p))

  useEffect(() => {
    // In the auth sandbox, run checkAuth in the background but NEVER
    // redirect. Unauthenticated users see the seed verdict card and are
    // prompted to log in below it, not replaced by a login form.
    if (isSandbox) {
      checkAuth().then(ok => {
        setChecked(true)
        // Still track auth state so gated content renders correctly,
        // but do NOT router.push("/login").
      })
      return
    }
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "var(--color-graphite)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600, letterSpacing: "5px", color: "var(--color-graphite-muted)", marginBottom: 16, animation: "pulse-dot 2s ease-in-out infinite" }}>RESALE·IQ</div>
          <div style={{ width: 32, height: 32, border: "2px solid var(--color-hairline)", borderTopColor: "var(--color-accent)", borderRadius: "50%", animation: "shimmer 0.8s linear infinite", margin: "0 auto" }} />
        </div>
      </div>
    )
  }

  // In the auth sandbox, render children immediately even when
  // unauthenticated — the seed verdict card IS the product for a
  // brand-new account. Show a login prompt below content instead of
  // replacing the page with a login form.
  if (!isAuthenticated && !isSandbox) return null

  if (!isAuthenticated && isSandbox && !checked) {
    // Still loading auth in background — render children with a
    // minimal loading state so the seed card shows immediately.
  }

  if (user && user.email_verified === false) {
    return null
  }

  const isPaid = user?.plan === "operator" || user?.plan === "power"
  const isPower = user?.plan === "power"
  const isTrial = user?.trial_active === true
  const needsPaid = PAID_ONLY.some(p => pathname.startsWith(p))
  const needsProPaid = PRO_PAID_ONLY.some(p => pathname.startsWith(p))
  const needsProOrTrial = PRO_OR_TRIAL.some(p => pathname.startsWith(p))
  // Entitlement gates render INSIDE the shell below (same Sidebar/Topbar every
  // other workspace page gets) rather than as a standalone full-page swap —
  // a standalone return here is how a route loses its nav entirely
  // (see memory/APPLE-V1-MISS.md; reproduced live on /compare, E-9).
  let gated: React.ReactNode = null
  if (!isPaid && !isTrial && needsPaid) gated = <Paywall />
  else if (needsProPaid && !isPower) gated = <Paywall pro />
  else if (needsProOrTrial && !isPower && !isTrial) gated = <Paywall pro />
  if (pathname.startsWith(OWNER_ONLY_PREFIX) && user?.is_owner !== true) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--color-graphite)", color: "var(--color-graphite-muted)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 600, color: "var(--color-on-graphite)", marginBottom: 8 }}>{t.ownerRequired}</div>
          <div style={{ fontSize: 15, maxWidth: "65ch", lineHeight: 1.5 }}>{t.ownerBody}</div>
          <a href="/dashboard" style={{ display: "inline-block", marginTop: 24, color: "var(--color-on-graphite)", fontSize: 15, fontWeight: 500, textDecoration: "none" }}>{t.backToDashboard}</a>
        </div>
      </div>
    )
  }


  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--color-graphite)" }}>
      <Sidebar className={`riq-sidebar${navOpen ? " open" : ""}`} />
      {/* Scrim behind the drawer on mobile */}
      <div className={`riq-scrim${navOpen ? " open" : ""}`} onClick={() => setNavOpen(false)} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <Topbar title={title} subtitle={subtitle} onMenu={() => setNavOpen(v => !v)} />
        <main className="riq-main" style={{ flex: 1, overflowY: "auto", padding: "24px var(--space-gutter)", background: "var(--color-graphite)" }}>
          {!gated && isTrial && !isPaid && (
            <div style={{ display: "flex", alignItems: "center", gap: 16, background: "var(--color-graphite-elevated)", borderRadius: 14, padding: "14px 20px", marginBottom: 24 }}>
              <div style={{ fontSize: 15, color: "var(--color-on-graphite)", flex: 1 }}>
                {/* Third surface naming this same state, so it reads the same
                    module as the sidebar chip and the account card. */}
                <span style={{ fontWeight: 600 }}>{planChip(user, locale)}</span>
                <span style={{ color: "var(--color-graphite-muted)" }}> — {t.daysLeft(user?.trial_days_left ?? 0)} {TRIAL_BANNER_BY_LOCALE[locale]}</span>
              </div>
              <a href="/account" style={{ background: "var(--color-accent)", color: "var(--color-on-accent)", borderRadius: 12, padding: "10px 16px", fontSize: 15, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>
                {t.upgradeNow}
              </a>
            </div>
          )}
          {gated ?? children}
          {/* Auth sandbox login prompt — shows when user is
              unauthenticated on /verdict. The seed verdict card is
              visible above this; the login prompt appears below it
              so the user can register and keep their result. */}
          {isSandbox && !isAuthenticated && !user && checked && (
            <div style={{
              background: "var(--color-graphite-elevated)",
              borderRadius: 14, padding: "14px 20px", marginTop: 24,
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 16, flexWrap: "wrap"
            }}>
              <span style={{ fontSize: 14, color: "var(--color-graphite-muted)" }}>
                Log in to save your verdicts and track your budget
              </span>
              <a href="/login" style={{
                background: "var(--color-accent)", color: "var(--color-on-accent)",
                borderRadius: 12, padding: "10px 16px", fontSize: 14,
                fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap"
              }}>
                Log in →
              </a>
              <GuestCheckoutButton locale={locale} label="Start for €19" src="verdict-seed" />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
