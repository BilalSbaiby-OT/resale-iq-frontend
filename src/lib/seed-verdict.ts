import type { HeroVerdict } from "./hero-verdict"

/**
 * The rule for the worked example on the signed-in cold screen.
 *
 * SEPARATE MODULE FROM hero-verdict.ts ON PURPOSE, and this is not tidiness.
 * hero-verdict.ts imports node:fs, node:os and node:path for its disk
 * last-good cache. The consumer of this rule is the /verdict client component,
 * so a value import from there would drag Node builtins into the browser
 * bundle and break the build. The TYPE import above is erased at compile time
 * and costs nothing.
 *
 * WHAT THE RULE IS. `isUsable` in hero-verdict.ts is the landing page's bar: a
 * live BUY/WATCH/SKIP on a named product. The signed-in first screen needs one
 * thing more — the PRICE. The reason /verdict opens with an example at all is
 * that five of seven genuine registered accounts had never typed anything
 * (production, read-only, 2026-09-06), and what they have to see is that this
 * product answers "what should I pay" with a number. A verdict badge and no
 * buy-below demonstrates the half nobody doubted.
 *
 * So an unpriced seed is dropped and the screen falls back to the plain empty
 * state. That is honest. Rendering the card with "—" in the one tile that is
 * supposed to be the argument would not be.
 */
export function seedWorthShowing(r: HeroVerdict | null | undefined): HeroVerdict | null {
  return r && r.buy_below != null ? r : null
}
