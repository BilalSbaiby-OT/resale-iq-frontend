import type { Locale } from "./i18n.ts"

/**
 * Copy for /tools strings that were still hardcoded English on every locale
 * (live anonymous /fr/tools mobile visit, 2026-10-03, before the French TikTok
 * ad test): the post-verdict context bridge, the monthly-list capture and the
 * one-line price summary under a verdict. The rest of the page reads
 * `ui-strings.ts` through tx(); these live in one typed per-locale table
 * because they are component-local, so the compiler refuses a missing column.
 * `en` carries the exact strings the components printed before: the English
 * page is unchanged.
 *
 * Non-English wording rule (founder, 2026-10-03): no euro-margin figure and no
 * profit promise on a translated surface. Max buy price + typical resale price
 * only (the max buy price is "70 % du prix de revente typique", never a
 * margin). Departures are "observed", never sales.
 */
export type ToolsLandingCopy = {
  /** Context bridge under a free verdict, one sentence per outcome. */
  bridge: { ctxBuy: string; ctxWatch: string; ctxBrand: string; ctxSkip: string }
  digest: {
    offer: string
    cta: string
    consent: string
    invalidEmail: string
    error: string
    success: string
    already: string
    ariaLabel: string
    placeholder: string
  }
  /** One-line price summary under a verdict. Arguments are pre-formatted euro strings. */
  summaryLine: (maxBuy: string, resale: string) => string
}

export const TOOLS_LANDING_COPY: Record<Locale, ToolsLandingCopy> = {
  en: {
    bridge: {
      ctxBuy: "This item is a buy. Starter shows the buy-below price and weekly demand for every item you source — 8,400+ models.",
      ctxWatch: "Worth watching. Starter unlocks the exact buy-below price and demand trends for every item you check — €19/mo.",
      ctxBrand: "You saw category averages. Starter adds per-model buy-below prices for every specific item you pick.",
      ctxSkip: "Smart pass — you just saved yourself a bad purchase. Starter shows what IS moving in your sourcing range.",
    },
    digest: {
      offer: "Monthly buy list by email — 1 email a month, unsubscribe anytime.",
      cta: "Get free list",
      consent: "1 email a month. Unsubscribe anytime.",
      invalidEmail: "Enter a valid email address.",
      error: "Something went wrong — try again.",
      success: "✓ You're in — next email lands with next month's list.",
      already: "Already subscribed.",
      ariaLabel: "Email address for monthly buy list",
      placeholder: "you@example.com",
    },
    summaryLine: (maxBuy, resale) => `Buy below ${maxBuy} · typical exit ${resale}`,
  },
  fr: {
    bridge: {
      ctxBuy: "Cet article est à acheter. Starter affiche le prix d'achat max et la demande hebdomadaire pour chaque article que vous sourcez — plus de 8 400 modèles.",
      ctxWatch: "À surveiller. Starter débloque le prix d'achat max exact et les tendances de demande pour chaque article que vous vérifiez — 19 €/mois.",
      ctxBrand: "Vous avez vu des moyennes de catégorie. Starter ajoute un prix d'achat max par modèle pour chaque article précis que vous choisissez.",
      ctxSkip: "Bonne décision d'écarter — vous venez d'éviter un mauvais achat. Starter montre ce qui part vraiment dans votre budget de sourcing.",
    },
    digest: {
      offer: "Liste d'achats mensuelle par e-mail — 1 e-mail par mois, désinscription à tout moment.",
      cta: "Recevoir la liste gratuite",
      consent: "1 e-mail par mois. Désinscription à tout moment.",
      invalidEmail: "Saisissez une adresse e-mail valide.",
      error: "Une erreur est survenue — réessayez.",
      success: "✓ C'est noté — le prochain e-mail arrive avec la liste du mois prochain.",
      already: "Vous êtes déjà abonné.",
      ariaLabel: "Adresse e-mail pour la liste d'achats mensuelle",
      placeholder: "vous@exemple.com",
    },
    summaryLine: (maxBuy, resale) => `Prix d'achat max ${maxBuy} · revente typique ${resale}`,
  },
  es: {
    bridge: {
      ctxBuy: "Este artículo es de compra. Starter muestra el precio máximo de compra y la demanda semanal de cada artículo que consigues — más de 8.400 modelos.",
      ctxWatch: "Merece vigilarse. Starter desbloquea el precio máximo de compra exacto y las tendencias de demanda de cada artículo que compruebas — 19 €/mes.",
      ctxBrand: "Has visto medias de categoría. Starter añade un precio máximo de compra por modelo para cada artículo concreto que elijas.",
      ctxSkip: "Buena decisión descartarlo — acabas de evitar una mala compra. Starter muestra qué se está moviendo de verdad en tu rango de compra.",
    },
    digest: {
      offer: "Lista de compra mensual por correo — 1 correo al mes, cancela cuando quieras.",
      cta: "Recibir la lista gratis",
      consent: "1 correo al mes. Cancela cuando quieras.",
      invalidEmail: "Introduce una dirección de correo válida.",
      error: "Algo salió mal — inténtalo de nuevo.",
      success: "✓ Listo — el próximo correo llega con la lista del mes que viene.",
      already: "Ya estás suscrito.",
      ariaLabel: "Correo electrónico para la lista de compra mensual",
      placeholder: "tu@ejemplo.com",
    },
    summaryLine: (maxBuy, resale) => `Precio máx. de compra ${maxBuy} · reventa típica ${resale}`,
  },
  de: {
    bridge: {
      ctxBuy: "Dieser Artikel ist ein Kauf. Starter zeigt die Kaufobergrenze und die wöchentliche Nachfrage für jeden Artikel, den du besorgst — über 8.400 Modelle.",
      ctxWatch: "Beobachten lohnt sich. Starter schaltet die genaue Kaufobergrenze und die Nachfragetrends für jeden geprüften Artikel frei — 19 €/Monat.",
      ctxBrand: "Du hast Kategorie-Durchschnitte gesehen. Starter ergänzt eine Kaufobergrenze pro Modell für jeden konkreten Artikel.",
      ctxSkip: "Gut verworfen — du hast dir gerade einen Fehlkauf erspart. Starter zeigt, was in deinem Einkaufsbereich wirklich läuft.",
    },
    digest: {
      offer: "Monatliche Kaufliste per E-Mail — 1 E-Mail im Monat, jederzeit abbestellbar.",
      cta: "Gratis-Liste erhalten",
      consent: "1 E-Mail im Monat. Jederzeit abbestellbar.",
      invalidEmail: "Gib eine gültige E-Mail-Adresse ein.",
      error: "Etwas ist schiefgelaufen — versuche es erneut.",
      success: "✓ Du bist dabei — die nächste E-Mail kommt mit der Liste des nächsten Monats.",
      already: "Bereits angemeldet.",
      ariaLabel: "E-Mail-Adresse für die monatliche Kaufliste",
      placeholder: "du@beispiel.de",
    },
    summaryLine: (maxBuy, resale) => `Max. Kaufpreis ${maxBuy} · typischer Wiederverkauf ${resale}`,
  },
  it: {
    bridge: {
      ctxBuy: "Questo articolo è da comprare. Starter mostra il prezzo massimo d'acquisto e la domanda settimanale per ogni articolo che recuperi — oltre 8.400 modelli.",
      ctxWatch: "Da tenere d'occhio. Starter sblocca il prezzo massimo d'acquisto esatto e i trend di domanda per ogni articolo che controlli — 19 €/mese.",
      ctxBrand: "Hai visto medie di categoria. Starter aggiunge un prezzo massimo d'acquisto per modello per ogni articolo specifico.",
      ctxSkip: "Hai fatto bene a scartarlo — hai appena evitato un cattivo acquisto. Starter mostra cosa si muove davvero nella tua fascia di acquisto.",
    },
    digest: {
      offer: "Lista d'acquisto mensile via e-mail — 1 e-mail al mese, annulli quando vuoi.",
      cta: "Ricevi la lista gratis",
      consent: "1 e-mail al mese. Annulli quando vuoi.",
      invalidEmail: "Inserisci un indirizzo e-mail valido.",
      error: "Qualcosa è andato storto — riprova.",
      success: "✓ Sei dentro — la prossima e-mail arriva con la lista del mese prossimo.",
      already: "Sei già iscritto.",
      ariaLabel: "Indirizzo e-mail per la lista d'acquisto mensile",
      placeholder: "tu@esempio.it",
    },
    summaryLine: (maxBuy, resale) => `Prezzo max d'acquisto ${maxBuy} · rivendita tipica ${resale}`,
  },
  pt: {
    bridge: {
      ctxBuy: "Este artigo é de compra. O Starter mostra o preço máximo de compra e a procura semanal de cada artigo que arranja — mais de 8.400 modelos.",
      ctxWatch: "Vale a pena observar. O Starter desbloqueia o preço máximo de compra exato e as tendências de procura de cada artigo que verifica — 19 €/mês.",
      ctxBrand: "Viu médias de categoria. O Starter acrescenta um preço máximo de compra por modelo para cada artigo específico.",
      ctxSkip: "Boa decisão descartar — acabou de evitar uma má compra. O Starter mostra o que realmente se move na sua faixa de compra.",
    },
    digest: {
      offer: "Lista de compras mensal por e-mail — 1 e-mail por mês, cancele quando quiser.",
      cta: "Receber a lista grátis",
      consent: "1 e-mail por mês. Cancele quando quiser.",
      invalidEmail: "Introduza um endereço de e-mail válido.",
      error: "Algo correu mal — tente novamente.",
      success: "✓ Está dentro — o próximo e-mail chega com a lista do mês seguinte.",
      already: "Já está subscrito.",
      ariaLabel: "Endereço de e-mail para a lista de compras mensal",
      placeholder: "voce@exemplo.pt",
    },
    summaryLine: (maxBuy, resale) => `Preço máx. de compra ${maxBuy} · revenda típica ${resale}`,
  },
}

/** French translations of the five search-intent cards listed under the checker. Other locales keep English. */
export const FR_TOOL_INTENTS: Record<string, { h1: string; description: string }> = {
  "vinted-price-checker": {
    h1: "Vérificateur de prix Vinted",
    description: "Prix de départ typique sur Vinted et prix d'achat max, d'après {{TRACKED}} enregistrements d'annonces sur 5 marchés UE. Les volumes hebdo par marque sont publics.",
  },
  "vinted-sourcing-tool": {
    h1: "Outil pour revendeurs : quel stock sourcer et le prix max à payer",
    description: "Quel stock sourcer, le prix max à payer et quelles tailles partent, avant de revendre sur Vinted.",
  },
  "vinted-resale-analytics": {
    h1: "Analyses de revente Vinted",
    description: "Taux d'écoulement, classements de marques, tendances de prix et demande par taille sur {{TRACKED}} enregistrements d'annonces, 5 marchés UE.",
  },
  "reselling-intelligence": {
    h1: "Intelligence de revente",
    description: "Signaux de demande, prix d'achat max, écoulement et dynamique pour les revendeurs d'occasion, construits sur {{TRACKED}} enregistrements d'annonces.",
  },
  "vinted-profit-calculator": {
    h1: "Calculateur de profit Vinted",
    description: "Calculez votre profit net sur un achat-revente après frais, et comparez ce que le même article rapporte sur d'autres plateformes.",
  },
}

export type TeaserCiteArgs = { product: string; verdict: string; maxBuy: string; avg: string | null; confidence: string | null }

/**
 * Short, self-contained answer shown above the checker when a free-sample item
 * arrives by ?q= (paid-ad or citation deep link) on a translated locale. The
 * English page keeps its long crawler paragraph (teaser-verdict.ts); a
 * translated visitor gets a short answer in their own language, never English.
 * Numbers are the live verdict's own; "observed", never sales or receipts.
 */
export const TEASER_CITE: Record<Exclude<Locale, "en">, (a: TeaserCiteArgs) => string> = {
  fr: (a) =>
    `Faut-il acheter ${a.product} pour revendre ? ${a.verdict}. Prix d'achat max : ${a.maxBuy}, soit 70 % du prix de revente typique.` +
    (a.avg ? ` Moyenne des départs observés : ${a.avg}.` : "") +
    (a.confidence ? ` Confiance ${a.confidence}.` : "") +
    " Marchés suivis : Espagne, France, Allemagne, Italie et Portugal, pas le Royaume-Uni. Ce sont des annonces observées quittant l'étagère, pas des reçus de vente. Les autres modèles demandent Starter à 19 €/mois.",
  es: (a) =>
    `¿Conviene comprar ${a.product} para revender? ${a.verdict}. Precio máximo de compra: ${a.maxBuy}, es decir, el 70 % del precio de reventa típico.` +
    (a.avg ? ` Media de salidas observadas: ${a.avg}.` : "") +
    (a.confidence ? ` Confianza ${a.confidence}.` : "") +
    " Mercados seguidos: España, Francia, Alemania, Italia y Portugal, no el Reino Unido. Son anuncios observados saliendo del estante, no recibos de venta. Los demás modelos requieren Starter a 19 €/mes.",
  de: (a) =>
    `Lohnt sich ${a.product} zum Weiterverkauf? ${a.verdict}. Maximaler Kaufpreis: ${a.maxBuy}, also 70 % des typischen Wiederverkaufspreises.` +
    (a.avg ? ` Durchschnitt beobachteter Abgänge: ${a.avg}.` : "") +
    (a.confidence ? ` Vertrauen ${a.confidence}.` : "") +
    " Beobachtete Märkte: Spanien, Frankreich, Deutschland, Italien und Portugal, nicht das Vereinigte Königreich. Das sind beobachtete Angebote, die das Regal verlassen haben, keine Verkaufsbelege. Andere Modelle brauchen Starter für 19 €/Monat.",
  it: (a) =>
    `Conviene comprare ${a.product} per rivendere? ${a.verdict}. Prezzo massimo d'acquisto: ${a.maxBuy}, cioè il 70 % del prezzo di rivendita tipico.` +
    (a.avg ? ` Media delle uscite osservate: ${a.avg}.` : "") +
    (a.confidence ? ` Affidabilità ${a.confidence}.` : "") +
    " Mercati seguiti: Spagna, Francia, Germania, Italia e Portogallo, non il Regno Unito. Sono annunci osservati mentre lasciano lo scaffale, non ricevute di vendita. Gli altri modelli richiedono Starter a 19 €/mese.",
  pt: (a) =>
    `Vale a pena comprar ${a.product} para revender? ${a.verdict}. Preço máximo de compra: ${a.maxBuy}, ou seja, 70 % do preço de revenda típico.` +
    (a.avg ? ` Média das saídas observadas: ${a.avg}.` : "") +
    (a.confidence ? ` Confiança ${a.confidence}.` : "") +
    " Mercados acompanhados: Espanha, França, Alemanha, Itália e Portugal, não o Reino Unido. São anúncios observados a sair da prateleira, não recibos de venda. Os outros modelos exigem Starter a 19 €/mês.",
}
