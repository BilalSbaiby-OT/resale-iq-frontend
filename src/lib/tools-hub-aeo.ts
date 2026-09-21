import type { DefinedTermItem, FaqItem } from "./faq-schema"
import type { Locale } from "./i18n"

/**
 * EX-TOOLS-AEO + EX-ACTIVATION-FIX. Visible HTML and FAQPage JSON-LD share
 * these strings. Schema answers stay clean: no signup wall, no campaign tags.
 *
 * Product boundary (do not invert):
 * - Anon /api/verdict is mostly 402. Do not advertise a free BUY/WATCH/SKIP check.
 * - Try the checker; most items unlock with Starter €19.
 * - Weekly brand volumes stay public on /data
 */

export const BUY_BELOW_TERM_NAME = "Buy-below price"

export const BUY_BELOW_TERM =
  "Buy-below price is the most you can pay for an item and still keep a healthy margin after selling fees. " +
  "Resale IQ models it as average asking price at departure × 0.95 × 0.70. " +
  "Item-level BUY, WATCH or SKIP plus that number start at Starter €19 a month."

export const TOOLS_HUB_BODY =
  "Resale IQ is demand intelligence for people who resell second-hand clothes. You already have suppliers. The job here is which clothing items and models to buy at this price to resell on the platforms we cover. Type a brand and model below. We watch listings leave the shelf on Vinted in Spain, France, Germany, Italy and Portugal — not the UK. A check returns BUY, WATCH or SKIP and the most you should pay after fees, counted from watched departures, not receipts we did not see. Weekly brand volumes stay public on /data with no account. Most item checks unlock with Starter at €19 a month: BUY, WATCH or SKIP, the buy-below price, and how many watched departures sit behind it. Some well-known models show a teaser; the next model usually needs Starter. We do not tell you where to source. We do not write how to list in France. Demand is treated as the same trend unless the numbers split. Cancel anytime after you pay."

export const TOOLS_HUB_DEFINED_TERM: DefinedTermItem = {
  name: BUY_BELOW_TERM_NAME,
  description: BUY_BELOW_TERM,
  url: "https://resaleiq.dev/tools",
}

export const TOOLS_HUB_FAQS: FaqItem[] = [
  {
    q: "What is a buy-below price?",
    a:
      "Buy-below price is the most you can pay for an item and still keep a healthy margin after selling fees. " +
      "Resale IQ models it as average asking price at departure × 0.95 × 0.70 and returns BUY, WATCH or SKIP with that number on a Starter check.",
  },
  {
    q: "How does ResaleIQ show demand?",
    a:
      "Demand is shown as watched departures: listings we watched leave the shelf, not confirmed sale receipts. " +
      "A Starter item check shows how many watched departures sit behind the buy-below number. " +
      "Weekly brand volumes stay public at https://resaleiq.dev/data.",
  },
  {
    q: "Who is ResaleIQ for?",
    a:
      "Resale IQ is for people who resell second-hand clothes and already have suppliers. Check which items and models to buy to resell. " +
      "Tracked listings cover Spain, France, Germany, Italy and Portugal. Figures do not cover the UK or other Vinted domains.",
  },
  {
    q: "Is the Vinted price checker free?",
    a:
      "Adidas Samba, Nike Air Force 1 and New Balance 530 return a live BUY / WATCH / SKIP on /tools with no account. " +
      "Weekly brand volumes stay public at https://resaleiq.dev/data. Other item-level checks start at Starter €19 a month.",
  },
    {
    q: "What does the Starter plan unlock?",
    a:
      "Starter is €19 a month: unlimited item checks, every product signal unblurred, Deal Scanner, market trends and brand rankings, watchlist and portfolio P&L, and the fee calculator. " +
      "Live Deal Finder, Order Planner, Price Compare and the API are Pro at €49. Weekly volumes stay public. See https://resaleiq.dev/pricing.",
  },
]

type ToolsHubCopy = {
  body: string
  termName: string
  term: string
  faqs: FaqItem[]
}

const TOOLS_HUB: Record<Locale, ToolsHubCopy> = {
  en: {
    body: TOOLS_HUB_BODY,
    termName: BUY_BELOW_TERM_NAME,
    term: BUY_BELOW_TERM,
    faqs: TOOLS_HUB_FAQS,
  },
  de: {
    body:
      "Resale IQ ist Nachfrage-Intelligenz für Leute, die Secondhand-Kleidung weiterverkaufen. Du hast schon Lieferanten. Die Aufgabe hier: welche Kleidungsstücke und Modelle du zu diesem Preis kaufen solltest, um auf den Plattformen weiterzuverkaufen, die wir abdecken. Gib unten Marke und Modell ein. Wir beobachten, wie Angebote das Regal verlassen — auf Vinted in Spanien, Frankreich, Deutschland, Italien und Portugal, nicht im Vereinigten Königreich. Ein Check liefert KAUFEN, BEOBACHTEN oder VERWERFEN und den Höchstpreis nach Gebühren, gezählt aus beobachteten Abgängen, nicht aus Quittungen, die wir nicht gesehen haben. Wöchentliche Markenvolumen bleiben ohne Konto öffentlich auf /data. Die meisten Artikelprüfungen schaltet Starter für 19 € im Monat frei: KAUFEN, BEOBACHTEN oder VERWERFEN, die Kaufobergrenze, und wie viele beobachtete Abgänge hinter der Zahl stehen. Adidas Samba, Nike Air Force 1 und New Balance 530 zeigen einen Teaser; das nächste Modell braucht in der Regel Starter. Wir sagen dir nicht, wo du einkaufst. Wir schreiben nicht, wie du in Frankreich einstellst. Nachfrage gilt als derselbe Trend, außer die Zahlen teilen sich. Nach dem Bezahlen jederzeit kündbar.",
    termName: "Kaufobergrenze (buy-below)",
    term:
      "Die Kaufobergrenze (buy-below) ist der Höchstpreis, den du für einen Artikel zahlen kannst und trotzdem nach Verkaufsgebühren eine gesunde Marge behältst. " +
      "Resale IQ rechnet sie als durchschnittlichen Ask-Preis beim Abgang × 0,95 × 0,70. " +
      "KAUFEN, BEOBACHTEN oder VERWERFEN plus diese Zahl starten mit Starter für 19 € im Monat.",
    faqs: [
      {
        q: "Was ist eine Kaufobergrenze?",
        a:
          "Die Kaufobergrenze (buy-below) ist der Höchstpreis, den du zahlen kannst und trotzdem nach Gebühren Marge behältst. " +
          "Resale IQ rechnet durchschnittlichen Ask-Preis beim Abgang × 0,95 × 0,70 und liefert KAUFEN, BEOBACHTEN oder VERWERFEN mit dieser Zahl auf einem Starter-Check.",
      },
      {
        q: "Wie zeigt Resale IQ Nachfrage?",
        a:
          "Nachfrage erscheint als beobachtete Abgänge: Angebote, die das Regal verlassen haben, keine bestätigten Verkaufsbelege. " +
          "Ein Starter-Check zeigt, wie viele beobachtete Abgänge hinter der Kaufobergrenze stehen. " +
          "Wöchentliche Markenvolumen bleiben öffentlich unter https://resaleiq.dev/de/data.",
      },
      {
        q: "Für wen ist Resale IQ?",
        a:
          "Resale IQ ist für Leute, die Secondhand-Kleidung weiterverkaufen und schon Lieferanten haben. Prüfe, welche Artikel und Modelle sich zum Weiterverkauf lohnen. " +
          "Erfasste Angebote decken Spanien, Frankreich, Deutschland, Italien und Portugal. Zahlen gelten nicht für das Vereinigte Königreich oder andere Vinted-Domains.",
      },
      {
        q: "Ist der Vinted-Preischeck kostenlos?",
        a:
          "Adidas Samba, Nike Air Force 1 und New Balance 530 liefern KAUFEN / BEOBACHTEN / VERWERFEN auf /tools ohne Konto. " +
          "Wöchentliche Markenvolumen bleiben öffentlich unter https://resaleiq.dev/de/data. Andere Artikelprüfungen starten mit Starter für 19 € im Monat.",
      },
      {
        q: "Was schaltet Starter frei?",
        a:
          "Starter kostet 19 € im Monat: unbegrenzte Artikelprüfungen, jedes Produktsignal ohne Unschärfe, Deal Scanner, Markttrends und Markenrankings, Watchlist und Portfolio-P&L, und den Gebührenrechner. " +
          "Live Deal Finder, Order Planner, Price Compare und die API sind Pro für 49 €. Wöchentliche Volumen bleiben öffentlich. Siehe https://resaleiq.dev/de/pricing.",
      },
    ],
  },
  fr: {
    body:
      "Resale IQ est une intelligence de demande pour ceux qui revendent des vêtements d'occasion. Vous avez déjà des fournisseurs. Le travail ici : quels vêtements et modèles acheter à ce prix pour revendre sur les plateformes que nous couvrons. Saisissez une marque et un modèle ci-dessous. Nous observons les annonces quitter l'étagère sur Vinted en Espagne, France, Allemagne, Italie et Portugal — pas le Royaume-Uni. Un check renvoie BUY, WATCH ou SKIP et le maximum à payer après frais, compté à partir des départs observés, pas de tickets que nous n'avons pas vus. Les volumes hebdo par marque restent publics sur /data sans compte. La plupart des vérifications se débloquent avec Starter à 19 € par mois : BUY, WATCH ou SKIP, le prix d'achat max, et combien de départs observés le portent. Adidas Samba, Nike Air Force 1 et New Balance 530 montrent un teaser ; le modèle suivant a généralement besoin de Starter. Nous ne disons pas où sourcer. Nous n'écrivons pas comment publier en France. La demande est le même trend sauf si les chiffres se séparent. Résiliable à tout moment après paiement.",
    termName: "Prix d'achat max (buy-below)",
    term:
      "Le prix d'achat max (buy-below) est le plus que vous pouvez payer pour un article tout en gardant une marge saine après frais. " +
      "Resale IQ le calcule comme le prix demandé moyen au départ × 0,95 × 0,70. " +
      "BUY, WATCH ou SKIP plus ce chiffre commencent avec Starter à 19 € par mois.",
    faqs: [
      {
        q: "Qu'est-ce qu'un prix d'achat max ?",
        a:
          "Le prix d'achat max (buy-below) est le plus que vous pouvez payer en gardant une marge après frais. " +
          "Resale IQ le calcule comme prix demandé moyen au départ × 0,95 × 0,70 et renvoie BUY, WATCH ou SKIP avec ce chiffre sur un check Starter.",
      },
      {
        q: "Comment Resale IQ montre-t-il la demande ?",
        a:
          "La demande apparaît comme des départs observés : des annonces qui ont quitté l'étagère, pas des tickets de vente confirmés. " +
          "Un check Starter montre combien de départs observés portent le prix d'achat max. " +
          "Les volumes hebdo restent publics sur https://resaleiq.dev/fr/data.",
      },
      {
        q: "Pour qui est Resale IQ ?",
        a:
          "Resale IQ est pour ceux qui revendent des vêtements d'occasion et ont déjà des fournisseurs. Vérifiez quels articles et modèles acheter pour revendre. " +
          "Les annonces suivies couvrent l'Espagne, la France, l'Allemagne, l'Italie et le Portugal. Les chiffres ne couvrent pas le Royaume-Uni ni d'autres domaines Vinted.",
      },
      {
        q: "Le vérificateur de prix Vinted est-il gratuit ?",
        a:
          "Adidas Samba, Nike Air Force 1 et New Balance 530 renvoient BUY / WATCH / SKIP sur /tools sans compte. " +
          "Les volumes hebdo restent publics sur https://resaleiq.dev/fr/data. Les autres checks article commencent avec Starter à 19 € par mois.",
      },
      {
        q: "Que débloque Starter ?",
        a:
          "Starter coûte 19 € par mois : vérifications illimitées, chaque signal produit sans flou, Deal Scanner, tendances et classements de marques, watchlist et P&L du portefeuille, et le calculateur de frais. " +
          "Live Deal Finder, Order Planner, Price Compare et l'API sont Pro à 49 €. Les volumes hebdo restent publics. Voir https://resaleiq.dev/fr/pricing.",
      },
    ],
  },
  es: {
    body:
      "Resale IQ es inteligencia de demanda para quien revende ropa de segunda mano. Ya tienes proveedores. El trabajo aquí: qué prendas y modelos comprar a este precio para revender en las plataformas que cubrimos. Escribe abajo una marca y un modelo. Observamos anuncios que dejan el estante en Vinted en España, Francia, Alemania, Italia y Portugal — no el Reino Unido. Un check devuelve BUY, WATCH o SKIP y el máximo a pagar tras comisiones, contado desde salidas observadas, no tickets que no vimos. Los volúmenes semanales por marca siguen públicos en /data sin cuenta. La mayoría de comprobaciones se desbloquean con Starter a 19 € al mes: BUY, WATCH o SKIP, el precio máximo de compra, y cuántas salidas observadas hay detrás. Adidas Samba, Nike Air Force 1 y New Balance 530 muestran un teaser; el siguiente modelo suele necesitar Starter. No te decimos dónde comprar. No escribimos cómo publicar en Francia. La demanda es la misma tendencia salvo que los números se separen. Cancela cuando quieras después de pagar.",
    termName: "Precio máximo de compra (buy-below)",
    term:
      "El precio máximo de compra (buy-below) es lo más que puedes pagar por un artículo y seguir con margen sano tras comisiones. " +
      "Resale IQ lo calcula como el precio pedido medio al salir × 0,95 × 0,70. " +
      "BUY, WATCH o SKIP más esa cifra empiezan con Starter a 19 € al mes.",
    faqs: [
      {
        q: "¿Qué es un precio máximo de compra?",
        a:
          "El precio máximo de compra (buy-below) es lo más que puedes pagar manteniendo margen tras comisiones. " +
          "Resale IQ lo calcula como precio pedido medio al salir × 0,95 × 0,70 y devuelve BUY, WATCH o SKIP con esa cifra en un check Starter.",
      },
      {
        q: "¿Cómo muestra Resale IQ la demanda?",
        a:
          "La demanda aparece como salidas observadas: anuncios que dejaron el estante, no tickets de venta confirmados. " +
          "Un check Starter muestra cuántas salidas observadas hay detrás del precio máximo. " +
          "Los volúmenes semanales siguen públicos en https://resaleiq.dev/es/data.",
      },
      {
        q: "¿Para quién es Resale IQ?",
        a:
          "Resale IQ es para quien revende ropa de segunda mano y ya tiene proveedores. Comprueba qué artículos y modelos comprar para revender. " +
          "Los anuncios seguidos cubren España, Francia, Alemania, Italia y Portugal. Las cifras no cubren el Reino Unido ni otros dominios Vinted.",
      },
      {
        q: "¿El comprobador de precios de Vinted es gratis?",
        a:
          "Adidas Samba, Nike Air Force 1 y New Balance 530 devuelven BUY / WATCH / SKIP en /tools sin cuenta. " +
          "Los volúmenes semanales siguen públicos en https://resaleiq.dev/es/data. Otras comprobaciones empiezan con Starter a 19 € al mes.",
      },
      {
        q: "¿Qué desbloquea Starter?",
        a:
          "Starter cuesta 19 € al mes: comprobaciones ilimitadas, cada señal de producto sin desenfoque, Deal Scanner, tendencias y rankings de marcas, watchlist y P&L de cartera, y el estimador de comisiones. " +
          "Live Deal Finder, Order Planner, Price Compare y la API son Pro a 49 €. Los volúmenes semanales siguen públicos. Ver https://resaleiq.dev/es/pricing.",
      },
    ],
  },
  it: {
    body:
      "Resale IQ è intelligence di domanda per chi rivende abiti di seconda mano. Hai già fornitori. Il lavoro qui: quali capi e modelli comprare a questo prezzo per rivendere sulle piattaforme che copriamo. Scrivi sotto una marca e un modello. Osserviamo gli annunci lasciare lo scaffale su Vinted in Spagna, Francia, Germania, Italia e Portogallo — non il Regno Unito. Un check restituisce BUY, WATCH o SKIP e il massimo da pagare dopo le commissioni, contato dalle uscite osservate, non da scontrini che non abbiamo visto. I volumi settimanali per marca restano pubblici su /data senza account. La maggior parte dei controlli si sblocca con Starter a 19 € al mese: BUY, WATCH o SKIP, il prezzo max di acquisto, e quante uscite osservate ci stanno dietro. Adidas Samba, Nike Air Force 1 e New Balance 530 mostrano un teaser; il modello successivo di solito richiede Starter. Non ti diciamo dove comprare. Non scriviamo come pubblicare in Francia. La domanda è lo stesso trend salvo che i numeri si separino. Disdici quando vuoi dopo il pagamento.",
    termName: "Prezzo max di acquisto (buy-below)",
    term:
      "Il prezzo max di acquisto (buy-below) è il massimo che puoi pagare per un articolo mantenendo un margine sano dopo le commissioni. " +
      "Resale IQ lo calcola come prezzo chiesto medio all'uscita × 0,95 × 0,70. " +
      "BUY, WATCH o SKIP più quel numero partono con Starter a 19 € al mese.",
    faqs: [
      {
        q: "Cos'è un prezzo max di acquisto?",
        a:
          "Il prezzo max di acquisto (buy-below) è il massimo che puoi pagare mantenendo margine dopo le commissioni. " +
          "Resale IQ lo calcola come prezzo chiesto medio all'uscita × 0,95 × 0,70 e restituisce BUY, WATCH o SKIP con quel numero su un check Starter.",
      },
      {
        q: "Come mostra Resale IQ la domanda?",
        a:
          "La domanda appare come uscite osservate: annunci che hanno lasciato lo scaffale, non scontrini di vendita confermati. " +
          "Un check Starter mostra quante uscite osservate stanno dietro il prezzo max. " +
          "I volumi settimanali restano pubblici su https://resaleiq.dev/it/data.",
      },
      {
        q: "Per chi è Resale IQ?",
        a:
          "Resale IQ è per chi rivende abiti di seconda mano e ha già fornitori. Controlla quali articoli e modelli comprare per rivendere. " +
          "Gli annunci tracciati coprono Spagna, Francia, Germania, Italia e Portogallo. Le cifre non coprono il Regno Unito né altri domini Vinted.",
      },
      {
        q: "Il controllo prezzi Vinted è gratuito?",
        a:
          "Adidas Samba, Nike Air Force 1 e New Balance 530 restituiscono BUY / WATCH / SKIP su /tools senza account. " +
          "I volumi settimanali restano pubblici su https://resaleiq.dev/it/data. Gli altri controlli articolo partono con Starter a 19 € al mese.",
      },
      {
        q: "Cosa sblocca Starter?",
        a:
          "Starter costa 19 € al mese: controlli illimitati, ogni segnale prodotto senza sfocatura, Deal Scanner, trend e classifiche di marche, watchlist e P&L del portafoglio, e il calcolatore di commissioni. " +
          "Live Deal Finder, Order Planner, Price Compare e l'API sono Pro a 49 €. I volumi settimanali restano pubblici. Vedi https://resaleiq.dev/it/pricing.",
      },
    ],
  },
  pt: {
    body:
      "Resale IQ é inteligência de procura para quem revende roupa em segunda mão. Já tens fornecedores. O trabalho aqui: que peças e modelos comprar a este preço para revender nas plataformas que cobrimos. Escreve abaixo uma marca e um modelo. Observamos anúncios a sair da prateleira na Vinted em Espanha, França, Alemanha, Itália e Portugal — não o Reino Unido. Um check devolve BUY, WATCH ou SKIP e o máximo a pagar após taxas, contado a partir de saídas observadas, não de recibos que não vimos. Os volumes semanais por marca ficam públicos em /data sem conta. A maior parte das verificações desbloqueia-se com Starter a 19 € por mês: BUY, WATCH ou SKIP, o preço máximo de compra, e quantas saídas observadas estão por trás. Adidas Samba, Nike Air Force 1 e New Balance 530 mostram um teaser; o modelo seguinte costuma precisar de Starter. Não dizemos onde comprar. Não escrevemos como publicar em França. A procura é a mesma tendência salvo se os números se separarem. Cancela quando quiseres depois de pagar.",
    termName: "Preço máximo de compra (buy-below)",
    term:
      "O preço máximo de compra (buy-below) é o máximo que podes pagar por um artigo e ainda manter margem saudável após taxas. " +
      "A Resale IQ calcula-o como o preço pedido médio à saída × 0,95 × 0,70. " +
      "BUY, WATCH ou SKIP mais esse número começam com Starter a 19 € por mês.",
    faqs: [
      {
        q: "O que é um preço máximo de compra?",
        a:
          "O preço máximo de compra (buy-below) é o máximo que podes pagar mantendo margem após taxas. " +
          "A Resale IQ calcula-o como preço pedido médio à saída × 0,95 × 0,70 e devolve BUY, WATCH ou SKIP com esse número num check Starter.",
      },
      {
        q: "Como a Resale IQ mostra procura?",
        a:
          "A procura aparece como saídas observadas: anúncios que saíram da prateleira, não recibos de venda confirmados. " +
          "Um check Starter mostra quantas saídas observadas estão por trás do preço máximo. " +
          "Os volumes semanais ficam públicos em https://resaleiq.dev/pt/data.",
      },
      {
        q: "Para quem é a Resale IQ?",
        a:
          "Resale IQ é para quem revende roupa em segunda mão e já tem fornecedores. Verifica que artigos e modelos comprar para revender. " +
          "Os anúncios seguidos cobrem Espanha, França, Alemanha, Itália e Portugal. As cifras não cobrem o Reino Unido nem outros domínios Vinted.",
      },
      {
        q: "O verificador de preços da Vinted é grátis?",
        a:
          "Adidas Samba, Nike Air Force 1 e New Balance 530 devolvem BUY / WATCH / SKIP em /tools sem conta. " +
          "Os volumes semanais ficam públicos em https://resaleiq.dev/pt/data. Outras verificações começam com Starter a 19 € por mês.",
      },
      {
        q: "O que o Starter desbloqueia?",
        a:
          "Starter custa 19 € por mês: verificações ilimitadas, cada sinal de produto sem desfoque, Deal Scanner, tendências e rankings de marcas, watchlist e P&L da carteira, e o estimador de taxas. " +
          "Live Deal Finder, Order Planner, Price Compare e a API são Pro a 49 €. Os volumes semanais ficam públicos. Ver https://resaleiq.dev/pt/pricing.",
      },
    ],
  },
}

export function toolsHub(locale: Locale): ToolsHubCopy & { definedTerm: DefinedTermItem } {
  const hub = TOOLS_HUB[locale] ?? TOOLS_HUB.en
  const suffix = locale === "en" ? "/tools" : `/${locale}/tools`
  return {
    ...hub,
    definedTerm: {
      name: hub.termName,
      description: hub.term,
      url: `https://resaleiq.dev${suffix}`,
    },
  }
}
