import { affiliateProgrammeJson } from "@/lib/affiliate-programme"

/**
 * /affiliate.json — machine-readable description of the affiliate/partner
 * programme, so a compliant AI agent (or a script written by one) can read
 * the terms and the two API contracts without parsing the HTML on /partners.
 *
 * force-static: every field here is a constant from affiliate-programme.ts —
 * no warehouse call, no per-request data — so this can be prerendered once at
 * build time and served from cache, matching healthz/route.ts's reasoning
 * (nothing here can be wrong by being baked at build time, unlike llms.txt's
 * live market numbers).
 */
export const dynamic = "force-static"

export async function GET() {
  return Response.json(affiliateProgrammeJson(), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=3600",
    },
  })
}
