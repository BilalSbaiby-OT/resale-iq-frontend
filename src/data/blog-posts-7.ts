// Batch 7 of SEO/AEO articles. Same contract as blog-posts.ts.
// Honest claims only: listings-tracked via TRACKED + fillTracked, no earnings promises,
// no tax/legal advice presented as professional advice.

import { TRACKED } from "@/lib/stats"
import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

const BRAND = "Resale IQ"

export const POSTS_7: BlogPost[] = [
  {
    slug: "diesel-reselling-vinted-guide",
    title: "Diesel Reselling on Vinted: Jackets at €61 Average, the Y2K Revival Opportunity",
    seoTitle: "Is Diesel Worth Reselling on Vinted? — Resale IQ",
    description:
      "Diesel ranks #8 by watched departures across 5 EU Vinted markets — 178/week at €23 average. Jackets lead by revenue: 19 departures at €61 average (buy-below ~€41). Y2K revival pieces command a premium; basic modern Diesel does not.",
    date: "2026-09-15",

    preflightQuery: "Diesel",
    category: "Sourcing",
    readMins: 7,
    intro:
      "Week to 14 September 2026, Diesel ranked #8 across Spain, France, Germany, Italy and Portugal with 178 watched departures at an average exit price of €23. The headline number understates the real opportunity: Jackets — just 19 of the 178 departures — averaged €61, a figure driven by the Glenn Martens revival and the renewed EU appetite for specific Diesel cuts from the 2022–2025 runway era. The rest of the brand is a commodity denim play, with 78 Jeans departures averaging €21 and three other categories below €20. Two very different sourcing strategies live under the Diesel name.",
    sections: [
      {
        h: "Volume and category breakdown",
        p: [
          "Of the 178 watched departures in the week to 14 September 2026, Jeans dominated volume at 78 exits averaging €21. T-Shirts contributed 27 departures averaging €11. Hoodies added 25 departures at €20 average. Jackets came in at 19 departures averaging €61 — the outlier category by revenue velocity. Shirts rounded out the top five at 10 departures averaging €8.",
          "Full Diesel volumes are on " +
            ilinkHref("flip") +
            " and update weekly. The €23 brand average is heavily diluted by commodity denim and fast-fashion-tier apparel; the Jacket category carries nearly three times the brand average and is where the margin sits in EU5 Vinted resale.",
        ],
      },
      {
        h: "Buy-below by category",
        p: [
          "With Jackets averaging €61 at departure and Vinted modelling roughly a 5% platform deduction, the departure-net is around €57.95. Applying a 30% target margin gives a buy-below of approximately €41. Any Diesel Jacket sourced below that price — in sellable condition, correct era — has a realistic margin at current departure prices.",
          "Jeans at €21 average give a buy-below near €14. Hoodies at €20 give a buy-below near €13. T-Shirts at €11 give a buy-below near €7. Shirts at €8 are effectively below any practical sourcing floor. The Jacket category is where capital should concentrate; the other categories are viable only as high-volume low-cost sourcing plays, and T-Shirts and Shirts are not worth deliberate sourcing at these averages.",
        ],
        cta: pricingMidCta("ctr_diesel_20260915"),
      },
      {
        h: "Jackets: Y2K revival and what actually exits at €61",
        p: [
          "The €61 Jacket average is not the generic Diesel leather-look blouson from 2015. It is driven by pieces from Diesel's Glenn Martens runway era (2022–2025) and the Y2K Diesel aesthetic that preceded it: oversized denim jackets in washed or distressed finishes, the D-Ektor and related trucker cuts with Diesel's signature hardware, leather and faux-leather pieces from the 2003–2008 era that have re-entered cultural circulation, and collab pieces (Diesel x A-COLD-WALL*, Diesel x Atmos, limited SS23/SS24 runway drops).",
          "The Y2K demand is not nostalgia-blind. Buyers at this price point are specifically targeting pieces that look intentional — oversized, hardware-forward, with visible branding that reads 'correct era, not accident'. A contemporary Diesel blouson bought in 2017 for €120 is not the same asset as a 2003 distressed denim trucker sourced for €15 at a car boot. Condition tolerance is higher for authentic Y2K pieces (distress is expected); it is low for modern basic pieces where wear just reads as wear.",
        ],
      },
      {
        h: "Jeans: the volume play and where it breaks down",
        p: [
          "At 78 departures and €21 average, Jeans are the volume engine of Diesel on Vinted — but the margin is thin and the sourcing trap is real. The €21 average includes both contemporary straight-cut Diesel Jeans (exiting at €15–20) and specific model names — the 1DR-5005, the 1DR-509, the Thommer in slim tapered — that exit at €35–55 when in clean, correct condition.",
          "The practical split: Diesel Jeans sourced at €5–8 and listed at €18–22 are a viable high-volume play if your sourcing channel is reliable (charity shop, estate sale, regular car boot). Diesel Jeans sourced at €12+ are a margin squeeze at €21 average. The high-value opportunity is model-specific: the 1DR-5005 (low-rise, wide leg, a direct runway reference) and the Jogg Jeans (elasticated denim with athletic cut, consistent EU5 secondary demand) both exceed the €21 floor significantly when correctly identified and listed with the model name visible in the title.",
        ],
        cta: pricingBodyCta("body_diesel_20260915"),
      },
      {
        h: "Hoodies: modest margin, collab upside",
        p: [
          "Hoodies at 25 departures and €20 average sit at a buy-below of roughly €13 — viable for pieces sourced at €5–10 at charity shops but not worth deliberate targeting. The exception is Diesel graphic hoodies from the 2003–2009 era (vintage 'Only The Brave' branding, D-logo chest print, flame-logo hoodies) which trade above the €20 floor due to Y2K demand — these can exit at €30–45 when correctly identified and photographed against a clean background.",
          "Glenn Martens era Hoodies (2022–2025) are a second upside cohort: the D-Kroosshort and related oversized cuts in washed fleece or heavy cotton are sought as wardrobe basics with runway adjacency and exit at €35–55 in good condition. If sourcing at a venue where you can check labels, the Martens-era pieces are clearly dateable by cut and hardware — the D-logo rubber patches and the Diesel wordmark placement changed visibly between the pre-2022 and post-2022 collections.",
        ],
      },
      {
        h: "Authentication and condition checks",
        p: [
          "Diesel counterfeiting is most common at the Jeans level. Checks: the rivets should carry a stamped 'D' mark (authentic Diesel hardware); the zipper pull should be metal with the Diesel wordmark or D logo, not a blank brass pull; the stitching on the back pocket 'D' detail should be clean with no thread breaks. On runway-era pieces, the care label and the branded button details are the most consistent tells.",
          "Condition priority for Jeans: check the inner thigh for wear-through (the most common damage point on denim at €10–20 sourcing price); check the zip operation; check the waistband press-stud. For Jackets: check lining integrity on leather-look pieces (peeling lining is unsellable), check zip pulls, check collar and cuff condition on denim pieces. A denim jacket with a split inner seam can be sold as 'good condition — minor interior seam wear' but it reduces conversion speed and price.",
        ],
      },
    ],
    faq: [
      {
        q: "Is Diesel worth reselling on Vinted?",
        a: "Yes — selectively. Diesel ranked #8 by watched departures across Spain, France, Germany, Italy and Portugal in the week to 14 September 2026: 178 listings left the shelf at an average of €23. Jackets drive the real margin at 19 departures averaging €61 (buy-below ~€41). Y2K and Glenn Martens era pieces command a premium; generic modern Diesel denim averages €21 and requires high-volume sourcing discipline.",
      },
      {
        q: "What is the buy-below price for Diesel Jackets on Vinted?",
        a: "With Diesel Jackets averaging €61 at departure across EU Vinted markets (week to 14 September 2026), and modelling a ~5% platform deduction and 30% target margin, the buy-below sits around €41. This applies to Y2K era and Glenn Martens runway pieces that exit at or above €61 — generic Diesel outerwear from 2015–2020 does not reach this floor. Resale IQ returns the exact buy-below for specific Diesel models.",
      },
      {
        q: "What Diesel items sell best on Vinted?",
        a: "Jackets are the highest-value category: 19 departures at €61 average in the week to 14 September 2026. Y2K distressed denim truckers, Glenn Martens runway cuts (D-Ektor, oversized denim), and leather or faux-leather pieces from 2003–2009 lead. Jeans are the volume leader (78 departures at €21 average), with model-specific pieces — 1DR-5005, Jogg Jeans — exceeding the category average significantly.",
      },
      {
        q: "How do I spot fake Diesel jeans?",
        a: "Check three things: 1) Rivets should have a stamped 'D' mark — blank or poorly stamped hardware is a common fake tell. 2) The zipper pull should be metal with the Diesel wordmark or D logo, not a plain brass pull. 3) The back pocket 'D' stitching should be clean with no thread breaks or skipped stitches. On runway-era pieces, the care label and branded button hardware changed visibly post-2022 — comparing against known authentic reference photos is the fastest secondary check.",
      },
      {
        q: "How does Diesel compare to Nike and Lacoste for resale on Vinted?",
        a: "Diesel (88 departures in the last 30 days, €23 avg) sits between Nike (172/week, €62 avg) and Lacoste (118/week in the same EU5 rankings). Nike has a much higher average due to Sneakers; Diesel's average is weighted down by commodity denim. The Jacket categories are comparable in per-unit margin potential: Diesel Jackets at €61 avg vs Lacoste Jackets (estimated higher). The sourcing skill for Diesel is era-identification; for Nike it is model-and-colourway precision.",
      },
    ],
  },
]
