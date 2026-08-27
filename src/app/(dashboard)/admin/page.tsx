"use client"
import { useEffect, useState, useCallback, useMemo } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { SkeletonRows } from "@/components/ui/skeleton"
import {
  adminListUsers, adminChangePlan, adminToggleUser, adminDeleteUser,
  adminPurgeDisabledJunk, type AdminUser,
} from "@/lib/api"
import { ago } from "@/lib/utils"
import { Lock } from "lucide-react"

const PLAN_COLOR: Record<string, string> = { free: "#60a5fa", operator: "#34d399", power: "#fbbf24" }
const PLAN_LABEL: Record<string, string> = { free: "Free", operator: "Starter", power: "Pro" }
const TH: React.CSSProperties = { fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", color: "#4d5a75", textAlign: "left", padding: "10px 14px", background: "#151924", borderBottom: "1px solid #1c2333" }
const TD: React.CSSProperties = { padding: "11px 14px", borderBottom: "1px solid #181e2d", fontSize: 12.5, verticalAlign: "middle" }

type Filter = "keep" | "active" | "disabled" | "all"

function isOn(u: AdminUser) {
  return u.is_active === true
}

export default function AdminPage() {
  return (
    <AppShell title="Admin" subtitle="Accounts you keep, junk you can delete">
      <AdminInner />
    </AppShell>
  )
}

function AdminInner() {
  const [users, setUsers] = useState<AdminUser[] | null>(null)
  const [err, setErr] = useState("")
  const [busy, setBusy] = useState<number | string | null>(null)
  const [q, setQ] = useState("")
  const [filter, setFilter] = useState<Filter>("keep")
  const [msg, setMsg] = useState("")

  const load = useCallback(async () => {
    try { const d = await adminListUsers(); setUsers(d.users); setErr("") }
    catch (e) { setErr(e instanceof Error ? e.message : "Failed to load"); setUsers([]) }
  }, [])
  useEffect(() => { load() }, [load])

  const changePlan = async (u: AdminUser, plan: string) => {
    if (u.plan_locked) return
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
      if (filter === "keep") return !!u.protected
      if (filter === "active") return isOn(u)
      if (filter === "disabled") return !isOn(u)
      return true
    })
  }, [users, query, filter])

  const stats = users ? {
    total: users.length,
    paying: users.filter(u => isOn(u) && (u.plan === "operator" || u.plan === "power")).length,
    mrr: users.filter(u => isOn(u)).reduce((n, u) => n + (u.plan === "operator" ? 19 : u.plan === "power" ? 49 : 0), 0),
    active: users.filter(isOn).length,
    disabled: users.filter(u => !isOn(u)).length,
    junk: users.filter(u => !isOn(u) && !u.protected).length,
  } : null

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
    { id: "keep", label: "Keep" },
    { id: "active", label: "Active" },
    { id: "disabled", label: "Disabled" },
    { id: "all", label: "All" },
  ]

  return (
    <>
      {stats && (
        <div className="riq-grid-kpi" style={{ marginBottom: 18 }}>
          {[
            ["Accounts", stats.total, "#eef1f7"],
            ["Active", stats.active, "#60a5fa"],
            ["Paying (active)", stats.paying, "#34d399"],
            ["MRR (active)", `€${stats.mrr}`, "#fbbf24"],
          ].map(([l, v, c]) => (
            <div key={l as string} style={{ background: "#12151d", border: "1px solid #1c2333", borderRadius: 10, padding: "16px 18px" }}>
              <div style={{ fontSize: 11, color: "#5b6b8c" }}>{l}</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: c as string, marginTop: 4, fontVariantNumeric: "tabular-nums" }}>{v}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ background: "#12151d", border: "1px solid #1c2333", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ padding: "13px 16px", borderBottom: "1px solid #1c2333", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ fontSize: 13.5, fontWeight: 650, marginRight: 4 }}>Users</div>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search email"
            style={{ background: "#1a2030", border: "1px solid #263147", borderRadius: 7, color: "#eef1f7", fontSize: 12.5, padding: "6px 10px", minWidth: 180, flex: "1 1 160px" }} />
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {filters.map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)}
                style={{ fontSize: 11, fontWeight: 600, padding: "5px 10px", borderRadius: 999, cursor: "pointer",
                  background: filter === f.id ? "rgba(34,197,94,.12)" : "transparent",
                  border: `1px solid ${filter === f.id ? "rgba(34,197,94,.35)" : "#263147"}`,
                  color: filter === f.id ? "#34d399" : "#8b99b8" }}>
                {f.label}{f.id === "disabled" && stats ? ` (${stats.disabled})` : ""}
              </button>
            ))}
          </div>
          <button onClick={purgeJunk} disabled={busy !== null || !stats?.junk}
            style={{ marginLeft: "auto", fontSize: 11, fontWeight: 650, padding: "6px 12px", borderRadius: 7, cursor: stats?.junk ? "pointer" : "not-allowed",
              background: "transparent", border: "1px solid #5b1d24", color: stats?.junk ? "#f87171" : "#4d5a75" }}>
            Delete disabled junk{stats?.junk ? ` (${stats.junk})` : ""}
          </button>
        </div>
        {msg && <div style={{ padding: "8px 16px", fontSize: 12, color: "#34d399", borderBottom: "1px solid #1c2333" }}>{msg}</div>}
        {!users ? <SkeletonRows rows={6} /> : filtered.length === 0 ? (
          <div style={{ padding: 30, textAlign: "center", color: "#4d5a75", fontSize: 12.5 }}>
            {users.length === 0 ? "No users yet." : "Nothing in this view."}
          </div>
        ) : (
          <div className="riq-scroll-x"><table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
            <thead><tr>{["ID", "Email", "Role", "Plan", "Status", "Verdicts", "Joined", "Actions"].map(h => <th key={h} style={TH}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map(u => {
                const on = isOn(u)
                return (
                <tr key={u.id} style={{ opacity: busy === u.id ? 0.5 : 1 }}>
                  <td style={{ ...TD, color: "#4d5a75", fontVariantNumeric: "tabular-nums" }}>{u.id}</td>
                  <td style={{ ...TD, color: "#eef1f7" }}>
                    <div>{u.email}</div>
                    <div style={{ fontSize: 10, color: "#4d5a75", marginTop: 2 }}>
                      {u.email_verified ? "verified" : "unverified"}
                      {u.stripe_sub_id ? " · stripe" : ""}
                    </div>
                  </td>
                  <td style={TD}>
                    {u.is_owner ? (
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.4px", color: "#fbbf24", background: "rgba(251,191,36,.1)", border: "1px solid rgba(251,191,36,.28)", borderRadius: 999, padding: "2px 8px" }}>OWNER</span>
                    ) : u.protected ? (
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.4px", color: "#34d399", background: "rgba(52,211,153,.1)", border: "1px solid rgba(52,211,153,.28)", borderRadius: 999, padding: "2px 8px" }}>KEEP</span>
                    ) : (
                      <span style={{ fontSize: 10, color: "#4d5a75" }}>—</span>
                    )}
                  </td>
                  <td style={TD}>
                    {u.plan_locked ? (
                      <span style={{ fontWeight: 600, color: PLAN_COLOR[u.plan] || "#eef1f7" }}>{PLAN_LABEL[u.plan] || u.plan}</span>
                    ) : (
                      <select value={u.plan} onChange={e => changePlan(u, e.target.value)} disabled={busy === u.id}
                        style={{ background: "#1a2030", border: "1px solid #263147", borderRadius: 6, color: PLAN_COLOR[u.plan] || "#eef1f7", fontSize: 12, padding: "3px 8px", fontWeight: 600 }}>
                        <option value="free">Free</option>
                        <option value="operator">Starter (€19)</option>
                        <option value="power">Pro (€49)</option>
                      </select>
                    )}
                  </td>
                  <td style={TD}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: on ? "#34d399" : "#f87171" }}>
                      {on ? "● active" : "○ disabled"}
                    </span>
                  </td>
                  <td style={{ ...TD, fontVariantNumeric: "tabular-nums" }}>{u.verdict_count_today ?? 0}</td>
                  <td style={{ ...TD, color: "#4d5a75", fontSize: 11 }}>{ago(u.created_at)}</td>
                  <td style={{ ...TD, whiteSpace: "nowrap" }}>
                    {!u.is_owner && (
                      <button onClick={() => setActive(u, !on)} disabled={busy === u.id}
                        style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, cursor: "pointer", background: "transparent", border: "1px solid #263147", color: on ? "#f87171" : "#34d399", marginRight: 6 }}>
                        {on ? "Disable" : "Enable"}
                      </button>
                    )}
                    {!u.protected && !u.is_owner && (
                      <button onClick={() => remove(u)} disabled={busy === u.id}
                        style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, cursor: "pointer", background: "transparent", border: "1px solid #5b1d24", color: "#f87171" }}>
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
