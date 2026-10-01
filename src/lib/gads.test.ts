import test from "node:test"
import assert from "node:assert/strict"
import { gadsId, conversionSendTo, hasAdsConsent, loadGtag, fireConversion, CONSENT_KEY } from "./gads.ts"

function fakeWin(consent: boolean) {
  const appended: { src?: string }[] = []
  return {
    appended,
    win: {
      localStorage: { getItem: (k: string) => (consent && k === CONSENT_KEY ? "granted" : null) },
      document: {
        createElement: () => ({} as { src?: string }),
        head: { appendChild: (e: { src?: string }) => appended.push(e) },
      } as unknown as Document,
    } as Parameters<typeof loadGtag>[0] & { gtag?: (...a: unknown[]) => void; dataLayer?: unknown[] },
  }
}

test("gadsId accepts only AW-<digits>", () => {
  assert.equal(gadsId("AW-123"), "AW-123")
  assert.equal(gadsId(undefined), null)
  assert.equal(gadsId(""), null)
  assert.equal(gadsId("G-ABC"), null)
})

test("conversionSendTo needs both id and label", () => {
  assert.equal(conversionSendTo("AW-123", "abc_D-1"), "AW-123/abc_D-1")
  assert.equal(conversionSendTo("AW-123", undefined), null)
  assert.equal(conversionSendTo(undefined, "abc"), null)
  assert.equal(conversionSendTo("AW-123", "a b"), null)
})

test("hasAdsConsent is false without explicit grant", () => {
  assert.equal(hasAdsConsent(undefined), false)
  assert.equal(hasAdsConsent({ getItem: () => null }), false)
  assert.equal(hasAdsConsent({ getItem: () => "granted" }), true)
})

test("inert: no id or no consent -> no script, no event", () => {
  const a = fakeWin(true)
  assert.equal(loadGtag(a.win, null), false)
  const b = fakeWin(false)
  assert.equal(loadGtag(b.win, "AW-123"), false)
  assert.equal(b.appended.length, 0)
  assert.equal(fireConversion(b.win, "AW-123/x"), false)
  assert.equal(fireConversion(a.win, null), false)
})

test("consented + configured: loads gtag once and fires conversion with only send_to", () => {
  const { win, appended } = fakeWin(true)
  const w = win as unknown as { dataLayer: unknown[] }
  assert.equal(loadGtag(win, "AW-123"), true)
  assert.equal(appended.length, 1)
  assert.match(appended[0].src!, /googletagmanager\.com\/gtag\/js\?id=AW-123$/)
  assert.equal(fireConversion(win, "AW-123/lbl"), true)
  assert.equal(appended.length, 1)
  const last = Array.from(w.dataLayer[w.dataLayer.length - 1] as ArrayLike<unknown>)
  assert.deepEqual(last, ["event", "conversion", { send_to: "AW-123/lbl" }])
})
