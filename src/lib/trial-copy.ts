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
  "No account: 10 checks a day. Free account: the same 10 a day for life, plus 7 days of full Starter access, then 10 full unlocks a month for the deep numbers. Live Finder, Order Planner and Price Compare are Pro."

export const TRIAL_LIMITS_SHORT =
  "10 checks a day without an account; sign up to keep that for life, plus 7 days of full Starter, then 10 full unlocks a month."

/** Logged-in trial banner. Compare is Pro; live finds and one plan are in the trial. */
export const TRIAL_BANNER =
  "Starter trial: Deal Scanner, 5 live finds and 1 order plan. Price Compare is Pro."

export const TRIAL_LIMITS_SENTENCE_BY_LOCALE: Record<Locale, string> = {
  en: TRIAL_LIMITS_SENTENCE,
  fr: "Sans compte : 10 vérifications par jour. Compte gratuit : les mêmes 10 par jour à vie, plus 7 jours d'accès Starter complet, puis 10 déblocages complets par mois pour les chiffres détaillés. Deal Finder live, Order Planner et Price Compare sont réservés à Pro.",
  es: "Sin cuenta: 10 comprobaciones al día. Cuenta gratuita: las mismas 10 al día para siempre, más 7 días de acceso Starter completo, luego 10 desbloqueos completos al mes para los números detallados. Deal Finder en vivo, Order Planner y Price Compare son de Pro.",
  de: "Ohne Konto: 10 Prüfungen pro Tag. Kostenloses Konto: dieselben 10 pro Tag dauerhaft, plus 7 Tage vollständiger Starter-Zugang, danach 10 vollständige Freischaltungen im Monat für die detaillierten Zahlen. Live Deal Finder, Order Planner und Price Compare sind Pro.",
  it: "Senza account: 10 controlli al giorno. Account gratuito: gli stessi 10 al giorno per sempre, più 7 giorni di accesso Starter completo, poi 10 sblocchi completi al mese per i numeri dettagliati. Deal Finder live, Order Planner e Price Compare sono Pro.",
  pt: "Sem conta: 10 verificações por dia. Conta gratuita: as mesmas 10 por dia para sempre, mais 7 dias de acesso Starter completo, depois 10 desbloqueios completos por mês para os números detalhados. Live Deal Finder, Order Planner e Price Compare são Pro.",
}

export const TRIAL_LIMITS_SHORT_BY_LOCALE: Record<Locale, string> = {
  en: TRIAL_LIMITS_SHORT,
  fr: "10 vérifications par jour sans compte ; inscrivez-vous pour les garder à vie, plus 7 jours de Starter complet, puis 10 déblocages complets par mois.",
  es: "10 comprobaciones al día sin cuenta; regístrate para conservarlas para siempre, más 7 días de Starter completo, luego 10 desbloqueos completos al mes.",
  de: "10 Prüfungen pro Tag ohne Konto; melde dich an, um sie dauerhaft zu behalten, plus 7 Tage vollständiges Starter, danach 10 vollständige Freischaltungen im Monat.",
  it: "10 controlli al giorno senza account; registrati per mantenerli per sempre, più 7 giorni di Starter completo, poi 10 sblocchi completi al mese.",
  pt: "10 verificações por dia sem conta; regista-te para as manter para sempre, mais 7 dias de Starter completo, depois 10 desbloqueios completos por mês.",
}

export const TRIAL_BANNER_BY_LOCALE: Record<Locale, string> = {
  en: TRIAL_BANNER,
  fr: "Essai Starter : Deal Scanner, 5 recherches live et 1 plan de commande. Price Compare est réservé à Pro.",
  es: "Prueba Starter: Deal Scanner, 5 búsquedas en vivo y 1 plan de pedido. Price Compare es de Pro.",
  de: "Starter-Testphase: Deal Scanner, 5 Live-Suchen und 1 Bestellplan. Price Compare ist Pro.",
  it: "Prova Starter: Deal Scanner, 5 ricerche live e 1 piano d'ordine. Price Compare è Pro.",
  pt: "Teste Starter: Deal Scanner, 5 pesquisas em direto e 1 plano de encomenda. Price Compare é Pro.",
}
