/**
 * Puts the buy-below price on the Vinted listing page itself.
 *
 * Deliberately does not read the user's Vinted account, session, or messages.
 * Reads the public title, brand and asking price already on the page, then
 * asks resaleiq.dev about that string.
 */
const BADGE_ID = "riq-badge";

function locale() {
  const h = (location.hostname || "").toLowerCase();
  if (h.includes("vinted.fr")) return "fr";
  if (h.includes("vinted.es")) return "es";
  if (h.includes("vinted.de")) return "de";
  if (h.includes("vinted.it")) return "it";
  if (h.includes("vinted.pt")) return "pt";
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
    median: "avg sold",
    n: "n",
    how: "how this is calculated",
    bought: "I bought at €",
    saved: "logged",
    limited: "Free checks used up for today. Sign in and the panel reconnects on its own.",
    verify: "Confirm your email, then this panel will show numbers again.",
    down: "Could not reach Resale IQ. Try again in a moment.",
    signIn: "Sign in",
    confirm: "Confirm email",
    checking: "checking…",
    why: "why",
    rate: "Too many lookups. Wait a minute.",
    hide: "Hide",
    show: "Show Resale IQ",
    timeout: "That check took too long to finish — it may still count against today's free limit. Email us if your count looks wrong.",
    retry: "Try again",
  },
  fr: {
    most: "le maximum à payer pour votre marge",
    notTracked: "non suivi",
    noData: "pas encore de données modèle pour cet article",
    matched: "associé",
    listedOver: (ask, over) => `affiché ${ask} — ${over} au-dessus`,
    listedOk: (ask) => `affiché ${ask} — dans votre prix`,
    median: "moy. vendue",
    n: "n",
    how: "comment c'est calculé",
    bought: "J'ai acheté à €",
    saved: "enregistré",
    limited: "Essais gratuits épuisés aujourd'hui. Connectez-vous et le panneau se reconnecte.",
    verify: "Confirmez votre e-mail, puis le panneau réaffichera les chiffres.",
    down: "Resale IQ est injoignable. Réessayez dans un instant.",
    signIn: "Connexion",
    confirm: "Confirmer l'e-mail",
    checking: "vérification…",
    why: "pourquoi",
    rate: "Trop de requêtes. Attendez une minute.",
    hide: "Masquer",
    show: "Afficher Resale IQ",
    timeout: "Cette vérification a pris trop de temps — elle peut quand même compter dans votre limite du jour. Écrivez-nous si le compte semble faux.",
    retry: "Réessayer",
  },
  es: {
    most: "lo máximo que puedes pagar para tu margen",
    notTracked: "sin datos",
    noData: "aún no hay datos de modelo para este artículo",
    matched: "asociado",
    listedOver: (ask, over) => `puesto a ${ask} — ${over} por encima`,
    listedOk: (ask) => `puesto a ${ask} — dentro de tu precio`,
    median: "media vendida",
    n: "n",
    how: "cómo se calcula",
    bought: "Lo compré a €",
    saved: "guardado",
    limited: "Comprobaciones gratis agotadas hoy. Entra y el panel se reconecta solo.",
    verify: "Confirma tu email y el panel volverá a mostrar números.",
    down: "No se pudo contactar con Resale IQ. Prueba en un momento.",
    signIn: "Entrar",
    confirm: "Confirmar email",
    checking: "comprobando…",
    why: "por qué",
    rate: "Demasiadas consultas. Espera un minuto.",
    hide: "Ocultar",
    show: "Mostrar Resale IQ",
    timeout: "Esa comprobación ha tardado demasiado — puede que cuente igualmente para tu límite de hoy. Escríbenos si el recuento no cuadra.",
    retry: "Intentar de nuevo",
  },
  de: {
    most: "Höchstpreis für deine Marge",
    notTracked: "nicht erfasst",
    noData: "noch keine Modelldaten für diesen Artikel",
    matched: "zugeordnet",
    listedOver: (ask, over) => `inseriert ${ask} — ${over} darüber`,
    listedOk: (ask) => `inseriert ${ask} — innerhalb deines Preises`,
    median: "Ø verkauft",
    n: "n",
    how: "so wird gerechnet",
    bought: "Gekauft für €",
    saved: "gespeichert",
    limited: "Kostenlose Checks für heute aufgebraucht. Anmelden, dann verbindet sich das Panel.",
    verify: "E-Mail bestätigen, dann zeigt das Panel wieder Zahlen.",
    down: "Resale IQ nicht erreichbar. Gleich nochmal versuchen.",
    signIn: "Anmelden",
    confirm: "E-Mail bestätigen",
    checking: "prüfe…",
    why: "warum",
    rate: "Zu viele Anfragen. Eine Minute warten.",
    hide: "Ausblenden",
    show: "Resale IQ zeigen",
    timeout: "Diese Prüfung hat zu lange gedauert — sie zählt möglicherweise trotzdem zu deinem Tageslimit. Schreib uns, wenn die Zahl nicht stimmt.",
    retry: "Erneut versuchen",
  },
  it: {
    most: "il massimo che puoi pagare per il margine",
    notTracked: "non tracciato",
    noData: "ancora nessun dato di modello per questo articolo",
    matched: "associato",
    listedOver: (ask, over) => `in vendita a ${ask} — ${over} in più`,
    listedOk: (ask) => `in vendita a ${ask} — nel tuo prezzo`,
    median: "media venduta",
    n: "n",
    how: "come si calcola",
    bought: "L'ho comprato a €",
    saved: "salvato",
    limited: "Controlli gratuiti finiti per oggi. Accedi e il pannello si ricollega.",
    verify: "Conferma l'email, poi il pannello mostra di nuovo i numeri.",
    down: "Resale IQ non raggiungibile. Riprova tra un attimo.",
    signIn: "Accedi",
    confirm: "Conferma email",
    checking: "controllo…",
    why: "perché",
    rate: "Troppe richieste. Aspetta un minuto.",
    hide: "Nascondi",
    show: "Mostra Resale IQ",
    timeout: "Questo controllo ha impiegato troppo tempo — potrebbe comunque contare nel limite di oggi. Scrivici se il conteggio non torna.",
    retry: "Riprova",
  },
  pt: {
    most: "o máximo que podes pagar para a tua margem",
    notTracked: "sem dados",
    noData: "ainda sem dados de modelo para este artigo",
    matched: "associado",
    listedOver: (ask, over) => `anunciado a ${ask} — ${over} acima`,
    listedOk: (ask) => `anunciado a ${ask} — dentro do teu preço`,
    median: "média vendida",
    n: "n",
    how: "como se calcula",
    bought: "Comprei a €",
    saved: "guardado",
    limited: "Verificações grátis esgotadas hoje. Entra e o painel liga-se sozinho.",
    verify: "Confirma o email e o painel volta a mostrar números.",
    down: "Não foi possível contactar a Resale IQ. Tenta daqui a pouco.",
    signIn: "Entrar",
    confirm: "Confirmar email",
    checking: "a verificar…",
    why: "porquê",
    rate: "Demasiados pedidos. Espera um minuto.",
    hide: "Ocultar",
    show: "Mostrar Resale IQ",
    timeout: "Esta verificação demorou demasiado — pode ainda contar para o teu limite de hoje. Escreve-nos se a contagem parecer errada.",
    retry: "Tentar novamente",
  },
};

function t() { return I18N[locale()] || I18N.en; }

function readListing() {
  if (!/\/items\/\d+/.test(location.pathname)) return null;

  const title =
    document.querySelector(
      '[data-testid="item-title"], h1[class*="title"], h1, .details-list__item-value'
    )?.textContent?.trim() ||
    document.title.split("|")[0].trim();

  const brand =
    document.querySelector('a[href*="/brand/"], [itemprop="brand"]')?.textContent?.trim() || "";

  let price = null;
  for (const el of document.querySelectorAll('[data-testid*="price"], p, div, span')) {
    const txt = (el.textContent || "").trim();
    if (txt.length > 18) continue;
    const m = txt.match(/^(\d{1,3}(?:[.\s]\d{3})*(?:,\d{2})?)\s*€$/);
    if (m) { price = parseFloat(m[1].replace(/[.\s]/g, "").replace(",", ".")); break; }
  }

  if (!title || title.length < 3) return null;
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

function esc(v) {
  return String(v ?? "").replace(/[&<>"']/g, c => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

function money(n) {
  const x = Number(n);
  return (n == null || !isFinite(x) || x <= 0) ? "—" : `€${Math.round(x)}`;
}

let collapsed = false;
chrome.storage.local.get("riq_collapsed").then(({ riq_collapsed }) => {
  collapsed = !!riq_collapsed;
});

function setCollapsed(v) {
  collapsed = !!v;
  chrome.storage.local.set({ riq_collapsed: collapsed });
}

function paintStatus(sub, href, label) {
  render(`
    <div class="riq-card riq-watch">
      <div class="riq-head"><span class="riq-logo">R</span> Resale IQ</div>
      <div class="riq-sub">${esc(sub)}</div>
      ${href ? `<a class="riq-link" href="${esc(href)}" target="_blank" rel="noopener">${esc(label)}</a>` : ""}
    </div>`);
}

// A client-side timeout on the verdict fetch (extension/background.js).
// The reason this differs from paintStatus(t().down): a plain network
// failure never reached the server, but a timeout might have — the anon
// quota is claimed atomically before the answer is computed
// (demand-intel/db/queries.py:2652), so a request that dies mid-flight can
// still have spent one of the day's free checks. Says so, and offers a real
// retry instead of leaving the "checking…" card spinning forever.
// docs/audit/MONETIZATION.md §4 / docs/product/SUPPORT-VOICE.md §4.
function paintTimeout() {
  const L = t();
  render(`
    <div class="riq-card riq-watch">
      <div class="riq-head"><span class="riq-logo">R</span> Resale IQ</div>
      <div class="riq-sub">${esc(L.down)}</div>
      <div class="riq-note">${esc(L.timeout)}</div>
      <button type="button" class="riq-link riq-retry">${esc(L.retry)}</button>
    </div>`);
  panel().querySelector(".riq-retry")?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    lastQuery = "";
    run();
  });
}

function paint(d, askingPrice) {
  const L = t();
  const buyBelow = d.buy_below ?? null;
  const verdict = (d.verdict || d.signal || "WATCH").toUpperCase();
  const tone = verdict === "BUY" ? "buy" : verdict === "SKIP" ? "skip" : "watch";
  const shown = (verdict === "INSUFFICIENT_DATA" || verdict === "UNKNOWN") ? "NO DATA" : verdict;
  let overBy = null;
  if (buyBelow != null && askingPrice != null && askingPrice > buyBelow) {
    overBy = askingPrice - buyBelow;
  }
  const n = d.n ?? d.sold_7d ?? null;
  const conf = (d.confidence || "").toUpperCase();
  const note = d.confidence_note
    || (conf === "LOW" && n != null ? `Only ${n} comparable sold items` : "");
  const why = Array.isArray(d.reasons) && d.reasons[0] ? d.reasons[0] : "";

  if (collapsed) {
    render(`
      <button type="button" class="riq-pill riq-pill-${tone}" aria-label="${esc(L.show)}">
        <span class="riq-logo">R</span>
        <span>${esc(money(buyBelow))}</span>
        <span class="riq-pill-v">${esc(shown)}</span>
      </button>`);
    panel().querySelector(".riq-pill")?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      setCollapsed(false);
      paint(d, askingPrice);
      bindBought();
    });
    return;
  }

  const body = buyBelow != null
    ? `<div class="riq-num">${money(buyBelow)}</div>
       <div class="riq-sub">${esc(L.most)}</div>`
    : `<div class="riq-num riq-muted">${esc(L.notTracked)}</div>
       <div class="riq-sub">${esc(L.noData)}</div>`;

  render(`
    <div class="riq-card riq-${tone}">
      <div class="riq-head">
        <span class="riq-logo">R</span> Resale IQ
        <span class="riq-verdict riq-${tone}">${esc(shown)}</span>
        <button type="button" class="riq-hide" aria-label="${esc(L.hide)}">–</button>
      </div>
      ${d.product ? `<div class="riq-match">${esc(L.matched)}: ${esc(d.product)}</div>` : ""}
      ${body}
      ${conf ? `<div class="riq-conf">${esc(conf)}${d.provisional ? " · prov." : ""}</div>` : ""}
      ${note ? `<div class="riq-note">${esc(note)}</div>` : ""}
      ${overBy != null
          ? `<div class="riq-row riq-warn">${esc(L.listedOver(money(askingPrice), money(overBy)))}</div>`
          : (askingPrice != null && buyBelow != null
              ? `<div class="riq-row riq-good">${esc(L.listedOk(money(askingPrice)))}</div>` : "")}
      ${d.sell_avg != null ? `<div class="riq-row">${esc(L.median)} <b>${money(d.sell_avg)}</b>${n != null ? ` · ${esc(L.n)} ${esc(n)}` : ""}</div>` : (n != null ? `<div class="riq-row">${esc(L.n)} ${esc(n)}</div>` : "")}
      ${why ? `<div class="riq-why">${esc(L.why)}: ${esc(why)}</div>` : ""}
      <div class="riq-bought">
        <label>${esc(L.bought)}</label>
        <input class="riq-bought-input" type="number" min="1" step="1" value="${askingPrice != null && askingPrice > 0 ? Math.round(askingPrice) : ""}" />
        <button class="riq-bought-btn" type="button">OK</button>
      </div>
      <a class="riq-link" href="https://resaleiq.dev/methodology" target="_blank" rel="noopener">${esc(L.how)}</a>
    </div>`);

  panel().querySelector(".riq-hide")?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCollapsed(true);
    paint(d, askingPrice);
  });
}

let lastQuery = "";
let lastPath = "";
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

function run() {
  const listing = readListing();
  if (!listing) {
    lastQuery = "";
    lastPath = location.pathname;
    document.getElementById(BADGE_ID)?.remove();
    return;
  }
  if (location.pathname !== lastPath) lastQuery = "";
  if (listing.q === lastQuery) return;
  lastQuery = listing.q;
  lastPath = location.pathname;

  render(`<div class="riq-card"><div class="riq-head"><span class="riq-logo">R</span> Resale IQ</div><div class="riq-sub">${esc(t().checking)}</div></div>`);

  chrome.runtime.sendMessage({ type: "verdict", q: listing.q }, (res) => {
    if (chrome.runtime.lastError) {
      paintStatus(t().down);
      return;
    }
    if (!res?.ok) {
      if (res?.verify) paintStatus(t().verify, "https://resaleiq.dev/check-email", t().confirm);
      else if (res?.limited) paintStatus(res.rate ? t().rate : t().limited, "https://resaleiq.dev/login", t().signIn);
      else if (res?.timedOut) paintTimeout();
      else paintStatus(t().down);
      return;
    }
    lastData = res.data;
    try {
      paint(res.data, listing.price);
      bindBought();
    } catch {
      paintStatus(t().down);
    }
  });
}

let timer;
const debounced = () => { clearTimeout(timer); timer = setTimeout(run, 400); };
try {
  const root = document.body || document.documentElement;
  if (root) new MutationObserver(debounced).observe(root, { childList: true, subtree: true });
} catch { /* fail closed: no overlay is better than breaking Vinted */ }
addEventListener("popstate", () => { lastQuery = ""; debounced(); });

try {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.riq_token) {
      lastQuery = "";
      run();
    }
  });
} catch { /* storage listener is a convenience, not required to paint */ }

let lastHref = location.href;
setInterval(() => {
  if (location.href !== lastHref) {
    lastHref = location.href;
    lastQuery = "";
    debounced();
  }
}, 600);

try { run(); } catch { /* same */ }
