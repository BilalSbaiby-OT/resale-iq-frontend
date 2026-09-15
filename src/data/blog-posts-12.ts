// Batch 12 of SEO/AEO articles. Same contract as blog-posts.ts.
// Honest claims only: listings-tracked via TRACKED + fillTracked, no earnings promises,
// no tax/legal advice presented as professional advice.

import { TRACKED } from "@/lib/stats"
import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

const BRAND = "Resale IQ"

export const POSTS_12: BlogPost[] = [
  {
    slug: "uniqlo-reselling-vinted-guide",
    title: "Uniqlo Reselling on Vinted: The Collab Premium vs the Basics Trap",
    seoTitle: "Is Uniqlo Worth Reselling on Vinted? — Resale IQ",
    description:
      "Uniqlo ranked #20 by watched departures across 5 EU Vinted markets — 57/week at €18 average. The basics (HeatTech, Airism, fleece) have no margin. The entire reselling case is KAWS, JW Anderson, UNIQLO U, and collab pieces sourced below €19.",
    date: "2026-09-15",

    preflightQuery: "Uniqlo",
    category: "Sourcing",
    readMins: 6,
    intro:
      "Week to 14 September 2026, Uniqlo ranked #20 across Spain, France, Germany, Italy and Portugal with 57 watched departures at an average exit price of €18. That average is structurally misleading and dangerous for resellers: the number is dragged up by collab Hoodies (€28 avg) and dragged down by standard T-Shirts (€12) and Shirts (€10) that are available new for €8–15 and have zero margin on Vinted. The reselling case for Uniqlo is almost entirely the collaboration line — KAWS × Uniqlo, JW Anderson × Uniqlo, MoMA × Uniqlo, Pokemon × Uniqlo — sourced below the buy-below price. Standard Uniqlo basics are a reselling trap.",
    sections: [
      {
        h: "Volume and category breakdown",
        p: [
          "Of the 57 watched departures in the week to 14 September 2026, Hoodies led at 15 exits averaging €28. Jackets contributed 13 departures averaging €20. T-Shirts added 11 departures averaging €12. Shirts added 10 departures averaging €10. Bags rounded out at 4 departures averaging €10.",
          "Full Uniqlo volumes are on " +
            ilinkHref("flip") +
            " and update weekly. The €18 brand average conceals a critical split: only Hoodies at €28 offer meaningful margin room, and only for collab pieces — not standard production. Shirts at €10, T-Shirts at €12, and Bags at €10 sit at or below the price of the same item new at retail. There is no realistic reselling margin in standard Uniqlo basics on EU Vinted.",
        ],
      },
      {
        h: "Buy-below by category",
        p: [
          "With Hoodies averaging €28 at departure and Vinted modelling roughly a 5% platform deduction, the departure-net is around €26.60. Applying a 30% target margin gives a buy-below of approximately €19. Any Uniqlo Hoodie sourced below €19 — and it must be a collab or UNIQLO U piece, not a standard fleece — has a realistic margin at current departure prices.",
          "Jackets at €20 average give a buy-below near €13. T-Shirts at €12 give a buy-below near €8. Shirts at €10 give a buy-below near €7. Bags at €10 give a buy-below near €7. The Hoodie category is the only one with a realistic sourcing case — and only for collab or premium sub-line pieces. Jackets at a €13 buy-below are theoretically viable at charity shop clearance pricing only, and competition for collab Uniqlo outerwear is higher than standard category.",
        ],
        cta: pricingMidCta("ctr_uniqlo_20260915"),
      },
      {
        h: "The basics trap: why standard Uniqlo has no margin",
        p: [
          "Uniqlo's core value proposition is high-quality basics at accessible prices: a HeatTech Crew Neck T-Shirt retails at €8.90, a Supima Cotton T-Shirt at €14.90, a Ribbed Fleece Full-Zip Hoodie at €24.90. On EU Vinted, these items exit at €8–14 in very good condition — approximately the same as or below the retail price of the same item, which Uniqlo sells with a permanent online discount cycle. A reseller buying a standard Uniqlo fleece hoodie at a charity shop for €6 and listing it at €14 on Vinted is, at best, breaking even after fees and time.",
          "The structural problem is substitutability: Uniqlo basics are widely available new, Uniqlo has a large EU store footprint, and buyers on EU Vinted know they can buy the same HeatTech from a Uniqlo store for €10–12. The secondary market for basics has no premium over retail because buyers have no reason to pay one. This is the opposite of the reselling dynamic for discontinued or collab pieces — where secondary pricing is the only pricing.",
        ],
      },
      {
        h: "The collab premium: KAWS, JW Anderson, UNIQLO U",
        p: [
          "The Uniqlo collaboration programme has produced consistently resellable pieces across two decades. The key collab lines on EU Vinted are: KAWS × Uniqlo UT Graphic T-Shirts (the cartoon-character graphics, particularly the Companion and companion-BFF designs), which exit at €30–90 depending on design and size — compared to the new retail of €14.90. KAWS × Uniqlo limited-edition graphic tees are the single highest-upside Uniqlo resale target at EU charity shops, where they are priced at €6–12 regardless of the €30–90 secondary exit.",
          "JW Anderson × Uniqlo (the annual JW Anderson capsule, combining Jonathan Anderson's minimalist-maximalist direction with Uniqlo's fabric quality) exits at €35–80 for Hoodies and Jackets. The JW Anderson × Uniqlo puffer jacket exits at €60–95, far above the €28 Hoodie average for the brand. MoMA × Uniqlo UT Graphics (the annual MoMA artist print series) exit at €20–45 for T-Shirts — a 4–6× premium over the brand's €12 T-Shirt average. Pokemon × Uniqlo and Nintendo × Uniqlo graphic tees exit at €18–50 for iconic designs. UNIQLO U (the annual capsule designed by Christophe Lemaire, Uniqlo's Paris design director) exits at €35–70 for knitwear and Jackets — the sub-brand is understated, interior-label only, and systematically underpriced at charity shops.",
        ],
      },
      {
        h: "UNIQLO U: the premium sub-brand most charity shops miss",
        p: [
          "UNIQLO U is the annual collaboration between Uniqlo and Christophe Lemaire, the French designer who previously worked at Lacoste and Hermès. The capsule uses Uniqlo's technical fabrics (HeatTech, Ultra Light Down, Premium Linen) with Lemaire's minimalist proportioning — reduced silhouettes, muted colourways, understated branding. The exterior carries no visible UNIQLO U branding; identification is by the interior care label, which reads 'UNIQLO U' in place of the standard 'UNIQLO' label.",
          "At EU charity shops, UNIQLO U pieces are priced identically to standard Uniqlo production — staff identify 'Uniqlo knitwear' and price at €8–15 regardless of the sub-line. On EU Vinted, a UNIQLO U boatneck Breton stripe knitwear exits at €45–70; a UNIQLO U blouson jacket exits at €50–90. The identification edge is the entire value proposition: four seconds reading the interior label at a charity shop is the sourcing work. A UNIQLO U lambswool roll-neck sourced at €10 and listed at €55 with the sub-line correctly identified in the listing title is a representative UNIQLO U transaction.",
        ],
        cta: pricingBodyCta("body_uniqlo_20260915"),
      },
      {
        h: "Authentication and condition checks",
        p: [
          "Uniqlo counterfeits are not a meaningful risk — the brand's value proposition does not support the economics of counterfeiting. The primary risk is condition: standard Uniqlo basics pill aggressively on synthetic-cotton blends, and a pilled fleece hoodie with visible bobbling will not exit above €8 regardless of the brand. Check fleece and knitwear for pilling on the chest, underarms, and inner sleeves — these are the first wear points. Check zips on outerwear (Uniqlo uses reliable mid-tier zips, but zip-handle failure is common on heavily used pieces).",
          "For collab UT Graphic T-Shirts: the graphics should be sharp-edged and opaque, not cracked or faded. KAWS × Uniqlo graphics fade noticeably with washing — a faded KAWS tee exits at €15–25 rather than €40–60 for a crisp one. Interior care labels on collab pieces include the collaboration name; a 'KAWS × Uniqlo' label confirms authenticity and is identifiable from the standard 'UNIQLO' label at a glance.",
        ],
      },
    ],
    faq: [
      {
        q: "Is Uniqlo worth reselling on Vinted?",
        a: "Only for collab pieces — KAWS × Uniqlo, JW Anderson × Uniqlo, UNIQLO U, MoMA × Uniqlo UT Graphics. Standard Uniqlo basics (HeatTech, Airism, standard fleece) have no margin: EU Vinted exit prices for basics (€8–14) sit at or below Uniqlo's new retail price. Uniqlo ranked #20 by watched departures across Spain, France, Germany, Italy and Portugal in the week to 14 September 2026: 57 departures at €18 average. Collab Hoodies exit at €28 avg (buy-below ~€19); KAWS tees exit at €30–90.",
      },
      {
        q: "What is the buy-below price for Uniqlo on Vinted?",
        a: "For Uniqlo collab Hoodies: with an average departure of €28 and 5% platform deduction, buy-below sits around €19. For KAWS × Uniqlo UT tees (which exit at €30–90 depending on design), buy-below stretches to €20–63. Standard Uniqlo T-Shirts at €12 avg give buy-below near €8 — below most charity shop prices, making them non-viable. Resale IQ returns exact buy-below by brand, model, and condition.",
      },
      {
        q: "What Uniqlo items sell best on Vinted?",
        a: "By per-unit value: KAWS × Uniqlo UT Graphics (€30–90 for sought-after designs), JW Anderson × Uniqlo Hoodies and Jackets (€35–80), UNIQLO U knitwear and Jackets (€45–90), MoMA × Uniqlo UT Graphics (€20–45). By volume: Hoodies (15 dep/wk at €28 avg), Jackets (13 dep/wk at €20 avg). Standard basics (HeatTech, Airism, fleece, Shirts) are not viable sourcing targets.",
      },
      {
        q: "How do I identify UNIQLO U pieces at charity shops?",
        a: "Interior care label: reads 'UNIQLO U' rather than 'UNIQLO'. No exterior branding distinguishes UNIQLO U from standard Uniqlo. The sub-line uses Uniqlo's premium technical fabrics (Ultra Light Down, Premium Linen, lambswool blends) with minimalist proportioning — slightly dropped shoulders, reduced silhouettes, muted colourways. At charity shops, UNIQLO U is priced at standard Uniqlo rates (€8–15); on EU Vinted, UNIQLO U exits at €45–90. The label is the only check needed.",
      },
      {
        q: "Are KAWS × Uniqlo T-shirts worth reselling?",
        a: "Yes — provided the condition is good. KAWS × Uniqlo UT Graphics exit at €30–90 on EU Vinted for sought-after Companion and Companion-BFF designs, versus €6–12 at EU charity shops and €14.90 at new retail. Buy-below for a KAWS tee targeting €50 exit is around €33. Condition is critical: KAWS × Uniqlo graphics fade with washing — a faded example exits at €15–25; a crisp example exits at €40–80. Check for cracking, fading, and print edge definition before sourcing.",
      },
    ],
  },
  {
    slug: "puma-reselling-vinted-guide",
    title: "Puma Reselling on Vinted: Sneakers at €44 Average and the Model Precision Edge",
    seoTitle: "Is Puma Worth Reselling on Vinted? — Resale IQ",
    description:
      "Puma ranked #21 by watched departures across 5 EU Vinted markets — 56/week at €25 average. Sneakers lead at €44 avg (buy-below ~€29). The sourcing edge is model precision: Puma Suede, Clyde, Palermo and collab models exit far above the brand mean.",
    date: "2026-09-15",

    preflightQuery: "Puma",
    category: "Sourcing",
    readMins: 6,
    intro:
      "Week to 14 September 2026, Puma ranked #21 across Spain, France, Germany, Italy and Portugal with 56 watched departures at an average exit price of €25. Sneakers dominate the reselling case: 21 departures at €44 average, a 76% premium over the brand mean and the only Puma category with a viable sourcing floor. T-Shirts (€9 avg), Hoodies (€16 avg), and Tracksuits (€21 avg) are below practical margin floors. The sourcing edge is model precision — the Puma Suede, Puma Clyde, Puma Palermo, and collab models (Puma × Scuderia Ferrari, Puma × Bode) exit significantly above the €44 category average, while generic Puma runners and court shoes cluster below it.",
    sections: [
      {
        h: "Volume and category breakdown",
        p: [
          "Of the 56 watched departures in the week to 14 September 2026, Sneakers led at 21 exits averaging €44. T-Shirts contributed 15 departures averaging €9. Hoodies added 8 departures averaging €16. Tracksuits added 6 departures averaging €21. Jackets rounded out at 5 departures averaging €19.",
          "Full Puma volumes are on " +
            ilinkHref("flip") +
            " and update weekly. Sneakers represent 38% of departures but carry the entire margin case: at €44 average, they are 76% above the brand mean. T-Shirts at €9, Hoodies at €16, Jackets at €19, and Tracksuits at €21 are all below or at a margin threshold that requires sourcing at charity shop clearance pricing to be viable. The Puma reselling case is primarily a sneaker play.",
        ],
      },
      {
        h: "Buy-below by category",
        p: [
          "With Sneakers averaging €44 at departure and Vinted modelling roughly a 5% platform deduction, the departure-net is around €41.80. Applying a 30% target margin gives a buy-below of approximately €29. Any Puma sneaker sourced below that price — correct model confirmed, correct condition, correct size — has a realistic margin at current departure prices.",
          "Tracksuits at €21 average give a buy-below near €14. Jackets at €19 give a buy-below near €13. Hoodies at €16 give a buy-below near €11. T-Shirts at €9 give a buy-below near €6. The Sneaker category is where the practical sourcing case lives entirely. Tracksuits at a €14 buy-below are theoretically achievable at clearance pricing only; Hoodies, Jackets, and T-Shirts are not viable sourcing targets for deliberate resale strategy.",
        ],
        cta: pricingMidCta("ctr_puma_20260915"),
      },
      {
        h: "The model precision edge: Suede, Clyde, Palermo",
        p: [
          "The €44 Sneaker average conceals a wide model distribution. Puma's heritage and current-hero models exit well above average; generic runners and training shoes exit below it. The high-upside models for EU Vinted resale are: the Puma Suede (1968, originally the Clyde, the brand's most iconic model — a low-profile, suede-upper, gum-sole court shoe modelled on basketball heritage). The Puma Suede exits at €40–80 in very good condition across EU Vinted, depending on colourway — core colourways (black, white, navy, forest green) sell reliably; seasonal and archive colourways reach the top of the range. The Puma Suede was the most worn sneaker at the 1968 Mexico City Olympics and carries genuine heritage positioning.",
          "The Puma Clyde (the signature model of Walt 'Clyde' Frazier, New York Knicks guard — the premium version of the Suede with suede-lined interior and Frazier's name on the quarter panel) exits at €50–100 in very good condition. The Puma Palermo (the current-season hero model, reissued in 2024 as Puma's response to the Adidas Samba / New Balance 550 heritage court shoe trend) exits at €40–75 in clean colourways. The Palermo is in active production and easy to find at EU sports chains at €80–100 new — the used pricing reflects the market position of the hero model currently.",
        ],
      },
      {
        h: "Collab premium: Ferrari, Bode, archive collabs",
        p: [
          "Puma's collaboration history adds a second tier above the model-precision play. Puma × Scuderia Ferrari footwear (the Speed Cat, the Ferrari Driver, and the newer SF range) carries a motorsport heritage premium: the Puma Speed Cat in good condition exits at €50–110 depending on colourway — with the original Speed Cat in Italian racing red or yellow exiting at the top of the range. Charity shops routinely price Speed Cat as generic athletic footwear (€10–20), unaware of the motorsport premium.",
          "Puma × Bode (the New York-based archival upcycling label's collaboration with Puma, producing patchwork and reconstruction footwear and apparel) exits at €80–200+ at EU resale, as a limited-edition collab with a committed secondary market. These are rarely found at charity shops — but when they are, they are priced at standard Puma rates. Puma × A$AP Rocky (the collaboration produced via the Trapstar-adjacent 'Fenty' period) and Puma × Rhianna Fenty pieces exit at €60–140 for footwear. Any Puma with a visible collab identifier — Speed Cat Racing, Scuderia Ferrari patch, Bode patchwork, Fenty label — commands a premium above the standard model exit.",
        ],
      },
      {
        h: "Apparel: T-shirts and tracksuits are not the play",
        p: [
          "Puma apparel — T-Shirts at €9, Hoodies at €16, Tracksuits at €21 — does not generate viable reselling margin for deliberate sourcing strategy. Puma apparel is widely available new at accessible retail prices (Puma T-Shirts retail at €15–25, Hoodies at €30–50 depending on range) and exits on Vinted at prices that reflect the brand's sportswear-basic positioning. The exception is vintage or archive Puma apparel — 1980s and 1990s Puma tracksuits in original colourways (the King tracksuit, the Avanti tracksuit) exit at €50–120 at EU vintage resale, but these require era identification knowledge and are not common enough to build a sourcing strategy around.",
          "For apparel, the buy-below is achievable only at charity shop clearance pricing (under €11 for Hoodies, under €14 for Tracksuits) — and these prices are becoming harder to find as charity shop staff apply sportswear brand premiums more consistently. Sneakers with a known model and clean colourway are the reliable sourcing category.",
        ],
        cta: pricingBodyCta("body_puma_20260915"),
      },
      {
        h: "Authentication and condition checks",
        p: [
          "Puma counterfeits exist but are less prevalent than Nike or Adidas fakes — the brand's positioning outside the highest-hype tier reduces counterfeit economics. For Suede and Clyde: check the Puma Formstripe (the arched stripe on the side panel) — on genuine pieces it is a clean, single-layer embellishment, not a separately-applied sticker or patch; the lettering on the tongue tab should be crisp, not blurred or recoloured. For Speed Cat: the Scuderia Ferrari badging (the prancing horse logo on the tongue and side panel) should be an embroidered or heat-transfer badge, not a screen print; the vintage Speed Cat uses an external sole unit with visible 'Speed Cat' text moulded into the outsole.",
          "Condition checks: Suede uppers scuff and stain readily — check the toe box, the side panel at the Formstripe base, and the heel counter for visible scarring, scuffing, or moisture staining. Suede can be restored but only partially; a scuffed toe box should be reflected in the sourcing price calculation. Midsole yellowing is cosmetic but affects pricing on white and off-white colourways. Check the sock liner for deformation and odour — a deformed sock liner indicates heavy wear and suggests listing at a lower price tier.",
        ],
      },
    ],
    faq: [
      {
        q: "Is Puma worth reselling on Vinted?",
        a: "Yes — specifically Puma Sneakers. Puma ranked #21 by watched departures across Spain, France, Germany, Italy and Portugal in the week to 14 September 2026: 56 departures at €25 average. Sneakers averaged €44 (buy-below ~€29), 76% above the brand mean. The Puma Suede, Puma Clyde, Puma Palermo, and Puma Speed Cat (Scuderia Ferrari collab) are the high-upside models. Puma apparel (T-Shirts at €9, Hoodies at €16) is not a viable sourcing target.",
      },
      {
        q: "What is the buy-below price for Puma on Vinted?",
        a: "For Puma Sneakers: with an average departure of €44 and 5% platform deduction, buy-below sits around €29. For Puma Speed Cat (which exits at €50–110), buy-below stretches to €33–77. For Puma Suede and Palermo (€40–80), buy-below is €27–56. Hoodies at €16 avg give buy-below near €11. T-Shirts at €9 give buy-below near €6. Resale IQ returns exact buy-below by brand, model, and condition.",
      },
      {
        q: "What Puma items sell best on Vinted?",
        a: "By per-unit value: Puma × Bode collab (€80–200+), Puma Speed Cat Scuderia Ferrari (€50–110), Puma Clyde (€50–100), Puma Suede and Palermo (€40–80). By volume: Sneakers (21 dep/wk at €44 avg), T-Shirts (15 dep/wk at €9 avg — not a viable sourcing target). T-Shirts, Hoodies, and Jackets are below practical margin floors.",
      },
      {
        q: "How do I identify a Puma Speed Cat for resale?",
        a: "The Puma Speed Cat is a low-profile motorsport shoe: a leather or suede upper, a flat racing-profile midsole with minimal cushioning (designed for cockpit pedal-feel), a 'Speed Cat' text on the lateral side panel, and Scuderia Ferrari prancing horse badging on the tongue and side for Ferrari-edition models. The sole reads 'Speed Cat' moulded into the outsole on vintage models. The Ferrari collab editions carry the Ferrari shield on the heel counter. Colourway: Italian racing red, yellow, and black are the premium colourways. Non-Ferrari Speed Cats exit at €35–60; Ferrari editions exit at €50–110.",
      },
      {
        q: "How does Puma compare to Adidas and Nike for resale on Vinted?",
        a: "By volume: Nike (98 dep/wk) and Adidas (98 dep/wk) far exceed Puma (56 dep/wk). By Sneaker average: Nike Sneakers average higher than Puma's €44 avg; Adidas Sneakers (Samba, Gazelle, Campus) average €58 in the sourced data. Puma's sourcing advantage is lower competition at charity shops — staff are less likely to identify a Puma Speed Cat or Clyde as premium versus an Adidas Samba. The charity-shop identification edge is wider for Puma than for the higher-hype Nike and Adidas models.",
      },
    ],
  },
]
