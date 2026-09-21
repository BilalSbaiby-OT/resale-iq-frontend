import { test } from "node:test"
import assert from "node:assert/strict"
import { localeSiblingPath } from "./locale-routes.ts"

test("language switcher navigates locale-routed money/data/tools hubs, not cookie-reload", () => {
  assert.equal(localeSiblingPath("/de/pricing", "fr"), "/fr/pricing")
  assert.equal(localeSiblingPath("/de/data", "es"), "/es/data")
  assert.equal(localeSiblingPath("/de/tools", "en"), "/tools")
  assert.equal(localeSiblingPath("/pricing", "de"), "/de/pricing")
  assert.equal(localeSiblingPath("/de", "it"), "/it")
  assert.equal(localeSiblingPath("/", "de"), "/de")
  assert.equal(localeSiblingPath("/de/methodology", "pt"), "/pt/methodology")
  assert.equal(localeSiblingPath("/de/register", "fr"), "/fr/register")
  assert.equal(localeSiblingPath("/de/support", "en"), "/support")
  assert.equal(localeSiblingPath("/de/best", "fr"), "/fr/best")
  assert.equal(localeSiblingPath("/de/blog/how-to-price-items-on-vinted", "es"), "/es/blog/how-to-price-items-on-vinted")
})

test("untranslated app routes stay cookie-driven (null sibling)", () => {
  assert.equal(localeSiblingPath("/verdict", "de"), null)
  assert.equal(localeSiblingPath("/dashboard", "fr"), null)
  assert.equal(localeSiblingPath("/login", "es"), null)
})
