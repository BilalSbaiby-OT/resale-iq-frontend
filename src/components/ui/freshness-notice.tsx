/**
 * P0-8 — if the scrape behind these figures is >2h old, say so, and still
 * show the numbers. Stale-but-labelled beats empty; unlabelled-stale is a lie.
 *
 * Reuses utcStamp() from last-good-snapshot and the same role="status" pattern
 * as MomentumWarmupNotice. Renders nothing when the stamp is fresh.
 */
import { scrapeIsStale } from "@/lib/snapshot-freshness"

export function FreshnessNotice({
  stamp,
  updatedAt,
  stale,
}: {
  stamp: string | null
  updatedAt?: string | null
  stale?: boolean
}) {
  const old = scrapeIsStale(updatedAt)
  if (!stale && !old) return null

  return (
    <p
      role="status"
      style={{
        fontSize: 12.5,
        lineHeight: 1.6,
        color: "#FF9F0A",
        marginTop: 12,
        padding: "9px 12px",
        background: "rgba(251,191,36,.07)",
        border: "1px solid rgba(251,191,36,.28)",
        borderRadius: 9,
      }}
    >
      {stale ? (
        <>
          Live feed unavailable right now — showing the last complete snapshot
          {stamp ? <> from <strong>{stamp}</strong></> : null}. The figures below are real, just not current.
        </>
      ) : (
        <>
          These figures were last computed {stamp ? <strong>{stamp}</strong> : "more than 2 hours ago"}.
          {" "}They are still real measurements — the scrape is just behind.
        </>
      )}
    </p>
  )
}
