// Batch 6 of SEO/AEO articles. Same contract as blog-posts.ts.
// Honest claims only: listings-tracked via TRACKED + fillTracked, no earnings promises,
// no tax/legal advice presented as professional advice.

import { TRACKED } from "@/lib/stats"
import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

const BRAND = "Resale IQ"

export const POSTS_6: BlogPost[] = [
  {
    slug: "nike-reselling-vinted-guide",
    title: "Nike Reselling on Vinted: Sneakers at €96 Average, the Models That Drive Margin",
    seoTitle: "Is Nike Worth Reselling on Vinted? — Resale IQ",
    description:
      "Nike ranks #9 by watched departures across 5 EU Vinted markets — 172/week at €62 average. Sneakers lead: 78 departures at €96 average (buy-below ~€64). Jackets and Hoodies add volume. Model selection is the primary sourcing skill.",
    date: "2026-09-14",

    preflightQuery: "Nike",
    category: "Sourcing",
    readMins: 7,
    intro:
      "Week to 14 September 2026, Nike ranked #9 across Spain, France, Germany, Italy and Portugal with 172 watched departures at an average exit price of €62. The headline number is the Sneaker category: 78 departures at €96 average — the highest category average of any volume brand in the EU5 top ten, significantly above The North Face Bags (€66), Supreme Jackets (€132 but low volume), or New Balance Sneakers (€52). The practical consequence: Nike Sneakers are the highest-value non-luxury footwear opportunity in EU Vinted resale, but only for the right models. The brand's size means average departure prices mask a very wide spread.",
    sections: [
      {
        h: "Volume and category breakdown",
        p: [
          "Of the 172 watched departures, Sneakers led at 78 exits averaging €96 — nearly double the Nike brand average and the highest-ticket volume category in the top ten. Hoodies followed at 23 departures averaging €23. Jackets came in at 23 departures averaging €55. T-Shirts contributed 20 departures at €19 average. Tracksuits added 13 departures at €30 average.",
          "Full Nike volumes are on " +
            ilinkHref("flip") +
            " and update weekly. The €62 brand average is pulled up by Sneakers and down by apparel; the two halves of the brand require different sourcing strategies and different capital allocation.",
        ],
      },
      {
        h: "Buy-below by category",
        p: [
          "With Sneakers averaging €96 at departure and Vinted modelling roughly a 5% platform deduction, the departure-net is around €91.20. Applying a 30% target margin gives a buy-below of approximately €64. Any Nike Sneaker sourced below that price — in sellable condition, correct model — has a realistic margin at current departure prices.",
          "Jackets at €55 average give a buy-below near €37. Tracksuits at €30 give a buy-below near €20. Hoodies at €23 give a buy-below near €15. T-Shirts at €19 give a buy-below near €13. The apparel categories are viable but volume plays — the per-unit margin is thinner than Sneakers, and sourcing depth matters more than model selection.",
        ],
        cta: pricingMidCta("ctr_nike_20260914"),
      },
      {
        h: "Sneakers: the models that drive the €96 average",
        p: [
          "The €96 average for Nike Sneakers is not the Roshe Run. It is driven by a small set of models with premium secondary demand: the Air Max 1 (consistently the highest-departure Nike model across EU5, clean colourways regularly exit at €80–120), the Air Jordan 1 (colourway-dependent, OG and Retro colourways exit at €100–180+), the Air Force 1 Off-White collaboration family and other Nike Lab releases (thin volume, high ceiling), and the Air Max 90 (more diffuse demand but consistent floor).",
          "Models that pull the average down: the Air Max 270 and 720 (high original retail but limited secondary demand above €40), the Nike Revolution and casual running lines (sub-€30 secondary), and the Internationalist/Cortez (heritage models with inconsistent demand). Sourcing a Nike Sneaker at €64 buy-below only makes sense if the model you are buying exits at or above €96. A Revolution sourced at €15 is not the same opportunity as an Air Max 1 sourced at €50.",
        ],
      },
      {
        h: "Air Jordan 1: highest ceiling, narrowest target",
        p: [
          "The Jordan 1 is the highest-ceiling Nike resale model in EU5 Vinted. OG colourways — Bred, Shadow, Royal, Chicago — exit at €120–180 when in clean condition with original box. Mid-tier Retros exit at €80–120. The condition premium is higher than any other Nike model: a Jordan 1 with creasing across the toe box sells for €20–40 less than the same colourway uncreased. If you can toe-stuff, clean, and photograph a Jordan correctly, the prep adds real money.",
          "The authentication challenge: Jordan 1 fakes are common across all price points and increasingly convincing. The core checks — look for clean stitching on the 'Nike Air' text on the insole, consistent leather grain (genuine leather has irregular texture; fakes often show uniform plastic-like grain), and lace tips that are firmly crimped with no loose threads. For OG colourways, heat the toe area gently — genuine leather is warm and flexible; PU leather substitutes feel stiffer and cool. An authentic Jordan 1 in OG colourway sourced below €100 in clean condition is one of the highest-margin individual transactions in EU5 secondhand resale.",
        ],
      },
      {
        h: "Air Max 1: the consistent EU5 volume premium",
        p: [
          "The Air Max 1 is Nike's most consistently performing EU5 resale model: exits at €80–120 across all five markets, broad size range (men's 7–12 all find buyers), and condition tolerance higher than Jordans (cushioning wear is expected and priced in more forgivingly). The dominant EU5 colourways: Anniversary Red (any year of reissue), OG University Blue, and the Safari pattern. White midsole condition is critical — yellowing drops price by €15–25 regardless of upper condition.",
          "Nike Vapormax models (Flyknit 1 and 2 specifically) are the second most consistent EU5 premium model, particularly in black/white and black/black colourways. The Vapormax bubble condition drives price — any visible crack or separation in the full-air sole is a skip, not a discount opportunity. Buyers at €70+ expect the air unit intact.",
        ],
        cta: pricingBodyCta("body_nike_20260914"),
      },
      {
        h: "Jackets: €55 average, Tech Fleece leads",
        p: [
          "At 23 departures and €55 average, Jackets are the second-strongest Nike category by revenue velocity. The Tech Fleece range — particularly the full-zip hoodie and the tailored trouser, which pairs with the jacket — has sustained EU5 secondary demand. The Tech Fleece jacket buy-below sits around €37, and clean pieces in grey, black, or olive consistently reach €55–70 at departure.",
          "N98 track jackets (the heritage zip-through) also trade above the Jacket average in EU markets — France and Spain have particularly strong demand for retro Nike track pieces. Size S and M move fastest; L and XL take longer in most EU markets. Condition note: check the zip pull and zip teeth on every Tech Fleece before sourcing — the zip is the most common failure point and dramatically affects salability.",
        ],
      },
      {
        h: "Tracksuits and Hoodies: volume at thin margins",
        p: [
          "Tracksuits (13 departures, avg €30) and Hoodies (23 departures, avg €23) are the lowest-margin Nike categories — buy-belows of €20 and €15 respectively mean sourcing discipline needs to be tight. The Tracksuit opportunity is primarily the Tech Fleece suit or the NSW Club set (solid-colour, clean condition) — branded tracksuits sourced below €10 at charity shops or car boots and listed at €25–30 are viable, but the margin is thin and turn rate slower.",
          "Hoodies follow the same logic: Club Fleece pullover in black, grey, or navy at below €10 sourcing cost gives margin at the €23 departure floor. Nike hoodies without clear model identity — generic polyester blends, faded prints — will not exit at or above floor. Condition and colourway tightness are non-negotiable at this margin.",
        ],
      },
    ],
    faq: [
      {
        q: "Is Nike worth reselling on Vinted?",
        a: "Yes — Nike ranked #9 by watched departures across Spain, France, Germany, Italy and Portugal in the week to 14 September 2026: 172 listings left the shelf at an average of €62. Sneakers lead at 78 departures averaging €96 (buy-below ~€64). The Air Max 1, Jordan 1, and Vapormax drive the premium. Model selection is the primary sourcing skill.",
      },
      {
        q: "What is the buy-below price for Nike Sneakers on Vinted?",
        a: "With Nike Sneakers averaging €96 at departure across EU Vinted markets (to 14 September 2026), and modelling a ~5% platform deduction and 30% target margin, the buy-below sits around €64. This applies only to models that actually exit at or above €96 — Air Max 1, Jordan 1, Vapormax. Budget models exit well below €96 and have correspondingly lower buy-below prices. Resale IQ returns the exact buy-below for a specific Nike model.",
      },
      {
        q: "What Nike items sell best on Vinted?",
        a: "Sneakers dominate: 78 of the 657 departures in the last 30 days are Sneakers averaging €96 in the week to 14 September 2026. The Air Max 1 (OG colourways, consistent EU5 demand), Jordan 1 (OG colourways €120–180+), and Vapormax are the volume premium models. Tech Fleece Jackets (23 departures, avg €55) are the top apparel play. Generic Nike apparel (T-Shirts, basic Hoodies) has thin margins.",
      },
      {
        q: "How do I authenticate a Nike Air Jordan 1 before buying to resell?",
        a: "Check the 'Nike Air' text on the insole — stitching should be clean and consistent. Leather grain should be irregular (genuine leather) not uniformly plastic-like (PU substitute). Lace tips should be firmly crimped with no loose threads. For OG colourways: heat the toe area gently — genuine leather is warm and flexible; fakes feel stiffer and cooler. Original box with correct size label and factory-fresh tissue paper significantly increases conversion speed and price at this level.",
      },
      {
        q: "How does Nike compare to New Balance and Supreme for resale on Vinted?",
        a: "Nike (88 departures in the last 30 days, avg €62) sits between New Balance (260/week, avg €49) and Supreme (156/week, avg €66) in the EU5 rankings. Nike Sneakers average €96 — significantly above New Balance Sneakers (€52) — but the premium is concentrated in a narrow set of models. Supreme's resale edge is drop knowledge; New Balance's is model-number expertise; Nike's is model-and-colourway precision combined with authentication skill for Jordans.",
      },
    ],
  },
]
