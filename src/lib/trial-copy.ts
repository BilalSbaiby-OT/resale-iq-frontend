import type { Locale } from "@/lib/i18n"

/**
 * One sentence for every public surface. Matches live HARD_PAYWALL:
 * anon /api/verdict is HTTP 402, no item-level buy-below without Starter
 * (€19) or Pro (€49). Weekly brand volumes on /data stay public.
 *
 * Plain-string exports below stay English on purpose — they are the default
 * for surfaces this i18n pass did not reach (methodology page, the
 * authenticated paywall/app-shell). The *_BY_LOCALE maps are for the
 * conversion-path surfaces that DO thread a Locale through
 * (free-checker.tsx, pricing-section.tsx, the homepage). Same numbers in
 * every language — only the sentence around them changes.
 */
export const TRIAL_LIMITS_SENTENCE =
  "Item-level BUY, WATCH or SKIP is Starter at €19 a month. There is no anonymous item check and no free tier. Weekly brand volumes and average departure prices stay public on /data."

export const TRIAL_LIMITS_SHORT =
  "Item checks start at Starter €19/month. Weekly brand volumes on /data stay public."

/** Logged-in trial banner. Compare is Pro; live finds and one plan are in the trial. */
export const TRIAL_BANNER =
  "Starter trial: Deal Scanner, 5 live finds and 1 order plan. Price Compare is Pro."

export const TRIAL_LIMITS_SENTENCE_BY_LOCALE: Record<Locale, string> = {
  en: TRIAL_LIMITS_SENTENCE,
  fr: "BUY, WATCH ou SKIP au niveau article, c'est Starter à 19 € par mois. Pas de vérification anonyme, pas d'offre gratuite. Les volumes hebdo par marque et les prix moyens de départ restent publics sur /data.",
  es: "BUY, WATCH o SKIP a nivel de artículo es Starter a 19 € al mes. No hay comprobación anónima ni plan gratuito. Los volúmenes semanales por marca y los precios medios de salida siguen públicos en /data.",
  de: "BUY, WATCH oder SKIP auf Artikelebene ist Starter für 19 € im Monat. Keine anonyme Prüfung, kein Gratis-Tarif. Wöchentliche Markenvolumen und durchschnittliche Abgangspreise bleiben öffentlich auf /data.",
  it: "BUY, WATCH o SKIP a livello di articolo è Starter a 19 € al mese. Nessun controllo anonimo, nessun piano gratuito. I volumi settimanali per marca e i prezzi medi di uscita restano pubblici su /data.",
  pt: "BUY, WATCH ou SKIP ao nível do artigo é Starter a 19 € por mês. Não há verificação anónima nem plano grátis. Os volumes semanais por marca e os preços médios de saída continuam públicos em /data.",
}

export const TRIAL_LIMITS_SHORT_BY_LOCALE: Record<Locale, string> = {
  en: TRIAL_LIMITS_SHORT,
  fr: "Les vérifications d'articles commencent à Starter 19 €/mois. Les volumes hebdo par marque restent publics sur /data.",
  es: "Las comprobaciones de artículos empiezan en Starter a 19 €/mes. Los volúmenes semanales por marca siguen públicos en /data.",
  de: "Artikelprüfungen beginnen bei Starter 19 €/Monat. Wöchentliche Markenvolumen bleiben öffentlich auf /data.",
  it: "I controlli articolo partono da Starter a 19 €/mese. I volumi settimanali per marca restano pubblici su /data.",
  pt: "As verificações de artigos começam no Starter a 19 €/mês. Os volumes semanais por marca continuam públicos em /data.",
}

export const TRIAL_BANNER_BY_LOCALE: Record<Locale, string> = {
  en: TRIAL_BANNER,
  fr: "Essai Starter : Deal Scanner, 5 recherches live et 1 plan de commande. Price Compare est réservé à Pro.",
  es: "Prueba Starter: Deal Scanner, 5 búsquedas en vivo y 1 plan de pedido. Price Compare es de Pro.",
  de: "Starter-Testphase: Deal Scanner, 5 Live-Suchen und 1 Bestellplan. Price Compare ist Pro.",
  it: "Prova Starter: Deal Scanner, 5 ricerche live e 1 piano d'ordine. Price Compare è Pro.",
  pt: "Teste Starter: Deal Scanner, 5 pesquisas em direto e 1 plano de encomenda. Price Compare é Pro.",
}
