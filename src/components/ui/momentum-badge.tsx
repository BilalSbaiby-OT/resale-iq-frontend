"use client"

const MOMENTUM: Record<string, { dot: string; text: string; bg: string; border: string }> = {
  HOT:    { dot: "#ef4444", text: "#fca5a5", bg: "rgba(239,68,68,.08)",   border: "rgba(239,68,68,.25)" },
  RISING: { dot: "#f59e0b", text: "#fcd34d", bg: "rgba(245,158,11,.08)",  border: "rgba(245,158,11,.25)" },
  STABLE: { dot: "#3b82f6", text: "#93c5fd", bg: "rgba(59,130,246,.08)",  border: "rgba(59,130,246,.25)" },
  FADING: { dot: "#64748b", text: "#94a3b8", bg: "rgba(100,116,139,.08)", border: "rgba(100,116,139,.25)" },
  DEAD:   { dot: "#4b5563", text: "#6b7280", bg: "rgba(75,85,99,.08)",    border: "rgba(75,85,99,.25)" },
}

interface MomentumBadgeProps { momentum: string | null; size?: "sm" | "md" }

export function MomentumBadge({ momentum, size = "sm" }: MomentumBadgeProps) {
  if (!momentum) return null
  const m = MOMENTUM[momentum] ?? MOMENTUM.STABLE
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: size === "sm" ? "2px 8px" : "3px 10px",
      borderRadius: 5, border: `1px solid ${m.border}`, background: m.bg,
      fontSize: size === "sm" ? 10 : 11, fontWeight: 600, letterSpacing: "0.4px",
      color: m.text, whiteSpace: "nowrap", fontFamily: "var(--font-sans)",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: m.dot, flexShrink: 0 }} />
      {momentum}
    </span>
  )
}
