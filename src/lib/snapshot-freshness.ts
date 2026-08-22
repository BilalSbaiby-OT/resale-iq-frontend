/** Time helpers for snapshot stamps. No Node fs — safe in any bundle. */

/** `2026-08-21 09:30 UTC`, or null when the snapshot carries no timestamp. */
export function utcStamp(updatedAt?: string): string | null {
  if (!updatedAt) return null
  const d = new Date(updatedAt)
  if (Number.isNaN(d.getTime())) return null
  return `${d.toISOString().slice(0, 16).replace("T", " ")} UTC`
}

/** Hours since `updatedAt`, or null if the stamp is missing/unparseable. */
export function hoursSince(updatedAt?: string | null): number | null {
  if (!updatedAt) return null
  const d = new Date(updatedAt)
  if (Number.isNaN(d.getTime())) return null
  return (Date.now() - d.getTime()) / 3_600_000
}

/** True when the scrape behind these figures is older than `hours` (P0-8). */
export function scrapeIsStale(updatedAt?: string | null, hours = 2): boolean {
  const h = hoursSince(updatedAt)
  return h != null && h > hours
}
