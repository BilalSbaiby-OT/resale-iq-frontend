import { test } from "node:test"
import assert from "node:assert/strict"
import { readConsent, writeConsent, shouldShowBanner, CONSENT_COPY } from "./consent.ts"
import { hasAdsConsent, CONSENT_KEY, loadGtag } from "./gads.ts"

const mem = () => {
  const m = new Map<string, string>()
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) }
}

test("no stored choice: banner shows, no consent", () => {
  const s = mem()
  assert.equal(readConsent(s), null)
  assert.equal(shouldShowBanner(s), true)
  assert.equal(hasAdsConsent(s), false)
})

test("Accept stores 'granted', hides the banner, and enables the tag gate", () => {
  const s = mem()
  assert.equal(writeConsent(s, "granted"), true)
  assert.equal(s.getItem(CONSENT_KEY), "granted")
  assert.equal(shouldShowBanner(s), false)
  assert.equal(hasAdsConsent(s), true)
})

test("Reject stores 'denied', hides the banner, tag stays off", () => {
  const s = mem()
  writeConsent(s, "denied")
  assert.equal(readConsent(s), "denied")
  assert.equal(shouldShowBanner(s), false)
  assert.equal(hasAdsConsent(s), false)
  const win = { localStorage: s, document: {} as Document }
  assert.equal(loadGtag(win, "AW-123"), false)
})

test("garbage values count as no choice; broken storage never throws", () => {
  const s = mem()
  s.setItem(CONSENT_KEY, "yes")
  assert.equal(readConsent(s), null)
  const broken = { getItem() { throw new Error("blocked") }, setItem() { throw new Error("blocked") } }
  assert.equal(readConsent(broken), null)
  assert.equal(writeConsent(broken, "granted"), false)
  assert.equal(writeConsent(undefined, "granted"), false)
})

test("every locale has short text and equal-weight buttons", () => {
  for (const [l, c] of Object.entries(CONSENT_COPY)) {
    assert.ok(c.text.split(/\s+/).length <= 25, l)
    assert.ok(c.accept && c.reject && c.settings && c.link, l)
  }
  assert.equal(CONSENT_COPY.en.text, "We use one ad-measurement cookie (Google Ads) to see which ads bring sign-ups. Optional.")
})
