// Batch 93 of SEO/AEO articles. Same contract as blog-posts.ts.
// Reebok Nano EU Vinted price guide — targets
// "reebok nano vinted price", "reebok nano vinted eu price guide",
// "reebok nano buy below vinted", "reebok nano resell eu vinted",
// "is reebok nano worth reselling vinted", "reebok nano crossfit vinted eu",
// "reebok nano x vinted price", "reebok nano vs classic leather vinted".
// DISTINCT from reebok-reselling-vinted-guide (brand overview: Classic Leather,
// Club C, Freestyle focus — Nano listed as "below average" there but that is
// misleading: Nano exits at €38.20, 2.4× the Reebok brand average of €16 because
// the CrossFit/functional-fitness buyer pool is a separate market to fashion Reebok buyers.
// This guide is Nano-only: 5/7d @€38.20 avg, buy-below €24.83, generation breakdown
// (Nano X through Nano X3), condition tiers, why it exits above the brand average,
// and the model-level identification edge at charity shops.

import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

export const POSTS_93: BlogPost[] = [
  {
    slug: "reebok-nano-eu-vinted-price-guide",
    title: "Reebok Nano on EU Vinted: Price Guide and Buy-Below (2026 Data)",
    seoTitle: "Reebok Nano Vinted EU Price Guide 2026 — Resale IQ",
    description:
      "Reebok Nano training shoes track 5 watched departures per week across EU Vinted in September 2026 at a €38.20 average exit price — 2.4× the Reebok brand average of €16. Real exit ranges by generation (Nano X, Nano X2, Nano X3), buy-below ceiling €24.83, CrossFit buyer pool dynamics, and how Nano compares to Classic Leather for EU resellers.",
    date: "2026-09-16",
    category: "Sourcing",
    readMins: 7,

    preflightQuery: "Reebok Nano",

    intro:
      "Reebok Nano training shoes track 5 watched departures per week across EU Vinted in the week to 16 September 2026 at a €38.20 average exit price — 2.4× the Reebok brand average of €16 and more than double the €18 Reebok Sneaker category average. The Nano is the highest-per-unit exit model in the Reebok EU Vinted dataset, above Classic Leather (€30–55) and Club C 85 (€25–70 mid-range). The brand overview reselling guide categorises Nano training shoes as 'at or below average' — that is accurate for worn, non-specific Reebok training shoes generally, but the Nano specifically — Reebok's purpose-built CrossFit training shoe — has a distinct buyer pool of functional fitness consumers who search by model name and generation, not by 'Reebok trainers'. The buy-below ceiling at the €38.20 category average is €24.83 (€38.20 × 0.65), targeting 35% gross margin. At charity shops where Nano training shoes are priced at generic Reebok rates (€6–15), the margin floor is consistently available for any reseller who can identify the model at the sourcing stage. This guide covers Nano generation breakdown, exit prices by condition, the CrossFit buyer pool that explains the premium, and how Nano compares to Classic Leather and Club C as a sourcing target.",

    definedTerm: {
      name: "Reebok Nano departure average",
      description:
        "The Reebok Nano departure average is the average price at which a tracked Reebok Nano listing leaves the shelf on EU Vinted — not the asking price and not retail. As of the week to 16 September 2026, Reebok Nano training shoes track 5 watched departures per week across France, Germany, Spain, Italy, and Portugal at a €38.20 average exit price. 'Watched departure' means a tracked listing left the shelf — not a confirmed buyer-reported sale. The Reebok brand overall tracks 99 watched departures per week at a €16 brand average. The Nano category exits at 2.4× that average due to a CrossFit and functional-fitness buyer pool that searches by model name and generation and pays a premium for correct-generation pairs in training-ready condition. The buy-below ceiling at the €38.20 average is €24.83 (€38.20 × 0.65), targeting 35% gross margin. EU charity shops price Nano training shoes at generic Reebok rates (€6–15) regardless of generation — the identification gap is the sourcing edge.",
    },

    sections: [
      {
        h: "Why the Reebok Nano exits above the brand average on EU Vinted",
        p: [
          "The Reebok brand averages €16 across 99 watched departures per week on EU Vinted. The Nano exits at €38.20 — more than twice the brand average — for a structural reason: it is not a fashion shoe. The Nano is Reebok's purpose-built CrossFit and functional fitness training shoe, released annually in new generations since 2011 (Nano 1.0 through Nano X3 as of 2026). Buyers searching for Reebok Nanos on EU Vinted are CrossFit practitioners, gym owners, and functional fitness athletes who want a specific training tool, not a lifestyle sneaker. That buyer pool has different purchasing behaviour: they search by model name ('Reebok Nano X2', 'Nano X3'), they pay close attention to fit and condition for training use, and they are willing to pay €30–50 for a pair in good-to-very-good condition because the retail price of current-generation Nanos is €120–150.",
          "This buyer pool is separate from the Reebok fashion buyer who searches for Classic Leather or Club C in heritage colourways. A Classic Leather buyer is purchasing a lifestyle item and has Adidas Samba, New Balance 550, and Nike Cortez as direct alternatives — a competitive market at the €30–55 exit level. A Nano buyer is purchasing a training tool and has Nike Metcon, Nobull, and New Balance Minimus as alternatives — a market where Reebok's brand credibility in CrossFit (Reebok was the official CrossFit sponsor for over a decade) sustains premium buyer intent even at secondhand prices.",
          `The practical implication for sourcing: a pair of Reebok Nano X2s at a charity shop priced at €8–12 (generic 'Reebok trainers' pricing) can exit at €35–45 on EU Vinted when correctly identified and photographed to a gym buyer. The identification step — confirming the 'Nano' label on the tongue and the generation number — takes under 30 seconds at a sourcing visit. [Current Reebok brand data →](${ilinkHref("flip")})`,
        ],
        cta: pricingMidCta("ctr_reebok_nano_guide_intro_20260916"),
      },
      {
        h: "Buy-below ceiling and condition tiers for Reebok Nano",
        p: [
          "At the €38.20 category average exit price, the buy-below ceiling for Reebok Nano is €24.83 (€38.20 × 0.65). This targets 35% gross margin before Vinted platform fees. Net of a 6% platform assumption, the actual take on a €38.20 exit is approximately €35.91, giving a €11.08 net margin on a €24.83 buy — a 44.6% net ROI on capital deployed per pair. In practice, the realistic sourcing window is €6–15 at charity shops and second-hand sports equipment stores, where the margin buffer is substantial.",
          "Condition tiers for Reebok Nano: Excellent/Like New (minimal sole wear, clean upper, no significant toe box scuffing, laces clean): buy-below €28.47, targeting a €43.80 exit. Very Good (light outsole wear from training use, clean upper and midsole, no significant toe damage): buy-below €24.83 at the €38.20 category average. Good (visible outsole wear, minor upper scuffing, functional laces): buy-below €19.50, targeting a €30 exit. Fair (heavy outsole wear, split midsole foam, significant upper abrasion): skip — Nano buyers are training users who assess sole condition carefully. Unlike fashion sneakers where 'decorative' wear signals character, Nano buyers need functional sole traction.",
          "Size matters more for Nano than for most EU Vinted categories. CrossFit buyers have specific size requirements (many size down half a size for the Nano's snug fit design) and mid-to-large EU sizes (42–44 / UK 8–9.5) move fastest because they map to the most active gym demographic. Smaller sizes (EU 36–39 / women's Nano) also have a dedicated market — women's CrossFit is a significant segment. Size EU 40–41 (mid-range) is most competitive as it has the most supply. Prioritise buying pairs in EU 42–45 and EU 36–39 where available at the sourcing floor.",
        ],
        cta: pricingBodyCta("ctr_reebok_nano_buybelow_20260916"),
      },
      {
        h: "Nano generations: which exits highest on EU Vinted",
        p: [
          "The Nano generation hierarchy on EU Vinted runs from current-generation premiums to legacy-generation bargains. Nano X3 (released 2023, current as of 2026): exits at €40–55 in very good condition — buyers want current-generation for actual training use, and the X3's stability improvements over earlier generations are well-known in the CrossFit community. Nano X2 (released 2022): exits at €35–50 in very good condition — marginally below the X3 because one generation older, but still within training-active buyers' acceptability window. Nano X (released 2021, the first 'X-series' generation): exits at €30–45 in very good condition — older but still a functional training shoe.",
          "Older Nano generations (Nano 9.0, Nano 8.0, Nano Classic): exits at €20–35 depending on condition — still valuable to buyers who have specific generation preferences or can't find current-generation at their size. Nano 6.0 and earlier: exits at €15–28 — primarily appeal to CrossFit veterans with brand nostalgia; condition must be excellent since the training utility of a 6+ year old training shoe is diminished.",
          "Identification: the generation number appears on the tongue label of every Nano from Nano 6.0 onward — 'Nano X', 'Nano X2', 'Nano X3' are printed clearly. Older generations (1.0–5.0) have 'Nano' plus the number on the tongue. The absence of a number on the tongue on a post-2015 Nano is the primary sign of a counterfeit or a non-Nano Reebok training shoe being miscategorised. The sole pattern is also generation-specific: Nano X-series soles have a distinctive hexagonal traction pattern that earlier Nanos do not; this visible from the outside of the shoe and confirms generation family at a glance.",
        ],
        cta: pricingBodyCta("ctr_reebok_nano_models_20260916"),
      },
      {
        h: "Sourcing Reebok Nanos: the charity shop identification edge",
        p: [
          "EU charity shop staff price Reebok Nanos at generic Reebok trainer rates: €6–15, the same as a generic Reebok running shoe or gym trainer. The Nano's appearance — it looks like a training shoe, not a heritage lifestyle sneaker like the Classic Leather — means it does not trigger the premium identification instinct that the Classic Leather or Club C might in a more knowledgeable charity shop environment. This is the systematic mispricing gap for the Nano: the shoe is identifiable by anyone who knows the model name, but unpriceable by anyone who does not.",
          "The identification workflow at a charity shop: check the tongue label for 'Nano' (confirms model), check the generation number (X, X2, X3 = current-gen premium; Nano 9.0/8.0 = still strong; older = condition-dependent), check the outsole for hexagonal traction pattern on X-series pairs (confirms it is not a generic Reebok training shoe), and check the midsole for cracking or significant foam compression (primary degradation point on training shoes with heavy use). The whole workflow takes under 60 seconds. A Nano X2 in EU size 43 at a charity shop for €10 is a €40–50 exit on EU Vinted — a €30–40 gross margin per pair.",
          `Sports second-hand stores and online pre-loved platforms (Wallapop in Spain, Vide Dressing in France) also surface Nanos at non-Nano-aware pricing — the same €10–20 sourcing window exists in those channels. EU gym chain charity clearances (common at German sports venues and French sports equipment networks) occasionally batch gym shoe donations where Nanos appear at €5–8. [Current Reebok Nano data and buy-below →](${ilinkHref("flip")})`,
        ],
        cta: pricingBodyCta("ctr_reebok_nano_sourcing_20260916"),
      },
      {
        h: "Reebok Nano vs Classic Leather: choosing a Reebok sourcing strategy",
        p: [
          "The Nano and Classic Leather are the two above-average Reebok categories on EU Vinted, but they serve entirely different sourcing strategies. Classic Leather: €30–55 exit, 36 Sneaker departures per week at €18 brand average (Classic Leather is the best-performing subset). Classic Leather supply at charity shops is high — the shoe has been in continuous production since 1983 and appears at donation volumes. Nano: €38.20 average exit, 5 departures per week. Nano supply at charity shops is lower — fewer people own Nanos than Classic Leathers — but the mispricing gap is wider because staff have less cultural context for the training shoe than for the recognisable retro silhouette.",
          "The sourcing decision: Classic Leather is the volume play for resellers who visit charity shops regularly and want consistent stock turnover. The Classic Leather is reliably present in EU thrift chains at €5–15 sourcing and exits at €30–55 — the sourcing play is medium-margin, high-frequency. The Nano is the precision play for resellers near gyms, sports facilities, or markets where athletic gear circulates — lower frequency (5 departures per week across all EU markets), higher per-unit margin (€14–28 net per pair vs €10–20 for Classic Leather), but requiring active sourcing from sports-adjacent venues.",
          "For a reseller building a Reebok sourcing line: Classic Leather should be the backbone (volume, consistent charity shop supply, proven EU buyer demand) with Nano as the opportunistic premium (pick up any Nano X-series pair at charity shop pricing, list at CrossFit market rates). Both categories sit above the Reebok brand average. Hoodies at €12 and T-shirts at €10 have no viable margin floor and should not be deliberate sourcing targets regardless of price.",
        ],
        cta: pricingBodyCta("ctr_reebok_nano_vs_classic_20260916"),
      },
    ],

    faq: [
      {
        q: "How much do Reebok Nanos sell for on EU Vinted?",
        a: "Reebok Nano training shoes track 5 watched departures per week across EU Vinted in the week to 16 September 2026 at a €38.20 average exit price. 'Watched departure' means a tracked Nano listing left the shelf — not a confirmed buyer-reported sale. Current-generation Nano X3 exits at €40–55 in very good condition. Nano X2 (2022) exits at €35–50. Nano X (2021) exits at €30–45. Older generations (Nano 9.0, 8.0) exit at €20–35 depending on condition. The €38.20 average is 2.4× the Reebok brand average of €16 because Nano buyers are CrossFit and functional fitness consumers who purchase for training use, not fashion — a separate buyer pool from fashion Reebok buyers who search for Classic Leather and Club C. ResaleIQ updates Nano departure averages weekly from the EU Vinted market dataset.",
      },
      {
        q: "What should I pay for a Reebok Nano to make a profit on Vinted?",
        a: "At the €38.20 category average exit, the buy-below ceiling for Reebok Nano is €24.83 — that is €38.20 × 0.65, targeting 35% gross margin after Vinted platform fees. In practice, profitable sourcing is in the €6–15 range at EU charity shops, second-hand sports equipment stores, and gym-adjacent markets where Nanos are priced at generic Reebok trainer rates. For current-generation Nano X3 pairs targeting a €45+ exit, the buy-below stretches to €29.25. Condition is critical: CrossFit buyers assess sole wear carefully — heavily worn outsoles reduce exit prices significantly. Very Good condition pairs (light training wear, clean upper and midsole) are the primary sourcing target. Avoid pairs with split midsole foam or significant heel counter damage.",
      },
      {
        q: "Which Reebok Nano generation is most valuable on Vinted?",
        a: "On EU Vinted in September 2026, the Nano X3 (released 2023, current-generation) exits highest at €40–55 in very good condition, followed by the Nano X2 (2022) at €35–50 and the Nano X (2021) at €30–45. Older generations exit progressively lower: Nano 9.0 and 8.0 at €20–35, Nano 6.0 and earlier at €15–28. The generation premium exists because CrossFit buyers purchasing for active training prefer current-generation models for their stability and durability improvements. Generation is identified from the tongue label — 'Nano X3', 'Nano X2', 'Nano X' are printed on the tongue of all X-series pairs. The EU charity shop identification edge is that staff price all generations identically at €6–15 regardless of how current the generation is.",
      },
      {
        q: "Are Reebok Nanos worth reselling on EU Vinted?",
        a: "Yes — selectively, for resellers who can identify the model and have access to sports-adjacent sourcing channels. Reebok Nanos track 5 watched departures per week on EU Vinted in September 2026 at €38.20 average exit — 2.4× the Reebok brand average of €16. The margin case is strong (buy-below €24.83, sourcing floor €6–15 at charity shops), but volume is lower than Classic Leather (5 departures/week vs Classic Leather's subset of 36 Sneaker departures). The Nano works best as an opportunistic premium item for resellers who visit charity shops in gym-dense areas: charity shops near CrossFit boxes, gym-suburb areas, and sports-equipment donation drives surface Nanos at below-market pricing more reliably than general charity chains. If you find a Nano X-series pair below €15, buy it — it exits at a defensible margin at the EU Vinted departure average.",
      },
      {
        q: "How do Reebok Nanos compare to Classic Leather on Vinted?",
        a: "Reebok Nano: 5 watched departures per week at €38.20 average on EU Vinted in September 2026, buy-below €24.83. Reebok Classic Leather: exits at €30–55 (within the Reebok Sneaker category of 36 departures/week at €18 brand average). Classic Leather has higher supply frequency at EU charity shops (more units donated due to its long production history) and higher overall weekly departure volume. Nano has a higher per-unit exit and a wider mispricing gap at charity shops (staff have more cultural familiarity with Classic Leather than with the training-specific Nano). The practical sourcing choice: Classic Leather for volume and consistency; Nano for precision and per-unit margin. Both are above the Reebok brand average and the only Reebok categories with a clear margin case at charity shop sourcing prices in September 2026.",
      },
    ],
  },
]
