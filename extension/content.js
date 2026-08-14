/**
 * Puts the buy-below price on the Vinted listing page itself.
 *
 * WHY THIS EXISTS
 * The site has ~21 human visitors a month. Four independent models, asked
 * separately, all reached the same conclusion: the constraint is distribution,
 * not data — and the buy-below number is worth most at the moment of the buy,
 * which happens on Vinted, not on our dashboard.
 *
 * WHAT IT DELIBERATELY DOES NOT DO
 * It does not read the user's Vinted account, touch their session, or send
 * anything about them anywhere. It reads the public title and price already
 * rendered on the page, and asks our own public verdict endpoint about it.
 */
const BADGE_ID = "riq-badge";

/** Vinted renders client-side, so the title can arrive after we do. */
function readListing() {
  // Item pages only. Vinted's URL shape is /items/<id>-<slug> across all TLDs.
  if (!/\/items\/\d+/.test(location.pathname)) return null;

  const title =
    document.querySelector('h1[class*="title"], .details-list__item-value, h1')?.textContent?.trim() ||
    document.title.split("|")[0].trim();

  // The brand link is the most reliable signal; the title alone is noisy.
  const brand =
    document.querySelector('a[href*="/brand/"], [itemprop="brand"]')?.textContent?.trim() || "";

  // The asking price. Vinted shows two: the item price and a larger
  // "buyer protection included" total. We want the first — the buy-below is
  // computed against the item price, and comparing against the inflated total
  // would tell the reseller to walk away from deals that are fine.
  let price = null;
  for (const el of document.querySelectorAll('[data-testid*="price"], p, div, span')) {
    const t = (el.textContent || "").trim();
    if (t.length > 18) continue;
    const m = t.match(/^(\d{1,3}(?:[.\s]\d{3})*(?:,\d{2})?)\s*€$/);
    if (m) { price = parseFloat(m[1].replace(/[.\s]/g, "").replace(",", ".")); break; }
  }

  if (!title || title.length < 3) return null;
  // Brand first: the API matches against "brand model" strings.
  const q = (brand && !title.toLowerCase().startsWith(brand.toLowerCase()))
    ? `${brand} ${title}` : title;
  return { q: q.slice(0, 120), price };
}

function panel() {
  let el = document.getElementById(BADGE_ID);
  if (!el) {
    el = document.createElement("div");
    el.id = BADGE_ID;
    document.body.appendChild(el);
  }
  return el;
}

function render(html) { panel().innerHTML = html; }

function money(n) {
  return n == null ? "—" : `€${Number(n).toFixed(0)}`;
}

function paint(d, askingPrice) {
  const buyBelow = d.buy_below ?? null;   // verified field name

  // THE DECISION IS ABOUT THIS LISTING, NOT THE MODEL.
  //
  // The API's verdict answers "is this model worth trading". Rendered on a
  // specific listing it reads as "buy this one" — and it was doing exactly
  // that on a Jordan 4 listed at EUR140 against a EUR65 buy-below, i.e.
  // telling a reseller to buy at more than twice the price they should pay.
  // On the page where the money is actually spent, the asking price decides.
  let verdict = (d.verdict || d.signal || "").toUpperCase();
  let tone = verdict === "BUY" ? "buy" : verdict === "SKIP" ? "skip" : "watch";
  let overBy = null;
  if (buyBelow != null && askingPrice != null) {
    if (askingPrice > buyBelow) {
      overBy = askingPrice - buyBelow;
      verdict = "TOO DEAR";
      tone = "skip";
    } else {
      verdict = "IN RANGE";
      tone = "buy";
    }
  }

  // If we have no buy-below we say so. A blank panel reads as broken, and a
  // fabricated number is the one thing this product cannot afford.
  const body = buyBelow != null
    ? `<div class="riq-num">${money(buyBelow)}</div>
       <div class="riq-sub">most you can pay for your margin</div>`
    : `<div class="riq-num riq-muted">not tracked</div>
       <div class="riq-sub">we have no model-level data for this item yet</div>`;

  render(`
    <div class="riq-card riq-${tone}">
      <div class="riq-head">
        <span class="riq-logo">R</span> Resale IQ
        ${verdict ? `<span class="riq-verdict riq-${tone}">${verdict}</span>` : ""}
      </div>
      ${d.product ? `<div class="riq-match">matched: ${d.product}</div>` : ""}
      ${body}
      ${overBy != null
          ? `<div class="riq-row riq-warn">listed at ${money(askingPrice)} — ${money(overBy)} over</div>`
          : (askingPrice != null && buyBelow != null
              ? `<div class="riq-row riq-good">listed at ${money(askingPrice)} — within your price</div>` : "")}
      ${d.sell_avg != null ? `<div class="riq-row">sells around <b>${money(d.sell_avg)}</b></div>` : ""}
      <a class="riq-link" href="https://resaleiq.dev/methodology" target="_blank" rel="noopener">how this is calculated</a>
    </div>`);
}

function paintLimited() {
  render(`
    <div class="riq-card riq-watch">
      <div class="riq-head"><span class="riq-logo">R</span> Resale IQ</div>
      <div class="riq-sub">Free checks used up for today. Sign in and the panel
        reconnects on its own.</div>
      <a class="riq-link" href="https://resaleiq.dev/login" target="_blank" rel="noopener">Sign in</a>
    </div>`);
}

let lastQuery = "";

async function run() {
  const listing = readListing();
  if (!listing) { document.getElementById(BADGE_ID)?.remove(); return; }
  if (listing.q === lastQuery) return;      // Vinted re-renders constantly
  lastQuery = listing.q;

  render(`<div class="riq-card"><div class="riq-head"><span class="riq-logo">R</span> Resale IQ</div><div class="riq-sub">checking…</div></div>`);

  chrome.runtime.sendMessage({ type: "verdict", q: listing.q }, (res) => {
    if (chrome.runtime.lastError) return;
    if (!res?.ok) {
      if (res?.limited) paintLimited();
      else document.getElementById(BADGE_ID)?.remove();  // unknown item: stay out of the way
      return;
    }
    paint(res.data, listing.price);
  });
}

// Vinted is a SPA: navigation does not reload the page, so a one-shot run on
// load would only ever work for the first item the user opens.
let t;
const debounced = () => { clearTimeout(t); t = setTimeout(run, 400); };
new MutationObserver(debounced).observe(document.body, { childList: true, subtree: true });
addEventListener("popstate", debounced);
run();
