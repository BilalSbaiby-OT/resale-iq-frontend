#!/usr/bin/env node
/**
 * Fails the build when a non-English locale block still contains English copy.
 *
 * WHY THIS EXISTS
 * On 2026-09-06 production /es/login rendered "Contraseña" and a bare "Email"
 * label side by side in the same form: the password label had been translated
 * and the email label next to it had not. That was the symptom people noticed.
 *
 * The cause was worse and lived in src/lib/methodology-copy.ts, where ALL FIVE
 * non-EN locales carried the literal English "30 days" INSIDE an otherwise
 * fluent sentence -- "Momentum necesita aproximadamente 30 days de historial",
 * "La dynamique nécessite environ 30 days d'historique", and the same in
 * de/it/pt. The same file also shipped "cada 30 minutes", "Las 48 hours",
 * "unser 30-minute-Ziel" and "nos 5 domains". A human translator does not make
 * that mistake five times in five languages. A generation script that treated
 * time-unit phrases as untranslatable tokens does, exactly once, and then it is
 * in every locale forever.
 *
 * So the defect class is not "somebody forgot Spanish". It is "an English
 * fragment survives inside a translated sentence, where proofreading a page
 * title will never find it". Only a machine reading every string in every
 * locale finds those. Hence this check.
 *
 * WHAT IT DOES
 * Imports the copy modules -- they are pure data with type-only imports, so
 * Node's type stripping loads them directly: no build step, no AST, and no
 * regex over source text that a reformat would silently defeat -- finds every
 * object keyed by locale, walks every string under the five non-EN keys, and
 * fails on English words that are wrong in that specific language.
 *
 * WHY THE BAN LIST IS PER-LOCALE, WHICH IS THE WHOLE DESIGN
 * A single shared list of "English words" does not work, and the first draft of
 * this check proved it by reporting 81 findings of which most were correct
 * copy. "Password" and "account" ARE the ordinary Italian words -- an Italian
 * login form says Password. "E-Mail" is correct German. "minutes" is spelled
 * identically in French. Ban those globally and the check cries wolf on
 * correct translations, and a check that cries wolf gets deleted.
 *
 * So each locale below lists only the words that are genuinely wrong in it,
 * with the native term that should appear instead. That list is the useful
 * artifact here: it is a record of which English words this product's five
 * languages actually borrow, and it should be edited when a translator
 * disagrees -- not padded to look thorough.
 *
 * WHAT IT DELIBERATELY DOES NOT DO
 * It does not attempt language detection. Statistical language ID on five-word
 * UI fragments produces false positives faster than anyone will fix them. This
 * is a closed word list, matched case-insensitively on word boundaries, and it
 * is meant to grow one word at a time as leaks are found in production -- which
 * is exactly how it started.
 *
 * ADDING AN EXCEPTION
 * Product nouns that are English on purpose (Deal Finder, Order Planner, Price
 * Compare, and the Free/Starter/Pro tier names, which src/lib/i18n.ts:273
 * documents as staying English in every locale) are in ALLOWED_PHRASES with a
 * reason. Add to it only when the English word is genuinely the name of a
 * thing. "30 days" was not the name of a thing.
 */
import { readdirSync, statSync } from "node:fs"
import { join, relative } from "node:path"
import { pathToFileURL } from "node:url"
import { register } from "node:module"

// Lets the imports below resolve extensionless "./sibling" and "@/lib/..." the
// way TypeScript does. Without it, any copy module with a value import of a
// sibling silently drops out of the scan. See scripts/lib/ts-resolve-hooks.mjs.
register("./lib/ts-resolve-hooks.mjs", import.meta.url)

const ROOT = new URL("..", import.meta.url).pathname
const SRC = join(ROOT, "src")

const LOCALES = ["en", "es", "fr", "de", "it", "pt"]
const NON_EN = LOCALES.filter(l => l !== "en")

/**
 * Wrong in all five target languages. Each has one obvious native equivalent,
 * so a hit here is a leak and not a judgement call.
 */
const BANNED_EVERYWHERE = {
  days: "días / jours / Tage / giorni / dias",
  day: "día / jour / Tag / giorno / dia",
  hours: "horas / heures / Stunden / ore / horas",
  hour: "hora / heure / Stunde / ora / hora",
  weeks: "semanas / semaines / Wochen / settimane / semanas",
  week: "semana / semaine / Woche / settimana / semana",
  months: "meses / mois / Monate / mesi / meses",
  month: "mes / mois / Monat / mese / mês",
  loading: "cargando / chargement / lädt / caricamento / a carregar",
  search: "buscar / recherche / Suche / cerca / pesquisa",
  searching: "buscando / recherche / sucht / ricerca / a pesquisar",
  free: "gratis / gratuit / kostenlos / gratuito / grátis",
}

/**
 * "sold" was tried here and removed. Every one of its 13 hits was correct copy:
 * the code identifier `sold_observed` inside the published str formula, and the
 * quoted marketplace field name in «Sold»/„Sold“/"Sold" timestamps, which the
 * methodology page quotes in English precisely because it is retracting the
 * claim that we observe sales. Thirteen permanent allowlist entries to keep one
 * word is the "cries wolf" failure this check is supposed to avoid, so the word
 * loses. If a real `sold` leak ever appears in prose, add it back with the
 * identifier and the quoted-label forms exempted.
 */

/**
 * Wrong in SOME languages only, because the others borrow the English word.
 * The comment on each is the reason it is absent from the locales not listed.
 */
const BANNED_BY_LOCALE = {
  // "minutes" is spelled identically in French, so fr is deliberately absent.
  minutes: { locales: ["es", "de", "it", "pt"], native: "minutos / Minuten / minuti / minutos" },
  minute: { locales: ["es", "de", "it", "pt"], native: "minuto / Minute / minuto / minuto" },
  // Italian genuinely uses "password" -- an Italian login form says Password.
  password: { locales: ["es", "fr", "de", "pt"], native: "contraseña / mot de passe / Passwort / palavra-passe" },
  // Italian genuinely uses "account". So do many Spanish products, but this
  // codebase has settled on "cuenta" and consistency beats preference.
  account: { locales: ["es", "fr", "de", "pt"], native: "cuenta / compte / Konto / conta" },
  // es has "correo electrónico" and uses it in the register form, so a bare
  // "Email" in the login form beside it is the inconsistency this check was
  // written for. de is included because bare "Email" is not German -- the
  // German word is "E-Mail", and unhyphenated "Email" means enamel. fr, it and
  // pt all take the loanword normally and are absent.
  email: { locales: ["es", "de"], native: "correo electrónico / E-Mail" },
  // "domains" leaked into pt where the same sentence already said "domínios".
  domains: { locales: ["es", "fr", "it", "pt"], native: "dominios / domaines / domini / domínios" },
}

/**
 * Phrases in which a banned word above is part of a proper noun. Matched
 * case-insensitively; a hit is forgiven only when it falls entirely inside one.
 */
const ALLOWED_PHRASES = [
  // Tier names. i18n.ts:273 documents these as English in every locale by
  // design -- the Spanish pricing page says "Free", "Starter" and "Pro".
  ["Free trial", "tier name"],
  ["Deal Finder", "product name"],
  ["Deal Scanner", "product name"],
  ["Order Planner", "product name"],
  ["Price Compare", "product name"],
  ["Price Alerts", "product name"],
  ["Live Finder", "product name"],
  ["Resale IQ", "company name"],
  ["sell-through", "term of art, kept English across locales"],
  ["buy-below", "term of art, kept English across locales"],
  ["days-to-sell", "term of art where a locale glosses it explicitly"],
  ["free tier", "English label in prose about the product's own naming"],
]

/** Exact strings that ARE the tier name and nothing else. */
const TIER_NAMES = new Set(["Free", "Starter", "Pro"])

function sourceFiles() {
  const out = []
  const walk = dir => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name)
      if (statSync(p).isDirectory()) walk(p)
      else if (/\.tsx?$/.test(p) && !/\.test\.tsx?$/.test(p)) out.push(p)
    }
  }
  walk(SRC)
  return out
}

/** True when an object is a locale table: every key a locale, most present. */
function isLocaleTable(v) {
  if (!v || typeof v !== "object" || Array.isArray(v)) return false
  const keys = Object.keys(v)
  if (!keys.length) return false
  return keys.every(k => LOCALES.includes(k)) && keys.length >= 4
}

/**
 * Every string reachable from a value, with a dotted path. Copy functions are
 * invoked with neutral placeholders -- most are `(n) => \`... ${n} ...\`` and
 * the words around the hole are exactly what needs reading. A function that
 * throws on every placeholder arity is skipped rather than guessed at.
 */
function strings(value, path, out, seen) {
  if (typeof value === "string") return void out.push([path, value])
  if (typeof value === "function") {
    for (const args of [["1"], [1], ["1", "1"], [1, 1], []]) {
      try {
        const r = value(...args)
        if (typeof r === "string") return void out.push([`${path}()`, r])
      } catch {
        // why: probing a copy function's shape, so a throw IS the answer — it
        // means this arity is wrong and the next one should be tried. There is
        // no failure to report until every shape has been tried, and a function
        // that survives all of them is simply not a string-returning one.
      }
    }
    return
  }
  if (!value || typeof value !== "object" || seen.has(value)) return
  seen.add(value)
  for (const [k, v] of Object.entries(value)) strings(v, path ? `${path}.${k}` : k, out, seen)
}

function insideAllowedPhrase(text, index, length) {
  const lower = text.toLowerCase()
  for (const [phrase] of ALLOWED_PHRASES) {
    const p = phrase.toLowerCase()
    for (let from = 0; ; ) {
      const at = lower.indexOf(p, from)
      if (at === -1) break
      if (at <= index && index + length <= at + p.length) return true
      from = at + 1
    }
  }
  return false
}

function bannedFor(locale) {
  const out = new Map()
  for (const [word, native] of Object.entries(BANNED_EVERYWHERE)) out.set(word, native)
  for (const [word, rule] of Object.entries(BANNED_BY_LOCALE)) {
    if (rule.locales.includes(locale)) out.set(word, rule.native)
  }
  return out
}

const BANNED = new Map(NON_EN.map(l => [l, bannedFor(l)]))

function leaksIn(text, locale) {
  if (TIER_NAMES.has(text.trim())) return []
  const found = []
  for (const [word, native] of BANNED.get(locale)) {
    const re = new RegExp(`(?<![\\p{L}\\d])${word}(?![\\p{L}\\d])`, "giu")
    for (const m of text.matchAll(re)) {
      if (!insideAllowedPhrase(text, m.index, m[0].length)) found.push(`${m[0]} → ${native}`)
    }
  }
  return [...new Set(found)]
}

/**
 * Files that MUST yield at least one locale table. Without this, the check has
 * a silent-pass mode that is worse than not having it: every import failure is
 * swallowed as "not a copy module", so if src/lib/i18n.ts ever stopped loading
 * — a syntax error, a new runtime import at the top, a rename — this script
 * would scan nothing, print OK, and go green forever while the product served
 * English. A guard whose failure mode is "passes" is not a guard.
 */
const MUST_SCAN = [
  "src/lib/i18n.ts",
  "src/lib/methodology-copy.ts",
  "src/lib/verdict-copy.ts",
  "src/lib/nav-copy.ts",
  "src/lib/trial-copy.ts",
  "src/lib/app-copy.ts",
  "src/lib/verdict-words.ts",
  "src/lib/structured-data-copy.ts",
]

const failures = []
const scanned = new Set()

for (const file of sourceFiles()) {
  let mod
  try {
    mod = await import(pathToFileURL(file).href)
  } catch {
    // why: this walks every .ts/.tsx file in src/, and most of them are React
    // components that cannot be imported outside Next's runtime. Failing to
    // import is the normal, expected outcome for those and means "not a copy
    // module", not "something is broken". A copy module is pure data with
    // type-only imports and always loads; if one ever stopped loading, the
    // locale tables inside it would vanish from the scan — which is why
    // src/lib/i18n.ts is asserted for explicitly after this loop.
    continue
  }

  const tables = []
  const collect = (v, path, seen) => {
    if (!v || typeof v !== "object" || seen.has(v)) return
    seen.add(v)
    if (isLocaleTable(v)) return void tables.push([path, v])
    for (const [k, child] of Object.entries(v)) collect(child, path ? `${path}.${k}` : k, seen)
  }
  for (const [name, value] of Object.entries(mod)) collect(value, name, new Set())
  if (tables.length) scanned.add(relative(ROOT, file))

  for (const [tablePath, table] of tables) {
    for (const locale of NON_EN) {
      if (!(locale in table)) continue
      const out = []
      strings(table[locale], "", out, new Set())
      for (const [keyPath, text] of out) {
        const leaks = leaksIn(text, locale)
        if (leaks.length) {
          failures.push({
            file: relative(ROOT, file),
            key: `${tablePath}.${locale}${keyPath ? `.${keyPath}` : ""}`,
            leaks,
            text: text.length > 150 ? `${text.slice(0, 147)}…` : text,
          })
        }
      }
    }
  }
}

const unscanned = MUST_SCAN.filter(f => !scanned.has(f))
if (unscanned.length) {
  console.error("\ncheck:locale-english FAILED — a known copy module produced no locale table:\n")
  for (const f of unscanned) console.error(`  ${f}`)
  console.error("\nIt either failed to import (check it has only type-only imports and no")
  console.error("Next-runtime dependency) or its locale table was renamed or removed. Until")
  console.error("this is fixed the check cannot see that file's copy, so it fails loudly")
  console.error("instead of passing on a smaller scan than it claims.\n")
  process.exit(1)
}

if (failures.length) {
  console.error(`\ncheck:locale-english FAILED — ${failures.length} English leak(s) in non-EN copy\n`)
  for (const f of failures) {
    console.error(`  ${f.file}`)
    console.error(`    key:     ${f.key}`)
    console.error(`    english: ${f.leaks.join("; ")}`)
    console.error(`    string:  ${f.text}\n`)
  }
  console.error("Translate the flagged word. Only if it is genuinely a product name, add it")
  console.error("to ALLOWED_PHRASES in scripts/check-locale-english.mjs — and if a locale")
  console.error("legitimately borrows the English word, narrow BANNED_BY_LOCALE instead.\n")
  process.exit(1)
}

console.log(`check:locale-english OK — no English leaks in es/fr/de/it/pt copy (${scanned.size} copy modules scanned)`)
