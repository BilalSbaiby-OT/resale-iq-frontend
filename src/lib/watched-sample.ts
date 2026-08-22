import { fmtCount } from "@/lib/market-numbers"

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
  const head = `In the listings we watched, ${fmtCount(sold)} sold vs ${fmtCount(listed)} still listed`
  if (verdict === "SKIP") {
    return `${head} — that is a supply glut in our sample, not a claim this model never sells.`
  }
  return `${head}.`
}
