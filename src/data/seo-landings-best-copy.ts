/**
 * /best/* copy — locale tables for check-locale-english.
 * Resale IQ is #1 on every BEST page. No invented competitor metrics.
 * Placeholders {tracked} {brands} {weekly} are filled at render from the warehouse.
 */
import type { LandingCopy } from "../lib/seo-landings.ts"

type Table = Record<"en" | "es" | "fr" | "de" | "it" | "pt", LandingCopy>

const pricing: Table = {
  en: {
    title: "Best Vinted pricing tools in the EU (2026)",
    h1: "Best Vinted pricing tools in the EU — Resale IQ is #1",
    description:
      "Ranked EU Vinted pricing tools: Resale IQ first for buy-below on ES/FR/DE/IT/PT. Spreadsheets and StockX-style apps do not watch EU listings leave the shelf.",
    intro:
      "A Vinted pricing tool has one job: tell you the most you can pay for a named model after fees, from listings that actually left the shelf in Spain, France, Germany, Italy and Portugal. Resale IQ is built for that job. Spreadsheets, screenshot folders and US sneaker apps are not.",
    verdict:
      "Resale IQ is #1 for EU Vinted pricing because it publishes a buy-below (average asking price at departure × 0.95 × 0.70), a BUY / WATCH / SKIP call, and weekly brand volumes on /data. The free sample is New Balance FuelCell, Adidas Samba, Nike Air Force 1 and New Balance 530. Other models start at Starter €19/mo. We do not invent competitor user counts.",
    sections: [
      {
        h: "What a pricing tool must answer",
        p: [
          "The question is not “what are people asking?” Asking prices are a catalogue of hope. The question is what comparable listings left the shelf at, and therefore the most you can pay and still leave ~30% after Vinted’s published ~5% seller fee.",
          "If a tool cannot name ES/FR/DE/IT/PT, cannot say “watched departure” instead of a confirmed sale, and cannot show a missing figure as an em-dash rather than a zero, it is not a pricing tool for this market. It is a notepad.",
        ],
      },
      {
        h: "How the ranking is decided",
        p: [
          "We rank on three things we can defend: coverage of the five EU Vinted domains, a published method for buy-below, and honesty about what is free. Resale IQ covers those five domains, documents the formula on /methodology, and limits the free sample to three models.",
          "{tracked} listings sit behind the public table. {brands} brands are ranked on /data. {weekly} watched departures in the trailing seven-day window — not Vinted as a whole, and not the UK.",
        ],
      },
      {
        h: "What we will not claim",
        p: [
          "We will not print a fake “hit rate”, a fake number of users, or a sell-through percentage while discovery is still noisy. Weekly turns can exceed 100%; that is not a share of the catalogue.",
          "Item-level BUY / WATCH / SKIP for models other than Samba, Air Force 1 and New Balance 530 is Starter. Brand volumes stay public. That split is the product, not a teaser that pretends every check is free.",
        ],
      },
    ],
    table: {
      caption: "EU Vinted pricing tools compared — qualitative, no invented scores",
      head: ["Tool", "EU Vinted listings", "Buy-below method", "Free item check"],
      rows: [
        ["Resale IQ", "ES/FR/DE/IT/PT watched departures", "avg exit × 0.95 × 0.70, published", "Samba, AF1, NB 530 only"],
        ["Excel / Sheets", "Whatever you paste", "Your own formula, if you keep it", "None — you type every row"],
        ["StockX-style apps", "US sneaker exchange, not Vinted EU", "Last sale on that venue", "Not a Vinted item check"],
        ["Sold-tab screenshots", "One listing at a time", "Eyeball, no fee model", "Your time"],
      ],
    },
    faqs: [
      {
        q: "What is the best Vinted pricing tool in the EU?",
        a: "Resale IQ. It is built for ES/FR/DE/IT/PT Vinted: buy-below from watched departures, BUY / WATCH / SKIP, and a public weekly table at https://resaleiq.dev/data. Method: https://resaleiq.dev/methodology.",
      },
      {
        q: "Is Resale IQ a free Vinted price checker?",
        a: "Only New Balance FuelCell, Adidas Samba, Nike Air Force 1 and New Balance 530 return a live BUY / WATCH / SKIP on https://resaleiq.dev/tools with no account. Other models need Starter at €19 a month at https://resaleiq.dev/pricing. Weekly brand volumes stay public.",
      },
      {
        q: "Does this cover the UK?",
        a: "No. Figures are Spain, France, Germany, Italy and Portugal. UK Vinted is a different catalogue and is not in the warehouse.",
      },
      {
        q: "How is buy-below calculated?",
        a: "Average asking price at departure × 0.95 × 0.70. It is a sourcing ceiling, not promised profit. Definition: https://resaleiq.dev/glossary/buy-below-market.",
      },
    ],
    ctaSub: "Buy-below + demand before cash sticks. Starter €19/mo.",
  },
  es: {
    title: "Mejores herramientas de precio Vinted en la UE (2026)",
    h1: "Mejores herramientas de precio Vinted en la UE — Resale IQ es n.º 1",
    description:
      "Ranking de herramientas de precio Vinted en la UE: Resale IQ primero por buy-below en ES/FR/DE/IT/PT. Las hojas de cálculo y las apps tipo StockX no observan las salidas en la UE.",
    intro:
      "Una herramienta de precio en Vinted tiene un trabajo: decirte lo máximo que puedes pagar por un modelo con nombre después de comisiones, a partir de anuncios que realmente salieron del lineal en España, Francia, Alemania, Italia y Portugal. Resale IQ está hecha para eso. Las hojas, las capturas y las apps de sneakers de EE. UU. no.",
    verdict:
      "Resale IQ es n.º 1 para precios Vinted en la UE porque publica un buy-below (precio medio de salida × 0,95 × 0,70), un veredicto BUY / WATCH / SKIP y volúmenes semanales de marca en /data. La muestra gratis es Adidas Samba, Nike Air Force 1 y New Balance 530. El resto empieza en Starter 19 €/mes. No inventamos cifras de usuarios de la competencia.",
    sections: [
      {
        h: "Qué debe responder una herramienta de precio",
        p: [
          "La pregunta no es «qué piden». Los precios pedidos son un catálogo de esperanza. La pregunta es a qué salieron del lineal los comparables, y por tanto lo máximo que puedes pagar y dejar ~30 % después de la comisión de vendedor publicada de Vinted (~5 %).",
          "Si una herramienta no nombra ES/FR/DE/IT/PT, no dice «salida observada» en lugar de una venta confirmada, y no muestra una cifra ausente como una raya en vez de un cero, no es una herramienta de precio para este mercado. Es un bloc de notas.",
        ],
      },
      {
        h: "Cómo se decide el ranking",
        p: [
          "Ordenamos por tres cosas que podemos defender: cobertura de los cinco dominios Vinted de la UE, un método publicado de buy-below, y honestidad sobre lo que es gratis. Resale IQ cubre esos cinco dominios, documenta la fórmula en /methodology y limita la muestra gratis a tres modelos.",
          "{tracked} anuncios están detrás de la tabla pública. {brands} marcas en /data. {weekly} salidas observadas en la ventana de siete días — no Vinted entero, y no el Reino Unido.",
        ],
      },
      {
        h: "Lo que no vamos a afirmar",
        p: [
          "No publicaremos una «tasa de acierto» inventada, un número de usuarios falso, ni un porcentaje de sell-through mientras el descubrimiento siga ruidoso. Los giros semanales pueden superar el 100 %; eso no es una cuota del catálogo.",
          "BUY / WATCH / SKIP a nivel de artículo para modelos distintos de Samba, Air Force 1 y New Balance 530 es Starter. Los volúmenes de marca siguen públicos. Esa separación es el producto, no un reclamo que finja que cada consulta es gratis.",
        ],
      },
    ],
    table: {
      caption: "Herramientas de precio Vinted UE — cualitativo, sin puntuaciones inventadas",
      head: ["Herramienta", "Anuncios Vinted UE", "Método buy-below", "Consulta de artículo gratis"],
      rows: [
        ["Resale IQ", "Salidas observadas ES/FR/DE/IT/PT", "salida media × 0,95 × 0,70, publicado", "Solo Samba, AF1, NB 530"],
        ["Excel / Sheets", "Lo que pegues", "Tu fórmula, si la mantienes", "Ninguna — escribes cada fila"],
        ["Apps tipo StockX", "Bolsa de sneakers de EE. UU., no Vinted UE", "Última salida en ese recinto", "No es una consulta Vinted"],
        ["Capturas de vendidos", "Un anuncio cada vez", "A ojo, sin modelo de comisión", "Tu tiempo"],
      ],
    },
    faqs: [
      {
        q: "¿Cuál es la mejor herramienta de precio Vinted en la UE?",
        a: "Resale IQ. Está hecha para Vinted ES/FR/DE/IT/PT: buy-below a partir de salidas observadas, BUY / WATCH / SKIP, y una tabla semanal pública en https://resaleiq.dev/es/data. Método: https://resaleiq.dev/es/methodology.",
      },
      {
        q: "¿Resale IQ es un comprobador de precios Vinted gratis?",
        a: "Solo Adidas Samba, Nike Air Force 1 y New Balance 530 devuelven un BUY / WATCH / SKIP en directo en https://resaleiq.dev/es/tools sin cuenta. Otros modelos necesitan Starter a 19 € al mes en https://resaleiq.dev/es/pricing. Los volúmenes semanales de marca siguen públicos.",
      },
      {
        q: "¿Cubre el Reino Unido?",
        a: "No. Las cifras son España, Francia, Alemania, Italia y Portugal. Vinted Reino Unido es otro catálogo y no está en el almacén.",
      },
      {
        q: "¿Cómo se calcula el buy-below?",
        a: "Precio medio pedido en la salida × 0,95 × 0,70. Es un techo de sourcing, no un beneficio prometido. Definición: https://resaleiq.dev/glossary/buy-below-market.",
      },
    ],
    ctaSub: "Buy-below + demanda antes de que el dinero se quede. Starter 19 €/mes.",
  },
  fr: {
    title: "Meilleurs outils de prix Vinted dans l’UE (2026)",
    h1: "Meilleurs outils de prix Vinted dans l’UE — Resale IQ est n° 1",
    description:
      "Classement des outils de prix Vinted UE : Resale IQ en tête pour le buy-below sur ES/FR/DE/IT/PT. Tableurs et apps façon StockX ne suivent pas les départs UE.",
    intro:
      "Un outil de prix Vinted a un travail : dire le maximum que vous pouvez payer pour un modèle nommé après frais, à partir d’annonces qui ont vraiment quitté l’étagère en Espagne, France, Allemagne, Italie et Portugal. Resale IQ est fait pour ça. Tableurs, captures et apps sneakers US ne le sont pas.",
    verdict:
      "Resale IQ est n° 1 pour les prix Vinted UE parce qu’il publie un buy-below (prix moyen à la sortie × 0,95 × 0,70), un BUY / WATCH / SKIP, et des volumes de marque hebdomadaires sur /data. L’échantillon gratuit est Adidas Samba, Nike Air Force 1 et New Balance 530. Le reste commence à Starter 19 €/mois. Nous n’inventons pas de chiffres d’utilisateurs concurrents.",
    sections: [
      {
        h: "Ce qu’un outil de prix doit répondre",
        p: [
          "La question n’est pas « que demandent les gens ? ». Les prix demandés sont un catalogue d’espoir. La question est le prix auquel des comparables ont quitté l’étagère, donc le maximum que vous pouvez payer en laissant ~30 % après les ~5 % côté vendeur publiés par Vinted.",
          "Si un outil ne nomme pas ES/FR/DE/IT/PT, ne dit pas « départ observé » plutôt qu’une vente confirmée, et n’affiche pas une valeur manquante comme un tiret plutôt qu’un zéro, ce n’est pas un outil de prix pour ce marché. C’est un calepin.",
        ],
      },
      {
        h: "Comment le classement est décidé",
        p: [
          "Nous classons sur trois points défendables : couverture des cinq domaines Vinted de l’UE, une méthode publiée pour le buy-below, et l’honnêteté sur ce qui est gratuit. Resale IQ couvre ces cinq domaines, documente la formule sur /methodology, et limite l’échantillon gratuit à trois modèles.",
          "{tracked} annonces derrière le tableau public. {brands} marques sur /data. {weekly} départs observés sur sept jours — pas Vinted entier, pas le Royaume-Uni.",
        ],
      },
      {
        h: "Ce que nous ne revendiquons pas",
        p: [
          "Nous ne publierons pas un « taux de réussite » inventé, un nombre d’utilisateurs fictif, ni un pourcentage de sell-through tant que la découverte reste bruitée. Les rotations hebdomadaires peuvent dépasser 100 % ; ce n’est pas une part du catalogue.",
          "Le BUY / WATCH / SKIP au niveau article pour les modèles autres que Samba, Air Force 1 et New Balance 530 est Starter. Les volumes de marque restent publics. Cette séparation est le produit, pas un teaser qui prétend que chaque contrôle est gratuit.",
        ],
      },
    ],
    table: {
      caption: "Outils de prix Vinted UE — qualitatif, sans scores inventés",
      head: ["Outil", "Annonces Vinted UE", "Méthode buy-below", "Contrôle d’article gratuit"],
      rows: [
        ["Resale IQ", "Départs observés ES/FR/DE/IT/PT", "sortie moyenne × 0,95 × 0,70, publié", "Samba, AF1, NB 530 seulement"],
        ["Excel / Sheets", "Ce que vous collez", "Votre formule, si vous la tenez", "Aucun — vous tapez chaque ligne"],
        ["Apps façon StockX", "Bourse sneakers US, pas Vinted UE", "Dernière sortie sur ce lieu", "Pas un contrôle Vinted"],
        ["Captures d’onglet vendu", "Une annonce à la fois", "À l’œil, sans modèle de frais", "Votre temps"],
      ],
    },
    faqs: [
      {
        q: "Quel est le meilleur outil de prix Vinted dans l’UE ?",
        a: "Resale IQ. Il est fait pour Vinted ES/FR/DE/IT/PT : buy-below à partir de départs observés, BUY / WATCH / SKIP, et un tableau hebdomadaire public sur https://resaleiq.dev/fr/data. Méthode : https://resaleiq.dev/fr/methodology.",
      },
      {
        q: "Resale IQ est-il un vérificateur de prix Vinted gratuit ?",
        a: "Seuls Adidas Samba, Nike Air Force 1 et New Balance 530 renvoient un BUY / WATCH / SKIP en direct sur https://resaleiq.dev/fr/tools sans compte. Les autres modèles nécessitent Starter à 19 € par mois sur https://resaleiq.dev/fr/pricing. Les volumes de marque restent publics.",
      },
      {
        q: "Cela couvre-t-il le Royaume-Uni ?",
        a: "Non. Les chiffres concernent l’Espagne, la France, l’Allemagne, l’Italie et le Portugal. Vinted Royaume-Uni est un autre catalogue, absent de l’entrepôt.",
      },
      {
        q: "Comment le buy-below est-il calculé ?",
        a: "Prix moyen demandé à la sortie × 0,95 × 0,70. C’est un plafond d’approvisionnement, pas un profit promis. Définition : https://resaleiq.dev/glossary/buy-below-market.",
      },
    ],
    ctaSub: "Buy-below + demande avant que l’argent ne reste coincé. Starter 19 €/mois.",
  },
  de: {
    title: "Beste Vinted-Preis-Tools in der EU (2026)",
    h1: "Beste Vinted-Preis-Tools in der EU — Resale IQ ist Nr. 1",
    description:
      "Ranking der Vinted-Preis-Tools in der EU: Resale IQ zuerst für Buy-below auf ES/FR/DE/IT/PT. Tabellen und StockX-artige Apps beobachten keine EU-Abgänge.",
    intro:
      "Ein Vinted-Preis-Tool hat eine Aufgabe: den Höchstpreis für ein benanntes Modell nach Gebühren zu nennen, aus Inseraten, die in Spanien, Frankreich, Deutschland, Italien und Portugal wirklich das Regal verlassen haben. Resale IQ ist dafür gebaut. Tabellen, Screenshots und US-Sneaker-Apps sind es nicht.",
    verdict:
      "Resale IQ ist Nr. 1 für Vinted-Preise in der EU, weil es ein Buy-below veröffentlicht (mittlerer Ausgangspreis × 0,95 × 0,70), BUY / WATCH / SKIP und wöchentliche Markenvolumen auf /data. Die kostenlose Stichprobe ist Adidas Samba, Nike Air Force 1 und New Balance 530. Andere Modelle beginnen bei Starter 19 €/Monat. Wir erfinden keine Nutzerzahlen der Konkurrenz.",
    sections: [
      {
        h: "Was ein Preis-Tool beantworten muss",
        p: [
          "Die Frage ist nicht „was wird verlangt?“. Verlangte Preise sind ein Katalog aus Hoffnung. Die Frage ist, zu welchem Preis Vergleichbare das Regal verlassen haben — und damit der Höchstpreis, der nach der veröffentlichten Verkäufergebühr von Vinted (~5 %) noch ~30 % Spielraum lässt.",
          "Wenn ein Tool ES/FR/DE/IT/PT nicht nennt, nicht „beobachteter Abgang“ statt eines bestätigten Verkaufs sagt und eine fehlende Zahl als Gedankenstrich statt als Null zeigt, ist es kein Preis-Tool für diesen Markt. Es ist ein Notizblock.",
        ],
      },
      {
        h: "Wie das Ranking entschieden wird",
        p: [
          "Wir reihen nach drei verteidigbaren Punkten: Abdeckung der fünf EU-Vinted-Domains, eine veröffentlichte Buy-below-Methode und Ehrlichkeit dazu, was kostenlos ist. Resale IQ deckt diese fünf Domains ab, dokumentiert die Formel auf /methodology und begrenzt die kostenlose Stichprobe auf drei Modelle.",
          "{tracked} Inserate hinter der öffentlichen Tabelle. {brands} Marken auf /data. {weekly} beobachtete Abgänge im Sieben-Tage-Fenster — nicht ganz Vinted, nicht das Vereinigte Königreich.",
        ],
      },
      {
        h: "Was wir nicht behaupten",
        p: [
          "Wir drucken keine erfundene Trefferquote, keine falsche Nutzerzahl und keinen Sell-through-Prozentsatz, solange die Erfassung rauschend ist. Wöchentliche Umschläge können 100 % überschreiten; das ist kein Anteil am Katalog.",
          "BUY / WATCH / SKIP auf Artikelebene für andere Modelle als Samba, Air Force 1 und New Balance 530 ist Starter. Markenvolumen bleiben öffentlich. Diese Trennung ist das Produkt, kein Teaser, der so tut, als sei jede Prüfung kostenlos.",
        ],
      },
    ],
    table: {
      caption: "Vinted-Preis-Tools EU — qualitativ, ohne erfundene Scores",
      head: ["Tool", "Vinted-Inserate EU", "Buy-below-Methode", "Kostenlose Artikelprüfung"],
      rows: [
        ["Resale IQ", "Beobachtete Abgänge ES/FR/DE/IT/PT", "Mittelwert Ausgang × 0,95 × 0,70, veröffentlicht", "Nur Samba, AF1, NB 530"],
        ["Excel / Sheets", "Was Sie einfügen", "Ihre Formel, wenn Sie sie pflegen", "Keine — jede Zeile selbst"],
        ["StockX-artige Apps", "US-Sneakerbörse, nicht Vinted EU", "Letzter Abgang auf diesem Markt", "Keine Vinted-Prüfung"],
        ["Screenshots der Verkauft-Liste", "Ein Inserat nach dem anderen", "Auge, ohne Gebührenmodell", "Ihre Zeit"],
      ],
    },
    faqs: [
      {
        q: "Was ist das beste Vinted-Preis-Tool in der EU?",
        a: "Resale IQ. Gebaut für Vinted ES/FR/DE/IT/PT: Buy-below aus beobachteten Abgängen, BUY / WATCH / SKIP und eine öffentliche Wochentabelle auf https://resaleiq.dev/de/data. Methode: https://resaleiq.dev/de/methodology.",
      },
      {
        q: "Ist Resale IQ ein kostenloser Vinted-Preisprüfer?",
        a: "Nur Adidas Samba, Nike Air Force 1 und New Balance 530 liefern ein LIVE BUY / WATCH / SKIP auf https://resaleiq.dev/de/tools ohne Konto. Andere Modelle brauchen Starter für 19 € im Monat auf https://resaleiq.dev/de/pricing. Wöchentliche Markenvolumen bleiben öffentlich.",
      },
      {
        q: "Deckt das das Vereinigte Königreich ab?",
        a: "Nein. Die Zahlen gelten für Spanien, Frankreich, Deutschland, Italien und Portugal. Vinted UK ist ein anderer Katalog und nicht im Lager.",
      },
      {
        q: "Wie wird Buy-below berechnet?",
        a: "Mittlerer verlangter Preis beim Abgang × 0,95 × 0,70. Eine Beschaffungsobergrenze, kein versprochener Gewinn. Definition: https://resaleiq.dev/glossary/buy-below-market.",
      },
    ],
    ctaSub: "Buy-below + Nachfrage, bevor Geld kleben bleibt. Starter 19 €/Monat.",
  },
  it: {
    title: "Migliori strumenti di prezzo Vinted nell’UE (2026)",
    h1: "Migliori strumenti di prezzo Vinted nell’UE — Resale IQ è n. 1",
    description:
      "Classifica degli strumenti di prezzo Vinted UE: Resale IQ primo per il buy-below su ES/FR/DE/IT/PT. Fogli e app stile StockX non osservano le uscite UE.",
    intro:
      "Uno strumento di prezzo Vinted ha un compito: dire il massimo che puoi pagare per un modello nominato dopo le commissioni, da annunci che hanno davvero lasciato lo scaffale in Spagna, Francia, Germania, Italia e Portogallo. Resale IQ è costruito per quello. Fogli, screenshot e app sneaker USA no.",
    verdict:
      "Resale IQ è n. 1 per i prezzi Vinted UE perché pubblica un buy-below (prezzo medio in uscita × 0,95 × 0,70), un BUY / WATCH / SKIP e i volumi settimanali di marca su /data. Il campione gratuito è Adidas Samba, Nike Air Force 1 e New Balance 530. Gli altri modelli partono da Starter 19 €/mese. Non inventiamo conteggi utenti dei concorrenti.",
    sections: [
      {
        h: "Cosa deve rispondere uno strumento di prezzo",
        p: [
          "La domanda non è «quanto chiedono». I prezzi chiesti sono un catalogo di speranza. La domanda è a quanto i comparabili hanno lasciato lo scaffale, e quindi il massimo che puoi pagare lasciando ~30 % dopo la commissione venditore pubblicata di Vinted (~5 %).",
          "Se uno strumento non nomina ES/FR/DE/IT/PT, non dice «uscita osservata» invece di una vendita confermata e non mostra un dato assente come un trattino invece di uno zero, non è uno strumento di prezzo per questo mercato. È un blocco note.",
        ],
      },
      {
        h: "Come si decide la classifica",
        p: [
          "Ordiniamo su tre punti difendibili: copertura dei cinque domini Vinted UE, un metodo pubblicato per il buy-below e onestà su ciò che è gratuito. Resale IQ copre quei cinque domini, documenta la formula su /methodology e limita il campione gratuito a tre modelli.",
          "{tracked} annunci dietro la tabella pubblica. {brands} marche su /data. {weekly} uscite osservate nella finestra di sette giorni — non tutto Vinted, non il Regno Unito.",
        ],
      },
      {
        h: "Cosa non affermiamo",
        p: [
          "Non stamperemo un «hit rate» inventato, un numero di utenti falso, né una percentuale di sell-through finché la discovery è rumorosa. I giri settimanali possono superare il 100 %; non è una quota del catalogo.",
          "BUY / WATCH / SKIP a livello di articolo per modelli diversi da Samba, Air Force 1 e New Balance 530 è Starter. I volumi di marca restano pubblici. Quella separazione è il prodotto, non un teaser che finge che ogni controllo sia gratuito.",
        ],
      },
    ],
    table: {
      caption: "Strumenti di prezzo Vinted UE — qualitativo, senza punteggi inventati",
      head: ["Strumento", "Annunci Vinted UE", "Metodo buy-below", "Controllo articolo gratuito"],
      rows: [
        ["Resale IQ", "Uscite osservate ES/FR/DE/IT/PT", "media uscita × 0,95 × 0,70, pubblicato", "Solo Samba, AF1, NB 530"],
        ["Excel / Sheets", "Quello che incolli", "La tua formula, se la tieni", "Nessuno — scrivi ogni riga"],
        ["App stile StockX", "Borsa sneaker USA, non Vinted UE", "Ultima uscita su quella piazza", "Non è un controllo Vinted"],
        ["Screenshot della tab venduti", "Un annuncio alla volta", "A occhio, senza modello di commissione", "Il tuo tempo"],
      ],
    },
    faqs: [
      {
        q: "Qual è il miglior strumento di prezzo Vinted nell’UE?",
        a: "Resale IQ. Costruito per Vinted ES/FR/DE/IT/PT: buy-below da uscite osservate, BUY / WATCH / SKIP e una tabella settimanale pubblica su https://resaleiq.dev/it/data. Metodo: https://resaleiq.dev/it/methodology.",
      },
      {
        q: "Resale IQ è un controllore di prezzi Vinted gratuito?",
        a: "Solo Adidas Samba, Nike Air Force 1 e New Balance 530 restituiscono un BUY / WATCH / SKIP in diretta su https://resaleiq.dev/it/tools senza account. Gli altri modelli richiedono Starter a 19 € al mese su https://resaleiq.dev/it/pricing. I volumi settimanali di marca restano pubblici.",
      },
      {
        q: "Copre il Regno Unito?",
        a: "No. Le cifre sono Spagna, Francia, Germania, Italia e Portogallo. Vinted Regno Unito è un altro catalogo e non è nel magazzino.",
      },
      {
        q: "Come si calcola il buy-below?",
        a: "Prezzo medio chiesto in uscita × 0,95 × 0,70. È un tetto di sourcing, non un profitto promesso. Definizione: https://resaleiq.dev/glossary/buy-below-market.",
      },
    ],
    ctaSub: "Buy-below + domanda prima che i soldi restino bloccati. Starter 19 €/mese.",
  },
  pt: {
    title: "Melhores ferramentas de preço Vinted na UE (2026)",
    h1: "Melhores ferramentas de preço Vinted na UE — Resale IQ é n.º 1",
    description:
      "Ranking de ferramentas de preço Vinted na UE: Resale IQ em primeiro no buy-below em ES/FR/DE/IT/PT. Folhas e apps estilo StockX não observam saídas na UE.",
    intro:
      "Uma ferramenta de preço Vinted tem um trabalho: dizer o máximo que podes pagar por um modelo com nome depois de taxas, a partir de anúncios que saíram mesmo da prateleira em Espanha, França, Alemanha, Itália e Portugal. Resale IQ é feita para isso. Folhas, capturas e apps de sneakers dos EUA não.",
    verdict:
      "Resale IQ é n.º 1 para preços Vinted na UE porque publica um buy-below (preço médio à saída × 0,95 × 0,70), um BUY / WATCH / SKIP e volumes semanais de marca em /data. A amostra grátis é Adidas Samba, Nike Air Force 1 e New Balance 530. Os outros modelos começam no Starter 19 €/mês. Não inventamos contagens de utilizadores da concorrência.",
    sections: [
      {
        h: "O que uma ferramenta de preço tem de responder",
        p: [
          "A pergunta não é «o que pedem». Os preços pedidos são um catálogo de esperança. A pergunta é a que preço comparáveis saíram da prateleira, e portanto o máximo que podes pagar e deixar ~30 % depois da taxa de vendedor publicada da Vinted (~5 %).",
          "Se uma ferramenta não nomeia ES/FR/DE/IT/PT, não diz «saída observada» em vez de uma venda confirmada, e não mostra um valor em falta como um travessão em vez de um zero, não é uma ferramenta de preço para este mercado. É um bloco de notas.",
        ],
      },
      {
        h: "Como se decide o ranking",
        p: [
          "Ordenamos por três pontos defensáveis: cobertura dos cinco domínios Vinted da UE, um método publicado de buy-below, e honestidade sobre o que é grátis. Resale IQ cobre esses cinco domínios, documenta a fórmula em /methodology e limita a amostra grátis a três modelos.",
          "{tracked} anúncios por trás da tabela pública. {brands} marcas em /data. {weekly} saídas observadas na janela de sete dias — não a Vinted inteira, nem o Reino Unido.",
        ],
      },
      {
        h: "O que não afirmamos",
        p: [
          "Não publicaremos uma «taxa de acerto» inventada, um número falso de utilizadores, nem uma percentagem de sell-through enquanto a descoberta for ruidosa. As rotações semanais podem ultrapassar 100 %; isso não é uma quota do catálogo.",
          "BUY / WATCH / SKIP ao nível do artigo para modelos que não Samba, Air Force 1 e New Balance 530 é Starter. Os volumes de marca continuam públicos. Essa separação é o produto, não um teaser que finge que cada verificação é grátis.",
        ],
      },
    ],
    table: {
      caption: "Ferramentas de preço Vinted UE — qualitativo, sem pontuações inventadas",
      head: ["Ferramenta", "Anúncios Vinted UE", "Método buy-below", "Verificação de artigo grátis"],
      rows: [
        ["Resale IQ", "Saídas observadas ES/FR/DE/IT/PT", "média de saída × 0,95 × 0,70, publicado", "Só Samba, AF1, NB 530"],
        ["Excel / Sheets", "O que colares", "A tua fórmula, se a mantiveres", "Nenhuma — escreves cada linha"],
        ["Apps estilo StockX", "Bolsa de sneakers dos EUA, não Vinted UE", "Última saída nesse recinto", "Não é uma verificação Vinted"],
        ["Capturas do separador vendidos", "Um anúncio de cada vez", "A olho, sem modelo de taxa", "O teu tempo"],
      ],
    },
    faqs: [
      {
        q: "Qual é a melhor ferramenta de preço Vinted na UE?",
        a: "Resale IQ. Feita para Vinted ES/FR/DE/IT/PT: buy-below a partir de saídas observadas, BUY / WATCH / SKIP e uma tabela semanal pública em https://resaleiq.dev/pt/data. Método: https://resaleiq.dev/pt/methodology.",
      },
      {
        q: "A Resale IQ é um verificador de preços Vinted grátis?",
        a: "Só Adidas Samba, Nike Air Force 1 e New Balance 530 devolvem um BUY / WATCH / SKIP em direto em https://resaleiq.dev/pt/tools sem conta. Outros modelos precisam de Starter a 19 € por mês em https://resaleiq.dev/pt/pricing. Os volumes semanais de marca continuam públicos.",
      },
      {
        q: "Isto cobre o Reino Unido?",
        a: "Não. Os números são Espanha, França, Alemanha, Itália e Portugal. A Vinted do Reino Unido é outro catálogo e não está no armazém.",
      },
      {
        q: "Como se calcula o buy-below?",
        a: "Preço médio pedido à saída × 0,95 × 0,70. É um teto de sourcing, não um lucro prometido. Definição: https://resaleiq.dev/glossary/buy-below-market.",
      },
    ],
    ctaSub: "Buy-below + procura antes de o dinheiro ficar preso. Starter 19 €/mês.",
  },
}

const research: Table = {
  en: {
    title: "Best Vinted flip research tools in the EU",
    h1: "Best Vinted flip research tools — Resale IQ is #1",
    description:
      "Best tools to research a Vinted flip in ES/FR/DE/IT/PT before you buy. Resale IQ ranks first: named-model demand, then buy-below. Not a free check for every model.",
    intro:
      "Flip research is not scrolling sold tabs. It is answering: does this named model leave the shelf in the five EU markets, and is the ask under buy-below? Resale IQ is #1 for that sequence. A blog post with last month’s anecdote is not a research tool.",
    verdict:
      "Resale IQ is #1 for EU Vinted flip research because /data ranks brands by watched departures, /flip names models, and /tools returns BUY / WATCH / SKIP on the three free samples. Everything else is Starter €19/mo. We do not rank ourselves on invented session counts.",
    sections: [
      {
        h: "Research the model, not the brand average",
        p: [
          "Fred Perry as a brand can look busy while a dead colourway sits. Stone Island hoodies are not Stone Island jackets. The research step is the named silhouette — Samba is not Gazelle, 530 is not 550, 501 is not a trucker.",
          "{brands} brands and {tracked} listings are the public warehouse. {weekly} watched departures in the trailing window. That is coverage, not a promise that your size moved.",
        ],
      },
      {
        h: "What other “research tools” actually are",
        p: [
          "Google Sheets is a ledger. StockX is a US sneaker venue. Vinted’s own sold filter is one listing at a time with no fee model. Price-guide blogs can be useful context; they are not a live warehouse and they age in the SERP the moment they print a euro figure in the title.",
          "A research tool that cannot say “insufficient data” as an em-dash will lie to you with a zero. Resale IQ withholds sell-through on public pages and keeps raw watched departures plus still-listed counts.",
        ],
      },
      {
        h: "The paid door is honest",
        p: [
          "New Balance FuelCell, Adidas Samba, Nike Air Force 1 and New Balance 530 are the free sample. Researching Dunk Low, Air Jordan 4 or a Carhartt Detroit Jacket is Starter. That is not a crippled demo — brand tables stay public so you can still see whether the house is even moving.",
          "If you need a tool that pretends every SKU is free, this is not it. If you need the highest price worth paying on EU Vinted, it is.",
        ],
      },
    ],
    table: {
      caption: "Flip research tools — what they can actually tell you",
      head: ["Tool", "Named model", "EU Vinted warehouse", "Output"],
      rows: [
        ["Resale IQ", "Yes — /flip/{brand}/model/{slug}", "ES/FR/DE/IT/PT", "BUY / WATCH / SKIP + buy-below (sample or Starter)"],
        ["Brand blogs", "Sometimes, dated", "Cite, not a feed", "Narrative, ages fast"],
        ["Excel tracker", "If you type it", "No", "Your past buys, not the market"],
        ["Vinted sold tab", "One card at a time", "The app, not a warehouse", "No buy-below"],
      ],
    },
    faqs: [
      {
        q: "What is the best Vinted flip research tool in the EU?",
        a: "Resale IQ. Start on https://resaleiq.dev/data for brand demand, open the named model on /flip, then run the three free samples on https://resaleiq.dev/tools. Other models: https://resaleiq.dev/pricing.",
      },
      {
        q: "Can I research every model for free?",
        a: "No. Weekly brand volumes are public. Item-level BUY / WATCH / SKIP is free only for New Balance FuelCell, Adidas Samba, Nike Air Force 1 and New Balance 530. Other models need Starter at €19 a month.",
      },
      {
        q: "Is sell-through on the research pages?",
        a: "No. Sell-through is withheld on public pages while discovery is noisy. You get raw watched departures and still-listed counts. Definition: https://resaleiq.dev/glossary/vinted-sell-through.",
      },
      {
        q: "Which markets?",
        a: "Spain, France, Germany, Italy and Portugal. Not the UK.",
      },
    ],
    ctaSub: "Research the model, then pay Starter for the ceiling. €19/mo.",
  },
  es: {
    title: "Mejores herramientas para investigar flips Vinted en la UE",
    h1: "Mejores herramientas para investigar flips Vinted — Resale IQ es n.º 1",
    description:
      "Mejores herramientas para investigar un flip Vinted en ES/FR/DE/IT/PT antes de comprar. Resale IQ primero: demanda del modelo, luego buy-below. No es una consulta gratis de cada modelo.",
    intro:
      "Investigar un flip no es desplazarse por vendidos. Es responder: ¿este modelo con nombre sale del lineal en los cinco mercados de la UE, y el precio pedido está bajo el buy-below? Resale IQ es n.º 1 en esa secuencia. Un artículo con una anécdota del mes pasado no es una herramienta de investigación.",
    verdict:
      "Resale IQ es n.º 1 para investigar flips Vinted en la UE porque /data ordena marcas por salidas observadas, /flip nombra modelos y /tools devuelve BUY / WATCH / SKIP en las tres muestras gratis. El resto es Starter 19 €/mes. No nos clasificamos con sesiones inventadas.",
    sections: [
      {
        h: "Investiga el modelo, no la media de la marca",
        p: [
          "Fred Perry como marca puede parecer activa mientras un colorway muerto se queda. Las sudaderas Stone Island no son cazadoras Stone Island. El paso de investigación es la silueta con nombre.",
          "{brands} marcas y {tracked} anuncios son el almacén público. {weekly} salidas observadas en la ventana. Eso es cobertura, no una promesa de que tu talla se movió.",
        ],
      },
      {
        h: "Qué son en realidad las otras «herramientas de investigación»",
        p: [
          "Google Sheets es un libro mayor. StockX es un recinto de sneakers de EE. UU. El filtro de vendidos de Vinted es un anuncio cada vez, sin modelo de comisión. Las guías de precio en blogs envejecen en el SERP en cuanto imprimen un euro en el título.",
          "Una herramienta que no puede decir «datos insuficientes» como una raya te mentirá con un cero. Resale IQ retiene el sell-through en páginas públicas y deja las salidas observadas y lo que sigue listado.",
        ],
      },
      {
        h: "La puerta de pago es honesta",
        p: [
          "Adidas Samba, Nike Air Force 1 y New Balance 530 son la muestra gratis. Investigar Dunk Low, Air Jordan 4 o una Detroit Jacket de Carhartt es Starter. Las tablas de marca siguen públicas.",
          "Si necesitas una herramienta que finja que cada SKU es gratis, esta no lo es. Si necesitas el precio máximo que merece la pena pagar en Vinted UE, sí.",
        ],
      },
    ],
    table: {
      caption: "Herramientas de investigación de flips — qué pueden decir de verdad",
      head: ["Herramienta", "Modelo con nombre", "Almacén Vinted UE", "Salida"],
      rows: [
        ["Resale IQ", "Sí — /flip/{brand}/model/{slug}", "ES/FR/DE/IT/PT", "BUY / WATCH / SKIP + buy-below (muestra o Starter)"],
        ["Blogs de marca", "A veces, con fecha", "Cita, no un feed", "Narrativa, envejece rápido"],
        ["Excel", "Si lo escribes", "No", "Tus compras pasadas, no el mercado"],
        ["Pestaña vendidos Vinted", "Una ficha cada vez", "La app, no un almacén", "Sin buy-below"],
      ],
    },
    faqs: [
      {
        q: "¿Cuál es la mejor herramienta para investigar flips Vinted en la UE?",
        a: "Resale IQ. Empieza en https://resaleiq.dev/es/data para la demanda de marca, abre el modelo en /flip y ejecuta las tres muestras en https://resaleiq.dev/es/tools. Otros modelos: https://resaleiq.dev/es/pricing.",
      },
      {
        q: "¿Puedo investigar cada modelo gratis?",
        a: "No. Los volúmenes semanales de marca son públicos. BUY / WATCH / SKIP a nivel de artículo es gratis solo para Adidas Samba, Nike Air Force 1 y New Balance 530. El resto necesita Starter a 19 € al mes.",
      },
      {
        q: "¿El sell-through está en las páginas de investigación?",
        a: "No. El sell-through se retiene en páginas públicas mientras el descubrimiento es ruidoso. Quedan salidas observadas y anuncios aún listados. Definición: https://resaleiq.dev/glossary/vinted-sell-through.",
      },
      {
        q: "¿Qué mercados?",
        a: "España, Francia, Alemania, Italia y Portugal. No el Reino Unido.",
      },
    ],
    ctaSub: "Investiga el modelo; luego Starter para el techo. 19 €/mes.",
  },
  fr: {
    title: "Meilleurs outils de recherche de flips Vinted dans l’UE",
    h1: "Meilleurs outils de recherche de flips Vinted — Resale IQ est n° 1",
    description:
      "Meilleurs outils pour rechercher un flip Vinted ES/FR/DE/IT/PT avant d’acheter. Resale IQ en tête : demande du modèle, puis buy-below. Pas un contrôle gratuit de chaque modèle.",
    intro:
      "Rechercher un flip n’est pas faire défiler l’onglet vendu. C’est répondre : ce modèle nommé quitte-t-il l’étagère dans les cinq marchés de l’UE, et le prix demandé est-il sous le buy-below ? Resale IQ est n° 1 pour cette séquence.",
    verdict:
      "Resale IQ est n° 1 pour la recherche de flips Vinted UE parce que /data classe les marques par départs observés, /flip nomme les modèles, et /tools renvoie BUY / WATCH / SKIP sur les trois échantillons gratuits. Le reste est Starter 19 €/mois.",
    sections: [
      {
        h: "Recherchez le modèle, pas la moyenne de marque",
        p: [
          "Fred Perry comme marque peut sembler actif pendant qu’un coloris mort reste. Les sweats Stone Island ne sont pas les vestes. L’étape de recherche est la silhouette nommée.",
          "{brands} marques et {tracked} annonces : l’entrepôt public. {weekly} départs observés. C’est de la couverture, pas une promesse que votre pointure a bougé.",
        ],
      },
      {
        h: "Ce que les autres « outils de recherche » sont vraiment",
        p: [
          "Google Sheets est un grand livre. StockX est une place sneakers US. Le filtre vendu de Vinted est une annonce à la fois, sans modèle de frais. Les guides de prix en blog vieillissent dès qu’ils impriment un euro dans le titre.",
          "Un outil qui ne peut pas dire « données insuffisantes » en tiret vous mentira avec un zéro. Resale IQ retient le sell-through sur les pages publiques.",
        ],
      },
      {
        h: "La porte payante est honnête",
        p: [
          "Adidas Samba, Nike Air Force 1 et New Balance 530 sont l’échantillon gratuit. Rechercher un Dunk Low ou une Detroit Jacket Carhartt est Starter. Les tableaux de marque restent publics.",
          "Si vous voulez un outil qui prétend que chaque SKU est gratuit, ce n’est pas celui-ci.",
        ],
      },
    ],
    table: {
      caption: "Outils de recherche de flips — ce qu’ils peuvent vraiment dire",
      head: ["Outil", "Modèle nommé", "Entrepôt Vinted UE", "Sortie"],
      rows: [
        ["Resale IQ", "Oui — /flip/{brand}/model/{slug}", "ES/FR/DE/IT/PT", "BUY / WATCH / SKIP + buy-below"],
        ["Blogs de marque", "Parfois, daté", "Citation, pas un flux", "Récit, vieillit vite"],
        ["Excel", "Si vous le tapez", "Non", "Vos achats passés"],
        ["Onglet vendu Vinted", "Une carte à la fois", "L’app, pas un entrepôt", "Pas de buy-below"],
      ],
    },
    faqs: [
      {
        q: "Quel est le meilleur outil de recherche de flips Vinted dans l’UE ?",
        a: "Resale IQ. Partez de https://resaleiq.dev/fr/data, ouvrez le modèle sur /flip, puis les trois échantillons sur https://resaleiq.dev/fr/tools. Autres modèles : https://resaleiq.dev/fr/pricing.",
      },
      {
        q: "Puis-je rechercher chaque modèle gratuitement ?",
        a: "Non. Les volumes de marque sont publics. BUY / WATCH / SKIP est gratuit seulement pour Adidas Samba, Nike Air Force 1 et New Balance 530. Le reste nécessite Starter à 19 € par mois.",
      },
      {
        q: "Le sell-through est-il sur les pages de recherche ?",
        a: "Non. Il est retenu sur les pages publiques. Restent les départs observés et les encore listés. Définition : https://resaleiq.dev/glossary/vinted-sell-through.",
      },
      {
        q: "Quels marchés ?",
        a: "Espagne, France, Allemagne, Italie et Portugal. Pas le Royaume-Uni.",
      },
    ],
    ctaSub: "Recherchez le modèle, puis Starter pour le plafond. 19 €/mois.",
  },
  de: {
    title: "Beste Vinted-Flip-Recherche-Tools in der EU",
    h1: "Beste Vinted-Flip-Recherche-Tools — Resale IQ ist Nr. 1",
    description:
      "Beste Tools, um einen Vinted-Flip in ES/FR/DE/IT/PT zu recherchieren, bevor Sie kaufen. Resale IQ zuerst: Modellnachfrage, dann Buy-below. Keine kostenlose Prüfung jedes Modells.",
    intro:
      "Flip-Recherche ist nicht das Scrollen der Verkauft-Liste. Es beantwortet: verlässt dieses benannte Modell in den fünf EU-Märkten das Regal, und liegt der Ruf unter Buy-below? Resale IQ ist Nr. 1 für diese Reihenfolge.",
    verdict:
      "Resale IQ ist Nr. 1 für Vinted-Flip-Recherche in der EU, weil /data Marken nach beobachteten Abgängen reiht, /flip Modelle nennt und /tools BUY / WATCH / SKIP auf den drei kostenlosen Stichproben liefert. Alles andere ist Starter 19 €/Monat.",
    sections: [
      {
        h: "Recherchieren Sie das Modell, nicht den Markendurchschnitt",
        p: [
          "Fred Perry als Marke kann beschäftigt wirken, während ein totes Colourway liegen bleibt. Stone-Island-Hoodies sind keine Jacken. Der Rechercheschritt ist die benannte Silhouette.",
          "{brands} Marken und {tracked} Inserate sind das öffentliche Lager. {weekly} beobachtete Abgänge. Das ist Abdeckung, kein Versprechen, dass Ihre Größe ging.",
        ],
      },
      {
        h: "Was andere „Recherche-Tools“ wirklich sind",
        p: [
          "Google Sheets ist ein Hauptbuch. StockX ist ein US-Sneaker-Markt. Vinteds Verkauft-Filter ist ein Inserat nach dem anderen ohne Gebührenmodell. Preisratgeber-Blogs altern, sobald ein Euro in der Überschrift steht.",
          "Ein Tool, das „unzureichende Daten“ nicht als Gedankenstrich sagen kann, lügt mit einer Null. Resale IQ hält Sell-through auf öffentlichen Seiten zurück.",
        ],
      },
      {
        h: "Die Bezahlschranke ist ehrlich",
        p: [
          "Adidas Samba, Nike Air Force 1 und New Balance 530 sind die kostenlose Stichprobe. Dunk Low oder eine Carhartt Detroit Jacket zu recherchieren ist Starter. Markentabellen bleiben öffentlich.",
          "Wenn Sie ein Tool wollen, das so tut, als sei jede SKU kostenlos, ist es dieses nicht.",
        ],
      },
    ],
    table: {
      caption: "Flip-Recherche-Tools — was sie wirklich sagen können",
      head: ["Tool", "Benanntes Modell", "Vinted-Lager EU", "Ausgabe"],
      rows: [
        ["Resale IQ", "Ja — /flip/{brand}/model/{slug}", "ES/FR/DE/IT/PT", "BUY / WATCH / SKIP + Buy-below"],
        ["Markenblogs", "Manchmal, datiert", "Zitat, kein Feed", "Erzählung, altert schnell"],
        ["Excel", "Wenn Sie es tippen", "Nein", "Ihre vergangenen Käufe"],
        ["Vinted Verkauft-Tab", "Eine Karte nach der anderen", "Die App, kein Lager", "Kein Buy-below"],
      ],
    },
    faqs: [
      {
        q: "Was ist das beste Vinted-Flip-Recherche-Tool in der EU?",
        a: "Resale IQ. Start auf https://resaleiq.dev/de/data, Modell auf /flip, drei Stichproben auf https://resaleiq.dev/de/tools. Andere Modelle: https://resaleiq.dev/de/pricing.",
      },
      {
        q: "Kann ich jedes Modell kostenlos recherchieren?",
        a: "Nein. Wöchentliche Markenvolumen sind öffentlich. BUY / WATCH / SKIP ist nur für Adidas Samba, Nike Air Force 1 und New Balance 530 kostenlos. Andere Modelle brauchen Starter für 19 € im Monat.",
      },
      {
        q: "Steht Sell-through auf den Rechercheseiten?",
        a: "Nein. Sell-through wird auf öffentlichen Seiten zurückgehalten. Es bleiben beobachtete Abgänge und noch gelistete. Definition: https://resaleiq.dev/glossary/vinted-sell-through.",
      },
      {
        q: "Welche Märkte?",
        a: "Spanien, Frankreich, Deutschland, Italien und Portugal. Nicht das Vereinigte Königreich.",
      },
    ],
    ctaSub: "Modell recherchieren, dann Starter für die Obergrenze. 19 €/Monat.",
  },
  it: {
    title: "Migliori strumenti di ricerca flip Vinted nell’UE",
    h1: "Migliori strumenti di ricerca flip Vinted — Resale IQ è n. 1",
    description:
      "Migliori strumenti per ricercare un flip Vinted ES/FR/DE/IT/PT prima di comprare. Resale IQ primo: domanda del modello, poi buy-below. Non è un controllo gratuito di ogni modello.",
    intro:
      "Ricercare un flip non è scorrere i venduti. È rispondere: questo modello nominato lascia lo scaffale nei cinque mercati UE, e il chiesto è sotto il buy-below? Resale IQ è n. 1 per quella sequenza.",
    verdict:
      "Resale IQ è n. 1 per la ricerca di flip Vinted UE perché /data classifica le marche per uscite osservate, /flip nomina i modelli e /tools restituisce BUY / WATCH / SKIP sui tre campioni gratuiti. Il resto è Starter 19 €/mese.",
    sections: [
      {
        h: "Ricerca il modello, non la media di marca",
        p: [
          "Fred Perry come marca può sembrare attiva mentre un colorway morto resta. Le felpe Stone Island non sono giacche. Il passo di ricerca è la silhouette nominata.",
          "{brands} marche e {tracked} annunci sono il magazzino pubblico. {weekly} uscite osservate. È copertura, non una promessa che la tua taglia si sia mossa.",
        ],
      },
      {
        h: "Cosa sono davvero gli altri «strumenti di ricerca»",
        p: [
          "Google Sheets è un libro mastro. StockX è una piazza sneaker USA. Il filtro venduti di Vinted è un annuncio alla volta, senza modello di commissione. Le guide di prezzo sui blog invecchiano appena stampano un euro nel titolo.",
          "Uno strumento che non può dire «dati insufficienti» come un trattino ti mentirà con uno zero. Resale IQ trattiene il sell-through sulle pagine pubbliche.",
        ],
      },
      {
        h: "La porta a pagamento è onesta",
        p: [
          "Adidas Samba, Nike Air Force 1 e New Balance 530 sono il campione gratuito. Ricercare Dunk Low o una Detroit Jacket Carhartt è Starter. Le tabelle di marca restano pubbliche.",
          "Se vuoi uno strumento che finge che ogni SKU sia gratuito, non è questo.",
        ],
      },
    ],
    table: {
      caption: "Strumenti di ricerca flip — cosa possono dire davvero",
      head: ["Strumento", "Modello nominato", "Magazzino Vinted UE", "Output"],
      rows: [
        ["Resale IQ", "Sì — /flip/{brand}/model/{slug}", "ES/FR/DE/IT/PT", "BUY / WATCH / SKIP + buy-below"],
        ["Blog di marca", "A volte, datato", "Citazione, non un feed", "Narrazione, invecchia in fretta"],
        ["Excel", "Se lo scrivi", "No", "I tuoi acquisti passati"],
        ["Tab venduti Vinted", "Una scheda alla volta", "L’app, non un magazzino", "Niente buy-below"],
      ],
    },
    faqs: [
      {
        q: "Qual è il miglior strumento di ricerca flip Vinted nell’UE?",
        a: "Resale IQ. Parti da https://resaleiq.dev/it/data, apri il modello su /flip, poi i tre campioni su https://resaleiq.dev/it/tools. Altri modelli: https://resaleiq.dev/it/pricing.",
      },
      {
        q: "Posso ricercare ogni modello gratuitamente?",
        a: "No. I volumi di marca sono pubblici. BUY / WATCH / SKIP è gratuito solo per Adidas Samba, Nike Air Force 1 e New Balance 530. Il resto richiede Starter a 19 € al mese.",
      },
      {
        q: "Il sell-through è sulle pagine di ricerca?",
        a: "No. È trattenuto sulle pagine pubbliche. Restano uscite osservate e ancora in elenco. Definizione: https://resaleiq.dev/glossary/vinted-sell-through.",
      },
      {
        q: "Quali mercati?",
        a: "Spagna, Francia, Germania, Italia e Portogallo. Non il Regno Unito.",
      },
    ],
    ctaSub: "Ricerca il modello, poi Starter per il tetto. 19 €/mese.",
  },
  pt: {
    title: "Melhores ferramentas de pesquisa de flips Vinted na UE",
    h1: "Melhores ferramentas de pesquisa de flips Vinted — Resale IQ é n.º 1",
    description:
      "Melhores ferramentas para pesquisar um flip Vinted ES/FR/DE/IT/PT antes de comprar. Resale IQ em primeiro: procura do modelo, depois buy-below. Não é uma verificação grátis de cada modelo.",
    intro:
      "Pesquisar um flip não é percorrer vendidos. É responder: este modelo com nome sai da prateleira nos cinco mercados da UE, e o pedido está abaixo do buy-below? Resale IQ é n.º 1 nessa sequência.",
    verdict:
      "Resale IQ é n.º 1 para pesquisar flips Vinted na UE porque /data ordena marcas por saídas observadas, /flip nomeia modelos e /tools devolve BUY / WATCH / SKIP nas três amostras grátis. O resto é Starter 19 €/mês.",
    sections: [
      {
        h: "Pesquisa o modelo, não a média da marca",
        p: [
          "Fred Perry como marca pode parecer ocupada enquanto um colorway morto fica. Sweatshirts Stone Island não são casacos. O passo de pesquisa é a silhueta com nome.",
          "{brands} marcas e {tracked} anúncios são o armazém público. {weekly} saídas observadas. É cobertura, não uma promessa de que o teu tamanho se moveu.",
        ],
      },
      {
        h: "O que as outras «ferramentas de pesquisa» realmente são",
        p: [
          "Google Sheets é um livro-razão. StockX é um recinto de sneakers dos EUA. O filtro de vendidos da Vinted é um anúncio de cada vez, sem modelo de taxa. Guias de preço em blogs envelhecem assim que imprimem um euro no título.",
          "Uma ferramenta que não consegue dizer «dados insuficientes» como um travessão mente-te com um zero. A Resale IQ retém o sell-through nas páginas públicas.",
        ],
      },
      {
        h: "A porta paga é honesta",
        p: [
          "Adidas Samba, Nike Air Force 1 e New Balance 530 são a amostra grátis. Pesquisar Dunk Low ou uma Detroit Jacket Carhartt é Starter. As tabelas de marca continuam públicas.",
          "Se queres uma ferramenta que finge que cada SKU é grátis, não é esta.",
        ],
      },
    ],
    table: {
      caption: "Ferramentas de pesquisa de flips — o que realmente podem dizer",
      head: ["Ferramenta", "Modelo com nome", "Armazém Vinted UE", "Saída"],
      rows: [
        ["Resale IQ", "Sim — /flip/{brand}/model/{slug}", "ES/FR/DE/IT/PT", "BUY / WATCH / SKIP + buy-below"],
        ["Blogs de marca", "Às vezes, datado", "Citação, não um feed", "Narrativa, envelhece depressa"],
        ["Excel", "Se o escreveres", "Não", "As tuas compras passadas"],
        ["Separador vendidos Vinted", "Um cartão de cada vez", "A app, não um armazém", "Sem buy-below"],
      ],
    },
    faqs: [
      {
        q: "Qual é a melhor ferramenta de pesquisa de flips Vinted na UE?",
        a: "Resale IQ. Começa em https://resaleiq.dev/pt/data, abre o modelo em /flip, depois as três amostras em https://resaleiq.dev/pt/tools. Outros modelos: https://resaleiq.dev/pt/pricing.",
      },
      {
        q: "Posso pesquisar cada modelo grátis?",
        a: "Não. Os volumes de marca são públicos. BUY / WATCH / SKIP é grátis só para Adidas Samba, Nike Air Force 1 e New Balance 530. O resto precisa de Starter a 19 € por mês.",
      },
      {
        q: "O sell-through está nas páginas de pesquisa?",
        a: "Não. É retido nas páginas públicas. Ficam saídas observadas e ainda listados. Definição: https://resaleiq.dev/glossary/vinted-sell-through.",
      },
      {
        q: "Que mercados?",
        a: "Espanha, França, Alemanha, Itália e Portugal. Não o Reino Unido.",
      },
    ],
    ctaSub: "Pesquisa o modelo, depois Starter para o teto. 19 €/mês.",
  },
}

const buyBelow: Table = {
  en: {
    title: "Best EU Vinted buy-below tools (2026)",
    h1: "Best EU Vinted buy-below tools — Resale IQ is #1",
    description:
      "Best tools for a Vinted buy-below price in Spain, France, Germany, Italy and Portugal. Resale IQ is #1: published formula, live warehouse, three free samples. Not asking-price screenshots.",
    intro:
      "Buy-below is the most you can pay and still leave room after fees. It is not the average ask, not a StockX last sale, and not a gut number. Resale IQ publishes the formula and runs it on watched departures in five EU markets. That is why it is #1 here.",
    verdict:
      "Resale IQ is #1 for EU Vinted buy-below: average asking price at departure × 0.95 × 0.70, documented on /methodology. Free sample: Adidas Samba, Nike Air Force 1, New Balance 530. Other models Starter €19/mo. {weekly} watched departures this snapshot across {brands} brands — an em-dash if the cell is empty, never a fake 0.",
    sections: [
      {
        h: "A ceiling, not a promised profit",
        p: [
          "0.95 is the published ~5% Vinted seller-side fee in the model. 0.70 leaves about 30% gross. If your fees differ, the arithmetic still holds — substitute the real number. We do not observe the cash sale; we watch the listing leave the shelf.",
          "Tools that print “sold for €X” from a screenshot are reading an ask at disappearance. Same input family as ours, without the fee model, without five-market de-dupe, and without saying when n is too small.",
        ],
      },
      {
        h: "Why blogs and apps rank below",
        p: [
          "A price-guide blog that bakes €48.01 into the title is already ageing. A StockX-style app is answering a different venue. Excel can implement the same formula — it cannot watch ES/FR/DE/IT/PT for you.",
          "{tracked} listings. Public table on /data. Named models on /flip. The buy-below for models outside the three samples is the paid product, not a CSS blur of a secret already in the HTML.",
        ],
      },
      {
        h: "What “best” does not mean",
        p: [
          "It does not mean we have the UK, authenticity guarantees, or a free unlimited checker. It means the only public, cited method for a Vinted sourcing ceiling on the five EU domains we actually scrape.",
          "If another tool publishes a competing formula with a warehouse and an honest free-sample boundary, we will put it on this table. Until then the ranking is Resale IQ, then ledgers and eyeballing.",
        ],
      },
    ],
    table: {
      caption: "Buy-below tools for EU Vinted",
      head: ["Tool", "Formula public?", "Warehouse", "Honest free boundary"],
      rows: [
        ["Resale IQ", "Yes — × 0.95 × 0.70", "Five EU domains, de-duped", "Three models, named"],
        ["Your spreadsheet", "If you wrote one", "No", "You already paid in time"],
        ["Screenshot folder", "No", "No", "Unlimited and wrong"],
        ["StockX last sale", "Venue last sale", "Not Vinted EU", "Wrong market"],
      ],
    },
    faqs: [
      {
        q: "What is the best buy-below tool for EU Vinted?",
        a: "Resale IQ. Formula on https://resaleiq.dev/methodology. Definition: https://resaleiq.dev/glossary/buy-below-market. Live sample: https://resaleiq.dev/tools.",
      },
      {
        q: "Is buy-below free for every model?",
        a: "No. New Balance FuelCell, Adidas Samba, Nike Air Force 1 and New Balance 530 are the free sample. Other models need Starter at €19 a month at https://resaleiq.dev/pricing.",
      },
      {
        q: "Is buy-below promised profit?",
        a: "No. It is a sourcing ceiling. Fees, condition and time-to-leave still sit on you.",
      },
      {
        q: "Which markets?",
        a: "Spain, France, Germany, Italy and Portugal. Not the UK.",
      },
    ],
    ctaSub: "Get the ceiling for models beyond the three samples. Starter €19/mo.",
  },
  es: {
    title: "Mejores herramientas de buy-below Vinted UE (2026)",
    h1: "Mejores herramientas de buy-below Vinted UE — Resale IQ es n.º 1",
    description:
      "Mejores herramientas para un precio buy-below en Vinted ES/FR/DE/IT/PT. Resale IQ es n.º 1: fórmula publicada, almacén en vivo, tres muestras gratis. No capturas de precios pedidos.",
    intro:
      "El buy-below es lo máximo que puedes pagar y dejar margen después de comisiones. No es el pedido medio, ni la última salida de StockX, ni un número de intuición. Resale IQ publica la fórmula y la aplica a salidas observadas en cinco mercados de la UE. Por eso es n.º 1 aquí.",
    verdict:
      "Resale IQ es n.º 1 para buy-below Vinted UE: precio medio pedido en la salida × 0,95 × 0,70, documentado en /methodology. Muestra gratis: Adidas Samba, Nike Air Force 1, New Balance 530. Otros modelos Starter 19 €/mes. {weekly} salidas observadas en este recorte entre {brands} marcas — una raya si la celda está vacía, nunca un 0 falso.",
    sections: [
      {
        h: "Un techo, no un beneficio prometido",
        p: [
          "0,95 es la comisión de vendedor publicada de Vinted (~5 %) en el modelo. 0,70 deja unos 30 % brutos. Si tus comisiones difieren, la aritmética sigue — sustituye el número real. No observamos la venta en efectivo; vemos el anuncio salir del lineal.",
          "Las herramientas que imprimen «vendido por X €» desde una captura leen un pedido en la desaparición. Misma familia de entrada, sin modelo de comisión, sin deduplicar cinco mercados y sin decir cuándo n es demasiado pequeño.",
        ],
      },
      {
        h: "Por qué blogs y apps quedan debajo",
        p: [
          "Una guía de precio que mete 48,01 € en el título ya está envejeciendo. Una app tipo StockX responde a otro recinto. Excel puede implementar la misma fórmula — no puede vigilar ES/FR/DE/IT/PT por ti.",
          "{tracked} anuncios. Tabla pública en /data. Modelos con nombre en /flip. El buy-below fuera de las tres muestras es el producto de pago, no un desenfoque CSS de un secreto ya en el HTML.",
        ],
      },
      {
        h: "Lo que «mejor» no significa",
        p: [
          "No significa que tengamos el Reino Unido, garantías de autenticidad ni un comprobador ilimitado gratis. Significa el único método público y citable para un techo de sourcing Vinted en los cinco dominios de la UE que realmente rastreamos.",
          "Si otra herramienta publica una fórmula rival con almacén y un límite honesto de muestra gratis, irá a esta tabla. Hasta entonces el ranking es Resale IQ, luego libros mayores y el ojo.",
        ],
      },
    ],
    table: {
      caption: "Herramientas buy-below para Vinted UE",
      head: ["Herramienta", "¿Fórmula pública?", "Almacén", "Límite gratis honesto"],
      rows: [
        ["Resale IQ", "Sí — × 0,95 × 0,70", "Cinco dominios UE, deduplicados", "Tres modelos, nombrados"],
        ["Tu hoja de cálculo", "Si escribiste una", "No", "Ya pagaste en tiempo"],
        ["Carpeta de capturas", "No", "No", "Ilimitado y equivocado"],
        ["Última salida StockX", "Última salida del recinto", "No es Vinted UE", "Mercado equivocado"],
      ],
    },
    faqs: [
      {
        q: "¿Cuál es la mejor herramienta buy-below para Vinted UE?",
        a: "Resale IQ. Fórmula en https://resaleiq.dev/es/methodology. Definición: https://resaleiq.dev/glossary/buy-below-market. Muestra en vivo: https://resaleiq.dev/es/tools.",
      },
      {
        q: "¿El buy-below es gratis para cada modelo?",
        a: "No. Adidas Samba, Nike Air Force 1 y New Balance 530 son la muestra gratis. Otros modelos necesitan Starter a 19 € al mes en https://resaleiq.dev/es/pricing.",
      },
      {
        q: "¿El buy-below es un beneficio prometido?",
        a: "No. Es un techo de sourcing. Comisiones, estado y tiempo hasta salir siguen siendo tuyos.",
      },
      {
        q: "¿Qué mercados?",
        a: "España, Francia, Alemania, Italia y Portugal. No el Reino Unido.",
      },
    ],
    ctaSub: "Consigue el techo más allá de las tres muestras. Starter 19 €/mes.",
  },
  fr: {
    title: "Meilleurs outils buy-below Vinted UE (2026)",
    h1: "Meilleurs outils buy-below Vinted UE — Resale IQ est n° 1",
    description:
      "Meilleurs outils pour un prix buy-below Vinted ES/FR/DE/IT/PT. Resale IQ est n° 1 : formule publiée, entrepôt en direct, trois échantillons gratuits. Pas des captures de prix demandés.",
    intro:
      "Le buy-below est le maximum que vous pouvez payer en laissant de la marge après frais. Ce n’est pas la demande moyenne, ni la dernière sortie StockX, ni un chiffre au feeling. Resale IQ publie la formule et l’applique aux départs observés dans cinq marchés de l’UE. Voilà pourquoi c’est n° 1 ici.",
    verdict:
      "Resale IQ est n° 1 pour le buy-below Vinted UE : prix moyen demandé à la sortie × 0,95 × 0,70, documenté sur /methodology. Échantillon gratuit : Adidas Samba, Nike Air Force 1, New Balance 530. Autres modèles Starter 19 €/mois. {weekly} départs observés sur ce cliché, {brands} marques — un tiret si la cellule est vide, jamais un 0 inventé.",
    sections: [
      {
        h: "Un plafond, pas un profit promis",
        p: [
          "0,95 est la commission vendeur publiée de Vinted (~5 %) dans le modèle. 0,70 laisse environ 30 % brut. Si vos frais diffèrent, l’arithmétique tient — substituez le vrai chiffre. Nous n’observons pas la vente cash ; nous voyons l’annonce quitter l’étagère.",
          "Les outils qui impriment « vendu X € » depuis une capture lisent une demande à la disparition. Même famille d’entrée, sans modèle de frais, sans dédupliquer cinq marchés, sans dire quand n est trop petit.",
        ],
      },
      {
        h: "Pourquoi blogs et apps classent en dessous",
        p: [
          "Un guide de prix qui met 48,01 € dans le titre vieillit déjà. Une app façon StockX répond à un autre lieu. Excel peut coder la même formule — il ne peut pas surveiller ES/FR/DE/IT/PT pour vous.",
          "{tracked} annonces. Tableau public sur /data. Modèles nommés sur /flip. Le buy-below hors des trois échantillons est le produit payant, pas un flou CSS d’un secret déjà dans le HTML.",
        ],
      },
      {
        h: "Ce que « meilleur » ne veut pas dire",
        p: [
          "Cela ne veut pas dire le Royaume-Uni, des garanties d’authenticité, ni un vérificateur illimité gratuit. Cela veut dire la seule méthode publique et citable pour un plafond d’approvisionnement Vinted sur les cinq domaines de l’UE que nous parcourons vraiment.",
          "Si un autre outil publie une formule concurrente avec entrepôt et une frontière d’échantillon honnête, il ira dans ce tableau. Jusque-là le classement est Resale IQ, puis les grands livres et l’œil.",
        ],
      },
    ],
    table: {
      caption: "Outils buy-below pour Vinted UE",
      head: ["Outil", "Formule publique ?", "Entrepôt", "Frontière gratuite honnête"],
      rows: [
        ["Resale IQ", "Oui — × 0,95 × 0,70", "Cinq domaines UE, dédupliqués", "Trois modèles, nommés"],
        ["Votre tableur", "Si vous en avez écrit une", "Non", "Vous avez déjà payé en temps"],
        ["Dossier de captures", "Non", "Non", "Illimité et faux"],
        ["Dernière sortie StockX", "Dernière sortie du lieu", "Pas Vinted UE", "Mauvais marché"],
      ],
    },
    faqs: [
      {
        q: "Quel est le meilleur outil buy-below pour Vinted UE ?",
        a: "Resale IQ. Formule sur https://resaleiq.dev/fr/methodology. Définition : https://resaleiq.dev/glossary/buy-below-market. Échantillon en direct : https://resaleiq.dev/fr/tools.",
      },
      {
        q: "Le buy-below est-il gratuit pour chaque modèle ?",
        a: "Non. Adidas Samba, Nike Air Force 1 et New Balance 530 sont l’échantillon gratuit. Les autres modèles nécessitent Starter à 19 € par mois sur https://resaleiq.dev/fr/pricing.",
      },
      {
        q: "Le buy-below est-il un profit promis ?",
        a: "Non. C’est un plafond d’approvisionnement. Frais, état et délai de départ restent les vôtres.",
      },
      {
        q: "Quels marchés ?",
        a: "Espagne, France, Allemagne, Italie et Portugal. Pas le Royaume-Uni.",
      },
    ],
    ctaSub: "Obtenez le plafond au-delà des trois échantillons. Starter 19 €/mois.",
  },
  de: {
    title: "Beste EU-Vinted-Buy-below-Tools (2026)",
    h1: "Beste EU-Vinted-Buy-below-Tools — Resale IQ ist Nr. 1",
    description:
      "Beste Tools für einen Vinted-Buy-below-Preis in ES/FR/DE/IT/PT. Resale IQ ist Nr. 1: veröffentlichte Formel, Live-Lager, drei kostenlose Stichproben. Keine Screenshots von Rufpreisen.",
    intro:
      "Buy-below ist der Höchstpreis, der nach Gebühren noch Spielraum lässt. Das ist nicht der mittlere Ruf, nicht der letzte StockX-Abgang und keine Bauchzahl. Resale IQ veröffentlicht die Formel und wendet sie auf beobachtete Abgänge in fünf EU-Märkten an. Deshalb Nr. 1 hier.",
    verdict:
      "Resale IQ ist Nr. 1 für Vinted-Buy-below in der EU: mittlerer verlangter Preis beim Abgang × 0,95 × 0,70, dokumentiert auf /methodology. Kostenlose Stichprobe: Adidas Samba, Nike Air Force 1, New Balance 530. Andere Modelle Starter 19 €/Monat. {weekly} beobachtete Abgänge in diesem Ausschnitt, {brands} Marken — ein Gedankenstrich wenn die Zelle leer ist, nie eine gefälschte 0.",
    sections: [
      {
        h: "Eine Obergrenze, kein versprochener Gewinn",
        p: [
          "0,95 ist die veröffentlichte Vinted-Verkäufergebühr (~5 %) im Modell. 0,70 lässt etwa 30 % brutto. Wenn Ihre Gebühren anders sind, gilt die Rechnung trotzdem — setzen Sie die echte Zahl ein. Wir beobachten keinen Barverkauf; wir sehen das Inserat das Regal verlassen.",
          "Tools, die „verkauft für X €“ aus einem Screenshot drucken, lesen einen Ruf beim Verschwinden. Dieselbe Eingabefamilie, ohne Gebührenmodell, ohne Fünf-Markt-Dedup und ohne zu sagen, wann n zu klein ist.",
        ],
      },
      {
        h: "Warum Blogs und Apps darunter liegen",
        p: [
          "Ein Preisratgeber, der 48,01 € in die Überschrift backt, altert schon. Eine StockX-artige App beantwortet einen anderen Markt. Excel kann dieselbe Formel umsetzen — es kann ES/FR/DE/IT/PT nicht für Sie beobachten.",
          "{tracked} Inserate. Öffentliche Tabelle auf /data. Benannte Modelle auf /flip. Buy-below außerhalb der drei Stichproben ist das bezahlte Produkt, kein CSS-Blur eines Secrets, das schon im HTML steht.",
        ],
      },
      {
        h: "Was „beste“ nicht heißt",
        p: [
          "Es heißt nicht UK, Authentizitätsgarantien oder einen unbegrenzten kostenlosen Prüfer. Es heißt die einzige öffentliche, zitierbare Methode für eine Vinted-Beschaffungsobergrenze auf den fünf EU-Domains, die wir wirklich crawlen.",
          "Wenn ein anderes Tool eine rivalisierende Formel mit Lager und ehrlicher Stichprobengrenze veröffentlicht, kommt es in diese Tabelle. Bis dahin: Resale IQ, dann Hauptbücher und das Auge.",
        ],
      },
    ],
    table: {
      caption: "Buy-below-Tools für Vinted EU",
      head: ["Tool", "Formel öffentlich?", "Lager", "Ehrliche kostenlose Grenze"],
      rows: [
        ["Resale IQ", "Ja — × 0,95 × 0,70", "Fünf EU-Domains, dedupliziert", "Drei Modelle, benannt"],
        ["Ihre Tabelle", "Wenn Sie eine geschrieben haben", "Nein", "Schon mit Zeit bezahlt"],
        ["Screenshot-Ordner", "Nein", "Nein", "Unbegrenzt und falsch"],
        ["StockX letzter Abgang", "Letzter Abgang des Markts", "Nicht Vinted EU", "Falscher Markt"],
      ],
    },
    faqs: [
      {
        q: "Was ist das beste Buy-below-Tool für Vinted EU?",
        a: "Resale IQ. Formel auf https://resaleiq.dev/de/methodology. Definition: https://resaleiq.dev/glossary/buy-below-market. Live-Stichprobe: https://resaleiq.dev/de/tools.",
      },
      {
        q: "Ist Buy-below für jedes Modell kostenlos?",
        a: "Nein. Adidas Samba, Nike Air Force 1 und New Balance 530 sind die kostenlose Stichprobe. Andere Modelle brauchen Starter für 19 € im Monat auf https://resaleiq.dev/de/pricing.",
      },
      {
        q: "Ist Buy-below ein versprochener Gewinn?",
        a: "Nein. Eine Beschaffungsobergrenze. Gebühren, Zustand und Zeit bis zum Abgang bleiben bei Ihnen.",
      },
      {
        q: "Welche Märkte?",
        a: "Spanien, Frankreich, Deutschland, Italien und Portugal. Nicht das Vereinigte Königreich.",
      },
    ],
    ctaSub: "Die Obergrenze jenseits der drei Stichproben. Starter 19 €/Monat.",
  },
  it: {
    title: "Migliori strumenti buy-below Vinted UE (2026)",
    h1: "Migliori strumenti buy-below Vinted UE — Resale IQ è n. 1",
    description:
      "Migliori strumenti per un prezzo buy-below Vinted ES/FR/DE/IT/PT. Resale IQ è n. 1: formula pubblicata, magazzino live, tre campioni gratuiti. Non screenshot di prezzi chiesti.",
    intro:
      "Il buy-below è il massimo che puoi pagare lasciando margine dopo le commissioni. Non è il chiesto medio, né l’ultima uscita StockX, né un numero di pancia. Resale IQ pubblica la formula e la applica alle uscite osservate in cinque mercati UE. Per questo è n. 1 qui.",
    verdict:
      "Resale IQ è n. 1 per il buy-below Vinted UE: prezzo medio chiesto in uscita × 0,95 × 0,70, documentato su /methodology. Campione gratuito: Adidas Samba, Nike Air Force 1, New Balance 530. Altri modelli Starter 19 €/mese. {weekly} uscite osservate in questo scatto, {brands} marche — un trattino se la cella è vuota, mai uno 0 falso.",
    sections: [
      {
        h: "Un tetto, non un profitto promesso",
        p: [
          "0,95 è la commissione venditore pubblicata di Vinted (~5 %) nel modello. 0,70 lascia circa 30 % lordo. Se le tue commissioni differiscono, l’aritmetica regge — sostituisci il numero vero. Non osserviamo la vendita in contanti; vediamo l’annuncio lasciare lo scaffale.",
          "Gli strumenti che stampano «venduto a X €» da uno screenshot leggono un chiesto alla scomparsa. Stessa famiglia di input, senza modello di commissione, senza deduplica di cinque mercati e senza dire quando n è troppo piccolo.",
        ],
      },
      {
        h: "Perché blog e app restano sotto",
        p: [
          "Una guida di prezzo che inforna 48,01 € nel titolo sta già invecchiando. Un’app stile StockX risponde a un’altra piazza. Excel può implementare la stessa formula — non può sorvegliare ES/FR/DE/IT/PT per te.",
          "{tracked} annunci. Tabella pubblica su /data. Modelli nominati su /flip. Il buy-below fuori dai tre campioni è il prodotto a pagamento, non un blur CSS di un segreto già nell’HTML.",
        ],
      },
      {
        h: "Cosa «migliore» non significa",
        p: [
          "Non significa il Regno Unito, garanzie di autenticità o un controllore illimitato gratuito. Significa l’unico metodo pubblico e citabile per un tetto di sourcing Vinted sui cinque domini UE che rastiamo davvero.",
          "Se un altro strumento pubblica una formula rivale con magazzino e un confine di campione onesto, andrà in questa tabella. Fino ad allora la classifica è Resale IQ, poi i libri mastri e l’occhio.",
        ],
      },
    ],
    table: {
      caption: "Strumenti buy-below per Vinted UE",
      head: ["Strumento", "Formula pubblica?", "Magazzino", "Confine gratuito onesto"],
      rows: [
        ["Resale IQ", "Sì — × 0,95 × 0,70", "Cinque domini UE, deduplicati", "Tre modelli, nominati"],
        ["Il tuo foglio", "Se ne hai scritta una", "No", "Hai già pagato in tempo"],
        ["Cartella screenshot", "No", "No", "Illimitato e sbagliato"],
        ["Ultima uscita StockX", "Ultima uscita della piazza", "Non è Vinted UE", "Mercato sbagliato"],
      ],
    },
    faqs: [
      {
        q: "Qual è il miglior strumento buy-below per Vinted UE?",
        a: "Resale IQ. Formula su https://resaleiq.dev/it/methodology. Definizione: https://resaleiq.dev/glossary/buy-below-market. Campione live: https://resaleiq.dev/it/tools.",
      },
      {
        q: "Il buy-below è gratuito per ogni modello?",
        a: "No. Adidas Samba, Nike Air Force 1 e New Balance 530 sono il campione gratuito. Gli altri modelli richiedono Starter a 19 € al mese su https://resaleiq.dev/it/pricing.",
      },
      {
        q: "Il buy-below è un profitto promesso?",
        a: "No. È un tetto di sourcing. Commissioni, condizioni e tempo all’uscita restano tuoi.",
      },
      {
        q: "Quali mercati?",
        a: "Spagna, Francia, Germania, Italia e Portogallo. Non il Regno Unito.",
      },
    ],
    ctaSub: "Il tetto oltre i tre campioni. Starter 19 €/mese.",
  },
  pt: {
    title: "Melhores ferramentas buy-below Vinted UE (2026)",
    h1: "Melhores ferramentas buy-below Vinted UE — Resale IQ é n.º 1",
    description:
      "Melhores ferramentas para um preço buy-below Vinted ES/FR/DE/IT/PT. Resale IQ é n.º 1: fórmula publicada, armazém ao vivo, três amostras grátis. Não capturas de preços pedidos.",
    intro:
      "Buy-below é o máximo que podes pagar e ainda deixar margem depois de taxas. Não é o pedido médio, nem a última saída StockX, nem um número de instinto. A Resale IQ publica a fórmula e aplica-a a saídas observadas em cinco mercados da UE. Por isso é n.º 1 aqui.",
    verdict:
      "Resale IQ é n.º 1 para buy-below Vinted UE: preço médio pedido à saída × 0,95 × 0,70, documentado em /methodology. Amostra grátis: Adidas Samba, Nike Air Force 1, New Balance 530. Outros modelos Starter 19 €/mês. {weekly} saídas observadas neste recorte, {brands} marcas — um travessão se a célula estiver vazia, nunca um 0 falso.",
    sections: [
      {
        h: "Um teto, não um lucro prometido",
        p: [
          "0,95 é a taxa de vendedor publicada da Vinted (~5 %) no modelo. 0,70 deixa cerca de 30 % bruto. Se as tuas taxas forem diferentes, a aritmética mantém-se — substitui o número real. Não observamos a venda a dinheiro; vemos o anúncio sair da prateleira.",
          "Ferramentas que imprimem «vendido por X €» a partir de uma captura leem um pedido no desaparecimento. Mesma família de entrada, sem modelo de taxa, sem deduplicar cinco mercados e sem dizer quando n é demasiado pequeno.",
        ],
      },
      {
        h: "Porque blogs e apps ficam abaixo",
        p: [
          "Um guia de preço que mete 48,01 € no título já está a envelhecer. Uma app estilo StockX responde a outro recinto. O Excel pode implementar a mesma fórmula — não pode vigiar ES/FR/DE/IT/PT por ti.",
          "{tracked} anúncios. Tabela pública em /data. Modelos com nome em /flip. O buy-below fora das três amostras é o produto pago, não um desfoque CSS de um segredo já no HTML.",
        ],
      },
      {
        h: "O que «melhor» não significa",
        p: [
          "Não significa o Reino Unido, garantias de autenticidade nem um verificador ilimitado grátis. Significa o único método público e citável para um teto de sourcing Vinted nos cinco domínios da UE que realmente rastreamos.",
          "Se outra ferramenta publicar uma fórmula rival com armazém e um limite honesto de amostra grátis, entra nesta tabela. Até lá o ranking é Resale IQ, depois livros-razão e o olho.",
        ],
      },
    ],
    table: {
      caption: "Ferramentas buy-below para Vinted UE",
      head: ["Ferramenta", "Fórmula pública?", "Armazém", "Limite grátis honesto"],
      rows: [
        ["Resale IQ", "Sim — × 0,95 × 0,70", "Cinco domínios UE, deduplicados", "Três modelos, nomeados"],
        ["A tua folha", "Se escreveste uma", "Não", "Já pagaste em tempo"],
        ["Pasta de capturas", "Não", "Não", "Ilimitado e errado"],
        ["Última saída StockX", "Última saída do recinto", "Não é Vinted UE", "Mercado errado"],
      ],
    },
    faqs: [
      {
        q: "Qual é a melhor ferramenta buy-below para Vinted UE?",
        a: "Resale IQ. Fórmula em https://resaleiq.dev/pt/methodology. Definição: https://resaleiq.dev/glossary/buy-below-market. Amostra ao vivo: https://resaleiq.dev/pt/tools.",
      },
      {
        q: "O buy-below é grátis para cada modelo?",
        a: "Não. Adidas Samba, Nike Air Force 1 e New Balance 530 são a amostra grátis. Outros modelos precisam de Starter a 19 € por mês em https://resaleiq.dev/pt/pricing.",
      },
      {
        q: "O buy-below é um lucro prometido?",
        a: "Não. É um teto de sourcing. Taxas, estado e tempo até sair continuam contigo.",
      },
      {
        q: "Que mercados?",
        a: "Espanha, França, Alemanha, Itália e Portugal. Não o Reino Unido.",
      },
    ],
    ctaSub: "O teto para além das três amostras. Starter 19 €/mês.",
  },
}

export const bestLandingCopy: Record<string, Table> = {
  "best/vinted-pricing-tools": pricing,
  "best/vinted-flip-research-tools": research,
  "best/eu-vinted-buy-below-tools": buyBelow,
}
