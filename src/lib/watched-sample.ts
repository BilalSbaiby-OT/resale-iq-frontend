/** Client-safe. Do not import market-numbers here — that module pulls node:fs
 *  for the last-good snapshot and will blow a Turbopack client build.
 *  ./i18n is a plain dictionary (no node:fs), safe to import alongside. */
import { copy, type Locale } from "./i18n.ts"
import {
  NUMBER_LOCALE,
  departureDisplay,
  departureHiddenNote,
  departureLabel,
  departurePairPrintable,
} from "./departure-display.ts"

function fmt(n: number, locale: Locale): string {
  return n.toLocaleString(NUMBER_LOCALE[locale])
}

/** Honest sample line for a BUY/WATCH/SKIP that already has watched counts.
 *  SKIP without this reads as “this model does not sell”. The counts are
 *  our watched listings, not the whole market.
 *
 *  The "N left the shelf vs M still listed" PAIR is only printed when it is
 *  honest (departure-display.ts departurePairPrintable: n >= 30 and at most
 *  500 listed per departure). A handful of departures set against a quarter
 *  of a million active listings read as a supply glut; they are really the
 *  detector re-reading a slice of a shelf. Below that the departure count is
 *  printed alone, through the display floor (hidden under 5, "fewer than 10"
 *  from 5 to 9), and the "supply glut" suffix is dropped with the pair.
 *
 *  `locale` defaults to "en" so the one call site with no locale in scope
 *  (the dashboard's /verdict page — English-only today, see
 *  lib/locale-routes.ts: only the homepage is translated) keeps its exact
 *  prior behaviour rather than needing a locale threaded through a page that
 *  is not part of this pass. free-checker.tsx (the marketing conversion
 *  path, on every /es /fr /de /it /pt homepage) passes its real locale. */
export function watchedSampleNote(
  sold: number | null | undefined,
  listed: number | null | undefined,
  verdict?: string,
  locale: Locale = "en",
): string | null {
  if (sold == null || listed == null) return null
  if (!Number.isFinite(sold) || !Number.isFinite(listed)) return null
  if (!departurePairPrintable(sold, listed)) {
    if (departureDisplay(sold, locale).kind === "hidden") return departureHiddenNote(locale)
    return `${departureLabel(sold, "7d", locale, { sample: true })}.`
  }
  const t = copy[locale].watchedSample
  const head = t.head(fmt(sold, locale), fmt(listed, locale))
  if (verdict === "SKIP") {
    return `${head}${t.skipSuffix}`
  }
  return `${head}.`
}
