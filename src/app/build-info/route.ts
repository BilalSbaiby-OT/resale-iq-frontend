import { NextResponse } from "next/server"

// /build-info — which commit is actually serving this site.
//
// WHY THIS EXISTS
// The Deploy workflow used to prove a deploy by fingerprinting the chunk
// filenames on the live homepage and waiting for that hash to change. That is
// strictly better than polling for HTTP 200 — a never-replaced container
// answers 200 perfectly well — but it still cannot answer the only question
// that matters: is the commit I just pushed the commit that is running?
//
// A fingerprint change proves *a* new build is live. It does not prove it is
// *yours*. Two pushes a minute apart, a concurrent deploy, or someone else's
// redeploy all move the hash. And a build that fails leaves the hash unchanged,
// which is indistinguishable from a redeploy of an identical commit — so the
// old workflow logged a warning and exited 0 either way.
//
// The backend hit exactly this on 2026-09-02: deployments 427 and 430 both
// died, the previous container kept answering 200, and the smoke test passed
// twice. It was fixed by GET /api/version returning SOURCE_COMMIT and the
// Deploy job asserting the served sha equals the pushed sha (demand-intel
// ee7681c). That commit's own message notes the frontend still had the same
// blindness. This is the frontend half.
//
// WHERE THE VALUE COMES FROM
// Coolify injects SOURCE_COMMIT at deploy time. Verified on production
// 2026-09-03: `docker exec <frontend> printenv SOURCE_COMMIT` returned
// dba522446f5c29b2d38309d03624a7572ee0534d, matching both the container's
// image tag and origin/main. Reading it here therefore cannot succeed until
// the container actually carrying that build is the one answering — which is
// the whole point, and is why this is a runtime read and not a value baked
// into the client bundle.
//
// force-dynamic and no-store are load-bearing. A cached or statically
// prerendered response would keep serving the PREVIOUS deploy's sha and turn
// this endpoint into a slower version of the bug it replaces.
//
// Not a secret and not authenticated: it is one commit sha of a public repo,
// and a deploy claim has to be checkable from outside the deploy.
// Returns commit: null when the variable is absent rather than guessing or
// falling back to a placeholder, so "missing" can never be read as "match".

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  const commit = (process.env.SOURCE_COMMIT ?? "").trim() || null

  return NextResponse.json(
    { commit, short: commit ? commit.slice(0, 7) : null },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    },
  )
}
