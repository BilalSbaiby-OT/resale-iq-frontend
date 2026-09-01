# SUPPORT-VOICE.md — the copy on the paths where we say no

Written by `customer-success`, 2026-09-01. Deliverable, not a decision: every row below is
proposed copy for the founder to approve or reject individually — nothing here has been
shipped, and nothing here is a request for approval to ship it myself.

## Why this file exists

Production, last 7 days, `verdict_logs` (source: `docs/company/METRICS.md`, `sql/metrics/`,
n and dates as cited inline):

- **44 answered searches, 18 honest refusals — 40.9%** (`insufficient_data_rate.sql`, n=44).
- **band_coverage (demand-side) = 59.1%**, n=44 — against an OS §3 target of ≥80%.
- **band_coverage_supply = 43%**, n=100 — of the 100 models on the board, only 43 have ≥8
  comparable sold items and can be priced at all (`docs/company/APPROVALS.md` A8).
- **19 of 78 rows (24.4%) in the same window are `PENDING`** — reserved, never resolved
  (`METRICS.md`, "Two things the first production run surfaced").
- Back-calculated from the same 78: `LIMIT_REACHED` = 78 − 44 − 19 = 15 → **19.2% of all
  requests**.
- **0 of 340 predictions have ever been graded** (`n_predictions_resolved.sql`, n=340).
- **One customer, ever. Refunded. Cancelled. Reason unknown** — Stripe LIVE, n=1
  (`docs/audit/proof/W36/production/prod-truth-2026-08-31.md`).

Refusing to invent a price is the product's whole thesis (`resale-iq/CLAUDE.md`: "Honesty
lives on `/methodology`"). But four in ten people who ask this product something are told no,
a fifth are told nothing at all (quota), and a quarter of all requests just vanish server-side.
The words on those three screens are doing more work than any other copy in the company right
now, and they were written as engineering log lines, not as customer sentences.

**Nothing here changes a number, a threshold, or a query.** Only the strings a human reads.

---

## 1–2. The refusal strings — current, proposed, why

Every refusal path in `demand-intel/api/routes.py` and `demand-intel/engine/sufficiency.py`,
quoted exactly, with a rewrite for founder approval.

### A. `model_too_vague` — query doesn't match a real model

`api/routes.py:844-849`
```python
"message": (
    f"'{q}' is not a product in the catalog. "
    "Use a brand and a real model (e.g. 'New Balance 530' or 'Nike Air Force 1'). "
    "A year or a brand-only search will not be mapped onto another shoe."
),
```

| | Text |
|---|---|
| **Current** | "'{q}' is not a product in the catalog. Use a brand and a real model (e.g. 'New Balance 530' or 'Nike Air Force 1'). A year or a brand-only search will not be mapped onto another shoe." |
| **Proposed** | "We don't recognize '{q}' as a specific model. Try a brand plus a model name — 'New Balance 530', 'Nike Air Force 1'. A year or a brand alone won't match anything." |
| **Why** | "the catalog" and "mapped onto another shoe" are internal implementation language (there's a literal `CATALOG` dict in `engine/model_catalog.py`) leaking into customer copy. The rewrite says the same three things — what we don't know, why in one clause, what to do — without the engineering vocabulary. |

### B. `ambiguous` — query matches more than one model

`api/routes.py:850-865`
```python
ask = (
    f"Say {parts[0]} or {parts[1]}"
    if len(parts) == 2
    else f"Say which one: {names}"
)
...
"message": (
    f"'{q}' matches more than one model on the board. {ask}."
),
```

| | Text |
|---|---|
| **Current** | "'{q}' matches more than one model on the board. Say Nike Air Max 90 or Nike Air Max 95." |
| **Proposed** | "'{q}' could mean more than one model — did you mean Nike Air Max 90 or Nike Air Max 95?" |
| **Why** | "the board" is the internal name for `model_signals` (`CLAUDE.md`: "the customer-facing board" — customer-facing does not mean customer-worded). A direct question reads as the product asking for one more word, not reporting a database match. Same information, same next action. |

### C. `no_data` / generic `UNKNOWN` — nothing matched at all

`api/routes.py:866-871`
```python
await _log_search("UNKNOWN", str(match_reason or "no_data"))
return {
    "verdict": "UNKNOWN",
    "reason": match_reason or "unknown",
    "message": f"No data found for '{q}'. Try a brand + model name (e.g. 'Jordan 3' or 'Nike Air Max').",
}
```

| | Text |
|---|---|
| **Current** | "No data found for '{q}'. Try a brand + model name (e.g. 'Jordan 3' or 'Nike Air Max')." |
| **Proposed** | "'{q}' isn't a model we track yet. Try brand + model (e.g. 'Jordan 3', 'Nike Air Max') — or see which brands we cover on /methodology." |
| **Why** | "No data found" states an absence without a reason — it reads exactly like a broken search box. "isn't a model we track yet" is honest about the actual cause (this is the catch-all branch for every non-match) and "yet" quietly signals coverage grows, which is true and is not a promise of a date. Adding the `/methodology` link gives an escape hatch beyond retyping the same query differently, which is all the current copy offers. |

### D. `thin_comparables` — model is tracked, price is not (n < 8)

`api/routes.py:889-911`, gate: `engine/listing_identity.py:41` `MIN_VERDICT_COMPARABLES = 8`
```python
"confidence_note": (
    f"Only {n_comp} comparable sold items — "
    "not enough to name a buy-below. The model is tracked; the price is not."
),
"message": (
    f"We know '{_bm}', but {n_comp} watched comps "
    "is too few to print a buy-below."
),
```

| | Text |
|---|---|
| **Current `message`** | "We know 'Nike Air Force 1', but 4 watched comps is too few to print a buy-below." |
| **Proposed `message`** | "We know 'Nike Air Force 1' — 4 watched sales is too few to trust a price (our floor is 8). Check back as more sales come in." |
| **Why** | Adds the actual floor (8), which makes "too few" a checkable fact instead of a judgment call — this is the number the extension mockup already shows (`design/extension-panel/insufficient.html:113`: "Our floor for a price is 8 comparable sales. This model has 4."), the API copy should match it. "print a buy-below" is a code-comment verb (`verdict_allows_buy_below`); "trust a price" is what the number means to the person reading it. Adds the one next action the current string doesn't have: check back — there is nothing else a reseller can do with this screen today. |
| **Current `confidence_note`** | "Only 4 comparable sold items — not enough to name a buy-below. The model is tracked; the price is not." |
| **Proposed `confidence_note`** | "Only 4 comparable sold items — below our floor of 8." |
| **Why** | This is already the best line in the file — keep "the model is tracked; the price is not" verbatim in the fuller `message`, it's the single clearest sentence of the whole product's thesis. The shorter `confidence_note` (the badge-level line, 232px wide per the extension mockup) doesn't have room for both ideas; give it the number, since that's what makes the claim falsifiable. |

### E. `data_sufficient=False` — thin 30-day sales AND thin supply

`api/routes.py:1036-1063`, message source: `engine/sufficiency.py`
```python
NOT_ENOUGH_DATA = (
    "Not enough recent sales to show a reliable signal yet. "
    "Add it to your watchlist and we'll alert you when the data supports one."
)
```

| | Text |
|---|---|
| **Current** | "Not enough recent sales to show a reliable signal yet. Add it to your watchlist and we'll alert you when the data supports one." |
| **Proposed** | *(no change)* |
| **Why** | This already does all three things: what we don't know, implicitly why (not enough sales), and a concrete next action with a promise attached (we will alert you). It's the model this whole document is arguing for. Flagging it as correct so it doesn't get rewritten by accident. |

`api/routes.py:1051` — a second, separate string for the same branch:
```python
"confidence_note": "Not enough comparable sold items to put a call on this",
```

| | Text |
|---|---|
| **Current** | "Not enough comparable sold items to put a call on this" |
| **Issue, not just copy** | This is a **generic filler string that duplicates and sometimes contradicts** the specific `message` field two lines away in the same response. When the real reason is `SALES_NOT_OBSERVABLE` ("we can't measure sales for this brand yet," below), this `confidence_note` still says "not enough comparable sold items" — which is a different, false claim: the problem isn't a low count, it's zero visibility. |
| **Proposed** | Set `confidence_note = best.get("insufficient_reason")` reworded to match `message`, or drop the field on this branch and let `message` carry the explanation alone. This is a code change, not a copy change — flagging it here because a copy pass can't fix a field that's disconnected from the reason it's supposed to summarize. |

### F. `SALES_NOT_OBSERVABLE` — brand's shelf can't be watched fast enough

`engine/sufficiency.py:71-75`
```python
SALES_NOT_OBSERVABLE = (
    "We can't measure sales for this brand yet. Its listings turn over faster "
    "than we can re-check the same shelf, so we have no honest sold count — "
    "this is not a report of zero sales."
)
```

| | Text |
|---|---|
| **Current** | "We can't measure sales for this brand yet. Its listings turn over faster than we can re-check the same shelf, so we have no honest sold count — this is not a report of zero sales." |
| **Proposed** | "We can't measure sales for this brand yet — its listings move faster than we can re-check them, so a sold count would be a guess, not a fact. This isn't a report of zero sales." |
| **Why** | Minor only: "the same shelf" is scraper-internal vocabulary (`engine/shelf.py`) for "the search results page." Everything else in this string is exactly right — it explains a real technical constraint in one clause a reseller understands, and it pre-empts the one wrong conclusion ("zero sales") a reader would otherwise draw. This is the second-best string in the codebase after D's `confidence_note`. |

---

## 3. The quota wall — `LIMIT_REACHED`

`api/routes.py:806-817`
```python
return {
    "verdict": "LIMIT_REACHED",
    "message": f"Free tier: {FREE_VERDICT_DAILY_LIMIT} verdicts/day. Starter or Pro for unlimited.",
    "upgrade_url": "/stripe/plans",
    "used_today": used,
    "limit": FREE_VERDICT_DAILY_LIMIT,
}
```

**19.2% of all requests end here** (back-calculated above). It fires mid-task, on the exact
search the person came to make — `docs/audit/FUNNEL.md` F-1 recorded this happening on a
brand-new visitor's *first* search ever, on the site's own example query ("Adidas Samba"),
because the anon quota key is IP-based and shared. That bug is not mine to fix, but it means
the words on this screen sometimes land on someone who has used zero checks, not ten — the
copy needs to hold up either way.

**Is this the right moment for an upgrade pitch?** No, for two reasons independent of the bug:

1. The current message leads with the paid plans and never states *when the person can just
   try again* — the quota resets daily, and the copy doesn't say so. A limit with no visible
   reset reads as a wall, not a pause.
2. `upgrade_url` points straight at `/stripe/plans` — a checkout page. It skips the cheaper,
   truer next step: creating a free account raises the cap from 10/day to 10/month with no
   daily reset to wait for (`api/routes.py:678-682` free trial logic), and costs nothing. The
   response never offers that option at all, only the sale.

| | Text |
|---|---|
| **Current `message`** | "Free tier: 10 verdicts/day. Starter or Pro for unlimited." |
| **Proposed `message`** | "That's your 10 free checks for today — they reset at midnight UTC. Create a free account for 10/month with no daily wait, or go unlimited with Starter." |
| **Why** | States the actual reset (removes the "wall" feeling), and offers the free option before the paid one — the smaller ask first is the honest order when someone has just been interrupted, not sold to. |
| **Current `upgrade_url`** | `/stripe/plans` (checkout only) |
| **Proposed** | Add a second field, `signup_url: "/register"`, and let the frontend render it first. Leave `upgrade_url` as-is for the plans link. This is a response-shape change, flagged here because the copy fix is incomplete without a link for the free option it now mentions. |

---

## 4. The PENDING problem — a silent failure

**19 of 78 verdict rows in the last 7 days (24.4%) are stuck `PENDING`** — reserved by
`claim_anon_verdict_quota` (`db/queries.py:2652-2704`) the instant an anonymous check starts,
then never written back by `resolve_anon_verdict` or `record_search_outcome`. By design, the
reservation counts against the day's quota **whether or not an answer ever comes back** —
the code comment at `db/queries.py:2624-2632` explains this is deliberate: refunding quota on
error "hands an attacker a free retry loop." That is a real tradeoff, correctly reasoned about
for abuse — but nothing downstream tells the person on the other end that the tradeoff exists.

**What the user actually sees when a row goes PENDING:** nothing that says so, because `PENDING`
is never a value the API returns to a client — it is purely a server-side bookkeeping state.
From outside, a request that dies mid-flight (an unhandled exception between the quota claim
and the response, a timeout, a dropped connection) looks identical to a network failure. The
frontend and extension each already have a generic fallback for exactly that shape of failure:

- Web (`src/components/tools/free-checker.tsx:62`): `throw new Error("Could not check that
  item right now")`, rendered as red text.
- Extension (`extension/content.js:350,364`): `paintStatus(t().down)` → "Could not reach
  Resale IQ. Try again in a moment."

Both are calm and honest as far as they go. **The silent part is what they don't say**: if the
request reached the server and got reserved before it failed, that attempt was already spent —
the person's next try is their 9th of 10, not a fresh first attempt, and they have no way to
know that. Someone who hits this twice in a row on a slow connection can lose most of a day's
free checks to requests that never produced an answer, with no signal that anything but "try
again" happened.

| | Text |
|---|---|
| **Current (web)** | "Could not check that item right now" |
| **Current (extension)** | "Could not reach Resale IQ. Try again in a moment." |
| **Proposed, same failure path** | "Something went wrong on our end finishing that check — it may still count against today's free limit. If your count looks wrong, email us and we'll fix it." (extension: keep the short "Could not reach Resale IQ" as the headline, add this as the sub-line before the retry link) |
| **Why** | Doesn't claim more than we know (we cannot tell client-side whether the row landed as PENDING or the request never reached the server at all) — but it stops implying the attempt was free when, by the system's own design, it usually wasn't. Naming the email contact turns a dead end into a place the discrepancy can actually get fixed, given there is no in-product way to see or dispute a quota count today (`SUPPORT-AUDIT.md` §2: no cancel/refund/dispute table exists anywhere). |

**This is not fixable by copy alone.** A quarter of all anonymous requests ending in an
unresolved state is an engineering defect — `METRICS.md` already logged it and did not fix it
in the same pass ("Not fixed in this pass; logged here because the metric found it"). The copy
above is a stopgap for how the *existing* failure reads to a customer; it should not replace
tracing why 24% of rows never resolve. Recommend that as a `P0-LIST` item, tagged
`@customer-success` per this KPI card's own loop, once the current top item clears.

---

## 5. Cancel survey and churn taxonomy

One customer, ever. Paid once. Refunded. Cancelled. **We do not know why**
(`docs/audit/proof/W36/production/prod-truth-2026-08-31.md`). There is no cancel-survey table,
no refund-reason field, and cancellation runs entirely through Stripe's hosted billing portal
(`SUPPORT-AUDIT.md` §2) — whatever Stripe's own optional cancellation prompt captured, if
anything was enabled, has never been read by this company.

The KPI card this role is scored on says *"churn reasons become P0s within 7 days."* That
requires a reason to exist in the first place. Below is the smallest survey that produces one,
plus the taxonomy that turns an answer into a `P0-LIST` line.

### The survey (max 3 questions, shown on the Stripe portal cancel-confirmation step or as a
follow-up email — sending it is the founder's call, not this file's)

**Q1 (required, single choice) — "What's the main reason you're cancelling?"**
- Couldn't get a price for the items I actually wanted to check
- Doesn't cover where I sell (only ES/FR/DE/IT/PT today)
- Too expensive for what it does
- Didn't understand what BUY/WATCH/SKIP meant, or how to use it
- Ran into a bug or something that didn't work
- Just trying it out — not cancelling because of a problem
- Something else *(free text)*

**Q2 (optional, free text) — "What were you hoping it would do that it didn't?"**

**Q3 (optional, single choice) — "Would a fix bring you back?"**
- Yes — email me if this gets fixed
- Maybe
- No

### Churn taxonomy → `P0-LIST` routing

| Q1 answer | Category | Routes to | P0 within 7d? |
|---|---|---|---|
| Couldn't get a price | `DATA_COVERAGE` | `data-eng` / `data-scientist` — this is `band_coverage_supply` (43%) made personal | **Yes** — matches an already-measured P0-severity gap |
| Doesn't cover my market | `MARKET_COVERAGE` | `product-manager` — already documented (ES/FR/DE/IT/PT only, `CLAUDE.md`) | **Yes**, if the answer names a market not on the list — confirms a real demand signal, not just a known gap |
| Too expensive | `PRICE_VALUE` | `monetization` | No — backlog, unless ≥3 customers give this answer in a rolling 90 days |
| Didn't understand it | `UX_CONFUSION` | `product-manager` / this file's own copy | No individually — but this is exactly the FAQ gap in §6 below, and 2+ instances should promote it |
| Bug / didn't work | `RELIABILITY` | engineering, whichever repo | **Yes**, always |
| Just trying it out | `NOT_READY` | log only | No |
| Something else | `OTHER` | human triage by the founder within 7 days regardless of category | Triage decides |

**Rule for this KPI card's secondary metric:** any `DATA_COVERAGE`, `MARKET_COVERAGE`, or
`RELIABILITY` answer is a `P0-LIST` item within 7 days, tagged `@customer-success`, one line,
citing the customer's own words as the evidence (never paraphrased into a bigger claim than
what was said — n=1 stays n=1 until it isn't).

---

## 6. FAQ — the questions this data says people actually have

For `src/app/support/page.tsx`'s `faq()` array. The existing 9 entries are all
account/billing/identity questions (`SUPPORT-AUDIT.md` §3); none touch the product's own
failure-mode messaging, which is what a person actually hits while using the tool. Proposed
additions, same format as the file:

**"Why won't it price my item?"**
> Two different reasons look the same on screen. Either we don't have that model in our
> catalogue yet (try a brand + model like "Nike Air Force 1"), or we have it but haven't
> watched enough real sales to trust a number — our floor is 8 comparable sold items, and we
> say exactly how many we have when we're below it. A low number isn't us being cautious for
> no reason: we'd rather tell you "not enough data" than guess and be wrong. See
> [/methodology](/methodology) for the exact formula and thresholds.

**"Which countries does Resale IQ cover?"**
> Resale intelligence — buy-below prices, sell-through, momentum — covers Vinted **Spain,
> France, Germany, Italy and Portugal only.** Price Compare searches 26 Vinted sites live for
> asking prices, but that's a live search, not intelligence — there's no sold-price history,
> no band, no verdict outside the five markets above. If you're checking a UK or US listing,
> the panel won't have a verdict for it yet.

**"Where does the buy-below number come from?"**
> `buy_below = average sold price × 0.95 × 0.70` — 0.95 removes Vinted's 5% selling fee, 0.70
> targets a 30% margin on what's left. It's on every verdict and on
> [/methodology](/methodology) in full. We log every verdict so accuracy can be checked
> honestly later; until enough of those are scored against real outcomes, we don't publish an
> accuracy number — a number we couldn't back would be worse than none.

---

## 7. ROSTER CONSULT (AM-7) — the `n ≥ 8` floor is not enforced on paid surfaces

Asked 2026-09-01 by the coordinator, per AM-7 ("a decision that touches another agent's
surface... requires consulting the whole roster"). Recorded here rather than in a new file,
because it's a direct extension of §§1–4 above: the same evidence-floor problem, on surfaces
this file hadn't looked at yet. **Recommendation only — no code, config or copy shipped from
this section; the decision itself belongs to `tech-lead` and the founder.**

**The finding, as given:** `/api/verdict` enforces `MIN_VERDICT_COMPARABLES = 8`
(`engine/listing_identity.py:41`) before it will print `max_buy_price`. `api/resale_routes.py`
— Deal Finder, watchlist, brand/model pages, opportunities, and the `&price_to=` sourcing link
(`build_sourcing_links`, `resale_routes.py:202-224`) — has no such check anywhere in the file
(confirmed: `grep comparable_n api/resale_routes.py` → 0 hits) and publishes `max_buy_price` on
**paid** surfaces regardless of sample size. Real examples: Levi's Trucker, €12.10 from 5
comparable sales; Jordan 1 Low, €78.47 from 3. Both are *below* the floor `/api/verdict` itself
would require to print anything — on the verdict surface, these two exact items would return
`INSUFFICIENT_DATA`, not a low-confidence number. The same brand+model gets a refusal on one
surface and a full-strength-looking price with zero confidence marker on another.

### 1. What a wrong buy-below actually costs, concretely

A reseller pays a real seller €10–12 for a Levi's Trucker because Deal Finder or a watchlist
alert said €12.10 was the most worth paying. If the honest number (rebuilt with more evidence)
is closer to €4.65, they didn't get a deal — they overpaid by more than double relative to what
the market can actually support, on a purchase decision our product specifically exists to make
correct. They lose real money, on advice from the feature they are paying for, at the one moment
the product is supposed to earn that payment.

**How that person describes us afterward:** not "the checker didn't have data for my item" —
that's legible as an honest boundary, the same as everything in §§1–2 above. It's "Resale IQ
told me what to pay, I lost money, and there was nothing on the screen that said the number was
a guess." That is the exact fake-confidence failure this company's own positioning claims to be
different from, landing on a paying customer instead of a free one.

**How many of the founder's first ten survive it:** we already have direct evidence, not a
guess — n=1 real paying customer, ever, refunded and cancelled, reason unknown (§5 above). A
wrong-buy-below story is disproportionately expensive at this scale: it isn't diluted by
thousands of good experiences yet, and resale communities are small enough that one bad story
travels. I would not expect a customer to stay through one of these, and I would not expect them
to say why before they leave — see §4 below.

### 2. Does the refusal thesis hold, or does it just make a worse product?

The question as posed is a false binary. The real choice was never "confident number vs. blank
surface" — it's "confident-looking number with no evidence marker vs. the same number shown
*with* one," and the company has already designed and shipped that middle path for the verdict
surface (`design/extension-panel/low-confidence.html`: MEDIUM band, n≥10, tan "honesty" colour
token, n shown at a size that competes with the price, explicit copy — "Real data, thinner
sample... the price is honest, just less precise"). Applying that same language to Deal Finder,
watchlist and brand/model rows is not emptying the product. A row reading "€41 · LOW confidence,
n=8" carries exactly as much information as it does today — it's honest about certainty, not
less full.

Where the thesis genuinely has to bend is *below* n=8. There is no honest "less certain" version
of a number the evidence doesn't support at all — Levi's at n=5 and Jordan 1 Low at n=3 aren't
"thinner," they're under the floor the product has already, publicly committed to
(`/methodology`: "LOW always says how many comparables we have," itself gated at n≥8 by
`verdict_allows_buy_below`). Below that floor the honest content is a refusal row, in the same
voice as §§1–2's `thin_comparables` copy, not a disclosed price. A board that is honestly ~57%
refusal rows (`band_coverage_supply` = 43%, `APPROVALS.md` A8) will look visibly thinner than it
does today, and that is worth saying plainly rather than downplaying — but a thinner, honest
board is recoverable as coverage grows. A bad-buy-below story from a paying customer is not.

### 3. The string — and where no string is the honest answer

**Yes, for in-app rows** (Deal Finder, watchlist, brand/model pages) — reusing the pattern
already shipped for the verdict surface, at the n≥8 floor:

| Band | Row copy |
|---|---|
| n ≥ 8, < 10 (LOW, at the floor) | "€41 buy-below · LOW confidence — 8 sold, right at our floor. Treat it as a range, not a target." |
| n ≥ 10, < 30 (MEDIUM) | "€52 buy-below · MEDIUM confidence, n=14 — real data, thinner sample." *(already shipped copy, `low-confidence.html:121-123`; extend it to these surfaces rather than rewrite it)* |
| n < 8 (below floor — Levi's Trucker, Jordan 1 Low) | "Not enough data to price yet — 5 sold, we need 8. [Watch this model →]" *(same voice as §1–2's `thin_comparables`, not a number at all)* |

**No, for the `&price_to=` sourcing link specifically.** That number doesn't stay on our page —
it becomes a hard numeric filter on a live Vinted search URL the moment someone clicks through
(`build_sourcing_links`, `resale_routes.py:224`: `f"&price_to={int(max_buy_price)}"`). No row
copy travels with a query parameter. A disclosure sentence next to €12.10 does nothing once the
number is baked into a link and the sentence is three tabs back. **This is the one place I don't
think copy can carry it, and I'd treat that as the finding, not try to word around it:** below
the n=8 floor, don't build the `price_to=` param from that number at all — link to an unfiltered
brand+model search instead. That's an engineering change to `build_sourcing_links`, not a copy
fix, and I'm flagging it here because the copy question doesn't have a safe answer without it.

### 4. The cancel-survey angle

Entirely plausible, and worse than any category already in §5's taxonomy — "couldn't get a
price" (`DATA_COVERAGE`) is a refusal a customer can read as honest; "the price was wrong and I
lost money" is a broken promise, and someone who feels that is less likely to explain why on the
way out than someone who was merely told no. Our only real customer's reason is unknown, on a
refund, with no complaint on record anywhere this audit could reach (§5, `SUPPORT-AUDIT.md` §2).
We cannot rule out that this exact gap already cost us that customer. **Adding a distinct
`PRICE_ACCURACY` category to §5's taxonomy** — separate from `DATA_COVERAGE` — is now warranted
on its own, whether or not this AM-7 decision ships anything: conflating "declined to price" with
"priced wrong" in the survey would hide the one failure mode this consult exists to catch. This
raises urgency past "log it and revisit" — it's a live, unmeasured risk on a paid, working
feature, discovered by an audit rather than a complaint, which is exactly the shape of gap that
produces silent churn.

### Recommendation

**Gate, don't disclose-without-limit, and don't let the number leave the page ungated.**

1. Enforce `comparable_n ≥ 8` on `api/resale_routes.py`'s `max_buy_price` reads — the same floor
   `/api/verdict` already uses, for one reason across the whole product rather than two.
2. For n in [8, 30) (LOW/MEDIUM), show the disclosed row copy above instead of hiding the row —
   the surfaces get thinner-looking in places, honestly, not emptier of real content.
3. For n < 8, show the refusal row, not a number — same voice as §§1–2.
4. Never build `&price_to=` from a `max_buy_price` under the floor — this is the one case in this
   whole document where I don't think wording is a safe substitute for the underlying gate.
5. Add `PRICE_ACCURACY` to the churn taxonomy in §5, distinct from `DATA_COVERAGE`.

I'd rather ship a visibly thinner Deal Finder than risk a second version of the story we may have
already lived once without knowing it.

---

## Sources

`demand-intel/api/routes.py` (lines cited inline), `demand-intel/engine/sufficiency.py`,
`demand-intel/engine/listing_identity.py:41`, `demand-intel/db/queries.py:2624-2713`,
`resale-iq/design/extension-panel/insufficient.html`, `resale-iq/extension/content.js`,
`resale-iq/src/components/tools/free-checker.tsx`, `resale-iq/src/app/support/page.tsx`,
`resale-iq/src/app/methodology/page.tsx`, `resale-iq/docs/company/METRICS.md`,
`resale-iq/docs/company/APPROVALS.md` (A8), `resale-iq/docs/audit/SUPPORT-AUDIT.md`,
`resale-iq/docs/audit/FUNNEL.md` (F-1), `resale-iq/docs/audit/DATA.md` (§6),
`resale-iq/docs/audit/proof/W36/production/prod-truth-2026-08-31.md`,
`resale-iq/dashboard/data.json`. All read 2026-09-01.
