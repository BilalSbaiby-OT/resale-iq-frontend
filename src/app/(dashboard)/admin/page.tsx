"use client"
import { useEffect, useState, useCallback, useMemo } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { AdminNav } from "@/components/layout/admin-nav"
import { SkeletonRows } from "@/components/ui/skeleton"
import {
  adminListUsers, adminChangePlan, adminToggleUser, adminDeleteUser,
  adminPurgeDisabledJunk, type AdminUser,
} from "@/lib/api"
import { ago } from "@/lib/utils"
import { Lock } from "lucide-react"

const PLAN_COLOR: Record<string, string> = { free: "#60a5fa", operator: "#34d399", power: "#fbbf24" }
const TH: React.CSSProperties = { fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", color: "#4d5a75", textAlign: "left", padding: "10px 14px", background: "#151924", borderBottom: "1px solid #1c2333" }
const TD: React.CSSProperties = { padding: "12px 14px", borderBottom: "1px solid #181e2d", fontSize: 13, verticalAlign: "middle" }

type Filter = "all" | "paying" | "comped" | "disabled"

function isOn(u: AdminUser) {
  return u.is_active === true
}

export default function AdminPage() {
  return (
    <AppShell title="Customers" subtitle="Plans, billing, access">
      <AdminInner />
    </AppShell>
  )
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, letterSpacing: "0.4px", color,
      background: `${color}1a`, border: `1px solid ${color}47`,
      borderRadius: 999, padding: "2px 8px",
    }}>{label}</span>
  )
}

function AdminInner() {
  const [users, setUsers] = useState<AdminUser[] | null>(null)
  const [metrics, setMetrics] = useState<{ paying_total: number; mrr_eur: number; verified_users: number; total_users: number } | null>(null)
  const [err, setErr] = useState("")
  const [busy, setBusy] = useState<number | string | null>(null)
  const [q, setQ] = useState("")
  const [filter, setFilter] = useState<Filter>("all")
  const [msg, setMsg] = useState("")

  const load = useCallback(async () => {
    try {
      const d = await adminListUsers()
      setUsers(d.users)
      setMetrics(d.metrics ?? null)
      setErr("")
    } catch (e) { setErr(e instanceof Error ? e.message : "Failed to load"); setUsers([]) }
  }, [])
  useEffect(() => { load() }, [load])

  const changePlan = async (u: AdminUser, plan: string) => {
    if (u.is_owner) return
    setBusy(u.id)
    try { await adminChangePlan(u.id, plan); await load() }
    catch (e) { alert(e instanceof Error ? e.message : "Failed") }
    finally { setBusy(null) }
  }
  const setActive = async (u: AdminUser, next: boolean) => {
    if (u.is_owner && !next) return
    setBusy(u.id)
    try {
      const res = await adminToggleUser(u.id, next)
      setUsers(prev => prev ? prev.map(x => x.id === u.id ? { ...x, is_active: res.is_active } : x) : prev)
      await load()
    } catch (e) { alert(e instanceof Error ? e.message : "Failed") }
    finally { setBusy(null) }
  }
  const remove = async (u: AdminUser) => {
    if (u.protected || u.is_owner) return
    if (!confirm(`Delete ${u.email} permanently? This cannot be undone.`)) return
    setBusy(u.id)
    try { await adminDeleteUser(u.id); await load() }
    catch (e) { alert(e instanceof Error ? e.message : "Failed") }
    finally { setBusy(null) }
  }
  const purgeJunk = async () => {
    setBusy("purge")
    try {
      const preview = await adminPurgeDisabledJunk(false)
      const n = preview.would_delete ?? preview.emails.length
      if (!n) { setMsg("No disabled junk to delete."); return }
      const list = preview.emails.slice(0, 12).join("\n")
      const extra = preview.emails.length > 12 ? `\n…and ${preview.emails.length - 12} more` : ""
      if (!confirm(`Delete ${n} disabled account(s)? Kept accounts are not in this list.\n\n${list}${extra}`)) return
      const done = await adminPurgeDisabledJunk(true)
      setMsg(`Deleted ${done.deleted ?? n} disabled account(s).`)
      await load()
    } catch (e) { alert(e instanceof Error ? e.message : "Failed") }
    finally { setBusy(null) }
  }

  const query = q.trim().toLowerCase()
  const filtered = useMemo(() => {
    if (!users) return []
    return users.filter(u => {
      if (query && !u.email.toLowerCase().includes(query) && String(u.id) !== query) return false
      if (filter === "paying") return u.billing === "stripe" && isOn(u)
      if (filter === "comped") return u.billing === "comped"
      if (filter === "disabled") return !isOn(u)
      return true
    })
  }, [users, query, filter])

  const junkCount = users ? users.filter(u => !isOn(u) && !u.protected).length : 0
  const compedCount = users ? users.filter(u => u.billing === "comped").length : 0

  if (err.includes("403") || err.includes("Power") || err.includes("Owner")) {
    return (
        <div style={{ maxWidth: 420, margin: "80px auto", textAlign: "center", color: "#8b99b8" }}>
          <div style={{ marginBottom: 10, display: "flex", justifyContent: "center" }}><Lock size={30} style={{ color: "#8b99b8" }} /></div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#eef1f7" }}>Admin access required</div>
          <div style={{ fontSize: 13, marginTop: 6 }}>This area is limited to the site owner. Pro does not include it.</div>
        </div>
    )
  }

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "paying", label: "Paying" },
    { id: "comped", label: "Comped" },
    { id: "disabled", label: "Disabled" },
  ]

  return (
    <>
      <AdminNav />
      {metrics && (
        <div className="riq-grid-kpi" style={{ marginBottom: 18 }}>
          {[
            { l: "Customers", v: String(metrics.verified_users), c: "#eef1f7", h: "Verified accounts, excluding internal" },
            { l: "Paying", v: String(metrics.paying_total), c: "#34d399", h: "Active Stripe subscriptions" },
            { l: "MRR", v: `€${metrics.mrr_eur}`, c: "#fbbf24", h: "Starter €19 · Pro €49. Gifted plans excluded." },
            { l: "Comped", v: String(compedCount), c: "#60a5fa", h: "Paid plan, no Stripe — not revenue" },
          ].map(k => (
            <div key={k.l} style={{ background: "#12151d", border: "1px solid #1c2333", borderRadius: 10, padding: "16px 18px" }}>
              <div style={{ fontSize: 11, color: "#5b6b8c", textTransform: "uppercase", letterSpacing: "0.6px" }}>{k.l}</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: k.c, marginTop: 4, fontVariantNumeric: "tabular-nums" }}>{k.v}</div>
              <div style={{ fontSize: 11, color: "#4d5a75", marginTop: 6, lineHeight: 1.35 }}>{k.h}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ background: "#12151d", border: "1px solid #1c2333", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #1c2333", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search email"
            style={{ background: "#1a2030", border: "1px solid #263147", borderRadius: 7, color: "#eef1f7", fontSize: 13, padding: "7px 12px", minWidth: 220, flex: "1 1 180px" }} />
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {filters.map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)}
                style={{ fontSize: 12, fontWeight: 600, padding: "6px 12px", borderRadius: 7, cursor: "pointer",
                  background: filter === f.id ? "rgba(34,197,94,.12)" : "transparent",
                  border: `1px solid ${filter === f.id ? "rgba(34,197,94,.35)" : "#263147"}`,
                  color: filter === f.id ? "#34d399" : "#8b99b8" }}>
                {f.label}
              </button>
            ))}
          </div>
          <button onClick={purgeJunk} disabled={busy !== null || !junkCount}
            style={{ marginLeft: "auto", fontSize: 12, fontWeight: 650, padding: "6px 12px", borderRadius: 7, cursor: junkCount ? "pointer" : "not-allowed",
              background: "transparent", border: "1px solid #5b1d24", color: junkCount ? "#f87171" : "#4d5a75" }}>
            Delete disabled{junkCount ? ` (${junkCount})` : ""}
          </button>
        </div>
        {msg && <div style={{ padding: "8px 16px", fontSize: 12, color: "#34d399", borderBottom: "1px solid #1c2333" }}>{msg}</div>}
        {!users ? <SkeletonRows rows={6} /> : filtered.length === 0 ? (
          <div style={{ padding: 30, textAlign: "center", color: "#4d5a75", fontSize: 13 }}>
            {users.length === 0 ? "No users yet." : "Nothing in this view."}
          </div>
        ) : (
          <div className="riq-scroll-x"><table style={{ width: "100%", borderCollapse: "collapse", minWidth: 780 }}>
            <thead><tr>{["Customer", "Plan", "Billing", "Status", "Joined", ""].map(h => <th key={h || "a"} style={TH}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map(u => {
                const on = isOn(u)
                return (
                <tr key={u.id} style={{ opacity: busy === u.id ? 0.5 : 1 }}>
                  <td style={TD}>
                    <div style={{ color: "#eef1f7", fontWeight: 600 }}>{u.email}</div>
                    <div style={{ fontSize: 11, color: "#4d5a75", marginTop: 3, display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                      <span>#{u.id}</span>
                      {u.is_owner && <Badge label="Owner" color="#fbbf24" />}
                      {u.protected && !u.is_owner && <Badge label="Keep" color="#34d399" />}
                      <span>{u.email_verified ? "Verified" : "Unverified"}</span>
                    </div>
                  </td>
                  <td style={TD}>
                    {u.is_owner ? (
                      <span style={{ fontWeight: 600, color: PLAN_COLOR[u.plan] || "#eef1f7" }}>
                        {u.plan === "power" ? "Pro" : u.plan === "operator" ? "Starter" : "Free"}
                      </span>
                    ) : (
                      <select value={u.plan} onChange={e => changePlan(u, e.target.value)} disabled={busy === u.id}
                        style={{ background: "#1a2030", border: "1px solid #263147", borderRadius: 6, color: PLAN_COLOR[u.plan] || "#eef1f7", fontSize: 12, padding: "5px 8px", fontWeight: 600 }}>
                        <option value="free">Free</option>
                        <option value="operator">Starter (€19)</option>
                        <option value="power">Pro (€49)</option>
                      </select>
                    )}
                  </td>
                  <td style={TD}>
                    {u.billing === "stripe" ? <Badge label="Stripe" color="#34d399" />
                      : u.billing === "comped" ? <Badge label="Comped" color="#60a5fa" />
                      : <span style={{ color: "#4d5a75", fontSize: 12 }}>—</span>}
                  </td>
                  <td style={TD}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: on ? "#34d399" : "#f87171" }}>
                      {on ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td style={{ ...TD, color: "#4d5a75", fontSize: 12 }}>{ago(u.created_at)}</td>
                  <td style={{ ...TD, whiteSpace: "nowrap", textAlign: "right" }}>
                    {!u.is_owner && (
                      <button onClick={() => setActive(u, !on)} disabled={busy === u.id}
                        style={{ fontSize: 12, padding: "5px 10px", borderRadius: 6, cursor: "pointer", background: "transparent", border: "1px solid #263147", color: on ? "#f87171" : "#34d399", marginRight: 6 }}>
                        {on ? "Disable" : "Enable"}
                      </button>
                    )}
                    {!u.protected && !u.is_owner && (
                      <button onClick={() => remove(u)} disabled={busy === u.id}
                        style={{ fontSize: 12, padding: "5px 10px", borderRadius: 6, cursor: "pointer", background: "transparent", border: "1px solid #5b1d24", color: "#f87171" }}>
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              )})}
            </tbody>
          </table></div>
        )}
      </div>
    </>
  )
}
