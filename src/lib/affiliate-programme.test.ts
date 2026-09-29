/**
 * Affiliate/partner programme — machine-readable surfaces.
 *
 * /affiliate.json shape, robots.ts Allow rules for the affiliate paths, and
 * the llms.txt affiliate section. Source-reads the route/lib files (same
 * pattern as webmcp-tools.test.ts and seo-models.test.ts) rather than
 * spinning up a server, since these are static-source assertions the same
 * way the rest of this suite works.
 */
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { test } from "node:test"
import assert from "node:assert/strict"
import {
  AFFILIATE_COMMISSION,
  AFFILIATE_LINK_FORMAT,
  AFFILIATE_RULES,
  affiliateProgrammeJson,
} from "./affiliate-programme.ts"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")

function read(rel: string): string {
  return readFileSync(join(root, rel), "utf8")
}

test("affiliateProgrammeJson has the founder-approved commission terms", () => {
  const j = affiliateProgrammeJson()
  assert.equal(j.commission.rate, 0.3)
  assert.equal(j.commission.months, 12)
  assert.equal(j.commission.cookie_days, 60)
  assert.equal(j.commission.min_payout_eur, 25)
  assert.equal(j.commission.payout, "bank transfer")
  assert.equal(j.link_format, "https://resaleiq.dev/?ref=CODE")
  assert.equal(j.contact, "support@resaleiq.dev")
  assert.match(j.terms_url, /\/partners#terms$/)
})

test("affiliateProgrammeJson describes both API endpoints with method, url and schema", () => {
  const j = affiliateProgrammeJson()
  assert.equal(j.register.method, "POST")
  assert.equal(j.register.url, "https://resaleiq.dev/api/public/affiliate/register")
  assert.ok(j.register.body_schema.email)
  assert.ok(j.register.body_schema.accept_terms)
  assert.ok(j.register.body_schema.kind)
  assert.ok(j.register.example_response.ref_code)
  assert.ok(j.register.example_response.link)
  assert.ok(j.register.example_response.token)
  assert.ok(j.register.example_response.stats_url)
  assert.equal(j.stats.method, "GET")
  assert.equal(j.stats.url, "https://resaleiq.dev/api/public/affiliate/stats")
  assert.ok(j.stats.query_params.code)
  assert.ok(j.stats.query_params.token)
})

test("affiliateProgrammeJson rules cover every founder-approved constraint", () => {
  const j = affiliateProgrammeJson()
  const joined = j.rules.join(" ")
  assert.match(joined, /responsible for that agent's behaviour/)
  assert.match(joined, /Disclose the affiliate relationship/)
  assert.match(joined, /No spam/)
  assert.match(joined, /unsolicited DMs or emails/)
  assert.match(joined, /mass or automated posting/)
  assert.match(joined, /r\/vinted/)
  assert.match(joined, /No fake reviews/)
  assert.match(joined, /invented numbers/)
  assert.match(joined, /impersonating Resale IQ/)
  assert.match(joined, /self-referral/)
  assert.match(joined, /revoked/)
  assert.match(joined, /forfeited/)
  assert.doesNotMatch(joined, /first ever/i)
})

test("/affiliate.json route serves the shared programme description, cacheable and static", () => {
  const src = read("app/affiliate.json/route.ts")
  assert.match(src, /affiliateProgrammeJson/)
  assert.match(src, /dynamic = "force-static"/)
  assert.match(src, /application\/json/)
  assert.match(src, /cache-control.*public, max-age=3600/)
})

test("/partners links to the JSON sibling and has #ai-agents and #terms sections", () => {
  const src = read("app/partners/page.tsx")
  assert.match(src, /types: \{ "application\/json": \[\{ url: "\/affiliate\.json" \}\] \}/)
  assert.match(src, /id="ai-agents"/)
  assert.match(src, /id="terms"/)
  assert.match(src, /AiAgentRegisterForm/)
  assert.match(src, /AFFILIATE_REGISTER_ENDPOINT\.url/)
  assert.match(src, /AFFILIATE_STATS_ENDPOINT\.url/)
  assert.match(src, /AFFILIATE_RULES\.map/)
  assert.doesNotMatch(src, /first ever/i)
  // robots: index:true and the sitemap listing must both stay, per the
  // founder's explicit constraint.
  assert.match(src, /robots: \{ index: true, follow: true \}/)
  const sitemap = read("app/sitemap.ts")
  assert.match(sitemap, /"\/partners"/)
})

test("/en/partners is a literal redirect to /partners, not a widened PATH_LOCALES", () => {
  const src = read("app/en/partners/page.tsx")
  assert.match(src, /redirect\("\/partners"\)/)
  const routes = read("lib/locale-routes.ts")
  const arrayMatch = routes.match(/export const PATH_LOCALES = \[([^\]]*)\]/)
  assert.ok(arrayMatch, "could not find PATH_LOCALES array")
  assert.doesNotMatch(arrayMatch[1], /"en"/)
})

test("robots.ts allows the affiliate API path, /affiliate.json and /partners in every user-agent group", () => {
  const src = read("app/robots.ts")
  assert.match(src, /"\/partners"/)
  assert.match(src, /"\/affiliate\.json"/)
  assert.match(src, /"\/api\/public\/affiliate\/"/)
  // These must live in PUBLIC_ALLOW, which every rule (userAgent: "*" and
  // every AI_BOTS entry) shares — not a one-off rule for a single UA.
  const allowStart = src.indexOf("const PUBLIC_ALLOW")
  const allowEnd = src.indexOf("const PRIVATE_DISALLOW")
  const allowBlock = src.slice(allowStart, allowEnd)
  assert.match(allowBlock, /"\/partners"/)
  assert.match(allowBlock, /"\/affiliate\.json"/)
  assert.match(allowBlock, /"\/api\/public\/affiliate\/"/)
  assert.match(src, /rules: \[\s*\{ userAgent: "\*", allow: PUBLIC_ALLOW/)
  assert.match(src, /AI_BOTS\.map\(\(ua\) => \(\{ userAgent: ua, allow: PUBLIC_ALLOW/)
})

test("public/llms.txt (the file actually served — public files win over route.ts) has the affiliate section near the top", () => {
  // Confirmed live 2026-09-29: Next.js serves public/llms.txt over
  // src/app/llms.txt/route.ts when both exist at the same path (`npm run
  // start` + curl reproduces the exact "AI Assistant Index" header the
  // production site returns; `next dev` even logs "A conflicting public
  // file and page file was found for path /llms.txt"). The route.ts file is
  // updated too (other tests in this file assert on it) in case the public
  // file is ever removed, but public/llms.txt is what a crawler actually
  // reads today.
  const src = read("../public/llms.txt")
  assert.match(src, /## Affiliate programme \(open to people and AI agents\)/)
  assert.match(src, /30% recurring commission for 12 months/)
  assert.match(src, /60-day first-party cookie/)
  assert.match(src, /€25 minimum payout/)
  assert.match(src, /api\/public\/affiliate\/register/)
  assert.match(src, /api\/public\/affiliate\/stats/)
  assert.match(src, /https:\/\/resaleiq\.dev\/affiliate\.json/)
  assert.match(src, /https:\/\/resaleiq\.dev\/partners/)
  const affIdx = src.indexOf("## Affiliate programme")
  const whatIdx = src.indexOf("## What is Resale IQ?")
  assert.ok(affIdx >= 0 && whatIdx > affIdx, "affiliate section must be near the top")
})

test("llms.txt has the affiliate section near the top with the register call and links", () => {
  const src = read("app/llms.txt/route.ts")
  assert.match(src, /## Affiliate programme \(open to people and AI agents\)/)
  assert.match(src, /30% recurring commission for 12 months/)
  assert.match(src, /60-day first-party cookie/)
  assert.match(src, /€25 minimum payout/)
  assert.match(src, /AFFILIATE_REGISTER_ENDPOINT\.url/)
  assert.match(src, /AFFILIATE_STATS_ENDPOINT\.url/)
  assert.match(src, /\$\{BASE\}\/affiliate\.json/)
  assert.match(src, /\$\{BASE\}\/partners/)
  // Section must appear before "## For agents" (near the top, per spec).
  const affIdx = src.indexOf("## Affiliate programme")
  const agentsIdx = src.indexOf("## For agents")
  assert.ok(affIdx >= 0 && agentsIdx > affIdx, "affiliate section must precede ## For agents")
})

test("footer links to /partners on homepage, /pricing and /blog", () => {
  const landing = read("components/landing/landing-content.tsx")
  assert.match(landing, /<Link href="\/partners"/)
  const pricing = read("app/pricing/page.tsx")
  assert.match(pricing, /<Link href="\/partners"/)
  const blog = read("app/blog/page.tsx")
  assert.match(blog, /<Link href="\/partners"/)
})

test("AFFILIATE_LINK_FORMAT and rules constants match the founder-approved terms exactly", () => {
  assert.equal(AFFILIATE_COMMISSION.rate, 0.3)
  assert.equal(AFFILIATE_LINK_FORMAT, "https://resaleiq.dev/?ref=CODE")
  assert.ok(AFFILIATE_RULES.length >= 10)
})
