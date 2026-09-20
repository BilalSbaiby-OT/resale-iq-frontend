// Batch 125 — Tony. Mixed how-to: reseller mistakes that kill margin, then which model to buy.
// Live numbers: /api/public/market-snapshot 2026-09-20 22:38:24 only.
// No per-model buy-below. No country-sales. No brand-price clone.

import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

export const POSTS_125: BlogPost[] = [
  {
    slug: "reseller-mistakes-which-model-to-buy-2026",
    title: "Reseller Mistakes That Kill Margin: Which Model to Buy (2026)",
    seoTitle: "Reseller Mistakes 2026 | Which Model to Buy | Resale IQ",
    description:
      "The expensive mistake is buying a brand, not a model. This week’s watched departures on 5,309,568 EU5 Vinted listings, then check the model on /tools.",
    date: "2026-09-21",
    category: "How-to",
    readMins: 6,
    preflightQuery: "Stone Island Hoodies",
    intro:
      "The margin killer is not a missing supplier. It is buying the brand instead of the model. Across 5,309,568 Vinted listings we track in ES, FR, DE, IT and PT, the week to 20 September 2026 showed Fred Perry leaving the shelf 46 times at €16 average — shirts 18 at €12. Stone Island also moved 46 times at €67 — hoodies 23 at €44. Patagonia 43 at €34. Gucci 24 at €276. New Balance 24 at €46. Balenciaga 20 at €134. Nike only 12 at €83. Adidas 5 at €26. Supreme 5 at €58. Thin names this week are a guess unless the checker shows a live sample. Run the exact model on /tools before you spend stock money. This page does not publish a per-model buy-below. We count watched departures, not confirmed cash sales. Ingest has been thin, so treat direction, not a 24-hour tick.",
    definedTerm: {
      name: "Reseller margin mistake (clothing)",
      description:
        "Buying a brand on name recognition instead of a model that still leaves the shelf this week. Resale IQ publishes brand and category watched-departure counts from the public EU5 Vinted snapshot. Per-model buy-below stays on the paid checker.",
    },
    sections: [
      {
        h: "Demand this week, then the mistake list",
        p: [
          "Public snapshot 20 September 2026 22:38 UTC. Listings tracked: 5,309,568. Counting method: watched transitions from active to gone in the trailing 7 days. Treat the weekly figure as a lower bound. Snapshot last_calculated is that stamp.",
          "Fred Perry 46 departures, €16 average. Stone Island 46, €67. Patagonia 43, €34. Gucci 24, €276. New Balance 24, €46. Balenciaga 20, €134. The North Face 16, €33. Nike 12, €83. Ralph Lauren 12, €52. Uniqlo 12, €10. Adidas 5, €26. Supreme 5, €58. High volume at a modest average (Fred Perry shirts) turns. Thin, expensive names are a different cash bet.",
        ],
        table: {
          caption:
            "Watched departures, trailing 7 days, EU5 Vinted. Source: Resale IQ market snapshot 2026-09-20 22:38:24. Not sale confirmations.",
          head: ["Brand", "Watched departures (7d)", "Avg €", "Hottest category"],
          rows: [
            ["Fred Perry", "46", "16", "Shirts"],
            ["Stone Island", "46", "67", "Hoodies"],
            ["Patagonia", "43", "34", "Jackets"],
            ["Gucci", "24", "276", "Bags"],
            ["New Balance", "24", "46", "Sneakers"],
            ["Balenciaga", "20", "134", "Sneakers"],
            ["The North Face", "16", "33", "Jackets"],
            ["Nike", "12", "83", "Sneakers"],
            ["Ralph Lauren", "12", "52", "Hoodies"],
            ["Adidas", "5", "26", "Tracksuits"],
          ],
        },
        cta: pricingMidCta("ctr_reseller_mistakes_20260921"),
      },
      {
        h: "Four mistakes that wipe the buy",
        p: [
          "Buying the logo. Nike at 12 departures this week is not the same cash as Stone Island hoodies at 23. Brand fame is not demand.",
          "Ignoring fees. A €67 Stone Island average is not your net. Buyer protection plus shipping plus your buy price decide whether the unit is a BUY. Run /tools, not a screenshot of the listing.",
          "Stocking the thin week. Adidas 5 and Supreme 5 are below a useful sample unless the checker shows the exact model still moving. Another unit is a death-pile bet.",
          "Confusing a departure with a sale. We watched the listing leave. We did not watch the card. Price as if the average is a ceiling, not a promise.",
        ],
      },
      {
        h: "Check the model on /tools before you buy",
        p: [
          "You already have a supplier. Type brand plus model, not the brand alone. Read demand and the fee-aware ceiling. If volume is thin this week, skip the unit.",
          `Cite the same weekly table on [market data](${ilinkHref("data")}). Then use [the demand checker](${ilinkHref("flip")}) — Starter €19 — if you are about to spend stock money.`,
        ],
        cta: pricingBodyCta("body_reseller_mistakes_20260921"),
      },
    ],
    faq: [
      {
        q: "What is the biggest reseller mistake on Vinted in 2026?",
        a: "Buying a brand instead of a model that still leaves the shelf. Snapshot 2026-09-20 22:38:24: Fred Perry 46 watched departures at €16; Adidas 5 at €26. Run the exact model on /tools. We do not publish per-model buy-below here.",
      },
      {
        q: "Where do these numbers come from?",
        a: "Resale IQ /api/public/market-snapshot. 5,309,568 listings across ES, FR, DE, IT, PT. sold_7d is watched departures, a lower bound, not confirmed sales.",
      },
      {
        q: "Which clothing model should I buy to resell?",
        a: "The one still leaving the shelf at a price that covers your buy after fees. Stone Island hoodies 23 at €44 is a different bet than Gucci bags 10 at €452. Check the exact model on /tools.",
      },
    ],
  },
]
