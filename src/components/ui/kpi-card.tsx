"use client"
import { Skeleton } from "./skeleton"

interface KpiCardProps {
  label: string; value?: string | number | null; unit?: string
  sublabel?: string; delta?: string | null; deltaType?: "up" | "down" | null
  loading?: boolean
  /** Accent color for the top hairline + label tick. Defaults to the brand green. */
  accent?: string
}

/**
 * ONE figure, its name, and its qualifier. Graphite surface lifted by a hairline
 * border + a thin accent rule along the top edge (Linear/Supabase "surface + edge"
 * elevation, not a flat borderless box — the old version read as inert). Type
 * carries the hierarchy: uppercase micro-label, 30px tabular figure, muted qualifier.
 */
export function KpiCard({ label, value, unit, sublabel, delta, deltaType, loading, accent = "var(--color-green)" }: KpiCardProps) {
  return (
    <div style={{ position: "relative", background: "var(--color-graphite-elevated)", border: "1px solid var(--color-hairline)", borderRadius: 14, padding: 20, display: "flex", flexDirection: "column", gap: 8, minHeight: 104, overflow: "hidden" }}>
      {/* Thin accent rule along the top edge — the premium "this tile means something" cue. */}
      <span aria-hidden="true" style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${accent}, transparent 75%)`, opacity: 0.7 }} />
      <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--color-graphite-muted)" }}>{label}</div>
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
