/**
 * Minimal 50/50 A/B framework. Assignment is sticky per browser (localStorage,
 * same storage the attribution code uses — no extra cookie, nothing personal).
 * The variant rides on funnel events as `ab=exp:V` in the path (the /api/track
 * sink stores only event/path/utm_*), so every experiment is readable with:
 *   select path, count(distinct visitor_hash) from pageviews where path like '%ab=cta_label:B%' ...
 * SSR/hydration: always render "A" first, then call useAbVariant (effect) so the
 * server HTML and first client render match.
 */
export type AbExperiment = "cta_label" | "reg_cta"
export const AB_EXPERIMENTS: readonly AbExperiment[] = ["cta_label", "reg_cta"]
const PREFIX = "riq_ab_"

export function pickVariant(rand: number = Math.random()): "A" | "B" {
  return rand < 0.5 ? "A" : "B"
}

/** Sticky variant for this browser; "A" when storage is unavailable (no split, no bias). */
export function getVariant(exp: AbExperiment): "A" | "B" {
  if (typeof window === "undefined") return "A"
  try {
    const cur = window.localStorage.getItem(PREFIX + exp)
    if (cur === "A" || cur === "B") return cur
    const v = pickVariant()
    window.localStorage.setItem(PREFIX + exp, v)
    return v
  } catch {
    // why: private mode / blocked storage — fall back to A for everyone, so no biased split and no error
    return "A"
  }
}

/** `cta_label:B,reg_cta:A` for every experiment this browser has been exposed to. */
export function abTag(): string {
  if (typeof window === "undefined") return ""
  try {
    return AB_EXPERIMENTS.map((e) => [e, window.localStorage.getItem(PREFIX + e)] as const)
      .filter(([, v]) => v === "A" || v === "B")
      .map(([e, v]) => `${e}:${v}`)
      .join(",")
  } catch {
    // why: blocked storage means no assignment was ever made, so there is nothing to tag
    return ""
  }
}
