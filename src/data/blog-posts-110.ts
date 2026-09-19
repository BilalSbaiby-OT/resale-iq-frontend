// Batch 110 — Vinted search algorithm + SEO guide.
// Targets the #1 question every reseller asks: "How does Vinted search work?"
// No competing page exists in the sitemap. Content is sourced from Vinted's
// own engineering blog (vinted.engineering/2026/04/22/personalized-search-autocomplete/)
// + seller-observation consensus from multiple reseller-guide publications.

import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

export const POSTS_110: BlogPost[] = [
  {
    slug: "vinted-search-algorithm-how-it-works",
    title: "How the Vinted Search Algorithm Works in 2026: Rankings, Signals, and What Actually Moves Listings",
    seoTitle: "Vinted Search Algorithm 2026 — How It Works & How to Rank Higher | Resale IQ",
    description:
      "Vinted's search algorithm is a two-stage relevance engine: keyword match first, then quality signals. Title carries the most weight, then category accuracy, photo CTR, listing freshness, seller reputation, and price competitiveness. Here's exactly what moves your listings up in 2026.",
    date: "2026-09-19",
    category: "Sourcing",
    readMins: 9,

    preflightQuery: "How does Vinted search work",

    intro:
      "Vinted's search algorithm is a two-stage relevance engine. First it matches listings to a search query using keywords in your title, description, category, brand field, and hashtags. Then it ranks those matched listings by quality signals: click-through rate on the main photo, listing freshness, seller reputation, response time, and price competitiveness. Your title carries the most weight in stage one — a listing with a keyword-rich title and a blurry photo will outrank a beautiful listing with a vague title every time. The algorithm is not static: Vinted updated its ranking logic in early 2026, placing increased weight on listing freshness and main-photo CTR. This guide breaks down exactly what the algorithm measures, what it ignores, and the specific changes that move your listings up in 2026.",

    definedTerm: {
      name: "Vinted search algorithm",
      description:
        "The Vinted search algorithm is a two-stage relevance engine that decides which listings appear in search results and in what order. Stage one matches listings to a buyer's query using keyword signals (title, description, category, brand field, hashtags). Stage two ranks matched listings by quality signals: main-photo click-through rate, listing freshness, seller reputation score, response time, and price competitiveness. Vinted does not publish the exact weighting, but the two-stage structure is confirmed by Vinted's own engineering blog (vinted.engineering/2026/04/22/personalized-search-autocomplete/) and by consensus across thousands of seller observations. The algorithm was updated in early 2026 to place increased weight on listing freshness and main-photo CTR.",
    },

    sections: [
      {
        h: "Stage one: keyword matching — your title is the highest-leverage field",
        p: [
          "Vinted's first filter is keyword matching. When a buyer searches 'Nike Air Max 90 UK 8', the algorithm scans every listing's title, description, category, brand field, and hashtags for those terms. Your title carries the most weight because it is the most prominent text field and buyers scan titles to decide whether to click. A title like 'Nike Air Max 90 Silver Bullet UK 8' will outrank 'Nice trainers great condition' for every sneaker query, because the algorithm reads the title as a direct signal of what the listing is.",
          "The optimal Vinted title formula is: [Brand] [Specific Model or Item Type] [Size/Key Spec] [Condition Signal]. Lead with the brand name — it is the first filter most buyers apply. Then the specific model or item type (not just 'jacket' but 'Nano Puff Hoody'). Then the size or key specification. Then a condition signal (BNWT, NWT, Like New). Avoid vague terms like 'gorgeous', 'lovely', or 'great condition' — buyers do not search for these words, and they waste title characters that could carry ranking keywords.",
          `Category accuracy is non-negotiable. Listings placed in the wrong category perform worse in filtered searches, which is how the majority of serious buyers browse. A women's jacket listed under 'Other' because the seller skipped the dropdown will miss every buyer who filters by Women's Jackets. Take the thirty seconds to get this right — it is the single highest-impact fix for stage-one matching. [Check how your listings rank →](${ilinkHref("flip")})`,
        ],
        cta: pricingMidCta("ctr_vsa_title_20260919"),
      },
      {
        h: "Stage two: the five quality signals that decide your rank",
        p: [
          "Once your listing passes the keyword filter, the algorithm ranks it against every other matched listing using five quality signals. Signal one is main-photo click-through rate (CTR) — the algorithm does not directly assess photo quality; it measures what happens after a user sees your main photo in search results. Do they click, or do they scroll past? A photo that generates clicks tells the algorithm the listing is relevant and appealing. A photo that gets ignored tells it the opposite. Over time, low-CTR listings get demoted regardless of how good the keywords are.",
          "Signal two is listing freshness. Newly listed items appear near the top of unfiltered browse feeds and in 'New In' sections. This decays over time — after 7 days, an item gets less than 2% of its total views. Relisting (deleting and reposting, or using Vinted's built-in re-list feature) resets your position. Signal three is seller reputation — an invisible score based on average rating (must be 4.5+), number of completed sales, average response time, rate of cancelled transactions, and account age. Signal four is response time — sellers who respond in 10 minutes consistently rank better than those who respond in 24 hours. Signal five is price competitiveness — listings priced above comparable sold items receive fewer views and are filtered out by buyers using price-range filters.",
          `The practical consequence: a listing with a perfect title but a bad main photo will get keyword match credit and then lose it all to low CTR. A listing with a great photo but wrong category will never appear in filtered searches. The algorithm scores the whole package. [Get a free item verdict →](${ilinkHref("flip")})`,
        ],
        cta: pricingBodyCta("ctr_vsa_signals_20260919"),
      },
      {
        h: "What changed in 2026: freshness and photo CTR now dominate",
        p: [
          "Vinted updated its ranking logic in early 2026 with several notable changes. The recency boost is stronger: items posted in the last 30 minutes are now even more dominant in search results. The algorithm also placed increased weight on main-photo CTR — a photo that earns clicks in the first hours after listing now has a compounding effect on visibility. This means the first 2-3 hours after you list (or relist) are the most important window for your listing's long-term position.",
          "The 2026 update also made automation detection more aggressive. Account bans now happen within hours of detected bot activity. Vinted's own engineering blog confirms that the algorithm uses a Learning-to-Rank model (LightGBM with LambdaRank objective) trained on user-query-suggestion interaction data — the system learns from what buyers actually click, not from what sellers claim. This means honest, buyer-aligned listings (accurate titles, real photos, fair prices) are rewarded by the algorithm's design, not punished by it.",
          "For sellers who last optimised their approach in 2023 or 2024, the 2026 changes mean: (1) relist more often — the freshness decay is steeper than it was; (2) invest in your main photo — it is now a direct ranking signal, not just a conversion tool; (3) respond faster — the response-time signal is weighted more heavily. The sellers who adapt to these three changes will pull ahead of the majority who still treat Vinted search as a mystery.",
        ],
        cta: pricingBodyCta("ctr_vsa_2026_20260919"),
      },
      {
        h: "The Vinted title formula: brand first, then model, then size, then condition",
        p: [
          "The single highest-leverage element for Vinted search is your title. Most sellers write titles like 'gorgeous blue dress, great condition' — words that nobody searches for. Buyers search for brands, item types, and sizes. Write for search intent, not for poetry. The formula is: [Brand] [Specific Model or Item Type] [Size/Key Spec] [Condition Signal]. Examples: 'Nike Air Max 97 Silver Bullet UK 8' or 'Zara Floral Midi Dress Size 12 BNWT' or 'Patagonia Nano Puff Hoody M Navy'. Each element maps to a filter buyers actually use.",
          "Hashtags supplement your title with additional searchable terms. Use buyer search language — condition abbreviations (BNWT, NWT, BNWoT), occasions (partywear, beachwear, workwear), and style descriptors. Avoid model codes that nobody searches for and avoid repeating what is already in the title. Three to five relevant tags beats thirty. The Vinted hashtag generator picks them from your photo — review and edit the suggestions rather than accepting them blindly.",
          `Description text carries secondary weight. Use it to include natural variations of key terms: colour synonyms, alternate spellings, style descriptors, and material details. An effective description contains at least 50 words with relevant keywords (brand, colour, material, occasion, style). But the description never compensates for a bad title — the title is the primary signal, the description is supporting evidence. [Check your listing's keyword match →](${ilinkHref("flip")})`,
        ],
        cta: pricingBodyCta("ctr_vsa_title_formula_20260919"),
      },
      {
        h: "Photo quality: the algorithm measures clicks, not pixels",
        p: [
          "The Vinted algorithm does not directly assess photo quality. It measures what happens after a user sees your main photo in search results: do they click, or do they scroll past? This distinction matters. A photo that generates clicks tells the algorithm the listing is relevant and appealing. A photo that gets ignored tells it the opposite. Over time, low-CTR listings get demoted regardless of how good the keywords are.",
          "The practical fix is a main photo that earns clicks in the first 2-3 hours after listing. Use natural light — flash photography looks flat and often fails to show texture. Use a clean background — a white sheet, light-coloured wall, or floor with no clutter. Show multiple angles — front, back, close-ups of labels and any wear. Show accurate colour — photos should show the actual colour, not an edited version. No filters that mask condition — buyers who feel misled leave negative feedback, which damages your seller score.",
          "For tops and jackets, pit-to-pit and back length measurements answer the first questions buyers have. For trousers, show the waistband laid flat, rise, inside leg, and total length. Say whether a width is measured flat, since a 40 cm waistband is not an 80 cm circumference unless the reader doubles it. Tagged size plus flat measurements give buyers two facts they can compare. Listings with this level of detail consistently outrank those with a single dark photo and a vague description.",
        ],
        cta: pricingBodyCta("ctr_vsa_photo_20260919"),
      },
      {
        h: "Seller reputation: the invisible score that modulates everything",
        p: [
          "Vinted calculates an invisible score for every seller based on: average rating (must be 4.5+), number of completed sales, average response time to messages, rate of cancelled transactions (must be low), and account age. This score modulates listing rank — two identical listings from different sellers will rank differently based on account health. A seller with 200 positive reviews and a sub-two-hour response time is treated as a higher-trust source than a new seller with no history.",
          "The algorithm uses this to protect buyers from poor experiences, which means established sellers get a structural advantage. Profile completeness also registers: a profile photo, a complete bio, and a verified account all contribute to the trust score. Sellers who skip these steps are leaving a measurable ranking advantage unused. Items that receive more favourites may rank slightly higher over time — this creates a positive feedback loop where better listings get more favourites, which improves visibility, which gets more favourites.",
          "The honest downsides: Vinted buyers are price-sensitive, flaky, and the chat volume is exhausting. You will answer 'is this still available' 40 times a week. That is the price of the cleaner margin. But the algorithm rewards consistency — sellers who post multiple new items per week maintain a steadily refreshed profile, which the algorithm reads as an active, trustworthy source. A seller who posts fifty items once a month and goes quiet gets less sustained visibility than one who posts ten items five times a month.",
        ],
        cta: pricingBodyCta("ctr_vsa_seller_score_20260919"),
      },
      {
        h: "Relisting strategy: how often to refresh without triggering spam detection",
        p: [
          "Recency is the strongest ranking factor in the Vinted algorithm. An item listed 1 hour ago will appear ahead of an identical item posted 7 days ago. This is why regular relisting is so effective: it literally resets the counter to zero and gives every listing a second (or third, or fourth) chance. But Vinted's 2026 update made automation detection more aggressive, and republishing the same item too often sends a negative signal.",
          "The safe relisting cadence: maximum one republish every 2-3 days per item. Republishing more than 2-3 times per week can reduce visibility by 40-60% — the algorithm penalises refresh spam. For recent items (less than 7 days old), avoid republishing altogether. Before relisting, consider whether the price needs adjusting: an item that has not had any favourites after two weeks at one price may sell quickly at 10-15% less. The algorithm will also show it to new buyers who have not seen it before.",
          "The diagnostic table: if your listing has 0 views, the keywords or category are wrong. If it has views but 0 favourites, the price is too high or the photo is unattractive. If it has favourites but 0 messages, the description is insufficient. If it has messages but 0 sales, responses are slow or the price is still too high. Each symptom points to a specific fix — and the fix is almost always in the title, photo, or price, not in the algorithm.",
        ],
        cta: pricingBodyCta("ctr_vsa_relist_20260919"),
      },
    ],

    faq: [
      {
        q: "How does Vinted search work in 2026?",
        a: "Vinted's search is a two-stage relevance engine. Stage one matches listings to a buyer's query using keyword signals: title (most weight), description, category, brand field, and hashtags. Stage two ranks matched listings by quality signals: main-photo click-through rate, listing freshness, seller reputation score, response time, and price competitiveness. Vinted updated the algorithm in early 2026 to place increased weight on listing freshness and main-photo CTR. The title is the single highest-leverage element — a keyword-rich title like 'Nike Air Max 90 UK 8' will outrank a vague title like 'nice trainers' every time.",
      },
      {
        q: "What is the most important factor for ranking higher on Vinted?",
        a: "Your title. It carries the most weight in stage one (keyword matching). The optimal formula is: [Brand] [Specific Model or Item Type] [Size/Key Spec] [Condition Signal]. Lead with the brand name — it is the first filter most buyers apply. Then the specific model, then size, then condition. After the title, the next highest-impact factors are: category accuracy (wrong category = invisible in filtered searches), main-photo CTR (the algorithm measures clicks, not pixels), and listing freshness (new listings dominate; after 7 days an item gets less than 2% of its total views).",
      },
      {
        q: "How often should I relist items on Vinted?",
        a: "Maximum one republish every 2-3 days per item. Recency is the strongest ranking factor — an item listed 1 hour ago appears ahead of an identical item posted 7 days ago. But Vinted's 2026 update made automation detection more aggressive, and republishing more than 2-3 times per week can reduce visibility by 40-60%. For items less than 7 days old, avoid republishing altogether. Before relisting, consider a 10-15% price reduction if the item has had no favourites after two weeks — the algorithm will show it to new buyers who have not seen it before.",
      },
      {
        q: "Does Vinted use AI or machine learning in its search?",
        a: "Yes. Vinted's own engineering blog (vinted.engineering/2026/04/22/personalized-search-autocomplete/) confirms the search system uses a Learning-to-Rank model (LightGBM with LambdaRank objective, optimising for NDCG@1) trained on user-query-suggestion interaction data. The model learns from what buyers actually click, not from what sellers claim. This means honest, buyer-aligned listings (accurate titles, real photos, fair prices) are rewarded by the algorithm's design. The system also uses personalisation — it re-ranks suggestions based on user features fetched in real time from Vinted's Feature Store.",
      },
      {
        q: "How important are photos for Vinted search ranking?",
        a: "Very important — but indirectly. The algorithm does not directly assess photo quality. It measures what happens after a user sees your main photo in search results: do they click, or do they scroll past? Main-photo click-through rate is a direct ranking signal, and Vinted's 2026 update increased its weight. A photo that generates clicks tells the algorithm the listing is relevant. A photo that gets ignored tells it the opposite. Over time, low-CTR listings get demoted regardless of how good the keywords are. Use natural light, clean background, multiple angles, and accurate colour.",
      },
      {
        q: "What is a Vinted seller score and how does it affect my listings?",
        a: "Vinted calculates an invisible seller score based on: average rating (must be 4.5+), number of completed sales, average response time to messages, rate of cancelled transactions (must be low), and account age. This score modulates listing rank — two identical listings from different sellers will rank differently based on account health. A seller with 200 positive reviews and a sub-two-hour response time is treated as a higher-trust source. Profile completeness (photo, bio, verified details) also contributes. The algorithm uses this to protect buyers, which means established sellers get a structural advantage.",
      },
      {
        q: "Can I get shadowbanned on Vinted?",
        a: "Vinted does not use the term 'shadowban', but the algorithm does apply 'visibility reduction' to accounts suspected of spam or fraudulent behaviour. The main triggers are: refresh spam (republishing the same item more than 2-3 times per week), tag spam (putting 'Zara Nike Adidas Gucci' in your description to appear in more searches), and repeated cancellations (3+ per month can reduce visibility by 30-50%). If your views drop by more than 80% in one week without a seasonal reason, pause activity for 48-72 hours, update your photos and descriptions, then resume slowly with 2-3 new high-quality listings.",
      },
      {
        q: "How do I write a Vinted title that ranks?",
        a: "Use the formula: [Brand] [Specific Model or Item Type] [Size/Key Spec] [Condition Signal]. Examples: 'Nike Air Max 97 Silver Bullet UK 8', 'Zara Floral Midi Dress Size 12 BNWT', 'Patagonia Nano Puff Hoody M Navy'. Lead with the brand — it is the first filter most buyers apply. Avoid vague terms like 'gorgeous', 'lovely', or 'great condition' — buyers do not search for these words. Use the full character budget for ranking keywords. Then add 3-5 relevant hashtags using buyer search language (BNWT, specific styles, occasions) — not model codes or generic tags like #fashion.",
      },
    ],
  },
]
