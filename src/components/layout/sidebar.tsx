"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, Flame, Calculator, Package, TrendingUp, Tags,
  ShieldCheck, Star, Briefcase, Zap, Settings, ShieldAlert, BarChart3,
  BookOpen, Wrench, Database, LifeBuoy, GraduationCap, Activity, Lock,
  Search, Globe, Radar,
} from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"
import { planDisplayName } from "@/lib/pricing"
import { useLocale } from "@/components/i18n/locale-provider"
import { LocaleSwitcher } from "@/components/i18n/locale-switcher"
import { navCopy, type NavCopy } from "@/lib/nav-copy"

// /search is paid (require_paid_plan) — lock it for expired-free like Deal Scanner.
const PAID_ROUTES = new Set(["/deals", "/order-planner", "/calculator", "/compare", "/market", "/search"])
const PRO_ROUTES = new Set(["/order-planner", "/compare"])

/**
 * Every label here used to be an English string literal, on the one component
 * that renders on EVERY authenticated page — which is why the founder's report
 * was "you choose french in main page and other features etc from side pannel
 * or anyshit dont work": the funnel was translated and then handed the
 * customer an English app.
 *
 * Labels are now resolved per render from `navCopy[locale]` (src/lib/nav-copy.ts,
 * all six locales) rather than baked into this module-level array, so adding a
 * language cannot leave a half-translated sidebar behind.
 */
function navSections(t: NavCopy) {
  return [
    {
      label: t.sections.overview,
      items: [
        { href: "/dashboard", icon: LayoutDashboard, label: t.items.dashboard },
        { href: "/deals", icon: Flame, label: t.items.deals },
        { href: "/order-planner", icon: Package, label: t.items.orderPlanner },
        { href: "/calculator", icon: Calculator, label: t.items.calculator },
      ],
    },
    {
      label: t.sections.intelligence,
      items: [
        { href: "/market", icon: Radar, label: t.items.market },
        { href: "/trends", icon: TrendingUp, label: t.items.trends },
        { href: "/brands", icon: Tags, label: t.items.brands },
        { href: "/search", icon: Search, label: t.items.search },
        { href: "/compare", icon: Globe, label: t.items.compare },
      ],
    },
    {
      label: t.sections.workspace,
      items: [
        { href: "/watchlist", icon: Star, label: t.items.watchlist },
        { href: "/portfolio", icon: Briefcase, label: t.items.portfolio },
        { href: "/verdict", icon: Zap, label: t.items.verdict },
      ],
    },
    {
      // Everything public lives outside the dashboard, so a logged-in customer had
      // no way to reach the guides, free tools, market data or support without
      // manually editing the URL. Paying users were the only people walled off
      // from the content meant to help them.
      label: t.sections.resources,
      items: [
        { href: "/manual", icon: GraduationCap, label: t.items.manual },
        { href: "/blog", icon: BookOpen, label: t.items.blog },
        { href: "/tools", icon: Wrench, label: t.items.tools },
        { href: "/data", icon: Database, label: t.items.data },
        { href: "/support", icon: LifeBuoy, label: t.items.support },
      ],
    },
    {
      label: t.sections.account,
      items: [
        { href: "/account", icon: Settings, label: t.items.settings },
        { href: "/authenticity", icon: ShieldCheck, label: t.items.authenticity },
      ],
    },
  ]
}

// Shown only when /auth/me says is_owner. Pro (plan=power) is not owner.
function adminItems(t: NavCopy) {
  return [
    { href: "/admin", icon: ShieldAlert, label: t.items.adminCustomers },
    { href: "/admin/ops", icon: Activity, label: t.items.adminOps },
    { href: "/admin/traffic", icon: BarChart3, label: t.items.adminTraffic },
  ]
}

const PLAN_STYLE: Record<string, { color: string; bg: string; border: string }> = {
  free:     { color: "#60a5fa", bg: "rgba(59,130,246,.10)", border: "rgba(59,130,246,.25)" },
  operator: { color: "#34d399", bg: "rgba(52,211,153,.10)", border: "rgba(52,211,153,.25)" },
  power:    { color: "#fbbf24", bg: "rgba(251,191,36,.10)", border: "rgba(251,191,36,.25)" },
}

export function Sidebar({ className = "" }: { className?: string }) {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const locale = useLocale()
  const t = navCopy[locale]
  const plan = (user?.plan || "free") as "free" | "operator" | "power"
  const ps = PLAN_STYLE[plan] ?? PLAN_STYLE.free

  const sections = user?.is_owner
    ? [...navSections(t), { label: t.sections.owner, items: adminItems(t) }]
    : navSections(t)

  return (
    <aside className={className} style={{ width: 216, flexShrink: 0, background: "#0D0F13", borderRight: "1px solid #1c2333", display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      {/* Wordmark */}
      <div style={{ padding: "18px 16px", borderBottom: "1px solid #1c2333", display: "flex", alignItems: "center", gap: 9 }}>
        <div style={{ width: 26, height: 26, borderRadius: 7, background: "linear-gradient(135deg,#22c55e,#0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, color: "#06090c" }}>R</div>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 700, letterSpacing: "0.2px", color: "#eef1f7", lineHeight: 1.1 }}>Resale IQ</div>
          <div style={{ fontSize: 9.5, color: "#4d5a75", letterSpacing: "0.5px" }}>{t.sidebar.tagline}</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "10px 8px" }}>
        {sections.map(({ label, items }) => (
          <div key={label} style={{ marginBottom: 14 }}>
            <div style={{ padding: "4px 10px 6px", fontSize: 9.5, fontWeight: 600, color: "#4d5a75", letterSpacing: "1.2px", textTransform: "uppercase" }}>{label}</div>
            {items.map(({ href, icon: Icon, label: itemLabel }) => {
              const active = href === "/admin"
                ? pathname === "/admin"
                : pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"))
              const locked = (plan === "free" && !user?.trial_active && PAID_ROUTES.has(href))
                || (plan === "operator" && PRO_ROUTES.has(href))
                || (plan === "free" && user?.trial_active && href === "/compare")
              return (
                <Link key={href} href={href} style={{
                  position: "relative", display: "flex", alignItems: "center", gap: 10,
                  padding: "7.5px 10px", marginBottom: 1, borderRadius: 7,
                  textDecoration: "none", fontSize: 13, fontWeight: active ? 600 : 450,
                  color: active ? "#eef1f7" : locked ? "#4d5a75" : "#8b99b8",
                  background: active ? "rgba(255,255,255,.05)" : "transparent",
                  transition: "background .12s,color .12s",
                }}>
                  {active && <span style={{ position: "absolute", left: -8, top: 8, bottom: 8, width: 2.5, borderRadius: 2, background: "#22c55e" }} />}
                  <Icon size={15.5} strokeWidth={active ? 2.1 : 1.8} color={active ? "#22c55e" : locked ? "#3d4a62" : "#5b6b8c"} />
                  {itemLabel}
                  {locked && <Lock size={10} style={{ marginLeft: "auto", color: "#3d4a62" }} />}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Plan */}
      <div style={{ borderTop: "1px solid #1c2333", padding: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 11px", borderRadius: 8, background: "#12151d", border: "1px solid #1c2333" }}>
          <span style={{ fontSize: 11.5, color: "#8b99b8", fontWeight: 500 }}>{t.sidebar.currentPlan}</span>
          <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.8px", padding: "2.5px 8px", borderRadius: 5, color: ps.color, background: ps.bg, border: `1px solid ${ps.border}` }}>
            {planDisplayName(plan)}
          </span>
        </div>
        {plan === "free" && (
          <Link href="/account" style={{ display: "block", textAlign: "center", marginTop: 8, padding: "8px 0", background: "#22c55e", color: "#06090c", borderRadius: 7, textDecoration: "none", fontSize: 12, fontWeight: 700 }}>
            {t.sidebar.upgrade}
          </Link>
        )}
        {/* The switcher existed but was mounted only on the landing page and
            the four post-signup routes — so a customer INSIDE the app had no
            way to change language at all. Every route the sidebar renders on
            is now cookie-localised by src/proxy.ts, which is the condition
            locale-switcher.tsx's own header sets for mounting it. */}
        <div style={{ marginTop: 10, display: "flex", justifyContent: "center" }}>
          <LocaleSwitcher locale={locale} style={{ fontSize: 11.5, padding: "5px 8px", width: "100%", justifyContent: "center" }} />
        </div>
      </div>
    </aside>
  )
}
