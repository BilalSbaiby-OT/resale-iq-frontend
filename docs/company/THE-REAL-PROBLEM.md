# THE REAL PROBLEM — corrected

**2026-09-01. First written after the founder told me to audit myself. Then corrected, because
`backend-eng` checked my headline and it was wrong in exactly the way I had spent the day
criticising in others.**

---

## The correction, first

I published: *"62% of all checks return no actionable answer — PENDING is 38%."*

**That was a true number about a false referent.** It was an all-time average dominated by a dead
incident:

- All **165 PENDING rows** fall between **2026-08-23 and 2026-08-29**. **146 of them landed on a
  single day.** It was an incident, not a rate.
- The cause was found, fixed and merged **earlier the same day** I "discovered" it —
  `demand-intel@8d48176` (08:54 UTC) and `d3e7fd9`/`b293e2b` (16:31–16:33 UTC).
- **Since that fix: 22 checks, ZERO PENDING.**

**This is the same mistake as reading a sandbox Stripe key and calling production test-mode.** A real
number, a wrong claim about *now*. I made it while writing the post-mortem about making it.

`backend-eng` refused to ship a redundant fix for an already-fixed bug, and said so: inventing a
commit to look responsive **would have been manufacturing proof**. That is the correct instinct and
it is worth more than the fix would have been.

## What the product actually returns NOW

Since the fix deployed, 2026-09-01 16:33 UTC:

```
WATCH      10
UNKNOWN     7
SKIP        5
BUY         0
PENDING     0
            ── 15 of 22 actionable = 68%
```

## What survives the correction — and it is still serious

**1. The product has said BUY six times in its life. The last was 2026-08-20, twelve days ago.**
Zero in the 22 checks since the fix. **This stands and it is the real finding.**

**2. About a third of current checks return UNKNOWN** (7 of 22). Far better than the 62% I claimed,
still high for the one question the homepage promises to answer.

**3. 92% of anonymous visitors run exactly ONE check.** 60 visitors over 7 days, median 1, and only
2 ever reached the 10/day cap. **The founder's instinct — that nobody would register when 10 free
checks a day is plenty — was right in conclusion and wrong in mechanism.** The cap was never the
reason. People try once and leave.

**4. 449 internal file-touches today against 76 customer-facing.** Nearly 6:1 against the customer.
That number is about me and it does not move.

## The revised question

Not *"why does the product fail?"* — it mostly does not, now. It is:

**A visitor gets one answer, and that answer is "wait" (68% of actionable results), "don't" (33%),
or "I don't know" (32% of all). It has not once been "yes" in twelve days.**

Whether that is a calibration problem or an honest description of the market is **the** open
question, and it is the founder's to weigh:

- If the thresholds are wrong, we are hiding buys that exist.
- If they are right, **we are selling a tool that tells people "no" nearly every time** — which is
  honest, and may not be a business.

## Still open

- **165 historical PENDING rows remain in production** and will keep poisoning any all-time average
  exactly as they poisoned mine. `scripts/find_orphaned_verdicts.py --apply` exists; writing to
  production was not authorised for that task.
- **`frontend/check.html` hard-codes "3 checks/day"** against a real limit of 10.
- **A conflict I did not resolve:** the brief asked that a failed check not burn the visitor's quota.
  `backend-eng` flagged that this contradicts a shipped, tech-lead-approved anti-abuse decision — an
  error-triggered refund is a free retry loop for anyone who can trigger the error deliberately. It
  surfaced the conflict instead of silently reversing either side. **That is what should happen, and
  the decision is a roster/founder call.**

## The lesson worth keeping

**Every all-time metric in this company is a trap while a single bad day sits in the table.** Ask
"since when?" before "how much?". I did not, published a headline on it, and froze marketing on the
strength of it.
