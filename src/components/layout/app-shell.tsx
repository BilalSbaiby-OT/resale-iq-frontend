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

// Pages a non-paying account may still reach: managing/paying for a plan.
const PAYWALL_EXEMPT = ["/account", "/billing"]

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

  // Hard paywall: no free tier. Any account without an active paid plan sees the
  // paywall instead of the app — except on the account/billing pages so they can
  // subscribe or manage their plan.
  const isPaid = user?.plan === "operator" || user?.plan === "power"
  const exempt = PAYWALL_EXEMPT.some(p => pathname.startsWith(p))
  if (!isPaid && !exempt) return <Paywall />

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#0B0D10" }}>
      <Sidebar className={`riq-sidebar${navOpen ? " open" : ""}`} />
      {/* Scrim behind the drawer on mobile */}
      <div className={`riq-scrim${navOpen ? " open" : ""}`} onClick={() => setNavOpen(false)} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <Topbar title={title} subtitle={subtitle} onMenu={() => setNavOpen(v => !v)} />
        <main className="riq-main" style={{ flex: 1, overflowY: "auto", padding: 20, background: "#0B0D10" }}>
          {children}
        </main>
      </div>
    </div>
  )
}
