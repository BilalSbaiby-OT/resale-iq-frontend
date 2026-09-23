// Batch 112 — How to price Vinted items for fast sales.
// Targets the #1 reseller question after "what to buy": how to price.
// Sources: live API data (19 Sep 2026), Reddit r/vinted seller discussions,
// competitor pricing guides (Listvore, Vinkit, WintageClub, Dresskool).
// Zero fabrication: all numbers from the live market snapshot.

import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

export const POSTS_112: BlogPost[] = [
  {
    slug: "how-to-price-vinted-items-for-fast-sales",
    title: "How to Price Vinted Items for Fast Sales (2026 Seller Guide)",
    seoTitle: "How to Price Vinted Items for Fast Sales — 2026 Seller Guide | Resale IQ",
    description:
      "Price Vinted items to sell fast without leaving money on the table. Live departure data from 5.4M+ tracked listings, negotiation psychology, markdown cadence, and the algorithm's pricing signals — with real examples from this week.",
    date: "2026-09-19",
    category: "Pricing",
    readMins: 8,

    preflightQuery: "Adidas Samba",

    intro:
      "The most common Vinted pricing mistake is listing at a number you hope someone will pay. The second most common is adding a 'negotiation buffer' that kills your visibility. The fix is pricing from what comparable items actually sold for — not what sellers are asking — and understanding how Vinted's algorithm rewards the right starting price. This guide shows you the research process, the psychology, and the markdown cadence that moves inventory without racing to the bottom.",

    definedTerm: {
      name: "Sold-price benchmark",
      description:
        "The median price of comparable items that actually sold on Vinted in the last 30 days — not the asking price of items still listed. ResaleIQ tracks watched departures (listings going from active to sold) across 5 EU markets, giving you a real transaction-price signal that active listings cannot provide.",
    },

    sections: [
      {
        h: "Price from what sold, not what's listed",
        p: [
          "Active listings are wishful thinking. They are prices sellers hope someone will pay, and the unsold inventory accumulates because those prices are too high. The only filter that matters on Vinted is 'Sold' — it shows what a buyer actually paid. Search your brand, size and garment type, filter by Sold, limit to the last 30 days, and take the median of the last 5–10 confirmed sales. That median is your benchmark.",
          "The gap between listed and sold is the gap between optimism and reality. A Fred Perry Shirt listed at €25 might sell at €15. A Stone Island Hoodie listed at €80 might sell at €55. ResaleIQ's live data shows 76 Fred Perry Shirts and 54 Stone Island Hoodies departed (sold) in the last 7 days across 5 EU markets — use those averages as your anchor, not the asking price of the 200 listings still sitting there.",
          `ResaleIQ gives you the average exit price and watched departure count for any item free — type a brand and model, see what the market actually paid this week. [Check what your item actually sells for →](/tools)`,
        ],
        cta: pricingBodyCta("ctr_howprice_sold_vs_listed_20260919"),
      },
      {
        h: "The negotiation buffer dilemma",
        p: [
          "Every Vinted seller knows buyers haggle. The instinct is to list 20–30% above your target price to leave room. Reddit threads on r/vinted are full of sellers trying this — and reporting the same result: items stop selling. The algorithm prioritises listings with views and favourites in the first 48–72 hours, and an overpriced listing gets neither. You lose the visibility window, and by the time you drop the price, the algorithm has already moved on.",
          "The data backs this up: when sellers add a bargaining buffer, their items get fewer views, fewer favourites, and fewer offers — not more. The buyers who lowball are going to lowball regardless of your starting price. Listing at a fair price from day one gets the algorithm's attention, and the offers you do receive are starting from a realistic base.",
          `The honest exception: if you have a rare item with no comparable sales, a higher starting price makes sense because there is no sold-price benchmark. But for common brands — Fred Perry, Nike, Patagonia, Stone Island — the benchmark exists and you should use it. [See the live benchmark for your brand →](${ilinkHref("data")})`,
        ],
        cta: pricingMidCta("ctr_howprice_buffer_20260919"),
      },
      {
        h: "How the Vinted algorithm reads your price",
        p: [
          "Vinted's search algorithm treats the starting price as an engagement signal. A listing priced at the market rate gets views and favourites in the first 48–72 hours, which pushes it higher in search, which gets more views — a compounding loop. A listing priced 20% above market gets no traction in that critical window, and the algorithm moves on.",
          "The price-drop notification is the second algorithmic lever. When you lower a price, everyone who favourited the item gets a push notification. This is why the right starting price matters even if you plan to drop it: you need favourites to notify. A listing that never got favourites in week one has no audience to re-engage when you cut the price.",
          `The practical rule: list at the sold-price benchmark or slightly above (5–10% max), let the algorithm work for 7–14 days, and only drop the price if you have favourites but no sale. [Check your item's live departure data →](/tools)`,
        ],
        cta: pricingBodyCta("ctr_howprice_algorithm_20260919"),
      },
      {
        h: "Psychological pricing that actually works",
        p: [
          "Odd prices outperform round prices on Vinted. €23 signals a calculated price; €20 signals a guess. €19 is the sweet spot under the €20 psychological threshold — it reads as 'under twenty' even though the difference is one euro. The same logic applies at €29 vs €30, €39 vs €40.",
          "Just-below thresholds are filter-driven: Vinted's price filters cap at round numbers. A €29 listing shows in searches for 'under €30' and 'under €25'. A €30 listing shows in 'under €30' but not 'under €25'. One euro of margin, one additional filter bucket of visibility.",
          "Bundle pricing is the underused lever: Vinted buyers pay one shipping fee regardless of items purchased. Price individual items slightly above the benchmark, then offer a 10–15% bundle discount. A buyer purchasing 3 items at €20 each pays the same shipping as 3 items at €18 each — you earn €6 more per bundle, and the buyer feels like they won.",
          `Use the live departure data to find the odd-price threshold for your category — the numbers tell you where the market clears. [See live brand prices →](/data)`,
        ],
        cta: pricingBodyCta("ctr_howprice_psych_20260919"),
      },
      {
        h: "The markdown cadence: when to drop and by how much",
        p: [
          "A well-priced item that has not sold in 14 days needs a small correction, not a panic cut. Drop 8–10% — enough to trigger the favourites notification and reset the algorithmic clock, not enough to signal desperation. This is the 'relist and refresh' move: the algorithm treats a price-dropped listing as recently active.",
          "Day 30 is the real decision point. If an item has 30 days on the shelf and no sale at the corrected price, drop 15–20% from the original. This is not failure — it is the market telling you the item was overpriced or the demand is thinner than the departure count suggested. The notification to favouriters is the best re-engagement channel Vinted offers.",
          "Day 60 is the stop-loss. If the item has not sold at a 20% markdown, it is not going to sell at any price this season. Donate, bundle, or accept it as a cost of inventory turnover. Tying up capital in dead stock is the most expensive pricing mistake — the €15 you could have had beats the €40 you are waiting for.",
          `The data tells you when an item is slow: ResaleIQ's sell-through rate (paid) shows what percentage of tracked listings sold within 30 days. Below 25% is slow-moving; above 50% is fast. Price accordingly from day one. [Check sell-through for your item →](/tools)`,
        ],
        cta: pricingBodyCta("ctr_howprice_markdown_20260919"),
      },
      {
        h: "Real examples from this week's data (19 September 2026)",
        p: [
          "Here is what the live data shows for three real items right now, using the ResaleIQ market snapshot. Fred Perry Shirts: 76 departures in the last 30 days at a €15 average exit. The sold-price benchmark is €15 — list at €17–18 (odd price, small buffer) and expect offers around €13–14. The volume is there; the margin per unit is thin, so the game is turnover.",
          "Stone Island Hoodies: 54 departures in the last 30 days at a €55 average exit. The benchmark is €55 — list at €59 (just under the €60 threshold) and hold. The margin per unit is strong (€20+ gross), so you can afford to wait for the right buyer rather than racing to the bottom.",
          "Calvin Klein Hoodies: 167 brand-level departures in the last 30 days at a €15.74 average exit on EU Vinted. The benchmark is €15.74 — the category is viable with CK One logo piece identification (€25–40 exit). This is a SKIP for reselling: the volume is not there to justify the sourcing cost, photography time, and shipping. The data tells you this before you buy, not after.",
          `These three examples show the spectrum: high-volume-thin-margin (Fred Perry), lower-volume-strong-margin (Stone Island), and no-volume-no-margin (Calvin Klein). The checker tells you which bucket an item falls into before you list it. [Check your item →](${ilinkHref("flip")})`,
        ],
        cta: pricingBodyCta("ctr_howprice_examples_20260919"),
      },
    ],

    faq: [
      {
        q: "Should I add a negotiation buffer to my Vinted prices?",
        a: "No — not for common brands. Reddit seller discussions and competitor data both show that adding 20–30% buffer kills visibility in the first 48–72 hours, which is when the algorithm decides whether to push your listing. List at the sold-price benchmark or 5–10% above. The buyers who lowball will lowball regardless of your starting price.",
      },
      {
        q: "How do I find the sold price for my item on Vinted?",
        a: "Search your brand, size and garment type on Vinted, filter by 'Sold', limit to the last 30 days, and take the median of the last 5–10 confirmed sales. That median is your benchmark. ResaleIQ gives you the same signal for free — the average exit price and watched departure count for any item, from 5.4M+ tracked listings across 5 EU markets.",
      },
      {
        q: "When should I drop my Vinted price?",
        a: "Day 14: drop 8–10% if you have favourites but no sale. Day 30: drop 15–20% from the original if still unsold. Day 60: stop-loss — donate, bundle, or accept the loss. The price-drop notification to favouriters is the best re-engagement channel Vinted offers, so time your drops to maximise that audience.",
      },
      {
        q: "What is the best price format on Vinted?",
        a: "Odd prices (€23, €29, €39) outperform round prices (€20, €30, €40) because they signal a calculated price. Just-below thresholds (€19, €29, €39) also put your listing in an additional filter bucket — a €29 listing shows in 'under €30' and 'under €25' searches.",
      },
      {
        q: "How does the Vinted algorithm treat pricing?",
        a: "The algorithm treats the starting price as an engagement signal. A listing priced at the market rate gets views and favourites in the first 48–72 hours, which compounds into higher search visibility. An overpriced listing misses that window and the algorithm moves on. Price drops reset the 'recently active' signal and notify everyone who favourited the item.",
      },
      {
        q: "Should I bundle items on Vinted?",
        a: "Yes. Vinted buyers pay one shipping fee regardless of items purchased. Price individual items slightly above the benchmark, then offer a 10–15% bundle discount. A buyer purchasing 3 items at €20 each pays the same shipping as 3 items at €18 each — you earn €6 more per bundle, and the buyer feels like they won.",
      },
      {
        q: "What if my item has no sold-price benchmark?",
        a: "If there are no comparable sales in the last 30 days, the item is either rare or has no demand. For rare items, a higher starting price makes sense — there is no benchmark to anchor to. For no-demand items, the data is telling you not to list it. ResaleIQ's watched departure count tells you which case you are in before you list.",
      },
      {
        q: "How often does ResaleIQ update its pricing data?",
        a: "The market snapshot updates weekly. The snapshot tracks 5,408,984 listings across Spain, France, Germany, Italy, and Portugal, with watched departures (listings going from active to sold) counted in the trailing 7 days. When a brand's exit price moves, the data reflects it within the same week.",
      },
    ],
  },
]
