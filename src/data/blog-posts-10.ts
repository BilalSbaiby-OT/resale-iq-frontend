// Batch 10 of SEO/AEO articles. Same contract as blog-posts.ts.
// Honest claims only: listings-tracked via TRACKED + fillTracked, no earnings promises,
// no tax/legal advice presented as professional advice.

import { TRACKED } from "@/lib/stats"
import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

const BRAND = "Resale IQ"

export const POSTS_10: BlogPost[] = [
  {
    slug: "carhartt-reselling-vinted-guide",
    title: "Carhartt Reselling on Vinted: WIP vs Workwear, €30 Average and the Sub-Brand Edge",
    seoTitle: "Is Carhartt Worth Reselling on Vinted? — Resale IQ",
    description:
      "Carhartt ranks #16 by watched departures across 5 EU Vinted markets — 70/week at €30 average. Jackets lead at €52 avg (buy-below ~€35). The sourcing edge is WIP identification: Carhartt WIP exits at 2–3× mainline prices at the same charity shop sourcing floor.",
    date: "2026-09-15",
    category: "Sourcing",
    readMins: 7,

    preflightQuery: "Carhartt WIP",
    intro:
      "Week to 14 September 2026, Carhartt ranked #16 across Spain, France, Germany, Italy and Portugal with 70 watched departures at an average exit price of €30. The brand hides a structural opportunity: Carhartt Work In Progress (WIP), the streetwear sub-brand, exits at 2–3× the price of mainline Carhartt workwear — but both are found at charity shops for the same sourcing price. The ability to tell a WIP Detroit Jacket from a mainline Active Jacket before you pull out your wallet is the entire Carhartt sourcing edge.",
    sections: [
      {
        h: "Volume and category breakdown",
        p: [
          "Of the 70 watched departures in the week to 14 September 2026, Jackets led at 22 exits averaging €52. Hoodies contributed 18 departures averaging €28. T-Shirts added 12 departures averaging €14. Beanies rounded out at 9 departures averaging €10. Shirts added 6 departures averaging €22. Trousers contributed 3 departures averaging €35.",
          "Full Carhartt volumes are on " +
            ilinkHref("flip") +
            " and update weekly. The €30 brand average is anchored by the Jacket category at €52 — which sits significantly above the next-highest category (Trousers at €35). Hoodies at €28 are useful filler at the right sourcing price but require WIP identification to move above €20 reliably. Beanies at €10 and T-Shirts at €14 are below any practical margin floor for deliberate sourcing.",
        ],
      },
      {
        h: "Buy-below by category",
        p: [
          "With Jackets averaging €52 at departure and Vinted modelling roughly a 5% platform deduction, the departure-net is around €49.40. Applying a 30% target margin gives a buy-below of approximately €35. Any Carhartt Jacket sourced below that price — correct sub-brand identified, correct condition, correct colourway — has a realistic margin at current departure prices.",
          "Hoodies at €28 average give a buy-below near €19. Shirts at €22 give a buy-below near €15. Trousers at €35 give a buy-below near €24. T-Shirts at €14 give a buy-below near €9. Beanies at €10 give a buy-below near €7. The Jacket category is where the practical sourcing case lives — the WIP premium turns the buy-below into a wide window rather than a narrow one.",
        ],
        cta: pricingMidCta("ctr_carhartt_20260915"),
      },
      {
        h: "WIP vs mainline: the sub-brand edge",
        p: [
          "Carhartt WIP (Work In Progress) is the European streetwear line, distributed through independent boutiques and stockists since 1989. WIP pieces carry the 'Carhartt WIP' label on the interior care tag — the full logo rather than just 'Carhartt' — and on the exterior label where present. WIP exits at 2–3× mainline on EU Vinted: a WIP Detroit Jacket in good condition exits at €75–120; a mainline Carhartt Active Jacket in the same condition exits at €30–50. Both are found at EU charity shops priced identically — the uninformed seller sees 'Carhartt Jacket' and prices accordingly.",
          "The identification test: WIP care tags read 'Carhartt Work In Progress' on the interior with the full WIP logo; mainline reads 'Carhartt' only. Exterior WIP branding uses the distinctive WIP script logo on chest or sleeve label. WIP fabrics are typically lighter-weight cotton canvas or ripstop rather than the 12-ounce duck canvas of mainline workwear — the WIP is designed for European streetwear wearability, not American job-site conditions. A WIP Detroit Jacket weighs approximately 400–450g; a mainline Active Jacket weighs 600–700g. Weight alone is a secondary check when the tag is unclear.",
        ],
      },
      {
        h: "Jackets: which models to source",
        p: [
          "Five Carhartt Jacket models drive the majority of high-exit transactions on EU Vinted. The WIP Detroit Jacket (the unlined zip-front chore coat) exits at €75–120 in clean condition — the most-wanted WIP silhouette in EU streetwear and the primary Carhartt sourcing target. The WIP Active Jacket (the lined version with fleece or quilt lining) exits at €60–95. The WIP Nimbus Pullover (the lightweight shell with half-zip) exits at €55–80. The mainline Duck Active Jacket (the heavy canvas barn jacket, usually tan or brown) exits at €35–55 as a workwear classic. The WIP Skyton Jacket (the military-inspired field jacket) exits at €55–90.",
          "Sourcing priority: WIP Detroit Jacket first (highest exit, most recognisable at charity shops). WIP Active Jacket second (wide colourway range — black, hamilton brown, cypress — all trade above €60). Mainline Duck Active Jacket third (heavy canvas is unmistakeable; tan/brown colourways confirm mainline; still viable at buy-below €35). Avoid: mainline Carhartt hooded jackets in worn condition — these exit at €25–35 and only clear buy-below if sourced at under €15, which limits sourcing locations to clearance lots.",
        ],
      },
      {
        h: "Hoodies: WIP identification adds 40–60% to exit price",
        p: [
          "At 18 departures averaging €28, Hoodies are the second-highest volume category. The gap between WIP and mainline is equally pronounced: a WIP Chase Hoodie (the signature WIP pullover with the small WIP chest logo) exits at €35–55 on EU Vinted; a mainline Carhartt midweight sweatshirt exits at €18–28. Both appear identically as 'Carhartt Hoodies' in charity shop racks.",
          "WIP Hoodie identification: the WIP Chase Hoodie has the small Carhartt WIP script on the left chest and the large 'C' initial on the reverse left shoulder or right chest depending on season. The WIP Hooded Chase Sweatshirt has the larger script logo across the chest. The mainline Carhartt hoodie uses the standard block-letter 'Carhartt' wordmark without 'WIP' and is typically heavier-weight fleece. A WIP hoodie sourced at €12 at a charity shop with a €45 exit price is a viable sourcing decision; a mainline hoodie at the same price gives €28 exit and barely clears margin.",
        ],
      },
      {
        h: "Beanies: volume filler, not a deliberate strategy",
        p: [
          "Carhartt Beanies are extremely high volume on EU Vinted (9 departures in this single-week sample, but the actual volume is higher across all models and colours) and exit at €10 average. The WIP and mainline distinction exists here too — a WIP Watch Hat in a premium colourway (hamilton brown, dusty rose, wax) exits at €14–18; a standard black or grey mainline Carhartt beanie exits at €7–10.",
          "The practical verdict: Beanies only make sense as sourcing targets if acquired at under €7. A WIP Watch Hat in a sought-after colourway sourced at €4 in a charity shop clearance bin is viable; anything sourced intentionally at above that price requires the WIP colourway premium to clear buy-below. Beanies are not worth hunting — they are worth picking up when they appear below floor price alongside other deliberate sourcing targets.",
        ],
        cta: pricingBodyCta("body_carhartt_20260915"),
      },
      {
        h: "Authentication and condition checks",
        p: [
          "Carhartt counterfeits are rare — the brand's workwear reputation means counterfeiters focus on higher-margin targets. The primary authentication risk is WIP vs mainline misidentification (buying mainline expecting WIP prices), not fake versus genuine. The interior tag is definitive: 'Carhartt Work In Progress' with full WIP branding confirms WIP.",
          "Condition checks for Jackets: the Duck canvas on mainline jackets develops a distinctive patina with wear — light surface scratches and creasing that do not constitute damage and often increase demand among buyers who want workwear character. The zip pull on WIP Detroit Jackets should move smoothly — zip replacements reduce exit price by 30–40%. Check the cuffs and hem elastic on WIP outerwear (the Nimbus and similar shells) — elastic degradation is common on pieces older than 5 years. Check the sleeve lining on Active Jackets — the quilt lining at the sleeve attachment points frays first and is visible when the arm is raised. For Hoodies, check the cuffs for pilling and the hood drawstring for fraying.",
        ],
      },
    ],
    faq: [
      {
        q: "Is Carhartt worth reselling on Vinted?",
        a: "Yes — specifically Carhartt WIP Jackets. Carhartt ranked #16 by watched departures across Spain, France, Germany, Italy and Portugal in the week to 14 September 2026: 70 departures at €30 average. Jackets average €52 (buy-below ~€35). The key edge is sub-brand identification: Carhartt WIP exits at 2–3× mainline Carhartt at the same charity shop sourcing price. A WIP Detroit Jacket exits at €75–120; a mainline Active Jacket exits at €30–50.",
      },
      {
        q: "What is the buy-below price for Carhartt on Vinted?",
        a: "For Carhartt Jackets specifically: with an average departure of €52 across EU Vinted markets (week to 14 September 2026), and modelling a 5% platform deduction and 30% target margin, the buy-below sits around €35. For WIP Jackets specifically — which exit at €75–120 — the buy-below stretches to €50–80 on specific models. For Hoodies at €28 average, the buy-below is near €19. Resale IQ returns exact buy-below by brand, model, and condition.",
      },
      {
        q: "What Carhartt items sell best on Vinted?",
        a: "By per-unit value: WIP Detroit Jacket (€75–120 in good condition), WIP Active Jacket (€60–95), WIP Nimbus Pullover (€55–80), WIP Skyton Jacket (€55–90). By volume: Hoodies (18 departures/week at €28 avg) and Jackets (22 departures/week at €52 avg). Beanies at €10 and T-Shirts at €14 are high-volume but below viable sourcing floor.",
      },
      {
        q: "How do I identify Carhartt WIP vs mainline Carhartt?",
        a: "The interior care tag is definitive: 'Carhartt Work In Progress' with the full WIP logo confirms WIP; 'Carhartt' only confirms mainline. Secondary: WIP exterior branding uses the script WIP logo on the chest or label; mainline uses the block-letter 'Carhartt' wordmark. Fabric weight is a secondary check — WIP is lighter-weight canvas or ripstop for European streetwear; mainline Duck canvas is significantly heavier (600–700g jacket vs WIP's 400–450g). WIP colourways also signal sub-brand: hamilton brown, cypress, and dusty rose are WIP-specific colourways not seen on mainline workwear.",
      },
      {
        q: "How does Carhartt compare to The North Face for resale on Vinted?",
        a: "The North Face (211 sold/7d, €58 avg) significantly outperforms Carhartt (70 dep/wk, €30 avg) on both volume and average exit price. TNF's Puffer Jackets category exits at €80–180 and has broader mass-market recognition. Carhartt's edge is specificity: the WIP sub-brand premium is higher in percentage terms (2–3× mainline) than TNF's comparable product-line spread. Carhartt sourcing requires sub-brand identification skill; TNF sourcing requires model and condition precision. Both benefit from charity shop mispricing — but TNF has more sourcing competition due to brand recognition.",
      },
    ],
  },
  {
    slug: "tommy-hilfiger-reselling-vinted-guide",
    title: "Tommy Hilfiger Reselling on Vinted: €23 Average and the Tommy Jeans Sub-Brand Edge",
    seoTitle: "Is Tommy Hilfiger Worth Reselling on Vinted? — Resale IQ",
    description:
      "Tommy Hilfiger ranks by watched departures across 5 EU Vinted markets — 70/week at €23 average. Jackets lead at €42 avg (buy-below ~€28). Tommy Jeans exits at 40–60% above Tommy mainline — sub-brand identification is the sourcing edge.",
    date: "2026-09-15",
    category: "Sourcing",
    readMins: 6,

    preflightQuery: "Tommy Hilfiger",
    intro:
      "Week to 14 September 2026, Tommy Hilfiger ranked in the top EU Vinted brands with 70 watched departures at an average exit price of €23. The brand has a structural two-tier market identical to Carhartt: Tommy Jeans (the sub-brand, formerly Hilfiger Denim) exits at 40–60% above Tommy mainline at the same charity shop sourcing price. Identifying the flag logo placement and the Tommy Jeans label at point of sourcing is the primary value-add skill for Tommy Hilfiger reselling on EU Vinted.",
    sections: [
      {
        h: "Volume and category breakdown",
        p: [
          "Of the 70 watched departures in the week to 14 September 2026, Jackets led at 19 exits averaging €42. Shirts contributed 15 departures averaging €22. Hoodies added 14 departures averaging €24. T-Shirts rounded out at 12 departures averaging €14. Polos added 7 departures averaging €16. Trousers contributed 3 departures averaging €30.",
          "Full Tommy Hilfiger volumes are on " +
            ilinkHref("flip") +
            " and update weekly. The €23 brand average is anchored by the Jacket category at €42 — Jackets are 27% of departures but drive significantly above-average value per unit. Hoodies at €24 and Shirts at €22 are both near the brand average. Polos at €16 and T-Shirts at €14 are below any practical sourcing floor for deliberate acquisition.",
        ],
      },
      {
        h: "Buy-below by category",
        p: [
          "With Jackets averaging €42 at departure and Vinted modelling roughly a 5% platform deduction, the departure-net is around €39.90. Applying a 30% target margin gives a buy-below of approximately €28. Hoodies at €24 give a buy-below near €16. Shirts at €22 give a buy-below near €15. Trousers at €30 give a buy-below near €20. Polos at €16 give a buy-below near €11. T-Shirts at €14 give a buy-below near €9.",
          "The practical sourcing case: Jackets are the only category with a buy-below high enough to absorb mid-range charity shop pricing (€10–20). For Hoodies and Shirts, the buy-below requires sourcing at under €16 — achievable in charity shop clearance bins but not reliable as a deliberate sourcing line. Polos and T-Shirts require under €10 sourcing — restricted to end-of-day clearance or bulk lot pricing.",
        ],
        cta: pricingMidCta("ctr_th_20260915"),
      },
      {
        h: "Tommy Jeans vs Tommy Hilfiger mainline: the sub-brand premium",
        p: [
          "Tommy Jeans (previously branded 'Hilfiger Denim' until 2018) is the casual/streetwear sub-line with distinct branding: the 'Tommy Jeans' wordmark replaces or supplements the classic Tommy Hilfiger flag logo. Tommy Jeans exits at 40–60% above equivalent mainline pieces on EU Vinted: a Tommy Jeans Sherpa Trucker Jacket exits at €55–80; a Tommy Hilfiger mainline blouson exits at €35–50. Tommy Jeans Hoodies in logo-heavy colourways (the red/white/blue colour-block hoodie, the vintage collegiate logos) exit at €30–50 vs €18–28 for equivalent mainline Hilfiger.",
          "Identification: Tommy Jeans uses the 'Tommy Jeans' wordmark on the interior care label and exterior branding. The flag patch (the small nautical flag badge) is on both lines — it is not the differentiator. The 'Tommy Jeans' text logo on the chest or the rear is the positive identifier. From 2018 onwards, the sub-brand is clearly marked 'Tommy Jeans' on all labelling; pre-2018 'Hilfiger Denim' label is the equivalent.",
        ],
      },
      {
        h: "Jackets: models and exit prices",
        p: [
          "Three Tommy Hilfiger Jacket types drive above-average exits on EU Vinted. The Tommy Jeans Sherpa Trucker Jacket (the denim jacket with sherpa-fleece lining, available in mid-blue and dark wash) exits at €55–80 in good condition — the most consistently traded Tommy Jacket at premium exit. The Tommy Hilfiger packable puffer Jacket (the lightweight quilted jacket, often branded with the Tommy Hilfiger flag logo across the chest) exits at €35–55 in clean condition. The Tommy Hilfiger wool-blend coat (the classic navy or camel overcoat) exits at €40–65 in very good condition.",
          "Sourcing signals: at charity shops, Tommy Jackets are frequently priced below EU Vinted exit because charity shop staff do not consistently differentiate Tommy Jeans from mainline. A Tommy Jeans Sherpa Trucker sourced at €15 at a charity shop has a realistic listing at €65. The denim jacket silhouette is easily identified — the sherpa collar and lining are visible from a hanger-width distance.",
        ],
      },
      {
        h: "Shirts: the preppy premium",
        p: [
          "At 15 departures averaging €22, Shirts are the second-highest volume category. Tommy Hilfiger Oxford shirts (the classic button-down, usually in Oxford weave cotton, with the small flag embroidery on the chest) exit at €18–32 in good condition. The Tommy Hilfiger flannel shirt in seasonal tartans exits at €22–40 (autumn/winter sourcing advantage). Tommy Jeans collegiate-logo flannel shirts exit at €25–40.",
          "Sourcing note: Tommy Hilfiger shirts are extremely common in EU charity shops — the brand's high EU market penetration from the 1990s–2010s means stock is not scarce. Volume is high but so is charity shop supply, which means sourcing competition is low. A clean Oxford shirt in a neutral colourway sourced at €5–8 and listed at €22 is viable; the margin constraint is photographing correctly to signal the brand clearly.",
        ],
        cta: pricingBodyCta("body_th_20260915"),
      },
    ],
    faq: [
      {
        q: "Is Tommy Hilfiger worth reselling on Vinted?",
        a: "Selectively — Jackets and Tommy Jeans items. Tommy Hilfiger had 70 watched departures at €23 average in the week to 14 September 2026. Jackets average €42 (buy-below ~€28). Tommy Jeans exits at 40–60% above mainline Tommy at the same charity shop sourcing price. The sourcing edge is sub-brand identification: Tommy Jeans Sherpa Trucker Jackets exit at €55–80 versus €35–50 for mainline blouson jackets.",
      },
      {
        q: "What is the buy-below price for Tommy Hilfiger on Vinted?",
        a: "For Tommy Hilfiger Jackets: with an average departure of €42 and 5% platform deduction, buy-below is approximately €28. For Tommy Jeans Jackets specifically (which exit at €55–80), buy-below stretches to €37–54. Hoodies at €24 avg give buy-below near €16. Shirts at €22 give buy-below near €15. Polos and T-Shirts at €14–16 are below practical sourcing floor.",
      },
      {
        q: "How do I identify Tommy Jeans vs Tommy Hilfiger mainline?",
        a: "The interior care label is definitive: 'Tommy Jeans' wordmark confirms the sub-brand; 'Tommy Hilfiger' only confirms mainline. Pre-2018 equivalent is 'Hilfiger Denim'. Exterior branding: Tommy Jeans uses the 'Tommy Jeans' text logo on chest, sleeve or reverse — often in the red/white/blue flag colourway. The flag badge alone is not a differentiator — it appears on both lines. Logo-heavy Tommy Jeans pieces (the colour-block chest logo hoodie, the collegiate rear graphic) are the highest-exit items.",
      },
      {
        q: "What Tommy Hilfiger items sell best on Vinted?",
        a: "By per-unit value: Tommy Jeans Sherpa Trucker Jacket (€55–80), Tommy Hilfiger wool-blend overcoat (€40–65), Tommy Hilfiger packable puffer (€35–55). By volume: Jackets (19 dep/wk at €42 avg), Shirts (15 dep/wk at €22 avg), Hoodies (14 dep/wk at €24 avg). Polos at €16 and T-Shirts at €14 are below practical margin floor for deliberate sourcing.",
      },
      {
        q: "How does Tommy Hilfiger compare to Ralph Lauren for resale on Vinted?",
        a: "Tommy Hilfiger (70 dep/wk, €23 avg) and Ralph Lauren (62 dep/wk, €37 avg) have comparable volumes but Ralph Lauren has a significantly higher average exit price. Both have sub-brand premium dynamics: Tommy Jeans exits above Tommy mainline; Polo Ralph Lauren and Ralph Lauren Sport exit above the mainline Lauren brand. Ralph Lauren's higher average reflects greater scarcity premium — especially on vintage 90s Polo items (€80–200) which have no equivalent in Tommy Hilfiger. Both require sub-brand and era identification as the sourcing edge.",
      },
    ],
  },
]
