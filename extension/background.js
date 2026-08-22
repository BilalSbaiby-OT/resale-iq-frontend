// All network calls live here, not in the content script.
//
// A content script's fetch is subject to the HOST page's CORS policy, so
// calling resaleiq.dev from a vinted.es page would need the API to advertise
// Vinted as an allowed origin — widening CORS on a live payment backend to
// make a browser extension work is a bad trade. The service worker has its
// own origin and host_permissions, so nothing about the API changes.
const API = "https://resaleiq.dev";
const CACHE_TTL_MS = 10 * 60 * 1000;
const cache = new Map();

function cached(q) {
  const hit = cache.get(q);
  if (!hit) return null;
  if (Date.now() - hit.at > CACHE_TTL_MS) { cache.delete(q); return null; }
  return hit.data;
}

chrome.runtime.onMessage.addListener((msg, _sender, respond) => {
  if (msg?.type === "bought") {
    (async () => {
      try {
        const { riq_token } = await chrome.storage.sync.get("riq_token");
        const headers = { Accept: "application/json", "Content-Type": "application/json" };
        if (riq_token) headers.Authorization = `Bearer ${riq_token}`;
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

      const { riq_token } = await chrome.storage.sync.get("riq_token");
      const headers = { Accept: "application/json" };
      if (riq_token) headers.Authorization = `Bearer ${riq_token}`;

      const r = await fetch(`${API}/api/verdict?q=${encodeURIComponent(msg.q)}`, { headers });
      if (r.status === 429) { respond({ ok: false, limited: true, rate: true }); return; }
      if (!r.ok) { respond({ ok: false, status: r.status }); return; }
      const data = await r.json();

      if (data?.verdict === "LIMIT_REACHED") { respond({ ok: false, limited: true }); return; }
      if (data?.verdict === "UNKNOWN") { respond({ ok: false, unknown: true }); return; }
      cache.set(msg.q, { at: Date.now(), data });
      respond({ ok: true, data });
    } catch (e) {
      respond({ ok: false, error: String(e) });
    }
  })();

  return true;
});
