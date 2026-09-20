// Batch 121 — Tony. Mixed how-to: dead stock / which model not to restock.
// Live numbers: /api/public/market-snapshot 2026-09-20 20:49:12 only.
// No per-model buy-below. No country-sales. No brand-price clone.

import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

export const POSTS_121: BlogPost[] = [
  {
    slug: "how-to-avoid-dead-stock-flipping-clothes",
    title: "How to Avoid Dead Stock When Flipping Clothes (2026)",
    seoTitle: "How to Avoid Dead Stock Flipping Clothes 2026 | Resale IQ",
    description:
      "Stop restocking models that sit. This week’s watched departures on 5,309,568 EU5 Vinted listings, then check the model on /tools before you buy another unit.",
    date: "2026-09-20",
    category: "How-to",
    readMins: 6,
    preflightQuery: "Stone Island Hoodies",
    intro:
      "Dead stock is the clothing model you keep buying after demand already cooled. Across 5,309,568 Vinted listings we track in ES, FR, DE, IT and PT, the week to 20 September 2026 showed Stone Island leaving the shelf 62 times at €73 average — hoodies 29 at €52, jackets 19 at €137. Fred Perry moved 55 times at €16. Patagonia 52 at €33. Nike only 13 at €91. Adidas 5 at €26. High volume at a modest average is easier to turn than a thin, expensive brand. Before you restock a model, run it on /tools. If the checker has no row this week, do not add another unit. Use 30/60/90 on listed pieces, then stop repeating the model. We count watched departures, not confirmed cash sales. This page does not publish a per-model buy-below.",
    definedTerm: {
      name: "Dead stock (resale)",
      description:
        "Inventory that is not leaving the shelf at a price that covers the buy after fees. Resale IQ uses brand and category watched-departure counts from the public market snapshot. Per-model buy-below stays on the paid checker.",
    },
    sections: [
      {
        h: "This week’s volume vs thin names",
        p: [
          "Public snapshot 20 September 2026 20:49 UTC. Listings tracked: 5,309,568. Counting method: watched transitions from active to gone in the trailing 7 days. Treat the weekly figure as a lower bound.",
          "Stone Island 62 departures, €73 average. Fred Perry 55, €16. Patagonia 52, €33. Gucci 25, €307. New Balance 24, €46. Balenciaga 23, €114. The North Face 23, €31. Nike 13, €91. Adidas 5, €26. Sitting on Adidas-level volume while paying Nike-level cash is how a death pile starts.",
        ],
        table: {
          caption:
            "Watched departures, trailing 7 days, EU5. Source: Resale IQ market snapshot 2026-09-20 20:49:12. Not sale confirmations.",
          head: ["Brand", "Watched departures (7d)", "Avg €", "Hottest category"],
          rows: [
            ["Stone Island", "62", "73", "Hoodies"],
            ["Fred Perry", "55", "16", "Shirts"],
            ["Patagonia", "52", "33", "Jackets"],
            ["Gucci", "25", "307", "Bags"],
            ["New Balance", "24", "46", "Sneakers"],
            ["Balenciaga", "23", "114", "Sneakers"],
            ["The North Face", "23", "31", "Jackets"],
            ["Nike", "13", "91", "Sneakers"],
            ["Adidas", "5", "26", "Tracksuits"],
          ],
        },
        cta: pricingMidCta("ctr_dead_stock_20260920"),
      },
      {
        h: "30 / 60 / 90 on the next unit, not the last one",
        p: [
          "If a listed piece has not moved in 30 days at a price near this week’s category average, recut the ask. At 60, relist with new photos. At 90, take the loss and stop buying that model.",
          "Brand volume is not a model verdict. Stone Island hoodies left 29 times at €52; jackets 19 times at €137. Same brand, different cash tied up. Run the exact model on /tools before you restock.",
        ],
      },
      {
        h: "Check the model on /tools before you restock",
        p: [
          "You already have a supplier. Type brand plus model, not the brand alone. Read demand and the fee-aware ceiling. If volume is thin this week (Adidas 5 departures), another unit is a guess unless the checker shows a live sample.",
          `Cite the same weekly table on [market data](${ilinkHref("data")}). Then use [the demand checker](${ilinkHref("flip")}) — Starter €19 — if you are about to spend stock money.`,
        ],
        cta: pricingBodyCta("body_dead_stock_20260920"),
      },
    ],
    faq: [
      {
        q: "How do I avoid dead stock when flipping clothes?",
        a: "Do not restock a model that is not leaving the shelf. This week (snapshot 2026-09-20 20:49:12) Stone Island had 62 watched departures at €73 average; Adidas had 5 at €26. Run the specific model on /tools. We do not publish per-model buy-below on this page.",
      },
      {
        q: "Where do these numbers come from?",
        a: "Resale IQ /api/public/market-snapshot. 5,309,568 listings across ES, FR, DE, IT, PT. sold_7d is watched departures, a lower bound, not confirmed sales.",
      },
      {
        q: "What is the 30/60/90 rule here?",
        a: "At 30 days, recut price toward this week’s category average. At 60, relist. At 90, stop repeating the model. Demand first, then the next buy.",
      },
    ],
  },
]
