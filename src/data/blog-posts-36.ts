// Batch 36 of SEO/AEO articles. Same contract as blog-posts.ts.
// Fred Perry polo shirts EU Vinted price guide — targets
// "fred perry polo shirt vinted price", "fred perry M12 polo vinted",
// "fred perry polo vinted eu guide", "fred perry polo shirt resell value",
// "is fred perry polo worth reselling vinted".

import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

export const POSTS_36: BlogPost[] = [
  {
    slug: "fred-perry-polo-shirt-eu-vinted-price-guide",
    title: "Fred Perry Polo Shirts on EU Vinted: Price Guide and Buy-Below (2026 Data)",
    seoTitle: "Fred Perry Polo Shirt Vinted EU Price Guide 2026 — Resale IQ",
    description:
      "Fred Perry polo shirts averaged €14 per departure across EU Vinted in September 2026 — 547 shirts per week, the single highest-volume category of any brand tracked. Real exit ranges, buy-below prices by model (M12, M3, M2), and how the polo compares to Fred Perry hoodies (€22 avg) and jackets (€39 avg).",
    date: "2026-09-15",
    category: "Sourcing",
    readMins: 8,
    intro:
      "Fred Perry is the highest-departure brand on EU Vinted with 1,092 watched departures per week — and polo shirts alone account for 547 of those. In the week to 15 September 2026, 547 Fred Perry shirts left the shelf across France, Germany, Spain, Italy and Portugal at an average exit price of €14. That makes the Fred Perry polo the single highest-volume category of any tracked brand on EU Vinted, ahead of Stone Island shirts (high price, lower volume) and Nike sneakers (higher price, 203 total brand departures). The €14 average is modest — but for resellers buying at charity shop prices of €3–8, the margin per item stacks across volume. This guide breaks down exit prices by model, size, condition, and colourway — and where the buy-below ceiling sits for each tier.",
    definedTerm: {
      name: "Fred Perry polo shirt departure average",
      description:
        "The Fred Perry polo shirt departure average is the average price at which a tracked Fred Perry shirt listing leaves the shelf on EU Vinted — not the asking price and not the retail price. As of the week to 15 September 2026, the Fred Perry shirt departure average is €14 across 547 observed departures in France, Germany, Spain, Italy, and Portugal. This is the single highest-volume category in the ResaleIQ EU Vinted database. Individual exit prices range from €8–10 for faded or poorly photographed pieces to €30–50 for rare colourways or limited editions. The buy-below ceiling at the category level is €9.10.",
    },
    sections: [
      {
        h: "Fred Perry on EU Vinted: the #1 departure brand",
        p: [
          "Fred Perry ranks first by watched departures on EU Vinted with 1,092 per week across all categories — ahead of Stone Island (1,030), Patagonia (927), and Balenciaga (471). Shirts account for exactly half that volume: 547 of 1,092 departures are shirts (polo and tennis-collar variations). The brand's category split shows a clear pattern: shirts drive volume at a low average (€14), hoodies drive volume at a mid average (€22), and jackets carry the margin at the high end (€39, 123 departures/7d).",
          "For a reseller running a volume operation, Fred Perry shirts are the backbone — high turnover, accessible sourcing prices, predictable exit times. A reseller who builds a 20-item Fred Perry shirt rotation, sourcing at €3–7 at charity shops and exiting at €12–18, runs the play that makes the €14 average make sense as a business. The brand is not a premium-margin-per-item play; it is a velocity play.",
          `The key insight: Fred Perry's advantage on EU Vinted is not the exit price but the exit speed. Shirts from the M12 and M3 lines move in 3–7 days in-season. A faster-moving item at a lower margin often outperforms a high-margin item that takes 30–45 days to exit. [Current Fred Perry brand data →](${ilinkHref("flip")})`,
        ],
        cta: pricingMidCta("ctr_fredperry_guide_intro_20260915"),
      },
      {
        h: "Fred Perry polo models: M12, M3, M2 and what each sells for",
        p: [
          "The M12 polo is Fred Perry's core model and the dominant shirt on EU Vinted. It is the twin-tipped polo with the Fred Perry wreath embroidery on the chest — identifiable to any buyer, with no authentication ambiguity at charity shop prices. The M12 exits at €12–20 in good condition depending on colourway and size. Clean white, black, or navy M12s in M/L exit near the high end of that range (€16–20). Faded or washed-out pieces exit at €8–12. The model is ubiquitous — every market has them, buyers know exactly what they are buying.",
          "The M3 polo (cotton piqué, slim fit, twin tip) is Fred Perry's premium-positioned equivalent. The difference from the M12 is primarily fabric weight and cut — the M3 uses a heavier cotton piqué and runs slim, which makes it popular with EU buyers who know the range. M3 exits at €15–25 in clean condition, up to €35 for limited-edition or collaboration pieces (Fred Perry x Raf Simons, Fred Perry x Comme des Garçons). The collaboration pieces are identifiable by the label — they carry both house logos and command a significant premium over mainline M3s.",
          "The M2 polo (the classic cotton piqué, looser fit, older cut) exits at €10–16. It is slightly less sought-after than the M12 due to the looser silhouette — EU buyers trending toward fitted and slim cuts. The M2 is still a solid resale item; its lower exit ceiling means it only works at very low sourcing prices (sub-€5 charity shop).",
        ],
      },
      {
        h: "Buy-below ceiling and exit ranges by model",
        p: [
          "The buy-below ceiling for Fred Perry shirts at the category level is €9.10 — 65% of the €14 departure average. Any shirt sourced below €7 at a charity shop or car boot sale has strong margin at average exit prices. The Fred Perry polo is one of the most commonly found branded items at EU charity shops — France and Germany in particular have consistent supply at €3–8 sourcing prices.",
          "Model-specific buy-below ceilings differ meaningfully: M12 in good condition (buy below €9, targets €14–18 exit). M3 in clean condition (buy below €12, targets €18–25 exit). M3 collaboration pieces (buy below €20 if authenticated, targets €35–70 exit depending on the colourway and partner). M2 (buy below €5, targets €10–14 exit). Any shirt with heavy fading, pilling, or collar stretching: buy below €3 if at all — these take longer to exit and pull down realised averages.",
          "Colourway premium is real on Fred Perry. The standard twin-tip colourways (navy/white tip, black/white tip, white/navy tip) are the most liquid — every EU buyer recognises them. But the non-standard colourways — mustard, burgundy, sage green, seasonal collaboration colourways — can exit at €22–30 because they attract buyers looking for something other than the standard palette. If you see a clean M12 in an unusual colourway at charity shop prices, source it.",
        ],
        cta: pricingBodyCta("ctr_fredperry_guide_buybellow_20260915"),
      },
      {
        h: "Size and condition: what moves fastest on EU Vinted",
        p: [
          "Fred Perry shirts size differently from modern fashion — the brand uses UK sizing, which runs slim and small versus typical EU streetwear sizing. An M12 tagged 'M' (UK) often fits as a small-to-medium in EU sizing context. This creates a buyer advantage: EU Vinted buyers who understand Fred Perry's sizing consistently find clean pieces in 'L' or 'XL' that fit as standard EU M/L, at the price those sizes command (the same as M/L in standard sizing).",
          "By size: EU M (tagged M–38 in Fred Perry's own sizing) is the most liquid and exits fastest. EU L (tagged L–40) is second. XS and XXL are slower — fewer buyers, longer hold times. S exits well in France and Spain where buyers skew toward slimmer fits.",
          "Condition is the primary exit-price driver for a commodity item like the M12. The polo's piqué cotton shows wear clearly: pilling at the collar, fading at the chest logo, pulling at the sleeve hems. A spotless M12 in an unfashionable colourway (say, UK blue) exits faster at a better price than a faded M12 in the most searched colourway. Photograph the collar flat against a neutral surface — buyers check the collar condition before the colourway.",
        ],
      },
      {
        h: "Fred Perry hoodies vs shirts: where the margin actually sits",
        p: [
          "Fred Perry hoodies exit at €22 average on 186 departures per week — €8 more per exit than shirts, on 361 fewer weekly departures. For a reseller, hoodies are the higher-margin category, but they source less frequently and take longer to find at sourcing prices that maintain the margin. A Fred Perry hoodie at €12 charity shop price exits at €22 with good margin. A Fred Perry shirt at €5 exits at €14 with equivalent margin in percentage terms.",
          "Fred Perry jackets (track tops, tennis jackets, bomber variations) exit at €39 on 123 departures per week — the highest per-item average in the brand's category mix. These are the items that look like shirts to an untrained buyer at a charity shop: the Fred Perry track jacket at charity shop prices of €8–12 exits at €35–50 on EU Vinted. If you find a Fred Perry track jacket or twin-tipped bomber jacket at £8 in a UK charity shop, it is the highest-margin sourcing find in the brand's range.",
          "The practical sourcing strategy: shirts are the floor — find them, price them accurately, move them in volume. Hoodies and jackets are the ceiling — source them specifically when the colourway and condition are right. A Fred Perry shirt at €5 and a Fred Perry track jacket at €10 have the same sourcing cost input; the jacket exits at 3× the price.",
        ],
      },
      {
        h: "What kills exit price: the three failure modes",
        p: [
          "Collar damage is the primary exit killer on Fred Perry polos. The twin-tip collar is the design's most distinctive feature — and the first part to show wear. A stretched, pilled, or colour-faded collar reduces exit price by 30–40% regardless of shirt condition. Always check the collar tip seam and the collar underside (where sweat staining accumulates). A collar in perfect condition on a slightly faded shirt photographs better than a pristine shirt body with a worn collar.",
          "Photography on a flat surface against a white or neutral background consistently produces faster exits and better prices for Fred Perry shirts than hanger photography. The piqué cotton texture, the wreath embroidery detail, and the twin-tip colour contrast all read better flat than hanging. A shirt that sits for three weeks with hanger photos often exits in three days after a re-shoot flat. The cost of a re-shoot is zero; the margin recovery is €3–5 per item.",
          "Mislabelling the model is a consistent error that slows exits. Listing an M12 as 'Fred Perry polo' and a vintage M3 as 'Fred Perry polo' creates different buyer expectations for the same listing format. Buyers who know the range — and a significant proportion of EU Vinted Fred Perry buyers do — search for 'Fred Perry M12' and 'Fred Perry M3' specifically. Include the model number in the title and description. It takes 10 seconds and changes the search surface the listing appears on.",
        ],
      },
      {
        h: "How to use these numbers",
        p: [
          "The €14 departure average tells you the floor of what the market clears at for the category. Your actual exit price depends on model, condition, colourway, size, and photograph quality — all of which you control. The data tells you where the market is; the sourcing decision is whether you can get below the buy-below ceiling (€9.10 at the category level) with enough margin to justify the hold time.",
          "For Fred Perry specifically, the volume is large enough that consistent pricing accuracy matters more than finding the perfect piece. A reseller who prices 20 standard M12s accurately at €14–16 and turns them in 7 days outperforms a reseller who waits for the unusual colourway and prices it at €35 with a 30-day hold time. The departure data validates the volume play.",
          "Buy-below, sell-through rate per model, and momentum rankings for all 3 Fred Perry tracked models are behind the Starter plan — the numbers are what the average tells you the market accepts; the model-level buy-below is what tells you whether the specific item in your hand is a buy or a pass.",
        ],
      },
    ],
    faq: [
      {
        q: "What do Fred Perry polo shirts sell for on EU Vinted?",
        a: "Fred Perry shirts averaged €14 per departure across EU Vinted in the week to 15 September 2026, across 547 observed departures in France, Germany, Spain, Italy and Portugal. The M12 polo exits at €12–20 in good condition; the M3 exits at €15–25; M3 collaborations (Raf Simons, Comme des Garçons) exit at €35–70. Unusual colourways command a premium of €6–15 over standard twin-tip colourways.",
      },
      {
        q: "What is the buy-below price for Fred Perry polo shirts?",
        a: "The buy-below ceiling for Fred Perry shirts at the EU Vinted category level is €9.10, based on the €14 departure average and a 35% margin target after Vinted's seller fee and estimated shipping. M12 in good condition: buy below €9. M3 in clean condition: buy below €12. M3 collaboration pieces: buy below €20 if authenticated. M2 or faded/worn pieces: buy below €5.",
      },
      {
        q: "Is Fred Perry worth reselling on Vinted?",
        a: "Yes, for volume-based resellers. Fred Perry is the highest-departure brand on EU Vinted with 1,092 watched departures per week, and shirts alone account for 547 of those. The €14 average exit price is modest, but at charity shop sourcing prices of €3–8, the margin per item is consistent and the exit time is short (3–7 days in-season for clean M12 pieces). Hoodies (€22 avg) and jackets (€39 avg) carry better per-item margin for resellers who source selectively.",
      },
      {
        q: "Which Fred Perry shirt model sells best on EU Vinted?",
        a: "The M12 is the highest-volume model by departures — it is the most recognised and most commonly found at charity shop prices. The M3 commands a higher exit price (€15–25) and is worth sourcing specifically in clean condition. The M3 collaboration pieces (Raf Simons, Comme des Garçons) are the highest-exit items in the range when authenticated.",
      },
      {
        q: "What sizes of Fred Perry polo shirts sell fastest on EU Vinted?",
        a: "EU M (tagged M/38 in Fred Perry sizing) and EU L (tagged L/40) are the most liquid sizes and exit fastest. XS and XXL are slower. Fred Perry uses UK sizing which runs slim, so a Fred Perry 'L' fits as an EU M in practice — EU buyers who know the brand buy one size up from their usual EU size.",
      },
    ],
  },
]
