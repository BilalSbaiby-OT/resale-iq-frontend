// Batch 19 of SEO/AEO articles. Same contract as blog-posts.ts.
// Honest claims only: no earnings guarantees, no tax/legal advice as professional advice.
// All departure data from /api/public/market-snapshot (2026-09-15 build).

import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

export const POSTS_19: BlogPost[] = [
  {
    slug: "how-to-flip-clothes-for-profit",
    title: "How to Flip Clothes for Profit (The Full Method, 2026)",
    seoTitle: "How to Flip Clothes for Profit — Resale IQ",
    description:
      "The complete process for flipping clothes for profit on Vinted: which brands to source, what to pay, how to price for fast departures, and how to scale the operation. Based on live EU Vinted departure data.",
    date: "2026-09-15",
    category: "Sourcing",
    readMins: 12,
    intro:
      "Flipping clothes for profit is a two-variable problem: buy below what the market pays on departure, and sell before holding costs eat the margin. Every other detail — sourcing location, listing quality, pricing — is in service of those two constraints. This guide covers the full process end to end, built around EU Vinted departure data for the 28 brands Resale IQ tracks.",
    definedTerm: {
      name: "Flip",
      description:
        "In clothing resale, a flip is the cycle from purchase to departure: buying an item below its expected exit price, listing it, and completing a sale for a profit. Resale IQ tracks departure rates and average exit prices across 28 brands on EU Vinted to give resellers real buy-below targets for each flip.",
    },
    sections: [
      {
        h: "Step 1: Pick brands with liquid markets",
        p: [
          "You cannot flip a brand nobody is buying. The first filter for any sourcing run is departure rate — how many items for this brand actually left the shelf on Vinted in the last 7 days.",
          "As of 15 September 2026, the highest-velocity EU Vinted brands by departure are: Fred Perry (862 departures/7d, avg €18), Patagonia (756/7d, avg €37), Stone Island (753/7d, avg €70), Balenciaga (510/7d, avg €147), New Balance (260/7d, avg €49). A high departure rate means buyers are active. An active buyer market means you can move stock in days rather than weeks.",
          "Low-velocity brands (Mango at 17/7d, Jordan at 15/7d) are not automatically bad — Jordan Sneakers depart at €156 average, so a single flip has high margin potential — but they require more patience and capital held longer.",
          "Check departure rates by brand and category at [Resale IQ's flip tracker](" + ilinkHref("flip") + ") before any sourcing run. The brands on the board are ranked by volume — start at the top and work down to your sourcing channel.",
        ],
      },
      {
        h: "Step 2: Calculate your buy-below price before you shop",
        p: [
          "Most resellers lose money at the buy, not the sell. They find an item, estimate it's worth something, and pay near retail. Then they list it, discover the Vinted departure average is lower than expected, and either hold the item at a loss or exit below the buy-below threshold.",
          "The correct sequence is: look up the departure average first, calculate your buy-below, then shop. Never the reverse.",
          "Buy-below formula: `departure average × 0.95 × 0.70`. The 0.95 models the Vinted platform fee deduction; the 0.70 targets approximately 30% margin. Example: Patagonia Hoodies depart at €41 average. Buy-below = €41 × 0.95 × 0.70 = €27.24. Pay up to €27 and you have a 30% margin. Pay €35 and you are working for €2.20.",
          "Adjust the 0.70 multiplier for higher-risk categories (designer, authentication-dependent) and raise it toward 0.80 for fast-velocity basics where the market is predictable. The formula is in depth at [buy-below price explained](/blog/buy-below-price-explained).",
        ],
        cta: pricingMidCta("ctr_flip_20260915"),
      },
      {
        h: "Step 3: Where to source stock",
        p: [
          "Sourcing channels from highest to lowest buy-below headroom:",
          "**Charity shops (thrift/op shops):** Prices are set by volunteer staff with no live market data. A Stone Island hoodie at a charity shop is often priced at €6–12 — against a departure average of €56. This is the highest-margin channel when it works. The constraint is unpredictability: you visit 10 shops to find 2 items worth flipping.",
          "**Car boot sales / flea markets:** Similar pricing logic to charity shops but concentrated — you see 50 sellers in one morning. Best for volume sourcing of Fred Perry, Lacoste, Tommy Hilfiger — brands with mass-market presence that end up at flea markets in volume.",
          "**Marketplace cross-sourcing (Facebook Marketplace, eBay):** Items listed below departure average by sellers who don't know Vinted values. Search the brand + category, filter by 'lowest price', and check each result against your buy-below number. Takes more time per item but scales to any volume.",
          "**Bulk lots and pallets:** High variance. A 30-item mixed lot for €80 might contain 3 flippable items (ROI positive) or 25 (significant upside). Covered in detail at [buying wholesale pallets](/blog/buying-wholesale-pallets-reselling). Not recommended until you have 20+ single-item flips under your belt — you need calibrated eyes before you can evaluate a lot efficiently.",
          "For the new reseller: start with charity shops in your area, one sourcing run per week, focus on two or three brands you know well. Build pattern recognition on what good condition looks like for those brands before expanding.",
        ],
      },
      {
        h: "Step 4: Authenticate before you buy designer pieces",
        p: [
          "Authentication failures are the most expensive mistakes in clothes flipping. A Gucci bag purchased for €90 and sold for €300, then returned as fake, costs more than the initial margin — it costs the €90 buy, the €300 hold, the shipping cost both ways, and a dispute on your Vinted profile.",
          "For designer items (Gucci, Balenciaga, Off-White, Supreme), authenticate before purchase. The key checks are brand-specific but the universal checkpoints are: (1) hardware weight — cheap fakes have light hollow metal; (2) stitching regularity — authentic pieces are machine-made to tight tolerances; (3) logo placement and proportions; (4) serial number presence and format.",
          "Gucci Bags depart at an average €304 on EU Vinted (81 departures/7 days). The margin on a €90 authenticated sourcing is significant — but only if the item is what it claims to be. Full authentication guide at [how to authenticate designer items on Vinted](/blog/how-to-authenticate-designer-items-vinted).",
          "For Stone Island, Ralph Lauren, Patagonia — brands with strong resale value but active fakes — check the label, badge stitching, and hardware before purchase. Do not rely on the seller's claim.",
        ],
      },
      {
        h: "Step 5: List the item correctly",
        p: [
          "A sourced item that sits for 30 days is not a flip — it is inventory with a slow bleed. Listing quality determines how quickly the item moves through the buyer market.",
          "The formula that works: **Brand + Item type + Size + Colour + One key descriptor** in the title. 'Patagonia Better Sweater Fleece Jacket S/M Navy' not 'Gorgeous fleece jacket barely worn 🔥'. Vinted's search is keyword-matching — buyers search terms, not adjectives.",
          "Photo order: (1) flat lay full garment on clean light surface, (2) brand label close-up, (3) any flaw exactly as it is, (4) worn or styled if it's a Jacket/Hoodie/Coat. Do not use flash. Morning window light. Five minutes of setup saves three weeks of sitting.",
          "Price within 10% of the departure average for the brand/category. Check [vinted photo tips that convert](/blog/vinted-photo-tips-that-sell) and [best vinted selling tips](/blog/best-vinted-selling-tips) for the full listing playbook.",
        ],
      },
      {
        h: "Step 6: Apply the 14-day refresh rule",
        p: [
          "An item that hasn't departed in 14 days needs intervention, not patience.",
          "Day 10: drop the price by €1–3 to enter Vinted's 'reduced items' feed. This is a visibility refresh, not a markdown. The feed surfaces reduced listings to active buyers who may not have seen your item in regular search.",
          "Day 14: if still unsold, review the listing. Check your price against the current departure average (markets shift — re-check with live data). Assess whether the photos clearly show condition and size. Read the description as a buyer would — does it answer the 5 standard pre-purchase questions?",
          "Day 21: if still no movement, unpublish and re-publish as a new listing. This fully resets search position. One unpublish-relist per stale item is standard practice; bulk re-publishing patterns are penalised by the algorithm.",
          "If an item fails to depart after two re-lists at or below buy-below price, the item is not sellable at a profit in this market. Take the loss at €1–5 below buy-below and free the capital for something that will move. Full approach to stalling items at [vinted item not selling](/blog/vinted-item-not-selling).",
        ],
      },
      {
        h: "Step 7: Reinvest profit, not turnover",
        p: [
          "The arithmetic mistake that kills early flipping operations: spending revenue rather than profit. If you source a Fred Perry Polo for €5 and sell for €18, the profit is not €18. It is €18 minus the €5 cost, minus time, minus shipping materials, minus any platform fees. In this case, roughly €11–12.",
          "The discipline: track every item with cost, sale price, and expenses. After 20 items, you have a real average margin. Use that average to size your next sourcing budget — reinvest the profit percentage, keep the principal available.",
          "Simple record-keeping approach at [reseller record keeping basics](/blog/reseller-record-keeping-basics). At small scale, a spreadsheet is sufficient. The column headings that matter: Item, Source, Cost, Sale Date, Sale Price, Net Margin.",
          "Scaling looks like this: 5 flips in week 1 → track results → increase sourcing budget by the profit → 8 flips in week 2 → repeat. The compounding is slow at the start and accelerates when you build pattern recognition on what moves and what doesn't.",
        ],
      },
      {
        h: "What the best-margin categories are right now",
        p: [
          "Based on EU Vinted departures for the 7 days to 15 September 2026:",
          "**Highest absolute margin (departure avg minus typical sourcing cost):** Stone Island Jackets (€140 avg departure), Gucci Bags (€304), Balenciaga Sneakers (€145), Jordan Sneakers (€156). These have €50–200+ potential margin per flip if sourced correctly. The constraint is sourcing frequency — these items don't appear at charity shops every week.",
          "**Highest volume + reasonable margin:** Fred Perry Shirts (421 departures/7d, avg €14 — sourcing typically €2–5 at thrift), Stone Island Hoodies (408/7d, avg €56 — typically €10–20 if found), Patagonia Jackets (313/7d, avg €50 — €10–18 at charity).",
          "**Best for starting out:** Fred Perry (predictable, high volume, easy to authenticate), Patagonia (strong resale demand, clear authentication markers, fast departure), Tommy Hilfiger Hoodies (42 departures/7d, avg €17 — lower margin but very common at thrift).",
          "The full departure table with buy-below calculations is at [what sells best on Vinted](/blog/what-sells-best-on-vinted). Use it before every sourcing run.",
        ],
        cta: pricingBodyCta("body_flip_20260915"),
      },
    ],
    faq: [
      {
        q: "How much money can you make flipping clothes?",
        a: "It depends on the brands you source and how many items you move per week. At 10 flips per week with an average net margin of €10 per flip, that is €100/week or €400/month. Fred Perry at 862 departures per 7 days on EU Vinted shows high buyer demand — a reseller sourcing Fred Perry at €3–5 per item and exiting at €15–18 has a €10+ margin per flip. Scaling to 30–50 flips per week with higher-margin brands (Stone Island, Patagonia) is where income becomes material.",
      },
      {
        q: "What's the best brand to flip on Vinted?",
        a: "For new resellers: Fred Perry (862 EU Vinted departures/7d, avg €18, easy to source at charity shops) and Patagonia (756/7d, avg €37, clear authentication). For experienced resellers: Stone Island (753/7d, avg €70 for Hoodies, €140 for Jackets) and Balenciaga (510/7d, avg €147). The right brand is the intersection of what departs fast in the current market and what you can source below buy-below price in your area.",
      },
      {
        q: "How do you source clothes to flip?",
        a: "Start with charity shops and thrift stores — they price without live market data, which is where buy-below margins are widest. Flea markets and car boots are good for volume sourcing of Fred Perry, Lacoste, and Tommy Hilfiger. Facebook Marketplace and eBay work for cross-platform arbitrage. Always calculate your buy-below number (departure average × 0.95 × 0.70) before you shop — never estimate in the shop.",
      },
      {
        q: "How do you price clothes to flip on Vinted?",
        a: "Price within 10% of the departure average for the brand and category. Departure averages are actual completed sales, not listed prices — they tell you what buyers paid, not what sellers hoped for. Resale IQ tracks departure averages across 28 EU Vinted brands. Example: Patagonia Hoodies at €41 average departure — price at €38–43 for fast movement. Price at €55 and you're outside the clearing range.",
      },
      {
        q: "How long does it take to sell flipped clothes on Vinted?",
        a: "A well-priced, well-photographed item in a high-velocity category (Fred Perry, Stone Island, Patagonia) can depart in 24–72 hours. Lower-velocity brands or unusual sizes may take 7–14 days. If an item hasn't sold in 14 days, apply the price reduction refresh. If it's stalled past 21 days, unpublish and re-list as new. Track your average days-to-departure by brand — it is the most important signal for sizing your working capital.",
      },
      {
        q: "Do you need a business account to flip clothes on Vinted?",
        a: "Vinted distinguishes private and professional sellers. If you are flipping regularly and for profit, in most EU jurisdictions you are operating a business and should register accordingly — Vinted's terms require professional registration above certain volume thresholds. Tax treatment varies by country. This guide covers the resale mechanics; consult a local accountant for tax and registration specifics.",
      },
    ],
  },
]
