// Batch 22 of SEO/AEO articles. Same contract as blog-posts.ts.
// Honest claims only: no earnings guarantees. Sourcing tips are general guidance.
// All departure data from /api/public/market-snapshot (2026-09-15 build).

import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

export const POSTS_22: BlogPost[] = [
  {
    slug: "vinted-sourcing-guide",
    title: "Where to Source Clothes to Resell on Vinted (By Country and Venue Type)",
    seoTitle: "Vinted Sourcing Guide: Where to Find Cheap Stock to Resell — Resale IQ",
    description:
      "Car boots, vide-greniers, charity chains, flea markets, and clearance apps — where to find cheap secondhand stock to resell on Vinted by country (UK, FR, DE, NL, BE, ES). Includes buy-below targets by brand from live departure data.",
    date: "2026-09-15",
    category: "Sourcing",
    readMins: 12,
    intro:
      "The margin in Vinted reselling is locked at the moment of sourcing. A Fred Perry shirt that departs at €18 on Vinted needs to cost you under €9 to clear 100% net margin after fees. Where you find it determines everything. This guide maps the best sourcing venues by type and country — from UK car boot sales to French vide-greniers to German Kleidertausch events — with buy-below targets based on live EU Vinted departure data.",
    definedTerm: {
      name: "Buy-below price",
      description:
        "The buy-below price is the maximum you can pay for an item and still achieve your target margin after Vinted fees and any sourcing costs. Resale IQ calculates this automatically from live departure averages. The formula: buy-below = departure average × (1 − target margin percentage). For a 100% net margin target on a €18 departure average item, your buy-below is €9.",
    },
    sections: [
      {
        h: "Buy-below targets from live departure data",
        p: [
          "Before sourcing, know your numbers. These are current EU Vinted departure averages (7 days to 15 September 2026) and derived buy-below prices at 100% net margin (i.e. double your money):",
          "**Fred Perry:** 850 watched departures/7d, avg €18 → buy below **€9**. Shirts dominate (416/7d, avg €14). Common in UK charity shops and French brocantes; oversupplied in parts of the UK, still underpriced elsewhere in EU.",
          "**Patagonia:** 747/7d, avg €37 → buy below **€18**. Jackets (311/7d, avg €51) command the highest values. Rare at charity shops; more common at German hiking/outdoor gear markets, ski resort secondhand sales, and Alpine swap events.",
          "**Stone Island:** 739/7d, avg €70 → buy below **€35**. Hoodies (401/7d, avg €55) are the volume item; jackets average €140. Stone Island items at charity shops are usually mispriced — donors often don't recognise the brand. When you find one for under €10, it's a clear buy.",
          "**Balenciaga:** 509/7d, avg €147 → buy below **€74**. Charity shops rarely hold designer at correct prices; brocante stalls and individual Vinted sellers unaware of authentication requirements can be sources. Risk: fakes are common — authenticate before buying to source.",
          "**Supreme:** 155/7d, avg €66 → buy below **€33**. Box logo pieces carry premiums above averages. UK and Japanese tourist flows seed UK charity shops with Supreme; look in affluent area shops.",
          "For complete buy-below calculations across all brands, use the [Resale IQ flip calculator](" + ilinkHref("flip") + ").",
        ],
      },
      {
        h: "UK: charity shops, car boots, and clearance",
        p: [
          "The UK has the highest density of charity shop sourcing for Vinted resellers. Oxfam, Cancer Research, BHF, and Sue Ryder are the national chains. Pricing varies significantly by location — charity shops in affluent postcodes (SW London, Cheshire, Edinburgh New Town) price items closer to market value; shops in lower-income areas frequently undercharge for branded goods.",
          "**Strategy by chain:** Oxfam is increasingly price-aware on brands like Ralph Lauren, Fred Perry, and Stone Island — their online presence (Oxfam Online) has educated their volunteers. BHF and Sue Ryder shops vary more; smaller regional hospice shops and independent charity shops are less aware of brand values and more likely to hold at flat-rate pricing (£2–5 per garment).",
          "**Car boot sales** run weekly across the UK from March to October. The best sourcing months for branded clothing are May and June (spring clears from wardrobes after winter) and September (end-of-summer clear). Reliable large events: Swapmeet at Shepton Mallet, Sunbury Antiques Market, Newark International Antiques Fair (for vintage). Arrive at open — the first 30–60 minutes is when resellers clean the branded stock.",
          "**Clearance retailers** (TK Maxx, B&M, Home Bargains) occasionally hold Levi's, Timberland, and Tommy Hilfiger at below-market prices when the main retailer clearance exceeds the outlet's sell-through. Check regularly — stock rotates unpredictably.",
          "**Vinted → Vinted arbitrage:** Buy mistyped or mislisted items on Vinted (wrong brand spelling, wrong category, blurred photos) and relist correctly. This requires no physical sourcing and scales without geography. Filter by 'Cheapest' in a brand search to find underpriced listings.",
        ],
        cta: pricingMidCta("ctr_sourcing_20260915"),
      },
      {
        h: "France: vide-greniers, brocantes, and depot-vente",
        p: [
          "France has the most structured secondhand market ecosystem in the EU. Three venue types matter for Vinted resellers:",
          "**Vide-greniers** ('attic empties') — hyperlocal one-day markets run by villages and town associations, typically on summer Sundays. Entry is usually free. Pricing is set by individuals cleaning out their homes, not commercial sellers — expect to find branded clothing at €1–5 per item. The best finds come from bourgeois areas: Normandy market towns, Loire Valley, Brittany coastal villages. Use vide-greniers.org to find events by postcode.",
          "**Brocantes** — more curated than vide-greniers; semi-professional sellers with a mix of antiques and secondhand goods. Prices are higher but the stock is sorted. Stone Island, Ralph Lauren, and Lacoste appear regularly in brocante stalls, typically mispriced at €5–15 by sellers who know they're branded but don't know the Vinted departure value.",
          "**Depot-vente** — consignment shops that take stock on sale-or-return. Unlike charity shops, depot-ventes price items based on a commission model. Margins for resellers are tighter, but stock rotation is faster and items are often in better condition. The best depot-ventes in Paris (Cherche Midi, Oberkampf quartier) hold designer pieces at 30–50% below Vinted departures.",
          "French customs tax (DAC7): if you source significantly in France and sell cross-border, your Vinted account's platform data is reportable under DAC7 above 30 transactions or €2,000 in sales in a calendar year. Keep records of sourcing costs.",
        ],
      },
      {
        h: "Germany: Kleidertausch, Flohmarkt, and Kleiderkreisel sellers",
        p: [
          "Germany's secondhand market is large but structured differently from the UK and France. Key venue types:",
          "**Flohmarkt (flea markets)** run year-round in German cities. Berlin's Mauerpark, Hamburg's Fischmarkt, Munich's Auer Dult, and Cologne's Nippes Trödelmarkt are the best-known. Standard pricing from individual sellers is €3–8 per garment regardless of brand — partly cultural (haggling is expected), partly because sellers optimise for clearing stock rather than maximising price. Branded goods (Adidas, Puma, Hugo Boss, Carhartt) appear regularly underpriced.",
          "**Kleidertausch (clothing swap events)** — free or low-cost events where participants exchange clothes. Entry is by bringing items; leftover stock can often be purchased at the end. These are increasingly popular in major German cities; search Eventbrite or Meetup for 'Kleidertausch [city]'. The sourcing value is inconsistency — you never know the brand composition, but per-item acquisition cost is near zero.",
          "**Humana chain** — Germany's largest secondhand clothing retailer with 30+ stores. Unlike UK charity shops, Humana operates at commercial prices — Adidas tracksuits at €15–20, Nike hoodies at €12–18. Margins are tighter but stock is reliable and sorted. Best for volume sourcing when combined with Vinted departure averages to identify positive-margin items.",
          "**Individual Kleinanzeigen (classified ads) sellers:** eBay Kleinanzeigen (now Kleinanzeigen.de) lists secondhand clothing at below-Vinted prices because sellers aren't reaching the Vinted audience. Buying Stone Island at €20 on Kleinanzeigen to resell at €70 on Vinted (EU-wide buyer pool) is pure arbitrage. Requires negotiation and local pickup in some cases.",
        ],
      },
      {
        h: "Netherlands, Belgium, and Spain: secondary markets",
        p: [
          "**Netherlands — Marktplaats and kringloopwinkels:** Marktplaats is the dominant classifieds platform (eBay equivalent). Kringloopwinkels (thrift stores) are community-run secondhand shops with flat pricing (€2–5 per garment typically, regardless of brand). The Netherlands has high density of outdoor and branded clothing from returners — Patagonia, The North Face, and Berghaus appear regularly in kringloopwinkels near Amsterdam and Utrecht.",
          "**Belgium — Troc.com and Kringwinkels:** Belgium combines French and Dutch secondhand market characteristics. Troc.com is a national depot-vente chain with fast stock rotation. Kringwinkels (Flemish equivalent of kringloopwinkels) price by weight in some locations — sourcing by weight makes branded items especially profitable when the pricing doesn't reflect brand value.",
          "**Spain — rastros and Wallapop:** The Rastro de Madrid (Sunday market) and its equivalents in Seville (Alameda de Hércules Sunday market) and Barcelona (Mercat de Bellcaire, Encants) run weekly and carry a mix of vintage and branded clothing. Spanish sourcing is underexploited by non-Spanish resellers — Spanish buyers on Vinted buy at EU-average departure prices, but local sourcing costs are often lower than Northern Europe. Wallapop (Spanish classifieds) prices branded items below Vinted by 30–50% on average.",
        ],
      },
      {
        h: "Online sourcing: Vinted, eBay, and Facebook Marketplace arbitrage",
        p: [
          "Physical sourcing requires travel time and geography. Online sourcing scales without it. Three channels with consistent arbitrage opportunities:",
          "**Vinted itself:** Search a brand by name, sort by 'Cheapest first', filter by condition 'Good' or better. Items mislisted (wrong category), poorly photographed, or with vague descriptions underperform in Vinted's algorithm. Buy these, relist correctly with proper photos and description, and capture the departure average. The same Stone Island hoodie priced at €20 with a blurred photo and wrong category can relist at €55 with correct category, 8 photos, and a description that names the badge and condition.",
          "**eBay Lots and bundles:** Sellers clearing wardrobes list 'bundle of branded items' at flat prices. A £40 bundle of 10 items may contain 2 Stone Islands, 3 Fred Perrys, and 5 generic pieces. The branded items alone justify the bundle price; the generic pieces become your sourcing cost overhead. Search 'branded job lot', 'vintage bundle', '[brand] lot' — filter to auction format for the best prices.",
          "**Facebook Marketplace — local pickup and Vinted arbitrage:** Facebook Marketplace sellers often don't know Vinted departure values. 'Designer clothes bundle' listings at €30–60 regularly contain items worth €150–250 at Vinted departure averages. Restrict to local pickup initially to avoid postage complications; once you've bought several times from a source, negotiate ongoing first-refusal deals.",
        ],
        cta: pricingBodyCta("body_sourcing_20260915"),
      },
      {
        h: "Sourcing strategy: what to look for at any venue",
        p: [
          "Regardless of venue type or country, the filter that separates profitable sourcing from random accumulation is a buy-below price target in your head before you handle an item.",
          "**Brand recognition check (5 seconds):** Is this brand in the top 20 departure brands tracked on Vinted? If you don't know the brand, do not buy. If you do know it, pull the departure average mentally (or from the [flip calculator](" + ilinkHref("flip") + ")) before negotiating.",
          "**Condition check (30 seconds):** Check collar, cuffs, underarms, and any logo area for fading, pilling, or staining. Vinted's condition scale — New/Excellent/Good/Acceptable — directly affects departure velocity. 'Good' with minor pilling departs; 'Acceptable' with underarm staining sits.",
          "**Authentication check (30–60 seconds for designer):** For any item priced above €20 at source that you're attributing to Stone Island, Supreme, Balenciaga, or Gucci: check one or two authentication markers immediately. The badge, the label, the hardware. Don't buy on the hope that it's real.",
          "**Sourcing volume targets:** Experienced resellers source 8–15 items per outing at charity shops / flea markets. Not all items will sell — build in a 10–15% write-off rate for items that sit beyond 60 days. Volume sourcing with tight buy-below discipline is more reliable than hunting for single high-value items.",
          "Track every sourcing trip: venue, date, items bought, cost per item. This becomes your sourcing ROI data and tells you which venues to return to.",
        ],
      },
    ],
    faq: [
      {
        q: "Where is the best place to source clothes to resell on Vinted?",
        a: "UK charity shops (BHF, Sue Ryder, smaller hospice shops in non-affluent areas) offer the best density of branded items at under buy-below price. For continental Europe, French vide-greniers and German Flohmärkte provide high volume at low per-item cost. Online arbitrage (Vinted itself, eBay lots, Facebook Marketplace) scales without geographic limits and works alongside physical sourcing.",
      },
      {
        q: "How much should I pay for items to resell on Vinted?",
        a: "Use the buy-below price: departure average × (1 − your target margin). For 100% net margin (doubling your money), buy below half the departure average. Fred Perry shirts depart at €18 on average — buy below €9. Stone Island hoodies depart at €55 on average — buy below €27. The Resale IQ flip calculator calculates this from live departure data.",
      },
      {
        q: "Can you make money reselling from charity shops on Vinted?",
        a: "Yes, reliably — if you source in areas where charity shop staff don't recognise brands. A Stone Island hoodie at €3 in a charity shop resells at €50–60 on Vinted (Stone Island watched departures: 739/7d, avg €70). The arbitrage is real; it requires brand knowledge and willingness to physically visit multiple shops.",
      },
      {
        q: "What brands are worth looking for when sourcing for Vinted?",
        a: "Prioritise brands with high watched departure volume on EU Vinted: Fred Perry (850/7d, avg €18), Patagonia (747/7d, avg €37), Stone Island (739/7d, avg €70), Balenciaga (509/7d, avg €147), and Supreme (155/7d, avg €66). These brands have proven buyer depth — items move reliably when priced correctly.",
      },
      {
        q: "What is Vinted arbitrage?",
        a: "Vinted arbitrage means buying items on Vinted (or elsewhere) below their departure average and relisting them at the correct price. Common forms: buying mislisted items (wrong category, poor photos) on Vinted and relisting correctly; buying eBay bundles containing branded items below their individual Vinted value; buying from classifieds (Marktplaats, Kleinanzeigen, Wallapop) where sellers don't reach Vinted's buyer pool.",
      },
      {
        q: "Is Vinted reselling profitable in 2026?",
        a: "Yes for resellers who source below buy-below price and list with correct data. The EU Vinted platform tracked 5.97 million listings as of September 2026, with strong departure volume across 28 brands. The margin is captured at sourcing — buy correctly and the departure handles itself. The resellers losing money are buying at market price and trying to sell above it.",
      },
    ],
  },
]
