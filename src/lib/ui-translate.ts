import type { Locale } from "./i18n"
import { UI_STRINGS } from "./ui-strings.ts"

/**
 * App-chrome translation by English source text.
 *
 * `t("Add Portfolio Item")` returns the string for the request locale, or the
 * English source if the locale is "en". UI_STRINGS maps each English string to
 * a fixed tuple [es, fr, de, it, pt] — the tuple type makes `tsc` refuse an
 * entry that skips a locale. `{0}`, `{1}` are positional placeholders.
 * src/lib/ui-strings.test.ts fails the build if any t("...") literal in the
 * app has no entry, so a string can never silently fall back to English.
 */
const IDX: Record<Exclude<Locale, "en">, number> = { es: 0, fr: 1, de: 2, it: 3, pt: 4 }

export type TFn = ((en: string, args?: ReadonlyArray<string | number | boolean | null | undefined>) => string) & { locale: Locale }

export function translate(locale: Locale, en: string, args?: ReadonlyArray<string | number | boolean | null | undefined>): string {
  let s = en
  if (locale !== "en") {
    const row = UI_STRINGS[en]
    if (row) s = row[IDX[locale]] || en
  }
  return args ? s.replace(/\{(\d+)\}/g, (_m, i) => String(args[Number(i)] ?? "")) : s
}

export const makeT = (locale: Locale): TFn => Object.assign((en: string, args?: ReadonlyArray<string | number | boolean | null | undefined>) => translate(locale, en, args), { locale })

/** Intl-backed number/currency/date formatting in the visitor's locale. */
const BCP: Record<Locale, string> = { en: "en-GB", es: "es-ES", fr: "fr-FR", de: "de-DE", it: "it-IT", pt: "pt-PT" }
export const fmtNum = (locale: Locale, n: number, opts?: Intl.NumberFormatOptions) => new Intl.NumberFormat(BCP[locale], opts).format(n)
export const fmtEur = (locale: Locale, n: number, digits = 0) =>
  new Intl.NumberFormat(BCP[locale], { style: "currency", currency: "EUR", minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n)
export const fmtDate = (locale: Locale, d: Date | string | number, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) =>
  new Intl.DateTimeFormat(BCP[locale], opts).format(new Date(d))

/** Marks a module-level English literal for extraction; render it with `t(x)`. Identity at runtime. */
export const N_ = (s: string) => s
