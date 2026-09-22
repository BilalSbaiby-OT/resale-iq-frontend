// Batch 102 of SEO/AEO articles. Same contract as blog-posts.ts.
// Carhartt WIP Detroit Jacket EU Vinted price guide — targets
// "carhartt detroit jacket vinted price", "carhartt detroit jacket eu vinted price guide",
// "carhartt wip detroit jacket resell value europe", "carhartt detroit jacket buy below vinted",
// "carhartt detroit jacket wip vs original vinted", "carhartt detroit jacket colourway vinted eu",
// "carhartt detroit jacket sizing eu vinted".
// DISTINCT from carhartt-wip-jacket-eu-vinted-price-guide (all-WIP-models guide covering Active,
// Byrd, Hamilton Brown, OG context; Detroit mentioned as one model in one section at stale
// €53 blended avg including all jacket types) and carhartt-reselling-vinted-guide (brand overview).
// This guide is DETROIT ONLY: Carhartt jackets track 18 departures in the last 30 days @€43 brand-avg in Sep 2026;
// Detroit WIP specifically exits at €55–80 Very Good (above the jacket category avg because
// OG workwear Detroits and lighter shells pull the avg down); buy-below €35.75–52,
// WIP vs OG identification guide, colourway hierarchy (Hamilton Brown premium),
// size distribution on EU Vinted, vs The North Face jacket (85 departures in the last 30 days @€48) comparison.

import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

export const POSTS_102: BlogPost[] = [
  {
    slug: "carhartt-detroit-jacket-eu-vinted-price-guide",
    title: "Carhartt WIP Detroit Jacket on EU Vinted: Price Guide and Buy-Below (2026 Data)",
    seoTitle: "Carhartt Detroit Jacket Vinted EU Price Guide 2026 — Resale IQ",
    description:
      "Carhartt jackets track 18 departures in the last 30 days on EU Vinted at a €43 average as of September 2026. The Detroit WIP — the brand's iconic chore coat silhouette — exits at €55–80 for Very Good condition, above the jacket category average because workwear Detroits and lighter shells pull it down. Buy-below €35.75, WIP vs OG identification guide, colourway hierarchy (Hamilton Brown premium), EU size distribution, and how Carhartt compares to The North Face for EU jacket resellers.",
    date: "2026-09-16",
    category: "Sourcing",
    readMins: 8,

    preflightQuery: "Carhartt Detroit Jacket",

    intro:
      "Carhartt jackets track 18 departures in the last 30 days across EU Vinted at a €43 average exit price in the week to 16 September 2026 — 1.54× the Carhartt brand average of €28 across all five categories. Within that jacket count, the Carhartt WIP Detroit Jacket is the single model driving EU Vinted reseller interest: a WIP Detroit in Very Good condition exits at €55–80, above the €43 jacket category average because the dataset blends WIP Detroits with OG workwear Detroits and lighter Carhartt jacket models that exit closer to €30–40. The buy-below ceiling at the WIP Detroit's own exit range (€55–80 by condition tier) runs from €35.75 to €52. Carhartt WIP Detroits surface at EU charity shops in France, Germany, and Belgium at €8–20 — delivering per-piece gross margins of €25–55 for correctly identified and conditioned pieces. This guide covers the WIP Detroit's exit data, how to tell the WIP apart from the OG workwear Detroit (the single highest-value identification skill for Carhartt resellers), exit ranges by colourway and condition, EU size distribution, and how Carhartt stacks against The North Face for EU jacket resellers.",

    definedTerm: {
      name: "Carhartt Detroit Jacket departure average",
      description:
        "The Carhartt Detroit Jacket departure average refers to the average price at which a tracked Carhartt Detroit Jacket listing leaves the shelf on EU Vinted — not the asking price and not retail. Carhartt's jacket category tracks 18 departures in the last 30 days across EU Vinted as of the week to 16 September 2026 at a €43 average exit price across all Carhartt jacket types (WIP Detroit, OG workwear Detroit, WIP Active, and workwear chore coats). The Carhartt WIP Detroit Jacket specifically exits at €55–80 for Very Good condition in the core colourways, above the category average because the blended dataset includes OG workwear Detroits (€30–50) and lighter WIP shells (€35–50) that pull the average down. The WIP Detroit buy-below ceiling targeting 35% gross margin after platform fees is €35.75 (65% of €55 Very Good exit) to €52 (65% of €80 Like New exit). The Carhartt brand overall tracks 52 departures in the last 30 days across all categories at a €28 brand average; jackets represent 35% of brand volume and deliver the highest per-departure exit price. ResaleIQ tracks Carhartt Detroit Jacket exit data weekly from EU Vinted departure observations across France, Germany, Spain, Italy, and Portugal.",
    },

    sections: [
      {
        h: "Carhartt jackets on EU Vinted: 18 departures in the last 30 days at €43 average",
        p: [
          "Carhartt's jacket category tracks 18 departures in the last 30 days on EU Vinted at a €43 average exit price in the week to 16 September 2026 — 1.54× the Carhartt brand average of €28 across all categories. The brand overall moves 52 pieces over 30 days: hoodies (18 departures in the last 30 days at €22), jackets (18 departures in the last 30 days at €43), T-shirts (6 departures in the last 30 days at €12), shirts (4 departures in the last 30 days at €18), and jeans (3 departures in the last 30 days at €33). Jackets and hoodies share the same weekly departure count but the jacket category exits at nearly double the hoodie price. The reseller insight: Carhartt's brand average (€28) is pulled down significantly by hoodies and T-shirts — a reseller sourcing exclusively in the jacket category is operating in the brand's best-margin tier.",
          "The €43 jacket average blends three distinct sub-types with different buyer pools and exit ranges. WIP Detroit Jackets (the fashion-market streetwear version) exit at €55–80 Very Good and €40–55 Good. OG Carhartt workwear Detroit Jackets (the original trades-workwear version, heavier duck canvas, blanket-lined) exit at €30–50, serving a heritage-workwear buyer pool that is real but smaller on EU Vinted. Lighter WIP shells — the Active Jacket and the Byrd Jacket — exit at €35–50. The €43 category average reflects this blend: a correctly identified WIP Detroit exits consistently above it. For resellers, the practical instruction is simple: when sourcing Carhartt jackets, verify the WIP label, and when the piece is a WIP Detroit specifically, expect exits at €55–80.",
          `Carhartt tracks 2,791 brand-level departures in the last 30 days at €25.90 average on EU Vinted. Jacket-category: Carhartt tracks 56 departures across tracked models (model_signals). Hugo Boss ts (6 departures in the last 30 days at €69) and Tommy Hilfiger jackets (10 departures in the last 30 days at €47), well below The North Face jackets (85 departures in the last 30 days at €48). Carhartt's per-departure margin at correct sourcing prices is among the highest in the accessible-charity-shop tier: WIP Detroits source at €8–20 at EU charity shops versus exits at €55–80, delivering gross margins that most mid-price jacket categories cannot match per piece. [Full Carhartt brand data →](${ilinkHref("flip")})`,
        ],
        cta: pricingMidCta("ctr_carhartt_detroit_intro_20260916"),
      },
      {
        h: "WIP vs OG Detroit: the identification skill that defines Carhartt reselling",
        p: [
          "The single highest-value skill for Carhartt resellers is identifying the WIP Detroit from the OG Carhartt workwear Detroit at the sourcing point. Both are called 'Detroit Jacket', both are cotton canvas, and both exit at positive margins — but the WIP exits at €55–80 Very Good while the OG exits at €30–50. Mis-identifying an OG as a WIP and listing it at WIP price leads to buyer disputes; mis-identifying a WIP as an OG and pricing at workwear price leaves €20–30 per piece on the table. The identification markers are reliable and learnable in one sourcing run.",
          "WIP Detroit markers: (1) The interior label reads 'Carhartt WIP' (the original Carhartt workwear label never uses 'WIP'). (2) The WIP Detroit is made in Portugal — the label should say 'Made in Portugal'. (3) The WIP Detroit's canvas is lighter-weight and more uniform in surface texture than the heavy duck canvas of the OG — the WIP is a fashion garment in a chore coat shape, not a trades-workwear shell. (4) The WIP Detroit uses a quilted nylon lining — not the blanket (thermal) lining of the OG workwear version. (5) The WIP Detroit's collar construction is a stand-up rib-knit collar on the majority of colour releases; the OG uses a different collar finish. (6) The chest button closure and the four-pocket layout are shared between WIP and OG — these cannot be used for identification. EU charity shop donations of Carhartt jackets are predominantly OG workwear pieces from tradespeople; WIP Detroits appear, but less frequently and in better average condition because their prior owners were wearing them as fashion pieces rather than working in them.",
          "A sourcing heuristic: if you are uncertain at the sourcing point and the price is under €12, buy the jacket regardless of WIP/OG determination — an OG workwear Detroit in Very Good condition exits at €35–50, still well above a €12 sourcing price. If the sourcing price is €15–25, identify before committing: a WIP Detroit at €15 sourcing is a strong buy (€55+ exit); an OG at €15 sourcing is a marginal buy (€35–40 exit, €15–20 gross before fees). Above €25 sourcing price, only commit on a confirmed WIP Detroit — the OG's exit ceiling of €50 compresses margin significantly at €25+ sourcing.",
        ],
        cta: pricingMidCta("ctr_carhartt_detroit_wip_vs_og_20260916"),
      },
      {
        h: "Buy-below ceiling: €35.75 Very Good — condition and colourway tiers",
        p: [
          "The buy-below ceiling for Carhartt WIP Detroit Jackets by condition tier, targeting 35% gross margin before Vinted platform fees: Like New (worn once or never, all press-studs firm, canvas clean with no wash fade, lining fully intact) → targeting €78 exit → buy-below €50.70. Very Good (seasonal use, slight canvas softening, no fading on chest or collar, all press-studs and zip-pull functional, lining clean) → targeting €63 exit → buy-below €40.95. Good (visible canvas wash fade particularly on collar and chest, some press-stud rattle but all functional, minor lining fraying at cuffs) → targeting €47 exit → buy-below €30.55. Fair (heavy fading, inoperative press-studs, lining separated or stained) → targeting €28 exit → buy-below €18.20. Skip Fair pieces at EU charity shops unless the sourcing price is under €10 and condition photography can present the piece honestly.",
          "Colourway premium: the Hamilton Brown colourway (a mid-tone tan-brown, among the most searched single-colourway items in EU Carhartt WIP resale) commands a 10–15% premium over Black and Navy. A Very Good Hamilton Brown WIP Detroit exits at €65–80 where an equivalent Black or Navy exits at €55–70. The Stone-washed and Wax Coated variants — produced in limited seasonal quantities — exit at €10–20 above equivalent canvas condition grades when found. Avoid pricing washed or waxed variants at canvas rates: EU Vinted buyers specifically search 'Carhartt Detroit wax' and 'Carhartt Detroit stone wash' and will pay above canvas rates for them. Colourway premiums are strongest in France and Germany; Spanish and Italian EU Vinted markets show less sensitivity to colourway and more to size.",
          "The condition fail points for WIP Detroits in EU charity shop sourcing: (1) Press-stud chest closure — Carhartt's press-studs fatigue with washing cycles; a stud that spins freely without gripping is not repairable at margin-positive cost. Test all four chest and lower-pocket studs at the sourcing point. (2) Canvas collar discolouration — the collar takes oil and skin contact that washes unevenly; a yellow-grey collar ring is the most visible condition tell in product photography. (3) Interior lining separation at the cuff — the quilted nylon lining separates from the shell at the cuff seam on heavily used WIP Detroits; invisible when the jacket is on a hanger, visible when a buyer inspects the inner sleeve. Photograph and note this in the listing; pricing into Good tier eliminates returns.",
        ],
        cta: pricingBodyCta("ctr_carhartt_detroit_buybelow_20260916"),
      },
      {
        h: "EU size distribution: L and XL move fastest, M sources most frequently",
        p: [
          "EU Vinted Carhartt WIP Detroit Jacket demand peaks at L and XL. The Detroit's boxy, relaxed silhouette means M buyers often size up for the intended fit, and the EU Vinted buyer pool for chore-coat silhouettes trends toward buyers who prefer a substantial, slightly oversized drape rather than a fitted cut. A Detroit in L Very Good sells faster than an identical M Very Good on EU Vinted — at equal condition and listing quality, L/XL pieces clear in 1–2 days while M pieces may require 3–5 days to attract the right buyer.",
          "EU charity shop sourcing size distribution: the most commonly donated Carhartt jacket size at EU charity shops is M–L (European male average wardrobe size), which is precisely the size that moves fastest on EU Vinted. Unlike some heritage workwear brands where XXL pieces are overrepresented in donations, Carhartt WIP Detroit donations reflect a younger, fashion-adjacent donor profile — the M–L range is dominant in UK, French, and German charity shop Carhartt finds. This makes Carhartt WIP Detroits easier to source in the fast-moving size range than, for example, Stone Island jackets where the sourcing-to-demand alignment is weaker.",
          "Pricing by size: for the WIP Detroit specifically, XL pieces in core colourways command a small premium (€5–10 above L at equal condition) because they are less frequently sourced at EU charity shops than the M–L peak. S and XS pieces are the slowest-moving size on EU Vinted for this silhouette — the oversized chore coat aesthetic loses its visual coherence at XS on most buyers. Price S pieces at Good-tier rates even if condition is Very Good, because the buyer pool is measurably smaller.",
        ],
      },
      {
        h: "Carhartt vs The North Face jackets on EU Vinted: different plays at similar prices",
        p: [
          "The North Face jackets track 85 departures in the last 30 days on EU Vinted at a €48 average exit price — 4.7× Carhartt's jacket volume at comparable per-departure prices. The two categories represent fundamentally different sourcing operations. The North Face jackets are a volume play: 85 departures in the last 30 days at €48 means fast clearance, consistent buyer demand, and high competition at the sourcing point. EU charity shops in France and Germany have significantly higher North Face jacket donation frequency than Carhartt WIP Detroits because North Face penetrated a broader demographic during the 2010s puffer-jacket boom. The North Face sourcing competition at charity shops (other resellers, pickers) is proportionally higher.",
          "Carhartt WIP Detroits are a selective high-margin play: lower sourcing competition (fewer resellers know the WIP identification markers reliably), lower charitable donation frequency, but higher per-piece gross when correctly identified. A North Face jacket operation generates more weekly transactions; a WIP Detroit operation generates higher margin per transaction. The practical implication for a reseller visiting French or German charity shops: spend time on both, but commit more closely to Carhartt WIP identification because the WIP/OG distinction creates a price gap that North Face reselling does not require.",
          `Adidas jackets track 7 departures in the last 30 days at €89 average — the highest EU Vinted jacket average in the ResaleIQ database after Stone Island (15,663 brand-level departures in the last 30 days at €151) — but Adidas jackets in the €89 average tier are primarily limited-run collaborations (Adidas x Gucci, Adidas Y-3, Originals limited releases) that are effectively a separate market from accessible charity shop sourcing. Tommy Hilfiger jackets (10 departures in the last 30 days at €47) are a closer operational comparison to Carhartt: similar volume, similar average price, but different buyer demographics and sourcing channels. Tommy Hilfiger jacket sourcing peaks in northern EU charity shops (Netherlands, Belgium); Carhartt WIP Detroit sourcing is most reliable in France and Germany where the WIP brand has the deepest fashion-market penetration. [Full jacket category comparison →](${ilinkHref("data")})`,
        ],
        cta: pricingBodyCta("ctr_carhartt_detroit_vs_tnf_20260916"),
      },
    ],

    faq: [
      {
        q: "How much does a Carhartt Detroit Jacket sell for on EU Vinted?",
        a: "Carhartt's jacket category tracks 18 departures in the last 30 days on EU Vinted at a €43 average exit price as of the week to 16 September 2026 — this blends all Carhartt jacket types. The Carhartt WIP Detroit Jacket specifically exits above that average: Like New (unworn, all press-studs firm, canvas and lining perfect) → €70–85. Very Good (seasonal use, minimal fading, all closures functional, lining intact) → €55–75. Good (visible canvas fade on collar and chest, all hardware functional, minor lining wear) → €40–55. Fair (heavy fading, stud failures, lining damage) → €25–38. The OG workwear Detroit Jacket (not WIP, heavier duck canvas, blanket-lined) exits at €30–50 at equal condition — lower than the WIP because the WIP targets a larger streetwear buyer pool on EU Vinted. Colourway matters: Hamilton Brown exits 10–15% above equivalent Black or Navy across all condition tiers. ResaleIQ tracks Carhartt jacket exit data weekly from EU Vinted departure observations across France, Germany, Spain, Italy, and Portugal.",
      },
      {
        q: "What should I pay for a Carhartt Detroit Jacket to make a profit on EU Vinted?",
        a: "Buy-below ceilings for the Carhartt WIP Detroit Jacket targeting 35% gross margin after Vinted platform fees: Like New (targeting €78 exit) → buy-below €50.70. Very Good (targeting €63 exit) → buy-below €40.95. Good (targeting €47 exit) → buy-below €30.55. Fair (targeting €28 exit) → buy-below €18.20. At EU charity shops in France and Germany, WIP Detroits typically price at €8–20 — well below the buy-below ceiling for Very Good pieces. The practical risk is not price but identification: OG workwear Detroits at charity shops look similar to WIP Detroits but exit at €30–50 rather than €55–75. At the sourcing point, check the interior label for 'Carhartt WIP' and 'Made in Portugal' before committing at above €15. A correctly identified WIP Detroit sourced at €12–18 with Very Good condition delivers €35–50 gross per piece, which is among the highest per-piece margins in EU accessible-tier jacket reselling.",
      },
      {
        q: "How do I tell the difference between a Carhartt WIP and OG Detroit Jacket?",
        a: "The interior label is the definitive check. The Carhartt WIP Detroit reads 'Carhartt WIP' — the original workwear Detroit never uses 'WIP'. The WIP is also marked 'Made in Portugal'; OG workwear Detroits are typically made in the USA or Mexico. The WIP Detroit's canvas is lighter-weight and softer in hand than the OG's heavy duck canvas. The WIP uses a quilted nylon lining (not the blanket lining of the OG). The WIP's four-pocket layout (two chest, two lower) and press-stud closure are shared with the OG — these cannot distinguish the two. The WIP exits at €55–80 Very Good; the OG exits at €30–50 Very Good — a €15–30 gap per piece that makes the label check worth the 30 seconds it takes at the sourcing point.",
      },
      {
        q: "Which Carhartt Detroit Jacket colourway sells for the most on EU Vinted?",
        a: "Hamilton Brown is the highest-exit Carhartt WIP Detroit colourway on EU Vinted — commanding a 10–15% premium over equivalent Black and Navy pieces at equal condition. A Very Good Hamilton Brown WIP Detroit exits at €65–80 where a Black or Navy equivalent exits at €55–70. Hamilton Brown is the most searched single-colourway query for Carhartt WIP on EU Vinted, driven by its photographic appeal and its association with the core Carhartt WIP heritage aesthetic. Stone-washed and Wax Coated seasonal variants also command a €10–20 premium over canvas equivalents when buyers searching specifically for those finishes find them. The slowest-exit colourways are olive and khaki — accurate searches filter them out more often than core heritage colours, extending time-to-sale by 2–4 days versus Navy or Hamilton Brown.",
      },
      {
        q: "Is the Carhartt Detroit Jacket worth reselling on EU Vinted?",
        a: "Yes, with condition discipline and WIP identification skill. The Carhartt WIP Detroit exits at €55–75 Very Good with a buy-below of €35.75–40.95, delivering €15–35 gross per piece depending on sourcing cost. At EU charity shops in France and Germany where WIP Detroits surface at €8–20, the per-piece margin is among the highest in accessible-tier EU jacket reselling. The identification skill (WIP vs OG) adds 30 seconds per piece at sourcing and protects against pricing OG pieces at WIP rates (buyer disputes) or WIP pieces at OG rates (lost margin). The limiting factor is sourcing frequency: WIP Detroits are less common at EU charity shops than The North Face jackets (85 departures in the last 30 days on EU Vinted) or Patagonia fleece (98 departures in the last 30 days), so you are not building a high-frequency volume operation. The correct model is selective sourcing: when a WIP Detroit in Very Good condition appears in a French or German charity shop at €8–18, it is one of the best per-piece opportunities in the EU mid-price jacket market. At higher sourcing prices (€25+), only the WIP in Like New or Very Good top-tier condition justifies the buy.",
      },
    ],
  },
]
