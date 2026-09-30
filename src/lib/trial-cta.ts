import { copy, type Locale } from "./i18n.ts"
import { CTA_VARIANT } from "./cta-variant.ts"

export { CTA_VARIANT }
export const TRIAL_DAYS = 7
export type BillingInterval = "month" | "year"

type Trial = (typeof copy)["en"]["trial"]
function trialCopy(locale: Locale): Trial {
  return (copy[locale]?.trial ?? copy.en.trial) as Trial
}

/** Button label. The single source for every trial CTA (swap variants via CTA_VARIANT). */
export function trialCtaLabel(locale: Locale, variant: string = CTA_VARIANT): string {
  const cta = trialCopy(locale).cta as Record<string, string>
  return cta[variant] ?? cta.A
}

/** "€19/month" / "19 €/mois" — localized. */
export function trialPrice(locale: Locale, priceEur: number, interval: BillingInterval = "month"): string {
  const t = trialCopy(locale)
  return (interval === "year" ? t.priceYear : t.priceMonth).replace("{n}", String(priceEur))
}

/** First charge = today + 7 days, localized ("7 October"). UTC so SSR and client agree. */
export function firstChargeDate(locale: Locale, now: Date = new Date()): string {
  const d = new Date(now.getTime() + TRIAL_DAYS * 86_400_000)
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : locale, { day: "numeric", month: "long", timeZone: "UTC" }).format(d)
}

/** Disclosure under the button. No date (SSR / before hydration) -> "after your 7-day trial". */
export function trialLine(
  locale: Locale, priceEur: number, interval: BillingInterval = "month", date?: string | null,
): string {
  const t = trialCopy(locale)
  const price = trialPrice(locale, priceEur, interval)
  return (date ? t.line.replace("{date}", date) : t.lineNoDate).replace("{price}", price)
}

export function trialCardLine(locale: Locale): string {
  return trialCopy(locale).card
}
