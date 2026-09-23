// Batch 3 of SEO/AEO articles. Same contract as blog-posts.ts.
// Honest claims only: listings-tracked via TRACKED + fillTracked, no earnings promises,
// no tax/legal advice presented as professional advice.

import { TRACKED } from "@/lib/stats"
import type { BlogPost } from "./blog-posts"
import { dataCiteHref, dataCiteHrefEs, pricingBodyCta, pricingBodyCtaEs, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

const BRAND = "Resale IQ"

export const POSTS_3: BlogPost[] = [
  {
    slug: "vinted-bundles-and-offers-strategy",
    title: "Vinted Bundles and Offers in 2026 — When a Lower Price Still Wins",
    seoTitle: "Vinted Bundles and Offers: What Actually Works",
    description: "When bundling raises your take and when it just discounts you. Built on 13.4M tracked EU Vinted listings.",
    date: "2026-08-07",
    updated: "2026-09-20",
    category: "Selling",
    readMins: 4,
    preflightQuery: "Nike Air Force 1",
    intro:
      "Buyers will almost always ask for less. Whether you should say yes has one honest answer: does the offer still clear your floor, and does it move stock you'd otherwise hold for months? As of 20 September 2026, the fast categories where a bundle rarely makes sense are Hoodies (780 departures in the last 30 days) and Shirts (74 departures in the last 30 days) — they are already leaving the shelf — while Bags (29 departures in the last 30 days) are the slower, higher-ticket stock a bundle discount should free up. Speed, not sentiment, decides. We watched 566 departures this week across 20 published brands, from 5,341,780 tracked listings in Spain, France, Germany, Italy and Portugal. Fred Perry averaged €16. Gucci averaged €303. Do not cut a mover to win a conversation. Work the floor before you reply. Check the item on resaleiq.dev (BUY/WATCH/SKIP, Starter €19/mo). Weekly volumes stay free on /data.",
    sections: [
      {
        h: "Know your floor before you negotiate",
        p: [
          "Your floor is your cost plus fees plus the minimum margin you'll accept. Work it out before you list, not while a buyer is waiting — the [Vinted profit calculator](/tools/vinted-profit-calculator) gives you the after-fees number in one step, and [what actually left the shelf this week](" +
            ilinkHref("data") +
            ") is the public average.",
          "Without a floor you negotiate emotionally — and you'll accept offers that quietly lose money once shipping and fees come out.",
        ],
        cta: pricingMidCta("ctr_bundles_20260913"),
      },
      {
        h: "Bundles are a volume tool",
        p: [
          "A bundle discount that clears three slow items at once is usually better than holding all three hoping for full price. Cash that recycles beats theoretical margin — and [which categories recycle fastest](/category) is measurable, not a matter of opinion.",
          "Be stricter on fast-moving stock: if the item sells reliably at full price, there's no reason to discount it.",
        ],
      },
      {
        h: "Let sell-through decide",
        p: [
          "Items with strong sell-through: hold the price. Items sitting with low sell-through: take the reasonable offer and free the cash. Sell-through differs sharply by brand — [see which brands move](" +
            ilinkHref("flip") +
            ") before you decide which of yours is genuinely slow.",
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
    seoTitle: "How to Avoid Vinted Disputes? Photos First — Resale IQ",
    description:
      "Photograph every flaw, state measurements, keep chats on Vinted, use the tracked label. Most disputes are preventable; evidence decides the rest.",
    date: "2026-08-07",
    category: "Selling",
    readMins: 5,
    preflightQuery: "Nike Air Force 1",
    intro:
      "Most disputes are preventable. The ones that aren't are usually decided by evidence — which means the work happens before you ship, not after the complaint.",
    sections: [
      {
        h: "Prevention beats resolution",
        p: [
          "Photograph every flaw and state measurements. The overwhelming majority of 'not as described' claims trace back to a detail the seller left out.",
          "Describe condition honestly and specifically. 'Good condition' means nothing; 'slight bobbling on the left cuff, no holes' means everything. Price against [what actually left the shelf this week](" +
            ilinkHref("data") +
            ") rather than the retail tag — a buyer who feels overcharged is the one who looks for a way out.",
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
          "If you genuinely got it wrong, resolving fast costs less than a drawn-out dispute and a damaged rating. Then check [brands clearing fastest right now](" +
            ilinkHref("flip") +
            ") before you replace the stock — don't buy the same slow model twice.",
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
    title: "Sneaker Reselling on Vinted: Demand, Size, Buy-Below",
    seoTitle: "Sneaker Reselling: Demand, Size, Buy-Below — Resale IQ",
    description:
      "Sneaker profit on Vinted is model demand, mid-size sell-through and buy-below — not the brand name. Which silhouettes move and which sizes sit.",
    date: "2026-08-07",
    updated: "2026-09-13",
    category: "Sourcing",
    readMins: 6,
    preflightQuery: "Nike Air Force 1",
    intro:
      "Sneakers are the most liquid category on Vinted, which makes them the easiest place to start and the easiest place to overpay. Volume protects you from being stuck; it doesn't protect your margin.",
    sections: [
      {
        h: "Models beat brands",
        p: [
          "'Nike' isn't a strategy. Specific models carry the demand — the difference in sell-through between two models from the same brand is often enormous. Check [brands clearing fastest right now](" +
            ilinkHref("flip") +
            ") for the names that actually leave the shelf.",
          "Recognisable silhouettes with steady demand outperform hyped releases for consistent, repeatable profit. [What actually left the shelf this week](" +
            ilinkHref("data") +
            ") is the volume side of that.",
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
        h: "Check before you buy",
        p: [
          BRAND + " returns a BUY / WATCH / SKIP for a specific model with its buy-below price and the sizes that actually move — the two numbers that decide a sneaker flip.",
        ],
      },
    ],
    faq: [
      { q: "Are sneakers good to resell on Vinted?", a: "Sneakers are the most liquid category on Vinted, but profit depends on the specific model, the size, and condition — not the brand alone. Mid sizes sell fastest; outlier sizes can sit for months." },
    ],
  },
  {
    slug: "vintage-clothing-reselling-guide",
    title: "Vintage Clothing Reselling: How to Spot Value",
    seoTitle: "How to Spot Valuable Vintage? Tag First — Resale IQ",
    description:
      "Read the tag and construction first. Era markers date the piece; condition then swings value more than anything else. Price from departed comps.",
    date: "2026-08-07",
    updated: "2026-09-14",
    category: "Sourcing",
    readMins: 6,
    preflightQuery: "Nike Air Force 1",
    intro:
      "Vintage is where the biggest margins hide, because value depends on knowledge rather than brand recognition. Two identical-looking jackets can differ tenfold in price based on details most people never check. As of 14 September 2026, the vintage-adjacent categories we watch carry exactly that spread on Vinted: a Stone Island Jacket left the shelf at an average €142 (179 watched departures in 7 days) while a Fred Perry Shirt averaged €14 (460) — same 'sell a garment' motion, roughly ten times the price, decided entirely by what the piece is rather than how new it looks.",
    sections: [
      {
        h: "Read the tag first",
        p: [
          "Tags date a garment. Logo styles, country of manufacture, union labels, care-symbol formats and fabric-content wording all shifted over the decades.",
          "Learning a handful of era markers for the brands you handle is the single highest-return skill in vintage. [Brands clearing fastest right now](" +
            ilinkHref("flip") +
            ") tells you which of those brands are worth the homework.",
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
          "True one-offs have thin comparable data, so anchor on the closest departed examples and be patient. For everything more common, the same rule applies as anywhere: don't pay above your buy-below price. [What actually left the shelf this week](" +
            ilinkHref("data") +
            ") is still the starting point.",
        ],
      },
    ],
    faq: [
      { q: "How do I know if vintage clothing is valuable?", a: "Check the tag for era markers (logo style, country of manufacture, care-label format), then the construction — single stitching, chain-stitched seams and metal zips suggest older production. Condition then swings the value more than anything else." },
      { q: "How do I price vintage clothing to sell?", a: "Anchor on the closest recently-departed comparable items rather than active asking prices, and adjust hard for condition. For rare one-offs expect a longer sale window and price for patience." },
    ],
  },
  {
    slug: "buying-wholesale-pallets-reselling",
    title: "Buying Wholesale and Pallets for Reselling: Worth It?",
    seoTitle: "Are Clothing Pallets Worth Buying? Do the Math — Resale IQ",
    description:
      "A pallet pays only if cost divided by items you will actually sell sits under buy-below. Add shipping, storage, sorting time and unsellable stock.",
    date: "2026-08-07",
    category: "Sourcing",
    readMins: 5,
    preflightQuery: "Nike Air Force 1",
    intro:
      "Pallets and wholesale lots promise volume at low per-item cost. They also transfer all the sorting, grading and dead-stock risk to you. Whether they're worth it comes down to arithmetic, not optimism.",
    sections: [
      {
        h: "The arithmetic that matters",
        p: [
          "Divide the total cost by the number of items you realistically expect to SELL — not the number of items in the lot. Assume a meaningful share is unsellable.",
          "If your effective cost per sellable item isn't comfortably below your buy-below price for that category, the lot is not a deal. [What actually left the shelf this week](" +
            ilinkHref("data") +
            ") is that buy-below input.",
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
          "Prefer categorised lots (e.g. branded outerwear) over unsorted mixed clothing — unsorted is where dead stock hides. [Brands clearing fastest right now](" +
            ilinkHref("flip") +
            ") tells you which categories are even worth a lot.",
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
    title: "How to Grow a Vinted Closet — Volume, Focus, Consistency",
    seoTitle: "How to Grow a Vinted Closet? Demand First — Resale IQ",
    description:
      "More listings help only if the stock has demand. Focus the closet, list consistently, and grow volume around items that already clear.",
    date: "2026-08-07",
    updated: "2026-09-13",
    category: "Selling",
    readMins: 5,
    preflightQuery: "Nike Air Force 1",
    intro:
      "Two sellers with identical stock can get completely different results. The difference is usually the closet: how many live listings there are, how consistent they look, and whether a buyer landing on one item finds five more they want.",
    sections: [
      {
        h: "Volume creates discovery",
        p: [
          "Every live listing is another entry point into your closet. Sellers with 50+ listings get found far more often than sellers with five — the same item gets more exposure simply because the closet is bigger.",
        ],
        cta: pricingMidCta("ctr_closet_20260913"),
      },
      {
        h: "Coherence increases basket size",
        p: [
          "A closet with a clear focus (streetwear, workwear, vintage denim) converts better than a random mix, because one interested buyer often buys several items. [Brands clearing fastest right now](" +
            ilinkHref("flip") +
            ") is a useful focus list.",
          "Focus also compounds your knowledge — you get better at sourcing the things you already understand. That is the same move as [narrowing the brand range before you scale](/manual/scaling-past-the-hobby): depth is what keeps pricing accurate once volume goes up.",
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
          "A big closet full of items nobody wants is just a big problem. Volume amplifies your sourcing quality in both directions — which is why the buy decision comes first. [What actually left the shelf this week](" +
            ilinkHref("data") +
            ") is the filter.",
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
    seoTitle: "Vinted Seller Scams: Stay On-Platform — Resale IQ",
    description:
      "Off-platform pay, fake screenshots and item swaps hit Vinted sellers. Stay on-platform, use the tracked label, photograph the parcel.",
    date: "2026-08-07",
    updated: "2026-09-13",
    category: "Selling",
    readMins: 4,
    preflightQuery: "Nike Air Force 1",
    intro:
      "Most scams targeting sellers rely on one thing: moving you off the platform, where you have no protection. The rules to avoid them are short and worth following without exception.",
    sections: [
      {
        h: "Never go off-platform",
        p: [
          "Any request to pay or communicate outside Vinted — bank transfer, PayPal friends-and-family, WhatsApp — removes every protection you have. There is no legitimate reason for it.",
          "Fake 'payment sent' screenshots are trivial to produce. Only money actually showing in your Vinted balance is real. A buyer offering 'more' off-platform is not a deal — [what actually left the shelf this week](" +
            ilinkHref("data") +
            ") is the public price.",
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
          "Urgency, an emotional story and pressure to hurry are the common thread in nearly every scam. Slow down and keep everything on-platform. Urgency around a 'rare' find is the same tell — [brands clearing fastest right now](" +
            ilinkHref("flip") +
            ") shows what's actually moving, and volume is the opposite of rare.",
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
    seoTitle: "Reseller Record Keeping: A Simple System",
    description: "Track cost, fees and profit per item without a spreadsheet mess. Built for Vinted resellers.",
    date: "2026-08-07",
    category: "Business",
    readMins: 5,
    preflightQuery: "Nike Air Force 1",
    intro:
      "Most resellers can tell you their revenue and almost none can tell you their profit. Tracking a handful of numbers per item turns reselling from a feeling into a business. (General information — for your tax obligations, speak to a qualified accountant in your country.)",
    sections: [
      {
        h: "The minimum per item",
        p: [
          "Purchase price, purchase date, sale price, sale date, fees and shipping. Six fields. That's enough to compute everything that matters — [the profit calculator](/tools/vinted-profit-calculator) turns them into a net figure per item.",
          "A simple spreadsheet is fine. The discipline matters far more than the tool.",
        ],
      },
      {
        h: "The numbers it unlocks",
        p: [
          "Real profit per item after fees, average days to sell, and the share of purchases that never sold — the metric almost nobody tracks and everybody needs. Compare your own numbers against [what actually left the shelf this week](" +
            ilinkHref("data") +
            ").",
          "You'll quickly see which categories genuinely earn and which just feel productive — then compare your own numbers against [what each category does market-wide](/category).",
        ],
      },
      {
        h: "Why it changes behaviour",
        p: [
          "Once you can see that a category averages 90 days to sell, you stop buying it. Records don't just report the past — they correct your sourcing, especially read against [how fast each brand actually moves](" +
            ilinkHref("flip") +
            ").",
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
    title: "How to Start Reselling With No Money — A Realistic Path",
    seoTitle: "How to Start Reselling With No Money? Sell First — Resale IQ",
    description:
      "Sell clothes you already own, then source cheap and local. Stay under buy-below — a small budget makes every wrong purchase cost more.",
    date: "2026-08-07",
    updated: "2026-09-13",
    category: "Business",
    readMins: 5,
    preflightQuery: "Nike Air Force 1",
    intro:
      "You don't need capital to start reselling; you need discipline about what you buy. With a small budget, every wrong purchase costs you a large share of your working capital — so the buy decision matters more, not less. (No income is guaranteed.)",
    sections: [
      {
        h: "Start with what you already have",
        p: [
          "Selling your own unworn clothes costs nothing, teaches you the platform, listing, shipping and buyer communication, and produces your first working capital.",
        ],
        cta: pricingMidCta("ctr_start_20260913"),
      },
      {
        h: "Then source cheap and local",
        p: [
          "Charity shops, car boots and local marketplace listings keep per-item cost low, so a mistake costs a few euros instead of a few hundred.",
          "Stay close to the current season at first — you can't afford to have cash frozen for months. [What actually left the shelf this week](" +
            ilinkHref("data") +
            ") tells you what's actually moving now.",
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
          "With a small budget, avoiding dead stock is more valuable than finding a home run. Checking demand before you buy is the cheapest insurance available — [brands clearing fastest right now](" +
            ilinkHref("flip") +
            ") is the weekly list, and that's the whole point of " +
            BRAND +
            ".",
        ],
      },
    ],
    faq: [
      { q: "How much money do I need to start reselling?", a: "You can start with nothing by selling clothes you already own, then reinvest that into low-cost local sourcing. With a small budget, avoiding items that don't sell matters more than chasing big margins." },
      { q: "What should a beginner reseller buy first?", a: "Low-cost, in-season items from recognisable brands with proven demand and common sizes. Stay near the current season so your limited cash isn't frozen waiting months for a sale." },
    ],
  },
  {
    // Spanish-language test page. Rationale in
    // ~/Desktop/resale-iq-seo/briefs/2026-08-31-spanish-test-page.md.
    //
    // The site publishes only in English, yet all five markets the product
    // covers are non-English. Search Console can only report demand for content
    // that exists, so "no Spanish impressions" was never evidence that Spanish
    // demand is absent — every EU5 impression we do get is on an ENGLISH query.
    // This one page tests that, cheaply, before anyone builds an /es/ tree.
    //
    // Live brand volumes still live on /es/data. BODY-ES-001 below is a dated
    // week snapshot (13 Sep 2026), same figures as English BODY-001 — not a
    // standing count that pretends to update itself.
    slug: "como-poner-precio-en-vinted",
    title: "Cómo poner precio en Vinted: desde el precio de salida",
    seoTitle: "¿Cómo poner precio en Vinted? Precio de salida — Resale IQ",
    description:
      "Parte del precio de salida real, no del de tienda, y calcula tu buy-below. Resale IQ lo saca de listados vistos en la UE. Starter 19 €/mes.",
    date: "2026-08-31",
    updated: "2026-09-13",
    category: "Precios",
    readMins: 6,
    intro:
      "La mayoría de vendedores en Vinted pone precio a ojo, y el resultado es siempre uno de dos: vendes demasiado barato y regalas margen, o pones un precio alto y el artículo se queda meses en el armario. El método que funciona no tiene misterio — se empieza por el precio al que el anuncio desaparece de verdad, y se trabaja hacia atrás.",
    sections: [
      {
        h: "Olvida el precio de tienda",
        p: [
          "El precio original no dice casi nada sobre lo que puedes pedir hoy. Lo que importa es a qué precio desaparecen los anuncios de ese modelo concreto, en ese estado concreto, en tu mercado. Una sudadera de 90 € en tienda puede moverse a 25 €, y otra de 40 € puede irse en 35 € si la demanda acompaña.",
          "Mira anuncios que han desaparecido recientemente, no anuncios activos. Un anuncio activo te dice lo que alguien espera cobrar; uno que desaparece te dice el precio de salida — no vemos el pago (Vinted no lo publica), pero es la señal más honesta que tenemos, más cercana a lo que el mercado realmente paga que un precio pedido. Publicamos [los precios medios al desaparecer el anuncio por marca](" +
            ilinkHref("data", "es") +
            ") gratis, actualizados a diario.",
        ],
      },
      {
        h: "Tu precio máximo de compra",
        p: [
          "Si compras para revender, el número que decide si ganas dinero no es el precio al desaparecer el anuncio — es el máximo que puedes pagar y seguir teniendo margen.",
          "La regla: precio máximo = precio medio al desaparecer el anuncio × 0,95 (la deducción del 5 % que modelamos para Vinted) × 0,70, que apunta a un margen aproximado del 30 %. Sustituye ese 5 % por tu comisión real si la tuya es distinta. Si pagas por encima de ese número, dejas de comprar con margen y empiezas a especular con que el precio suba.",
          "Ese cálculo lo hace [la calculadora de beneficio](/tools/vinted-profit-calculator), y [la metodología](/methodology) explica cada paso y, más útil todavía, lo que los datos no pueden decirte.",
        ],
      },
      {
        h: "La demanda es la otra mitad del precio",
        p: [
          "Un precio de salida sin demanda es una trampa. El artículo puede parecer barato y quedarse parado — o caro y salir la misma semana.",
          "Usa dos números juntos: a qué salió (precio medio de salida de listados comparables) y si se mueve (salidas observadas esa semana para esa marca).",
          "Semana al 13 de septiembre de 2026 (EU5: ES/FR/DE/IT/PT), observamos 5.746 salidas en 28 marcas: Fred Perry — 1.027 · media €19 (volumen); Stone Island — 892 · media €66; Gucci — 230 · media €197 (precio, menos volumen).",
          "Buy-below es el máximo a pagar tras fees con margen. Demanda es si sale antes de que el cash se quede atascado. [Tabla semanal](" +
            dataCiteHrefEs("body_price_es_20260913") +
            ").",
        ],
        // BODY-ES-001. Paid door is the Spanish pricing path only.
        cta: pricingBodyCtaEs("body_price_es_20260913"),
      },
      {
        h: "La velocidad importa más que el último euro",
        p: [
          "Un artículo que se vende en nueve días a 40 € es mejor negocio que uno que tarda setenta a 50 €: el primero recicla tu dinero siete veces al año, el segundo cinco. El dinero parado en stock no gana nada.",
          "Por eso conviene mirar cuánto se mueve cada marca antes de comprar, no después. Las diferencias son enormes, y volumen y precio tiran en direcciones opuestas: las marcas de mucho volumen venden rápido con margen fino, las de lujo dejan mucho más por unidad pero inmovilizan tu dinero durante semanas.",
          "No te fíes de nuestra palabra ni de una cifra escrita en un artículo que envejece: [qué vende cada marca esta semana](" +
            ilinkHref("flip", "es") +
            ") y [qué categorías se mueven](/category) están publicados en abierto y se actualizan solos.",
        ],
      },
      {
        h: "Qué miden esas cifras, y qué no",
        p: [
          "Seguimos " + TRACKED + " anuncios en los cinco mercados principales de Vinted: España, Francia, Alemania, Italia y Portugal.",
          "Las bajas semanales cuentan sólo los anuncios que vimos pasar de activos a desaparecidos durante esa semana — no vemos un recibo, y una desaparición también puede ser una retirada o una reserva, no sólo una venta. Es un mínimo, no el volumen total de Vinted — los artículos que ya habían desaparecido la primera vez que los vimos no entran en esa cifra. Y son el agregado de los cinco mercados, no de España en solitario. Lo decimos porque un número sin su límite es un número que engaña.",
        ],
      },
    ],
    faq: [
      { q: "¿Cómo pongo precio a un artículo en Vinted?", a: "Parte del precio medio al que desaparecen los anuncios recientes de ese modelo exacto y ese estado, y ponte ligeramente por debajo para vender antes. No uses el precio de tienda: en reventa sólo cuenta lo que el mercado paga hoy." },
      { q: "¿Cuál es el precio máximo que debo pagar para revender con margen?", a: "Precio medio al desaparecer el anuncio × 0,95 (la deducción de plataforma que modelamos para Vinted) × 0,70, lo que apunta a un margen del 30 % aproximado. Ajusta el 0,95 a tu comisión real. Por encima de ese número dejas de comprar con margen y empiezas a especular." },
      { q: "¿Es mejor vender rápido o esperar a sacar más?", a: "Para casi todo, vender rápido. Un artículo que rota en nueve días a 40 € rinde más al año que uno que tarda setenta a 50 €, porque el dinero vuelve antes a comprar el siguiente. Esperar sólo compensa en piezas realmente escasas." },
      { q: "¿Qué marcas se venden más rápido en Vinted?", a: "Las zapatillas reconocibles y los básicos de marca dominan el volumen; las marcas de lujo mueven muchas menos unidades a precios mucho más altos. Cuál te conviene depende de cuánto tiempo puedes tener el dinero parado. Las cifras por marca se actualizan a diario en la página de datos de mercado." },
    ],
  },
  {
    slug: "vinted-item-not-selling",
    title: "Why Isn't My Vinted Item Selling — 4 Checks in Order",
    seoTitle: "Vinted Item Not Selling? Do These 4 Checks — Resale IQ",
    description:
      "Price, condition, demand, size — in that order. Most silent Vinted listings are mispriced, not unwanted. Four checks that fix the most, fastest.",
    date: "2026-09-01",
    updated: "2026-09-13",
    category: "Selling",
    readMins: 6,
    preflightQuery: "Nike Air Force 1",
    intro:
      "Something in your closet has been sitting for a while and you don't know why. Before you assume the item is a bad buy, check it in order: most 'nobody wants this' items are actually 'this is priced or described wrong' items, and that's fixable in minutes, not months.",
    sections: [
      {
        h: "Start with price — it fixes more listings than anything else",
        p: [
          "The most common reason a fine item doesn't move is that it's priced against the original retail tag, or against hope, rather than against what that exact model in that condition has actually been leaving the shelf at recently. Active listings show you what other sellers are hoping for, not what buyers are paying.",
          "Check the real number before touching anything else: the [Vinted price checker](/tools/vinted-price-checker) and the [weekly market data](" +
            ilinkHref("data") +
            ") both work from recent departures, not asking prices. If your price is meaningfully above that, that alone explains the silence.",
          "One pattern worth knowing before you price: in our own tracking across Spain, France, Germany, Italy and Portugal (21 Aug – 1 Sep 2026, n = 108,529 watched departures), items priced €250 and over were only 3.6% of everything that left the shelf but carried 37.4% of the total money — while 57.5% of departures were under €30. Most of what actually moves, moves cheap. If you've priced a mid-range item like it belongs in the rare, expensive minority, that's very likely the whole problem.",
        ],
        cta: pricingMidCta("ctr_notselling_20260913"),
      },
      {
        h: "Then the listing itself: is the condition description doing its job",
        p: [
          "Condition isn't decoration copy, it's a price signal buyers read before they read anything else. 'Good condition' with no detail reads as a hedge, and cautious buyers skip hedges rather than risk a dispute later.",
          "It also isn't a small difference in what buyers will pay. In the same window, items marked new-with-tags left the shelf at a median of €37, against €22 for 'very good' condition — a real premium, worth roughly 68%, but nowhere near the multiple people assume. If you're describing a genuinely excellent item as merely 'good' to be safe, you may be pricing yourself into the wrong band without meaning to. If you're describing a worn item generously, buyers are pausing on the mismatch, not the price.",
          "Say exactly what's true — specific flaws, specific measurements, specific wear — and price to that condition, not to the aspiration. [How pricing and condition interact](/blog/how-to-price-items-on-vinted) covers the mechanics if you haven't set your anchor yet.",
        ],
      },
      {
        h: "Check whether the demand exists at all",
        p: [
          "Some items are priced and described perfectly and still don't move, because the model or category itself has thin demand right now. That's not a listing problem, it's a sourcing signal for next time — but it's worth ruling out before you keep adjusting a listing that was never going to sell fast.",
          "[Which brands are actually moving this week](" +
            ilinkHref("flip") +
            ") and [which categories are moving](/category) are both published free and update on their own, so you can check your specific item against real current demand rather than a brand's general reputation.",
          "Size plays the same role inside a single model. In the same tracking window, EU 38 was the single most common sneaker size to leave the shelf (959 times) at a median €38, while EU 46 left the shelf only 93 times, at a median €80. The common size isn't more valuable — it's just where most of the buyers are. An uncommon size sitting a while is not necessarily mispriced; it may just be waiting for the smaller pool of buyers who wear it.",
        ],
      },
      {
        h: "The order that fixes the most, fastest",
        p: [
          "1. Re-check the price against real recent departures for that exact model and condition, not retail and not hope.",
          "2. Rewrite the description to say precisely what condition the item is in — specific, not aspirational.",
          "3. Confirm demand actually exists for the model and size using current market data, not brand reputation.",
          "4. If it's genuinely a slow mover in a slow size, consider [a bundle or a reasonable offer](/blog/vinted-bundles-and-offers-strategy) rather than holding out — cash that recycles beats a listing that sits. For the discipline behind that call — when a price cut is cheaper than another month of waiting — see [pricing a listing and when to cut](/manual/pricing-your-listing).",
        ],
        table: {
          caption: "A quick read on what the symptom usually means. Check price first — it explains most cases.",
          head: ["What you're seeing", "Likely cause", "Fastest check"],
          rows: [
            ["No views at all", "Price far above recent departures, or poor photos/title", "Compare against real departure prices, not retail"],
            ["Views but no offers", "Price close but description vague or condition overstated", "Rewrite condition specifically; re-anchor price"],
            ["Views, honest listing, still nothing", "Thin demand for this exact model or size right now", "Check current brand and category demand before assuming it's you"],
            ["Sold similar items fast before, this one is stuck", "Likely condition or size outlier, not a pricing mistake", "Compare this item's specific condition/size against the ones that moved"],
          ],
        },
      },
    ],
    faq: [
      { q: "Why isn't my Vinted item selling?", a: "Usually one of three things, in order of likelihood: it's priced against retail or hope rather than what that exact model recently left the shelf at, the condition description is too vague for a cautious buyer to trust, or the specific model and size just has thin demand right now. Check price first — it explains the majority of stuck listings." },
      { q: "Should I lower the price if nothing is happening?", a: "Check it against real recent departures for that model and condition first — if you're already priced fairly and nothing has happened since you listed it, a modest price cut and a rewritten, more specific condition description together do more than either alone." },
      { q: "Does a vague condition description actually stop sales?", a: "Yes — cautious buyers treat a vague 'good condition' as a hedge and move on rather than risk a dispute. In our own tracking, items marked new-with-tags left the shelf at a real premium over 'very good' condition (68% higher median), which shows condition tier genuinely moves price — so describing it accurately matters both ways: overstating invites a dispute, understating leaves money on the table." },
      { q: "Is a slow-selling item always mispriced?", a: "No. Some models and some sizes simply have less demand at a given moment — that's a sourcing signal, not a pricing mistake. Checking current brand, category and size demand before repeatedly discounting avoids chasing a price that was never the actual problem." },
    ],
  },
  {
    slug: "patagonia-reselling-vinted-guide",
    title: "Patagonia Reselling on Vinted: Departure Data and Buy-Below",
    seoTitle: "Is Patagonia Worth Reselling on Vinted? — Resale IQ",
    description:
      "Patagonia is the #2 brand by watched departures across 5 EU Vinted markets — 792/week, avg €36. Jackets average €50 at departure; buy below ~€33 to leave margin after fees.",
    date: "2026-09-14",

    preflightQuery: "Patagonia Synchilla",
    category: "Sourcing",
    readMins: 6,
    intro:
      "Week to 14 September 2026, Patagonia was the second-busiest brand we track across Spain, France, Germany, Italy and Portugal: 792 listings left the shelf in 7 days at an average of €36. Only Fred Perry had more departures (935), and Fred Perry averages €18 — less than half the Patagonia ticket. That combination — strong volume AND a meaningful average price — is what makes Patagonia one of the clearest resale opportunities in secondhand fashion right now.",
    sections: [
      {
        h: "Volume and category breakdown",
        p: [
          "Of the 792 watched departures, Jackets led by a wide margin: 319 left the shelf at an average of €50. That alone would rank Patagonia Jackets as one of the most liquid individual brand/category pairs we track. Hoodies were second at 138 departures averaging €41, followed by Bags at 124 averaging €25.",
          "Caps (75 departures, avg €9) and T-Shirts (68, avg €17) round out the picture. Caps and tees are thin-margin volume; Jackets and Hoodies are where the resale case sits. Current brand volumes are on " +
            ilinkHref("flip") +
            " and update weekly.",
        ],
      },
      {
        h: "Buy-below for Patagonia Jackets",
        p: [
          "If Patagonia Jackets leave the shelf at €50 on average, and Vinted models roughly a 5% platform deduction, the departure-net is around €47.50. Applying a 30% target margin gives a buy-below of approximately €33.",
          "That means a Patagonia jacket sourced below €33 — charity shop, car boot, estate sale — has a realistic margin if it is in sellable condition. Above €33 you are speculating on condition or on beating the average; below it you have a structural edge on every unit. The exact buy-below for your specific model is what " +
            BRAND +
            " returns on check.",
        ],
        cta: pricingMidCta("ctr_patagonia_20260914"),
      },
      {
        h: "Condition is where Patagonia flips break",
        p: [
          "Patagonia resale value is disproportionately condition-sensitive. A Nano Puff with a working zip and no odour leaves the shelf quickly at full price; the same jacket with a snapped baffle or bobbling fleece may sit for weeks at a heavy discount.",
          "Check the zip, the DWR (water repellency — brush water over it; it should bead), the seams, and any fleece for excessive pilling. Photograph everything specific — a vague description is the one most likely to trigger a dispute.",
        ],
      },
      {
        h: "Bags and Caps: smaller margin, faster turnover",
        p: [
          "Bags (124 departures, avg €25) and Caps (75, avg €9) move regularly but at thin margins. A Patagonia Black Hole bag at €25 departure means a buy-below around €16 — achievable at the right charity shop, but not a wide target. Caps at €9 average leave almost no room after fees in most sourcing scenarios.",
          "These categories are worth flipping when you encounter them incidentally, not worth actively hunting. The Jacket category is the anchor. What actually left the shelf this week is on " +
            ilinkHref("data") + ".",
        ],
      },
      {
        h: "Market intelligence before the buy",
        p: [
          "The same buy-below discipline applies to every unit: check how the specific model is departing in your size range before cash leaves your pocket. Mid sizes (S–L in jackets) move fastest; XS and XL sit longer. Retro Puff, Nano Puff, and Retro-X fleece are consistently the models generating the most departures — recognisable enough that buyers search for them by name.",
          BRAND +
            " returns a BUY / WATCH / SKIP with a buy-below price for the exact Patagonia model you query — the two numbers that separate a profitable unit from an inventory problem.",
        ],
      },
    ],
    faq: [
      {
        q: "Is Patagonia worth reselling on Vinted?",
        a: "Yes — Patagonia is the #2 brand by watched departures across Spain, France, Germany, Italy and Portugal: 792 listings left the shelf in the 7 days to 14 September 2026, averaging €36. Jackets lead at 319 departures averaging €50. A unit sourced below ~€33 in good condition has a realistic margin after fees.",
      },
      {
        q: "What Patagonia items sell best on Vinted?",
        a: "Jackets by a clear margin: 319 watched departures in 7 days averaging €50. Hoodies are second (138 departures, avg €41). Bags and Caps move in volume but at thin margins. Focus sourcing on Jackets and Hoodies — Nano Puff, Retro Puff and Retro-X fleece generate the most recognisable demand.",
      },
      {
        q: "What is the buy-below price for a Patagonia jacket?",
        a: "With Patagonia Jackets averaging €50 at departure across EU Vinted markets (to 14 September 2026), and modelling a ~5% platform deduction and 30% target margin, the buy-below sits around €33. Above that you are speculating on condition or on beating the average price. Resale IQ returns the exact buy-below for a specific model on check.",
      },
      {
        q: "What condition issues kill Patagonia resale value?",
        a: "A broken zip, failed DWR (water-repellency), heavy baffle odour, or significant fleece pilling can cut sale price sharply or prevent a sale entirely. Check all four before buying. Photograph every flaw specifically — a vague description is the most common cause of disputes.",
      },
      {
        q: "How liquid is Patagonia on Vinted compared to other brands?",
        a: "Very liquid for outerwear. 792 departures in 7 days puts Patagonia #2 among the 28 brands Resale IQ tracks — behind only Fred Perry (935 departures). Unlike Fred Perry's €18 average, Patagonia averages €36, meaning more cash per unit at comparable volume. Live weekly comparison: https://resaleiq.dev/flip.",
      },
    ],
  },
  {
    slug: "stone-island-reselling-vinted-guide",
    title: "Stone Island Reselling on Vinted: Departure Data and Buy-Below",
    seoTitle: "Is Stone Island Worth Reselling on Vinted? — Resale IQ",
    description:
      "Stone Island is the #3 brand by watched departures across 5 EU Vinted markets — 788/week, avg €70. Hoodies average €55 at departure; buy below ~€36 to leave margin after fees. Jackets average €142.",
    date: "2026-09-14",

    preflightQuery: "Stone Island Ghost",
    category: "Sourcing",
    readMins: 6,
    intro:
      "Week to 14 September 2026, Stone Island ranked #3 across Spain, France, Germany, Italy and Portugal: 788 listings left the shelf in 7 days at an average of €70. That combination — 788 units of volume at a €70 average — puts more cash potential per week on Stone Island than any other brand we track except Fred Perry. Hoodies are the core opportunity: 431 departures at €55. Jackets move less often but at €142 average, each unit is a meaningful individual decision.",
    sections: [
      {
        h: "Volume and category breakdown",
        p: [
          "Of the 788 watched departures, Hoodies led by volume: 431 left the shelf at an average of €55. That is the deepest pool of Stone Island resale opportunity. Jackets followed at 178 departures averaging €142 — far fewer units but a much higher per-unit return. Shirts (81 departures, avg €26) and T-Shirts (59, avg €24) round out the mid-tier. Caps (13, avg €26) are thin and opportunistic only.",
          "The Hoodie / Jacket split is a strategic choice: Hoodies give faster cash turn with a lower buy-below ceiling; Jackets require more capital but return more per flip when the condition is right. Current brand volumes are on " +
            ilinkHref("flip") +
            " and update weekly.",
        ],
      },
      {
        h: "Buy-below for Stone Island Hoodies",
        p: [
          "If Stone Island Hoodies leave the shelf at €55 on average, and Vinted models roughly a 5% platform deduction, the departure-net is around €52.25. Applying a 30% target margin gives a buy-below of approximately €36.",
          "That means a Stone Island hoodie sourced below €36 — charity shop, car boot, estate sale — has a realistic margin at current departure prices. Above €36 you are betting on condition premium or beating the average. The exact buy-below for a specific model and colourway is what " +
            BRAND +
            " returns on check.",
        ],
        cta: pricingMidCta("ctr_stoneisland_20260914"),
      },
      {
        h: "Jackets: high ticket, high selectivity",
        p: [
          "Stone Island Jackets average €142 at departure — the highest average price of any brand/category pair in the top 3 brands we track. A buy-below on a €142 exit price is around €94. At that ceiling, a charity shop or estate sale find at £60–70 (converted) can be a genuine margin unit.",
          "The selectivity required is higher: authenticity matters (check the compass badge, shadow project labelling, and season codes), condition matters more at this price tier, and size range matters — M and L move fastest, XXL and XS sit considerably longer.",
        ],
      },
      {
        h: "Condition signals that kill a Stone Island flip",
        p: [
          "Stone Island resale value is brand-identity driven. The compass badge must be intact and original — a missing or replaced badge is the single fastest way to destroy resale value regardless of garment condition. Check the lining label and season code (e.g. AW22) so you can describe the piece accurately.",
          "For Hoodies: check the drawstring (replaceable but signals wear), cuffs and hem for ribbing stretch, and any screen prints for cracking. For Jackets: check zip function, seam integrity, lining, and fabric treatment (garment-dyed and pigment-dyed styles fade unevenly with washing — buyers in this tier know to ask).",
        ],
      },
      {
        h: "Market intelligence before the buy",
        p: [
          "Stone Island buyers in the EU tend to search by product line and season — 'Ghost' pieces, 'Nylon Metal', 'Membrana 3L'. These command a premium over equivalent-season basics. Recognising which product line you have before listing means pricing to the right comparison set, not just the brand average.",
          BRAND +
            " returns a BUY / WATCH / SKIP with a buy-below price for the exact Stone Island model you query — the two inputs that separate a margin unit from stalled inventory.",
          "Full brand comparison at " + ilinkHref("flip") + ".",
        ],
        cta: pricingBodyCta("body_stoneisland_20260914"),
      },
    ],
    faq: [
      {
        q: "Is Stone Island worth reselling on Vinted?",
        a: "Yes — Stone Island is the #3 brand by watched departures across Spain, France, Germany, Italy and Portugal: 788 listings left the shelf in the 7 days to 14 September 2026, averaging €70. Hoodies average €55 (431 departures); Jackets average €142 (178 departures). A Hoodie sourced below ~€36 in good condition has a realistic margin after fees.",
      },
      {
        q: "What is the buy-below price for a Stone Island hoodie?",
        a: "With Stone Island Hoodies averaging €55 at departure across EU Vinted markets (to 14 September 2026), and modelling a ~5% platform deduction and 30% target margin, the buy-below sits around €36. Above that you are speculating on beating the market average. Resale IQ returns the exact buy-below for a specific model on check.",
      },
      {
        q: "How do I authenticate Stone Island before buying to resell?",
        a: "The compass badge should be original, firmly attached, and consistent with the season. Check the lining label for a season code (e.g. AW22, SS23) and the brand's characteristic stitching on the badge surround. Ghost-line and special-project pieces have specific labelling — if you cannot identify the product line, treat it as a basic piece for pricing.",
      },
      {
        q: "How does Stone Island compare to Fred Perry and Patagonia for resale?",
        a: "Fred Perry leads on volume (199 departures in the last 30 days) but averages €18 — high turnover, thin per-unit margin. Patagonia is #2 at 790 departures averaging €36. Stone Island is #3 at 788 departures averaging €70 — similar volume to Patagonia, but nearly double the average exit price. Stone Island is the highest-cash-potential brand in the top three when you weight volume by average price.",
      },
      {
        q: "What Stone Island categories should I target on Vinted?",
        a: "Hoodies are the primary target: 431 departures at €55 average gives the best combination of liquidity and margin. Jackets (178 departures, €142 average) are worth sourcing when you can authenticate and condition-check reliably. Shirts, T-Shirts, and Caps are incidental — take them when the price is right, don't actively hunt them.",
      },
    ],
  },
  {
    slug: "fred-perry-reselling-vinted-guide",
    title: "Fred Perry Reselling on Vinted: Volume, Margins, and Floor Discipline",
    seoTitle: "Is Fred Perry Worth Reselling on Vinted? — Resale IQ",
    description:
      "Fred Perry is the #1 brand by watched departures across 5 EU Vinted markets — 928/week at an average of €18. High liquidity, thin margins. Shirts dominate at 451 departures averaging €14. Buy-below for Jackets is ~€24.",
    date: "2026-09-14",

    preflightQuery: "Fred Perry Harrington",
    category: "Sourcing",
    readMins: 6,
    intro:
      "Week to 14 September 2026, Fred Perry ranked #1 across Spain, France, Germany, Italy and Portugal by a clear margin: 928 listings left the shelf in 7 days. That is the highest observed departure volume of any brand we track. The trade-off is price — the average exit is €18, which makes Fred Perry the highest-liquidity, lowest-margin brand at the top of the table. The strategy here is not about finding the best single flip; it is about floor discipline and volume. If you source below your floor, the volume handles the rest.",
    sections: [
      {
        h: "Volume and category breakdown",
        p: [
          "Of the 928 watched departures, Shirts led: 451 left the shelf at an average of €14. T-Shirts followed at 168 departures averaging €12. Hoodies contributed 147 at €22 — the highest per-unit return in the core Fred Perry range. Jackets (118 departures at €36) are the premium end. Caps (16 departures, €17) are opportunistic only.",
          "The Shirt dominance reflects Fred Perry's market position — the M12 Polo is the brand's defining item, and it turns over faster than anything else. Full brand volumes are on " +
            ilinkHref("flip") +
            " and update weekly.",
        ],
      },
      {
        h: "Buy-below by category",
        p: [
          "With Shirts averaging €14 at departure and Vinted modelling roughly a 5% platform deduction, the departure-net is around €13.30. Applying a 30% target margin gives a buy-below of approximately €9. A Fred Perry Shirt sourced below €9 has a realistic margin at current departure prices.",
          "Hoodies at €22 average give a buy-below near €15. Jackets at €36 give a buy-below near €24. The numbers are tight — which is why floor discipline matters more on Fred Perry than on higher-ticket brands. A single pound or euro over floor on a £12 shirt is the entire margin.",
        ],
        cta: pricingMidCta("ctr_fredperry_20260914"),
      },
      {
        h: "Why volume makes Fred Perry viable despite thin margins",
        p: [
          "At 199 departures in the last 30 days, Fred Perry moves faster than any brand in the top 10. A thin-margin brand with strong liquidity is often more useful to a part-time reseller than a high-margin brand that sits for weeks. Cash that recycles in 3–5 days competes with cash that earns a bigger margin but waits 3 weeks.",
          "The condition for this to work: your floor must be real. If you pay £12 for a Shirt that needs cleaning and relist at €14 with €0.70 in fees deducted, you have made €0.60 before sourcing time and postage. The margin is there; the volume argument collapses the moment you pay over floor. " +
            BRAND +
            " returns a BUY / WATCH / SKIP with a buy-below for the specific model so you can check the floor before you commit.",
        ],
      },
      {
        h: "Which Fred Perry pieces hold margin",
        p: [
          "The M12 Polo (the piqué twin-tip) is the highest-volume individual piece. Colourway matters: black, navy, and burgundy move consistently. Unusual or season-limited colourways sometimes command a small premium but also sit longer if the buyer pool for that colour is thin.",
          "Jackets — particularly Harrington-style and track jackets — are the best per-unit Fred Perry opportunity. At 118 departures and €36 average, the buy-below (~€24) is achievable at charity shops and car boots when the Harrington is a current-decade piece in clean condition. Size M and L move fastest; XS and XL sit considerably longer.",
          "For authenticity: check the laurel wreath badge is original and not faded, the twin-tip colour is consistent, and the fabric label matches the era. Pre-2000 pieces can trade at a premium with the right buyer but require specific knowledge to price — if in doubt, price them as standard.",
        ],
      },
      {
        h: "Floor management is the whole game",
        p: [
          "At these price points, profit or loss is decided at the point of purchase, not at the point of listing. Know your floor — cost plus fees plus minimum margin — before you handle the item, not while you are negotiating. The " +
            ilinkHref("data") +
            " page shows what Fred Perry items are actually leaving the shelf at this week, which is the only honest basis for a floor.",
          "Avoid bidding on lots you cannot separate — a bag of Fred Perry Shirts at a house clearance is only a good buy if the individual item floor math still works on each piece, not on the average.",
        ],
        cta: pricingBodyCta("body_fredperry_20260914"),
      },
    ],
    faq: [
      {
        q: "Is Fred Perry worth reselling on Vinted?",
        a: "Yes — Fred Perry is the #1 brand by watched departures across Spain, France, Germany, Italy and Portugal: 928 listings left the shelf in the 7 days to 14 September 2026. Margins are thin (avg €18 exit) but liquidity is the highest of any brand we track. The model works when sourcing floor discipline is strict.",
      },
      {
        q: "What is the buy-below price for a Fred Perry shirt?",
        a: "With Fred Perry Shirts averaging €14 at departure across EU Vinted markets (to 14 September 2026), and modelling a ~5% platform deduction and 30% target margin, the buy-below sits around €9. Above that the margin disappears. Resale IQ returns the exact buy-below for a specific Fred Perry model on check.",
      },
      {
        q: "What is the most popular Fred Perry item on Vinted?",
        a: "Shirts — most notably the M12 Polo — dominate: 451 of the 199 departures in the last 30 days are Shirts, averaging €14. T-Shirts (168 departures, avg €12) and Hoodies (147, avg €22) follow. Jackets are the best per-unit opportunity at €36 average but move less often (199 departures in the last 30 days).",
      },
      {
        q: "How does Fred Perry compare to Stone Island and Patagonia for resale?",
        a: "Fred Perry leads on volume (199 departures in the last 30 days) but averages €18 — the highest liquidity, the thinnest margins. Stone Island (#3 by volume at 785 departures) averages €70 — less frequent but much higher per-unit. Patagonia (#2) is in between at 785 departures and €36 average. Fred Perry rewards volume operators with strict sourcing floors; Stone Island rewards selective buyers with capital.",
      },
      {
        q: "What is the buy-below for Fred Perry Jackets on Vinted?",
        a: "Fred Perry Jackets average €36 at departure (199 departures in the last 30 days to 14 September 2026). Modelling a ~5% platform deduction and 30% target margin gives a buy-below of approximately €24. Harrington and track jackets in clean condition sourced below that price have a realistic margin. Size M and L move fastest.",
      },
    ],
  },
  {
    slug: "balenciaga-reselling-vinted-guide",
    title: "Balenciaga Reselling on Vinted: Where €133 Average Exits and Strict Authentication Meet",
    seoTitle: "Is Balenciaga Worth Reselling on Vinted? — Resale IQ",
    description:
      "Balenciaga ranks #4 by watched departures across 5 EU Vinted markets — 211/week at €133 average. Sneakers lead with 61 departures averaging €164 (buy-below ~€107). Bags are the highest cash-per-unit play at €193 average.",
    date: "2026-09-19",

    preflightQuery: "Balenciaga Track",
    category: "Sourcing",
    readMins: 7,
    intro:
      "Week to 19 September 2026, Balenciaga ranked #4 across Spain, France, Germany, Italy and Portugal with 211 watched departures at an average exit price of €133 — the highest revenue-per-departure of any brand in the top five. That combination of volume and ticket size makes Balenciaga the brand where authentication skill translates most directly into profit: one correctly authenticated Triple S or Track runner, sourced at the right floor, clears more margin than a week of Fred Perry Shirts. The constraint is not demand — it is sourcing knowledge.",
    sections: [
      {
        h: "Volume and category breakdown",
        p: [
          "Of the 211 watched departures, Sneakers led with 61 at an average of €164. T-Shirts followed at 52 departures averaging €96. Hoodies contributed 34 at €103 — a strong per-unit return for a garment that sources regularly at charity shops and house clearances. Shirts came in at 32 departures averaging €83. Bags were the smallest category by volume (9 departures) but the highest by exit price: €193 average, driven by canvas totes and shoulder bags in clean condition.",
          "Full Balenciaga volumes are on " +
            ilinkHref("flip") +
            " and update weekly. The €133 brand average masks a wide spread — a Sneaker lot and a T-Shirt lot at the same source price are not the same opportunity.",
        ],
      },
      {
        h: "Buy-below by category",
        p: [
          "With Sneakers averaging €164 at departure and Vinted modelling roughly a 5% platform deduction, the departure-net is around €156. Applying a 30% target margin gives a buy-below of approximately €109. Any Balenciaga Sneaker sourced below that price — authenticated and in wearable condition — has a realistic margin at current departure prices.",
          "Hoodies at €103 average give a buy-below near €69. T-Shirts at €96 give a buy-below near €64. Shirts at €83 give a buy-below near €55. Bags at €193 average give a buy-below near €128 — the highest absolute floor, but bags are also the most condition- and authenticity-dependent category. A bag that fails authentication or photographs as worn has no real market at any price.",
        ],
        cta: pricingMidCta("ctr_balenciaga_20260919"),
      },
      {
        h: "Authentication is the sourcing moat",
        p: [
          "Balenciaga's resale premium depends entirely on authenticity confidence. For Sneakers: check the heel tab font (the bold block lettering on genuine pieces is consistent and clean), the sole unit attachment (genuine Track and Triple S soles have no flex separation at the midsole seam), and the insole embossing depth. The " +
            BRAND +
            " buy verdict includes authentication guidance for tracked models.",
          "For T-Shirts and Hoodies: the screen-print registration on genuine Balenciaga pieces is precise — misaligned or bleeding text is a rejection signal. The fabric weight on genuine pieces is heavier than most fast-fashion copies. Stitching on the label should be fine and consistent. If you cannot authenticate cleanly, price as a risk item and ensure your floor reflects a possible failure.",
        ],
      },
      {
        h: "Sneakers: where the margin lives",
        p: [
          "At 61 departures in the last 30 days and €164 average, Sneakers are Balenciaga's strongest resale category by revenue volume. The models that drive this: Track runners (the two-sole runner with exposed mesh upper) and Triple S (the chunky triple-layer sole). Both have been widely faked since 2019 — which is the sourcing moat for buyers who can authenticate.",
          "Condition grading matters more than on low-ticket brands: a pair described as 'worn twice' in a flat-lay photo commands €30–40 more than the same pair described as 'used' in box-less presentation. Photograph against a neutral background, show the sole unit cleanly, and describe any toe-box creasing explicitly. EU size 41–43 (M medium) moves fastest; very small and very large sizes sit longer.",
        ],
      },
      {
        h: "Bags: highest cash per unit, strictest condition standard",
        p: [
          "Bags averaged €193 at departure across 9 watched exits — the highest per-unit exit of any Balenciaga category. The canvas North-South shopper and the Le Cagole shoulder bag account for most of this volume. The condition bar is high: buyers in the €150–250 range are not accepting bags with strap wear, handle darkening, or structural sag.",
          "Hardware condition is a tell: genuine Balenciaga hardware does not tarnish or flake, and the embossed logo on metal fittings should be sharp. If hardware shows any flaking, treat the piece as non-market. Dust bags are not essential but do support the asking price. Source bags only when you can photograph them under controlled light — corner wear and base sag are invisible in casual photos and return triggers for buyers.",
        ],
        cta: pricingBodyCta("body_balenciaga_20260919"),
      },
      {
        h: "How Balenciaga compares to other top brands",
        p: [
          "By revenue velocity (departures × average price), Balenciaga competes in the top five: 211 exits at €133 produces approximately €28,060 in weekly market value across EU5. Stone Island at 785 departures × €70 is €54,950. Patagonia at 785 × €36 is €28,260. Fred Perry at 928 × €18 is €16,704.",
          "The practical comparison: Balenciaga requires more capital per unit sourced, stricter authentication, and more careful condition grading — but the sourcing moat is also higher, meaning fewer casual buyers are competing with you for the same inventory. The " +
            ilinkHref("data") +
            " page shows the current week's departure numbers for all 28 tracked brands.",
        ],
      },
    ],
    faq: [
      {
        q: "Is Balenciaga worth reselling on Vinted?",
        a: "Yes — Balenciaga ranked #4 by watched departures across Spain, France, Germany, Italy and Portugal in the week to 14 September 2026: 523 listings left the shelf at an average of €145. It is the highest revenue-per-departure brand in the top five. The constraint is authentication knowledge, not demand.",
      },
      {
        q: "What is the buy-below price for Balenciaga Sneakers on Vinted?",
        a: "With Balenciaga Sneakers averaging €140 at departure across EU Vinted markets (to 14 September 2026), and modelling a ~5% platform deduction and 30% target margin, the buy-below sits around €93. Authenticated pairs sourced below that price in wearable condition have a realistic margin. Resale IQ returns the exact buy-below for a specific Balenciaga model on check.",
      },
      {
        q: "Which Balenciaga items sell best on Vinted?",
        a: "Sneakers lead by volume: 163 watched departures averaging €140 in the week to 14 September 2026. T-Shirts (93 departures, avg €89) and Hoodies (81 departures, avg €108) follow. Bags (51 departures, avg €319) are the highest per-unit opportunity. Track runners and Triple S are the primary Sneaker models; the canvas shopper and Le Cagole drive the Bag volume.",
      },
      {
        q: "How does Balenciaga compare to Fred Perry and Stone Island for resale?",
        a: "Balenciaga is the highest revenue-velocity brand in the tracked top five: 523 departures at €145 average = ~€75,800 weekly market value. Stone Island (785 departures at €70) is second at ~€54,950. Fred Perry (928 departures at €18) leads on volume but has the thinnest margins. Balenciaga requires more capital and stricter authentication than either, but competition for authenticated inventory is lower.",
      },
      {
        q: "How do I authenticate Balenciaga before buying to resell?",
        a: "For Sneakers: check the heel tab font (bold block lettering, consistent), sole unit attachment (no flex separation at the midsole seam on genuine Track/Triple S), and insole embossing depth. For T-Shirts and Hoodies: verify precise screen-print registration and consistent label stitching. For Bags: check hardware for tarnishing or flaking (genuine hardware stays clean), and embossed logo sharpness on metal fittings. If authentication is unclear, price as a risk item with a floor that accounts for the downside.",
      },
    ],
  },
]
