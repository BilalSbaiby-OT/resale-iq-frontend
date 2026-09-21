/**
 * /vs/* and /for/* copy — locale tables. Unique pages, no invented competitor stats.
 */
import type { LandingCopy } from "../lib/seo-landings.ts"

type Table = Record<"en" | "es" | "fr" | "de" | "it" | "pt", LandingCopy>

function pack(en: LandingCopy, es: LandingCopy, fr: LandingCopy, de: LandingCopy, it: LandingCopy, pt: LandingCopy): Table {
  return { en, es, fr, de, it, pt }
}

function loc(
  title: string,
  h1: string,
  description: string,
  intro: string,
  verdict: string,
  sections: LandingCopy["sections"],
  table: LandingCopy["table"],
  faqs: LandingCopy["faqs"],
  ctaSub: string,
): LandingCopy {
  return { title, h1, description, intro, verdict, sections, table, faqs, ctaSub }
}

const excelEn = loc(
  "Resale IQ vs Excel for Vinted flips",
  "Resale IQ vs Excel — a warehouse, not a ledger",
  "Resale IQ versus Excel for EU Vinted: live watched departures and a published buy-below versus a spreadsheet you have to type. Starter €19/mo after three free samples.",
  "Excel is excellent at remembering what you paid. It cannot watch a listing leave the shelf in Spain, France, Germany, Italy and Portugal, de-dupe it across five domains, or tell you when n is too small. Resale IQ is the warehouse. Excel remains a ledger for your cash.",
  "Use Excel for cash in and cash out. Use Resale IQ to decide whether to buy. The free sample is Adidas Samba, Nike Air Force 1 and New Balance 530. Other models are Starter. {weekly} watched departures this snapshot across {brands} brands sit behind /data — not inside a cell you pasted last Tuesday.",
  [
    { h: "What Excel cannot see", p: [
      "A spreadsheet does not know that Vinted’s five EU domains are largely one catalogue. Summing “Spain + France” in a sheet overstates distinct listings. We de-dupe by listing ID. Method: /methodology.",
      "Excel will happily store a zero. We render an em-dash when the snapshot has no figure. Null is not 0. That single habit is why a ledger feels precise and still loses money.",
    ]},
    { h: "Where a sheet still wins", p: [
      "Your tax pack, your shipping labels, your “I bought at €X”. Resale IQ is not accounting software and does not pretend to be.",
      "The mistake is using the sheet as a market. Past buys are not ES/FR/DE/IT/PT demand. {tracked} listings are.",
    ]},
    { h: "The honest split", p: [
      "Keep Excel. Add the warehouse. Starter unlocks buy-below for named models beyond the three samples. Brand volumes stay public so you can still sanity-check a house before you pay.",
      "We will not claim Excel “has no users” or invent a time-saved figure. The comparison is coverage and method, not a fake score.",
    ]},
  ],
  { caption: "Resale IQ vs Excel", head: ["Job", "Excel", "Resale IQ"], rows: [
    ["Remember your buys", "Yes", "Not the product"],
    ["EU Vinted watched departures", "Only if you type them", "Warehouse, five domains"],
    ["Buy-below formula", "If you built one", "Published × 0.95 × 0.70"],
    ["Free item check", "None", "Samba, AF1, NB 530"],
  ]},
  [
    { q: "Is Resale IQ a replacement for Excel?", a: "No. It replaces guessing the market. Keep the sheet for cash. Warehouse: https://resaleiq.dev/data. Plans: https://resaleiq.dev/pricing." },
    { q: "Can I dump Resale IQ numbers into Excel?", a: "Public brand volumes are on /data and the public snapshot API. Item-level buy-below for models other than the three samples is Starter — not a CSV of secrets in the HTML." },
    { q: "Is every model free?", a: "No. Only Adidas Samba, Nike Air Force 1 and New Balance 530. Other models need Starter at €19 a month." },
    { q: "Which markets?", a: "Spain, France, Germany, Italy and Portugal. Not the UK." },
  ],
  "Keep the sheet. Buy the warehouse. Starter €19/mo.",
)

export const vsForLandingCopy: Record<string, Table> = {
  "vs/resale-iq-vs-excel": pack(
    excelEn,
    loc(
      "Resale IQ frente a Excel para flips Vinted",
      "Resale IQ frente a Excel — un almacén, no un libro mayor",
      "Resale IQ frente a Excel para Vinted UE: salidas observadas en vivo y un buy-below publicado frente a una hoja que tienes que escribir. Starter 19 €/mes después de tres muestras gratis.",
      "Excel es excelente recordando lo que pagaste. No puede ver un anuncio salir del lineal en España, Francia, Alemania, Italia y Portugal, deduplicarlo en cinco dominios ni decirte cuándo n es demasiado pequeño. Resale IQ es el almacén. Excel sigue siendo el libro de caja.",
      "Usa Excel para entradas y salidas de caja. Usa Resale IQ para decidir si compras. La muestra gratis es Adidas Samba, Nike Air Force 1 y New Balance 530. El resto es Starter. {weekly} salidas observadas en este recorte entre {brands} marcas están detrás de /data — no dentro de una celda que pegaste el martes pasado.",
      [
        { h: "Lo que Excel no puede ver", p: [
          "Una hoja no sabe que los cinco dominios Vinted de la UE son en gran parte un catálogo. Sumar «España + Francia» infla los anuncios distintos. Deduplicamos por ID. Método: /methodology.",
          "Excel guardará un cero con ganas. Nosotros pintamos una raya cuando el recorte no tiene cifra. Null no es 0.",
        ]},
        { h: "Dónde la hoja sigue ganando", p: [
          "Tu pack fiscal, tus etiquetas, tu «compré a X €». Resale IQ no es software de contabilidad.",
          "El error es usar la hoja como mercado. Las compras pasadas no son la demanda ES/FR/DE/IT/PT. {tracked} anuncios sí.",
        ]},
        { h: "La separación honesta", p: [
          "Quédate Excel. Añade el almacén. Starter abre el buy-below de modelos con nombre más allá de las tres muestras. Los volúmenes de marca siguen públicos.",
          "No diremos que Excel «no tiene usuarios» ni inventaremos horas ahorradas. La comparación es cobertura y método, no una puntuación falsa.",
        ]},
      ],
      { caption: "Resale IQ frente a Excel", head: ["Trabajo", "Excel", "Resale IQ"], rows: [
        ["Recordar compras", "Sí", "No es el producto"],
        ["Salidas observadas Vinted UE", "Solo si las escribes", "Almacén, cinco dominios"],
        ["Fórmula buy-below", "Si construiste una", "Publicada × 0,95 × 0,70"],
        ["Consulta de artículo gratis", "Ninguna", "Samba, AF1, NB 530"],
      ]},
      [
        { q: "¿Resale IQ sustituye a Excel?", a: "No. Sustituye adivinar el mercado. Quédate la hoja para el dinero. Almacén: https://resaleiq.dev/es/data. Planes: https://resaleiq.dev/es/pricing." },
        { q: "¿Puedo pasar números de Resale IQ a Excel?", a: "Los volúmenes públicos de marca están en /data y en la API pública. El buy-below a nivel de artículo fuera de las tres muestras es Starter — no un CSV de secretos en el HTML." },
        { q: "¿Cada modelo es gratis?", a: "No. Solo Adidas Samba, Nike Air Force 1 y New Balance 530. El resto necesita Starter a 19 € al mes." },
        { q: "¿Qué mercados?", a: "España, Francia, Alemania, Italia y Portugal. No el Reino Unido." },
      ],
      "Quédate la hoja. Compra el almacén. Starter 19 €/mes.",
    ),
    loc(
      "Resale IQ contre Excel pour les flips Vinted",
      "Resale IQ contre Excel — un entrepôt, pas un grand livre",
      "Resale IQ contre Excel pour Vinted UE : départs observés en direct et un buy-below publié contre un tableur à saisir. Starter 19 €/mois après trois échantillons gratuits.",
      "Excel est excellent pour se souvenir de ce que vous avez payé. Il ne peut pas voir une annonce quitter l’étagère en Espagne, France, Allemagne, Italie et Portugal, la dédupliquer sur cinq domaines, ni dire quand n est trop petit. Resale IQ est l’entrepôt. Excel reste le journal de caisse.",
      "Utilisez Excel pour les entrées et sorties de caisse. Utilisez Resale IQ pour décider d’acheter. L’échantillon gratuit est Adidas Samba, Nike Air Force 1 et New Balance 530. Le reste est Starter. {weekly} départs observés sur ce cliché, {brands} marques, derrière /data — pas dans une cellule collée mardi dernier.",
      [
        { h: "Ce qu’Excel ne peut pas voir", p: [
          "Un tableur ne sait pas que les cinq domaines Vinted de l’UE sont surtout un catalogue. Additionner « Espagne + France » gonfle les annonces distinctes. Nous dédupliquons par ID. Méthode : /methodology.",
          "Excel stockera un zéro avec joie. Nous affichons un tiret quand le cliché n’a pas de chiffre. Null n’est pas 0.",
        ]},
        { h: "Là où la feuille gagne encore", p: [
          "Votre liasse fiscale, vos étiquettes, votre « j’ai acheté à X € ». Resale IQ n’est pas un logiciel comptable.",
          "L’erreur est d’utiliser la feuille comme marché. Les achats passés ne sont pas la demande ES/FR/DE/IT/PT. {tracked} annonces le sont.",
        ]},
        { h: "La séparation honnête", p: [
          "Gardez Excel. Ajoutez l’entrepôt. Starter ouvre le buy-below des modèles nommés au-delà des trois échantillons. Les volumes de marque restent publics.",
          "Nous ne dirons pas qu’Excel « n’a pas d’utilisateurs » ni n’inventerons d’heures gagnées. La comparaison est couverture et méthode, pas un score inventé.",
        ]},
      ],
      { caption: "Resale IQ contre Excel", head: ["Tâche", "Excel", "Resale IQ"], rows: [
        ["Se souvenir des achats", "Oui", "Pas le produit"],
        ["Départs observés Vinted UE", "Seulement si vous les tapez", "Entrepôt, cinq domaines"],
        ["Formule buy-below", "Si vous en avez bâti une", "Publiée × 0,95 × 0,70"],
        ["Contrôle d’article gratuit", "Aucun", "Samba, AF1, NB 530"],
      ]},
      [
        { q: "Resale IQ remplace-t-il Excel ?", a: "Non. Il remplace le fait de deviner le marché. Gardez la feuille pour l’argent. Entrepôt : https://resaleiq.dev/fr/data. Offres : https://resaleiq.dev/fr/pricing." },
        { q: "Puis-je verser les chiffres Resale IQ dans Excel ?", a: "Les volumes de marque publics sont sur /data et l’API publique. Le buy-below hors des trois échantillons est Starter — pas un CSV de secrets dans le HTML." },
        { q: "Chaque modèle est-il gratuit ?", a: "Non. Seulement Adidas Samba, Nike Air Force 1 et New Balance 530. Le reste nécessite Starter à 19 € par mois." },
        { q: "Quels marchés ?", a: "Espagne, France, Allemagne, Italie et Portugal. Pas le Royaume-Uni." },
      ],
      "Gardez la feuille. Achetez l’entrepôt. Starter 19 €/mois.",
    ),
    loc(
      "Resale IQ gegen Excel für Vinted-Flips",
      "Resale IQ gegen Excel — ein Lager, kein Hauptbuch",
      "Resale IQ gegen Excel für Vinted EU: beobachtete Abgänge live und ein veröffentlichtes Buy-below gegen eine Tabelle, die Sie tippen müssen. Starter 19 €/Monat nach drei kostenlosen Stichproben.",
      "Excel ist hervorragend darin, zu speichern, was Sie gezahlt haben. Es kann nicht sehen, wie ein Inserat in Spanien, Frankreich, Deutschland, Italien und Portugal das Regal verlässt, es über fünf Domains deduplizieren oder sagen, wann n zu klein ist. Resale IQ ist das Lager. Excel bleibt das Kassenbuch.",
      "Nutzen Sie Excel für die GuV. Nutzen Sie Resale IQ, um zu entscheiden, ob Sie kaufen. Die kostenlose Stichprobe ist Adidas Samba, Nike Air Force 1 und New Balance 530. Der Rest ist Starter. {weekly} beobachtete Abgänge in diesem Ausschnitt, {brands} Marken, hinter /data — nicht in einer Zelle von letztem Dienstag.",
      [
        { h: "Was Excel nicht sehen kann", p: [
          "Eine Tabelle weiß nicht, dass die fünf EU-Vinted-Domains weitgehend ein Katalog sind. «Spanien + Frankreich» aufzusummieren bläht distincte Inserate auf. Wir deduplizieren per ID. Methode: /methodology.",
          "Excel speichert gern eine Null. Wir zeigen einen Gedankenstrich, wenn der Ausschnitt keine Zahl hat. Null ist nicht 0.",
        ]},
        { h: "Wo die Tabelle noch gewinnt", p: [
          "Ihr Steuerpaket, Ihre Labels, Ihr «gekauft zu X €». Resale IQ ist keine Buchhaltung.",
          "Der Fehler ist, die Tabelle als Markt zu nutzen. Vergangene Käufe sind nicht die Nachfrage ES/FR/DE/IT/PT. {tracked} Inserate sind es.",
        ]},
        { h: "Die ehrliche Trennung", p: [
          "Behalten Sie Excel. Ergänzen Sie das Lager. Starter öffnet Buy-below für benannte Modelle jenseits der drei Stichproben. Markenvolumen bleiben öffentlich.",
          "Wir behaupten nicht, Excel «habe keine Nutzer», und erfinden keine gesparten Stunden. Der Vergleich ist Abdeckung und Methode, kein Fake-Score.",
        ]},
      ],
      { caption: "Resale IQ gegen Excel", head: ["Aufgabe", "Excel", "Resale IQ"], rows: [
        ["Käufe merken", "Ja", "Nicht das Produkt"],
        ["Beobachtete Vinted-Abgänge EU", "Nur wenn Sie sie tippen", "Lager, fünf Domains"],
        ["Buy-below-Formel", "Wenn Sie eine gebaut haben", "Veröffentlicht × 0,95 × 0,70"],
        ["Kostenlose Artikelprüfung", "Keine", "Samba, AF1, NB 530"],
      ]},
      [
        { q: "Ersetzt Resale IQ Excel?", a: "Nein. Es ersetzt das Raten am Markt. Behalten Sie die Tabelle fürs Geld. Lager: https://resaleiq.dev/de/data. Pläne: https://resaleiq.dev/de/pricing." },
        { q: "Kann ich Resale-IQ-Zahlen nach Excel kippen?", a: "Öffentliche Markenvolumen stehen auf /data und der öffentlichen Snapshot-API. Buy-below außerhalb der drei Stichproben ist Starter — kein CSV von Secrets im HTML." },
        { q: "Ist jedes Modell kostenlos?", a: "Nein. Nur Adidas Samba, Nike Air Force 1 und New Balance 530. Der Rest braucht Starter für 19 € im Monat." },
        { q: "Welche Märkte?", a: "Spanien, Frankreich, Deutschland, Italien und Portugal. Nicht das Vereinigte Königreich." },
      ],
      "Tabelle behalten. Lager kaufen. Starter 19 €/Monat.",
    ),
    loc(
      "Resale IQ contro Excel per i flip Vinted",
      "Resale IQ contro Excel — un magazzino, non un libro mastro",
      "Resale IQ contro Excel per Vinted UE: uscite osservate in diretta e un buy-below pubblicato contro un foglio da digitare. Starter 19 €/mese dopo tre campioni gratuiti.",
      "Excel è ottimo a ricordare quanto hai pagato. Non può vedere un annuncio lasciare lo scaffale in Spagna, Francia, Germania, Italia e Portogallo, deduplicarlo su cinque domini, né dire quando n è troppo piccolo. Resale IQ è il magazzino. Excel resta il giornale di cassa.",
      "Usa Excel per il conto economico. Usa Resale IQ per decidere se comprare. Il campione gratuito è Adidas Samba, Nike Air Force 1 e New Balance 530. Il resto è Starter. {weekly} uscite osservate in questo scatto, {brands} marche, dietro /data — non in una cella incollata martedì scorso.",
      [
        { h: "Cosa Excel non può vedere", p: [
          "Un foglio non sa che i cinque domini Vinted UE sono in gran parte un catalogo. Sommare «Spagna + Francia» gonfia gli annunci distinti. Deduplichiamo per ID. Metodo: /methodology.",
          "Excel memorizzerà volentieri uno zero. Noi mostriamo un trattino quando lo scatto non ha cifra. Null non è 0.",
        ]},
        { h: "Dove il foglio vince ancora", p: [
          "Il tuo pacchetto fiscale, le etichette, il «ho comprato a X €». Resale IQ non è un software di contabilità.",
          "L’errore è usare il foglio come mercato. Gli acquisti passati non sono la domanda ES/FR/DE/IT/PT. {tracked} annunci sì.",
        ]},
        { h: "La separazione onesta", p: [
          "Tieni Excel. Aggiungi il magazzino. Starter apre il buy-below dei modelli nominati oltre i tre campioni. I volumi di marca restano pubblici.",
          "Non diremo che Excel «non ha utenti» né inventeremo ore risparmiate. Il confronto è copertura e metodo, non un punteggio falso.",
        ]},
      ],
      { caption: "Resale IQ contro Excel", head: ["Lavoro", "Excel", "Resale IQ"], rows: [
        ["Ricordare gli acquisti", "Sì", "Non è il prodotto"],
        ["Uscite osservate Vinted UE", "Solo se le scrivi", "Magazzino, cinque domini"],
        ["Formula buy-below", "Se ne hai costruita una", "Pubblicata × 0,95 × 0,70"],
        ["Controllo articolo gratuito", "Nessuno", "Samba, AF1, NB 530"],
      ]},
      [
        { q: "Resale IQ sostituisce Excel?", a: "No. Sostituisce l’indovinare il mercato. Tieni il foglio per i soldi. Magazzino: https://resaleiq.dev/it/data. Piani: https://resaleiq.dev/it/pricing." },
        { q: "Posso versare i numeri Resale IQ in Excel?", a: "I volumi di marca pubblici sono su /data e sull’API pubblica. Il buy-below fuori dai tre campioni è Starter — non un CSV di segreti nell’HTML." },
        { q: "Ogni modello è gratuito?", a: "No. Solo Adidas Samba, Nike Air Force 1 e New Balance 530. Il resto richiede Starter a 19 € al mese." },
        { q: "Quali mercati?", a: "Spagna, Francia, Germania, Italia e Portogallo. Non il Regno Unito." },
      ],
      "Tieni il foglio. Compra il magazzino. Starter 19 €/mese.",
    ),
    loc(
      "Resale IQ vs Excel para flips Vinted",
      "Resale IQ vs Excel — um armazém, não um livro-razão",
      "Resale IQ versus Excel para Vinted UE: saídas observadas ao vivo e um buy-below publicado versus uma folha que tens de escrever. Starter 19 €/mês depois de três amostras grátis.",
      "O Excel é excelente a lembrar o que pagaste. Não consegue ver um anúncio sair da prateleira em Espanha, França, Alemanha, Itália e Portugal, deduplicá-lo em cinco domínios, nem dizer quando n é demasiado pequeno. A Resale IQ é o armazém. O Excel continua a ser o livro de caixa.",
      "Usa o Excel para entradas e saídas de caixa. Usa a Resale IQ para decidir se compras. A amostra grátis é Adidas Samba, Nike Air Force 1 e New Balance 530. O resto é Starter. {weekly} saídas observadas neste recorte, {brands} marcas, atrás de /data — não numa célula colada na terça passada.",
      [
        { h: "O que o Excel não consegue ver", p: [
          "Uma folha não sabe que os cinco domínios Vinted da UE são em grande parte um catálogo. Somar «Espanha + França» inflaciona anúncios distintos. Deduplicamos por ID. Método: /methodology.",
          "O Excel guarda um zero com gosto. Nós mostramos um travessão quando o recorte não tem cifra. Null não é 0.",
        ]},
        { h: "Onde a folha ainda ganha", p: [
          "O teu pacote fiscal, as etiquetas, o «comprei a X €». A Resale IQ não é software de contabilidade.",
          "O erro é usar a folha como mercado. Compras passadas não são a procura ES/FR/DE/IT/PT. {tracked} anúncios são.",
        ]},
        { h: "A separação honesta", p: [
          "Fica com o Excel. Acrescenta o armazém. O Starter abre o buy-below de modelos com nome para além das três amostras. Os volumes de marca continuam públicos.",
          "Não diremos que o Excel «não tem utilizadores» nem inventaremos horas poupadas. A comparação é cobertura e método, não uma pontuação falsa.",
        ]},
      ],
      { caption: "Resale IQ vs Excel", head: ["Tarefa", "Excel", "Resale IQ"], rows: [
        ["Lembrar compras", "Sim", "Não é o produto"],
        ["Saídas observadas Vinted UE", "Só se as escreveres", "Armazém, cinco domínios"],
        ["Fórmula buy-below", "Se construíste uma", "Publicada × 0,95 × 0,70"],
        ["Verificação de artigo grátis", "Nenhuma", "Samba, AF1, NB 530"],
      ]},
      [
        { q: "A Resale IQ substitui o Excel?", a: "Não. Substitui adivinhar o mercado. Fica com a folha para o dinheiro. Armazém: https://resaleiq.dev/pt/data. Planos: https://resaleiq.dev/pt/pricing." },
        { q: "Posso deitar números da Resale IQ no Excel?", a: "Os volumes públicos de marca estão em /data e na API pública. O buy-below fora das três amostras é Starter — não um CSV de segredos no HTML." },
        { q: "Cada modelo é grátis?", a: "Não. Só Adidas Samba, Nike Air Force 1 e New Balance 530. O resto precisa de Starter a 19 € por mês." },
        { q: "Que mercados?", a: "Espanha, França, Alemanha, Itália e Portugal. Não o Reino Unido." },
      ],
      "Fica com a folha. Compra o armazém. Starter 19 €/mês.",
    ),
  ),
}
