/**
 * Render the video's text cards to PNG.
 *
 * This ffmpeg build has no `drawtext` (compiled without libfreetype), so text
 * is rendered in a browser instead — which is better anyway: the cards use the
 * product's own tokens and typography rather than whatever font ffmpeg found.
 *
 * node scripts/make_cards.mjs
 */
import { chromium } from "@playwright/test"
import { existsSync, readdirSync, mkdirSync } from "node:fs"

const OUT = "docs/marketing/assets/cards"
mkdirSync(OUT, { recursive: true })

const CACHE = `${process.env.HOME}/Library/Caches/ms-playwright`
const build = readdirSync(CACHE)
  .filter((d) => /^chromium-\d+$/.test(d))
  .map((d) => ({ d, n: Number(d.split("-")[1]) }))
  .sort((a, b) => b.n - a.n)
  .map((x) => `${CACHE}/${x.d}/chrome-mac/Chromium.app/Contents/MacOS/Chromium`)
  .find(existsSync)

const base = `
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:1080px;height:1920px;background:#0a0d14;color:#eef1f7;
       font-family:-apple-system,"Segoe UI",Inter,sans-serif;
       display:flex;flex-direction:column;justify-content:center;
       align-items:center;text-align:center;padding:0 90px}
  .k{font-size:96px;font-weight:800;line-height:1.05;letter-spacing:-3px}
  .g{color:#22c55e}
  .s{font-size:40px;color:#8fa3c4;margin-top:38px;line-height:1.4}
  .u{font-size:58px;font-weight:800;color:#22c55e;margin-top:54px;letter-spacing:-1px}
`

// The hook is DISCOVERY, not a stat: it is checkable without citing a number,
// it sets up the reveal instead of spending it, and it keeps the per-model
// buy-below out of marketing copy (DATA_CONTRACT rule 4 — per-model price is
// the paid product; it may appear INSIDE the demo, never as the message).
const cards = {
  hook: `<style>${base}</style>
    <div class="k">Vinted won't tell<br>you this price.<br><span class="g">This will.</span></div>
    <div class="s">Live check, no account needed</div>`,
  end: `<style>${base}</style>
    <div class="k">Check any item<br><span class="g">before you buy.</span></div>
    <div class="u">resaleiq.dev</div>
    <div class="s">ES · FR · DE · IT · PT</div>`,
}

const browser = await chromium.launch({ executablePath: build })
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } })
for (const [name, html] of Object.entries(cards)) {
  await page.setContent(html)
  await page.screenshot({ path: `${OUT}/${name}.png` })
  console.log(`${OUT}/${name}.png`)
}
await browser.close()
