/**
 * BlogProofStrip — live product proof at the TOP of every blog post.
 *
 * WHY THIS EXISTS (measured 2026-09-22):
 * ChatGPT is our #1 external referrer and it lands people on blog price guides
 * (/blog/nike-sneakers-price-guide-eu-vinted, tommy-hilfiger-hoodie-..., etc).
 * Those pages had ZERO forms, ZERO inputs and ZERO way to get an answer — the
 * only CTA was a link at the BOTTOM of an 11-minute read. Funnel truth for the
 * last 24h: 46 human visitors, 1 verdict_seen. The single highest-traffic entry
 * point into the company was a dead end.
 *
 * This renders real, current buy-list rows (same data as the homepage) directly
 * under the H1, so a visitor arriving from an AI answer sees the product
 * working within one screen instead of scrolling 11 minutes to find a link.
 *
 * Rules honoured:
 *  - Only UNLOCKED rows are shown; nothing paywalled leaks.
 *  - Figures come from the live API, never hardcoded — no number here can go
 *    stale or contradict the page it sits on.
 *  - Renders nothing at all if the API gives us nothing (never an empty box).
 *  - No price shown: proof before price, same rule as the homepage.
 */
import Link from "next/link"
import type { SsrBuyListItem } from "@/lib/ssr-buy-list"

const VERDICT_COLOR: Record<string, string> = {
  "STRONG BUY": "#30D158",
  BUY: "#30D158",
  RISING: "#30D158",
  WATCH: "#FFD60A",
  SKIP: "#FF453A",
}

export function BlogProofStrip({
  items,
  ctaHref,
  ctaLabel = "Check any item now →",
}: {
  items: SsrBuyListItem[] | null
  /** Where the CTA sends them — the post's own preflight query when it has one. */
  ctaHref: string
  /** Override when the strip sits under a checker ("Check any item free" would
   *  point at the input directly above it, which reads as broken). */
  ctaLabel?: string
}) {
  if (!items || items.length === 0) return null

  // Unlocked rows only, and only ones carrying a real demand figure: this strip
  // exists to prove the data is real, so a row without evidence defeats it.
  const rows = items
    .filter(i => !i.locked && i.sold_30d_evidence != null && i.avg_price_eur != null)
    .slice(0, 3)

  if (rows.length === 0) return null

  return (
    <aside
      data-testid="riq-blog-proof-strip"
      style={{
        border: "1px solid rgba(48,209,88,.25)",
        background: "rgba(48,209,88,.05)",
        borderRadius: 12,
        padding: "14px 16px",
        marginBottom: 26,
      }}
    >
      <p style={{ fontSize: 13, fontWeight: 700, color: "#EEF1F7", margin: "0 0 2px" }}>
        Live right now — what our data says to buy
      </p>
      <p style={{ fontSize: 11.5, color: "#8FA3C4", margin: "0 0 10px" }}>
        Updated from tracked Vinted EU sales. Not an example — this is today&rsquo;s list.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {rows.map((it, i) => {
          const color = VERDICT_COLOR[it.verdict] ?? "#8FA3C4"
          // Canonical buy-below formula: avg × 0.95 × 0.70 = avg × 0.665.
          const buyBelow = Math.round((it.avg_price_eur as number) * 0.665)
          return (
            <div
              key={`${it.brand}-${it.model ?? i}`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                fontSize: 13,
              }}
            >
              <span style={{ color: "#EEF1F7", fontWeight: 600, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {it.brand}{it.model ? ` ${it.model}` : ""}
                <span style={{ color: "#8FA3C4", fontWeight: 400 }}>
                  {" · "}{(it.sold_30d_evidence as number).toLocaleString()} departed/30 days
                </span>
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <span style={{ color, fontWeight: 700, fontSize: 11 }}>{it.verdict}</span>
                <span style={{ color: "#30D158", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                  Buy below €{buyBelow}
                </span>
              </span>
            </div>
          )
        })}
      </div>

      <Link
        href={ctaHref}
        style={{
          display: "inline-block",
          marginTop: 12,
          background: "#34C759",
          color: "#06090c",
          fontWeight: 700,
          fontSize: 13,
          padding: "9px 16px",
          borderRadius: 8,
          textDecoration: "none",
        }}
      >
        {ctaLabel}
      </Link>
    </aside>
  )
}
