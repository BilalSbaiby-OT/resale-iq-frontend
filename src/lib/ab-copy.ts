import type { Locale } from "./i18n.ts"

/** Variant-B button labels (variant A is trialCtaLabel). Both state the real terms: 7-day trial, €0 today. */
export const AB_CTA_LABEL_B: Record<Locale, string> = {
  en: "Unlock my max prices — 7 days free",
  fr: "Débloquer mes prix max — 7 jours gratuits",
  es: "Desbloquear mis precios máximos — 7 días gratis",
  de: "Meine Maximalpreise freischalten — 7 Tage gratis",
  it: "Sblocca i miei prezzi massimi — 7 giorni gratis",
  pt: "Desbloquear os meus preços máximos — 7 dias grátis",
}

export const AB_REG_CTA_B: Record<Locale, string> = {
  en: "Continue to secure payment — €0 today",
  fr: "Continuer vers le paiement sécurisé — 0 € aujourd'hui",
  es: "Continuar al pago seguro — 0 € hoy",
  de: "Weiter zur sicheren Zahlung — heute 0 €",
  it: "Continua al pagamento sicuro — 0 € oggi",
  pt: "Continuar para o pagamento seguro — 0 € hoje",
}
