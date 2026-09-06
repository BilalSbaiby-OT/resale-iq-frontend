"use client"
import { Skeleton } from "./skeleton"

interface KpiCardProps {
  label: string; value?: string | number | null; unit?: string
  sublabel?: string; delta?: string | null; deltaType?: "up" | "down" | null
  loading?: boolean
}

/**
 * ONE figure, its name, and its qualifier. Graphite card, no border — the
 * elevation IS the card. Type carries the hierarchy: 30px figure, 13px label,
 * 13px muted qualifier, which is the app type scale in globals.css rather than
 * four bespoke sizes (11 / 26 / 14 / 11) invented here.
 */
export function KpiCard({ label, value, unit, sublabel, delta, deltaType, loading }: KpiCardProps) {
  return (
    <div style={{ background: "var(--color-graphite-elevated)", borderRadius: 14, padding: 20, display: "flex", flexDirection: "column", gap: 8, minHeight: 104 }}>
      <div style={{ fontSize: 13, color: "var(--color-graphite-muted)" }}>{label}</div>
      {loading ? (
        <>
          <Skeleton width={90} height={30} />
          <Skeleton width={130} height={13} />
        </>
      ) : (
        <>
          <div style={{ fontSize: 30, fontWeight: 600, color: "var(--color-on-graphite)", lineHeight: 1.1, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.022em" }}>
            {value ?? "—"}{unit && <span style={{ fontSize: 16, fontWeight: 400, color: "var(--color-graphite-muted)", marginLeft: 4 }}>{unit}</span>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--color-graphite-muted)", marginTop: "auto" }}>
            {delta && <span style={{ color: deltaType === "up" ? "#34d399" : "#f87171" }}>{delta}</span>}
            {sublabel}
          </div>
        </>
      )}
    </div>
  )
}
