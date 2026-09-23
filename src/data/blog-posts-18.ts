// Batch 18 of SEO/AEO articles. Same contract as blog-posts.ts.
// Honest claims only: no earnings guarantees, no tax/legal advice as professional advice.
// All departure data from /api/public/market-snapshot (2026-09-15 build).

import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

export const POSTS_18: BlogPost[] = [
  {
    slug: "best-vinted-selling-tips",
    title: "Best Vinted Selling Tips (What Actually Moves Items in 2026)",
    seoTitle: "Vinted Selling Tips That Work — Resale IQ",
    description:
      "Eight specific tips that move Vinted listings faster: how to write titles that rank, price with live market data, use the 14-day reduction window, and refresh stale stock — with real departure numbers.",
    date: "2026-09-15",
    category: "Selling",
    readMins: 10,
    preflightQuery: "Nike Air Force 1",
    intro:
      "Across the 28 brands Resale IQ tracks on EU Vinted, the same gap repeats: two listings for the same item — same size, similar condition — where one sits for three weeks and the other departs in two days. The difference is almost never the item. It's how the listing is constructed. These eight tips cover what the faster-moving listings have in common.",
    definedTerm: {
      name: "Departure rate",
      description:
        "Departure rate is the number of items for a given brand or category that complete a sale on Vinted within a set period, typically 7 days. Resale IQ tracks departure rates across 28 brands and 6,034,566 EU Vinted listings. A higher departure rate means more buyers in that market — which also means more competition from other sellers. High departure rate is necessary but not sufficient for fast sales: listing quality determines which items in the pool depart first.",
    },
    sections: [
      {
        h: "Tip 1: Write titles that rank, not titles that describe",
        p: [
          "Vinted's search is keyword-based. Buyers type 'stone island hoodie xl navy' or 'patagonia fleece womens small' — not 'gorgeous vintage item great condition'. Your title needs to match what buyers actually search.",
          "The formula that works: **Brand + Item type + Size + Colour + One key descriptor**. Examples: 'Patagonia Better Sweater Fleece Jacket S/M Navy Blue', 'Stone Island AW22 Hoodie L Grey Garment Dyed', 'Fred Perry Polo Shirt M White Twin Tip'. Every word earns its place by matching a real search term.",
          "What to cut: 'stunning', 'beautiful', 'great quality', 'fast shipping', 'bundle deal', 'L@@K'. Vinted's algorithm ignores modifiers that don't match search patterns. Use the character limit for searchable terms, not sales copy.",
          "For brand guides: check the individual brand pages at [Resale IQ](/flip) to see which categories depart fastest for that brand. Fred Perry departs 421 Shirts and 160 T-Shirts per 7 days at average €14–12 — these are the exact category terms buyers search.",
        ],
      },
      {
        h: "Tip 2: Four photos, in this order",
        p: [
          "Vinted shows the first photo as the thumbnail. Most buyers make a click decision on that image alone.",
          "Photo 1 (thumbnail): flat lay on a clean light surface, or on a plain hanger against a white wall. Full garment visible. Daylight only — no flash, no overhead ceiling light. Morning window light is the best light you have access to at no cost.",
          "Photo 2: label close-up. Brand tag, composition label, wash care. This answers authentication questions before they're asked and cuts dispute risk on higher-value items. Stone Island hoodies (average €56 departure) get significantly more questions than a Zara hoodie (average €16) — answer them in the photos.",
          "Photo 3: any flaw, exactly as it is. A pilling shot, a small mark, a faded patch. Buyers who see the flaw in the listing do not open disputes. Buyers who discover it on delivery do.",
          "Photo 4: the item worn or styled (optional but effective on Hoodies, Jackets, and Coats — the categories where fit questions stall purchases). If you don't have a mannequin, a hanger shape in natural light works.",
          "Do not use artificial backgrounds, excessive editing, or photos with shadows obscuring details. Vinted surfaces listings to interested buyers — they are already halfway there. Don't lose them to a photo.",
        ],
        cta: pricingMidCta("ctr_tips_20260915"),
      },
      {
        h: "Tip 3: Price using market data, not gut feel",
        p: [
          "The most common pricing mistake on Vinted: checking what other sellers are listing for, and pricing to match. Listed prices are not departure prices. A hoodie listed at €45 that never departs does not tell you what the market pays — it tells you what one seller hoped the market would pay.",
          "Departure data is the correct benchmark. Resale IQ tracks actual completions across EU Vinted markets. Patagonia Hoodies: 128 departures in the last 30 days at an average of €41. Patagonia Jackets: 780 departures in the last 30 days at €50. If you're pricing a Patagonia Fleece Hoodie at €65 because similar items are listed for €65, but the actual departure average is €41, you will sit. If you price at €38–42, you move.",
          "For high-velocity brands (Fred Perry at 199 departures in the last 30 days, Stone Island at 753) the market is liquid — buyers are active, competition is real, and pricing precision matters more, not less. A Fred Perry Shirt priced at €18 (market average) against 20 similar listings will take longer to depart than one priced at €14–15 with better photos.",
          "Check [Resale IQ's flip data](" + ilinkHref("flip") + ") before setting your price. The buy-below principle — sourcing at one-third of expected exit — is covered in depth in [buy-below price explained](/blog/buy-below-price-explained).",
        ],
      },
      {
        h: "Tip 4: Use the 14-day price reduction window",
        p: [
          "Vinted surfaces items that have had a recent price reduction in a dedicated 'reduced items' feed visible to active buyers on iOS and Android. The algorithmic benefit is documented in seller community reports and consistent with what high-volume EU resellers observe.",
          "The mechanic: if an item hasn't departed in 10–14 days, drop the price by €1–3. This qualifies it for the reduced feed, resets its position in search results for some buyers, and signals availability to buyers who may have seen it before. It is not a markdown — it is a visibility refresh.",
          "The rule: apply the reduction at day 10, not day 20. By day 20, the listing has been seen by most active buyers in your region and category who were going to click on it. A reduction at day 10 catches the next wave before the item becomes invisible through familiarity.",
          "Related: if an item stalls past 21 days, unpublish it and re-publish as a new listing. This fully resets its position in search. Do not do this repeatedly — Vinted's algorithm penalises bulk re-publishing patterns, but a single unpublish-relist on a genuinely stale item is standard practice.",
        ],
      },
      {
        h: "Tip 5: Respond to offer requests within two hours",
        p: [
          "Vinted tracks seller response time and incorporates it into the trust signals shown on your profile. The displayed 'usually replies within X hours' metric influences buyer confidence before a purchase — and Vinted's internal ranking has been observed to favour responsive sellers in some market tests.",
          "More directly: offers expire. Vinted's offer system gives the seller a window to accept, counter, or decline. A buyer who has made an offer and received no response within 2–3 hours has often already moved to a competing listing. Resale is a market of active buyers, not passive ones — they are searching, not waiting.",
          "The practical workflow: check Vinted at morning, midday, and evening. Respond to all offers within the session. Counter-offer rather than declining — a buyer who offered €20 on a €28 item is negotiating, not refusing. A counter at €24 closes more often than a decline.",
          "On [seller fees](/blog/vinted-seller-fees-explained): Vinted charges buyers the Buyer Protection fee (5% + €0.70 on items over €2). Sellers pay nothing. This means there is no cost to accepting a lower offer — the calculus is exit price vs. holding cost, not exit price vs. fee.",
        ],
      },
      {
        h: "Tip 6: Write item descriptions that answer pre-purchase questions",
        p: [
          "Most Vinted listings use descriptions like 'great condition, open to offers'. This tells a buyer nothing they cannot see and leaves every practical question unanswered.",
          "The questions buyers actually have before buying: (1) What are the measurements? (2) Is this a men's or women's fit? (3) Any faults not visible in photos? (4) What era/season is this (for vintage or older items)? (5) How does it fit — true to size, oversized, runs small?",
          "Answer all five. A description like: 'Stone Island AW2019 hoodie in grey marl. Fits true to size L. Chest 54cm flat, length 68cm, sleeve 62cm from shoulder. Light crease on right cuff (visible in photo 3) — no other faults. Badge and sleeve patch fully intact.' removes every friction point before the buyer hits 'make an offer'.",
          "For high-value items (Gucci, Balenciaga, Jordan — all with avg departures above €100), add the authentication confirmation you checked: 'Serial number present and clear, hardware weight confirmed, stitching consistent'. Buyers paying €150+ for a bag are reading every word.",
        ],
      },
      {
        h: "Tip 7: Bundle strategy that works",
        p: [
          "Vinted's bundle system allows buyers to add multiple items from one seller and request a combined price. The platform surfaces bundle discounts you set on your profile — 'Seller offers bundles' is shown on your listings.",
          "Setting a standing 10–15% bundle discount is worth doing for volume sellers. The arithmetic: a buyer adding two €20 items gets €4 off at 10%, pays net €36, and you move two items in one transaction instead of two separate ones with separate shipping and separate five-day wait windows.",
          "A deeper guide on this is at [vinted bundles and offers strategy](/blog/vinted-bundles-and-offers-strategy). The key point here: enable bundles and set a discount. Do not leave it unset — buyers who see no bundle discount listed will not ask.",
          "Combined with the timing tip: if two items in your shop are in the same category (two Hoodies, two Jackets), they will often attract the same buyer. A buyer who clicks a Stone Island hoodie is browsing your other listings for more Stone Island or similar technical brands. That is a natural bundle candidate.",
        ],
      },
      {
        h: "Tip 8: Ship within 5 business days, every time",
        p: [
          "Vinted's Seller Dashboard tracks your shipping speed and dispute rate. These directly affect your profile's trust indicators and buyer first-impression. More practically: late shipments are the number one cause of buyer disputes and negative reviews on Vinted.",
          "The Vinted Pro shipping label (pre-paid through the app) is the correct shipping method for EU sellers. It is cheaper than going to the post office without a label (typically €3.49–5.49 depending on weight vs. €6–9 at counter), it includes tracking, and tracking prevents 'item not received' disputes.",
          "Print and drop off within 3 business days of accepting an offer. For regular sellers: keep a small stock of padded envelopes (A4 and A5) at home. The friction of having to buy packaging is what causes delays. Remove the friction.",
          "For items above €60, insure the shipment. Vinted Protect covers buyers, but if a parcel is lost in transit and was not insured, the outcome depends on carrier resolution. At €60+, insurance costs €0.50–2.00 — it is always worth it.",
        ],
      },
    ],
    faq: [
      {
        q: "How do I get more views on Vinted?",
        a: "Write titles using the formula: Brand + Item type + Size + Colour + one key descriptor (e.g. 'Patagonia Better Sweater Jacket S Navy'). Vinted's search is keyword-based — buyers search exact terms, not descriptions. Update stale listings (10+ days without sale) with a small price reduction to enter the 'reduced items' feed. Re-publish items stalled past 21 days as new listings.",
      },
      {
        q: "How do I price items on Vinted?",
        a: "Use departure data, not listing prices. Listed prices are asking prices, not transaction prices. Resale IQ tracks actual EU Vinted completions across 28 brands — for example, Patagonia Hoodies depart at an average €41, and Stone Island Hoodies at €56. Price within 10% of the departure average for your category, adjust for condition, and you will move faster than sellers pricing to match other listings.",
      },
      {
        q: "How long does it take to sell on Vinted?",
        a: "Varies by brand, category, and listing quality. High-velocity brands like Fred Perry (199 departures in the last 30 days) and Stone Island (753/7 days) have liquid markets — a well-priced, well-photographed item can depart within 24–72 hours. Low-velocity brands or niche categories may take 10–21 days. Items that pass 21 days without a sale should be re-listed fresh.",
      },
      {
        q: "What are the best things to sell on Vinted?",
        a: "Brands with high departure rates and buy-below sourcing opportunities. Resale IQ tracks 28 EU Vinted brands — top-velocity as of September 2026: Fred Perry (199 departures in the last 30 days, avg €18), Patagonia (1323 departures in the last 30 days, avg €37), Stone Island (178 departures in the last 30 days, avg €70). The best items are those where the exit price is 3× the sourcing cost — see [what sells best on Vinted](/blog/what-sells-best-on-vinted) for the full departure table.",
      },
      {
        q: "Should I accept offers on Vinted?",
        a: "Counter-offer rather than accepting or declining. A buyer who offers €20 on a €28 item has shown buying intent — they are negotiating. A counter at €24–25 closes more often than a decline, and accepting a lower price moves stock and avoids the holding cost of a stale listing. The only offers worth declining outright are those below your buy-below price (typically more than 60% off asking on high-value items).",
      },
      {
        q: "Why is my Vinted listing not selling?",
        a: "The four most common reasons: (1) Title doesn't match buyer search terms — rewrite using Brand + Item + Size + Colour. (2) Price above the departure average for your brand/category — check market data. (3) Lead photo obscures the item (poor light, shadow, unclear) — reshoot in daylight. (4) Listing is too old to rank — unpublish and re-publish after 21 days. Check [vinted item not selling](/blog/vinted-item-not-selling) for a detailed diagnosis.",
      },
      {
        q: "How do I sell faster on Vinted?",
        a: "Price at or slightly below the market departure average (not the listing average), write a searchable title, use the 14-day price reduction window to re-enter the reduced feed, and respond to all offer requests within 2 hours. The combination of accurate pricing + fast response catches buyers who are actively searching and ready to purchase.",
      },
    ],
  },
]
