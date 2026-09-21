import type { HeroVerdict } from "./hero-verdict"

/** Shared BUY/WATCH/SKIP + buy-below guard. Null/0 is not a number. */
export function isUsableVerdict(r: HeroVerdict | null | undefined): r is HeroVerdict {
  return Boolean(
    r &&
      (r.verdict === "BUY" || r.verdict === "WATCH" || r.verdict === "SKIP") &&
      typeof r.buy_below === "number" &&
      Number.isFinite(r.buy_below) &&
      r.buy_below > 0,
  )
}
