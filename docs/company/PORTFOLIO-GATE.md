# PORTFOLIO-GATE — should Portfolio P&L be paid, free, or something else

**Written 2026-09-01 by `product-manager`**, on a founder-relayed instruction ("speak with product
manager and sub agents related"). AM-7 applies (this touches `monetization`, `backend-eng`,
`ux-researcher`, `customer-success`, `finance-ops`). **No code changed. Nothing published. This is
the discussion document, not the decision record** — the founder asked to talk it through first.

---

## 0. A tooling limit that shapes this whole document, stated up front

I do not have a live channel to the other agents. Per `AMENDMENTS.md` AM-8a: *"No agent has a
messaging tool. Every consultation tonight went CEO → agent → CEO."* I am not the CEO session
tonight, and I have no Task/spawn tool in this session either — so I could not even do that. What
follows as each agent's "position" is **their own already-written artifact**, read by me tonight,
not a live answer to this specific question. Where an artifact answers this exact question, I say
so and cite it. Where it doesn't, I say that too, rather than inventing a vote for an agent who was
never asked. This is the AM-8a caveat, applied honestly rather than quoted and ignored.

I also do not have working `sqlite3` access to any real data in this session — tried and confirmed,
not assumed (see §1). The usage number below is a citation of someone else's prior measurement, not
a query I ran tonight.

---

## 1. The usage number, its source, and why it is weaker than a five-minute answer

**The only usage figure that exists anywhere on disk:**

> `SELECT COUNT(*), COUNT(DISTINCT user_id) FROM portfolio_items` → **1 row, 1 distinct user_id**,
> dated **2026-08-18**.

Source: `docs/audit/MONEY.md:280`, measured 2026-08-31 by the Phase-1 `data-eng`/`data-scientist`
audit pass. Independently corroborated by the same session's raw row-count sweep,
`docs/audit/DATA.md:79` ("`deploys` · `activity_logs` · `password_resets` · `portfolio_items` | 1
each"). Two independent queries against the same file agree — that part is solid.

**What is not solid: which database that is.** `docs/audit/DATA.md` §0.1, in the same file, states
plainly: *"The local 56 GB database is NOT what production serves, and it is 8 days stale... Every
local number in this file describes a dead, divergent snapshot of a corpus production has since
replaced."* Production lives on a Hetzner container (`/app/data/demand_intel.db`) that **no agent
audit has ever read directly** — `DATA.md` marks the equivalent production figures `UNKNOWN (no
read access)` throughout. The one documented, read-only path to a real production row count is
`ssh resaleiq docker exec <container> python3 scripts/restore_db.py` (a dry-run that copies to a
scratch file, prints row counts including `portfolio_items`, then deletes itself —
`docs/eng/RELIABILITY.md:284-290`, `:332-345`). `RELIABILITY.md` explicitly says not to run this
without separate authorization ("**Do not run this against production tonight**"), and I do not
have the SSH credential (`resaleiq`) in this session's tool list regardless. I did not attempt it.

**I did try to get a fresher read myself, on the local snapshot, and it failed — recorded as
evidence, not assumed away:**

```
$ sqlite3 -readonly /Users/bilalsbaiby/work/demand-intel/demand_intel.db "SELECT 1;"
1
$ sqlite3 -readonly /Users/bilalsbaiby/work/demand-intel/demand_intel.db "SELECT COUNT(*) FROM portfolio_items;"
Error: in prepare, unable to open database file (14)
```

`SELECT 1` (touches no table) succeeds; every real query against the 56 GB file fails to open it.
This matches the task brief's premise that I "have `Bash(git *)` but not `sqlite3`" — my declared
tool list (`.claude/agents/product-manager.md`) is `Read, Grep, Glob, Edit, Write, Bash(git *)`, and
whatever is enforcing that here blocks the query even though the `sqlite3` binary itself is present.
So the number in this document is **entirely a citation of `MONEY.md`/`DATA.md`, not a
re-verification** — flagging that distinction rather than presenting it as freshly confirmed.

**What the number is worth anyway.** At the time that one row was written (2026-08-18), the company
had 16 total users, 0 Stripe-linked, and `DATA.md`'s funnel section records **zero signups in the
11 days immediately before the 2026-08-31 audit**. A single row, on the day the company had almost
no users and no revenue, reads much more like a test entry (founder's own, or an agent's, during
build) than organic usage — but that is my inference from the surrounding numbers, not a fact I can
prove, and I am labelling it as inference for exactly that reason.

**Bottom line on the number:** best available evidence says **usage is at most 1 account, almost
certainly not a real customer, measured on a stale local snapshot that may not match production at
all.** This is close enough to zero that the brief's own test applies — *"if it is zero, options 1
and 2 cost nothing and this is a five-minute decision"* — but I am not willing to call it exactly
zero on a number I could not re-verify. **Recommend `devops` run the documented dry-run
`restore_db.py --list`/verify against production before this ships**, not before this
recommendation is made.

---

## 2. The two facts, re-verified tonight rather than taken on trust

**E1 — Portfolio enforces nothing, confirmed live on `origin/main` right now**, not just in an
audit file. I read `git show origin/main:api/resale_routes.py` myself tonight (`demand-intel`,
commit `95cfc07`, current tip): `get_portfolio`, `get_portfolio_stats`, `add_portfolio_item` all
call only `_uid(request)`. No `_is_paid_or_trial`, no plan check, anywhere in the four handlers
(`:1294-1338+`). This is unchanged by today's `gate-paid-surfaces`/A13 merge, which fixed the
**evidence** floor (`n≥8`) on Deal Finder/watchlist/brands/trends/KPIs — a completely different gate
from the **entitlement** (paid-vs-free) check Portfolio is missing. Both `docs/audit/MONEY.md:280`
and `docs/company/PRICING-PROPOSAL.md:75` (monetization, independently re-derived from the same
handlers) found the identical gap. Three independent reads, same answer, most recent one is mine,
tonight, against the actual current tip.

**E2 — registering makes the product worse, also re-confirmed.** `PRICING-PROPOSAL.md` §1.1: an
anonymous visitor gets `buy_below`/`sell_avg` unlocked (`api/routes.py:951-971`); a logged-in free
account has those same fields locked behind a 10-use lifetime budget (`:998-1015`). Monetization
states it re-verified this against the live code rather than the description, and traces it to
`ux-researcher`'s original finding in `CLOSED-LOOP.md`. I did not re-run this check myself tonight
(out of this task's scope — it's a separate gate from Portfolio's), so I am relaying, not
re-verifying, on this one point.

**The evidence gate did ship today, and it changes what any paid tier is selling.** Confirmed via
`git log`: `claude/backend-eng/gate-paid-surfaces` (tip `1578040`) is an ancestor of `origin/main`
(`git merge-base --is-ancestor` → true), merged as part of `95cfc07`. So the brief's framing is
right: "more buy-belows" is no longer an uncontested pitch for any tier — Deal Finder, watchlist,
brand/model pages and the KPI header all now withhold `max_buy_price` below 8 comparables, same as
`/api/verdict` always did. Whatever Portfolio's tier decision is, it is not competing against a
richer buy-below pitch than it used to.

---

## 3. What each named agent's own artifact actually says about THIS question

| Agent | Position found, with citation | Does it address Portfolio specifically? |
|---|---|---|
| `monetization` | `PRICING-PROPOSAL.md` §2 item 2: **"Gate or remove Portfolio P&L's free access."** Presents two honest fixes without forcing one: (a) add the same `_is_paid_or_trial` check `get_watchlist` already has, or (b) if the founder decides Portfolio should be free ("it is the user's own purchase data, not proprietary market intelligence — a real argument"), drop it from the Starter feature list. Lists closing this gap as one of five things that **must** ship before charging anyone honestly. | **Yes, directly.** This is the closest thing to a standing vote that exists, and it leans toward gating (it's in the "must ship" list) while explicitly not foreclosing option 2. |
| `ux-researcher` | `CLOSED-LOOP.md`: *"the anonymous visitor already sees `buy_below` and `sell_avg` free; the paywall sells depth and throughput."* | **No — this is about the `/api/verdict` paywall, not Portfolio.** The brief's line "maybe Portfolio is the retention hook, not the paywall" is the brief's own extrapolation of this quote, not a claim `ux-researcher` made about Portfolio. I could not find or produce a `ux-researcher` position on Portfolio specifically. **Recorded as UNKNOWN, not assumed in either direction.** |
| `customer-success` | Not found. `CLOSED-LOOP.md` is explicit that **nobody has ever asked the one refunded customer why**, and that email is a standing founder gate, unsent. `customer-success`'s file (`SUPPORT-AUDIT.md`) exists but I did not find a Portfolio-specific position in the sections I could reach efficiently tonight. **Recorded as UNKNOWN**, not "silence = agreement" (AM-8 rule 1: silence is not assent). |
| `finance-ops` | `LEDGER.md`: MRR = €0.00, one customer ever, refunded and cancelled, gross margin per plan UNDEFINED. No Portfolio-specific position found. What it does establish: **this decision has zero current revenue at stake either way** — there is no MRR to protect by gating and no MRR to gain by freeing, today. | No direct position; the number above is load-bearing context, cited with its file. |
| `backend-eng` | Not consulted live (no channel). Feasibility is not in question: the fix, if gating, is one line matching a pattern `backend-eng` already shipped tonight for `get_watchlist` (`_is_paid_or_trial()` on read, redacted fields on write) — precedent exists in the same file, same session. | Inferred from precedent, not asked directly. |
| `legal-compliance` | Not consulted. AM-8 requires tier/pricing changes to "survive `legal-compliance`'s read." **Not done for this decision.** Flagging as an open item before anything ships, not a blocker to having this conversation. | Open. |

---

## 4. My recommendation

**Gate it — option 1 — with one addition neither the brief nor `PRICING-PROPOSAL.md` names.**

**The case for gating, in order of how much weight I give each point:**

1. **It costs nothing measurable today.** Best-available usage is 1 account on a stale snapshot,
   almost certainly not a real customer (§1). MRR is €0.00 (`LEDGER.md`). There is no visible person
   to take anything away from.
2. **It closes an honesty gap the company has already named three times** (`MONEY.md`, `GAPS.md`
   E1, `PRICING-PROPOSAL.md`, and my own read tonight) as blocking the ability to charge anyone
   truthfully. `monetization`'s framing is exactly right: *"we cannot charge for a feature that is
   not gated — the first of the ten customers would be paying for something the free tier already
   has."*
3. **The fix already has a template in the same file, shipped tonight**, for `get_watchlist`. This
   is not new engineering risk.

**The strongest argument against gating it, stated as strongly as I can:**

`monetization`'s own option (b) is a real argument, not a token alternative: Portfolio's data is
the **user's own** cost/sale entries, not proprietary market intelligence the company scraped —
that's a different kind of value than `buy_below`, and paywalling someone's own bookkeeping is a
weaker justification than paywalling the company's market data. Combined with E2 (registering
already makes the product worse once), stacking a third paywall onto a personal-data feature could
plausibly read as nickel-and-diming exactly when the company needs its first ten people to trust
it. If Portfolio usage is currently ~0 in production too, that could equally be read as **"nobody
has found it, not that everyone who found it was blocked by price"** — gating an unused feature
doesn't prove the gate was the reason it was unused, and free-and-unused costs nothing either.

**Why I land on gating anyway:** the two readings ("nobody found it" vs "gating would have blocked
them") are both unfalsifiable from a single stale row, and the tie-breaker is that gating is the
**reversible, cheap** choice — turning on a check that has a working precedent in the same codebase
costs an afternoon and is a one-line revert if the founder disagrees later. Leaving Portfolio free
either forces monetization to also strike it from the Starter page (real copy work, real risk of
disagreeing with the pricing page again) or leaves the page and the code disagreeing about what €19
buys — the exact defect this KPI card's counter (`features_shipped_without_a_PRD` / entitlement
mismatch) exists to catch. **Gate now; free it later is a one-line revert if evidence says
otherwise. Free now, gate later is two changes (code + copy) and a worse look.**

**The addition — a reason to keep Portfolio alive at all that nobody in this file has made yet:**
`CLOSED-LOOP.md` is the single most important finding on record tonight — the company has never
received one bit of outside validation of `max_buy_price`'s central `0.70` constant, and the
purchase-scorecard mechanism that could close that loop "exists" only conceptually; it has fired
zero times. I checked tonight (`grep -rn "portfolio_items" engine/*.py scripts/*.py`) and confirmed
**nothing in the analyzer or calibration code reads `portfolio_items` at all** — `sold_price_eur`,
`cost_eur`, `realized_profit` and `days_held` are captured and then never used for anything except
the user's own dashboard. That is the company's only schema shaped like real ground truth (a real
person's real cost and real sale price), sitting unused, in the same session that produced
`CLOSED-LOOP.md`'s warning that the company is optimizing a number nothing can contradict. **This
is a separate PRD-worthy idea, not a decision for tonight**: wire Portfolio's `sold` transitions
into the outcome/calibration pipeline `data-scientist`/`tech-lead` already own, so a paying Starter
customer who logs a real sale becomes the company's first non-inferred data point on whether `0.70`
is right. That reframes Portfolio from "a feature we bundled into Starter" into "the company's only
lever on its own biggest unanswered question" — which is itself an argument for keeping it inside
the paid tier (so a customer has a reason to keep entering real numbers) rather than an argument for
giving it away.

---

## 5. What is explicitly NOT decided here

- No code changes. No entitlement check added. No pricing-page copy touched.
- No confirmation that production usage matches the local snapshot — **recommend `devops` run the
  documented `restore_db.py` dry-run against production before anything ships**, per §1.
- No `legal-compliance` read has happened on this specific change, per AM-8's own requirement.
- No live vote from `ux-researcher`, `customer-success` or `backend-eng` on this exact question —
  recorded as UNKNOWN per agent in §3, not inferred as agreement.
- The "wire Portfolio into the calibration pipeline" idea in §4 is a new idea, unscoped, with no PRD
  — it needs one before it is anything more than a suggestion, per this role's own standing rule
  ("nothing is built without a PRD naming the metric it moves and its kill criterion").

**This is the founder's conversation to have next, per the brief's own instruction not to
implement anything.**
