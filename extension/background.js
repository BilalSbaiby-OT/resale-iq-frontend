// All network calls live here, not in the content script.
//
// A content script's fetch is subject to the HOST page's CORS policy, so
// calling resaleiq.dev from a vinted.es page would need the API to advertise
// Vinted as an allowed origin. The service worker has host_permissions, so
// nothing about the API CORS policy has to change.
const API = "https://resaleiq.dev";
const CACHE_TTL_MS = 10 * 60 * 1000;
const cache = new Map();

async function getToken() {
  const { riq_token } = await chrome.storage.local.get("riq_token");
  return (riq_token || "").trim();
}

async function migrateSyncToken() {
  const local = await chrome.storage.local.get("riq_token");
  if (local.riq_token) return;
  try {
    const sync = await chrome.storage.sync.get("riq_token");
    if (sync.riq_token) {
      await chrome.storage.local.set({ riq_token: sync.riq_token });
      await chrome.storage.sync.remove("riq_token");
    }
  } catch { /* sync may be unavailable; local-only is the intended state */ }
}

chrome.runtime.onInstalled.addListener(() => { migrateSyncToken(); });
migrateSyncToken();

function cached(q) {
  const hit = cache.get(q);
  if (!hit) return null;
  if (Date.now() - hit.at > CACHE_TTL_MS) { cache.delete(q); return null; }
  return hit.data;
}

async function fetchVerdict(q, token, retried) {
  const headers = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const r = await fetch(`${API}/api/verdict?q=${encodeURIComponent(q)}`, { headers });
  if (r.status === 401 && token && !retried) {
    await chrome.storage.local.remove("riq_token");
    cache.clear();
    return fetchVerdict(q, "", true);
  }
  return r;
}

chrome.runtime.onMessage.addListener((msg, _sender, respond) => {
  if (msg?.type === "bought") {
    (async () => {
      try {
        const token = await getToken();
        const headers = { Accept: "application/json", "Content-Type": "application/json" };
        if (token) headers.Authorization = `Bearer ${token}`;
        const r = await fetch(`${API}/api/purchases`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            bought_at: msg.bought_at,
            query: msg.query,
            product: msg.product,
            listing_url: msg.listing_url,
            listing_price: msg.listing_price,
          }),
        });
        respond({ ok: r.ok });
      } catch (e) {
        respond({ ok: false, error: String(e) });
      }
    })();
    return true;
  }
  if (msg?.type !== "verdict") return false;

  (async () => {
    try {
      const hit = cached(msg.q);
      if (hit) { respond({ ok: true, data: hit, cached: true }); return; }

      const token = await getToken();
      const r = await fetchVerdict(msg.q, token, false);
      if (r.status === 429) { respond({ ok: false, limited: true, rate: true }); return; }
      if (r.status === 403) { respond({ ok: false, verify: true }); return; }
      if (!r.ok) { respond({ ok: false, status: r.status, down: true }); return; }
      const data = await r.json();

      if (data?.verdict === "LIMIT_REACHED") { respond({ ok: false, limited: true }); return; }
      // UNKNOWN is a real answer: we have no model-level number. Hide the
      // panel and the extension looks broken. Paint "not tracked" instead.
      cache.set(msg.q, { at: Date.now(), data });
      respond({ ok: true, data });
    } catch (e) {
      respond({ ok: false, down: true, error: String(e) });
    }
  })();

  return true;
});
