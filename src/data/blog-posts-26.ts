// Batch 26 of SEO/AEO articles. Same contract as blog-posts.ts.
// Honest claims only: no earnings guarantees. Data references departure averages only.
// All departure data from /api/public/market-snapshot (2026-09-15 build).

import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

export const POSTS_26: BlogPost[] = [
  {
    slug: "how-to-sell-on-vinted-and-make-money",
    title: "How to Sell on Vinted and Actually Make Money (2026 Guide)",
    seoTitle: "How to Sell on Vinted and Make Money (2026) — Resale IQ",
    description:
      "The complete Vinted seller guide: account setup, photography, pricing, listing copy, promoted listings, and sourcing items at the right buy-below price. Practical method, not generic advice.",
    date: "2026-09-15",
    category: "Platforms",
    readMins: 14,
    preflightQuery: "New Balance 550",
    intro:
      "Vinted has over 65 million members and no seller fees — which makes it the highest-margin resale platform in Europe for most categories. But no seller fees also means more competition: every seller on Vinted is keeping a larger share of the price, so items that aren't priced and presented well simply don't move. This guide covers the full method — from setting up your account correctly to sourcing items below the market floor — so you are not guessing at each step.",
    definedTerm: {
      name: "Vinted buy-below price",
      description:
        "The Vinted buy-below price is the maximum sourcing cost at which buying an item leaves a defensible margin after platform fees and shipping when listed at the current EU Vinted departure average for that brand and category. It is calculated from watched departure data — items that actually left the shelf — not listed prices. Sourcing above the buy-below ceiling makes profit contingent on above-average exit prices, which by definition cannot be reliably planned for.",
    },
    sections: [
      {
        h: "Setting up your Vinted account to signal trust",
        p: [
          "Vinted's algorithm and buyers both use your profile completeness as a trust proxy. A profile photo, a brief description of what you sell, and a verified phone number lift click-through rates on individual listings — buyers on Vinted browse seller profiles before purchasing more than on most other platforms. Set a clear profile photo (your face or a clean brand logo if you operate as a shop identity), write two to three sentences describing your niche, and verify your ID if you plan to sell more than €2,000/year in France or Germany (where fiscal reporting thresholds apply).",
          "Connect your preferred payout method before you list your first item. Vinted holds funds for a release window after the buyer confirms receipt — typically 2–5 days. Set up bank transfer or PayPal as your withdrawal method upfront so funds release to you without delays when you start selling.",
          "Turn on Vinted's buyer reviews visibility in your profile settings. New sellers with zero reviews convert at lower rates. If you have purchases as a buyer on the platform, those reviews are visible to sellers and help establish that you are an active, verified platform member — which reduces buyer hesitation on your first sales.",
        ],
      },
      {
        h: "Photography: the single highest-ROI investment on Vinted",
        p: [
          "Vinted is a visual platform. The main listing photo determines whether a buyer clicks or scrolls past — everything else is secondary. Use a neutral background (white wall, light grey, or clean floor) and natural daylight when possible. Avoid filters. Buyers are looking for accurate colour representation, not styled editorial shots.",
          "For clothing: lay flat or hang the item. For outerwear and structured pieces, hanging on a plain hanger against a wall gives the best shape representation. For knitwear and casual pieces, a flat lay on a clean surface works better. Include at minimum: one full front shot, one full back shot, one close-up of any branding or label detail, and one close-up of any condition issue you are disclosing. Four to six photos is the standard for items priced above €20. Buyers who message asking for more photos they could have seen upfront convert at lower rates.",
          "Colour accuracy matters more than brightness. If your item photographs darker than it looks in person, shoot near a window with the item facing the light — do not compensate with editing filters. A yellow vintage jacket photographed accurately at €35 will sell faster than the same jacket brightened to look gold and then returned when the buyer is disappointed.",
        ],
        cta: pricingMidCta("ctr_vinted_sell_20260915"),
      },
      {
        h: "Pricing on Vinted: using departure data, not listing walls",
        p: [
          "The most common Vinted pricing mistake is searching the platform for the same item, looking at what others are listing it for, and pricing similarly. That method prices you against listings, not against transactions. Vinted does not expose sold price history directly — so the listing wall you are benchmarking against may include items that have been sitting unsold for months.",
          "The correct method: use sold comps from eBay's 'Sold Items' filter for the brand, style, and approximate condition to get a transaction-based anchor. Then adjust for Vinted's pricing environment. Vinted EU exit prices for tracked brands — what items actually departed the platform at — run 15–35% below eBay Completed sales for the same category, because Vinted's buyer base skews toward value and the platform's search algorithm rewards competitive pricing.",
          "For EU sellers, the most reliable shortcut is departure data: the average price at which items in a given brand and category actually left the Vinted marketplace. ResaleIQ's [departure data](" + ilinkHref("data") + ") tracks this across five EU markets (France, Germany, Spain, Italy, Portugal). For the brands it covers — including Carhartt, The North Face, Nike, Adidas, and 24 others — you can see the current average exit price and use it as your pricing anchor, adjusted only for your specific item's condition and any notable desirability features.",
          "Vinted has no seller fees, but it does charge a buyer protection fee (paid by the buyer). This means you do not need to pad your price for platform fees the way you do on Depop (10%) or eBay (up to 12.8%). Your listed price is close to your net price, minus shipping if you offer it included. This makes Vinted the highest-margin per-item platform for most categories, provided you exit at the right price — which requires knowing the current market exit price, not the listing price.",
        ],
        table: {
          caption:
            "Fee structure comparison: Vinted vs Depop vs eBay. Fees are approximate and as of 2026; always check current platform terms. 'Net from €40 sale' assumes a €40 selling price.",
          head: [
            "Platform",
            "Seller fee",
            "Payment processing",
            "Net from €40 sale",
          ],
          rows: [
            ["Vinted", "0%", "Covered by buyer protection fee", "~€40"],
            ["Depop", "10%", "~2.9% + €0.30", "~€34.68"],
            ["eBay (fixed price)", "Up to 12.8%", "~2.5%", "~€33.88"],
          ],
        },
      },
      {
        h: "Writing listing copy that converts — title and description",
        p: [
          "Vinted's search algorithm uses the title and description text for keyword matching. Unlike SEO, you are not optimising for one long-tail phrase — you are putting in every accurate term a buyer might search for. A title like 'Carhartt Detroit Jacket Brown Canvas Vintage 1990s L' performs better than 'Carhartt Jacket' because it surfaces in searches for 'Carhartt Detroit', 'Carhartt canvas jacket', 'vintage workwear jacket', and 'brown Carhartt' simultaneously.",
          "The title formula: [Brand] [Product type] [Colour] [Material if distinctive] [Era/style if relevant] [Size]. Keep it factual — Vinted's search is keyword-based, not semantic. Include the model name or product line when relevant (e.g., 'The North Face Nuptse' not 'The North Face jacket').",
          "In the description, lead with condition and any notable details. State the measurements (pit-to-pit, length, shoulder width for tops; waist and inseam for bottoms) — listings with measurements get fewer 'what are the measurements?' messages, which means faster conversions. Disclose every flaw you have photographed. Buyers who buy knowing the flaws do not return items; buyers who discover undisclosed flaws on receipt do.",
          "Avoid: listing copy written entirely in capital letters, emoji-heavy descriptions, vague phrases like 'great condition' without specifying what that means, and any claim you cannot verify (e.g., 'authentic vintage 1985' unless you can cite the label evidence).",
        ],
      },
      {
        h: "Promoted listings: when they are worth it and when they are not",
        p: [
          "Vinted offers 'Wardrobe Spotlight' (boosted visibility for your entire wardrobe for a fixed period) and item-level bumps that resurface specific listings in search results. These are paid by the seller and reduce net margin.",
          "Wardrobe Spotlight is worth considering for sellers with 10+ active listings in a cohesive niche — if your entire wardrobe is vintage sportswear, a spotlight drives relevant buyers through a curated selection. For mixed or thin wardrobes, the fixed cost is rarely recovered.",
          "Item-level bumps are most effective on items that have views but no messages — meaning the price and photos are working, but the item has dropped off search recency. Before paying for a bump, check: has the item been relisted recently? Is the price within 10% of current market exit for that category? If not, relist and reprice first — that is free and achieves the same recency effect as a paid bump. Reserve paid bumps for items you are confident are priced correctly and merely need fresh exposure.",
          "A rule of thumb: promoted listing cost should be no more than 15% of the item's target selling price. On a €20 item, a €3 bump is a 15% margin hit that is rarely justified unless the item has high confidence of selling within the boost window.",
        ],
        cta: pricingBodyCta("body_vinted_sell_20260915"),
      },
      {
        h: "Sourcing items to sell on Vinted: the buy-below method",
        p: [
          "The fastest way to make money selling on Vinted consistently is to source items below the market's current exit price for that brand and category. 'Below the market' is not a guess — it is a calculable threshold. If the EU Vinted departure average for Carhartt canvas jackets in Good condition is €38, and your target margin after sourcing, photography time, and any restoration is 40%, your buy-below price is €27. At €27 sourcing cost, you list at €38, exit at the market rate, and hit your margin target.",
          "The buy-below price changes as departure averages shift. In a category with falling exit prices (too much supply entering the market), your buy-below threshold drops — if you sourced at €27 three months ago and the departure average is now €32, you have lost margin. Tracking current departure averages is not optional if you are buying to resell rather than clearing your own wardrobe.",
          "ResaleIQ's [flip tool](" + ilinkHref("flip") + ") calculates the buy-below price per brand using current EU departure data. Enter the brand, check the current departure average, and read off the buy-below ceiling at your target margin. For sellers sourcing from charity shops, markets, or car boot sales, this replaces the mental arithmetic of trying to guess whether an item at €8 in a charity shop is worth listing.",
          "Sourcing channels in order of margin potential: (1) Charity shops and bric-a-brac markets — highest margin, requires volume browsing; (2) Buying collections from people clearing wardrobe space (post on local buy/sell groups) — good margin, occasional bulk; (3) Buying underpriced items on Vinted itself and relisting with better photography and copy — lower margin, scales with browsing time; (4) Wholesale vintage bales — high volume, variable quality, requires sorting time and storage. For most individual sellers, channels 1 and 3 in combination produce the best margin-to-time ratio.",
        ],
        table: {
          caption:
            "Buy-below example for Vinted EU (France/Germany market). Departure averages are illustrative of the method — check current data before sourcing decisions.",
          head: [
            "Brand/item",
            "Departure avg (Good cond.)",
            "Target margin 40%",
            "Buy-below ceiling",
          ],
          rows: [
            ["Carhartt Detroit jacket", "€38", "40%", "€23"],
            ["The North Face Nuptse", "€62", "40%", "€37"],
            ["Champion reverse weave", "€34", "40%", "€20"],
            ["Nike Air Max 90 (EU 42)", "€72", "40%", "€43"],
            ["Levi's 501 (W32 L30)", "€28", "40%", "€17"],
          ],
        },
      },
    ],
    faq: [
      {
        q: "How do I sell on Vinted and make money?",
        a: "Source items below the current EU departure average for that brand and category, photograph them accurately on a clean background with 4–6 shots, write keyword-rich titles (Brand + product + colour + era + size), and price from transaction data — not from what other sellers are listing. Vinted has no seller fees, so your net from each sale is close to your listed price. The margin lives in the sourcing decision, not the listing.",
      },
      {
        q: "How much can you make selling on Vinted?",
        a: "There is no guaranteed amount — it depends on what you source, at what cost, and at what exit price. Sellers who source systematically below the market departure average and list with accurate photography can target 35–50% gross margin per item. A seller moving 20 items a month at an average €30 exit price and 40% gross margin generates €240/month gross before time costs. Scaling requires either more volume or higher-value items (or both).",
      },
      {
        q: "Does Vinted charge seller fees?",
        a: "Vinted charges no seller fees. Buyers pay a buyer protection fee on each transaction, which covers payment processing. As a seller, your net proceeds are your listed price minus any shipping cost you absorb. This makes Vinted higher margin per item than Depop (10% seller fee) or eBay (up to 12.8%) for the same exit price.",
      },
      {
        q: "What sells best on Vinted?",
        a: "The fastest-moving categories on EU Vinted are: branded casualwear (Nike, Adidas, Champion), vintage workwear (Carhartt, Dickies), 1990s outdoor (The North Face, Columbia fleece), Levi's denim, and fast-fashion brands (Zara, H&M, Mango) for buyer demographics that want low prices on known styles. Higher-margin items are branded vintage where departure averages run €35–80. Departure data for tracked brands shows current exit prices and sell-through velocity per market.",
      },
      {
        q: "How do I get more views on Vinted?",
        a: "Recency matters — Vinted's search defaults to 'Recently added'. Relisting items that haven't sold every 7–14 days restores recency for free. Title keywords drive search visibility — include the full brand name, product type, colour, and size. Strong main photos increase click-through from search results. Competitive pricing (within 10% of current market exit) reduces view-to-message drop-off. Paid bumps are a last resort after optimising title, photo, and price.",
      },
      {
        q: "What is the best way to price items on Vinted?",
        a: "Use transaction data, not listed prices. Pull sold comps from eBay's 'Sold Items' filter for the same brand, style, and condition. Adjust 15–35% downward for Vinted's EU pricing environment. For tracked brands (Nike, Carhartt, The North Face, Champion, and others), departure data — actual exit prices from EU Vinted markets — gives you the current market rate directly without manual comp research.",
      },
    ],
  },
]
