import type { Locale } from "./i18n"

/**
 * Logged-in checker (/verdict) — the first screen after Apple UX v1.
 * Nav already reads nav-copy.ts; this file is the page body. BUY/WATCH/SKIP
 * stay English product terms, same as i18n.ts.
 */
export type VerdictCopy = {
  heading: string
  placeholder: string
  check: string
  checking: string
  errorGeneric: string
  unlockError: string
  decision: string
  confidence: string
  provisional: string
  limitReachedBody: string
  usedOfLimit: (used: number, limit: number) => string
  seePlans: string
  unknownBody: string
  headlineCall: (product: string) => string
  why: string
  buyBelow: string
  avgAtExit: string
  leftShelf: string
  listedNow: string
  sellThrough: string
  targetNet: string
  opportunity: string
  demand: string
  hotSizes: string
  empty: string
  noData: string
  notMeasured: string
  limitReached: string
  marketData: string
  brandAverage: string
  leftShelfCount: (n: string) => string
  tryNext: (q: string) => string
  avg: string
  tryTheseInstead: string
  /* The first screen a verified account lands on. Measured 2026-09-06:
     5 of 7 genuine registered users had never run a single check, and this
     page greeted every one of them with an empty box. These two strings label
     the worked example that now sits under the box — see verdict-content.tsx
     for why it is an example and not a check run on the visitor's behalf. */
  seedLabel: string
  seedIntro: (product: string) => string
}

export const verdictCopy: Record<Locale, VerdictCopy> = {
  en: {
    heading: "What should you pay?",
    placeholder: "e.g. Adidas Samba, Nike Air Force 1, New Balance 530",
    check: "Check",
    checking: "Looking up watched departures…",
    errorGeneric: "We couldn't find enough comparable departures to finish that check. Try again, or a more specific model name.",
    unlockError: "Couldn't unlock that one. Try again.",
    decision: "Decision",
    confidence: "Confidence",
    provisional: "provisional",
    limitReachedBody: "Free tier: 10 verdicts/day. Starter or Pro for unlimited.",
    usedOfLimit: (used, limit) => `${used} of ${limit} verdicts used today.`,
    seePlans: "See plans →",
    unknownBody: "Not enough market data on this product yet. Try a more common brand + model.",
    headlineCall: (product) => `This is the headline call on ${product}, computed from watched departures across 5 EU markets.`,
    why: "Why",
    buyBelow: "Buy below",
    avgAtExit: "Avg at exit",
    leftShelf: "Left shelf / 7d",
    listedNow: "Listed now",
    sellThrough: "Sell-through",
    targetNet: "Target net",
    opportunity: "Opportunity",
    demand: "Demand",
    hotSizes: "Hot sizes",
    empty: "Enter a brand and model. You get BUY, WATCH or SKIP plus the reason — from watched departures, not a model guessing.",
    noData: "NO DATA",
    notMeasured: "NOT MEASURED",
    limitReached: "LIMIT REACHED",
    marketData: "MARKET DATA",
    brandAverage: "BRAND AVERAGE",
    leftShelfCount: (n) => `${n} left shelf / 7d`,
    tryNext: (q) => `Try "${q}" for a priced verdict on one item →`,
    avg: "avg",
    tryTheseInstead: "Try one of these instead",
    seedLabel: "Live example — not your check",
    seedIntro: (product) => `Today's real answer for ${product}, from watched departures. It cost you nothing — type an item you are looking at above to get yours.`,
  },
  fr: {
    heading: "Combien payer ?",
    placeholder: "ex. Adidas Samba, Nike Air Force 1, New Balance 530",
    check: "Vérifier",
    checking: "Recherche des départs observés…",
    errorGeneric: "Pas assez de départs comparables pour finir cette vérification. Réessayez, ou un modèle plus précis.",
    unlockError: "Impossible de déverrouiller. Réessayez.",
    decision: "Décision",
    confidence: "Confiance",
    provisional: "provisoire",
    limitReachedBody: "Offre gratuite : 10 verdicts/jour. Starter ou Pro pour l'illimité.",
    usedOfLimit: (used, limit) => `${used} sur ${limit} verdicts utilisés aujourd'hui.`,
    seePlans: "Voir les offres →",
    unknownBody: "Pas assez de données marché sur ce produit. Essayez une marque + un modèle plus courant.",
    headlineCall: (product) => `Voici l'appel principal sur ${product}, calculé à partir des départs observés sur 5 marchés UE.`,
    why: "Pourquoi",
    buyBelow: "Prix d'achat max",
    avgAtExit: "Moy. à la sortie",
    leftShelf: "Quitté le rayon / 7j",
    listedNow: "Encore en ligne",
    sellThrough: "Taux d'écoulement",
    targetNet: "Net cible",
    opportunity: "Opportunité",
    demand: "Demande",
    hotSizes: "Tailles qui partent",
    empty: "Entrez une marque et un modèle. Vous obtenez BUY, WATCH ou SKIP et la raison — d'après les départs observés, pas un modèle qui devine.",
    noData: "PAS DE DONNÉES",
    notMeasured: "NON MESURÉ",
    limitReached: "LIMITE ATTEINTE",
    marketData: "DONNÉES MARCHÉ",
    brandAverage: "MOYENNE MARQUE",
    leftShelfCount: (n) => `${n} ont quitté le rayon / 7j`,
    tryNext: (q) => `Essayez « ${q} » pour un verdict chiffré sur un article →`,
    avg: "moy.",
    tryTheseInstead: "Essayez plutôt l'un de ceux-ci",
    seedLabel: "Exemple réel — ce n'est pas votre analyse",
    seedIntro: (product) => `La vraie réponse du jour pour ${product}, d'après les départs observés. Elle ne vous a rien coûté — saisissez ci-dessus un article qui vous intéresse pour obtenir la vôtre.`,
  },
  es: {
    heading: "¿Cuánto pagar?",
    placeholder: "p. ej. Adidas Samba, Nike Air Force 1, New Balance 530",
    check: "Consultar",
    checking: "Buscando salidas observadas…",
    errorGeneric: "No hay suficientes salidas comparables para terminar. Pruebe de nuevo o un modelo más concreto.",
    unlockError: "No se pudo desbloquear. Inténtelo de nuevo.",
    decision: "Decisión",
    confidence: "Confianza",
    provisional: "provisional",
    limitReachedBody: "Plan gratuito: 10 veredictos/día. Starter o Pro para ilimitados.",
    usedOfLimit: (used, limit) => `${used} de ${limit} veredictos usados hoy.`,
    seePlans: "Ver planes →",
    unknownBody: "Aún no hay suficientes datos de mercado. Pruebe una marca + modelo más habitual.",
    headlineCall: (product) => `Esta es la llamada principal sobre ${product}, calculada con salidas observadas en 5 mercados de la UE.`,
    why: "Por qué",
    buyBelow: "Precio máximo de compra",
    avgAtExit: "Media al salir",
    leftShelf: "Salió del catálogo / 7d",
    listedNow: "En venta ahora",
    sellThrough: "Rotación",
    targetNet: "Neto objetivo",
    opportunity: "Oportunidad",
    demand: "Demanda",
    hotSizes: "Tallas que salen",
    empty: "Introduzca marca y modelo. Recibe BUY, WATCH o SKIP y el motivo — de salidas observadas, no de un modelo que adivina.",
    noData: "SIN DATOS",
    notMeasured: "NO MEDIDO",
    limitReached: "LÍMITE ALCANZADO",
    marketData: "DATOS DE MERCADO",
    brandAverage: "MEDIA DE MARCA",
    leftShelfCount: (n) => `${n} salieron / 7d`,
    tryNext: (q) => `Pruebe «${q}» para un veredicto de un artículo →`,
    avg: "media",
    tryTheseInstead: "Prueba con uno de estos",
    seedLabel: "Ejemplo real — no es su consulta",
    seedIntro: (product) => `La respuesta real de hoy para ${product}, a partir de salidas observadas. No le ha costado nada: escriba arriba un artículo que esté mirando para obtener la suya.`,
  },
  de: {
    heading: "Was sollen Sie zahlen?",
    placeholder: "z. B. Adidas Samba, Nike Air Force 1, New Balance 530",
    check: "Prüfen",
    checking: "Beobachtete Abgänge werden geladen…",
    errorGeneric: "Nicht genug vergleichbare Abgänge für diese Prüfung. Noch einmal, oder ein genaueres Modell.",
    unlockError: "Konnte nicht entsperrt werden. Bitte erneut versuchen.",
    decision: "Entscheidung",
    confidence: "Konfidenz",
    provisional: "vorläufig",
    limitReachedBody: "Kostenlos: 10 Urteile/Tag. Starter oder Pro für unbegrenzt.",
    usedOfLimit: (used, limit) => `${used} von ${limit} Urteilen heute genutzt.`,
    seePlans: "Tarife ansehen →",
    unknownBody: "Noch nicht genug Marktdaten zu diesem Produkt. Marke + gängigeres Modell versuchen.",
    headlineCall: (product) => `Das ist der Haupt-Call zu ${product}, aus beobachteten Abgängen in 5 EU-Märkten.`,
    why: "Warum",
    buyBelow: "Kaufobergrenze",
    avgAtExit: "Schnitt beim Abgang",
    leftShelf: "Aus dem Bestand / 7T",
    listedNow: "Jetzt inseriert",
    sellThrough: "Abverkauf",
    targetNet: "Ziel-Netto",
    opportunity: "Chance",
    demand: "Nachfrage",
    hotSizes: "Starke Größen",
    empty: "Marke und Modell eingeben. Sie erhalten BUY, WATCH oder SKIP plus Grund — aus beobachteten Abgängen, kein ratenendes Modell.",
    noData: "KEINE DATEN",
    notMeasured: "NICHT GEMESSEN",
    limitReached: "LIMIT ERREICHT",
    marketData: "MARKTDATEN",
    brandAverage: "MARKEN-DURCHSCHNITT",
    leftShelfCount: (n) => `${n} aus dem Bestand / 7T`,
    tryNext: (q) => `„${q}“ für ein bepreistes Urteil zu einem Artikel →`,
    avg: "Ø",
    tryTheseInstead: "Probier stattdessen eines davon",
    seedLabel: "Echtes Beispiel — nicht Ihre Prüfung",
    seedIntro: (product) => `Die heutige echte Antwort für ${product}, aus beobachteten Abgängen. Sie hat Sie nichts gekostet — geben Sie oben einen Artikel ein, den Sie sich ansehen, und Sie erhalten Ihre eigene.`,
  },
  it: {
    heading: "Quanto pagare?",
    placeholder: "es. Adidas Samba, Nike Air Force 1, New Balance 530",
    check: "Verifica",
    checking: "Ricerca delle uscite osservate…",
    errorGeneric: "Non ci sono abbastanza uscite comparabili. Riprova, o un modello più specifico.",
    unlockError: "Sblocco non riuscito. Riprova.",
    decision: "Decisione",
    confidence: "Fiducia",
    provisional: "provvisorio",
    limitReachedBody: "Piano gratuito: 10 verdetti/giorno. Starter o Pro per l'illimitato.",
    usedOfLimit: (used, limit) => `${used} di ${limit} verdetti usati oggi.`,
    seePlans: "Vedi i piani →",
    unknownBody: "Dati di mercato ancora insufficienti. Prova una marca + un modello più comune.",
    headlineCall: (product) => `Questa è la chiamata principale su ${product}, calcolata dalle uscite osservate in 5 mercati UE.`,
    why: "Perché",
    buyBelow: "Prezzo max di acquisto",
    avgAtExit: "Media all'uscita",
    leftShelf: "Usciti dallo scaffale / 7g",
    listedNow: "Ancora in vendita",
    sellThrough: "Sell-through",
    targetNet: "Netto obiettivo",
    opportunity: "Opportunità",
    demand: "Domanda",
    hotSizes: "Taglie che escono",
    empty: "Inserisci marca e modello. Ottieni BUY, WATCH o SKIP e il motivo — da uscite osservate, non da un modello che indovina.",
    noData: "NESSUN DATO",
    notMeasured: "NON MISURATO",
    limitReached: "LIMITE RAGGIUNTO",
    marketData: "DATI DI MERCATO",
    brandAverage: "MEDIA MARCHIO",
    leftShelfCount: (n) => `${n} usciti / 7g`,
    tryNext: (q) => `Prova «${q}» per un verdetto su un articolo →`,
    avg: "media",
    tryTheseInstead: "Prova uno di questi",
    seedLabel: "Esempio reale — non è il tuo controllo",
    seedIntro: (product) => `La risposta reale di oggi per ${product}, dalle uscite osservate. Non ti è costata nulla: scrivi sopra un articolo che stai valutando per avere la tua.`,
  },
  pt: {
    heading: "Quanto deve pagar?",
    placeholder: "ex. Adidas Samba, Nike Air Force 1, New Balance 530",
    check: "Verificar",
    checking: "A procurar saídas observadas…",
    errorGeneric: "Não há saídas comparáveis suficientes. Tente de novo, ou um modelo mais específico.",
    unlockError: "Não foi possível desbloquear. Tente de novo.",
    decision: "Decisão",
    confidence: "Confiança",
    provisional: "provisório",
    limitReachedBody: "Plano gratuito: 10 veredictos/dia. Starter ou Pro para ilimitado.",
    usedOfLimit: (used, limit) => `${used} de ${limit} veredictos usados hoje.`,
    seePlans: "Ver planos →",
    unknownBody: "Ainda não há dados de mercado suficientes. Tente uma marca + um modelo mais comum.",
    headlineCall: (product) => `Este é o alerta principal sobre ${product}, calculado a partir de saídas observadas em 5 mercados da UE.`,
    why: "Porquê",
    buyBelow: "Preço máximo de compra",
    avgAtExit: "Média à saída",
    leftShelf: "Saíram da prateleira / 7d",
    listedNow: "Ainda anunciados",
    sellThrough: "Sell-through",
    targetNet: "Líquido alvo",
    opportunity: "Oportunidade",
    demand: "Procura",
    hotSizes: "Tamanhos que saem",
    empty: "Introduza marca e modelo. Recebe BUY, WATCH ou SKIP e o motivo — de saídas observadas, não de um modelo a adivinhar.",
    noData: "SEM DADOS",
    notMeasured: "NÃO MEDIDO",
    limitReached: "LIMITE ATINGIDO",
    marketData: "DADOS DE MERCADO",
    brandAverage: "MÉDIA DA MARCA",
    leftShelfCount: (n) => `${n} saíram / 7d`,
    tryNext: (q) => `Tente «${q}» para um veredicto de um artigo →`,
    avg: "média",
    tryTheseInstead: "Experimente um destes",
    seedLabel: "Exemplo real — não é a sua consulta",
    seedIntro: (product) => `A resposta real de hoje para ${product}, a partir de saídas observadas. Não lhe custou nada — escreva acima um artigo que esteja a ver para obter a sua.`,
  },
}
