// Batch 23 of SEO/AEO articles. Same contract as blog-posts.ts.
// Honest claims only: no earnings guarantees. Tactic descriptions are general guidance.
// All departure data from /api/public/market-snapshot (2026-09-15 build).

import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

export const POSTS_23: BlogPost[] = [
  {
    slug: "how-to-find-underpriced-items-on-vinted",
    title: "How to Find Underpriced Items on Vinted (Search Tactics That Actually Work)",
    seoTitle: "How to Find Underpriced Items on Vinted — Resale IQ",
    description:
      "Wrong categories, misspelled listings, bad photos, stale listings — the algorithmic gaps that let underpriced items slip through on Vinted. How to find cheap branded items before other resellers do.",
    date: "2026-09-15",
    category: "Strategy",
    readMins: 10,
    intro:
      "Vinted's search algorithm punishes listings that break its conventions. Misspelled brands, wrong categories, three blurry photos, and vague descriptions all suppress visibility — which means the items sell slower and sometimes sit at whatever the seller originally listed. This creates a systematic sourcing opportunity: find listings the algorithm is hiding, buy below departure average, relist correctly. This guide maps the specific search tactics that surface underpriced items on Vinted before other resellers get there.",
    definedTerm: {
      name: "Watched departure",
      description:
        "A watched departure is a sale of an item from a brand in Resale IQ's tracked universe — confirmed by the listing leaving Vinted's active inventory. Departure averages are calculated from real completed sales, not asking prices. Resale IQ tracks EU Vinted departures across 28 brands, updated continuously.",
    },
    sections: [
      {
        h: "Why underpriced listings exist on Vinted",
        p: [
          "Vinted's search ranking is driven by relevance signals: correct category, matching brand, title keyword density, photo count and quality, listing age, and seller rating. When any of these signals are weak, the algorithm suppresses the listing — it doesn't appear at the top of searches, so fewer buyers see it, and the item sits longer than it should.",
          "Sellers who list casually — clearing a wardrobe, not running a business — routinely miss these signals. They use their phone brand autocorrect, pick 'Tops' when the correct category is 'Polo Shirts', take one photo in poor light, and write 'nice shirt good condition'. The item is real, the brand is correct, the condition is accurate — but visibility is near zero.",
          "The result: you can search Vinted for underpriced items using the exact failure modes of casual sellers. The tactics below each exploit a specific algorithmic gap.",
        ],
      },
      {
        h: "Tactic 1: misspelled brand searches",
        p: [
          "Vinted has autocomplete for major brands, but sellers type titles manually. Autocorrect and phonetic misspellings create a category of listings that never appear in the standard brand search.",
          "Tested misspellings with consistent results on EU Vinted (September 2026):",
          "**Stone Island** → search 'Stone Ilsand', 'Stone Islend', 'Stoneisland', 'Stone Isand'. These return real Stone Island items listed by sellers who typed the name rather than selecting from autocomplete. Departure average €70 (hoodies €55, jackets €140) — a misspelled listing sitting at €15 is not a fake, it's a find.",
          "**Balenciaga** → 'Balenciga', 'Balencigia', 'Balencaga', 'Balenciagga'. Highest-value misspellings on Vinted. Departure average €147. One real piece listed by a seller who typed the brand wrong and priced it at €30 is a meaningful arbitrage.",
          "**Patagonia** → 'Patagonya', 'Patagona', 'Patagònia'. Less common but present, particularly from non-English-speaking sellers listing outdoor gear.",
          "**Fred Perry** → 'Fred Perrry', 'Fred Pery', 'Fredperry'. High volume brand; even a 1% misspelling rate at 199 departures in the last 30 days means multiple underpriced items available weekly.",
          "**Supreme** → 'Suprem', 'Surpreme', 'Supremme'. Box logo pieces appear here — verify authenticity (stitching, font spacing) before buying.",
          "Run these searches in the Vinted app's search bar, not through brand filters. Brand filters only catch items correctly categorised under that brand; a free-text search catches any listing where the word appears in the title regardless of how it's categorised.",
          "For complete departure averages to know what each misspelled find is worth, use the [flip calculator](\" + ilinkHref(\"flip\") + \").",
        ],
        cta: pricingMidCta("ctr_underpriced_20260915"),
      },
      {
        h: "Tactic 2: wrong-category browsing",
        p: [
          "Vinted's category tree is deep. A polo shirt can be listed under: Polo shirts → correct. Shirts → almost correct but misses polo-shirt buyers. Tops → broad, suppressed in polo searches. Jackets → wrong entirely. Each level of miscategorisation reduces visibility.",
          "Browse one category above the correct one for high-value brands. Examples:",
          "**Stone Island jackets listed under 'Coats':** Search Stone Island in the Men's Coats category, then manually browse listings — anything labelled 'jacket' in the title but in the wrong parent category. Jacket departure average €140; 'coats' category suppresses jacket queries.",
          "**Patagonia fleeces listed under 'Knitwear':** Fleece and knitwear overlap for casual sellers. Patagonia fleeces listed under 'Knitwear' miss searchers looking under 'Fleeces & Vests'. Departure average for Patagonia fleeces: €28–45.",
          "**Designer bags listed under 'Accessories' not 'Bags':** Balenciaga cross-body bags listed under generic 'Accessories' miss the Bags category filterers. The departure average for Balenciaga bags on Vinted is higher than clothing — €180+ for authenticated pieces.",
          "The tactic: for any brand you're sourcing, manually browse all adjacent and parent categories, not just the canonical one. Sort by 'Newest first' to catch recent mislisted items before they're corrected.",
        ],
      },
      {
        h: "Tactic 3: poor-photo listings",
        p: [
          "Vinted's algorithm rewards listings with more photos and penalises single-photo listings. A one-photo listing with bad lighting has a fraction of the visibility of an 8-photo listing. More importantly: buyers skip single-photo listings and move on — so the item sits.",
          "Filter for underperforming listings: search your target brand, sort by 'Newest first', and manually scroll past the well-photographed items (they'll have thumbnails showing multiple angles). Single-photo listings with a flat, dark, or background-cluttered thumbnail are the ones to open.",
          "What to look for inside the listing: Is the item real? Can you see enough to authenticate (label, badge, stitching)? Is the stated condition accurate? If yes on all three, check the price against the departure average. A Stone Island hoodie listed at €20 with one blurry photo taken in a dark room is the same item as the one listed at €60 with 8 photos and a white background.",
          "Your relist strategy: 8 photos, white or neutral background, close-up of badge/label/hardware, one flat-lay, one worn shot. The algorithm rewards all of these and you capture the departure average instead of the blurry-photo discount.",
        ],
      },
      {
        h: "Tactic 4: stale listings with recent price drops",
        p: [
          "Listings that have been on Vinted more than 30 days and received a price drop are algorithmically boosted in Vinted's 'Relevance' sort — the system tries to clear aged inventory. But the boost is brief and the listing returns to obscurity quickly.",
          "Search by brand, sort by 'Newest first', and look for items listed 30–60 days ago (Vinted shows 'X weeks ago' on listings). These are items that didn't sell at their original price, have often been reduced once, and the seller may be motivated to negotiate further.",
          "Message the seller: 'Is the price negotiable? I can complete the purchase today.' Vinted's offer function lets you propose a lower price. Sellers who have held an item for 6+ weeks and received no offers often accept 20–30% below the listed price.",
          "Stack this with misspelling and category filters: a 6-week-old mislisted Stone Island hoodie with a price drop is three failure modes stacked — maximum underpricing.",
        ],
      },
      {
        h: "Tactic 5: searching by garment feature, not brand name",
        p: [
          "Casual sellers sometimes don't know the brand they're selling, or deliberately describe by feature to reach broader searches. 'Red embroidered polo', 'navy badge hoodie', 'compass badge jacket' — these are Stone Island items listed without the brand name.",
          "Searches to run:",
          "'Compass badge' — Stone Island's compass badge is distinctive. Items described this way rather than by brand name have no brand-filtered competition. Buyers searching 'Stone Island' won't find them. The item is real; the listing is invisible.",
          "'Laurel wreath logo shirt' — common description for Fred Perry items by sellers who describe the badge rather than name the brand.",
          "'Goose down jacket label' — Patagonia, Arc'teryx, and other outdoor brands are sometimes described by physical feature rather than brand name, particularly by older sellers or non-English-speaking sellers listing in translation.",
          "'Box logo hoodie' — Supreme. High risk of fakes at this search term, but real pieces appear. Never buy at above €30 without authentication confidence.",
          "This tactic surfaces items that other resellers miss entirely because their saved searches are brand-name-based. The items exist, they just don't use the canonical search term.",
        ],
        cta: pricingBodyCta("body_underpriced_20260915"),
      },
      {
        h: "Using departure data to validate a find before buying",
        p: [
          "Every underpriced item is only worth buying if the departure average supports the margin. Before sending any offer or completing a purchase, check the departure average for the specific item type:",
          "**Item: Stone Island hoodie, listed at €20.** Resale IQ departure data: 401 watched departures in 7 days, average €55. Buy-below at 100% margin: €27.50. At €20, this is above the 100% margin threshold but still a 175% gross ROI (sell at €55, bought at €20). Proceed if the item authenticates and conditions match.",
          "**Item: Fred Perry shirt, listed at €6.** Departure data: 416 shirts/7d, avg €14. Buy-below at 100% margin: €7. At €6 you're inside the buy-below — proceed.",
          "**Item: Patagonia jacket, listed at €25.** Departure data: 311 jackets/7d, avg €51. Buy-below at 100% margin: €25.50. At €25 you're 50 cents below the threshold — proceed, but the margin is thin. Any condition issue reduces the departure price and kills the margin.",
          "The [Resale IQ flip calculator](\" + ilinkHref(\"flip\") + \") calculates buy-below price and expected ROI for each brand and item type from live departure data — run the check before every purchase to avoid buying on gut instinct.",
        ],
      },
    ],
    faq: [
      {
        q: "How do you find underpriced items on Vinted?",
        a: "Search for common misspellings of brand names (Stone Ilsand, Balenciga, Fred Pery), browse parent/adjacent categories rather than only the correct one, filter for single-photo listings that the algorithm suppresses, look for stale listings with price drops, and search by garment feature rather than brand name. These tactics surface items that casual sellers have listed incorrectly, reducing their visibility and often leaving them underpriced against the departure average.",
      },
      {
        q: "What is the most common way Vinted items are underpriced?",
        a: "Mislisted category is the most common cause — a Stone Island jacket listed under 'Coats' instead of 'Jackets' misses all jacket-specific searches and sits longer than it should. Combined with a single blurry photo, these items can sit for weeks at prices well below the Vinted departure average for correctly-listed equivalents.",
      },
      {
        q: "Can you search Vinted for misspelled brands?",
        a: "Yes. Use the Vinted app's free-text search (not brand filters) and type the misspelling directly. 'Stone Ilsand', 'Balenciga', 'Patagona', 'Fred Pery' all return real listings by sellers who typed the brand name manually rather than selecting from autocomplete. These listings don't appear in standard brand-filtered searches.",
      },
      {
        q: "Does Vinted's algorithm affect which items sell first?",
        a: "Yes. Vinted ranks listings by relevance signals: correct category, title keywords, photo count and quality, listing age, and seller ratings. Listings that score poorly on these signals appear lower in search results, receive fewer views, and therefore take longer to sell — even if the price is competitive. This is the gap that misspelling and category tactics exploit.",
      },
      {
        q: "How do I know if an underpriced Vinted item is actually a good buy?",
        a: "Check the departure average for that brand and item type before buying. If the listed price is below your buy-below threshold (departure average × (1 − target margin)), and the condition matches the listing, it's a rational buy. Resale IQ calculates buy-below prices from live EU Vinted departure data so you can validate in seconds.",
      },
      {
        q: "How competitive is it to find underpriced items on Vinted?",
        a: "More competitive than two years ago but still viable. The misspelling and wrong-category gaps exist because casual sellers make systematic errors, not because the platform is inefficient — the errors are human, not algorithmic. Automation (saved searches, instant notifications) increases your speed advantage. The resellers consistently winning are those with departure data to validate finds instantly rather than searching on intuition.",
      },
    ],
  },
]
