// /deploy-id — proves which FRONTEND commit is actually running, for the
// Deploy workflow to assert against.
//
// Why this exists: the Deploy workflow fingerprinted Next.js's client chunk
// hashes to prove a new build shipped. That is blind to any server-only
// change (middleware, rewrites, route handlers, env vars) — those don't move
// a single client chunk hash, so the check reports the same "unchanged"
// result whether the deploy shipped or silently failed. Run 33746779363
// hit exactly this on a next.config.ts rewrite change: 16m runtime, exited on
// its own "Bundle unchanged after 15 min" warning, and the deploy had in fact
// shipped (confirmed by SSH, not by CI).
//
// SOURCE_COMMIT is not something this app sets — Coolify injects it into the
// running container automatically from the commit it built. Confirmed live:
// `docker exec <frontend container> env` carries SOURCE_COMMIT equal to
// origin/main's HEAD. This route just surfaces it over HTTP, mirroring how
// the backend already exposes its own build identity at /api/version.
//
// Deliberately NOT under /api, /auth, /stripe or /admin — next.config.ts
// rewrites all four of those straight to the FastAPI backend, so a route
// there would never reach this file.
export const dynamic = "force-dynamic"

export async function GET() {
  const commit = process.env.SOURCE_COMMIT || null
  return Response.json(
    { commit, short: commit ? commit.slice(0, 7) : null },
    { headers: { "cache-control": "no-store" } },
  )
}
