"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, LogOut, CircleUser, Menu } from "lucide-react"
import { getEmailFromToken } from "@/lib/utils"
import { useAuthStore } from "@/lib/auth-store"
import { useLocale } from "@/components/i18n/locale-provider"
import { navCopy } from "@/lib/nav-copy"

interface TopbarProps { title: string; subtitle?: string; onMenu?: () => void }

export function Topbar({ title, subtitle, onMenu }: TopbarProps) {
  const [q, setQ] = useState("")
  const router = useRouter()
  const { logout } = useAuthStore()
  const email = getEmailFromToken()
  const t = navCopy[useLocale()].topbar

  const onSearch = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && q.trim()) {
      router.push(`/deals?q=${encodeURIComponent(q.trim())}`)
      setQ("")
    }
  }

  return (
    <header className="riq-topbar" style={{ height: 56, flexShrink: 0, background: "var(--color-graphite)", borderBottom: "1px solid var(--color-hairline)", display: "flex", alignItems: "center", padding: "0 20px", gap: 16 }}>
      <button className="riq-hamburger" onClick={onMenu} aria-label={t.openMenu}
        style={{ alignItems: "center", justifyContent: "center", background: "transparent", border: "1px solid var(--color-hairline)", borderRadius: 12, width: 36, height: 36, color: "var(--color-graphite-muted)", cursor: "pointer", flexShrink: 0 }}>
        <Menu size={17} />
      </button>
      <div className="riq-topbar-titlewrap" style={{ minWidth: 0, flex: "1 1 auto", overflow: "hidden" }}>
        <div style={{ fontWeight: 600, fontSize: 17, color: "var(--color-on-graphite)", letterSpacing: "-0.01em" }}>{title}</div>
        {subtitle && <div className="riq-topbar-sub" style={{ fontSize: 13, color: "var(--color-graphite-muted)", marginTop: 1 }}>{subtitle}</div>}
      </div>

      <div className="riq-topbar-search" style={{ flex: 1, maxWidth: 340, display: "flex", alignItems: "center", gap: 8, background: "transparent", border: "1px solid var(--color-hairline)", borderRadius: 12, padding: "0 12px", height: 36 }}>
        <Search size={15} color="var(--color-graphite-muted)" />
        <input
          value={q} onChange={e => setQ(e.target.value)} onKeyDown={onSearch}
          placeholder={t.searchPlaceholder}
          style={{ flex: 1, background: "none", border: "none", color: "var(--color-on-graphite)", fontSize: 15, outline: "none", minWidth: 0 }}
        />
        <kbd style={{ fontSize: 12, color: "var(--color-graphite-muted)", border: "1px solid var(--color-hairline)", borderRadius: 6, padding: "1px 6px" }}>↵</kbd>
      </div>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>
        <span className="riq-live" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--color-graphite-muted)" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-accent)" }} />
          {t.liveData}
        </span>
        <button onClick={() => router.push("/account")} style={{ display: "flex", alignItems: "center", gap: 8, background: "transparent", border: "1px solid var(--color-hairline)", borderRadius: 12, padding: "7px 12px", fontSize: 13, color: "var(--color-graphite-muted)", cursor: "pointer" }}>
          <CircleUser size={14} />
          <span className="riq-topbar-email" style={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email || t.account}</span>
        </button>
        <button onClick={logout} title={t.signOut} style={{ display: "flex", alignItems: "center", background: "transparent", border: "none", color: "var(--color-graphite-muted)", cursor: "pointer", padding: 4 }}>
          <LogOut size={15} />
        </button>
      </div>
    </header>
  )
}
