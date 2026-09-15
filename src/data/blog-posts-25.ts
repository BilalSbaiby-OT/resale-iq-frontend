// Batch 25 of SEO/AEO articles. Same contract as blog-posts.ts.
// Honest claims only: no earnings guarantees. Pricing guidance based on published market data.
// All departure data from /api/public/market-snapshot (2026-09-15 build).

import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

export const POSTS_25: BlogPost[] = [
  {
    slug: "how-to-price-vintage-clothing",
    title: "How to Price Vintage Clothing: What Your Items Are Actually Worth",
    seoTitle: "How to Price Vintage Clothing (2026) — Resale IQ",
    description:
      "How to value vintage clothing before you list it: the four pricing signals, how to read sold comps, the era premium, and what kills value. A practical method, not a guess.",
    date: "2026-09-15",
    category: "Pricing",
    readMins: 12,
    intro:
      "Most vintage sellers either underprice (leaving money on the table) or overprice (leaving the item on the shelf). The difference is a pricing method. Vintage clothing has four distinct value signals that don't apply to new or modern secondhand — era, condition, desirability, and platform fit. Get those four inputs right and your pricing is defensible. Here is how to do it.",
    definedTerm: {
      name: "Vintage clothing floor price",
      description:
        "The vintage clothing floor price is the lowest price at which a specific item in its condition tier has recently sold (not just listed) on a comparable platform. It is derived from sold comps, not asking prices, and represents the minimum defensible starting point for pricing — below which you are leaving measurable money on the table. The floor rises with era desirability, label provenance, and condition grade.",
    },
    sections: [
      {
        h: "Why guesswork underprices vintage — and sold comps fix it",
        p: [
          "The single most common vintage pricing mistake is using current listed prices as a benchmark. Listed prices are aspirations, not transactions. A rack of 1990s denim jackets at €45 each means nothing if none of them sold. Sold comps — the price at which completed transactions closed — are the only honest pricing signal.",
          "On eBay, filter by 'Sold Items' under the search refinements. On Depop, tap the item, then 'View similar items sold'. On Vinted, the platform does not expose sold price history directly, but departure data from tracked markets gives you exit-price distributions for the most-moved brands — showing what actually left the shelf and at what price.",
          "The gap between listed and sold is often 30–50% on vintage items. A 1990s Carhartt Detroit jacket with 200 active listings at €60–90 may have a median sold price of €42 on Vinted and €58 on Depop. Those two numbers — not the listing wall — are your anchors.",
        ],
      },
      {
        h: "The four signals that set a vintage item's value",
        p: [
          "Signal 1: Era. Decade and sub-era matter more than most sellers realise. A 1993 Champion reverse weave sweatshirt commands a meaningful premium over a 2001 version of the same design — the earlier piece carries collector interest, print location details, and a manufacturing spec that later runs lack. The Y2K era (1997–2003) currently commands a premium driven by a younger buyer demographic. 1980s pieces sit at the next tier; earlier decades command premiums for documented rarity. Pinpoint the era from the label (care label legislation, union labels, made-in tags) before pricing.",
          "Signal 2: Condition. The industry shorthand runs: Deadstock (unworn with tags) → Excellent (worn, no visible flaws) → Very Good (minimal wear, no damage) → Good (light fading or minor wear consistent with era) → Fair (visible damage, repairs, or heavy fading). Each tier down discounts the item 15–35% from the tier above. 'Vintage condition' is not a grade — it is a category dodge. Buyers who know vintage penalise ungraded listings or simply skip them.",
          "Signal 3: Desirability. Brand alone doesn't set value — the specific label, colourway, and style do. A Stone Island badge from the early 1990s on a shadow project piece is not the same as a generic 2015 Stone Island crew neck. Desirability is set by: (a) the presence of identifying features collectors seek (print location on Champion, double-F on Fila, triangle logo on Carhartt), (b) search volume for the specific piece, and (c) cross-platform scarcity. Search Depop for the exact style — if similar sold results are thin, that indicates scarcity, not low demand.",
          "Signal 4: Platform fit. The same item has a different ceiling on different platforms. A curated 1990s ski jacket may exit at €35 on Vinted, €55 on Depop, and €80 on eBay in an auction with the right title tags. Platform selection multiplies the intrinsic value. Underestimating platform fit is how sellers leave 30–50% on the table without realising it.",
        ],
        table: {
          caption:
            "Condition tier definitions and typical price impact. Percentage ranges are indicative; actual impact depends on era and desirability.",
          head: [
            "Condition tier",
            "Definition",
            "Price vs Excellent grade",
          ],
          rows: [
            [
              "Deadstock",
              "Unworn with original tags, no signs of use",
              "+40–100%",
            ],
            ["Excellent", "Worn, no visible flaws, full colour", "Baseline"],
            [
              "Very Good",
              "Light wear, no damage, minor softening of fabric",
              "-10–20%",
            ],
            [
              "Good",
              "Light fading consistent with era, no damage",
              "-20–35%",
            ],
            [
              "Fair",
              "Visible damage, repairs, heavy fading, odour",
              "-40–60% or unsaleable",
            ],
          ],
        },
        cta: pricingMidCta("ctr_vintage_pricing_20260915"),
      },
      {
        h: "How to read era from the label — without guessing",
        p: [
          "The care label is the fastest era signal. US care labelling became mandatory in 1971 — any item without washing instructions is pre-1971. The RN number on US garments (Registered Number, found on the care label or main label) can be looked up in the FTC's database to narrow the manufacturing window to a few years. On EU items, the country-of-origin tag changed significantly after 1993 — 'Made in EC' or member-state names pre-1993 are a positive signal.",
          "Specific brand tells: Champion's 'C' logo moved from the left chest to centre chest in the late 1980s; the reverse weave construction tag ('Reverse Weave' in a specific block font) dates specific production windows. Carhartt's Detroit jacket label changed from a woven label with specific colourways in the 1980s–1990s to embroidered patches in later versions. Fila's double-F logo on a heritage cream/navy colourway dates to specific decades. These brand-specific dating signals are what experienced vintage buyers check first — your listing copy should mention them to attract those buyers.",
          "If you cannot pin the era within a decade, say so honestly. An unlabelled item listed as '1990s' when it might be 2005 will generate returns and negative feedback. 'Estimated 1990s based on label details' is a more defensible claim than asserting it without evidence.",
        ],
      },
      {
        h: "Applying the pricing formula step by step",
        p: [
          "Step 1: Pull 5–10 sold comps for the exact item (brand + style + era + approximate condition). Use eBay sold listings as your broadest data source, then cross-check with Depop sold items for the same keyword. Record the median sold price — discard the top and bottom outlier if the range is wide.",
          "Step 2: Apply your condition adjustment. If your item is Very Good and the median sold comp is Excellent, apply a 10–20% discount. If your item has a detail collectors value (correct label era, rare colourway) and the sold comps are more generic, add 15–30%.",
          "Step 3: Apply the platform multiplier. If you are listing on Depop and the sold comps are Vinted exits, add 30–50% for curated vintage. If you are listing on eBay as an auction, the median sold comp is a reasonable starting reserve — do not anchor the auction price too high or bidding stalls. If you are listing on Vinted, the EU departure average for tracked brands (available via ResaleIQ's [departure data](" + ilinkHref("data") + ")) gives you the current market exit price without needing to manually scrape comps.",
          "Step 4: Set floor, target, and ceiling. Floor = the price below which you will pull the item rather than sell (factor in sourcing cost, time, and platform fees). Target = your best estimate of market value given comps and condition. Ceiling = the highest you could realistically achieve on the best-fit platform. List at target; if the item stalls for 14 days, drop to mid-target; if it stalls another 14 days, decide between floor or relisting on a different platform.",
        ],
        table: {
          caption:
            "Worked example. 1990s Champion reverse weave sweatshirt, Very Good condition, EU listing.",
          head: ["Step", "Input", "Result"],
          rows: [
            [
              "Sold comps (eBay)",
              "5 Excellent-grade sold: €38, €42, €45, €48, €52",
              "Median: €45",
            ],
            [
              "Condition adjustment",
              "Very Good = -15% from Excellent baseline",
              "€38.25 → round to €38",
            ],
            [
              "Era premium",
              "Confirmed 1993 from label (pre-triangle logo)",
              "+20% → €46",
            ],
            [
              "Platform: Vinted EU",
              "No seller fee — no discount needed for fees",
              "List target: €46",
            ],
            [
              "Platform: Depop",
              "10% fee + processing — add ~14% to net same margin",
              "List target: €52–54",
            ],
            [
              "Floor (sourced at €12)",
              "Minimum viable at Vinted (0% fee)",
              "Floor: €18 (1.5× cost)",
            ],
          ],
        },
      },
      {
        h: "What kills vintage clothing value — and what it's often worth anyway",
        p: [
          "Odour is the single highest-return fixable issue in vintage. Most musty or light smoke smells come out of natural fibres with an overnight soak in cold water + white vinegar, followed by air drying away from direct sun. Restoring a Fair-grade odour item to Good can add €10–20 to the final price on a €40 item — a higher return on time than almost any other action. Confirm the smell is gone before photographing.",
          "Fading is usually not a defect on vintage — it is a signal of authenticity on naturally faded items. Uniform fading consistent with age is priced in the condition tier. Uneven fading (bleach spots, sun stripe across a shoulder) is damage. The distinction matters for pricing and for listing copy accuracy.",
          "Missing hardware — a broken zip, a missing button — is often restorable for under €2 in materials. A Carhartt jacket with a broken zip that would sell for €35 in Good condition is frequently worth €50–55 with the zip replaced and listed as Excellent. Source compatible replacements by brand and generation before deciding to list damaged.",
          "Tears and seam failures on heavy-duty vintage (canvas, denim, wool) are worth repairing before listing only when the repair cost plus your time is less than 25% of the price improvement it delivers. On lightweight vintage (nylon, fine knit), repairs are rarely worth the time — price the damage into the listing or part out for brand/label.",
        ],
        cta: pricingBodyCta("body_vintage_pricing_20260915"),
      },
      {
        h: "Where ResaleIQ fits in a vintage pricing workflow",
        p: [
          "ResaleIQ tracks watched departures — items actually leaving the shelf — across EU Vinted markets (France, Germany, Spain, Italy, Portugal) for 28 tracked brands. For vintage sellers operating in EU markets, this data gives you the current exit-price distribution per brand and category without manually scraping sold comps.",
          "The [flip tool](" + ilinkHref("flip") + ") gives you buy-below ceilings by brand: the price at which sourcing the item leaves a defensible margin after platform fees. For vintage pricing specifically, you start from the EU Vinted departure average (the floor) and apply the era, condition, and platform adjustments described above to land at your target.",
          "Use ResaleIQ to confirm that the brand and category you are pricing has active sell-through — that items are actually leaving the shelf rather than accumulating. A brand with slow departures needs a more aggressive floor price to move in a reasonable window. A brand with fast departures gives you room to price at or above the market average and still exit within two weeks.",
        ],
      },
    ],
    faq: [
      {
        q: "How much should I charge for vintage clothes?",
        a: "Price vintage clothing from sold comps, not listed prices. Pull 5–10 completed sales for the same brand, style, era, and approximate condition on eBay or Depop. Take the median, apply a condition adjustment (Very Good = -10–20% from Excellent baseline), then apply the platform premium if listing on Depop or eBay vs Vinted. The result is a defensible asking price, not a guess.",
      },
      {
        q: "How do I know if my vintage item is worth anything?",
        a: "Check the era (label dating), condition (use the five-tier grading system), brand desirability (collector demand for the specific style, not just the brand name), and platform fit (where the buyers for this item actually are). Then search eBay sold listings for the closest match. If there are multiple recent sold results above €30, the item has a market. If there are none, pricing it optimistically will result in a stale listing.",
      },
      {
        q: "What is the best way to price vintage clothing for resale?",
        a: "Set three prices: a floor (sourcing cost × 1.5 minimum), a target (sold comps median adjusted for condition and era), and a ceiling (the best achievable on the right platform with strong presentation). List at the target, drop to mid-target after 14 days if unsold, and decide between floor or relisting on a different platform after 28 days. Never price below floor.",
      },
      {
        q: "Does condition affect vintage clothing price?",
        a: "Yes, significantly. Deadstock (unworn with tags) can command 40–100% above an Excellent-grade item. Each condition tier down discounts the piece 15–35% from the one above. Fair condition items (visible damage, odour, or heavy fading) may be unsaleable at any price on premium platforms. Grading condition honestly in your listing also reduces disputes and returns.",
      },
      {
        q: "How do I date vintage clothing to price it correctly?",
        a: "Read the care label — US washing instruction labels became mandatory in 1971. The RN number on US garments can be looked up in the FTC database to narrow the manufacturing window. Brand-specific signals (Champion C-logo placement, Carhartt label style, Fila logo version) help pin sub-era. 'Made in' country details on EU items changed significantly in 1993. If you cannot confirm the era, say 'estimated 1990s based on label details' rather than asserting it.",
      },
      {
        q: "What vintage brands sell best on Vinted?",
        a: "On EU Vinted markets, the fastest-moving vintage brands tracked by departure data include Carhartt (WIP and original Detroit), Champion (reverse weave and printed), The North Face (1990s fleece and nylon), Tommy Hilfiger (1990s colourblock), and Levi's (501, 505, type III denim jacket). Exit prices and velocity vary by market — France and Germany lead departure volume. ResaleIQ's departure data shows current exit prices and sell-through velocity per brand.",
      },
    ],
  },
]
