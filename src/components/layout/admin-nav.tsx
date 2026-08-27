"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

const TABS = [
  { href: "/admin", label: "Customers" },
  { href: "/admin/ops", label: "Operations" },
  { href: "/admin/traffic", label: "Traffic" },
]

export function AdminNav() {
  const pathname = usePathname()
  return (
    <div style={{ display: "flex", gap: 2, marginBottom: 18, borderBottom: "1px solid #1c2333" }}>
      {TABS.map(t => {
        const on = pathname === t.href
        return (
          <Link key={t.href} href={t.href} style={{
            padding: "10px 14px", fontSize: 13, fontWeight: on ? 650 : 500,
            color: on ? "#eef1f7" : "#8b99b8", textDecoration: "none",
            borderBottom: on ? "2px solid #22c55e" : "2px solid transparent",
            marginBottom: -1,
          }}>
            {t.label}
          </Link>
        )
      })}
    </div>
  )
}
