/**
 * Pins the two attribution defects measured against production on 2026-09-06,
 * so neither can come back silently.
 *
 * Run: npm run test:unit  (node --test, native TS type-stripping — no runner
 * dependency, same as entitlement.test.ts and str-pct.test.ts).
 *
 * 1. A bare arrival was recorded as `(null)`. 367 non-bot pageviews that day,
 *    exactly ONE carrying a referrer host, while the platforms we publish to
 *    reported 4,047 TikTok views and 46 on X. `captureAttribution` read UTM
 *    parameters and nothing else, so a link that lost its tags in transit
 *    (Postiz strips utm_content from live tweets) became indistinguishable
 *    from someone typing the domain — and we could not tell "nobody clicked"
 *    apart from "we failed to look".
 *
 * 2. A first touch never expired. One internal load of
 *    /es?utm_source=producthunt&utm_campaign=tier1_launch at 18:46:14Z stamped
 *    that campaign onto 53 later pageviews across 11 visitor hashes, including
 *    /admin. `producthunt` has never appeared as a referrer host; the campaign
 *    had zero real clicks and was reported as acquisition.
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { channelFromReferrer, captureAttribution, getAttribution, DERIVED_MARKER } from "./analytics.ts"

/** Minimal localStorage. Not a mock of a library — the real one is the thing
 *  under test here, so it has to behave (persist, throw nothing, be clearable). */
function fakeStorage() {
  const m = new Map<string, string>()
  return {
    getItem: (k: string) => (m.has(k) ? m.get(k)! : null),
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
    clear: () => m.clear(),
    _map: m,
  }
}

type Env = { search?: string; referrer?: string; host?: string }

/** Installs window/document for one case and returns the storage so a test can
 *  inspect exactly what was persisted. */
function withEnv({ search = "", referrer = "", host = "resaleiq.dev" }: Env) {
  const storage = fakeStorage()
  const g = globalThis as unknown as Record<string, unknown>
  g.window = { localStorage: storage, location: { search, hostname: host, pathname: "/" } }
  g.document = { referrer }
  return storage
}

function clearEnv() {
  const g = globalThis as unknown as Record<string, unknown>
  delete g.window
  delete g.document
}

// ---------------------------------------------------------------------------
// channelFromReferrer — the pure half
// ---------------------------------------------------------------------------

test("a t.co click is X, not (null) — the only host an X click ever arrives as", () => {
  assert.deepEqual(channelFromReferrer("https://t.co/abc123", "resaleiq.dev"), {
    utm_source: "x",
    utm_medium: "social",
  })
})

test("the platforms we publish to each resolve to their own channel", () => {
  const cases: Array<[string, string, string]> = [
    ["https://www.tiktok.com/@someone/video/1", "tiktok", "social"],
    ["https://l.instagram.com/?u=https%3A%2F%2Fresaleiq.dev", "instagram", "social"],
    ["https://m.facebook.com/", "facebook", "social"],
    ["https://www.reddit.com/r/flipping/comments/x", "reddit", "social"],
    ["https://x.com/i/status/1", "x", "social"],
    ["https://twitter.com/i/status/1", "x", "social"],
  ]
  for (const [url, source, medium] of cases) {
    assert.deepEqual(channelFromReferrer(url, "resaleiq.dev"), { utm_source: source, utm_medium: medium }, url)
  }
})

test("answer engines are their own medium, and gemini is an LLM before it is a google", () => {
  // Ordering regression: a generic google. rule placed above the LLM block
  // would swallow gemini.google.com and report it as organic search.
  assert.deepEqual(channelFromReferrer("https://gemini.google.com/app", "resaleiq.dev"), {
    utm_source: "gemini",
    utm_medium: "llm",
  })
  assert.deepEqual(channelFromReferrer("https://chatgpt.com/c/1", "resaleiq.dev"), {
    utm_source: "chatgpt",
    utm_medium: "llm",
  })
  assert.deepEqual(channelFromReferrer("https://www.perplexity.ai/search/x", "resaleiq.dev"), {
    utm_source: "perplexity",
    utm_medium: "llm",
  })
  // ...while a plain google search still is one, including country TLDs.
  assert.deepEqual(channelFromReferrer("https://www.google.es/", "resaleiq.dev"), {
    utm_source: "google",
    utm_medium: "organic",
  })
})

test("a click out of an email is email, not organic search", () => {
  // Same ordering defect as gemini above, one block lower down, and it ran the
  // wrong way for four weeks: "com.google.android.gm" and "mail.google.com"
  // both contain ".google.", so the country-TLD rule claimed them and every
  // click out of our own lifecycle email was booked as SEO we had earned.
  // The Gmail Android app alone had sent 29 by 2026-09-06.
  assert.deepEqual(channelFromReferrer("android-app://com.google.android.gm/", "resaleiq.dev"), {
    utm_source: "email",
    utm_medium: "email",
  })
  assert.deepEqual(channelFromReferrer("https://mail.google.com/mail/u/0/", "resaleiq.dev"), {
    utm_source: "email",
    utm_medium: "email",
  })
})

test("a same-site referrer is never a channel", () => {
  // This is a Next SPA: document.referrer is fixed at document load, so a
  // same-site value only means a full reload inside our own site. Treating it
  // as acquisition would manufacture a channel out of internal navigation —
  // which is precisely the failure mode that produced the producthunt rows.
  assert.equal(channelFromReferrer("https://resaleiq.dev/pricing", "resaleiq.dev"), null)
  assert.equal(channelFromReferrer("https://www.resaleiq.dev/pricing", "resaleiq.dev"), null)
  assert.equal(channelFromReferrer("https://resaleiq.dev/es", "www.resaleiq.dev"), null)
})

test("no referrer stays direct — a real direct visit is not invented into a channel", () => {
  assert.equal(channelFromReferrer("", "resaleiq.dev"), null)
  assert.equal(channelFromReferrer(undefined, "resaleiq.dev"), null)
  assert.equal(channelFromReferrer("not a url", "resaleiq.dev"), null)
})

test("an unrecognised external referrer keeps its host instead of becoming (null)", () => {
  assert.deepEqual(channelFromReferrer("https://www.vinted.es/items/1", "resaleiq.dev"), {
    utm_source: "vinted.es",
    utm_medium: "referral",
  })
})

// ---------------------------------------------------------------------------
// captureAttribution — storage, precedence, expiry
// ---------------------------------------------------------------------------

test("a tagged link still wins outright, and is not marked as derived", () => {
  withEnv({
    search: "?utm_source=tiktok&utm_medium=bio&utm_campaign=sept&utm_content=r191",
    referrer: "https://t.co/abc",
  })
  const a = captureAttribution()
  assert.equal(a.utm_source, "tiktok")
  // The tagged medium survives; the t.co referrer does NOT overwrite it.
  assert.equal(a.utm_medium, "bio")
  assert.equal(a.utm_campaign, "sept")
  assert.equal(a.utm_content, "r191")
  assert.equal(a.utm_term, undefined, "a tagged link must not carry the derived marker")
  clearEnv()
})

test("a bare arrival from a real channel is attributed, and marked derived", () => {
  withEnv({ search: "", referrer: "https://t.co/abc123" })
  const a = captureAttribution()
  assert.equal(a.utm_source, "x")
  assert.equal(a.utm_medium, "social")
  // Auditable in SQL as `where utm_term='referrer'`, so a derived channel can
  // never be read as a click on a campaign we actually tagged.
  assert.equal(a.utm_term, DERIVED_MARKER)
  clearEnv()
})

test("first touch wins: a later direct visit does not overwrite the reel that earned it", () => {
  const s = withEnv({ search: "", referrer: "https://www.tiktok.com/@x/video/1" })
  assert.equal(captureAttribution().utm_source, "tiktok")

  // Same browser, later, arriving direct.
  const g = globalThis as unknown as Record<string, unknown>
  g.window = { localStorage: s, location: { search: "", hostname: "resaleiq.dev", pathname: "/" } }
  g.document = { referrer: "" }
  assert.equal(captureAttribution().utm_source, "tiktok")
  assert.equal(getAttribution().utm_source, "tiktok")
  clearEnv()
})

test("a first touch older than 30 days is dropped, not credited forever", () => {
  const s = withEnv({ search: "", referrer: "" })
  const thirtyOneDays = 31 * 24 * 60 * 60 * 1000
  s.setItem(
    "riq_attribution_v2",
    JSON.stringify({ at: Date.now() - thirtyOneDays, a: { utm_source: "producthunt", utm_campaign: "tier1_launch" } }),
  )
  assert.deepEqual(captureAttribution(), {}, "an expired first touch must not be reported")
  assert.deepEqual(getAttribution(), {}, "readers must age it out too, or they disagree with the writer")
  assert.equal(s.getItem("riq_attribution_v2"), null, "and it must be cleared, not just hidden")
  clearEnv()
})

test("the v1 key is deleted on sight — this is the producthunt fix", () => {
  const s = withEnv({ search: "", referrer: "" })
  // Exactly what one internal load of the ProductHunt listing link left behind,
  // in the shape v1 wrote it: flat, and with no timestamp to expire.
  s.setItem(
    "riq_attribution",
    JSON.stringify({ utm_source: "producthunt", utm_medium: "listing", utm_campaign: "tier1_launch" }),
  )
  const a = captureAttribution()
  assert.equal(a.utm_source, undefined, "a v1 tag must not be migrated forward")
  assert.equal(s.getItem("riq_attribution"), null, "and the v1 key must be removed outright")
  clearEnv()
})

test("a malformed stored value degrades to no attribution rather than throwing", () => {
  const s = withEnv({ search: "", referrer: "https://t.co/abc" })
  s.setItem("riq_attribution_v2", "{not json")
  // Falls through to a fresh capture instead of exploding on the page.
  assert.equal(captureAttribution().utm_source, "x")
  clearEnv()
})

test("storage that throws never breaks the page", () => {
  const g = globalThis as unknown as Record<string, unknown>
  g.window = {
    localStorage: {
      getItem() { throw new Error("private mode") },
      setItem() { throw new Error("private mode") },
      removeItem() { throw new Error("private mode") },
    },
    location: { search: "?utm_source=x", hostname: "resaleiq.dev", pathname: "/" },
  }
  g.document = { referrer: "" }
  assert.deepEqual(captureAttribution(), {})
  assert.deepEqual(getAttribution(), {})
  clearEnv()
})
