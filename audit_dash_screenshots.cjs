/**
 * ResaleIQ Dashboard Visual Audit — screenshot all 14 gated routes
 * Uses JWT injected directly from /tmp/riq-inbox.json
 */
const { chromium } = require('/Users/bilalsbaiby/work/resale-iq/node_modules/playwright');
const fs = require('fs');

const BASE = 'http://localhost:3111';
const CREDS_FILE = '/tmp/riq-inbox.json';
const SCREENSHOT_DIR = '/tmp/audit_screenshots';

if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const ROUTES = [
  { path: '/dashboard', waitFor: 'domcontentloaded', extra: 3500 },
  { path: '/search', waitFor: 'domcontentloaded', extra: 2500 },
  { path: '/verdict', waitFor: 'domcontentloaded', extra: 2500 },
  { path: '/deals', waitFor: 'domcontentloaded', extra: 2500 },
  { path: '/market', waitFor: 'domcontentloaded', extra: 2500 },
  { path: '/trends', waitFor: 'domcontentloaded', extra: 2500 },
  { path: '/brands', waitFor: 'domcontentloaded', extra: 2500 },
  { path: '/compare', waitFor: 'domcontentloaded', extra: 2000 },
  { path: '/calculator', waitFor: 'domcontentloaded', extra: 2000 },
  { path: '/order-planner', waitFor: 'domcontentloaded', extra: 2500 },
  { path: '/portfolio', waitFor: 'domcontentloaded', extra: 2000 },
  { path: '/watchlist', waitFor: 'domcontentloaded', extra: 2000 },
  { path: '/authenticity', waitFor: 'domcontentloaded', extra: 2000 },
  { path: '/account', waitFor: 'domcontentloaded', extra: 2000 },
];

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

async function measurePage(page, routePath) {
  const [tapTargets, tableIssues, verdictPills, isPaywalled, pageText, mainFontSizes] = await Promise.all([
    // Tap target violations
    page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('button, a, [role="button"], input[type="submit"], input[type="checkbox"], input[type="radio"]'));
      return els.filter(el => {
        const r = el.getBoundingClientRect();
        return (r.width > 0 || r.height > 0) && (r.width < 44 || r.height < 44);
      }).map(el => ({
        tag: el.tagName, text: (el.textContent||'').trim().slice(0,50),
        w: Math.round(el.getBoundingClientRect().width), h: Math.round(el.getBoundingClientRect().height)
      })).slice(0,15);
    }),
    // Table header overflow
    page.evaluate(() => {
      return Array.from(document.querySelectorAll('th')).filter(th => {
        const r = th.getBoundingClientRect();
        return th.scrollWidth > r.width + 2;
      }).map(th => ({ text: (th.textContent||'').trim(), scrollW: th.scrollWidth, renderW: Math.round(th.getBoundingClientRect().width) }));
    }),
    // Verdict pills
    page.evaluate(() => {
      const pills = Array.from(document.querySelectorAll('[class*="riq-buy"],[class*="riq-watch"],[class*="riq-skip"],[class*="riq-unknown"]'));
      return pills.map(el => ({ text: (el.textContent||'').trim(), isEmpty: !(el.textContent||'').trim() }));
    }),
    // Paywall check
    page.evaluate(() => {
      const body = document.body.textContent || '';
      return body.includes('pays for itself') || body.includes('Item checks need a plan') || body.includes('This is a Pro feature') || body.includes('Upgrade for the full dashboard');
    }),
    // Full page text (truncated)
    page.evaluate(() => (document.body.textContent || '').slice(0, 500)),
    // Find tiny font sizes
    page.evaluate(() => {
      const result = [];
      const all = Array.from(document.querySelectorAll('*'));
      const seen = new Set();
      for (const el of all) {
        if (el.children.length > 0) continue;
        const text = (el.textContent || '').trim();
        if (!text || text.length < 2) continue;
        const st = window.getComputedStyle(el);
        const sz = parseFloat(st.fontSize);
        if (sz > 0 && sz < 12 && !seen.has(sz + text.slice(0,20))) {
          seen.add(sz + text.slice(0,20));
          const r = el.getBoundingClientRect();
          if (r.width > 0) {
            result.push({ text: text.slice(0,40), fontSize: sz, tag: el.tagName });
          }
        }
      }
      return result.slice(0, 20);
    }),
  ]);

  return { tapTargets, tableIssues, verdictPills, isPaywalled, pageText, mainFontSizes };
}

async function run() {
  const creds = JSON.parse(fs.readFileSync(CREDS_FILE, 'utf8'));
  const jwt = creds.di_jwt;
  if (!jwt) { console.error('No JWT in creds file'); process.exit(1); }
  console.log('Using JWT:', jwt.slice(0,30)+'...');

  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
  });

  const allResults = {};

  for (const vp of VIEWPORTS) {
    console.log(`\n=== Viewport: ${vp.name} (${vp.width}x${vp.height}) ===`);
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      userAgent: vp.name === 'mobile'
        ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
        : undefined,
    });

    for (const route of ROUTES) {
      const slug = route.path.replace(/\//g, '_').replace(/^_/, '') || 'root';
      const outFile = `${SCREENSHOT_DIR}/audit_dash_${slug}_${vp.name}.png`;
      console.log(`  ${vp.name} ${route.path}...`);

      const page = await ctx.newPage();
      await page.addInitScript((token) => {
        localStorage.setItem('di_jwt', token);
      }, jwt);

      try {
        await page.goto(`${BASE}${route.path}`, { waitUntil: route.waitFor, timeout: 25000 });
        await page.waitForTimeout(route.extra);
      } catch (e) {
        console.warn(`    WARN: ${e.message.slice(0,80)}`);
      }

      try {
        await page.screenshot({ path: outFile, fullPage: false });
        console.log(`    Saved: ${outFile}`);
      } catch (e) {
        console.error(`    Screenshot FAILED: ${e.message}`);
      }

      if (vp.name === 'desktop') {
        const measurements = await measurePage(page, route.path);
        allResults[route.path] = {
          ...measurements,
          screenshot_desktop: outFile,
        };
      } else {
        if (allResults[route.path]) allResults[route.path].screenshot_mobile = outFile;
      }

      await page.close();
    }

    await ctx.close();
  }

  await browser.close();
  fs.writeFileSync('/tmp/audit_dash_results.json', JSON.stringify(allResults, null, 2));
  console.log('\nAll done. Results: /tmp/audit_dash_results.json');
}

run().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
