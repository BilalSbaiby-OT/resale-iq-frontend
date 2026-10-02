/**
 * Locale parity guard for the app-chrome dictionary (src/lib/ui-strings.ts).
 *
 * Every `tx("…")` / `N_("…")` literal under src/ must have an [es, fr, de, it, pt]
 * row, every translation must keep the same {0}/{1} placeholders as the English
 * source, and no non-English row may be empty. Also asserts the main per-locale
 * dictionaries (copy / appCopy / navCopy / verdictCopy / methodologyCopy) have
 * every key the EN dictionary has, in all six locales.
 *
 * Run: npm run test:unit
 */
import test from "node:test"
import assert from "node:assert/strict"
import { createRequire } from "node:module"
import { UI_STRINGS } from "./ui-strings.ts"
import { translate, makeT, fmtNum, fmtDate } from "./ui-translate.ts"
import { copy } from "./i18n.ts"
import { appCopy } from "./app-copy.ts"
import { navCopy } from "./nav-copy.ts"
import { verdictCopy } from "./verdict-copy.ts"
import { methodologyCopy } from "./methodology-copy.ts"

const require = createRequire(import.meta.url)
const used: string[] = require("../../scripts/extract-ui-strings.cjs")
const LOCALES = ["es", "fr", "de", "it", "pt"] as const
const ph = (s: string) => (s.match(/\{\d+\}/g) ?? []).sort().join(",")

test("every tx()/N_() literal has a translation row", () => {
  const missing = used.filter((k) => !(k in UI_STRINGS))
  assert.deepEqual(missing, [], `untranslated UI strings (add to src/lib/ui-strings.ts):\n${missing.join("\n")}`)
})

test("no dead rows in UI_STRINGS", () => {
  const dead = Object.keys(UI_STRINGS).filter((k) => !used.includes(k))
  assert.deepEqual(dead, [], `rows with no tx()/N_() caller:\n${dead.join("\n")}`)
})

test("translations keep placeholders and are non-empty", () => {
  for (const [en, row] of Object.entries(UI_STRINGS)) {
    assert.equal(row.length, 5, en)
    row.forEach((t, i) => {
      assert.ok(t.trim().length > 0, `empty ${LOCALES[i]} for ${en}`)
      assert.equal(ph(t), ph(en), `${LOCALES[i]} placeholder mismatch for "${en}"`)
    })
  }
})

test("translate(): en passthrough, locale lookup, positional args, unknown key falls back to English", () => {
  assert.equal(translate("en", "Retry"), "Retry")
  assert.equal(translate("fr", "Retry"), "Réessayer")
  assert.equal(translate("es", "{0} listings found in {1}{2}", [3, "ES", ""]), "3 anuncios encontrados en ES")
  assert.equal(translate("de", "not in dictionary"), "not in dictionary")
  assert.equal(makeT("it").locale, "it")
})

test("fmtNum / fmtDate follow the locale", () => {
  assert.equal(fmtNum("de", 22607), "22.607")
  assert.equal(fmtNum("en", 22607), "22,607")
  assert.match(fmtDate("fr", "2026-10-02T12:00:00Z", { day: "numeric", month: "short" }), /oct/)
})

function flat(o: unknown, p = "", out = new Set<string>()): Set<string> {
  if (o && typeof o === "object" && !Array.isArray(o)) for (const [k, v] of Object.entries(o)) flat(v, `${p}.${k}`, out)
  else out.add(p)
  return out
}
for (const [name, dict] of Object.entries({ copy, appCopy, navCopy, verdictCopy, methodologyCopy }) as [string, Record<string, unknown>][]) {
  test(`${name}: every locale has every EN key`, () => {
    const en = flat(dict.en)
    for (const l of LOCALES) {
      assert.ok(dict[l], `${name} has no ${l} block`)
      const have = flat(dict[l])
      const missing = [...en].filter((k) => !have.has(k))
      assert.deepEqual(missing, [], `${name}.${l} missing keys: ${missing.slice(0, 10).join(", ")}`)
    }
  })
}
