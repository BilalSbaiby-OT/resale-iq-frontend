/**
 * SSR teaser for GPTBot / PerplexityBot. /tools?q= is a client checker;
 * crawlers do not run JS, so the live BUY/WATCH/SKIP never appeared in HTML.
 * Only Adidas Samba and Nike Air Force 1 are fetched — those two still 200
 * anonymously. Anything else stays paywalled and is not rendered here.
 */
import { promises as fs } from "node:fs"
import os from "node:os"
import path from "node:path"
import type { HeroVerdict } from "@/lib/hero-verdict"

export const TEASER_QUERIES = ["Adidas Samba", "Nike Air Force 1"] as const

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

function isUsable(r: HeroVerdict | null | undefined): r is HeroVerdict {
  return Boolean(
    r &&
      (r.verdict === "BUY" || r.verdict === "WATCH" || r.verdict === "SKIP") &&
      typeof r.buy_below === "number" &&
      Number.isFinite(r.buy_below) &&
      r.buy_below > 0,
  )
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
    const r = await fetch(`${backendUrl()}/api/verdict?q=${encodeURIComponent(query)}`, {
      next: { revalidate: 1800 },
    })
    if (r.ok) {
      const result = (await r.json()) as HeroVerdict
      if (isUsable(result)) {
        await writeCache(query, result)
        return result
      }
    }
  } catch {
    // why: tools page must still render if the analyzer is down; last-good or no cite.
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
  if (typeof r.sold_7d === "number" && Number.isFinite(r.sold_7d) && r.sold_7d > 0) {
    bits.push(`Watched departures in 7 days: ${Math.round(r.sold_7d)}.`)
  }
  if (typeof r.active_listings === "number" && Number.isFinite(r.active_listings) && r.active_listings > 0) {
    bits.push(`Active listings watched: ${r.active_listings.toLocaleString("en-GB")}.`)
  }
  if (r.confidence_note && r.confidence_note.trim()) {
    bits.push(r.confidence_note.trim().replace(/\.?$/, "."))
  } else if (r.confidence) {
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
