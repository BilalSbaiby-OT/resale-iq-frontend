import type { Locale } from "./i18n"

/**
 * The words the LOGGED-IN app says, in the language the customer chose.
 *
 * WHY THIS FILE EXISTS. Live on production 2026-09-06, authenticated session,
 * locale=Español: "Deal Scanner", "Find live deals", "BUY BELOW",
 * "SELL-THROUGH", "RISING", "HOT", "Quick one.", "Not now", "Sneakers",
 * "8.7% STR" — English chrome on every card, sitting beside market chips that
 * render ES/IT/FR correctly. The funnel was translated and then handed the
 * customer an English product.
 *
 * THE DIAGNOSIS, because the layer matters and the last one was the opposite.
 * On the /es landing surface the dictionary already HELD the translations and
 * the defect was that the locale never reached the component. Here the locale
 * reaches everything: `LocaleProvider` is mounted in the root layout
 * (src/app/layout.tsx) and wraps every authenticated route, and `useLocale()`
 * already works — sidebar.tsx, topbar.tsx and app-shell.tsx read it today. The
 * defect on these surfaces is the other one: the strings were never in a
 * dictionary at all. `deals/page.tsx` never called `useLocale()` once, and the
 * shared cards (`momentum-badge`, `outcome-prompt`, `median-n`) hardcoded
 * English literals in JSX. Fixing the provider again would have changed
 * nothing, which is why this survived multiple QC rounds.
 *
 * WHY `Record<Locale, ...>` AND NOT A BLOCK IN i18n.ts. The instruction is
 * that a key lands in all six locales or none, because a missing key silently
 * falling back to English is the exact bug being fixed. In `copy` (i18n.ts)
 * that rule is a convention a reviewer has to hold; here the type makes `tsc`
 * refuse to build if you add a key and skip Portuguese. Same reasoning, same
 * shape, and the same sentence, as `verdict-words.ts` and `nav-copy.ts`
 * already in this repo: "a per-locale dictionary is where the fifth locale
 * gets forgotten."
 *
 * WHAT IS TRANSLATED AND WHAT IS NOT.
 *  - Translated: UI chrome, metric labels, category names, status words, and
 *    the verdict words (via `verdictWord()` — do not re-implement it here).
 *  - NOT translated: plan names (Free / Starter / Pro) are brand tokens, and
 *    brand and model names are catalogue data. `€` and the figures themselves
 *    are formatted, never reworded.
 *
 * THE "STR" DECISION, recorded here because it is a policy and not a string.
 * The abbreviation is RETIRED from every customer-facing surface; the metric
 * is always spelled out and always translated ("Sell-through" / "Venta" /
 * "Écoulement" / "Abverkauf" / "Vendita" / "Escoamento"). Two reasons. "STR"
 * is an initialism of the ENGLISH phrase sell-through rate, so carrying it
 * into the other five locales guarantees an untranslatable English orphan on
 * the card — the precise defect this file exists to remove. And the app was
 * mixing both spellings on one screen ("8.7% STR" on the panel, "Sell-through"
 * on the scanner), so a reader had no way to know they were the same number.
 * `METRIC.sellThrough` in src/lib/metrics.ts is the English half of this and
 * stays the canonical English term.
 */

/** The catalogue's momentum enum, as the backend sends it. */
export type MomentumWord = "HOT" | "RISING" | "STABLE" | "FADING" | "DEAD"

export interface AppCopy {
  /** Momentum status chips. Raw API enum in, reader's language out. */
  momentum: Record<MomentumWord, string>

  /** Shared metric labels. One spelling per metric, across every card. */
  metric: {
    buyBelow: string
    avgAtExit: string
    targetNet: string
    sellThrough: string
    listedNow: string
  }

  /** Tooltips that explain how a number was constructed. */
  tip: {
    /** Why "target net" is a constructed gap and not a forecast. */
    targetNet: string
    /** 30-day price sparkline. */
    priceTrend: string
    /** "Open Vinted search" — the market name is catalogue data. */
    openMarket: (market: string) => string
    /** Sample-size tooltip on a mean/median, by which count `n` is. */
    sampleAvgWatched: string
    sampleAvgComparable: string
    sampleMedianWatched: string
    sampleMedianComparable: string
  }

  /** The Deal Scanner (/deals). */
  deals: {
    title: string
    /** Header count. `n` is already locale-formatted. */
    subtitle: (n: string) => string
    searchPlaceholder: string
    allCategories: string
    allBrands: string
    /** The "no momentum filter" chip. */
    allMomentum: string
    count: (n: string) => string
    clear: string
    empty: string
    findLive: string
    /** Shown when a card is ranked on volume because sell-through is thin. */
    thinSample: string
    watchlistAdd: string
    watchlistAdded: string
    watchlistAlready: string
  }

  /** The panel's feedback prompt (OutcomePrompt). */
  outcome: {
    lead: string
    /** Renders as: `{lead} <query> {mid(when)} <verdict>{tail}` */
    mid: (when: string) => string
    tail: string
    daysAgo: (n: string) => string
    aWhileBack: string
    didBuy: string
    didNotBuy: string
    notNow: string
    paid: string
    soldFor: string
    blankIfUnsold: string
    save: string
    saving: string
    ariaPaid: string
    ariaSold: string
  }

  /** A value the server withheld behind a plan. */
  locked: {
    /** Icon-only affordance: this is the whole accessible name. */
    label: string
  }
}

/**
 * Six columns, no exceptions. Adding a key to `AppCopy` and forgetting a
 * locale is a type error, which is the entire point of the shape.
 */
export const appCopy: Record<Locale, AppCopy> = {
  en: {
    momentum: { HOT: "Hot", RISING: "Rising", STABLE: "Stable", FADING: "Fading", DEAD: "Dead" },
    metric: {
      buyBelow: "Buy below",
      avgAtExit: "Avg at exit",
      targetNet: "Target net",
      sellThrough: "Sell-through",
      listedNow: "Listed now",
    },
    tip: {
      targetNet: "Buy-below is 70% of the fee-adjusted asking price at departure. This is that gap, not a forecast.",
      priceTrend: "30-day price trend",
      openMarket: (m) => `Open ${m} search`,
      sampleAvgWatched: "Sample size — watched departures behind this mean",
      sampleAvgComparable: "Sample size — comparable departures behind this mean",
      sampleMedianWatched: "Sample size — watched departures behind this median",
      sampleMedianComparable: "Sample size — comparable departures behind this median",
    },
    deals: {
      title: "Deal scanner",
      subtitle: (n) => `${n} opportunities`,
      searchPlaceholder: "Search model or brand…",
      allCategories: "All categories",
      allBrands: "All brands",
      allMomentum: "All",
      count: (n) => `${n} shown`,
      clear: "Clear",
      empty: "No deals match these filters. Try removing one.",
      findLive: "Find live deals",
      thinSample: "Ranked on volume — sell-through sample is still thin. Target net is the constructed 30% gap, not a forecast.",
      watchlistAdd: "Add to watchlist",
      watchlistAdded: "Added to watchlist",
      watchlistAlready: "Already in watchlist",
    },
    outcome: {
      lead: "You checked",
      mid: (w) => `${w} and we said`,
      tail: ". What happened?",
      daysAgo: (n) => `${n} days ago`,
      aWhileBack: "a while back",
      didBuy: "I bought it",
      didNotBuy: "I didn’t buy it",
      notNow: "Not now",
      paid: "Paid",
      soldFor: "Sold for",
      blankIfUnsold: "(blank if unsold)",
      save: "Save",
      saving: "Saving…",
      ariaPaid: "What you paid",
      ariaSold: "What it sold for",
    },
    locked: { label: "Locked — included in a plan" },
  },

  es: {
    momentum: { HOT: "Al rojo", RISING: "Subiendo", STABLE: "Estable", FADING: "Enfriándose", DEAD: "Parado" },
    metric: {
      buyBelow: "Compra por debajo de",
      avgAtExit: "Media a la salida",
      targetNet: "Neto objetivo",
      sellThrough: "Venta",
      listedNow: "En venta ahora",
    },
    tip: {
      targetNet: "El precio de compra es el 70% del precio de venta ajustado por comisiones. Esto es esa diferencia, no una previsión.",
      priceTrend: "Tendencia de precio a 30 días",
      openMarket: (m) => `Abrir búsqueda en ${m}`,
      sampleAvgWatched: "Tamaño de la muestra — salidas observadas detrás de esta media",
      sampleAvgComparable: "Tamaño de la muestra — salidas comparables detrás de esta media",
      sampleMedianWatched: "Tamaño de la muestra — salidas observadas detrás de esta mediana",
      sampleMedianComparable: "Tamaño de la muestra — salidas comparables detrás de esta mediana",
    },
    deals: {
      title: "Escáner de oportunidades",
      subtitle: (n) => `${n} oportunidades`,
      searchPlaceholder: "Busca modelo o marca…",
      allCategories: "Todas las categorías",
      allBrands: "Todas las marcas",
      allMomentum: "Todo",
      count: (n) => `${n} a la vista`,
      clear: "Limpiar",
      empty: "Ningún artículo coincide con estos filtros. Prueba a quitar uno.",
      findLive: "Buscar anuncios ahora",
      thinSample: "Ordenado por volumen — la muestra de ventas aún es escasa. El neto objetivo es la diferencia construida del 30%, no una previsión.",
      watchlistAdd: "Añadir a seguimiento",
      watchlistAdded: "Añadido a seguimiento",
      watchlistAlready: "Ya está en seguimiento",
    },
    outcome: {
      lead: "Consultaste",
      mid: (w) => `${w} y dijimos`,
      tail: ". ¿Qué pasó?",
      daysAgo: (n) => `hace ${n} días`,
      aWhileBack: "hace un tiempo",
      didBuy: "Lo compré",
      didNotBuy: "No lo compré",
      notNow: "Ahora no",
      paid: "Pagado",
      soldFor: "Vendido por",
      blankIfUnsold: "(en blanco si no se vendió)",
      save: "Guardar",
      saving: "Guardando…",
      ariaPaid: "Lo que pagaste",
      ariaSold: "Por cuánto se vendió",
    },
    locked: { label: "Bloqueado — incluido en un plan" },
  },

  fr: {
    momentum: { HOT: "Très demandé", RISING: "En hausse", STABLE: "Stable", FADING: "En baisse", DEAD: "À l’arrêt" },
    metric: {
      buyBelow: "Acheter en dessous de",
      avgAtExit: "Moyenne à la sortie",
      targetNet: "Net visé",
      sellThrough: "Écoulement",
      listedNow: "En vente maintenant",
    },
    tip: {
      targetNet: "Le prix d’achat vaut 70% du prix de vente ajusté des frais. Voici cet écart, pas une prévision.",
      priceTrend: "Tendance des prix sur 30 jours",
      openMarket: (m) => `Ouvrir la recherche ${m}`,
      sampleAvgWatched: "Taille de l’échantillon — départs suivis derrière cette moyenne",
      sampleAvgComparable: "Taille de l’échantillon — départs comparables derrière cette moyenne",
      sampleMedianWatched: "Taille de l’échantillon — départs suivis derrière cette médiane",
      sampleMedianComparable: "Taille de l’échantillon — départs comparables derrière cette médiane",
    },
    deals: {
      title: "Scanner d’opportunités",
      subtitle: (n) => `${n} opportunités`,
      searchPlaceholder: "Rechercher un modèle ou une marque…",
      allCategories: "Toutes les catégories",
      allBrands: "Toutes les marques",
      allMomentum: "Tout",
      count: (n) => `${n} affichées`,
      clear: "Effacer",
      empty: "Aucun article ne correspond à ces filtres. Essayez d’en retirer un.",
      findLive: "Trouver des annonces",
      thinSample: "Classé au volume — l’échantillon d’écoulement reste mince. Le net visé est l’écart construit de 30%, pas une prévision.",
      watchlistAdd: "Ajouter au suivi",
      watchlistAdded: "Ajouté au suivi",
      watchlistAlready: "Déjà dans le suivi",
    },
    outcome: {
      lead: "Vous avez consulté",
      mid: (w) => `${w} et nous avons dit`,
      tail: ". Que s’est-il passé ?",
      daysAgo: (n) => `il y a ${n} jours`,
      aWhileBack: "il y a un moment",
      didBuy: "Je l’ai acheté",
      didNotBuy: "Je ne l’ai pas acheté",
      notNow: "Pas maintenant",
      paid: "Payé",
      soldFor: "Revendu",
      blankIfUnsold: "(vide si non vendu)",
      save: "Enregistrer",
      saving: "Enregistrement…",
      ariaPaid: "Ce que vous avez payé",
      ariaSold: "Le prix de revente",
    },
    locked: { label: "Verrouillé — inclus dans un forfait" },
  },

  de: {
    momentum: { HOT: "Stark gefragt", RISING: "Steigend", STABLE: "Stabil", FADING: "Nachlassend", DEAD: "Stillstand" },
    metric: {
      buyBelow: "Kaufen unter",
      avgAtExit: "Schnitt beim Abgang",
      targetNet: "Zielnetto",
      sellThrough: "Abverkauf",
      listedNow: "Jetzt im Angebot",
    },
    tip: {
      targetNet: "Der Kaufpreis liegt bei 70% des gebührenbereinigten Verkaufspreises. Das ist diese Spanne, keine Prognose.",
      priceTrend: "Preisverlauf über 30 Tage",
      openMarket: (m) => `${m}-Suche öffnen`,
      sampleAvgWatched: "Stichprobengröße — beobachtete Abgänge hinter diesem Mittelwert",
      sampleAvgComparable: "Stichprobengröße — vergleichbare Abgänge hinter diesem Mittelwert",
      sampleMedianWatched: "Stichprobengröße — beobachtete Abgänge hinter diesem Median",
      sampleMedianComparable: "Stichprobengröße — vergleichbare Abgänge hinter diesem Median",
    },
    deals: {
      title: "Chancen-Scanner",
      subtitle: (n) => `${n} Chancen`,
      searchPlaceholder: "Modell oder Marke suchen…",
      allCategories: "Alle Kategorien",
      allBrands: "Alle Marken",
      allMomentum: "Alle",
      count: (n) => `${n} angezeigt`,
      clear: "Zurücksetzen",
      empty: "Kein Artikel passt zu diesen Filtern. Nimm einen weg.",
      findLive: "Aktuelle Angebote finden",
      thinSample: "Nach Volumen sortiert — die Abverkaufs-Stichprobe ist noch dünn. Das Zielnetto ist die konstruierte 30%-Spanne, keine Prognose.",
      watchlistAdd: "Zur Merkliste",
      watchlistAdded: "Zur Merkliste hinzugefügt",
      watchlistAlready: "Schon auf der Merkliste",
    },
    outcome: {
      lead: "Du hast",
      mid: (w) => `${w} geprüft und wir sagten`,
      tail: ". Was ist passiert?",
      daysAgo: (n) => `vor ${n} Tagen`,
      aWhileBack: "vor einer Weile",
      didBuy: "Ich habe es gekauft",
      didNotBuy: "Ich habe es nicht gekauft",
      notNow: "Jetzt nicht",
      paid: "Bezahlt",
      soldFor: "Verkauft für",
      blankIfUnsold: "(leer, wenn unverkauft)",
      save: "Speichern",
      saving: "Speichern…",
      ariaPaid: "Was du bezahlt hast",
      ariaSold: "Wofür es verkauft wurde",
    },
    locked: { label: "Gesperrt — in einem Tarif enthalten" },
  },

  it: {
    momentum: { HOT: "Molto richiesto", RISING: "In crescita", STABLE: "Stabile", FADING: "In calo", DEAD: "Fermo" },
    metric: {
      buyBelow: "Compra sotto",
      avgAtExit: "Media all’uscita",
      targetNet: "Netto obiettivo",
      sellThrough: "Vendita",
      listedNow: "In vendita ora",
    },
    tip: {
      targetNet: "Il prezzo d’acquisto è il 70% del prezzo di vendita al netto delle commissioni. Questo è quel margine, non una previsione.",
      priceTrend: "Andamento prezzi a 30 giorni",
      openMarket: (m) => `Apri la ricerca su ${m}`,
      sampleAvgWatched: "Dimensione del campione — uscite osservate dietro questa media",
      sampleAvgComparable: "Dimensione del campione — uscite comparabili dietro questa media",
      sampleMedianWatched: "Dimensione del campione — uscite osservate dietro questa mediana",
      sampleMedianComparable: "Dimensione del campione — uscite comparabili dietro questa mediana",
    },
    deals: {
      title: "Scanner di occasioni",
      subtitle: (n) => `${n} occasioni`,
      searchPlaceholder: "Cerca modello o marca…",
      allCategories: "Tutte le categorie",
      allBrands: "Tutte le marche",
      allMomentum: "Tutto",
      count: (n) => `${n} mostrate`,
      clear: "Azzera",
      empty: "Nessun articolo corrisponde a questi filtri. Prova a toglierne uno.",
      findLive: "Trova annunci ora",
      thinSample: "Ordinato per volume — il campione di vendita è ancora esiguo. Il netto obiettivo è il margine costruito del 30%, non una previsione.",
      watchlistAdd: "Aggiungi ai preferiti",
      watchlistAdded: "Aggiunto ai preferiti",
      watchlistAlready: "Già nei preferiti",
    },
    outcome: {
      lead: "Hai controllato",
      mid: (w) => `${w} e abbiamo detto`,
      tail: ". Cos’è successo?",
      daysAgo: (n) => `${n} giorni fa`,
      aWhileBack: "un po’ di tempo fa",
      didBuy: "L’ho comprato",
      didNotBuy: "Non l’ho comprato",
      notNow: "Non ora",
      paid: "Pagato",
      soldFor: "Venduto a",
      blankIfUnsold: "(vuoto se invenduto)",
      save: "Salva",
      saving: "Salvataggio…",
      ariaPaid: "Quanto hai pagato",
      ariaSold: "A quanto è stato venduto",
    },
    locked: { label: "Bloccato — incluso in un piano" },
  },

  pt: {
    momentum: { HOT: "Muito procurado", RISING: "A subir", STABLE: "Estável", FADING: "A abrandar", DEAD: "Parado" },
    metric: {
      buyBelow: "Comprar abaixo de",
      avgAtExit: "Média à saída",
      targetNet: "Líquido alvo",
      sellThrough: "Escoamento",
      listedNow: "À venda agora",
    },
    tip: {
      targetNet: "O preço de compra é 70% do preço de venda ajustado às comissões. Isto é essa margem, não uma previsão.",
      priceTrend: "Tendência de preços a 30 dias",
      openMarket: (m) => `Abrir pesquisa em ${m}`,
      sampleAvgWatched: "Dimensão da amostra — saídas observadas por trás desta média",
      sampleAvgComparable: "Dimensão da amostra — saídas comparáveis por trás desta média",
      sampleMedianWatched: "Dimensão da amostra — saídas observadas por trás desta mediana",
      sampleMedianComparable: "Dimensão da amostra — saídas comparáveis por trás desta mediana",
    },
    deals: {
      title: "Scanner de oportunidades",
      subtitle: (n) => `${n} oportunidades`,
      searchPlaceholder: "Procurar modelo ou marca…",
      allCategories: "Todas as categorias",
      allBrands: "Todas as marcas",
      allMomentum: "Tudo",
      count: (n) => `${n} à vista`,
      clear: "Limpar",
      empty: "Nenhum artigo corresponde a estes filtros. Tenta retirar um.",
      findLive: "Encontrar anúncios agora",
      thinSample: "Ordenado por volume — a amostra de escoamento ainda é reduzida. O líquido alvo é a margem construída de 30%, não uma previsão.",
      watchlistAdd: "Adicionar ao seguimento",
      watchlistAdded: "Adicionado ao seguimento",
      watchlistAlready: "Já está no seguimento",
    },
    outcome: {
      lead: "Consultaste",
      mid: (w) => `${w} e dissemos`,
      tail: ". O que aconteceu?",
      daysAgo: (n) => `há ${n} dias`,
      aWhileBack: "há algum tempo",
      didBuy: "Comprei",
      didNotBuy: "Não comprei",
      notNow: "Agora não",
      paid: "Pago",
      soldFor: "Vendido por",
      blankIfUnsold: "(em branco se não vendeu)",
      save: "Guardar",
      saving: "A guardar…",
      ariaPaid: "Quanto pagaste",
      ariaSold: "Por quanto foi vendido",
    },
    locked: { label: "Bloqueado — incluído num plano" },
  },
}

/**
 * A momentum enum in `locale`. An unknown value passes through unchanged
 * rather than vanishing — same rule as `categoryName()` in verdict-words.ts:
 * a status we do not have a word for is still true, and dropping it would
 * hide evidence to make a card look tidier.
 */
export function momentumWord(momentum: string | null | undefined, locale: Locale): string | null {
  if (!momentum) return null
  const table = appCopy[locale].momentum as Record<string, string>
  return table[momentum] ?? momentum
}
