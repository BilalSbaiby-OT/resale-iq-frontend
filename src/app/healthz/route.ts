// Liveness probe for the Docker HEALTHCHECK (and anything Traefik derives from it).
//
// Must not call the backend, the database, or homepage SSR. On 2026-09-29 the
// HEALTHCHECK fetched "/" ; homepage SSR awaited backend fetches with no timeout,
// the analyzer stuck, and Traefik marked the only frontend unhealthy — the whole
// site 503'd. This route is the opposite of that path.
//
// force-static: the body has no request data and no I/O, so it is prerendered at
// build time and served without a server render. llms.txt must NOT use this mode
// (it bakes warehouse numbers from an unreachable backend during docker build);
// this handler has nothing to bake wrong.
export const dynamic = "force-static"

export function GET() {
  return Response.json({ ok: true })
}
