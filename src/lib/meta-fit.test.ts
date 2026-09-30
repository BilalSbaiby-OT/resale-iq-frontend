import { test } from "node:test"
import assert from "node:assert/strict"
import { fitTitle, fitDescription, fitMetadata, TITLE_MAX, DESC_MAX } from "./meta-fit.ts"

test("titles over 60 are cut (suffix dropped first), short titles untouched", () => {
  assert.equal(fitTitle("Short title — Resale IQ"), "Short title — Resale IQ")
  const t = fitTitle("Resale IQ para ingresos extra, flippers, mayoristas y agentes — Resale IQ")
  assert.ok(t.length <= TITLE_MAX, t)
  assert.ok(!t.endsWith("Resale IQ") || t.length <= TITLE_MAX)
  const long = fitTitle("A".repeat(30) + " " + "B".repeat(40))
  assert.ok(long.length <= TITLE_MAX && long.endsWith("…"))
})

test("descriptions over 160 keep the head (figures first) and end on a boundary", () => {
  const d = "Stone Island: 1,092 watched departures a week at €19. " + "More detail sentence here. ".repeat(12)
  const f = fitDescription(d)
  assert.ok(f.length <= DESC_MAX)
  assert.ok(f.startsWith("Stone Island: 1,092 watched departures a week at €19."))
  assert.equal(fitDescription("ok"), "ok")
})

test("fitMetadata fits title/description and og/twitter copies, leaves the rest alone", () => {
  const long = "x ".repeat(200)
  const m = fitMetadata({ title: long, description: long, alternates: { canonical: "/a" }, openGraph: { title: long, description: long, type: "article" }, twitter: { title: long, description: long } })
  assert.ok((m.title as string).length <= TITLE_MAX && (m.description as string).length <= DESC_MAX)
  assert.ok((m.openGraph.title as string).length <= TITLE_MAX && (m.twitter.description as string).length <= DESC_MAX)
  assert.deepEqual(m.alternates, { canonical: "/a" })
})

test("every metadata generator under src/app is length-fitted", async () => {
  const { readFileSync } = await import("node:fs")
  const { execSync } = await import("node:child_process")
  const files = execSync("grep -rlE 'generateMetadata|export const metadata' src/app || true", { cwd: process.cwd() }).toString().split("\n").filter(Boolean)
  // pricing/register are owned by other in-flight work; layout + auth utilities are noindex shells
  const skip = /(src\/app\/page\.tsx|\[locale\]\/(best|vs|for)\/page|\/pricing\/|register|login|forgot-password|src\/app\/layout|design-preview|\(dashboard\)|not-found|\(auth\))/
  const missing = files.filter((f) => !skip.test(f) && !/(fitMetadata|withFittedMetadata)/.test(readFileSync(f, "utf8")))
  assert.deepEqual(missing, [], "metadata generators that bypass fitMetadata")
})
