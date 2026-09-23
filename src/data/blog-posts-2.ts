import { TRACKED } from "@/lib/stats"
// Batch 2 of SEO/AEO articles. Same contract as blog-posts.ts — kept in a
// separate file so each batch stays readable and reviewable.
// Claims honest: `the live tracked-listings figure listings across 5 EU markets`; no earnings promises.

import type { BlogPost } from "./blog-posts"
import { dataCiteHref, pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

const BRAND = "Resale IQ"

export const POSTS_2: BlogPost[] = [
  {
    slug: "vinted-photo-tips-that-sell",
    title: "Vinted Photos That Actually Sell (7 Rules)",
    seoTitle: "How Do You Take Vinted Photos That Sell? — Resale IQ",
    description:
      "Daylight, a plain background, and the shots buyers check: front, back, labels and flaws. Honest photos speed a sale — they cannot create demand.",
    date: "2026-08-06",
    updated: "2026-09-13",
    category: "Selling",
    readMins: 5,
    preflightQuery: "New Balance 550",
    intro:
      "Photos decide whether a buyer taps your listing at all. Two sellers can list the same jacket at the same price and one sells in a day while the other sits for months. The difference is almost always the pictures.",
    sections: [
      {
        h: "Light and background",
        p: [
          "Natural daylight near a window beats any indoor bulb. Avoid direct sun — it blows out detail and distorts colour, which causes returns.",
          "Use a plain, uncluttered background. A neutral wall, a bed with a plain sheet, or a door. Anything busy makes the item look cheaper than it is.",
        ],
        cta: pricingMidCta("ctr_photos_20260913"),
      },
      {
        h: "The shots buyers want",
        p: [
          "Front, back, brand label, care/size label, and a close-up of any flaw. That's the minimum set. How to run that set as a two-minute routine is in [photos and titles](/manual/photos-and-titles).",
          "Add one shot showing shape — hung up, laid flat neatly, or worn. Flat crumpled photos suppress sales more than most sellers realise.",
        ],
      },
      {
        h: "Be honest about flaws",
        p: [
          "Photograph marks, bobbling and worn hems clearly and mention them. It costs you a few buyers and saves you every return, dispute and bad review.",
          "Buyers reward honesty on secondhand platforms — a documented small flaw sells better than a surprise one.",
        ],
      },
      {
        h: "Photos can't fix the wrong item",
        p: [
          "Great photos accelerate a sale that was going to happen. They don't create demand that isn't there. If a model has no sell-through, better pictures won't save it — that's a sourcing problem. Check [brands clearing fastest right now](" +
            ilinkHref("flip") +
            ") before you photograph a dead one. " +
            BRAND +
            " checks demand before you buy.",
        ],
      },
    ],
    faq: [
      { q: "How many photos should I put on a Vinted listing?", a: "At least five: front, back, brand label, size/care label, and a close-up of any flaw. Add a shot showing the item's shape (hung or worn). More complete photo sets get more views and fewer returns." },
      { q: "What is the best lighting for Vinted photos?", a: "Indirect natural daylight near a window. Avoid direct sunlight and overhead artificial bulbs — both distort colour, which leads to disappointed buyers and returns." },
    ],
  },
  {
    slug: "best-time-to-list-on-vinted",
    title: "Best Time to List on Vinted — Hour, Day, and Season (Data)",
    seoTitle: "Best Time to List on Vinted (2026 Data)",
    description: "When listings actually sell, measured across 13.4M tracked EU Vinted listings in 5 markets.",
    date: "2026-08-06",
    updated: "2026-09-15",
    category: "Selling",
    readMins: 7,
    preflightQuery: "New Balance 550",
    intro:
      "Vinted's feed favours fresh listings, so timing affects how many people see your item in its first hours — but most sellers obsess over the hour and ignore the thing that actually moves the needle: the season. Week to 14 September 2026, Hoodies were the single busiest category across the 28 brands Resale IQ tracks on EU Vinted (Spain, France, Germany, Italy, Portugal): 1,181 hoodie listings left the shelf in 7 days, ahead of Jackets (955) and Shirts (760). Autumn has started. If you are holding outerwear, this is when you list it.",
    sections: [
      {
        h: "What season you are in right now — by the data",
        p: [
          "Week to 14 September 2026, across 28 brands on EU Vinted: Hoodies 1,181 watched departures · Jackets 955 · Shirts 760. The autumn transition is live — hoodies and jackets are overtaking shirts, which dominated through summer. Stone Island Hoodies averaged €55 this week (1323 departures in the last 30 days across all categories). Patagonia Jackets averaged €75 (part of Patagonia's 792 total departures). The North Face — 72 departures in the last 30 days — is fully in autumn territory.",
          "If you have outerwear in stock, the listing window opened in the first week of September and the next 10–12 weeks are the strongest of the year. If you still hold summer stock (Shirts, Shorts, Swimwear), the market for that has softened materially and will not recover until April. Holding it is a decision to tie up cash for six months. [What actually left the shelf this week](" +
            ilinkHref("data") +
            ") shows the live category mix.",
        ],
      },
      {
        h: "Category-by-season — when to list what",
        p: [
          "The table below is the practical version of 'list in season'. It shows which categories peak by quarter, based on EU Vinted departure patterns across the 28 brands we track.",
        ],
        table: {
          caption: "EU Vinted seasonal departure patterns for tracked brand categories. 'Peak' = highest weekly departure volume; 'Pass' = slowest quarter — cash-flow risk to hold. Brands from Resale IQ weekly data.",
          head: ["Category", "Peak quarter", "Transition", "Softest quarter", "Key brands"],
          rows: [
            ["Jackets / Coats", "Q4 (Oct–Dec)", "Sep, Feb", "Q3 (Jul–Aug)", "Stone Island, Patagonia, The North Face, Carhartt"],
            ["Hoodies / Sweatshirts", "Q4 + Q1 (Oct–Mar)", "Sep, Mar", "Q3 (Jul–Aug)", "Stone Island, Fred Perry, Nike, Supreme"],
            ["Knitwear / Fleeces", "Q4 (Oct–Dec)", "Sep", "Q2–Q3 (Apr–Aug)", "Patagonia, Ralph Lauren, The North Face"],
            ["Shirts / Polos", "Q2–Q3 (Apr–Aug)", "Mar, Sep", "Q4 (Nov–Jan)", "Fred Perry, Lacoste, Tommy Hilfiger"],
            ["Sneakers / Trainers", "Year-round", "Minor Q4 dip", "Jan (post-Christmas)", "Nike, Adidas, New Balance, Jordan, Vans"],
            ["Denim / Jeans", "Year-round", "Slight Q3 lift", "Low variance", "Levi's, Diesel, Carhartt"],
            ["Bags / Accessories", "Q4 (gift season)", "Nov peak", "Q3 (Jul–Aug)", "Gucci (bags avg €306/departure)"],
            ["Shorts / Swimwear", "Q2–Q3 (May–Aug)", "Apr, Sep", "Q4 (Oct–Feb)", "Nike, Adidas, Lacoste"],
          ],
        },
      },
      {
        h: "Daily timing — the honest version",
        p: [
          "The standard advice: list between 18:00 and 22:00 on weekdays when casual browsing peaks after work, or on Sunday evening when buyers plan the week ahead. We have not measured Vinted's traffic by hour and cannot — so treat those as plausible defaults, not findings. Test it on your own account by splitting comparable listings across two times of day and comparing.",
          "What we can say from departure data: the day-of-week effect on a well-priced, in-season listing from a sought brand is small. A Fred Perry Shirt at €12 (buy-below €9) in September will sell within 2–5 days regardless of listing hour. A Stone Island Jacket in November will sell within 3–7 days at a fair price regardless of listing hour. The hour matters at the margin. The season decides whether the item sells at all in the next 30 days.",
        ],
        cta: pricingMidCta("ctr_listtime_20260915"),
      },
      {
        h: "The bump — when and why to use it",
        p: [
          "Vinted's Bump moves your listing back to the top of the feed, paid. It makes most sense for in-season stock that has been live for more than 7–10 days without a sale: the item has real demand, the price is right, and the only problem is visibility has faded.",
          "A Bump on out-of-season stock, or on an item priced above the market departure average, is money wasted. The feed exposure does not manufacture demand. If an item has sat 3+ weeks without a sale, the answer is almost always a price reduction, not a paid push. The [market departure price for your brand and category](https://resaleiq.dev/data) is the anchor — if you are above it, cut first.",
        ],
      },
      {
        h: "Refreshing vs relisting",
        p: [
          "Deleting and relisting restarts the clock on views and favourites the old listing accumulated. That existing engagement is not nothing — buyers who favourited an item get notified of a price drop. Lose the listing and you lose those notifications.",
          "A small price adjustment (even €1–2) triggers a 'price dropped' notification to everyone who favourited the item. That is almost always more effective than a relist. Pair a price adjustment with a new cover photo (the one most buyers see in feed) for the same algorithmic boost as a fresh listing without losing the engagement. [Brands clearing fastest right now](" +
            ilinkHref("flip") +
            ") tells you whether low sell-through is a timing problem or a sourcing problem.",
        ],
      },
      {
        h: "Autumn 2026: the categories to list now",
        p: [
          "Week to 14 September 2026 (EU5): the transition is confirmed live. If you are holding any of the following, list now rather than waiting for an arbitrary date:",
          "Stone Island: 796 total departures/week, Hoodies €55 avg, Jackets €142 avg. Patagonia: 792/week, Jackets €75 avg. The North Face: 410/week, Jackets and Fleeces dominant. Carhartt: 70/week — WIP Detroit Jackets exit €80–120 at charity shop sourcing prices of €10–15. [Each brand's full sourcing guide, buy-below and individual category breakdown](/blog/best-brands-to-resell-on-vinted) is in the 28-brand hub.",
          "Fred Perry Shirts are in softening territory for September — 199 departures in the last 30 days still, but Shirts specifically (the dominant Fred Perry category) typically slow through October as outerwear displaces them in buyer searches.",
        ],
        cta: pricingBodyCta("body_listtime_20260915"),
      },
    ],
    faq: [
      { q: "What is the best time to list items on Vinted?", a: "Season matters more than hour. Week to 14 September 2026, Hoodies (1181 departures in the last 30 days), Jackets (955) and outerwear are the fastest-moving categories on EU Vinted — autumn has started. For daily timing, evenings between 18:00 and 22:00 and Sunday evenings are the conventional defaults, but we have not measured Vinted's hourly traffic directly." },
      { q: "What sells fastest on Vinted in autumn?", a: "Hoodies, Jackets and Fleeces. Week to 14 September 2026 on EU Vinted: Hoodies 1,181 watched departures in 7 days, Jackets 955. Key brands: Stone Island (796 total departures/week, Hoodies avg €55, Jackets avg €142), Patagonia (792/week, Jackets avg €75), The North Face (410/week). If you have outerwear in stock, the listing window is now." },
      { q: "Should I relist on Vinted if something hasn't sold?", a: "No — a price adjustment or new cover photo is almost always better. Deleting and relisting discards every favourite and view the listing accumulated. Favouriting buyers get a price-drop notification when you reduce the price, which is more effective than a fresh listing with no followers. Only relist if the listing is more than 30 days old and has zero engagement." },
      { q: "When is the worst time to sell summer clothes on Vinted?", a: "October to February. EU Vinted departure data shows Shirts and Shorts volumes decline sharply from late September. Selling summer stock in October means competing on price against in-season buyers, often at a 20–30% reduction from peak prices. Holding summer stock past September ties up capital for roughly six months — sell now at a small discount, or accept the wait." },
      { q: "Does using the Vinted Bump help items sell faster?", a: "Only when the item is in-season and priced at or below the market departure average. A Bump on an overpriced or off-season listing buys feed exposure, not demand. The departure average for your brand and category is at resaleiq.dev/data — if your price is above it, reduce first." },
      { q: "What is a 'watched departure' on Vinted?", a: "A watched departure is a listing that left the shelf — sold or removed — as tracked by Resale IQ. It is not a confirmed receipt. Weekly departure volumes and average exit prices for 28 brands across Spain, France, Germany, Italy and Portugal are published free at resaleiq.dev/data." },
      { q: "Does day of week matter for Vinted listings?", a: "Marginally. Sunday evening sees elevated browsing in EU markets; weekday evenings (18:00–22:00) are also suggested by conventional wisdom, though we have not measured Vinted's hourly traffic directly. In-season positioning and price relative to the departure average determine whether an item sells this week. Day of listing determines whether it gets a first-day visibility boost." },
    ],
  },
  {
    slug: "vinted-listing-description-guide",
    title: "How to Write Vinted Descriptions — Titles Buyers Search",
    seoTitle: "Vinted Listing Descriptions That Sell",
    description: "What to write so buyers find and trust your listing — patterns from items that actually sold.",
    date: "2026-08-06",
    updated: "2026-09-13",
    category: "Selling",
    readMins: 4,
    preflightQuery: "New Balance 550",
    intro:
      "Your description does two jobs: it gets you found in Vinted's search, and it removes the doubts that stop someone buying. Most listings fail at both.",
    sections: [
      {
        h: "Title: the words buyers actually type",
        p: [
          "Lead with brand + item + key attribute: 'Nike Tech Fleece hoodie grey M'. That's exactly what people search. [Brands clearing fastest right now](" +
            ilinkHref("flip") +
            ") is a live list of the names buyers actually type. Why the title is a search problem rather than a copywriting one is in [photos and titles](/manual/photos-and-titles).",
          "Skip filler like 'gorgeous', 'rare' and emojis in the title — they crowd out searchable words and add nothing.",
        ],
        cta: pricingMidCta("ctr_desc_20260913"),
      },
      {
        h: "Description: answer the doubts",
        p: [
          "State size and measurements (chest, length), material, condition, and any flaws. Measurements alone prevent a large share of returns.",
          "Say why you're selling and whether it's been washed or worn much. Small human details build trust on secondhand platforms.",
        ],
      },
      {
        h: "Keywords without spam",
        p: [
          "Include natural variations a buyer might use — 'trainers' and 'sneakers', or the colour name. Don't paste unrelated brand names; Vinted penalises it and buyers distrust it.",
        ],
      },
    ],
    faq: [
      { q: "What should I write in a Vinted description?", a: "Size and measurements, material, condition, any flaws, and how much it's been worn. Lead your title with brand + item + size, since that's what buyers search for." },
      { q: "Do keywords matter on Vinted?", a: "Yes — Vinted search matches your title and description, so include the natural words buyers use (both 'trainers' and 'sneakers', for example). Don't stuff unrelated brand names; it's penalised and reduces trust." },
    ],
  },
  {
    slug: "thrift-store-flipping-guide",
    title: "Thrift Store Flipping — Buy-Below Before You Fill the Boot",
    seoTitle: "Thrift Flipping: Buy-Below Before the Boot — Resale IQ",
    description:
      "Know buy-below before you fill the boot. Charity shops and car boots pay — if you check demand and walk away above the number.",
    date: "2026-08-06",
    updated: "2026-09-13",
    category: "Sourcing",
    readMins: 6,
    preflightQuery: "New Balance 550",
    intro:
      "Charity shops and car boots are where the best margins live — you can buy at a few euros and sell at twenty. But they're also where most beginners fill their homes with unsellable stock. Here's the discipline that separates the two.",
    sections: [
      {
        h: "Have a target list before you go",
        p: [
          "Walking in and 'seeing what's there' is how you buy junk. Go in knowing the brands and models that actually sell, and what you can pay for each. [Brands clearing fastest right now](" +
            ilinkHref("flip") +
            ") is that list.",
          "A short list of 10–15 target brands turns a two-hour rummage into a fast, focused scan. If your list leans older or one-off pieces, [spotting genuinely valuable vintage](/blog/vintage-clothing-reselling-guide) is a separate skill worth learning before you buy.",
        ],
        cta: pricingMidCta("ctr_thrift_20260913"),
      },
      {
        h: "The 30-second check",
        p: [
          "Brand label → condition → size → price. If any of the four fails, put it back. Most items fail on size or condition.",
          "Check seams, armpits, collars and hems for wear. Check zips work. A flaw you miss is a return you'll pay for.",
        ],
      },
      {
        h: "Know your number before you queue",
        p: [
          "The buy-below price decides everything. If the tag is above it, walking away IS the profitable decision. [What actually left the shelf this week](" +
            ilinkHref("data") +
            ") is the public average.",
          BRAND + " gives you that number per item from " + `${TRACKED} listings across 5 EU markets, so you can check on your phone in the aisle instead of guessing.`,
        ],
      },
    ],
    faq: [
      { q: "What should I look for when thrift flipping?", a: "Recognisable brands in good condition and common sizes, priced below your buy-below number. Check labels, seams, armpits, hems and zips. If brand, condition, size or price fails, put it back." },
      { q: "How much should I pay at a charity shop to resell?", a: "No more than your buy-below price — roughly the item's average sale price × 0.95 (after fees) × 0.70 for about a 30% margin. Anything above that is speculation." },
    ],
  },
  {
    slug: "vinted-shipping-guide-sellers",
    title: "Vinted Shipping for Sellers: Costs, Packing and Speed",
    seoTitle: "Who Pays Vinted Shipping? Usually the Buyer — Resale IQ",
    description:
      "The buyer usually pays Vinted shipping. Pack cheaply, waterproof the item, and dispatch fast — speed protects your ratings more than new packaging.",
    date: "2026-08-06",
    category: "Selling",
    readMins: 4,
    preflightQuery: "New Balance 550",
    intro:
      "Shipping is where new sellers lose margin and ratings. The mechanics are simple once you know them, and getting them right costs almost nothing.",
    sections: [
      {
        h: "Who pays",
        p: [
          "On Vinted the buyer normally pays shipping, chosen at checkout. Your job is to dispatch quickly using the label provided.",
          "Because the buyer sees shipping added to your price, keeping the item price competitive matters more than it first appears — competitive against [what actually left the shelf this week](" +
            ilinkHref("data") +
            "), not against retail.",
        ],
      },
      {
        h: "Packing without wasting money",
        p: [
          "Reuse clean poly mailers and boxes. Buyers care that the item arrives clean and dry, not that the packaging is new.",
          "Waterproof the item (a bag inside the mailer) and remove old labels. A ruined parcel is a refund plus a bad review.",
        ],
      },
      {
        h: "Speed protects your account",
        p: [
          "Dispatch within a day or two. Slow dispatch is the most common cause of poor ratings, and ratings affect how much buyers trust you.",
          "Upload tracking promptly so the buyer can see movement — most disputes are really just anxiety about silence.",
        ],
      },
    ],
    faq: [
      { q: "Who pays for shipping on Vinted?", a: "The buyer normally pays shipping, selected at checkout. The seller's responsibility is to pack properly and dispatch quickly using the provided label." },
      { q: "How fast should I ship a Vinted order?", a: "Within one to two days. Slow dispatch is the most common cause of poor seller ratings, and ratings directly affect buyer trust and sales." },
    ],
  },
  {
    slug: "how-to-get-more-views-on-vinted",
    title: "How to Get More Views on Vinted in 2026 — 4 Causes and Fixes",
    seoTitle: "How to Get More Views on Vinted (2026)",
    description: "Why your listings stall and what actually moves them, from real sold-listing patterns.",
    date: "2026-08-06",
    updated: "2026-09-20",
    category: "Selling",
    readMins: 5,
    preflightQuery: "New Balance 550",
    intro:
      "No views on Vinted usually means one of four things: nobody is searching for the item, your title doesn't match what buyers type, your price is above what comparable listings leave at, or your listing has gone stale. Work through them in that order before blaming the algorithm. As of 20 September 2026, the busiest categories leaving the shelf across 20 published brands were Hoodies (780 departures in the last 30 days), Jackets (107) and Sneakers (82). If your item sits in a thin category, low views is a demand problem no photo or title will fix. Check that first. We watched 566 departures this week from 5,341,780 tracked listings in ES/FR/DE/IT/PT. Fred Perry moved 96 times at €16. Gucci moved 26 times at €303. Extra views on a thin brand will not print money. Check the item on resaleiq.dev (BUY/WATCH/SKIP, Starter €19/mo). Weekly volumes stay free on /data.",
    sections: [
      {
        h: "First: is there demand at all?",
        p: [
          "If an item genuinely has low sell-through, no amount of optimisation will fix it. Check demand before blaming the listing — this is the step most sellers skip. [What each brand sells per week](" +
            ilinkHref("flip") +
            ") answers it in one look.",
        ],
        cta: pricingMidCta("body_views_20260913"),
      },
      {
        h: "Demand is the other half of the views",
        p: [
          "More views are useful only when the item has a chance of leaving the shelf. Before spending time on photos, titles, or relisting, use demand to choose what is worth pushing — then use buy-below to decide what is worth buying.",
          "Week to 20 September 2026 (EU5: ES/FR/DE/IT/PT), we watched 566 departures across 20 published brands (28 tracked; floor of 5). Fred Perry: 96 departures. Stone Island: 62. Gucci: 26 departures at an average €303. Those are different demand-and-cash decisions: volume can turn money faster; a higher exit price can leave more per unit but move less often.",
          "The filter is simple:",
          "1. Demand: is this brand/model moving enough this week that extra views could become a sale?",
          "2. Buy-below: what is the most you can pay after fees and still keep your margin?",
          "Do not buy a cheap item just because it can attract views, and do not optimise a listing whose demand is too thin to clear stock. Use both numbers in the tool before you commit cash: demand selects the opportunity; buy-below caps the risk.",
          "Full weekly table (free to cite): [Vinted market data](" +
            dataCiteHref("body_views_deepen_002_20260913") +
            ").",
        ],
        // BODY-VIEWS-002 / EX-CONTENT-BODY-005. Keep the body_views mid-CTA above.
        cta: pricingBodyCta("body_views_deepen_002_20260913"),
      },
      {
        h: "Match the words buyers type",
        p: [
          "Use the brand and model exactly as people search it, plus common synonyms. If your title says 'vintage jumper' and buyers search 'Nike sweatshirt', you're invisible. [Which brands lead each category](/category) is a good source of the wording buyers actually use.",
        ],
      },
      {
        h: "Price and freshness",
        p: [
          "Price above the typical departure range suppresses views badly. A modest reduction often restarts traffic — compare against [what actually left the shelf this week](" +
            ilinkHref("data") +
            "), then [check the typical departure price first](/tools/vinted-price-checker) so you cut to the right number rather than guessing.",
          "Vinted favours fresh activity. Regular small updates and consistent listing keep your closet visible.",
        ],
      },
      {
        h: "A bigger closet compounds",
        p: [
          "More live listings means more entry points into your closet. Sellers with 50+ quality listings get discovered far more than sellers with five.",
        ],
      },
    ],
    faq: [
      { q: "Why is nobody viewing my Vinted listings?", a: "Usually one of four causes: there's no real demand for the item, your title doesn't match what buyers search, your price is above the typical departure range, or the listing has gone stale. Check demand first." },
      { q: "How do I get more views on Vinted?", a: "Use the exact brand and model wording buyers search, price within the typical departure range, keep photos clear, and grow your number of live listings — more listings means more ways to be found." },
    ],
  },
  {
    slug: "seasonal-reselling-calendar",
    title: "Seasonal Reselling Calendar — Don't Freeze Your Cash",
    seoTitle: "Reselling Calendar: What Sells Each Month",
    description: "Which categories move in which month, from real departure data across 5 EU Vinted markets.",
    date: "2026-08-06",
    updated: "2026-09-14",
    category: "Sourcing",
    readMins: 5,
    preflightQuery: "New Balance 550",
    intro:
      "Reselling is a seasonal business. Buy against the season, sell into it — but only if you can afford to hold. As of 14 September 2026, Jackets were the highest-value fast-moving category we track (199 departures in the last 30 days at an average €68), well ahead of Hoodies (199 departures in the last 30 days at €45) on price — which is exactly why coats bought cheap in summer and sold into winter carry the season's best margin. Here's the rhythm.",
    sections: [
      {
        h: "Buy low season, sell high season",
        p: [
          "Coats, knitwear and boots are cheapest in spring and summer, and sell best from October to January.",
          "Shorts, dresses, swimwear and light trainers are cheapest in autumn/winter and sell from April to July.",
        ],
        cta: pricingMidCta("ctr_seasonal_20260913"),
      },
      {
        h: "The cash-flow trap",
        p: [
          "Holding stock for six months means your money earns nothing while you wait. Only buy far off-season when the discount is genuinely large — large relative to [the brand's actual average sale price](" +
            ilinkHref("data") +
            "), not to retail.",
          "Beginners should stay closer to the current season until cash flow is comfortable.",
        ],
      },
      {
        h: "Year-round movers",
        p: [
          "Sneakers, denim, branded T-shirts and hoodies sell all year with milder seasonal swings — they're the backbone of a stable closet. Check [brands clearing fastest right now](" +
            ilinkHref("flip") +
            ") if you're building that year-round base. Weekly volumes for [sneakers](/category/sneakers), [jeans](/category/jeans) and [hoodies](/category/hoodies) are published free.",
        ],
      },
    ],
    faq: [
      { q: "When should I buy winter clothes to resell?", a: "Spring and summer, when prices are lowest, then list from October through January when demand peaks — but only if you can afford to hold the stock for months." },
      { q: "What sells all year round on Vinted?", a: "Sneakers, denim, branded T-shirts and hoodies have relatively mild seasonal swings and form a stable, year-round base for a reselling closet." },
    ],
  },
  {
    slug: "vinted-vs-ebay-for-sellers",
    title: "Vinted vs eBay for Sellers: Which Makes More Profit?",
    seoTitle: "Is Vinted or eBay Better? Pick Per Item — Resale IQ",
    description:
      "Vinted usually nets more on everyday fashion: no seller commission. eBay wins on rare or collectable items. Pick per listing, not per shop.",
    date: "2026-08-06",
    category: "Platforms",
    readMins: 5,
    preflightQuery: "New Balance 550",
    intro:
      "Vinted and eBay both sell secondhand clothing, but they take very different cuts and attract different buyers. The right answer is usually 'both, depending on the item'.",
    sections: [
      {
        h: "Fees",
        p: [
          "Vinted charges buyers a Buyer Protection fee and lets sellers list free, so more of the sale price reaches you.",
          "eBay charges the seller a final value fee plus insertion costs above the free listing allowance — meaningfully more per sale.",
        ],
      },
      {
        h: "Audience and item fit",
        p: [
          "Vinted is fashion-focused with a large, mobile, everyday-brand EU audience — ideal for mid-market clothing volume.",
          "eBay reaches a wider, more international and often older buyer base, and does better on collectables, rare sizes, technical gear and [vintage with a story](/blog/vintage-clothing-reselling-guide). If you're weighing a third option for that curated end, [Vinted vs Depop for sellers](/blog/vinted-vs-depop-for-sellers) covers where each one pays more.",
        ],
      },
      {
        h: "How to choose per item",
        p: [
          "High-volume everyday fashion → Vinted. Rare, collectable or niche technical items where a global buyer pool matters → eBay. [Brands clearing fastest right now](" +
            ilinkHref("flip") +
            ") are almost all that everyday-fashion set.",
          "Whichever you choose, the profit is set at the buy. Anchor to [what actually left the shelf this week](" +
            ilinkHref("data") +
            "). " +
            BRAND +
            "'s fee calculator shows the net payout per platform so you can list where you keep the most.",
        ],
      },
    ],
    faq: [
      { q: "Is Vinted or eBay better for selling clothes?", a: "Vinted usually nets more on everyday fashion because sellers list free and don't pay a commission. eBay is better for rare, collectable or niche items where a wider international audience justifies the higher seller fees." },
      { q: "Does eBay charge sellers more than Vinted?", a: "Generally yes. eBay takes a final value fee from the seller, while Vinted charges buyers a protection fee and lets sellers list for free." },
    ],
  },
  {
    slug: "scale-reselling-side-hustle-to-full-time",
    title: "Scaling Reselling From Side Hustle to Full-Time",
    seoTitle: "Can You Go Full-Time Reselling? Kill Bottlenecks — Resale IQ",
    description:
      "Most resellers run out of hours, not deals. Filter buys to known demand and buy-below — then cash flow and inventory become the bottlenecks.",
    date: "2026-08-06",
    updated: "2026-09-12",
    category: "Business",
    readMins: 6,
    preflightQuery: "New Balance 550",
    intro:
      "Most resellers plateau at the same place: they run out of hours, not opportunities. Scaling isn't about working more — it's about removing the bottleneck. (General information, not a promise of earnings.)",
    sections: [
      {
        h: "Bottleneck 1: sourcing time",
        p: [
          "Early on, sourcing is browsing. At scale it has to become a filter: known targets from [brands clearing fastest right now](" +
            ilinkHref("flip") +
            "), known buy-below prices from [what actually left the shelf this week](" +
            ilinkHref("data") +
            "), fast yes/no decisions.",
          "Anything that makes the buy decision faster and more accurate multiplies everything downstream.",
        ],
      },
      {
        h: "Bottleneck 2: cash flow",
        p: [
          "Profit locked in unsold stock is not working capital. Sell-through matters more as you grow, because slow stock silently caps how fast you can reinvest.",
          "Track what percentage of purchases actually sell within 30 and 60 days. That number, not revenue, tells you whether you can scale.",
        ],
      },
      {
        h: "Bottleneck 3: listing throughput",
        p: [
          "Batch your work — photograph many items in one session, write listings in another. Context-switching is what makes reselling feel endless. The longer version of what actually breaks between twenty and two hundred listings, and the systems that have to exist first, is in [scaling past the hobby](/manual/scaling-past-the-hobby).",
        ],
      },
      {
        h: "What to fix first",
        p: [
          "Almost always sourcing quality. Fixing what you buy improves margin, sell-through and cash flow at once. " + BRAND + " exists for exactly that decision.",
        ],
      },
    ],
    faq: [
      { q: "How do I scale a reselling business?", a: "Remove the bottleneck rather than working more hours. Systematise sourcing with target lists and buy-below prices, track how much stock sells within 30–60 days to protect cash flow, and batch photography and listing work." },
      { q: "What stops most resellers from going full-time?", a: "Cash tied up in slow-moving stock and the hours spent sourcing without a system. Improving what you buy fixes margin, sell-through and cash flow simultaneously." },
    ],
  },
  {
    slug: "what-is-retail-arbitrage-secondhand",
    title: "Retail Arbitrage in Secondhand Fashion, Explained",
    seoTitle: "What Is Retail Arbitrage? Not Countries — Resale IQ",
    description:
      "Buy cheap, sell dear — but on Vinted that is mispricing, not countries. The same listing often shows on several EU domains at the same price.",
    date: "2026-08-07",
    category: "Business",
    readMins: 5,
    preflightQuery: "New Balance 550",
    intro:
      "Arbitrage is buying something where it is cheap and selling it where it is dear. In secondhand fashion the version everyone repeats is geographic — buy in Spain, sell in Germany. We checked that against our own crawl of all five EU Vinted domains, and it is mostly not true.",
    sections: [
      {
        h: "The country-gap version does not survive the data",
        p: [
          "We compared every listing we had collected on Vinted's Spanish, French, German, Italian and Portuguese domains by listing ID. If these were five separate marketplaces, the overlap would be small. Instead, depending on the brand and category, the large majority of listings appeared on more than one domain, and a substantial share appeared on all five at once. We haven't yet published the exact percentages with the query and date behind them, so read the size of the effect as directional.",
          "The prices settle it. Of the listings present on four or more domains, nearly all carried an identical price on every one — not a similar price, the same number. A buyer browsing the German site can already see the Spanish listing, at the Spanish price. There is little gap left to capture.",
          "A side effect worth knowing: because the same listing is counted once per domain, adding up per-country Vinted figures overstates the real number of distinct listings by several times. Treat any per-country volume stat with suspicion unless the source says how it deduplicates.",
        ],
      },
      {
        h: "The version that does work: mispricing, not geography",
        p: [
          "Real arbitrage on Vinted is not between places, it is between what a seller thinks an item is worth and what it actually sells for. Those gaps appear constantly, because most sellers are clearing a wardrobe rather than trading, and they price by guessing. [Brands clearing fastest right now](" +
            ilinkHref("flip") +
            ") are where mispricing is worth hunting.",
          "The tells are consistent: a vague title with no model name, so the listing never surfaces in the searches that would price it correctly; casual photos; and a round-number price that was chosen rather than researched. The item is cheap because it is invisible, not because it is worthless.",
        ],
      },
      {
        h: "Turning it into a system",
        p: [
          "The workflow is: know the item's real value from [what actually left the shelf this week](" +
            ilinkHref("data") +
            "), know your buy-below price, then find listings underneath it before anyone else does. Speed matters — if verifying a find takes ten minutes, the good ones are gone and you systematically end up with only the listings nobody else wanted.",
          BRAND + " computes the buy-below price per model from watched departures across all five EU domains, and on Pro surfaces live listings already beneath it. That is mispricing detection, not a geographic play — the edge is knowing the item, not knowing a border.",
        ],
      },
      {
        h: "Where geography does still help",
        p: [
          "Upstream of the platform. Charity shops, car boot sales, local classifieds and wholesale contacts are genuinely bounded by where you live, and a reseller in another country cannot touch them. That is a durable edge.",
          "So the honest strategy inverts the usual advice: source locally, where distance protects you from competition, and sell into the shared pool, where distance does not exist.",
        ],
      },
    ],
    faq: [
      { q: "What is retail arbitrage in reselling?", a: "Buying an item where it is cheap and selling it where it is worth more. In secondhand fashion the durable version is buying underpriced listings — items priced by sellers who do not know what they have — rather than moving stock between countries." },
      { q: "Can you buy on Vinted in one country and resell in another?", a: "Generally not profitably. We found that most listings appear on several of Vinted's five EU domains, and nearly all of those present on four or more are priced identically on all of them. The buyer in the expensive country can already see the cheap listing at the same price." },
      { q: "Can you make money buying on Vinted and reselling on Vinted?", a: "Yes, but from mispricing rather than geography. Underpriced listings appear constantly because most sellers guess at prices. The skill is knowing the item's real value and your maximum buy price before you commit, and acting faster than the people who have to look it up." },
    ],
  },
]
