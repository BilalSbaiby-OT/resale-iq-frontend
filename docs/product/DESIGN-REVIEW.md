# DESIGN REVIEW — the refusal is the product

**Written** 2026-09-01, designer. Scope: `design/` against `src/` and `extension/` as they exist on
disk today. Premise, measured, not asserted: `insufficient_data_rate` = **40.9%** (n=44,
`sql/metrics/insufficient_data_rate.sql`, `docs/company/METRICS.md`) and `band_coverage_supply` =
**43%** (100 tracked models, 43 with `comparable_n >= 8`, `docs/company/APPROVALS.md:144-148`). Most
answered searches are not refused, but the *product's ceiling* is a refusal for the majority of what
it tracks, and two more real states — `LIMIT_REACHED` (≈19% of all requests) and `PENDING`
(19/78 = 24.4% of rows in the last 7 days, `docs/company/METRICS.md:81-84`) — sit in front of that
ceiling and currently have **no design at all**. Ranked by how many users see the surface, in order:
extension panel (every install, every listing) → free checker on the homepage (every anonymous
visitor) → `/verdict` dashboard (paying users) → landing/pricing (every visitor, once).

---

## 1. The four extension panel states — is non-confident the afterthought?

Read: `design/extension-panel/{confident,low-confidence,insufficient,not-covered}.html`.

**No — these four are not the afterthought, and it's worth saying plainly because that's the rarer
finding.** Each of the three non-confident files carries its own design note explaining a specific
decision (`low-confidence.html:81-89`, `insufficient.html:71-80`, `not-covered.html:72-80`), and
`confident.html:132-138` explicitly argues *against* decorating the easy case: *"HIGH gets the least
design... confidence work goes into the other three states, not this one."* That's the correct
posture for a product whose primary output is a refusal, and it's rare enough in this codebase to
call out as something to protect, not fix.

**Where they earn it, concretely:**

- **Hierarchy holds across all four.** Every file keeps the same slot order — verdict/status → number
  or its replacement → `n` and date range → explanation → link — per `design/README.md:29-30`. In
  `insufficient.html:104-113` the number's slot (`.riq-statement`, 15px/700, same weight class as
  `.riq-num` in `confident.html:100`) is filled with a sentence instead of a price, so the layout
  rhythm survives the absence of a number. That's the single best piece of craft in this set.
- **"We don't know" is told apart from "it's broken" — inside these four.** `insufficient.html`'s
  card chrome (width, radius, shadow, `border-left`) is byte-for-byte the same production values as
  `confident.html` — no dashed border, no warning icon, no red. The only signal is the sentence
  itself: *"Not enough sold data to price this yet"* (line 104) plus an honest `n` (line 108: `4`
  labelled `sold, watched`, not hidden) plus the exact threshold (line 113: *"Our floor for a price is
  8 comparable sales. This model has 4."*) That is a refusal that explains itself in numbers, which is
  the thing that makes it read as a decision rather than a malfunction — **provided nothing else on
  the page contradicts it (see §3, it does).**
- **Confidence and verdict are genuinely two channels, not one.** `low-confidence.html:48-51`'s own
  comment states the rule design/README.md also states (`design/README.md:32-34`): confidence is tan
  (`#c4a574`), verdict is BUY/WATCH/SKIP's own colour, and the two must never merge. The file honours
  it — `.riq-verdict` is amber (`--riq-watch`, line 43), `.riq-conf-pill` is tan (line 53-57). This is
  the rule §2 below finds broken **outside** this file family.
- **`not-covered.html` earns its own copy, not a reuse of `insufficient.html`'s.** Line 74-79's design
  note names the actual distinction that matters to a reseller: *"not enough evidence yet" (a
  sample-size problem)* vs *"we don't track this at all" (a coverage problem)*. The `riq-next` block
  (line 114) tells the user what to do about it — check the brand page — rather than leaving a dead
  end. Six real brands hit this today (`zero_model_brands`, `tokens.json:107`), so this isn't
  speculative.

**What's still missing, inside these four, and it's small:**

- `insufficient.html` and `not-covered.html` both use `--riq-muted` (`#5b6b8c`) as their left-accent
  colour — correctly neutral, not a verdict colour. But nothing in either file's `.riq-head` visually
  says "this card has no verdict" as directly as `confident.html`'s `.riq-verdict` tag says "this card
  has one." A user who has only ever seen CONFIDENT panels may scan for the tag, not find it, and read
  its *absence* as breakage rather than as the state itself. The statement line does the explaining,
  but it explains *after* the scan, not *during* it. **Recommendation:** both files should carry a
  small header-row status pill (`not-covered.html`'s `.riq-brand-pill`, line 40-43, is the right
  pattern) that names the state in one word — "Not tracked" / "Not measured" — the instant the eye
  lands on the header, before it has to read the sentence. `quota-reached.html` (new, §3) already does
  this with `.riq-status-pill`; retrofitting it to `insufficient.html` and `not-covered.html` would
  make all non-confident states self-identify at the same speed CONFIDENT does with its verdict tag.
  One-line change, `design/`-only, no `src/` dependency.

---

## 2. The token defect — 3 ambers, 2 reds, resolved

Source: `design/tokens.json` `color.verdict.watch`, `color.verdict.skip`, `known_splits` (lines
28-49). This section makes that observation executable.

### What each colour means today, stated plainly (the actual defect)

- **Amber is used for two unrelated meanings on the same surface.** On the site, `--color-watch` /
  `--color-amber` = `#f59e0b` (`src/app/globals.css:26,29`) is the WATCH **verdict** colour — "this
  item is borderline, keep an eye on it," a statement about the market. But
  `src/components/tools/free-checker.tsx:44` assigns the *same* semantic family —
  `LIMIT_REACHED: "#f59e0b"` — to a **quota** state that has nothing to do with the item at all; it's
  rendered in the identical slot (`free-checker.tsx:142`, `<span style={{...color}}>{label}</span>`)
  the verdict tag uses. A user who has learned "amber = watch this" now sees amber mean "you're out of
  free checks" in the exact same visual position. That is not a hex-value inconsistency, it's a
  **meaning** collision, and it is the more serious of the two defects in this section — worse than
  the three-way amber split, because it isn't even internally consistent about what amber *is*.
- **Red is consistent in meaning (SKIP, always), split only in hex** — the milder defect.
  `#ef4444` (`globals.css:27,30`) and `#f87171` (`extension/content.css:19,33,78,64`) both mean SKIP;
  the split is presentation (dark-card contrast), not semantics. `tokens.json:46` already gives the
  reason for the second value.

### The canonical set

| Role | Canonical value | Where it applies | Replaces |
|---|---|---|---|
| **VERDICT — buy** | `#22c55e` (unchanged) | everywhere | already unanimous, no change |
| **VERDICT — watch**, light/site surfaces | `#f59e0b` (`--color-watch`) | `src/app/globals.css:26`, dashboard components, hero mock, pricing | `#eab308` (`src/components/tools/free-checker.tsx:39`, `src/components/landing/extension-hero.tsx`) — this was always meant to *be* the token; someone hardcoded a second hex instead of using `var(--color-watch)`. Delete `#eab308` everywhere it appears; there is no reason for it to exist as a distinct value. |
| **VERDICT — watch**, dark extension card | `#fbbf24` (`--riq-watch-oncard`) | `extension/content.css:18,32,77` | Kept, renamed, documented as a deliberate **contrast variant of the same token**, not a third colour. Same relationship the tokens.json note (line 46) already accepts for SKIP's two values — apply the identical reasoning here instead of leaving WATCH unresolved. |
| **VERDICT — skip**, light/site surfaces | `#ef4444` (`--color-skip`) | `globals.css:27,30`, dashboard, free-checker | unchanged |
| **VERDICT — skip**, dark extension card | `#f87171` (`--riq-skip-oncard`) | `extension/content.css:19,33,78,64`, incl. `.riq-row.riq-warn` | unchanged, renamed for clarity — `.riq-row.riq-warn` ("listed over your buy-below") intentionally reuses this value; that's a shared "red-family, needs attention" signal at transaction level, not a third accidental red. |
| **CONFIDENCE** (unrelated axis — untouched by this fix) | `#c4a574` | every surface, `confidence_note_color` | already consistent, do not merge with WATCH when fixing the above |
| **SYSTEM / QUOTA state** (new name for an existing gap — see §3) | `#8b99b8` (neutral, same family as `unknown`) for self-serve states; `#f87171` (`--riq-skip-oncard`, reused, not a fifth colour) for genuine errors | `LIMIT_REACHED`, rate-limit, email-unverified, connection failure | **Must never be `#f59e0b`/`#eab308`/`#fbbf24` (any amber).** This is the fix for the collision described above. `free-checker.tsx:44` is the one line that currently violates it. |

**Two colours, net — not three ambers and two reds.** The count in the audit was correct; the fix is
not "pick one," it's "name the two that are real (site-luminance, card-luminance) and delete the
third that was drift." The system/quota reassignment is new work, not a renumbering.

**Executable change list for whoever implements this** (flagged, not made — this is a `src/`-touching
change, out of `design/`'s remit per `design/README.md:12`):

1. `src/components/landing/extension-hero.tsx` — replace hardcoded `#eab308` with `var(--color-watch)`.
2. `src/components/tools/free-checker.tsx:39` — replace `WATCH: "#eab308"` with `WATCH: "#f59e0b"`.
3. `src/components/tools/free-checker.tsx:44` — replace `LIMIT_REACHED: "#f59e0b"` with the neutral
   `#8b99b8`. This is the one-line fix for the meaning collision above.
4. `extension/content.css:18,32,77` — rename the selector comments (values unchanged) to make clear
   `#fbbf24` is `--riq-watch-oncard`, a contrast variant, not an independent colour.
5. `design/tokens.json` — once landed, update `known_splits` (lines 44-49) from "flagged, not fixed"
   to closed, and add the new `system_state` colour role.

---

## 3. Every reachable state — what has a design, what does not

Enumerated from `extension/content.js`, `extension/background.js`,
`src/components/tools/free-checker.tsx`, `src/app/(dashboard)/verdict/page.tsx`, and
`docs/company/METRICS.md`. Ranked by how many users see it.

| # | State | Reached via | Design exists? | Volume (measured) |
|---|---|---|---|---|
| 1 | CONFIDENT (HIGH/MEDIUM band) | `content.js:271` `paint()`, verdict present | ✅ `confident.html`, `low-confidence.html` | majority of *answered* searches |
| 2 | INSUFFICIENT_DATA (n<8) | `content.js:264-268` "not tracked" fallback; `verdict/page.tsx:139-148` | ✅ `insufficient.html` | 40.9% of answered searches (`insufficient_data_rate`) |
| 3 | UNKNOWN / not covered | `verdict/page.tsx:18`, `free-checker.tsx:110-116` | ✅ `not-covered.html` | 6 named zero-model brands, `tokens.json:107` |
| 4 | **LIMIT_REACHED (quota exhausted)** | `background.js:89`, `content.js:355`, `free-checker.tsx:106-109,44` | ❌ **none** — routed through the generic `paintStatus()` (`content.js:222-229`) on the extension; a single unstyled `<p>` on the site (`free-checker.tsx:107-109`) | **≈19% of all requests** (derived: METRICS.md's 78-row/7-day window minus 44 answered minus 19 PENDING ≈ 15/78) — **built, `design/extension-panel/quota-reached.html`** |
| 5 | **PENDING (request reserved, never resolved)** | no explicit code path — this is what happens when `content.js:346-367`'s `run()` sends the message and the callback never fires (tab closed, worker recycled, promise hangs); the "checking…" placeholder (`content.js:346`) has **no timeout, no fallback** | ❌ **none** — not a rendering bug, an *absent* state: there is nothing after "checking…" if it never resolves | 24.4% of rows (19/78), `docs/company/METRICS.md:81-84` — **built, "stalled request" card in `design/extension-panel/system-status.html`** |
| 6 | Rate-limited (HTTP 429) | `background.js:84`, `content.js:355` | ❌ **none** — `paintStatus()`, mislabeled with a "Sign in" CTA (`content.js:355`) that has nothing to do with the actual problem | not separately measured; folded into the 19% above |
| 7 | Email unverified (HTTP 403) | `background.js:85`, `content.js:354` | ❌ **none** — `paintStatus()` | not separately measured |
| 8 | Connection failure (network/5xx/exception) | `content.js:349-352`, `background.js:86,94-96` | ❌ **none** — `paintStatus()`, indistinguishable in colour and layout from #4/#6/#7 above | not separately measured |
| 9 | Logged out (dashboard) | `src/components/layout/app-shell.tsx:38`, hard `router.push("/login")` | ✅ N/A by design — standard redirect, no state to skin. **No gap.** | every unauthenticated `/verdict` visit |
| 10 | Logged out (extension, stale token) | `background.js:42-46` — 401 silently clears the token and retries anonymously | ✅ N/A by design — deliberately invisible; the user never sees "your session expired," they just see the anonymous flow (which itself may hit #4). **No gap, but worth confirming this silent-fallback choice is intentional and not an oversight next time `extension-eng` touches this path.** | not measured |
| 11 | Uncovered **market** (as opposed to uncovered brand) | not a real code branch — the extension's `content_scripts.matches` (`extension/manifest.json:34-39`) only injects on `vinted.{es,fr,de,it,pt}`, so it is structurally impossible to reach this state on Vinted today | ⚠️ **not a bug now, a forward gap** — see below | 0 today; `CLAUDE.md`'s note that GB is the second-largest source of impressions makes this non-hypothetical soon |

**Item 11 in more detail, because it's the one genuinely new finding, not a defect:** the product has
no way to say *"we don't cover this market yet"* as distinct from *"we don't cover this brand/model."*
Today they'd collapse into the same generic UNKNOWN/"no data" message if a UK query ever reached the
backend through the website (the extension can't reach it at all — it isn't injected on
`vinted.co.uk`). `CLAUDE.md`'s UK note is explicit that lifting the "hard no" on *considering* the UK
is not the same as the product covering it, and that "any page that implies UK coverage is still wrong
until the data actually exists." A market-gap message is strictly more honest and more valuable than a
generic no-data message — it can say *"not yet — ES/FR/DE/IT/PT only"* instead of implying the model
itself is obscure, and it's the natural place to capture "notify me" interest ahead of an actual UK
launch. **Not designing a mockup for this now** — there is no live code path to design against yet,
and inventing one would be exactly the kind of speculative UI OS §0.9 warns against — but flagging it
here so it's the first thing added if/when `market-numbers.ts` (per `CLAUDE.md`) grows a UK entry.

**New mockups added this pass** (the two states ranked #4 and #5/#6/#7/#8 above account for
`19% + 24.4%` ≈ **43% of all requests** — very close to the answered-search refusal rate the brief
opens with, and until now had strictly less design attention than a 6% zero-model-brand edge case
that already had a dedicated file):

- `design/extension-panel/quota-reached.html` — LIMIT_REACHED, full treatment: honest statement,
  fact row (10/day, reset time), and — deliberately, the one state that gets it — a real CTA button,
  not the quiet underline link every other state uses, because more users reach this screen than
  reach CONFIDENT · HIGH. Its design note also documents FUNNEL.md's F-1 (the quota is counted
  per-IP, not per-visitor) and why the copy avoids asserting "you've used 10 checks" until that's
  fixed — the panel should never claim an attribution the backend can't back up.
- `design/extension-panel/system-status.html` — the other four (rate-limited, unverified, connection
  failure, stalled/"still checking…") shown together on purpose, because the fix is a **severity
  split**, not four bespoke designs: three are self-serve (neutral border, one clear action) and one
  is a genuine error (gets the extension's own SKIP red, `#f87171`, never amber). The "still
  checking…" card is the direct design answer to PENDING — it's the honest continuation of the
  existing "checking…" state (`content.js:346`) for the ~1-in-4 requests that today just hang forever
  with nothing on screen.

---

## 4. Landing hero and pricing — does the promise contradict the 43%?

Read: `design/landing/hero.html`, `design/landing/pricing.html`.

**Yes, partially — the hero's structure is honest, its single worked example is not representative,
and that gap is what turns an ordinary refusal into a felt failure.**

- **What's already right.** `hero.html:122-127`'s headline and subhead do the hard thing correctly:
  *"...and a plain 'not enough data' when that's the honest answer, not a guess dressed up as one."*
  That sentence is doing real work — a visitor is told, before they type anything, that "no" is a
  possible answer. `pricing.html:134-136`'s `honesty-footer` repeats the same promise at the point of
  payment: *"If a model doesn't have enough sold data, every tier gets 'not enough data' instead of a
  number — that never changes with what you pay."* Both are the right message, in the right place,
  per OS §6.
- **What contradicts it.** The one interactive example on the page — the only thing a visitor actually
  *sees* work — is `hero.html:130-146`'s pre-filled checker: `Adidas Samba`, a HIGH-confidence WATCH
  at €33, `n 42`. It's the same demo item as `confident.html`. A page that states "we'll tell you when
  we don't know" and then only ever demonstrates knowing sets up exactly the expectation the honest
  subhead is trying to lower. Given `insufficient_data_rate` = 40.9% of *answered* searches and only
  43% of *tracked models* clear the pricing floor at all, the honest, representative first experience
  for a real visitor typing their own item is worse than even-odds to be a refusal — and the page
  currently shows them a 100%-confident success as their only reference point.
  - This isn't hypothetical: `docs/audit/FUNNEL.md` F-1 recorded that the *live* first-check
    experience for a real, cookie-free visitor typing the site's own example (`Adidas Samba`) returned
    `LIMIT_REACHED`, not the WATCH €33 the mock promises — a second, sharper version of the same
    problem: the demo shows a state the real first click frequently cannot reach at all (see §3 item 4).
  - **Recommendation, `design/`-scoped, no new visual language:** add one honest stat line under the
    hero body, reusing the exact typographic and colour pattern `hero-from` already uses
    (`hero.html:128`, 13.5px, `--text-secondary`): *"About 4 in 10 lookups come back 'not enough
    data' — we'd rather say that than guess."* This is the same number the counter-KPI already
    tracks (`insufficient_data_rate`), stated once, in the open, before a visitor hits it themselves.
    It converts the refusal from a surprise into a stated fact the product is proud of — which is the
    whole thesis of this review — instead of leaving it to be discovered as a disappointment.
  - Do **not** change the worked example away from Adidas Samba — a confident demo is still the right
    "holy shit" moment for a first-time visitor (`free-checker.tsx`'s own comment says as much,
    line 13: *"the conversion 'holy shit' moment"*) — the fix is additive honesty next to it, not
    replacing it with a refusal demo, which would just invert the same mistake.
- **CUT-list compliance, confirmed.** `pricing.html:27-31`'s own comment and the rendered feature
  list (lines 110-113) already exclude Order Planner — on OS §0.9's never-build list — and the
  Business €99 tier (AM-3, cut). No design work is being spent on cut surfaces here; counter-KPI
  clean.

---

## 5. Does `design/README.md` still map design to implementation accurately?

Spot-checked every `path:line` citation in `design/README.md` against the current file contents
(2026-09-01):

- `design/README.md:13` → `confident.html` HIGH band rule — matches `tokens.json` `confidence_ladder.HIGH`. ✅
- `design/README.md:15` → `verdict/page.tsx:139-148` (INSUFFICIENT_DATA branch) — line 139 is exactly
  `{result.verdict === "UNKNOWN" || result.verdict === "INSUFFICIENT_DATA" ? (` and the branch closes
  at line 148; line 149 opens the next branch. **Still accurate.** ✅
- `design/README.md:16` → `verdict/page.tsx:18` (UNKNOWN "NO DATA") / `:21` (INSUFFICIENT_DATA "NOT
  MEASURED") — `VERDICT_STYLE` object, lines 14-22, labels match exactly. ✅
- `design/README.md:16` → `free-checker.tsx:110-116` — line 110 is
  `) : res?.verdict === "UNKNOWN" ? (` through the closing `)` at 116. **Still accurate.** ✅
- `design/README.md:16` → six zero-model brand slugs, `seo-brands.json` lines 122/356/395/512/551/629
  (`pull-bear`/`zara`/`bershka`/`mango`/`hugo-boss`/`calvin-klein`) — verified by direct grep, all six
  line numbers correct. ✅
- `design/README.md:14` → confidence pill `.riq-conf-pill`/`.riq-honesty-note` "not yet in
  `content.css`" — confirmed: `content.css` has only `.riq-conf` (line 58) and `.riq-note` (line 62),
  no pill, no dedicated honesty block. `extension-eng` still owes this CSS. **Still accurate, still
  open.** ✅

**Where it's now incomplete, not wrong:** the README's mapping table (lines 10-18) documents four
files against four states and says nothing about `paintStatus()` (`content.js:222-229`) or the states
it renders (§3 items 4, 6, 7, 8 above) — an entire, currently-shipping code path with zero design
representation and zero mention in the file that's supposed to be the map. That's not a stale citation,
it's a **missing row**. Recommend adding two rows to the table (parked here, not edited into
`design/README.md` myself — out of this review's one-file scope):

```
| design/extension-panel/quota-reached.html | extension/content.js paintStatus() (limited branch,
  content.js:355) + extension/background.js:89 + free-checker.tsx:44,106-109 | New. LIMIT_REACHED had
  no design before this pass despite being ~19% of all requests. |
| design/extension-panel/system-status.html | extension/content.js paintStatus() (verify/rate/down
  branches, content.js:349-356) | New. Covers three self-serve states + the "still checking…" answer
  to PENDING (24.4% of rows, no timeout exists in run(), content.js:346-367). |
```

No other inaccuracies found. The four originally-documented files still map to exactly what they claim
to map to; the gap was coverage, not correctness.

---

## Summary, ranked by users affected

1. **System states (LIMIT_REACHED + rate-limit + unverified + connection failure + stalled) — zero
   design, ~43% of all requests combined, one collapsed generic component today.** Fixed this pass:
   `design/extension-panel/quota-reached.html`, `design/extension-panel/system-status.html`.
2. **Amber meaning-collision** (`free-checker.tsx:44` LIMIT_REACHED = same hex as WATCH verdict) —
   resolved in §2 with an executable, file:line change list.
3. **Non-confident extension states are already well-designed** — the one gap found (§1) is a
   one-line addition (a header status pill on `insufficient.html`/`not-covered.html`), not a rebuild.
4. **Hero's single worked example is unrepresentative of the product's real answer rate** — additive
   honest-stat fix proposed in §4, no structural change.
5. **README accuracy: correct where it documents, silent where it doesn't** — two new rows proposed,
   not made (single-file scope of this review).
6. **Uncovered-market state doesn't exist yet and shouldn't be built yet** — flagged for when
   `market-numbers.ts` actually grows a UK entry, not before.
