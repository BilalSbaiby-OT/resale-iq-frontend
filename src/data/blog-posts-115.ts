// Batch 115 — Vinted fees explained: what sellers and buyers actually pay.
// Targets the #1 money question every reseller asks before listing.
// Sources: Vinted official help centre (IE/US/UK price lists, 2026),
// live API data (19 Sep 2026). Zero fabrication: all numbers from the live snapshot.

import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

export const POSTS_115: BlogPost[] = [
  {
    slug: "vinted-fees-explained",
    title: "Vinted Fees Explained: What Sellers and Buyers Actually Pay (2026)",
    seoTitle: "Vinted Fees Explained 2026 — Seller & Buyer Costs | Resale IQ",
    description:
      "Vinted charges sellers 0% commission — you keep 100% of your sale price. Buyers pay Buyer Protection (roughly 5% + €0.70, varies by market) plus shipping. Full fee breakdown with live market data from 5.4M tracked EU listings.",
    date: "2026-09-20",
    category: "Money",
    readMins: 6,

    preflightQuery: "Stone Island Hoodie",

    intro:
      "Vinted charges sellers zero commission — no final value fee, no listing fee, no payment processing deduction. When your item sells for €50, €50 goes into your Vinted wallet. The platform's revenue comes from the buyer side: a Buyer Protection fee (roughly 5% + €0.70, varies by market) plus shipping paid at checkout. Here is the exact fee breakdown, what it means for your profit, and how Vinted compares to every other resale platform.",

    definedTerm: {
      name: "Vinted seller fees",
      description:
        "Vinted charges 0% commission on standard sales. Sellers keep 100% of the item price. The platform's revenue comes from buyers: a Buyer Protection fee (typically 5% + €0.70 in the US/IE price lists, varying 3-8% + €0.30-0.80 in the EU depending on order value) plus buyer-paid shipping. Optional seller costs are Item Bumps (~€0.75-3.00) and Closet Spotlight (~€6.95/week) — both voluntary, neither required to sell.",
    },

    sections: [
      {
        h: "The short answer: selling on Vinted is free",
        p: [
          "Vinted's official position, stated on their help centre: there are no selling fees on Vinted. You keep 100% of what you earn. No final value fee, no commission, no payment processing deduction. When you list an item for €50 and it sells, €50 goes into your Vinted wallet before any optional seller-paid shipping or optional promotion.",
          "This makes Vinted structurally different from every other major resale platform. Depop charges sellers a payment processing fee. Poshmark takes 20% on sales over $15. Mercari takes 10%. eBay takes roughly 13% in most categories. Vinted takes 0% — the costs move to the buyer instead.",
          "The only money that can leave your pocket as a seller is optional: if you choose to offer free shipping (the standard flow is buyer-paid), or if you buy optional visibility features like Item Bumps. Neither is required to list or sell.",
        ],
        cta: pricingBodyCta("ctr_fees_short_answer_20260920"),
      },
      {
        h: "What buyers pay: the Buyer Protection fee",
        p: [
          "Vinted's revenue comes from the buyer side of checkout. Every order includes a Buyer Protection fee that covers dispute resolution, refunds, and purchase protection. The fee is mandatory, added automatically at checkout, and clearly displayed in the order summary before payment.",
          "The exact formula varies by market. In the US price list: 5% of the item price + a fixed $0.70 per order. On a $50 item, that is $3.20 total. In the EU/IE price lists: for orders under €500, a fixed €0.30-0.80 plus 3-8% of the item price (including VAT). For orders €500+, it is 3% of the item price including VAT. The fee varies by item characteristics, order value, and order type (single item vs bundle).",
          "What this means for you as a seller: the Buyer Protection fee does not reduce your payout. The buyer sees it as a separate line on top of your asking price. Your €50 sale earns you €50 — the buyer pays €50 + Buyer Protection + shipping. Price your item knowing the buyer sees a higher total, which is why under-pricing slightly (the 85% buy-below benchmark) can improve conversion without costing you margin.",
          `If a Balenciaga sneaker sells at €166 average on Vinted, the buyer sees roughly €166 + Buyer Protection (around €9-13 depending on market) + shipping. You receive €166 minus your sourcing cost. [Check what your item should sell for →](/tools)`,
        ],
        cta: pricingMidCta("ctr_fees_buyer_protection_20260920"),
      },
      {
        h: "Shipping: who pays and how it works",
        p: [
          "In the standard flow, the buyer pays for shipping at checkout. Vinted provides a prepaid shipping label — you print it and ship within the stated deadline (usually 5 business days). Nothing is deducted from your payout for shipping in this flow.",
          "Seller-paid shipping is optional: if you offer free shipping or a shipping discount, that cost is borne entirely by you. This is a conversion strategy, not a fee — many top sellers offer free shipping and bake the cost into the item price. The math: if shipping costs you €4 and you raise the item price by €4, the buyer sees 'free shipping' and you lose nothing. If you do not raise the price, you lose €4 per sale.",
          "Shipping costs vary by carrier, weight, and destination. Within the same country, typical ranges are €3-6 for clothing, €5-10 for shoes or heavy items, €8-15 for international. The label is prepaid — you do not buy postage separately.",
        ],
        cta: pricingBodyCta("ctr_fees_shipping_20260920"),
      },
      {
        h: "Optional paid features: Item Bumps and Closet Spotlight",
        p: [
          "Vinted offers two optional visibility products for sellers. Item Bumps cost roughly €0.75-3.00 per item and push one listing up in search results and feeds for a few days. Closet Spotlight costs roughly €6.95 per week and promotes your whole closet to browsing buyers.",
          "Both are strictly optional — neither is required to list, sell, or withdraw earnings. The fees are shown before payment, and you only pay if you actively choose to promote. Many sellers never buy either and rely on organic visibility (the 5 ranking factors: freshness, quality, engagement, price competitiveness, seller reputation).",
          "The trap: a €3 Bump on a €15 item is an effective 20% fee — Poshmark territory — and unlike a commission, you pay it whether or not the item sells. Use Bumps sparingly, only on items that have been sitting for 2+ weeks with no organic movement, and only when the expected margin justifies the cost. A €3 Bump on a €50 Balenciaga sneaker sale that yields €130 margin is a 2% cost. On a €16 Fred Perry shirt it is 19%.",
          `The live data shows where Bumps pay back. Fred Perry Shirts sold 72 times this week at €15 average — a Bump on a Fred Perry listing can work because the market is deep. Stone Island Jackets sold 26 times at €129 — the margin absorbs the Bump cost easily. But Calvin Klein sold only 6 times across all categories — no Bump fixes a thin market. [Check demand before spending →](${ilinkHref("flip")})`,
        ],
        cta: pricingMidCta("ctr_fees_bumps_20260920"),
      },
      {
        h: "How Vinted's fee model compares to every other platform",
        p: [
          "The comparison that matters: on a €50 sale, what do you actually keep? Vinted: €50.00 (0% seller fee). Depop: roughly €47.90 (payment processing fee, varies). Poshmark: €40.00 (20% on sales over $15). Mercari: €45.00 (10%). eBay: roughly €42.98 (roughly 13% in most categories, no store).",
          "Vinted's 0% seller fee is the most seller-friendly model among major resale platforms. The trade-off is reach: Vinted's buyer base is concentrated in Europe (the platform operates in 20+ countries but is strongest in the EU), so items can take longer to sell than on eBay or Poshmark in the US. The fee savings partially offset the longer time-to-sale.",
          "The real cost of selling on Vinted is not fees — it is time. With 0% commission, your profit margin is entirely determined by your buy-below price and your shipping strategy. A €30 item bought at €8 that sells at €30 yields €22 profit. The same item on Poshmark yields €18. The €4 difference is why the fee model matters for volume sellers.",
        ],
        cta: pricingBodyCta("ctr_fees_comparison_20260920"),
      },
      {
        h: "Calculating your actual profit after all costs",
        p: [
          "The profit formula for Vinted: Sale price − sourcing cost − packaging − optional seller-paid shipping − optional Bump = net profit. No platform fee is deducted. The sale price is what the buyer pays minus Buyer Protection and shipping (those go to Vinted, not you).",
          "Worked example with live data: A Patagonia Jacket sourced at €12 from a thrift store. Market average is €39 (66 sold this week). Price at €33 (85% of market for speed). Buyer pays €33 + Buyer Protection (~€2.40-3.50) + shipping (~€4). You receive €33. Profit: €33 − €12 sourcing − €1 packaging − €0 shipping (buyer-paid) = €20. If you offered free shipping at €4 cost: €16 profit. If you added a €2 Bump: €14 profit.",
          `The data shows which items justify the extra cost. Gucci Bags sold 18 times this week at €454 average — a €3 Bump on a €450 sale is 0.7% of margin. Uniqlo items sold 19 times at €10 average — a €3 Bump on a €10 sale is 30% of margin. The 0% fee model means the math is simple: your only real cost is what you paid for the item. [Check what to buy →](${ilinkHref("data")})`,
        ],
        cta: pricingMidCta("ctr_fees_profit_calc_20260920"),
      },
    ],

    faq: [
      {
        q: "Does Vinted take a commission from sellers?",
        a: "No. Vinted charges 0% seller commission on standard sales. You keep 100% of the item price. The platform's revenue comes from the buyer side: Buyer Protection fees and shipping paid at checkout.",
      },
      {
        q: "How much is the Buyer Protection fee?",
        a: "It varies by market and order value. In the US: 5% + $0.70 per order. In the EU/IE: for orders under €500, a fixed €0.30-0.80 plus 3-8% of the item price including VAT. For orders €500+: 3% including VAT. The fee is paid by the buyer at checkout and does not reduce the seller's payout.",
      },
      {
        q: "Is shipping free for sellers on Vinted?",
        a: "In the standard flow, yes — the buyer pays for shipping at checkout and Vinted provides a prepaid label. If you offer free shipping or a shipping discount, that cost is borne by you. This is optional, not a platform fee.",
      },
      {
        q: "What are Item Bumps and Closet Spotlight?",
        a: "Optional visibility products. Item Bumps (roughly €0.75-3.00) push one listing up in search for a few days. Closet Spotlight (roughly €6.95/week) promotes your whole closet. Both are voluntary — neither is required to sell. The fees are shown before payment.",
      },
      {
        q: "How does Vinted make money if selling is free?",
        a: "From buyers. Every order includes a mandatory Buyer Protection fee (roughly 5% + €0.70 in the US, varying 3-8% + €0.30-0.80 in the EU depending on order value) plus buyer-paid shipping. Vinted's business model is buyer-side revenue, not seller-side commissions.",
      },
      {
        q: "What is the real cost of selling on Vinted?",
        a: "Your sourcing cost (what you paid for the item) plus any optional costs you choose: seller-paid shipping, Item Bumps, or Closet Spotlight. There is no platform commission. On a €30 Patagonia Jacket bought at €12, your profit is €18 minus any optional costs.",
      },
    ],
  },
]
