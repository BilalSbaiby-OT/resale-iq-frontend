import Link from "next/link"
import { relatedGroups, type RelatedRef } from "@/lib/related-links"

/**
 * "Related" block rendered by EVERY programmatic page family (blog, flip brand /
 * category / model, category, buy, glossary, manual, tools, landings).
 * The link selection lives in src/lib/related-links.ts and is unit-tested for
 * distribution (>=3 inbound links per indexable page), so this stays dumb:
 * plain server-rendered <a> tags, no JS, crawlable.
 *
 * `data-related` is the hook the unit test / crawl script looks for.
 */
export function RelatedLinks({ to, tracked, title = "Related" }: { to: RelatedRef; tracked?: string; title?: string }) {
  const groups = relatedGroups(to, tracked)
  if (!groups.length) return null
  return (
    <nav aria-label={title} data-related={to.kind} style={{ marginTop: 34 }}>
      <h2 style={{ fontSize: 17, fontWeight: 700, color: "#eef1f7", margin: "0 0 12px" }}>{title}</h2>
      {groups.map((g) => (
        <div key={g.heading} style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: "#5b6b8c", marginBottom: 8, letterSpacing: "0.1px" }}>{g.heading}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {g.links.map((l) => (
              <Link key={l.href} href={l.href} style={{ color: "#8fa3c4", fontSize: 14, textDecoration: "none" }}>
                → {l.label}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </nav>
  )
}
