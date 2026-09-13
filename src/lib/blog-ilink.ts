/**
 * EX-ILINK (2026-09-13) — contextual body links from blog copy to hubs.
 *
 * Mid-article CTAs stay on their own campaigns (ctr_*, body_price_*,
 * legacy_signup_kill). Do not reuse this helper on those blocks.
 */
export const ILINK_CAMPAIGN = "ilink_20260913"

export type IlinkHub = "flip" | "data" | "pricing"

export function ilinkHref(hub: IlinkHub, locale?: "es"): string {
  const prefix = locale === "es" ? "/es" : ""
  return `${prefix}/${hub}?utm_source=blog&utm_medium=ilink&utm_campaign=${ILINK_CAMPAIGN}&utm_content=to_${hub}`
}
