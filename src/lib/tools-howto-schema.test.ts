/**
 * EX-TOOLS-HOWTO — valid HowTo JSON-LD from on-page UI/copy only.
 * FAQPage stays. No invented tools/supplies. No /register. No UTM.
 */
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { test } from "node:test"
import assert from "node:assert/strict"
import { copy } from "./i18n.ts"
import { howtoTextIsClean } from "./howto-schema.ts"
import {
  TOOL_HOWTO_SLUGS,
  toolHowToHeading,
  toolHowToSteps,
  toolsHowToJsonLd,
  type ToolHowToIntent,
} from "./tools-howto-schema.ts"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")

function read(rel: string): string {
  return readFileSync(join(root, rel), "utf8")
}

function schemaBlob(schema: object): string {
  return JSON.stringify(schema)
}

function intentChunk(slug: string): string {
  const src = read("data/search-intents.ts")
  const needle = `slug: "${slug}"`
  const start = src.indexOf(needle)
  if (start < 0) throw new Error(`intent not found: ${slug}`)
  const next = src.indexOf('slug: "', start + needle.length)
  return src.slice(start, next < 0 ? src.length : next)
}

function field(chunk: string, key: string): string {
  const tmpl = chunk.match(new RegExp(`${key}:\\s*\`([\\s\\S]*?)\``))
  if (tmpl) return tmpl[1].replace(/\$\{TRACKED\}/g, "900,000+")
  const str = chunk.match(new RegExp(`${key}:\\s*"([^"]*)"`))
  if (str) return str[1]
  throw new Error(`missing ${key}`)
}

function parseFaq(chunk: string): { q: string; a: string }[] {
  const faq = chunk.slice(chunk.indexOf("faq:"))
  const pairs: { q: string; a: string }[] = []
  const re = /q: "([^"]+)", a: (?:`([\s\S]*?)`|"([^"]*)")/g
  let m: RegExpExecArray | null
  while ((m = re.exec(faq))) {
    pairs.push({ q: m[1], a: (m[2] ?? m[3]).replace(/\$\{TRACKED\}/g, "900,000+") })
  }
  return pairs
}

function intentFromSource(slug: string): ToolHowToIntent {
  const chunk = intentChunk(slug)
  return {
    slug,
    title: field(chunk, "title"),
    description: field(chunk, "description"),
    lede: field(chunk, "lede"),
    faq: parseFaq(chunk),
  }
}

test("price checker HowTo uses on-page lede, Check this item, and FAQ sentences", () => {
  const intent = intentFromSource("vinted-price-checker")
  const schema = toolsHowToJsonLd(intent)
  assert.ok(schema)
  assert.equal(schema["@context"], "https://schema.org")
  assert.equal(schema["@type"], "HowTo")
  assert.equal(schema.inLanguage, "en")
  assert.equal(schema.url, "https://resaleiq.dev/tools/vinted-price-checker")
  assert.equal(schema.name, intent.title)
  assert.equal(schema.step.length, 3)
  assert.equal(schema.step[0]["@type"], "HowToStep")
  assert.equal(schema.step[0].position, 1)
  assert.equal(schema.step[0].name, "Type a brand and model below to start a check")
  assert.match(schema.step[0].text, /paywall is the next step/)
  assert.equal(schema.step[1].name, copy.en.checker.checkFree)
  assert.match(schema.step[1].text, /listings that recently left the shelf/)
  assert.equal(schema.step[2].name, "Typical departure price plus a buy-below price")
  assert.match(schema.step[2].text, /typical departure price plus a buy-below price/)
  assert.equal(toolHowToHeading(intent), "How do I check the price of an item on Vinted?")
})

test("profit calculator HowTo uses field labels, Calculate, and the 5% fee copy", () => {
  const intent = intentFromSource("vinted-profit-calculator")
  const schema = toolsHowToJsonLd(intent)
  assert.ok(schema)
  assert.equal(schema.url, "https://resaleiq.dev/tools/vinted-profit-calculator")
  assert.equal(schema.name, intent.title)
  assert.equal(schema.step.length, 4)
  const calc = copy.en.toolsPage.calc
  assert.equal(schema.step[0].name, calc.buyLabel)
  assert.equal(schema.step[0].text, "Know your true margin before you buy.")
  assert.equal(schema.step[1].name, calc.sellLabel)
  assert.match(schema.step[1].text, /platform fee \(~5% on Vinted\)/)
  assert.equal(schema.step[2].name, calc.submit)
  assert.equal(schema.step[2].text, "Resale IQ calculates net profit after platform fees.")
  assert.equal(schema.step[3].name, calc.netLabel)
  assert.match(schema.step[3].text, /What remains is your gross profit/)
  assert.match(schema.step[3].text, /published Vinted seller-side rate/)
  assert.equal(toolHowToHeading(intent), "How do I calculate profit on Vinted?")
})

test("HowTo omits tools, supplies, /register and UTM", () => {
  for (const slug of TOOL_HOWTO_SLUGS) {
    const schema = toolsHowToJsonLd(intentFromSource(slug))
    assert.ok(schema)
    const blob = schemaBlob(schema)
    assert.doesNotMatch(blob, /"tool"/)
    assert.doesNotMatch(blob, /"supply"/)
    assert.doesNotMatch(blob, /\/register/)
    assert.doesNotMatch(blob, /utm_/)
    assert.equal(howtoTextIsClean(blob), true)
  }
})

test("every HowTo step string already exists on the page sources", () => {
  const corpus = `${read("data/search-intents.ts")}\n${read("lib/i18n.ts")}`
  for (const slug of TOOL_HOWTO_SLUGS) {
    const intent = intentFromSource(slug)
    const steps = toolHowToSteps(intent)
    assert.ok(steps)
    const hay = [corpus, intent.lede, ...intent.faq.map((f) => `${f.q}\n${f.a}`)].join("\n").toLowerCase()
    for (const step of steps) {
      assert.ok(hay.includes(step.name.toLowerCase()), `step name not on page: ${step.name}`)
      for (const clause of step.text.split(/(?<=\.)\s+/)) {
        const needle = clause.replace(/\.$/, "").toLowerCase()
        assert.ok(hay.includes(needle), `step text not on page: ${clause}`)
      }
    }
  }
})

test("other tool slugs do not emit HowTo", () => {
  for (const slug of ["vinted-sourcing-tool", "vinted-resale-analytics", "reselling-intelligence"]) {
    const intent = intentFromSource(slug)
    assert.equal(toolsHowToJsonLd(intent), null)
    assert.equal(toolHowToHeading(intent), null)
    assert.equal(toolHowToSteps(intent), null)
  }
})

test("HowTo UI labels match copy.en checker and calculator strings", () => {
  const i18n = read("lib/i18n.ts")
  assert.match(i18n, /checkFree: "Check this item"/)
  assert.match(i18n, /buyLabel: "Buy price \(€\)"/)
  assert.match(i18n, /sellLabel: "Expected sale price \(€\)"/)
  assert.match(i18n, /submit: "Calculate"/)
  assert.match(i18n, /netLabel: "Net after Vinted 5% fee"/)
  assert.match(
    i18n,
    /Arithmetic on your figures — the 5% is the published Vinted seller-side rate, not a hit-rate claim/,
  )
})

test("money-tool titles name departure price / net profit after fees", () => {
  const price = intentFromSource("vinted-price-checker")
  const profit = intentFromSource("vinted-profit-calculator")
  assert.match(price.title, /Departure Price/i)
  assert.doesNotMatch(price.title, /What Any Item Really Sells For/)
  assert.match(price.description, /departure price/i)
  assert.match(profit.title, /Net Profit After Fees/)
  assert.match(profit.description, /after fees/i)
})

test("tool pages emit HowTo beside FAQPage and render the same steps", () => {
  const src = read("app/tools/[slug]/page.tsx")
  assert.match(read("lib/tools-howto-schema.ts"), /toHowToJsonLd/)
  assert.match(src, /toolsHowToJsonLd/)
  assert.match(src, /toolHowToHeading/)
  assert.match(src, /"@type": "FAQPage"/)
  assert.match(src, /howto\.step\.map/)
  assert.match(src, /href="\/pricing\?src=tools"/)
  assert.doesNotMatch(src, /utm_campaign=tools_howto/)
  assert.doesNotMatch(src, /\/register\?/)
  assert.doesNotMatch(src, /HowTo is omitted/)
})
