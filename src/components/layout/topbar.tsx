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
    <header className="riq-topbar" style={{ height: 54, flexShrink: 0, background: "#0D0F13", borderBottom: "1px solid #1c2333", display: "flex", alignItems: "center", padding: "0 20px", gap: 18 }}>
      <button className="riq-hamburger" onClick={onMenu} aria-label={t.openMenu}
        style={{ alignItems: "center", justifyContent: "center", background: "transparent", border: "1px solid #232c42", borderRadius: 8, width: 34, height: 34, color: "#8b99b8", cursor: "pointer", flexShrink: 0 }}>
        <Menu size={17} />
      </button>
      <div className="riq-topbar-titlewrap" style={{ minWidth: 180 }}>
        <div style={{ fontWeight: 650, fontSize: 14.5, color: "#eef1f7", letterSpacing: "0.1px" }}>{title}</div>
        {subtitle && <div className="riq-topbar-sub" style={{ fontSize: 11, color: "#4d5a75", marginTop: 1 }}>{subtitle}</div>}
      </div>

      <div className="riq-topbar-search" style={{ flex: 1, maxWidth: 340, display: "flex", alignItems: "center", gap: 8, background: "#12151d", border: "1px solid #232c42", borderRadius: 8, padding: "0 11px", height: 34 }}>
        <Search size={14} color="#4d5a75" />
        <input
          value={q} onChange={e => setQ(e.target.value)} onKeyDown={onSearch}
          placeholder={t.searchPlaceholder}
          style={{ flex: 1, background: "none", border: "none", color: "#eef1f7", fontSize: 12.5, outline: "none", minWidth: 0 }}
        />
        <kbd style={{ fontSize: 9.5, color: "#4d5a75", border: "1px solid #232c42", borderRadius: 4, padding: "1px 5px" }}>↵</kbd>
      </div>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>
        <span className="riq-live" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: "#8b99b8" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
          {t.liveData}
        </span>
        <button onClick={() => router.push("/account")} style={{ display: "flex", alignItems: "center", gap: 7, background: "transparent", border: "1px solid #232c42", borderRadius: 8, padding: "6px 11px", fontSize: 12, color: "#8b99b8", cursor: "pointer" }}>
          <CircleUser size={14} />
          <span className="riq-topbar-email" style={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email || t.account}</span>
        </button>
        <button onClick={logout} title={t.signOut} style={{ display: "flex", alignItems: "center", background: "transparent", border: "none", color: "#4d5a75", cursor: "pointer", padding: 4 }}>
          <LogOut size={15} />
        </button>
      </div>
    </header>
  )
}
