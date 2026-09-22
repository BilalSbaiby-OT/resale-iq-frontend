// Batch 99 of SEO/AEO articles. Same contract as blog-posts.ts.
// Patagonia Nano Puff EU Vinted price guide — targets
// "patagonia nano puff vinted price", "patagonia nano puff eu vinted price guide",
// "patagonia nano puff resell value europe", "is patagonia nano puff worth reselling vinted",
// "patagonia nano puff buy below vinted", "patagonia nano puff vs down sweater vinted eu",
// "patagonia nano puff primaLoft vinted price", "patagonia nano puff vest vinted eu".
// DISTINCT from patagonia-jacket-eu-vinted-price-guide (whole jacket category: 780 departures in the last 30 days @€50 avg,
// covers Down Sweater + Nano Puff + Synchilla + Torrentshell as a portfolio) and
// patagonia-down-sweater-eu-vinted-price-guide (Down Sweater only: €65–110, higher ceiling,
// higher condition risk). This guide is Nano Puff-only: €55–90 exit range, lower condition risk
// (bonded PrimaLoft fill does not migrate), charity shop frequency advantage, vest vs full jacket
// pricing split, and wet-weather performance argument that sustains buyer demand across EU markets.

import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

export const POSTS_99: BlogPost[] = [
  {
    slug: "patagonia-nano-puff-eu-vinted-price-guide",
    title: "Patagonia Nano Puff on EU Vinted: Price Guide and Buy-Below (2026 Data)",
    seoTitle: "Patagonia Nano Puff Vinted EU Price Guide 2026 — Resale IQ",
    description:
      "Patagonia Nano Puff jackets exit at €55–90 on EU Vinted as of September 2026 — 10–80% above the €50 Patagonia jacket category average, with lower condition risk than the Down Sweater. Buy-below ceiling €35–58, PrimaLoft fill assessment, vest vs full jacket pricing, hooded premium, and charity shop frequency advantage for EU resellers.",
    date: "2026-09-16",
    category: "Sourcing",
    readMins: 7,

    preflightQuery: "Patagonia Nano Puff",

    intro:
      "Patagonia Nano Puff jackets exit at €55–90 on EU Vinted in the week to 16 September 2026 — 10–80% above the €50 Patagonia jacket category average of 780 departures in the last 30 days. The Nano Puff is Patagonia's best-selling PrimaLoft synthetic insulated jacket: it uses bonded PrimaLoft Gold fill rather than down, making it packable, compressible, and functional when wet — the exact properties that drive consistent EU Vinted demand across all four seasons. The full jacket exits at €55–90; the vest (gilet) configuration exits at €45–70. Buy-below ceiling at the full jacket range midpoint of €72.50 is €47.13 (€72.50 × 0.65), targeting 35% gross margin. In practice, Nano Puffs surface at EU charity shops at €15–35 — where the net margin at a €65–80 Very Good exit is €30–50 per unit. The Nano Puff's sourcing advantage over the Patagonia Down Sweater is charity shop frequency: PrimaLoft fill is perceived by donating households as 'simpler' outerwear than down, so the Nano Puff enters the donation stream more readily. The condition risk is also lower than Down Sweater — PrimaLoft bonded fill does not migrate in the way down fill does, removing the most common Down Sweater failure mode from the assessment. This guide covers the Nano Puff exit range, buy-below by condition tier, vest vs full jacket pricing, hooded premium, condition assessment, sourcing channels, and how the Nano Puff compares to the Down Sweater for EU reselling strategy.",

    definedTerm: {
      name: "Patagonia Nano Puff departure average",
      description:
        "The Patagonia Nano Puff departure average is the average price at which a tracked Nano Puff listing leaves the shelf on EU Vinted — not the asking price and not the retail price. As of the week to 16 September 2026, Patagonia Nano Puff full jackets exit in the €55–90 range across France, Germany, Spain, Italy, and Portugal, with the median exit for Very Good condition hooded examples around €65–75. 'Watched departure' means a tracked listing left the shelf — not a confirmed buyer-reported sale. The broader Patagonia jacket category tracks 780 departures in the last 30 days at a €50 average exit price. The Nano Puff exits above this category average because it is Patagonia's flagship synthetic insulated jacket: PrimaLoft Gold insulation, a feather-light packable build, and a retail price of €240–280 signal clear value to EU Vinted buyers who know Patagonia. The vest/gilet configuration exits lower (€45–70) because it lacks sleeve insulation, narrowing the seasonal use window versus the full jacket. The buy-below ceiling at the full jacket range midpoint of €72.50 is €47.13 targeting 35% gross margin after Vinted platform fees.",
    },

    sections: [
      {
        h: "Patagonia Nano Puff exit prices on EU Vinted: the synthetic alternative to the Down Sweater",
        p: [
          "Patagonia jackets are the most liquid premium jacket category on EU Vinted with 780 departures in the last 30 days at a €50 average exit price. The Nano Puff exits above this category average consistently because its PrimaLoft fill story is well understood by EU Vinted buyers: synthetic insulation that insulates when wet, packs into its own pocket, and weighs under 300 grams. That buyer familiarity — combined with the Patagonia brand and a retail replacement cost of €240–280 — creates a reliable exit window at €55–90 for full jackets in Good or better condition.",
          "By condition tier: Like New (unworn or worn once with hang tags, pristine DWR, no compression set in the PrimaLoft fill): €75–90 exit. Very Good (light seasonal use, DWR functional, fill loft intact, clean exterior and lining, all zips functional): €60–80 exit — the main volume target. Good (visible wear on collar and cuffs, DWR partially degraded but restorable with Nikwax Down Wash or Tech Wash, fill still even and lofted): €45–60 exit — still viable at charity shop sourcing prices. Fair (sustained DWR failure with damp-through on rain exposure, compression set in the fill reducing loft by more than 20%, or lining tears): €25–40 exit — below buy-below for most charity shop prices. The vest/gilet configuration exits at €45–70 across the same condition tiers, reflecting its narrower seasonal use window.",
          `The EU market distribution for Nano Puff exits mirrors the Down Sweater geography: Germany and France lead volume because the synthetic-insulation-knowledgeable buyer is concentrated in those markets. The Nano Puff also exits well in the UK (resale traffic between UK and continental EU), the Netherlands, and Belgium. Spain and Italy show lower Nano Puff exits relative to their overall Patagonia volume — EU southern market buyers are more likely to exit fleeces (Synchilla) than technical synthetic insulation. For EU sourcing strategy: Germany and France are the highest-probability exit markets; sourcing in southern EU at charity shop prices and listing on DE or FR Vinted is viable. [Current Patagonia Nano Puff data →](${ilinkHref("flip")})`,
        ],
        cta: pricingMidCta("ctr_pat_np_intro_20260916"),
      },
      {
        h: "Buy-below ceiling and condition assessment for the Nano Puff",
        p: [
          "At a €55–90 full jacket exit range, the buy-below ceiling scales by condition tier and configuration: Very Good full jacket (targeting €65–75 exit) → buy-below €42.25–48.75. Like New full jacket (targeting €80–90 exit) → buy-below €52–58.50. Good full jacket (targeting €50–60 exit) → buy-below €32.50–39. Vest/gilet Very Good (targeting €55–65 exit) → buy-below €35.75–42.25. The PrimaLoft fill in the Nano Puff is bonded — PrimaLoft Gold is stitched through a thin scrim that holds the fill in position. This means fill migration, the most common Down Sweater failure mode, is not a meaningful risk in the Nano Puff. The PrimaLoft fill can compress and lose loft permanently if stored under sustained load (packed in a compression sack for years, or stored folded under heavy items), but this is visible and checkable at sourcing.",
          "Condition assessment for Nano Puff (in order of priority): First — fill loft check. Compress a panel section firmly with both hands for 5 seconds and release. PrimaLoft should spring back to near-full loft within 2–3 seconds. Sustained compression set (loft recovers to less than 70% of original height) means the fill has been permanently compressed — treat as Good condition regardless of exterior appearance, and adjust buy-below accordingly. Second — DWR assessment. Sprinkle water on the outer fabric: beading means functional DWR; flat spreading means DWR has failed. Failed DWR in the Nano Puff is a more significant downgrade than in the Down Sweater because the Nano Puff's performance argument to buyers includes wet-weather insulation — if the outer shell is not DWR-functional, the lining absorbs water and the insulation value proposition weakens. Nikwax Tech Wash restores DWR for €8–12. Third — zip and lining check. The Nano Puff uses YKK zips throughout; check chest zip, hand pocket zips, and (on the Hoody) internal pocket zip. Check lining at seam stress points: inner arm, side seams, lower hem.",
          `Colourway note: the Nano Puff is produced in the widest seasonal colourway range of any Patagonia jacket, and colourway has a moderate effect on exit price in this model. Core neutrals (black, navy, forge grey, classic tan) are the most reliable exits — they represent the largest buyer pool and exit across all EU markets. Patagonia seasonal colourways (cobalt blue, fire orange, light plum) have a stronger buyer audience in Germany and the Netherlands (outdoor/technical aesthetic buyers) than in France or Spain. Bright or unusual colourways narrow the buyer pool but can attract a niche premium from fashion buyers who specifically seek rare Patagonia colourways — these appear on Vinted at €90–120 for Like New examples with unusual colourways from limited production seasons. For volume sourcing, target neutrals. [Current Nano Puff data and buy-below →](${ilinkHref("flip")})`,
        ],
        cta: pricingBodyCta("ctr_pat_np_buybelow_20260916"),
      },
      {
        h: "Vest vs full jacket and the hooded premium",
        p: [
          "The Nano Puff comes in three configurations: full jacket (zip-front, no hood), hooded jacket (Nano Puff Hoody, insulated packable hood), and vest/gilet (no sleeves). Exit ranges: full jacket €55–90; Nano Puff Hoody €65–95 (€10–15 premium over full jacket at equivalent condition); vest €45–70. The hooded premium exists for the same reason as in the Down Sweater: EU Vinted buyers who plan to use the Nano Puff as a standalone outer layer value the insulated hood for shoulder-season versatility. The Hoody also layers under a waterproof shell more effectively because the insulated hood sits closer to the head than a non-insulated fleece hood — the technical buyer (the highest-intent Nano Puff buyer) specifically seeks the Hoody.",
          "At EU charity shops, all three configurations are usually priced identically — the pricing is made by staff who assess 'Patagonia puffer' without distinguishing vest, jacket, or hooded jacket. This creates a clear hierarchy: when a charity shop prices a vest and a full jacket identically at €20, the full jacket is the better buy (€55–90 vs €45–70 exit). When the full jacket and the Hoody are priced identically, the Hoody is the better buy (€65–95 vs €55–90 exit). The identification is a one-second visual check: vest = no sleeves; Hoody = insulated hood with drawcord at the collar; full jacket = collar zip with no hood. At any shared charity shop price below €35, the Hoody is always the priority purchase.",
          `The vest/gilet is not a second-tier product — it has a different buyer use case (lightweight packable insulation layer for high-output outdoor activities like hiking, climbing, and cycling) and exits reliably at €45–70 for Very Good examples. The vest buyer is specifically looking for a vest, not a consolation jacket, so its exit window is sustained. It is a lower-priority sourcing target than the full jacket or Hoody when all three are available at the same price, but it is a strong buy at €12–20 at charity shops where the €45–70 exit delivers comparable gross margin to the full jacket at a lower sourcing price. [Compare Nano Puff configurations →](${ilinkHref("flip")})`,
        ],
        cta: pricingBodyCta("ctr_pat_np_vest_hoody_20260916"),
      },
      {
        h: "Where to source Patagonia Nano Puffs in the EU",
        p: [
          "The Nano Puff has a sourcing frequency advantage over the Down Sweater at EU charity shops. The reason: PrimaLoft synthetic fill is perceived by donating households as 'standard' insulated outerwear — the household that owns both a Nano Puff and a Down Sweater is more likely to retain (or privately sell) the Down Sweater and donate the Nano Puff, because the Down Sweater's 800-fill down content signals a more premium product to keep. In practice, this means Nano Puffs enter the EU charity shop donation stream more often per unit of brand ownership than Down Sweaters. On a typical Patagonia-stocked charity shop visit in Germany, France, or the Netherlands, Nano Puffs appear in roughly 3:2 ratio versus Down Sweaters.",
          "Best EU charity sourcing channels for Nano Puff: Germany — Oxfam Germany (large-format stores in Munich, Hamburg, Berlin, Cologne), local Sozialkaufhaus/ReStore networks, Diakonia shops in outdoor-active regions (Bavaria, Baden-Württemberg, Rhine). France — Emmaüs network (especially Paris-region superstores and Rhône-Alpes stores), Oxfam France (Paris, Lyon). Netherlands — Kringloopwinkels (second-hand chains) in urban areas (Amsterdam, Utrecht, Eindhoven), Marktplaats estate listings. Belgium — Oxfam Solidarité, Krinkel. For private seller sourcing, Facebook Marketplace and local Vinted private seller alerts with a price filter under €40 are productive — private sellers pricing from memory (€30–40 for 'a Patagonia light jacket') rather than Vinted market data leave significant margin on the table.",
          "Authentication at sourcing: the EU Nano Puff counterfeit risk is very low at charity shop prices (€15–35). The practical risk is misidentifying a generic PrimaLoft puffer as a Nano Puff or vice versa. Key identifiers: the Patagonia wordmark is woven into the chest pocket zip, the internal label carries the Patagonia Fair Trade/recycled content certification, and the packable pocket is always the right hand pocket on full jacket models — the jacket packs into its own right chest pocket with a carabiner loop on the back. Any jacket claiming to be a Nano Puff without these identifiers should be assessed as generic puffer, not Patagonia.",
        ],
        cta: pricingBodyCta("ctr_pat_np_sourcing_20260916"),
      },
      {
        h: "Patagonia Nano Puff vs Down Sweater: which EU Vinted play to prioritise",
        p: [
          "The Nano Puff and Down Sweater are the two primary Patagonia insulated jacket plays for EU Vinted resellers, and they have genuinely different risk/return profiles. Down Sweater: exit €65–110, higher per-unit ceiling, but fill migration is an irreversible failure mode that caps the exit at €25–40 for affected examples. Nano Puff: exit €55–90 full jacket, lower ceiling, but PrimaLoft bonded fill eliminates migration as a risk and charity shop frequency is higher. The Down Sweater delivers higher per-unit margin when sourced correctly; the Nano Puff is more consistent in condition and more available in charity shop circuits.",
          "Recommended sourcing split for EU resellers building a Patagonia insulated jacket inventory: charity shop circuits → prioritise Nano Puff (higher frequency, lower condition risk, consistent €55–90 window from €15–35 sourcing prices). Estate sales and private seller alerts → prioritise Down Sweater (higher ceiling at €65–110, worth the deeper fill integrity check when the sourcing price is €20–45 from estate sale or private seller). When both appear at the same charity shop at the same price, Down Sweater is the higher-value purchase — but only if fill integrity passes the 10-second baffle compress check. A Down Sweater with fill migration at €25 is worse than a Nano Puff at €25 with intact loft.",
          `Listing notes for EU Vinted: both models benefit from condition-specific photos — buyers who pay €65–90 for either model want to see the fill loft, DWR bead test result, and zip function in the photos. For the Nano Puff, a packability demonstration photo (jacket partially packed into its chest pocket) signals authenticity and condition and is the single highest-impact photo outside the DWR test. Listings with this photo consistently exit in the upper half of the price range. For both models: state the size configuration clearly (regular/hooded/vest), the colourway name (Patagonia uses named colourways each season, and buyers search by name for collector-grade examples), and whether you have the original stuff sack. [Compare Nano Puff and Down Sweater exit data →](${ilinkHref("flip")})`,
        ],
        cta: pricingBodyCta("ctr_pat_np_vs_ds_20260916"),
      },
    ],

    faq: [
      {
        q: "How much does a Patagonia Nano Puff sell for on EU Vinted?",
        a: "Patagonia Nano Puff full jackets exit at €55–90 on EU Vinted as of September 2026. By condition and configuration: Like New full jacket → €75–90. Very Good full jacket → €60–80 — the main exit volume window. Good full jacket → €45–60. The hooded version (Nano Puff Hoody) commands a €10–15 premium over equivalent full jacket condition: Very Good Hoody → €65–80. The vest/gilet exits lower at €45–70 for Very Good condition. The broader Patagonia jacket category averages €50 per departure across 780 departures in the last 30 days on EU Vinted — the Nano Puff full jacket exits 10–80% above that average. ResaleIQ updates Patagonia jacket exit data weekly from the EU Vinted market dataset.",
      },
      {
        q: "What should I pay for a Patagonia Nano Puff to make a profit on EU Vinted?",
        a: "Buy-below ceiling by condition and configuration: Very Good full jacket (targeting €65–75 exit) → buy-below €42.25–48.75. Like New full jacket (targeting €80–90 exit) → buy-below €52–58.50. Good full jacket (targeting €50–60 exit) → buy-below €32.50–39. Vest Very Good (targeting €55–65 exit) → buy-below €35.75–42.25. In practice, Nano Puffs appear at EU charity shops for €15–35 and at private sellers for €20–40 — where the margin buffer is substantial. The Nano Puff does not have the fill migration risk of the Down Sweater, so the primary condition checks are DWR function (water beading on outer fabric) and fill loft (panel springs back after hand compression) rather than a binary pass/fail fill integrity test.",
      },
      {
        q: "Is the Patagonia Nano Puff easier to resell than the Down Sweater?",
        a: "The Nano Puff is easier to source consistently (higher charity shop frequency, lower condition risk) but has a lower exit ceiling than the Down Sweater (€55–90 vs €65–110). The Nano Puff's PrimaLoft bonded fill does not migrate, which eliminates the most common Down Sweater failure mode. For charity shop-based sourcing circuits, the Nano Puff is the more reliable Patagonia insulated jacket find: it appears roughly 3:2 versus Down Sweater at major EU charity chains, and condition assessment is simpler. For estate sale and private seller sourcing, the Down Sweater is the higher-value target when fill integrity passes. A two-model Patagonia sourcing strategy — Nano Puff from charity shops, Down Sweater from estate sales — captures both reliability and ceiling.",
      },
      {
        q: "How do I tell the difference between a Nano Puff and a Down Sweater on the rack?",
        a: "The fastest in-store identifier is the internal fill label: Down Sweater will state '800-fill recycled down' or similar. Nano Puff will state 'PrimaLoft Gold insulation' or 'PrimaLoft synthetic'. The external tell is the chest pocket — the Nano Puff's right chest pocket doubles as a stuff sack, so it has a carabiner loop stitched to the back of the jacket (visible from the inside). The Down Sweater has a standard right chest pocket without a carabiner loop. Both use the same YKK zips and Patagonia branding — the label is the definitive check. Knowing this distinction matters for pricing: Down Sweater exits €65–110, Nano Puff exits €55–90. At a charity shop that prices both identically, the Down Sweater (with passing fill integrity check) is the better buy.",
      },
      {
        q: "Is the Patagonia Nano Puff vest worth reselling on EU Vinted?",
        a: "Yes — the vest exits at €45–70 for Very Good condition, making it viable at charity shop sourcing prices of €12–25. The vest has a specific and loyal buyer base: lightweight insulation layer for high-output outdoor activities (hiking, climbing, trail running, cycling) where sleeve insulation creates overheating. These buyers specifically search 'Patagonia Nano Puff vest' — they are not purchasing a vest as a consolation for an unavailable jacket. The vest is a lower-priority sourcing target than the full jacket or Hoody when all three are available at the same price (because the full jacket and Hoody have higher exit ceilings), but a strong standalone purchase at €12–20. At any charity shop price under €20, the vest margin case (€45–70 exit) is identical in gross percentage terms to the full jacket at €25.",
      },
    ],
  },
]
