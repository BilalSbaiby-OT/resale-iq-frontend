/**
 * First-touch store (riq_ft): first touch sticks for 90 days, a weak (direct)
 * first touch is upgraded by the first informative one, last touch tracks the
 * latest informative one, nothing but our own tags/host/path is stored.
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import {
  captureFirstTouch, firstTouchFields, firstTouchQuery, FT_KEY, FT_MAX_AGE_MS,
} from "./first-touch.ts"

function fakeStorage() {
  const m = new Map<string, string>()
  return {
    getItem: (k: string) => (m.has(k) ? m.get(k)! : null),
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
    _map: m,
  }
}

type Env = { search?: string; referrer?: string; path?: string; host?: string }
function visit(storage: ReturnType<typeof fakeStorage>, { search = "", referrer = "", path = "/", host = "resaleiq.dev" }: Env, now: number) {
  const g = globalThis as unknown as Record<string, unknown>
  g.window = { localStorage: storage, location: { search, hostname: host, pathname: path } }
  g.document = { referrer }
  return captureFirstTouch(now)
}
const T0 = Date.parse("2026-10-05T10:00:00Z")
const DAY = 86_400_000

test("UTM landing is stored as first and last touch with landing path and ts", () => {
  const s = fakeStorage()
  const r = visit(s, { search: "?utm_source=tiktok&utm_medium=paid&utm_campaign=creator_anna&utm_content=v1", path: "/fr/blog/x", referrer: "https://www.tiktok.com/" }, T0)!
  assert.equal(r.first.source, "tiktok")
  assert.equal(r.first.campaign, "creator_anna")
  assert.equal(r.first.method, "utm")
  assert.equal(r.first.referrer, "tiktok.com")
  assert.equal(r.first.landing, "/fr/blog/x")
  assert.equal(r.first.ts, new Date(T0).toISOString())
})

test("first touch is never overwritten, last touch moves", () => {
  const s = fakeStorage()
  visit(s, { search: "?utm_source=chatgpt.com&utm_medium=llm" }, T0)
  visit(s, { search: "?utm_source=google&utm_medium=cpc&utm_campaign=brand" }, T0 + DAY)
  const f = firstTouchFields(T0 + 2 * DAY)
  assert.equal(f.ft_source, "chatgpt.com")
  assert.equal(f.lt_source, "google")
  assert.equal(f.lt_campaign, "brand")
  // a later direct visit changes nothing
  visit(s, {}, T0 + 3 * DAY)
  assert.equal(firstTouchFields(T0 + 3 * DAY).lt_source, "google")
})

test("weak (direct) first touch is upgraded by the first informative touch", () => {
  const s = fakeStorage()
  visit(s, {}, T0)
  assert.equal(firstTouchFields(T0).ft_method, "direct")
  visit(s, { referrer: "https://chatgpt.com/" }, T0 + DAY)
  const f = firstTouchFields(T0 + DAY)
  assert.equal(f.ft_source, "chatgpt")
  assert.equal(f.ft_method, "referrer")
  assert.equal(f.ft_referrer, "chatgpt.com")
})

test("gclid / ttclid choose the channel; the click id itself is never stored", () => {
  const s = fakeStorage()
  visit(s, { search: "?gclid=SECRETCLICKID" }, T0)
  const f = firstTouchFields(T0)
  assert.equal(f.ft_source, "google"); assert.equal(f.ft_medium, "cpc")
  assert.ok(!JSON.stringify([...s._map.values()]).includes("SECRETCLICKID"))
  const s2 = fakeStorage()
  visit(s2, { search: "?ttclid=abc" }, T0)
  assert.equal(firstTouchFields(T0).ft_source, "tiktok")
})

test("same-site referrer is not a touch; ?src= is not an acquisition channel", () => {
  const s = fakeStorage()
  visit(s, { search: "?src=blog", referrer: "https://resaleiq.dev/blog" }, T0)
  const f = firstTouchFields(T0)
  assert.equal(f.ft_method, "direct")
  assert.equal(f.ft_source, undefined)
  assert.equal(f.ft_referrer, undefined)
})

test("expires after 90 days, then a new first touch can start", () => {
  const s = fakeStorage()
  visit(s, { search: "?utm_source=old" }, T0)
  assert.equal(firstTouchFields(T0 + FT_MAX_AGE_MS - DAY).ft_source, "old")
  assert.deepEqual(firstTouchFields(T0 + FT_MAX_AGE_MS + DAY), {})
  assert.equal(s.getItem(FT_KEY), null)
  visit(s, { search: "?utm_source=new" }, T0 + FT_MAX_AGE_MS + DAY)
  assert.equal(firstTouchFields(T0 + FT_MAX_AGE_MS + DAY).ft_source, "new")
})

test("values are length-capped and query carries only ft_/lt_ fields", () => {
  const s = fakeStorage()
  visit(s, { search: `?utm_source=${"x".repeat(500)}&utm_campaign=creator_bob` }, T0)
  const f = firstTouchFields(T0)
  assert.equal(f.ft_source!.length, 120)
  const q = new URLSearchParams(firstTouchQuery(T0))
  for (const k of q.keys()) assert.match(k, /^(ft|lt)_/)
  assert.equal(q.get("ft_campaign"), "creator_bob")
})

test("broken storage never throws", () => {
  const g = globalThis as unknown as Record<string, unknown>
  g.window = {
    localStorage: { getItem() { throw new Error("denied") }, setItem() { throw new Error("denied") }, removeItem() {} },
    location: { search: "", hostname: "resaleiq.dev", pathname: "/" },
  }
  g.document = { referrer: "" }
  assert.equal(captureFirstTouch(T0), null)
  assert.deepEqual(firstTouchFields(T0), {})
})
