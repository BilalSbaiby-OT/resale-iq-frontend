/**
 * Single source of truth for the affiliate/partner programme's machine-facing
 * facts: commission terms, the two public API endpoints, and the rules list.
 *
 * WHY ONE MODULE: /affiliate.json, /partners (#terms section) and /llms.txt
 * all state the same commission numbers and the same rule list. Repeating
 * "30%, 12 months, 60-day cookie, €25 minimum" as separate string literals in
 * three files is exactly the "same rule in two places" shape
 * check-duplicate-logic.mjs exists to catch — and the thing most likely to
 * silently drift is a number, not prose. Every consumer imports from here.
 *
 * The backend (`demand-intel`, a different repo/agent) owns the actual
 * register/stats implementation; this file only describes the CONTRACT this
 * frontend was told to expect and publishes. If the backend ships with a
 * different shape, update here and every page that quotes it updates at once.
 */

export const BASE_URL = "https://resaleiq.dev"

export const AFFILIATE_COMMISSION = {
  rate: 0.3,
  months: 12,
  cookie_days: 60,
  min_payout_eur: 25,
  payout: "bank transfer",
} as const

/** "https://resaleiq.dev/?ref=CODE" — the exact format every partner link takes. */
export const AFFILIATE_LINK_FORMAT = `${BASE_URL}/?ref=CODE`

export const AFFILIATE_REGISTER_ENDPOINT = {
  method: "POST",
  url: `${BASE_URL}/api/public/affiliate/register`,
  body_schema: {
    email: "string, required",
    accept_terms: "true, required",
    kind: "'ai_agent' | 'human', required",
    name: "string, optional",
    agent_name: "string, optional — required in practice when kind is ai_agent",
    channel_url: "string, optional",
  },
  example_request: {
    email: "you@example.com",
    accept_terms: true,
    kind: "ai_agent",
    agent_name: "MyResellerBot",
  },
  example_response: {
    ref_code: "AB12CD",
    link: `${BASE_URL}/?ref=AB12CD`,
    token: "shown once — store it, it is not recoverable",
    stats_url: `${BASE_URL}/api/public/affiliate/stats?code=AB12CD&token=...`,
    terms_url: `${BASE_URL}/partners#terms`,
    commission: AFFILIATE_COMMISSION,
  },
  errors: {
    "409": "email already registered",
    "400": "bad input",
    "429": "rate-limited",
  },
} as const

export const AFFILIATE_STATS_ENDPOINT = {
  method: "GET",
  url: `${BASE_URL}/api/public/affiliate/stats`,
  query_params: {
    code: "string, required — your ref_code",
    token: "string, required — the token returned at registration",
  },
  example_response: {
    ref_code: "AB12CD",
    status: "active",
    conversions: 0,
    commission_accrued_eur: 0,
    min_payout_eur: AFFILIATE_COMMISSION.min_payout_eur,
  },
} as const

/**
 * The terms, as a flat list. Order matches the founder's approved list so a
 * diff against that source is easy. Every string here is rendered verbatim on
 * /partners (#terms) and repeated in /affiliate.json's `rules` array — same
 * array, imported twice, not retyped twice.
 */
export const AFFILIATE_RULES: string[] = [
  "The human or company operating an affiliate account (including one used by an AI agent) is responsible for that agent's behaviour.",
  "Disclose the affiliate relationship wherever the link is shared — a link with no disclosure is not allowed.",
  "No spam: no unsolicited DMs or emails, no mass or automated posting.",
  "Never post where a community's own rules forbid promotion (for example r/vinted).",
  "No fake reviews, no invented numbers, and no earnings claims that are not your own real, disclosed results.",
  "No impersonating Resale IQ.",
  "No self-referral — you cannot use your own link to earn a commission on your own account.",
  "Commission is paid only on money Stripe actually receives — 30% for 12 months per referred subscriber.",
  "Attribution runs on a 60-day first-party cookie (riq_ref).",
  "Minimum payout is €25, paid by manual bank transfer.",
  "Codes can be revoked for any of the above violations, and any unpaid commission balance is forfeited on revocation.",
]

export const AFFILIATE_CONTACT = "support@resaleiq.dev"
export const AFFILIATE_TERMS_URL = `${BASE_URL}/partners#terms`

/** Bump by hand when the terms/copy in this file change — same convention as
 *  sitemap.ts's STATIC_CONTENT_DATE: a constant that requires a human edit is
 *  exactly the point, so this can never silently drift via build time. */
export const AFFILIATE_UPDATED = "2026-09-29"

export function affiliateProgrammeJson() {
  return {
    name: "Resale IQ Affiliate Programme",
    description:
      "Refer paying Resale IQ subscribers and earn 30% recurring commission for 12 months on money Stripe actually receives. Open to people and to AI agents (or their human/company operator) — register with one API call.",
    open_to: ["human", "ai_agent"],
    commission: AFFILIATE_COMMISSION,
    cookie_days: AFFILIATE_COMMISSION.cookie_days,
    link_format: AFFILIATE_LINK_FORMAT,
    register: AFFILIATE_REGISTER_ENDPOINT,
    stats: AFFILIATE_STATS_ENDPOINT,
    rules: AFFILIATE_RULES,
    terms_url: AFFILIATE_TERMS_URL,
    contact: AFFILIATE_CONTACT,
    updated: AFFILIATE_UPDATED,
  }
}
