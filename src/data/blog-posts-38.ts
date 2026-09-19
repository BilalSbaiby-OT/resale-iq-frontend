// Batch 38 of SEO/AEO articles. Same contract as blog-posts.ts.
// Fred Perry Jackets EU Vinted price guide — targets
// "fred perry jacket vinted price", "fred perry harrington jacket vinted",
// "fred perry jacket resell value eu", "fred perry jacket buy below vinted",
// "how much does a fred perry jacket sell for on vinted".

import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

export const POSTS_38: BlogPost[] = [
  {
    slug: "fred-perry-jacket-eu-vinted-price-guide",
    title: "Fred Perry Jackets on EU Vinted: Price Guide and Buy-Below (2026 Data)",
    seoTitle: "Fred Perry Jacket Vinted EU Price Guide 2026 — Resale IQ",
    description:
      "Fred Perry jackets averaged €37 per departure across EU Vinted in the week to 19 September 2026 — 22 jackets per week, the brand's highest-margin category. Real exit ranges, buy-below ceilings by jacket type (Harrington, track, overcoat), and how Fred Perry jackets compare to Stone Island and Patagonia for EU resellers.",
    date: "2026-09-19",
    updated: "2026-09-19",
    category: "Sourcing",
    readMins: 8,

    preflightQuery: "Fred Perry Jackets",
    intro:
      "Fred Perry is the 4th-highest-volume brand on EU Vinted by departures per week at 197 tracked departures — but the most profitable category within the brand is not the polo shirt. Fred Perry jackets track 22 watched departures per week at a €37 average exit price in the week to 19 September 2026. That is more than double the polo shirt average (€15) and more than 60% above the hoodie average (€17). A clean Harrington jacket sourced at a charity shop exit price of €12–18 and departing at €40–55 represents the best per-unit margin in the Fred Perry product range. This guide covers exit prices by jacket type, buy-below ceilings, condition criteria, and how Fred Perry jackets stack up against Stone Island and Patagonia for EU Vinted resellers.",
    definedTerm: {
      name: "Fred Perry jacket departure average",
      description:
        "The Fred Perry jacket departure average is the average price at which a tracked Fred Perry jacket listing leaves the shelf on EU Vinted — not the asking price and not the retail price. As of the week to 19 September 2026, the Fred Perry jacket departure average is €37 across 22 observed departures in France, Germany, Spain, Italy, and Portugal. This is the highest average exit price of any Fred Perry category, ahead of hoodies (€17) and shirts (€15). Individual exit prices range from €20 for worn or generic track jackets to €80–120 for archive Harrington styles or collaboration pieces. The buy-below ceiling at the jacket category level is €24.05.",
    },
    sections: [
      {
        h: "Fred Perry jackets on EU Vinted: the highest-margin category",
        p: [
          "Fred Perry tracks 197 watched departures per week across all categories on EU Vinted. Jackets account for 22 of those departures (11%) at a €37 average — the highest average exit price of any category in the Fred Perry range. Shirts move more volume (91/7d) but at €15 average; hoodies sit in the middle (34/7d at €17). The jacket category is where the per-unit margin is made.",
          "The €37 average reflects a mix: standard track jackets and bomber-style pieces at the lower end (€20–30), clean Harrington jackets in core colourways at the mid tier (€35–55), and archive or limited-run pieces at €60–120. For resellers, the Harrington (J2) is the key model — it is the jacket buyers search for by name and the piece that consistently exits at or above the category average.",
          `The sourcing case for Fred Perry jackets is straightforward: a Harrington in good condition at a French vide-grenier or UK charity shop typically prices at €8–18. At the €37 exit average, even sourcing at €18 leaves margin above most other Fred Perry categories per item. [Full Fred Perry brand data →](${ilinkHref("flip")})`,
        ],
        cta: pricingMidCta("ctr_fp_jacket_guide_intro_20260919"),
      },
      {
        h: "Fred Perry jacket types: Harrington, track top, and overcoat",
        p: [
          "The Harrington jacket (model J2) is the cornerstone Fred Perry outerwear piece. The short-cut tartan-lined jacket with its signature diagonal zip is immediately identifiable and the most-searched Fred Perry jacket on EU Vinted. Clean J2 pieces in core colourways — navy, black, burgundy, racing green — exit at €35–55 in good condition. Limited-run colourways, archive tartan linings, or Harringtons from Fred Perry x Raf Simons or Fred Perry x Amy Winehouse Foundation collaborations exit at €60–120 when correctly identified.",
          "The track top — typically the twin-tipped long-sleeve jacket in cotton or polyester — is the second most common Fred Perry jacket type on EU Vinted. It exits at €20–35 for standard pieces; vintage track tops from the 1980s–90s in good condition with strong twin-tip definition can reach €40–60. Track tops are less model-specific than Harringtons — buyers are primarily looking at colourway and condition, not a specific model code.",
          "Fred Perry overcoats and longer outerwear appear less frequently on EU Vinted (a minority of the 103 weekly departures) and exit at €30–60 depending on length, condition, and colourway. These are slower movers than the Harrington — buyers are more selective and the category is less defined. Resellers focused on capital velocity should prioritise Harringtons and track tops over overcoat styles.",
        ],
      },
      {
        h: "Buy-below ceiling and margin structure",
        p: [
          "The buy-below ceiling for Fred Perry jackets at the category level is €24.05 — 65% of the €37 departure average. This is the maximum you can pay for a standard piece in good condition and maintain workable margin after Vinted's seller fee and domestic shipping. For the Harrington specifically: sourcing below €15 at a charity shop produces clear margin even at the lower end of the exit range (€35–40). Sourcing above €22 on a standard Harrington requires it to exit at €38+ — achievable on clean pieces but requiring confidence in condition assessment.",
          "The margin structure compares favourably to Fred Perry shirts. A shirt sourced at €5 and exiting at €15 generates roughly €7–8 net after fees. A Harrington sourced at €12 and exiting at €42 generates roughly €25 net after fees — 3–4× the per-unit margin on similar sourcing effort per item. The limitation is sourcing frequency: Harrington jackets appear less often than polo shirts in charity shop racks, so the volume cannot match the shirt pipeline.",
          "The optimal Fred Perry reselling strategy combines both categories: shirts for volume and capital velocity (91 departures/7d, sourcing at €3–6), Harrington jackets and track tops for per-unit margin when encountered (22 departures/7d, sourcing at €8–18). Running both in parallel maximises exposure across the brand's EU Vinted demand.",
        ],
        cta: pricingBodyCta("ctr_fp_jacket_guide_margin_20260919"),
      },
      {
        h: "Condition and colourway: what drives exit price",
        p: [
          "Condition is the primary exit-price driver for Fred Perry Harrington jackets. A J2 with clean tartan lining, intact collar welt, working zip and no badge damage exits at €40–55 in a core colourway. The same piece with a torn lining, stuck zip or faded external fabric exits at €20–25 regardless of colourway. The lining condition is the most important check for Harringtons — buyers know to look for it, and photographs showing a clean tartan lining significantly accelerate time to departure.",
          "Colourway is the strongest upside lever for jackets, more than for shirts. Fred Perry has produced Harringtons in hundreds of colourways across its archive — standard navy, black and racing green exit reliably at category average; rarer archive colourways (yellow/navy, burgundy/gold) exit at a 30–50% premium. Collaboration pieces command the highest premiums: Fred Perry x Raf Simons Harringtons in good condition have exited at €80–150 on EU Vinted; Fred Perry x Miles Kane or Amy Winehouse Foundation pieces exit at €60–100. Identifying a collaboration piece requires checking the label — the collab branding appears on the neck label and sometimes on the lining.",
          "Size affects liquidity more than price. M and L are the most liquid sizes in EU markets — they clear within 5–10 days on a well-priced Harrington. S and XL take slightly longer but at comparable prices. Fred Perry Harrington sizing runs slightly small (a labelled L fits closer to an M in modern sizing), which is worth noting in the listing description to reduce buyer hesitation.",
        ],
      },
      {
        h: "Fred Perry jackets vs Stone Island and Patagonia",
        p: [
          "Stone Island jackets track 40 watched departures per week at a €143 average — significantly higher exit price than Fred Perry (22/7d at €37) but at lower volume. A Stone Island jacket in good condition exits at €100–200 for standard pieces, €200–400 for Shadow Project or special-edition styles. The trade-off: Stone Island jackets require a higher sourcing budget (€40–70 for a standard piece at a consignment shop) and deeper condition knowledge per item. Fred Perry Harringtons are accessible to resellers with smaller budgets; Stone Island jackets require higher capital but generate substantially more per-unit revenue.",
          "Patagonia jackets track 93 watched departures per week at a €44 average — higher volume than Fred Perry jackets (22/7d) at a higher average price. Patagonia fleeces and down jackets are consistent movers across EU markets; the sourcing cost is typically €15–30 for a clean Retro-X or Better Sweater. Patagonia offers higher volume-per-item than Fred Perry jackets at a comparable margin tier. Both are legitimate parallel additions to a Fred Perry shirt base for EU Vinted resellers.",
          `Fred Perry jacket reselling occupies a clear niche: accessible sourcing budget, strong brand recognition across EU markets, and the Harrington as a permanent wardrobe staple that never falls out of demand. For resellers already active on Fred Perry shirts, adding jackets is the most efficient margin expansion within the same brand. [See all EU Vinted brand data →](${ilinkHref("data")})`,
        ],
      },
      {
        h: "Listing strategy for faster departures",
        p: [
          "The most common mistake on Fred Perry Harrington listings is omitting the colourway and lining tartan from the title. Buyers searching EU Vinted for a Fred Perry Harrington are often looking for a specific combination — 'Fred Perry Harrington navy tartan' outperforms 'Fred Perry jacket M' in EU Vinted search. Including the model code (J2) also helps: label-checking buyers include it in their searches.",
          "Photographing the lining is the single most impactful listing improvement for Harringtons. Most sellers photograph only the exterior — a listing that shows both the exterior in good condition and an open shot of the clean tartan lining immediately differentiates from 70% of competing listings. EU Vinted buyers for Fred Perry jackets are knowledgeable; evidence of condition beats description of it.",
          `Price near the bottom of the current market range for the first 48 hours. A Harrington listed at €32 on a well-lit listing typically departs within 3–5 days; the same piece at €45 (the upper end) may sit for 2–3 weeks. The EU Vinted market for Fred Perry jackets moves at 22 departures per week — there are buyers, but not at unlimited price points. Starting at a competitive price and holding it is more effective than starting high and reducing. [Check live Fred Perry jacket prices →](${ilinkHref("flip")})`,
        ],
        cta: pricingBodyCta("ctr_fp_jacket_guide_listing_20260919"),
      },
    ],
    faq: [
      {
        q: "How much does a Fred Perry jacket sell for on EU Vinted?",
        a: "Fred Perry jackets averaged €37 per departure across EU Vinted in the week to 19 September 2026, based on 22 observed departures in France, Germany, Spain, Italy, and Portugal. Exit prices range from €20 for worn track tops to €35–55 for clean Harrington (J2) jackets in core colourways. Archive colourways and collaboration pieces (Raf Simons, Amy Winehouse Foundation) exit at €60–150 when correctly identified.",
      },
      {
        q: "What is the buy-below price for a Fred Perry jacket on EU Vinted?",
        a: "The buy-below ceiling for a Fred Perry jacket at the category level is €24.05 — 65% of the €37 departure average. For a Harrington J2 in good condition, sourcing below €15 (achievable at UK charity shops and French vide-greniers) produces clear margin even at the lower end of the exit range. Track tops require a lower sourcing ceiling (below €12) to maintain margin at their typical €20–30 exit range.",
      },
      {
        q: "Is the Fred Perry Harrington jacket worth reselling on EU Vinted?",
        a: "Yes — the Harrington (J2) is Fred Perry's most liquid jacket model and the piece buyers search for by name. Clean Harringtons in core colourways (navy, black, racing green) exit at €35–55 within 5–10 days. The buy-below ceiling of €24.05 is achievable at charity shops and flea markets. Per-unit margin on a Harrington is 3–4× higher than on a Fred Perry shirt — making it the most attractive per-item category in the Fred Perry range for EU Vinted resellers with limited sourcing frequency.",
      },
      {
        q: "How do Fred Perry jackets compare to Stone Island jackets on EU Vinted?",
        a: "Stone Island jackets track 40 watched departures per week at a €143 average — a much higher exit price than Fred Perry (22/7d at €37) at lower volume. Stone Island requires a higher sourcing budget (€40–70+) and more authentication knowledge per item. Fred Perry Harringtons offer lower entry cost and more accessible sourcing, making them suitable for resellers with smaller budgets. Both are legitimate jacket categories for EU Vinted resellers; the choice depends on available capital and sourcing access.",
      },
      {
        q: "What Fred Perry jacket models are most valuable on EU Vinted?",
        a: "The J2 Harrington jacket is the most valuable and most liquid Fred Perry jacket on EU Vinted — it is searched by name and exits consistently at or above the €37 category average. Collaboration Harringtons (Raf Simons, Amy Winehouse Foundation, Miles Kane) are the highest exit-price opportunity within the category (€60–150). Standard track tops exit at €20–35. Archive and limited-run colourways of any model command a 30–50% premium over standard colourways when correctly identified in the listing.",
      },
      {
        q: "How long does a Fred Perry jacket take to sell on EU Vinted?",
        a: "Clean Harrington jackets in M or L in core colourways (navy, black, racing green), priced at or near the €35–40 market floor, typically depart within 5–10 days on EU Vinted. Collaboration pieces with rare colourways that are correctly identified in the title sell within 3–7 days. Track tops in standard colourways take 7–14 days at €22–30. Overcoats and longer styles are slower — allow 2–4 weeks. Photographing the tartan lining significantly reduces time to departure for Harringtons.",
      },
    ],
  },
]
