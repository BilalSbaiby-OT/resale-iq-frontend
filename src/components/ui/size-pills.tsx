"use client"

interface SizePillsProps { sizes: string[] }

export function SizePills({ sizes }: SizePillsProps) {
  if (!sizes?.length) return <span style={{ color: "#546380", fontSize: 10 }}>—</span>
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
      {sizes.slice(0, 4).map((s, i) => (
        <span key={s} style={{
          fontSize: 9, fontFamily: "'JetBrains Mono',monospace",
          padding: "2px 6px", borderRadius: 4,
          background: i === 0 ? "rgba(59,130,246,.12)" : "#1a2030",
          border: `1px solid ${i === 0 ? "rgba(59,130,246,.35)" : "#263147"}`,
          color: i === 0 ? "#60a5fa" : "#8fa3c4",
        }}>{s}</span>
      ))}
    </div>
  )
}
