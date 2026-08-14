/**
 * Links the extension to the user's account, with no copy-paste.
 *
 * WHY: the owner clicked "Get more checks", signed up, came back to Vinted and
 * the panel still said the free checks were spent. The only way to connect an
 * account was pasting a token into an options page — which no real customer
 * will ever do, and which was the difference between the extension working and
 * appearing broken immediately after someone gave us their email.
 *
 * SCOPE: this runs ONLY on resaleiq.dev — our own origin, declared explicitly
 * in the manifest. It reads the session our own app already stored in this
 * user's own browser and hands it to the extension. It never runs on Vinted,
 * never touches a Vinted session, and no other site can reach it.
 */
const KEY = "di_jwt";

function sync() {
  try {
    const tok = localStorage.getItem(KEY);
    // Clearing on sign-out matters as much as setting on sign-in: a stale token
    // would keep answering as a user who has logged out.
    chrome.storage.sync.set({ riq_token: tok || "" });
  } catch { /* private mode, storage blocked — fall back to free checks */ }
}

sync();
// Sign-in is a client-side transition on this app: no page load follows it, so
// a one-shot read at document_idle would miss the token every time.
addEventListener("storage", (e) => { if (e.key === KEY) sync(); });
setInterval(sync, 3000);
