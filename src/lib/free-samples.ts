/**
 * THE free samples: the only items anyone can check with no account.
 * One list, one source (founder decision 2026-10-02). Every chip, hint,
 * placeholder, FAQ sentence built in code and llms.txt line reads this file.
 *
 * Everything else is Starter: a 7-day free trial, card required, EUR 0 today.
 * There is no free tier and there is no "first check free": copy must never
 * promise either (see src/lib/free-samples.test.ts, which fails the build on
 * the old phrasings).
 *
 * Plain .ts with no imports so node:test can load it and so i18n.ts (which
 * every page imports) can use it without a cycle.
 *
 * WHY THESE THREE: all three 200 anonymously from api/routes.py
 * _PUBLIC_SAMPLE_QUERIES with a priced buy-below, measured live 2026-09-29
 * and re-read 2026-10-02. The backend allow-list is wider (Ralph Lauren
 * Poloshirt, Puma Speedcat, New Balance FuelCell, RL Quarter Zip also
 * bypass the wall) but copy may only name models that resolve to a priced
 * model-level verdict. A chip must stay a SUBSET of that frozenset or it 402s.
 *
 * Never name as samples: New Balance 530 (402 anonymously since 2026-09-29),
 * New Balance 550, Levi's 501. New Balance FuelCell 200s but only as a
 * brand-average fallback with buy_below null.
 * RE-CHECK THIS LIST whenever the demand pipeline or the paywall gate changes.
 */
export const FREE_SAMPLES = ["Adidas Samba", "Nike Air Force 1", "Fred Perry Polo"] as const

export type FreeSample = (typeof FREE_SAMPLES)[number]

/**
 * The sample with the steadiest measured number (Fred Perry Polo: WATCH,
 * MEDIUM confidence, non-provisional on 2026-10-02; Samba and AF1 were still
 * provisional). It is the fallback a brand-new account is seeded with when
 * the live buy-list names none of the three. Typed as FreeSample, so it can
 * never drift out of the list above.
 */
export const FREE_SAMPLE_DEMO: FreeSample = "Fred Perry Polo"

/** Same list as chip descriptors: label shown, query sent. */
export const FREE_SAMPLE_CHIPS: ReadonlyArray<{ label: string; q: string }> = FREE_SAMPLES.map((q) => ({
  label: q,
  q,
}))

/** True when `q` is exactly one of the free samples (case/whitespace-insensitive). */
export function isFreeSample(q: string | null | undefined): boolean {
  if (!q) return false
  const n = q.trim().replace(/\s+/g, " ").toLowerCase()
  return FREE_SAMPLES.some((s) => s.toLowerCase() === n)
}

const LIST_LOCALE: Record<string, string> = {
  en: "en-GB",
  es: "es",
  fr: "fr",
  de: "de",
  it: "it",
  pt: "pt",
}

/**
 * "Adidas Samba, Nike Air Force 1 and Fred Perry Polo" in the reader's
 * language ("... y ...", "... et ...", "... und ...", "... e ...").
 */
export function freeSampleList(locale = "en"): string {
  try {
    return new Intl.ListFormat(LIST_LOCALE[locale] ?? "en-GB", { style: "long", type: "conjunction" }).format(
      FREE_SAMPLES,
    )
  } catch {
    // Intl.ListFormat missing (very old engine): English join, never a crash.
    return `${FREE_SAMPLES.slice(0, -1).join(", ")} and ${FREE_SAMPLES[FREE_SAMPLES.length - 1]}`
  }
}
