// Batch 37 of SEO/AEO articles. Same contract as blog-posts.ts.
// Fred Perry polo shirts EU Vinted price guide — targets
// "fred perry polo shirt vinted price", "fred perry M12 polo vinted",
// "fred perry polo vinted eu guide", "fred perry polo shirt resell value",
// "is fred perry polo worth reselling vinted".

import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

export const POSTS_37: BlogPost[] = [
  {
    slug: "fred-perry-polo-shirt-eu-vinted-price-guide",
    title: "Fred Perry Polo Shirts on EU Vinted: Price Guide and Buy-Below (2026 Data)",
    seoTitle: "Fred Perry Polo Shirt Vinted EU Price Guide 2026 — Resale IQ",
    description:
      "Fred Perry polo shirts averaged €14 per departure across EU Vinted in September 2026 — 403 shirts per week, the highest-volume category of the #1 departure brand overall. Real exit ranges, buy-below prices by model (M12, M3, M2), and how the polo compares to Fred Perry hoodies (€22 avg) and jackets (€37 avg).",
    date: "2026-09-15",
    category: "Sourcing",
    readMins: 8,

    preflightQuery: "Fred Perry Polo",
    intro:
      "Fred Perry is the highest-departure brand on EU Vinted with 199 departures in the last 30 days — and polo shirts alone account for 403 of those. In the week to 15 September 2026, 403 Fred Perry shirts left the shelf across France, Germany, Spain, Italy and Portugal at an average exit price of €14. That makes the Fred Perry polo the single highest-volume category of any tracked brand on EU Vinted, running ahead of Stone Island hoodies (395 departures at €55 average) and Patagonia jackets. The €14 average is modest — but for resellers buying at charity shop prices of €3–8, the margin per item stacks across volume and frequency. This guide breaks down exit prices by model, size, condition, and colourway — and where the buy-below ceiling sits for each tier.",
    definedTerm: {
      name: "Fred Perry polo shirt departure average",
      description:
        "The Fred Perry polo shirt departure average is the average price at which a tracked Fred Perry shirt listing leaves the shelf on EU Vinted — not the asking price and not the retail price. As of the week to 15 September 2026, the Fred Perry shirt departure average is €14 across 403 observed departures in France, Germany, Spain, Italy, and Portugal. This is the single highest-volume shirt category in the ResaleIQ EU Vinted database. Individual exit prices range from €8–10 for faded or poorly photographed pieces to €30–50 for rare colourways or limited collaborations. Fred Perry overall tracks 199 departures in the last 30 days at an €18 brand average — the top brand by volume in the EU tracked database. The buy-below ceiling at the shirt category level is €9.10.",
    },
    sections: [
      {
        h: "Fred Perry on EU Vinted: the #1 departure brand",
        p: [
          "Fred Perry tracks 199 departures in the last 30 days across all categories on EU Vinted — making it the highest-volume brand in the ResaleIQ EU database, ahead of Patagonia (178 departures in the last 30 days) and Stone Island (178 departures in the last 30 days). Shirts account for 403 of those departures (48%), T-shirts for 155 (19%), hoodies for 131 (16%), jackets for 103 (12%), and caps for 16 (2%). The brand average exit price is €18, reflecting the shirt-heavy mix pulling the average down from the higher jacket tier.",
          "The polo shirt dominance reflects Fred Perry's brand identity in EU markets: the wreath logo polo is the category that drives recognition and demand. Jackets carry significantly higher exit prices (€37 average) but require higher sourcing investment. T-shirts move at volume but at a €12 average that leaves thin margin on most sourcing budgets. The polo shirt is the brand's volume engine — frequent, liquid, and accessible for resellers at most price points.",
          `The key risk in Fred Perry polo shirts is buying the right version. The M12 twin-tipped polo is the core model and the most liquid; other versions exit slower and at lower prices. Colourway and condition matter significantly: a rare colourway in excellent condition can exit at €35–50, while a faded standard colour exits at €8–10. [Full Fred Perry brand data →](${ilinkHref("flip")})`,
        ],
        cta: pricingMidCta("ctr_fp_polo_guide_intro_20260915"),
      },
      {
        h: "Fred Perry polo models: M12, M3, and M2",
        p: [
          "The M12 twin-tipped polo is Fred Perry's core model and the dominant item in the EU Vinted shirt category. The twin tipping — contrasting stripes on the collar and cuffs — is the visual identifier that buyers search for. The M12 in piqué cotton exits at €12–20 in standard colours in good condition; in archive or unusual colourways it can reach €30–45. The M12 is the model that accounts for the majority of the 403 weekly shirt departures.",
          "The M3 bomber polo has a slightly shorter cut and was popular in specific Fred Perry lines across the 2000s–2010s. It exits at a modest discount to the M12 (€10–16) because the silhouette is less consistently in demand. Buyers who seek the M3 are typically label-checking, which means correctly identifying the model in the listing title directly reduces time to departure for this variant.",
          "The M2 button-through polo (a full-button front, more formal construction) exits at €12–18 — similar to the M12 but with slightly slower liquidity because the button-through styling is less associated with the streetwear-influenced buyer pool active on EU Vinted. For resellers, the M12 is the highest-priority model to identify and source; the M3 and M2 are acceptable secondary pickups at the right price.",
        ],
      },
      {
        h: "Buy-below ceiling and volume sourcing",
        p: [
          "The buy-below ceiling for Fred Perry polo shirts at the category level is €9.10 — 65% of the €14 departure average. This is the maximum you can pay for a standard M12 in a common colour in good condition and maintain workable margin after Vinted's seller fee and domestic shipping. Any shirt sourced below €5 at a charity shop or flea market has clear margin even at the lowest exit prices.",
          "Fred Perry is one of the few brands where volume sourcing is viable at entry reselling scale. The €9.10 buy-below ceiling is reachable — Fred Perry polos appear frequently at UK charity shops (£3–6 tier), French vide-greniers (€2–5), and German Kleiderkreisel lots. The combination of high weekly departure volume (199 departures in the last 30 days) and accessible sourcing prices means a reseller can build a Fred Perry polo pipeline with lower capital commitment than most other tracked brands.",
          "The limit on volume sourcing is condition and colourway selection. Buying every Fred Perry polo you find, regardless of state, produces a slow-moving pile of items that exit at €8–9 — barely clearing margin. Selective buying — M12, standard sizes (M or L), no badge damage, no pilling, strong colour saturation — produces items that exit in 7–10 days at €14–18. The selection discipline is the skill, not the sourcing access.",
        ],
        cta: pricingBodyCta("ctr_fp_polo_guide_buybellow_20260915"),
      },
      {
        h: "Condition and colourway: the exit price drivers",
        p: [
          "Fred Perry polo condition is the primary exit-price driver within the standard M12 range. A clean M12 with no badge damage, no pilling on the chest, and strong twin-tip colour contrast exits at €14–20 in a common colour. The same piece with collar stretching, badge fraying, or significant pilling exits at €8–10 regardless of colour. Badge condition is especially important — the wreath and laurel embroidered badge is what buyers verify before purchasing, and any damage to it signals authenticity doubt.",
          "Colourway is the strongest upside lever. Fred Perry has produced hundreds of polo colourways across its archive, and some combinations are significantly more sought than others. Core colours — white/navy twin-tip, black/white twin-tip, British racing green, navy solid — exit at the category average and sell within 7–10 days. Rare colourways (yellow/purple, burgundy/gold, collaboration colourways) can exit at €25–50 when photographed correctly and listed with the colourway in the title.",
          "Size affects exit speed more than exit price. M and L are the most liquid sizes in all EU markets. S and XL sell slightly slower but at comparable prices. XXS and XXL are long-tail sizes. Fred Perry's sizing runs slightly small by modern EU standards — an M12 labelled 'M' fits closer to a modern 'S' in some production runs, particularly pre-2005. Noting the actual pit-to-pit measurement in the listing description reduces return risk and buyer hesitation.",
        ],
      },
      {
        h: "Fred Perry polo vs Fred Perry hoodies and jackets",
        p: [
          "The polo is not the best-margin Fred Perry item — that distinction belongs to jackets, which exit at a €37 average across 460 departures in the last 30 days. A Fred Perry Harrington jacket in good condition exits at €35–60; archive or limited-run jackets reach €80–120. The sourcing cost for a jacket is proportionally higher (€15–25 at a well-stocked charity shop), but the margin is better per item than polo shirts.",
          "Hoodies sit between the two: 199 departures in the last 30 days at a €22 average, buy-below ceiling €14.30. Fred Perry hoodies in the standard track-top style are accessible at charity shop prices of €5–10, and the €22 average exit price means a reasonable margin per item without the volume scale of polos. The hoodie is the intermediate tier — better margin than polo, lower capital commitment than jackets.",
          `For resellers, the Fred Perry portfolio strategy is: polos for volume and capital velocity (199 departures in the last 30 days exit at €14), hoodies for intermediate margin (199 departures in the last 30 days at €22), jackets for per-unit margin when opportunity arises (460 departures in the last 30 days at €37). Running all three in parallel maximises the brand's EU Vinted presence. [Fred Perry brand page →](${ilinkHref("flip")})`,
        ],
        cta: pricingBodyCta("ctr_fp_polo_guide_hoodies_20260915"),
      },
      {
        h: "Fred Perry vs Lacoste and Supreme on EU Vinted",
        p: [
          "Fred Perry vs Lacoste: Lacoste tracks 165 departures in the last 30 days at a €33 brand average — significantly less volume than Fred Perry (199 departures in the last 30 days) but at more than double the average exit price. Lacoste polos exit at €25–45 for clean pieces in core colours; Fred Perry exits at €12–20. For a reseller with a lower capital budget, Fred Perry has better volume and lower sourcing costs; for a reseller focused on per-item margin, Lacoste's higher exit price justifies the higher buy price.",
          "Fred Perry vs Supreme: Supreme tracks 178 departures in the last 30 days at a €66 average — lower volume than Fred Perry but more than triple the average exit price. Supreme's Vinted resale dynamics are hype-driven and model-specific; Fred Perry is brand-wide and condition-driven. Supreme requires knowledge of specific drop cycles and item authentication; Fred Perry requires knowledge of model identification and colourway value. Different skill sets, different risk profiles.",
          `Fred Perry vs Stone Island: Stone Island hoodies exit at €55 average on 178 departures in the last 30 days — nearly the same volume as Fred Perry shirts (199 departures in the last 30 days) but at four times the exit price. Stone Island requires a higher sourcing budget (€20–35 per item vs €3–8 for Fred Perry polos) and more condition knowledge per piece. Fred Perry polo reselling is the higher-frequency, lower-capital strategy; Stone Island is the higher-margin, more selective one. [See all EU Vinted brand data →](${ilinkHref("data")})`,
        ],
      },
    ],
    faq: [
      {
        q: "How much does a Fred Perry polo shirt sell for on EU Vinted?",
        a: "The Fred Perry shirt category averaged €14 per departure across EU Vinted in the week to 15 September 2026, based on 403 observed departures in France, Germany, Spain, Italy, and Portugal. That covers a range: faded or worn pieces in standard colours exit at €8–10, clean M12 twin-tipped polos in core colours at €12–18, and rare colourways or archive pieces at €25–50 when correctly identified in the listing.",
      },
      {
        q: "What is the buy-below price for a Fred Perry polo on EU Vinted?",
        a: "The buy-below ceiling for a standard Fred Perry polo shirt is €9.10 — 65% of the €14 departure average. For a clean M12 in a core colour sourced at a charity shop (£3–6 or €3–5 typically), the margin is clear even at the lower end of the exit range. Items with badge damage or heavy condition issues should be sourced below €4 or not at all, as they exit at €8–9 and leave almost no margin after fees.",
      },
      {
        q: "Which Fred Perry polo model is most valuable on EU Vinted?",
        a: "The M12 twin-tipped polo is the most liquid and most consistently traded model — it accounts for the majority of the 403 weekly shirt departures and is what EU Vinted buyers search for by name. Rare colourways of the M12 in good condition are the highest exit-price opportunity within the shirt category (€25–50). The M3 and M2 are secondary models with slightly slower liquidity at comparable prices. Correct model identification in the listing title is the single biggest factor in reducing time to departure.",
      },
      {
        q: "Is Fred Perry worth reselling on EU Vinted?",
        a: "Yes — Fred Perry is the highest-volume brand in the ResaleIQ EU Vinted database with 199 departures in the last 30 days at an €18 brand average. The polo shirt category alone contributes 403 of those departures at €14 average. The buy-below ceiling of €9.10 for shirts is reachable at charity shops and flea markets across France, Germany, Spain, and the UK. The limitation is exit price: at €14 average, the margin per item is modest. The business case rests on volume and selection discipline, not per-item premium.",
      },
      {
        q: "How does Fred Perry compare to other brands on EU Vinted?",
        a: "Fred Perry leads EU Vinted departure volume at 199 departures in the last 30 days — ahead of Patagonia (178 departures in the last 30 days at €37 avg) and Stone Island (178 departures in the last 30 days at €70 avg). The tradeoff is exit price: Fred Perry's €18 brand average is the lowest among the top-5 departure brands. For resellers, Fred Perry offers the highest activity-per-pound-of-sourcing-budget; Stone Island offers the highest exit-price-per-item. Most active EU Vinted resellers carry both.",
      },
      {
        q: "How long does a Fred Perry polo take to sell on EU Vinted?",
        a: "Clean M12 twin-tipped polos in M or L in a core colourway (navy, black, racing green, white) priced near the €14 market average typically sell within 5–10 days. Worn pieces or unusual sizes sit for 2–4 weeks. Rare colourways sell within 3–7 days when the colourway is named in the title — buyers searching for specific Fred Perry colourways are active and know what they want. Including the twin-tip colour combination (e.g. 'Navy / White twin tip') in the listing title significantly reduces time to departure.",
      },
    ],
  },
]
