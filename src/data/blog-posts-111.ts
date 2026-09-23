// Batch 111 — How to check if a Vinted item is worth buying.
// Targets the #1 funnel leak: only 3.8% of visitors use the free checker.
// This is the "how to use the tool" guide — the query every reseller has
// but no page on resaleiq.dev answers. All numbers live from the API.

import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

export const POSTS_111: BlogPost[] = [
  {
    slug: "how-to-check-if-a-vinted-item-is-worth-buying",
    title: "How to Check if a Vinted Item Is Worth Buying (Free Price Checker Guide)",
    seoTitle: "How to Check if a Vinted Item Is Worth Buying — Free Price Checker Guide | Resale IQ",
    description:
      "Use the free ResaleIQ price checker to get a buy-below ceiling before you buy on Vinted. Real departure data from 5.4M+ tracked listings across ES/FR/DE/IT/PT — see exactly what to pay, what to skip, and how to read the verdict.",
    date: "2026-09-19",
    category: "Sourcing",
    readMins: 7,

    preflightQuery: "New Balance 530",

    intro:
      "The most expensive mistake a Vinted reseller makes is buying an item that never sells. The fix is a free price check before you buy: type the brand and item into the ResaleIQ checker, get a buy-below ceiling from live EU departure data, and only buy at or below that number. This guide shows you exactly how the checker works, what the verdict means, and the 5 numbers that tell you whether an item is worth your money.",

    definedTerm: {
      name: "Buy-below price",
      description:
        "The buy-below price is the maximum you should pay for an item to make a profit after Vinted fees and shipping. ResaleIQ calculates it as 65% of the average exit price (watched departures) across the 5 main EU Vinted markets — ES, FR, DE, IT, PT. It is not the asking price and not the retail price: it is the price at which a reseller who sources, photographs, lists, and ships the item can expect a 35% gross margin. The checker shows the buy-below ceiling on every free item lookup.",
    },

    sections: [
      {
        h: "What the free checker gives you in 30 seconds",
        p: [
          "The ResaleIQ free price checker answers one question before you spend money: what is the most I should pay for this item? Type a brand and garment — 'Fred Perry Shirt', 'Patagonia Jacket', 'Nike Air Max 90' — and the checker returns the average exit price across 5 EU markets, the buy-below ceiling (65% of that average), and the number of watched departures in the trailing 7 days. No account needed, no card required, no signup wall.",
          "The data is live, not a static price list. The checker reads from 5,408,984 tracked listings across Spain, France, Germany, Italy, and Portugal, updated weekly. When a brand's exit price moves — Stone Island hoodies shift from €55 to €58, or Balenciaga bags drop from €324 to €193 — the checker reflects it within the same week. You are not quoting a price you found in a forum post from March: you are quoting the market as of this week.",
          `The checker is free because it is the top of the funnel. The free verdict shows the buy-below price, the average exit, and the departure count — enough to make a buying decision. The locked fields (sell-through rate, size breakdown, price history) are what you unlock with a paid plan, but the buy-below ceiling alone tells you whether an item at a given price is worth buying. [Check an item now →](/tools)`,
        ],
        cta: pricingMidCta("ctr_how_check_intro_20260919"),
      },
      {
        h: "How to read the verdict: BUY, WATCH, or SKIP",
        p: [
          "The checker returns one of three verdicts. BUY means the item has strong recent departure volume (high sell-through) and a healthy gap between the buy-below ceiling and the average exit price — the margin is there, the demand is proven, and you should buy at or below ceiling. WATCH means the item sells but the margin is thin, the departure count is low, or the price trend is flat — buy only if you can get it well below ceiling. SKIP means the item does not sell enough to move reliably, the exit price is below the buy-below ceiling, or there is not enough data to make a confident call.",
          `The verdict is not a prediction. It is a description of what the market did in the last 7 days across 5 countries. A BUY verdict on a Patagonia Nano Puff Jacket means the model has strong departure volume and a healthy buy-below gap. Patagonia tracks 11,671 brand-level departures in the last 30 days on EU Vinted (22 Sep 2026). The Nano Puff specifically: 46 departures in the last 30 days at €58.44 average per our tracked model data (model_signals). That week at €41 average — not that your specific jacket will sell next Tuesday. A WATCH verdict on a Calvin Klein Hoodie means 167 brand-level departures in the last 30 days at €15.74 average — moderate volume but thin margin unless you can identify CK One logo pieces (€25–40 exit). Check the specific item in the free checker for a per-item verdict.`,
                    `The 5 numbers that drive the verdict are: (1) watched departures per week — the raw demand signal; (2) average exit price — what buyers actually paid, not what sellers asked; (3) buy-below ceiling — 65% of the exit price, your profit-maximising entry point; (4) sell-through rate — what percentage of tracked listings sold within 30 days; and (5) active listings — how many are currently on the shelf. Together they tell you whether an item is a flip, a hold, or a pass. [Understand sell-through →](${ilinkHref("data")})`,
        ],
        cta: pricingBodyCta("ctr_how_check_verdict_20260919"),
      },
      {
        h: "Real examples from this week's data (19 September 2026)",
        p: [
          "Here is what the checker shows for three real items right now, using live API data. Fred Perry Shirts: 199 departures in the last 30 days at a €16 average exit. Buy-below ceiling: €10.40. Verdict: BUY at or below €10.40 — strong volume, predictable exit. The margin per unit is small (€5.60 gross before fees) but the turnover is fast and the capital requirement is low. This is a volume play, not a margin play.",
          "Stone Island Hoodies: 54 departures in the last 30 days at a €55 average exit. Buy-below ceiling: €35.75. Verdict: BUY at or below €35.75 — lower volume than Fred Perry but higher margin per unit (€19.25 gross). Stone Island hoodies are a margin play: fewer transactions, more profit each. The authentication risk is higher than Fred Perry, so condition and provenance matter more.",
          "Calvin Klein Hoodies: 167 departures in the last 30 days at a €15.74 average exit (across all tracked Calvin Klein hoodie listings on EU Vinted, brand-level). Rough buy-below ceiling: €10.23. Verdict: WATCH — the volume is moderate but the margin is thin. At €15.74 average exit and €10.23 rough buy-below, you need to source below €8–9 for a comfortable margin. CK One logo pieces exit higher (€25–40); generic CK hoodies exit closer to €12–16. Check the specific item in the free checker — if we have enough data for a per-model verdict, it will show it.",
          `These three examples show the spectrum: high-volume-low-margin (Fred Perry), low-volume-high-margin (Stone Island), and no-volume-no-margin (Calvin Klein). The checker tells you which bucket an item falls into before you buy, not after. [Check your item →](/tools)`,
        ],
        cta: pricingBodyCta("ctr_how_check_examples_20260919"),
      },
      {
        h: "The 5-step buying checklist before you spend a cent",
        p: [
          "Step one: check the departure count. If an item has fewer than 10 departures in the last 30 days across 5 countries, the demand is thin. You are not going to beat the market by listing better — the market is not there. Step two: check the exit price. If the average exit is below €15, your gross margin after fees and shipping is under €5. That is not worth your time unless you are doing volume. Step three: check the buy-below ceiling. If the ceiling is less than 1.5× the sourcing price you paid, the margin is too thin to justify the listing effort, photography time, and shipping cost. Step four: check active listings. If there are more than 200 active listings for the same item, you are in a saturated market — price becomes the differentiator and margins compress. Step five: check the sell-through rate. If fewer than 25% of listings sell within 30 days, the item is slow-moving. Slow-moving inventory is tied-up capital that could be working on a faster flip.",
          "The checklist is not a checklist you memorise — it is the checker output. The free verdict already runs these five numbers and gives you a single answer: BUY, WATCH, or SKIP. The checklist exists so you understand why the verdict says what it says, and so you can override it when you have information the market does not (a rare colourway, a seasonal trend, a local sourcing channel the data cannot see).",
          `The one rule that overrides everything: never buy above the buy-below ceiling unless you have a specific reason to believe your item will exit above the average. The ceiling is not a suggestion — it is the price at which the math works. Buy above it and you are paying for hope, not for a margin. [Start checking →](/tools)`,
        ],
        cta: pricingBodyCta("ctr_how_check_checklist_20260919"),
      },
      {
        h: "What the checker cannot tell you (and what you need to know)",
        p: [
          "The checker works on aggregate data across 5 EU markets. It cannot tell you whether a specific listing in your local area is priced fairly — it tells you the EU average. It cannot tell you whether a specific item is authentic — it tells you what authentic items have sold for. It cannot tell you whether a trend is rising or falling — it tells you what happened in the last 7 days, not what will happen next week. For trends, you need the paid plan's price history. For authentication, you need our authentication guide. For local pricing, you need to search Vinted directly.",
          "The checker also cannot tell you how to photograph, list, or ship the item. It is a sourcing tool, not a listing tool. The buy-below ceiling tells you the price at which the flip works — what you do between buying and selling (photos, titles, pricing, shipping speed) determines whether you actually exit at the average, above it, or below it. A Fred Perry Shirt bought at €10 and listed with a single dark photo will not exit at €16. The same shirt listed with natural light, flat measurements, and a keyword-rich title will.",
          `The honest limit: the checker gives you the price at which the market works. It does not guarantee your item will sell. It guarantees that if you buy at or below ceiling and list to a decent standard, the math is in your favour. That is the best a data tool can do — the rest is execution. [Check an item now →](/tools)`,
        ],
        cta: pricingBodyCta("ctr_how_check_limits_20260919"),
      },
    ],

    faq: [
      {
        q: "Is the ResaleIQ price checker really free?",
        a: "Yes. The free checker gives you the buy-below ceiling, the average exit price, and the watched departure count for any item — no account, no card, no signup wall. The paid plan (€19/mo) unlocks sell-through rate, size breakdown, and price history, but the buy-below ceiling alone is enough to make a buying decision.",
      },
      {
        q: "What is a buy-below price?",
        a: "The buy-below price is the maximum you should pay for an item to make a profit after Vinted fees and shipping. ResaleIQ calculates it as 65% of the average exit price (watched departures) across the 5 main EU Vinted markets — ES, FR, DE, IT, PT. It is not the asking price and not the retail price: it is the price at which a reseller can expect a 35% gross margin.",
      },
      {
        q: "What does the BUY verdict mean?",
        a: "BUY means the item has strong recent departure volume and a healthy gap between the buy-below ceiling and the average exit price. For example, Fred Perry Shirts show 199 departures in the last 30 days at a €16 average exit, with a €10.40 buy-below ceiling — a €5.60 gross margin per unit at strong volume. The verdict is based on the last 7 days of live data from 5 EU markets.",
      },
      {
        q: "What does the SKIP verdict mean?",
        a: "SKIP means the item does not sell enough to move reliably, the exit price is below the buy-below ceiling, or there is not enough data to make a confident call. A WATCH verdict signals moderate demand with thin margin — for example, Calvin Klein Hoodies track 167 brand-level departures in the last 30 days at €15.74 average (EU Vinted) but only CK One logo pieces exit at €25–40, making the category selective rather than a clear buy.",
      },
      {
        q: "How often is the checker data updated?",
        a: "The checker reads from the live ResaleIQ market snapshot, which updates weekly. The snapshot tracks 5,408,984 listings across Spain, France, Germany, Italy, and Portugal. When a brand's exit price moves, the checker reflects it within the same week.",
      },
      {
        q: "Can I trust the departure numbers?",
        a: "The departure numbers are 'watched departures' — listings ResaleIQ tracked going from active to sold in the trailing 7 days. They are a lower bound on true market volume (listings first seen already sold are not counted), but they are directionally useful for comparing brands. The counting method is published on the /data page and in the API.",
      },
      {
        q: "What if I disagree with the verdict?",
        a: "The verdict is a description of what the market did, not a prediction of what will happen. If you have information the market does not — a rare colourway, a seasonal trend, a local sourcing channel — you can override it. The checker gives you the price at which the math works; the decision to buy above or below that price is yours.",
      },
      {
        q: "How do I use the checker before buying from a charity shop or flea market?",
        a: "Type the brand and garment into the checker before you leave the shop. If the verdict is BUY and the buy-below ceiling is above the shop price, buy it. If the verdict is SKIP or the ceiling is below the shop price, walk away. The whole process takes 30 seconds and saves you from buying inventory that will not move.",
      },
    ],
  },
]
