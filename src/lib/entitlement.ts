import type { Locale } from "@/lib/i18n"
import type { User } from "@/types"

/**
 * THE single source for what a signed-in account actually has, in words.
 *
 * Every authenticated surface that names a plan or an entitlement reads from
 * here — the sidebar chip (components/layout/sidebar.tsx) and the account page
 * plan card (app/(dashboard)/account/page.tsx). Two surfaces rendering the same
 * state must not be able to disagree, because on 2026-09-06 they did: the
 * sidebar said "Free" while the account page said "Free trial" for one user,
 * and the account page promised "days of unlimited left" in hardcoded English
 * to a Spanish customer. Add a surface, import from this file; do not restate
 * the numbers anywhere else.
 *
 * PUBLIC (logged-out) copy lives in trial-copy.ts. The numbers in both files
 * are the same numbers and both are anchored to the backend, not to each other.
 *
 * Anchored to demand-intel, verified 2026-09-06 by reading the enforcement, not
 * the docs:
 *
 *   trial      api/routes.py:973-976 — `is_paid = await _is_trial_active(...)`,
 *              so the daily verdict cap does not apply: checks are genuinely
 *              uncapped DURING the trial.
 *              api/auth.py:683 require_paid_plan — trial passes, so all
 *              Starter data and Deal Scanner are open.
 *              config.py:104 TRIAL_LIVE_FIND_LIMIT=5 and :105
 *              TRIAL_PLANNER_LIMIT=1 — budgets for the WHOLE trial, not daily.
 *              api/routes.py:2943 require_pro_paid — Price Compare returns 402
 *              to a trial. Mirrored in sidebar.tsx's `locked` rule.
 *   after      config.py:26 FREE_VERDICT_DAILY_LIMIT=10 per day, forever, and
 *              config.py:93 FREE_UNLOCK_LIFETIME_BUDGET=10 full unlocks per
 *              calendar month (the name is historical; it rolls monthly).
 *   paid       api/routes.py:993 — "operator and power stay unlimited". So
 *              "unlimited" is true of the PAID tiers and is used only there.
 *
 * Which is why no trial string here says "unlimited". Uncapped checks are only
 * one part of the trial, and the same breath grants 5 live finds, 1 order plan
 * and no Price Compare at all. An unqualified "unlimited" is the wording a
 * refund request quotes back at us, and it also erases the difference between
 * the trial and the tiers we are asking people to pay for.
 *
 * `trial_pending` exists because trial_ends_at stays NULL until email
 * confirmation (api/auth.py:630 _start_trial_if_unset). A lapsed trial and a
 * trial that never started are both plan=free/trial_active=false, and telling
 * someone their trial "ended" when they still have all 7 days waiting behind a
 * confirmation click is a false statement that costs us the trial.
 */
export type PlanState = "pro" | "starter" | "trial" | "trial_lapsed" | "trial_pending"

export function planState(user: User | null | undefined): PlanState | null {
  if (!user) return null
  if (user.plan === "power") return "pro"
  if (user.plan === "operator") return "starter"
  if (user.trial_active) return "trial"
  return user.trial_ends_at ? "trial_lapsed" : "trial_pending"
}

interface StaticEntry { chip: string; sub: string }
interface TrialEntry { chip: string; sub: (daysLeft: number) => string }

interface PlanCopy {
  pro: StaticEntry
  starter: StaticEntry
  trial: TrialEntry
  trial_lapsed: StaticEntry
  trial_pending: StaticEntry
}

const PLAN_COPY: Record<Locale, PlanCopy> = {
  en: {
    pro: {
      chip: "Pro",
      sub: "Unlimited checks, every signal, Live Finder, Order Planner and Price Compare.",
    },
    starter: {
      chip: "Starter",
      sub: "Unlimited checks and every verdict signal. Live Finder, Order Planner and Price Compare are Pro.",
    },
    trial: {
      chip: "Starter trial",
      sub: n => `${n === 1 ? "1 day" : `${n} days`} of full Starter left — Deal Scanner, plus 5 live finds and 1 order plan for the whole trial. Then 10 checks a day and 10 full unlocks a month.`,
    },
    trial_lapsed: {
      chip: "Free",
      sub: "Trial over — 10 checks a day, and 10 full unlocks a month.",
    },
    trial_pending: {
      chip: "Free",
      sub: "10 checks a day, and 10 full unlocks a month. Confirm your email to start 7 days of full Starter.",
    },
  },
  fr: {
    pro: {
      chip: "Pro",
      sub: "Vérifications illimitées, tous les signaux, Live Finder, Order Planner et Price Compare.",
    },
    starter: {
      chip: "Starter",
      sub: "Vérifications illimitées et tous les signaux du verdict. Live Finder, Order Planner et Price Compare sont réservés à Pro.",
    },
    trial: {
      chip: "Essai Starter",
      sub: n => `Il reste ${n === 1 ? "1 jour" : `${n} jours`} de Starter complet — Deal Scanner, plus 5 recherches live et 1 plan de commande pour tout l'essai. Ensuite : 10 vérifications par jour et 10 déblocages complets par mois.`,
    },
    trial_lapsed: {
      chip: "Gratuit",
      sub: "Essai terminé — 10 vérifications par jour et 10 déblocages complets par mois.",
    },
    trial_pending: {
      chip: "Gratuit",
      sub: "10 vérifications par jour et 10 déblocages complets par mois. Confirmez votre e-mail pour démarrer 7 jours de Starter complet.",
    },
  },
  es: {
    pro: {
      chip: "Pro",
      sub: "Comprobaciones ilimitadas, todas las señales, Live Finder, Order Planner y Price Compare.",
    },
    starter: {
      chip: "Starter",
      sub: "Comprobaciones ilimitadas y todas las señales del veredicto. Live Finder, Order Planner y Price Compare son de Pro.",
    },
    trial: {
      chip: "Prueba Starter",
      sub: n => `${n === 1 ? "Queda 1 día" : `Quedan ${n} días`} de Starter completo — Deal Scanner, más 5 búsquedas en vivo y 1 plan de pedido para toda la prueba. Después: 10 comprobaciones al día y 10 desbloqueos completos al mes.`,
    },
    trial_lapsed: {
      chip: "Gratis",
      sub: "Prueba terminada — 10 comprobaciones al día y 10 desbloqueos completos al mes.",
    },
    trial_pending: {
      chip: "Gratis",
      sub: "10 comprobaciones al día y 10 desbloqueos completos al mes. Confirma tu correo para empezar 7 días de Starter completo.",
    },
  },
  de: {
    pro: {
      chip: "Pro",
      sub: "Unbegrenzte Prüfungen, alle Signale, Live Finder, Order Planner und Price Compare.",
    },
    starter: {
      chip: "Starter",
      sub: "Unbegrenzte Prüfungen und alle Verdict-Signale. Live Finder, Order Planner und Price Compare sind Pro.",
    },
    trial: {
      chip: "Starter-Test",
      sub: n => `Noch ${n === 1 ? "1 Tag" : `${n} Tage`} vollständiges Starter — Deal Scanner, dazu 5 Live-Suchen und 1 Bestellplan für die gesamte Testphase. Danach: 10 Prüfungen pro Tag und 10 vollständige Freischaltungen im Monat.`,
    },
    trial_lapsed: {
      chip: "Kostenlos",
      sub: "Testphase beendet — 10 Prüfungen pro Tag und 10 vollständige Freischaltungen im Monat.",
    },
    trial_pending: {
      chip: "Kostenlos",
      sub: "10 Prüfungen pro Tag und 10 vollständige Freischaltungen im Monat. Bestätige deine E-Mail-Adresse, um 7 Tage vollständiges Starter zu starten.",
    },
  },
  it: {
    pro: {
      chip: "Pro",
      sub: "Controlli illimitati, tutti i segnali, Live Finder, Order Planner e Price Compare.",
    },
    starter: {
      chip: "Starter",
      sub: "Controlli illimitati e tutti i segnali del verdetto. Live Finder, Order Planner e Price Compare sono Pro.",
    },
    trial: {
      chip: "Prova Starter",
      sub: n => `${n === 1 ? "Resta 1 giorno" : `Restano ${n} giorni`} di Starter completo — Deal Scanner, più 5 ricerche live e 1 piano d'ordine per tutta la prova. Poi: 10 controlli al giorno e 10 sblocchi completi al mese.`,
    },
    trial_lapsed: {
      chip: "Gratis",
      sub: "Prova terminata — 10 controlli al giorno e 10 sblocchi completi al mese.",
    },
    trial_pending: {
      chip: "Gratis",
      sub: "10 controlli al giorno e 10 sblocchi completi al mese. Conferma la tua email per iniziare 7 giorni di Starter completo.",
    },
  },
  pt: {
    pro: {
      chip: "Pro",
      sub: "Verificações ilimitadas, todos os sinais, Live Finder, Order Planner e Price Compare.",
    },
    starter: {
      chip: "Starter",
      sub: "Verificações ilimitadas e todos os sinais do veredicto. Live Finder, Order Planner e Price Compare são Pro.",
    },
    trial: {
      chip: "Teste Starter",
      sub: n => `${n === 1 ? "Falta 1 dia" : `Faltam ${n} dias`} de Starter completo — Deal Scanner, mais 5 pesquisas em direto e 1 plano de encomenda para todo o teste. Depois: 10 verificações por dia e 10 desbloqueios completos por mês.`,
    },
    trial_lapsed: {
      chip: "Gratuito",
      sub: "Teste terminado — 10 verificações por dia e 10 desbloqueios completos por mês.",
    },
    trial_pending: {
      chip: "Gratuito",
      sub: "10 verificações por dia e 10 desbloqueios completos por mês. Confirma o teu email para começar 7 dias de Starter completo.",
    },
  },
}

/** Exposed for the drift test. Not a rendering surface — call planChip/planEntitlement. */
export const PLAN_COPY_TABLE = PLAN_COPY

/** The plan name as the customer should see it. Em dash when there is no user yet. */
export function planChip(user: User | null | undefined, locale: Locale): string {
  const state = planState(user)
  return state ? PLAN_COPY[locale][state].chip : "—"
}

/** One sentence for what this account can actually do. Empty when there is no user yet. */
export function planEntitlement(user: User | null | undefined, locale: Locale): string {
  const state = planState(user)
  if (!state) return ""
  const entry = PLAN_COPY[locale][state]
  return state === "trial"
    ? (entry as TrialEntry).sub(user?.trial_days_left ?? 0)
    : (entry as StaticEntry).sub
}
