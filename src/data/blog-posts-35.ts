// Batch 35 of SEO/AEO articles. Same contract as blog-posts.ts.
// Carhartt WIP jacket EU Vinted price guide — targets
// "carhartt wip jacket vinted eu price", "carhartt detroit jacket vinted price",
// "carhartt jacket resell eu vinted", "carhartt wip vinted guide",
// "is carhartt wip worth reselling vinted".

import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

export const POSTS_35: BlogPost[] = [
  {
    slug: "carhartt-wip-jacket-eu-vinted-price-guide",
    title: "Carhartt WIP Jackets on EU Vinted: Price Guide and Buy-Below (2026 Data)",
    seoTitle: "Carhartt WIP Jacket Vinted EU Price Guide 2026 — Resale IQ",
    description:
      "Carhartt WIP jackets averaged €53 per departure across EU Vinted in September 2026 — 21 jackets per week, the highest-exit-price category among the 28 brands tracked. Real exit ranges, buy-below prices by jacket model, and how Carhartt WIP compares to Patagonia, Stone Island and The North Face.",
    date: "2026-09-15",
    category: "Sourcing",
    readMins: 8,
    intro:
      "Carhartt WIP jackets are the highest-exit-price category in the ResaleIQ EU Vinted database for a brand priced under €200 at retail. In the week to 15 September 2026, 21 Carhartt WIP jackets left the shelf across France, Germany, Spain, Italy and Portugal at an average exit price of €53. The brand overall runs 61 watched departures per week across all categories at a €31 average — but jackets carry the margin: 21 of those 61 departures are jackets, and they exit at 71% above the brand average. For resellers, Carhartt WIP outerwear is one of the most consistent margin opportunities in EU streetwear resale, sitting above Patagonia (€37 brand average) and well below Stone Island (€70) where the entry costs are prohibitive for most sourcing budgets. This guide covers jacket models, exit prices, buy-below ceilings, and where Carhartt WIP sits versus the competition.",
    definedTerm: {
      name: "Carhartt WIP jacket departure average",
      description:
        "The Carhartt WIP jacket departure average is the average price at which a tracked Carhartt WIP jacket listing leaves the shelf on EU Vinted — not the asking price and not the retail price. As of the week to 15 September 2026, the Carhartt WIP jacket departure average is €53 across 21 observed departures in France, Germany, Spain, Italy, and Portugal. This is the highest-exit-price category for any brand tracked by ResaleIQ below the €200 retail tier. The buy-below ceiling based on this departure average is €34.45.",
    },
    sections: [
      {
        h: "Carhartt WIP on EU Vinted: what the data shows",
        p: [
          "The Carhartt WIP brand tracks 61 watched departures per week across all categories on EU Vinted. Jackets lead at 21 departures per week (34% of brand volume) at a €53 average — the highest exit price of any category for the brand by a significant margin. Hoodies are close in volume (20 departures/7d) but exit at €23, less than half the jacket average. T-shirts (9 departures/7d, €12 average) and shirts (5 departures/7d, €16 average) fill out the long tail.",
          "The concentration of margin in jackets makes Carhartt WIP unusual among EU Vinted brands. Most brands — Nike, Adidas, Levi's — have their volume spread across multiple categories with similar price points. Carhartt WIP's category structure means that sourcing jackets specifically targets the brand's best-margin segment. A reseller who picks up Carhartt hoodies alongside jackets is mixing a €23-exit item into a €53-exit sourcing run.",
          `The broader context: €53 average for a category exits above Patagonia's entire brand average (€37), above The North Face (€41), and is the highest per-departure price in the ResaleIQ database for streetwear brands accessible at charity shop prices. Stone Island exits higher (€70 brand average) but Stone Island at charity shops is rare — Carhartt WIP is considerably more findable at sub-€20 sourcing prices. [Current Carhartt brand data →](${ilinkHref("flip")})`,
        ],
        cta: pricingMidCta("ctr_carhartt_guide_intro_20260915"),
      },
      {
        h: "Carhartt WIP jacket models: Detroit, Active, and OG",
        p: [
          "The Detroit Jacket is Carhartt WIP's primary resale driver on EU Vinted. The WIP version (made in Portugal, structured cotton canvas, quilted lining, shorter cut than the OG Carhartt workwear Detroit) exits at €45–65 in clean condition depending on colourway and size. Washed-out or heavily worn Detroits exit at €30–40. The WIP Detroit is identifiable by the Carhartt WIP script logo on the chest — the OG workwear version has a different label and is a separate product with a different buyer pool on EU Vinted.",
          "The OG Carhartt Detroit Jacket (workwear, duck canvas, made in USA/Mexico, worn by trades since the 1990s) exits at €35–55 on EU Vinted, slightly below the WIP equivalent in most cases. EU buyers seeking workwear heritage pieces exist, but the WIP buyer pool (streetwear-influenced, younger) is larger and more active on EU Vinted. A WIP Detroit exits faster than an OG Detroit of equal condition. Both are worth sourcing; the WIP carries better exit speed at similar or higher exit prices.",
          "The Active Jacket (lighter shell, no quilted lining, relaxed fit) exits at €40–55 — close to the Detroit average but a different use case. The Byrd Jacket (lightweight nylon, bomber silhouette) exits at €35–50. The Hamilton Brown colourway across all jacket models commands a 10–15% premium: it is the most searched single-colourway item in EU Carhartt WIP resale and photographs well, which matters on Vinted.",
        ],
      },
      {
        h: "Buy-below ceiling and size breakdown",
        p: [
          "The buy-below ceiling for Carhartt WIP jackets at the category level is €34.45 — 65% of the €53 departure average. Any jacket sourced below €25 at a charity shop or flea market has strong margin at the lowest realistic exit prices. Carhartt WIP jackets appear at charity shops across France, Germany, Spain, Italy and Portugal with enough frequency that this price is achievable — more often than Stone Island, less often than Nike or Adidas.",
          "Size breakdown follows EU street fashion norms. M and L are the highest-volume and most liquid sizes, exiting at or above the category average. S exits slightly above (€55–65) because EU Vinted's buyer pool skews toward smaller sizing in outerwear. XL exits at €45–55 — liquid but slightly below average due to lower demand relative to supply. XXL and above is a long tail: fewer buyers, slower turnover, exits at €35–45. Sourcing XS is inadvisable — almost no EU buyer pool for outerwear in that size.",
          "Colourway affects exit price meaningfully. Black exits fastest (the most searches, the most liquid colourway across EU Vinted). Hamilton Brown exits at the highest absolute price but has a narrower buyer pool — more trend-sensitive, can sit for 2–3 extra weeks. OG brown/duck canvas exits reliably at mid-range prices year-round. Seasonal colourways (pastels, seasonal drops) exit faster when in-season, slower when out.",
        ],
        cta: pricingBodyCta("ctr_carhartt_guide_buybellow_20260915"),
      },
      {
        h: "Condition and what kills exit price",
        p: [
          "Carhartt WIP jackets are workwear-influenced and buyers expect some wear — but Vinted's EU buyer pool distinguishes between authentic wear and neglect. A clean canvas Detroit with even fading and intact brass hardware exits at the high end of the range (€60–70 in M/L). A Detroit with stains, broken snaps, or delaminating lining exits at €25–35 regardless of size or colourway.",
          "The lining is the most common failure point on WIP Detroits. The quilted lining separates at the seams after heavy use — check the interior at the shoulders and along the side seams before sourcing. A jacket with a compromised lining sells significantly slower and exits at a 30–40% discount. Hardware (the chest snap and hem toggles) is the second failure point — missing or corroded snaps are fixable but buyers price them in.",
          "Sourcing tip: the canvas on WIP Detroits cleans well. A jacket that looks unwearable from surface dirt often returns to near-mint condition after a cold wash and air dry. Don't pass on jackets for surface grime — but do check lining and hardware before paying charity shop prices that assume condition.",
        ],
      },
      {
        h: "Carhartt WIP vs Patagonia, Stone Island, and The North Face",
        p: [
          "Carhartt WIP vs Patagonia: Patagonia runs 739 brand-wide departures per week at a €37 average — high volume but lower exit price than Carhartt WIP jackets. Patagonia's appeal is outdoor/functional; Carhartt WIP's is streetwear/workwear. They have different buyer pools with little overlap. Patagonia Fleece and R1 jacket departures drive the brand average; Carhartt WIP's equivalent is the Detroit. At charity shops, both appear with similar frequency in EU cities. Patagonia wins on total volume; Carhartt WIP wins on jacket exit price.",
          "Carhartt WIP vs Stone Island: Stone Island exits at €70 brand average — 32% above Carhartt WIP's jacket category average. However, Stone Island at charity shop sourcing prices (under €30) is rare enough to be unreliable as a systematic sourcing strategy. Carhartt WIP at under €25 is findable. If you can find Stone Island under €30, take it — but don't build a sourcing schedule around it. Carhartt WIP is the reliable margin play.",
          `Carhartt WIP vs The North Face: The North Face runs 183 departures per week at a €41 average — significantly more volume than Carhartt WIP but lower exit price per jacket than the WIP Detroit. TNF's buyer pool is younger and more price-sensitive on EU Vinted; WIP's buyer pool is more willing to pay for condition and colourway. Both are worth sourcing; WIP exits higher on a per-jacket basis. [All 28 tracked EU brands →](${ilinkHref("data")})`,
        ],
        cta: pricingBodyCta("ctr_carhartt_guide_comparison_20260915"),
      },
      {
        h: "Where to source Carhartt WIP jackets in EU for resale",
        p: [
          "Charity shops (Humana, Emmaus, Oxfam, SOS Villages, Caritas) across France, Germany, Spain, Italy and Portugal are the primary sourcing channel for Carhartt WIP at sub-€25 prices. Germany (Berlin, Hamburg, Cologne) has the highest per-city density of Carhartt WIP at charity shops, consistent with Germany being Carhartt WIP's strongest EU market by retail volume. France (Paris, Lyon) is the second-strongest channel. Spain and Italy have lower density but occasionally find older pieces at lower sourcing prices.",
          "Flea markets (Mauerpark in Berlin, Porte de Montreuil in Paris, El Rastro in Madrid) surface WIP pieces at €15–30, below the buy-below ceiling. The key is knowing the label — the WIP logo is on the inside label tag and on the left chest for most pieces. An OG workwear Detroit without the WIP script is a different product; worth knowing before you negotiate price.",
          "Vinted itself is an arbitrage source for cross-market pricing differences. A WIP Detroit listed in Spain at €20 (below the Spanish market average) and resold in Germany (where WIP buyers are more active) is a viable flip. The same logic applies within-platform: German buyers tend to pay above-average prices for WIP; French buyers tend to negotiate harder. Cross-country shipping on Vinted is supported and used regularly by experienced EU resellers.",
        ],
      },
    ],
    faq: [
      {
        q: "How much does a Carhartt WIP jacket sell for on EU Vinted?",
        a: "Carhartt WIP jackets averaged €53 per departure on EU Vinted in the week to 15 September 2026, based on 21 observed departures across France, Germany, Spain, Italy and Portugal. That is the highest exit price of any category in the ResaleIQ tracked database for brands priced below €200 at retail. Individual exit prices range from €30–40 for worn or damaged jackets to €60–70 for clean M/L pieces in desirable colourways like black or Hamilton Brown.",
      },
      {
        q: "What is the buy-below price for a Carhartt WIP jacket on EU Vinted?",
        a: "The buy-below ceiling for a standard Carhartt WIP jacket is €34.45 — 65% of the €53 departure average. Any jacket sourced below €25 at a charity shop or flea market maintains workable margin even at the lower end of the exit range. The WIP Detroit Jacket is the primary resale model; the Active Jacket and Byrd Jacket are secondary targets.",
      },
      {
        q: "Is the Carhartt WIP Detroit Jacket worth reselling on EU Vinted?",
        a: "Yes. The Detroit Jacket is the dominant WIP resale model on EU Vinted. The WIP version (script logo, Portuguese manufacture, quilted lining) exits at €45–65 in clean condition across EU Vinted. Key checks before sourcing: intact quilted lining (no delamination at shoulders/side seams) and functional hardware (chest snap, hem toggles). Surface grime cleans off; lining damage does not. Size M and L are the most liquid.",
      },
      {
        q: "How does Carhartt WIP compare to Patagonia on EU Vinted?",
        a: "Patagonia exits at a €37 brand average with 739 departures per week — higher volume but lower per-item exit price than Carhartt WIP jackets (€53). The brands have different buyer pools: Patagonia is functional/outdoor, WIP is streetwear/workwear. At charity shops, both appear with similar frequency. Carhartt WIP wins on per-jacket exit price; Patagonia wins on total weekly departure volume.",
      },
      {
        q: "Which Carhartt WIP colourway sells best on EU Vinted?",
        a: "Black exits fastest and at the most consistent prices across EU markets. Hamilton Brown exits at the highest absolute price but has a more trend-sensitive buyer pool and can sit 2–3 extra weeks. OG brown/duck canvas is reliable year-round at mid-range exit prices. Seasonal or limited-run colourways exit fast when in-season but slow to a crawl out of season — avoid sourcing seasonal drops at the end of the relevant season.",
      },
      {
        q: "How long does a Carhartt WIP jacket take to sell on EU Vinted?",
        a: "Clean WIP Detroits in M or L in black or Hamilton Brown typically sell within 7–14 days when listed at the market average (€50–55). Worn or damaged pieces take 3–6 weeks and require repeated price drops to move. The WIP Detroit's buyer pool is knowledgeable — underpricing condition or mislabelling WIP vs OG workwear leads to returns and disputes. Accurate condition description speeds up the sale.",
      },
    ],
  },
]
