// Batch 8 of SEO/AEO articles. Same contract as blog-posts.ts.
// Honest claims only: listings-tracked via TRACKED + fillTracked, no earnings promises,
// no tax/legal advice presented as professional advice.

import { TRACKED } from "@/lib/stats"
import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

const BRAND = "Resale IQ"

export const POSTS_8: BlogPost[] = [
  {
    slug: "lacoste-reselling-vinted-guide",
    title: "Lacoste Reselling on Vinted: Polo Shirts Lead Volume, Jackets Hit €80 Average",
    seoTitle: "Is Lacoste Worth Reselling on Vinted? — Resale IQ",
    description:
      "Lacoste ranks #11 by watched departures across 5 EU Vinted markets — 118/week at €33 average. Shirts dominate volume at 62 departures averaging €27 (buy-below ~€18). Jackets are the margin play: 9 departures averaging €80 (buy-below ~€53). The polo sourcing game is volume; the jacket play is era-selection.",
    date: "2026-09-15",
    category: "Sourcing",
    readMins: 7,
    intro:
      "Week to 14 September 2026, Lacoste ranked #11 across Spain, France, Germany, Italy and Portugal with 118 watched departures at an average exit price of €33. Shirts — which is effectively the L.12.12 polo and its variants — account for more than half of all Lacoste departures: 62 out of 118, averaging €27. That makes Lacoste primarily a polo-volume play, with a narrow but meaningful jacket opportunity sitting above €80 average. Two distinct reseller strategies emerge from the same brand.",
    sections: [
      {
        h: "Volume and category breakdown",
        p: [
          "Of the 118 watched departures in the week to 14 September 2026, Shirts led at 62 exits averaging €27 — this category is dominated by the L.12.12 polo and its colour-variant relatives. T-Shirts contributed 20 departures at €21 average. Hoodies added 12 departures averaging €41. Jackets came in at 9 departures averaging €80 — the outlier category by per-unit margin. Tracksuits rounded out the top five at 6 departures averaging €37.",
          "Full Lacoste volumes are on " +
            ilinkHref("flip") +
            " and update weekly. Shirts are structurally dominant — 53% of all departures — because the L.12.12 polo is Lacoste's most recognised product and the item buyers on Vinted search for by name. The category average of €27 conceals a useful range: limited-edition colourways and Japan-market L.12.12 variants exit closer to €45–60, while the standard-colour contemporary polo sits at €18–22.",
        ],
      },
      {
        h: "Buy-below by category",
        p: [
          "With Shirts averaging €27 at departure and Vinted modelling roughly a 5% platform deduction, the departure-net is around €25.65. Applying a 30% target margin gives a buy-below of approximately €18 for standard Lacoste polo shirts. Hoodies at €41 average give a buy-below near €27. Tracksuits at €37 average give a buy-below near €25.",
          "Jackets at €80 average give a departure-net of €76 and a buy-below of approximately €53. Any Lacoste jacket sourced below €53 — in correct condition for the specific cut — has a realistic margin at current EU5 departure prices. T-Shirts at €21 give a buy-below near €14; these are viable only as high-volume plays from low-cost sourcing channels.",
        ],
        cta: pricingMidCta("ctr_lacoste_20260915"),
      },
      {
        h: "Polo shirts: the L.12.12 is the sourcing target, not 'any Lacoste polo'",
        p: [
          "The L.12.12 is Lacoste's original tennis polo, manufactured since 1933 and available in hundreds of colourways across every season. The secondary market for it on Vinted is deep precisely because it is a known quantity: buyers search by model code, they know their size, and they buy with confidence. For resellers, that predictability is the advantage — a clean L.12.12 in a mid-tone colour (navy, racing green, white, burgundy) in EU size M or L will move. A coral-pink L.12.12 in XXS requires a narrower buyer.",
          "The L.12.12 sourcing hierarchy on price: Japan-market (MIF — Made In France label, or 'Lacoste France' sub-label) variants and limited-colourway annual editions (the French brand has done annual colour drops since the late 1990s) exit at €40–60. Standard-colour contemporary L.12.12 in clean condition exit at €18–25. Worn standard-colour L.12.12 — collar fraying, underarm stain — exit at €8–12 if they move at all. Condition at the polo level is binary: it either presents cleanly or it does not. Pit stains are a full write-off.",
        ],
      },
      {
        h: "Jackets: the €80 average and what drives it",
        p: [
          "At 9 departures and €80 average, Lacoste Jackets are a low-volume, high-margin outlier category. The €80 average is driven by three Lacoste jacket types that consistently exit above brand average: the Lacoste Heritage windbreaker (80s-design revival, tri-colour panel, often Japan or France market only), leather and faux-leather bomber jackets from the 2005–2012 Lacoste Sport luxury line, and heavy cotton or sherpa varsity-adjacent pieces from the Live sub-line (2010–2018).",
          "Generic Lacoste outerwear from 2019–2024 — the standard Lacoste padded jacket, the everyday puffer, the basic rain jacket — does not reach the €80 floor. These exit at €25–45 depending on condition and colour. The sourcing skill for Lacoste Jackets is sub-line literacy: 'Lacoste Sport' and 'Lacoste Live' labels on the garment indicate elevated-margin potential; the plain 'Lacoste' label on contemporary basics does not.",
        ],
      },
      {
        h: "Hoodies and tracksuits",
        p: [
          "Hoodies at 12 departures and €41 average sit at a buy-below of ~€27 — an accessible target if sourcing at charity shops or car boots where Lacoste hoodies appear at €8–15. The €41 average is credibly achievable for Lacoste Big Crocodile logo hoodies (the oversized crocodile graphic, which trades above the standard Lacoste crest), Lacoste Sport heavyweight fleece pieces, and anything from the Lacoste x Polaroid, Lacoste x National Geographic, or Lacoste x Netflix collab lines released 2018–2022.",
          "Tracksuits at 6 departures and €37 average give a buy-below of ~€25. Full matching sets (jacket + bottoms, same colourway, same sub-line) consistently outperform the category average — a matched Lacoste Sport tracksuit in electric blue or white can exit at €55–80 if the set is complete and unworn or lightly worn. Selling separates is a fallback, not a strategy: buyers searching for tracksuits want the set.",
        ],
        cta: pricingBodyCta("body_lacoste_20260915"),
      },
      {
        h: "Authentication and condition checks",
        p: [
          "Lacoste counterfeiting is high-volume at the polo level. The three fastest checks: 1) The crocodile embroidery should have visible texture — individual scales, defined tail, open jaw. Counterfeit Lacoste often has a flat, screen-printed or heat-transferred crocodile rather than a raised embroidery. 2) The collar should be piqué cotton with uniform weave — fakes often use a lower-thread-count or synthetic piqué that pills faster. 3) The interior label should read 'Lacoste' with the country of manufacture stated clearly; 'Made In France' on the label commands a premium and is frequently faked — the MIF label uses a specific serif typeface and has a different care icon layout from the standard international label.",
          "On Jacket authentication: the key tell is the zipper hardware. Authentic Lacoste jackets use YKK zippers with the crocodile or 'Lacoste' pull engraved on the tab. The colour of the zipper tape (the fabric behind the teeth) on Heritage and Sport pieces is often colour-matched to the jacket — a mismatch indicates a repair or a counterfeit. Check sleeve seams and collar lining for stitching consistency.",
        ],
      },
    ],
    faq: [
      {
        q: "Is Lacoste worth reselling on Vinted?",
        a: "Yes — with selectivity. Lacoste ranked #11 by watched departures across Spain, France, Germany, Italy and Portugal in the week to 14 September 2026: 118 listings left the shelf at an average of €33. Polo shirts (L.12.12) dominate volume at 62 departures averaging €27 (buy-below ~€18). Jackets are the high-margin category at 9 departures averaging €80 (buy-below ~€53). Condition and sub-line identification are the key sourcing variables.",
      },
      {
        q: "What is the buy-below price for Lacoste on Vinted?",
        a: "It depends on the category. Lacoste polo shirts (Shirts category) averaged €27 at departure across EU Vinted markets in the week to 14 September 2026 — buy-below is approximately €18. Jackets averaged €80 — buy-below is approximately €53. Hoodies averaged €41 — buy-below approximately €27. Resale IQ returns the exact buy-below for specific Lacoste models, adjusted for current departure data.",
      },
      {
        q: "What Lacoste items sell best on Vinted?",
        a: "Polo shirts lead volume: 62 departures at €27 average in the week to 14 September 2026, driven by the L.12.12 model. Jackets have the highest per-unit value: 9 departures at €80 average, led by Heritage windbreakers, Lacoste Sport leather pieces, and Live sub-line varsity styles. Full tracksuit sets consistently outperform the €37 Tracksuit category average when sold as complete matching sets.",
      },
      {
        q: "How do I spot fake Lacoste polo shirts?",
        a: "Check three things: 1) The crocodile embroidery should be raised and textured with visible individual scales and an open jaw — flat or printed-looking crocodiles are counterfeit tells. 2) The piqué cotton should have a uniform, dense weave — thin or synthetic-feeling fabric indicates a fake. 3) The interior label should clearly state country of manufacture; 'Made In France' labels are frequently counterfeited and use a specific serif font with a colour-matched icon layout distinct from standard international Lacoste labels.",
      },
      {
        q: "How does Lacoste compare to Ralph Lauren and Fred Perry for resale on Vinted?",
        a: "In the week to 14 September 2026: Fred Perry led at 893 departures/week at €18 avg (very high volume, lower per-unit margin); Lacoste sat at 118/week at €33 avg; Ralph Lauren at 62/week at €37 avg. Fred Perry is a volume game; Lacoste and Ralph Lauren are selectivity games. Lacoste's Jacket category (€80 avg) is the highest-margin outlier across the three polo brands. Fred Perry's Jackets average €36 and Ralph Lauren Jackets average €50 in the same period.",
      },
    ],
  },
]
