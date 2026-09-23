"use client"

/**
 * First-party funnel events. Same /api/track endpoint as pageviews.
 * Never throws. Never blocks navigation.
 */
export type FunnelEvent =
  | "landing_view"
  | "signup_started"
  | "signup_completed"
  | "first_analysis"
  | "analysis_completed"
  | "verdict_seen"
  | "watchlist_added"
  | "deal_opened"
  | "pricing_view"
  | "checkout_started"
  // A LOGGED-OUT visitor pressed a paid tier's button on the marketing pricing
  // section and was bounced to /register. `checkout_started` structurally
  // CANNOT fire for that person: pricing-section.tsx returns at the auth
  // redirect, and the only other emitters (account, paywall, register-form)
  // all sit behind a session. Measured 2026-09-06 against production: of 15
  // `checkout_started` rows ever recorded, 8 are post-signup e2e walkers, 6 are
  // /account and 1 is /dashboard — not one came from a stranger, while 8
  // distinct visitors fired `pricing_view`. Everyone who wanted to buy before
  // having an account was invisible.
  //
  // Deliberately NOT named checkout_* beyond the prefix and never merged with
  // `checkout_started`: this is intent at the paywall door, not a Stripe
  // session, and conflating the two would inflate the only number we have that
  // is supposed to mean "reached Stripe".
  | "checkout_intent_guest"
  /** Visitor clicked the above-fold checkout CTA on a blog page (C197 SSR PAYWALL strip). */
  | "checkout_from_blog"
  | "analysis_failed"
  | "register_form_focused"
  | "register_submit_attempted"
  | "register_submit_failed"
  | "switch_to_free_clicked"

/** Client-side reasons for register_submit_failed. Encoded into path so the
 *  existing /api/track sink stores them (TrackEvent has no extra column). */
export type RegisterFailReason =
  // "tos" lived here until the terms checkbox was removed. Dropped rather than
  // kept-for-decoding because there is nothing to decode: production has ZERO
  // register_submit_failed rows of any reason, ever — no row in `pageviews`
  // has a path containing "reason=" (read 2026-09-06). Which is also the
  // measured reason the checkbox was safe to remove: in the 4 non-bot submit
  // attempts on record, it blocked none of them.
  | "waiver"
  | "password_length"
  | "conflict"
  | "network"
  | "generic"

export type Attribution = {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
}

const KEY = "riq_attribution_v2"
const FIELDS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const

/**
 * v1 stored a bare `Attribution` under this key with NO timestamp, so a first
 * touch never expired and could not be aged out.
 *
 * That is not a hypothetical. On 2026-09-05 18:46:14Z someone loaded
 * `/es?utm_source=producthunt&utm_medium=listing&utm_campaign=tier1_launch`
 * once, to eyeball the ProductHunt listing link. v1 wrote that tag to
 * localStorage permanently, and it was then stamped onto 53 pageviews across
 * 11 visitor hashes over the following 8 hours — /admin, /dashboard, /panel,
 * internal QA traffic, all of it reported as ProductHunt acquisition. The
 * campaign has never had a single real click; `producthunt` has never once
 * appeared as a referrer host.
 *
 * So v2 is a new key and v1 is deleted rather than migrated. Migrating would
 * carry the poisoned rows forward, and the honest cost is tiny: production has
 * exactly one genuine UTM-attributed visitor in the last seven days.
 */
const LEGACY_KEY = "riq_attribution"

/**
 * A first touch is worth crediting for 30 days. Past that, "they saw a reel
 * last spring" is not why they came back today, and an unbounded window turns
 * one stale tag into permanent misattribution (see LEGACY_KEY above).
 */
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000

type StoredAttribution = { at: number; a: Attribution }

/**
 * Marks attribution we DERIVED from `document.referrer` rather than read from a
 * tagged link, so the two can be told apart in SQL (`where utm_term='referrer'`)
 * and a derived channel is never mistaken for a click on a campaign we built.
 *
 * `utm_term` is the carrier because it is the one attribution column the
 * pageviews table already has that nothing writes and nothing reads — verified
 * against production 2026-09-06. Using it needs no backend change, which
 * matters because the ingest side (api/routes.py:3682-3719) is a separate repo
 * and a separate deploy.
 */
export const DERIVED_MARKER = "referrer"

/**
 * Hosts that tell us something about the channel, most specific first.
 *
 * Order is load-bearing: `gemini.google.com` has to be matched as an LLM before
 * the generic `google.` search rule claims it, and `l.instagram.com` before any
 * broader instagram rule.
 *
 * `medium` follows the meaning of the channel, not the shape of the host:
 * social / organic / llm / email. Anything unrecognised is still kept as a
 * `referral` under its bare host — a referrer we have not seen before is
 * information, and dropping it into `(null)` is how we ended up unable to tell
 * "nobody came" apart from "we did not look".
 */
const REFERRER_CHANNELS: ReadonlyArray<{ hosts: readonly string[]; source: string; medium: string }> = [
  // LLM answer engines. These now out-refer every social platform we post to:
  // chatgpt.com has sent 30 pageviews and perplexity.ai 6, against ONE t.co
  // click ever and zero from tiktok.com (production, all time, 2026-09-06).
  { hosts: ["chatgpt.com", "chat.openai.com"], source: "chatgpt", medium: "llm" },
  { hosts: ["perplexity.ai"], source: "perplexity", medium: "llm" },
  { hosts: ["claude.ai"], source: "claude", medium: "llm" },
  { hosts: ["gemini.google.com"], source: "gemini", medium: "llm" },
  { hosts: ["copilot.microsoft.com"], source: "copilot", medium: "llm" },
  // Social. t.co is X's link wrapper and is the ONLY host an X click can
  // arrive as — x.com itself is almost never sent, which is why an X post that
  // loses its utm_content (Postiz strips it on live tweets, STATE.md) was
  // previously unattributable in both directions at once.
  { hosts: ["t.co", "x.com", "twitter.com"], source: "x", medium: "social" },
  { hosts: ["tiktok.com"], source: "tiktok", medium: "social" },
  { hosts: ["instagram.com"], source: "instagram", medium: "social" },
  { hosts: ["facebook.com", "fb.me"], source: "facebook", medium: "social" },
  { hosts: ["reddit.com", "redd.it", "com.reddit.frontpage"], source: "reddit", medium: "social" },
  { hosts: ["linkedin.com", "lnkd.in"], source: "linkedin", medium: "social" },
  { hosts: ["youtube.com", "youtu.be"], source: "youtube", medium: "social" },
  { hosts: ["pinterest.com", "pin.it"], source: "pinterest", medium: "social" },
  // Mail clients, and they MUST sit above Search. A click out of an email is
  // not "direct" — but `com.google.android.gm` (the Gmail Android app, 29
  // referrals) and `mail.google.com` both contain ".google.", so the `google.`
  // country-TLD rule below matched them first and every click out of our own
  // lifecycle email was recorded as organic search. That is the worst possible
  // direction for the error to run in: it reports email we sent as SEO we
  // earned. Caught 2026-09-06 by the server-side port of this table
  // (demand-intel/engine/attribution.py), which has the same ordering.
  { hosts: ["com.google.android.gm", "mail.google.com", "outlook.live.com", "outlook.office.com", "mail.yahoo.com"], source: "email", medium: "email" },
  // Search.
  { hosts: ["google.com", "google."], source: "google", medium: "organic" },
  { hosts: ["bing.com"], source: "bing", medium: "organic" },
  { hosts: ["duckduckgo.com"], source: "duckduckgo", medium: "organic" },
  { hosts: ["search.brave.com"], source: "brave", medium: "organic" },
  { hosts: ["ecosia.org"], source: "ecosia", medium: "organic" },
  { hosts: ["search.yahoo.com"], source: "yahoo", medium: "organic" },
  { hosts: ["yandex."], source: "yandex", medium: "organic" },
  { hosts: ["baidu.com"], source: "baidu", medium: "organic" },
]

function hostMatches(host: string, pattern: string): boolean {
  // "google." is a prefix pattern for the country TLDs (google.es, google.co.uk);
  // everything else is an exact host or a subdomain of it.
  if (pattern.endsWith(".")) return host === pattern.slice(0, -1) || host.startsWith(pattern) || host.includes("." + pattern)
  return host === pattern || host.endsWith("." + pattern)
}

/**
 * Channel for a referring URL, or `null` when there is nothing to attribute.
 *
 * Pure and exported for the tests — it takes the referrer and the current host
 * rather than reading globals, because the same-origin case is the one that
 * matters most and is the easiest to get wrong.
 *
 * Returns null for: no referrer (a direct/typed visit, which is real and must
 * not be invented into a channel), a same-site referrer (this is a Next SPA —
 * `document.referrer` is fixed at document load and does not change on client
 * navigation, so a same-site value only ever means a full reload within our own
 * site), and anything unparseable.
 */
export function channelFromReferrer(
  referrer: string | undefined,
  currentHost: string | undefined,
): { utm_source: string; utm_medium: string } | null {
  if (!referrer) return null
  let host: string
  try {
    host = new URL(referrer).hostname.toLowerCase()
  } catch {
    return null
  }
  if (!host) return null

  const self = (currentHost || "").toLowerCase().replace(/^www\./, "")
  const bare = host.replace(/^www\./, "")
  if (self && (bare === self || bare.endsWith("." + self))) return null

  for (const c of REFERRER_CHANNELS) {
    if (c.hosts.some((h) => hostMatches(host, h))) {
      return { utm_source: c.source, utm_medium: c.medium }
    }
  }
  // Unknown but external. Keep the host — see the comment on REFERRER_CHANNELS.
  return { utm_source: bare.slice(0, 120), utm_medium: "referral" }
}

function readStored(): Attribution | null {
  const raw = window.localStorage.getItem(KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as StoredAttribution
    if (!parsed || typeof parsed.at !== "number" || !parsed.a) return null
    if (Date.now() - parsed.at > MAX_AGE_MS) {
      window.localStorage.removeItem(KEY)
      return null
    }
    return parsed.a
  } catch {
    return null
  }
}

/**
 * FIRST TOUCH WINS, for 30 days.
 *
 * If someone arrives from a reel, bookmarks the site, and signs up three days
 * later from a direct visit, the reel earned that user. Overwriting on the last
 * visit would credit "direct" for everything and quietly make the whole
 * attribution loop useless — every piece of content would look worthless.
 *
 * So we store the first attribution we see and do not overwrite it while it is
 * fresh. Two things feed it, in strict order of trust:
 *
 *   1. UTM parameters on the URL — a link we tagged ourselves.
 *   2. `document.referrer` — the channel the browser tells us, used ONLY when
 *      there is no UTM at all.
 *
 * (2) exists because (1) is not reliable on the platforms we actually post to.
 * X/Postiz strips `utm_content` from live tweets, so a correctly tagged link
 * arrives bare; a bare arrival used to be recorded as `(null)` and became
 * indistinguishable from someone typing the domain. Production, 2026-09-06:
 * 367 non-bot rows, 1 with a referrer host, and every social platform we
 * publish to reporting thousands of impressions. We could not tell whether
 * that meant nobody clicked or we failed to look. Now we can.
 *
 * UTM always wins when present, and never blends: a tagged link keeps its own
 * medium rather than being overwritten by whatever host referred it.
 */
export function captureAttribution(): Attribution {
  if (typeof window === "undefined") return {}
  try {
    // Retire v1 unconditionally, including for browsers that never revisit a
    // tagged link — otherwise the poisoned tag simply sits there.
    window.localStorage.removeItem(LEGACY_KEY)

    const existing = readStored()
    if (existing) return existing

    const params = new URLSearchParams(window.location.search)
    const found: Attribution = {}
    for (const f of FIELDS) {
      const v = params.get(f)
      // Cap length: these are our own campaign slugs, not user input, but the
      // column is bounded and a junk querystring should not reach the database.
      if (v) found[f] = v.slice(0, 120)
    }

    // Bridge the internal `?src=` convention to attribution. Internal money-page
    // links (blog→/pricing, nav→/pricing, footer, /data, /flip, the content
    // register CTAs) have carried `?src=blog|nav|data|…` for a while — but only
    // onto the pageview PATH, never into utm_content, which is the one field the
    // funnel endpoint and attribution.py bucket a SIGNUP by. So a dark-social or
    // typed-in reader who found value on a post and signed up was filed as
    // `(none)`: 376/394 visitors and all 7 signups (2026-09-11). This is the 95%
    // unattributed gap, and it is a client tagging gap, not a server one —
    // register() already forwards getAttribution() untouched.
    //
    // `src` fills utm_content ONLY when a tagged utm_content is absent (a real
    // campaign link always wins) and ONLY as first touch (readStored above
    // returns early, so an external channel like chatgpt.com is never overwritten
    // by an internal hop). utm_medium is stamped `internal` so an internal-link
    // touch is never miscounted as an external acquisition in by-channel reports.
    if (!found.utm_content) {
      const src = params.get("src")
      if (src) {
        found.utm_content = src.slice(0, 120)
        if (!found.utm_source) found.utm_source = "internal"
        if (!found.utm_medium) found.utm_medium = "internal"
      }
    }

    if (!Object.keys(found).length) {
      const derived = channelFromReferrer(
        typeof document === "undefined" ? "" : document.referrer,
        window.location.hostname,
      )
      if (!derived) return {}
      found.utm_source = derived.utm_source
      found.utm_medium = derived.utm_medium
      found.utm_term = DERIVED_MARKER
    }

    const payload: StoredAttribution = { at: Date.now(), a: found }
    window.localStorage.setItem(KEY, JSON.stringify(payload))
    return found
  } catch {
    // Private mode, disabled storage, quota. Attribution is never worth an error.
    return {}
  }
}

const LANDING_PATH_KEY = "riq_landing_path"

/**
 * FIRST TOUCH WINS, same rule as captureAttribution above — the first page of
 * the session is the one that earned the visit, not whatever page they
 * happen to be on when they finally register.
 */
export function captureLandingPath(): void {
  if (typeof window === "undefined") return
  try {
    if (window.localStorage.getItem(LANDING_PATH_KEY)) return
    window.localStorage.setItem(LANDING_PATH_KEY, window.location.pathname.slice(0, 300))
  } catch {
    // Private mode, disabled storage, quota. Attribution is never worth an error.
  }
}

/** The first page this visitor's session landed on, if we captured one. */
export function getLandingPath(): string | undefined {
  if (typeof window === "undefined") return undefined
  try {
    return window.localStorage.getItem(LANDING_PATH_KEY) || undefined
  } catch {
    return undefined
  }
}

/** What we know about where this visitor came from. Expiry applies here too —
 *  a reader must never see a first touch that `captureAttribution` would have
 *  aged out, or the signup form and the pageview would disagree. */
export function getAttribution(): Attribution {
  if (typeof window === "undefined") return {}
  try {
    return readStored() || {}
  } catch {
    return {}
  }
}

function send(body: Record<string, unknown>) {
  if (typeof window === "undefined") return
  try {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => {})
  } catch {
    /* analytics must never break the page */
  }
}

export function trackEvent(
  event: FunnelEvent,
  path?: string,
  extra?: { reason?: RegisterFailReason },
) {
  if (typeof window === "undefined") return
  let outPath = path || window.location.pathname || "/"
  // reason is stored on path, not as a body field: the track sink's Pydantic
  // model only persists event/path/utm_*, and extra JSON keys are dropped.
  if (extra?.reason) {
    const join = outPath.includes("?") ? "&" : "?"
    outPath = `${outPath}${join}reason=${extra.reason}`
  }
  send({
    path: outPath,
    referrer: document.referrer || "",
    event,
    ...captureAttribution(),
  })
}

export function trackPageview(path: string) {
  send({
    path,
    referrer: typeof document !== "undefined" ? document.referrer : "",
    ...captureAttribution(),
  })
}
