import test from "node:test"
import assert from "node:assert/strict"
import { shouldNoindexBlogClone, countWords } from "./blog-clone-noindex.ts"

test("thin + 0 visits -> noindex", () => assert.equal(shouldNoindexBlogClone("fr", "some-slug", 120), true))
test("human-visited page never noindexed", () => assert.equal(shouldNoindexBlogClone("es", "best-time-to-list-on-vinted", 50), false))
test("long page not noindexed", () => assert.equal(shouldNoindexBlogClone("de", "some-slug", 800), false))
test("english never noindexed", () => assert.equal(shouldNoindexBlogClone("en", "some-slug", 10), false))
test("countWords recurses", () => assert.equal(countWords({ a: "one two", b: ["three", { c: "four five" }] }), 5))
