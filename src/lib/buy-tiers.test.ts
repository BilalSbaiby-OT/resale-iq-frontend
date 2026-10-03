import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { applyBuyTiers, assignBuyTiers, buyTierLabel, BUY_TIER_LABELS, type BuyTier } from "./buy-tiers.ts"

const here = dirname(fileURLToPath(import.meta.url))

test("assignBuyTiers: top third fast, middle steady, bottom slow (input order kept)", () => {
  const t = assignBuyTiers([10, 900, 50, 400, 5, 100])
  // sorted desc: 900(fast) 400(fast) 100(steady) 50(steady) 10(slow) 5(slow)
  assert.deepEqual(t, ["slow", "fast", "steady", "fast", "slow", "steady"])
})

test("assignBuyTiers: ties never split across a tier boundary", () => {
  // 6 rows, boundary after rank 2: the 3 tied 50s all take the tier of the first of them
  const t = assignBuyTiers([100, 90, 50, 50, 50, 1])
  assert.deepEqual(t, ["fast", "fast", "steady", "steady", "steady", "slow"])
  assert.deepEqual(assignBuyTiers([7, 7, 7, 7]), ["fast", "fast", "fast", "fast"])
})

test("assignBuyTiers: edge cases", () => {
  assert.deepEqual(assignBuyTiers([]), [])
  assert.deepEqual(assignBuyTiers([42]), ["fast"])
  assert.deepEqual(assignBuyTiers([5, null as unknown as number, NaN]), ["fast", "steady", "steady"] as BuyTier[])
})

test("tier labels: 6 locales, natural wording, never 'sold'", () => {
  assert.deepEqual(BUY_TIER_LABELS.en, { fast: "Moving fast", steady: "Steady", slow: "Slow" })
  assert.deepEqual(BUY_TIER_LABELS.fr, { fast: "Part vite", steady: "Régulier", slow: "Lent" })
  assert.deepEqual(BUY_TIER_LABELS.de, { fast: "Geht schnell", steady: "Stetig", slow: "Langsam" })
  assert.deepEqual(BUY_TIER_LABELS.es, { fast: "Se mueve rápido", steady: "Constante", slow: "Lento" })
  assert.deepEqual(BUY_TIER_LABELS.it, { fast: "Va via veloce", steady: "Costante", slow: "Lento" })
  assert.deepEqual(BUY_TIER_LABELS.pt, { fast: "Sai rápido", steady: "Constante", slow: "Lento" })
  for (const loc of Object.values(BUY_TIER_LABELS))
    for (const w of Object.values(loc)) assert.doesNotMatch(w, /sold|vendu|verkauft|revend|vendid|vendut/i)
  assert.equal(buyTierLabel(null), "—")
  assert.equal(buyTierLabel("slow", "de"), "Langsam")
})

test("applyBuyTiers stamps pairs, brands and categories; idempotent", () => {
  const d = applyBuyTiers({
    brands: [
      { sold_30d: 300, categories: [{ category: "Shirts", sold_30d: 200 }, { category: "Hoodies", sold_30d: 100 }] },
      { sold_30d: 60, categories: [{ category: "Shirts", sold_30d: 50 }, { category: "Caps", sold_30d: 10 }] },
      { sold_30d: 5, categories: [{ category: "Caps", sold_30d: 5 }] },
    ],
  })
  assert.deepEqual(d.brands.map((b) => b.tier), ["fast", "steady", "slow"])
  assert.deepEqual(d.brands.flatMap((b) => b.categories.map((c) => c.tier)), ["fast", "fast", "steady", "steady", "slow"])
  assert.deepEqual(d.category_tiers, { Shirts: "fast", Hoodies: "steady", Caps: "slow" })
  const again = JSON.stringify(applyBuyTiers(structuredClone(d)))
  assert.equal(again, JSON.stringify(d))
})

test("committed buy-data.json: every pair/brand/category has the tier the rule gives", () => {
  const data = JSON.parse(readFileSync(join(here, "../data/buy-data.json"), "utf8"))
  const pairs = data.brands.flatMap((b: { categories: unknown[] }) => b.categories) as Array<{ sold_30d: number; tier?: string }>
  assert.ok(pairs.length > 100)
  assert.deepEqual(pairs.map((c) => c.tier), assignBuyTiers(pairs.map((c) => c.sold_30d)))
  assert.deepEqual(data.brands.map((b: { tier: string }) => b.tier), assignBuyTiers(data.brands.map((b: { sold_30d: number }) => b.sold_30d)))
  const counts = { fast: 0, steady: 0, slow: 0 } as Record<string, number>
  for (const c of pairs) counts[c.tier!]++
  for (const k of Object.keys(counts)) assert.ok(counts[k] > 0, `tier ${k} used`)
  assert.ok(data.category_tiers && Object.keys(data.category_tiers).length > 3)
})
