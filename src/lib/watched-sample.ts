/** Client-safe. Do not import market-numbers here — that module pulls node:fs
 *  for the last-good snapshot and will blow a Turbopack client build. */

function fmt(n: number): string {
  return n.toLocaleString("en-GB")
}

/** Honest sample line for a BUY/WATCH/SKIP that already has watched counts.
 *  SKIP without this reads as “this model does not sell”. The counts are
 *  our watched listings, not the whole market. */
export function watchedSampleNote(
  sold: number | null | undefined,
  listed: number | null | undefined,
  verdict?: string,
): string | null {
  if (sold == null || listed == null) return null
  if (!Number.isFinite(sold) || !Number.isFinite(listed)) return null
  const head = `In the listings we watched, ${fmt(sold)} left the shelf vs ${fmt(listed)} still listed`
  if (verdict === "SKIP") {
    return `${head} — that is a supply glut in our sample, not a claim this model never sells.`
  }
  return `${head}.`
}
