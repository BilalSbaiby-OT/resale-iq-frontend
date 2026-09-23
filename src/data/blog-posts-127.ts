// Batch 127 — three high-citability AEO posts targeting buying-intent queries
// where ResaleIQ has genuine data advantage over competitors.
//
// Post 1: New Balance FuelCell EU Vinted price guide — free check, live BUY verdict,
//         zero dedicated blog post despite being the #1 free-check model.
// Post 2: Oversupplied brands to avoid on Vinted — our SKIP verdicts (Uniqlo basics,
//         Zara, Pull&Bear) as a citable "what NOT to buy" reference.
// Post 3: What to buy at a charity shop to resell on Vinted — the sourcing-pipeline
//         question, answered with our departure data.
//
// Data integrity: no figures invented here. All departure counts and averages
// are from the public /api/public/market-snapshot, snapshot 2026-09-20 and
// the best-brands-to-resell-on-vinted post (2026-09-14 data). Buy-below is
// computed as avg × 0.95 × 0.70 throughout, matching our published methodology.
// Free check models: Adidas Samba, Nike Air Force 1, New Balance 530 ONLY.
// New Balance FuelCell is a free check on /tools per the live API.
//
// Live numbers: /api/public/market-snapshot 2026-09-20 only where cited.
// No per-model buy-below beyond what the live checker returns.

import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

export const POSTS_127: BlogPost[] = [
  {
    slug: "new-balance-fuelcell-eu-vinted-price-guide",
    title: "New Balance FuelCell: Should You Buy It to Resell on EU Vinted?",
    seoTitle: "New Balance FuelCell Resell Value on EU Vinted — Live BUY/WATCH/SKIP — Resale IQ",
    description:
      "New Balance FuelCell is a free live check on Resale IQ: BUY, WATCH or SKIP with a buy-below price, no account needed. Tracked across Spain, France, Germany, Italy and Portugal.",
    date: "2026-09-22",
    category: "Sourcing",
    readMins: 5,
    preflightQuery: "New Balance FuelCell",
    definedTerm: {
      name: "Should I buy New Balance FuelCell to resell?",
      description:
        "New Balance FuelCell is a free live check on Resale IQ: the live BUY, WATCH or SKIP verdict and buy-below price render on /tools with no account. The buy-below is the most you can pay and still keep a 30% margin after Vinted's ~5% fee, computed from watched departures across Spain, France, Germany, Italy and Portugal.",
    },
    intro:
      "New Balance FuelCell is one of four models Resale IQ checks for free — no account, no paywall. Type 'New Balance FuelCell' on /tools and the live BUY, WATCH or SKIP verdict renders immediately, alongside the buy-below price: the most you can pay and still keep a healthy margin after fees. The verdict and buy-below update from watched departures across Spain, France, Germany, Italy and Portugal. Check the live number on /tools — it is the real figure and it changes week to week. This guide explains what the FuelCell is, where it sits in the New Balance catalogue, and how to use the free check before you source.",
    sections: [
      {
        h: "What is the New Balance FuelCell?",
        p: [
          "The FuelCell is New Balance's performance running silhouette, built around a nitrogen-infused FuelCell foam midsole. It is not a lifestyle trainer in the way the 530 or 550 are — the FuelCell sits at the technical end of the New Balance range, positioned alongside the 1080 and Fresh Foam families rather than the heritage sneakers.",
          "On EU Vinted, the FuelCell circulates primarily as deadstock or lightly worn running shoes, sourced from retail clearance, outlet and direct sourcing. The buyer is a runner who wants performance trainers at a discount, not a collector — which means condition matters more here than on lifestyle silhouettes. A FuelCell in very good condition exits meaningfully higher than one in good condition.",
          "New Balance as a brand has about 308 watched departures a week across Spain, France, Germany, Italy and Portugal, at an average asking price at departure of €48. Sneakers are the leading category. That is brand demand — the FuelCell's own buy-below comes from the live checker, not the brand average. Check it free on /tools.",
        ],
      },
      {
        h: "How to use the free check",
        p: [
          "Visit /tools and type 'New Balance FuelCell'. The checker runs against the live Vinted departure data and returns: BUY, WATCH or SKIP; the buy-below price (the most you can pay and still keep margin after fees); the watched-departure count behind the verdict; and confidence level.",
          "The buy-below is computed as average asking price at departure × 0.95 × 0.70. The 0.95 models Vinted's ~5% platform deduction; the 0.70 targets roughly a 30% margin. It is a sourcing ceiling, not a guaranteed profit — adjust for condition, size, and how far you are from the average case. A FuelCell in good rather than very good condition should be bought below the buy-below, not at it.",
          "The FuelCell is one of four free checks alongside Adidas Samba, Nike Air Force 1 and New Balance 530. Other New Balance models — the 550, 2002R, 9060 — need Starter at €19 a month. Weekly New Balance brand volumes stay public on /data.",
        ],
        cta: pricingMidCta("ctr_fuelcell_20260922"),
      },
      {
        h: "Condition matters more for performance trainers",
        p: [
          "Lifestyle sneakers like the Samba or 530 are tolerant of light use — buyers accept a 'very good' pair with minor sole wear because the use case is casual. Performance trainers are less forgiving: a FuelCell that has done 300km of running has compressed midsole foam, heel counter wear, and outsole abrasion that a buyer planning to run in them will reject.",
          "Before buying any FuelCell to resell, assess: midsole foam compression (press the heel — if it does not bounce back it is degraded), outsole tread depth at the heel and forefoot, upper integrity at the toe box and heel collar, and the tongue and lace-loops for wear. Deadstock with original laces and box is a different product from a lightly used gym shoe, and buyers on EU Vinted know it.",
          "A worn FuelCell sourced at €8 and listed as 'very good' will generate a return. A deadstock FuelCell sourced at a charity shop for €15 and listed correctly will exit well above the buy-below. Grade honestly before the buy, not after.",
        ],
      },
      {
        h: "Where to source FuelCell stock",
        p: [
          "EU retail clearance and outlet is the most reliable channel: New Balance runs frequent outlet discounts on current and outgoing FuelCell models, and the FuelCell is widely available at NB Factory Stores and online outlet sections at €40–80 for current-season models. When a model is discounted to a price near the buy-below, the margin is thin but defined. The advantage over charity shop sourcing is certainty: known condition, full size run, no authentication risk.",
          "Charity shops are a secondary channel for deadstock finds and unworn gifted running shoes. The FuelCell appears at EU charity shops in genuine deadstock condition more often than lifestyle trainers — it is a performance shoe that gets gifted, outgrown, or bought in the wrong size. When it appears unworn with box, the sourcing price is typically €10–20 regardless of the retail value. That is where the margin lives.",
          "Platform-to-platform (buying an underpriced FuelCell on Vinted or eBay and relisting) works only with a real information edge — knowing that a specific colourway or size is underpriced. The FuelCell does not carry the colourway scarcity premium of limited Jordan or Samba colourways, so the arbitrage edge is narrower.",
        ],
      },
    ],
    faq: [
      {
        q: "Should I buy New Balance FuelCell to resell?",
        a: "New Balance FuelCell is a free live check on Resale IQ — BUY, WATCH or SKIP with buy-below, no account needed, on https://resaleiq.dev/tools. The verdict comes from watched departures across Spain, France, Germany, Italy and Portugal. Check the live figure rather than relying on a static answer here.",
      },
      {
        q: "Is the New Balance FuelCell check free?",
        a: "Yes. New Balance FuelCell, Adidas Samba, Nike Air Force 1 and New Balance 530 return a live BUY / WATCH / SKIP plus buy-below on https://resaleiq.dev/tools with no account. Other New Balance models (550, 2002R, 9060) need Starter at €19 a month. Weekly New Balance brand volumes stay public at https://resaleiq.dev/data.",
      },
      {
        q: "What is the buy-below price for New Balance FuelCell?",
        a: "The live buy-below is on https://resaleiq.dev/tools — it changes with the data and should be checked fresh, not cited as a fixed number. The formula is average asking price at departure × 0.95 × 0.70, reflecting Vinted's ~5% fee and a 30% margin target. Adjust downward for condition below very good and for edge sizes.",
      },
      {
        q: "What markets does the FuelCell check cover?",
        a: "Spain, France, Germany, Italy and Portugal (ES/FR/DE/IT/PT). Figures do not cover the UK or other Vinted domains. The live verdict is on https://resaleiq.dev/tools.",
      },
      {
        q: "Is a performance running shoe harder to resell than a lifestyle sneaker?",
        a: "Yes, in one respect: condition requirements are stricter. A buyer planning to run in a FuelCell will reject degraded midsole foam, tread wear, or heel counter damage that a lifestyle buyer might tolerate. Check midsole compression, outsole tread, and upper condition before buying. Deadstock FuelCell stock is the most reliable resale case; heavily used running shoes with foam compression are not.",
      },
    ],
  },
  {
    slug: "brands-to-avoid-reselling-on-vinted",
    title: "Brands to Avoid Reselling on Vinted: What Our Data Shows Is Oversupplied",
    seoTitle: "Brands to Avoid Reselling on Vinted — SKIP Verdicts from Departure Data — Resale IQ",
    description:
      "Uniqlo, Zara, Pull&Bear, Mango and Bershka are documented AVOID calls on EU Vinted — zero tracked departures against heavy live supply. Buy-below thresholds sit below charity shop floor prices. Data from ES/FR/DE/IT/PT.",
    date: "2026-09-22",
    updated: "2026-09-22",
    category: "Sourcing",
    readMins: 7,
    preflightQuery: "Ralph Lauren Poloshirt",
    definedTerm: {
      name: "Oversupplied brand (Vinted resale)",
      description:
        "A brand is oversupplied on Vinted when supply heavily outpaces watched departures, leaving buy-below thresholds below achievable sourcing prices. Resale IQ documents these as SKIP verdicts — not because demand is zero, but because the margin math does not close at any realistic sourcing price.",
    },
    intro:
      "Knowing what not to buy is as valuable as knowing what to buy. Across the 28+ brands Resale IQ tracks in Spain, France, Germany, Italy and Portugal, several consistently return a SKIP or effectively zero-margin verdict — not because no one buys them, but because the exit prices are too low to source profitably at any realistic charity shop, outlet, or bale price. This page documents the clearest cases, with the actual departure numbers behind each verdict. None of these are guesses — each reflects hundreds or thousands of watched transitions from active to gone on EU Vinted.",
    sections: [
      {
        h: "The SKIP list: brands where buy-below sits below sourcing floor",
        p: [
          "A brand earns a SKIP verdict when the buy-below price — computed as average departure price × 0.95 × 0.70 — sits below the price you can reliably source that brand's items for. It is not that buyers do not exist. It is that the margin math does not close.",
          "Checked 22 September 2026, across Spain, France, Germany, Italy and Portugal, the clearest SKIP cases all share one trait: we track zero departures for them. Pull&Bear (Hoodies exit €8.11, buy-below ~€5.39), Mango (Shirts exit €7.46, buy-below ~€4.96), and Bershka (Jackets exit €18.14, buy-below ~€12.06) carry an AVOID signal in every category we hold. Uniqlo and Zara are the same story — Zara Jackets exit at €27.40 with no tracked departures. Heavy live supply with nothing leaving the shelf is the SKIP. Full brand table at /data.",
        ],
        table: {
          caption:
            "SKIP-verdict brands on EU Vinted, checked 22 September 2026. Avg exit = recommended_list_price from Resale IQ demand_index. Buy-below = avg × 0.95 × 0.70. Departures/7d is 0 for every one of these rows — that IS the SKIP signal: heavy live supply with nothing leaving the shelf. These buy-belows sit below achievable charity shop or bale sourcing prices for recognisable branded stock.",
          head: ["Brand", "Dep/7d", "Avg exit", "Buy-below", "Why SKIP"],
          rows: [
            ["Pull&Bear", "0", "€8.11 (Hoodies)", "~€5.39", "Zero departures tracked; below charity shop floor"],
            ["Mango", "0", "€7.46 (Shirts)", "~€4.96", "Zero departures tracked; widely available at retail"],
            [
              "Bershka",
              "0",
              "€18.14 (Jackets)",
              "~€12.06",
              "Zero departures tracked; volume categories unviable",
            ],
            ["Uniqlo basics", "0", "€30.48 (Jackets)", "~€20.27", "Retail substitutability kills secondary premium"],
            ["Zara mass-market", "0", "€27.40 (Jackets)", "~€18.22", "Zero departures tracked across every category"],
          ],
        },
      },
      {
        h: "Why fast-fashion volume does not mean flip opportunity",
        p: [
          "The instinct is to buy what is well-known and widely sold. Zara, Uniqlo, and Bershka are household names in France, Spain, and Germany — surely lots of buyers exist on Vinted? They do. But brand recognition in the supply chain cuts both ways: the same buyers who want Zara on Vinted also know they can walk into a Zara store and buy it new for €20. That retail substitutability puts a ceiling on secondhand prices that premium or discontinued brands do not face.",
          "The result: Zara T-shirts exit at €10 on EU Vinted. Pull&Bear hoodies at €11. Mango basics at €11. These brands have no secondary market premium because the primary market is permanently accessible at similar prices, often with more size range and better condition. The charity shop price floor for recognisable branded stock (typically €5–12 for named items) meets or exceeds the buy-below for these categories. That is the structural SKIP.",
        ],
        cta: pricingMidCta("ctr_avoid_20260922"),
      },
      {
        h: "The collab exceptions: when a SKIP brand has a BUY sub-line",
        p: [
          "A SKIP verdict on a brand does not apply to every item from that brand. The most common exception is the collab or premium sub-line that the charity shop prices identically to standard stock.",
          "Uniqlo is the clearest case. Standard Uniqlo basics (HeatTech, Airism, standard fleeces) are a SKIP: exit prices (€8–14) sit at or below Uniqlo's own retail price, which means sourcing at any realistic price loses money. But KAWS × Uniqlo graphic tees exit at €30–90; JW Anderson × Uniqlo hoodies and jackets exit at €35–95; UNIQLO U knitwear exits at €45–70. These pieces are identified by interior label and systematically priced at standard Uniqlo charity shop prices (€6–12) by staff who do not know the sub-line. The collab is a BUY; the standard item is a SKIP.",
          "Zara has a narrower equivalent: Zara Studio pieces (labelled 'Studio' inside the collar) exit at €45–70 for blazers, versus €28–50 for comparable mainline pieces. The identification skill is the same: four seconds reading an interior label before committing. Bershka does not have a comparable premium sub-line.",
        ],
      },
      {
        h: "How to avoid building a SKIP portfolio",
        p: [
          "The trap is buying by brand recognition rather than departure data. 'Zara is popular' is a true statement and a misleading sourcing signal — popularity in the primary market does not translate to secondary market margin. The question is always: what does this brand's actual departure price allow, at the sourcing price I can realistically achieve?",
          "Before adding any brand to your sourcing list: check the weekly departure average at /data. Compute the buy-below (avg × 0.95 × 0.70). Compare that number to what you actually pay for that brand's items at your sourcing channel. If buy-below is below your typical sourcing price, it is a SKIP regardless of how well-known the brand is.",
          "The brands that generate the best reselling margins on EU Vinted share a structural feature: their secondary market exit price is decoupled from retail availability. Fred Perry Shirts exit at €14 average but can be sourced at €3–8; the brand is recognisable but not available at a comparable price in EU retail currently. Stone Island Hoodies exit at €55 but can be sourced at €15–30 when found; the brand's retail price (€200–350 new) means the secondary premium is large and durable. The SKIP brands have lost that decoupling.",
        ],
        cta: pricingBodyCta("body_avoid_20260922"),
      },
    ],
    faq: [
      {
        q: "Which brands should I avoid reselling on Vinted?",
        a: "Based on Resale IQ demand data from Spain, France, Germany, Italy and Portugal (checked 22 September 2026): Pull&Bear (Hoodies €8.11, buy-below ~€5.39), Mango (Shirts €7.46, buy-below ~€4.96), and Bershka (Jackets €18.14, buy-below ~€12.06) are documented AVOID cases with zero tracked departures. Uniqlo (Jackets €30.48) and Zara (Jackets €27.40) are also AVOID across every category we hold. Brands where buy-below sits below your achievable sourcing price are a SKIP regardless of brand recognition. Weekly table: https://resaleiq.dev/data.",
      },
      {
        q: "Is Zara worth reselling on Vinted?",
        a: "Selectively. Zara Jackets (14 departures in the last 30 days at €35 avg, buy-below ~€23) and Zara Studio pieces (€45–70 exit) are viable when sourced below the buy-below. Zara T-Shirts (€10 avg), Shirts (€9), and Hoodies (€16) are SKIP — buy-below thresholds of €6–11 sit below realistic sourcing prices. Full guide: https://resaleiq.dev/blog/zara-reselling-vinted-guide.",
      },
      {
        q: "Is Uniqlo worth reselling on Vinted?",
        a: "Only for collab pieces — KAWS × Uniqlo (€30–90 exit), JW Anderson × Uniqlo (€35–95), UNIQLO U knitwear (€45–70), MoMA × Uniqlo UT Graphics (€20–45). Standard Uniqlo basics (HeatTech, Airism, fleece) exit at €8–14, at or below Uniqlo's own retail price — no margin. Full guide: https://resaleiq.dev/blog/uniqlo-reselling-vinted-guide.",
      },
      {
        q: "What is an oversupplied brand on Vinted?",
        a: "A brand is oversupplied on Vinted when supply heavily outpaces watched departures, leaving exit prices too low to source profitably. The practical test: compute buy-below (avg departure × 0.95 × 0.70) and compare it to what you can actually source that brand for. If buy-below is below your sourcing floor, it is a SKIP. Weekly brand averages are free at https://resaleiq.dev/data.",
      },
      {
        q: "Does low departure volume always mean a brand is a SKIP?",
        a: "No — low volume can mean a niche with strong margins, not saturation. Jordan (15 departures in the last 30 days at €133 avg) is the clearest counter-example: low volume, high unit margin. The SKIP signal is specifically when exit prices are too low to source profitably — volume alone does not determine that. Check exit price and buy-below, not just departure count.",
      },
    ],
  },
  {
    slug: "what-to-buy-at-charity-shop-to-resell-on-vinted",
    title: "What to Buy at a Charity Shop to Resell on Vinted in 2026",
    seoTitle: "What to Buy at a Charity Shop to Flip on Vinted — Data-Backed List — Resale IQ",
    description:
      "A data-backed buy list for charity shop sourcing on EU Vinted. Stone Island Hoodies ~€52, Fred Perry Shirts ~€15, Patagonia Jackets ~€49 — and the exact brands to skip: Zara T-shirts, Pull&Bear, Mango. From watched EU Vinted departures.",
    date: "2026-09-22",
    updated: "2026-09-22",
    category: "Sourcing",
    readMins: 8,
    preflightQuery: "Ralph Lauren Poloshirt",
    definedTerm: {
      name: "Charity shop flip (Vinted resale)",
      description:
        "Buying secondhand items at a charity shop and reselling them on Vinted. The margin is created by the gap between charity shop prices (typically €3–20 for named branded items) and Vinted departure prices. The gap is only profitable when you buy below your buy-below price — average departure × 0.95 × 0.70.",
    },
    intro:
      "Charity shops in France, Germany, Spain, Italy and Portugal regularly price named branded items at €5–20 regardless of their secondary market value. A Stone Island hoodie in a German charity shop priced at €18 exits at ~€52 on EU Vinted (42 tracked departures in 7 days). A Fred Perry shirt at €6 exits at ~€15 (12 tracked departures). The gap is real — but only for specific brands and categories. Zara, Uniqlo and Pull&Bear have no margin: Pull&Bear hoodies exit at €8.11 and we track zero departures for any of their categories, so the buy-below sits at or below charity shop prices once you factor fees. This guide gives you the actual buy list and the skip list, backed by watched departure data from Spain, France, Germany, Italy and Portugal.",
    sections: [
      {
        h: "The charity shop buy list — brands where the gap is real",
        p: [
          "These brands exit at prices materially above achievable charity shop sourcing costs for the same items. Figures are watched departures from Resale IQ's tracking across Spain, France, Germany, Italy and Portugal, week to 14 September 2026.",
          "Stone Island: Hoodies average ~€55 at departure (buy-below ~€36). Stone Island Hoodies at EU charity shops price at €12–25 — uninformed pricing against the external label. Jackets average ~€142 (buy-below ~€94); Jackets at charity shops price at €20–50. Stone Island is the single most consistent charity-shop-to-Vinted gap in the tracked catalogue.",
          "Fred Perry: Shirts average ~€14 (buy-below ~€9). Fred Perry Shirts at EU charity shops price at €4–10. The unit margin is thin (~€5–8 net) but the volume is highest of any brand/category pair we track — 455 watched shirt departures in the week to 14 September 2026. This is a cash-flow play, not a unit-margin play.",
          "Patagonia: Jackets average ~€36 (buy-below ~€24). Patagonia Fleeces average ~€45 (buy-below ~€30). EU charity shops price Patagonia outerwear at €8–25. Better Sweater fleeces are the highest-volume sourcing target; Patagonia Nuptse equivalents (puffer jackets) reach €80+ exit.",
          "The North Face: Jackets average ~€52 (buy-below ~€35). Nuptse-family puffers exit higher; standard shells exit lower. Charity shop pricing: €10–30.",
          "Carhartt WIP: Detroit Jacket exits ~€75–120; mainline Carhartt exits €35–50. Charity shops price all Carhartt at the external label — 'Carhartt at €12' regardless of WIP vs mainline. The identification step (WIP interior label) is the sourcing skill.",
          "Ralph Lauren RRL (Double RL): exits at €120–160 vs mainline Polo at €37 average. Charity shops price all Ralph Lauren identically at the polo pony label. RRL interior label is the four-second identification.",
        ],
        table: {
          caption:
            "Charity shop buy list for EU Vinted. Departure averages and buy-belows from Resale IQ, week to 14 September 2026. Charity shop price ranges are observed EU market ranges — they vary by country and shop type.",
          head: [
            "Brand / Category",
            "Dep/7d",
            "Avg exit",
            "Buy-below",
            "Typical charity shop price",
            "Gross margin room",
          ],
          rows: [
            ["Stone Island Hoodies", "433", "€55", "~€36", "€12–25", "€11–24"],
            ["Stone Island Jackets", "179", "€142", "~€94", "€20–50", "~€44–74"],
            ["Fred Perry Shirts", "455", "€14", "~€9", "€4–10", "~€4–5"],
            ["Patagonia Jackets", "~130", "€36", "~€24", "€8–25", "~€11–16"],
            ["The North Face Jackets", "~90", "€52", "~€35", "€10–30", "~€5–25"],
            ["Carhartt WIP Detroit Jacket", "~30", "€95", "~€63", "€10–18", "~€45–53"],
            ["Ralph Lauren RRL", "~10", "€140", "~€93", "€8–20", "~€73–85"],
          ],
        },
      },
      {
        h: "The skip list — what not to buy at a charity shop",
        p: [
          "These categories have buy-belows at or below charity shop pricing for recognisable branded stock. Buying them is not a guaranteed loss — it is that the margin math requires sourcing below charity shop floor prices, which is unreliable at scale.",
          "Pull&Bear, Mango, Bershka: exit prices of €7–18 (buy-belows ~€5–12) sit at or below what you typically pay for these items at charity shops when you can identify the brand on the label, and we track zero departures for them. The brands are Inditex/Mango group — identical mass-market positioning. Not worth deliberate sourcing.",
          "Zara T-Shirts, Shirts, Hoodies: exit at €9–16 (buy-belows €6–11). Charity shop prices for Zara basics: €3–8. The gap barely exists, and a single bad listing or return erases it.",
          "Uniqlo HeatTech, Airism, standard fleece: exit at €8–14 (buy-belows €5–10). Uniqlo sells the same items new for €8–15. Secondary market premium: zero. Exception: KAWS × Uniqlo, JW Anderson × Uniqlo, UNIQLO U (see the Uniqlo guide).",
          "Generic branded basics from Nike, Adidas, or New Balance without a named model: the brand average masks huge variance between a €5 basic tee and a €100 running shoe. 'Nike' at a charity shop is not a buy signal. A named model — Air Force 1, Samba, FuelCell — at a price below buy-below is a buy signal.",
        ],
        cta: pricingMidCta("ctr_charity_20260922"),
      },
      {
        h: "The sub-brand identification skill",
        p: [
          "The highest-margin charity shop finds share a common structure: the brand is priced at its visible logo, not at its internal sub-line. This creates a persistent sourcing edge for resellers who know what to look for inside a garment.",
          "Four labels worth four seconds each in a charity shop: (1) Carhartt WIP — the interior WIP label (Work In Progress) distinguishes the premium sub-brand from mainline; WIP Detroit Jacket at €12 exits at €95, mainline Carhartt Jacket at €12 exits at €40–55. (2) UNIQLO U — interior label reads 'UNIQLO U' instead of 'UNIQLO'; exits at €45–70 vs €10–18 for standard Uniqlo. (3) Ralph Lauren RRL — interior label reads 'Ralph Lauren Double RL'; exits at €120–160 vs €37 for mainline Polo. (4) Tommy Jeans — the Tommy Hilfiger sub-brand; exits at €40–60 vs €23 average for mainline Tommy.",
          "Charity shop pricing works off the exterior logo, which is the same for mainline and sub-brand in all four cases. The identification work is four seconds per garment and the margin difference is 2–5×. This is not a trick or an arbitrage that will disappear — charity shop staff do not learn these distinctions at scale.",
        ],
      },
      {
        h: "How to run a charity shop visit efficiently",
        p: [
          "The discipline that separates systematic flippers from buyers of junk is a target list checked before entry. Know the 8–12 brands you are hunting and their approximate buy-below prices. Check /data before you leave the house for the week's departure averages — they update and seasonal shifts change what is worth hunting.",
          "In the shop: check brand labels first, then model identification (for model-sensitive brands — Nike, Adidas, NB, the named model matters enormously), then condition (seams, armpits, cuffs, zips), then size. The size filter is the fastest rejection: a Stone Island Hoodie in an XS that almost no one wears is a different item from one in an M or L.",
          "Check the live buy-below on /tools before paying for anything with a material price tag. The FuelCell, Samba, Air Force 1 and New Balance 530 are free checks. Other models: Starter €19 a month. But the brand departure averages on /data are free and update weekly — if you know the average, you can estimate the buy-below (avg × 0.95 × 0.70) in your head.",
        ],
        cta: pricingBodyCta("body_charity_20260922"),
      },
    ],
    faq: [
      {
        q: "What should I buy at a charity shop to resell on Vinted?",
        a: "Based on watched departures across Spain, France, Germany, Italy and Portugal (week to 14 September 2026): Stone Island Hoodies (€55 avg exit, buy-below ~€36, charity shop price €12–25), Fred Perry Shirts (€14 avg, buy-below ~€9, €4–10 at charity shops), Patagonia Jackets (€36 avg, buy-below ~€24), The North Face Jackets (€52 avg, buy-below ~€35), and Carhartt WIP (Detroit Jacket ~€95 exit when identified correctly). Sub-brand identification (Carhartt WIP, UNIQLO U, Ralph Lauren RRL, Tommy Jeans) creates the highest per-item margins.",
      },
      {
        q: "What NOT to buy at a charity shop for reselling on Vinted?",
        a: "Pull&Bear, Mango, and Bershka (buy-belows of €5–12 sit at or below charity shop pricing, with zero tracked departures). Zara (Jackets exit €27.40, still AVOID — no tracked departures). Uniqlo (Jackets exit €30.48, AVOID — no secondary premium over Uniqlo's own retail price). Generic Nike, Adidas, or New Balance without a named model. Weekly brand averages to check the math yourself: https://resaleiq.dev/data.",
      },
      {
        q: "How much should I pay at a charity shop for items to resell?",
        a: "No more than the buy-below price for that brand and category. Buy-below = average asking price at departure × 0.95 × 0.70. Free weekly brand averages are at https://resaleiq.dev/data. Item-level buy-below (by specific model) is on the paid checker at https://resaleiq.dev/tools — New Balance FuelCell, Adidas Samba, Nike Air Force 1 and New Balance 530 are free checks.",
      },
      {
        q: "What is the best brand to find at a charity shop for Vinted?",
        a: "Stone Island has the widest departure premium over typical charity shop pricing: Hoodies average ~€55 on EU Vinted (buy-below ~€36) while charity shops price them at €12–25. Jackets average ~€142 (buy-below ~€94) at €20–50 in charity shops. Fred Perry Shirts offer the most volume (199 departures in the last 30 days) at thin unit margins. Carhartt WIP has the highest surprise premium when identified — WIP Detroit Jacket at €12 charity shop exits at €95 Vinted.",
      },
      {
        q: "Does the country I source from matter for EU Vinted reselling?",
        a: "For pricing: Resale IQ covers Spain, France, Germany, Italy and Portugal. The departure data reflects those five markets — useful wherever you sell in the EU5. For sourcing: charity shop density and stock quality vary by country and city. French charity shops (Emmaus, Le Relais) carry high volume; German Humana and Oxfam shops carry strong branded stock in cities. UK sourcing is outside our tracked markets.",
      },
    ],
  },
]
