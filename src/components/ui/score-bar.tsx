"use client"

function getScoreStyle(s: number) {
  if (s >= 70) return { color: "#22c55e", bar: "#22c55e" }
  if (s >= 50) return { color: "#06b6d4", bar: "#06b6d4" }
  if (s >= 30) return { color: "#f59e0b", bar: "#f59e0b" }
  return { color: "#ef4444", bar: "#ef4444" }
}

interface ScoreBarProps { score: number | null; showNumber?: boolean; width?: number }

export function ScoreBar({ score, showNumber = true, width = 64 }: ScoreBarProps) {
  const s = Math.min(Math.max(score ?? 0, 0), 100)
  const style = getScoreStyle(s)
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {showNumber && (
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 14, fontWeight: 800, color: style.color, lineHeight: 1 }}>
          {s.toFixed(0)}
        </span>
      )}
      <div style={{ height: 3, width, borderRadius: 2, background: "#1e2535" }}>
        <div style={{ height: "100%", width: `${s}%`, borderRadius: 2, background: style.bar, transition: "width 0.4s ease" }} />
      </div>
    </div>
  )
}
