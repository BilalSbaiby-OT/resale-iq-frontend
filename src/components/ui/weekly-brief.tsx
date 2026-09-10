/**
 * The dated weekly-brief block (EXP-4).
 *
 * A single, self-contained, front-loadable passage an answer engine can quote
 * whole: what actually moved on Vinted in the week to the snapshot date. Recency
 * is a top citation lever, so this block re-dates itself every time the snapshot
 * recomputes — a page that is always "this week" stays eligible to be cited.
 *
 * All numbers come from the live snapshot via buildWeeklyBrief; the DATE is the
 * snapshot's own calculation time (a real <time datetime>), never the render.
 * "Watched departures", aggregates only. Renders nothing when the brief is too
 * thin to speak honestly.
 */
import type { MarketNumbers } from "@/lib/market-numbers"
import { buildWeeklyBrief, briefSentence } from "@/lib/weekly-brief"

export function WeeklyBrief({ market }: { market: MarketNumbers }) {
  const brief = buildWeeklyBrief(market)
  if (!brief) return null

  const sentence = briefSentence(brief)

  return (
    <section
      aria-label={`Vinted resale brief for the week to ${brief.dateLabel}`}
      style={{
        marginTop: 22,
        padding: "18px 20px",
        background: "var(--color-surface)",
        border: "1px solid var(--color-border-2)",
        borderRadius: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: "#eef1f7", margin: 0, letterSpacing: "-0.2px" }}>
          Vinted resale brief — week to{" "}
          <time dateTime={brief.dateISO}>{brief.dateLabel}</time>
        </h2>
        <span style={{ fontSize: 11.5, color: brief.stale ? "#FF9F0A" : "#5b6b8c", fontFamily: "monospace" }}>
          {brief.stale ? "last-good snapshot" : "updated weekly"}
        </span>
      </div>

      {/* The citable passage. Front-loaded, self-contained, one paragraph. */}
      <p style={{ fontSize: 14.5, color: "#c3cde0", lineHeight: 1.7, margin: "10px 0 0" }}>
        {sentence}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 12, marginTop: 16 }}>
        <div style={{ background: "var(--color-bg)", border: "1px solid var(--color-border-ui)", borderRadius: 10, padding: "12px 14px" }}>
          <div style={{ fontSize: 11, color: "#5b6b8c", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Most watched departures
          </div>
          <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 5 }}>
            {brief.topMovers.map((m) => (
              <li key={m.brand} style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 13.5, color: "#a9b6d0" }}>
                <span style={{ color: "#eef1f7", fontWeight: 600 }}>{m.brand}</span>
                <span style={{ fontFamily: "monospace", fontVariantNumeric: "tabular-nums" }}>
                  {m.sold_7d.toLocaleString("en-GB")}/wk
                </span>
              </li>
            ))}
          </ol>
        </div>
        <div style={{ background: "var(--color-bg)", border: "1px solid var(--color-border-ui)", borderRadius: 10, padding: "12px 14px" }}>
          <div style={{ fontSize: 11, color: "#5b6b8c", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Highest average price at exit
          </div>
          <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 5 }}>
            {brief.priciest.map((m) => (
              <li key={m.brand} style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 13.5, color: "#a9b6d0" }}>
                <span style={{ color: "#eef1f7", fontWeight: 600 }}>{m.brand}</span>
                <span style={{ fontFamily: "monospace", fontVariantNumeric: "tabular-nums", color: "var(--color-buy)" }}>
                  €{Math.round(m.avg_price_eur as number)}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <p style={{ fontSize: 11.5, color: "#5b6b8c", marginTop: 12, lineHeight: 1.6 }}>
        Watched departures = listings we saw go from active to sold across Vinted ES, FR, DE, IT and PT
        in the trailing 7 days. Aggregates only. Free to cite with attribution to Resale IQ.
      </p>
    </section>
  )
}
