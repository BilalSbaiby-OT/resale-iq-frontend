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
  openCheck: string
  managePlan: string
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
  /* Post-verdict nudge toward a 2nd check — the activation event. Measured
     2026-09-06: 0 of 7 signups ever ran a check on a second day, so activation
     is 0%. A priced verdict currently ends with no next step; the other
     branches already offer ModelChips. This label reuses that same one-click
     path to keep the visitor going after their first real answer. */
  checkAnother: string
  estimate: string
  strPaused: string
  comps: string
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
    limitReachedBody: "You've used today's verdicts on your plan. Pro lifts the daily limit.",
    usedOfLimit: (used, limit) => `${used} of ${limit} verdicts used today.`,
    seePlans: "See plans →",
    openCheck: "Check Nike Air Force 1",
    managePlan: "Manage subscription",
    unknownBody: "We track 26 clothing & sneaker brands across ES/FR/DE/IT/PT — not electronics or homeware. Try one of these:",
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
    checkAnother: "Got another item in front of you? Check it while you're here.",
    estimate: "Estimate",
    strPaused: "Sell-through is withheld. Watched departures and listings are still shown.",
    comps: "Active comps",
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
    limitReachedBody: "Vous avez utilisé les verdicts du jour sur votre offre. Pro lève la limite quotidienne.",
    usedOfLimit: (used, limit) => `${used} sur ${limit} verdicts utilisés aujourd'hui.`,
    seePlans: "Voir les offres →",
    openCheck: "Vérifier Nike Air Force 1",
    managePlan: "Gérer l'abonnement",
    unknownBody: "Nous couvrons 26 marques de vêtements et sneakers (ES/FR/DE/IT/PT) — pas l'électronique ni la maison. Essayez :",
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
    checkAnother: "Un autre article sous les yeux ? Vérifiez-le tant que vous y êtes.",
    estimate: "Estimation",
    strPaused: "Le taux d'écoulement est retenu. Les départs observés et les annonces restent affichés.",
    comps: "Comps actives",
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
    limitReachedBody: "Has usado los veredictos de hoy en tu plan. Pro elimina el límite diario.",
    usedOfLimit: (used, limit) => `${used} de ${limit} veredictos usados hoy.`,
    seePlans: "Ver planes →",
    openCheck: "Comprobar Nike Air Force 1",
    managePlan: "Gestionar suscripción",
    unknownBody: "Cubrimos 26 marcas de ropa y sneakers (ES/FR/DE/IT/PT), no electrónica ni hogar. Prueba con:",
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
    checkAnother: "¿Tienes otro artículo delante? Compruébalo ya que estás aquí.",
    estimate: "Estimación",
    strPaused: "La rotación está retenida. Las salidas observadas y los anuncios se siguen mostrando.",
    comps: "Comps activas",
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
    limitReachedBody: "Sie haben die heutigen Urteile Ihres Tarifs verbraucht. Pro hebt das Tageslimit auf.",
    usedOfLimit: (used, limit) => `${used} von ${limit} Urteilen heute genutzt.`,
    seePlans: "Tarife ansehen →",
    openCheck: "Nike Air Force 1 prüfen",
    managePlan: "Abo verwalten",
    unknownBody: "Wir erfassen 26 Kleidungs- & Sneaker-Marken (ES/FR/DE/IT/PT) — keine Elektronik oder Haushalt. Versuche:",
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
    checkAnother: "Noch ein Artikel vor dir? Prüf ihn gleich mit.",
    estimate: "Schätzung",
    strPaused: "Abverkauf ist zurückgehalten. Beobachtete Abgänge und Inserate werden trotzdem gezeigt.",
    comps: "Aktive Comps",
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
    limitReachedBody: "Hai usato i verdetti di oggi sul tuo piano. Pro elimina il limite giornaliero.",
    usedOfLimit: (used, limit) => `${used} di ${limit} verdetti usati oggi.`,
    seePlans: "Vedi i piani →",
    openCheck: "Controlla Nike Air Force 1",
    managePlan: "Gestisci abbonamento",
    unknownBody: "Copriamo 26 marchi di abbigliamento e sneaker (ES/FR/DE/IT/PT), non elettronica o casa. Prova con:",
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
    checkAnother: "Hai un altro articolo davanti? Controllalo già che ci sei.",
    estimate: "Stima",
    strPaused: "Il sell-through è trattenuto. Le uscite osservate e gli annunci restano visibili.",
    comps: "Comps attive",
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
    limitReachedBody: "Usou os veredictos de hoje no seu plano. Pro remove o limite diário.",
    usedOfLimit: (used, limit) => `${used} de ${limit} veredictos usados hoje.`,
    seePlans: "Ver planos →",
    openCheck: "Verificar Nike Air Force 1",
    managePlan: "Gerir subscrição",
    unknownBody: "Cobrimos 26 marcas de roupa e sneakers (ES/FR/DE/IT/PT) — não eletrónica nem casa. Tente:",
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
    checkAnother: "Tens outro artigo à frente? Verifica-o já que estás aqui.",
    estimate: "Estimativa",
    strPaused: "O sell-through está retido. As saídas observadas e os anúncios continuam visíveis.",
    comps: "Comps ativas",
  },
}
