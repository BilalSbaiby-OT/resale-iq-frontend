import type { Locale } from "@/lib/i18n"

/**
 * One sentence for every public surface. Matches demand-intel/config.py:
 * FREE_VERDICT_DAILY_LIMIT=10/day, 7-day Starter trial, TRIAL_LIVE_FIND_LIMIT=5,
 * TRIAL_PLANNER_LIMIT=1, FREE_UNLOCK_LIFETIME_BUDGET=10/month. Compare is Pro.
 *
 * Plain-string exports below stay English on purpose — they are the default
 * for surfaces this i18n pass did not reach (methodology page, the
 * authenticated paywall/app-shell). The *_BY_LOCALE maps are for the
 * conversion-path surfaces that DO thread a Locale through
 * (free-checker.tsx, pricing-section.tsx, the homepage). Same numbers in
 * every language — only the sentence around them changes.
 */
export const TRIAL_LIMITS_SENTENCE =
  "No account: 10 checks/day. Sign up: 7 days of Starter, 5 live finds and 1 order plan, then 10 full checks/month. Live Finder, Order Planner and Price Compare are Pro."

export const TRIAL_LIMITS_SHORT =
  "10 checks/day without an account; 7 days of Starter + 5 live finds + 1 order plan after signup, then 10/month."

/** Logged-in trial banner. Compare is Pro; live finds and one plan are in the trial. */
export const TRIAL_BANNER =
  "Starter trial: Deal Scanner, 5 live finds and 1 order plan. Price Compare is Pro."

export const TRIAL_LIMITS_SENTENCE_BY_LOCALE: Record<Locale, string> = {
  en: TRIAL_LIMITS_SENTENCE,
  fr: "Sans compte : 10 vérifications/jour. Inscription : 7 jours de Starter, 5 recherches live et 1 plan de commande, puis 10 vérifications complètes/mois. Deal Finder live, Order Planner et Price Compare sont réservés à Pro.",
  es: "Sin cuenta: 10 comprobaciones/día. Al registrarte: 7 días de Starter, 5 búsquedas en vivo y 1 plan de pedido, luego 10 comprobaciones completas/mes. Deal Finder en vivo, Order Planner y Price Compare son de Pro.",
  de: "Ohne Konto: 10 Prüfungen/Tag. Nach Anmeldung: 7 Tage Starter, 5 Live-Suchen und 1 Bestellplan, danach 10 volle Prüfungen/Monat. Live Deal Finder, Order Planner und Price Compare sind Pro.",
  it: "Senza account: 10 controlli/giorno. Con la registrazione: 7 giorni di Starter, 5 ricerche live e 1 piano d'ordine, poi 10 controlli completi/mese. Deal Finder live, Order Planner e Price Compare sono Pro.",
  pt: "Sem conta: 10 verificações/dia. Ao registares-te: 7 dias de Starter, 5 pesquisas em direto e 1 plano de encomenda, depois 10 verificações completas/mês. Live Deal Finder, Order Planner e Price Compare são Pro.",
}

export const TRIAL_LIMITS_SHORT_BY_LOCALE: Record<Locale, string> = {
  en: TRIAL_LIMITS_SHORT,
  fr: "10 vérifications/jour sans compte ; 7 jours de Starter + 5 recherches live + 1 plan de commande après inscription, puis 10/mois.",
  es: "10 comprobaciones/día sin cuenta; 7 días de Starter + 5 búsquedas en vivo + 1 plan de pedido tras el registro, luego 10/mes.",
  de: "10 Prüfungen/Tag ohne Konto; nach Anmeldung 7 Tage Starter + 5 Live-Suchen + 1 Bestellplan, danach 10/Monat.",
  it: "10 controlli/giorno senza account; dopo la registrazione 7 giorni di Starter + 5 ricerche live + 1 piano d'ordine, poi 10/mese.",
  pt: "10 verificações/dia sem conta; após o registo 7 dias de Starter + 5 pesquisas em direto + 1 plano de encomenda, depois 10/mês.",
}

export const TRIAL_BANNER_BY_LOCALE: Record<Locale, string> = {
  en: TRIAL_BANNER,
  fr: "Essai Starter : Deal Scanner, 5 recherches live et 1 plan de commande. Price Compare est réservé à Pro.",
  es: "Prueba Starter: Deal Scanner, 5 búsquedas en vivo y 1 plan de pedido. Price Compare es de Pro.",
  de: "Starter-Testphase: Deal Scanner, 5 Live-Suchen und 1 Bestellplan. Price Compare ist Pro.",
  it: "Prova Starter: Deal Scanner, 5 ricerche live e 1 piano d'ordine. Price Compare è Pro.",
  pt: "Teste Starter: Deal Scanner, 5 pesquisas em direto e 1 plano de encomenda. Price Compare é Pro.",
}
