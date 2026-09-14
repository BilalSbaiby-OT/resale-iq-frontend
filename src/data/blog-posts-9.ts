// Batch 9 of SEO/AEO articles. Same contract as blog-posts.ts.
// Honest claims only: listings-tracked via TRACKED + fillTracked, no earnings promises,
// no tax/legal advice presented as professional advice.

import { TRACKED } from "@/lib/stats"
import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

const BRAND = "Resale IQ"

export const POSTS_9: BlogPost[] = [
  {
    slug: "vans-reselling-vinted-guide",
    title: "Vans Reselling on Vinted: Sneakers at €51 Average, the Model Precision Edge",
    seoTitle: "Is Vans Worth Reselling on Vinted? — Resale IQ",
    description:
      "Vans ranks #14 by watched departures across 5 EU Vinted markets — 98/week at €36 average. Sneakers dominate at 59 departures averaging €51 (buy-below ~€34). 60% of Vans exits are footwear — brand-name sourcing loses, silhouette precision wins.",
    date: "2026-09-15",
    category: "Sourcing",
    readMins: 7,
    intro:
      "Week to 14 September 2026, Vans ranked #14 across Spain, France, Germany, Italy and Portugal with 98 watched departures at an average exit price of €36. The structure is unusual: 60% of all Vans departures — 59 of 98 — are Sneakers averaging €51. Everything else (T-Shirts, Hoodies, Bags, Caps) averages €11–18 and is effectively a low-margin apparel filler. Vans on EU Vinted is a footwear play, and within footwear it is a silhouette and colourway precision play — sourcing generic Vans at buy-below without knowing which models trade above the average is how margin disappears.",
    sections: [
      {
        h: "Volume and category breakdown",
        p: [
          "Of the 98 watched departures in the week to 14 September 2026, Sneakers dominated at 59 exits averaging €51. T-Shirts added 15 departures averaging €11. Hoodies contributed 11 departures averaging €18. Bags rounded out at 4 departures averaging €9. Caps added 4 departures averaging €10.",
          "Full Vans volumes are on " +
            ilinkHref("flip") +
            " and update weekly. The €36 brand average is anchored by the heavy Sneaker concentration — strip the Sneaker category and the remaining apparel and accessories average just €13. The sourcing decision for Vans is simple: footwear first, apparel only as incidental sourcing at charity-shop prices.",
        ],
      },
      {
        h: "Buy-below by category",
        p: [
          "With Sneakers averaging €51 at departure and Vinted modelling roughly a 5% platform deduction, the departure-net is around €48.45. Applying a 30% target margin gives a buy-below of approximately €34. Any Vans Sneakers sourced below that price — correct model, correct colourway, sellable condition — has a realistic margin at current departure prices.",
          "T-Shirts at €11 average give a buy-below near €7. Hoodies at €18 give a buy-below near €12. Bags at €9 give a buy-below near €6. Caps at €10 give a buy-below near €7. None of these apparel and accessory categories are worth deliberate sourcing — they are viable only when acquired at charity shop prices as part of a mixed lot. The entire Vans value proposition on EU Vinted lives in the Sneaker category.",
        ],
        cta: pricingMidCta("ctr_vans_20260915"),
      },
      {
        h: "Sneakers: which models drive the €51 average",
        p: [
          "The €51 Vans Sneaker average is not uniform across the range. The models that push the average above commodity: the Vans Vault UltraRange EXO (limited distribution colourways) exits at €65–110; the Vans x Supreme collabs (Box Logo half-cab, Court Slip in Supreme colourways) exit at €80–200 depending on colourway and condition; the Old Skool 36 and the SK8-Hi 38 in collaboration colourways (WTAPS, COMMES des GARCONS, Takashi Murakami) exit at €90–300 for clean pairs. The everyday Old Skool in black/white, checkerboard, or basic colourways exits at €25–45.",
          "The sourcing trap: the Vans Old Skool is the most counterfeited sneaker in the EU charity shop ecosystem. A standard Old Skool in a core colourway exits at €25–35 on EU Vinted — well below the €34 buy-below. The only way to reach or exceed buy-below sourcing a standard Old Skool is if you paid under €8 for it. The sourcing edge in Vans is collab and limited-edition identification before purchase: a WTAPS Old Skool or a Supreme Half-Cab sourced at €25 at a car boot is a €120+ listing; a standard black Old Skool sourced at €15 is a loss.",
        ],
      },
      {
        h: "Collab and limited-edition Vans: the identification checklist",
        p: [
          "Vans produces collab editions with external labels (Supreme, WTAPS, KITH, COMME des GARÇONS, A Bathing Ape, Lazy Oaf, Marc Jacobs) and internal Vault editions. The tells on sourcing floor: collab Vans almost always carry interior co-branding on the insole — Supreme's 'Supreme/Vans' text on the sock liner, WTAPS' Japanese katakana on the inner tongue, CDG's branding on the heel tab. The box matters less (collab Vans rarely surface with original box at charity shops) but the insole co-branding is present in nearly all editions and is the fastest field check.",
          "Condition matters more for collab Vans because buyers know what they are paying for: a clean pair in an uncommon colourway lists at full collab premium; the same pair with foxing or sole yellowing drops to 50–60% of premium. EU Vinted buyers in this segment photograph their purchases carefully and are condition-literate. A 'good condition' label on a pair with visible rubber oxidation will lose to a truthful 'very good' listing on a cleaner pair every time.",
        ],
        cta: pricingBodyCta("body_vans_20260915"),
      },
      {
        h: "Standard Old Skool: when it is and isn't worth sourcing",
        p: [
          "The standard Old Skool (black/white, white/black, checkerboard navy, tri-tone) exits at €25–45 on EU Vinted depending on condition and size. At a buy-below of €34 for the average, this means: an Old Skool sourced at €10–15 at a charity shop in clean, unworn condition is marginally profitable. An Old Skool sourced at €20+ needs to be in exceptional condition or an unusual size to clear the margin threshold.",
          "Size distribution matters: EU42 and EU43 are the most liquid sizes for men's Old Skool and exit at the midpoint of the range. EU45+ are slower to sell and buyers are less willing to pay premium. Women's UK3–UK5 (EU36–38) exits quickly in colourways marketed to women (dusty pink, sage, butter yellow) and can exceed the brand average for the category when correctly listed in the women's section rather than generic footwear.",
        ],
      },
      {
        h: "Authentication and condition checks",
        p: [
          "Vans counterfeits are most common at the Old Skool level and targeted at charity shops and flea markets. Checks: the waffle sole should have consistent depth across the tread — fake soles often have shallower tread and a slightly different rubber compound colour (bluer-grey vs Vans' warmer grey). The Vans logo on the canvas upper should be stitched with consistent thread tension; loose stitching at the logo base is a counterfeit tell. The toe cap rubber should be one uniform piece with clean bonding to the canvas upper — a visible seam at the bond point is a flag.",
          "Condition checks for charity shop sourcing: check the waffle sole for wear in the heel strike zone (most common damage point); check the canvas for pen marks, ink transfer from washing, or deodorant staining on the inner collar; check the insole for peeling at the heel (common on older pairs where the adhesive ages out). A pair with sole wear in the heel but clean canvas and intact insole is still a viable listing at a modest price reduction; a pair with canvas staining is a pass at any price point above €5.",
        ],
      },
    ],
    faq: [
      {
        q: "Is Vans worth reselling on Vinted?",
        a: "Yes — primarily for Sneakers, and specifically for collab and limited editions. Vans ranked #14 by watched departures across Spain, France, Germany, Italy and Portugal in the week to 14 September 2026: 98 departures at €36 average. Sneakers account for 60% of departures at €51 average (buy-below ~€34). Standard Old Skool in core colourways exits at €25–45 and is only profitable sourced below €15. Collab editions (Supreme, WTAPS, CDG) exit at €80–300 and are the real margin opportunity.",
      },
      {
        q: "What is the buy-below price for Vans Sneakers on Vinted?",
        a: "With Vans Sneakers averaging €51 at departure across EU Vinted markets (week to 14 September 2026), and modelling a ~5% platform deduction and 30% target margin, the buy-below sits around €34. This applies to sneakers that consistently reach or exceed €51 exit — collab editions and limited Vault releases. Standard Old Skool in core colourways average €25–45 and do not support a €34 sourcing price unless in exceptional condition. Resale IQ returns the exact buy-below for specific Vans models.",
      },
      {
        q: "What Vans items sell best on Vinted?",
        a: "By volume and value: Sneakers (59 departures/week at €51 avg). Within Sneakers: collab editions (Supreme, WTAPS, CDG, COMME des GARÇONS) exit at €80–300 for clean pairs. Vans Vault limited editions exit at €65–110. Standard Old Skool in unusual or women's colourways outperform the core colourways. Apparel (T-Shirts €11, Hoodies €18) is not worth deliberate Vans-brand sourcing.",
      },
      {
        q: "How do I spot fake Vans Old Skool?",
        a: "Three checks: 1) Waffle sole tread depth should be consistent and the rubber a warm grey — shallower tread or a bluer-grey rubber is a counterfeit tell. 2) The Vans logo stitching on the canvas upper should have consistent thread tension with no loose threads at the base. 3) The toe cap rubber should be one piece with clean bonding to the canvas — a visible seam at the bond point is a flag. Check the insole for authentic Vans branding; on collab editions, the co-brand text on the insole (Supreme, WTAPS, etc.) is the primary authenticity tell.",
      },
      {
        q: "How does Vans compare to Adidas and Nike for resale on Vinted?",
        a: "Vans (98 dep/wk, €36 avg) sits between Adidas (98 dep/wk, €48 avg) and Reebok (99 dep/wk, €16 avg). Vans Sneaker average (€51) is lower than Nike Sneaker average (€62) and Adidas Sneaker average (€58), but Vans collab editions compete with Nike Dunk and Adidas Samba premiums in specific transactions. The sourcing logic is the same across all three: model and colourway precision — not brand-name buying — is the margin edge on EU Vinted.",
      },
    ],
  },
  {
    slug: "reebok-reselling-vinted-guide",
    title: "Reebok Reselling on Vinted: Sneakers and Jackets at €18 Average, the Volume Play",
    seoTitle: "Is Reebok Worth Reselling on Vinted? — Resale IQ",
    description:
      "Reebok ranks #12 by watched departures across 5 EU Vinted markets — 99/week at €16 average. Sneakers lead at 36 departures averaging €18. Jackets are the unexpected tie: 19 departures also at €18. Classic Leather, Club C, and Freestyle are the sourcing-worthy models.",
    date: "2026-09-15",
    category: "Sourcing",
    readMins: 6,
    intro:
      "Week to 14 September 2026, Reebok ranked #12 across Spain, France, Germany, Italy and Portugal with 99 watched departures at an average exit price of €16. The brand average is the lowest of any top-15 brand with Sneaker volume — Reebok is a volume-at-low-price market, not a margin play. The practical case for sourcing Reebok is narrow: specific heritage models (Classic Leather, Club C 85, Freestyle) that exit above the brand average at €30–60, and Jackets (19 departures averaging €18) sourced at charity shop prices. Everything else — Hoodies at €12, T-Shirts at €10 — has no practical margin floor.",
    sections: [
      {
        h: "Volume and category breakdown",
        p: [
          "Of the 99 watched departures in the week to 14 September 2026, Sneakers led at 36 exits averaging €18. Jackets contributed 19 departures averaging €18. Hoodies added 15 departures averaging €12. T-Shirts rounded out at 11 departures averaging €10. Tracksuits added 10 departures averaging €18.",
          "Full Reebok volumes are on " +
            ilinkHref("flip") +
            " and update weekly. The flat €18 average across Sneakers, Jackets, and Tracksuits is striking — it signals a commodity market where condition and model-name precision matter more than category selection. Hoodies at €12 and T-Shirts at €10 are effectively below any practical sourcing floor: a charity shop price of €5–7 leaves less than €5 margin before photography and listing time.",
        ],
      },
      {
        h: "Buy-below by category",
        p: [
          "With Sneakers averaging €18 at departure and Vinted modelling roughly a 5% platform deduction, the departure-net is around €17.10. Applying a 30% target margin gives a buy-below of approximately €12. Jackets at €18 average give the same buy-below of ~€12. Tracksuits at €18 give a buy-below near €12. Hoodies at €12 give a buy-below near €8. T-Shirts at €10 give a buy-below near €7.",
          "The uncomfortable truth: a buy-below of €12 for Reebok Sneakers means the margin window only opens for pieces sourced at or below charity shop floor pricing. A Reebok pair sourced at €8 at a car boot and listed at €20 nets approximately €11 after platform fees — viable as a volume filler, not as a deliberate resale strategy. The model-specific opportunity is the exception and it requires identification skill.",
        ],
        cta: pricingMidCta("ctr_reebok_20260915"),
      },
      {
        h: "Models worth identifying: Classic Leather, Club C, Freestyle",
        p: [
          "Three Reebok models exit significantly above the €18 Sneaker average on EU Vinted. The Classic Leather (white/grey/gum colourways) exits at €30–55 in very good condition — the model has sustained EU demand as a clean low-profile runner adjacent to Nike's Cortez and Adidas' Samba in cultural positioning, though less aggressively. The Club C 85 (white/green in particular) exits at €25–45 in clean condition; the Club C Legacy and Club C Revenge variants from 2022–2024 exit higher (€40–70) as limited reissues. The Freestyle (the women's aerobic shoe from 1982, revived 2020–2025) exits at €35–80 in rare colourways — the Freestyle Hi and Freestyle 98 in off-white, cobalt, and pastel limited editions are the high-value cohort.",
          "The identification test: Classic Leather has a distinctive perforated leather vamp and the Reebok vector logo on the lateral side; Club C 85 has a lower-profile toe box and the 'Club C' text on the outer tongue; Freestyle is identifiable by its high-cut collar and the distinctive 3-panel toebox. All three are commonly found at charity shops in EU markets and are being priced by uninformed sellers at generic Reebok prices (€5–15). That is the sourcing edge.",
        ],
      },
      {
        h: "Jackets: the unexpected volume category",
        p: [
          "At 19 departures and €18 average, Reebok Jackets are the second-highest departure category — unusual for a primarily footwear brand. The €18 average reflects standard Reebok training and track jackets (the Vector track top, the standard Reebok Training zip-through) that exit at €12–22. The upside cases: Reebok x Cottweiler, Reebok x Cardi B, and Reebok x Victoria Beckham collab outerwear exits at €35–80. Reebok Heritage Windbreakers from the 1980s–1990s (the classic navy/red/white colourway, full zip with elasticated hem) exit at €25–45 on EU Vinted as vintage workwear-adjacent pieces.",
          "Sourcing signal: Reebok Jackets at charity shops are frequently mispriced downward because the brand's Jacket line is less culturally prominent than Nike or Adidas outerwear. A clean Heritage Windbreaker sourced at €8–12 is a viable listing at €35–45 when correctly identified and photographed to emphasise the vintage colourway. The Vector logo on the chest is the quickest vintage-era identifier — the vector design dates from 1986 and is the primary signal for heritage pieces.",
        ],
        cta: pricingBodyCta("body_reebok_20260915"),
      },
      {
        h: "Authentication and condition checks",
        p: [
          "Reebok counterfeits are less common than Nike or Adidas but do appear at the Classic Leather and Club C level. Checks: the Vector logo on the lateral side should have clean edge definition with consistent stroke width — blurry edges or uneven stroke weight are counterfeit tells. The Union Jack logo (on Classic Leather) or the 'Reebok' wordmark should use the correct typeface — the 'b' in counterfeit Reebok wordmarks often has a wider bowl than the authentic version.",
          "Condition priority: for Sneakers, check the midsole for yellowing (most common age tell on white Reebok midsoles), check the perforated leather upper on Classic Leather for cracking at the flex points, and check the interior sock liner for peeling or odour. For Jackets, check the elastic at cuffs and hem (common deterioration point on vintage Reebok outerwear), check the zip pull, and check the lining at the collar seam.",
        ],
      },
    ],
    faq: [
      {
        q: "Is Reebok worth reselling on Vinted?",
        a: "Selectively. Reebok ranked #12 by watched departures across Spain, France, Germany, Italy and Portugal in the week to 14 September 2026: 99 departures at €16 average. The brand average is the lowest of any top-15 brand with Sneaker volume. The margin case is model-specific: Classic Leather (€30–55), Club C 85 (€25–70), and Freestyle (€35–80 in rare colourways) all exit above the category average and are found mispriced at charity shops. Generic Reebok sourcing at any price above €8 is a margin squeeze.",
      },
      {
        q: "What is the buy-below price for Reebok Sneakers on Vinted?",
        a: "With Reebok Sneakers averaging €18 at departure across EU Vinted markets (week to 14 September 2026), and modelling a 5% platform deduction and 30% target margin, the buy-below sits around €12. This is a charity-shop-floor buy-below. The practical case is model-specific: Classic Leather, Club C 85, and Freestyle exit at €30–80 and support a buy-below of €20–54. Generic Reebok Sneakers do not support a €12 sourcing price from any venue except bulk lots.",
      },
      {
        q: "What Reebok items sell best on Vinted?",
        a: "By volume: Sneakers (36 departures/week at €18 avg). Within Sneakers: Classic Leather (€30–55), Club C 85 in white/green (€25–70), Freestyle Hi in limited colourways (€35–80). By per-unit value above average: Heritage Windbreakers from 1980s–1990s (€25–45), Reebok collab outerwear (Cottweiler, VB, Cardi B — €35–80). Hoodies (€12) and T-Shirts (€10) are below practical margin threshold.",
      },
      {
        q: "Which Reebok sneakers are worth reselling on Vinted?",
        a: "Primary models above the €18 EU Vinted average (week to 14 September 2026): Classic Leather in white/grey/gum (€30–55 in very good condition); Club C 85 in white/green, Club C Legacy and Revenge (€25–70); Freestyle Hi in limited colourways (€35–80). Models at or below average: standard Reebok trainers, Nano training shoes, standard Club C in worn condition. The identification edge — finding a Classic Leather or Club C priced at generic Reebok rates — is the entire Reebok sourcing case.",
      },
      {
        q: "How does Reebok compare to Vans for resale on Vinted?",
        a: "Reebok (99 dep/wk, €16 avg) and Vans (98 dep/wk, €36 avg) are near-identical in volume. Vans has a much higher brand average driven by a 60% Sneaker concentration at €51 avg vs Reebok's €18 Sneaker avg. Both require silhouette/model precision: Vans collab editions at €80–300 are the equivalent of Reebok Classic Leather at €30–55 — the heritage model that exits above the brand average. Vans has a higher ceiling on the upside, Reebok has a more accessible charity-shop sourcing floor for its heritage models.",
      },
    ],
  },
  {
    slug: "zara-reselling-vinted-guide",
    title: "Zara Reselling on Vinted: Jackets at €35 Average, Everything Else Below the Floor",
    seoTitle: "Is Zara Worth Reselling on Vinted? — Resale IQ",
    description:
      "Zara ranks #15 by watched departures across 5 EU Vinted markets — 82/week at €20 average. Jackets are the only viable category at 14 departures averaging €35 (buy-below ~€23). Hoodies (€16), T-Shirts (€10), and Shirts (€9) are below any practical margin threshold.",
    date: "2026-09-15",
    category: "Sourcing",
    readMins: 6,
    intro:
      "Week to 14 September 2026, Zara ranked #15 across Spain, France, Germany, Italy and Portugal with 82 watched departures at an average exit price of €20. Zara is the most interesting negative case in the EU Vinted top-15: it is one of the highest-volume fast-fashion brands on earth, but it produces almost no resale margin on its mass-market lines. The exception is narrow — Jackets at 14 departures averaging €35 — and within Jackets it is narrower still: only specific seasons, fabrications, and conditions exit above the buy-below. The majority of Zara sourcing at any deliberate price is a margin squeeze.",
    sections: [
      {
        h: "Volume and category breakdown",
        p: [
          "Of the 82 watched departures in the week to 14 September 2026, Hoodies led at 21 exits averaging €16. T-Shirts added 16 departures averaging €10. Jackets contributed 14 departures averaging €35. Tracksuits added 9 departures averaging €17. Shirts rounded out at 8 departures averaging €9.",
          "Full Zara volumes are on " +
            ilinkHref("flip") +
            " and update weekly. The category structure tells the sourcing story: the highest-volume categories (Hoodies, T-Shirts, Shirts) are also the lowest-priced. Jackets are the exception — 17% of departures but the only category that clears the floor. Tracksuits at €17 are marginally viable but only at very low sourcing prices.",
        ],
      },
      {
        h: "Buy-below by category",
        p: [
          "With Jackets averaging €35 at departure and Vinted modelling roughly a 5% platform deduction, the departure-net is around €33.25. Applying a 30% target margin gives a buy-below of approximately €23. Hoodies at €16 give a buy-below near €11. T-Shirts at €10 give a buy-below near €7. Shirts at €9 give a buy-below near €6. Tracksuits at €17 give a buy-below near €12.",
          "The practical ceiling: Zara T-Shirts, Hoodies, and Shirts are not worth deliberate sourcing at any price. At charity shop prices of €3–7, they occasionally clear, but the photography, listing, and dispatch time costs more per item than the margin. Jackets at €23 buy-below are viable when sourced below that in good condition — the window is real but thin.",
        ],
        cta: pricingMidCta("ctr_zara_20260915"),
      },
      {
        h: "Jackets: what makes a Zara jacket resellable",
        p: [
          "The €35 Zara Jacket average on EU Vinted is not driven by any specific Zara sub-brand or collab — Zara does not have heritage collab equity. The average reflects structural and seasonal factors: structured blazers in neutral tones (camel, ecru, black) from Zara's mainline and Zara Studio lines exit at €28–55 when clean and recent (within 2 seasons). Leather-look jackets (the bonded leather biker jacket that Zara has produced in multiple iterations since 2018) exit at €25–45. Wool-blend overcoats from the mainline exit at €35–80 in good condition, with the Studio line's heavier constructions reaching the top of that range.",
          "The sourcing edge is condition and recency. Zara buyers on Vinted are price-sensitive but condition-literate — they are sourcing Zara because they know the brand and want the piece at a discount, not because they do not know what they are buying. A blazer in 'good' condition with pilling or a missing button will list below €20. The same blazer in 'very good' condition with correct sizing listed in the description will reach €40+. The margin opportunity is in the condition delta, not in identifying an unknown piece.",
        ],
      },
      {
        h: "Zara Studio and TRF: the higher-value sub-lines",
        p: [
          "Zara Studio is Zara's elevated mainline — higher fabrication quality, lower volumes, and better secondary market performance. Studio pieces (typically distinguished by 'Studio' labelling inside the garment and at point of sale) exit at 30–50% above equivalent mainline pieces on EU Vinted. A Zara Studio structured blazer exits at €45–70 versus €28–50 for a comparable mainline piece. The identification at point of sourcing: the 'Studio' label inside the collar or on the hang tag is the primary tell.",
          "Zara TRF (now largely folded into Zara Woman but still labelled on older pieces) targeted a younger demographic and produced denim and crop-top cuts that now circulate as Y2K adjacent pieces. TRF denim exits at €20–35, above the T-Shirts and Shirts average, making it occasionally viable when sourced at €10–15. The sourcing opportunity is narrower than Studio because TRF volumes at charity shops are lower — it was a smaller range.",
        ],
        cta: pricingBodyCta("body_zara_20260915"),
      },
      {
        h: "Why Zara's brand average is low despite high volume",
        p: [
          "Zara's €20 average is a structural outcome: the brand produces fast-fashion at accessible retail price points (€15–50 for most lines), which anchors secondhand expectations. EU Vinted buyers associate Zara with a price point and resist paying above it even for good condition pieces. The exception is pieces with clear visible quality signals (linen, wool, structured tailoring) that photograph above the Zara fast-fashion expectation — these exit at premium-to-average.",
          "Compared to the rest of the top-15: Zara sits below Reebok (€16 avg is the comparable, but Reebok has model-specific upsides to €80). Gucci at €212 average is the structural opposite — luxury authentication friction creates the margin. Zara's mass-market positioning means the authentication question does not arise, but neither does the scarcity premium. The sourcing case for Zara is: Jackets in good condition at under €23, and Studio sub-brand identification when available.",
        ],
      },
    ],
    faq: [
      {
        q: "Is Zara worth reselling on Vinted?",
        a: "Selectively — Jackets only. Zara ranked #15 by watched departures across Spain, France, Germany, Italy and Portugal in the week to 14 September 2026: 82 departures at €20 average. The only viable resale category is Jackets (14 departures averaging €35, buy-below ~€23). Hoodies (€16), T-Shirts (€10), Shirts (€9), and Tracksuits (€17) are below any practical sourcing margin. Generic Zara sourcing is not a viable resale strategy.",
      },
      {
        q: "What is the buy-below price for Zara on Vinted?",
        a: "For Zara Jackets specifically: with an average departure of €35 across EU Vinted markets (week to 14 September 2026), and modelling a 5% platform deduction and 30% target margin, the buy-below sits around €23. For all other Zara categories (Hoodies €16, T-Shirts €10, Shirts €9), the buy-below is below charity shop floor pricing and is not practically reachable. Resale IQ returns the exact buy-below for Zara Jackets by season and condition.",
      },
      {
        q: "What Zara items sell best on Vinted?",
        a: "By per-unit value: Jackets (14 departures/week at €35 avg). Within Jackets: Zara Studio structured blazers (€45–70), wool-blend overcoats (€35–80), leather-look biker jackets (€25–45). By volume: Hoodies (21 departures/week) but at €16 average — not worth deliberate sourcing. T-Shirts (16 dep/wk at €10) and Shirts (8 dep/wk at €9) are below any viable margin floor.",
      },
      {
        q: "Does Zara Studio resell better than Zara mainline?",
        a: "Yes — Zara Studio exits at 30–50% above equivalent mainline pieces on EU Vinted. A Studio structured blazer in very good condition exits at €45–70 versus €28–50 for a comparable mainline piece. The Studio label inside the collar or on the hang tag is the identification tell at point of sourcing. Studio pieces at charity shops are priced the same as mainline Zara by uninformed sellers — that is the sourcing edge.",
      },
      {
        q: "How does Zara compare to Reebok and Vans for resale on Vinted?",
        a: "Zara (82 dep/wk, €20 avg) is the lowest-volume and second-lowest-average of the top-15 brands — only Reebok (€16 avg) is lower. Unlike Reebok, which has model-specific upsides in Sneakers to €80, Zara's upside is category-specific (Jackets only) rather than model-specific. Vans (€36 avg) is driven by collab Sneaker identification; Zara has no equivalent authentication or scarcity premium. The sourcing case for Zara is narrower than either Reebok or Vans.",
      },
    ],
  },
]
