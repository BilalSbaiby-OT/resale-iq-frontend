// Batch 119 — mixed editorial: reseller tools roundup. /tools is the ad.
// Not a brand-price clone. Numbers from /api/public/market-snapshot at publish (20 Sep 16:49).
// Say watched departures, never sold.

import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

export const POSTS_119: BlogPost[] = [
  {
    slug: "vinted-reseller-tools-2026",
    title: "Vinted Reseller Tools in 2026: What You Actually Need (and What You Don't)",
    seoTitle: "Vinted Reseller Tools 2026 — Demand Check, Fees, Photos | Resale IQ",
    description:
      "The only tools that change a buy decision: demand check, fee math, photos. Live EU5 watched-departure numbers from 5,341,780 listings. Skip the bloated stacks.",
    date: "2026-09-20",
    category: "Tools",
    readMins: 7,
    preflightQuery: "Vinted reseller tools",
    intro:
      "Most “Vinted tool stacks” are a spreadsheet, a photo app, and a dozen browser extensions that never get opened. The job is simpler: decide whether to buy an item to resell, then list it without eating fees. On 20 Sep 2026 Resale IQ watched 443 brand-level departures across published EU5 brands on 5,341,780 tracked listings (snapshot 16:49). Fred Perry left the shelf 84 times at €16 average. Stone Island jackets 19 times at €137. Gucci bags 11 times at €500. Those numbers are the tool. Everything else is support. Below is an honest roundup: demand check first, fee math second, photos third, and the junk you can skip.",
    definedTerm: {
      name: "Vinted reseller tools",
      description:
        "Software and workflows that help a reseller decide what to buy, at what price, and how to list — demand data, fee/profit math, and listing ops. Not sourcing marketplaces.",
    },
    sections: [
      {
        h: "The only tool that answers ‘should I buy this?’",
        p: [
          "A camera and Vinted’s own search do not tell you if a hoodie is worth €40 at the thrift shop. Demand does. Type the brand and model into a checker that uses watched departures — listings we observed leave the shelf — not asking prices. Asking prices are hopes.",
          "Live snapshot (20 Sep 2026, 16:49, EU5 ES/FR/DE/IT/PT): Fred Perry Shirts 31 watched at €13; Patagonia Jackets 31 at €33; Balenciaga Sneakers 18 at €193. If your buy price is above those medians after fees, you are paying for a story.",
          "Run that check on [Resale IQ tools](/tools) before you wire money. The page is the product: demand, then whether to buy. It is not a Vinted-to-Vinted sourcing bot.",
        ],
        cta: pricingBodyCta("ctr_tools_roundup_demand_20260920"),
      },
      {
        h: "Fee and profit math (do this in one place)",
        p: [
          "Vinted takes a seller fee and Buyer Protection sits on the buyer. Net is not list price. A €16 Fred Perry polo that looked like a €6 profit can be a €1 leftover once you count fees, shipping absorption (if you offered free shipping), and returns risk.",
          "Use one calculator. Do not maintain three Google Sheets that disagree. The [profit path on /tools](/tools) is enough for a go/no-go. Spreadsheets are for inventory after you already bought.",
        ],
      },
      {
        h: "Photos and listing ops — keep the stack tiny",
        p: [
          "Daylight, a clean floor, and the same crop every time beat a €30/mo AI studio. Buyers compare your listing to the last 31 Patagonia jackets that left the shelf at €33, not to a moodboard.",
          "Vinted’s native listing form is the listing tool. Cross-post later if you have volume. Country locales (ES/FR/DE/IT/PT) are scrape sources for demand, not a reason to write a ‘how to sell in France’ tutorial — Vinted already localises selling.",
        ],
      },
      {
        h: "What to skip",
        p: [
          "Skip: fake ‘deal finders’ that scrape the same public feed you can search, engagement pods, and any stack that promises authenticity verification. We name brands; we do not certify fakes vs real.",
          "Skip: another buy-below blog clone. If you already know Fred Perry shirts move at €13, you need the checker on the next item, not a 12th table of the same brand.",
        ],
      },
      {
        h: "Live snapshot used in this roundup",
        p: [
          "Source: Resale IQ public market snapshot, 20 Sep 2026 16:49. 5,341,780 listings tracked. 18 brands published (floor 5 watched departures / 7d). 443 watched departures on those brands. Treat weekly watched volume as a lower bound.",
        ],
        table: {
          caption:
            "Watched departures, trailing 7 days, EU5. Not confirmed sale receipts.",
          head: ["Brand / category", "Watched (7d)", "Avg €"],
          rows: [
            ["Fred Perry (all)", "84", "16"],
            ["Fred Perry Shirts", "31", "13"],
            ["Patagonia Jackets", "31", "33"],
            ["Stone Island Jackets", "19", "137"],
            ["Balenciaga Sneakers", "18", "193"],
            ["Gucci Bags", "11", "500"],
            ["New Balance Sneakers", "22", "48"],
          ],
        },
      },
      {
        h: "Where to go next",
        p: [
          "Check the item on [tools](/tools). Read live brand volumes on [data](" +
            ilinkHref("data") +
            "). Pricing is on [pricing](" +
            ilinkHref("pricing") +
            "). Operator is €19/mo if the checker already paid for itself on one buy you skipped.",
        ],
        cta: pricingMidCta("ctr_tools_roundup_close_20260920"),
      },
    ],
    faq: [
      {
        q: "What is the best Vinted reseller tool in 2026?",
        a: "The one that answers whether to buy, using watched departures not asking prices. Photos and fee math come after that. Resale IQ’s /tools page is built for that check.",
      },
      {
        q: "Do I need a sourcing extension?",
        a: "No. Resellers already have suppliers. The gap is demand: which models to buy from those sources. Extensions that hunt Vinted-to-Vinted flips are a different product.",
      },
      {
        q: "Are the prices in this article sale receipts?",
        a: "No. They are watched departures — listings we observed leave the shelf — from the public snapshot at 16:49 on 20 Sep 2026. Treat them as a lower bound.",
      },
    ],
  },
]
