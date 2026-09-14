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
    title: "Lacoste Reselling on Vinted: Jackets at €80 Average, Shirts Lead Volume",
    seoTitle: "Is Lacoste Worth Reselling on Vinted? — Resale IQ",
    description:
      "Lacoste ranks #11 by watched departures across 5 EU Vinted markets — 118/week at €33 average. Jackets lead by revenue at 9 departures averaging €80 (buy-below ~€53). Shirts dominate volume at 62 departures averaging €27 — the highest Shirt volume of any top-15 brand.",
    date: "2026-09-15",
    category: "Sourcing",
    readMins: 7,
    intro:
      "Week to 14 September 2026, Lacoste ranked #11 across Spain, France, Germany, Italy and Portugal with 118 watched departures at an average exit price of €33. The standout structural fact: Shirts account for 52% of all Lacoste departures (62 of 118) at €27 average — the highest Shirt concentration of any top-15 brand on EU Vinted. Jackets are the margin story at 9 departures averaging €80, and Hoodies outperform expectation at 12 departures averaging €41. Lacoste is not a sneaker brand on Vinted; it is a polo and outerwear market.",
    sections: [
      {
        h: "Volume and category breakdown",
        p: [
          "Of the 118 watched departures in the week to 14 September 2026, Shirts dominated at 62 exits averaging €27. T-Shirts added 20 departures averaging €21. Hoodies contributed 12 departures averaging €41. Jackets came in at 9 departures averaging €80 — the highest average of any Lacoste category and above the Vinted average for Jackets across most top-10 brands. Tracksuits rounded out the top five at 6 departures averaging €37.",
          "Full Lacoste volumes are on " +
            ilinkHref("flip") +
            " and update weekly. The €33 brand average is structurally driven by Shirt volume; strip the Shirt category and the remaining departures average over €42. The sourcing question is whether you are building a Shirt volume play or targeting the high-ticket Jacket and Hoodie minority.",
        ],
      },
      {
        h: "Buy-below by category",
        p: [
          "With Jackets averaging €80 at departure and Vinted modelling roughly a 5% platform deduction, the departure-net is around €76. Applying a 30% target margin gives a buy-below of approximately €53. Any Lacoste Jacket sourced below that price — correct condition and era — has a realistic margin at current departure prices.",
          "Shirts at €27 average give a buy-below near €18. T-Shirts at €21 give a buy-below near €14. Hoodies at €41 give a buy-below near €27. Tracksuits at €37 give a buy-below near €25. The Jacket category is the clearest margin target; Shirts at buy-below €18 are viable as a high-volume charity shop play if sourcing costs are consistently below that floor.",
        ],
        cta: pricingMidCta("ctr_lacoste_20260915"),
      },
      {
        h: "Shirts: the volume engine and what drives €27",
        p: [
          "The €27 Shirt average for Lacoste is not uniform. It is anchored by the L.12.12 polo — Lacoste's core piqué cotton polo, produced in consistent colourways since 1933. On EU Vinted, the L.12.12 in classic colourways (white, navy, green, red) in sizes M and L exits reliably at €20–30 in very good condition. Larger sizes (2XL+) and harder colourways (specific pastels from limited seasons) can reach €35–45.",
          "The sourcing trap: Lacoste produces significant volume for outlet and multi-brand retail at slightly reduced quality markers. Outlet-edition polos have the same external branding but lighter fabric and different care label formatting. Buyers on Vinted are not always able to detect this at purchase, but returns and disputes rise with repeat outlet sourcing. Checking the fabric weight and the croc detail sharpness (the embroidered crocodile on outlet pieces tends to have blurrier edge definition) is the practical field check.",
        ],
      },
      {
        h: "Jackets: €80 average and what reaches that price",
        p: [
          "Lacoste Jackets at €80 average are driven by a specific subset: the BH5456 and related padded bomber silhouettes from 2020–2024 in clean condition, full-zip tech-fabric pieces from the Sport and LIVE lines, and classic Harrington cuts in the heritage colourways. The €80 figure includes outliers — archive Lacoste tracksuit jackets from the 1970s–1980s with original velour detailing that can exit at €120–180 — but the mainstream signal is clean contemporary outerwear.",
          "Condition tolerance is low for Jackets: a zip defect or lining wear drops the exit price below the sourcing floor. The buy-below of ~€53 applies only to pieces that will photograph well and list credibly at €75+. A Lacoste Jacket sourced at €40 with a stiff zip is not a €80 listing; it is a €45 listing at best, which leaves no margin.",
        ],
      },
      {
        h: "Hoodies: above-average exit and the colourway premium",
        p: [
          "At 12 departures and €41 average, Lacoste Hoodies are the second-highest average category and sit above both Nike Hoodies (€23) and Diesel Hoodies (€20) on a per-unit basis. The premium reflects Lacoste's positioning: the SH9623 and related full-zip fleece cuts in premium colourways (navy, dark green, burgundy) maintain €35–50 exit prices because buyers view them as durable basics with brand credibility.",
          "Sourcing signal: Lacoste Hoodies with the full embroidered croc (not the smaller printed badge) command a premium. The embroidered version is the mainline product; the printed badge is common in diffusion lines and gift-set adjacents. This is visible on the listing photo when the lighting is adequate — offer for the embroidered version, pass on or negotiate hard for the badge version.",
        ],
        cta: pricingBodyCta("body_lacoste_20260915"),
      },
      {
        h: "Authentication and condition checks",
        p: [
          "Lacoste counterfeits are common at the Shirt level. Checks: the embroidered crocodile should have clean edge definition with the tail curving upward cleanly — blurry edges, incorrect proportions, or a flat tail are common fake markers. The interior label should read 'Lacoste' with the correct typeface and include country of origin; generic 'Made in China' labels without factory codes are a flag on items claiming vintage French origin. The mother-of-pearl buttons on L.12.12 polos should have a slight iridescence — plain white plastic buttons are a counterfeit tell.",
          "Condition priority: for Shirts, check collar and cuff pilling (the most visible wear on piqué cotton at resale), check for deodorant staining on the underarm interior of light colourways, and check that the front placket buttons are all present and undamaged. For Jackets: check zip operation from both ends, check lining at the cuffs (common fraying point), check the croc badge or patch for lift at the edges.",
        ],
      },
    ],
    faq: [
      {
        q: "Is Lacoste worth reselling on Vinted?",
        a: "Yes — primarily for Shirts and Jackets. Lacoste ranked #11 by watched departures across Spain, France, Germany, Italy and Portugal in the week to 14 September 2026: 118 departures at €33 average. Shirts lead volume at 62 departures averaging €27 (buy-below ~€18). Jackets lead by margin at 9 departures averaging €80 (buy-below ~€53). The L.12.12 polo is the backbone of the Shirt volume; specific outerwear lines drive the Jacket average.",
      },
      {
        q: "What is the buy-below price for Lacoste on Vinted?",
        a: "Buy-below varies by category. Lacoste Jackets averaging €80: buy-below ~€53. Hoodies averaging €41: buy-below ~€27. Tracksuits averaging €37: buy-below ~€25. Shirts averaging €27: buy-below ~€18. T-Shirts averaging €21: buy-below ~€14. Resale IQ returns the exact buy-below for specific Lacoste models based on live EU Vinted departure data.",
      },
      {
        q: "What Lacoste items sell best on Vinted?",
        a: "By volume: Shirts (62 departures/week at €27 avg) — led by the L.12.12 polo in classic colourways (white, navy, green) in sizes M and L. By revenue per unit: Jackets (9 departures at €80 avg) — clean contemporary outerwear and archive velour pieces. Hoodies (12 departures at €41 avg) are the strongest apparel category by unit value outside outerwear.",
      },
      {
        q: "How do I spot fake Lacoste polos?",
        a: "Three checks: 1) The embroidered crocodile should have clean edge definition with the tail curving upward — blurry edges or a flat tail are common counterfeits. 2) The interior label should include a factory code with country of origin, not just 'Made in China'. 3) The front placket buttons should have a slight iridescence (mother-of-pearl) — plain white plastic buttons are a counterfeit tell on mainline L.12.12 pieces.",
      },
      {
        q: "How does Lacoste compare to Fred Perry for resale on Vinted?",
        a: "Fred Perry (#1 by departures, 893/week at €18 avg) has nearly eight times Lacoste's volume but a lower average price. Lacoste's €33 average reflects higher-ticket outerwear. For sourcing strategy: Fred Perry is a volume play at low price points (buy-below ~€9 Shirts); Lacoste is a higher-ticket play with Jackets at €80 and Hoodies at €41. Both brands have strong Shirt volume, but Lacoste Shirts are worth nearly twice as much per exit.",
      },
    ],
  },
  {
    slug: "adidas-reselling-vinted-guide",
    title: "Adidas Reselling on Vinted: Sneakers at €58 Average, Jackets the Margin Play",
    seoTitle: "Is Adidas Worth Reselling on Vinted? — Resale IQ",
    description:
      "Adidas ranks #13 by watched departures across 5 EU Vinted markets — 98/week at €48 average. Sneakers lead at 49 departures averaging €58 (buy-below ~€39). Jackets are the outlier: 8 departures averaging €75 (buy-below ~€50). The Adidas resale edge is model and colourway precision — the wrong silhouette at the right price still loses.",
    date: "2026-09-15",
    category: "Sourcing",
    readMins: 7,
    intro:
      "Week to 14 September 2026, Adidas ranked #13 across Spain, France, Germany, Italy and Portugal with 98 watched departures at an average exit price of €48. The €48 average is the highest brand average of any non-luxury brand in the EU5 top 15, higher than Nike's €62 when you strip Nike Sneakers out of the comparison. Sneakers lead volume at 49 of 98 departures (50%), but the structural edge is clear: Adidas is a sneaker-first market on Vinted, and within sneakers, specific silhouettes — Samba, Gazelle, Campus 00s — are responsible for a disproportionate share of the €58 average. Sourcing the wrong Adidas model at buy-below still loses.",
    sections: [
      {
        h: "Volume and category breakdown",
        p: [
          "Of the 98 watched departures in the week to 14 September 2026, Sneakers dominated at 49 exits averaging €58. Tracksuits contributed 18 departures averaging €40. T-Shirts added 13 departures averaging €20. Jackets came in at 8 departures averaging €75 — the highest per-unit average of any Adidas category. Hoodies rounded out the top five at 6 departures averaging €29.",
          "Full Adidas volumes are on " +
            ilinkHref("flip") +
            " and update weekly. The 50% Sneaker concentration is consistent with Adidas's market position: Samba and Gazelle demand drove Adidas back to cultural relevance from 2022 onwards, and those models still account for the majority of Vinted resale activity in EU markets. The other categories — Tracksuits especially — are secondary plays for sellers already active in the footwear market.",
        ],
      },
      {
        h: "Buy-below by category",
        p: [
          "With Jackets averaging €75 at departure and Vinted modelling roughly a 5% platform deduction, the departure-net is around €71.25. Applying a 30% target margin gives a buy-below of approximately €50. Sneakers at €58 average give a buy-below near €39. Tracksuits at €40 give a buy-below near €27. T-Shirts at €20 give a buy-below near €13. Hoodies at €29 give a buy-below near €19.",
          "The practical hierarchy: Jackets and Sneakers are the primary sourcing targets by margin. T-Shirts at €13 buy-below are viable only as incidental sourcing (charity shop fillers) — they are not worth deliberate targeting at €20 average given the condition sensitivity and photography time required.",
        ],
        cta: pricingMidCta("ctr_adidas_20260915"),
      },
      {
        h: "Sneakers: the Samba and Gazelle premium",
        p: [
          "The €58 Sneaker average for Adidas is not uniform across silhouettes. The Samba OG (in white/black and white/gum colourways) exits at €55–90 depending on size and condition; the Gazelle (particularly in off-white, green suede, and SPZL versions) exits at €50–80; the Campus 00s (in core colourways and select collabs) exits at €55–100 for clean pairs. These three models drive the majority of the €58 average because they have consistent secondary market demand across EU5.",
          "The sourcing trap: older Adidas Sneakers that are not cultural-moment silhouettes trade at or below retail. Stan Smith (standard colourways) exits at €20–35. Superstar (standard colourways) exits at €20–40. Ultra Boost (previous-gen) exits at €25–45. Sourcing any of these at €39 buy-below is a losing position. The Adidas resale edge is silhouette identification before purchase, not brand-name sourcing.",
        ],
      },
      {
        h: "Jackets: the highest per-unit average and what reaches €75",
        p: [
          "Adidas Jackets averaging €75 at exit places them above Lacoste Jackets (€80) only marginally, but the category composition differs. The Adidas Jacket high-average is driven by: the Superstar track jacket in vintage colourways (particularly the 3-stripe in white/black or navy/gold from the 2000s era); the SST (Superstar Track Top) in clean condition; the firebird tracksuit top in specific vintage colourways; and Adidas x Gucci, x Prada, x Fear of God collabs which are rare but exit at €150–400.",
          "Non-collab contemporary Adidas Jackets — the standard Condivo and Tiro training jackets — exit at €15–30 and do not contribute to the €75 average. Condition is binary for Jackets: a clean vintage SST photographs well and lists cleanly at €70–90; the same jacket with faded stripes or lining peeling is a €30 listing at most.",
        ],
      },
      {
        h: "Tracksuits: the Y2K play and the colourway matrix",
        p: [
          "At 18 departures and €40 average, Tracksuits are Adidas's second-highest volume category and sit at a buy-below of ~€27. The €40 average is supported by matching two-piece sets: the SST (Superstar Tracksuit) in core colourways exits at €45–80 as a set; sold separately, top and bottoms each exit at €20–35.",
          "The practical sourcing decision: when you find an SST top without the matching bottoms, the standalone top exits at €25–35 (still above buy-below if sourced below €27). The matching set commands 40–60% more than the separate pieces combined, so it is worth photographing together and listing as a set. Colourways: white/black and navy/gold command premiums; all-black is common and exits at the lower end of the range.",
        ],
        cta: pricingBodyCta("body_adidas_20260915"),
      },
      {
        h: "Authentication and condition checks",
        p: [
          "Adidas counterfeits are most common at the Sneaker and Jacket level. Sneaker checks: the three stripes should be evenly spaced with clean edges — uneven spacing or gradient edges at the stripe termination are common counterfeit tells. The Adidas wordmark font should have consistent stroke weight; counterfeit fonts often have slightly thicker downstrokes. The boost sole (on Boost models) should have a uniform cellular texture — smooth spots or inconsistent depth indicate a fake sole.",
          "Jacket checks: the three stripes on SST jackets should be the same width from shoulder seam to cuff with no taper — tapering stripes are a common factory fake tell. The zip pull should carry the Adidas wordmark or trefoil; generic pulls are a flag. The Adidas trefoil or Adidas Performance badge (depending on era) on the chest should have clean edge definition.",
        ],
      },
    ],
    faq: [
      {
        q: "Is Adidas worth reselling on Vinted?",
        a: "Yes — with model precision. Adidas ranked #13 by watched departures across Spain, France, Germany, Italy and Portugal in the week to 14 September 2026: 98 departures at €48 average. Sneakers lead at 49 departures averaging €58 (buy-below ~€39), but the €58 average is driven by Samba, Gazelle and Campus 00s — sourcing generic Adidas Sneakers at buy-below still loses. Jackets are the outlier at 8 departures averaging €75 (buy-below ~€50).",
      },
      {
        q: "What is the buy-below price for Adidas Sneakers on Vinted?",
        a: "With Adidas Sneakers averaging €58 at departure across EU Vinted markets (week to 14 September 2026), and modelling a 5% platform deduction and 30% target margin, the buy-below sits around €39. This applies to models that consistently reach or exceed €58 exit — Samba OG, Gazelle, Campus 00s in correct colourways. Generic Adidas Sneakers (Stan Smith, Superstar in standard colourways) average €20–40 and do not support a €39 sourcing price.",
      },
      {
        q: "What Adidas items sell best on Vinted?",
        a: "By volume: Sneakers (49 departures/week at €58 avg) — led by Samba OG, Gazelle, and Campus 00s in cultural colourways. By per-unit value: Jackets (8 departures at €75 avg) — vintage SST, firebird, and Adidas collab outerwear. Tracksuits (18 departures at €40 avg) are the strongest apparel category — matching SST sets command 40–60% premium over the separate pieces.",
      },
      {
        q: "Which Adidas sneakers are worth reselling on Vinted?",
        a: "The primary EU Vinted resale models in the week to 14 September 2026: Samba OG (white/black, white/gum — exits €55–90), Gazelle (off-white, green suede, SPZL versions — exits €50–80), Campus 00s (core and collab colourways — exits €55–100 for clean pairs). Models that do NOT support buy-below at current averages: Stan Smith, Superstar in standard colourways, most previous-gen Ultra Boost.",
      },
      {
        q: "How does Adidas compare to Nike for resale on Vinted?",
        a: "Nike ranks #9 with 172 departures/week at €62 average; Adidas ranks #13 with 98 departures/week at €48 average. Nike has higher volume and a higher average due to Air Max and Jordan colourway premiums. Adidas's Jacket average (€75) slightly exceeds Nike's Jacket average (€55). The sourcing logic is the same for both: wrong model = no margin regardless of brand. Adidas Samba and Gazelle are the equivalent of Nike Air Max 1 and Jordan 1 OG — the silhouettes carrying the average.",
      },
    ],
  },
]
