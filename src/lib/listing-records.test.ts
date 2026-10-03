/**
 * LISTING COUNTS — one headline, one noun, two named counts (2026-10-02).
 *
 * The site publishes two real, different backend counts:
 *   listing records  COUNT(*)                  -> "14M+ listing records" (THE headline)
 *   distinct items   COUNT(DISTINCT external_id) -> exact, on /data, /methodology and
 *                                                  the /pricing pulse only
 * They used to share the noun "listings", so one page said 14.33M in its JSON-LD and
 * 6.18M in its visible copy. These tests pin the three things that keep them apart:
 * the format of the headline, the noun after it in all six locales, and the fact
 * that every surface reads the one helper instead of formatting its own figure.
 */
import { readFileSync, readdirSync, statSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { test } from "node:test"
import assert from "node:assert/strict"
import { copy, type Locale } from "./i18n.ts"
import { floorTo10k, floorToMillion } from "./floor-to-10k.ts"
import { LISTING_RECORDS_NOUN } from "./listing-records-noun.ts"
import { STRUCTURED_DATA_COPY } from "./structured-data-copy.ts"
import { methodologyCopy } from "./methodology-copy.ts"
import { dataChrome } from "../data/seo-data-copy.ts"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const read = (rel: string) => readFileSync(join(root, rel), "utf8")
const LOCALES: Locale[] = ["en", "es", "fr", "de", "it", "pt"]
/** Typographic and straight apostrophes are the same noun. */
const norm = (s: string) => s.replace(/[’']/g, "'")

test("floorToMillion floors to the whole million and never rounds up", () => {
  assert.equal(floorToMillion(14_334_127), "14M+")
  assert.equal(floorToMillion(14_999_999), "14M+")
  assert.equal(floorToMillion(15_000_000), "15M+")
  assert.equal(floorToMillion(1_000_000), "1M+")
  // 0.33M of headroom today: a fall below 14.0M is what would make "14M+" false.
  assert.equal(floorToMillion(14_000_000), "14M+")
  assert.equal(floorToMillion(13_999_999), "13M+")
})

test("below one million there is no whole-million claim: falls back to the 10k floor, never '0M+'", () => {
  assert.equal(floorToMillion(966_236), `${floorTo10k(966_236)}+`)
  assert.match(floorToMillion(966_236), /^\d{3},\d{3}\+$/)
  assert.doesNotMatch(floorToMillion(500), /^0M/)
})

test("the headline is locale-neutral: no thousands separator to get wrong in de/fr/es/it/pt", () => {
  assert.doesNotMatch(floorToMillion(14_334_127), /[.,\s]/)
})

test("every locale has a listing-records noun and the six are distinct", () => {
  for (const l of LOCALES) assert.ok(LISTING_RECORDS_NOUN[l].length > 4, l)
  assert.equal(new Set(LOCALES.map(l => LISTING_RECORDS_NOUN[l])).size, 6)
})

test("Organization JSON-LD description puts the headline directly before the noun, in all six locales", () => {
  for (const l of LOCALES) {
    const d = norm(STRUCTURED_DATA_COPY[l].description("14M+"))
    assert.ok(d.includes(`14M+ ${norm(LISTING_RECORDS_NOUN[l])}`), `${l}: ${d.slice(0, 160)}`)
  }
})

test("no records figure: the JSON-LD description drops the figure clause, it never prints a dash or a guess", () => {
  for (const l of LOCALES) {
    const d = STRUCTURED_DATA_COPY[l].description("—")
    assert.doesNotMatch(d, /—\s+\S*\s*(listing|registros|enregistrements|Inserat|registrazioni|registos)/i, l)
    assert.ok(norm(d).includes(norm(LISTING_RECORDS_NOUN[l])), l)
  }
})

test("/pricing trust line, paywall body and market pulse name the noun in all six locales", () => {
  for (const l of LOCALES) {
    const noun = norm(LISTING_RECORDS_NOUN[l])
    const c = copy[l]
    assert.ok(norm(c.pricingSection.starterTrust).includes(`{{TRACKED}} ${noun}`), `${l} starterTrust`)
    assert.ok(norm(c.checker.paywallBody).includes(`{{TRACKED}} ${noun}`), `${l} paywallBody`)
    assert.ok(norm(c.checker.paywallBodyForItem("X", "14M+")).includes(`14M+ ${noun}`), `${l} paywallBodyForItem`)
    // The pulse leads with the records headline; no brand count and no distinct-item count.
    const sub = norm(c.marketPulse.sub("14M+"))
    assert.ok(sub.includes(`14M+ ${noun}`), `${l} marketPulse.sub records`)
    assert.doesNotMatch(sub, /\b61\b|distinct|\d{1,3}[,.]\d{3}/, `${l} marketPulse.sub prints no brand/distinct count`)
    // No records figure: the sentence loses the number entirely.
    assert.doesNotMatch(norm(c.marketPulse.sub(null)), /\d/, `${l} marketPulse.sub(null) has no digits`)
  }
})

test("methodology 'Overstate the dataset' bullet defines BOTH counts in all six locales", () => {
  for (const l of LOCALES) {
    const m = methodologyCopy[l]
    assert.ok(norm(m.g_overstate_b).startsWith(norm(LISTING_RECORDS_NOUN[l])), `${l} defines the records noun`)
    assert.match(m.g_overstate_c, /COUNT\(DISTINCT external_id\)/, `${l} defines the distinct count`)
    assert.match(m.g_overstate_c, /30M\+/, `${l} keeps the 30M+ retraction`)
    // The distinct-count label in the callout is "items", not "listings".
    assert.doesNotMatch(norm(m.g_tracked_suffix), /listings|anuncios|annonces|Angebote|annunci|anúncios/, `${l} g_tracked_suffix`)
  }
  const page = read("app/methodology/page.tsx")
  assert.match(page, /\$\{t\.g_overstate_a\} \$\{tracked\} \$\{t\.g_overstate_b\} \$\{fmtCount\(market\.listingsTracked\)\} \$\{t\.g_overstate_c\}/)
})

test("/data shows the headline as listing records and the exact distinct count under its own label", () => {
  for (const l of LOCALES) {
    const t = dataChrome[l]
    assert.ok(norm(t.dtListings).toLowerCase() === norm(LISTING_RECORDS_NOUN[l]).toLowerCase(), `${l} dtListings`)
    assert.equal(t.listingsCol, t.dtDistinct, `${l}: column and definition-list label for the distinct count agree`)
    assert.notEqual(norm(t.dtDistinct), norm(t.dtListings), l)
    assert.match(t.citeNote, /COUNT\(DISTINCT external_id\)/, `${l} citeNote defines both counts`)
  }
  const page = read("app/data/page.tsx")
  assert.match(page, /\{tracked\} \{LISTING_RECORDS_NOUN\[locale\]\}\./, "lede names the noun")
  assert.match(page, /fmtCount\(market\.listingsTracked\)/, "exact distinct count is still published here")
})

// ---------------------------------------------------------------------------
// ONE helper. Every surface reads it; none formats its own figure.
// ---------------------------------------------------------------------------

test("server and client both derive the headline from total_listing_records via floorToMillion", () => {
  const stats = read("lib/stats.ts")
  assert.match(stats, /export async function listingRecordsHeadline\(\)/)
  assert.match(stats, /floorToMillion\(n\)/)
  // The sentinel-era name now delegates: ~45 call sites, ONE number.
  assert.match(stats, /export async function listingsTrackedLabel\(\): Promise<string> \{\s*return listingRecordsHeadline\(\)/)
  assert.doesNotMatch(stats, /listingRecordsLabel/, "the 10k-floor records label is gone")

  const hook = read("lib/use-tracked-label.ts")
  assert.match(hook, /total_listing_records/)
  assert.match(hook, /floorToMillion\(n\)/)
  assert.doesNotMatch(hook, /listings_tracked/, "the client hook must not read the distinct count")
  assert.doesNotMatch(hook, /floorTo10k/)
})

test("no surface falls back from records to the distinct count under the records label", () => {
  const layout = read("app/layout.tsx")
  assert.match(layout, /listingRecordsHeadline\(\)/)
  assert.doesNotMatch(layout, /listingsTrackedLabel/)
  assert.doesNotMatch(layout, /listingRecordsLabel/)
  const og = read("app/opengraph-image.tsx")
  assert.match(og, /listingRecordsHeadline\(\)/)
  assert.doesNotMatch(og, /listings across 5 EU markets/, "the social card says listing records, like og:description")
})

test("the live-market pulse leads with the headline and never prints the distinct-item count", () => {
  const pulse = read("components/landing/live-market-pulse.tsx")
  assert.match(pulse, /floorToMillion\(listingRecords\)/)
  assert.doesNotMatch(pulse, /listings\.toLocaleString\(|market\.listingsTracked/)
})

test("/partners reads the live headline, no frozen 13.4M and no 'confirmed sold transactions' card", () => {
  const src = read("app/partners/page.tsx")
  assert.match(src, /listingRecordsHeadline\(\)/)
  assert.doesNotMatch(src, /value: "13\.4M"/)
  assert.doesNotMatch(src, /13\.4 million/)
  assert.doesNotMatch(src, /label: "confirmed sold/)
})

test("the teaser has no literal fallback figure: unknown is not 13.4M", () => {
  const src = read("components/landing/ssr-buy-list-teaser.tsx")
  assert.doesNotMatch(src, /\?\? "13\.4M"/)
  assert.match(src, /LISTING_RECORDS_NOUN\[locale\]/)
})

// ---------------------------------------------------------------------------
// The noun after the token. {tracked} / ${TRACKED} / {{TRACKED}} is the headline;
// writing plain "listings" (or items, articles, annonces ...) after it is how the
// two counts were conflated in ~250 places.
// ---------------------------------------------------------------------------

const TOKEN = /\{\{TRACKED\}\}|\$\{TRACKED\}|\$\{tracked\}|\{tracked\}/g
const NOUNS = LOCALES.map(l => norm(LISTING_RECORDS_NOUN[l]))

function copySources(): string[] {
  const out: string[] = []
  const dataDir = join(root, "data")
  for (const f of readdirSync(dataDir)) {
    const p = join(dataDir, f)
    if (statSync(p).isFile() && f.endsWith(".ts")) out.push(`data/${f}`)
  }
  out.push("lib/i18n.ts", "lib/support-copy.ts", "lib/flip-category-meta.ts", "lib/tools-query-meta.ts")
  return out
}

test("every headline token in the copy modules is followed by the listing-records noun", () => {
  const offenders: string[] = []
  let checked = 0
  for (const rel of copySources()) {
    read(rel).split("\n").forEach((line, i) => {
      const code = line.trim()
      if (code.startsWith("//") || code.startsWith("*") || code.startsWith("/*")) return
      for (const m of line.matchAll(TOKEN)) {
        const after = norm(line.slice((m.index ?? 0) + m[0].length))
        // Dictionary plumbing, not prose: `tracked={tracked}`, `{tracked}{t.ledeCite}`, a bare token value.
        if (!after.startsWith(" ")) continue
        checked++
        if (!NOUNS.some(n => after.startsWith(` ${n}`))) {
          offenders.push(`${rel}:${i + 1}  ${m[0]}${after.slice(0, 40)}`)
        }
      }
    })
  }
  assert.ok(checked > 200, `expected to check the ~250 token sites, checked ${checked}`)
  assert.deepEqual(offenders, [], `token not followed by "listing records" in its locale:\n${offenders.join("\n")}`)
})
