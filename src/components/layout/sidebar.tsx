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
import { planChip } from "@/lib/entitlement"
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

export function Sidebar({ className = "" }: { className?: string }) {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const locale = useLocale()
  const t = navCopy[locale]
  const plan = (user?.plan || "free") as "free" | "operator" | "power"

  const sections = user?.is_owner
    ? [...navSections(t), { label: t.sections.owner, items: adminItems(t) }]
    : navSections(t)

  const renderItem = ({ href, icon: Icon, label: itemLabel }: { href: string; icon: typeof Lock; label: string }) => {
    const active = href === "/admin"
      ? pathname === "/admin"
      : pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"))
    const locked = (plan === "free" && !user?.trial_active && PAID_ROUTES.has(href))
      || (plan === "operator" && PRO_ROUTES.has(href))
      || (plan === "free" && user?.trial_active && href === "/compare")
    return (
      <Link key={href} href={href} style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "8px 10px", marginBottom: 1, borderRadius: 8,
        textDecoration: "none", fontSize: 15, fontWeight: active ? 500 : 400,
        color: active ? "var(--color-on-graphite)" : "var(--color-graphite-muted)",
        background: active ? "rgba(255,255,255,.06)" : "transparent",
        opacity: locked ? 0.6 : 1,
        transition: "background var(--motion-fast) var(--motion-ease), color var(--motion-fast) var(--motion-ease)",
      }}>
        {/* The active accent rail is gone. The one accent belongs to the single
            filled CTA on the page; spending it on a nav marker meant every
            screen had two things claiming to be the primary action. Weight and
            a raised background mark "active" instead. */}
        <Icon size={16} strokeWidth={1.8} color="var(--color-graphite-muted)" />
        {itemLabel}
        {locked && <Lock size={11} style={{ marginLeft: "auto", color: "var(--color-graphite-muted)" }} />}
      </Link>
    )
  }

  return (
    <aside className={className} style={{ width: 232, flexShrink: 0, background: "var(--color-graphite)", borderRight: "1px solid var(--color-hairline)", display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      {/* Wordmark */}
      <div style={{ padding: "16px 16px", display: "flex", alignItems: "center", gap: 10, height: 56, boxSizing: "border-box" }}>
        <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.01em", color: "var(--color-on-graphite)" }}>Resale IQ</div>
      </div>

      {/* Nav. Order is fixed by the design brief: Overview → Intelligence →
          Workspace → Resources (collapsed) → Account. Resources is five links
          of reference material that a working session never touches, so it
          ships closed — it was pushing Account and the plan footer below the
          fold on a 390px viewport. `<details>` rather than React state so it
          costs no hydration and keeps working with JS disabled. */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "4px 8px 8px" }}>
        {sections.map(({ label, items }) => {
          const collapsed = label === t.sections.resources
          const heading = (
            <div style={{ padding: "6px 10px", fontSize: 12, fontWeight: 500, color: "var(--color-graphite-muted)" }}>{label}</div>
          )
          if (collapsed) {
            return (
              <details key={label} style={{ marginBottom: 16 }}>
                <summary style={{ listStyle: "none", cursor: "pointer" }}>{heading}</summary>
                {items.map(renderItem)}
              </details>
            )
          }
          return (
            <div key={label} style={{ marginBottom: 16 }}>
              {heading}
              {items.map(renderItem)}
            </div>
          )
        })}
      </nav>

      {/* Footer: plan, ONE quiet upgrade, ONE language control. The upgrade was
          a filled green button here, which competed with the filled CTA on
          every page it rendered beside — two primary actions on one screen.
          It is now text; the plan badge lost its tinted pill for the same
          reason. */}
      <div style={{ borderTop: "1px solid var(--color-hairline)", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 10px" }}>
          <span style={{ fontSize: 13, color: "var(--color-graphite-muted)" }}>{t.sidebar.currentPlan}</span>
          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-on-graphite)" }}>
            {/* Same module the account page reads. planDisplayName() used to be
                called here and it ignores trial_active entirely, so a trialling
                user was told "Free" in the sidebar and "Free trial" on /account
                at the same moment — and neither string was translated. */}
            {planChip(user, locale)}
          </span>
        </div>
        {plan === "free" && (
          <Link href="/account" style={{ padding: "0 10px", color: "var(--color-graphite-muted)", textDecoration: "none", fontSize: 13 }}>
            {t.sidebar.upgrade}
          </Link>
        )}
        {/* The switcher existed but was mounted only on the landing page and
            the four post-signup routes — so a customer INSIDE the app had no
            way to change language at all. Every route the sidebar renders on
            is now cookie-localised by src/proxy.ts, which is the condition
            locale-switcher.tsx's own header sets for mounting it.
            This is the app's ONE language control: /dashboard used to mount a
            second one of its own, which is now removed. */}
        <LocaleSwitcher locale={locale} style={{ fontSize: 13, padding: "6px 10px", width: "100%" }} />
      </div>
    </aside>
  )
}
