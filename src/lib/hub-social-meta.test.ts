/**
 * EX-OG-HUBS — /data and /flip social titles must match the document title.
 * Root layout pins homepage og:title / twitter:title; a child `title` alone
 * does not override those tags.
 */
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { test } from "node:test"
import assert from "node:assert/strict"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")

function read(rel: string): string {
  return readFileSync(join(root, rel), "utf8")
}

test("/data sets matching title, og:title, twitter:title and descriptions", () => {
  const src = read("app/data/page.tsx")
  assert.match(src, /const TITLE = "Weekly Brand Volumes on Vinted — What Sells Best in 2026"/)
  assert.match(
    src,
    /Weekly Vinted brand volumes: watched departures and average asking prices at departure across Spain, France, Germany, Italy and Portugal/,
  )
  assert.match(src, /title: TITLE/)
  assert.match(src, /description: DESCRIPTION/)
  assert.match(src, /openGraph: \{ title: TITLE, description: DESCRIPTION, type: "website" \}/)
  assert.match(
    src,
    /twitter: \{ card: "summary_large_image", title: TITLE, description: DESCRIPTION \}/,
  )
})

test("/flip sets twitter title/description to the same strings as title + og", () => {
  const src = read("app/flip/page.tsx")
  assert.match(src, /openGraph: \{ title, description, type: "website" \}/)
  assert.match(src, /twitter: \{ card: "summary_large_image", title, description \}/)
})

test("/tools hub pins og/twitter titles to the document title", () => {
  const src = read("app/tools/page.tsx")
  assert.match(src, /const TITLE = "Vinted Tools: Price Check & Buy-Below — Resale IQ"/)
  assert.match(src, /title: TITLE/)
  assert.match(src, /openGraph: \{ title: TITLE, description, type: "website" \}/)
  assert.match(src, /twitter: \{ card: "summary_large_image", title: TITLE, description \}/)
})

test("/tools child pages pin og/twitter titles to the suffixed document title", () => {
  const src = read("app/tools/[slug]/page.tsx")
  assert.match(src, /const title = `\$\{i\.title\} — Resale IQ`/)
  assert.match(src, /openGraph: \{ title, description: i\.description, type: "website" \}/)
  assert.match(src, /twitter: \{ card: "summary_large_image", title, description: i\.description \}/)
})

test("homepage layout still owns the generic social title — not rewritten", () => {
  const layout = read("app/layout.tsx")
  assert.match(layout, /const TITLE = "Resale IQ — Know what to pay before you buy"/)
  assert.match(layout, /openGraph: \{[\s\S]*title: TITLE/)
  assert.match(layout, /twitter: \{[\s\S]*title: TITLE/)
  const home = read("app/page.tsx")
  assert.doesNotMatch(home, /openGraph:/)
  assert.doesNotMatch(home, /twitter:/)
})
