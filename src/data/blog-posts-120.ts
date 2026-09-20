// Batch 120 — Tony. Which MODEL to buy to resell (demand check, not sourcing).
// Live numbers: /api/public/market-snapshot 2026-09-20 19:49:12 only.
// No per-model buy-below. No country-sales. No brand-price clone.

import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

export const POSTS_120: BlogPost[] = [
  {
    slug: "should-i-buy-this-model-to-resell",
    title: "Should I Buy This Model to Resell? (2026 Demand Check)",
    seoTitle: "Should I Buy This Model to Resell? 2026 Demand Check | Resale IQ",
    description:
      "Decide which clothing model to buy to resell: this week’s watched departures on 5,309,568 Vinted listings (EU5), then run the model in Resale IQ /tools. No per-model buy-below on this page.",
    date: "2026-09-20",
    category: "Sourcing",
    readMins: 5,
    preflightQuery: "Stone Island Hoodies",
    intro:
      "Should you buy this model to resell? Start with demand, then price. Across 5,309,568 Vinted listings we track in ES, FR, DE, IT and PT, the week to 20 September 2026 showed Stone Island leaving the shelf 62 times at €73 average — hoodies 29 at €52, jackets 19 at €137. Fred Perry moved 56 at €16. Patagonia 52 at €33. Nike only 14 at €98. Those are brand and category counts, not a Samba versus Gazelle model pick. The model you should buy is the one that still leaves the shelf at a price that covers your buy after fees. Run that exact model in the checker on /tools before you spend stock money this week. This public page does not publish a per-model buy-below. We count watched departures, not confirmed cash sales.",
    definedTerm: {
      name: "Buy this model to resell",
      description:
        "A buy-this-model decision is a demand check first: whether that specific clothing model is still leaving the shelf at a workable average price. Resale IQ publishes brand and category watched-departure counts from the public market snapshot. Per-model buy-below prices stay behind the paid checker on /tools. We observe listings leaving the shelf; we do not confirm a sale price.",
    },
    sections: [
      {
        h: "This week’s demand, not a shopping list",
        p: [
          "Public snapshot 20 September 2026 19:49 UTC. Listings tracked: 5,309,568. Counting method: watched transitions from active to gone in the trailing 7 days. Treat the weekly figure as a lower bound.",
          "Stone Island 62 departures, €73 average. Fred Perry 56, €16. Patagonia 52, €33. Balenciaga 26, €107. Gucci 26, €303. The North Face 25, €30. New Balance 24, €46. Nike 14, €98. Adidas 5, €26. High average price with thin volume (Nike, Gucci) is not the same signal as high volume at a modest average (Fred Perry, Patagonia).",
        ],
        table: {
          caption:
            "Watched departures, trailing 7 days, EU5. Source: Resale IQ market snapshot 2026-09-20 19:49:12. Not sale confirmations.",
          head: ["Brand", "Watched departures (7d)", "Avg €", "Hottest category"],
          rows: [
            ["Stone Island", "62", "73", "Hoodies"],
            ["Fred Perry", "56", "16", "Shirts"],
            ["Patagonia", "52", "33", "Jackets"],
            ["Balenciaga", "26", "107", "Sneakers"],
            ["Gucci", "26", "303", "Bags"],
            ["The North Face", "25", "30", "Jackets"],
            ["New Balance", "24", "46", "Sneakers"],
            ["Nike", "14", "98", "Sneakers"],
            ["Adidas", "5", "26", "Tracksuits"],
          ],
        },
        cta: pricingMidCta("ctr_model_buy_20260920"),
      },
      {
        h: "Brand volume is not a model verdict",
        p: [
          "Stone Island hoodies left 29 times at €52; jackets 19 times at €137. Same brand, different cash tied up. New Balance tracks 10 models; we still will not print a buy-below for 550 versus 2002 on this page.",
          `Run the exact model in [the demand checker](${ilinkHref("flip")}). If the checker has no row, skip the buy. Do not average the brand into the model.`,
        ],
      },
      {
        h: "How to use /tools on a model you already found",
        p: [
          "You already have a supplier. Type the model, not just the brand. Read demand and the fee-aware ceiling. If volume is thin this week (Adidas 5 departures), you are guessing unless the checker shows a live sample.",
          `Cite the same weekly table we publish on [market data](${ilinkHref("data")}). Then pay for the model check — Starter €19 — if you are about to spend stock money.`,
        ],
        cta: pricingBodyCta("body_model_buy_20260920"),
      },
    ],
    faq: [
      {
        q: "Should I buy this model to resell?",
        a: "Only if demand is still there at a price that covers your buy after fees. This week (snapshot 2026-09-20 19:49:12) Stone Island had 62 watched departures at €73 average; Nike had 14 at €98. Run the specific model on /tools. We do not publish per-model buy-below on this page.",
      },
      {
        q: "Where do these numbers come from?",
        a: "Resale IQ /api/public/market-snapshot. 5,309,568 listings across ES, FR, DE, IT, PT. sold_7d is watched departures, a lower bound, not confirmed sales.",
      },
      {
        q: "Why no buy-below for Samba or Nano Puff here?",
        a: "Public pages stay at brand and category aggregates. Model-level ceilings are the paid checker. Naming a model is fine; inventing its buy-below is not.",
      },
    ],
  },
]
