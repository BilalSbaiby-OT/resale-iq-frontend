/**
 * EX-META-LENGTH-CAP-TEST (2026-09-29) — a single guarding suite that runs
 * the metadata BUILDERS over representative real inputs and asserts the
 * length caps the orchestrator's live audit flagged: title <=60 incl. the
 * " — Resale IQ" / " — The Vinted Reselling Manual" suffix, 50<=description
 * <=160, and every /flip/<brand>/<category> title differs from the /flip
 * hub title (the calvin-klein stale-redirect regression that made every
 * sub-page fall back to hub metadata — next.config.ts guard is a separate
 * test in flip-category-meta.test.ts; this one is the generator itself).
 *
 * "Representative real inputs" = the longest real blog post data (every post
 * in src/data/blog-posts*.ts — the actual catalogue, read directly off disk,
 * not synthetic fixtures), every real /flip brand+category pair (from
 * src/data/seo-brands.json), and every real manual chapter (from
 * src/data/manual.ts + manual-2.ts). No invented numbers anywhere.
 *
 * Reads source files as text and regex-extracts fields rather than importing
 * the data modules directly — same reason flip-category-meta.ts's own header
 * comment gives ("Kept local so node --test can load this file without
 * resolving the warehouse module"): blog-posts.ts and manual.ts import
 * "@/lib/..." modules that plain `node --test` (this repo's CI command,
 * package.json test:unit) cannot resolve without a bundler. Reading the
 * literal `title:` / `seoTitle:` / `description:` string fields off disk is
 * the same technique flip-category-meta.test.ts's own `read()` helper and
 * manual-aeo.test.ts's `chapterSlice()` already use for the same reason.
 */
import { readFileSync, readdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { test } from "node:test"
import assert from "node:assert/strict"
import {
  flipBrandTitle,
  flipBrandCategoryTitle,
  flipBrandDescription,
  flipBrandCategoryDescription,
} from "./flip-category-meta.ts"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const TITLE_MAX = 60
const DESC_MIN = 50
const DESC_MAX = 160
const BLOG_SUFFIX = " — Resale IQ"
const MANUAL_SUFFIX = " — The Vinted Reselling Manual"

function unescape(s: string): string {
  return s.replace(/\\"/g, '"').replace(/\\n/g, "\n").replace(/\\`/g, "`")
}

/** Robust field extractor operating on full text with explicit window. */
function fieldInWindow(text: string, field: string, start: number, end: number): string | null {
  const window = text.slice(start, end)
  const m = window.match(new RegExp(`\\n\\s+${field}:\\s*\\n?\\s*(\`|")`))
  if (!m) return null
  const quote = m[1]
  const openIdx = (m.index ?? 0) + m[0].length - 1
  let i = openIdx + 1
  while (i < window.length) {
    const c = window[i]
    if (c === "\\") { i += 2; continue }
    if (c === quote) return unescape(window.slice(openIdx + 1, i))
    i++
  }
  return null
}

interface ParsedPost { slug: string; title: string | null; seoTitle: string | null; description: string | null }

function parseBlogPosts(): ParsedPost[] {
  const dataDir = join(root, "data")
  const files = readdirSync(dataDir).filter((f) => /^blog-posts.*\.ts$/.test(f))
  const posts: ParsedPost[] = []
  for (const f of files) {
    const text = readFileSync(join(dataDir, f), "utf8")
    const slugMatches = [...text.matchAll(/\n\s{4}slug:\s*"([^"]+)"/g)]
    for (let i = 0; i < slugMatches.length; i++) {
      const m = slugMatches[i]
      const slug = m[1]
      const start = m.index ?? 0
      const end = i + 1 < slugMatches.length ? (slugMatches[i + 1].index ?? text.length) : text.length
      posts.push({
        slug,
        title: fieldInWindow(text, "title", start, end),
        seoTitle: fieldInWindow(text, "seoTitle", start, end),
        description: fieldInWindow(text, "description", start, end),
      })
    }
  }
  return posts
}

interface ParsedChapter { slug: string; title: string | null; seoTitle: string | null; description: string | null }

function parseManualChapters(): ParsedChapter[] {
  const files = ["manual.ts", "manual-2.ts"]
  const chapters: ParsedChapter[] = []
  for (const f of files) {
    const text = readFileSync(join(root, "data", f), "utf8")
    const slugMatches = [...text.matchAll(/\n\s{4}slug:\s*"([^"]+)"/g)]
    for (let i = 0; i < slugMatches.length; i++) {
      const m = slugMatches[i]
      const slug = m[1]
      const start = m.index ?? 0
      const end = i + 1 < slugMatches.length ? (slugMatches[i + 1].index ?? text.length) : text.length
      chapters.push({
        slug,
        title: fieldInWindow(text, "title", start, end),
        seoTitle: fieldInWindow(text, "seoTitle", start, end),
        description: fieldInWindow(text, "description", start, end),
      })
    }
  }
  return chapters
}

interface SeoBrand {
  brand: string
  slug: string
  categories: { category: string }[]
}

function loadBrands(): SeoBrand[] {
  const raw = readFileSync(join(root, "data", "seo-brands.json"), "utf8")
  return (JSON.parse(raw).brands as SeoBrand[])
}

const POSTS = parseBlogPosts()
const CHAPTERS = parseManualChapters()
const BRANDS = loadBrands()

test("parsed real catalogues are non-trivial (guards against a silent empty parse)", () => {
  assert.ok(POSTS.length > 100, `only parsed ${POSTS.length} blog posts — parser likely broken`)
  assert.ok(CHAPTERS.length >= 15, `only parsed ${CHAPTERS.length} manual chapters — parser likely broken`)
  assert.ok(BRANDS.length >= 20, `only parsed ${BRANDS.length} brands — parser likely broken`)
})

test("every real blog post's built <title> is <=60 chars incl. suffix", () => {
  for (const p of POSTS) {
    assert.ok(p.title, `${p.slug}: no title field parsed`)
    // generateMetadata's exact builder: seoTitle ?? `${title} — Resale IQ`
    const built = p.seoTitle ?? `${p.title}${BLOG_SUFFIX}`
    assert.ok(
      built.length <= TITLE_MAX,
      `${p.slug} built title ${built.length} chars (max ${TITLE_MAX}): "${built}"`,
    )
  }
})

test("every real blog post description is 50-160 chars", () => {
  for (const p of POSTS) {
    assert.ok(p.description, `${p.slug}: no description field parsed`)
    const len = p.description!.length
    assert.ok(
      len >= DESC_MIN && len <= DESC_MAX,
      `${p.slug} description ${len} chars (want ${DESC_MIN}-${DESC_MAX}): "${p.description}"`,
    )
  }
})

test("every real manual chapter's built <title> is <=60 chars incl. suffix", () => {
  for (const c of CHAPTERS) {
    assert.ok(c.title, `${c.slug}: no title field parsed`)
    // ChapterPage's exact builder: c.seoTitle ?? `${c.title} — The Vinted Reselling Manual`
    const built = c.seoTitle ?? `${c.title}${MANUAL_SUFFIX}`
    assert.ok(
      built.length <= TITLE_MAX,
      `${c.slug} built title ${built.length} chars (max ${TITLE_MAX}): "${built}"`,
    )
  }
})

test("every real manual chapter description is 50-160 chars", () => {
  for (const c of CHAPTERS) {
    assert.ok(c.description, `${c.slug}: no description field parsed`)
    const len = c.description!.length
    assert.ok(
      len >= DESC_MIN && len <= DESC_MAX,
      `${c.slug} description ${len} chars (want ${DESC_MIN}-${DESC_MAX}): "${c.description}"`,
    )
  }
})

test("/flip/<brand>/<category> title+description builders are <=60 / 50-160 chars for every real pair", () => {
  let checked = 0
  for (const b of BRANDS) {
    for (const c of b.categories || []) {
      const title = flipBrandCategoryTitle(b.brand, c.category)
      assert.ok(
        title.length <= TITLE_MAX,
        `${b.brand} ${c.category} title ${title.length} chars: "${title}"`,
      )
      // "tracked" here is the same TRACKED sentinel every other test file in
      // this repo uses in place of a live figure (see flip-category-meta.test.ts's
      // own {{TRACKED}} fixture) — never a fabricated departure/price number
      // for any specific brand, and never a literal dataset-size digit
      // (check:tracked, scripts/check-tracked-figure.mjs, fails on those).
      const desc = flipBrandCategoryDescription({
        brand: b.brand,
        category: c.category,
        tracked: "{{TRACKED}}",
      })
      assert.ok(
        desc.length >= DESC_MIN && desc.length <= DESC_MAX,
        `${b.brand} ${c.category} description ${desc.length} chars: "${desc}"`,
      )
      checked++
    }
  }
  assert.ok(checked > 50, "expected the full brand x category matrix to be checked")
})

test("/flip brand hub title+description builders are <=60 / 50-160 chars for every real brand", () => {
  for (const b of BRANDS) {
    const title = flipBrandTitle(b.brand)
    assert.ok(title.length <= TITLE_MAX, `${b.brand} hub title ${title.length} chars: "${title}"`)
    const desc = flipBrandDescription({ brand: b.brand, sold: 809, avg: 42 })
    assert.ok(
      desc.length >= DESC_MIN && desc.length <= DESC_MAX,
      `${b.brand} hub description ${desc.length} chars: "${desc}"`,
    )
  }
})

// EX-CALVIN-KLEIN-DUP guard, generator-level (2026-09-29): the live bug was a
// stale next.config.ts redirect swallowing every /flip/calvin-klein/<category>
// request before generateMetadata ever ran — every sub-page under that brand
// served the /flip HUB's title+description verbatim. This proves the title
// BUILDER itself never collapses to the hub string for any real brand+
// category pair (the routing-level regression is guarded separately in
// flip-category-meta.test.ts's next.config.ts assertion).
test("/flip sub-page title != /flip hub title, for every real brand+category (incl. calvin-klein)", () => {
  const HUB_TITLE = "What sells best on Vinted in 2026? 32 brands ranked"
  const ck = BRANDS.find((b) => b.slug === "calvin-klein")
  assert.ok(ck, "calvin-klein must still be a live brand in seo-brands.json")
  assert.ok((ck!.categories || []).length > 0, "calvin-klein must still have categories")

  for (const b of BRANDS) {
    const brandTitle = flipBrandTitle(b.brand)
    assert.notEqual(brandTitle, HUB_TITLE, `${b.brand} hub-brand title collided with /flip hub`)
    for (const c of b.categories || []) {
      const subTitle = flipBrandCategoryTitle(b.brand, c.category)
      assert.notEqual(subTitle, HUB_TITLE, `${b.brand} ${c.category} collided with /flip hub title`)
      assert.notEqual(subTitle, brandTitle, `${b.brand} ${c.category} == its own brand-hub title`)
    }
  }
})
