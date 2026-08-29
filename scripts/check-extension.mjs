#!/usr/bin/env node
/**
 * Contracts for the Chrome extension zip. Fails if the listing copy and the
 * code would disagree in review.
 */
import { readFileSync } from "node:fs"
import { join } from "node:path"
import assert from "node:assert/strict"

const ROOT = join(new URL("..", import.meta.url).pathname, "extension")
const read = (f) => readFileSync(join(ROOT, f), "utf8")

const manifest = JSON.parse(read("manifest.json"))
assert.equal(manifest.manifest_version, 3)
assert.equal(manifest.version, "1.3.0")
assert.equal(manifest.name.includes("Vinted"), false, "trademark in NAME")
assert.equal(manifest.homepage_url, "https://resaleiq.dev")
assert.deepEqual(manifest.permissions, ["storage"])
assert.deepEqual(manifest.host_permissions, ["https://resaleiq.dev/*"])
assert.ok(manifest.action?.default_popup)

const bg = read("background.js")
assert.match(bg, /chrome\.storage\.local/)
assert.match(bg, /migrateSyncToken/)
assert.match(bg, /status === 403/)
assert.match(bg, /status === 401/)
assert.doesNotMatch(bg, /verdict === "UNKNOWN"[\s\S]*ok: false/)

const content = read("content.js")
assert.match(content, /x <= 0/)
assert.match(content, /lastPath/)
assert.match(content, /location\.href !== lastHref/)
assert.match(content, /riq_token/)
assert.match(content, /I18N = \{[\s\S]*de:[\s\S]*it:[\s\S]*pt:/)
assert.match(content, /check-email/)
assert.doesNotMatch(content, /IN RANGE/)
assert.doesNotMatch(content, /TOO DEAR/)
assert.match(content, /BUY/)

const listing = read("STORE-LISTING.md")
assert.match(listing, /not affiliated with, endorsed by, or connected to Vinted/)
assert.match(listing, /support@resaleiq\.dev/)
assert.match(listing, /chrome\.storage\.local/)
assert.match(listing, /Website content/)
assert.match(listing, /Authentication information/)

for (const f of ["link.js", "options.js"]) {
  const src = read(f)
  assert.match(src, /chrome\.storage\.local/)
  assert.doesNotMatch(src, /chrome\.storage\.sync/)
}

console.log("✓ extension 1.3.0 listing and privacy contracts hold")
