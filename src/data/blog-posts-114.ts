// Batch 114 — How to get more views on Vinted listings.
// Targets the #1 seller complaint: "my listings don't get views."
// Sources: Vinted algorithm research (Tissuco, Vinting.app, Vinkit, Supervint 2026),
// live API data (19 Sep 2026). Zero fabrication: all numbers from the live market snapshot.

import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

export const POSTS_114: BlogPost[] = [
  {
    slug: "how-to-get-more-views-on-vinted-listings",
    title: "How to Get More Views on Vinted Listings (2026)",
    seoTitle: "How to Get More Views on Vinted Listings — 2026 Guide | Resale IQ",
    description:
      "Your Vinted listings are not getting views because of fixable signals: title, category, price, photos, and engagement. Learn the 5 ranking factors + live data from 5.4M tracked listings to fix visibility in 7 days.",
    date: "2026-09-19",
    category: "Selling",
    readMins: 7,

    preflightQuery: "Adidas Superstar",

    intro:
      "Most Vinted listings do not get views because of five fixable signals: the title does not match what buyers search, the category is wrong, the price is above market, the photos are low quality, and the listing has no engagement history. This guide breaks down exactly how Vinted's ranking algorithm works and gives you a 7-day plan to fix visibility — with live data from 5.4M tracked EU listings showing what actually gets seen.",

    definedTerm: {
      name: "Vinted listing visibility",
      description:
        "The number of times a Vinted listing appears in search results, category feeds, and recommendations. Visibility is driven by 5 ranking factors: freshness (recently posted or edited), listing quality (title, photos, description), user engagement (clicks, likes, messages), price competitiveness (within 10-15% of market average), and seller reputation (rating, response speed, review count). There is no paid boost or official visibility reset button.",
    },

    sections: [
      {
        h: "The 5 ranking factors that decide if your listing gets seen",
        p: [
          "Vinted's algorithm works like a search engine, not a social feed. With over 105 million registered users, the platform is selective about what appears in search results. The 5 factors that determine visibility are: (1) Freshness — recently posted or edited listings get a short boost that fades over 48-72 hours. (2) Listing quality — title keyword match, photo quality, and description completeness. (3) User engagement — clicks, likes, messages, and purchases on your listing. (4) Price competitiveness — items priced above market get fewer clicks, which the algorithm reads as a relevance miss. (5) Seller reputation — rating above 4.7/5, 20+ reviews, response rate under 24h.",
          "The critical insight is that these factors compound. A listing with a perfect title but overpriced gets fewer clicks, which signals low relevance, which reduces visibility, which gets fewer clicks. The good news is that fixing any single factor breaks the cycle. The 7-day plan below addresses all 5 in order of impact.",
          `Before you change anything, know your market. If Balenciaga sold 209 times this week at €134 average across 5 EU markets, that is your price benchmark — not what other sellers are optimistically asking. [Check what your item should sell for →](/tools)`,
        ],
        cta: pricingBodyCta("ctr_views_ranking_factors_20260919"),
      },
      {
        h: "Day 1-2: Fix the title and category (the biggest visibility leak)",
        p: [
          "The title formula that actually works: Type + Brand + Model + Detail + Size + Colour + Condition. Example: 'Levi's 501 men's jeans W32 L34 raw blue very good condition'. Not 'Nice jeans'. The algorithm indexes titles at the time of posting — changing 'Red Dress' to 'Zara T36 Red Midi Flared Dress — Size 38' can triple views because it now matches real search queries.",
          "Category accuracy is the fastest way to become invisible. A dress filed under 'Tops' will not appear when a buyer filters by 'Dresses'. The item simply does not exist in that search. Curated Closet SEO audited hundreds of Vinted listings and found incorrect categories were one of the most common reasons good listings received low views. The fix takes ten seconds.",
          "Title rules that matter: Do not repeat the brand twice to pad character count. Include the material if it is commonly searched ('wool', 'denim', 'silk'). Use the name buyers type, not the internal product name from the brand's website. Avoid filler words like 'beautiful', 'gorgeous', or 'rare' — the algorithm ignores them. Write the title for the search bar, not for the product page.",
          `Use the live departure data to see which categories actually move. Fred Perry Shirts sold 74 times this week at €15 average — if you are selling a Fred Perry shirt, the category 'Shirts' is correct and the title should lead with 'Fred Perry'. [See live category data →](/data)`,
        ],
        cta: pricingMidCta("ctr_views_title_category_20260919"),
      },
      {
        h: "Day 3-4: Price to the market so the algorithm rewards you",
        p: [
          "Price is the first filter most buyers apply, and listings priced far from the market get fewer clicks — which the algorithm reads as a relevance miss. The benchmark: optimal price = average competitor price × 0.85. Price within about 10-15% of what comparable items actually sell for. The problem is Vinted does not show sold prices directly, so most sellers guess from asking prices and get it wrong.",
          "The data tells you the real market price. If Stone Island Hoodies sold 54 times this week at €55 average, that is your price — not the €80 another seller is asking. Price at €47-49 (85% of €55) for speed, or €52-55 for margin. The 10-15% spread is where the algorithm still shows your listing but doesn't bury it.",
          "A price drop greater than 5% triggers a notification to all users who favorited the item and slightly boosts it in the algorithm. This is the only 'free boost' Vinted offers — use it when a listing has been stale for 2+ weeks.",
          `ResaleIQ's watched departure count shows how many comparable items actually sold this week — not how many are listed. If Calvin Klein sold only 6 times, the market is thin and no visibility fix creates demand. [Check demand for your item →](${ilinkHref("flip")})`,
        ],
        cta: pricingBodyCta("ctr_views_pricing_20260919"),
      },
      {
        h: "Day 5-6: Photos and description that convert views to sales",
        p: [
          "The cover photo is the single biggest click-through driver. A worn photo (item being worn) is worth 6× more than a blurry photo. For women's fashion, take 2 minutes to wear the item — the impact is immediate. For flat-lay items (shirts, bags), use natural light, plain background, and show the item from front and back. Include a close-up of any flaw — hiding it creates returns and bad reviews.",
          "The description that reduces friction: mention the brand and size in the first line, precise condition ('worn 2 times', 'new with tags', 'small invisible snags at the elbows'), measurements for atypical items, and relevant hashtags at the bottom (#vintage #y2k #zara). A complete description reduces disputes and increases buyer confidence — which the algorithm reads as engagement.",
          "The 4-photo minimum: cover (worn or front), back view, close-up of material/texture, and a photo of any flaw. Listings with 4+ photos get measurably more clicks than those with 1-2. The algorithm tracks click-through rate as a relevance signal.",
          `If you are selling a category with high departure volume — like Balenciaga Sneakers (60 sold this week at €166) or Patagonia Jackets (73 sold at €41) — your listing should appear in search results. If it is not, the issue is one of the 5 factors above, not the market. [Check your item's market fit →](${ilinkHref("data")})`,
        ],
        cta: pricingMidCta("ctr_views_photos_description_20260919"),
      },
      {
        h: "Day 7: Engagement signals and the freshness reset",
        p: [
          "The algorithm tracks clicks, likes, messages, and purchases on each listing. Target: views-to-likes above 15%, likes-to-messages above 20%. If your listing gets 100 views and 2 likes, the cover photo or displayed price is not compelling. If it gets 15 likes and 0 messages, the price is too high or the description is incomplete.",
          "Freshness is the ranking signal most sellers misunderstand. New listings get a temporary visibility boost that fades over roughly 48-72 hours. Relisting — deleting and reposting — resets that freshness signal and can revive a stalled item. But only relist after you have genuinely improved the listing. Reposting the same mediocre photo and unchanged title just re-registers the same low engagement, and the boost fades faster each time.",
          "The 3-element edit trick: if you do not want to relist, modify at least 3 elements (photo, title, price, tags, description) to trigger a new discovery window. Replace the cover photo, rewrite the title with new keywords, adjust the price by even €1, add 2-3 new relevant tags, or enrich the description with measurements. Then share the item on your profile right after modifying it.",
          `The data shows which items get engagement. New Balance Sneakers sold 25 times this week at €54 — if your sneaker listing is not getting likes, the cover photo is the first thing to fix. [See what sells in your category →](/data)`,
        ],
        cta: pricingBodyCta("ctr_views_engagement_freshness_20260919"),
      },
      {
        h: "The 7-day visibility fix: day-by-day checklist",
        p: [
          "Day 1: Note your views, likes, messages over the last 7 days. This is your baseline. Day 2: Redo the cover photo — worn or natural-light flat-lay. Day 3: Rewrite the title using the formula: Type + Brand + Model + Size + Colour + Condition. Day 4: Adjust price to 85-100% of the sold-price benchmark (use live data, not asking prices). Day 5: Enrich description with measurements, condition details, and hashtags. Day 6: If still no messages, drop price another 5%. Day 7: Review the data — keep, relist with improvements, or delist.",
          "The end-of-week decision: if views are up but likes are flat, fix the cover photo. If likes are up but messages are flat, fix the price. If messages are up but sales are flat, fix the trust signals (response speed, review count, description completeness). Each signal tells you exactly what to fix next.",
          `Before you spend the week fixing visibility, confirm your item is in a liquid market. Patagonia sold 141 times this week at €33 average across 5 EU markets — that is a market where visibility fixes work. A brand with 6 departures in the last 30 days is a demand problem, not a visibility problem. [Check your item's demand →](${ilinkHref("flip")})`,
        ],
        cta: pricingMidCta("ctr_views_7day_checklist_20260919"),
      },
    ],

    faq: [
      {
        q: "How do I know if my Vinted listing is invisible or just unconvincing?",
        a: "Track 4 numbers over 7 days: views, clicks-to-listing, likes, and messages. Very few views = visibility issue (photo, title, category, season). Views but no clicks = cover photo or displayed price not compelling. Views + likes but no messages = price too high or description incomplete. Messages but no sale = negotiation, trust, or response time.",
      },
      {
        q: "Does relisting on Vinted actually work?",
        a: "Yes, but only if you genuinely improve the listing first. Relisting resets the freshness signal and gives a temporary visibility boost (48-72 hours). Reposting the same photo and title just re-registers the same low engagement, and the boost fades faster each time. Fix at least 3 elements before relisting.",
      },
      {
        q: "What is the best time to post on Vinted?",
        a: "Peak buyer activity is 12 PM-2 PM and 7 PM-10 PM on weekdays, and 10 AM-12 PM, 2 PM-5 PM, and 7 PM-9 PM on weekends. Avoid posting at night (11 PM-7 AM) or Friday evenings. The freshness boost fades within 48-72 hours, so posting just before peak windows maximizes initial visibility.",
      },
      {
        q: "How many photos should a Vinted listing have?",
        a: "Minimum 4: cover (worn or front), back view, close-up of material/texture, and a photo of any flaw. Listings with 4+ photos get measurably more clicks than those with 1-2. The algorithm tracks click-through rate as a relevance signal, and more photos = higher engagement.",
      },
      {
        q: "Does Vinted have a paid boost for listings?",
        a: "No. Vinted does not offer a paid visibility boost for regular sellers. The only 'free boost' is a price drop greater than 5%, which triggers a notification to users who favorited the item and slightly boosts it in the algorithm. Focus on the 5 ranking factors instead of paying for visibility that does not exist.",
      },
      {
        q: "How long does it take to see results from visibility fixes?",
        a: "Measure every 48-72 hours after each change. The freshness boost fades within that window, so you should see movement in views within 2-3 days of a title or photo fix. Give the full 7-day plan one cycle before deciding to relist or delist. The algorithm needs time to register the new engagement signals.",
      },
    ],
  },
]
