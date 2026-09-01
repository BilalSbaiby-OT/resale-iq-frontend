/**
 * Render one Template B "Data Drop" caption card to a transparent PNG.
 *
 * Text only -- no image model asked for a number, per PLATFORM-CREATIVE.md's
 * Template B rule ("the backdrop is abstract B-roll ... the actual figures
 * are rendered as real HTML/CSS text, not asked of the image model").
 *
 * node scripts/make_data_drop_card.mjs --config path/to/card.json --out out.png [--w 1080 --h 1920]
 *
 * card.json: { "kicker": "...", "headline": "...", "sub": "...", "cta": "resaleiq.dev/xx" }
 */
import { chromium } from "@playwright/test"
import { existsSync, readdirSync, readFileSync, mkdirSync } from "node:fs"
import { dirname } from "node:path"

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, arr) => {
    if (a.startsWith("--")) acc.push([a.slice(2), arr[i + 1]])
    return acc
  }, [])
)
const W = Number(args.w || 1080)
const H = Number(args.h || 1920)
const cfg = JSON.parse(readFileSync(args.config, "utf8"))
mkdirSync(dirname(args.out), { recursive: true })

const CACHE = `${process.env.HOME}/Library/Caches/ms-playwright`
const build = readdirSync(CACHE)
  .filter((d) => /^chromium-\d+$/.test(d))
  .map((d) => ({ d, n: Number(d.split("-")[1]) }))
  .sort((a, b) => b.n - a.n)
  .map((x) => `${CACHE}/${x.d}/chrome-mac/Chromium.app/Contents/MacOS/Chromium`)
  .find(existsSync)
if (!build) throw new Error(`no cached Chromium under ${CACHE}`)

// Safe-zone discipline from PLATFORM-CREATIVE.md: keep text inside
// x:90-990, y:200-1550 on a 1080x1920 frame (TikTok bottom rail + right column).
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${W}px;height:${H}px;background:transparent}
  body{color:#eef1f7;font-family:-apple-system,"Segoe UI",Inter,sans-serif;
       display:flex;flex-direction:column;justify-content:center;align-items:center;
       text-align:center;padding:0 90px;height:${H}px}
  .wrap{max-width:900px;padding-top:120px;padding-bottom:280px}
  .kicker{font-size:34px;font-weight:700;letter-spacing:2px;text-transform:uppercase;
          color:#8fa3c4;margin-bottom:28px}
  .headline{font-size:78px;font-weight:800;line-height:1.12;letter-spacing:-2px;
            text-shadow:0 4px 24px rgba(0,0,0,.55)}
  .g{color:#22c55e}
  .sub{font-size:36px;color:#c3d0e6;margin-top:44px;line-height:1.45;
       text-shadow:0 2px 12px rgba(0,0,0,.6)}
  .cta{font-size:46px;font-weight:800;color:#22c55e;margin-top:64px;letter-spacing:-0.5px}
  .src{font-size:26px;color:#6b7d9c;margin-top:22px}
</style></head><body>
  <div class="wrap">
    <div class="kicker">${cfg.kicker || ""}</div>
    <div class="headline">${cfg.headline}</div>
    ${cfg.sub ? `<div class="sub">${cfg.sub}</div>` : ""}
    ${cfg.cta ? `<div class="cta">${cfg.cta}</div>` : ""}
    ${cfg.src ? `<div class="src">${cfg.src}</div>` : ""}
  </div>
</body></html>`

const browser = await chromium.launch({ executablePath: build })
const page = await browser.newPage({ viewport: { width: W, height: H } })
await page.setContent(html)
await page.screenshot({ path: args.out, omitBackground: true })
await browser.close()
console.log(args.out)
