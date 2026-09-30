/**
 * Sitemap lastmod must be derived from real content/data dates — never a
 * hardcoded constant for a hub (stale-hub-lastmod trap: hub never re-fetched,
 * children stay orphaned).
 */
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { test } from "node:test"
import assert from "node:assert/strict"
import { blogHubDate, manualHubDate, buyDataDate, maxDay } from "./sitemap-dates.ts"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const sitemap = readFileSync(join(root, "app/sitemap.ts"), "utf8")
const FALLBACK = new Date("2026-01-01T00:00:00Z")

test("blog hub date = newest updated ?? date of indexable posts, and moves when a post is added", () => {
  const posts = [
    { date: "2026-09-01" },
    { date: "2026-08-01", updated: "2026-09-10" },
    { date: "2026-09-30", noindex: true },
  ]
  assert.equal(blogHubDate(posts, FALLBACK).toISOString(), "2026-09-10T00:00:00.000Z")
  assert.equal(blogHubDate([...posts, { date: "2026-09-20" }], FALLBACK).toISOString(), "2026-09-20T00:00:00.000Z")
})

test("manual hub + buy hub dates derive from their data", () => {
  assert.equal(manualHubDate([{ updated: "2026-09-12" }, { updated: "2026-09-20" }, {}], FALLBACK).toISOString(), "2026-09-20T00:00:00.000Z")
  assert.equal(buyDataDate("2026-09-22", FALLBACK).toISOString(), "2026-09-22T00:00:00.000Z")
  assert.equal(maxDay([], FALLBACK).toISOString(), FALLBACK.toISOString())
})

test("sitemap.ts wires hub dates through the derivations, not literals", () => {
  assert.match(sitemap, /blogHubDate\(POSTS/)
  assert.match(sitemap, /manualHubDate\(ALL_CHAPTERS/)
  assert.match(sitemap, /buyDataDate\(BUY_DATA\.generated_at/)
  assert.doesNotMatch(sitemap, /MANUAL_HUB_DATE\s*=\s*new Date\(/, "/manual hub lastmod is a hardcoded constant")
  assert.doesNotMatch(sitemap, /BUY_DATE\s*=\s*new Date\(/, "/buy lastmod is a hardcoded constant")
  // data-driven hubs carry the snapshot day
  assert.match(sitemap, /dataDrivenHubs = new Set\(\[[^\]]*"\/data"[^\]]*"\/flip"[^\]]*"\/category"/)
})
