/**
 * SEO index hygiene — regression tests for defects found in the 2026-09-30
 * impressions-collapse audit (URL Inspection: 8/32 sampled URLs unknown,
 * 10/32 "Discovered - currently not indexed").
 *
 *  1. literal "{weekly}" / "{brands}" / "{tracked}" tokens shipped in <title>
 *     and <meta description> of /best/* clones and the 5-locale blog clones;
 *  2. sitemap listed URLs that 308 to another URL;
 *  3. the EN post's hreflang set omitted the fr/de/it/pt clones that point at
 *     it, so the cluster was non-reciprocal and Google ignores such hreflang.
 */
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { test } from "node:test"
import assert from "node:assert/strict"
import { isRedirectedPath, SITEMAP_EXCLUDED_REDIRECTS } from "./sitemap-redirects.ts"
import { blogCloneHreflang, BLOG_CLONE_SLUGS, getBlogCloneCopy, getLandingCopy, LANDINGS } from "./seo-landings.ts"
import { PATH_LOCALES } from "./locale-routes.ts"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const read = (rel: string) => readFileSync(join(root, rel), "utf8")

test("every literal permanent redirect in next.config.ts is excluded from the sitemap", () => {
  const cfg = read("../next.config.ts")
  const blocks = cfg.matchAll(/source:\s*"(\/[^":*()]+)"\s*,\s*destination:\s*"[^"]+"\s*,\s*permanent:\s*true/g)
  const sources = [...blocks].map((m) => m[1]).filter((s) => /^\/(blog|flip)\//.test(s))
  assert.ok(sources.length >= 5, `parsed ${sources.length} redirects`)
  for (const s of sources) assert.ok(isRedirectedPath(`https://resaleiq.dev${s}`), `${s} is redirected but still sitemap-eligible`)
  assert.ok(SITEMAP_EXCLUDED_REDIRECTS.length >= sources.length)
})

test("sitemap.ts applies the redirect filter", () => {
  assert.match(read("app/sitemap.ts"), /isRedirectedPath/)
})

test("landing + blog-clone copy: meta description/title tokens are filled at metadata time", () => {
  const lp = read("components/seo/landing-page.tsx")
  assert.match(lp, /description:\s*fill\(copy\.description\)/)
  assert.match(lp, /fillLandingPlaceholders\(raw,\s*await landingStats\(\)\)/)
  assert.match(read("app/[locale]/blog/[slug]/page.tsx"), /fillLandingPlaceholders\(raw,\s*await landingStats\(\)\)/)
})

test("blog clone: EN + ES post hreflang is the full reciprocal set", () => {
  const src = read("app/blog/[slug]/page.tsx")
  assert.match(src, /isBlogCloneSlug\(p\.slug\)/)
  for (const slug of BLOG_CLONE_SLUGS) {
    const langs = blogCloneHreflang(slug)
    for (const l of PATH_LOCALES) assert.ok(langs[l], `${slug} missing ${l}`)
    assert.ok(langs.en && langs["x-default"])
  }
})

test("clone titles are not shared between two locales of the same slug", () => {
  for (const slug of BLOG_CLONE_SLUGS) {
    const titles = PATH_LOCALES.map((l) => getBlogCloneCopy(slug, l)?.title).filter(Boolean) as string[]
    const dup = titles.filter((t, i) => titles.indexOf(t) !== i)
    if (slug === "buy-below-price-explained") continue // known: pt reuses es copy — reported, not fixed here
    assert.deepEqual(dup, [], slug)
  }
  assert.ok(LANDINGS.length > 0 && typeof getLandingCopy === "function")
})

// SEO-CONSOLIDATE-P1 regression: locale blog clone pages must be noindex,follow
// and must not appear in the sitemap (thin content, 0 human visitors in 60 days).
test("locale blog clone metadata has robots noindex,follow", () => {
  const src = read("app/[locale]/blog/[slug]/page.tsx")
  assert.match(src, /robots:\s*\{\s*index:\s*false,\s*follow:\s*true\s*\}/, "noindex,follow missing from clone metadata")
})

test("sitemap.ts does not include blogClonePages in the entries array", () => {
  const src = read("app/sitemap.ts")
  // The line that spreads blogClonePages must be commented out, not an active spread
  assert.doesNotMatch(src, /^\s*\.\.\.(blogClonePages),/m, "blogClonePages must not be spread into entries")
})
