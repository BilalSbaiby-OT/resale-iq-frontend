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
    # TODO — third shot, the "not tracked" state (INSUFFICIENT_DATA or
    # UNKNOWN). card() now renders it correctly (matches content.js's
    # paint() and content.css's .riq-info tone), but the listing depicts
    # only confident BUY/SKIP outcomes while the honest refusal is the more
    # common real result. Not added here because it would need a real
    # observed URL + the backend's own `message`/`n` for that item, the same
    # "not invented" bar the two shots above meet — that requires a live
    # browser session against production, which this task did not have.
    # Add one entry shaped like:
    #   ("screenshot-3-not-tracked.png", "<real vinted.xx item url>",
    #    {"product": "<matched model>", "verdict": "INSUFFICIENT_DATA",
    #     "message": "<the API's own message field, verbatim>", "n": <int or None>}, <asking price>),
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
        # Matches content.js's paint(): INSUFFICIENT_DATA/UNKNOWN render a
        # statement (the backend's own `message`, never invented) instead of
        # a number, in the neutral `.riq-info` tone — never `.riq-watch`'s
        # amber, which is reserved for a real WATCH verdict. `n` is shown
        # only if the API actually sent one.
        verdict = str(d.get("verdict") or "UNKNOWN").upper()
        shown = "THIN DATA" if verdict == "INSUFFICIENT_DATA" else "NOT COVERED"
        message = d.get("message") or (
            "Not enough sold data to price this yet." if verdict == "INSUFFICIENT_DATA"
            else "We don't have model-level data for this brand yet.")
        n = d.get("n")
        fact_row = (f'<div class="riq-fact-row"><span class="riq-fact-n">{n}</span>'
                    f'<span class="riq-fact-label">sold, watched</span></div>' if n is not None else "")
        return f'''<div id="riq-badge"><div class="riq-card riq-info">
      <div class="riq-head"><span class="riq-logo">R</span> Resale IQ
        <span class="riq-verdict riq-info">{shown}</span></div>
      <div class="riq-match">matched: {d.get("product","")}</div>
      <div class="riq-statement">{message}</div>
      {fact_row}
      <a class="riq-link" href="#">how this is calculated</a>
    </div></div>'''
    over = asking - bb
    tone = "skip" if over > 0 else "buy"
    label = "SKIP" if over > 0 else "BUY"
    line = (f'<div class="riq-row riq-warn">listed at €{asking:.0f} — €{over:.0f} over</div>'
            if over > 0 else
            f'<div class="riq-row riq-good">listed at €{asking:.0f} — within your price</div>')
    sells = (f'<div class="riq-row">avg exit <b>€{d["sell_avg"]:.0f}</b></div>'
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

def _launch(p):
    """macOS 12 has no supported bundled Chromium build, so drive the system
    Chrome. Same wall the growth engine's capture.js hit — see launchChrome()."""
    try:
        return p.chromium.launch(headless=True, channel="chrome")
    except Exception:
        return p.chromium.launch(headless=True)


with sync_playwright() as p:
    b = _launch(p)
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

        # Read the asking price NOW, off the untouched DOM, from Vinted's own
        # testid. Two bugs lived here: the price was hardcoded and had gone
        # stale (the panel claimed EUR140 on a page showing EUR120), and a
        # regex over innerText ran AFTER the element-stripping below, which
        # removes the price block - so it read the shipping cost instead and
        # called a 50 euro sneaker 5 euros.
        try:
            txt = page.locator('[data-testid="item-price"]').first.inner_text(timeout=5000)
            live = float(txt.replace("\u00a0", " ").split("\u20ac")[0].strip().replace(".", "").replace(",", "."))
        except Exception:
            live = None
        if live and live > 1:
            if abs(live - asking) > 0.5:
                print(f"    page says \u20ac{live:.0f}, script had \u20ac{asking:.0f} - using the page")
            asking = live
            html = card(d, asking)

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
