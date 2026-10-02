/**
 * SSR teaser for GPTBot / PerplexityBot. /tools?q= is a client checker;
 * crawlers do not run JS, so the live BUY/WATCH/SKIP never appeared in HTML.
 * Adidas Samba, Nike Air Force 1 and Fred Perry Polo are fetched — those
 * three still 200 anonymously with a real priced verdict. Anything else
 * stays paywalled and is not rendered here.
 */
import { promises as fs } from "node:fs"
import os from "node:os"
import path from "node:path"
import { fetchBounded, type HeroVerdict } from "./hero-verdict.ts"
import { isUsableVerdict as isUsable } from "./usable-verdict.ts"
import { FREE_SAMPLES } from "./free-samples.ts"

// The teasers ARE the free samples (one list, ./free-samples.ts): anything
// else is paywalled and must not be rendered for crawlers.
export const TEASER_QUERIES = FREE_SAMPLES

const MAX_AGE_MS = 30 * 60 * 1000
const CACHE_DIR =
  process.env.TEASER_VERDICT_CACHE_DIR ||
  path.join(os.tmpdir(), "resaleiq-teaser-verdict")

function backendUrl(): string {
  return process.env.BACKEND_URL || "http://localhost:8080"
}

export function matchTeaserQuery(q: string | undefined | null): string | null {
  if (!q) return null
  const n = q.trim().replace(/\s+/g, " ").toLowerCase()
  for (const t of TEASER_QUERIES) {
    if (t.toLowerCase() === n) return t
  }
  return null
}

function cachePath(query: string): string {
  return path.join(CACHE_DIR, query.replace(/\s+/g, "-").toLowerCase() + ".json")
}

type Cached = { fetchedAt: number; result: HeroVerdict }

async function readCache(query: string): Promise<Cached | null> {
  try {
    const parsed = JSON.parse(await fs.readFile(cachePath(query), "utf8")) as Cached
    if (parsed && typeof parsed.fetchedAt === "number" && isUsable(parsed.result)) {
      return parsed
    }
  } catch {
    // why: missing cache is a cold start, not a tools-page outage.
  }
  return null
}

async function writeCache(query: string, result: HeroVerdict): Promise<void> {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true })
    await fs.writeFile(
      cachePath(query),
      JSON.stringify({ fetchedAt: Date.now(), result }),
      "utf8",
    )
  } catch {
    // why: a cache that cannot be written must never 500 the tools page.
  }
}

export async function getTeaserVerdict(q: string | undefined | null): Promise<HeroVerdict | null> {
  const query = matchTeaserQuery(q)
  if (!query) return null
  const cached = await readCache(query)
  if (cached && Date.now() - cached.fetchedAt < MAX_AGE_MS) return cached.result
  try {
    const r = await fetchBounded(`${backendUrl()}/api/verdict?q=${encodeURIComponent(query)}`)
    if (r.ok) {
      const result = (await r.json()) as HeroVerdict
      if (isUsable(result)) {
        await writeCache(query, result)
        return result
      }
    }
  } catch {
    // why: tools page must still render if the analyzer is down or the fetch aborts; last-good or no cite.
  }
  return cached?.result ?? null
}

function eur(n: number): string {
  return `€${n.toFixed(2)}`
}

/** Same rounding as the public checker (`Math.round`) so hero and result match. */
function eurWhole(n: number): string {
  return `€${Math.round(n)}`
}

function words(s: string): string[] {
  return s.trim().split(/\s+/).filter(Boolean)
}

const TAIL =
  "The buy-below is the average price at departure × 0.70, which targets a 30% margin. " +
  "Tracked markets are Spain, France, Germany, Italy and Portugal — not the UK. " +
  "These figures are listings we watched leave the shelf, not sale receipts we did not see. " +
  "Demand is treated as the same trend unless the numbers split. " +
  "You already have suppliers; the job is which clothing model to buy at this price to resell. " +
  "Other models need Starter at €19 a month. Weekly brand volumes stay public on /data. " +
  "Cancel anytime after you pay. Check the next model on this page."

/** First-fold homepage line for GPTBot. Null if no live number. Keep short. */
export function formatHomeCite(query: string, r: HeroVerdict | null): string | null {
  if (!isUsable(r)) return null
  const product = (r.product && r.product.trim()) || query
  return (
    `${product} is ${r.verdict}. Do not pay more than ${eurWhole(r.buy_below as number)} ` +
    `if you buy it to resell. Check it free on /tools — other models are €19 a month.`
  )
}

/** 134–167 word self-contained answer for AI crawlers. Null if no live number. */
export function formatTeaserCite(query: string, r: HeroVerdict | null): string | null {
  if (!isUsable(r)) return null
  const product = (r.product && r.product.trim()) || query
  const bits: string[] = [
    `Should I buy ${product} to resell in 2026? ${r.verdict}.`,
    `The most to pay after fees is ${eur(r.buy_below as number)}.`,
  ]
  if (typeof r.sell_avg === "number" && Number.isFinite(r.sell_avg) && r.sell_avg > 0) {
    let avg = `The watched-departure average is ${eur(r.sell_avg)}`
    const median = (r as HeroVerdict & { sell_median?: number }).sell_median
    if (typeof median === "number" && Number.isFinite(median) && median > 0) {
      avg += ` (median ${eur(median)})`
    }
    bits.push(avg + ".")
  }
  // No per-item departure or active-listing count in the cite (founder decision
  // 2026-10-02). The confidence band is kept; the backend's confidence_note is
  // not, because it quotes the count ("Only 20 watched departures").
  if (r.confidence) {
    bits.push(`Confidence ${r.confidence}.`)
  }
  let text = `${bits.join(" ")} ${TAIL}`
  let w = words(text)
  if (w.length > 167) text = w.slice(0, 167).join(" ")
  w = words(text)
  if (w.length < 134) {
    text =
      text +
      " A WATCH is not a skip and not a buy: pay under the buy-below or walk away."
    w = words(text)
    if (w.length > 167) text = w.slice(0, 167).join(" ")
  }
  const n = words(text).length
  if (n < 134 || n > 167) return text
  return text
}
