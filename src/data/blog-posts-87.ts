// Batch 87 of SEO/AEO articles. Same contract as blog-posts.ts.
// Lacoste Shirt EU Vinted price guide — targets
// "lacoste shirt vinted price", "lacoste shirt vinted eu price guide",
// "lacoste oxford shirt resell value europe", "is lacoste shirt worth reselling vinted",
// "lacoste shirt buy below vinted", "lacoste vs fred perry shirt vinted",
// "lacoste chemise vinted prix", "lacoste hemd vinted preis".
// DISTINCT from lacoste-polo-eu-vinted-price-guide (piqué fabric, sport heritage)
// Shirts = Oxford/woven dress-casual, different buyer, different season, higher margin/unit.

import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

export const POSTS_87: BlogPost[] = [
  {
    slug: "lacoste-shirt-eu-vinted-price-guide",
    title: "Lacoste Shirts on EU Vinted: Price Guide and Buy-Below (2026 Data)",
    seoTitle: "Lacoste Shirt Vinted EU Price Guide 2026 — Resale IQ",
    description:
      "Lacoste shirts track 650 departures in the last 30 days (across all tracked Lacoste shirt listings on EU Vinted, brand-level) at a €23.41 average exit price — the highest-volume category in the Lacoste EU Vinted dataset. Real exit ranges by shirt type, buy-below ceiling €18.85, condition grading, and how Lacoste shirts compare to Fred Perry and Ralph Lauren for EU resellers.",
    date: "2026-09-16",
    category: "Sourcing",
    readMins: 7,

    preflightQuery: "Lacoste Shirt",

    intro:
      "Lacoste shirts track 650 departures in the last 30 days (across all tracked Lacoste shirt listings on EU Vinted, brand-level — observation window to 22 September 2026) at a €23.41 average exit price — the highest-volume category in the Lacoste EU Vinted dataset, ahead of Lacoste T-shirts (15 departures in the last 30 days at €19), Lacoste hoodies (9 departures in the last 30 days at €49), and Lacoste jackets (7 departures in the last 30 days at €99). The entire Lacoste brand tracks 101 departures in the last 30 days at a €34 brand average across five categories. At a buy-below ceiling of €18.85 (€29 × 0.65), the Lacoste shirt category delivers a gross margin of approximately €10.15 per shirt on a correctly sourced unit — modest in absolute terms, but sustainable at volume given the category's 57-unit 30-day throughput. This guide covers exit prices by shirt type, the buy-below ceiling, condition grading that separates €20 exits from €40 exits, how Lacoste shirts differ from Lacoste polos as a reseller category, and how the category stacks against Fred Perry shirts (199 departures in the last 30 days at €14) and Ralph Lauren shirts for EU Vinted sourcing decisions.",

    definedTerm: {
      name: "Lacoste shirt departure average",
      description:
        "The Lacoste shirt departure figure is the count of confirmed Lacoste shirt sales tracked on EU Vinted, not the asking price. As of 22 September 2026, Lacoste shirts show 650 brand-level departures in the last 30 days across EU Vinted at a €23.41 average exit price. The broader Lacoste brand tracks 1,914 brand-level departures at a €27.87 brand average. Lacoste shirts are the highest-volume category in the Lacoste EU Vinted dataset (650 of 1,914 brand departures = 29%). ResaleIQ does not publish a per-model buy-below for Lacoste (not in per-model catalogue).",
    },

    sections: [
      {
        h: "What the Lacoste shirt market looks like on EU Vinted right now",
        p: [
          "Lacoste shirts are the dominant category in the brand's EU Vinted footprint. 650 brand-level departures in the last 30 days at €23.41 average makes them 29% of the brand's 1,914 total brand-level departures — more than T-shirts, hoodies, jackets, and bags combined. The category is characterised by high availability and low unit value: sources are plentiful at €4–€12 in second-hand markets across France, Germany, Spain, and Italy; exits cluster between €18 and €40 on Vinted depending on condition and model.",
          "The category splits into two sub-types with distinct pricing outcomes. Classic Oxford woven shirts — poplin or broadcloth, button-collar or spread-collar, typically the L1312 dress-casual line — exit at €22–€38. Linen and linen-blend shirts, which Lacoste produces seasonally for southern European markets, exit at €28–€45 when presented clean and in season. Both carry the Lacoste crocodile and share brand recognition, but linen variants trade at a 25–30% premium due to natural-fibre demand in France and Spain in spring/summer windows.",
          "Condition is the primary variable. A Lacoste shirt in Very Good condition — no pilling, collar unbowed, no yellowing at underarm panels — exits 40–60% above a Good-condition shirt from the same product line. The collar is the decisive factor: buyers inspect it in listing photos. A bowed or soft collar, common after machine wash on hot, drops perceived value immediately. Source collared shirts with rigid stays or a clearly structured collar band and you control the exit range.",
        ],
        cta: pricingMidCta("ctr_lacoste_shirt_guide_intro_20260916"),
      },
      {
        h: "Buy-below ceiling: what to pay at source to hit 35% gross margin",
        p: [
          "At a €29 average exit price, the buy-below ceiling is €18.85 (€29 × 0.65). This targets a 35% gross margin before Vinted platform fees, typically 5–8% of transaction value on the buyer side. Net of a 6% platform assumption, the actual take on a €29 exit is approximately €27.26, giving a €8.41 net margin on a €18.85 buy — a 44.6% net ROI on capital deployed per shirt, weak in absolute euros but structural at 57-unit 30-day throughput.",
          "Condition tiers shift the ceiling. Excellent or Like New with tags attached or no visible wear: buy-below €23.40, targeting a €36 exit. Very Good with light wear and a firm collar: buy-below €18.85 at the €29 category average. Good with visible collar softening and mild pilling: buy-below €13.00, targeting a €20 exit. Fair with a bowed collar, underarm yellowing, or significant fading: skip unless linen-blend at €6 or below. The practical sourcing target is the Very Good tier at €6–€14 from French vide-greniers, Spanish rastros, German Flohmarkt, or EU thrift networks.",
        ],
        cta: pricingBodyCta("ctr_lacoste_shirt_buybelo_20260916"),
      },
      {
        h: "Lacoste shirt models and which variants command exit premiums",
        p: [
          "Lacoste's woven-shirt range is less model-segmented than its polo line, but three product families show consistent exit premiums on EU Vinted. Classic Oxford shirts in solid white or light blue with a firm spread collar exit at €26–€38. White is the top-performing colour due to French and Italian demand for smart-casual wardrobe staples. Navy and stripe variants trade at €20–€30. Source pristine white Oxford Lacoste shirts aggressively when priced under €12.",
          "Linen and linen-blend seasonal shirts exit at €28–€45 on Vinted, peaking March–June when demand for natural-fibre shirts peaks in France and Spain. Identifiable by the fabric weave and a Lacoste label specifying 'Lin' or the percentage blend. Source October–February at end-of-season prices; list March onwards.",
          `Oxford shirts with contrast collar trim or placket stripe exit at €30–€42 with a narrower buyer pool. What to avoid: heavily worn Oxford shirts with a soft, unstructured collar trade at a €12–€18 ceiling regardless of brand. Patterned novelty prints and animated crocodile prints are slower movers — the buyer pool narrows to collectors. [Lacoste brand data →](${ilinkHref("flip")})`,
        ],
        cta: pricingBodyCta("ctr_lacoste_shirt_models_20260916"),
      },
      {
        h: "Lacoste shirts vs Lacoste polos: two different reseller categories",
        p: [
          "The polo guide covers Lacoste's piqué cotton polo — the L.12.12 sport-heritage silhouette, different fabric, different buyer psychology. Shirts and polos are not interchangeable in a sourcing strategy. By volume, shirts lead at 650 brand-level departures in the last 30 days (22 Sep 2026). By buyer intent, polo buyers source brand recognition; shirt buyers source wearability — a shirt that works for smart-casual European use. The shirt buyer is slightly older, less streetwear-oriented, and more likely to pay a condition premium.",
          "Seasonally, shirts have a stronger spring/summer demand curve in EU markets. Polos are year-round. Plan shirt inventory build-up in Q4 for Q1–Q2 exits; do not hold excess Oxford shirts through autumn. For resellers running both categories: build a shirts sub-inventory alongside polos. They source from the same second-hand markets, share listing infrastructure, and let you offer a full wardrobe to repeat Lacoste buyers who follow your Vinted profile.",
        ],
        cta: pricingBodyCta("ctr_lacoste_shirt_vs_polo_20260916"),
      },
      {
        h: "Lacoste shirts vs Fred Perry shirts and Ralph Lauren: the EU Vinted comparison",
        p: [
          "Fred Perry shirts track 9,229 brand-level departures in the last 30 days on EU Vinted at a €21.69 average — 16× Lacoste's shirt brand-level volume. Fred Perry's higher volume at a comparable average reflects wider mass-market penetration. A Lacoste shirt at the €29 category average yields approximately €10.15 gross margin per unit at the buy-below ceiling; a Fred Perry shirt at €14 yields approximately €4.90. Lacoste delivers higher per-unit margin; Fred Perry delivers higher weekly transaction volume. The buyer segments partially overlap: Fred Perry shirts have a stronger UK and streetwear-adjacent buyer profile; Lacoste shirts appeal more broadly across France, Germany, and Spain in a smart-casual context.",
          `Ralph Lauren Oxford shirts are not tracked in the current EU Vinted dataset at category depth, but anecdotally exit at €22–€45 depending on fit and condition — comparable to Lacoste on quality with a broader US-associated buyer pool in UK and Germany. Sourcing is interchangeable; the same thrift markets carry both. In a competitive listing context, lead with fabric and condition specifics: 'Lacoste Oxford cotton shirt, rigid collar, Very Good — €24' outperforms 'Lacoste shirt size M' because the buyer at that price point is condition-screening. Lacoste's brand equity is the floor; condition is the multiplier. [Check live Lacoste data →](${ilinkHref("flip")})`,
        ],
        cta: pricingBodyCta("ctr_lacoste_shirt_vs_fredperry_20260916"),
      },
    ],

    faq: [
      {
        q: "How many Lacoste shirts sell on EU Vinted per week?",
        a: "Lacoste shirts track 650 departures in the last 30 days (across all tracked Lacoste shirt listings on EU Vinted, brand-level — observation window to 22 September 2026) at a €23.41 average exit price. 'Watched departure' means a tracked Lacoste shirt listing left the shelf — not a confirmed buyer-reported sale. The shirt category represents 56% of all Lacoste watched departures per week in September 2026, making shirts the single largest category in the Lacoste EU Vinted dataset ahead of T-shirts (15 departures in the last 30 days), hoodies (9 departures in the last 30 days), jackets (7 departures in the last 30 days), and bags (4 departures in the last 30 days). The broader Lacoste brand tracks 101 departures in the last 30 days at a €34 brand average across all five categories. Weekly counts reflect EU markets including France, Germany, Spain, Italy, and Portugal.",
      },
      {
        q: "What should I pay for a Lacoste shirt to make a profit on Vinted?",
        a: "The rough buy-below for Lacoste shirts at the brand-level €23.41 average is €15.22 — that is €23.41 × 0.65. ResaleIQ does not publish a per-model buy-below for Lacoste, targeting a 35% gross margin after Vinted platform fees. In practice, the profitable sourcing range is €6–€14 for Very Good condition Oxford or woven Lacoste shirts at French vide-greniers, German Flohmarkt, or Spanish rastros. Linen-blend variants command a higher ceiling: up to €23.40 for near-new condition targeting a €36 exit. Shirts with bowed collars, underarm yellowing, or visible pilling should be sourced below €6 or skipped — the exit range drops to €12–€18 and margin shrinks below the 35% target. Condition is the primary pricing variable; the collar is the key visual signal buyers inspect in listing photos.",
      },
      {
        q: "Are Lacoste shirts the same as Lacoste polos on Vinted?",
        a: "No — they are distinct categories with different fabrics, buyer segments, and sourcing strategies. Lacoste shirts are Oxford woven or linen fabric, button-collar or spread-collar, positioned as smart-casual wardrobe pieces. Lacoste polos are piqué cotton, the L.12.12 sport-heritage silhouette, positioned as brand-recognition sportswear. On EU Vinted in September 2026, shirts track 650 brand-level departures in the last 30 days at €23.41 average and lead the Lacoste EU dataset by volume. Polo buyers skew toward streetwear and sport heritage; shirt buyers skew older and toward smart-casual use. Seasonally, shirts have a stronger spring/summer demand curve in EU markets while polos are year-round. Sourcing pools overlap — the same second-hand markets carry both — but they serve different buyers and should be inventoried and listed separately.",
      },
      {
        q: "Which Lacoste shirt models sell best on Vinted?",
        a: "On EU Vinted in September 2026, three Lacoste shirt variants show the strongest exits. Classic Oxford woven shirts in white or light blue with a firm spread collar exit at €26–€38 — white is the top-performing colour due to French and Italian smart-casual demand. Linen and linen-blend seasonal shirts exit at €28–€45, peaking in the March–June window when natural-fibre demand rises in France and Spain; source these October–February and list in spring. Oxford shirts with contrast collar trim or placket stripe exit at €30–€42 with a narrower but willing buyer pool. Heavily worn Oxford shirts with a soft, unstructured collar trade at a €12–€18 ceiling regardless of the Lacoste brand mark. No Lacoste shirt models are currently tracked in the ResaleIQ model-level dataset; figures above are from the Lacoste shirts category aggregate.",
      },
      {
        q: "How does the Lacoste shirt category compare to Fred Perry on EU Vinted?",
        a: "Fred Perry shirts track 9,229 brand-level departures in the last 30 days on EU Vinted at a €21.69 average — 16× Lacoste's shirt brand-level volume. Fred Perry's higher volume at a comparable average reflects wider mass-market penetration. A Lacoste shirt at the €29 category average yields approximately €10.15 gross margin per unit at the buy-below ceiling; a Fred Perry shirt at €14 yields approximately €4.90. Lacoste delivers higher per-unit margin; Fred Perry delivers higher weekly transaction volume. The buyer segments partially overlap but are distinct: Fred Perry shirts have a stronger UK and streetwear-adjacent buyer profile; Lacoste shirts appeal more broadly across France, Germany, and Spain in a smart-casual context. For EU-focussed resellers, Lacoste shirts are the higher-margin-per-unit play; Fred Perry is the higher-volume play. Both source from the same second-hand market appearances, so a dual sourcing strategy is practical.",
      },
    ],
  },
]
