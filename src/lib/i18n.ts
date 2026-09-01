/**
 * Smallest i18n that works: marketing + extension panel.
 * vinted.fr → French, vinted.es → Spanish, vinted.de → German,
 * vinted.it → Italian, vinted.pt → Portuguese, otherwise English.
 * No i18n framework — dictionaries + Accept-Language / hostname.
 *
 * We serve ES/FR/DE/IT/PT (market-numbers.ts). Every one of those five needs
 * a full dictionary, not a partial one — a page that falls back to English
 * mid-paragraph reads as broken, not as "we tried." See copy.de/it/pt below
 * for the two terms that must not drift in translation: "buy-below" and
 * "watched departures" (never "sold" — a watched departure can be a
 * delist, an edit or a reservation, and re-introducing "sold" in any
 * language reopens the false claim removed from the English copy).
 *
 * 2026-09-01: extended below the fold. Hero/nav/features covered de/it/pt
 * already; the free checker (the conversion moment — button, error states,
 * "try one of these instead", LIMIT_REACHED / INSUFFICIENT_DATA copy, every
 * stat label) and the pricing tiers did not, so a non-English visitor hit an
 * English paywall after an English hero. `checker` and `tiers` below close
 * that. `res.message` / `res.confidence_note` / `res.category` /
 * `res.confidence` in free-checker.tsx stay UNTRANSLATED here on purpose —
 * those are backend-owned strings (demand-intel/api/routes.py), and
 * translating them client-side would either fork the sentence from the
 * number it describes or require a translation of a template the frontend
 * does not own. That gap is real and is backend-eng's, not papered over.
 *
 * 2026-09-01 (W9): `liveProof` (live-market-proof.tsx), `extensionHero`
 * (extension-hero.tsx) and `watchedSample` (lib/watched-sample.ts) close the
 * three surfaces that were still 100% English on every `/es /fr /de /it /pt`
 * route — locale routing (seo/i18n-routing-hreflang) made this visible: a
 * visitor now lands on a real translated URL and hits English proof content
 * halfway down the page. Same "never sold" rule as the header above: these
 * three surfaces describe watched departures (items leaving the shelf), and
 * every translation below uses "for sale" / "exit price" / "left the shelf"
 * framing rather than a past-tense "sold" verb in any language, exactly like
 * the rest of this dictionary already does.
 *
 * FLAGGED FOR NATIVE REVIEW, NOT JUST GREP: two things below are functional
 * (a wrong translation breaks a test, not a first impression) and two read as
 * brand voice (a stiff or machine-translated line here is the visitor's first
 * proof of the product, and costs more than leaving it English would have).
 * Marked inline with FUNCTIONAL / BRAND-VOICE at each key. `extensionHero.
 * condition` ("Very good") is a third, narrower risk: it mimics Vinted's own
 * condition-picker label, and this pass could not open live Vinted in each
 * market to confirm the exact wording Vinted itself uses there — the value
 * chosen is a standard, defensible translation, not a verified copy of
 * Vinted's UI string, and should be checked against the real listing flow in
 * each market before this is treated as done.
 */
export type Locale = "en" | "fr" | "es" | "de" | "it" | "pt"

export function detectLocale(acceptLanguage: string | null | undefined): Locale {
  const parts = (acceptLanguage || "")
    .split(",")
    .map(s => s.trim().split(";")[0].toLowerCase())
  for (const p of parts) {
    if (p.startsWith("fr")) return "fr"
    if (p.startsWith("es")) return "es"
    if (p.startsWith("de")) return "de"
    if (p.startsWith("it")) return "it"
    if (p.startsWith("pt")) return "pt"
  }
  return "en"
}

export const copy = {
  en: {
    signIn: "Sign in",
    pricing: "Pricing",
    heroTitle: "Know what to pay before you buy.",
    heroBody:
      "Market price, buy-below, demand and comparable asking prices at departure — then BUY, WATCH or SKIP. Vinted is the first marketplace it covers.",
    heroFrom: (tracked: string) =>
      `From ${tracked} live listings and watched departures across five EU markets.`,
    // Additive, not a replacement for the confident demo above it — see
    // docs/product/DESIGN-REVIEW.md §4. Same number the counter-KPI already
    // tracks (insufficient_data_rate, docs/company/METRICS.md), stated once,
    // in the open, before a visitor hits it themselves on their own search.
    heroHonesty:
      "About 4 in 10 lookups come back “not enough data” — we'd rather say that than guess.",
    addToChrome: "Add to Chrome",
    checkItem: "Check an item",
    orCheck: "Start 7-day Starter trial",
    features: [
      { t: "Decide before you buy", d: "DATA → ANALYSIS → DECISION. BUY, WATCH or SKIP from watched departures — not a model guessing." },
      { t: "Live search", d: "Search live Vinted listings across country sites. Intelligence is built on 5 EU markets." },
      { t: "Price compare", d: "Compare asking prices for the same item across Vinted country sites. Buy where it is cheaper." },
      { t: "Deal finder", d: "Listings priced under your buy-below threshold, right now." },
      { t: "Order planner", d: "What to order now for stock landing in three weeks, priced off this week's watched departures." },
      { t: "Watchlist", d: "Pin models you source and get the buy-below, departure price and sizes without re-searching." },
    ],
    footerTag: "Resale IQ — market intelligence for second-hand commerce.",
    noAccuracy: "No accuracy claims until 30 outcomes scored",
    // The free checker — the conversion moment. Everything a visitor sees
    // between typing a query and hitting the paywall.
    checker: {
      inputAriaLabel: "Item to check",
      checkingAriaLabel: "Checking item",
      checkAriaLabel: "Check it free",
      checking: "Checking…",
      checkFree: "Check it free",
      placeholderPrefix: "e.g.",
      enterBrandModel: "Enter a brand and model",
      couldNotCheck: "Could not check that item right now",
      somethingWrong: "Something went wrong",
      timedOutPre:
        "Something went wrong on our end finishing that check — it may still count against today’s free limit. If your count looks wrong, email",
      timedOutPost: "and we’ll fix it.",
      tryAgain: "Try again",
      limitReachedFallback: "Free checks used up for today. Sign in to continue.",
      usedOfLimit: (used: number, limit: number) => `${used} of ${limit} free checks used today.`,
      createFreeAccount: "Create a free account →",
      seePlans: "See plans",
      unknownFallback: "No data for that query. Use a brand and a real model.",
      tryTheseInstead: "Try one of these instead",
      // Matches extension/content.js I18N.en.thinSample verbatim (product
      // term, not a fresh translation) and echoes heroHonesty above it.
      insufficientStatement: "Not enough watched departures to price this yet.",
      insufficientSubtext: "We’d rather say that than guess.",
      insufficientNLabel: "watched, not enough",
      buyBelow: "Buy-below",
      marketPrice: "Market price",
      leftShelf: "Left shelf (watched)",
      stillListed: "Still listed",
      sellThrough: "Sell-through",
      planLabel: "Plan",
      limitReachedLabel: "LIMIT REACHED",
      confidenceLabel: "Confidence",
      headlineOnly: "Headline call only — market price and buy-below need an account.",
      unlockLine: "Unlock sell-through, demand, sizes and history with a plan.",
      unlockRest: "Unlock the rest →",
      seeFullNumbers: "See full numbers →",
    },
    pricingSection: {
      heading: "Know what to pay. Skip what you shouldn’t.",
      noCardRequired: "No card required",
      perDay: (amount: string) => `about €${amount} a day`,
      mostPopular: "MOST POPULAR",
      forever: "forever",
      perMonth: "/month",
      whereItStops: "Where it stops:",
      footer:
        "Every paid plan unlocks the full numbers — verdicts, buy-below and sizes. Live Deal Finder, Order Planner and Price Compare are Pro. Estimated margin, not a promised profit. Cancel anytime from Account → Manage subscription.",
    },
    // Keyed by Tier.id (lib/pricing.ts). Names ("Free"/"Starter"/"Pro") stay
    // as product/plan names across locales — same choice already made for
    // BUY/WATCH/SKIP in `features` above.
    tiers: {
      power: {
        tagline: "It stops waiting for you to ask",
        cta: "Let it find the deals",
        stepUp: "+€30 over Starter — about €1 a day",
        stepUpWhy:
          "Starter tells you whether an item is worth buying, once you have found it. Pro finds it: on demand, it searches the five EU markets we track and shows you listings already priced under your buy-below number.",
        ceiling: "Need seats, bulk or a custom scope? That's a conversation.",
        features: [
          "Everything in Starter",
          "Live Deal Finder — current Vinted listings under your buy-below, on demand when you search",
          "3-week demand Order Planner",
          "Per-size sell-through when the watched sample supports it",
          "REST API access (your own API key)",
          "Price Compare — full buy-below intelligence on ES/FR/DE/IT/PT, plus live asking-price search across 26 markets total",
        ],
      },
      operator: {
        tagline: "Answers on anything you look up",
        cta: "Get the numbers",
        features: [
          "Unlimited buy/sell verdicts",
          "Every product signal we compute, unblurred",
          "Deal Scanner — warehouse models already under buy-below",
          "Full market trends & brand rankings",
          "Watchlist & portfolio P&L",
          "Cross-platform fee calculator",
        ],
        ceiling: "No Live Deal Finder, Order Planner, Price Compare or API — that's Pro.",
      },
      free: {
        tagline: "See that the data is real before you pay",
        cta: "Create a free account",
        features: [
          "7 days of Starter (verdicts + Deal Scanner), 5 live finds and 1 order plan, then 10 full checks / month. Anonymous visitors get 10 checks/day.",
          "BUY / WATCH / SKIP on every lookup",
          "The whole reselling manual and market data",
          "No card required",
        ],
        ceiling: "10 checks each calendar month after the trial. Live Finder after the 5 trial searches is Pro.",
      },
    },
    // live-market-proof.tsx — the "Selling on Vinted this week" band below
    // the hero. FUNCTIONAL except watchedTotal/planAdds* (BRAND-VOICE: the
    // sentence that makes the honesty posture legible, and the paid-tier
    // pitch under it).
    liveProof: {
      heading: "Selling on Vinted this week",
      perWeek: "/wk",
      avg: "avg",
      freshnessLastGood: "LAST GOOD",
      freshnessSnapshot: "SNAPSHOT",
      freshnessRecent: "UPDATED <1h",
      freshnessHoursAgo: (h: number) => `UPDATED ${h}h AGO`,
      // BRAND-VOICE
      watchedTotal: (total: string) =>
        `Watched departures across 5 EU markets — ${total} items left the shelf in the last 7 days.`,
      seeHow: "See how we calculate it →",
      // BRAND-VOICE
      planAddsHeading: "What a plan adds, per model",
      // BRAND-VOICE
      planAddsBody:
        "The most you can pay and still profit, the price it actually sells at, how fast it moves, and which sizes clear first — for the specific item in your hand, not the brand.",
    },
    // extension-hero.tsx — the mock Chrome panel on a Vinted listing.
    // FUNCTIONAL except caption/payMargin (BRAND-VOICE: the sentence selling
    // the panel itself).
    extensionHero: {
      listingLabel: "listing",
      size: "Size",
      condition: "Very good",
      matched: "matched:",
      // BRAND-VOICE
      payMargin: "most you can pay for your margin",
      listedAbove: (price: string) => `listed at ${price} — above buy-below`,
      avgExit: "avg exit",
      // BRAND-VOICE
      caption:
        "Example of the Chrome panel on an Adidas Samba listing — not a live quote. Check the model on this page to see today's number.",
    },
    // lib/watched-sample.ts — the honesty line under a BUY/WATCH/SKIP.
    // FUNCTIONAL: this is a data-integrity sentence (the sample size behind a
    // verdict), not a marketing line, and it must stay literal.
    watchedSample: {
      head: (sold: string, listed: string) =>
        `In the listings we watched, ${sold} left the shelf vs ${listed} still listed`,
      skipSuffix: " — that is a supply glut in our sample, not a claim this model never sells.",
    },
  },
  fr: {
    signIn: "Connexion",
    pricing: "Tarifs",
    heroTitle: "Sachez quoi payer avant d'acheter.",
    heroBody:
      "Prix de marché, prix d'achat max, demande et prix affichés comparables au moment où l'annonce disparaît — puis BUY, WATCH ou SKIP. Vinted d'abord.",
    heroFrom: (tracked: string) =>
      `À partir de ${tracked} annonces en ligne, et les disparitions observées, sur cinq marchés UE.`,
    heroHonesty:
      "Environ 4 recherches sur 10 reçoivent « pas assez de données » — on préfère le dire plutôt que deviner.",
    addToChrome: "Ajouter à Chrome",
    checkItem: "Vérifier un article",
    orCheck: "Essai Starter 7 jours",
    features: [
      { t: "Décider avant d'acheter", d: "DONNÉES → ANALYSE → DÉCISION. BUY, WATCH ou SKIP d'après les disparitions observées — pas un modèle qui devine." },
      { t: "Recherche live", d: "Cherchez des annonces Vinted en direct. L'intelligence est construite sur 5 marchés UE." },
      { t: "Comparaison de prix", d: "Comparez le même article entre sites Vinted. Achetez là où c'est moins cher." },
      { t: "Bons plans", d: "Annonces déjà sous votre prix d'achat maximum, maintenant." },
      { t: "Plan de commande", d: "Quoi commander pour un stock dans trois semaines, d'après les disparitions observées cette semaine." },
      { t: "Watchlist", d: "Épinglez vos modèles et voyez le prix d'achat, le prix au moment de la disparition et les tailles." },
    ],
    footerTag: "Resale IQ — intelligence marché pour le commerce de seconde main.",
    noAccuracy: "Aucun chiffre d'exactitude avant 30 résultats notés",
    checker: {
      inputAriaLabel: "Article à vérifier",
      checkingAriaLabel: "Vérification en cours",
      checkAriaLabel: "Vérifier gratuitement",
      checking: "Vérification…",
      checkFree: "Vérifier gratuitement",
      placeholderPrefix: "ex.",
      enterBrandModel: "Indiquez une marque et un modèle",
      couldNotCheck: "Impossible de vérifier cet article pour le moment",
      somethingWrong: "Une erreur est survenue",
      timedOutPre:
        "Un problème est survenu de notre côté en terminant cette vérification — elle peut quand même compter dans votre limite gratuite du jour. Si votre compteur semble faux, écrivez à",
      timedOutPost: "et nous corrigerons ça.",
      tryAgain: "Réessayer",
      limitReachedFallback: "Essais gratuits épuisés pour aujourd'hui. Connectez-vous pour continuer.",
      usedOfLimit: (used: number, limit: number) => `${used} sur ${limit} vérifications gratuites utilisées aujourd'hui.`,
      createFreeAccount: "Créer un compte gratuit →",
      seePlans: "Voir les tarifs",
      unknownFallback: "Aucune donnée pour cette recherche. Indiquez une marque et un modèle réel.",
      tryTheseInstead: "Essayez plutôt l'un de ceux-ci",
      insufficientStatement: "Pas assez de départs observés pour chiffrer ceci.",
      insufficientSubtext: "On préfère le dire plutôt que deviner.",
      insufficientNLabel: "observés, pas assez",
      buyBelow: "Prix d'achat max",
      marketPrice: "Prix de marché",
      leftShelf: "Départs (observés)",
      stillListed: "Encore en ligne",
      sellThrough: "Taux d'écoulement",
      planLabel: "Abonnement",
      limitReachedLabel: "LIMITE ATTEINTE",
      confidenceLabel: "Confiance",
      headlineOnly: "Verdict seul — le prix de marché et le prix d'achat max nécessitent un compte.",
      unlockLine: "Débloquez le taux d'écoulement, la demande, les tailles et l'historique avec un abonnement.",
      unlockRest: "Débloquer le reste →",
      seeFullNumbers: "Voir tous les chiffres →",
    },
    pricingSection: {
      heading: "Sachez quoi payer. Ignorez le reste.",
      noCardRequired: "Sans carte bancaire",
      perDay: (amount: string) => `environ €${amount} par jour`,
      mostPopular: "LE PLUS POPULAIRE",
      forever: "à vie",
      perMonth: "/mois",
      whereItStops: "Où ça s'arrête :",
      footer:
        "Chaque abonnement payant débloque tous les chiffres — verdicts, prix d'achat max et tailles. Deal Finder en direct, Order Planner et Price Compare sont réservés à Pro. Marge estimée, pas un profit promis. Résiliable à tout moment depuis Compte → Gérer l'abonnement.",
    },
    tiers: {
      power: {
        tagline: "Il arrête d'attendre que vous demandiez",
        cta: "Laissez-le trouver les bons plans",
        stepUp: "+€30 par rapport à Starter — environ €1 par jour",
        stepUpWhy:
          "Starter vous dit si un article vaut le coup une fois que vous l'avez trouvé. Pro le trouve : à la demande, il cherche sur les cinq marchés UE que nous suivons et vous montre les annonces déjà sous votre prix d'achat max.",
        ceiling: "Besoin de plusieurs sièges, de volume ou d'un périmètre sur mesure ? Contactez-nous.",
        features: [
          "Tout ce qui est dans Starter",
          "Deal Finder en direct — annonces Vinted actuelles sous votre prix d'achat max, à la demande lors de vos recherches",
          "Order Planner de demande à 3 semaines",
          "Taux d'écoulement par taille quand l'échantillon observé le permet",
          "Accès API REST (votre propre clé API)",
          "Price Compare — intelligence complète du prix d'achat max sur ES/FR/DE/IT/PT, plus recherche live des prix affichés sur 26 marchés au total",
        ],
      },
      operator: {
        tagline: "Des réponses sur tout ce que vous cherchez",
        cta: "Obtenir les chiffres",
        features: [
          "Verdicts d'achat/vente illimités",
          "Chaque signal produit que nous calculons, sans flou",
          "Deal Scanner — modèles de l'entrepôt déjà sous le prix d'achat max",
          "Tendances de marché et classements de marques complets",
          "Watchlist et P&L de portefeuille",
          "Calculateur de frais multiplateforme",
        ],
        ceiling: "Pas de Deal Finder en direct, Order Planner, Price Compare ni API — c'est Pro.",
      },
      free: {
        tagline: "Vérifiez que les données sont réelles avant de payer",
        cta: "Créer un compte gratuit",
        features: [
          "7 jours de Starter (verdicts + Deal Scanner), 5 recherches live et 1 plan de commande, puis 10 vérifications complètes / mois. Les visiteurs anonymes ont 10 vérifications/jour.",
          "BUY / WATCH / SKIP à chaque recherche",
          "Tout le manuel de revente et les données de marché",
          "Sans carte bancaire",
        ],
        ceiling: "10 vérifications par mois civil après l'essai. Le Deal Finder live après les 5 recherches d'essai est réservé à Pro.",
      },
    },
    liveProof: {
      heading: "En vente sur Vinted cette semaine",
      perWeek: "/sem",
      avg: "moy.",
      freshnessLastGood: "DERNIÈRE VALIDE",
      freshnessSnapshot: "INSTANTANÉ",
      freshnessRecent: "MIS À JOUR IL Y A <1h",
      freshnessHoursAgo: (h: number) => `MIS À JOUR IL Y A ${h}h`,
      watchedTotal: (total: string) =>
        `Départs observés sur 5 marchés UE — ${total} articles ont quitté le rayon ces 7 derniers jours.`,
      seeHow: "Voir comment on calcule ça →",
      planAddsHeading: "Ce qu'un abonnement ajoute, par modèle",
      planAddsBody:
        "Le maximum à payer pour rester rentable, le prix de sortie réel, la vitesse d'écoulement, et les tailles qui partent en premier — pour l'article précis que vous avez en main, pas pour la marque.",
    },
    extensionHero: {
      listingLabel: "annonce",
      size: "Taille",
      condition: "Très bon état",
      matched: "correspondance :",
      payMargin: "le maximum à payer pour votre marge",
      listedAbove: (price: string) => `affiché à ${price} — au-dessus du prix d'achat max`,
      avgExit: "prix moyen de sortie",
      caption:
        "Exemple du panneau Chrome sur une annonce Adidas Samba — pas un prix en direct. Vérifiez le modèle sur cette page pour voir le chiffre du jour.",
    },
    watchedSample: {
      head: (sold: string, listed: string) =>
        `Sur les annonces observées, ${sold} ont quitté le rayon contre ${listed} encore en ligne`,
      skipSuffix: " — c'est un excédent d'offre dans notre échantillon, pas une affirmation que ce modèle ne se vend jamais.",
    },
  },
  es: {
    signIn: "Entrar",
    pricing: "Precios",
    heroTitle: "Sabe qué pagar antes de comprar.",
    heroBody:
      "Precio de mercado, precio máximo de compra, demanda y precios de referencia comparables al desaparecer el anuncio — luego BUY, WATCH o SKIP. Vinted es el primer marketplace.",
    heroFrom: (tracked: string) =>
      `De ${tracked} anuncios activos, y las desapariciones observadas, en cinco mercados de la UE.`,
    heroHonesty:
      "Alrededor de 4 de cada 10 búsquedas reciben «no hay suficientes datos» — preferimos decirlo antes que adivinar.",
    addToChrome: "Añadir a Chrome",
    checkItem: "Comprobar un artículo",
    orCheck: "Prueba Starter 7 días",
    features: [
      { t: "Decide antes de comprar", d: "DATOS → ANÁLISIS → DECISIÓN. BUY, WATCH o SKIP a partir de desapariciones observadas — no un modelo que adivina." },
      { t: "Búsqueda en vivo", d: "Busca anuncios de Vinted en vivo. La inteligencia se construye sobre 5 mercados de la UE." },
      { t: "Comparar precios", d: "Compara el mismo artículo entre sitios de Vinted. Compra donde sea más barato." },
      { t: "Chollos", d: "Anuncios ya por debajo de tu precio máximo de compra, ahora." },
      { t: "Plan de pedidos", d: "Qué pedir ahora para stock en tres semanas, según las desapariciones observadas esta semana." },
      { t: "Watchlist", d: "Fija modelos y ve el precio de compra, el precio al desaparecer el anuncio y las tallas." },
    ],
    footerTag: "Resale IQ — inteligencia de mercado para el comercio de segunda mano.",
    noAccuracy: "Sin cifras de precisión hasta 30 resultados puntuados",
    checker: {
      inputAriaLabel: "Artículo a comprobar",
      checkingAriaLabel: "Comprobando artículo",
      checkAriaLabel: "Comprobar gratis",
      checking: "Comprobando…",
      checkFree: "Comprobar gratis",
      placeholderPrefix: "ej.",
      enterBrandModel: "Indica una marca y un modelo",
      couldNotCheck: "No se pudo comprobar ese artículo ahora mismo",
      somethingWrong: "Algo salió mal",
      timedOutPre:
        "Algo falló por nuestra parte al terminar esa comprobación — puede que aun así cuente para tu límite gratuito de hoy. Si tu contador no cuadra, escribe a",
      timedOutPost: "y lo arreglaremos.",
      tryAgain: "Intentar de nuevo",
      limitReachedFallback: "Comprobaciones gratis agotadas por hoy. Inicia sesión para continuar.",
      usedOfLimit: (used: number, limit: number) => `${used} de ${limit} comprobaciones gratis usadas hoy.`,
      createFreeAccount: "Crear una cuenta gratis →",
      seePlans: "Ver planes",
      unknownFallback: "No hay datos para esa búsqueda. Indica una marca y un modelo real.",
      tryTheseInstead: "Prueba con uno de estos",
      insufficientStatement: "Aún no hay suficientes salidas observadas para calcular un precio.",
      insufficientSubtext: "Preferimos decirlo antes que adivinar.",
      insufficientNLabel: "observadas, insuficientes",
      buyBelow: "Precio máximo de compra",
      marketPrice: "Precio de mercado",
      leftShelf: "Salidas (observadas)",
      stillListed: "Aún en venta",
      sellThrough: "Tasa de venta",
      planLabel: "Plan",
      limitReachedLabel: "LÍMITE ALCANZADO",
      confidenceLabel: "Confianza",
      headlineOnly: "Solo el veredicto — el precio de mercado y el precio máximo de compra necesitan una cuenta.",
      unlockLine: "Desbloquea la tasa de venta, la demanda, las tallas y el historial con un plan.",
      unlockRest: "Desbloquear el resto →",
      seeFullNumbers: "Ver todos los números →",
    },
    pricingSection: {
      heading: "Sabe qué pagar. Sáltate lo que no debes.",
      noCardRequired: "Sin tarjeta",
      perDay: (amount: string) => `unos €${amount} al día`,
      mostPopular: "MÁS POPULAR",
      forever: "de por vida",
      perMonth: "/mes",
      whereItStops: "Dónde se detiene:",
      footer:
        "Cada plan de pago desbloquea todos los números — veredictos, precio máximo de compra y tallas. Deal Finder en vivo, Order Planner y Price Compare son de Pro. Margen estimado, no un beneficio prometido. Cancela cuando quieras desde Cuenta → Gestionar suscripción.",
    },
    tiers: {
      power: {
        tagline: "Deja de esperar a que preguntes",
        cta: "Deja que encuentre los chollos",
        stepUp: "+€30 sobre Starter — unos €1 al día",
        stepUpWhy:
          "Starter te dice si un artículo merece la pena una vez lo has encontrado. Pro lo encuentra: a demanda, busca en los cinco mercados de la UE que seguimos y te muestra anuncios ya por debajo de tu precio máximo de compra.",
        ceiling: "¿Necesitas varios puestos, volumen o un alcance a medida? Hablemos.",
        features: [
          "Todo lo de Starter",
          "Deal Finder en vivo — anuncios actuales de Vinted por debajo de tu precio máximo de compra, a demanda al buscar",
          "Order Planner de demanda a 3 semanas",
          "Tasa de venta por talla cuando la muestra observada lo permite",
          "Acceso a la API REST (tu propia clave API)",
          "Price Compare — inteligencia completa de precio máximo de compra en ES/FR/DE/IT/PT, además de búsqueda de precios en vivo en 26 mercados en total",
        ],
      },
      operator: {
        tagline: "Respuestas para todo lo que busques",
        cta: "Consigue los números",
        features: [
          "Veredictos de compra/venta ilimitados",
          "Cada señal de producto que calculamos, sin difuminar",
          "Deal Scanner — modelos del almacén ya por debajo del precio máximo de compra",
          "Tendencias de mercado y rankings de marcas completos",
          "Watchlist y P&L de cartera",
          "Calculadora de comisiones multiplataforma",
        ],
        ceiling: "Sin Deal Finder en vivo, Order Planner, Price Compare ni API — eso es Pro.",
      },
      free: {
        tagline: "Comprueba que los datos son reales antes de pagar",
        cta: "Crear una cuenta gratis",
        features: [
          "7 días de Starter (veredictos + Deal Scanner), 5 búsquedas en vivo y 1 plan de pedido, luego 10 comprobaciones completas / mes. Los visitantes anónimos tienen 10 comprobaciones/día.",
          "BUY / WATCH / SKIP en cada búsqueda",
          "Todo el manual de reventa y los datos de mercado",
          "Sin tarjeta",
        ],
        ceiling: "10 comprobaciones cada mes natural tras la prueba. El Deal Finder en vivo tras las 5 búsquedas de prueba es de Pro.",
      },
    },
    liveProof: {
      heading: "A la venta en Vinted esta semana",
      perWeek: "/sem",
      avg: "media",
      freshnessLastGood: "ÚLTIMO VÁLIDO",
      freshnessSnapshot: "INSTANTÁNEA",
      freshnessRecent: "ACTUALIZADO HACE <1h",
      freshnessHoursAgo: (h: number) => `ACTUALIZADO HACE ${h}h`,
      watchedTotal: (total: string) =>
        `Salidas observadas en 5 mercados de la UE — ${total} artículos salieron del catálogo en los últimos 7 días.`,
      seeHow: "Ver cómo lo calculamos →",
      planAddsHeading: "Lo que añade un plan, por modelo",
      planAddsBody:
        "El máximo que puedes pagar y seguir ganando margen, el precio real de salida, la velocidad de rotación, y qué tallas se agotan antes — para el artículo concreto que tienes en la mano, no para la marca.",
    },
    extensionHero: {
      listingLabel: "anuncio",
      size: "Talla",
      condition: "Muy bueno",
      matched: "coincide con:",
      payMargin: "el máximo que puedes pagar para tu margen",
      listedAbove: (price: string) => `publicado a ${price} — por encima del precio máximo de compra`,
      avgExit: "precio medio de salida",
      caption:
        "Ejemplo del panel de Chrome en un anuncio de Adidas Samba — no es un precio en vivo. Comprueba el modelo en esta página para ver el número de hoy.",
    },
    watchedSample: {
      head: (sold: string, listed: string) =>
        `En los anuncios que observamos, ${sold} salieron del catálogo frente a ${listed} que siguen en venta`,
      skipSuffix: " — eso es un exceso de oferta en nuestra muestra, no una afirmación de que este modelo nunca se vende.",
    },
  },
  de: {
    signIn: "Anmelden",
    pricing: "Preise",
    heroTitle: "Wissen, was du zahlen solltest, bevor du kaufst.",
    heroBody:
      "Marktpreis, Kaufobergrenze, Nachfrage und vergleichbare Angebotspreise beim Abgang — dann BUY, WATCH oder SKIP. Vinted ist der erste Marktplatz, den wir abdecken.",
    heroFrom: (tracked: string) =>
      `Basierend auf ${tracked} aktiven Angeboten und beobachteten Abgängen in fünf EU-Märkten.`,
    heroHonesty:
      "Etwa 4 von 10 Anfragen enden mit „nicht genug Daten“ — das sagen wir lieber, als zu raten.",
    addToChrome: "Zu Chrome hinzufügen",
    checkItem: "Artikel prüfen",
    orCheck: "7-tägige Starter-Testphase starten",
    features: [
      { t: "Entscheiden, bevor du kaufst", d: "DATEN → ANALYSE → ENTSCHEIDUNG. BUY, WATCH oder SKIP auf Basis beobachteter Abgänge — kein Modell, das rät." },
      { t: "Live-Suche", d: "Durchsuche aktive Vinted-Angebote über Länderseiten hinweg. Die Analyse basiert auf 5 EU-Märkten." },
      { t: "Preisvergleich", d: "Vergleiche Angebotspreise für dasselbe Produkt über Vinted-Länderseiten hinweg. Kaufe, wo es günstiger ist." },
      { t: "Deal Finder", d: "Angebote, die jetzt schon unter deiner Kaufobergrenze liegen." },
      { t: "Order Planner", d: "Was du jetzt bestellen solltest für Ware in drei Wochen — berechnet aus den beobachteten Abgängen dieser Woche." },
      { t: "Watchlist", d: "Merke dir Modelle und sieh Kaufobergrenze, Abgangspreis und Größen, ohne erneut zu suchen." },
    ],
    footerTag: "Resale IQ — Marktanalyse für den Wiederverkauf aus zweiter Hand.",
    noAccuracy: "Keine Genauigkeitsangaben vor 30 ausgewerteten Ergebnissen",
    checker: {
      inputAriaLabel: "Artikel zum Prüfen",
      checkingAriaLabel: "Artikel wird geprüft",
      checkAriaLabel: "Kostenlos prüfen",
      checking: "Prüfe…",
      checkFree: "Kostenlos prüfen",
      placeholderPrefix: "z. B.",
      enterBrandModel: "Marke und Modell eingeben",
      couldNotCheck: "Dieser Artikel konnte gerade nicht geprüft werden",
      somethingWrong: "Etwas ist schiefgelaufen",
      timedOutPre:
        "Bei uns ist beim Abschluss dieser Prüfung etwas schiefgelaufen — sie kann trotzdem auf dein heutiges kostenloses Limit angerechnet worden sein. Falls deine Anzahl falsch aussieht, schreib an",
      timedOutPost: "und wir kümmern uns darum.",
      tryAgain: "Erneut versuchen",
      limitReachedFallback: "Kostenlose Prüfungen für heute aufgebraucht. Melde dich an, um weiterzumachen.",
      usedOfLimit: (used: number, limit: number) => `${used} von ${limit} kostenlosen Prüfungen heute genutzt.`,
      createFreeAccount: "Kostenloses Konto erstellen →",
      seePlans: "Preise ansehen",
      unknownFallback: "Keine Daten für diese Suche. Gib eine Marke und ein echtes Modell ein.",
      tryTheseInstead: "Probier stattdessen eines davon",
      insufficientStatement: "Noch nicht genug beobachtete Abgänge für einen Preis.",
      insufficientSubtext: "Das sagen wir lieber, als zu raten.",
      insufficientNLabel: "beobachtet, nicht genug",
      buyBelow: "Kaufobergrenze",
      marketPrice: "Marktpreis",
      leftShelf: "Abgänge (beobachtet)",
      stillListed: "Noch inseriert",
      sellThrough: "Verkaufsrate",
      planLabel: "Tarif",
      limitReachedLabel: "LIMIT ERREICHT",
      confidenceLabel: "Konfidenz",
      headlineOnly: "Nur die Kurzentscheidung — Marktpreis und Kaufobergrenze brauchen ein Konto.",
      unlockLine: "Schalte Verkaufsrate, Nachfrage, Größen und Verlauf mit einem Tarif frei.",
      unlockRest: "Rest freischalten →",
      seeFullNumbers: "Alle Zahlen ansehen →",
    },
    pricingSection: {
      heading: "Wissen, was du zahlen solltest. Lass aus, was sich nicht lohnt.",
      noCardRequired: "Keine Kreditkarte nötig",
      perDay: (amount: string) => `etwa €${amount} am Tag`,
      mostPopular: "AM BELIEBTESTEN",
      forever: "dauerhaft",
      perMonth: "/Monat",
      whereItStops: "Wo es endet:",
      footer:
        "Jeder kostenpflichtige Tarif schaltet alle Zahlen frei — Entscheidungen, Kaufobergrenze und Größen. Live Deal Finder, Order Planner und Price Compare sind Pro. Geschätzte Marge, kein versprochener Gewinn. Jederzeit kündbar über Konto → Abo verwalten.",
    },
    tiers: {
      power: {
        tagline: "Es wartet nicht mehr darauf, dass du fragst",
        cta: "Lass es die Deals finden",
        stepUp: "+€30 gegenüber Starter — etwa €1 am Tag",
        stepUpWhy:
          "Starter sagt dir, ob sich ein Artikel lohnt, sobald du ihn gefunden hast. Pro findet ihn: auf Abruf durchsucht es die fünf EU-Märkte, die wir erfassen, und zeigt dir Angebote, die schon unter deiner Kaufobergrenze liegen.",
        ceiling: "Mehrere Plätze, größeres Volumen oder ein individueller Umfang nötig? Lass uns reden.",
        features: [
          "Alles aus Starter",
          "Live Deal Finder — aktuelle Vinted-Angebote unter deiner Kaufobergrenze, auf Abruf bei der Suche",
          "3-Wochen-Nachfrage-Order-Planner",
          "Verkaufsrate pro Größe, wenn die beobachtete Stichprobe es hergibt",
          "REST-API-Zugang (eigener API-Schlüssel)",
          "Price Compare — vollständige Kaufobergrenzen-Analyse auf ES/FR/DE/IT/PT, plus Live-Preissuche über 26 Märkte insgesamt",
        ],
      },
      operator: {
        tagline: "Antworten auf alles, was du nachschlägst",
        cta: "Zahlen holen",
        features: [
          "Unbegrenzte Kauf-/Verkaufsentscheidungen",
          "Jedes berechnete Produktsignal, ohne Unschärfe",
          "Deal Scanner — Warehouse-Modelle bereits unter der Kaufobergrenze",
          "Vollständige Markttrends & Markenrankings",
          "Watchlist & Portfolio-P&L",
          "Plattformübergreifender Gebührenrechner",
        ],
        ceiling: "Kein Live Deal Finder, Order Planner, Price Compare oder API — das ist Pro.",
      },
      free: {
        tagline: "Sieh, dass die Daten echt sind, bevor du zahlst",
        cta: "Kostenloses Konto erstellen",
        features: [
          "7 Tage Starter (Entscheidungen + Deal Scanner), 5 Live-Suchen und 1 Bestellplan, danach 10 volle Prüfungen / Monat. Anonyme Besucher erhalten 10 Prüfungen/Tag.",
          "BUY / WATCH / SKIP bei jeder Suche",
          "Das gesamte Wiederverkaufs-Handbuch und Marktdaten",
          "Keine Kreditkarte nötig",
        ],
        ceiling: "10 Prüfungen pro Kalendermonat nach der Testphase. Live Finder nach den 5 Testsuchen ist Pro.",
      },
    },
    liveProof: {
      heading: "Diese Woche auf Vinted im Angebot",
      perWeek: "/Wo",
      avg: "Ø",
      freshnessLastGood: "LETZTER GÜLTIGER STAND",
      freshnessSnapshot: "MOMENTAUFNAHME",
      freshnessRecent: "AKTUALISIERT VOR <1h",
      freshnessHoursAgo: (h: number) => `AKTUALISIERT VOR ${h}h`,
      watchedTotal: (total: string) =>
        `Beobachtete Abgänge in 5 EU-Märkten — ${total} Artikel sind in den letzten 7 Tagen aus dem Bestand gegangen.`,
      seeHow: "So berechnen wir das →",
      planAddsHeading: "Was ein Tarif zusätzlich bringt, pro Modell",
      planAddsBody:
        "Die Kaufobergrenze, bei der du noch Marge machst, der tatsächliche Abgangspreis, wie schnell es sich bewegt, und welche Größen zuerst weggehen — für genau den Artikel in deiner Hand, nicht für die Marke.",
    },
    extensionHero: {
      listingLabel: "Angebot",
      size: "Größe",
      condition: "Sehr gut",
      matched: "gefunden:",
      payMargin: "das Maximum, das du für deine Marge zahlen solltest",
      listedAbove: (price: string) => `inseriert für ${price} — über der Kaufobergrenze`,
      avgExit: "Ø Abgangspreis",
      caption:
        "Beispiel des Chrome-Panels bei einem Adidas-Samba-Angebot — kein Live-Preis. Prüfe das Modell auf dieser Seite für die heutige Zahl.",
    },
    watchedSample: {
      head: (sold: string, listed: string) =>
        `In den von uns beobachteten Angeboten sind ${sold} aus dem Bestand gegangen, ${listed} sind noch inseriert`,
      skipSuffix: " — das ist ein Angebotsüberschuss in unserer Stichprobe, keine Aussage, dass dieses Modell nie läuft.",
    },
  },
  it: {
    signIn: "Accedi",
    pricing: "Prezzi",
    heroTitle: "Sappi quanto pagare prima di comprare.",
    heroBody:
      "Prezzo di mercato, prezzo massimo di acquisto, domanda e prezzi comparabili al momento dell'uscita — poi BUY, WATCH o SKIP. Vinted è il primo marketplace che copriamo.",
    heroFrom: (tracked: string) =>
      `Basato su ${tracked} annunci attivi e uscite osservate in cinque mercati UE.`,
    heroHonesty:
      "Circa 4 ricerche su 10 restituiscono «dati insufficienti» — preferiamo dirlo piuttosto che indovinare.",
    addToChrome: "Aggiungi a Chrome",
    checkItem: "Controlla un articolo",
    orCheck: "Inizia la prova Starter di 7 giorni",
    features: [
      { t: "Decidi prima di comprare", d: "DATI → ANALISI → DECISIONE. BUY, WATCH o SKIP in base alle uscite osservate — non un modello che indovina." },
      { t: "Ricerca live", d: "Cerca annunci Vinted attivi tra i siti nazionali. L'analisi si basa su 5 mercati UE." },
      { t: "Confronto prezzi", d: "Confronta i prezzi dello stesso articolo tra i siti Vinted. Compra dove costa meno." },
      { t: "Deal Finder", d: "Annunci già sotto il tuo prezzo massimo di acquisto, in questo momento." },
      { t: "Order Planner", d: "Cosa ordinare ora per la merce tra tre settimane, calcolato sulle uscite osservate di questa settimana." },
      { t: "Watchlist", d: "Salva i modelli che cerchi e vedi prezzo massimo di acquisto, prezzo di uscita e taglie senza rifare la ricerca." },
    ],
    footerTag: "Resale IQ — intelligence di mercato per il commercio dell'usato.",
    noAccuracy: "Nessun dato di accuratezza finché non si raggiungono 30 esiti verificati",
    checker: {
      inputAriaLabel: "Articolo da controllare",
      checkingAriaLabel: "Controllo dell'articolo",
      checkAriaLabel: "Controlla gratis",
      checking: "Controllo…",
      checkFree: "Controlla gratis",
      placeholderPrefix: "es.",
      enterBrandModel: "Inserisci un marchio e un modello",
      couldNotCheck: "Impossibile controllare questo articolo in questo momento",
      somethingWrong: "Qualcosa è andato storto",
      timedOutPre:
        "Da parte nostra qualcosa è andato storto nel completare questo controllo — potrebbe comunque contare nel tuo limite gratuito di oggi. Se il conteggio non torna, scrivi a",
      timedOutPost: "e lo sistemeremo.",
      tryAgain: "Riprova",
      limitReachedFallback: "Controlli gratuiti esauriti per oggi. Accedi per continuare.",
      usedOfLimit: (used: number, limit: number) => `${used} di ${limit} controlli gratuiti usati oggi.`,
      createFreeAccount: "Crea un account gratuito →",
      seePlans: "Vedi i piani",
      unknownFallback: "Nessun dato per questa ricerca. Inserisci un marchio e un modello reale.",
      tryTheseInstead: "Prova uno di questi",
      insufficientStatement: "Non ci sono ancora abbastanza partenze osservate per calcolare un prezzo.",
      insufficientSubtext: "Preferiamo dirlo piuttosto che indovinare.",
      insufficientNLabel: "osservate, non abbastanza",
      buyBelow: "Prezzo massimo di acquisto",
      marketPrice: "Prezzo di mercato",
      leftShelf: "Uscite (osservate)",
      stillListed: "Ancora in vendita",
      sellThrough: "Tasso di vendita",
      planLabel: "Piano",
      limitReachedLabel: "LIMITE RAGGIUNTO",
      confidenceLabel: "Affidabilità",
      headlineOnly: "Solo il verdetto — prezzo di mercato e prezzo massimo di acquisto richiedono un account.",
      unlockLine: "Sblocca tasso di vendita, domanda, taglie e storico con un piano.",
      unlockRest: "Sblocca il resto →",
      seeFullNumbers: "Vedi tutti i numeri →",
    },
    pricingSection: {
      heading: "Sappi quanto pagare. Salta il resto.",
      noCardRequired: "Nessuna carta richiesta",
      perDay: (amount: string) => `circa €${amount} al giorno`,
      mostPopular: "IL PIÙ POPOLARE",
      forever: "per sempre",
      perMonth: "/mese",
      whereItStops: "Dove si ferma:",
      footer:
        "Ogni piano a pagamento sblocca tutti i numeri — verdetti, prezzo massimo di acquisto e taglie. Deal Finder live, Order Planner e Price Compare sono Pro. Margine stimato, non un profitto promesso. Cancella quando vuoi da Account → Gestisci abbonamento.",
    },
    tiers: {
      power: {
        tagline: "Smette di aspettare che tu chieda",
        cta: "Lascia che trovi gli affari",
        stepUp: "+€30 rispetto a Starter — circa €1 al giorno",
        stepUpWhy:
          "Starter ti dice se un articolo vale l'acquisto, una volta che l'hai trovato. Pro lo trova: su richiesta, cerca nei cinque mercati UE che monitoriamo e ti mostra annunci già sotto il tuo prezzo massimo di acquisto.",
        ceiling: "Servono più posti, volume o un ambito su misura? Parliamone.",
        features: [
          "Tutto quello che c'è in Starter",
          "Deal Finder live — annunci Vinted attuali sotto il tuo prezzo massimo di acquisto, su richiesta durante la ricerca",
          "Order Planner della domanda a 3 settimane",
          "Tasso di vendita per taglia quando il campione osservato lo consente",
          "Accesso API REST (la tua chiave API)",
          "Price Compare — intelligence completa del prezzo massimo di acquisto su ES/FR/DE/IT/PT, più ricerca live dei prezzi su 26 mercati in totale",
        ],
      },
      operator: {
        tagline: "Risposte su tutto quello che cerchi",
        cta: "Ottieni i numeri",
        features: [
          "Verdetti di acquisto/vendita illimitati",
          "Ogni segnale di prodotto che calcoliamo, senza sfocature",
          "Deal Scanner — modelli del magazzino già sotto il prezzo massimo di acquisto",
          "Trend di mercato e classifiche dei marchi completi",
          "Watchlist e P&L del portafoglio",
          "Calcolatore commissioni multipiattaforma",
        ],
        ceiling: "Niente Deal Finder live, Order Planner, Price Compare o API — quello è Pro.",
      },
      free: {
        tagline: "Verifica che i dati siano reali prima di pagare",
        cta: "Crea un account gratuito",
        features: [
          "7 giorni di Starter (verdetti + Deal Scanner), 5 ricerche live e 1 piano d'ordine, poi 10 controlli completi / mese. I visitatori anonimi hanno 10 controlli/giorno.",
          "BUY / WATCH / SKIP a ogni ricerca",
          "Tutto il manuale di rivendita e i dati di mercato",
          "Nessuna carta richiesta",
        ],
        ceiling: "10 controlli per ogni mese solare dopo la prova. Il Live Finder dopo le 5 ricerche di prova è Pro.",
      },
    },
    liveProof: {
      heading: "In vendita su Vinted questa settimana",
      perWeek: "/sett",
      avg: "media",
      freshnessLastGood: "ULTIMO VALIDO",
      freshnessSnapshot: "ISTANTANEA",
      freshnessRecent: "AGGIORNATO <1h FA",
      freshnessHoursAgo: (h: number) => `AGGIORNATO ${h}h FA`,
      watchedTotal: (total: string) =>
        `Uscite osservate in 5 mercati UE — ${total} articoli sono usciti dallo scaffale negli ultimi 7 giorni.`,
      seeHow: "Guarda come lo calcoliamo →",
      planAddsHeading: "Cosa aggiunge un piano, per modello",
      planAddsBody:
        "Il massimo che puoi pagare restando in margine, il prezzo di uscita reale, la velocità di rotazione, e quali taglie finiscono per prime — per l'articolo specifico che hai in mano, non per il marchio.",
    },
    extensionHero: {
      listingLabel: "annuncio",
      size: "Taglia",
      condition: "Molto buono",
      matched: "corrispondenza:",
      payMargin: "il massimo che puoi pagare per il tuo margine",
      listedAbove: (price: string) => `in vendita a ${price} — sopra il prezzo massimo di acquisto`,
      avgExit: "prezzo medio di uscita",
      caption:
        "Esempio del pannello Chrome su un annuncio Adidas Samba — non è un prezzo live. Controlla il modello su questa pagina per il numero di oggi.",
    },
    watchedSample: {
      head: (sold: string, listed: string) =>
        `Negli annunci osservati, ${sold} sono usciti dallo scaffale contro ${listed} ancora in vendita`,
      skipSuffix: " — è un eccesso di offerta nel nostro campione, non un'affermazione che questo modello non si muove mai.",
    },
  },
  pt: {
    signIn: "Entrar",
    pricing: "Preços",
    heroTitle: "Saiba quanto pagar antes de comprar.",
    heroBody:
      "Preço de mercado, preço máximo de compra, procura e preços de referência comparáveis no momento da saída — depois BUY, WATCH ou SKIP. A Vinted é o primeiro marketplace que cobrimos.",
    heroFrom: (tracked: string) =>
      `A partir de ${tracked} anúncios ativos e saídas observadas em cinco mercados da UE.`,
    heroHonesty:
      "Cerca de 4 em cada 10 pesquisas voltam com «dados insuficientes» — preferimos dizer isso a adivinhar.",
    addToChrome: "Adicionar ao Chrome",
    checkItem: "Verificar um artigo",
    orCheck: "Iniciar o período experimental Starter de 7 dias",
    features: [
      { t: "Decida antes de comprar", d: "DADOS → ANÁLISE → DECISÃO. BUY, WATCH ou SKIP com base em saídas observadas — não um modelo a adivinhar." },
      { t: "Pesquisa em direto", d: "Pesquise anúncios ativos da Vinted entre sites de vários países. A análise assenta em 5 mercados da UE." },
      { t: "Comparar preços", d: "Compare os preços do mesmo artigo entre sites da Vinted. Compre onde for mais barato." },
      { t: "Deal Finder", d: "Anúncios já abaixo do seu preço máximo de compra, agora mesmo." },
      { t: "Order Planner", d: "O que encomendar agora para stock daqui a três semanas, calculado a partir das saídas observadas desta semana." },
      { t: "Watchlist", d: "Marque os modelos que procura e veja o preço máximo de compra, o preço de saída e os tamanhos sem repetir a pesquisa." },
    ],
    footerTag: "Resale IQ — inteligência de mercado para o comércio em segunda mão.",
    noAccuracy: "Sem dados de precisão até 30 resultados avaliados",
    checker: {
      inputAriaLabel: "Artigo a verificar",
      checkingAriaLabel: "A verificar artigo",
      checkAriaLabel: "Verificar grátis",
      checking: "A verificar…",
      checkFree: "Verificar grátis",
      placeholderPrefix: "ex.",
      enterBrandModel: "Indica uma marca e um modelo",
      couldNotCheck: "Não foi possível verificar este artigo agora",
      somethingWrong: "Algo correu mal",
      timedOutPre:
        "Algo correu mal do nosso lado ao terminar esta verificação — pode ainda contar para o teu limite grátis de hoje. Se a tua contagem parecer errada, escreve para",
      timedOutPost: "e nós corrigimos.",
      tryAgain: "Tentar novamente",
      limitReachedFallback: "Verificações grátis esgotadas por hoje. Entra para continuar.",
      usedOfLimit: (used: number, limit: number) => `${used} de ${limit} verificações grátis usadas hoje.`,
      createFreeAccount: "Criar uma conta grátis →",
      seePlans: "Ver planos",
      unknownFallback: "Sem dados para esta pesquisa. Indica uma marca e um modelo real.",
      tryTheseInstead: "Experimenta um destes",
      insufficientStatement: "Ainda não há saídas observadas suficientes para calcular um preço.",
      insufficientSubtext: "Preferimos dizer isso a adivinhar.",
      insufficientNLabel: "observadas, insuficientes",
      buyBelow: "Preço máximo de compra",
      marketPrice: "Preço de mercado",
      leftShelf: "Saídas (observadas)",
      stillListed: "Ainda anunciado",
      sellThrough: "Taxa de venda",
      planLabel: "Plano",
      limitReachedLabel: "LIMITE ATINGIDO",
      confidenceLabel: "Confiança",
      headlineOnly: "Apenas o veredito — preço de mercado e preço máximo de compra precisam de uma conta.",
      unlockLine: "Desbloqueia taxa de venda, procura, tamanhos e histórico com um plano.",
      unlockRest: "Desbloquear o resto →",
      seeFullNumbers: "Ver todos os números →",
    },
    pricingSection: {
      heading: "Saiba quanto pagar. Ignore o resto.",
      noCardRequired: "Sem cartão necessário",
      perDay: (amount: string) => `cerca de €${amount} por dia`,
      mostPopular: "MAIS POPULAR",
      forever: "para sempre",
      perMonth: "/mês",
      whereItStops: "Onde para:",
      footer:
        "Cada plano pago desbloqueia todos os números — veredictos, preço máximo de compra e tamanhos. Live Deal Finder, Order Planner e Price Compare são Pro. Margem estimada, não um lucro prometido. Cancela quando quiseres em Conta → Gerir subscrição.",
    },
    tiers: {
      power: {
        tagline: "Deixa de esperar que perguntes",
        cta: "Deixa-o encontrar as ofertas",
        stepUp: "+€30 acima do Starter — cerca de €1 por dia",
        stepUpWhy:
          "O Starter diz-te se um artigo vale a pena depois de o encontrares. O Pro encontra-o: a pedido, pesquisa nos cinco mercados da UE que monitorizamos e mostra-te anúncios já abaixo do teu preço máximo de compra.",
        ceiling: "Precisas de mais lugares, volume ou um âmbito personalizado? Vamos conversar.",
        features: [
          "Tudo o que está no Starter",
          "Live Deal Finder — anúncios atuais da Vinted abaixo do teu preço máximo de compra, a pedido ao pesquisares",
          "Order Planner de procura a 3 semanas",
          "Taxa de venda por tamanho quando a amostra observada o permite",
          "Acesso à API REST (a tua própria chave API)",
          "Price Compare — inteligência completa de preço máximo de compra em ES/FR/DE/IT/PT, mais pesquisa de preços em direto em 26 mercados no total",
        ],
      },
      operator: {
        tagline: "Respostas para tudo o que procurares",
        cta: "Obter os números",
        features: [
          "Veredictos de compra/venda ilimitados",
          "Todos os sinais de produto que calculamos, sem desfoque",
          "Deal Scanner — modelos do armazém já abaixo do preço máximo de compra",
          "Tendências de mercado e rankings de marcas completos",
          "Watchlist e P&L de carteira",
          "Calculadora de taxas multiplataforma",
        ],
        ceiling: "Sem Live Deal Finder, Order Planner, Price Compare ou API — isso é Pro.",
      },
      free: {
        tagline: "Vê que os dados são reais antes de pagares",
        cta: "Criar uma conta grátis",
        features: [
          "7 dias de Starter (veredictos + Deal Scanner), 5 pesquisas em direto e 1 plano de encomenda, depois 10 verificações completas / mês. Visitantes anónimos têm 10 verificações/dia.",
          "BUY / WATCH / SKIP em cada pesquisa",
          "Todo o manual de revenda e os dados de mercado",
          "Sem cartão necessário",
        ],
        ceiling: "10 verificações por mês de calendário após o período experimental. O Live Finder depois das 5 pesquisas de teste é Pro.",
      },
    },
    liveProof: {
      heading: "À venda na Vinted esta semana",
      perWeek: "/sem",
      avg: "média",
      freshnessLastGood: "ÚLTIMO VÁLIDO",
      freshnessSnapshot: "INSTANTÂNEO",
      freshnessRecent: "ATUALIZADO HÁ <1h",
      freshnessHoursAgo: (h: number) => `ATUALIZADO HÁ ${h}h`,
      watchedTotal: (total: string) =>
        `Saídas observadas em 5 mercados da UE — ${total} artigos saíram da prateleira nos últimos 7 dias.`,
      seeHow: "Vê como calculamos isto →",
      planAddsHeading: "O que um plano acrescenta, por modelo",
      planAddsBody:
        "O máximo que podes pagar mantendo margem, o preço real de saída, a velocidade de rotação, e que tamanhos esgotam primeiro — para o artigo concreto que tens em mãos, não para a marca.",
    },
    extensionHero: {
      listingLabel: "anúncio",
      size: "Tamanho",
      condition: "Muito bom",
      matched: "correspondência:",
      payMargin: "o máximo que podes pagar para a tua margem",
      listedAbove: (price: string) => `anunciado a ${price} — acima do preço máximo de compra`,
      avgExit: "preço médio de saída",
      caption:
        "Exemplo do painel Chrome num anúncio Adidas Samba — não é uma cotação em direto. Verifica o modelo nesta página para veres o número de hoje.",
    },
    watchedSample: {
      head: (sold: string, listed: string) =>
        `Nos anúncios que observámos, ${sold} saíram da prateleira contra ${listed} ainda anunciados`,
      skipSuffix: " — isso é um excesso de oferta na nossa amostra, não uma afirmação de que este modelo nunca vende.",
    },
  },
} as const
