import Link from "next/link"
import { Lock } from "lucide-react"
import { BRANDS } from "@/lib/seo-categories"

/**
 * The hero proof panel — REAL numbers, read live.
 *
 * WHAT THIS REPLACED, AND WHY IT MATTERED
 * The old panel was captioned "What every search looks like" and showed
 * invented values behind a CSS blur: "Adidas Samba OG · Buy below €37 · sells
 * ~€55 · 41% sell-through/wk · sizes 38,39,40". Nothing sourced any of it. On a
 * site whose entire pitch is "our numbers are real, here is the formula", a
 * fabricated hero is the single most damaging thing on the page — it is the
 * first thing a sceptical reseller would try to verify.
 *
 * EXPOSURE RULE THAT SHAPES THIS COMPONENT
 * Per-model buy-below prices, sell-through and size velocity are the paid
 * product and must never be published. So the panel shows real BRAND-level
 * aggregates, which are public by policy (same data as /data and the public
 * snapshot), and is explicit that the per-model numbers are the paid layer.
 * That is a stronger proof anyway: a verifiable public number beats an
 * unverifiable private one.
 *
 * Never put real paid values behind a blur to make this look richer — a CSS
 * filter ships them to the DOM.
 */

interface SnapBrand {
  brand: string
  sold_7d: number
  avg_price_eur: number
  categories?: { category: string; sold_7d: number }[]
}

async function getSnapshot(): Promise<SnapBrand[]> {
  const base = process.env.BACKEND_URL || "http://localhost:8080"
  try {
    const r = await fetch(`${base}/api/public/market-snapshot`, { next: { revalidate: 900 } })
    if (!r.ok) return []
    return (await r.json()).brands ?? []
  } catch { return [] }
}

export async function LiveMarketProof() {
  const snap = await getSnapshot()

  // Fall back to the build-time export if the snapshot is unreachable, so the
  // hero never renders empty — but everything shown is still real data.
  const rows = (snap.length ? snap : BRANDS)
    .map((b) => {
      const top = b.categories?.[0]
      return top
        ? { brand: b.brand, category: top.category, sold: top.sold_7d, avg: b.avg_price_eur }
        : null
    })
    .filter((x): x is { brand: string; category: string; sold: number; avg: number } => !!x)
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 3)

  if (rows.length === 0) return null

  const total = (snap.length ? snap : BRANDS).reduce((s, b) => s + (b.sold_7d || 0), 0)

  return (
    <div style={{ maxWidth: 460, margin: "40px auto 0" }}>
      <div style={{ background: "#12151d", border: "1px solid #1c2333", borderRadius: 14, padding: 18, textAlign: "left" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 13 }}>
          <span style={{ fontSize: 11, color: "#5b6b8c", textTransform: "uppercase", letterSpacing: "1px" }}>
            Selling on Vinted this week
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10.5, color: "#22c55e" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
            LIVE
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {rows.map((r) => (
            <div key={`${r.brand}-${r.category}`} style={{
              background: "#1a2030", borderRadius: 9, padding: "11px 13px",
              display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10,
            }}>
              <span style={{ fontSize: 13, color: "#eef1f7", fontWeight: 600 }}>
                {r.brand} <span style={{ color: "#8b99b8", fontWeight: 400 }}>{r.category.toLowerCase()}</span>
              </span>
              <span style={{ fontSize: 12.5, color: "#c3cde0", whiteSpace: "nowrap" }}>
                <strong style={{ color: "#22c55e" }}>{r.sold.toLocaleString()}</strong>
                <span style={{ color: "#5b6b8c" }}>/wk · avg €{r.avg}</span>
              </span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #1c2333", fontSize: 11.5, color: "#5b6b8c", lineHeight: 1.5 }}>
          {total > 0 && (
            <>Real sold-listing counts across 5 EU markets — {total.toLocaleString()} items in the last 7 days.{" "}</>
          )}
          <Link href="/methodology" style={{ color: "#8fa3c4", textDecoration: "none" }}>See how we calculate it →</Link>
        </div>
      </div>

      {/* The paid layer is DESCRIBED, never rendered and hidden. */}
      <div style={{ marginTop: 10, background: "#0f1720", border: "1px solid #1c3327", borderRadius: 12, padding: "13px 15px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
          <Lock size={12} style={{ color: "#fbbf24" }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: "#eef1f7" }}>What a plan adds, per model</span>
        </div>
        <p style={{ fontSize: 12, color: "#8b99b8", lineHeight: 1.55, margin: 0 }}>
          The most you can pay and still profit, the price it actually sells at, how fast it
          moves, and which sizes clear first — for the specific item in your hand, not the brand.
        </p>
      </div>
    </div>
  )
}
