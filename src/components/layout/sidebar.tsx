"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Search, Flame, Settings, ShieldAlert, BarChart3, Activity, Lock,
} from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"
import { planDisplayName } from "@/lib/pricing"
import { useLocale } from "@/components/i18n/locale-provider"
import { LocaleSwitcher } from "@/components/i18n/locale-switcher"
import { navCopy, type NavCopy } from "@/lib/nav-copy"

// /search is paid (require_paid_plan) — lock it for expired-free like Deal Scanner.
const PAID_ROUTES = new Set(["/deals", "/order-planner", "/calculator", "/compare", "/market", "/search"])
const PRO_ROUTES = new Set(["/order-planner", "/compare"])

function primaryNav(t: NavCopy) {
  return [
    { href: "/verdict", icon: Search, label: t.items.check },
    { href: "/deals", icon: Flame, label: t.items.finds },
    { href: "/account", icon: Settings, label: t.topbar.account },
  ]
}

function adminItems(t: NavCopy) {
  return [
    { href: "/admin", icon: ShieldAlert, label: t.items.adminCustomers },
    { href: "/admin/ops", icon: Activity, label: t.items.adminOps },
    { href: "/admin/traffic", icon: BarChart3, label: t.items.adminTraffic },
  ]
}

const ACCOUNT_PREFIXES = [
  "/account", "/billing", "/watchlist", "/portfolio", "/dashboard", "/trends",
  "/brands", "/search", "/compare", "/market", "/calculator", "/order-planner",
  "/authenticity", "/manual", "/blog", "/tools", "/data", "/support",
]

export function Sidebar({ className = "" }: { className?: string }) {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const locale = useLocale()
  const t = navCopy[locale]
  const plan = (user?.plan || "free") as "free" | "operator" | "power"

  const items = primaryNav(t)

  return (
    <aside className={className} style={{ width: 188, flexShrink: 0, background: "#0D0F13", borderRight: "1px solid #1c2333", display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <div style={{ padding: "22px 18px 18px" }}>
        <Link href="/verdict" style={{ textDecoration: "none", color: "#eef1f7", fontSize: 15, fontWeight: 650, letterSpacing: "-0.3px" }}>
          Resale IQ
        </Link>
      </div>

      <nav style={{ flex: 1, overflowY: "auto", padding: "6px 10px" }}>
        {items.map(({ href, icon: Icon, label: itemLabel }) => {
          const active = href === "/verdict"
            ? pathname === "/verdict" || pathname.startsWith("/verdict/")
            : href === "/deals"
              ? pathname === "/deals" || pathname.startsWith("/deals/")
              : ACCOUNT_PREFIXES.some(p => pathname === p || pathname.startsWith(p + "/"))
          const locked = (plan === "free" && !user?.trial_active && PAID_ROUTES.has(href))
            || (plan === "operator" && PRO_ROUTES.has(href))
            || (plan === "free" && user?.trial_active && href === "/compare")
          return (
            <Link key={href} href={href} style={{
              position: "relative", display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", marginBottom: 2, borderRadius: 10,
              textDecoration: "none", fontSize: 14, fontWeight: active ? 600 : 450,
              color: active ? "#eef1f7" : locked ? "#4d5a75" : "#8b99b8",
              background: active ? "rgba(255,255,255,.05)" : "transparent",
              transition: "background .12s,color .12s",
            }}>
              {active && <span style={{ position: "absolute", left: -10, top: 10, bottom: 10, width: 2.5, borderRadius: 2, background: "#22c55e" }} />}
              <Icon size={16} strokeWidth={active ? 2.1 : 1.8} color={active ? "#22c55e" : locked ? "#3d4a62" : "#5b6b8c"} />
              {itemLabel}
              {locked && <Lock size={10} style={{ marginLeft: "auto", color: "#3d4a62" }} />}
            </Link>
          )
        })}
        {user?.is_owner && (
          <div style={{ marginTop: 22 }}>
            <div style={{ padding: "4px 12px 8px", fontSize: 10, fontWeight: 600, color: "#4d5a75", letterSpacing: "1.2px", textTransform: "uppercase" }}>{t.sections.owner}</div>
            {adminItems(t).map(({ href, icon: Icon, label: itemLabel }) => {
              const active = href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(href + "/")
              return (
                <Link key={href} href={href} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 12px", marginBottom: 1, borderRadius: 10,
                  textDecoration: "none", fontSize: 13, fontWeight: active ? 600 : 450,
                  color: active ? "#eef1f7" : "#8b99b8",
                  background: active ? "rgba(255,255,255,.05)" : "transparent",
                }}>
                  <Icon size={15} strokeWidth={active ? 2.1 : 1.8} color={active ? "#22c55e" : "#5b6b8c"} />
                  {itemLabel}
                </Link>
              )
            })}
          </div>
        )}
      </nav>

      <div style={{ borderTop: "1px solid #1c2333", padding: 14 }}>
        <Link href="/account" style={{ display: "block", fontSize: 12, color: "#8b99b8", textDecoration: "none", padding: "4px 4px 10px" }}>
          {planDisplayName(plan)}
        </Link>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <LocaleSwitcher locale={locale} style={{ fontSize: 11.5, padding: "5px 8px", width: "100%", justifyContent: "center" }} />
        </div>
      </div>
    </aside>
  )
}
