# RELEASE NOTE (DRAFT — NOT PUBLISHED) — A13 (comparable window) × `gate-paid-surfaces` (n≥8 floor)

**Status: DRAFT.** Not published, not merged, not deployed. This goes to the roster under **AM-7**
(consult before anything product-wide) with the 37 % figure on the table before anything ships.
Publishing it — to a release channel, to users, or to production — is a separate founder/roster gate.

**Written** 2026-09-01 by `product-manager`, from `data-scientist`'s joint measurement
(`docs/company/RELEASE-A13-GATE.md`), re-run cold immediately before drafting this note.

---

## 0. This note quotes a proof run, not a brief

Numbers in a release note about this pair of changes have a **shelf life measured in hours** — the
reproduction control that checks whether the BEFORE arm still reproduces the stored board fell from
90/100 exact to 64/100 exact in the eight hours between two measurements on 2026-09-01. Every figure
below is quoted from a `proof.sh` run, not copied from an earlier document.

**Proof:** `docs/audit/proof/W36/a13-gate-joint/proof.sh`, re-run cold at **2026-09-01T08:57:18Z**
against production (`/app/data/demand_intel.db`, `mode=ro`, backend container
`ph5clxk9hmghspv65pdkvak9`). Output:

```
== container: ph5clxk9hmghspv65pdkvak9-082213317483 ==
== supply-side (Q1-Q4) ==
 board snapshot   : 2026-09-01 07:51:40 | rows 100
 repro control    : 64/100 exact / 79/100 +-1
 deployed has C5  : True | gate divergences: 0
 Q1 movers        : 41 | withheld 19 | visible 22
 Q2 Levi's Trucker: n 3 -> 5 | 4.65 -> 12.1 | survives gate: False
 Q3 visible n     : 22 | median -3.04 | IQR -21.11 17.64 | range -65.76 91.83
 Q4 shows price   : 63 / 100 | blank 37
 counter MIN(n)   : {'before': 8, 'after': 8} (must be 8 both arms)
 counter n-decrease: 0 (must be 0)
 band_evidence_p50: {'before': 14.0, 'after': 12.0} (DESCRIPTIVE, never a gate)
 ASSERTIONS: PASS
== demand-side (searches, replay) ==
 all_time_answered.BEFORE_stored : band 113 / n 180 (thin 44, nomatch 23), band_evidence_p50 12
 all_time_answered.AFTER_a13     : band 146 / n 180 (thin 11, nomatch 23), band_evidence_p50 13.0
 last_7d_answered.BEFORE_stored  : band 19 / n 44 (UNKNOWN as a rate — below the n=100 floor)
 last_7d_answered.AFTER_a13      : band 29 / n 44 (UNKNOWN as a rate — below the n=100 floor)
```

Every assertion passed cold, on this run, at this timestamp. The numbers below are this run's numbers.
If more than a few hours pass before this note is published, **re-run `proof.sh` again** — do not
reuse this output.

---

## 1. What ships, in one line

Two changes going out **together, in one release**: **A13** stops discarding the 30-day comparables
window when a model only cleared 3 in 7 days (so more models find enough evidence to be priced), and
**`gate-paid-surfaces`** enforces the existing `n ≥ 8` evidence floor on `/api/verdict` (not
elsewhere — see §4). They ship together because shipping A13 alone would briefly publish prices
computed from as few as 3–7 comparables to paying users before the floor caught up.

---

## 2. The movers — 41 total, 19 withheld, 22 visible

Of the 100 tracked models, **41** have their `max_buy_price` change under A13. Of those:

- **19 are withheld** by the `n ≥ 8` evidence floor — their post-A13 `comparable_n` is 3–7, so the
  gate silences them and a customer never sees the swing (or the price at all).
- **22 remain visible** — their post-A13 `comparable_n` is ≥ 8, so the new price publishes.

This corrects an earlier reading of **18 withheld / 23 visible**. The 1-model difference is a
reproduction-control drift, not a code change — `comparable_n` moves ±3pp between rebuilds with no
code touched (§0). It does not change which 22 are visible in this run.

---

## 3. The median move — **not +20.3 %.** −3.04 %, two-sided, and half of it is bad news for a customer

**Population: the 22 visible movers, n = 22, this proof run.**

| statistic | value |
|---|---:|
| median move | **−3.04 %** |
| IQR (p25 → p75) | **−21.1 % → +17.6 %** |
| range | −65.8 % → +91.8 % |
| direction | **11 down, 11 up** |

**An earlier figure of "+20.3 %" does not reproduce and is retracted.** `data-scientist` could not
construct it from any of seven population definitions measured against production. The nearest
constructible number is **+17.7 %**, which is the median of the **11 rising movers only** — a
different, narrower population than "the median move." Whatever produced +20.3 % is not identifiable
and must not be repeated.

**The sentence this note leads with about direction:** *eleven of the twenty-two visible corrections
are downward, median −21.7 %.* The 7-day window was pricing those models **too high**. Two examples,
this run:

| brand / model | before | after | move |
|---|---:|---:|---:|
| Adidas Gazelle | €53.98 | €36.04 | −33.2 % |
| Balenciaga Le Cagole | €348.65 | €119.37 | −65.8 % |

**Half of A13's visible corrections tell customers they have been overpaying.** A reseller who acted
on the old `buy_below` for `Adidas Gazelle` or `Balenciaga Le Cagole` was told a price that the wider
evidence now says was too high. This is the single most important sentence in this release note and
it is not being buried under the coverage-gain framing.

---

## 4. `Levi's Trucker` — CONFIRMED WITHHELD, and it is not the largest move

```
n before: 3   n after: 5   max_buy_price: €4.65 -> €12.10   move: +160.2 %   gate: WITHHELD (5 < 8)
```

**5 comparables is below the 8 floor either way** — whether you read the stored board's 3 or A13's 5,
both fail `n ≥ 8`, so `Levi's Trucker` does not publish under the combined release.

**It is not the largest withheld move.** `Stone Island Marina` moves **+513.4 %** (`n` after = 7,
still below 8) and is also withheld. Both are silenced by the same floor; neither reaches a paid
surface or this release note's customer-facing numbers. `Stone Island Marina`'s figure carries an
additional caveat: it sits in this run's reproduction-control failure set, so treat +513.4 % as
unverified in addition to withheld.

---

## 5. Board impact vs. customer impact — lead with the customer number

**Board (supply-side), n = 100 models, this run:** after both changes, **63 rows show a
`max_buy_price`, 37 go blank.** That figure — **~37 %, ±3 pp, n = 100, measured 2026-09-01 08:47
UTC** (the timestamp of the frozen board snapshot this proof reads) — is real, but it describes our
shelf, not what a customer experiences, and it must always travel with its ±3 pp and its `n = 100`.

**The board figure overstates customer impact by roughly 3×.** Replaying all 180 answered searches in
`verdict_logs` against the same board:

| | before (stored board, no gate on paid surfaces) | after (A13 + gate) |
|---|---:|---:|
| search gets a priced band | 113 / 180 | **146 / 180** |
| search matches a model but is too thin to price | 44 | **11** |
| search matches nothing at all | 23 | 23 |

Restricted to the 157 searches that match a board model at all: **113 → 146 banded**. **A customer
loses a price on 11 of those 157 matched searches (7.0 %) and gains a properly-evidenced one on 33
more.** Net, a customer sees **more** priced answers after this release, not fewer.

**This is the number to lead the release note with**, per the recommendation this measurement was
built to test: *"the board blackout describes our shelf, not their experience."* Do not quote the
last-7-days arm (19/44 → 29/44) — `n = 44` is below this project's own 100-floor for a reported rate,
and it is contaminated by at least 4 rows of our own probe traffic.

---

## 6. Scope limit — the gate is real on `/api/verdict` only

Verified independently for this note (`grep -n "verdict_allows_buy_below\|MIN_VERDICT_COMPARABLES" api/resale_routes.py` → **0 matches**; the gate symbols exist only in `api/routes.py`, which
backs `/api/verdict`):

**`gate-paid-surfaces` protects `/api/verdict` and nothing else.** Deal Finder, the watchlist, the
brand pages and the trends surfaces (`api/resale_routes.py`) still read `max_buy_price` with no
`comparable_n` check. This release note, and anything derived from it, **may not imply the gate
covers those surfaces.** Until they are gated too, a price A13 raises the evidence bar to publish on
`/api/verdict` can still appear ungated on Deal Finder or a watchlist alert the same day.

---

## 7. What this note does NOT claim

**The note may say the number changed, and by how much. It may not say the new number is more
accurate — only that it rests on more comparables.** That is a different and weaker claim, and it is
the honest one:

- `price_eur` is the **asking price at shelf departure**, not a sold price. There is no ground-truth
  sold price anywhere in this pipeline.
- **MAPE is not computable** against anything in this system.
- The `0.70` in `avg_price × 0.95 × 0.70` (max buy price) is **undecomposed** — whether it is pure
  margin or partly a silent asking-vs-sold correction is unknown.
- A13 changes *which* asking prices are averaged over. It cannot, by construction, make the average a
  sold price.

None of this is a reason to withhold the change — the floor argument (§8) does not depend on
accuracy. It is a reason to never write the word "accurate" or "more correct" about this release.

---

## 8. Why A13 ships despite all of the above — the floor, not a retracted median

An earlier justification for A13 — "median evidence behind a printed band goes 12 → 26" — **does not
reproduce** under any of seven population definitions measured against production, and is being
struck from the code comment, `docs/audit/COVERAGE.md` and `docs/company/APPROVALS.md` in the same
pass as this note (separate diff). On the documented definition it is **12 → 13**; supply-weighted it
**falls**, 14 → 12. It was also arithmetically unreachable — the 22 models A13 admits have a median
`comparable_n` of 10, and adding 33 searches at that median to 113 searches at median 12 cannot
produce 26.

**A13 does not need that number.** The real argument is the floor: A13 admits models to a printed
price by finding evidence they already had (a model at 5 comparables on the narrow window clearing 11
on the wide one), not by lowering the bar a price must clear. The alternative considered and rejected
— cutting the threshold from 8 to 5 — reaches a similar coverage number by printing prices computed
from as few as 5 comparables. Same coverage, opposite mechanism. That argument does not depend on any
median and survives the correction above intact.

---

## 9. Counter-KPI

Both hold on this frozen snapshot, asserted in `proof.sh` so a regression fails the proof rather than
a reading:

- `MIN(comparable_n)` over every row that shows a price == **8**, both arms. PASS.
- **0** models' `comparable_n` decreases under the change. PASS.

---

## 10. What could not be sourced for this note

Flagged rather than asserted, per OS §0.2 (a number without `n`, a date range and a query is UNKNOWN):

- **The origin of the earlier "+20.3 %" and "23 movers" figures is unrecoverable.** `data-scientist`
  could not identify what population or arithmetic produced them; this note states only that they do
  not reproduce and gives the nearest constructible figure (+17.7 %, 11 rising movers only) without
  asserting it is what was originally meant.
- **Whether the 22-visible / 19-withheld split is stable across rebuilds is UNKNOWN beyond two
  readings 81 seconds apart** on the same board snapshot. `data-scientist`'s recommendation — three
  readings, including one after the next analyzer rebuild, before any number here is treated as fixed
  — has not yet been done for this note. Re-run `proof.sh` again before publishing if more than a few
  hours have passed.
- **`Stone Island Marina`'s +513.4 %** sits in the reproduction-control failure set (stored
  `comparable_n` 7 vs. recomputed BEFORE 3) — shown here as unverified; it is withheld regardless, so
  this does not affect any customer-facing number.
- **`match_precision`** (the KPI this whole gate protects) has no `match_audit` table and no
  `/precision` command yet — UNKNOWN, not zero.

---

## 11. Next step

This draft goes to the roster under **AM-7** — `tech-lead`, `verifier`, `qa-eng`, `security-eng` at
minimum, per AM-8's standing deploy condition — with §5's 37 % board figure and §6's scope limit on
the table before any decision to ship. **Do not publish. Do not deploy.** This file is a draft parked
for that consultation.
