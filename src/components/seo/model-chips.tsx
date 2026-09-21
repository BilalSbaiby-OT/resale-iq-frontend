import Link from "next/link"
import { modelPath, type SeoModel } from "@/lib/seo-models"

export function ModelChips({
  models,
  showFreeMark = false,
}: {
  models: SeoModel[]
  showFreeMark?: boolean
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
      {models.map((m) => (
        <Link
          key={modelPath(m)}
          href={modelPath(m)}
          style={{
            fontSize: 13,
            color: "#a9b6d0",
            textDecoration: "none",
            background: "var(--color-surface)",
            border: "1px solid var(--color-border-ui)",
            borderRadius: 8,
            padding: "7px 12px",
          }}
        >
          {m.query}{showFreeMark && m.freeCheck ? " · free" : ""}
        </Link>
      ))}
    </div>
  )
}
