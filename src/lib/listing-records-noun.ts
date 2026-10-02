/**
 * What the headline dataset figure COUNTS, per locale.
 *
 * "14M+" is a count of LISTING RECORDS — COUNT(*) over the listings table, one
 * row per listing per Vinted domain, so an item listed on several domains
 * counts once per domain. It is not a count of distinct items (that figure is
 * COUNT(DISTINCT external_id), published exactly on /data, /methodology and the
 * /pricing market pulse, and labelled "distinct items" there). Writing the
 * plain noun "listings" after the headline let the two statistics be read as
 * one, so every sentence that carries the headline names it with this noun.
 *
 * The strings are the ones structured-data-copy.ts already shipped in the
 * Organization JSON-LD; the data modules and i18n copy spell the same noun out
 * literally after the {tracked} / {{TRACKED}} token, and
 * src/lib/listing-records.test.ts fails if any locale drifts from this table.
 *
 * Pure — safe to import from client components.
 */
import type { Locale } from "./i18n"

export const LISTING_RECORDS_NOUN: Record<Locale, string> = {
  en: "listing records",
  es: "registros de anuncios",
  fr: "enregistrements d'annonces",
  de: "Inseratseinträge",
  it: "registrazioni di inserzioni",
  pt: "registos de anúncios",
}
