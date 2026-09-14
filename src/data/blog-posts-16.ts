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
]
