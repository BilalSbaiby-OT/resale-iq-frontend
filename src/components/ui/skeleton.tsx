"use client"

export function Skeleton({ width = "100%", height = 14, radius = 6, style = {} }: {
  width?: number | string; height?: number; radius?: number; style?: React.CSSProperties
}) {
  return <div className="skeleton" style={{ width, height, borderRadius: radius, ...style }} />
}

export function SkeletonRows({ rows = 5, height = 40 }: { rows?: number; height?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 14 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} height={height} radius={8} />
      ))}
    </div>
  )
}
