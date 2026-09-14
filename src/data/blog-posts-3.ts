// Batch 3 of SEO/AEO articles. Same contract as blog-posts.ts.
// Honest claims only: listings-tracked via TRACKED + fillTracked, no earnings promises,
// no tax/legal advice presented as professional advice.

import { TRACKED } from "@/lib/stats"
import type { BlogPost } from "./blog-posts"
import { dataCiteHrefEs, pricingBodyCtaEs, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

const BRAND = "Resale IQ"

export const POSTS_3: BlogPost[] = [
  {
    slug: "vinted-bundles-and-offers-strategy",
    title: "Vinted Bundles and Offers — When a Lower Price Still Wins",
    seoTitle: "Should You Accept a Vinted Offer or Bundle? — Resale IQ",
    description:
      "Take a Vinted offer if it still clears your floor — cost, fees, minimum margin. Bundle slow stock to free cash; don't discount items that already sell.",
    date: "2026-08-07",
    updated: "2026-09-14",
    category: "Selling",
    readMins: 4,
    intro:
      "Buyers will almost always ask for less. Whether you should say yes has one honest answer: does the offer still clear your floor, and does it move stock you'd otherwise hold for months? As of 14 September 2026, the fast categories where a bundle rarely makes sense are Hoodies (1,181 watched departures/7d) and Shirts (760/7d) — they clear at full price on their own — while a slow, higher-ticket item like a Bag (298/7d at an average €156) is exactly the kind of stock a bundle discount should free up. Speed, not sentiment, decides.",
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
    seoTitle: "What Should Resellers Track? Six Fields — Resale IQ",
    description:
      "Six fields per item: purchase price, dates, sale price, fees and shipping. That is enough to see real profit. Tax: ask an accountant where you live.",
    date: "2026-08-07",
    category: "Business",
    readMins: 5,
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
]
