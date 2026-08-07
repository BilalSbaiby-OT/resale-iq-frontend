// Batch 3 of SEO/AEO articles. Same contract as blog-posts.ts.
// Honest claims only: "500,000+ listings across 5 EU markets", no earnings promises,
// no tax/legal advice presented as professional advice.

import type { BlogPost } from "./blog-posts"

const BRAND = "Resale IQ"

export const POSTS_3: BlogPost[] = [
  {
    slug: "vinted-bundles-and-offers-strategy",
    title: "Vinted Bundles and Offers: When to Say Yes",
    description:
      "How bundles and offers work on Vinted, when accepting a lower price is still profitable, and the floor you should never go below.",
    date: "2026-08-07",
    category: "Selling",
    readMins: 4,
    intro:
      "Buyers will almost always ask for less. Whether you should say yes has one honest answer: does the offer still clear your floor, and does it move stock you'd otherwise hold for months?",
    sections: [
      {
        h: "Know your floor before you negotiate",
        p: [
          "Your floor is your cost plus fees plus the minimum margin you'll accept. Work it out before you list, not while a buyer is waiting.",
          "Without a floor you negotiate emotionally — and you'll accept offers that quietly lose money once shipping and fees come out.",
        ],
      },
      {
        h: "Bundles are a volume tool",
        p: [
          "A bundle discount that clears three slow items at once is usually better than holding all three hoping for full price. Cash that recycles beats theoretical margin.",
          "Be stricter on fast-moving stock: if the item sells reliably at full price, there's no reason to discount it.",
        ],
      },
      {
        h: "Let sell-through decide",
        p: [
          "Items with strong sell-through: hold the price. Items sitting with low sell-through: take the reasonable offer and free the cash.",
          BRAND + " shows the sell-through for the specific model, so the decision stops being a guess.",
        ],
      },
    ],
    faq: [
      { q: "Should I accept low offers on Vinted?", a: "Accept if the offer still clears your floor (cost + fees + minimum margin) and the item is slow-moving. Hold firm on items with strong sell-through — those sell at full price anyway." },
      { q: "Are bundles worth it on Vinted?", a: "Yes for slow stock: clearing several items at a modest discount recycles your cash faster than holding out for full price on each. Be stricter with fast-selling items." },
    ],
  },
  {
    slug: "vinted-disputes-and-returns-sellers",
    title: "Vinted Disputes and Returns: A Seller's Guide",
    description:
      "How to prevent Vinted disputes, what to do when a buyer opens one, and the evidence that protects you as a seller.",
    date: "2026-08-07",
    category: "Selling",
    readMins: 5,
    intro:
      "Most disputes are preventable. The ones that aren't are usually decided by evidence — which means the work happens before you ship, not after the complaint.",
    sections: [
      {
        h: "Prevention beats resolution",
        p: [
          "Photograph every flaw and state measurements. The overwhelming majority of 'not as described' claims trace back to a detail the seller left out.",
          "Describe condition honestly and specifically. 'Good condition' means nothing; 'slight bobbling on the left cuff, no holes' means everything.",
        ],
      },
      {
        h: "Evidence that protects you",
        p: [
          "Keep your listing photos, take a quick photo of the item packed, and always use the platform's tracked label.",
          "Keep all communication inside Vinted's messaging. Off-platform conversations can't be used to support your case.",
        ],
      },
      {
        h: "If a dispute opens",
        p: [
          "Respond quickly, factually and politely. Reference your listing photos and description rather than arguing about intent.",
          "If you genuinely got it wrong, resolving fast costs less than a drawn-out dispute and a damaged rating.",
        ],
      },
    ],
    faq: [
      { q: "How do I avoid disputes on Vinted?", a: "Photograph every flaw, give measurements, and describe condition specifically rather than vaguely. Most 'not as described' claims come from an omitted detail, not a dishonest seller." },
      { q: "What evidence protects a Vinted seller in a dispute?", a: "Your original listing photos and description, a photo of the packed item, tracked shipping, and all communication kept inside Vinted's messaging system." },
    ],
  },
  {
    slug: "sneaker-reselling-guide-vinted",
    title: "Sneaker Reselling on Vinted: A Practical Guide",
    description:
      "How sneaker reselling works on Vinted — which models move, why sizes decide profit, condition grading, and how to avoid fakes.",
    date: "2026-08-07",
    category: "Sourcing",
    readMins: 6,
    intro:
      "Sneakers are the most liquid category on Vinted, which makes them the easiest place to start and the easiest place to overpay. Volume protects you from being stuck; it doesn't protect your margin.",
    sections: [
      {
        h: "Models beat brands",
        p: [
          "'Nike' isn't a strategy. Specific models carry the demand — the difference in sell-through between two models from the same brand is often enormous.",
          "Recognisable silhouettes with steady demand outperform hyped releases for consistent, repeatable profit.",
        ],
      },
      {
        h: "Size is where profit lives or dies",
        p: [
          "Mid sizes clear fastest because that's where most buyers are. Outlier sizes can sit for months at the same price.",
          "This is why per-size sell-through matters more in sneakers than almost any other category.",
        ],
      },
      {
        h: "Condition and authenticity",
        p: [
          "Grade honestly: sole wear, creasing, heel drag, yellowing, and whether you have the box. Each materially moves the price.",
          "Sneakers are the most counterfeited category. If the price is far below the model's normal range, treat it as a warning, not a bargain.",
        ],
      },
      {
        h: "Check before you buy",
        p: [
          BRAND + " returns a BUY / WATCH / SKIP for a specific model with its buy-below price and the sizes that actually move — the two numbers that decide a sneaker flip.",
        ],
      },
    ],
    faq: [
      { q: "Are sneakers good to resell on Vinted?", a: "Sneakers are the most liquid category on Vinted, but profit depends on the specific model, the size, and condition — not the brand alone. Mid sizes sell fastest; outlier sizes can sit for months." },
      { q: "How do I know if sneakers are fake?", a: "A price far below the model's normal range is the biggest warning sign. Compare stitching, tongue tags, sole patterns and box labels against verified references, and walk away if you can't confirm." },
    ],
  },
  {
    slug: "vintage-clothing-reselling-guide",
    title: "Vintage Clothing Reselling: How to Spot Value",
    description:
      "How to identify and price genuinely valuable vintage clothing — tags, construction, era markers, and why condition rules everything.",
    date: "2026-08-07",
    category: "Sourcing",
    readMins: 6,
    intro:
      "Vintage is where the biggest margins hide, because value depends on knowledge rather than brand recognition. Two identical-looking jackets can differ tenfold in price based on details most people never check.",
    sections: [
      {
        h: "Read the tag first",
        p: [
          "Tags date a garment. Logo styles, country of manufacture, union labels, care-symbol formats and fabric-content wording all shifted over the decades.",
          "Learning a handful of era markers for the brands you handle is the single highest-return skill in vintage.",
        ],
      },
      {
        h: "Construction tells the truth",
        p: [
          "Single-stitch hems, chain-stitched seams, metal zips with maker marks and heavier fabrics generally indicate older production.",
          "Modern reproductions copy graphics, not construction — which is why the inside of a garment matters more than the front.",
        ],
      },
      {
        h: "Condition rules everything",
        p: [
          "In vintage, condition swings value more than in any other category. Holes, stains, fading and repairs can erase a rare piece's premium.",
          "Photograph flaws precisely — vintage buyers are knowledgeable and unforgiving of surprises.",
        ],
      },
      {
        h: "Pricing without comparables",
        p: [
          "True one-offs have thin comparable data, so anchor on the closest sold examples and be patient. For everything more common, the same rule applies as anywhere: don't pay above your buy-below price.",
        ],
      },
    ],
    faq: [
      { q: "How do I know if vintage clothing is valuable?", a: "Check the tag for era markers (logo style, country of manufacture, care-label format), then the construction — single stitching, chain-stitched seams and metal zips suggest older production. Condition then swings the value more than anything else." },
      { q: "How do I price vintage clothing to sell?", a: "Anchor on the closest recently-sold comparable items rather than asking prices, and adjust hard for condition. For rare one-offs expect a longer sale window and price for patience." },
    ],
  },
  {
    slug: "buying-wholesale-pallets-reselling",
    title: "Buying Wholesale and Pallets for Reselling: Worth It?",
    description:
      "How wholesale lots and clothing pallets work, the real risks, and how to judge whether a lot is worth buying.",
    date: "2026-08-07",
    category: "Sourcing",
    readMins: 5,
    intro:
      "Pallets and wholesale lots promise volume at low per-item cost. They also transfer all the sorting, grading and dead-stock risk to you. Whether they're worth it comes down to arithmetic, not optimism.",
    sections: [
      {
        h: "The arithmetic that matters",
        p: [
          "Divide the total cost by the number of items you realistically expect to SELL — not the number of items in the lot. Assume a meaningful share is unsellable.",
          "If your effective cost per sellable item isn't comfortably below your buy-below price for that category, the lot is not a deal.",
        ],
      },
      {
        h: "Hidden costs",
        p: [
          "Shipping, storage, your sorting time, cleaning, and disposal of unsellable items are all real costs that rarely appear in the seller's pitch.",
          "Time is the one people forget: sorting a pallet can take a full weekend before you list anything.",
        ],
      },
      {
        h: "How to reduce risk",
        p: [
          "Start with a small lot from a supplier before committing to volume. Ask for grading definitions in writing and photos of an actual lot.",
          "Prefer categorised lots (e.g. branded outerwear) over unsorted mixed clothing — unsorted is where dead stock hides.",
        ],
      },
    ],
    faq: [
      { q: "Are clothing pallets worth buying for reselling?", a: "Only if your cost divided by the items you'll realistically SELL — not the total item count — lands comfortably below your buy-below price. Factor in shipping, storage, sorting time and disposal of unsellable stock." },
      { q: "What are the risks of buying wholesale clothing lots?", a: "A large share may be unsellable, grading standards vary between suppliers, and sorting takes significant time. Start with a small test lot and prefer categorised lots over unsorted mixed clothing." },
    ],
  },
  {
    slug: "how-to-grow-a-vinted-closet",
    title: "How to Grow a Vinted Closet That Sells Itself",
    description:
      "Why closet size, consistency and coherence drive sales on Vinted, and how to build one that compounds.",
    date: "2026-08-07",
    category: "Selling",
    readMins: 5,
    intro:
      "Two sellers with identical stock can get completely different results. The difference is usually the closet: how many live listings there are, how consistent they look, and whether a buyer landing on one item finds five more they want.",
    sections: [
      {
        h: "Volume creates discovery",
        p: [
          "Every live listing is another entry point into your closet. Sellers with 50+ listings get found far more often than sellers with five — the same item gets more exposure simply because the closet is bigger.",
        ],
      },
      {
        h: "Coherence increases basket size",
        p: [
          "A closet with a clear focus (streetwear, workwear, vintage denim) converts better than a random mix, because one interested buyer often buys several items.",
          "Focus also compounds your knowledge — you get better at sourcing the things you already understand.",
        ],
      },
      {
        h: "Consistency keeps you visible",
        p: [
          "Secondhand marketplace feeds generally favour recent activity, so steady listing should keep your closet surfacing more often than a burst of 40 followed by silence. Nobody outside Vinted can verify how its ranking works, so treat this as a working assumption — but it is cheap to test by splitting a batch across a week.",
        ],
      },
      {
        h: "Quality of stock still decides",
        p: [
          "A big closet full of items nobody wants is just a big problem. Volume amplifies your sourcing quality in both directions — which is why the buy decision comes first.",
        ],
      },
    ],
    faq: [
      { q: "How many listings should I have on Vinted?", a: "More listings means more entry points into your closet — sellers with 50+ live listings get discovered far more than sellers with a handful. But volume only helps if the stock has real demand." },
      { q: "Should my Vinted closet have a theme?", a: "Yes. A focused closet (streetwear, workwear, vintage denim) converts better because interested buyers often purchase several items, and focus makes you better at sourcing that niche." },
    ],
  },
  {
    slug: "common-vinted-scams-sellers",
    title: "Common Vinted Scams and How Sellers Avoid Them",
    description:
      "The scams that target Vinted sellers — off-platform payment, fake screenshots, item swaps — and the simple rules that prevent them.",
    date: "2026-08-07",
    category: "Selling",
    readMins: 4,
    intro:
      "Most scams targeting sellers rely on one thing: moving you off the platform, where you have no protection. The rules to avoid them are short and worth following without exception.",
    sections: [
      {
        h: "Never go off-platform",
        p: [
          "Any request to pay or communicate outside Vinted — bank transfer, PayPal friends-and-family, WhatsApp — removes every protection you have. There is no legitimate reason for it.",
          "Fake 'payment sent' screenshots are trivial to produce. Only money actually showing in your Vinted balance is real.",
        ],
      },
      {
        h: "Ship only through the platform",
        p: [
          "Use the provided tracked label. Untracked or off-platform shipping means you can't prove delivery, which is exactly what an item-not-received claim exploits.",
        ],
      },
      {
        h: "Protect against item swaps",
        p: [
          "Photograph the item and the packed parcel before sending, including any serial or style codes. It's a few seconds that resolves a returned-different-item claim.",
        ],
      },
      {
        h: "Trust the pattern, not the story",
        p: [
          "Urgency, an emotional story and pressure to hurry are the common thread in nearly every scam. Slow down and keep everything on-platform.",
        ],
      },
    ],
    faq: [
      { q: "What are common Vinted scams against sellers?", a: "Requests to pay or talk off-platform, fake payment screenshots, off-platform shipping, and item-swap returns. Nearly all of them require getting you off the platform first." },
      { q: "How do I protect myself as a Vinted seller?", a: "Keep payment, messaging and shipping entirely inside Vinted, use the tracked label provided, and photograph the item and packed parcel before sending." },
    ],
  },
  {
    slug: "reseller-record-keeping-basics",
    title: "Record Keeping for Resellers: What to Track",
    description:
      "The minimum records a reseller should keep — costs, sale prices, fees and dates — and why tracking them changes your decisions.",
    date: "2026-08-07",
    category: "Business",
    readMins: 5,
    intro:
      "Most resellers can tell you their revenue and almost none can tell you their profit. Tracking a handful of numbers per item turns reselling from a feeling into a business. (General information — for your tax obligations, speak to a qualified accountant in your country.)",
    sections: [
      {
        h: "The minimum per item",
        p: [
          "Purchase price, purchase date, sale price, sale date, fees and shipping. Six fields. That's enough to compute everything that matters.",
          "A simple spreadsheet is fine. The discipline matters far more than the tool.",
        ],
      },
      {
        h: "The numbers it unlocks",
        p: [
          "Real profit per item after fees, average days to sell, and the share of purchases that never sold — the metric almost nobody tracks and everybody needs.",
          "You'll quickly see which categories genuinely earn and which just feel productive.",
        ],
      },
      {
        h: "Why it changes behaviour",
        p: [
          "Once you can see that a category averages 90 days to sell, you stop buying it. Records don't just report the past — they correct your sourcing.",
          BRAND + "'s portfolio tracking does this alongside the market data, so your own results sit next to the market's.",
        ],
      },
      {
        h: "Tax",
        p: [
          "Rules differ by country and by whether reselling counts as regular activity for you. Keep records from day one so you're never reconstructing history, and get advice from a qualified professional before it matters.",
        ],
      },
    ],
    faq: [
      { q: "What records should a reseller keep?", a: "Per item: purchase price, purchase date, sale price, sale date, fees and shipping. Those six fields let you compute real profit, average days to sell, and the share of stock that never sold." },
      { q: "Do I need to declare reselling income?", a: "It depends on your country and whether your activity counts as regular trading. Keep complete records from the start and consult a qualified accountant in your jurisdiction — this article is general information, not tax advice." },
    ],
  },
  {
    slug: "how-to-start-reselling-with-little-money",
    title: "How to Start Reselling With Very Little Money",
    description:
      "A realistic path to starting a reselling side hustle on a small budget — where to source, what to avoid, and how to compound early.",
    date: "2026-08-07",
    category: "Business",
    readMins: 5,
    intro:
      "You don't need capital to start reselling; you need discipline about what you buy. With a small budget, every wrong purchase costs you a large share of your working capital — so the buy decision matters more, not less. (No income is guaranteed.)",
    sections: [
      {
        h: "Start with what you already have",
        p: [
          "Selling your own unworn clothes costs nothing, teaches you the platform, listing, shipping and buyer communication, and produces your first working capital.",
        ],
      },
      {
        h: "Then source cheap and local",
        p: [
          "Charity shops, car boots and local marketplace listings keep per-item cost low, so a mistake costs a few euros instead of a few hundred.",
          "Stay close to the current season at first — you can't afford to have cash frozen for months.",
        ],
      },
      {
        h: "Compound instead of withdrawing",
        p: [
          "Reinvest early profits rather than taking them out. Small capital grows through turnover, which is why fast-selling items matter far more than high-margin slow ones when you're starting.",
        ],
      },
      {
        h: "Protect the downside",
        p: [
          "With a small budget, avoiding dead stock is more valuable than finding a home run. Checking demand before you buy is the cheapest insurance available — that's the whole point of " + BRAND + ".",
        ],
      },
    ],
    faq: [
      { q: "How much money do I need to start reselling?", a: "You can start with nothing by selling clothes you already own, then reinvest that into low-cost local sourcing. With a small budget, avoiding items that don't sell matters more than chasing big margins." },
      { q: "What should a beginner reseller buy first?", a: "Low-cost, in-season items from recognisable brands with proven demand and common sizes. Stay near the current season so your limited cash isn't frozen waiting months for a sale." },
    ],
  },
  {
    slug: "days-to-sell-vs-profit-margin",
    title: "Days to Sell vs Profit Margin: Which Should You Optimise?",
    description:
      "Why fast-selling stock usually beats high-margin stock for resellers, with the simple maths of capital turnover.",
    date: "2026-08-07",
    category: "Metrics",
    readMins: 4,
    intro:
      "Given a choice between a 50% margin that sells in 90 days and a 25% margin that sells in 15, most beginners take the 50%. The maths says otherwise, and it's not close.",
    sections: [
      {
        h: "The turnover maths",
        p: [
          "€100 at 25% margin selling every 15 days recycles roughly 24 times a year. €100 at 50% margin selling every 90 days recycles about 4 times.",
          "The lower margin generates far more annual profit from the same capital, because the money keeps working.",
        ],
      },
      {
        h: "Speed also reduces risk",
        p: [
          "Fast stock is exposed to less: fewer trend shifts, less seasonal risk, less chance of a price collapse while you hold.",
          "Slow stock quietly ties up the capital you need for the next opportunity.",
        ],
      },
      {
        h: "When margin wins",
        p: [
          "High-margin slow items make sense when you have spare capital that isn't needed elsewhere, or the item is genuinely scarce. They shouldn't be the core of a small operation.",
        ],
      },
      {
        h: "Track both",
        p: [
          "Judge every purchase on margin AND expected days to sell. " + BRAND + " surfaces sell-through alongside the buy-below price for exactly this reason.",
        ],
      },
    ],
    faq: [
      { q: "Is profit margin or sell-through more important in reselling?", a: "Usually sell-through. €100 at 25% margin turning over every 15 days produces far more annual profit than €100 at 50% margin turning over every 90 days, because the capital keeps working." },
      { q: "What is capital turnover in reselling?", a: "How many times per year you can reinvest the same money. Faster-selling stock means more turns, which compounds profit and reduces exposure to trend and seasonal risk." },
    ],
  },
]
