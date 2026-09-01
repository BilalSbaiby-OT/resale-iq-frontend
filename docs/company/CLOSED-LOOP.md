# THE CLOSED LOOP — what six agents said when asked what nobody had asked

**2026-09-01.** The founder asked me to stop assigning work and actually talk to the roster. I asked
each agent the same shape of question: *what do you see that nobody has asked about?*

Six answered independently, with no visibility of each other. **They converged on one finding**, and
it is larger than anything on the P0 list.

---

## The finding

> **"The company is a closed loop. Not one bit of information has ever come back from the outside
> world about whether its central number is right."** — `tech-lead`

Trace it: scraper → SQLite → `refresh_model_signals` → `model_signals` → API → website. **Then
nothing.** Two channels exist to carry information back — the `predictions` resolver and the purchase
scorecard — and both have fired **zero** times. 340 predictions, 0 resolved. One purchase event in
company history, refunded.

Every P0 found tonight — C4, C5, C6, C8, A13, C11 — is a defect *inside* the loop. Every one was
found by an agent reading the codebase. **None was found by a customer, a market, or an outcome.**
That is not coincidence, it is structure: the only error class this company can currently detect is
internal inconsistency.

> **"Rigor without a feedback channel converts uncertainty into misplaced certainty."** You can run
> this loop for six more months, close every P0, reach zero UNKNOWN claims, and be wrong about the
> only thing that matters — with more confidence than you have today.

`finance-ops` reached the same place from the money side: *"The real constraint is not money — it is
information. You are spending capital on theory instead of evidence."*

---

## The specific thing that has never been validated

`max_buy_price = avg_price × 0.95 × 0.70`.

The `0.95` is Vinted's fee. **The `0.70` is doing two completely different jobs at once**, and
`tech-lead` and `data-eng` found this independently:

1. the reseller's margin — a **policy** choice, and
2. a silent correction for the gap between the **asking** price we observe and the **realized** price
   we do not.

Those are separate quantities with separate uncertainties, collapsed into one constant that has
never been decomposed. **If the true offer-discount is 10%, the "30% margin" we advertise is a 20%
margin, and every customer who trusts it makes less than we told them.** Nobody would know, because
the loop is closed.

The same is true of `TOLERANCE = 0.90`, `MIN_VERDICT_COMPARABLES = 8`, `MIN_OBSERVED_SALES = 5`,
`MAX_ENDED_FRACTION = 0.25`. These are the load-bearing constants of the product. **Nothing states
which are policy and which are measurement.** They are unfalsified guesses that have survived because
nothing can contradict them.

---

## The honest product is not the one we sell

`tech-lead`'s decomposition, which `data-eng` corroborated from the data side:

| output | needs | verdict |
|---|---|---|
| momentum, sell-through, days-to-sell, *"is this liquid?"* | relative **ordering** and **rates** | **defensible** — both error sources are common-mode across models and largely cancel in a ranking |
| `max_buy_price`, `avg_price_eur` | absolute **level** | **not defensible today** — both errors bias the level, in the same direction, by an unmeasured amount |

**So the honest product is a liquidity and velocity instrument** — what moves, how fast, is the shelf
thickening or thinning. That is genuinely well served by departure data, and nobody else is watching
12.7M rows across five markets every 30 minutes.

**And the product sells the other thing.** `buy_below` is the headline, the paywalled field, the
conversion moment — and it is the number resting hardest on the inference that cannot be made true
from Vinted's public surface alone.

> *"If I were choosing the sentence the company stands on, it would not be 'the Vinted price check
> that tells you when it doesn't know.' It would be closer to **'we watch what actually moves.'**
> That claim is fully supported by the data you have. The current claim is not."*

---

## It CAN be closed, and the fix is the same as the goal

The pricing half cannot be validated from Vinted's public surface. It **can** be validated from one
other source: **our own customers telling us what they actually paid and sold for.** The purchase
scorecard is that machine. It exists. It has never run.

So *"close the loop"*, *"validate the 0.70"* and *"get ten customers"* are **not three problems. They
are one.** And the ten-customer goal as currently framed does not close it — ten customers will not
generate 30 scored outcomes fast enough to falsify anything on their own. The instrumentation has to
ship with them.

---

## The unanimous, cheapest action — and only the founder can take it

**Ask the one customer who refunded why.**

- `tech-lead`: *"n=1 is infinitely more than n=0. It is the single most information-dense event in
  company history and I cannot find a record of anyone asking. `customer-success` wrote 339 lines
  rewriting refusal strings tonight; nobody wrote one email."*
- `finance-ops`: *"Worth 1000× more than chasing distribution or debating price."*

If the answer is *"the buy-below was wrong and I lost money"*, that reprioritises everything above.
If it is *"I could not find what I wanted"*, this is a different company. **We do not know which, and
it costs one message.**

I cannot send it. Contacting a real customer is a founder gate under AM-8 and should stay one.

---

## What else came out of the same conversation

**`ux-researcher`** — the anonymous visitor **already sees `buy_below` and `sell_avg` free**; the
paywall sells depth and throughput. The paying moment *is* coded (`getTrialRecap` — "we flagged N
BUYs worth ~€X") but fires only when `recap.buys > 0`, which coverage makes rare. **The mechanism for
proving ROI exists and is unreliable in practice.** And the quota bug is the **retention** bug: the
extension fires on every Vinted page, so it is the strongest day-two mechanism in the product, and
that bug disabled it for exactly the repeat browsers.

**`data-eng`** — the labelling ceiling is **7%**: only 7,247 of 103,993 observed sales carry a model
label. **Every threshold and window debate re-slices that same 7%.** It cannot grow it. Catalog
matching against an open set is the real bottleneck, and it is structural.

**`content-social`** — pulled six of its own queue items after reading `GTM.md`, which had already
reached the same conclusion: English Reddit content recruits US/GB users into a product serving
neither. It also corrected me: **"12.7M listings across 26 markets" is two different facts glued
together** — the 12.7M is the tracked corpus, the 26 markets are live pass-through search. That is
exactly the contradiction `CLAIMS.md` §1 flags, and I had repeated it in two agent briefs tonight.

**`verifier`** — *"Did you build process because the company needs it, or because you needed to
believe the company exists?"* Its judgement: keep the proofs, the KPI queries, and doer≠reviewer; cut
the tier ladder, most of the amendments, and the pretence that 21 roles have work. And the sharpest
line of the night: *"Have I built a governance system that prevents people from disagreeing with me?
Almost."*

---

## What I am doing with this

1. **Surfaced to the founder as the single most important thing from the night**, above every P0.
2. **New GAPS rows** for the specific defects it produced (C12–C15 below).
3. **Not acted on unilaterally.** Repositioning the product from a pricing tool to a liquidity tool
   is the largest decision available to this company, and it goes to the roster under AM-8 and then
   to the founder. It is not a 4am call.
