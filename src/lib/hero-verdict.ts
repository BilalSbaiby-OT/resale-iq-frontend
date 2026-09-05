/**
 * Live demo-SKU verdict for the landing hero.
 *
 * Prefill is Nike Air Force 1 Low — production 2026-09-05: BUY / MEDIUM /
 * provisional / n=11 / buy-below €56.95. Anonymous sell-through is locked
 * (null), not 0%. Do not invent a sell-through number. Do not swap back to
 * Adidas Samba WATCH to make the card look busier.
 *
 * MUST NOT call /api/verdict on every homepage hit: that endpoint claims
 * anonymous quota, writes verdict_logs, and counts against
 * ANON_IP_DAILY_CEILING (300/day) on the frontend container IP. A 5-minute
 * Next fetch cache is 288/day — enough to crowd out real cookieless clients.
 *
 * Disk last-good + 30 min freshness: at most ~48 backend calls/day, and a
 * LIMIT_REACHED / outage still shows the last real BUY/WATCH/SKIP.
 * Cache is keyed by query so a seed change cannot serve yesterday's SKU.
 */
import { promises as fs } from "node:fs"
import os from "node:os"
import path from "node:path"

export type HeroVerdict = {
  verdict?: string
  product?: string
  category?: string
  buy_below?: number | null
  sell_avg?: number | null
  n?: number | null
  sold_7d?: number | null
  active_listings?: number | null
  confidence?: string
  confidence_note?: string
  locked?: boolean
  locked_fields?: string[]
  provisional?: boolean | null
  sell_through_rate?: string | null
}

const QUERY = "Nike Air Force 1 Low"
const MAX_AGE_MS = 30 * 60 * 1000
const CACHE_PATH =
  process.env.HERO_VERDICT_CACHE_PATH ||
  path.join(os.tmpdir(), "resaleiq-last-good-hero-verdict.json")

type Cached = { fetchedAt: number; query: string; result: HeroVerdict }

function backendUrl(): string {
  return process.env.BACKEND_URL || "http://localhost:8080"
}

function isUsable(r: HeroVerdict | null | undefined): r is HeroVerdict {
  return Boolean(
    r &&
      (r.verdict === "BUY" || r.verdict === "WATCH" || r.verdict === "SKIP") &&
      typeof r.product === "string" &&
      r.product.length > 0,
  )
}

async function readLastGood(): Promise<Cached | null> {
  try {
    const parsed = JSON.parse(await fs.readFile(CACHE_PATH, "utf8")) as Cached
    if (
      parsed &&
      typeof parsed.fetchedAt === "number" &&
      parsed.query === QUERY &&
      isUsable(parsed.result)
    ) {
      return parsed
    }
    return null
  } catch {
    // why: missing/unreadable cache is a cold start, not a homepage outage.
    return null
  }
}

async function writeLastGood(result: HeroVerdict): Promise<void> {
  try {
    await fs.writeFile(
      CACHE_PATH,
      JSON.stringify({ fetchedAt: Date.now(), query: QUERY, result }),
      "utf8",
    )
  } catch {
    // why: a cache that cannot be written must never 500 the homepage.
  }
}

export async function getHeroVerdict(): Promise<{ query: string; result: HeroVerdict | null }> {
  const cached = await readLastGood()
  if (cached && Date.now() - cached.fetchedAt < MAX_AGE_MS) {
    return { query: QUERY, result: cached.result }
  }
  try {
    const r = await fetch(`${backendUrl()}/api/verdict?q=${encodeURIComponent(QUERY)}`, {
      next: { revalidate: 1800 },
    })
    if (r.ok) {
      const result = (await r.json()) as HeroVerdict
      if (isUsable(result)) {
        await writeLastGood(result)
        return { query: QUERY, result }
      }
    }
  } catch {
    // why: homepage must still render if the analyzer is down; last-good or empty checker.
  }
  return { query: QUERY, result: cached?.result ?? null }
}
