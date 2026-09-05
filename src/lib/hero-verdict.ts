/**
 * Live demo-SKU verdict for the landing hero.
 *
 * SEED: "New Balance 530". Production, read from the backend container
 * 2026-09-05 19:2xZ (the public endpoint rate-limits anon probes, so this was
 * taken from inside the API, not faked):
 *
 *   curl -s "http://127.0.0.1:8080/api/verdict?q=New%20Balance%20530"
 *   → {"verdict":"WATCH","product":"New Balance 530","category":"Sneakers",
 *      "confidence":"HIGH","confidence_note":null,"provisional":null,
 *      "n":153,"sold_7d":562,"active_listings":100695,
 *      "buy_below":26.59,"sell_avg":39.98,"sell_median":40.0}
 *
 * WHY THIS ONE, AND WHY IT IS NOT A BUY. The previous seed was Air Force 1
 * Low: BUY, but `provisional: true`, MEDIUM, n=11 against 1,168 active
 * listings — a conviction word resting on eleven comparables. External review
 * called that thin-inventory noise wearing a badge, and the catalogue agrees.
 *
 * The board was enumerated rather than probed (100 `model_signals` rows,
 * read-only against production):
 *
 *  - FULL (non-provisional) BUY — `str_pct` present AND opportunity_score ≥ 65
 *    AND momentum HOT/RISING: **0 rows**. The highest opportunity_score among
 *    all 24 rows that have a sell-through at all is Balenciaga Track at 57.5.
 *    No honest non-provisional BUY exists today, at any n.
 *    NOTE this is NOT the old product-wide sell-through hold: `app_meta
 *    .str_discovery_rate` read 0.73 at 19:01:41Z, far under the 20% ceiling,
 *    so the hold is OFF and the zero is real, not an artefact.
 *  - PROVISIONAL BUY — 13 rows, and every one of them is thin: comparable_n
 *    runs 3…13. Air Force 1 Low at 11 was already the second best-covered BUY
 *    in the entire catalogue. The best, Gucci Dionysus (n=13), is a €657
 *    handbag no Vinted flipper can source. There is no well-covered BUY to
 *    swap to; the honest options were a thin BUY or a well-covered WATCH.
 *
 * So the hero shows the best-evidenced row the company owns instead of the
 * most flattering word: n=153 comparables (the highest on the board, next is
 * 97), 562 departures in 7 days, data_quality 80 → HIGH confidence with NO
 * "only N" caveat and NO provisional flag, and a coherent €26.59 buy-below
 * against a €39.98 market on a mass-market sneaker in the exact price band a
 * Vinted flipper works in. It is also already an independently-verified
 * known-good query (WORKING_MODELS, TRY_EXAMPLES).
 *
 * A WATCH converts worse than a BUY and that trade was made deliberately.
 * Re-seeding to a BUY is only legitimate if the DATA changes — re-run the
 * enumeration above, do not re-run the probe until a query says something
 * nicer. NEVER fake one to make the hero look hotter: the seed is whatever
 * the API actually answers, and if this stops being a WATCH the hero shows
 * what it became.
 *
 * Anonymous sell-through is locked (null), not 0%. Do not invent a
 * sell-through number.
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

const QUERY = "New Balance 530" // live WATCH/HIGH/n=153, not provisional — see header
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

/** D-28: comparable_n must not ride the homepage RSC payload. Display XOR
 *  already dropped it from the card; this omits the field from initialResult
 *  only. /api/verdict is untouched — this helper never serves that route. */
function withoutComparableN(r: HeroVerdict): HeroVerdict {
  const { n: _omit, ...rest } = r
  return rest
}

export async function getHeroVerdict(): Promise<{ query: string; result: HeroVerdict | null }> {
  const cached = await readLastGood()
  if (cached && Date.now() - cached.fetchedAt < MAX_AGE_MS) {
    return { query: QUERY, result: withoutComparableN(cached.result) }
  }
  try {
    const r = await fetch(`${backendUrl()}/api/verdict?q=${encodeURIComponent(QUERY)}`, {
      next: { revalidate: 1800 },
    })
    if (r.ok) {
      const result = (await r.json()) as HeroVerdict
      if (isUsable(result)) {
        await writeLastGood(result)
        return { query: QUERY, result: withoutComparableN(result) }
      }
    }
  } catch {
    // why: homepage must still render if the analyzer is down; last-good or empty checker.
  }
  return { query: QUERY, result: cached?.result ? withoutComparableN(cached.result) : null }
}
