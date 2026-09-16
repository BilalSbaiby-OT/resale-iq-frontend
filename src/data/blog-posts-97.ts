// Batch 97 of SEO/AEO articles. Same contract as blog-posts.ts.
// Patagonia Down Sweater EU Vinted price guide — targets
// "patagonia down sweater vinted price", "patagonia down sweater eu vinted price guide",
// "patagonia down sweater resell value europe", "is patagonia down sweater worth reselling vinted",
// "patagonia down sweater buy below vinted", "patagonia down sweater vs nano puff vinted eu",
// "patagonia down sweater 800 fill vinted price", "patagonia down sweater hooded vinted eu".
// DISTINCT from patagonia-jacket-eu-vinted-price-guide (whole jacket category: 264/7d @€50 avg,
// covers Synchilla + Down Sweater + Nano Puff + R1 + Torrentshell as a portfolio) and
// patagonia-synchilla-eu-vinted-price-guide (Synchilla fleece only: high-volume, low per-unit).
// This guide is Down Sweater-only: €65–110 exit range (highest per-unit in Patagonia jackets),
// buy-below €42–72, 800-fill condition grading (fill integrity as binary gate), estate sale
// sourcing edge, hooded vs non-hooded premium, and vs Nano Puff for EU resellers.

import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

export const POSTS_97: BlogPost[] = [
  {
    slug: "patagonia-down-sweater-eu-vinted-price-guide",
    title: "Patagonia Down Sweater on EU Vinted: Price Guide and Buy-Below (2026 Data)",
    seoTitle: "Patagonia Down Sweater Vinted EU Price Guide 2026 — Resale IQ",
    description:
      "Patagonia Down Sweater jackets exit at €65–110 on EU Vinted as of September 2026 — the highest per-unit exit in the Patagonia jacket category, 30–120% above the brand average. Buy-below ceiling €42–72, fill integrity condition check, hooded vs non-hooded premium, estate sale sourcing edge, and Down Sweater vs Nano Puff for EU resellers.",
    date: "2026-09-16",
    category: "Sourcing",
    readMins: 7,

    preflightQuery: "Patagonia Down Sweater",

    intro:
      "Patagonia Down Sweaters exit at €65–110 on EU Vinted in the week to 16 September 2026 — the highest per-unit exit of any individual model in the Patagonia jacket category and 30–120% above the brand average of €50 per departure. Patagonia jackets overall track 264 watched departures per week across EU Vinted at a €50 average exit price — the largest jacket departure volume of any brand tracked on the platform. Within that, the Down Sweater is the single highest-margin individual transaction: a clean Down Sweater in Very Good condition exits at €70–90, a Like New example at €90–110, against an estate sale or private seller sourcing price of €20–45. The buy-below ceiling at the model's exit range midpoint of €82.50 is €53.63 (€82.50 × 0.65), targeting 35% gross margin after Vinted platform fees. In practice, Down Sweaters are available below €45 at estate clearances, private sellers, and outdoor enthusiast estate sales — where the €25–45 sourcing price puts the net margin at €25–50 per jacket. The condition gate is decisive: fill integrity is the single factor that separates a €90 exit from a €35 exit, and it can be assessed in 10 seconds at the sourcing point. This guide covers the Down Sweater exit range, buy-below by condition tier, the fill integrity check, hooded vs non-hooded pricing, the estate sale sourcing edge, and how the Down Sweater compares to the Nano Puff for EU reselling strategy.",

    definedTerm: {
      name: "Patagonia Down Sweater departure average",
      description:
        "The Patagonia Down Sweater departure average is the average price at which a tracked Patagonia Down Sweater listing leaves the shelf on EU Vinted — not the asking price and not the retail price. As of the week to 16 September 2026, Patagonia Down Sweater jackets exit in the €65–110 range across France, Germany, Spain, Italy, and Portugal, with the median exit for Very Good condition hooded examples around €75–85. 'Watched departure' means a tracked listing left the shelf — not a confirmed buyer-reported sale. The broader Patagonia jacket category tracks 264 watched departures per week at a €50 average exit price. The Down Sweater exits above this category average because it is Patagonia's flagship insulated jacket: 800-fill recycled down, DWR finish, and the distinctive baffle construction signal to EU Vinted buyers that the Down Sweater is a premium purchase with a known replacement cost of €280–350 at retail. The buy-below ceiling at the €82.50 range midpoint is €53.63, targeting 35% gross margin. Fill integrity — the absence of fill migration (uneven lumpiness in the baffles) — is the binary condition gate that separates the full exit price from a €30–40 distress price.",
    },

    sections: [
      {
        h: "Patagonia Down Sweater exit prices on EU Vinted: why it outperforms the jacket average",
        p: [
          "Patagonia jackets are the most liquid premium jacket category on EU Vinted with 264 watched departures per week at a €50 average exit price. Within that category, the Down Sweater exits materially above the average because it occupies a specific buyer search intent that the Synchilla (€35–55, the volume leader) and the broader jacket average do not. An EU Vinted buyer searching for a Patagonia Down Sweater is looking for Patagonia's primary insulated jacket — they know the retail price (€280–350), they understand what distinguishes Down Sweater fill quality from a generic puffer, and they are willing to pay €65–110 for a clean secondhand example because the value case is clear. That buyer specificity sustains the exit price and reduces the negotiation window compared to generic puffer jackets.",
          "By condition tier: Like New (unworn or worn once, original tags, pristine DWR finish, zero fill migration): €90–110 exit. Very Good (light seasonal use, fully functional DWR, even fill distribution, clean exterior and lining, functional zips and drawcord): €70–90 exit — this is the volume window and the main target condition tier. Good (visible wear on collar and cuffs, DWR partially degraded but refreshable with Nikwax Down Wash, even fill, functional closures): €50–65 exit, viable but narrower margin at the €42–72 buy-below range. Fair (fill migration present, broken hood drawcord, lining damage, or significant DWR failure not recoverable by wash): €25–40 exit — below buy-below for any reasonable sourcing price. Skip at charity shop prices if fill migration is present: this is irreversible without professional re-baffling.",
          `The EU market distribution for Patagonia Down Sweater exits: Germany and France lead volume because the Down Sweater buyer is disproportionately in the outdoor-literate 30–45 demographic that is active on Vinted DE and FR. The Down Sweater also exits in the Spanish and Italian markets, driven by urban buyers who wear technical outerwear as fashion rather than strictly outdoor use. A Down Sweater sourced in Spain or Italy sells just as readily in Germany — the Patagonia brand name carries cross-border on EU Vinted for premium models. [Current Patagonia Down Sweater data →](${ilinkHref("flip")})`,
        ],
        cta: pricingMidCta("ctr_pat_ds_intro_20260916"),
      },
      {
        h: "Buy-below ceiling and the fill integrity gate",
        p: [
          "At a €65–110 exit range, the buy-below ceiling for Patagonia Down Sweater scales by exit target: Very Good condition (€75–85 exit target) → buy-below €48.75–55.25. Like New (€90–110 exit target) → buy-below €58.50–71.50. Good condition (€55–65 exit target) → buy-below €35.75–42.25. The category-level formula (exit × 0.65) gives a useful ceiling, but the Down Sweater rewards condition-graded sourcing: a Like New example you can source at €40 is a 65%+ gross margin, not the baseline 35%.",
          "Fill integrity is the binary condition gate — it overrides every other assessment. Before checking anything else, compress each baffle section with both hands and release. Even fill: redistributes smoothly, returns to original loft. Migrated fill: stays clumped in one corner of the baffle, does not redistribute. A jacket with fill migration has a permanently distressed exit price (€25–40) regardless of exterior condition. The check takes 10 seconds per jacket and is decisive. Do not buy a Down Sweater with fill migration at any charity shop price — the margin does not work at €25–40 exit and the condition is irreversible.",
          "After fill integrity: DWR assessment. Sprinkle a few drops of water on the outer fabric. Beading means the DWR coating is functional; flat spreading means the DWR has failed. Failed DWR does not automatically fail the jacket — Patagonia sells Nikwax Down Wash Cleaner that restores DWR for €10–15 — but it does compress the buy-below by €5–10 because restoration is a step the buyer must take. Factor this into the condition tier: a Very Good jacket with failed DWR is more accurately a Good jacket for sourcing purposes. Final checks: YKK zips on both chest and side pockets (Patagonia uses YKK on virtually all models from 2010 onward), hood drawcord functional, lining clean with no tears at the interior seams.",
        ],
        cta: pricingBodyCta("ctr_pat_ds_buybelow_20260916"),
      },
      {
        h: "Hooded vs non-hooded: the premium that EU Vinted buyers pay",
        p: [
          "Patagonia produces the Down Sweater in two configurations: hooded (the Down Sweater Hoody, with an insulated, packable hood) and non-hooded (the Down Sweater, which has a zip collar but no hood). On EU Vinted, hooded examples command a consistent €10–20 premium over equivalent non-hooded examples in the same condition tier. Hooded Very Good exits at €80–95; non-hooded Very Good exits at €65–80. The premium exists because EU buyers who purchase a Down Sweater as a standalone outer layer in shoulder-season conditions value the insulated hood for versatility — the hooded version transitions from standalone jacket to insulating layer under a hardshell without the hood creating a bump under a rain jacket's hood.",
          "At EU charity shops, hooded and non-hooded are often priced identically — this is the sourcing opportunity. Both configurations carry the same Patagonia label and the same generic secondhand price at charities. Identifying hooded vs non-hooded takes one look at the collar area: the Hoody has an insulated, packable hood with an adjustable drawcord; the non-hooded has a zip-front collar with no hood attachment. When both are priced identically at €15–25 and the margin case works for non-hooded at that price, it works more strongly for the hooded version at the €80–95 exit. The Hoody is the version to prioritise at any shared price point.",
          `Colourway carries a modest premium in the Down Sweater category, unlike Synchilla fleeces where colourway significantly affects exit price. For Down Sweater: navy, forest green, and black are the most reliable exits — neutral colourways with the strongest EU demand. Orange and coral are second tier, popular with the outdoor/technical buyer segment but narrower buyer pool. Unusual or seasonal colourways (bright yellow, light pink) carry the lowest demand but also the lowest sourcing competition. For a general EU reselling strategy, targeting neutral colourways is lower-risk. [Current Down Sweater data and buy-below →](${ilinkHref("flip")})`,
        ],
        cta: pricingBodyCta("ctr_pat_ds_hooded_20260916"),
      },
      {
        h: "Where to source Patagonia Down Sweaters in the EU",
        p: [
          "The Down Sweater is the model least likely to appear in charity shop rotation at sourcing prices. The reason: households that own a Down Sweater often know its value, or have a family member who does. The €280–350 retail price anchors the decision to donate: many Down Sweater holders sell privately (Facebook Marketplace, Vinted, local resale groups) before donating to charity. This makes charity shops a lower-probability sourcing channel for Down Sweater than for Synchilla fleeces (which are perceived as 'just a fleece') or Patagonia bags. The sourcing edge for Down Sweater is estate sales and estate clearances — where a deceased or relocating outdoor enthusiast's collection enters the market without retail-price knowledge.",
          "EU estate sale sourcing for Patagonia Down Sweater: France (brocantes and vide-greniers, especially in alpine and outdoor-activity corridors — Rhône-Alpes, Alsace, Brittany), Germany (Flohmarkt circuits in southern Bavaria and Baden-Württemberg — the outdoor-activity regions where Patagonia customers concentrated), and the Netherlands (Marktplaats estate listings from outdoor-active households). Spanish and Italian estate sales less frequently surface Down Sweater because the outdoor-technical buyer base is smaller in those markets, but they do appear. Private seller platforms (Facebook Marketplace, Marketplace.de, Vide Dressing FR) are the complement channel: search 'Patagonia Down Sweater' with a price filter under €45 and save the search for alerts. Private sellers often price at perceived secondhand value rather than actual market exit, and the Down Sweater appears under €40 regularly from sellers who priced it without checking Vinted.",
          "Charity shop exception: major EU city charity networks (Emmaüs in France, Oxfam in Belgium and the Netherlands, SOS Villages d'Enfants France) receive estate donations from urban-outdoor buyer households and do surface Down Sweaters at €20–35. These are less predictable than estate sales but worth including in any Patagonia jacket sourcing circuit. When a Down Sweater appears at a charity shop under €35 in Very Good condition, the fill integrity check is the only evaluation step before buying.",
        ],
        cta: pricingBodyCta("ctr_pat_ds_sourcing_20260916"),
      },
      {
        h: "Patagonia Down Sweater vs Nano Puff: which EU Vinted reselling play is better",
        p: [
          "Down Sweater (800-fill down) vs Nano Puff (PrimaLoft synthetic fill) is the primary sourcing decision for EU Vinted resellers targeting Patagonia insulated jackets. Both exit above the €50 jacket category average; the comparison is in sourcing frequency, condition risk, and per-unit margin ceiling. Down Sweater exit: €65–110. Nano Puff exit: €55–90. Down Sweater has the higher exit ceiling but also the higher condition risk (fill migration is irreversible; fill migration in the Nano Puff is less common because PrimaLoft is bonded-fill synthetic). The Down Sweater has higher potential margin; the Nano Puff has lower condition risk.",
          "Sourcing frequency: the Nano Puff appears in charity shop rotation slightly more often than the Down Sweater, because its synthetic fill is perceived as 'simpler' outerwear by households who don't differentiate down from synthetic — it more readily enters the donation stream. The Down Sweater is more often retained or sold privately. Estate sales surface both at similar rates from outdoor-enthusiast households. For a sourcing strategy: the Nano Puff is the reliable charity shop find; the Down Sweater is the estate sale priority.",
          `Authentication note: counterfeiting is not a meaningful risk for either model at EU charity shop sourcing prices (€20–45). The risk for Down Sweater is specifically fill integrity — a mis-graded Down Sweater sold as Very Good with migration found by the EU Vinted buyer is a return dispute. Always check fill integrity before buying, not after. The Patagonia lifetime guarantee (Patagonia repairs jackets, including re-down with fill migration repair) is a value-add you can mention in your EU Vinted listing: it increases buyer confidence in a condition-distressed jacket and can sustain a €10–15 premium over comparable non-Patagonia down jackets at the same condition grade. [Compare Down Sweater and Nano Puff exit data →](${ilinkHref("flip")})`,
        ],
        cta: pricingBodyCta("ctr_pat_ds_vs_nano_20260916"),
      },
    ],

    faq: [
      {
        q: "How much does a Patagonia Down Sweater sell for on EU Vinted?",
        a: "Patagonia Down Sweater jackets exit at €65–110 on EU Vinted as of September 2026, depending on condition and configuration. By condition: Like New (original tags, pristine DWR, zero fill migration) → €90–110. Very Good (light use, even fill distribution, functional closures and DWR) → €70–90 — the volume exit window. Good (visible wear, DWR partially degraded, fill even) → €50–65. Fair (fill migration present, lining damage, or broken drawcord) → €25–40. The hooded configuration (Down Sweater Hoody) commands a €10–20 premium over the non-hooded at equivalent condition. The broader Patagonia jacket category averages €50 per departure across 264 watched departures per week on EU Vinted — the Down Sweater exits 30–120% above that category average. ResaleIQ updates Patagonia jacket exit data weekly from the EU Vinted market dataset.",
      },
      {
        q: "What should I pay for a Patagonia Down Sweater to make a profit on EU Vinted?",
        a: "The buy-below ceiling scales with condition tier: Very Good (targeting €75–85 exit) → buy-below €48.75–55.25. Like New (targeting €90–110 exit) → buy-below €58.50–71.50. Good (targeting €55–65 exit) → buy-below €35.75–42.25. In practice, profitable sourcing is at estate clearances and private sellers in the €20–45 range, where the margin buffer is substantial. The hard rule: do not buy any Down Sweater with fill migration (baffle fill that clumps and doesn't redistribute when compressed and released) — the exit price with migration is €25–40, which means no margin at most sourcing prices. Fill integrity is the first and decisive check. The hooded configuration adds a sourcing premium you can allocate: if you would pay €35 for a non-hooded, pay up to €45 for the hooded equivalent.",
      },
      {
        q: "How do I check the fill integrity of a Patagonia Down Sweater?",
        a: "Compress each baffle section firmly with both hands and release. Even fill redistributes smoothly to its original loft. Migrated fill stays clumped in one corner of the baffle and does not redistribute. The check takes 10 seconds per baffle panel — check the chest, shoulders, back, and arms. If any baffle fails, the jacket has fill migration, which is irreversible without professional re-baffling. Do not buy a Down Sweater with fill migration at any charity shop price — the distressed exit price of €25–40 makes the trade unviable at standard sourcing prices. After fill integrity: check DWR (water beads on the outer fabric vs spreads flat), YKK zip function, hood drawcord function (hooded version), and lining cleanliness. Fill integrity takes priority over all other assessments.",
      },
      {
        q: "Is the Patagonia Down Sweater worth reselling on EU Vinted?",
        a: "Yes — it is the highest per-unit exit of any individual model in the Patagonia jacket category (€65–110 vs the €50 jacket category average). The margin case is strong when sourced from estate clearances and private sellers at €20–45: net margin of €25–50 per jacket on a verified Very Good example is achievable. The sourcing challenge is that Down Sweater holders often know the jacket's value and sell privately rather than donating to charity — so estate sales and private seller alerts are more productive sourcing channels than charity shop circuits for this specific model. The Synchilla fleece is the high-volume, low-friction Patagonia jacket for charity shop sourcing; the Down Sweater is the high-margin, selective-sourcing model for estate sales. Both are viable in a Patagonia jacket reselling strategy; the Down Sweater requires more specific sourcing discipline in exchange for higher per-unit returns.",
      },
      {
        q: "How does the Patagonia Down Sweater compare to the Nano Puff for EU reselling?",
        a: "Down Sweater exit: €65–110. Nano Puff exit: €55–90. Down Sweater has the higher exit ceiling and higher per-unit margin but higher condition risk (fill migration is the irreversible failure mode; less common in Nano Puff's PrimaLoft synthetic fill). Nano Puff appears in charity shop rotation slightly more often because synthetic fill is perceived as 'simpler' outerwear by donating households — it enters the charity stream more readily than the Down Sweater. Estate sales surface both at similar rates from outdoor-enthusiast households. Recommended sourcing strategy: target Nano Puff in charity shop circuits (authentication is simple, condition risk is lower, buy-below €35.75–58.50), and prioritise Down Sweater at estate sales and private seller alerts where the sourcing price is more negotiable and the €65–110 exit ceiling applies. Both sit above the Patagonia jacket category average of €50 and deliver clear margin over charity shop sourcing prices.",
      },
    ],
  },
]
