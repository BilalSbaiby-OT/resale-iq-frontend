/**
 * Links the extension to the user's account, with no copy-paste.
 *
 * Runs ONLY on resaleiq.dev. Reads the session this site already stored in
 * this browser and copies it into chrome.storage.local. Never runs on Vinted.
 */
const KEY = "di_jwt";

function sync() {
  try {
    const tok = localStorage.getItem(KEY);
    chrome.storage.local.set({ riq_token: tok || "" });
  } catch { /* private mode, storage blocked — fall back to free checks */ }
}

sync();
addEventListener("storage", (e) => { if (e.key === KEY) sync(); });
setInterval(sync, 3000);
