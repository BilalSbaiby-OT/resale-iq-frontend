"use client"
import { useEffect, useState, useCallback } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { SkeletonRows } from "@/components/ui/skeleton"
import { adminListUsers, adminChangePlan, adminToggleUser, type AdminUser } from "@/lib/api"
import { ago } from "@/lib/utils"
import { Lock } from "lucide-react"

const PLAN_COLOR: Record<string, string> = { free: "#60a5fa", operator: "#34d399", power: "#fbbf24" }
const TH: React.CSSProperties = { fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", color: "#4d5a75", textAlign: "left", padding: "10px 14px", background: "#151924", borderBottom: "1px solid #1c2333" }
const TD: React.CSSProperties = { padding: "11px 14px", borderBottom: "1px solid #181e2d", fontSize: 12.5, verticalAlign: "middle" }

export default function AdminPage() {
  return (
    <AppShell title="Admin" subtitle="User management & revenue">
      <AdminInner />
    </AppShell>
  )
}

function AdminInner() {
  const [users, setUsers] = useState<AdminUser[] | null>(null)
  const [err, setErr] = useState("")
  const [busy, setBusy] = useState<number | null>(null)

  const load = useCallback(async () => {
    try { const d = await adminListUsers(); setUsers(d.users); setErr("") }
    catch (e) { setErr(e instanceof Error ? e.message : "Failed to load"); setUsers([]) }
  }, [])
  useEffect(() => { load() }, [load])

  const changePlan = async (u: AdminUser, plan: string) => {
    setBusy(u.id)
    try { await adminChangePlan(u.id, plan); await load() }
    catch (e) { alert(e instanceof Error ? e.message : "Failed") }
    finally { setBusy(null) }
  }
  const toggle = async (u: AdminUser) => {
    setBusy(u.id)
    try { await adminToggleUser(u.id); await load() }
    catch (e) { alert(e instanceof Error ? e.message : "Failed") }
    finally { setBusy(null) }
  }

  const stats = users ? {
    total: users.length,
    paying: users.filter(u => u.plan !== "free").length,
    mrr: users.filter(u => u.plan === "operator").length * 19 + users.filter(u => u.plan === "power").length * 49,
    active: users.filter(u => u.is_active).length,
  } : null

  if (err.includes("403") || err.includes("Power") || err.includes("Owner")) {
    return (
        <div style={{ maxWidth: 420, margin: "80px auto", textAlign: "center", color: "#8b99b8" }}>
          <div style={{ marginBottom: 10, display: "flex", justifyContent: "center" }}><Lock size={30} style={{ color: "#8b99b8" }} /></div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#eef1f7" }}>Admin access required</div>
          <div style={{ fontSize: 13, marginTop: 6 }}>This area is limited to the site owner.</div>
        </div>
    )
  }

  return (
    <>
      {stats && (
        <div className="riq-grid-kpi" style={{ marginBottom: 18 }}>
          {[
            ["Total users", stats.total, "#eef1f7"],
            ["Paying", stats.paying, "#34d399"],
            ["MRR", `€${stats.mrr}`, "#fbbf24"],
            ["Active", stats.active, "#60a5fa"],
          ].map(([l, v, c]) => (
            <div key={l as string} style={{ background: "#12151d", border: "1px solid #1c2333", borderRadius: 10, padding: "16px 18px" }}>
              <div style={{ fontSize: 11, color: "#5b6b8c" }}>{l}</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: c as string, marginTop: 4, fontVariantNumeric: "tabular-nums" }}>{v}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ background: "#12151d", border: "1px solid #1c2333", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ padding: "13px 16px", borderBottom: "1px solid #1c2333", fontSize: 13.5, fontWeight: 650 }}>Users</div>
        {!users ? <SkeletonRows rows={6} /> : users.length === 0 ? (
          <div style={{ padding: 30, textAlign: "center", color: "#4d5a75", fontSize: 12.5 }}>No users yet.</div>
        ) : (
          <div className="riq-scroll-x"><table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
            <thead><tr>{["ID", "Email", "Plan", "Status", "Verdicts today", "Joined", "Actions"].map(h => <th key={h} style={TH}>{h}</th>)}</tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ opacity: busy === u.id ? 0.5 : 1 }}>
                  <td style={{ ...TD, color: "#4d5a75", fontVariantNumeric: "tabular-nums" }}>{u.id}</td>
                  <td style={{ ...TD, color: "#eef1f7" }}>{u.email}</td>
                  <td style={TD}>
                    <select value={u.plan} onChange={e => changePlan(u, e.target.value)} disabled={busy === u.id}
                      style={{ background: "#1a2030", border: "1px solid #263147", borderRadius: 6, color: PLAN_COLOR[u.plan] || "#eef1f7", fontSize: 12, padding: "3px 8px", fontWeight: 600 }}>
                      <option value="free">unpaid</option>
                      <option value="operator">Starter (€19)</option>
                      <option value="power">Pro (€49)</option>
                    </select>
                  </td>
                  <td style={TD}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: u.is_active ? "#34d399" : "#f87171" }}>
                      {u.is_active ? "● active" : "○ disabled"}
                    </span>
                  </td>
                  <td style={{ ...TD, fontVariantNumeric: "tabular-nums" }}>{u.verdict_count_today ?? 0}</td>
                  <td style={{ ...TD, color: "#4d5a75", fontSize: 11 }}>{ago(u.created_at)}</td>
                  <td style={TD}>
                    <button onClick={() => toggle(u)} disabled={busy === u.id}
                      style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, cursor: "pointer", background: "transparent", border: "1px solid #263147", color: u.is_active ? "#f87171" : "#34d399" }}>
                      {u.is_active ? "Disable" : "Enable"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>
    </>
  )
}
