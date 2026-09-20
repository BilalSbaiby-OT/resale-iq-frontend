// Batch 123 — Tony. Mixed editorial: DAC7 reporting vs which model to buy.
// Live numbers: /api/public/market-snapshot 2026-09-20 21:38:24 only.
// No per-model buy-below. No country-sales. Not a brand-price clone. Not tax advice.

import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

export const POSTS_123: BlogPost[] = [
  {
    slug: "dac7-vinted-which-model-to-buy-2026",
    title: "DAC7 on Vinted: which model to buy in 2026",
    seoTitle: "DAC7 Vinted 2026 | Which model to buy to resell | Resale IQ",
    description:
      "DAC7 reports 30 transactions or €2,000 gross. Still buy the model that leaves the shelf. This week’s watched departures on 5,309,568 EU5 Vinted listings, then /tools.",
    date: "2026-09-21",
    category: "News",
    readMins: 6,
    preflightQuery: "Stone Island Hoodies",
    intro:
      "DAC7 (EU Directive 2021/514) makes Vinted report sellers who hit 30 transactions or €2,000 gross in a calendar year. That is a reporting trigger, not a tax bill, and it is not a reason to buy slow stock. This week, on 5,309,568 EU5 Vinted listings (snapshot 20 September 2026 21:38 UTC), Stone Island left the shelf 62 times at €73 average, hoodies 29 at €52. Fred Perry 47 at €16. Patagonia jackets 21 at €33. New Balance sneakers 22 at €48. Gucci 24 at €279, bags 10 at €452. Adidas 5 at €26. If you are already over the DAC7 line, each extra SKU still has to leave. Buy the model that is still departing, then check that exact model on /tools. We count watched departures, not confirmed cash sales. No per-model buy-below on this page. Not tax advice.",
    definedTerm: {
      name: "DAC7 (Vinted resellers)",
      description:
        "EU Directive 2021/514 requires platforms including Vinted to report sellers who exceed 30 transactions or €2,000 gross in a calendar year. Reporting is not a tax assessment. Demand still decides which model to buy. Per-model buy-below stays on the paid checker.",
    },
    sections: [
      {
        h: "Reporting does not pick the model",
        p: [
          "Public snapshot 20 September 2026 21:38 UTC. Listings tracked: 5,309,568. Counting method: watched transitions from active to gone in the trailing 7 days. Treat the weekly figure as a lower bound. sold_7d_kind is observed_transitions.",
          "Stone Island 62 departures, €73 average. Fred Perry 47, €16. Patagonia 47, €34. Gucci 24, €279. New Balance 24, €46. Balenciaga 20, €132. The North Face 16, €33. Nike 12, €93. Ralph Lauren 12, €52. Uniqlo 12, €10. Adidas 5, €26. Supreme 5, €58. A DAC7 report will list gross proceeds. It will not tell you which of these still move.",
        ],
        table: {
          caption:
            "Watched departures, trailing 7 days, EU5 Vinted. Source: Resale IQ market snapshot 2026-09-20 21:38:24. Not sale confirmations. Not tax data.",
          head: ["Brand", "Watched departures (7d)", "Avg €", "Hottest category"],
          rows: [
            ["Stone Island", "62", "73", "Hoodies"],
            ["Fred Perry", "47", "16", "Shirts"],
            ["Patagonia", "47", "34", "Jackets"],
            ["Gucci", "24", "279", "Bags"],
            ["New Balance", "24", "46", "Sneakers"],
            ["Balenciaga", "20", "132", "Sneakers"],
            ["The North Face", "16", "33", "Jackets"],
            ["Nike", "12", "93", "Sneakers"],
            ["Ralph Lauren", "12", "52", "Hoodies"],
            ["Adidas", "5", "26", "Tracksuits"],
          ],
        },
        cta: pricingMidCta("ctr_dac7_model_20260921"),
      },
      {
        h: "What DAC7 actually files",
        p: [
          "Vinted files seller identity, transaction count, and gross proceeds once a year if you cross 30 sales or €2,000. That is data sharing with your tax authority. Whether you owe tax is national law. Hobby sales of your own clothes at a loss are usually a different case from buying to resell at a profit.",
          "If you already cross the line, stacking dead inventory still shows as stock you paid for and listings that may never leave. Fred Perry shirts 18 at €12 turn. Gucci bags 10 at €452 do not. Brand volume is not a model verdict.",
        ],
      },
      {
        h: "Check the model on /tools before you buy",
        p: [
          "You already have a supplier. Type brand plus model. Read demand and the fee-aware ceiling. If this week is thin (Adidas 5 watched departures vs Stone Island 62), another unit is a guess unless the checker shows a live sample.",
          `Cite the same weekly table on [market data](${ilinkHref("data")}). Then use [the demand checker](${ilinkHref("flip")}) — Starter €19 — if you are about to spend stock money.`,
        ],
        cta: pricingBodyCta("body_dac7_model_20260921"),
      },
    ],
    faq: [
      {
        q: "Does DAC7 change which model I should buy to resell?",
        a: "No. DAC7 is a reporting trigger at 30 transactions or €2,000 gross. This week (snapshot 2026-09-20 21:38:24) Stone Island had 62 watched departures at €73 average on EU5 Vinted; Adidas had 5 at €26. Buy the model that still leaves. Run it on /tools. Not tax advice. We do not publish per-model buy-below here.",
      },
      {
        q: "Where do these numbers come from?",
        a: "Resale IQ /api/public/market-snapshot. 5,309,568 listings across ES, FR, DE, IT, PT. sold_7d is watched departures, a lower bound, not confirmed sales. We do not file or read DAC7 reports.",
      },
      {
        q: "Which model should I buy if I am already over the DAC7 threshold?",
        a: "The one still leaving the shelf at a price that covers your buy after fees. Stone Island hoodies 29 at €52 is a different cash bet than Gucci bags 10 at €452. Check the exact model on /tools.",
      },
    ],
  },
]
