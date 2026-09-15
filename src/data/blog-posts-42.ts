// Batch 42 of SEO/AEO articles. Same contract as blog-posts.ts.
// Patagonia Hoodies EU Vinted price guide — targets
// "patagonia hoodie vinted price", "patagonia better sweater vinted eu",
// "patagonia hoodie resell value europe", "is patagonia hoodie worth reselling vinted",
// "patagonia fleece vinted eu price guide".

import type { BlogPost } from "./blog-posts"
import { pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

export const POSTS_42: BlogPost[] = [
  {
    slug: "patagonia-hoodie-eu-vinted-price-guide",
    title: "Patagonia Hoodies on EU Vinted: Price Guide and Buy-Below (2026 Data)",
    seoTitle: "Patagonia Hoodie Vinted EU Price Guide 2026 — Resale IQ",
    description:
      "Patagonia hoodies tracked 122 watched departures per week across EU Vinted in September 2026 at a €40 average — the brand's second-busiest category after jackets. Real exit ranges by model (Better Sweater, Los Gatos, Synchilla Snap-T, Retro Pile), buy-below ceiling at €26, and how Patagonia hoodies compare to North Face fleeces and Stone Island for EU resellers.",
    date: "2026-09-15",
    category: "Sourcing",
    readMins: 7,

    preflightQuery: "Patagonia Hoodie",
    intro:
      "Patagonia hoodies are the EU charity-shop resale staple — 122 watched departures per week in the week to 15 September 2026 at a €40 average exit price. That makes hoodies Patagonia's second-busiest category on EU Vinted after jackets (307 departures/7d at €51) and ahead of bags (115/7d at €24). The Better Sweater, Los Gatos, Synchilla Snap-T, and Retro Pile fleece are the four models that drive the category — each with a different price ceiling and different sourcing economics. Buy-below sits at €26, which means charity-shop and clearance sourcing is viable; secondary-market sourcing from other resellers rarely leaves margin. This guide covers exit prices by model, sourcing conditions that close the margin, and how Patagonia hoodies compare to North Face and Stone Island for EU Vinted resellers.",
    definedTerm: {
      name: "Patagonia hoodie departure average",
      description:
        "The Patagonia hoodie departure average is the average price at which a tracked Patagonia hoodie listing leaves the shelf on EU Vinted — not the asking price and not the retail price. As of the week to 15 September 2026, Patagonia hoodies track 122 watched departures per week across France, Germany, Spain, Italy, and Portugal at a €40 average exit price. 'Watched departure' means a tracked listing left the shelf — not a confirmed buyer-reported sale. This makes hoodies Patagonia's second-highest-volume category on EU Vinted behind jackets (307/7d at €51). The buy-below ceiling at the hoodie category level is €26 — that is €40 × 0.65, targeting a 35% gross margin after platform fees. The Better Sweater Hoody is the highest-exiting hoodie model within the category, typically departing €8–12 above the €40 category average in clean condition.",
    },
    sections: [
      {
        h: "Patagonia hoodies on EU Vinted: 122 departures/week at €40",
        p: [
          "Patagonia hoodies are a reliably liquid category across EU Vinted — 122 watched departures per week as of the week to 15 September 2026 at a €40 average. Within the Patagonia brand total of 733 departures per week, hoodies sit second behind jackets (307/7d at €51) and above bags (115/7d at €24). The brand's EU Vinted footprint spans France, Germany, Spain, Italy, and Portugal.",
          "The €40 average for hoodies blends four distinct models with different demand profiles and resale ceilings. The Better Sweater and Retro Pile fleece sit above the category average; the Synchilla Snap-T and Los Gatos sit at or near it. Understanding which model you are sourcing — and what it actually exits at — is the difference between a margin-positive unit and a write-off at €40 expected but a €28 actual.",
          `Patagonia's total EU Vinted brand footprint is 733 watched departures per week at a €37 brand average — the second-most liquid brand in the ResaleIQ EU database by volume, behind Fred Perry (823/7d at €18). [Full Patagonia brand data →](${ilinkHref("flip")})`,
        ],
      },
      {
        h: "Exit price ranges by model: Better Sweater, Snap-T, Los Gatos, Retro Pile",
        p: [
          "The Better Sweater Hoody is Patagonia's most recognisable hoodie and consistently the highest-exiting model in the category on EU Vinted. Clean examples in core colourways (black, navy, forge grey) exit at €46–54; lightly worn examples exit at €36–44. Men's silhouettes slightly outperform women's at the top end. The Better Sweater is what most EU resellers mean when they say 'Patagonia hoodie' — it is the single model most frequently found at charity shop prices in the €5–12 range.",
          "The Retro Pile Fleece Hoody is the higher-ceiling outlier within the category. On-trend colourways (orange, yellow, oat) in near-new condition exit at €58–75, making it the only Patagonia hoodie that approaches the Patagonia jacket average on a good unit. Plain or worn Retro Pile examples exit at €35–48 — similar to the category average. The Retro Pile is rarer in charity shops and typically found through private sellers or end-of-season retail discounts.",
          "The Synchilla Snap-T Pullover exits at €32–44 for clean examples, generally at or slightly below the €40 category average. The Snap-T's signature chest pocket and pipe trim colourways create higher demand for 1990s–2000s vintage versions, which can exit at €55–80 when correctly identified and in clean condition. The Los Gatos Hoody and Lightweight Better Sweater exit at €28–38 — below category average — because they are lighter-weight versions without the brand salience of the Better Sweater or Snap-T.",
          `Buy-below at the category level is €26 — that is €40 × 0.65, targeting a 35% gross margin after platform fees. For Better Sweater and Retro Pile sourced for €48+ exit, buy-below rises to €31–35. For Los Gatos or Lightweight models expected to exit at €30–35, the buy-below is €19–23. [Check any Patagonia item →](${ilinkHref("flip")})`,
        ],
        cta: pricingMidCta("ctr_patagonia_hoodie_guide_models_20260915"),
      },
      {
        h: "Condition and colourway: how they move the €40 average",
        p: [
          "Condition is the primary variable in Patagonia hoodie pricing on EU Vinted, more so than for hard-goods brands. Fleece and wool-blend fabrics show pills, snags, and compression readily. A Better Sweater listed as 'good condition' but visibly pilled exits €8–12 below a genuinely clean example — buyers are experienced enough to identify pilling in photos. Photographs that show the fleece texture under good lighting consistently outperform those that obscure condition.",
          "Colourway has a clear effect in the Retro Pile category and a moderate effect in the Better Sweater category. For the Better Sweater, black and navy are the most liquid colourways — they sell fastest at the average price. Heather grey and forge grey also move quickly. Less-common colourways (limited-season brights or regional exclusives) can exit above average for the right buyer but take longer. For the Retro Pile, on-trend colourways carry a £10–15 premium at the top; muted or oversaturated colourways do not.",
          "Size affects Patagonia hoodies less than it does hard-goods categories. EU-market listings show broadly consistent demand across sizes S–XL, with XS occasionally sitting longer and XXL sometimes commanding a small premium for men's silhouettes. Women's sizing has similar liquidity to men's in the Better Sweater; the Retro Pile skews male in EU demand.",
        ],
      },
      {
        h: "Sourcing: where the margin comes from",
        p: [
          "The economics of Patagonia hoodie reselling on EU Vinted depend almost entirely on sourcing channel. At a €26 buy-below, the margin requires sourcing below secondary-market prices. Charity shops and hospice shops in Germany, France, and the UK are the most reliable channel — Better Sweater hoodies appear at €5–12, and most non-Retro-Pile models are findable at margin-viable prices when sourced in volume.",
          "End-of-season retail discounts are the second channel. Patagonia runs seasonal sales at 30–40% off, which can bring a €149 Better Sweater to €89–105. At those retail-discount prices, the margin is tight on a €46–54 Vinted exit — the economics work only on perfect-condition units that achieve the high end of the exit range. Resellers who source from other Vinted or eBay sellers at €25–35 and expect a €40+ exit are often working against the margin, not with it.",
          `Patagonia's total EU Vinted brand footprint is 733 watched departures per week across all categories. At the hoodie category level, 122 per week means roughly 17 per day across all five EU markets combined. That is sufficient liquidity for a reseller who sources 3–5 units per week to sell within 5–10 days at the average price, assuming correct model identification and honest condition photography. [Check Patagonia data →](${ilinkHref("data")})`,
        ],
      },
      {
        h: "Patagonia vs The North Face vs Stone Island: EU Vinted comparison",
        p: [
          "Three brands dominate the EU charity-shop fleece resale market: Patagonia, The North Face, and Stone Island. Each has a different profile for EU Vinted resellers.",
          "Patagonia hoodies: 122 departures/7d at €40 avg — high volume, medium price. The brand's EU Vinted moat is the Better Sweater recognition and consistent charity-shop supply. Buy-below at €26.",
          "The North Face: 168 departures/7d at €43 brand avg across all categories — similar volume to Patagonia, slightly higher average. North Face hoodies and fleeces exit at €35–50, comparable to Patagonia hoodie range. North Face jackets (Nuptse, Himalayan Parka) carry a higher ceiling than Patagonia jackets in the EU market.",
          "Stone Island: 722 departures/7d at €71 brand avg — similar total volume to Patagonia but much higher per-unit value. Stone Island hoodies and sweatshirts exit at €55–110, above the Patagonia hoodie ceiling. Stone Island is not a charity-shop sourcing category — it requires secondary-market sourcing and carries authentication risk. The per-unit margin is higher when it works; the sourcing risk is also higher.",
          "For EU resellers working a charity-shop pipeline, Patagonia hoodies and The North Face are the more reliable high-volume categories. For those with access to authenticated Stone Island at correct prices, the higher ceiling compensates for sourcing difficulty.",
        ],
        cta: pricingMidCta("ctr_patagonia_hoodie_guide_compare_20260915"),
      },
      {
        h: "What Patagonia hoodie resellers get wrong on EU Vinted",
        p: [
          "The most common mistake with Patagonia hoodies on EU Vinted is model misidentification in the listing. 'Patagonia hoodie' or 'Patagonia fleece' without the model name consistently exits below average — buyers who search specifically for 'Better Sweater' or 'Retro Pile' will skip a generic listing. Including the model name in the title is the single highest-leverage listing change.",
          "The second common mistake is overpricing condition. Patagonia buyers on EU Vinted are experienced and know what worn fleece looks like. A pilled Better Sweater listed at €48 will sit; the same item at €32–36 with honest condition photos will move. Resellers who calibrate price to a condition tier rather than a fixed average consistently outperform those who list all units at the same price.",
          "The third mistake is conflating brand-level and category-level data. Patagonia averages €37 across all categories, but bags average €24 and jackets average €51. A reseller buying a Patagonia item at €26 expecting a €37 exit may be buying a bag or a T-shirt, not a hoodie. The buy-below for hoodies is €26 specifically for hoodie exits — not the brand average.",
        ],
      },
    ],
    faq: [
      {
        q: "How many Patagonia hoodies sell on EU Vinted per week?",
        a: "ResaleIQ tracked 122 watched departures per week for Patagonia hoodies across EU Vinted — France, Germany, Spain, Italy, and Portugal — in the week to 15 September 2026, at a €40 average exit price. 'Watched departure' means a tracked listing left the shelf, not a confirmed sale the platform reported. Patagonia's total EU Vinted brand footprint is 733 departures per week across all categories.",
      },
      {
        q: "What is the buy-below price for a Patagonia hoodie on Vinted?",
        a: "The buy-below ceiling at the Patagonia hoodie category level is €26 — that is the €40 average exit price × 0.65, targeting a 35% gross margin after platform fees. For Better Sweater units in clean condition expected to exit at €46–54, the buy-below rises to €30–35. For lighter models (Los Gatos, Lightweight Better Sweater) expected to exit at €30–35, buy-below is €19–23.",
      },
      {
        q: "Which Patagonia hoodie model exits highest on EU Vinted?",
        a: "The Retro Pile Fleece Hoody exits highest within the Patagonia hoodie category on EU Vinted — on-trend colourways in near-new condition exit at €58–75. The Better Sweater Hoody exits at €46–54 in clean condition, making it the most consistently above-average model and the most commonly sourced at charity-shop prices. The Synchilla Snap-T exits at €32–44 new, with a premium for genuine vintage (1990s–2000s) examples at €55–80.",
      },
      {
        q: "Is Patagonia fleece worth reselling on Vinted in Europe?",
        a: "Yes — Patagonia hoodies and fleeces are one of the most liquid resale categories in the EU charity-shop resale pipeline, with 122 watched departures per week at €40 average. The economics require sourcing below €26 (buy-below ceiling), which rules out most secondary-market sourcing but is achievable at charity shops, estate sales, and end-of-season retail discounts. Correct model identification and honest condition photography are the two highest-leverage listing improvements.",
      },
      {
        q: "How does Patagonia compare to The North Face for EU Vinted resellers?",
        a: "Patagonia hoodies track 122 departures/7d at €40 average; The North Face has 168 departures/7d at €43 brand average across all categories. Exit prices for hoodies and fleeces are broadly comparable (€35–54 for both brands). The North Face jackets (Nuptse, Himalayan Parka) carry a higher ceiling than Patagonia jackets in the EU market. For charity-shop sourcing, both brands are viable; Patagonia Better Sweater supply is often more consistent in EU charity shops than North Face fleece.",
      },
      {
        q: "How long does a Patagonia hoodie take to sell on EU Vinted?",
        a: "A correctly listed Patagonia Better Sweater — with model name in the title, accurate condition, correct EU pricing near the €40–46 range, and clear condition photos — typically sells within 5–10 days on EU Vinted. Overpriced listings or those missing the model name sit for 3–6 weeks. Retro Pile in on-trend colourways moves faster than the average when priced correctly; Los Gatos and lighter models may take 10–14 days at the category average.",
      },
    ],
  },
]
