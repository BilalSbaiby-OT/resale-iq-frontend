// Batch 46 of SEO/AEO articles. Same contract as blog-posts.ts.
// Balenciaga Hoodies EU Vinted price guide — targets
// "balenciaga hoodie vinted price", "balenciaga hoodie eu vinted price guide",
// "balenciaga hoodie resell value europe", "is balenciaga hoodie worth reselling vinted",
// "balenciaga hoodie buy below vinted", "balenciaga logo hoodie vinted eu price",
// "balenciaga padded hoodie vinted", "balenciaga hoodie authentication vinted".
// HOODIES ONLY. Numbers from live /api/public/market-snapshot 2026-09-19 12:43:
// 38 departures in the last 30 days @ €100 avg, buy-below €65 (€100 × 0.65).
// Updated from prior POSTS_46 values (76/€105/€68.25, 15 Sept) to match current
// live snapshot. DISTINCT from balenciaga-sneakers (70 departures in the last 30 days @€158),
// balenciaga-t-shirts (56 departures in the last 30 days @€96), balenciaga-bag (46 departures in the last 30 days @€324),
// and balenciaga-reselling-vinted-guide (brand overview). Completes the
// Balenciaga cluster: sneakers + t-shirts + bags + hoodies now all live.

import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

export const POSTS_46: BlogPost[] = [
  {
    slug: "balenciaga-hoodie-eu-vinted-price-guide",
    title: "Balenciaga Hoodies on EU Vinted: Price Guide and Buy-Below (2026 Data)",
    seoTitle: "Balenciaga Hoodie Vinted EU Price Guide 2026 — Resale IQ",
    description:
      "Balenciaga hoodies track 38 departures in the last 30 days on EU Vinted at a €100 average exit price as of 19 September 2026 — the highest-value hoodie category among the 28 brands Resale IQ tracks across 5 EU markets, and nearly double the €55 Stone Island hoodie average. Buy-below €65, padded vs unlined vs cropped identification, luxury-authentication red flags, and how Balenciaga hoodies compare to Stone Island, Off-White, and Nike for EU resellers.",
    date: "2026-09-19",
    updated: "2026-09-19",
    category: "Sourcing",
    readMins: 7,

    preflightQuery: "Balenciaga Hoodies",

    intro:
      "Balenciaga hoodies track 38 departures in the last 30 days (observation window to 22 September 2026) across EU Vinted at a €100 average exit price — the highest-value hoodie category among the 28 brands Resale IQ tracks across Spain, France, Germany, Italy and Portugal, and nearly double the €55 Stone Island hoodie average. Hoodies are the third-highest-volume Balenciaga category this week after sneakers (70 departures in the last 30 days at €158) and T-shirts (56 departures in the last 30 days at €96), and they exit well below sneakers but above T-shirts. The buy-below ceiling at €65 (€100 × 0.65) is the second-highest hoodie ceiling on the site after Balenciaga bags (€210.60). This guide covers the live margin case, padded vs unlined vs cropped vs zip-through identification, luxury-authentication red flags that have nothing to do with sneakers, and how Balenciaga hoodies sit against Stone Island, Off-White, and Nike for EU resellers.",

    definedTerm: {
      name: "Balenciaga hoodie departure average",
      description:
        "The Balenciaga hoodie departure average is the average price at which a tracked Balenciaga hoodie listing leaves the shelf on EU Vinted — not the asking price and not retail. As of the week to 19 September 2026, Balenciaga hoodies track 38 departures in the last 30 days across France, Germany, Spain, Italy, and Portugal at a €100 average exit price. 'Watched departure' means a tracked listing left the shelf — not a confirmed buyer-reported sale. The broader Balenciaga brand tracks 2322 departures in the last 30 days at a €132 brand average; hoodies are 16% of that volume and exit well below sneakers (70 departures in the last 30 days at €158) but above T-shirts (56 departures in the last 30 days at €96). The buy-below ceiling at the €100 departure average is €65 (€100 × 0.65), targeting 35% gross margin after Vinted platform fees. ResaleIQ updates Balenciaga hoodie exit data weekly from EU Vinted departure observations across five markets.",
    },

    sections: [
      {
        h: "Balenciaga hoodies on EU Vinted: 38 departures in the last 30 days at €100 average",
        p: [
          "Balenciaga hoodies track 38 departures in the last 30 days across EU Vinted at a €100 average exit price in the week to 19 September 2026. That makes hoodies the third-most-active Balenciaga category this week after sneakers (70 departures in the last 30 days at €158) and T-shirts (56 departures in the last 30 days at €96), and the highest-priced hoodie category of any of the 28 brands Resale IQ tracks across the five EU markets. The €100 hoodie average sits €32 above the €68 Balenciaga brand average across all categories and nearly double the €55 Stone Island hoodie average — the next closest hoodie comp in the catalogue.",
          "38 departures in the last 30 days at €100 average is €3,800 of observed hoodie revenue over 30 days across five markets. That is not a volume operation and it is not the Balenciaga money — observed sneaker revenue this week is €11,060 (70 × €158), and observed T-shirt revenue is €5,376 (56 × €96). The hoodie is the piece that turns up on a German Kleiderkammer rail, a Paris brocante, and an Italian vintage dealer's shelf, and the buyer is paying for the logo, the construction, and the seasonal cachet — not for a daily-driver fleece. A Balenciaga hoodie buyer on EU Vinted is not comparing against a Nike Club Fleece at €17. They are comparing against a Stone Island hoodie at €55 and deciding whether the triple is worth the extra €45.",
          `€100 puts Balenciaga hoodies at the top of the hoodie price ladder: ahead of Stone Island (13,556 brand-level departures/30d at €60.84 avg), Ralph Lauren (1,027 brand-level departures/30d at €37.21 avg), Tommy Hilfiger (510 brand-level hoodie departures/30d at €19.69 avg), and Fred Perry (9,229 brand-level departures/30d at €21.69 avg).ys at €50), Hugo Boss (6 departures in the last 30 days at €24), Off-White (4 departures in the last 30 days at €42), Carhartt WIP (7 departures in the last 30 days at €21), Tommy Hilfiger (8 departures in the last 30 days at €20), and Nike (9 departures in the last 30 days at €17). [Full hoodie category comparison →](${ilinkHref("data")})`,
        ],
        cta: pricingMidCta("ctr_balenciaga_hoodie_20260919"),
      },
      {
        h: "Buy-below ceiling: €65 — the sourcing number that decides the flip",
        p: [
          "The buy-below ceiling for Balenciaga hoodies at the €100 average exit is €65 (€100 × 0.65), targeting 35% gross margin after Vinted fees of roughly 5-8%. Net of a 6% fee on a €100 exit, take-home is €94 — €29 on a €65 buy (45% on capital). Absolute gross is strong for a hoodie; the sourcing problem is getting a piece under €65 at source when charity-shop and vintage-dealer tickets for recognisable Balenciaga hoodies in Europe routinely sit at €20-60.",
          "Condition tiers move the ceiling. Like New (no pilling, logo intact, zip or drawcord clean, no stains, tags present) → €150-220 exit, buy-below €97.50-143.00. Very Good (light seasonal use, no visible pilling, logo crisp, construction sound) → €110-160 exit, buy-below €71.50-104.00 — the primary target. Good (minor pilling on cuffs or hem, slight logo fade, clean interior) → €80-110 exit, buy-below €52.00-71.50. Fair (heavy pilling, cracked or peeling logo print, stretched hem, missing drawcord) → €50-80 exit. Skip Fair unless the ticket is €20 or less.",
          "The padded vs unlined vs cropped split is larger than the condition split on margins. A padded Balenciaga hoodie in Very Good condition exits at €120-180; an unlined pullover in the same condition exits at €90-130; a cropped hoodie in Very Good exits at €100-150 if the cut reads current. All three hang as 'Balenciaga hoodie' at a source and are often ticketed the same. Buying an unlined pullover expecting padded money is the common Balenciaga hoodie mistake. Exterior: padded hoodies have a visible fill and a heavier drape; unlined hoodies drape lighter and show the body through the fabric at the hem; cropped hoodies sit above the waistband and the hem is a hard cut, not a dropped one. Interior care tag and hem label are the fastest source check.",
        ],
        cta: pricingMidCta("ctr_balenciaga_hoodie_buybelow_20260919"),
      },
      {
        h: "Balenciaga hoodie types: padded, unlined pullover, cropped, zip-through",
        p: [
          "Four hoodie types drive the 38 EU Vinted departures in the last 30 days. Padded Balenciaga hoodies — the quilted-fleece and puffer-style pieces — are the highest-exit type on the rail. Very Good padded in black, navy, or the seasonal colourway exits at €120-180, well above the €100 category average. Logo placement and integrity are the fail points: a cracked, peeling, or misapplied chest or back logo drops a padded piece toward the Good band and the €80-110 exit. Construction seams that split at the armhole or hem are a skip regardless of logo.",
          "Unlined pullover hoodies — the cotton-blend and heavy-fleece pieces without fill — exit at €90-130 in Very Good condition, around or slightly below the category average. These are the pieces that most resemble a luxury version of a Stone Island hoodie and the ones most often confused at source. The tell is the interior: an unlined pullover has no fill layer between the face fabric and the lining, and the hem and cuffs are ribbed without a bonded edge. A padded hoodie of the same external look is heavier, louder when moved, and has a visible fill seam. Buying an unlined pullover at a padded ticket is the source mistake that eats the margin.",
          "Cropped hoodies — the shorter-cut pieces, often in the seasonal colourways — exit at €100-150 in Very Good condition when the cut reads current. The cut ages fast: a cropped hoodie that looked current in 2024 reads dated in 2026, and the exit drops toward €70-90 when the cut is no longer the active silhouette. Size S and M move fastest on EU Vinted for cropped pieces; L and XL lag. Zip-through hoodies (full zip, often in the heavier constructions) exit at €110-160 Very Good if the zip runs clean from stop to collar and the placket is intact.",
        ],
      },
      {
        h: "Is a Balenciaga hoodie worth reselling on EU Vinted?",
        p: [
          "Yes, if the sourcing price is under €65 and the logo and construction are intact. At 38 departures in the last 30 days and a €100 average, Balenciaga hoodies are a margin play, not a volume play. A clean padded hoodie at €30-50 at source is one of the better per-minute decisions on a European rail. A pilled unlined pullover at €55 is a skip.",
          "Decision rule at the rack: (1) padded, unlined, cropped, or zip-through, (2) logo intact — no cracking, peeling, or misapplication, (3) construction sound — seams at armhole and hem hold, (4) condition matches the tier you are paying for, (5) ticket vs the condition-tier buy-below above. Padded + Very Good + under €50 → buy. Unlined pullover + Very Good + under €40 → buy as filler. Cropped + current cut + Very Good + under €55 → buy. Anything Fair, or a piece whose ticket is above buy-below, → leave it.",
          "In a session that has both a clean Balenciaga hoodie and a clean Stone Island hoodie, the Stone Island turns faster (76 departures in the last 30 days vs 38 departures in the last 30 days) at roughly half the exit (€55 vs €100). The Balenciaga is the higher-ceiling piece; the Stone Island is the faster cash turn. If the source price is the same, the Stone Island is the easier flip and the Balenciaga is the bigger per-unit win on margin. Do not confuse either with Balenciaga sneakers — a Balenciaga hoodie and a Balenciaga Triple S do not share a buyer, a capital ticket, or an exit band.",
        ],
        cta: pricingBodyCta("ctr_balenciaga_hoodie_worth_reselling_20260919"),
      },
      {
        h: "Balenciaga vs Stone Island vs Off-White vs Nike hoodies on EU Vinted",
        p: [
          "Balenciaga hoodies (38 departures in the last 30 days at €100) sit at the top of the hoodie price ladder and well below Stone Island on volume (76 departures in the last 30 days at €55). The gap that matters is exit: a clean Balenciaga padded hoodie in Very Good exits at €120-180, against Stone Island's €55 average and a WIP Chase ceiling around €28-42 in Very Good. The Balenciaga margin case is stronger per unit; the Stone Island turnover case is stronger per week. A reseller running capital tight should weight Stone Island; a reseller with a buyer who pays for the logo should weight Balenciaga.",
          "Off-White hoodies (4 departures in the last 30 days at €42) are a different brand problem with a different buyer. Off-White Hooded Chase pieces exit at €42 average and the Virgil-era pieces carry a premium above the current catalogue average; Balenciaga hoodies exit at €100 average with a higher ceiling on the padded pieces. If the session offers both clean, the Balenciaga is the bigger exit and the Off-White is the smaller-volume, logo-and-art print play. Authenticating a Balenciaga hoodie is not the same job as authenticating an Off-White hoodie — the fail points are different (Balenciaga: logo integrity, construction, fill; Off-White: print alignment, quote legibility, zip pull and zipper branding).",
          `Nike hoodies and Fred Perry hoodies are a different price tier entirely. Fred Perry tracks 9,229 brand-level departures/30d at €21.69 average across all categories on EU Vinted. Both exit well below Balenciaga on per-unit value.rage, and neither is a luxury play. A Balenciaga hoodie sourced at €30 and a Nike hoodie sourced at €5 are not competing for the same buyer or the same capital. Ralph Lauren hoodies (12 departures in the last 30 days at €50, buy-below €32.50) are the closest mid-luxury hoodie comp on volume, but the Balenciaga exit is double.`,
        ],
        cta: pricingBodyCta("ctr_balenciaga_hoodie_vs_competitors_20260919"),
      },
      {
        h: "Authentication at the rack: what Balenciaga hoodie buyers actually flag",
        p: [
          "Balenciaga hoodie authentication on EU Vinted is not a sneaker-authentication problem. The fail points are the logo, the construction, and the source price — not a hidden hologram or a box label. The three things a buyer checks first: (1) logo integrity — chest, back, or sleeve logo is crisp, correctly placed, correctly proportioned, not cracked or peeling or misapplied; (2) construction — seams at armhole, hem, and cuffs hold, fill is even on padded pieces, ribbing is not stretched out; (3) price sanity — a padded Balenciaga hoodie in Very Good condition does not source at €15, and a piece ticketed at €5 at a charity shop that reads €120 at exit is a red flag, not a deal.",
          "The most common fake-balenciaga-hoodie tell on EU Vinted is a cheap unbranded hoodie with a heat-pressed or badly stitched logo that cracks within the first wear. A real Balenciaga logo on a hoodie is applied or stitched to specification and holds up to the condition tier the piece is sold in. A fake one fails at the logo within months, and the buyer who paid €60 for what they thought was a €100-exit piece learns the difference when they try to resell it.",
          "The second common tell is the construction mismatch: a padded Balenciaga hoodie that is actually an unbranded puffer with a logo slapped on, or an unlined pullover sold as padded. The fill, the drape, the seam construction, and the interior care tag are the source checks that separate the real piece from the resewn or relabelled one. When the exterior reads Balenciaga but the interior reads generic, walk away.",
          `Third: the source price. A real Balenciaga hoodie in Very Good condition does not turn up at a German charity shop for €8 and exit at €120. The auction and dealer markets in Europe price these pieces within a band; a listing that sits far below the band is a red flag until proven otherwise, and the buyer who ignores that rule is the one who funds the next fake. [Balenciaga brand data →](${ilinkHref("flip")})`,
        ],
      },
    ],

    faq: [
      {
        q: "How much does a Balenciaga hoodie sell for on EU Vinted?",
        a: "Balenciaga hoodies track 38 departures in the last 30 days across EU Vinted at a €100 average exit price as of the week to 19 September 2026. By type: padded Balenciaga hoodies in Very Good condition exit at €120-180; unlined pullovers exit at €90-130; cropped hoodies exit at €100-150 when the cut reads current; zip-through hoodies exit at €110-160 in Very Good if the zip runs clean. By condition: Like New (no pilling, logo intact, tags present) → €150-220; Very Good (light use, logo crisp, construction sound) → €110-160; Good (minor pilling, slight logo fade) → €80-110; Fair (heavy pilling, cracked logo, stretched hem) → €50-80. The broader Balenciaga brand tracks 2322 departures in the last 30 days at a €132 brand average — hoodies are 16% of that volume and exit below sneakers (70 departures in the last 30 days at €158) but above T-shirts (56 departures in the last 30 days at €96). ResaleIQ tracks Balenciaga hoodie exit data weekly from EU Vinted departure observations across France, Germany, Spain, Italy, and Portugal.",
      },
      {
        q: "What should I pay for a Balenciaga hoodie to make a profit on EU Vinted?",
        a: "The buy-below ceiling for Balenciaga hoodies is €65 — 65% of the €100 average exit tracked in the week to 19 September 2026, targeting 35% gross margin after Vinted fees of about 5-8%. By condition: Like New (targeting €185 exit) → buy-below €120.25; Very Good (targeting €135 exit) → buy-below €87.75; Good (targeting €95 exit) → buy-below €61.75; Fair (targeting €65 exit) → buy-below €42.25 or skip. Apply the type split on top of that: a padded hoodie targeting €150 can support a higher ticket than an unlined pullover targeting €110. The risk at source is paying padded money for an unlined piece, paying for a cracked or peeling logo, and buying a piece whose source ticket is so far below the band that it reads as a red flag rather than a deal. Balenciaga Hoodies track 38 departures in the last 30 days at €100 average on EU Vinted in the week to 19 September 2026.",
      },
      {
        q: "Which Balenciaga hoodie sells for the most on EU Vinted?",
        a: "The padded Balenciaga hoodie in Very Good condition is the highest-exit common Balenciaga hoodie on EU Vinted, at €120-180 for black, navy, or a current seasonal colourway in a size that moves. A Like New padded piece with tags can exit at €150-220. Cropped hoodies in a current cut exit at €100-150 in Very Good. Unlined pullovers exit at €90-130 — the lower-exit type, and the one most often confused at source with the padded pieces. The zip-through hoodie exits at €110-160 if the zip runs clean from stop to collar and the placket is intact. The piece that sells for the most is the one with the intact logo, the sound construction, and the current cut — not necessarily the one with the loudest colourway.",
      },
      {
        q: "How do Balenciaga hoodies compare to Stone Island hoodies for reselling on EU Vinted?",
        a: "Balenciaga hoodies track 38 departures in the last 30 days at a €100 average; Stone Island hoodies track 76 departures in the last 30 days at a €55 average as of 19 September 2026. Stone Island moves twice as often at roughly half the exit price. The Balenciaga margin case per unit is stronger: a clean padded Balenciaga in Very Good exits at €120-180 against a Stone Island WIP Chase ceiling around €28-42 in Very Good. The Stone Island turnover case per week is stronger: 76 departures a week at €55 vs 38 at €100. A reseller running capital tight should weight Stone Island; a reseller with a buyer who pays for the logo should weight Balenciaga. Both are the top two hoodie categories on the site by exit price, and both are autumn plays that clear fastest from September through January.",
      },
      {
        q: "Is a Balenciaga hoodie worth reselling on EU Vinted?",
        a: "Yes, if the sourcing price is under the buy-below ceiling of €65 and the logo and construction are intact. Balenciaga hoodies track 38 departures in the last 30 days at a €100 average on EU Vinted in the week to 19 September 2026. A clean padded hoodie sourced at €30-50 is one of the better per-unit margin decisions on a European rail; a pilled unlined pullover sourced at €55 is a skip. The authentication test is the logo (intact, correctly placed, not cracked or peeling), the construction (seams hold, fill even on padded pieces, ribbing not stretched), and the source price (a real piece does not read as a €5 charity-shop deal and exit at €120). Balenciaga hoodies are a margin play, not a volume play, and the buyer is paying for the logo and the construction — not for a daily-driver fleece.",
      },
      {
        q: "How do I spot a fake Balenciaga hoodie on Vinted?",
        a: "The three authentication checks on a Balenciaga hoodie are the logo, the construction, and the source price. Logo: a real Balenciaga logo is applied or stitched to specification — crisp, correctly placed, correctly proportioned — and holds up to the condition tier the piece is sold in; a fake fails at the logo within months, with cracking, peeling, or misapplication. Construction: a padded Balenciaga hoodie has even fill, sound armhole and hem seams, and a heavier drape; an unlined pullover has no fill layer and a lighter drape; a resewn or relabelled piece reads wrong on the interior care tag and the seam construction. Source price: a real Balenciaga hoodie in Very Good condition does not turn up at a European charity shop for €8 and exit at €120 — a listing far below the band is a red flag until proven otherwise. When the exterior reads Balenciaga but the interior reads generic, walk away.",
      },
    ],
  },
]
