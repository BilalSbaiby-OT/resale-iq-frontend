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
  },
} as const
