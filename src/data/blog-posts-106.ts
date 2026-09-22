// Batch 106 of SEO/AEO articles. Same contract as blog-posts.ts.
// Nike Hoodie EU Vinted price guide — targets
// "nike hoodie vinted price", "nike hoodie eu vinted price guide",
// "nike tech fleece hoodie resell value europe", "is nike hoodie worth reselling vinted",
// "nike hoodie buy below vinted", "nike club fleece hoodie vinted eu price",
// "nike tech fleece vs club fleece hoodie vinted", "nike hoodie vs tommy hilfiger vinted".
// DISTINCT from nike-jacket-eu-vinted-price-guide (jackets, Windrunner/ACG,
// 7 departures in the last 30 days @€37 live) and nike-sneakers-eu-vinted-price-guide (footwear) and
// nike-reselling-vinted-guide (brand overview, sneaker-dominant, hoodies as
// one stale paragraph at 23 departures in the last 30 days @€23).
// This guide is HOODIES ONLY: 9 departures in the last 30 days @€17 avg (19 Sep 2026 live snapshot),
// buy-below €11.05, Club Fleece vs Tech Fleece vs chest-swoosh graphic,
// hoodie-specific fail points (cuff pilling/drawcord/print crack),
// vs Tommy Hilfiger hoodies (8 departures in the last 30 days @€20) and Carhartt (7 departures in the last 30 days @€21).

import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

export const POSTS_106: BlogPost[] = [
  {
    slug: "nike-hoodie-eu-vinted-price-guide",
    title: "Nike Hoodies on EU Vinted: Price Guide and Buy-Below (2026 Data)",
    seoTitle: "Nike Hoodie Vinted EU Price Guide 2026 — Resale IQ",
    description:
      "Nike hoodies track 9 departures in the last 30 days on EU Vinted at a €17 average exit price as of 19 September 2026 — the second-highest-volume Nike category after sneakers, and a different play from the €37 jacket market. Buy-below €11.05, Club Fleece vs Tech Fleece identification, condition grading, and how Nike hoodies compare to Tommy Hilfiger (€20) and Carhartt (€21) for EU resellers.",
    date: "2026-09-19",
    category: "Sourcing",
    readMins: 6,

    preflightQuery: "Nike Hoodies",

    intro:
      "Nike hoodies track 9 departures in the last 30 days (observation window to 22 September 2026) across EU Vinted at a €17 average exit price. Hoodies are the second-highest-volume Nike category this week after sneakers (23 departures in the last 30 days at €124) and ahead of jackets (7 departures in the last 30 days at €37). They are 17% of Nike's 54 weekly brand departures. The buyer is not purchasing an Air Max. They are purchasing a Club Fleece pullover, a Tech Fleece zip, or a chest-swoosh graphic on midweight cotton. The buy-below ceiling at €11.05 (€17 × 0.65) means only clean pieces sourced under €8 deliver real margin. This guide covers the live margin case, Club Fleece vs Tech Fleece vs graphic identification, buy-below by condition, and how Nike hoodies sit against Tommy Hilfiger and Carhartt for EU resellers.",

    definedTerm: {
      name: "Nike hoodie departure average",
      description:
        "The Nike hoodie departure average is the average price at which a tracked Nike hoodie listing leaves the shelf on EU Vinted — not the asking price and not retail. As of the week to 19 September 2026, Nike hoodies track 9 departures in the last 30 days across France, Germany, Spain, Italy, and Portugal at a €17 average exit price. 'Watched departure' means a tracked listing left the shelf — not a confirmed buyer-reported sale. The broader Nike brand tracks 54 departures in the last 30 days at a €69 brand average; hoodies are 17% of that volume and exit well below the brand average, which sneakers (23 departures in the last 30 days at €124) pull up. Jackets this week are 7 departures in the last 30 days at €37. The buy-below ceiling at the €17 departure average is €11.05 (€17 × 0.65), targeting 35% gross margin after Vinted platform fees. ResaleIQ updates Nike hoodie exit data weekly from EU Vinted departure observations across five markets.",
    },

    sections: [
      {
        h: "Nike hoodies on EU Vinted: 9 departures in the last 30 days at €17 average",
        p: [
          "Nike hoodies track 9 departures in the last 30 days across EU Vinted at a €17 average exit price in the week to 19 September 2026. That is the highest-volume Nike apparel category this week: jackets 7 departures in the last 30 days at €37, T-shirts 4 departures in the last 30 days at €32, tracksuits 4 departures in the last 30 days at €41. Sneakers still dominate the brand (23 departures in the last 30 days at €124). The €17 hoodie average sits €52 below the €69 brand average because sneakers carry the brand number. Treat the hoodie figure as its own market. A Nike hoodie buyer on EU Vinted is buying branded fleece, not footwear, and they will not pay Air Max money for it.",
          "9 departures in the last 30 days at €17 average is €153 of observed weekly hoodie revenue across five markets. That is not a volume operation and it is not the Nike money. Observed sneaker revenue this week is €2,852 (23 × €124). Observed jacket revenue is €259 (7 × €37). The hoodie is the piece that shows up on every German Kleiderkammer and French brocante rail. Weekly observed hoodie revenue only beats T-shirts (€128) because the hoodie count is higher, not because the exit is.",
          `€17 puts Nike hoodies next to Fred Perry hoodies (37 departures in the last 30 days at €17) on price and well below Tommy Hilfiger hoodies (8 departures in the last 30 days at €20), Carhartt hoodies (7 departures in the last 30 days at €21), and Hugo Boss hoodies (6 departures in the last 30 days at €24). Ralph Lauren hoodies (12 departures in the last 30 days at €50) exit at 2.9× Nike's hoodie average. Fred Perry at the same €17 average moves four times as often; Nike wins on how often the piece is sitting on a charity-shop rail, not on clearance speed. [Full Nike brand data →](${ilinkHref("flip")})`,
        ],
        cta: pricingMidCta("ctr_nike_hoodie_intro_20260919"),
      },
      {
        h: "Buy-below ceiling: €11.05 — Club Fleece at €8 is the whole game",
        p: [
          "The buy-below ceiling for Nike hoodies at the €17 average exit is €11.05 (€17 × 0.65), targeting 35% gross margin after Vinted fees of roughly 5–8%. Net of a 6% fee on a €17 exit, take-home is €15.98 — €4.93 on an €11.05 buy (45% on capital). Absolute gross is small. At German and French charity-shop tickets of €3–10 for Nike hoodies, the arithmetic works on clean pieces sourced under €8. A pilled Club Fleece at €9 does not clear.",
          "Condition tiers move the ceiling. Like New (no pilling, crisp swoosh or print, intact drawcord, firm cuffs, clean kangaroo pocket edge) → €22–30 exit, buy-below €14.30–19.50. Very Good (light seasonal use, no chest pilling, print intact, drawcord present) → €14–20 exit, buy-below €9.10–13.00 — the primary target. Good (cuff pilling, slight print fade, clean interior) → €10–14 exit, buy-below €6.50–9.10. Fair (heavy pilling, cracked print, missing drawcord, stretched hem) → €6–10 exit. Skip Fair unless the ticket is €3 or less.",
          "The Club vs Tech Fleece split is larger than the condition split. A Tech Fleece hoodie in Very Good condition exits at €22–32; a Club Fleece pullover with the small left-chest swoosh exits at €14–20 at the same condition. Both hang as 'Nike hoodie' at a charity shop and are often ticketed the same €4–8. Buying Club expecting Tech Fleece money is the common Nike hoodie mistake. Exterior: Tech Fleece has the bonded double-knit face and a tapered cut; Club Fleece is standard midweight cotton-blend with a kangaroo pocket. Interior care tag: 'Nike Sportswear Tech Fleece' vs 'Nike Club' or 'NSW Club Fleece'.",
        ],
        cta: pricingMidCta("ctr_nike_hoodie_buybelow_20260919"),
      },
      {
        h: "Nike hoodie types: Club Fleece, Tech Fleece, chest-swoosh graphic, zip-through",
        p: [
          "Four hoodie types drive the 9 EU Vinted departures in the last 30 days. The NSW Club Fleece pullover — small swoosh on the left chest, midweight cotton-blend, kangaroo pocket — is what EU charity shops actually hold. Very Good Club in black, grey, or navy exits at €14–20, around the €17 category average. Neutral colourways clear; loud seasonal colourways sit. Size L and XL move fastest on EU Vinted; S and XXL lag.",
          "The Tech Fleece hoodie — bonded double-knit, ribbed taper, often a full zip — is the highest-exit Nike hoodie on the rail. Very Good Tech Fleece in black or grey exits at €22–32, above the €17 average. Face pilling on the chest panel and pocket is the fail point: run a palm across the knit at source. Any pills drop the piece to Good and the exit toward €14–18. This is a hoodie, not the Tech Fleece jacket covered in the Nike jacket guide; buyers search them as different listings.",
          "Chest-swoosh and graphic pullovers (large print across the chest, including 1990s centre-swoosh pieces) exit at €12–18 for modern graphics in Very Good condition, and €20–35 for a clean vintage centre-swoosh in L/XL. Print cracking and peel are the fail: a thumb across the ink at source. Any surface crack drops a modern graphic to €8–12. The Club zip-through (full zip, NSW label at the placket) exits at €16–24 Very Good if the zip runs clean from stop to collar.",
        ],
      },
      {
        h: "Is a Nike hoodie worth reselling on EU Vinted?",
        p: [
          "Yes, with a Tech Fleece check and a sourcing price under €8. At 9 departures in the last 30 days and a €17 average, Nike hoodies are not a primary play. They are the fleece that shows up next to everything else. A clean Tech Fleece at €5–7 is one of the better per-minute decisions on a German or French rail. A pilled Club at €9 is a skip.",
          "Decision rule at the rack: (1) Tech Fleece, Club, or graphic, (2) swoosh or print intact, (3) drawcord present, (4) cuffs not pilled to pills-on-pills, (5) ticket vs the condition-tier buy-below above. Tech Fleece + Very Good + under €10 → buy. Club + Very Good + under €7 → buy as filler. Graphic with uncracked print + under €6 → buy. Anything Fair, or Club above €8 → leave it.",
          "In a session that has both a clean Nike hoodie and a clean Nike jacket, take the jacket. Jackets exit at €37 average (7 departures in the last 30 days) against hoodies at €17 (9 departures in the last 30 days). Hoodies become the buy when the jacket rail is empty or the hoodie is Tech Fleece clearly under €8. Do not confuse either with sneakers. A Nike hoodie and a Nike Air Max do not share a buyer, a capital ticket, or an exit band.",
        ],
        cta: pricingBodyCta("ctr_nike_hoodie_worth_reselling_20260919"),
      },
      {
        h: "Nike vs Tommy Hilfiger vs Carhartt vs Fred Perry hoodies on EU Vinted",
        p: [
          "Nike hoodies (9 departures in the last 30 days at €17) sit next to Tommy Hilfiger hoodies (8 departures in the last 30 days at €20) on volume this week and €3 below on exit. Tommy's flag or small chest logo is the buyer cue; Nike's is the swoosh or the Tech Fleece knit. Charity-shop tickets in Germany overlap (€3–10). Condition equal and ticket equal, prefer a Tech Fleece Nike over a Tommy flag hoodie because Tech Fleece has a higher Very Good ceiling (€22–32 vs Tommy's band around a €20 average). Prefer Tommy over a pilled Nike Club at the same ticket — Club's €14–20 Very Good band is the weaker of the two once pilling starts.",
          "Carhartt hoodies (7 departures in the last 30 days at €21) and Hugo Boss hoodies (6 departures in the last 30 days at €24) sit above Nike on exit at similar weekly counts. A WIP Chase in Very Good condition exits at €28–42; that ceiling beats every Nike hoodie type except a clean vintage centre-swoosh. If the session offers a Chase and a Club at the same €6–8, take the Chase. Take Nike when the workwear rail is empty, which is the common sportswear-rail case.",
          `Fred Perry hoodies (37 departures in the last 30 days at €17) share Nike's exit and beat it 4× on frequency. Fred Perry is the volume hoodie play at this price. Nike is the always-available filler: more donated, slower to clear, same €17 average. Ralph Lauren hoodies (12 departures in the last 30 days at €50, buy-below €32.50) are a different slot. Same weekly hoodie volume class, 2.9× the exit. If the session offers both clean, take Ralph Lauren on margin. [Hoodie category comparison →](${ilinkHref("data")})`,
        ],
        cta: pricingBodyCta("ctr_nike_hoodie_vs_competitors_20260919"),
      },
    ],

    faq: [
      {
        q: "How much does a Nike hoodie sell for on EU Vinted?",
        a: "Nike hoodies track 9 departures in the last 30 days across EU Vinted at a €17 average exit price as of the week to 19 September 2026. By condition: Like New (no pilling, crisp branding, intact drawcord, firm cuffs) → €22–30. Very Good (light use, print intact, drawcord present) → €14–20. Good (cuff pilling, slight print fade) → €10–14. Fair (heavy pilling, cracked print, missing drawcord) → €6–10. By type: Tech Fleece hoodie in Very Good condition exits at €22–32. NSW Club Fleece pullover exits at €14–20. Club zip-through exits at €16–24. Modern chest-swoosh graphic exits at €12–18. Vintage centre-swoosh in L/XL exits at €20–35. The broader Nike brand tracks 54 departures in the last 30 days at a €69 brand average — hoodies are 17% of that volume and exit well below sneakers (23 departures in the last 30 days at €124) and jackets (7 departures in the last 30 days at €37). ResaleIQ tracks Nike hoodie exit data weekly from EU Vinted departure observations across France, Germany, Spain, Italy, and Portugal.",
      },
      {
        q: "What should I pay for a Nike hoodie to make a profit on EU Vinted?",
        a: "The buy-below ceiling for Nike hoodies is €11.05 — 65% of the €17 average exit tracked in the week to 19 September 2026, targeting 35% gross margin after Vinted fees of about 5–8%. By condition: Like New (targeting €26 exit) → buy-below €16.90. Very Good (targeting €17 exit) → buy-below €11.05. Good (targeting €12 exit) → buy-below €7.80. Fair (targeting €8 exit) → buy-below €5.20 or skip. Apply the type split on top of that: a Tech Fleece targeting €24–30 can support a higher ticket than a Club targeting €15–18. At German and French charity shops Nike hoodies typically ticket at €3–10. The risk at source is mistaking Club for Tech Fleece, plus cracked chest print and missing drawcord, both of which drop exit into the Good band.",
      },
      {
        q: "Which Nike hoodie sells for the most on EU Vinted?",
        a: "The Tech Fleece hoodie in Very Good condition is the highest-exit common Nike hoodie on EU Vinted, at €22–32 for black or grey in L/XL. A clean vintage centre-swoosh pullover in L/XL can exit at €20–35 when the print is uncracked, but those pieces are less common on EU charity-shop rails than Club Fleece. The Club zip-through exits at €16–24 if the zip is clean. NSW Club pullovers exit at €14–20 and should not be priced as Tech Fleece. Club Fleece is what EU charity shops actually hold; when a clean Tech Fleece appears at €5–8 it is the hoodie to take. Loud seasonal colourways sit longer than neutrals.",
      },
      {
        q: "How do Nike hoodies compare to Tommy Hilfiger hoodies for reselling on EU Vinted?",
        a: "Nike hoodies track 9 departures in the last 30 days at €17 average; Tommy Hilfiger hoodies track 8 departures in the last 30 days at €20 as of 19 September 2026. Volume is close. Tommy exits €3 higher. The gap that matters is the Tech Fleece ceiling: a Very Good Tech Fleece exits at €22–32, above Tommy's band around the €20 average. Pilled Nike Club (€14–20 Very Good, less once pilling starts) is the weaker of the two at an equal ticket. Charity-shop prices in Germany overlap. Selection rule: Tech Fleece Nike over Tommy at the same source price; Tommy over pilled Club at the same source price. Both brands fill the mid-price branded-fleece slot; neither matches Ralph Lauren hoodies at 12 departures in the last 30 days and €50 average. Fred Perry at 37 departures in the last 30 days and the same €17 average as Nike is the volume comparison, not Tommy.",
      },
      {
        q: "Is a Nike hoodie worth reselling on EU Vinted?",
        a: "Yes, if it is Tech Fleece or a cheap clean Club. Nike hoodies track 9 departures in the last 30 days at a €17 average on EU Vinted in the week to 19 September 2026. Buy-below is €11.05. Per-unit net is about €5–12 — below Nike jackets (€37 average, 7 departures in the last 30 days) and well below Nike sneakers (€124 average, 23 departures in the last 30 days), but viable when a Tech Fleece is ticketed at €5–8 on a German or French rail. The identification test (Tech Fleece knit vs Club tag, print intact, drawcord present, cuffs not destroyed) is fast. Nike hoodies are a rack add-on, not a hunt. Take the jacket when both are clean; take the hoodie when it is Tech Fleece under €8 or Club under €7. Do not spend sneaker capital on fleece.",
      },
    ],
  },
]
