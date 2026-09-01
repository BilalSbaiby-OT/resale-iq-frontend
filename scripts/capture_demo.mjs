/**
 * Capture the live product doing its job, as video frames.
 *
 * node scripts/capture_demo.mjs "Adidas Samba"
 *
 * Written 2026-09-01 after the founder's verdict on the first video assets:
 * "the videos you making aint marketing shit bruv." He was right — generated
 * B-roll of a clothing rail has no hook, no text and no product in frame.
 *
 * The thing that sells this product is watching it work: a real listing goes
 * in, a number comes out. So the frames are the LIVE SITE, headless, at
 * 540x960 (9:16), captured through the typing and the reveal rather than as
 * three static screenshots — the motion is the content.
 *
 * Every number that ends up on screen is whatever production actually
 * returned. Nothing here composes a figure.
 */
import { chromium } from "@playwright/test"
import { mkdirSync } from "node:fs"

const QUERY = process.argv[2] || "Adidas Samba"
// Output dir is an ARGUMENT, not a constant. Four near-identical copies of this
// file (capture_demo2..5.mjs) once existed solely because this one line was
// hardcoded -- 82 lines duplicated four times to vary one string, while QUERY
// right above it was already a parameter. Copies drift; this does not.
const OUT = process.argv[3] || "docs/marketing/assets/frames"
const W = 540, H = 960

mkdirSync(OUT, { recursive: true })

const pad = (n) => String(n).padStart(3, "0")
let frame = 0

// This Playwright version wants a headless-shell build that is not installed,
// while several full Chromium builds sit in the cache. Pin the newest cached
// one rather than telling the caller to run `npx playwright install` — that
// installer refuses this machine's OS version, which extension-eng hit today
// too. Discovered rather than hardcoded, so it survives the next upgrade.
import { existsSync, readdirSync } from "node:fs"
const CACHE = `${process.env.HOME}/Library/Caches/ms-playwright`
const build = readdirSync(CACHE)
  .filter((d) => /^chromium-\d+$/.test(d))
  .map((d) => ({ d, n: Number(d.split("-")[1]) }))
  .sort((a, b) => b.n - a.n)
  .map((x) => `${CACHE}/${x.d}/chrome-mac/Chromium.app/Contents/MacOS/Chromium`)
  .find(existsSync)
if (!build) throw new Error(`no cached Chromium under ${CACHE}`)

const browser = await chromium.launch({ executablePath: build })
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 })

async function shoot(times = 1) {
  for (let i = 0; i < times; i++) {
    await page.screenshot({ path: `${OUT}/f${pad(frame++)}.png` })
  }
}

await page.goto("https://resaleiq.dev", { waitUntil: "networkidle" })
// Land on the checker rather than the masthead — the product is the subject.
await page.evaluate(() => window.scrollBy(0, 210))
await page.waitForTimeout(500)
await shoot(8)                                   // hold on the empty state

const input = page.locator('input[placeholder*="Adidas"], input[type="text"]').first()
await input.click()

// Type a character at a time and capture each one. This is the part a static
// screenshot cannot give you: the viewer watches a real query being entered.
for (const ch of QUERY) {
  await input.type(ch, { delay: 0 })
  await page.waitForTimeout(45)
  await shoot(1)
}
await shoot(4)                                   // beat before the click

await page.getByRole("button", { name: /check it free/i }).click()

// Capture continuously while the answer arrives, so the reveal is real motion
// and not a cut. ~9s at 12fps covers a cold backend call.
for (let i = 0; i < 110; i++) {
  await page.waitForTimeout(80)
  await shoot(1)
}

await browser.close()
console.log(`${frame} frames -> ${OUT}`)
