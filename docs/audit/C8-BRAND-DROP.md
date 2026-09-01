# GAPS C8 — the blank-`brand_title` drop is a live sale-assertion defect

**Verdict: REAL and LIVE, not neutralised by the multi-pass mechanism, and its
rate is currently UNMEASURABLE from stored data — for a structural reason, not
a missing query.** This is not a new discovery: it was already named, in almost
these exact words, by `demand-intel` commit `998ef72` ("fix: an unpriceable row
is not a sale — C6 second pass after review"), found while proving the sibling
FX fix and explicitly left open: *"It needs its own measurement and fix — most
likely the same one: keep the row, null the field."* This document is that
measurement.

Scope discipline: **measured, not fixed.** `scrapers/vinted.py` was read only —
a sibling fix for the same file lives on `claude/backend-eng/fx-currency-v2`
(commit `998ef72`) and editing it here would collide. No git mutations were
made. Production was touched read-only over SSH (`mode=ro`); one exploratory
query was killed mid-run because it required an unindexed full scan against the
live-serving file (detail in §4).

---

## 1. The chain, confirmed from code

```
scrapers/vinted.py:755-757   raw_brand empty -> parse_item returns None
scrapers/vinted.py:960-962   scrape_brand_market: `if parsed: items.append(parsed)`
                              -- a None never enters `items`, and its external_id
                              is never extracted (parse_item drops it BEFORE
                              external_id is even read, at line 828)
scrapers/vinted.py:1101      shelf = [external_id for i in sorted(items, ...)]
                              -- this pass's rank-ordered shelf, built FROM `items`
engine/shelf.py:194-242      detect_ended(db, platform, brand, ranked_ids)
engine/shelf.py:245-288      _judge(): candidates absent from `now_ids` twice in a
                              row -> mark_listing_sold -> sold_observed = 1
```

`parse_item`'s output **is** the shelf observation, full stop. A row it fails
to parse is, to `detect_ended`, byte-identical to a row that physically left
the shelf. This is confirmed, not inferred — it is the same wiring the C6
second-pass commit traced for the FX-null-currency case, and the code has not
changed since.

**`sold_observed=1` is Vinted's only channel for `mark_listing_sold`.** There
is a second call site, `engine/tracker.py:169`, reached when
`check_item_status()` returns `"sold"`. But `check_item_status` dispatches
Vinted platforms to `scrapers/vinted.py:check_listing_status`, which — per its
own docstring — **only ever returns `"active"`, `"gone"`, or `"unknown"`**; it
deliberately never returns `"sold"` because a Vinted item page cannot be told
apart from a sold one by text content. So for every `platform LIKE 'vinted%'`
row, the tracker's `"gone"` branch calls `mark_listing_deleted` (not sold), and
the immediate-sold branch is dead code for this platform. **Every one of the
104,024 `sold_observed=1` Vinted rows in production went through
`engine/shelf.py:detect_ended` — the exact vulnerable chain.** (Verified live,
§3.)

---

## 2. The crux: does the two-strike / pending mechanism save it?

It saves it **only if a blank `brand_title` is independent noise, re-rolled on
every fetch.** It does **not** save it if blank-ness is a stable property of
the listing — and the evidence says it is the latter.

**How the guard actually works**, read from `engine/shelf.py`:

- A candidate must be absent from `ranked_ids` on **two separate judged
  passes** over the same `platform+brand` shelf: struck on miss #1
  (`verify_attempts` 0→1, carried forward via the `pending` blob in
  `shelf_passes`), ended on miss #2 (`verify_attempts >= 1` → `mark_listing_sold`,
  `engine/shelf.py:264,279`).
- Reappearance clears the strike **unconditionally**: `detect_ended` runs
  `reset_verify_attempts` for **every** id in `now_ids`, every pass
  (`engine/shelf.py:234-238`), before the candidate list is even judged.

So the mechanism is a real, working defence against a *transient* miss — an
item that vanishes from one pass's response and comes back on the next is
safe, unconditionally, regardless of cause. **This is exactly why the question
the CEO asked is the right one to ask.**

But it protects nothing if the row's absence is **deterministic**. Trace what
happens to a listing whose `brand_title` reads empty on *every* fetch (a
seller who never picked a brand — the commit's own investigation says this is
the majority case: *"about 39% of those are genuine items whose seller simply
left the field unset"*, i.e. items that keep existing, keep getting scraped,
and keep having nothing in that field):

1. Pass N: `brand_title` empty (as always) → `parse_item` returns `None` →
   external_id absent from `ranked_ids` → struck.
2. Pass N+1 over the same shelf: `brand_title` is **still** empty, because
   nothing about the listing changed → external_id is **again** absent from
   `ranked_ids` → this is not a coin flip landing badly twice, it is the same
   deterministic outcome repeating → `mark_listing_sold`.

The row can never earn a `reset_verify_attempts` call, because that call fires
only for ids present in `now_ids`, and this id is now permanently excluded
from `now_ids` by construction (`parse_item` drops it before it can ever be
counted as "seen"). There is no number of future passes that rescues it. The
two-strike rule was built to survive **one flaky pass**; a durably-blank field
is not a flaky pass, it is a standing condition, and the mechanism has no
defence against a standing condition on the very channel it uses to detect
presence.

**This is why the hopeful "0.58%² and negligible" framing does not hold in the
general case.** That decay is the correct arithmetic only if each pass's
empty-or-not outcome for a given listing is an independent Bernoulli draw. If
it is instead a fixed attribute of the listing (which is the far more natural
reading of `brand_title` — it is seller-entered catalog metadata stored once
at listing time, not something Vinted recomputes per request), then
"probability of missing twice in a row" collapses to "probability of missing
once," because the second miss is not an independent event — it is the same
fact observed again. The realistic exposure is therefore much closer to the
full measured 0.58%-per-pass empty rate (applied to whichever subset of those
items had ever been recorded on a shelf before) than to its square.

I cannot rule out that some slice of the 0.58% *is* transient (a genuine
per-request API glitch, unrelated to the listing itself) — that slice would be
protected by the reset. I found no way to measure the transient/stable split
from the outside; see §4 for what would.

---

## 3. What production actually shows (read-only, `mode=ro`, live at query time)

Query script and raw output are not included here (ad hoc, not proof
artefacts); the numbers below are copy-pasted from the live run.

```
total_listings              12,695,097
sold_observed_total            104,024   (100% platform LIKE 'vinted%')
sold_at range                2026-08-21 00:15:15  ->  2026-09-01 00:29:05
sold_observed, blank brand           0   <-- see "why this is 0 by construction" below
distinct brands                 14,399
```

**Why the "blank brand among sold rows" query reads exactly 0, and why that is
not evidence of no contamination.** The GAPS C8 ticket itself proposed this as
a measurement: *"can you identify any whose `brand` is empty/null?"* It cannot
work, and the reason is the same mechanism described above: a row can only be
`UPDATE`d or `INSERT`ed by `upsert_listing` when `parse_item` returns a
non-`None` dict, and that only happens when `brand_title` was non-empty **on
the pass that produced the stored value**. A row that later starts reading
blank never gets touched again — its stored `brand` column is frozen at
whatever non-empty value it had the last time it parsed successfully, right up
until the moment `mark_listing_sold` closes it out. **The contamination this
ticket is asking about is, by the schema's own construction, invisible in the
`brand` column of every row that could possibly carry it.** This is the single
most important structural finding in this audit: the obvious query is a false
negative generator, not an absence of signal.

**Timing: this is not a legacy-only exposure.** `12101c4` (the blank-brand
drop) shipped `2026-08-21 03:03:04 +0200` = `2026-08-21 01:03:04 UTC`. The
shelf detector's survivorship rewrite (`609ee9e`, the mechanism that is
actually capable of calling `mark_listing_sold` at any real volume) shipped
`2026-08-21 01:33:22 +0200` = `2026-08-20 23:33:22 UTC`. The earliest
`sold_observed=1` row in production is timestamped `2026-08-21 00:15:15` UTC —
inside that 90-minute window, before the brand-drop fix landed. **Every
`sold_observed` row after that point (effectively the entire 104,024-row
corpus, minus at most a handful in that opening hour) was produced while
running the exact code path this ticket is about.** This is not a dusty
edge case sitting in old rows; it is the operating condition of the "ground
truth" table (`d3850d9`) since the day that table came online.

**Weak circumstantial signal, not proof — fast-turnaround sold rows exist.**
1,126 of 104,025 Vinted `sold_observed=1` rows with lifespan data (**1.08%**)
have `sold_at - first_seen_at <= 35 minutes`. A sample of the fastest ones
shows several with **five distinct external_ids resolving to `sold_at` on the
same TLD within the same second** (e.g. five different `vinted_it`/`vinted_fr`
New Balance listings all ending at `2026-08-22 12:41:06`), consistent with one
`_judge()` batch ending several candidates from one shelf pass at once — which
is normal behavior for the detector regardless of cause. This is **consistent
with** rapid two-pass judging (which C8 would produce if the local scrape
agent runs more often than the nominal 30-minute interval — the timestamps
imply it does, sometimes by single-digit minutes) but it is equally consistent
with genuinely fast real sales of high-velocity items (New Balance 9060,
Nike). **I am not counting this as evidence of C8's rate — only noting it
exists and is measurable, and does not on its own distinguish this defect from
ordinary detector edge cases.**

**Live re-verification: attempted, and I'm reporting it as inconclusive rather
than stretching it.** I fetched 25 of the sampled sold URLs directly
(mirroring `check_listing_status`'s own method) — 19/25 (76%) returned HTTP
200, 6/25 (24%) returned 404. I initially treated the 200s as "still live,
therefore wrongly marked sold," but that is not a safe inference: Vinted does
not 404 a sold item's page (confirmed by inspecting one 200 response's
embedded item JSON — price, photos, and title all still render; there is no
machine-readable sold/active flag reachable by a plain fetch, which is exactly
why `check_listing_status`'s own docstring says it "does NOT cleanly
distinguish sold from delisted" and deliberately refuses to guess from page
content). **This technique cannot confirm or refute individual false
positives with the tools available**, and I am not reporting a false-positive
rate from it. I'm recording the attempt so the next person does not repeat it
expecting a clean answer.

---

## 4. What I could not safely measure, and why

I attempted one more query: count Vinted rows first seen before `12101c4`
shipped that are still active (`is_sold=0, is_deleted=0`) — a bounded
population that (a) could carry a fabricated pre-fix brand and (b) is exactly
the set now exposed to permanent silent disappearance if their true
`brand_title` has always been blank. **I killed it mid-run.** It requires a
full scan of 12,695,097 rows filtered on `first_seen_at`, which carries no
index — and this file is the one production is actively serving
(`/app/data/demand_intel.db`, `mode=ro`, with a launchd scraper writing to it
on its own cadence, per AM-1). `db/schema.py`'s own commit history records the
same shape of mistake already happening once: an unindexed `COUNT(*)` on
`sold_observed` "full-scanned 5.5M rows and timed out at 5 minutes twice"
before a partial index was added. Mine would scan a larger table with no
index at all. Running it to completion against the live file was not worth
the risk for an audit query. **This number is UNKNOWN.**

What would measure it safely:
- A partial index, e.g. `CREATE INDEX ... ON listings(platform, first_seen_at) WHERE is_sold=0 AND is_deleted=0`, added the same reversible way `idx_listings_sold_observed` was — then the same query is a fast index range scan instead of a table scan. That is a migration decision, out of scope for a read-only audit.
- Or run it against the nightly offline snapshot (`AI/CURRENT_STATE.md` records `rclone`-shipped `.db.gz` backups exist) instead of the live-serving file.

What would measure the actual contamination rate (not a proxy or a bound):
`parse_item` currently drops a blank-`brand_title` item **before** even
reading `item["id"]` (`scrapers/vinted.py:755-757`, vs. `external_id`
extraction at line 828). Add one debug-level log line — external_id, platform,
brand, rank — at the point of that drop (log only; no behavior change, so it
does not collide with the sibling branch's edit to the same lines). Run for
one full cycle across all five TLDs. Then join those logged ids against
`listings.sold_observed=1` timestamps: any id that gets logged as
dropped-for-blank-brand on two consecutive passes over the same shelf, and
whose corresponding stored row (from its last successful parse) later shows
`sold_observed=1` at a `sold_at` matching that window, is a directly observed
instance of this defect — not an inference. That is the only path to a real
number I found; nothing in the current schema or logs carries this trail
today.

---

## 5. Recommended fix and regression test (not implemented here)

**Fix — identical pattern to `998ef72` (C6 second pass), which the commit
message for that fix already named as the likely answer for this exact
ticket:** `parse_item` must never let a non-price, non-identity data-quality
problem remove the row from the shelf. Keep the row; null the field.

- Do **not** reintroduce any brand fallback (the original `12101c4` fix — never
  invent a brand from the search term — stays exactly as it is; that part was
  correct and stays correct).
- When `brand_title` (and the `brand` key) resolve to empty, return the parsed
  dict with `brand = None` instead of returning `None`. The row keeps its
  `external_id`, price, category, etc., and — critically — stays in `items`,
  so `scrape_brand_market`'s `shelf` list still includes it and
  `engine.shelf.detect_ended` still sees it as present.
- Every brand-scoped read/aggregate must filter `WHERE brand IS NOT NULL`
  (mirroring the `price_eur > 0` filter C6's fix relies on everywhere) so a
  null-brand row is invisible to brand attribution and demand signals but
  present to the shelf — the exact split `998ef72` established for price.
- `STANDARDS.md` candidate, quoting the C6 second-pass proof README verbatim
  because it is already the correct general rule: *"on the ingest path,
  `parse_item` returning `None` is never a neutral act. Every early return in
  that function is a claim that a listing left the shelf."*

**Regression test to pin it**, two parts:
1. Update `tests/test_brand_attribution.py::test_a_listing_with_no_brand_is_dropped_not_labelled`
   — its current assertion (`assert out is None`) is precisely the behavior
   that causes this defect and must change to `assert out is not None and
   out["brand"] is None`. Keep it as the negative control for fabrication (the
   brand must never be the search term) but stop asserting the row disappears.
2. A shelf-safety property test, matching the one already added on the sibling
   branch ("asserting every id on a mixed page survives to the shelf"):
   build a mixed page of raw items including one with blank `brand_title`,
   run it through `scrape_brand_market`'s parse loop, and assert its
   `external_id` is present in the resulting `items`/shelf list even though
   its `brand` is `None`. Add a negative control: reverting to `return None`
   on blank brand must fail this test — the same discipline `998ef72` used
   (`test_unconvertible_row_is_KEPT_with_no_price`).

**Not this audit's call, flagged for the CEO / data-scientist:** the
`sold_observed` corpus (`103,336`–`104,024` rows depending on when it's read)
that is currently authoritative ground truth for prediction grading
(`d3850d9`) has been accumulated entirely under the exposed code path since
its first hour of existence, and — per §3 — the contamination it may carry is
structurally invisible in the stored data. Nothing here can retroactively
clean it. Whatever weight `band_coverage`, MAPE, or calibration numbers derive
from `sold_observed` between now and the fix (plus enough post-fix passes to
matter) should be read with that caveat attached.

---

## Summary

- **Chain: confirmed**, not merely plausible — traced line-by-line, and
  independently corroborated by `demand-intel@998ef72`, which found and named
  this exact gap while proving the sibling FX fix.
- **Multi-pass mechanism: does not neutralise it.** The two-strike rule
  defends against a transient miss, unconditionally (reappearance always
  resets the strike). It has no defence against a *deterministic* miss, and a
  blank `brand_title` is, on priors, a stable per-listing property (seller
  metadata) rather than per-request noise — so the "square the probability"
  hope does not apply in the case that matters.
- **Rate: UNKNOWN, and not a gap in this audit — a gap in what the system logs.**
  The obvious DB query (`brand IS NULL` among sold rows) always reads zero, by
  construction, regardless of the true rate. A live re-fetch of sold URLs is
  inconclusive because Vinted does not 404 a sold item's page. The only route
  to a real number is logging the drop at the point `parse_item` currently
  discards it, which does not exist today.
- **Severity: not a legacy tail — the operating condition of the entire
  ground-truth table since it went live**, per the timestamp comparison in §3.
- **Fix: known, precedented, not implemented here** — keep the row, null the
  field, exactly as `998ef72` already did for price.
