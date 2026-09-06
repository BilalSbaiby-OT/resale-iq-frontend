import { getHeroVerdict } from "@/lib/hero-verdict"
import { VerdictContent } from "./verdict-content"

/**
 * THE FIRST SCREEN A VERIFIED ACCOUNT LANDS ON — AND WHY IT IS A SERVER
 * COMPONENT NOW.
 *
 * verify-email-content.tsx does `router.replace("/verdict")`, so this page IS
 * the product for someone who has just confirmed their address. Until today it
 * greeted them with an empty input box.
 *
 * That is not a hunch. Production, read-only, 2026-09-06:
 *
 *   genuine users (is_internal=0)          7   — ids 68,69,70,79,81,95,112
 *   their verdict_logs counts              0,0,0,0,0,3,4
 *   users who ever spent an unlock         0
 *   users who ever hit the 10/day cap      0
 *
 * Five of seven registered accounts never ran a single check. Nobody has ever
 * touched an entitlement limit, so the funnel is not dying at the paywall or
 * at any cap — it dies before the first query, on this screen. Somebody who
 * has never used the product does not know what to type, and an empty box asks
 * them to guess.
 *
 * SO THE SCREEN NOW ARRIVES WITH A WORKED ANSWER ON IT. Same mechanism the
 * landing page already uses (src/lib/hero-verdict.ts): one server-side fetch,
 * disk last-good, 30-minute freshness, at most ~48 backend calls a day for the
 * whole site. Read that file before changing the seed — the SKU is chosen from
 * an enumeration of the board, not from whichever query flatters us.
 *
 * WHAT THIS DELIBERATELY DOES NOT DO, and it is the important part:
 *
 *  - It does NOT run a check as the visitor. No call carries their token, so
 *    no `verdict_logs` row is written for them and none of their 10 daily
 *    verdicts is spent. Auto-running one would have made every new account
 *    look activated in the one metric that defines activation
 *    (OPERATING-RULES §1: "a registered user who ran a real sourcing analysis")
 *    — a number this company reads to decide strategy. Seeding the screen is a
 *    product change; seeding the metric would be falsifying the scoreboard.
 *  - It does NOT change a single entitlement. FREE_VERDICT_DAILY_LIMIT,
 *    FREE_UNLOCK_LIFETIME_BUDGET, the 7-day trial and the plans are untouched.
 *    One variable moved here: what the first screen shows.
 *
 * The seed payload is the ANONYMOUS one, which is exactly what a free
 * logged-in account gets back when it runs the same query — api/routes.py
 * `_gate` returns the identical allowlist for `current_user is None` and for a
 * free signed-in user. So the example is not a better product than the one
 * behind it, which is the failure mode a demo screen usually has.
 */
export default async function VerdictPage() {
  const seed = await getHeroVerdict()
  return <VerdictContent seedQuery={seed.query} seedResult={seed.result} />
}
