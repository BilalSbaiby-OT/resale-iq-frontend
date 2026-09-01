// Proof for claude/extension-eng/panel-states.
//
// No real browser is available in this environment, so this loads the
// SHIPPED extension/content.js unmodified into a Node `vm` sandbox with a
// minimal fake DOM/chrome, and calls its own paint()/paintStatus() functions
// directly — the exact code that runs on a live Vinted page, not a
// reimplementation of it. What this does NOT prove is listed in the PR/
// report as "needs browser": whether readListing()'s selectors still match
// production Vinted DOM, and how the panel actually looks rendered.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../../../../../");
const CONTENT_JS = path.join(ROOT, "extension/content.js");
const src = fs.readFileSync(CONTENT_JS, "utf8");

function makeBadge() {
  return {
    id: "",
    _html: "",
    set innerHTML(v) { this._html = v; },
    get innerHTML() { return this._html; },
    appendChild() {},
    querySelector() { return { addEventListener() {}, textContent: "" }; },
    querySelectorAll() { return []; },
    remove() {},
  };
}

const badge = makeBadge();

const fakeDocument = {
  getElementById(id) { return id === "riq-badge" && badge.id ? badge : null; },
  createElement() { badge.id = "riq-badge"; return badge; },
  body: { appendChild() {}, style: {} },
  documentElement: {},
  title: "Test item | Vinted",
  querySelector() { return null; },
  querySelectorAll() { return []; },
};

const fakeChrome = {
  storage: {
    local: { get: async () => ({}), set: async () => {} },
    onChanged: { addListener() {} },
  },
  runtime: { sendMessage() {}, lastError: undefined },
};

const sandbox = {
  chrome: fakeChrome,
  document: fakeDocument,
  // A hostname that matches none of the five markets, so locale() falls back
  // to "en" and the fallback-copy assertions below are checked against known
  // English strings rather than needing five locale variants of this test.
  // readListing()'s /items/\d+ match is on the PATH, not the host, so this
  // does not weaken the run()-path assertions elsewhere in this file.
  location: {
    hostname: "example.com",
    pathname: "/items/1-test",
    href: "https://example.com/items/1-test",
  },
  addEventListener() {},
  setInterval() { return 0; },
  clearTimeout() {},
  setTimeout() { return 0; },
  MutationObserver: class { observe() {} },
  console,
};
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(src, sandbox, { filename: "content.js" });

function render(fn) {
  badge._html = "";
  fn();
  return badge._html;
}

let failures = 0;
function check(label, cond) {
  if (cond) { console.log(`PASS: ${label}`); }
  else { console.error(`FAIL: ${label}`); failures++; }
}

// 1. INSUFFICIENT_DATA prefers the backend's own `message`, uses the neutral
//    riq-info tone (never riq-watch's amber), and shows n honestly.
let html = render(() => sandbox.paint(
  { verdict: "INSUFFICIENT_DATA", n: 4, message: "Only 4 comparable sold items — our floor is 8." },
  null
));
check("INSUFFICIENT_DATA renders the backend's message verbatim",
  html.includes("Only 4 comparable sold items — our floor is 8."));
check("INSUFFICIENT_DATA does not use riq-watch (amber = real WATCH only)",
  !html.includes("riq-watch"));
check("INSUFFICIENT_DATA uses the neutral riq-info tone",
  html.includes('riq-card riq-info"'));
check("INSUFFICIENT_DATA shows n honestly when the backend sent it",
  html.includes('riq-fact-n">4</span>'));

// 2. UNKNOWN without a backend `message` falls back to DIFFERENT copy than
//    INSUFFICIENT_DATA's fallback — the two must not collapse into one.
html = render(() => sandbox.paint({ verdict: "UNKNOWN" }, null));
check("UNKNOWN falls back to its own copy",
  // esc() HTML-entity-escapes the apostrophe — asserting against the escaped
  // form on purpose, so this proof would also catch esc() regressing.
  html.includes("We don&#39;t have model-level data for this brand yet."));
check("UNKNOWN's fallback is not INSUFFICIENT_DATA's fallback",
  !html.includes("Not enough sold data to price this yet."));
check("UNKNOWN does not use riq-watch",
  !html.includes("riq-watch"));

// 3. A real WATCH verdict is unaffected by the fix — still amber, still a band.
html = render(() => sandbox.paint({ verdict: "WATCH", buy_below: 40, n: 12 }, null));
check("a genuine WATCH verdict still renders riq-watch",
  html.includes('riq-card riq-watch"'));
check("a genuine WATCH verdict still shows a real number, not a statement",
  html.includes('riq-num">€40</div>') && !html.includes("riq-statement"));

// 4. System error (network down / exception) is riq-status-err — reuses
//    SKIP's red, never riq-watch's amber.
html = render(() => sandbox.paintStatus("Couldn't reach Resale IQ.", null, null, true));
check("a genuine failure uses riq-status-err",
  html.includes('riq-card riq-status-err"'));
check("a genuine failure does not use riq-watch",
  !html.includes("riq-watch"));

// 5. Self-serve system state (rate limit / unverified email / quota) is
//    riq-status — neutral, distinct from both riq-watch and riq-status-err.
html = render(() => sandbox.paintStatus("Too many lookups.", "https://resaleiq.dev/login", "Sign in", false));
check("a self-serve status uses riq-status (neutral)",
  html.includes('riq-card riq-status"'));
check("a self-serve status is not flagged as an error",
  !html.includes("riq-status-err"));
check("a self-serve status does not use riq-watch",
  !html.includes("riq-watch"));

// 6. A priced verdict (BUY/WATCH with buy_below) still surfaces the
//    backend's confidence_note — the field that is about to carry the
//    reason on far more listings once the n<8 evidence gate reaches the
//    extension (57/100 board models today, 38/100 after A13). This must
//    never fall back to a fabricated "0 comparables" — only the backend's
//    own text, or nothing.
html = render(() => sandbox.paint(
  { verdict: "WATCH", buy_below: 26, n: 5, confidence: "LOW",
    confidence_note: "Only 5 comparable departures — below our 8 floor, shown as low-confidence." },
  null
));
check("a priced verdict's confidence_note reaches the rendered panel",
  html.includes("Only 5 comparable departures — below our 8 floor, shown as low-confidence."));

// 7. A stalled/timed-out request is a system state, not a verdict —
//    regression test for a bug found on `main`'s own tip before this rebase:
//    paintTimeout() rendered `riq-card riq-watch` (real-WATCH amber) for a
//    client-side timeout. It must render the neutral `riq-status` card,
//    same family as paintStatus()'s self-serve states, never amber.
html = render(() => sandbox.paintTimeout());
check("a stalled/timed-out request uses the neutral riq-status card",
  html.includes('riq-card riq-status"'));
check("a stalled/timed-out request does not use riq-watch",
  !html.includes("riq-watch"));

console.log(failures === 0
  ? "\nALL PANEL-STATE ASSERTIONS PASSED"
  : `\n${failures} ASSERTION(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
