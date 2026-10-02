import type { Locale } from "../lib/i18n.ts"
import type { FaqItem } from "../lib/faq-schema.ts"

export interface DataChrome {
  title: string
  description: string
  h1: string
  ledeBefore: string
  ledeCite: string
  citeH2: string
  dtRefresh: string
  dtListings: string
  dtDistinct: string
  dtBrands: string
  dtWeekly: string
  dtMarkets: string
  marketsValue: string
  citeNote: string
  lastGood: string
  watchedH2: string
  snapshotH2: string
  soldCol: string
  listingsCol: string
  freshnessCol: string
  stampLive: string
  stampStale: string
  brandH2: string
  colRank: string
  colBrand: string
  colSold: string
  colAvg: string
  colCats: string
  howH2: string
  howP: string
  ctaTitle: string
  ctaP: string
  checkCta: string
  plansCta: string
  catH2: string
  back: string
  empty: string
  observedTitle: string
  observedP: string
  provenance: string
  footerFlip: string
  footerCat: string
  footerTools: string
  footerMethod: string
  footerManual: string
  footerBlog: string
  /** C(elon) SEO/CRO fix 2026-09-29: one-line CTA above the fold on /data,
   *  right above the reused homepage free-check pattern (input + 3 free
   *  sample chips). "Check any item → max price to pay" — mirrors the
   *  audit's exact copy brief. Kept in dataChrome (not a new copy module)
   *  so translation stays next to every other /data string. */
  freeCheckLine: string
}

export const dataChrome: Record<Locale, DataChrome> = {
  en: {
    title: "Weekly Brand Volumes on Vinted — What Sells Best in 2026",
    description:
      "Weekly Vinted brand volumes: watched departures and average asking prices at departure across Spain, France, Germany, Italy and Portugal. Updated from live listings.",
    h1: "Weekly brand volumes on Vinted",
    ledeBefore:
      "Weekly watched departures (listings that left the shelf in our sample) and average price at departure by brand across Vinted's five main EU markets (Spain, France, Germany, Italy, Portugal), from ",
    ledeCite: " Free to cite with attribution to Resale IQ.",
    citeH2: "Citeable totals",
    dtRefresh: "Refresh date",
    dtListings: "Listing records",
    dtDistinct: "Distinct items",
    dtBrands: "Brands in this table",
    dtWeekly: "Watched departures (7 days)",
    dtMarkets: "Markets",
    marketsValue: "ES / FR / DE / IT / PT",
    citeNote:
      "Tracked-brand volume only, not the size of Vinted. An em-dash is a missing cell, not a zero. Listing records are one row per listing per Vinted domain; distinct items count each listing once (COUNT(DISTINCT external_id)). Free to cite with attribution to Resale IQ.",
    lastGood: "last-good",
    watchedH2: "What is a watched departure?",
    snapshotH2: "This week's snapshot",
    soldCol: "Watched departures (7 days)",
    listingsCol: "Distinct items",
    freshnessCol: "Freshness",
    stampLive: "Last updated",
    stampStale: "Snapshot taken",
    brandH2: "Weekly watched departures and average price at departure by brand",
    colRank: "#",
    colBrand: "Brand",
    colSold: "Left the shelf / 7 days",
    colAvg: "Avg price at departure",
    colCats: "Top categories",
    howH2: "How these numbers are produced",
    howP:
      'Figures are aggregated from public Vinted listings across ES, FR, DE, IT and PT, deduplicated by listing ID. "Left the shelf / 7 days" counts listings we watched leave the shelf in the trailing week, not every sold listing in the catalogue. Average price at departure is the mean asking price of those listings. A brand with 5 to 9 watched departures shows as "Fewer than 10". Buy-below prices, sell-through rates and per-size demand are part of the paid product and are not published here.',
    ctaTitle: "Want the numbers that make you money?",
    ctaP: "Buy-below price, sell-through and best sizes for any item.",
    checkCta: "Check this item →",
    plansCta: "or see plans",
    catH2: "Brands ranked by category",
    back: "← Resale IQ",
    empty: "Market data is being refreshed — check back shortly.",
    observedTitle: "Watched departures, not catalogue size.",
    observedP:
      "The weekly figure below counts only listings we watched leave the shelf. Most of the catalogue was already gone when we first saw it, so this weekly figure is much smaller than distinct items tracked. That is a measurement limit, not a refresh failure.",
    provenance: "Scope EU5 (ES/FR/DE/IT/PT) · trailing 7 days · dedup listing ID · left the shelf = watched transition · last calculated",
    footerFlip: "→ Every brand ranked",
    footerCat: "→ Every category ranked",
    footerTools: "→ Analyze an item",
    footerMethod: "→ Methodology",
    footerManual: "→ The reselling manual",
    footerBlog: "→ Reselling guides",
    freeCheckLine: "Check any item → max price to pay",
  },
  es: {
    title: "Volúmenes semanales de marca en Vinted — qué se vende en 2026",
    description:
      "Volúmenes semanales de marca en Vinted: salidas observadas y precios medios de pedido a la salida en España, Francia, Alemania, Italia y Portugal. Actualizado a partir de anuncios en vivo.",
    h1: "Volúmenes semanales de marca en Vinted",
    ledeBefore:
      "Salidas semanales observadas (anuncios que dejaron el escaparate en nuestra muestra) y precio medio de pedido a la salida por marca en los cinco mercados UE principales de Vinted (España, Francia, Alemania, Italia, Portugal), a partir de ",
    ledeCite: " Libre de citar con atribución a Resale IQ.",
    citeH2: "Totales citables",
    dtRefresh: "Fecha de actualización",
    dtListings: "Registros de anuncios",
    dtDistinct: "Artículos distintos",
    dtBrands: "Marcas en esta tabla",
    dtWeekly: "Salidas observadas (7 días)",
    dtMarkets: "Mercados",
    marketsValue: "ES / FR / DE / IT / PT",
    citeNote:
      "Solo volumen de marcas seguidas, no el tamaño de Vinted. Una raya es una celda vacía, no un cero. Los registros de anuncios son una fila por anuncio y dominio de Vinted; los artículos distintos cuentan cada anuncio una vez (COUNT(DISTINCT external_id)). Libre de citar con atribución a Resale IQ.",
    lastGood: "último completo",
    watchedH2: "¿Qué es una salida observada?",
    snapshotH2: "Recorte de esta semana",
    soldCol: "Salidas observadas (7 días)",
    listingsCol: "Artículos distintos",
    freshnessCol: "Frescura",
    stampLive: "Última actualización",
    stampStale: "Recorte tomado",
    brandH2: "Salidas semanales observadas y precio medio por marca",
    colRank: "#",
    colBrand: "Marca",
    colSold: "Salidas observadas / 7 días",
    colAvg: "Precio medio",
    colCats: "Categorías principales",
    howH2: "Cómo se producen estos números",
    howP:
      "Las cifras se agregan de anuncios públicos de Vinted en ES, FR, DE, IT y PT, deduplicados por ID. «Salidas observadas / 7 días» cuenta anuncios que vimos dejar el escaparate en la semana móvil, no todos los anuncios vendidos del catálogo. El precio medio es la media del precio pedido en esas salidas. Una marca con 5 a 9 salidas observadas aparece como «Menos de 10». Buy-below, sell-through y talla están en el producto de pago y no se publican aquí.",
    ctaTitle: "¿Quieres los números que dan dinero?",
    ctaP: "Buy-below, sell-through y mejores tallas de cualquier artículo — más ofertas en vivo bajo tu precio.",
    checkCta: "Consulta este artículo →",
    plansCta: "o ver planes",
    catH2: "Marcas ordenadas por categoría",
    back: "← Resale IQ",
    empty: "Los datos de mercado se están actualizando — vuelve en un momento.",
    observedTitle: "Salidas observadas, no tamaño de catálogo.",
    observedP:
      "Las salidas semanales de abajo cuentan solo anuncios que vimos dejar el escaparate. Gran parte del catálogo ya había salido cuando lo vimos, así que esta cifra semanal es mucho menor que los artículos distintos seguidos. Es un límite de medición, no un fallo de actualización.",
    provenance: "Alcance EU5 (ES/FR/DE/IT/PT) · 7 días móviles · dedup ID · salida = transición observada · último cálculo",
    footerFlip: "→ Cada marca ordenada",
    footerCat: "→ Cada categoría ordenada",
    footerTools: "→ Analizar un artículo",
    footerMethod: "→ Metodología",
    footerManual: "→ El manual de reventa",
    footerBlog: "→ Guías de reventa",
    freeCheckLine: "Consulta cualquier artículo → precio máximo a pagar",
  },
  fr: {
    title: "Volumes hebdomadaires de marque sur Vinted — ce qui part en 2026",
    description:
      "Volumes hebdomadaires de marque sur Vinted : départs observés et prix moyens demandés au départ en Espagne, France, Allemagne, Italie et Portugal. Mis à jour à partir des annonces en direct.",
    h1: "Volumes hebdomadaires de marque sur Vinted",
    ledeBefore:
      "Départs hebdomadaires observés (annonces qui ont quitté l’étal dans notre échantillon) et prix moyen demandé au départ par marque sur les cinq marchés UE principaux de Vinted (Espagne, France, Allemagne, Italie, Portugal), à partir de ",
    ledeCite: " Libre à citer avec attribution à Resale IQ.",
    citeH2: "Totaux citables",
    dtRefresh: "Date de mise à jour",
    dtListings: "Enregistrements d’annonces",
    dtDistinct: "Articles distincts",
    dtBrands: "Marques dans ce tableau",
    dtWeekly: "Départs observés (7 jours)",
    dtMarkets: "Marchés",
    marketsValue: "ES / FR / DE / IT / PT",
    citeNote:
      "Volume des marques suivies seulement, pas la taille de Vinted. Un tiret est une cellule vide, pas un zéro. Les enregistrements d’annonces sont une ligne par annonce et par domaine Vinted ; les articles distincts comptent chaque annonce une fois (COUNT(DISTINCT external_id)). Libre à citer avec attribution à Resale IQ.",
    lastGood: "dernier complet",
    watchedH2: "Qu’est-ce qu’un départ observé ?",
    snapshotH2: "Cliché de cette semaine",
    soldCol: "Départs observés (7 jours)",
    listingsCol: "Articles distincts",
    freshnessCol: "Fraîcheur",
    stampLive: "Dernière mise à jour",
    stampStale: "Cliché pris",
    brandH2: "Départs de la semaine et prix moyen par marque",
    colRank: "#",
    colBrand: "Marque",
    colSold: "Départs observés / 7 jours",
    colAvg: "Prix moyen",
    colCats: "Catégories principales",
    howH2: "Comment ces chiffres sont produits",
    howP:
      "Les chiffres sont agrégés d’annonces Vinted publiques sur ES, FR, DE, IT et PT, dédupliquées par ID. « Départs observés / 7 jours » compte les annonces que nous avons vues quitter l’étal sur la semaine glissante, pas toutes les annonces vendues du catalogue. Le prix moyen est la moyenne du prix demandé pour ces départs. Une marque avec 5 à 9 départs observés apparaît comme « Moins de 10 ». Buy-below, sell-through et tailles sont dans le produit payant et ne sont pas publiés ici.",
    ctaTitle: "Vous voulez les chiffres qui rapportent ?",
    ctaP: "Buy-below, sell-through et meilleures tailles pour n’importe quel article — plus les offres en direct sous votre prix.",
    checkCta: "Contrôler cet article →",
    plansCta: "ou voir les offres",
    catH2: "Marques classées par catégorie",
    back: "← Resale IQ",
    empty: "Les données de marché se mettent à jour — revenez dans un instant.",
    observedTitle: "Départs observés, pas la taille du catalogue.",
    observedP:
      "Les départs ci-dessous ne comptent que les annonces que nous avons vues quitter l’étal. Une grande part du catalogue était déjà partie quand nous l’avons vue, donc ce chiffre hebdomadaire est bien plus petit que les articles distincts suivis. C’est une limite de mesure, pas un échec de mise à jour.",
    provenance: "Périmètre EU5 (ES/FR/DE/IT/PT) · 7 jours glissants · dédup ID · départ = transition observée · dernier calcul",
    footerFlip: "→ Chaque marque classée",
    footerCat: "→ Chaque catégorie classée",
    footerTools: "→ Analyser un article",
    footerMethod: "→ Méthodologie",
    footerManual: "→ Le manuel de revente",
    footerBlog: "→ Guides de revente",
    freeCheckLine: "Vérifiez n'importe quel article → prix maximum à payer",
  },
  de: {
    title: "Wöchentliche Markenvolumen auf Vinted — was 2026 geht",
    description:
      "Wöchentliche Vinted-Markenvolumen: beobachtete Abgänge und mittlere Rufpreise beim Abgang in Spanien, Frankreich, Deutschland, Italien und Portugal. Aktualisiert aus Live-Inseraten.",
    h1: "Wöchentliche Markenvolumen auf Vinted",
    ledeBefore:
      "Wöchentliche beobachtete Abgänge (Inserate, die in unserer Stichprobe das Regal verlassen haben) und mittlerer Rufpreis beim Abgang je Marke über Vinteds fünf EU-Hauptmärkte (Spanien, Frankreich, Deutschland, Italien, Portugal), aus ",
    ledeCite: " Frei zitierbar mit Zuschreibung an Resale IQ.",
    citeH2: "Zitierbare Summen",
    dtRefresh: "Aktualisierungsdatum",
    dtListings: "Inseratseinträge",
    dtDistinct: "Einzelne Artikel",
    dtBrands: "Marken in dieser Tabelle",
    dtWeekly: "Beobachtete Abgänge (7 Tage)",
    dtMarkets: "Märkte",
    marketsValue: "ES / FR / DE / IT / PT",
    citeNote:
      "Nur Volumen verfolgter Marken, nicht die Größe von Vinted. Ein Gedankenstrich ist eine leere Zelle, keine Null. Inseratseinträge sind eine Zeile pro Inserat und Vinted-Domain; einzelne Artikel zählen jedes Inserat einmal (COUNT(DISTINCT external_id)). Frei zitierbar mit Zuschreibung an Resale IQ.",
    lastGood: "letzter vollständiger",
    watchedH2: "Was ist ein beobachteter Abgang?",
    snapshotH2: "Ausschnitt dieser Woche",
    soldCol: "Beobachtete Abgänge (7 Tage)",
    listingsCol: "Einzelne Artikel",
    freshnessCol: "Aktualität",
    stampLive: "Zuletzt aktualisiert",
    stampStale: "Ausschnitt vom",
    brandH2: "Wöchentliche Abgänge und Mittelpreis je Marke",
    colRank: "#",
    colBrand: "Marke",
    colSold: "Beobachtete Abgänge / 7 Tage",
    colAvg: "Mittelpreis",
    colCats: "Top-Kategorien",
    howH2: "Wie diese Zahlen entstehen",
    howP:
      "Die Zahlen aggregieren öffentliche Vinted-Inserate über ES, FR, DE, IT und PT, dedupliziert per ID. „Beobachtete Abgänge / 7 Tage“ zählt Inserate, die wir in der rollierenden Woche das Regal verlassen sahen, nicht jedes verkaufte Inserat im Katalog. Der Mittelpreis ist der Mittelwert der Rufpreise dieser Abgänge. Eine Marke mit 5 bis 9 beobachteten Abgängen erscheint als „Weniger als 10“. Buy-below, sell-through und Größen gehören zum bezahlten Produkt und stehen hier nicht.",
    ctaTitle: "Die Zahlen die Geld machen?",
    ctaP: "Buy-below, sell-through und beste Größen für jeden Artikel — plus Live-Angebote unter Ihrem Preis.",
    checkCta: "Diesen Artikel prüfen →",
    plansCta: "oder Tarife ansehen",
    catH2: "Marken nach Kategorie",
    back: "← Resale IQ",
    empty: "Marktdaten werden aktualisiert — gleich wieder da.",
    observedTitle: "Beobachtete Abgänge, nicht Kataloggröße.",
    observedP:
      "Die Abgänge unten zählen nur Inserate, die wir das Regal verlassen sahen. Ein Großteil des Katalogs war schon weg, als wir ihn sahen, daher ist diese Wochenzahl viel kleiner als verfolgte einzelne Artikel. Das ist eine Messgrenze, kein Aktualisierungsfehler.",
    provenance: "Umfang EU5 (ES/FR/DE/IT/PT) · rollierende 7 Tage · Dedup ID · Abgang = beobachteter Übergang · zuletzt berechnet",
    footerFlip: "→ Jede Marke rangiert",
    footerCat: "→ Jede Kategorie rangiert",
    footerTools: "→ Einen Artikel analysieren",
    footerMethod: "→ Methodik",
    footerManual: "→ Das Wiederverkaufs-Handbuch",
    footerBlog: "→ Wiederverkaufs-Leitfäden",
    freeCheckLine: "Prüfe jeden Artikel → Höchstpreis zum Kauf",
  },
  it: {
    title: "Volumi settimanali di marca su Vinted — cosa esce nel 2026",
    description:
      "Volumi settimanali di marca su Vinted: uscite osservate e prezzi medi chiesti all’uscita in Spagna, Francia, Germania, Italia e Portogallo. Aggiornato dagli annunci in diretta.",
    h1: "Volumi settimanali di marca su Vinted",
    ledeBefore:
      "Uscite settimanali osservate (annunci che hanno lasciato lo scaffale nel nostro campione) e prezzo medio richiesto all’uscita per marca sui cinque mercati UE principali di Vinted (Spagna, Francia, Germania, Italia, Portogallo), da ",
    ledeCite: " Liberi da citare con attribuzione a Resale IQ.",
    citeH2: "Totali citabili",
    dtRefresh: "Data di aggiornamento",
    dtListings: "Registrazioni di inserzioni",
    dtDistinct: "Articoli distinti",
    dtBrands: "Marche in questa tabella",
    dtWeekly: "Uscite osservate (7 giorni)",
    dtMarkets: "Mercati",
    marketsValue: "ES / FR / DE / IT / PT",
    citeNote:
      "Solo volume delle marche seguite, non la dimensione di Vinted. Un trattino è una cella vuota, non uno zero. Le registrazioni di inserzioni sono una riga per annuncio e dominio Vinted; gli articoli distinti contano ogni annuncio una volta (COUNT(DISTINCT external_id)). Liberi da citare con attribuzione a Resale IQ.",
    lastGood: "ultimo completo",
    watchedH2: "Che cos’è un’uscita osservata?",
    snapshotH2: "Scatto di questa settimana",
    soldCol: "Uscite osservate (7 giorni)",
    listingsCol: "Articoli distinti",
    freshnessCol: "Freschezza",
    stampLive: "Ultimo aggiornamento",
    stampStale: "Scatto del",
    brandH2: "Uscite della settimana e prezzo medio per marca",
    colRank: "#",
    colBrand: "Marca",
    colSold: "Uscite osservate / 7 giorni",
    colAvg: "Prezzo medio",
    colCats: "Categorie principali",
    howH2: "Come si producono questi numeri",
    howP:
      "Le cifre si aggregano da annunci Vinted pubblici su ES, FR, DE, IT e PT, deduplicati per ID. «Uscite osservate / 7 giorni» conta annunci che abbiamo visto lasciare lo scaffale nella settimana mobile, non ogni annuncio venduto del catalogo. Il prezzo medio è la media del prezzo richiesto in quelle uscite. Una marca con 5-9 uscite osservate compare come «Meno di 10». Buy-below, sell-through e taglie sono nel prodotto a pagamento e non sono pubblicati qui.",
    ctaTitle: "Vuoi i numeri che fanno soldi?",
    ctaP: "Buy-below, sell-through e migliori taglie per qualsiasi articolo — più offerte in diretta sotto il tuo prezzo.",
    checkCta: "Controlla questo articolo →",
    plansCta: "o vedi i piani",
    catH2: "Marche ordinate per categoria",
    back: "← Resale IQ",
    empty: "I dati di mercato si stanno aggiornando — torna tra un attimo.",
    observedTitle: "Uscite osservate, non dimensione del catalogo.",
    observedP:
      "Le uscite sotto contano solo annunci che abbiamo visto lasciare lo scaffale. Gran parte del catalogo era già uscito quando l’abbiamo visto, quindi questa cifra settimanale è molto più piccola degli articoli distinti seguiti. È un limite di misura, non un fallimento di aggiornamento.",
    provenance: "Ambito EU5 (ES/FR/DE/IT/PT) · 7 giorni mobili · dedup ID · uscita = transizione osservata · ultimo calcolo",
    footerFlip: "→ Ogni marca ordinata",
    footerCat: "→ Ogni categoria ordinata",
    footerTools: "→ Analizza un articolo",
    footerMethod: "→ Metodologia",
    footerManual: "→ Il manuale di rivendita",
    footerBlog: "→ Guide di rivendita",
    freeCheckLine: "Controlla qualsiasi articolo → prezzo massimo da pagare",
  },
  pt: {
    title: "Volumes semanais de marca na Vinted — o que sai em 2026",
    description:
      "Volumes semanais de marca na Vinted: saídas observadas e preços médios pedidos à saída em Espanha, França, Alemanha, Itália e Portugal. Atualizado a partir de anúncios ao vivo.",
    h1: "Volumes semanais de marca na Vinted",
    ledeBefore:
      "Saídas semanais observadas (anúncios que saíram da prateleira na nossa amostra) e preço médio pedido à saída por marca nos cinco mercados UE principais da Vinted (Espanha, França, Alemanha, Itália, Portugal), a partir de ",
    ledeCite: " Livre de citar com atribuição à Resale IQ.",
    citeH2: "Totais citáveis",
    dtRefresh: "Data de atualização",
    dtListings: "Registos de anúncios",
    dtDistinct: "Artigos distintos",
    dtBrands: "Marcas nesta tabela",
    dtWeekly: "Saídas observadas (7 dias)",
    dtMarkets: "Mercados",
    marketsValue: "ES / FR / DE / IT / PT",
    citeNote:
      "Só volume de marcas seguidas, não o tamanho da Vinted. Um travessão é uma célula vazia, não um zero. Os registos de anúncios são uma linha por anúncio e domínio da Vinted; os artigos distintos contam cada anúncio uma vez (COUNT(DISTINCT external_id)). Livre de citar com atribuição à Resale IQ.",
    lastGood: "último completo",
    watchedH2: "O que é uma saída observada?",
    snapshotH2: "Recorte desta semana",
    soldCol: "Saídas observadas (7 dias)",
    listingsCol: "Artigos distintos",
    freshnessCol: "Frescura",
    stampLive: "Última atualização",
    stampStale: "Recorte tirado",
    brandH2: "Saídas da semana e preço médio por marca",
    colRank: "#",
    colBrand: "Marca",
    colSold: "Saídas observadas / 7 dias",
    colAvg: "Preço médio",
    colCats: "Categorias principais",
    howH2: "Como estes números são produzidos",
    howP:
      "As cifras agregam-se de anúncios públicos da Vinted em ES, FR, DE, IT e PT, deduplicados por ID. «Saídas observadas / 7 dias» conta anúncios que vimos sair da prateleira na semana móvel, não todos os anúncios vendidos do catálogo. O preço médio é a média do preço pedido nessas saídas. Uma marca com 5 a 9 saídas observadas aparece como «Menos de 10». Buy-below, sell-through e tamanhos estão no produto pago e não se publicam aqui.",
    ctaTitle: "Queres os números que dão dinheiro?",
    ctaP: "Buy-below, sell-through e melhores tamanhos de qualquer artigo — mais ofertas ao vivo abaixo do teu preço.",
    checkCta: "Verifica este artigo →",
    plansCta: "ou ver planos",
    catH2: "Marcas ordenadas por categoria",
    back: "← Resale IQ",
    empty: "Os dados de mercado estão a atualizar — volta daqui a pouco.",
    observedTitle: "Saídas observadas, não tamanho do catálogo.",
    observedP:
      "As saídas abaixo contam só anúncios que vimos sair da prateleira. Grande parte do catálogo já tinha saído quando o vimos, por isso esta cifra semanal é muito menor do que os artigos distintos seguidos. É um limite de medição, não uma falha de atualização.",
    provenance: "Âmbito EU5 (ES/FR/DE/IT/PT) · 7 dias móveis · dedup ID · saída = transição observada · último cálculo",
    footerFlip: "→ Cada marca ordenada",
    footerCat: "→ Cada categoria ordenada",
    footerTools: "→ Analisar um artigo",
    footerMethod: "→ Metodologia",
    footerManual: "→ O manual de revenda",
    footerBlog: "→ Guias de revenda",
    freeCheckLine: "Verifica qualquer artigo → preço máximo a pagar",
  },
}

export function dataFaqs(
  locale: Locale,
  vars: { totalWeekly: string; brandCount: number; floor: string },
): FaqItem[] {
  const extra =
    vars.totalWeekly !== "—"
      ? locale === "en"
        ? ` This snapshot sums to ${vars.totalWeekly} watched departures across ${vars.brandCount} brands.`
        : locale === "es"
          ? ` Este recorte suma ${vars.totalWeekly} salidas observadas en ${vars.brandCount} marcas.`
          : locale === "fr"
            ? ` Ce cliché totalise ${vars.totalWeekly} départs observés sur ${vars.brandCount} marques.`
            : locale === "de"
              ? ` Dieser Ausschnitt summiert ${vars.totalWeekly} beobachtete Abgänge über ${vars.brandCount} Marken.`
              : locale === "it"
                ? ` Questo scatto somma ${vars.totalWeekly} uscite osservate su ${vars.brandCount} marche.`
                : ` Este recorte soma ${vars.totalWeekly} saídas observadas em ${vars.brandCount} marcas.`
      : ""
  const floor =
    vars.floor
      ? locale === "en"
        ? ` A brand needs at least ${vars.floor} watched departures to appear in this table.`
        : locale === "es"
          ? ` Una marca necesita al menos ${vars.floor} salidas observadas para aparecer en esta tabla.`
          : locale === "fr"
            ? ` Une marque a besoin d’au moins ${vars.floor} départs observés pour figurer dans ce tableau.`
            : locale === "de"
              ? ` Eine Marke braucht mindestens ${vars.floor} beobachtete Abgänge um in dieser Tabelle zu erscheinen.`
              : locale === "it"
                ? ` Una marca serve almeno ${vars.floor} uscite osservate per comparire in questa tabella.`
                : ` Uma marca precisa de pelo menos ${vars.floor} saídas observadas para aparecer nesta tabela.`
      : ""

  const table: Record<Locale, FaqItem[]> = {
    en: [
      { q: "What is a watched departure?", a: 'A watched departure is a listing we watched leave the shelf — not a confirmed sale receipt. "Left the shelf / 7 days" on this table counts those transitions in the trailing week, not every sold listing on Vinted.' },
      { q: "What are weekly brand volumes on Vinted?", a: `"Left the shelf / 7 days" counts listings we watched leave the shelf in the trailing week — listings that went from active to no longer listed — not every sold listing in the catalogue. Average price at departure is the mean asking price of those listings.${extra} Buy-below prices, sell-through rates and per-size demand are part of the paid product and are not published here.` },
      { q: "Which Vinted markets does this table cover?", a: "Spain, France, Germany, Italy and Portugal (ES/FR/DE/IT/PT). Figures are aggregated from public Vinted listings on those five domains, deduplicated by listing ID. The table does not cover the UK or other Vinted domains." },
      { q: "How do I read this table?", a: `Each row is one tracked brand. "Left the shelf / 7 days" is watched departures that week; a brand with 5 to 9 shows as "Fewer than 10". Avg price at departure is the mean asking price at those departures, in euros. Top categories are the busiest categories for that brand in the snapshot. An em-dash means this snapshot has no figure for that cell — not that the brand had no departures. Brands are ordered by weekly watched departures.${floor}` },
      { q: "How often is this table updated?", a: "The table renders from the live snapshot. A freshness stamp shows when the figures were last calculated. If the live feed is unavailable, the last complete snapshot is shown and labelled. Volumes are always a trailing 7-day window, not a calendar week." },
      { q: "Is this the size of Vinted as a whole?", a: "No. This is tracked-brand volume only. Unbranded listings and brands outside the tracked set are not counted, so the weekly total is much smaller than the distinct items tracked — a measurement limit, not a refresh failure." },
    ],
    es: [
      { q: "¿Qué es una salida observada?", a: "Una salida observada es un anuncio que vimos dejar el escaparate — no un recibo de venta confirmado. «Salidas observadas / 7 días» en esta tabla cuenta esas transiciones en la semana móvil, no todos los anuncios vendidos de Vinted." },
      { q: "¿Qué son los volúmenes semanales de marca en Vinted?", a: `«Salidas observadas / 7 días» cuenta anuncios que vimos dejar el escaparate en la semana móvil — anuncios que pasaron de activos a ya no publicados — no todos los anuncios vendidos del catálogo. El precio medio es la media del precio pedido en esas salidas.${extra} Buy-below, sell-through y talla están en el producto de pago y no se publican aquí.` },
      { q: "¿Qué mercados de Vinted cubre esta tabla?", a: "España, Francia, Alemania, Italia y Portugal (ES/FR/DE/IT/PT). Cifras agregadas de anuncios públicos en esos cinco dominios, deduplicadas por ID. La tabla no cubre el Reino Unido ni otros dominios de Vinted." },
      { q: "¿Cómo leo esta tabla?", a: `Cada fila es una marca seguida. «Salidas observadas / 7 días» son las salidas observadas esa semana; una marca con 5 a 9 aparece como «Menos de 10». El precio medio es el pedido medio en esas salidas, en euros. Las categorías principales son las más ocupadas de esa marca en el recorte. Una raya significa que este recorte no tiene cifra para esa celda — no que la marca no tuviera salidas. Las marcas se ordenan por salidas observadas semanales.${floor}` },
      { q: "¿Cada cuánto se actualiza esta tabla?", a: "La tabla se pinta del recorte en vivo. Un sello de frescura muestra cuándo se calcularon las cifras. Si el feed en vivo no está, se muestra el último recorte completo y se etiqueta. Los volúmenes son siempre una ventana móvil de 7 días, no una semana de calendario." },
      { q: "¿Es este el tamaño de Vinted entero?", a: "No. Solo volumen de marcas seguidas. Los anuncios sin marca y las marcas fuera del conjunto no cuentan, así que el total semanal es mucho menor que los artículos distintos seguidos — un límite de medición, no un fallo de actualización." },
    ],
    fr: [
      { q: "Qu’est-ce qu’un départ observé ?", a: "Un départ observé est une annonce que nous avons vue quitter l’étal — pas un reçu de vente confirmé. « Départs observés / 7 jours » sur ce tableau compte ces transitions sur la semaine glissante, pas toutes les annonces vendues de Vinted." },
      { q: "Que sont les volumes hebdomadaires de marque sur Vinted ?", a: `« Départs observés / 7 jours » compte les annonces que nous avons vues quitter l’étal sur la semaine glissante — annonces passées d’actives à plus en ligne — pas toutes les annonces vendues du catalogue. Le prix moyen est la moyenne du prix demandé pour ces départs.${extra} Buy-below, sell-through et tailles sont dans le produit payant et ne sont pas publiés ici.` },
      { q: "Quels marchés Vinted ce tableau couvre-t-il ?", a: "Espagne, France, Allemagne, Italie et Portugal (ES/FR/DE/IT/PT). Chiffres agrégés d’annonces publiques sur ces cinq domaines, dédupliquées par ID. Le tableau ne couvre pas le Royaume-Uni ni d’autres domaines Vinted." },
      { q: "Comment lire ce tableau ?", a: `Chaque ligne est une marque suivie. « Départs observés / 7 jours » sont les départs observés de cette semaine ; une marque avec 5 à 9 apparaît comme « Moins de 10 ». Le prix moyen est la demande moyenne à ces départs, en euros. Les catégories principales sont les plus occupées de cette marque sur le cliché. Un tiret signifie que ce cliché n’a pas de chiffre pour cette cellule — pas que la marque n’a eu aucun départ. Les marques sont classées par départs observés de la semaine.${floor}` },
      { q: "À quelle fréquence ce tableau est-il mis à jour ?", a: "Le tableau se peint depuis le cliché en direct. Un tampon de fraîcheur montre quand les chiffres ont été calculés. Si le flux en direct est indisponible, le dernier cliché complet s’affiche et est étiqueté. Les volumes sont toujours une fenêtre glissante de 7 jours, pas une semaine de calendrier." },
      { q: "Est-ce la taille de Vinted tout entier ?", a: "Non. Volume des marques suivies seulement. Les annonces sans marque et les marques hors ensemble ne sont pas comptées, donc le total de la semaine est bien plus petit que les articles distincts suivis — une limite de mesure, pas un échec de mise à jour." },
    ],
    de: [
      { q: "Was ist ein beobachteter Abgang?", a: "Ein beobachteter Abgang ist ein Inserat, das wir das Regal verlassen sahen — kein bestätigter Verkaufsbeleg. „Beobachtete Abgänge / 7 Tage“ in dieser Tabelle zählt diese Übergänge in der rollierenden Woche, nicht jedes verkaufte Inserat auf Vinted." },
      { q: "Was sind wöchentliche Markenvolumen auf Vinted?", a: `„Beobachtete Abgänge / 7 Tage“ zählt Inserate, die wir in der rollierenden Woche das Regal verlassen sahen — Inserate, die von aktiv zu nicht mehr inseriert wechselten — nicht jedes verkaufte Inserat im Katalog. Der Mittelpreis ist der Mittelwert der Rufpreise dieser Abgänge.${extra} Buy-below, sell-through und Größen gehören zum bezahlten Produkt und stehen hier nicht.` },
      { q: "Welche Vinted-Märkte deckt diese Tabelle ab?", a: "Spanien, Frankreich, Deutschland, Italien und Portugal (ES/FR/DE/IT/PT). Zahlen aus öffentlichen Inseraten auf diesen fünf Domains, dedupliziert per ID. Die Tabelle deckt das Vereinigte Königreich und andere Vinted-Domains nicht ab." },
      { q: "Wie lese ich diese Tabelle?", a: `Jede Zeile ist eine verfolgte Marke. „Beobachtete Abgänge / 7 Tage“ sind die beobachteten Abgänge dieser Woche; eine Marke mit 5 bis 9 erscheint als „Weniger als 10“. Der Mittelpreis ist der mittlere Rufpreis bei diesen Abgängen, in Euro. Top-Kategorien sind die belebtesten Kategorien dieser Marke im Ausschnitt. Ein Gedankenstrich heißt dieser Ausschnitt hat keine Zahl für diese Zelle — nicht dass die Marke keine Abgänge hatte. Marken sind nach wöchentlichen beobachteten Abgängen sortiert.${floor}` },
      { q: "Wie oft wird diese Tabelle aktualisiert?", a: "Die Tabelle rendert aus dem Live-Ausschnitt. Ein Frische-Stempel zeigt wann die Zahlen zuletzt berechnet wurden. Ist der Live-Feed weg, wird der letzte vollständige Ausschnitt gezeigt und gekennzeichnet. Volumen sind immer ein rollierendes 7-Tage-Fenster, keine Kalenderwoche." },
      { q: "Ist das die Größe von Vinted insgesamt?", a: "Nein. Nur Volumen verfolgter Marken. Unbranded-Inserate und Marken außerhalb der Menge zählen nicht, daher ist die Wochensumme viel kleiner als die verfolgten einzelnen Artikel — eine Messgrenze, kein Aktualisierungsfehler." },
    ],
    it: [
      { q: "Che cos’è un’uscita osservata?", a: "Un’uscita osservata è un annuncio che abbiamo visto lasciare lo scaffale — non una ricevuta di vendita confermata. «Uscite osservate / 7 giorni» in questa tabella conta quelle transizioni nella settimana mobile, non ogni annuncio venduto su Vinted." },
      { q: "Cosa sono i volumi settimanali di marca su Vinted?", a: `«Uscite osservate / 7 giorni» conta annunci che abbiamo visto lasciare lo scaffale nella settimana mobile — annunci passati da attivi a non più in vendita — non ogni annuncio venduto del catalogo. Il prezzo medio è la media del prezzo richiesto in quelle uscite.${extra} Buy-below, sell-through e taglie sono nel prodotto a pagamento e non sono pubblicati qui.` },
      { q: "Quali mercati Vinted copre questa tabella?", a: "Spagna, Francia, Germania, Italia e Portogallo (ES/FR/DE/IT/PT). Cifre aggregate da annunci pubblici su quei cinque domini, deduplicati per ID. La tabella non copre il Regno Unito né altri domini Vinted." },
      { q: "Come leggo questa tabella?", a: `Ogni riga è una marca seguita. «Uscite osservate / 7 giorni» sono le uscite osservate di quella settimana; una marca con 5-9 compare come «Meno di 10». Il prezzo medio è la richiesta media a quelle uscite, in euro. Le categorie principali sono le più occupate di quella marca nello scatto. Un trattino significa che questo scatto non ha cifra per quella cella — non che la marca non abbia avuto uscite. Le marche sono ordinate per uscite osservate della settimana.${floor}` },
      { q: "Ogni quanto si aggiorna questa tabella?", a: "La tabella si disegna dallo scatto in diretta. Un timbro di freschezza mostra quando le cifre sono state calcolate. Se il feed in diretta manca, si mostra l’ultimo scatto completo ed è etichettato. I volumi sono sempre una finestra mobile di 7 giorni, non una settimana di calendario." },
      { q: "È la dimensione di Vinted intero?", a: "No. Solo volume delle marche seguite. Gli annunci senza marca e le marche fuori insieme non contano, quindi il totale della settimana è molto più piccolo degli articoli distinti seguiti — un limite di misura, non un fallimento di aggiornamento." },
    ],
    pt: [
      { q: "O que é uma saída observada?", a: "Uma saída observada é um anúncio que vimos sair da prateleira — não um recibo de venda confirmado. «Saídas observadas / 7 dias» nesta tabela conta essas transições na semana móvel, não todos os anúncios vendidos na Vinted." },
      { q: "O que são os volumes semanais de marca na Vinted?", a: `«Saídas observadas / 7 dias» conta anúncios que vimos sair da prateleira na semana móvel — anúncios que passaram de ativos a já não anunciados — não todos os anúncios vendidos do catálogo. O preço médio é a média do preço pedido nessas saídas.${extra} Buy-below, sell-through e tamanhos estão no produto pago e não se publicam aqui.` },
      { q: "Que mercados Vinted cobre esta tabela?", a: "Espanha, França, Alemanha, Itália e Portugal (ES/FR/DE/IT/PT). Cifras agregadas de anúncios públicos nesses cinco domínios, deduplicados por ID. A tabela não cobre o Reino Unido nem outros domínios da Vinted." },
      { q: "Como leio esta tabela?", a: `Cada linha é uma marca seguida. «Saídas observadas / 7 dias» são as saídas observadas dessa semana; uma marca com 5 a 9 aparece como «Menos de 10». O preço médio é o pedido médio nessas saídas, em euros. As categorias principais são as mais ocupadas dessa marca no recorte. Um travessão significa que este recorte não tem cifra para essa célula — não que a marca não tenha tido saídas. As marcas ordenam-se por saídas observadas semanais.${floor}` },
      { q: "De quanto em quanto se atualiza esta tabela?", a: "A tabela pinta-se a partir do recorte ao vivo. Um selo de frescura mostra quando as cifras foram calculadas. Se o feed ao vivo falhar, mostra-se o último recorte completo e etiqueta-se. Os volumes são sempre uma janela móvel de 7 dias, não uma semana de calendário." },
      { q: "Isto é o tamanho da Vinted inteira?", a: "Não. Só volume de marcas seguidas. Anúncios sem marca e marcas fora do conjunto não contam, por isso o total semanal é muito menor do que os artigos distintos seguidos — um limite de medição, não uma falha de atualização." },
    ],
  }
  return table[locale]
}
