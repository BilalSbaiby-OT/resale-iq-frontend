/**
 * SSR fetch for the public buy list (landing page hero teaser).
 *
 * Used by app/page.tsx and app/[locale]/page.tsx to pass first-render
 * data into LandingContent so the buy list is present in the initial HTML
 * (crawler-visible, no JS required, no client flash).
 *
 * Rules inherited from hero-verdict.ts:
 *  - Last-good disk cache (30 min TTL) — at most ~48 calls/day.
 *  - Outage / empty result → null (caller renders HomeBuyList client-only fallback).
 *  - Never fabricate rows.
 */
import { promises as fs } from "node:fs"
import os from "node:os"
import path from "node:path"

export interface SsrBuyListItem {
  brand: string
  model: string | null
  category: string
  verdict: string
  sold_7d: number | null
  sold_30d_evidence: number | null
  avg_price_eur: number | null
  locked: boolean
}

interface Cached { fetchedAt: number; items: SsrBuyListItem[] }

const MAX_AGE_MS = 30 * 60 * 1000
const CACHE_PATH =
  process.env.BUY_LIST_CACHE_PATH ||
  path.join(os.tmpdir(), "resaleiq-public-buy-list.json")

function backendUrl(): string {
  return process.env.BACKEND_URL || "http://localhost:8080"
}

async function readCache(): Promise<Cached | null> {
  try {
    const parsed = JSON.parse(await fs.readFile(CACHE_PATH, "utf8")) as Cached
    if (parsed && typeof parsed.fetchedAt === "number" && Array.isArray(parsed.items) && parsed.items.length > 0) {
      return parsed
    }
  } catch { /* cold start */ }
  return null
}

async function writeCache(items: SsrBuyListItem[]): Promise<void> {
  try {
    await fs.writeFile(CACHE_PATH, JSON.stringify({ fetchedAt: Date.now(), items }), "utf8")
  } catch { /* never 500 the homepage */ }
}

function shape(raw: Record<string, unknown>): SsrBuyListItem | null {
  if (typeof raw.brand !== "string" || typeof raw.category !== "string") return null
  return {
    brand: raw.brand,
    model: typeof raw.model === "string" ? raw.model : null,
    category: raw.category,
    verdict: typeof raw.verdict === "string" ? raw.verdict : "",
    sold_7d: typeof raw.sold_7d === "number" && Number.isFinite(raw.sold_7d) ? raw.sold_7d : null,
    sold_30d_evidence: typeof raw.sold_30d_evidence === "number" && Number.isFinite(raw.sold_30d_evidence) ? raw.sold_30d_evidence : null,
    avg_price_eur: typeof raw.avg_price_eur === "number" && Number.isFinite(raw.avg_price_eur) && raw.avg_price_eur > 0
      ? raw.avg_price_eur : null,
    locked: raw.locked === true,
  }
}

export async function getPublicBuyList(limit = 5): Promise<SsrBuyListItem[] | null> {
  const cached = await readCache()
  if (cached && Date.now() - cached.fetchedAt < MAX_AGE_MS) {
    return cached.items.slice(0, limit)
  }
  try {
    const r = await fetch(`${backendUrl()}/api/public/buy-list?limit=${limit + 1}`, {
      next: { revalidate: 1800 },
    })
    if (r.ok) {
      const json = await r.json() as { items?: unknown[] }
      const items = (json.items ?? [])
        .map(x => shape(x as Record<string, unknown>))
        .filter((x): x is SsrBuyListItem => x !== null)
        .slice(0, limit)
      if (items.length > 0) {
        await writeCache(items)
        return items
      }
      // why: 0 shapeable rows on an ok response means the teaser will vanish —
      // log so a future shape() regression surfaces in server logs, not a curl.
      console.error("[ssr-buy-list] FATAL: 0 shapeable rows from buy-list API — homepage buy list EMPTY")
    } else {
      // why: non-ok means SSR fetch failed; log so the outage is visible.
      console.error(`[ssr-buy-list] FATAL: buy-list fetch HTTP ${r.status} — homepage buy list EMPTY`)
    }
  } catch (err) {
    // why: log before falling back to cache so a misconfigured BACKEND_URL or
    // backend outage shows up in server logs instead of silently serving stale.
    console.error("[ssr-buy-list] FATAL: buy-list fetch threw — homepage buy list may be stale or EMPTY", err instanceof Error ? err.message : String(err))
  }
  return cached ? cached.items.slice(0, limit) : null
}
