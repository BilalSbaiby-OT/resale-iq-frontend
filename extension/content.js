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

  if (!title || title.length < 3) return null;
  // Brand first: the API matches against "brand model" strings.
  const q = (brand && !title.toLowerCase().startsWith(brand.toLowerCase()))
    ? `${brand} ${title}` : title;
  return { q: q.slice(0, 120) };
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

function paint(d) {
  const verdict = (d.verdict || d.signal || "").toUpperCase();
  const tone = verdict === "BUY" ? "buy" : verdict === "SKIP" ? "skip" : "watch";
  const buyBelow = d.buy_below ?? null;   // verified field name

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
      ${d.sell_avg != null ? `<div class="riq-row">sells around <b>${money(d.sell_avg)}</b></div>` : ""}
      <a class="riq-link" href="https://resaleiq.dev/methodology" target="_blank" rel="noopener">how this is calculated</a>
    </div>`);
}

function paintLimited() {
  render(`
    <div class="riq-card riq-watch">
      <div class="riq-head"><span class="riq-logo">R</span> Resale IQ</div>
      <div class="riq-sub">Free checks used up for today.</div>
      <a class="riq-link" href="https://resaleiq.dev/register?plan=free" target="_blank" rel="noopener">Get more checks</a>
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
    paint(res.data);
  });
}

// Vinted is a SPA: navigation does not reload the page, so a one-shot run on
// load would only ever work for the first item the user opens.
let t;
const debounced = () => { clearTimeout(t); t = setTimeout(run, 400); };
new MutationObserver(debounced).observe(document.body, { childList: true, subtree: true });
addEventListener("popstate", debounced);
run();
