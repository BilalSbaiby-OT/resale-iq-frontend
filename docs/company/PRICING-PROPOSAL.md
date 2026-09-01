# PRICING PROPOSAL — tiers and prices, under AM-8's delegation

**Written** 2026-09-01. Tools available: read-only + `git`. **This is a proposal, not an
implementation.** No price changed in code or Stripe; no page edited. Goes to the roster under AM-7,
then to the founder.

**Method, stated up front so it can be checked:** every entitlement claim below was read from the
handler that enforces it (`demand-intel/api/routes.py`, `api/resale_routes.py`, `api/auth.py`,
`api/stripe_routes.py`, `config.py`, `db/schema.py`) on `main` at commit `dfe1582`
(2026-09-01T10:42:47+02:00), independently re-verified today rather than taken from
`docs/audit/MONETIZATION.md` or `MONEY.md` on trust — those two files are cited where they agree,
and one place is flagged below where a figure in `MONETIZATION.md` could not be independently traced
to a primary source and is marked as such. Where a number came from someone else's measurement
(`data-scientist`'s coverage counts, `finance-ops`'s ledger), it is cited with its file and is not
re-derived here.

**This is not the company's first pass at this question.** `docs/company/APPROVALS.md` A16 and the
C11 consult already ran a multi-agent AM-8 process on the repositioning question and the evidence-gate
question, with dissent recorded. This document does not repeat that process from zero — it verifies
its conclusions against the current code state, extends it to the one question it did not fully close
(a published tier table with prices), and marks plainly everywhere it agrees or departs.

---

## 0. The one-line answer

**Hold €19 / €49, do not resurrect €99, do not reposition the product.** Ship the evidence gate that
is already coded and reviewed before charging anyone. Fix two enforcement gaps this proposal found
that no prior audit closed. Sell the honesty, not a bigger number.

**How this serves the KPI:** the founder's KPI is the first ten paying customers, scored on
trial-to-paid conversion with refund rate as the counter. Every recommendation below is aimed at one
thing — a customer who pays does not get a confidently-wrong number, because that is the specific,
proven mechanism that produced this company's only refund (`docs/company/CLOSED-LOOP.md`,
`docs/company/PATH-TO-TEN.md` §5). A pricing exercise that raised or fine-tuned numbers without
closing that gap first would optimise a KPI while degrading its own counter-KPI, which OS §0.4
forbids and which is exactly what this KPI card's counter ("no entitlement promised that is not
enforced") exists to catch.

---

## 1. What the paid tiers actually deliver today — read from the handlers, not the page

### 1.1 Free / anonymous

- `FREE_VERDICT_DAILY_LIMIT = 10` (`config.py:26`) numbered `/api/verdict` views/day, keyed on a
  signed visitor cookie since `96f8fec` (confirmed merged, ancestor of `origin/main`).
- **Anonymous visitors already receive `buy_below`, `sell_avg` and `sell_median` unlocked**
  (`api/routes.py:951-971`, the `current_user is None` branch of `_gate()`). Locked fields for an
  anonymous caller are only `sell_through_rate`, `top_sizes`, `size_velocity`, `opportunity_score`,
  `reasons`, `months_supply`.
- **A logged-in free account (post-trial) sees LESS than an anonymous visitor for the same query.**
  `_gate()`'s `current_user` branch (`:998-1015`) locks `buy_below`, `sell_avg` and `sell_median`
  behind the monthly `FREE_UNLOCK_LIFETIME_BUDGET = 10` unlock budget (`config.py:55`, requires a
  verified email, `config.py:59`). An account is worse off than not having one, on the single number
  the site sells. This is `ux-researcher`'s finding from `CLOSED-LOOP.md`, and I re-verified it
  against the live code paths rather than the description: **confirmed, still true on `main` today.**
  It means the free/paid split does not read as "pay to see the number" to the one audience who could
  actually compare (someone who tries anonymous, then registers) — it reads as "pay to see the number
  again, after we hid it from you for signing up." No proposal in this document fixes this on its own;
  it is named because it directly undermines whatever pitch the tiers below make.

### 1.2 Starter — €19/mo, internal plan id `operator`

**What is sold** (`src/lib/pricing.ts:64-73`): unlimited buy/sell verdicts, "every product signal we
compute, unblurred," Deal Scanner, full market trends & brand rankings, watchlist & portfolio P&L,
fee calculator.

**What the code enforces:**

| Sold as | Enforced by | Verified state |
|---|---|---|
| Unlimited verdicts, full fields | `require_paid_plan` / `_is_paid_or_trial` on `/api/verdict` | Real. `verdict_allows_buy_below()` also applies here — `n ≥ 8` (`MIN_VERDICT_COMPARABLES`, `engine/listing_identity.py:41,44-72`) gates the price field even for a paying Starter account. **This is the one surface where the evidence floor is real today.** |
| Deal Scanner, watchlist, brand/trends pages | `_is_paid_or_trial()` in `api/resale_routes.py` (redacts for free, unredacted for paid) | Real for the free/paid split. **Not real for the evidence floor**: `grep -c "comparable_n\|verdict_allows_buy_below\|MIN_VERDICT" api/resale_routes.py` → **0**, confirmed again today. A paying Starter account can be shown a `max_buy_price` computed from as few as 3 comparable sales on these four surfaces (`GAPS.md` C11, `MIN_COMPARABLES = 3`, `engine/listing_identity.py:39`). |
| Portfolio P&L | *nothing* | **Verified myself, independently of `MONEY.md`§7 (which found the same thing): `get_portfolio`, `add_portfolio_item`, `update_portfolio_item`, `delete_portfolio_item` (`api/resale_routes.py:1200-1338`) call only `_uid(request)` — no `_is_paid_or_trial` check anywhere in any of the four handlers.** Any logged-in account, including a `free`-plan account whose 7-day trial expired, gets full Portfolio P&L today at no charge. This is sold starting at Starter €19 and given away for free. |
| "All 100 product signals, unblurred" | — | **Unproven, verging on false.** `docs/audit/CLAIMS.md` §2: the actual response shape (`VerdictResult`) carries ~25 fields; no enumeration or count constant of "100" exists anywhere in either repo, front or back end. |
| "Scraped every 30 min" / "recomputed hourly" | — | **False**, `docs/audit/CLAIMS.md` §3. Verified true cadence, from the plist and `config.py` comments the site copy was never updated against: scraping and signal recomputation both run on a **2-hour** interval, not 30/60 minutes — because the production server is 403-blocked by Vinted and a residential Mac agent does the real scraping, and the analyzer takes ~90 minutes to run so an hourly schedule silently dropped every other run. |
| Coverage: "every product signal we compute" | — | `docs/audit/DATA.md:864`: **≥97.4% of the 20,841 known brand+model pairs cannot support an `n ≥ 8` band today** (1,089 observed 7-day EU-wide sales ÷ 8 ≈ 136 models max). `data-scientist`'s board snapshot (`APPROVALS.md`) puts current supply coverage at **43.0%** of the tracked top-100, pre-A13; **62.0%** after the reviewed-but-unmerged A13 fix. |

**Net for Starter:** the mechanism that gates who pays is sound. The mechanism that gates whether a
paying customer sees a number the evidence supports is sound on exactly one of five surfaces that
carry it, and Portfolio P&L — a named, billed feature — is not gated at all.

### 1.3 Pro — €49/mo, internal plan id `power`

**What is sold** (`pricing.ts:29-56`): everything in Starter, plus Live Deal Finder, 3-week Order
Planner, per-size sell-through, REST API, "Price Compare — full buy-below intelligence on
ES/FR/DE/IT/PT, plus live asking-price search across 26 markets total."

**What the code enforces:**

| Sold as | Enforced by | Verified state |
|---|---|---|
| Live Deal Finder | `require_live_finder_access` (`auth.py:608-621`) — power unlimited, or trial with `TRIAL_LIVE_FIND_LIMIT = 5` lifetime searches | Real gate. Live-hits Vinted per search, not a scheduled 30-min scan — the "scanned every 30 minutes" wording on `pricing.ts:64,68` describes a cadence `docs/audit/CLAIMS.md` §3 found does not exist for this feature; it is on-demand. |
| Order Planner | `require_order_planner_access` (`auth.py:624-634`) — power unlimited, or trial with `TRIAL_PLANNER_LIMIT = 1` | Real gate, matches the page. |
| REST API | `POST /auth/api-key` → `require_power_plan` | Real gate, matches the page. `resale-iq/CLAUDE.md`'s "Hard no: REST API · Order Planner" is stale documentation contradicting a live, sold, enforced feature — a docs-vs-reality problem (`DECISIONS.md` A5), not an entitlement bug. Flagging so nobody "fixes" this by deleting a feature customers pay for. |
| 26-market Price Compare | `require_pro_paid` on `GET /api/compare/prices` | Real gate. **The underlying FX correctness was not** until `claude/backend-eng/fx-currency-v2` (C6 rework, merged to `demand-intel:main` per `APPROVALS.md` A20, `7942faf`) — before that fix, a non-EUR listing (e.g. Hungarian forint) could publish at face value as if it were EUR, a documented 15,000 HUF → "€15,000" case. **This is fixed on `main` now** — verified: `git log -1 -- api/resale_routes.py` and the A20 record both post-date the merge. Noted here because it was a live pricing defect on exactly this paid surface until a few hours before this proposal was written. |
| Same `max_buy_price` evidence gap as Starter's Deal Scanner | — | **Worse here, not better.** Pro is the tier whose whole pitch is more of this number, on more surfaces, live. The `&price_to=` sourcing link (`resale_routes.py:202-234`) bakes an ungated `max_buy_price` straight into a clickable Vinted search URL — `customer-success`'s finding in `APPROVALS.md`: *"no disclosure sentence travels with a query parameter once clicked."* |

**Net for Pro:** every *access* gate (who gets the feature) is real and matches the page. The *evidence*
gate (whether the number behind the feature is trustworthy) is the one thing Pro is not currently
enforcing on its highest-visibility surfaces, and Pro is the tier that costs more and asks more of a
new customer.

### 1.4 The 7-day reverse trial

Full Starter access, plus 5 lifetime Live Finder searches and 1 lifetime Order Planner run
(`config.py:64-67`). Correctly implemented as "trial = full, not throttled" and expires cleanly —
`docs/audit/MONEY.md` §3 independently called this "the best-built piece of the entitlement system,"
and I did not find anything to add against that. The gap is not in the trial mechanism; it is that
**nothing tells the user the trial is ending or has ended** — no email exists (`api/email.py` has no
trial-related template beyond the signup-confirmation line), no scheduled job references
`trial_ends_at` across 20 APScheduler jobs, and the only frontend surface is a passive sub-line on
`/account`. This is `PATH-TO-TEN.md`'s and `MONETIZATION.md`'s independently-reached #1 or #3-ranked
finding: **of the ten trials that have ended, not one person was ever asked to pay.** That is a
funnel defect, not a price question, and it sits upstream of everything in this document — see §3.

### 1.5 Business — €99/mo

Cut 2026-08-31, AM-3. Zero customers ever, no Stripe price ever existed, nothing built behind it.
**This proposal does not resurrect it.** Nothing found in this pass changes the reasoning in AM-3.

### 1.6 The `users.plan` default trap — checked, not exploitable

`db/schema.py:565`: `plan TEXT NOT NULL DEFAULT 'operator'` — a schema default that would silently
grant Starter to anyone inserted without an explicit plan. I traced every write path myself rather
than trust the prior finding: the only `INSERT INTO users` in the codebase
(`api/auth.py:414-421`, called from `register()`) always passes `"free"` explicitly, and
`RegisterRequest.plan` from the client is validated then discarded. **No live leak.** This matches
`MONETIZATION.md` §0 and `APPROVALS.md` A12's independent finding. It remains a landmine with no
regression test protecting the invariant — `APPROVALS.md` A12 already has `DEFAULT 'free'` + a test
queued as an open item; this proposal adds nothing to that beyond confirming it is still open on
`main` today.

---

## 2. What must ship before any of the ten pay — ranked, not optional

This is not a pricing table. It is the list of things that make any pricing table honest. Numbers
without this list are a nicer-looking version of the same defect that produced the one refund.

1. **Ship the evidence gate to the paid surfaces** (`claude/backend-eng/gate-paid-surfaces`,
   `bce6c47`) **together with A13** (`claude/data-scientist/a13-comparable-window`, `eba6021`), per
   the roster's own settled sequencing in `APPROVALS.md` A17 — confirmed today, **neither branch is
   merged to `demand-intel:main`** (`git merge-base --is-ancestor claude/backend-eng/gate-paid-surfaces
   main` → false). This is the single highest-priority item in this proposal: it is the difference
   between "Pro's headline number is gated the way `/api/verdict`'s already is" and "Pro's headline
   number is gated on one surface out of five." `tech-lead`'s outstanding review item — the legacy-row
   docstring inconsistency the C5 rebase exposed — should be the only thing standing between this and
   merge.
2. **Gate or remove Portfolio P&L's free access.** This proposal's own finding, independently
   confirmed against `MONEY.md`. Two honest fixes, not one preferred: (a) add the same
   `_is_paid_or_trial` check `get_watchlist` already has, closing the gap between what is sold and
   what is enforced, or (b) if the founder decides Portfolio P&L should in fact be free (it is the
   user's own purchase data, not proprietary market intelligence — a real argument), **remove it from
   the Starter feature list** so the page stops selling something free accounts already have. Either
   is a one-line change; shipping neither means Starter's page and Starter's code disagree about what
   €19 buys, which is exactly the kind of gap this KPI card's counter exists to catch.
3. **Fix the two live conversion-blockers that are not price-related but block any tier from ever
   converting:** the orphaned `PENDING` row (a request that dies mid-flight burns one of the visitor's
   10 free looks and returns nothing, 19 of 78 rows in the last 7 days per `METRICS.md`) and the
   logged-in `/verdict` page's `LIMIT_REACHED` mis-render (a signed-up, paying-eligible customer who
   hits their cap sees "NO DATA" with no upgrade prompt, `MONETIZATION.md` §3, independently
   confirmed against the source I read: `VERDICT_STYLE` has no `LIMIT_REACHED` key). Neither is this
   role's to implement (backend-eng/frontend-eng own them), but no pricing table matters if the ask
   never reaches the customer.
4. **Turn on the trial-expiry ask.** Ten people already finished a trial and were never asked for
   money — the single most legible finding in `PATH-TO-TEN.md`. This is explicitly an
   "email users" founder gate per `APPROVALS.md`'s standing list, not something this proposal or the
   roster can flip unilaterally. Recommend it be built to ready-not-sending (already drafted per
   `PATH-TO-TEN.md` §2 item 8) and placed on the founder's desk as a one-click decision alongside this
   document.
5. **Correct or remove the two false marketing claims found in §1.2** ("100 product signals,"
   "scraped every 30 min / recomputed hourly") before selling Starter on either. Both are
   `docs/audit/CLAIMS.md` findings, both independently confirmed here against the code they claim to
   describe, and both are currently live on the pricing page, the FAQ, the extension store listing and
   `llms.txt`.

**None of these are new work.** Every item above is already coded, already reviewed, or already
scoped at ≤2h by an existing audit. This proposal's contribution is naming them as pricing
prerequisites, not separate housekeeping — a price is a promise, and items 1, 2 and 5 are the specific
promises Starter and Pro currently break.

---

## 3. Proposed tier structure

**Labelled plainly, per the brief's own instruction, because this company's recurring failure is an
unlabelled constant:**

| Element | Status |
|---|---|
| €19 / €49 as the price *numbers* | **POLICY GUESS.** No willingness-to-pay data exists or can exist yet — `n_predictions_resolved = 0/340`, one lifetime paying customer who refunded (n=1, not a rate). Held, not derived. |
| `n ≥ 8` as the floor to show a price at all | **MEASURED / grounded.** `MIN_VERDICT_COMPARABLES`, already the North Star's own definition, already reviewed by the whole roster in the C11/A16 consult, already load-bearing in `/methodology`'s four-state vocabulary. Not new, not this document's invention — adopted from what already exists and is enforced on one surface. |
| `8 ≤ n < 30` (MEDIUM) as a shown-but-labelled band, not a refusal | **MEASURED.** `data-scientist`'s board snapshot: this band carries **68.9% of answered demand** (124 of 180 searches) vs. **9.4%** for the full HIGH bar (`n≥30` **and** `data_quality≥70` **and** `IQR/median≤0.60` — 2 of 100 models). Designing the product around HIGH-only would answer roughly one search in eleven. |
| The €19/€49 *split point* (what's Starter vs. what's Pro) | **PARTLY POLICY, PARTLY MEASURED.** The access gates (who gets Live Finder, API, Order Planner) are policy and unchanged by this proposal. Which *claim* leads Pro's marketing (§4) is grounded in `content-social`'s label-coverage measurement (93.2% brand-label vs. 7.0% model-label) and `monetization`'s own evidence-floor comparison (`MIN_SOLD_30D=30` is *stricter* than the price floor, so "rate claims are automatically safer" is false as evidence volume, true only as bias-cancellation). |
| The "founding rate" mechanism (§5) | **POLICY PROPOSAL**, not measured — a mitigation for the fact that no demand data exists, not a finding from data. |

### 3.1 Free — unchanged, €0

No change recommended. It is already positioned correctly as a demo/loss-leader
(`buy_below`/`sell_avg` free, up to 10/day) rather than the wrong half of a split — sell-through,
sizes, reasons and unlimited throughput remain the genuinely paid value. **One fix required, not a
price change:** close the anonymous-sees-more-than-registered-free inversion in §1.1 before it is
ever pointed out by a customer instead of an audit. The cheapest correction that does not touch
pricing: extend the same free numbered-view allowance (not the paid fields) to a logged-in free
account on its first N lookups, so creating an account is never strictly worse than not creating one.

### 3.2 Starter — hold €19/mo, `operator`

No price change. **Reposition the pitch, contingent on §2 item 1 shipping first:** "unlimited answers,
with an honesty floor" — the product tells you when it does not know, on every surface, not just
`/api/verdict`. This is not new copy invented for this document; it is `monetization`'s own
already-recorded recommendation in `MONETIZATION.md` ADDENDUM 2 ("fix the marketing, not the gate"),
which this proposal independently re-checked against the current code and did not find reason to
depart from.

**Gate structure, once §2 item 1 ships:**

| `comparable_n` | Starter behaviour |
|---|---|
| ≥ 8 | Full band, buy-below shown |
| < 8 | Honest refusal, on every surface — Deal Scanner, watchlist, brand pages, trends, not just the verdict lookup |

### 3.3 Pro — hold €49/mo, `power`

No price change. **Do not market Pro's headline pricing surfaces (Deal Finder, sourcing links,
Order Planner) until §2 item 1 ships** — this is `monetization`'s already-recorded position
(`MONETIZATION.md` ADDENDUM 2), independently re-checked here and confirmed still correct: the gap
it flagged is still open on `main` today.

**Reposition the pitch, not the price or the gate — synthesising the already-converged A16 vote
(`APPROVALS.md`) rather than re-arguing it:**

| Band | What Pro's pitch leads with |
|---|---|
| `n ≥ 30` (HIGH, ~9.4% of demand) | An actionable buy-below and the sourcing link — the only band that drives a purchase recommendation |
| `8 ≤ n < 30` (MEDIUM, ~68.9% of demand) | A real number shown as **market context with its `n` visible**, never wired into the auto-filled `&price_to=` link — a URL cannot carry a caveat once clicked |
| `n < 8` | Refusal, same as Starter |
| Every band | **Lead with rank/momentum, not price** — "moving faster than most of what we track," grounded in `content-social`'s 93.2% brand-label coverage vs. 7.0% model-label coverage, i.e. lead with the claim the data is actually deep enough to support at the granularity being shown |

Plus: sort Deal Finder and the opportunities queries by confidence tier (already agreed, unbuilt),
and surface board coverage as a stated trust signal in-product ("X of Y tracked models are
high-confidence today") rather than letting a customer discover the ceiling after paying.

### 3.4 Business — stays cut

AM-3 unchanged. Nothing in this pass produces new evidence to reopen it.

### 3.5 Founding-rate mechanism — policy proposal, cheap, not a price change

Given zero demand data exists at any price point, and given AM-8's own limit ("no change may alter
what an existing customer already pays without their consent"), the cheapest way to buy real
willingness-to-pay information without guessing a number is to **lock the current €19/€49 as a
"founding rate — holds for as long as you stay subscribed"** in checkout and ToS copy for the first
cohort, then watch real signal: does anyone convert at all, does anyone churn immediately, does anyone
ask for a discount or a higher tier unprompted. This is `monetization`'s own recorded recommendation
(`MONETIZATION.md` ADDENDUM 2); this proposal adds only that it should be framed explicitly to the
first ten as **design partners**, per `product-manager`'s already-recorded and un-retracted argument
in `APPROVALS.md`: *"An honest refusal costs you a conversion; a wrong number costs you a customer,
and we have already watched that happen once."* Telling the first ten plainly what "43% priceable
today, refusal is the honest answer roughly four times in ten, no accuracy track record yet" means,
before they pay, is not a weaker pitch than an unqualified one — it is the same €19 or €49, earned
with the honesty the product already claims as its differentiator, rather than earned by omission.

**This is a founder-gate publish decision (any live pricing-page or checkout copy change) — this
document proposes the mechanism, not its deployment.**

---

## 4. The strongest argument against this proposal

Asked for directly, so it is answered directly rather than left for someone else to find.

**The case for shipping price now and the evidence gate later:** every day §2 item 1 is unmerged is a
day zero customers are being asked for money at all, and the arithmetic in `PATH-TO-TEN.md` already
shows the company is 15–35× short of the visitor volume needed to reach ten customers on its current
motions. Delay compounds against a company that already cannot afford to wait. A counter-argument
says: gate first, sell second, but the market for a Vinted price checker will not wait for a perfectly
labelled confidence band, and a competitor whose price loads a fraction of a second faster with no
caveat at all will look more confident, not less trustworthy, to a customer who has no way to check
either claim. **On this view, this proposal's own emphasis on the gate is itself a form of the
"process that prevents disagreement" `verifier` warned about** — treating internal correctness
(does the code match the evidence standard) as more urgent than external validation (does anyone want
this at any price), when the company's actual bottleneck, per `PATH-TO-TEN.md`'s own arithmetic, is
visitors, not honesty.

**Where I land, stated as a disagreement rather than resolved by asserting it away:** I do not think
this changes the recommendation, for a reason specific to this company rather than pricing theory in
general — **it already ran this experiment once.** The one customer this company has ever had paid,
acted, and refunded, and `CLOSED-LOOP.md` records that nobody has ever asked why, but the shape of the
mechanism (a confident number on a thin sample, sold at the moment of decision) is not hypothetical
here — it is the only data point the company has. Shipping more of exactly that mechanism to nine more
strangers before it is closed is not "delay vs. speed," it is "repeat the one experiment that has
already produced one bad outcome, hoping for a different result nine more times." That argument does
not generalise to every company — a company with ten refunds and no theory of why would have less
standing to make it than a company with one refund and a specific, coded, already-half-fixed
mechanism identified as the likely cause. **This is the specific circumstance under which I think the
gate-before-price ordering is right, and it is a testable claim, not a permanent rule**: if §2 item 1
ships and the founding-rate cohort still refunds at a similar rate, that would be real evidence this
proposal's diagnosis was wrong, and the honest response would be to revisit it rather than defend it.

**A second, smaller self-critique:** holding €19/€49 as "no evidence to move it" is itself a policy
choice dressed partly as a finding. The only grounded cost anchor on disk is `LEDGER.md`'s: one
Starter customer at known infra cost (€5.83/mo known, Claude/API spend still UNKNOWN and "probably
dominant") leaves €13.17 margin; one Pro customer leaves €43.17. That is a **cost floor**, not a
demand signal, and `LEDGER.md` says so explicitly. A different, equally defensible reading of the same
absence of data is "price lower to maximise the chance of getting any signal at all from ten
strangers" — I did not find evidence to prefer holding over lowering, only less reason to move the
number at all than to leave it. **I could not independently verify the "€190/mo-at-10-customers
breakeven" and "hand-sold, not funnel" figures relayed inside `MONETIZATION.md` ADDENDUM 2** against
a primary `finance-ops` or `tech-lead` artefact — they appear only as a paraphrase inside another
agent's addendum, so I have not repeated them as facts in §3, only the `LEDGER.md` numbers I could
trace myself.

---

## 5. The repositioning question — both price sheets

**This is not new ground — `APPROVALS.md` A16 already ran a full AM-8 consultation on exactly this
question, with `tech-lead` (origin and, after a self-correction, the deciding vote), `ux-researcher`,
`monetization` and `content-social` all weighing in, and reached a converged answer.** This section
verifies that answer against the current code rather than re-arguing it from zero, because the brief
explicitly asks for both sheets.

**The question, restated:** `max_buy_price = avg_price × 0.95 × 0.70` infers a sale from a listing's
disappearance and prices off that inferred sale. `tech-lead`'s finding, corroborated by `data-eng`:
that inference biases the **absolute level** by an unmeasured amount and cannot be validated from
Vinted's public surface (relists — a seller re-listing something that is not selling — kill the old
listing id and read as a departure, which **inflates the apparent liquidity of exactly the items a
reseller most needs warning about**, so this is not simple noise that cancels in a ranking).
**Ordering and rates are more defensible** because the same bias is common-mode across models, though
`monetization` correctly narrowed this: it is a bias argument, not an evidence-volume argument —
`MIN_SOLD_30D = 30` is a *stricter* floor for a rate claim than `n ≥ 8` is for a price.

### 5.1 Sheet A — pricing tool (current architecture, gate shipped)

| Tier | Price | Headline claim |
|---|---|---|
| Free | €0 | "See the number, on the models we can price" |
| Starter | €19 | "Unlimited answers, with an honesty floor" |
| Pro | €49 | "Everything in Starter, plus sourcing at volume — HIGH band drives the buy call, MEDIUM is market context" |

### 5.2 Sheet B — liquidity/velocity instrument (full reposition)

| Tier | Price | Headline claim |
|---|---|---|
| Free | €0 | "See what's moving, free" |
| Starter | ~€19 (unvalidated) | "Rank, momentum and sell-through across the board — priced context, not a promise" |
| Pro | ~€49 (unvalidated) | "Sourcing engine on the velocity signal, live search across 5 markets, price shown as a labelled secondary anchor" |

### 5.3 Recommendation: **Sheet A, with Sheet B's marketing lens borrowed, not its architecture**

This is `tech-lead`'s own final position in the A16 vote (`APPROVALS.md`), verified here rather than
assumed: it **withdrew** the "errors are common-mode and cancel" argument for repositioning after
finding the relist problem, and its replacement argument was not "keep the price claim because it is
right" — it was **"the level error has no path to verification from Vinted's data at all; the
ordering error does (a bounded afternoon of relist-checking a labelled sample)."** Choosing between
two unfalsified hypotheses by argument, its own words, is *"precisely the failure mode I spent the
brainstorm warning about."* Its recommendation, and the one this proposal adopts without
modification, was to **settle A16 empirically** — put both artefacts in front of the next ten real
people and ask which they would pay for — rather than resolve it by argument now, a second time, in a
pricing document.

**What tips it against a full reposition, quantified rather than asserted:** `tech-lead` counted the
cost nobody else had — 20+ customer-facing surfaces carry `buy_below`, the North Star KPI
(`weekly_trusted_checks`) is *defined* on `said_buy_below` and would go to zero permanently rather
than merely degrade, and **the only two feedback mechanisms that exist at all**
(`outcome_calibration.py`, `prediction_eval.py`) both grade price calls — repositioning away from
price would orphan the only channels through which reality could ever contradict the company, which
is the opposite of what CLOSED-LOOP.md is asking the company to do. *"Relabelling costs days.
Repositioning is not a repositioning, that is a rebuild."*

**What Sheet B correctly wins on, and what this proposal recommends taking from it without the
rebuild:** lead the marketing copy — homepage, Pro's pitch, the extension panel — with rank and
momentum, at brand/category granularity where `content-social` measured 93.2% label coverage, deep
enough to support a confident claim on nearly the whole board. Keep `buy_below` priced, gated, and
sold — it is the paying moment and the extension's whole reason to sit beside Vinted's Buy button
(`ux-researcher`'s finding, and `getTrialRecap`'s existing code already depends on it). **This is not
a compromise invented for this document — it is the literal position all four consulted agents
converged on** in `APPROVALS.md`'s own words: *"Three of four say lead with velocity and keep the
price. The fourth says keep the price and make it velocity-driven. Those are the same product from
two directions."*

**One thing this proposal adds that A16 did not fully close:** `tech-lead`'s own suggested longer-term
fix — making the risk term in `max_buy_price` a function of measured departure velocity instead of a
flat `0.70` — directly addresses `GAPS.md` C12 (the `0.70` silently doing two jobs: reseller margin
and an uncorrected asking-vs-realized gap) and would make the *price* claim itself more defensible
without repositioning the product away from selling one. It is engineering work, not a pricing
decision, and belongs on `data-scientist`'s or `tech-lead`'s roadmap rather than in this document —
flagged here because it is the one lever that improves both sheets at once rather than trading one for
the other.

---

## 6. What this document does not decide

Per AM-8's own limits and OS §0.10, none of the following is authorised by this proposal, however it
is received:

- No price changes in Stripe or in `pricing.ts` — this document is read-only-tools output.
- No pricing-page, checkout, or ToS copy publishes without a separate publish gate.
- No email to any user, including the trial-expiry ask this document recommends building
  ready-not-sending.
- No `MIN_VERDICT_COMPARABLES`, `MIN_SOLD_30D` or other KPI-definition constant changes — those stay
  founder gates per OS §3, unaffected by AM-8's pricing delegation.
- Business €99 stays cut; nothing here reopens AM-3.

**What is proposed for the roster and the founder to act on:** merge §2 items 1–2 before charging
anyone under the current tier claims; adopt §3's held prices with the pitch changes described; adopt
§5.3's recommendation to defer the architecture question to real customer signal rather than a fourth
round of internal argument; decide on §3.5's founding-rate framing as a publish gate.

