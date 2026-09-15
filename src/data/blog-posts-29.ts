// Batch 29 of SEO/AEO articles. Same contract as blog-posts.ts.
// Honest claims only: no earnings guarantees. Data references departure averages only.
// Adidas sneakers EU Vinted price guide — targets "adidas sneakers price vinted",
// "adidas samba vinted eu", "adidas stan smith vinted", "handball spezial resell price".

import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

export const POSTS_29: BlogPost[] = [
  {
    slug: "adidas-sneakers-price-guide-eu-vinted",
    title: "Adidas Sneakers Price Guide for EU Vinted (2026 Data)",
    seoTitle: "Adidas Sneakers Vinted EU Price Guide 2026 — Resale IQ",
    description:
      "What Adidas sneakers actually sell for on EU Vinted in 2026: Samba, Handball Spezial, Stan Smith, Campus 00s, Gazelle. Real departure averages, buy-below prices, and weekly volume per model.",
    date: "2026-09-15",

    preflightQuery: "Adidas Sneakers",
    category: "Sourcing",
    readMins: 9,
    intro:
      "Adidas is the second-biggest brand by watched departures on EU Vinted, with 41 tracked departures per week across 7 models as of September 2026. Unlike Nike — where the Air Force 1 dominates — Adidas Vinted demand is spread across a wider model range, with the Handball Spezial leading on departure volume (12 per week) at a €79 average exit. This guide gives you model-level departure data, buy-below prices, and sourcing priorities across the Adidas Vinted catalogue.",
    definedTerm: {
      name: "Adidas sneaker departure average",
      description:
        "The Adidas sneaker departure average is the average price at which a tracked Adidas sneaker listing leaves the shelf on EU Vinted — not the asking price and not the retail price. As of September 2026, the Adidas brand average across 7 tracked models is approximately €59 (weighted by departure volume). Individual models range from €38 (Campus 00s) to €84 (Stan Smith).",
    },
    sections: [
      {
        h: "Adidas on EU Vinted: brand overview",
        p: [
          "Across 7 tracked Adidas sneaker models, ResaleIQ recorded 41 watched departures in the 7 days to 15 September 2026, across the 5 main EU Vinted markets (France, Germany, Spain, Italy, Portugal). The brand sits behind Nike (which leads on raw volume) but ahead of most other footwear brands tracked — Adidas has unusually broad model coverage, with strong demand across both heritage silhouettes (Samba, Gazelle, Stan Smith) and the more recent Handball Spezial.",
          "Average exit prices vary significantly by model: €38–84 across tracked models, compared to Nike's tighter €80–100 range for the equivalent tier. That spread means Adidas sourcing requires per-model research — applying a single Adidas buy-below price across all models will either overexpose you on slow sellers or leave money on the table on the stronger ones.",
          `[Current Adidas brand data →](${ilinkHref("flip")})`,
        ],
        cta: pricingMidCta("ctr_adidas_guide_intro_20260915"),
      },
      {
        h: "Handball Spezial: the leading Adidas model on EU Vinted",
        p: [
          "The Handball Spezial is the single most-departed Adidas sneaker on EU Vinted in our September 2026 data: 12 watched departures in 7 days at an average exit price of €79.38. The buy-below price — the maximum sourcing cost that leaves a defensible margin at that exit — is €52.79.",
          "The Handball Spezial benefits from the same cultural moment as the broader Adidas heritage revival (Samba, Gazelle, Campus) but exits at a higher average price than any of those models, reflecting its narrower retail availability and stronger buyer recognition. Sourcing at charity shops and flea markets at €30–45 and exiting at €79 creates 40%+ gross margins — the model is worth prioritising at those sourcing levels.",
          "The key condition factor for Handball Spezials is the suede upper: scuffing, staining, and flattened nap all compress the exit price significantly. Budget for a suede brush and cleaner; a clean pair fetches the full departure average, a tired pair drops €15–20 below it.",
        ],
      },
      {
        h: "Stan Smith: steady exits at the highest average",
        p: [
          "The Stan Smith is the highest average-exit Adidas model tracked: €84.14 average departure price, buy-below €55.95, with 7 watched departures in the 7-day window. Volume is lower than the Handball Spezial, but exit prices are higher and relatively consistent — the model has been a Vinted staple for years and buyer demand is well-established.",
          "Stan Smiths on EU Vinted are overwhelmingly the standard white/green colourway. Premium colourways (monochrome, Lux leather editions, collaborations with Pharrell or Prada) exit at €150–300+, but those pairs require authentication and are less frequently sourced casually. For standard sourcing — charity shops, flea markets — price everything as though it is the standard colourway until confirmed otherwise.",
          "Stan Smith condition is primarily about the leather upper and toe box: yellowed soles and scuffed toes are the most common value reducers. A clean pair at €84 versus a worn pair at €55–60 is the realistic spread. Budget accordingly when sourcing. The buy-below of €55.95 assumes average condition — very clean pairs can exit above the departure average.",
        ],
      },
      {
        h: "Samba and Samba OG: the trend models",
        p: [
          "The Samba is the most culturally prominent Adidas shoe on Vinted right now — but not the most profitable sourcing target on volume/margin criteria. Samba exits average €48.01 with 6 departures per week; Samba OG exits at €60.61 with 5 departures. The buy-below prices are €31.93 (Samba) and €40.31 (Samba OG).",
          "Those buy-below ceilings are meaningful: a standard Samba in good condition sells for just under €50 on EU Vinted. Sourcing above €31.93 erodes the margin below defensible levels at that exit average. The model's high retail demand keeps secondhand supply relatively thin — which supports the price but means fewer sourcing opportunities per month compared to a model with higher turnover.",
          "Samba OG exits higher (€60.61) because it is the premium-construction variant with a slightly different silhouette — buyers who know the range specifically seek OG. If you find both at the same source price, always prefer the OG. The colourway split follows the same pattern as Stan Smiths: black/white and gum-sole colourways are the most liquid.",
          `[Current Samba departure data →](${ilinkHref("data")})`,
        ],
      },
      {
        h: "Campus 00s and Gazelle Indoor: the wider catalogue",
        p: [
          "The Campus 00s exits at €37.99 with 4 departures per week — the lowest exit price of the tracked Adidas models. Buy-below is €25.26. The low absolute exit price means smaller per-unit margin in euros, even at defensible margin percentages. Campus 00s are worth sourcing at charity shop prices (€8–20 clean) but not at prices that require competitive above-floor sourcing.",
          "The Gazelle Indoor is a newer entrant to Vinted resale: 4 departures per week at €58.00 average exit, buy-below €38.57. The model benefits from strong editorial coverage in 2025–2026 and is still in growth phase for Vinted demand. It is worth watching as a sourcing category — the current volume is modest but the exit price is reasonable.",
          "The Forum Low rounds out the tracked catalogue: €42.17 average exit, buy-below €28.04, 3 departures per week. Low volume makes it a secondary sourcing target — only buy Forum Lows if sourced below €28 and in clean condition.",
        ],
      },
      {
        h: "Adidas vs Nike: which brand to prioritise on EU Vinted",
        p: [
          "Nike leads on raw weekly volume and has a tighter price range — the Air Force 1's 38 departures per week make it the single most reliable sourcing target on EU Vinted. Adidas has lower total volume (41 departures across 7 models versus Nike's higher concentration in fewer models) but higher exit prices on the top models (Handball Spezial at €79, Stan Smith at €84).",
          "The practical choice depends on sourcing opportunity: if you find both at the same source price, the model with the higher buy-below ceiling wins. Handball Spezial at €52 source price has a defensible margin. AF1 at €62 is the ceiling. At flea market prices, you may find Air Force 1s more frequently (broader supply) but Handball Spezials at higher source prices still work if under the ceiling.",
          "The second-order factor is condition sensitivity: Adidas suede models (Handball Spezial, Samba) are more condition-sensitive than Nike leather AF1s. A worn suede Spezial drops more value than a worn AF1. Price suede accordingly at the point of sourcing, not after cleaning.",
        ],
        cta: pricingBodyCta("ctr_adidas_guide_vs_nike_20260915"),
      },
      {
        h: "Setting your Adidas buy-below price per model",
        p: [
          "The buy-below formula is consistent across brands: (EU Vinted departure average) × (1 − target margin %) − selling costs. On Vinted, seller fees are zero — only shipping if included. A 30% gross margin target gives: Handball Spezial ceiling = €79.38 × 0.7 = €55.57 (ResaleIQ reports €52.79, slightly tighter). Stan Smith ceiling = €84.14 × 0.7 = €58.90 (ResaleIQ: €55.95). The gap between the formula estimate and ResaleIQ's reported buy-below reflects condition-adjusted departure averages and a more conservative margin assumption.",
          "Use the ResaleIQ buy-below as the hard ceiling and the formula estimate as the aspiration. Sourcing below the formula figure (€55 for Handball Spezial vs €52.79 ceiling) means the margin survives condition variance. Sourcing right at the ceiling means condition must be clean — any wear wipes the margin.",
          `For models not in ResaleIQ's catalogue, use the Adidas brand average (approximately €59) and apply a 30–35% buy-below ceiling (€39–41). That is more conservative than the actual Handball Spezial or Stan Smith ceiling but protects you from mistaking a lower-value model for a higher-value one. [Check live Adidas model data →](${ilinkHref("data")})`,
        ],
      },
    ],
    faq: [
      {
        q: "What is the average price for Adidas sneakers on Vinted in Europe?",
        a: "Across 7 tracked Adidas models on EU Vinted (France, Germany, Spain, Italy, Portugal) in September 2026, departure averages range from €38 (Campus 00s) to €84 (Stan Smith). The highest-volume model, Handball Spezial, exits at €79.38. A weighted brand average sits around €59. Unlike Nike — where volume concentrates in a few models — Adidas has a wider spread of exits across models.",
      },
      {
        q: "What is the buy-below price for Adidas Samba on EU Vinted?",
        a: "The ResaleIQ buy-below price for Adidas Samba on EU Vinted is €31.93, based on an average exit price of €48.01. The Samba OG has a higher buy-below of €40.31 (exit average €60.61). Both figures assume standard colourways in good condition. Sourcing above these ceilings at average exits does not leave a defensible margin.",
      },
      {
        q: "Which Adidas sneaker sells best on Vinted?",
        a: "By weekly departure volume on EU Vinted, the Handball Spezial leads in September 2026: 12 watched departures per week at a €79.38 average exit. Stan Smith (7 departures, €84.14 exit) ranks second by exit price. Samba and Samba OG follow with 6 and 5 departures respectively, though at lower exit prices.",
      },
      {
        q: "Is it worth reselling Adidas sneakers on Vinted?",
        a: "Yes for the right models at the right source price. The Handball Spezial at €79 average exit and €52.79 buy-below ceiling offers a strong margin for sourcing at charity shop or flea market prices. Stan Smith (€84.14 exit, €55.95 ceiling) is also a reliable sourcing target. Campus 00s and Forum Lows exit lower and require very cheap sourcing to make margin.",
      },
      {
        q: "How do I price Adidas Samba listings on Vinted?",
        a: "Use the EU departure average as your anchor: €48.01 for Samba, €60.61 for Samba OG. Adjust down for wear — scuffs, sole yellowing, suede damage each subtract €5–15 from the exit expectation. Adjust up marginally for rare colourways (green/white gum, triple-black) but verify demand before assuming a premium. List at the departure average for standard colourways in good condition.",
      },
      {
        q: "What condition affects Adidas sneaker prices most on Vinted?",
        a: "For suede models (Handball Spezial, Samba): nap condition and suede cleanliness have the biggest impact — a tired suede upper can cost €15–20 below the departure average. For leather models (Stan Smith): toe box creasing and sole yellowing are the main value reducers. Campus 00s are canvas/synthetic — clean well with a soft brush but canvas fading and seam separation reduce value significantly.",
      },
    ],
  },
]
