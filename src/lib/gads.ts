/**
 * Google Ads conversion tag. INERT unless NEXT_PUBLIC_GADS_ID (e.g. "AW-123")
 * is set at build time, and even then it loads only after ad-consent is given.
 *
 * CONSENT: gtag.js is a third-party tracker, so it must not load without
 * opt-in. src/components/consent-banner.tsx writes CONSENT_KEY ("granted" |
 * "denied") and gads-tag.tsx loads the tag on the change event.
 *
 * No PII is ever sent: only the conversion `send_to` target.
 */
export const CONSENT_KEY = "riq_consent_ads"

type StorageLike = Pick<Storage, "getItem">

export function gadsId(env: string | undefined = process.env.NEXT_PUBLIC_GADS_ID): string | null {
  const v = (env ?? "").trim()
  return /^AW-\d+$/.test(v) ? v : null
}

/** "AW-123/label" or null when either part is missing/invalid. */
export function conversionSendTo(
  id: string | undefined = process.env.NEXT_PUBLIC_GADS_ID,
  label: string | undefined = process.env.NEXT_PUBLIC_GADS_CONV_LABEL,
): string | null {
  const aw = gadsId(id)
  const l = (label ?? "").trim()
  return aw && /^[\w-]+$/.test(l) ? `${aw}/${l}` : null
}

export function hasAdsConsent(storage: StorageLike | undefined): boolean {
  try { return storage?.getItem(CONSENT_KEY) === "granted" } catch { return false }
}

type Win = {
  dataLayer?: unknown[]
  gtag?: (...a: unknown[]) => void
  localStorage?: StorageLike
  document?: Document
}

/** Inject gtag.js once. Returns false (does nothing) when unconfigured or unconsented. */
export function loadGtag(win: Win | undefined = typeof window === "undefined" ? undefined : (window as unknown as Win), id: string | null = gadsId()): boolean {
  if (!win || !win.document || !id || !hasAdsConsent(win.localStorage)) return false
  if (win.gtag) return true
  win.dataLayer = win.dataLayer || []
  win.gtag = function () { win.dataLayer!.push(arguments) }
  win.gtag("js", new Date())
  win.gtag("config", id, { allow_ad_personalization_signals: false })
  const s = win.document.createElement("script")
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`
  win.document.head.appendChild(s)
  return true
}

/** Fire the purchase conversion. No-op unless id + label are set and consent is granted. */
export function fireConversion(
  win: Win | undefined = typeof window === "undefined" ? undefined : (window as unknown as Win),
  sendTo: string | null = conversionSendTo(),
): boolean {
  if (!win || !sendTo) return false
  if (!loadGtag(win, sendTo.split("/")[0])) return false
  win.gtag!("event", "conversion", { send_to: sendTo })
  return true
}
