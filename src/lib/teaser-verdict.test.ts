import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import {
  formatTeaserCite,
  matchTeaserQuery,
  TEASER_QUERIES,
} from "./teaser-verdict.ts"
import type { HeroVerdict } from "./hero-verdict.ts"

const samba: HeroVerdict & { sell_median?: number } = {
  verdict: "WATCH",
  product: "Adidas Samba",
  buy_below: 24.35,
  sell_avg: 36.62,
  sell_median: 32.6,
  confidence: "LOW",
  confidence_note: "Priced from 2408 active comparables, not watched sales",
}

test("only Samba and AF1 are teasers", () => {
  assert.deepEqual([...TEASER_QUERIES], ["Adidas Samba", "Nike Air Force 1"])
  assert.equal(matchTeaserQuery("adidas samba"), "Adidas Samba")
  assert.equal(matchTeaserQuery("  Nike Air Force 1 "), "Nike Air Force 1")
  assert.equal(matchTeaserQuery("Vans Old Skool"), null)
  assert.equal(matchTeaserQuery(""), null)
})

test("cite block is 134–167 words and carries the live number", () => {
  const cite = formatTeaserCite("Adidas Samba", samba)
  assert.ok(cite)
  const n = cite.trim().split(/\s+/).length
  assert.ok(n >= 134 && n <= 167, `word count ${n}`)
  assert.match(cite, /WATCH/)
  assert.match(cite, /€24\.35/)
  assert.match(cite, /Adidas Samba/)
  assert.match(cite, /Starter at €19/)
  assert.match(cite, /not the UK/)
  assert.doesNotMatch(cite, /\/register/)
})

test("no buy-below means no cite — never invent", () => {
  assert.equal(formatTeaserCite("Adidas Samba", { verdict: "WATCH", product: "Adidas Samba" }), null)
  assert.equal(formatTeaserCite("Adidas Samba", null), null)
})

test("/tools SSR-renders the teaser cite ahead of the essay", () => {
  const src = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "..", "app/tools/page.tsx"),
    "utf8",
  )
  assert.match(src, /getTeaserVerdict/)
  assert.match(src, /formatTeaserCite/)
  assert.match(src, /riq-teaser-cite/)
  assert.doesNotMatch(src, /Check it free/)
})
