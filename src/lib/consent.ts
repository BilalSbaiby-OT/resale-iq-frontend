/**
 * Ad-measurement consent (GDPR / ePrivacy). One optional cookie: Google Ads
 * conversion measurement. Nothing loads before an explicit Accept; Reject and
 * Accept carry equal weight; no pre-ticked boxes. The choice lives in
 * localStorage[CONSENT_KEY] ("granted" | "denied"); src/lib/gads.ts only loads
 * gtag when it reads "granted".
 */
import { CONSENT_KEY } from "./gads.ts"
import type { Locale } from "./i18n"

export const CONSENT_EVENT = "riq:consent-change"
export const CONSENT_REOPEN_EVENT = "riq:consent-reopen"

export type ConsentChoice = "granted" | "denied"
type Store = Pick<Storage, "getItem" | "setItem">

/** null = no choice yet (banner must show). */
export function readConsent(storage: Pick<Storage, "getItem"> | undefined): ConsentChoice | null {
  try {
    const v = storage?.getItem(CONSENT_KEY)
    return v === "granted" || v === "denied" ? v : null
  } catch { return null }
}

/** Persist the choice. Returns false when storage is unavailable (banner stays dismissed for the page view). */
export function writeConsent(storage: Store | undefined, choice: ConsentChoice): boolean {
  try {
    if (!storage) return false
    storage.setItem(CONSENT_KEY, choice)
    return true
  } catch { return false }
}

export function shouldShowBanner(storage: Pick<Storage, "getItem"> | undefined): boolean {
  return readConsent(storage) === null
}

export type ConsentCopy = { text: string; link: string; accept: string; reject: string; settings: string }

export const CONSENT_COPY: Record<Locale, ConsentCopy> = {
  en: { text: "We use one ad-measurement cookie (Google Ads) to see which ads bring sign-ups. Optional.", link: "Privacy", accept: "Accept", reject: "Reject", settings: "Cookie settings" },
  fr: { text: "Nous utilisons un seul cookie de mesure publicitaire (Google Ads) pour voir quelles annonces génèrent des inscriptions. Facultatif.", link: "Confidentialité", accept: "Accepter", reject: "Refuser", settings: "Paramètres des cookies" },
  es: { text: "Usamos una cookie de medición publicitaria (Google Ads) para ver qué anuncios generan registros. Opcional.", link: "Privacidad", accept: "Aceptar", reject: "Rechazar", settings: "Ajustes de cookies" },
  de: { text: "Wir nutzen ein Cookie zur Werbemessung (Google Ads), um zu sehen, welche Anzeigen Anmeldungen bringen. Optional.", link: "Datenschutz", accept: "Akzeptieren", reject: "Ablehnen", settings: "Cookie-Einstellungen" },
  it: { text: "Usiamo un cookie di misurazione pubblicitaria (Google Ads) per vedere quali annunci portano iscrizioni. Facoltativo.", link: "Privacy", accept: "Accetta", reject: "Rifiuta", settings: "Impostazioni cookie" },
  pt: { text: "Usamos um cookie de medição de anúncios (Google Ads) para ver que anúncios geram registos. Opcional.", link: "Privacidade", accept: "Aceitar", reject: "Rejeitar", settings: "Definições de cookies" },
}
