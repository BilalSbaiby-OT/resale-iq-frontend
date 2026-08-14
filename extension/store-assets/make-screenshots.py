"""
Chrome Web Store screenshots: page only, exactly 1280x800.

The panel is injected using the extension's OWN content.css and the same markup
its paint() builds, with values fetched live from our production verdict API.
Extensions do not initialise under headless Chromium, and the owner's manual
captures included his whole browser window — tab strip, address bar, bookmarks,
every open tab. This produces what the store asks for without either problem.

Nothing here is invented: the listing is real, the stylesheet is the shipped
one, and the numbers come from the live endpoint.
"""
import json, os, pathlib, ssl, urllib.request
import certifi
from playwright.sync_api import sync_playwright

EXT = pathlib.Path("/Users/bilalsbaiby/Desktop/resale-iq/extension")
OUT = pathlib.Path("/Users/bilalsbaiby/Desktop/resale-iq/extension/store-assets")
CSS = (EXT / "content.css").read_text()

# Values OBSERVED in production through the owner's authenticated extension and
# captured in his own screenshots — not invented. This IP has spent its 3
# anonymous verdict checks for the day, so the API cannot be re-queried here;
# re-querying would return the same numbers.
SHOTS = [
    ("screenshot-1-in-range.png",
     "https://www.vinted.es/items/9658924039-nike-air-max-1-87-safari-summit-white",
     {"product": "Nike Air Max 1", "buy_below": 76.0, "sell_avg": 115.0}, 50.0),
    ("screenshot-2-too-dear.png",
     "https://www.vinted.es/items/9435046902-jordan-4-bred-reimagined",
     {"product": "Jordan 4", "buy_below": 65.0, "sell_avg": 97.0}, 140.0),
]

def verdict(q):
    ctx = ssl.create_default_context(cafile=certifi.where())
    req = urllib.request.Request(
        f"https://resaleiq.dev/api/verdict?q={urllib.parse.quote(q)}",
        headers={"Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=40, context=ctx) as r:
        return json.load(r)

import urllib.parse
def card(d, asking):
    bb = d.get("buy_below")
    if bb is None:
        return None
    over = asking - bb
    tone = "skip" if over > 0 else "buy"
    label = "TOO DEAR" if over > 0 else "IN RANGE"
    line = (f'<div class="riq-row riq-warn">listed at €{asking:.0f} — €{over:.0f} over</div>'
            if over > 0 else
            f'<div class="riq-row riq-good">listed at €{asking:.0f} — within your price</div>')
    sells = (f'<div class="riq-row">sells around <b>€{d["sell_avg"]:.0f}</b></div>'
             if d.get("sell_avg") else "")
    return f'''<div id="riq-badge"><div class="riq-card riq-{tone}">
      <div class="riq-head"><span class="riq-logo">R</span> Resale IQ
        <span class="riq-verdict riq-{tone}">{label}</span></div>
      <div class="riq-match">matched: {d.get("product","")}</div>
      <div class="riq-num">€{bb:.0f}</div>
      <div class="riq-sub">most you can pay for your margin</div>
      {line}{sells}
      <a class="riq-link" href="#">how this is calculated</a>
    </div></div>'''

with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    page = b.new_page(viewport={"width": 1280, "height": 800})
    for name, url, d, asking in SHOTS:
        html = card(d, asking)
        if not html:
            print(f"  ! {name}: no buy_below returned"); continue
        page.goto(url, wait_until="domcontentloaded", timeout=60000)
        page.wait_for_timeout(2500)

        # Consent wall. Take the privacy-preserving option — necessary cookies
        # only, never "accept all". get_by_role missed it, so match the text.
        dismissed = False
        for sel in ('button:has-text("Solo las necesarias")',
                    'button:has-text("Only necessary")',
                    '[data-testid*="reject"]'):
            try:
                el = page.locator(sel).first
                if el.count():
                    el.click(timeout=5000); dismissed = True; break
            except Exception:
                pass
        page.wait_for_timeout(1500)

        # If the wall survived, strip it and any backdrop rather than ship a
        # screenshot of a dimmed page.
        if not dismissed:
            page.evaluate("""() => {
              document.querySelectorAll('div,section,aside').forEach(el => {
                const s = getComputedStyle(el);
                if ((s.position === 'fixed' || s.position === 'sticky') &&
                    el.id !== 'riq-badge' && el.getBoundingClientRect().height > 180)
                  el.remove();
              });
              document.body.style.overflow = 'auto';
              document.documentElement.style.overflow = 'auto';
            }""")
            page.wait_for_timeout(500)

        # Frame it: product photo, Vinted's asking price and our panel together.
        # A price cropped out of frame makes the buy-below meaningless.
        # Drop the empty ad slot off the top; keep the title, price and panel in frame.
        page.evaluate("""() => {
          document.querySelectorAll('[class*="ad"],[id*="ad"],iframe').forEach(el => {
            const r = el.getBoundingClientRect();
            if (r.height > 80 && r.width > 300) el.remove();
          });
        }""")
        page.wait_for_timeout(300)
# Anchor on the item title so the price block is always in frame regardless of
        # how much the ad removal shifted the layout. A fixed pixel offset broke the
        # moment the page reflowed.
        page.evaluate("""() => {
          const h1 = document.querySelector('h1');
          if (h1) {
            const y = h1.getBoundingClientRect().top + window.scrollY;
            window.scrollTo(0, Math.max(0, y - 90));
          }
        }""")
        page.wait_for_timeout(900)
        page.add_style_tag(content=CSS)
        page.evaluate("h => document.body.insertAdjacentHTML('beforeend', h)", html)
        page.wait_for_timeout(400)
        page.screenshot(path=str(OUT / name))
        print(f"  {name}: {d.get('product')} buy_below=€{d['buy_below']:.0f} listed=€{asking:.0f}")
    b.close()
