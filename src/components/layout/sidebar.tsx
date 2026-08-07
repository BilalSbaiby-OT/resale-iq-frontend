"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, Flame, Calculator, Package, TrendingUp, Tags,
  ShieldCheck, Star, Briefcase, Zap, Settings, ShieldAlert, BarChart3,
  BookOpen, Wrench, Database, LifeBuoy,
} from "lucide-react"
import { getPlanFromToken } from "@/lib/utils"

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/deals", icon: Flame, label: "Deal Scanner" },
      { href: "/order-planner", icon: Package, label: "Order Planner" },
      { href: "/calculator", icon: Calculator, label: "Calculator" },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { href: "/trends", icon: TrendingUp, label: "Market Trends" },
      { href: "/brands", icon: Tags, label: "Brand Rankings" },
      { href: "/authenticity", icon: ShieldCheck, label: "Authenticity" },
    ],
  },
  {
    label: "Workspace",
    items: [
      { href: "/watchlist", icon: Star, label: "Watchlist" },
      { href: "/portfolio", icon: Briefcase, label: "Portfolio" },
      { href: "/verdict", icon: Zap, label: "Quick Verdict" },
    ],
  },
  {
    // Everything public lives outside the dashboard, so a logged-in customer had
    // no way to reach the guides, free tools, market data or support without
    // manually editing the URL. Paying users were the only people walled off
    // from the content meant to help them.
    label: "Resources",
    items: [
      { href: "/blog", icon: BookOpen, label: "Guides & Tips" },
      { href: "/tools", icon: Wrench, label: "Free Tools" },
      { href: "/data", icon: Database, label: "Market Data" },
      { href: "/support", icon: LifeBuoy, label: "Support" },
    ],
  },
  {
    label: "Account",
    items: [{ href: "/account", icon: Settings, label: "Settings" }],
  },
]

// Shown only to Power-plan (owner) accounts.
const ADMIN_ITEMS = [
  { href: "/admin", icon: ShieldAlert, label: "Admin" },
  { href: "/admin/traffic", icon: BarChart3, label: "Traffic" },
]

const PLAN_STYLE: Record<string, { color: string; bg: string; border: string }> = {
  free:     { color: "#60a5fa", bg: "rgba(59,130,246,.10)", border: "rgba(59,130,246,.25)" },
  operator: { color: "#34d399", bg: "rgba(52,211,153,.10)", border: "rgba(52,211,153,.25)" },
  power:    { color: "#fbbf24", bg: "rgba(251,191,36,.10)", border: "rgba(251,191,36,.25)" },
}

export function Sidebar({ className = "" }: { className?: string }) {
  const pathname = usePathname()
  const plan = (getPlanFromToken() || "free") as "free" | "operator" | "power"
  const ps = PLAN_STYLE[plan] ?? PLAN_STYLE.free

  // Power-plan owner accounts also get an Admin section.
  const sections = plan === "power"
    ? [...NAV_SECTIONS, { label: "Owner", items: ADMIN_ITEMS }]
    : NAV_SECTIONS

  return (
    <aside className={className} style={{ width: 216, flexShrink: 0, background: "#0D0F13", borderRight: "1px solid #1c2333", display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      {/* Wordmark */}
      <div style={{ padding: "18px 16px", borderBottom: "1px solid #1c2333", display: "flex", alignItems: "center", gap: 9 }}>
        <div style={{ width: 26, height: 26, borderRadius: 7, background: "linear-gradient(135deg,#22c55e,#0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, color: "#06090c" }}>R</div>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 700, letterSpacing: "0.2px", color: "#eef1f7", lineHeight: 1.1 }}>Resale IQ</div>
          <div style={{ fontSize: 9.5, color: "#4d5a75", letterSpacing: "0.5px" }}>Market intelligence</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "10px 8px" }}>
        {sections.map(({ label, items }) => (
          <div key={label} style={{ marginBottom: 14 }}>
            <div style={{ padding: "4px 10px 6px", fontSize: 9.5, fontWeight: 600, color: "#4d5a75", letterSpacing: "1.2px", textTransform: "uppercase" }}>{label}</div>
            {items.map(({ href, icon: Icon, label: itemLabel }) => {
              const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href))
              return (
                <Link key={href} href={href} style={{
                  position: "relative", display: "flex", alignItems: "center", gap: 10,
                  padding: "7.5px 10px", marginBottom: 1, borderRadius: 7,
                  textDecoration: "none", fontSize: 13, fontWeight: active ? 600 : 450,
                  color: active ? "#eef1f7" : "#8b99b8",
                  background: active ? "rgba(255,255,255,.05)" : "transparent",
                  transition: "background .12s,color .12s",
                }}>
                  {active && <span style={{ position: "absolute", left: -8, top: 8, bottom: 8, width: 2.5, borderRadius: 2, background: "#22c55e" }} />}
                  <Icon size={15.5} strokeWidth={active ? 2.1 : 1.8} color={active ? "#22c55e" : "#5b6b8c"} />
                  {itemLabel}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Plan */}
      <div style={{ borderTop: "1px solid #1c2333", padding: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 11px", borderRadius: 8, background: "#12151d", border: "1px solid #1c2333" }}>
          <span style={{ fontSize: 11.5, color: "#8b99b8", fontWeight: 500 }}>Current plan</span>
          <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.8px", padding: "2.5px 8px", borderRadius: 5, color: ps.color, background: ps.bg, border: `1px solid ${ps.border}` }}>
            {plan.toUpperCase()}
          </span>
        </div>
        {plan === "free" && (
          <Link href="/register?plan=operator" style={{ display: "block", textAlign: "center", marginTop: 8, padding: "8px 0", background: "#22c55e", color: "#06090c", borderRadius: 7, textDecoration: "none", fontSize: 12, fontWeight: 700 }}>
            Upgrade
          </Link>
        )}
      </div>
    </aside>
  )
}
