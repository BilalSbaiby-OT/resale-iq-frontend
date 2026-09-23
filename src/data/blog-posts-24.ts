// Batch 24 of SEO/AEO articles. Same contract as blog-posts.ts.
// Honest claims only: no earnings guarantees. Platform comparisons based on published fee schedules.
// All departure data from /api/public/market-snapshot (2026-09-15 build).

import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

export const POSTS_24: BlogPost[] = [
  {
    slug: "vinted-vs-depop-vs-ebay-for-sellers",
    title: "Vinted vs Depop vs eBay: Which Platform Makes You More Money?",
    seoTitle: "Vinted vs Depop vs eBay for Sellers (2026) — Resale IQ",
    description:
      "Vinted, Depop, and eBay compared on fees, audience, speed, and category fit. Which platform pays more for which item — and how to pick before you list.",
    date: "2026-09-15",
    category: "Platforms",
    readMins: 11,
    preflightQuery: "Nike Air Force 1",
    intro:
      "Three platforms. Very different fee structures, audiences, and category fits. The question isn't which is 'best' — it's which is best for this item. A Fred Perry polo that exits at €17 on Vinted may fetch €28 on Depop and £12 on eBay. The platform choice is a sourcing and pricing decision, not a brand loyalty one. Here is the complete breakdown.",
    definedTerm: {
      name: "Platform net margin",
      description:
        "Platform net margin is what you keep after all platform fees, payment processing, and shipping costs are deducted from the sale price — before your sourcing cost. Vinted charges no seller commission on most sales; Depop charges 10% + payment processing (typically 2.9% + €0.30); eBay charges 12.9%–15% final value fee depending on category and account level, plus payment processing.",
    },
    sections: [
      {
        h: "The fee structure — what each platform actually takes",
        p: [
          "Vinted's fee model is buyer-pays: sellers pay nothing on the sale, and Vinted charges a buyer protection fee (3–8% depending on order value) to the buyer. Your €20 listing earns you €20, minus any optional promoted listing spend. For EU sellers, this is the highest net margin of the three platforms on everyday fashion items under €50.",
          "Depop charges a 10% selling fee to the seller, plus payment processing (typically 2.9% + a fixed fee). On a €25 sale you net roughly €21.55. For US-market sales, Depop also bundles in shipping label costs differently. The 10% commission is fixed regardless of category or account tier.",
          "eBay charges a final value fee of 12.9–15% depending on category and whether you have a store subscription. Fashion (Clothing, Shoes & Accessories) runs at 12.9% for most sellers plus managed payments processing (around 0.3% + €0.25). On a €25 sale you keep roughly €21.25. eBay's free listing allowance (250 per month for private sellers on most EU markets) means no insertion fee in normal use.",
        ],
        table: {
          caption: "Fee comparison across three platforms. Seller fees on a hypothetical €25 sale. Buyer-paid fees excluded from seller column.",
          head: ["Platform", "Seller commission", "Payment processing", "Net on €25 sale", "Fee model type"],
          rows: [
            ["Vinted", "0%", "0% (seller)", "€25.00", "Buyer-pays protection fee"],
            ["Depop", "10%", "~2.9% + €0.30", "~€21.55", "Seller commission + processing"],
            ["eBay", "~12.9%", "~0.3% + €0.25", "~€21.15", "Final value fee + managed payments"],
          ],
        },
      },
      {
        h: "Where each platform's buyers actually are",
        p: [
          "Vinted's active buyer base is concentrated in France, Germany, Spain, Poland, Belgium, and the Netherlands. The platform dominates EU casual and branded secondhand fashion. Its buyer demographic skews younger (18–35), price-sensitive, and focused on everyday wear: branded hoodies, trainers, denim, and outerwear. Average transaction values are lower, but sell-through on demand-confirmed items is fast.",
          "Depop's stronghold is the US and the UK, with a secondary audience in Australia and parts of Western Europe. The buyer demographic is younger still (16–28), trend-driven, and willing to pay a premium for curated vintage, Y2K, reworked items, and niche streetwear. Average transaction values are higher, but sell-through is slower and searchability requires strong photography and tagging.",
          "eBay reaches the widest global audience of the three: 130 million active buyers across every demographic. EU and US audiences are both significant. eBay wins on rare items, collectables, niche sizes, technical gear, and anything that benefits from bidding competition. It is the natural home for items with a dedicated collector audience — rare Jordan colourways, vintage Levi's deadstock, branded sportswear in unusual sizes.",
        ],
        table: {
          caption: "Primary platform audience and sweet spots by item type.",
          head: ["Platform", "Core geography", "Buyer age (approx)", "Sweet-spot items", "Avg transaction"],
          rows: [
            ["Vinted", "EU (FR, DE, ES, PL, BE, NL)", "18–35", "Branded everyday fashion, outerwear, trainers", "€10–€35"],
            ["Depop", "US, UK, AU", "16–28", "Vintage, Y2K, reworked, curated streetwear", "€25–€80"],
            ["eBay", "Global (US+EU primary)", "All", "Rare/collectable, niche sizes, technical gear", "€15–€200+"],
          ],
        },
        cta: pricingMidCta("ctr_platform_compare_20260915"),
      },
      {
        h: "Which categories win on which platform",
        p: [
          "Everyday branded fashion — Fred Perry, Carhartt, The North Face, Tommy Hilfiger, Levi's basics — sells faster on Vinted than anywhere else in the EU. The volume of EU buyers combined with zero seller fees means you consistently net more per sale on items under €40 than on Depop or eBay.",
          "Curated vintage and Y2K moves better on Depop. A 1990s Carhartt Detroit jacket in good condition may fetch €35 on Vinted but €55–70 on Depop from a buyer who values the curation and story. The fee difference narrows the gap — but for premium vintage the higher exit price on Depop wins the calculation. Photography quality and account reputation matter far more on Depop than on Vinted.",
          "Collectables, rare sizes, and anything with an active resale community perform best on eBay. A Stone Island shadow project jacket, a limited Jordan colourway, or a vintage Levi's type III in a rare size all benefit from eBay's auction mechanic and global reach. Items with a dedicated community of buyers bidding against each other consistently exceed fixed-price listings on EU platforms.",
        ],
        table: {
          caption: "Platform by category fit. Best = highest expected net return for this item type. Good = viable with caveats.",
          head: ["Category", "Vinted", "Depop", "eBay"],
          rows: [
            ["Everyday branded fashion (€10–€35)", "Best", "Viable", "Slower"],
            ["Premium streetwear (€40–€120)", "Good", "Best (US/UK buyer)", "Good"],
            ["Curated vintage / Y2K", "Viable", "Best", "Good"],
            ["Rare / collectable / limited", "Viable", "Viable", "Best"],
            ["Technical outdoor gear", "Good", "Poor fit", "Best"],
            ["Niche or unusual sizes", "Limited audience", "Limited audience", "Best (global reach)"],
          ],
        },
      },
      {
        h: "Speed versus price: the trade you have to name",
        p: [
          "Vinted's high buyer volume means fast sell-through on demand-confirmed items. A Fred Perry polo priced at market typically exits within 7 days in France or Germany. The trade-off is exit price: EU buyers are price-sensitive and the platform's search surfaces lower-priced alternatives directly. Pricing above market slows or stalls your listing.",
          "Depop's slower average sell-through (2–4 weeks for most fashion items) is the cost of the premium price ceiling. Buyers are browsing accounts, not just searching by keyword — your account aesthetic and posting consistency matter. For sellers with a strong visual brand and time to curate, Depop's exit prices on fashion and vintage justify the slower pace. For volume resellers turning stock weekly, it introduces cash-flow friction.",
          "eBay sits between the two on speed: fixed-price listings move at Vinted-comparable pace for in-demand items, while auctions can either race to a premium or stall at reserve. eBay's broad reach also means your item competes with more supply — on commodity fashion, the EU Vinted-native audience simply outbids eBay's fashion segment by volume.",
        ],
      },
      {
        h: "How to pick platform per item, not per shop",
        p: [
          "The fastest decision framework: ask three questions. First, is this item primarily wanted by EU buyers? If yes, Vinted is the fee-efficient default. Second, is this item vintage, curated, or Y2K with a story to tell? If yes, try Depop first, especially if you have an account with followers. Third, is this item rare, collectible, or niche-sized? If yes, eBay's global reach and auction mechanic give you the best shot at a ceiling price.",
          "For items that sit between categories, run the net margin calculation per platform before listing. Take the likely sale price on each platform (use recent sold comps), subtract the fee percentage, and compare. On a €30 item the fee delta between Vinted (€0) and eBay (€3.87–€4.50) is meaningful but not decisive. On a €100 item the same delta is €12–15 — enough to change the decision.",
          "Cross-listing makes sense when the time cost is low. Listing the same item on Vinted and eBay simultaneously doubles your buyer pool for no extra fee (Vinted is free to list; eBay's 250 free monthly listings cover most private sellers). The risk is double-selling: use a single-item deletion workflow once sold, or Depop's inventory management if you list there too. [ResaleIQ's departure data](" + ilinkHref("data") + ") shows which items are moving fastest on Vinted right now — letting you prioritise which items are worth the cross-list effort.",
        ],
        table: {
          caption: "Quick decision guide. Check against your item before listing.",
          head: ["Item type", "Primary platform", "Consider also"],
          rows: [
            ["EU everyday branded fashion", "Vinted", "eBay if niche size"],
            ["Premium streetwear, recent hype", "Vinted (EU) or Depop (US/UK)", "eBay for rare colourways"],
            ["1990s–2000s vintage, Y2K", "Depop", "Vinted for fast exit"],
            ["Rare / collectable", "eBay (auction)", "Depop for niche streetwear community"],
            ["Outdoor / technical gear", "eBay or Vinted", "Avoid Depop"],
            ["Unusual or large sizes", "eBay (global)", "Vinted (EU)"],
          ],
        },
        cta: pricingBodyCta("body_platform_compare_20260915"),
      },
      {
        h: "Where ResaleIQ fits in a multi-platform strategy",
        p: [
          "Whatever platform you choose, the sourcing decision happens before the listing. Buying an item at a price that leaves margin after platform fees is the only lever you fully control. ResaleIQ tracks watched departures across the main EU Vinted markets — France, Germany, Spain, Italy, Portugal — and gives you the buy-below ceiling for 28 tracked brands before you spend a euro.",
          "The departure data is Vinted-specific: it shows what is actually leaving the shelf at what price, not asking-price averages or eBay sold comps. For Depop and eBay pricing, you combine ResaleIQ's EU Vinted baseline (the floor) with the 20–50% premium those platforms sometimes command on the same items. If the item trades at €18 average on Vinted and you can source it under €9, the Depop ceiling of €30–35 is pure upside — but you don't need Depop to work to be profitable.",
          "Use the [flip tool](" + ilinkHref("flip") + ") to see departure velocity and buy-below prices by brand, then apply the platform multiplier when deciding where to list.",
        ],
      },
    ],
    faq: [
      {
        q: "Is Vinted or eBay better for selling clothes?",
        a: "Vinted nets more on everyday branded EU fashion items under €50 because there is no seller commission. eBay wins on rare or collectible items, niche sizes, and anything with a global collector audience where competition drives up the price. Pick per item: run the net margin calculation using the likely sale price on each platform minus fees.",
      },
      {
        q: "Is Depop or Vinted better for sellers?",
        a: "Vinted is better for volume sellers of EU everyday fashion — faster sell-through, zero seller fees, large EU buyer base. Depop pays more on curated vintage, Y2K, and premium streetwear aimed at US and UK buyers — but sells slower and requires stronger account curation. Depop charges a 10% seller commission; Vinted charges sellers nothing.",
      },
      {
        q: "What are the fees on Vinted vs Depop vs eBay?",
        a: "Vinted: 0% seller commission (buyer pays a protection fee of 3–8%). Depop: 10% seller commission plus ~2.9% payment processing. eBay: ~12.9–15% final value fee on fashion items plus ~0.3% + fixed payment processing. On a €25 sale, Vinted nets €25, Depop ~€21.55, eBay ~€21.15.",
      },
      {
        q: "Can I sell on Vinted and eBay at the same time?",
        a: "Yes. Cross-listing the same item on Vinted and eBay is common and free (Vinted charges no listing fee; eBay allows 250 free listings per month for private sellers on most EU markets). The risk is double-selling: delete the listing on the other platform immediately once an item sells.",
      },
      {
        q: "Which platform is best for vintage clothing?",
        a: "Depop is the leading platform for curated vintage and Y2K clothing, particularly for US and UK buyers who pay a premium for rare or well-presented pieces. Vinted has a large vintage audience in the EU and is better for volume vintage sellers who want fast exit. eBay wins on documented rare vintage (deadstock, specific colourways, heritage pieces with collector interest).",
      },
      {
        q: "How do I know what my item will sell for on each platform?",
        a: "Check recently sold (not listed) prices on each platform: use eBay's sold listings filter and Depop's sold items view. For Vinted EU exit prices across tracked brands, ResaleIQ's departure data shows average exit prices from watched listings leaving the shelf in France, Germany, Spain, Italy and Portugal — searchable by brand and category.",
      },
    ],
  },
]
