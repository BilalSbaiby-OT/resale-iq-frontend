// Batch 126 — Tony. Mixed how-to: restock or skip — which model to buy this week.
// Live numbers: /api/public/market-snapshot 2026-09-20 23:38:24 only.
// No per-model buy-below. No country-sales. No brand-price clone.

import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

export const POSTS_126: BlogPost[] = [
  {
    slug: "restock-or-skip-which-model-to-buy-2026",
    title: "Restock or Skip: Which Clothing Model to Buy This Week (2026)",
    seoTitle: "Restock or Skip 2026 | Which Model to Buy | Resale IQ",
    description:
      "Restock the model that still left the shelf, not the brand you like. This week’s watched departures on 5,309,568 EU5 Vinted listings, then check it on /tools.",
    date: "2026-09-21",
    category: "How-to",
    readMins: 6,
    preflightQuery: "Stone Island Hoodies",
    intro:
      "A restock is a second bet on the same cash. Do not reorder the brand. Reorder the model that still left the shelf. Across 5,309,568 Vinted listings we track in ES, FR, DE, IT and PT, the week to 20 September 2026 23:38 UTC showed Stone Island leaving 41 times at €69 average — hoodies 20 at €44, jackets 13 at €140. Patagonia 40 at €35, jackets 18 at €33. Fred Perry 35 at €16, shirts 14 at €12. New Balance sneakers 22 at €48. Gucci bags 10 at €452. Nike only 8 at €64. Adidas 5 at €26. Thin names this week are a skip unless /tools shows a live sample for that exact model. This page does not publish a per-model buy-below. We count watched departures, not confirmed cash sales. Ingest has been thin, so treat direction, not a 24-hour tick.",
    definedTerm: {
      name: "Restock decision (clothing resale)",
      description:
        "Whether to buy another unit of a model after one already moved. Resale IQ publishes brand and category watched-departure counts from the public EU5 Vinted snapshot. Per-model buy-below stays on the paid checker.",
    },
    sections: [
      {
        h: "This week’s volume, then the restock rule",
        p: [
          "Public snapshot 20 September 2026 23:38 UTC. Listings tracked: 5,309,568. Counting method: watched transitions from active to gone in the trailing 7 days. Treat the weekly figure as a lower bound. Snapshot last_calculated is that stamp.",
          "Stone Island 41 departures, €69 average. Patagonia 40, €35. Fred Perry 35, €16. New Balance 24, €46. Gucci 23, €283. Balenciaga 18, €145. The North Face 16, €33. Uniqlo 12, €10. Ralph Lauren 11, €54. Nike 8, €64. Adidas 5, €26. Restock where category volume is still there. Skip where the sample is five.",
        ],
        table: {
          caption:
            "Watched departures, trailing 7 days, EU5 Vinted. Source: Resale IQ market snapshot 2026-09-20 23:38:24. Not sale confirmations.",
          head: ["Brand", "Watched departures (7d)", "Avg €", "Hottest category"],
          rows: [
            ["Stone Island", "41", "69", "Hoodies"],
            ["Patagonia", "40", "35", "Jackets"],
            ["Fred Perry", "35", "16", "Shirts"],
            ["New Balance", "24", "46", "Sneakers"],
            ["Gucci", "23", "283", "Bags"],
            ["Balenciaga", "18", "145", "Sneakers"],
            ["The North Face", "16", "33", "Jackets"],
            ["Uniqlo", "12", "10", "Hoodies"],
            ["Ralph Lauren", "11", "54", "Hoodies"],
            ["Adidas", "5", "26", "Tracksuits"],
          ],
        },
        cta: pricingMidCta("ctr_restock_skip_20260921"),
      },
      {
        h: "Same brand, different restock",
        p: [
          "Stone Island hoodies 20 at €44 is not the same cash as Stone Island jackets 13 at €140. One turns at a mid ticket. The other needs a buyer who will pay jacket money after fees.",
          "Patagonia jackets 18 at €33 versus Gucci bags 10 at €452: volume versus ticket. A restock of the bag is one slow unit. A restock of the jacket is a different working-capital cycle.",
          "Fred Perry shirts 14 at €12 turn. Nike at 8 and Adidas at 5 are not a restock signal this week. Brand fame is not a second order.",
        ],
      },
      {
        h: "Check the model on /tools before you restock",
        p: [
          "You already have a supplier. Type brand plus model, not the brand alone. Read demand and the fee-aware ceiling. If volume is thin this week, skip the unit.",
          `Cite the same weekly table on [market data](${ilinkHref("data")}). Then use [the demand checker](${ilinkHref("flip")}) — Starter €19 — if you are about to spend stock money.`,
        ],
        cta: pricingBodyCta("body_restock_skip_20260921"),
      },
    ],
    faq: [
      {
        q: "Should I restock a clothing model to resell this week?",
        a: "Only if that model still left the shelf at a price that covers your buy after fees. Snapshot 2026-09-20 23:38:24: Stone Island 41 watched departures at €69; Adidas 5 at €26. Run the exact model on /tools. We do not publish per-model buy-below here.",
      },
      {
        q: "Where do these numbers come from?",
        a: "Resale IQ /api/public/market-snapshot. 5,309,568 listings across ES, FR, DE, IT, PT. sold_7d is watched departures, a lower bound, not confirmed sales.",
      },
      {
        q: "Which clothing model should I buy to resell?",
        a: "The one still leaving the shelf. Stone Island hoodies 20 at €44 is a different bet than Gucci bags 10 at €452. Check the exact model on /tools.",
      },
    ],
  },
]
