"use client"
import { Skeleton } from "./skeleton"

interface KpiCardProps {
  label: string; value?: string | number | null; unit?: string
  sublabel?: string; delta?: string | null; deltaType?: "up" | "down" | null
  loading?: boolean
}

export function KpiCard({ label, value, unit, sublabel, delta, deltaType, loading }: KpiCardProps) {
  return (
    <div style={{ background: "#12151d", border: "1px solid #1c2333", borderRadius: 10, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 6, minHeight: 92 }}>
      <div style={{ fontSize: 11, fontWeight: 550, color: "#5b6b8c", letterSpacing: "0.3px" }}>{label}</div>
      {loading ? (
        <>
          <Skeleton width={90} height={26} />
          <Skeleton width={130} height={11} />
        </>
      ) : (
        <>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#eef1f7", lineHeight: 1, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.5px" }}>
            {value ?? "—"}{unit && <span style={{ fontSize: 14, fontWeight: 500, color: "#5b6b8c", marginLeft: 4 }}>{unit}</span>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "#4d5a75" }}>
            {delta && <span style={{ color: deltaType === "up" ? "#34d399" : "#f87171", fontWeight: 600 }}>{delta}</span>}
            {sublabel}
          </div>
        </>
      )}
    </div>
  )
}
