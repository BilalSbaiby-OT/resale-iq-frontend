/**
 * The last market snapshot we successfully fetched, kept on disk.
 *
 * WHY THIS EXISTS
 * `/data` is the page we ask ChatGPT, Perplexity and Google to quote. When the
 * backend was briefly unreachable it rendered "Market data is being refreshed —
 * check back shortly." and nothing else: no table, no numbers, no timestamp.
 * A crawler that lands on that has no reason to come back, and a human reads it
 * as "this product has no data".
 *
 * Stale-but-labelled beats empty. A snapshot from two hours ago is still true
 * about two hours ago, provided the page SAYS so — which is why every read hands
 * back the snapshot's own `updated_at` rather than pretending it is current.
 *
 * WHY DISK AND NOT MEMORY
 * ISR re-renders in whatever worker is free, and the container restarts on every
 * deploy. A module-level variable is empty exactly when it is needed most — the
 * cold start straight after a deploy. A file in the container survives both.
 */
import { promises as fs } from "node:fs"
import os from "node:os"
import path from "node:path"

const CACHE_PATH =
  process.env.SNAPSHOT_CACHE_PATH ||
  path.join(os.tmpdir(), "resaleiq-last-good-snapshot.json")

/** Shape is whatever /api/public/market-snapshot returns; we only gate on brands. */
export interface CachedSnapshot {
  updated_at?: string
  brand_count?: number
  brands?: unknown[]
  markets?: string[]
  [k: string]: unknown
}

/** A snapshot is only worth keeping if it actually carries brand rows. */
export function isUsable(snap: unknown): snap is CachedSnapshot {
  return Boolean(
    snap &&
      typeof snap === "object" &&
      Array.isArray((snap as CachedSnapshot).brands) &&
      (snap as CachedSnapshot).brands!.length > 0
  )
}

/**
 * Persist a snapshot — but ONLY a usable one.
 *
 * This guard is the whole safety property. An empty or errored response
 * overwriting the cache would destroy the very thing the cache exists to
 * provide, and the page would go blank with no way back until the backend
 * recovered.
 */
export async function writeLastGood(snap: unknown): Promise<void> {
  if (!isUsable(snap)) return
  try {
    await fs.writeFile(CACHE_PATH, JSON.stringify(snap), "utf8")
  } catch {
    // A cache that cannot be written must never break the page it serves.
  }
}

/** The last usable snapshot, or null if we have never stored one. */
export async function readLastGood(): Promise<CachedSnapshot | null> {
  try {
    const parsed: unknown = JSON.parse(await fs.readFile(CACHE_PATH, "utf8"))
    return isUsable(parsed) ? parsed : null
  } catch {
    return null
  }
}

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
