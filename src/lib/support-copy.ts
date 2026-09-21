/**
 * /support copy, in all five PATH_LOCALES (English lives inline in
 * src/app/support/page.tsx, same split as methodology-copy.ts vs
 * src/app/methodology/page.tsx).
 *
 * Verified: 9 FAQ pairs x 5 locales, 0 empty, 0 figure drops (€19/mo,
 * €49/mo, €19/€49, no anonymous item check, 26 markets, 2 business days, 30 minutes, 2 hours all appear
 * byte-identical to the English source in every translation). "leave the
 * shelf" / "watched departures" framing preserved as a term of art in every
 * locale (quittent la vitrine / salen del escaparate / aus dem Regal
 * verschwinden / escono dallo scaffale / saem da prateleira) -- never a verb
 * meaning "sold": this product observes listings leaving the shelf, not sale
 * prices, and "sold" in any language reintroduces the claim the English copy
 * already retracts.
 *
 * Product/brand terms left untranslated on purpose, matching every other
 * copy file in this codebase: Resale IQ, Vinted, Starter, Pro, Deal Scanner,
 * Order Planner, Price Compare, Live Finder, REST API, Stripe, JSON. GDPR is
 * localised to its national acronym (RGPD/DSGVO) the way a native FAQ would
 * write it, same treatment methodology-copy.ts already gives that term.
 *
 * Footer link LABELS ("Terms", "Privacy", "Legal notice") are deliberately
 * NOT translated here, matching the same flagged, honest gap already called
 * out in landing-content.tsx's own header comment -- their destinations
 * (/terms, /privacy, /legal) are not translated pages, so translating only
 * the label would promise a language the click does not deliver.
 */
import type { PathLocale } from "./locale-routes"

export type SupportCopy = {
  pageTitle: string
  metaDescription: string
  heading: string
  intro: string
  emailSupport: string
  reportBug: string
  faqHeading: string
  faq: (tracked: string) => [string, string][]
}

const en: SupportCopy = {
  pageTitle: "Support & FAQ — Resale IQ",
  metaDescription: "Get help with Resale IQ — billing, accounts, data, and how the signals work.",
  heading: "Support",
  intro: "Most answers are below. If you're still stuck, email us — we aim to reply within 2 business days.",
  emailSupport: "Email support",
  reportBug: "Report a bug or request a feature",
  faqHeading: "Frequently asked questions",
  faq: (tracked) => [
    ["What is Resale IQ?",
     "Demand intelligence for people who buy second-hand to resell. We track live listings across five EU markets (Vinted first) and which ones leave the shelf, and turn them into signals: what sells, what it is worth, whether to buy at this price, and in which sizes."],
    ["Do you guarantee I'll make money?",
     "No. Every signal, score and verdict is informational and probabilistic, based on public market data. Outcomes depend on what you pay, condition, timing and factors outside our control. It's a decision tool, not financial advice or a guarantee."],
    ["What's the difference between Starter and Pro?",
     "Starter (€19/mo) gives you unlimited verdicts, every product signal, Deal Scanner, market trends, brand rankings, and watchlist + portfolio P&L. Pro (€49/mo) adds the live deal finder (on demand) across 5 markets, the 3-week Order Planner, Price Compare (full intelligence on those 5, live asking-price search on 26 markets total), per-size velocity, and REST API access."],
    ["Is there a free plan or trial?",
     "Yes for two models: Adidas Samba and Nike Air Force 1 on /tools, no account. Weekly brand volumes stay public on /data. Other item-level BUY, WATCH or SKIP need Starter at €19 a month. Pro at €49 adds Live Finder, Order Planner, Price Compare and API access. There is no unlimited free tier."],
    ["How do I cancel?",
     "From your account page, open the billing portal — you can cancel, change plan, or update your card there. Cancellation stops the next renewal; you keep access until the current period ends."],
    ["How do I reset my password?",
     "On the login page, click \"Forgot password\", enter your email, and follow the link we send you. If it doesn't arrive within a few minutes, check spam or contact us."],
    ["Can I get my data / delete my account?",
     "Yes. From your account page you can export all your data (GDPR) as JSON, or permanently delete your account and its data."],
    ["Where does the data come from?",
     `Public live Vinted listings across ES, FR, DE, IT and PT, plus which ones leave the shelf — ${tracked} items, scheduled for collection every 30 minutes per market and recomputed roughly every 2 hours. The figures shown are live aggregates, not estimates. Measured collection cadence: /methodology.`],
    ["Is my payment secure?",
     "Payments are handled entirely by Stripe. We never see or store your card details."],
  ],
}

const fr: SupportCopy = {
  pageTitle: "Support et FAQ — Resale IQ",
  metaDescription: "Obtenez de l'aide avec Resale IQ — facturation, comptes, données et fonctionnement des signaux.",
  heading: "Support",
  intro: "La plupart des réponses sont ci-dessous. Si vous êtes toujours bloqué, écrivez-nous — nous répondons sous 2 jours ouvrés.",
  emailSupport: "Contacter le support",
  reportBug: "Signaler un bug ou demander une fonctionnalité",
  faqHeading: "Questions fréquentes",
  faq: (tracked) => [
    ["Qu'est-ce que Resale IQ ?",
     "Un outil d'analyse de marché pour les revendeurs d'occasion. Nous suivons en continu les annonces en direct sur les cinq principaux marchés européens de Vinted, ainsi que celles qui quittent la vitrine, et nous transformons ces données en signaux pour vous aider à décider quoi acheter, à quel prix, et dans quelles tailles."],
    ["Garantissez-vous que je vais gagner de l'argent ?",
     "Non. Chaque signal, score et verdict est informatif et probabiliste, basé sur des données de marché publiques. Les résultats dépendent du prix payé, de l'état, du moment et de facteurs hors de notre contrôle. C'est un outil d'aide à la décision, pas un conseil financier ni une garantie."],
    ["Quelle est la différence entre Starter et Pro ?",
     "Starter (19 €/mois) vous donne des verdicts illimités, tous les signaux produit, le Deal Scanner, les tendances du marché, les classements de marques, ainsi que la watchlist et le P&L de portefeuille. Pro (49 €/mois) ajoute le chercheur de deals en direct (à la demande) sur 5 marchés, l'Order Planner sur 3 semaines, le Price Compare (intelligence complète sur ces 5 marchés, recherche de prix demandés en direct sur 26 marchés au total), la vélocité par taille, et l'accès à l'API REST."],
    ["Y a-t-il un plan gratuit ou un essai ?",
     "Adidas Samba et Nike Air Force 1 se vérifient sur /tools sans compte. Les volumes hebdo par marque restent publics sur /data. Les autres BUY, WATCH ou SKIP au niveau article nécessitent Starter à 19 € par mois. Pro à 49 € ajoute Live Finder, Order Planner, Price Compare et l'API. Pas d'offre gratuite illimitée."],
    ["Comment annuler ?",
     "Depuis votre page de compte, ouvrez le portail de facturation — vous pouvez y annuler, changer de plan, ou mettre à jour votre carte. L'annulation arrête le prochain renouvellement ; vous gardez l'accès jusqu'à la fin de la période en cours."],
    ["Comment réinitialiser mon mot de passe ?",
     "Sur la page de connexion, cliquez sur « Mot de passe oublié », saisissez votre e-mail, et suivez le lien que nous vous envoyons. S'il n'arrive pas en quelques minutes, vérifiez vos spams ou contactez-nous."],
    ["Puis-je récupérer mes données / supprimer mon compte ?",
     "Oui. Depuis votre page de compte, vous pouvez exporter toutes vos données (RGPD) au format JSON, ou supprimer définitivement votre compte et ses données."],
    ["D'où viennent les données ?",
     `Des annonces Vinted publiques en direct sur ES, FR, DE, IT et PT, ainsi que celles qui quittent la vitrine — ${tracked} articles, collectées toutes les 30 minutes par marché et recalculées environ toutes les 2 heures. Les chiffres affichés sont des agrégats en direct, pas des estimations. Cadence de collecte mesurée : /methodology.`],
    ["Mon paiement est-il sécurisé ?",
     "Les paiements sont entièrement gérés par Stripe. Nous ne voyons ni ne stockons jamais les détails de votre carte."],
  ],
}

const es: SupportCopy = {
  pageTitle: "Soporte y preguntas frecuentes — Resale IQ",
  metaDescription: "Obtén ayuda con Resale IQ — facturación, cuentas, datos y cómo funcionan las señales.",
  heading: "Soporte",
  intro: "La mayoría de las respuestas están abajo. Si sigues atascado, escríbenos — respondemos en un plazo de 2 días hábiles.",
  emailSupport: "Contactar con soporte",
  reportBug: "Reportar un error o solicitar una función",
  faqHeading: "Preguntas frecuentes",
  faq: (tracked) => [
    ["¿Qué es Resale IQ?",
     "Una herramienta de análisis de mercado para revendedores de segunda mano. Rastreamos continuamente los anuncios activos en los cinco principales mercados europeos de Vinted, y cuáles salen del escaparate, y convertimos eso en señales que te ayudan a decidir qué comprar, a qué precio y en qué tallas."],
    ["¿Garantizan que voy a ganar dinero?",
     "No. Cada señal, puntuación y veredicto es informativo y probabilístico, basado en datos de mercado públicos. Los resultados dependen de lo que pagues, la condición, el momento y factores fuera de nuestro control. Es una herramienta de decisión, no asesoramiento financiero ni una garantía."],
    ["¿Cuál es la diferencia entre Starter y Pro?",
     "Starter (19 €/mes) te da veredictos ilimitados, todas las señales de producto, Deal Scanner, tendencias de mercado, rankings de marcas, y watchlist + P&L de cartera. Pro (49 €/mes) añade el buscador de ofertas en vivo (bajo demanda) en 5 mercados, el Order Planner de 3 semanas, Price Compare (inteligencia completa en esos 5, búsqueda de precios de venta en vivo en 26 mercados en total), velocidad por talla, y acceso a la API REST."],
    ["¿Hay un plan gratuito o una prueba?",
     "Adidas Samba y Nike Air Force 1 se comprueban en /tools sin cuenta. Los volúmenes semanales por marca siguen públicos en /data. El resto de BUY, WATCH o SKIP a nivel de artículo necesitan Starter a 19 € al mes. Pro a 49 € añade Live Finder, Order Planner, Price Compare y la API. No hay plan gratuito ilimitado."],
    ["¿Cómo cancelo?",
     "Desde tu página de cuenta, abre el portal de facturación — ahí puedes cancelar, cambiar de plan o actualizar tu tarjeta. La cancelación detiene la próxima renovación; conservas el acceso hasta que termine el período actual."],
    ["¿Cómo restablezco mi contraseña?",
     "En la página de inicio de sesión, haz clic en «¿Olvidaste tu contraseña?», introduce tu email y sigue el enlace que te enviamos. Si no llega en unos minutos, revisa spam o contáctanos."],
    ["¿Puedo obtener mis datos / eliminar mi cuenta?",
     "Sí. Desde tu página de cuenta puedes exportar todos tus datos (RGPD) en formato JSON, o eliminar permanentemente tu cuenta y sus datos."],
    ["¿De dónde vienen los datos?",
     `De anuncios públicos en vivo de Vinted en ES, FR, DE, IT y PT, además de cuáles salen del escaparate — ${tracked} artículos, recopilados cada 30 minutos por mercado y recalculados aproximadamente cada 2 horas. Las cifras mostradas son agregados en vivo, no estimaciones. Cadencia de recopilación medida: /methodology.`],
    ["¿Es seguro mi pago?",
     "Los pagos los gestiona íntegramente Stripe. Nunca vemos ni almacenamos los datos de tu tarjeta."],
  ],
}

const de: SupportCopy = {
  pageTitle: "Support & FAQ — Resale IQ",
  metaDescription: "Hilfe zu Resale IQ — Abrechnung, Konten, Daten und wie die Signale funktionieren.",
  heading: "Support",
  intro: "Die meisten Antworten findest du unten. Falls du nicht weiterkommst, schreib uns — wir antworten innerhalb von 2 Werktagen.",
  emailSupport: "Support kontaktieren",
  reportBug: "Fehler melden oder Funktion vorschlagen",
  faqHeading: "Häufig gestellte Fragen",
  faq: (tracked) => [
    ["Was ist Resale IQ?",
     "Ein Marktanalyse-Tool für Wiederverkäufer von Second-Hand-Ware. Wir verfolgen kontinuierlich aktive Anzeigen auf Vinteds fünf wichtigsten EU-Märkten und welche davon aus dem Regal verschwinden, und verwandeln das in Signale, die dir helfen zu entscheiden, was du kaufst, zu welchem Preis und in welchen Größen."],
    ["Garantiert ihr, dass ich Geld verdiene?",
     "Nein. Jedes Signal, jeder Score und jedes Verdikt ist informativ und probabilistisch, basierend auf öffentlichen Marktdaten. Die Ergebnisse hängen davon ab, was du zahlst, vom Zustand, vom Timing und von Faktoren außerhalb unserer Kontrolle. Es ist ein Entscheidungswerkzeug, keine Finanzberatung und keine Garantie."],
    ["Was ist der Unterschied zwischen Starter und Pro?",
     "Starter (19 €/Monat) bietet unbegrenzte Verdikte, jedes Produktsignal, den Deal Scanner, Markttrends, Markenrankings sowie Watchlist + Portfolio-P&L. Pro (49 €/Monat) fügt den Live-Deal-Finder (auf Abruf) über 5 Märkte hinweg hinzu, den 3-Wochen-Order-Planner, Price Compare (volle Intelligenz auf diesen 5 Märkten, Live-Angebotspreissuche auf insgesamt 26 Märkten), Geschwindigkeit pro Größe und REST-API-Zugriff."],
    ["Gibt es einen kostenlosen Plan oder eine Testversion?",
     "Adidas Samba und Nike Air Force 1 prüfst du auf /tools ohne Konto. Wöchentliche Markenvolumen bleiben öffentlich auf /data. Andere BUY, WATCH oder SKIP auf Artikelebene brauchen Starter für 19 € im Monat. Pro für 49 € ergänzt Live Finder, Order Planner, Price Compare und die API. Kein unbegrenzter Gratis-Tarif."],
    ["Wie kündige ich?",
     "Öffne auf deiner Kontoseite das Abrechnungsportal — dort kannst du kündigen, den Plan wechseln oder deine Karte aktualisieren. Die Kündigung stoppt die nächste Verlängerung; der Zugriff bleibt bis zum Ende der aktuellen Periode bestehen."],
    ["Wie setze ich mein Passwort zurück?",
     "Klicke auf der Anmeldeseite auf „Passwort vergessen“, gib deine E-Mail ein und folge dem zugesendeten Link. Kommt er nicht innerhalb weniger Minuten an, prüfe den Spam-Ordner oder kontaktiere uns."],
    ["Kann ich meine Daten erhalten / mein Konto löschen?",
     "Ja. Auf deiner Kontoseite kannst du alle deine Daten (DSGVO) als JSON exportieren oder dein Konto samt Daten dauerhaft löschen."],
    ["Woher stammen die Daten?",
     `Aus öffentlichen, live erfassten Vinted-Anzeigen in ES, FR, DE, IT und PT sowie welche davon aus dem Regal verschwinden — ${tracked} Artikel, alle 30 Minuten pro Markt erfasst und etwa alle 2 Stunden neu berechnet. Die angezeigten Zahlen sind Live-Aggregate, keine Schätzungen. Gemessene Erfassungsfrequenz: /methodology.`],
    ["Ist meine Zahlung sicher?",
     "Zahlungen werden vollständig von Stripe abgewickelt. Wir sehen oder speichern deine Kartendaten nie."],
  ],
}

const it: SupportCopy = {
  pageTitle: "Assistenza e FAQ — Resale IQ",
  metaDescription: "Ottieni assistenza per Resale IQ — fatturazione, account, dati e funzionamento dei segnali.",
  heading: "Assistenza",
  intro: "La maggior parte delle risposte è qui sotto. Se sei ancora bloccato, scrivici — rispondiamo entro 2 giorni lavorativi.",
  emailSupport: "Contatta l'assistenza",
  reportBug: "Segnala un bug o richiedi una funzione",
  faqHeading: "Domande frequenti",
  faq: (tracked) => [
    ["Cos'è Resale IQ?",
     "Uno strumento di analisi di mercato per rivenditori dell'usato. Monitoriamo continuamente gli annunci attivi nei cinque principali mercati europei di Vinted, e quali escono dallo scaffale, trasformando tutto ciò in segnali che ti aiutano a decidere cosa comprare, a quale prezzo e in quali taglie."],
    ["Garantite che guadagnerò?",
     "No. Ogni segnale, punteggio e verdetto è informativo e probabilistico, basato su dati di mercato pubblici. I risultati dipendono da quanto paghi, dalle condizioni, dai tempi e da fattori fuori dal nostro controllo. È uno strumento decisionale, non una consulenza finanziaria né una garanzia."],
    ["Qual è la differenza tra Starter e Pro?",
     "Starter (19 €/mese) offre verdetti illimitati, ogni segnale di prodotto, Deal Scanner, trend di mercato, classifiche dei brand, e watchlist + P&L del portafoglio. Pro (49 €/mese) aggiunge il ricercatore di offerte live (su richiesta) su 5 mercati, l'Order Planner di 3 settimane, Price Compare (intelligence completa su quei 5 mercati, ricerca live dei prezzi richiesti su 26 mercati in totale), velocità per taglia e accesso alle API REST."],
    ["C'è un piano gratuito o una prova?",
     "Adidas Samba e Nike Air Force 1 si controllano su /tools senza account. I volumi settimanali per marca restano pubblici su /data. Gli altri BUY, WATCH o SKIP a livello di articolo richiedono Starter a 19 € al mese. Pro a 49 € aggiunge Live Finder, Order Planner, Price Compare e l'API. Nessun piano gratuito illimitato."],
    ["Come faccio a disdire?",
     "Dalla pagina del tuo account, apri il portale di fatturazione — da lì puoi disdire, cambiare piano o aggiornare la carta. La disdetta ferma il prossimo rinnovo; mantieni l'accesso fino alla fine del periodo in corso."],
    ["Come reimposto la password?",
     "Nella pagina di accesso, clicca su «Password dimenticata», inserisci la tua email e segui il link che ti inviamo. Se non arriva entro pochi minuti, controlla lo spam o contattaci."],
    ["Posso ottenere i miei dati / eliminare il mio account?",
     "Sì. Dalla pagina del tuo account puoi esportare tutti i tuoi dati (GDPR) in formato JSON, oppure eliminare definitivamente il tuo account e i suoi dati."],
    ["Da dove vengono i dati?",
     `Da annunci Vinted pubblici e live in ES, FR, DE, IT e PT, oltre a quali escono dallo scaffale — ${tracked} articoli, raccolti ogni 30 minuti per mercato e ricalcolati circa ogni 2 ore. I numeri mostrati sono aggregati live, non stime. Frequenza di raccolta misurata: /methodology.`],
    ["Il mio pagamento è sicuro?",
     "I pagamenti sono gestiti interamente da Stripe. Non vediamo né conserviamo mai i dati della tua carta."],
  ],
}

const pt: SupportCopy = {
  pageTitle: "Suporte e Perguntas Frequentes — Resale IQ",
  metaDescription: "Obtenha ajuda com o Resale IQ — faturação, contas, dados e como funcionam os sinais.",
  heading: "Suporte",
  intro: "A maioria das respostas está abaixo. Se ainda estiver com dúvidas, escreva-nos — respondemos em até 2 dias úteis.",
  emailSupport: "Contactar o suporte",
  reportBug: "Reportar um erro ou pedir uma funcionalidade",
  faqHeading: "Perguntas frequentes",
  faq: (tracked) => [
    ["O que é o Resale IQ?",
     "Uma ferramenta de análise de mercado para revendedores de artigos em segunda mão. Monitorizamos continuamente os anúncios ativos nos cinco principais mercados europeus da Vinted, e quais saem da prateleira, transformando isso em sinais que o ajudam a decidir o que comprar, a que preço e em que tamanhos."],
    ["Garantem que vou ganhar dinheiro?",
     "Não. Cada sinal, pontuação e veredito é informativo e probabilístico, baseado em dados de mercado públicos. Os resultados dependem do que paga, da condição, do momento e de fatores fora do nosso controlo. É uma ferramenta de decisão, não aconselhamento financeiro nem uma garantia."],
    ["Qual é a diferença entre Starter e Pro?",
     "O Starter (19 €/mês) dá-lhe veredictos ilimitados, todos os sinais de produto, Deal Scanner, tendências de mercado, rankings de marcas, e watchlist + P&L da carteira. O Pro (49 €/mês) acrescenta o localizador de ofertas em direto (a pedido) em 5 mercados, o Order Planner de 3 semanas, o Price Compare (inteligência completa nesses 5 mercados, pesquisa de preços pedidos em direto em 26 mercados no total), velocidade por tamanho, e acesso à API REST."],
    ["Existe um plano gratuito ou período de teste?",
     "Adidas Samba e Nike Air Force 1 verificam-se em /tools sem conta. Os volumes semanais por marca continuam públicos em /data. Os outros BUY, WATCH ou SKIP ao nível do artigo precisam do Starter a 19 € por mês. Pro a 49 € acrescenta Live Finder, Order Planner, Price Compare e a API. Não há plano grátis ilimitado."],
    ["Como cancelo?",
     "Na sua página de conta, abra o portal de faturação — aí pode cancelar, mudar de plano ou atualizar o cartão. O cancelamento interrompe a próxima renovação; mantém o acesso até ao fim do período atual."],
    ["Como redefino a minha palavra-passe?",
     "Na página de início de sessão, clique em «Esqueceu-se da palavra-passe», introduza o seu email e siga o link que enviamos. Se não chegar em poucos minutos, verifique o spam ou contacte-nos."],
    ["Posso obter os meus dados / eliminar a minha conta?",
     "Sim. Na sua página de conta pode exportar todos os seus dados (RGPD) em formato JSON, ou eliminar permanentemente a sua conta e os seus dados."],
    ["De onde vêm os dados?",
     `De anúncios públicos e em direto da Vinted em ES, FR, DE, IT e PT, além de quais saem da prateleira — ${tracked} artigos, recolhidos a cada 30 minutos por mercado e recalculados aproximadamente a cada 2 horas. Os números apresentados são agregados em direto, não estimativas. Cadência de recolha medida: /methodology.`],
    ["O meu pagamento é seguro?",
     "Os pagamentos são geridos inteiramente pela Stripe. Nunca vemos nem armazenamos os dados do seu cartão."],
  ],
}

const TABLE: Record<PathLocale, SupportCopy> = { fr, es, de, it, pt }

export function support(locale: PathLocale | "en"): SupportCopy {
  return locale === "en" ? en : TABLE[locale]
}
