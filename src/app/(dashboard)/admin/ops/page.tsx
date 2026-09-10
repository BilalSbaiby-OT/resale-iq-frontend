"use client"
import { useEffect, useState } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { AdminNav } from "@/components/layout/admin-nav"
import { getOps, type OpsStatus } from "@/lib/api"
import { Activity, Bot, Database, HeartPulse } from "lucide-react"

// The answer to "where is my agent dashboard".
//
// Hermes ships with its own dashboard and API server; both are deliberately
// off, because it shares a host with the live payment backend and the Hermes
// docs attribute the June 2026 MCP-persistence campaign to exposed agent
// dashboards. Rather than open a port, the agent pushes a heartbeat outward and
// this page reads it through the same authenticated admin surface as the rest.
//
// It leads with LIVENESS, not correctness. On 2026-08-13 the disk filled and
// ingestion stopped for eight hours while every data-quality check stayed
// green, so "is it current" sits above "is it right".

const TONE: Record<string, string> = {
  pass: "#34d399", ok: "#34d399",
  warn: "#fbbf24",
  fail: "#f87171", error: "#f87171",
}

function Dot({ status }: { status: string }) {
  return (
    <span style={{
      width: 8, height: 8, borderRadius: 999, flexShrink: 0,
      background: TONE[status?.toLowerCase()] ?? "#5b6b8c",
      display: "inline-block",
    }} />
  )
}

function Panel({ icon: Icon, title, sub, children }: {
  icon: typeof Bot; title: string; sub: string; children: React.ReactNode
}) {
  return (
    <section style={{ background: "var(--color-surface)", border: "1px solid var(--color-border-ui)", borderRadius: 12, padding: 18, marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
        <Icon size={15} color="#34C759" />
        <h2 style={{ fontSize: 14.5, fontWeight: 700, color: "#eef1f7" }}>{title}</h2>
      </div>
      <p style={{ fontSize: 11.5, color: "#5b6b8c", marginBottom: 12 }}>{sub}</p>
      {children}
    </section>
  )
}

export default function OpsPage() {
  return (
    <AppShell>
      <OpsDashboard />
    </AppShell>
  )
}

function OpsDashboard() {
  const [data, setData] = useState<OpsStatus | null>(null)
  const [err, setErr] = useState("")

  useEffect(() => {
    const load = () => getOps().then(setData).catch(e => setErr(e instanceof Error ? e.message : "Failed to load"))
    load()
    const t = setInterval(load, 60_000)
    return () => clearInterval(t)
  }, [])

  // Only the Vinted scrapers run every 30 minutes. google_trends runs DAILY at
  // 06:00 and is documented as rate-limited and non-fatal, so a 3-hour rule
  // would paint it red every single day — which is how an operator learns to
  // ignore the banner, at which point the banner is worse than nothing.
  const stale = (data?.scrapers ?? []).filter(s => s.platform.startsWith("vinted") && s.hours_ago >= 3)

  return (
      <div style={{ maxWidth: 900 }}>
        <AdminNav />
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
          <Activity size={18} color="#34C759" />
          <h1 style={{ fontSize: 21, fontWeight: 700, color: "#eef1f7" }}>Operations</h1>
        </div>
        <p style={{ color: "#8b99b8", fontSize: 13, marginBottom: 18 }}>
          Is everything actually running. Refreshes every minute.
        </p>

        {err && <div style={{ color: "#f87171", fontSize: 13, marginBottom: 14 }}>{err}</div>}
        {!data && !err && <div style={{ color: "#5b6b8c", fontSize: 13 }}>Loading…</div>}

        {data && (
          <>
            {stale.length > 0 && (
              <div style={{ background: "#1c1214", border: "1px solid #f8717155", borderRadius: 10, padding: "12px 14px", marginBottom: 16, fontSize: 13, color: "#f87171" }}>
                Ingestion stalled: {stale.map(s => `${s.platform} (${s.hours_ago}h)`).join(", ")}
              </div>
            )}

            <Panel icon={Database} title="Ingestion" sub="Vinted runs every 30 minutes; over 3 hours means stopped. Trends runs daily and is non-fatal.">
              {data.scrapers.length === 0 && <div style={{ color: "#5b6b8c", fontSize: 13 }}>No scraper runs recorded.</div>}
              {data.scrapers.map(s => (
                <div key={s.platform} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderTop: "1px solid var(--color-border-ui)", fontSize: 13 }}>
                  <Dot status={s.platform.startsWith("vinted") && s.hours_ago >= 3 ? "fail" : "pass"} />
                  <span style={{ color: "#eef1f7", minWidth: 110 }}>{s.platform}</span>
                  <span style={{ color: "#8b99b8", flex: 1 }}>{s.hours_ago}h ago</span>
                  <span style={{ color: "#5b6b8c", fontVariantNumeric: "tabular-nums" }}>
                    +{(s.items_new ?? 0).toLocaleString()} new{s.errors ? ` · ${s.errors} err` : ""}
                  </span>
                </div>
              ))}
            </Panel>

            <Panel icon={HeartPulse} title="Health checks" sub={`Overall: ${data.health.overall ?? "unknown"}`}>
              {data.health.checks.length === 0 && <div style={{ color: "#5b6b8c", fontSize: 13 }}>No checks reported.</div>}
              {data.health.checks.map(c => (
                <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderTop: "1px solid var(--color-border-ui)", fontSize: 13 }}>
                  <Dot status={c.status} />
                  <span style={{ color: "#eef1f7", minWidth: 190 }}>{c.name}</span>
                  <span style={{ color: "#8b99b8" }}>{c.detail}</span>
                </div>
              ))}
            </Panel>

            <Panel icon={Bot} title="Agents" sub="Hermes pushes status out. Nothing listens inbound and no port is open.">
              {data.agents.length === 0 && (
                <div style={{ color: "#5b6b8c", fontSize: 13, lineHeight: 1.6 }}>
                  No heartbeats yet. Hermes reports here once its heartbeat cron is registered;
                  until then its output goes to Telegram only.
                </div>
              )}
              {data.agents.map((a, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderTop: "1px solid var(--color-border-ui)", fontSize: 13 }}>
                  <Dot status={a.status} />
                  <span style={{ color: "#eef1f7", minWidth: 90 }}>{a.agent}</span>
                  <span style={{ color: "#8b99b8", minWidth: 130 }}>{a.job ?? "—"}</span>
                  <span style={{ color: "#5b6b8c", flex: 1 }}>{a.detail ?? ""}</span>
                  <span style={{ color: "#3f4a63", fontSize: 11 }}>{a.reported_at}</span>
                </div>
              ))}
            </Panel>
          </>
        )}
      </div>
  )
}
