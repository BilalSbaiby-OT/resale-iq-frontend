// Batch 122 — Tony. Mixed compare: Vinted vs Grailed streetwear, then which model to buy.
// Live numbers: /api/public/market-snapshot 2026-09-18 22:43:06 only.
// No per-model buy-below. No country-sales. No brand-price clone.

import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

export const POSTS_122: BlogPost[] = [
  {
    slug: "vinted-vs-grailed-streetwear-which-model-to-buy",
    title: "Vinted vs Grailed Streetwear: Which Model to Buy (2026)",
    seoTitle: "Vinted vs Grailed Streetwear 2026 | Which Model to Buy | Resale IQ",
    description:
      "Pick the streetwear model to buy before you pick the channel. This week’s watched departures on 5,564,932 EU5 Vinted listings, then check the model on /tools. Not a Grailed clone.",
    date: "2026-09-20",
    category: "Compare",
    readMins: 6,
    preflightQuery: "Stone Island Hoodies",
    intro:
      "Vinted vs Grailed is a channel pick after you already know which model to buy. Across 5,564,932 Vinted listings we track in ES, FR, DE, IT and PT, the week to 18 September 2026 showed Balenciaga leaving the shelf 261 times at €140 average — sneakers 76 at €152. Fred Perry moved 258 times at €17. Patagonia 234 at €38. Stone Island 197 at €71 — hoodies 108 at €55. Nike 74 at €72. Supreme 54 at €80. Adidas 39 at €54. Grailed is thinner, slower, and aimed at collectors who pay for rare cuts. Vinted is volume. Buy the model that still leaves the shelf on Vinted at a price that covers fees, then list Grailed only if the same piece is scarce. Run the exact model on /tools before you spend stock money. This page does not publish a per-model buy-below. We count watched departures, not confirmed cash sales.",
    definedTerm: {
      name: "Vinted vs Grailed (streetwear)",
      description:
        "A channel comparison after a demand check. Resale IQ publishes brand and category watched-departure counts from the public EU5 Vinted snapshot. Per-model buy-below stays on the paid checker. We do not scrape Grailed volume.",
    },
    sections: [
      {
        h: "Demand first, then the channel",
        p: [
          "Public snapshot 18 September 2026 22:43 UTC. Listings tracked: 5,564,932. Counting method: watched transitions from active to gone in the trailing 7 days. Treat the weekly figure as a lower bound. Snapshot last_calculated is that stamp; ingest has been thin, so treat direction not a 24h tick.",
          "Balenciaga 261 departures, €140 average. Fred Perry 258, €17. Patagonia 234, €38. Stone Island 197, €71. Gucci 105, €249. Nike 74, €72. The North Face 73, €38. New Balance 71, €75. Supreme 54, €80. Adidas 39, €54. High volume at a modest average (Fred Perry shirts 121 at €14) turns on Vinted. Thin, expensive names (Gucci bags 39 at €392) are the only ones worth a Grailed listing test.",
        ],
        table: {
          caption:
            "Watched departures, trailing 7 days, EU5 Vinted. Source: Resale IQ market snapshot 2026-09-18 22:43:06. Not sale confirmations. Not Grailed counts.",
          head: ["Brand", "Watched departures (7d)", "Avg €", "Hottest category"],
          rows: [
            ["Balenciaga", "261", "140", "Sneakers"],
            ["Fred Perry", "258", "17", "Shirts"],
            ["Patagonia", "234", "38", "Jackets"],
            ["Stone Island", "197", "71", "Hoodies"],
            ["Gucci", "105", "249", "Bags"],
            ["Nike", "74", "72", "Sneakers"],
            ["The North Face", "73", "38", "Jackets"],
            ["New Balance", "71", "75", "Sneakers"],
            ["Supreme", "54", "80", "Hoodies"],
            ["Adidas", "39", "54", "Sneakers"],
          ],
        },
        cta: pricingMidCta("ctr_vinted_grailed_20260920"),
      },
      {
        h: "What each platform is for",
        p: [
          "Vinted: EU5 volume, buyer-protection fees, fast comps. If Stone Island hoodies left 108 times at €55, that is a Vinted model. Do not assume Grailed will pay more — we have no Grailed departure table.",
          "Grailed: collector streetwear, slower days-on-market, authenticity theatre. Use it when the model is scarce on Vinted this week, not as your default list. Same supplier. Different ask. Brand volume is not a model verdict — run the exact model.",
        ],
      },
      {
        h: "Check the model on /tools before you buy",
        p: [
          "You already have a supplier. Type brand plus model, not the brand alone. Read demand and the fee-aware ceiling. If volume is thin this week (Adidas 39 departures vs Balenciaga 261), another unit is a guess unless the checker shows a live sample.",
          `Cite the same weekly table on [market data](${ilinkHref("data")}). Then use [the demand checker](${ilinkHref("flip")}) — Starter €19 — if you are about to spend stock money.`,
        ],
        cta: pricingBodyCta("body_vinted_grailed_20260920"),
      },
    ],
    faq: [
      {
        q: "Should I sell streetwear on Vinted or Grailed?",
        a: "Demand first. This week (snapshot 2026-09-18 22:43:06) Balenciaga had 261 watched departures at €140 average on EU5 Vinted; Adidas had 39 at €54. List volume names on Vinted. Test Grailed only when the model is scarce. Run the model on /tools. We do not publish per-model buy-below here.",
      },
      {
        q: "Where do these numbers come from?",
        a: "Resale IQ /api/public/market-snapshot. 5,564,932 listings across ES, FR, DE, IT, PT. sold_7d is watched departures, a lower bound, not confirmed sales. We do not claim Grailed volume.",
      },
      {
        q: "Which streetwear model should I buy to resell?",
        a: "The one still leaving the shelf at a price that covers your buy after fees. Stone Island hoodies 108 at €55 is a different cash bet than Gucci bags 39 at €392. Check the exact model on /tools.",
      },
    ],
  },
]
