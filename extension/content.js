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
function locale() {
  const h = (location.hostname || "").toLowerCase();
  if (h.includes("vinted.fr") || h.endsWith(".fr")) return "fr";
  if (h.includes("vinted.es") || h.endsWith(".es")) return "es";
  return "en";
}

const I18N = {
  en: {
    most: "most you can pay for your margin",
    notTracked: "not tracked",
    noData: "we have no model-level data for this item yet",
    matched: "matched",
    listedOver: (ask, over) => `listed at ${ask} — ${over} over`,
    listedOk: (ask) => `listed at ${ask} — within your price`,
    median: "median sold",
    n: "n",
    how: "how this is calculated",
    bought: "I bought at €",
    saved: "logged",
    limited: "Free checks used up for today. Sign in and the panel reconnects on its own.",
    signIn: "Sign in",
    checking: "checking…",
  },
  fr: {
    most: "le maximum à payer pour votre marge",
    notTracked: "non suivi",
    noData: "pas encore de données modèle pour cet article",
    matched: "associé",
    listedOver: (ask, over) => `affiché ${ask} — ${over} au-dessus`,
    listedOk: (ask) => `affiché ${ask} — dans votre prix`,
    median: "médiane vendue",
    n: "n",
    how: "comment c'est calculé",
    bought: "J'ai acheté à €",
    saved: "enregistré",
    limited: "Essais gratuits épuisés aujourd'hui. Connectez-vous et le panneau se reconnecte.",
    signIn: "Connexion",
    checking: "vérification…",
  },
  es: {
    most: "lo máximo que puedes pagar para tu margen",
    notTracked: "sin datos",
    noData: "aún no hay datos de modelo para este artículo",
    matched: "asociado",
    listedOver: (ask, over) => `puesto a ${ask} — ${over} por encima`,
    listedOk: (ask) => `puesto a ${ask} — dentro de tu precio`,
    median: "mediana vendida",
    n: "n",
    how: "cómo se calcula",
    bought: "Lo compré a €",
    saved: "guardado",
    limited: "Comprobaciones gratis agotadas hoy. Entra y el panel se reconecta solo.",
    signIn: "Entrar",
    checking: "comprobando…",
  },
};

function t() { return I18N[locale()] || I18N.en; }

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

/**
 * Escape anything that came off the wire before it reaches innerHTML.
 *
 * `product` is the only response field rendered as text rather than a number,
 * and it is interpolated into markup. We control the API, so this is not a
 * live vulnerability — but "the server would never send that" is exactly the
 * assumption that turns one compromised response into script execution on
 * every Vinted page the user opens. It also removes the reason a reviewer
 * would query our innerHTML use at all.
 */
function esc(v) {
  return String(v ?? "").replace(/[&<>"']/g, c => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

function money(n) {
  const x = Number(n);
  return (n == null || !isFinite(x)) ? "—" : `€${x.toFixed(0)}`;
}

function paint(d, askingPrice) {
  const L = t();
  const buyBelow = d.buy_below ?? null;
  // Model call stays BUY / WATCH / SKIP (P1-2). Asking vs buy-below is a
  // warning row, not a rewritten verdict — covering the Vinted Buy button
  // would get us uninstalled, rewriting BUY into TOO DEAR hid the model call.
  const verdict = (d.verdict || d.signal || "WATCH").toUpperCase();
  const tone = verdict === "BUY" ? "buy" : verdict === "SKIP" ? "skip" : "watch";
  let overBy = null;
  if (buyBelow != null && askingPrice != null && askingPrice > buyBelow) {
    overBy = askingPrice - buyBelow;
  }
  const n = d.n ?? d.sold_7d ?? null;
  const body = buyBelow != null
    ? `<div class="riq-num">${money(buyBelow)}</div>
       <div class="riq-sub">${esc(L.most)}</div>`
    : `<div class="riq-num riq-muted">${esc(L.notTracked)}</div>
       <div class="riq-sub">${esc(L.noData)}</div>`;

  render(`
    <div class="riq-card riq-${tone}">
      <div class="riq-head">
        <span class="riq-logo">R</span> Resale IQ
        <span class="riq-verdict riq-${tone}">${esc(verdict)}</span>
      </div>
      ${d.product ? `<div class="riq-match">${esc(L.matched)}: ${esc(d.product)}</div>` : ""}
      ${body}
      ${overBy != null
          ? `<div class="riq-row riq-warn">${esc(L.listedOver(money(askingPrice), money(overBy)))}</div>`
          : (askingPrice != null && buyBelow != null
              ? `<div class="riq-row riq-good">${esc(L.listedOk(money(askingPrice)))}</div>` : "")}
      ${d.sell_avg != null ? `<div class="riq-row">${esc(L.median)} <b>${money(d.sell_avg)}</b>${n != null ? ` · ${esc(L.n)} ${esc(n)}` : ""}</div>` : (n != null ? `<div class="riq-row">${esc(L.n)} ${esc(n)}</div>` : "")}
      <div class="riq-bought">
        <label>${esc(L.bought)}</label>
        <input class="riq-bought-input" type="number" min="1" step="1" value="${askingPrice != null ? Math.round(askingPrice) : ""}" />
        <button class="riq-bought-btn" type="button">OK</button>
      </div>
      <a class="riq-link" href="https://resaleiq.dev/methodology" target="_blank" rel="noopener">${esc(L.how)}</a>
    </div>`);
}

function paintLimited() {
  const L = t();
  render(`
    <div class="riq-card riq-watch">
      <div class="riq-head"><span class="riq-logo">R</span> Resale IQ</div>
      <div class="riq-sub">${esc(L.limited)}</div>
      <a class="riq-link" href="https://resaleiq.dev/login" target="_blank" rel="noopener">${esc(L.signIn)}</a>
    </div>`);
}

let lastQuery = "";
let lastData = null;

function bindBought() {
  const root = document.getElementById(BADGE_ID);
  if (!root) return;
  const btn = root.querySelector(".riq-bought-btn");
  const input = root.querySelector(".riq-bought-input");
  if (!btn || !input) return;
  btn.addEventListener("click", () => {
    const price = parseFloat(input.value);
    if (!isFinite(price) || price <= 0) return;
    const listing = readListing();
    chrome.runtime.sendMessage({
      type: "bought",
      bought_at: price,
      query: listing?.q || lastQuery,
      product: lastData?.product || "",
      listing_url: location.href.slice(0, 500),
      listing_price: listing?.price ?? null,
    }, (res) => {
      if (res?.ok) {
        btn.textContent = t().saved;
        btn.disabled = true;
      }
    });
  });
}

async function run() {
  const listing = readListing();
  if (!listing) { document.getElementById(BADGE_ID)?.remove(); return; }
  if (listing.q === lastQuery) return;
  lastQuery = listing.q;

  render(`<div class="riq-card"><div class="riq-head"><span class="riq-logo">R</span> Resale IQ</div><div class="riq-sub">${esc(t().checking)}</div></div>`);

  chrome.runtime.sendMessage({ type: "verdict", q: listing.q }, (res) => {
    if (chrome.runtime.lastError) return;
    if (!res?.ok) {
      if (res?.limited) paintLimited();
      else document.getElementById(BADGE_ID)?.remove();
      return;
    }
    lastData = res.data;
    paint(res.data, listing.price);
    bindBought();
  });
}

// Vinted is a SPA: navigation does not reload the page, so a one-shot run on
// load would only ever work for the first item the user opens.
let t;
const debounced = () => { clearTimeout(t); t = setTimeout(run, 400); };
new MutationObserver(debounced).observe(document.body, { childList: true, subtree: true });
addEventListener("popstate", debounced);
run();
