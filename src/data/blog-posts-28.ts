// Batch 28 of SEO/AEO articles. Same contract as blog-posts.ts.
// Honest claims only: no earnings guarantees. Data references departure averages only.
// Sourcing guide — high-intent upstream topic feeding resellers into Vinted/Depop/eBay.

import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

export const POSTS_28: BlogPost[] = [
  {
    slug: "how-to-source-second-hand-clothes-to-sell",
    title: "How to Source Second-Hand Clothes to Sell (2026 Reseller Guide)",
    seoTitle: "How to Source Second-Hand Clothes to Sell — Resale IQ (2026)",
    description:
      "Where to find second-hand clothes to resell on Vinted, Depop, and eBay in 2026: charity shops, car boots, wholesale bales, and online channels ranked by margin, time, and risk. Know your buy-below price before you buy.",
    date: "2026-09-15",
    category: "Sourcing",
    readMins: 12,
    preflightQuery: "New Balance 550",
    intro:
      "Every resale profit starts before you list anything — it starts when you buy. Sourcing well means paying below the number that, after fees and time, still leaves a real margin. This guide ranks the four main sourcing channels by margin, time cost, and risk, and shows you exactly how to calculate the buy-below price before you commit to any item.",
    definedTerm: {
      name: "Buy-below price",
      description:
        "The buy-below price is the maximum you should pay for an item to still hit your target margin after platform fees, shipping, and time. It is calculated from the item's departure average (the median price recent sold listings actually closed at) minus fees and your minimum acceptable profit. Paying at or below this number makes the purchase worth taking.",
    },
    sections: [
      {
        h: "Why the buy-below number comes before every sourcing decision",
        p: [
          "Most resellers lose money not at the listing stage but at the buying stage — they pay too much because they guessed the resale price from asking prices, not from actual departures.",
          "Asking prices on Vinted or Depop are wishes. Departure averages — the prices recent sales actually closed at — are facts. The gap between the two is where resellers either make or lose money.",
          "The formula is simple: Departure average × (1 − platform fee) − shipping − your time cost = maximum buy price. Anything you pay above that number is margin you've already given away before the item is listed.",
          "For example: if a pair of Carhartt work trousers departs at an average of €42 on Vinted (0% buyer fee, seller gets full €42 minus the 5% Vinted balance withdrawal fee = ~€39.90), and shipping costs €4, your time cost for listing and packing is ~€3, then the break-even buy price is €32.90. To hit a 30% margin you need to buy below €22.",
          "This number — the buy-below price — is the only number that matters when you are standing at a charity shop rail or scrolling a Facebook Marketplace listing.",
        ],
      },
      {
        h: "Channel 1: Charity shops (Oxfam, BHF, YMCA, local independents)",
        p: [
          "Charity shops remain the highest-margin sourcing channel for single items — when you find the right pieces. Margins of 3x–8x are routine on branded items that a non-specialist charity shop has priced by weight or condition rather than by brand.",
          "Best categories: branded workwear (Carhartt, Dickies), 90s sportswear (Nike, Adidas, Champion, Fila), vintage denim (Levi's 501, Wrangler), wool knitwear, and leather jackets. These are systematically underpriced in charity shops staffed by generalists.",
          "Time cost: high per unit. You will walk many rails to find one piece. The economics only work if you are efficient — visit on restocking days (usually Monday–Wednesday), go to shops in lower-footfall areas (other resellers have not cleared them out), and build a mental buy-below list before you walk in.",
          "Risk: low. You can inspect the item physically. No minimum order. Easy to walk away.",
          "Practical tip: most charity shop staff price knitwear, denim, and workwear by size and visible condition. The brand name on the label is the free information edge you have over them. Know your brands before you source.",
        ],
        cta: pricingMidCta("sourcing-guide"),
      },
      {
        h: "Channel 2: Car boot sales and flea markets",
        p: [
          "Car boots offer a similar margin profile to charity shops but with faster throughput per hour and stronger negotiation potential. Sellers are private individuals motivated to clear stock, not charities with fixed pricing policies.",
          "Best times: first 30–45 minutes of opening. Dealers arrive early and pick the best items — but private buyers with the right knowledge can compete. Knowing a buy-below price for 10–15 item types (which takes minutes to look up) gives you a real edge over both the seller and competing generalist buyers.",
          "Negotiation: always make an offer below asking. The worst answer is no. Bundling (three items together for a lower per-item price) works well at car boots — sellers want to clear volume.",
          "Risk: medium. No returns. Condition is as-viewed. Structural defects (broken zips, pen marks, stains in daylight) are your liability if you miss them.",
          "Seasonal note: UK and northern EU car boot season runs April–October. Winter sourcing shifts to indoor flea markets and online channels.",
        ],
      },
      {
        h: "Channel 3: Online — eBay sold listings, Facebook Marketplace, Vinted itself",
        p: [
          "Online sourcing is lower-margin per item but scalable. You can source while sitting anywhere, at any time, which is the key advantage over physical channels.",
          "eBay sold listings (filter: Sold Items) are the best free departure data source for UK resellers. Search the item, tick Sold Items, sort by price. The distribution of sold prices is your departure average — not the current asking prices.",
          "Facebook Marketplace is the highest-margin online sourcing channel in 2026 because it remains unindexed by professional resellers at scale, collection-only listings get no bids, and private sellers drastically undervalue branded items.",
          "Vinted itself is a viable sourcing channel for items to flip between EU markets. A jacket priced in France at €25 can depart in the UK at €55. Cross-market price arbitrage exists because Vinted's recommendation algorithm is local-first and most casual sellers price by their own market.",
          "Risk on online sourcing: condition is photography-dependent. Build a short-list of items you will not source online without video evidence (vintage leather, printed tees where print condition matters, electronics-integrated items).",
        ],
      },
      {
        h: "Channel 4: Wholesale bales and job lots",
        p: [
          "Wholesale bales — pallets of mixed second-hand clothing sold by weight — are the highest-volume, highest-variance sourcing channel. Margins on good bales are excellent; margins on bad bales are terrible. The difference is almost impossible to know in advance.",
          "UK and EU bale suppliers include Texaid (CH), Humana (DE/ES), LMB Textile (UK), and dozens of independent importers on LinkedIn. Prices range from £0.90–£3.50/kg depending on grade (Grade A = quality selected; Grade B = unsorted mixed).",
          "Economics: a 50 kg Grade A bale at £2/kg = £100 cost. If 60% is sellable at an average £8/item and you get 30 sellable items from 50 kg, revenue = £240, margin = 58% before fees and time. That is the best case. The worst case is a Grade B bale where 40% is unsellable raggrade.",
          "Bale sourcing suits resellers who already know their sell-through rate and have storage and packing infrastructure. It is not the right starting channel. Graduate to bales after you have validated your sourcing taste on charity shops and car boots.",
          "Minimum order: most suppliers sell by the pallet (200–500 kg minimum). This is a capital commitment — it is the one channel where you should know your buy-below price for the entire bale, not just individual items.",
        ],
        cta: pricingBodyCta("sourcing-guide"),
      },
      {
        h: "Sourcing ranked: margin vs time vs risk",
        p: [
          "Here is how the four main sourcing channels compare on the three dimensions that matter for a solo reseller:",
          "**Charity shops** — Margin: ★★★★★ | Time per item: ★★ (slow) | Risk: ★★★★★ (low) | Best for: beginners and branded item specialists",
          "**Car boots / flea markets** — Margin: ★★★★★ | Time per item: ★★★ (moderate) | Risk: ★★★★ (low-medium) | Best for: volume buyers who can negotiate",
          "**Online (FB Marketplace, eBay, Vinted)** — Margin: ★★★ | Time per item: ★★★★★ (scalable) | Risk: ★★★ | Best for: resellers who want to scale beyond local geography",
          "**Wholesale bales** — Margin: ★★★★ (best case) | Time per item: ★★★★★ (fastest at scale) | Risk: ★★ (high variance) | Best for: experienced resellers with storage and capital",
          "The key principle across all four: source only what you already know the departure average for. Impulse buys based on 'this looks expensive' are how most beginner resellers lose money. The buy-below price is the discipline that separates profitable resellers from breakeven ones.",
        ],
      },
      {
        h: "How to build your personal sourcing hit list",
        p: [
          "The most efficient resellers do not browse aisles hoping something jumps out. They walk in with a mental (or written) hit list of 10–20 items they know the buy-below price for and look only for those.",
          "Building the list takes 20 minutes: pick the brands and categories you see most in your local charity shops, look up their departure average across recent sold listings, apply the buy-below formula (departure average × 0.85 − shipping − £2 time cost), and write down the resulting buy-below number.",
          "Revisit and update the list monthly — departure averages shift. A brand that was consistently departing at €40 six months ago may have softened to €28 today. The resellers who track this data in real time have an edge over those who are still pricing from six-month-old memory.",
          "ResaleIQ tracks departure averages across 5 EU markets continuously — so your buy-below numbers stay current without manual research.",
        ],
      },
    ],
    faq: [
      {
        q: "Where is the best place to find clothes to resell?",
        a: "Charity shops offer the highest single-item margins and lowest risk. Car boots offer faster throughput and negotiation leverage. For scalable volume, Facebook Marketplace and wholesale bales are the next step — but require knowing your buy-below price before buying.",
      },
      {
        q: "How do I know what price to pay for an item to resell?",
        a: "Calculate the buy-below price: departure average (what similar items actually sold for recently) × (1 − platform fee) − shipping − time cost. Anything above that number is margin you have already lost before listing.",
      },
      {
        q: "Is sourcing from charity shops still worth it in 2026?",
        a: "Yes — for branded items, charity shops remain systematically underpriced because staff price by condition and size, not by brand. Carhartt, vintage Levi's, 90s Nike, and wool knitwear are consistently mispriced in generalist shops.",
      },
      {
        q: "Are wholesale bales worth buying for reselling?",
        a: "Only after you have validated your sourcing taste on charity shops and car boots first. Bales require capital, storage, and a known sell-through rate. Grade A bales from reputable suppliers can be highly profitable; Grade B unsorted bales are high-variance.",
      },
      {
        q: "Can you source clothes to resell on Vinted itself?",
        a: "Yes — cross-market price arbitrage is real on Vinted. Items listed in lower-price markets (France, Spain, Germany) sometimes depart at significantly higher prices in other markets (UK, Netherlands). This works best for items with brand recognition across markets.",
      },
      {
        q: "How much money do you need to start reselling clothes?",
        a: "You can start with as little as €20–€50 sourcing from charity shops and car boots. The constraint is not capital — it is knowledge of your buy-below prices. Start small, validate your taste, then scale up to higher-volume channels.",
      },
    ],
  },
]
