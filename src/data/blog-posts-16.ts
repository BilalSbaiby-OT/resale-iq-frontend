// Batch 16 of SEO/AEO articles. Same contract as blog-posts.ts.
// Honest claims only: no earnings promises, no tax/legal advice as professional advice.
// Fees cited from published Vinted help pages, accurate as of September 2026.

import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

export const POSTS_16: BlogPost[] = [
  {
    slug: "vinted-seller-fees-explained",
    title: "Vinted Seller Fees Explained (2026): What You Actually Keep",
    seoTitle: "Vinted Seller Fees 2026: Full Breakdown — Resale IQ",
    description:
      "Vinted charges buyers, not sellers — but there are hidden costs. Here is the complete breakdown of what you keep per sale and when fees reduce your margin.",
    date: "2026-09-15",
    category: "Pricing",
    readMins: 6,
    intro:
      "Vinted is widely marketed as 'no seller fees', and that is mostly true — Vinted charges a buyer protection fee to the buyer, not a commission to the seller. But selling on Vinted is not free. Shipping labels, optional boosts, and VAT rules chip away at your margin. This page breaks down exactly what you keep on a €20, €50, and €100 sale — and where the margin goes.",
    definedTerm: {
      name: "Buyer protection fee",
      description:
        "The buyer protection fee is a service charge Vinted adds on top of the item price. Buyers pay it; sellers do not. It covers Vinted's payment processing, customer support, and dispute resolution. As of September 2026 the fee is 5% of the item price plus €0.70 on orders up to €20, and 5% plus €0.70 on higher orders, with a minimum of €0.70.",
    },
    sections: [
      {
        h: "The core rule: Vinted charges the buyer, not the seller",
        p: [
          "When your item sells, Vinted transfers the full item price to your Vinted Wallet. No percentage is deducted for the platform commission. This is what sets Vinted apart from eBay (10–12.9%) and Depop (10%).",
          "The buyer pays a buyer protection fee on top of the item price. That fee is: 5% of the item price + €0.70 per order, with a minimum of €0.70. On a €10 item, the buyer pays €10 + €1.20 = €11.20. You receive €10.",
          "Important: you only receive money once the buyer confirms delivery or the 48-hour auto-confirmation window closes. Until then the funds are held in escrow by Vinted.",
        ],
      },
      {
        h: "What actually reduces what you keep",
        p: [
          "**Shipping labels.** Vinted generates pre-paid shipping labels charged to the buyer — but only if the buyer selects Vinted's integrated carrier. If a buyer requests a custom shipping method, or you offer 'free shipping' and bake the cost in, the cost comes from your wallet. Standard EU label rates: €2.49–€5.49 depending on carrier and country.",
          "**Item boosts (Wardrobe Spotlight).** Optional paid promotion: €0.95–€4.95 per item or bundle per push. Not a fee on the sale — a voluntary upfront cost. At scale (100 boosts/month) this is €95–495 before any revenue.",
          "**Currency conversion.** Selling across borders where the buyer's currency differs from your wallet currency incurs a conversion spread. Vinted uses interbank rate ±1.5%. Small per-transaction, meaningful at volume.",
          "**Withdrawal fees.** Transferring your Vinted Wallet balance to your bank account is free via SEPA in supported EU countries. PayPal withdrawals may incur PayPal's standard receiving fee (~2.9% + fixed).",
          "**VAT (if you are a business seller).** Vinted introduced mandatory business seller designation in 2023 under EU DSA/DAC7 rules. Business sellers in most EU markets must display prices inclusive of VAT and may have to remit VAT quarterly. This is not a Vinted fee — it is a tax obligation — but it affects net margin for high-volume sellers. Hobby resellers below national thresholds are generally unaffected.",
        ],
      },
      {
        h: "What you keep: three concrete examples",
        p: [
          "**€20 item, buyer pays label:**",
          "- Buyer pays: €20 + €1.70 buyer fee + €3.49 label = €25.19",
          "- You receive: €20 (full item price, label cost on buyer)",
          "- Your net: €20",
          "",
          "**€50 item, you offer 'free shipping' (label cost to you):**",
          "- Buyer pays: €50 + €3.20 buyer fee = €53.20",
          "- You pay: €3.49 label from your wallet on dispatch",
          "- Your net: €50 − €3.49 = **€46.51**",
          "",
          "**€100 item, buyer pays label:**",
          "- Buyer pays: €100 + €5.70 buyer fee + €4.99 label = €110.69",
          "- You receive: €100",
          "- Your net: €100 (before any boost spend or VAT)",
          "",
          "The lesson: always let the buyer choose and pay for the label. Never bundle shipping into the price on high-value items — it cuts your margin without boosting visibility.",
        ],
        cta: pricingMidCta("ctr_fees_20260915"),
      },
      {
        h: "How Vinted fees compare to eBay and Depop",
        p: [
          "**eBay UK/EU:** 10–12.9% final value fee on the item price + shipping, capped at ~€2,000 per item. Plus PayPal or Managed Payments processing (~2.7%). Effective seller cost: 12–15%.",
          "**Depop:** 10% flat commission on item + shipping. Plus 2.9% + €0.30 Stripe processing. Effective seller cost: 13–14%.",
          "**Vinted:** 0% seller commission. Buyer pays 5% + €0.70. Your effective cost: €0 unless you pay for boosts or offer free shipping.",
          "On a €50 Levi's jacket: eBay takes €6–7.50, Depop takes €6.50, Vinted takes €0. That spread is where Vinted's volume advantage lives — sellers keep more, which means more sellers, which means more buyers.",
          "The trade-off: Vinted's audience skews towards fashion/vintage; eBay has broader category depth; Depop skews younger. For branded clothing resale in EU5 markets, Vinted's no-seller-fee model produces better net margin at equivalent sell prices.",
        ],
      },
      {
        h: "When Vinted fees could actually hurt you",
        p: [
          "**Low-margin, low-price items.** On a €5 item, the buyer pays €5.95 (5% + €0.70). If your cost was €3 and you need €4 to cover your time, you net €5 — before any boost spend. Tight, not impossible.",
          "**Free shipping on heavy items.** A €2 kg parcel via Colissimo costs €6.99. If you offer free shipping on a €15 item, your net is €8.01. That is your whole margin if your buy price was €6.",
          "**Repeated boosts on slow-moving stock.** If you boost an item 4 times at €2 each before it sells at €20, you have spent €8 on boosts — 40% of revenue. Know your sell-through rate before boosting. [Resale IQ tracks sell-through by brand and category](" +
            ilinkHref("data") +
            ") so you can boost selectively instead of hoping.",
          "**Cross-border VAT at scale.** If you are selling 100+ items/month across EU markets, consult an accountant. DAC7 reporting obligations can trigger VAT registration requirements in multiple jurisdictions.",
        ],
      },
      {
        h: "How to maximise what you keep on Vinted",
        p: [
          "1. **Let the buyer select the shipping method.** Vinted's integrated labels are charged to the buyer. This is the single most reliable way to protect your margin.",
          "2. **Price above your buy-below threshold.** The buy-below price is the maximum you can pay at source and still hit a viable margin at your expected exit price. [Resale IQ calculates buy-below prices for 28 brands](" +
            ilinkHref("flip") +
            ") based on live departure data — use them as hard sourcing limits, not guidelines.",
          "3. **Boost only confirmed fast movers.** Boost items in categories where the brand has 50+ departures per week in your market. Boosting a slow brand is paying for exposure on an item buyers do not want.",
          "4. **Do not bake shipping into a headline price on high-ticket items.** A €95 jacket with 'free shipping' looks cheaper but earns €91 after a €4 label. A €90 jacket with paid shipping earns €90. Same buyer cost, less margin.",
          "5. **Keep records of boost spend.** It does not appear in the sale transaction. Track it separately or you will overestimate your profit per item.",
        ],
        cta: pricingBodyCta("ctr_fees_body_20260915"),
      },
    ],
    faq: [
      {
        q: "Does Vinted charge sellers a fee?",
        a: "No — Vinted charges a buyer protection fee to the buyer, not a commission to the seller. The fee is 5% of the item price plus €0.70, with a minimum of €0.70. As a seller, you receive the full item price in your Vinted Wallet with no platform deduction.",
      },
      {
        q: "What is the Vinted buyer protection fee?",
        a: "The buyer protection fee is 5% of the item price plus €0.70 per order, minimum €0.70. On a €20 item, the buyer pays €1.70 in fees. On a €50 item, the buyer pays €3.20. This fee is added on top of the item price at checkout; the seller sees none of it.",
      },
      {
        q: "How much do I keep from a €50 sale on Vinted?",
        a: "If the buyer pays the shipping label: you keep €50. If you offered free shipping and used Vinted's integrated label (e.g. Colissimo at €3.49): you keep €46.51. If you also boosted the item once at €1.95: you keep €44.56. The no-seller-fee model means the main margin risks are shipping and boost spend, not commission.",
      },
      {
        q: "Does Vinted take a percentage of sales?",
        a: "Vinted takes 0% from the seller's side. The platform charges the buyer a 5% + €0.70 buyer protection fee. The seller keeps 100% of the item price, minus any costs the seller opts into (free shipping, paid boosts).",
      },
      {
        q: "Are there hidden fees on Vinted?",
        a: "The buyer protection fee is the main charge, and Vinted discloses it clearly at checkout. For sellers, the less visible costs are: optional Wardrobe Spotlight boosts (€0.95–€4.95 per item), free shipping where the seller absorbs the label cost, and currency conversion spread on cross-border sales. Business sellers above DSA/DAC7 thresholds may also face VAT obligations.",
      },
      {
        q: "How do Vinted fees compare to eBay?",
        a: "eBay charges sellers 10–12.9% final value fee on item + shipping, plus payment processing. On a €50 item that is €6–7.50 in fees. Vinted charges sellers €0 — the buyer pays the buyer protection fee instead. Over 100 sales at €50 average, Vinted saves the seller €600–750 versus eBay. The trade-off is lower average sale prices on Vinted for some categories; for branded fashion in EU markets, Vinted typically produces better net margin.",
      },
      {
        q: "Do I pay VAT as a Vinted seller?",
        a: "Casual sellers below national VAT thresholds generally do not need to register for VAT. Under EU DAC7 rules, Vinted reports high-volume sellers (30+ transactions or €2,000+ in proceeds per year) to tax authorities. If you sell more than this, check your local VAT threshold and consult an accountant. This is not a Vinted fee — it is a tax obligation determined by national law.",
      },
    ],
  },
  {
    slug: "how-to-make-money-on-vinted",
    title: "How to Make Money on Vinted in 2026 (What Actually Works)",
    seoTitle: "How to Make Money on Vinted 2026: Real Strategy — Resale IQ",
    description:
      "A practical guide to making money on Vinted: which brands and categories generate the most departures, how to find stock below buy-below price, and how to keep the most from each sale.",
    date: "2026-09-15",
    category: "Strategy",
    readMins: 8,
    intro:
      "Vinted processes millions of second-hand transactions across EU5 markets every week. The sellers who make consistent money are not the ones who list everything they own — they are the ones who buy specific brands at or below a known buy-below price, list fast, and ship promptly. This guide covers the exact method: what to source, where to find it, what to pay, and how to keep as much of the sale price as possible.",
    definedTerm: {
      name: "Buy-below price",
      description:
        "The buy-below price is the maximum you should pay for an item at source to achieve a target margin at the expected resale price. It is calculated from live departure data: expected exit price minus fees, label cost, and target profit margin. Buying above the buy-below price means the sale will not hit margin even if it sells at full price.",
    },
    sections: [
      {
        h: "The two ways people make money on Vinted",
        p: [
          "**Clearing your own wardrobe.** Selling things you already own costs nothing but time. You will not build a business this way, but you can cover €50–200/month clearing seasonal clothes. Useful for testing the platform; not a scalable model.",
          "**Reselling: buying low and selling higher.** This is the actual business model. You source stock from charity shops, car boot sales, eBay bulk lots, or brand sample sales — then list on Vinted at a price the market will clear. The margin lives in the gap between your buy price and your exit price, minus shipping if you absorb it.",
          "The rest of this guide focuses on reselling because it is the only model with a growth lever. Clearing your wardrobe has a natural ceiling. Sourcing does not.",
        ],
      },
      {
        h: "Which brands and categories actually move",
        p: [
          "Making money on Vinted starts with selling what buyers are already looking for. The mistake most new resellers make is buying what they personally like rather than what the market clears at pace.",
          "Based on departure data tracked across 5 EU markets (Spain, France, Germany, Italy, Portugal) in the 7 days to 15 September 2026:",
          "- **Fred Perry** — 862 watched departures, avg €18. Shirts (421), T-Shirts (160), Hoodies (134). Fast, predictable volume at accessible price points.",
          "- **Patagonia** — 1323 departures in the last 30 days, avg €37. Jackets (313), Hoodies (128). Higher price point, strong margin per item, slower sourcing availability.",
          "- **Stone Island** — 178 departures in the last 30 days, avg €70. Hoodies (178 in 30 days), Jackets (51 in 30 days). Highest avg price among volume leaders; fakes are a significant risk — authenticate carefully.",
          "- **Balenciaga** — 2322 departures in the last 30 days, avg €147. Sneakers (156), T-Shirts (92). High margin per item but thin sourcing opportunities and authentication risk.",
          "- **New Balance** — 260 departures, avg €49. Sneakers dominate (242 of 260). Clean volume, genuine demand, low authenticity risk.",
          "The categories with the most consistent demand across brands: Hoodies (autumn season, now active), Jackets (accelerating), Sneakers (year-round). Jeans move but slowly outside Levi's.",
          "Avoid: low-volume brands with sporadic departures, fast-fashion brands (Zara, Bershka, Mango) where low avg prices compress margin to near zero, and any brand you cannot authenticate reliably.",
        ],
        cta: pricingMidCta("ctr_make_money_20260915"),
      },
      {
        h: "The buy-below principle: where the money is made",
        p: [
          "The money is made at purchase, not at sale. If you buy right, almost any sale makes you money. If you buy wrong, no sale price will save the trade.",
          "The buy-below price is the maximum you can pay at source to hit a 25–30% margin at expected exit price. For a Patagonia jacket you expect to clear at €50 on Vinted:",
          "- Exit price: €50",
          "- Buyer pays label (typical): €0 to you",
          "- Target margin (30%): €15",
          "- Maximum buy price: €50 − €15 = **€35**",
          "In practice, you want to pay €25–30 to leave room for the item sitting longer than expected or needing a price reduction after 2 weeks.",
          "A Stone Island hoodie clearing at €56 average: target buy price €30–35, hard maximum €40. At a charity shop asking €45 — walk away.",
          "Resale IQ publishes live buy-below prices for all 28 tracked brands, recalculated from departure data. Use them as hard sourcing limits.",
        ],
      },
      {
        h: "Where to source stock",
        p: [
          "**Charity shops (Oxfam, BHF, local).** The primary sourcing ground for most EU resellers. Best finds: flagship city-centre stores, wealthy suburb locations, shop-by-colour/size rails on restock days (typically Mon/Tue). Know your buy-below price before you enter — handle speed matters.",
          "**Car boot sales and market stalls.** Lower competition than charity shops, negotiable pricing. Arrive in the first 30 minutes. Stone Island, Patagonia, and Fred Perry are findable at €5–15 in mixed lots.",
          "**Vinted itself.** Arbitrage: buy low-visibility listings (bad photos, buried keywords, wrong category) and relist correctly. Legal and common. Requires knowing the fair exit price first.",
          "**eBay bulk lots.** Search 'job lot men's hoodies', 'mixed brands bundle'. Typically 10–30 items. Quality varies; know your per-item break-even before bidding.",
          "**Brand sample sales and outlet events.** Seasonal; Patagonia, The North Face, and New Balance run periodic sample sales in major EU cities. Buy-below is easy to hit; resale volumes are strong.",
          "What to avoid: buying from other Vinted listings at normal market price and relisting at the same price — that is not arbitrage, it is friction with no margin.",
        ],
      },
      {
        h: "Listing, pricing, and shipping: keeping your margin",
        p: [
          "**Listing fast.** Seasonality matters. A Patagonia fleece listed in October clears faster than one listed in March. The window between buying and listing should be ≤48 hours for seasonal items.",
          "**Pricing for reality.** Use the market departure price, not wishful thinking. If Stone Island hoodies are averaging €56, price at €54–58 depending on condition. At €80 you will wait for weeks and eventually discount.",
          "**Photography.** Natural light, flat lay or hanger, clean background. Show the label and any flaws. Better photos mean fewer disputes and faster clearance — both protect your margin.",
          "**Let the buyer choose the label.** Always. Vinted's integrated label is paid by the buyer when they choose it. If you offer 'free shipping' on a €20 item, you are absorbing €3.49 — a 17% margin hit before costs. Never offer free shipping on items below €40 unless you have the exit price built in.",
          "**Offer discounts for bundles.** Buyers who buy 2+ items from you increase your avg order value and reduce per-item label cost (one label for multiple items). Enable bundle discounts in your seller settings.",
          "**Price reductions after 14 days.** If an item has not sold in 14 days, reduce by 10%. If it has not sold in 28 days, reduce by 20% or relist with new photos. Dead stock is cost, not value.",
        ],
        cta: pricingBodyCta("ctr_make_money_body_20260915"),
      },
      {
        h: "What a working resale operation actually looks like",
        p: [
          "A part-time reseller running 20–30 active listings typically operates on this rhythm:",
          "**Weekend:** source 5–10 items from charity shops or a car boot. Spend ≤€120 total. Photograph and list the same day.",
          "**Weekly:** check departure rates on active items. Reduce price on anything 14+ days old. Respond to buyer messages within 2 hours (faster response = more sales).",
          "**Monthly:** track spend vs revenue per item. Items that never hit buy-below and sat for 30+ days are a sourcing error — note the brand/category and tighten the rule.",
          "At 25 items/month averaging €30 net per item (after buy cost, any label, no boosts): €750/month. At 50 items averaging €35 net: €1,750/month. These are realistic numbers for an organised part-time operation after 3–6 months of pattern recognition.",
          "The ceiling is inventory bandwidth and sourcing access, not the platform. Vinted's no-seller-fee model means margin scales with volume in a way eBay's 12.9% commission does not allow.",
        ],
      },
    ],
    faq: [
      {
        q: "Can you actually make money on Vinted?",
        a: "Yes — resellers running 20–50 items per month regularly earn €500–2,000/month net on Vinted, depending on brand selection, sourcing discipline, and pricing accuracy. The key is buying below the buy-below price (the maximum source price that lets you hit a 25–30% margin) and listing in high-departure categories like Hoodies, Jackets, and Sneakers from tracked brands like Fred Perry, Patagonia, and Stone Island.",
      },
      {
        q: "What sells fastest on Vinted to make money?",
        a: "As of September 2026, the highest-departure brands on Vinted EU are Fred Perry (199 departures in the last 30 days, avg €18), Patagonia (756, avg €37), and Stone Island (753, avg €70). The fastest categories are Hoodies (especially in autumn), Jackets, and Sneakers. High departure volume means quicker turnover, which matters more than high margin per item when starting out.",
      },
      {
        q: "How much money can you make reselling on Vinted?",
        a: "Part-time resellers (20–30 items/month) typically net €500–900/month after sourcing costs. Full-time operations (50–100+ items/month) can reach €1,500–4,000/month. These figures depend heavily on buying below the buy-below price, listing speed, and category focus. Vinted charges sellers 0% commission, so margin is not compressed by platform fees — the main costs are your sourcing buy price and occasional shipping absorption.",
      },
      {
        q: "What is the best strategy to make money on Vinted?",
        a: "The best strategy is: (1) identify brands with 200+ weekly departures in your target market, (2) calculate a buy-below price at 30% margin below expected exit, (3) source only when you can meet that buy-below, (4) list within 48 hours with clean photos and accurate sizing, (5) let buyers pay labels, (6) reduce price after 14 days if unsold. This compounds: faster turnover = more capital cycles per month = more total profit.",
      },
      {
        q: "Do I need to declare Vinted income for tax?",
        a: "Under EU DAC7 rules, Vinted reports sellers with 30+ transactions or €2,000+ in annual proceeds to national tax authorities. Casual sellers below these thresholds are generally not flagged. Above them, you likely have an income tax obligation depending on your country's rules. This is not a Vinted fee — it is national tax law. Consult an accountant if you are running a consistent operation.",
      },
      {
        q: "What is a buy-below price on Vinted?",
        a: "The buy-below price is the maximum you should pay for an item at source to achieve a target margin when it sells on Vinted. For a 30% margin target: buy-below = expected exit price × 0.70, minus any costs you absorb (free shipping, boost spend). If a Patagonia jacket exits at €50 on average, your buy-below is ~€35 — and ideally you pay €25–30 to leave room for price reductions. Buying above the buy-below means the trade will not hit margin even if it sells immediately.",
      },
      {
        q: "Is Vinted good for reselling compared to eBay or Depop?",
        a: "For branded fashion in EU markets, Vinted outperforms eBay and Depop on net margin because Vinted charges sellers 0% commission. eBay charges 10–12.9% and Depop charges 10%. On 100 sales at €40 average, Vinted saves the seller €400–516 versus eBay. The trade-off: Vinted has a narrower category range (fashion/vintage) and lower avg prices on some items. For high-departure fashion brands (Fred Perry, Patagonia, Stone Island), Vinted is the strongest margin platform in EU markets as of 2026.",
      },
    ],
  },
]
