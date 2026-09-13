/**
 * EX-HOWTO-SCHEMA — valid HowTo JSON-LD from on-page steps only.
 * FAQPage stays. No invented tools/supplies. No /register. No UTM.
 */
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { test } from "node:test"
import assert from "node:assert/strict"
import {
  howToJsonLd,
  howtoTextIsClean,
  PROCESS_HOWTO_SLUGS,
  type HowToSource,
} from "./howto-schema.ts"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")

function read(rel: string): string {
  return readFileSync(join(root, rel), "utf8")
}

const POST_FILES = [
  "data/blog-posts.ts",
  "data/blog-posts-2.ts",
  "data/blog-posts-3.ts",
] as const

function postChunk(slug: string): string {
  for (const file of POST_FILES) {
    const src = read(file)
    const start = src.indexOf(`slug: "${slug}"`)
    if (start < 0) continue
    const next = src.indexOf('slug: "', start + 10)
    return src.slice(start, next < 0 ? src.length : next)
  }
  throw new Error(`post not found: ${slug}`)
}

function schemaBlob(schema: object): string {
  return JSON.stringify(schema)
}

test("howToJsonLd emits a parseable HowTo with HowToStep positions", () => {
  const post: HowToSource = {
    slug: "how-to-price-items-on-vinted",
    title: "How to Price Items on Vinted: Buy-Below from Departure Prices",
    description: "Price off real Vinted departure prices, then work backwards to buy-below.",
    sections: [
      { h: "Start from the real departure price, not the retail price", p: ["Look at listings that recently left the shelf."] },
      { h: "Work backwards to your buy-below price", p: ["buy-below = average asking price at departure × 0.95 × 0.70"] },
    ],
  }
  const schema = howToJsonLd(post)
  assert.ok(schema)
  assert.equal(schema["@context"], "https://schema.org")
  assert.equal(schema["@type"], "HowTo")
  assert.equal(schema.inLanguage, "en")
  assert.equal(schema.url, "https://resaleiq.dev/blog/how-to-price-items-on-vinted")
  assert.equal(schema.step.length, 2)
  assert.equal(schema.step[0]["@type"], "HowToStep")
  assert.equal(schema.step[0].position, 1)
  assert.equal(schema.step[0].name, post.sections[0].h)
  assert.equal(schema.step[0].text, post.sections[0].p[0])
  const parsed = JSON.parse(JSON.stringify(schema))
  assert.equal(parsed["@type"], "HowTo")
  assert.equal(parsed.step[1].position, 2)
})

test("HowTo omits tools, supplies, /register and UTM", () => {
  const schema = howToJsonLd({
    slug: "thrift-store-flipping-guide",
    title: "Thrift Store Flipping — Buy-Below Before You Fill the Boot",
    description: "Know buy-below before you fill the boot.",
    sections: [
      { h: "Have a target list before you go", p: ["Go in knowing the brands that actually sell."] },
      { h: "The 30-second check", p: ["Brand label → condition → size → price."] },
      { h: "Know your number before you queue", p: ["If the tag is above it, walking away IS the profitable decision."] },
    ],
  })
  assert.ok(schema)
  const blob = schemaBlob(schema)
  assert.doesNotMatch(blob, /"tool"/)
  assert.doesNotMatch(blob, /"supply"/)
  assert.doesNotMatch(blob, /\/register/)
  assert.doesNotMatch(blob, /utm_/)
  assert.equal(howtoTextIsClean(blob), true)
  assert.equal(howtoTextIsClean("See https://resaleiq.dev/data"), true)
  assert.equal(howtoTextIsClean("Sign up at /register"), false)
  assert.equal(howtoTextIsClean("https://resaleiq.dev/data?utm_source=blog"), false)
})

test("stripRichText-style links become labels; ilink query strings never enter schema", () => {
  const schema = howToJsonLd({
    slug: "how-to-find-items-to-flip-on-vinted",
    title: "How to Find Vinted Flips — Start From Demand, Not Scroll",
    description: "Stop random scrolling.",
    sections: [
      {
        h: "Start from demand, not from what's cheap",
        p: ["Start with [which categories actually move](/category)."],
      },
      {
        h: "Use the buy-below filter",
        p: [
          "Our [free weekly market data](/data?utm_source=blog&utm_medium=ilink&utm_campaign=ilink_20260913&utm_content=to_data) publishes averages.",
        ],
      },
    ],
  })
  assert.ok(schema)
  assert.equal(schema.step[0].text, "Start with which categories actually move.")
  assert.equal(schema.step[1].text, "Our free weekly market data publishes averages.")
  assert.doesNotMatch(schemaBlob(schema), /utm_/)
  assert.doesNotMatch(schemaBlob(schema), /\/register/)
})

test("Spanish pricing post uses Spanish step names and skips the methodology heading", () => {
  const schema = howToJsonLd({
    slug: "como-poner-precio-en-vinted",
    title: "Cómo poner precio en Vinted sin regalar tu margen",
    description: "El método que usan los revendedores para fijar precio en Vinted.",
    sections: [
      { h: "Olvida el precio de tienda", p: ["El precio original no dice casi nada."] },
      { h: "Tu precio máximo de compra", p: ["precio máximo = precio medio al desaparecer el anuncio × 0,95 × 0,70"] },
      { h: "La demanda es la otra mitad del precio", p: ["Un precio de salida sin demanda es una trampa."] },
      { h: "La velocidad importa más que el último euro", p: ["Un artículo que se vende en nueve días a 40 € es mejor negocio."] },
      { h: "Qué miden esas cifras, y qué no", p: ["Seguimos anuncios en los cinco mercados."] },
    ],
  })
  assert.ok(schema)
  assert.equal(schema.inLanguage, "es")
  assert.equal(schema.url, "https://resaleiq.dev/blog/como-poner-precio-en-vinted")
  assert.deepEqual(
    schema.step.map((s) => s.name),
    [
      "Olvida el precio de tienda",
      "Tu precio máximo de compra",
      "La demanda es la otra mitad del precio",
      "La velocidad importa más que el último euro",
    ],
  )
  assert.equal(schema.step.length, 4)
})

test("vinted-item-not-selling HowTo uses the four numbered checks", () => {
  const schema = howToJsonLd({
    slug: "vinted-item-not-selling",
    title: "Why Isn't My Vinted Item Selling — 4 Checks in Order",
    description: "Price, condition, demand, size — in that order.",
    sections: [
      { h: "Start with price — it fixes more listings than anything else", p: ["The most common reason is price."] },
      {
        h: "The order that fixes the most, fastest",
        p: [
          "1. Re-check the price against real recent departures for that exact model and condition, not retail and not hope.",
          "2. Rewrite the description to say precisely what condition the item is in — specific, not aspirational.",
          "3. Confirm demand actually exists for the model and size using current market data, not brand reputation.",
          "4. If it's genuinely a slow mover in a slow size, consider [a bundle or a reasonable offer](/blog/vinted-bundles-and-offers-strategy) rather than holding out — cash that recycles beats a listing that sits.",
        ],
      },
    ],
  })
  assert.ok(schema)
  assert.equal(schema.step.length, 4)
  assert.match(schema.step[0].name, /Re-check the price/)
  assert.match(schema.step[1].name, /Rewrite the description/)
  assert.match(schema.step[2].name, /Confirm demand actually exists/)
  assert.match(schema.step[3].text, /bundle or a reasonable offer/)
  assert.doesNotMatch(schema.step[3].text, /\[/)
  assert.equal(schema.step[0].position, 1)
  assert.equal(schema.step[3].position, 4)
})

test("non-process slugs do not emit HowTo", () => {
  assert.equal(
    howToJsonLd({
      slug: "what-sells-best-on-vinted",
      title: "What Sells Best on Vinted in 2026 (Data-Backed)",
      description: "The categories and brands that sell fastest.",
      sections: [
        { h: "The categories that move fastest", p: ["Sneakers and trainers."] },
        { h: "Why the brand isn't enough on its own", p: ["A popular brand with the wrong size sits unsold."] },
      ],
    }),
    null,
  )
})

test("allowlisted process posts have matching on-page steps in the body", () => {
  assert.ok(PROCESS_HOWTO_SLUGS.length >= 4)

  const expectedHeadings: Record<string, string[]> = {
    "how-to-price-items-on-vinted": [
      "Start from the real departure price, not the retail price",
      "Work backwards to your buy-below price",
      "Demand is the other half of the price",
      "Price to sell in a reasonable window",
    ],
    "how-to-find-items-to-flip-on-vinted": [
      "Start from demand, not from what's cheap",
      "Use the buy-below filter",
      "Automate the boring part",
    ],
    "how-to-get-more-views-on-vinted": [
      "First: is there demand at all?",
      "Match the words buyers type",
      "Price and freshness",
      "A bigger closet compounds",
    ],
    "thrift-store-flipping-guide": [
      "Have a target list before you go",
      "The 30-second check",
      "Know your number before you queue",
    ],
    "como-poner-precio-en-vinted": [
      "Olvida el precio de tienda",
      "Tu precio máximo de compra",
      "La demanda es la otra mitad del precio",
      "La velocidad importa más que el último euro",
    ],
  }

  const numberedChecks = [
    "Re-check the price against real recent departures",
    "Rewrite the description to say precisely what condition",
    "Confirm demand actually exists for the model and size",
    "consider [a bundle or a reasonable offer]",
  ]

  for (const slug of PROCESS_HOWTO_SLUGS) {
    const chunk = postChunk(slug)
    assert.doesNotMatch(chunk, /\/register/)
    if (slug === "vinted-item-not-selling") {
      for (const line of numberedChecks) assert.match(chunk, new RegExp(line.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")))
      continue
    }
    const headings = expectedHeadings[slug]
    assert.ok(headings, `missing heading lock for ${slug}`)
    for (const h of headings) {
      assert.match(chunk, new RegExp(h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")))
    }
  }
})

test("blog post page emits HowTo beside FAQPage and does not drop FAQ", () => {
  const src = read("app/blog/[slug]/page.tsx")
  assert.match(src, /howToJsonLd/)
  assert.match(src, /"@type": "FAQPage"/)
  assert.match(src, /stripRichText\(f\.a\)/)
  assert.doesNotMatch(src, /\/register\?/)
})
