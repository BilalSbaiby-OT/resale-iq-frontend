/**
 * Smallest i18n that works: marketing + extension panel.
 * vinted.fr → French, vinted.es → Spanish, otherwise English.
 * No i18n framework — dictionaries + Accept-Language / hostname.
 */
export type Locale = "en" | "fr" | "es"

export function detectLocale(acceptLanguage: string | null | undefined): Locale {
  const parts = (acceptLanguage || "")
    .split(",")
    .map(s => s.trim().split(";")[0].toLowerCase())
  for (const p of parts) {
    if (p.startsWith("fr")) return "fr"
    if (p.startsWith("es")) return "es"
  }
  return "en"
}

export const copy = {
  en: {
    signIn: "Sign in",
    pricing: "Pricing",
    heroTitle: "Know what to pay before you buy.",
    heroBody:
      "Market price, buy-below, demand and comparable sold listings — then BUY, WATCH or SKIP. Vinted is the first marketplace it covers.",
    heroFrom: (tracked: string) =>
      `From ${tracked} live and sold listings across five EU markets.`,
    addToChrome: "Add to Chrome",
    checkItem: "Check an item",
    orCheck: "Start 7-day Starter trial",
    features: [
      { t: "Decide before you buy", d: "DATA → ANALYSIS → DECISION. BUY, WATCH or SKIP from watched sold listings — not a model guessing." },
      { t: "Live search", d: "Search live Vinted listings across country sites. Intelligence is built on 5 EU markets." },
      { t: "Price compare", d: "Compare asking prices for the same item across Vinted country sites. Buy where it is cheaper." },
      { t: "Deal finder", d: "Listings priced under your buy-below threshold, right now." },
      { t: "Order planner", d: "What to order now for stock landing in three weeks, priced off this week's sales." },
      { t: "Watchlist", d: "Pin models you source and get the buy-below, sale price and sizes without re-searching." },
    ],
    footerTag: "Resale IQ — market intelligence for second-hand commerce.",
    noAccuracy: "No accuracy claims until 30 outcomes scored",
  },
  fr: {
    signIn: "Connexion",
    pricing: "Tarifs",
    heroTitle: "Sachez quoi payer avant d'acheter.",
    heroBody:
      "Prix de marché, prix d'achat max, demande et ventes comparables — puis BUY, WATCH ou SKIP. Vinted d'abord.",
    heroFrom: (tracked: string) =>
      `À partir de ${tracked} annonces en ligne et vendues sur cinq marchés UE.`,
    addToChrome: "Ajouter à Chrome",
    checkItem: "Vérifier un article",
    orCheck: "Essai Starter 7 jours",
    features: [
      { t: "Décider avant d'acheter", d: "DONNÉES → ANALYSE → DÉCISION. BUY, WATCH ou SKIP d'après les ventes observées — pas un modèle qui devine." },
      { t: "Recherche live", d: "Cherchez des annonces Vinted en direct. L'intelligence est construite sur 5 marchés UE." },
      { t: "Comparaison de prix", d: "Comparez le même article entre sites Vinted. Achetez là où c'est moins cher." },
      { t: "Bons plans", d: "Annonces déjà sous votre prix d'achat maximum, maintenant." },
      { t: "Plan de commande", d: "Quoi commander pour un stock dans trois semaines, d'après les ventes de la semaine." },
      { t: "Watchlist", d: "Épinglez vos modèles et voyez le prix d'achat, le prix de vente et les tailles." },
    ],
    footerTag: "Resale IQ — intelligence marché pour le commerce de seconde main.",
    noAccuracy: "Aucun chiffre d'exactitude avant 30 résultats notés",
  },
  es: {
    signIn: "Entrar",
    pricing: "Precios",
    heroTitle: "Sabe qué pagar antes de comprar.",
    heroBody:
      "Precio de mercado, precio máximo de compra, demanda y ventas comparables — luego BUY, WATCH o SKIP. Vinted es el primer marketplace.",
    heroFrom: (tracked: string) =>
      `De ${tracked} anuncios activos y vendidos en cinco mercados de la UE.`,
    addToChrome: "Añadir a Chrome",
    checkItem: "Comprobar un artículo",
    orCheck: "Prueba Starter 7 días",
    features: [
      { t: "Decide antes de comprar", d: "DATOS → ANÁLISIS → DECISIÓN. BUY, WATCH o SKIP a partir de ventas observadas — no un modelo que adivina." },
      { t: "Búsqueda en vivo", d: "Busca anuncios de Vinted en vivo. La inteligencia se construye sobre 5 mercados de la UE." },
      { t: "Comparar precios", d: "Compara el mismo artículo entre sitios de Vinted. Compra donde sea más barato." },
      { t: "Chollos", d: "Anuncios ya por debajo de tu precio máximo de compra, ahora." },
      { t: "Plan de pedidos", d: "Qué pedir ahora para stock en tres semanas, según las ventas de esta semana." },
      { t: "Watchlist", d: "Fija modelos y ve el precio de compra, el de venta y las tallas." },
    ],
    footerTag: "Resale IQ — inteligencia de mercado para el comercio de segunda mano.",
    noAccuracy: "Sin cifras de precisión hasta 30 resultados puntuados",
  },
} as const
