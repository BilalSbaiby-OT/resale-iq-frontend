# DOCTRINE MIGRATION — report

**2026-09-02.** Honest status up front: **the document layer is migrated. The 21 agent contracts are
NOT yet rewritten** — that is the largest remaining piece and it is staged, not done. Saying
otherwise would break the doctrine on its first day.

---

## 1–6. THE NUMBERS

| | count |
|---|---|
| Documents inspected | **48** (13,488 lines) |
| Kept as-is | **24** |
| Rewritten (banner + authority correction) | **3** — `OS.md`, `OBJECTIVE.md`, `GOALS.md` |
| Merged into canon | **2** — `OBJECTIVE.md` → DOCTRINE §1/§3, `GOALS.md` → `MISSION.md` |
| Archived | **4** — into `docs/company/archive/` with a README |
| **Deleted** | **0** |
| Still needing a human call | **15** (listed below) |

**Nothing was deleted.** Every archived file is readable, in git, and carries a note saying why it
moved.

## 7. THE NEW CANON

**`DOCTRINE.md` is canonical. Where any document conflicts with it, it wins and the other is
obsolete.** One file. 14 principles, the line that does not move, the decision framework, authority,
and — new — **a binding definition of done**.

Under it: **`MISSION.md`** (the current number and its arithmetic) and **`AMENDMENTS.md`** (amends
the doctrine by reference).

**It is delivered, not stored.** `bus.py brief <agent>` now emits DOCTRINE + MISSION into every
agent's spawn prompt ahead of its mail — **329 lines per agent**. The measured failure of the
previous doctrine was never disagreement; it was **57 rules across 39 documents with 5 mechanised,
and 52 bugs fixed twice.**

## 8. WHY IT WAS REPLACED — the evidence, not a feeling

Across the previous 48 documents:

```
gate / approval / blocked ......... 812
honesty ........................... 148
revenue / profit / margin / MRR ... 124
competition ....................... 19
opportunity cost / sunk cost ...... 2
customer value / willingness to pay  0
```

**Permission outweighed revenue 6.5:1, competition 43:1, opportunity cost 406:1. Customer value
appeared zero times.**

That corpus produced **1,342 passing tests, zero TODOs — and €0 revenue, 7 users, and a BUY verdict
that was mathematically unreachable for weeks without anyone noticing.** We were not failing at
caution; we were succeeding at it, and it was the wrong thing to succeed at.

## 9. WHAT ACTUALLY CHANGED IN BEHAVIOUR

Not tone. Four mechanisms:

1. **A definition of done exists for the first time.** CLAIMED / EXECUTED / VERIFIED / PROVEN. **All
   21 agent files previously had none** (`FORENSIC-AUDIT.md`).
2. **Authority inverted.** Agents act inside their domain and *consult* across it. Escalation is a
   short closed list. **A stale gate must be corrected, not obeyed.**
3. **Ownership is singular.** One named owner per outcome — **12 of 27 rows previously had no
   spawnable owner and simply sat.**
4. **The activity→output→outcome→value ladder is explicit**, so "20 posts published" can no longer be
   mistaken for progress.

## 10. WHAT WAS PRESERVED, DELIBERATELY

The founder's instruction was explicit that ethical and legal constraints are **not** obsolete:

- **Never manufacture proof** — kept absolute, and **re-argued as commercial rather than moral**: our
  numbers are checkable and one disproven figure costs the channel permanently.
- `COMPLIANCE.md`, `DATA_CONTRACT.md`, `ACCESS.md` — kept.
- **One correction of scope**, because the old doctrine had wrongly widened the rule: *"never
  manufacture proof"* is absolute; ***"never give an approximate answer" was never a rule.*** That
  conflation had us answering "I don't know" while holding the answer.

## 11. REMAINING CONTRADICTIONS — open, not hidden

1. **All 21 agent prompts still cite AM-2**, a spend cap lifted by AM-9. **21 of 21.** Unfixed —
   fixing it is part of the agent migration below.
2. **The 21 prompts contain no definition of done**, contradicting DOCTRINE §6 from day one.
3. **A second, orphaned 22-agent roster** sits in `demand-intel/.claude/agents/` with **zero name
   overlap**. Not touched — deleting another repo's agents was outside a documentation migration.
4. **15 documents remain unclassified** and need a human call: `ACTIVATION`, `CHECKS`, `CLOSED-LOOP`,
   `FIRST-REVENUE`, `GAPS`, `GTM`, `METRICS`, `ORGANIC-GROWTH`, `PLATFORM-CREATIVE`,
   `PORTFOLIO-GATE`, `REDDIT-CLEARANCE`, `ROOT-CAUSE`, `SEO-STATE`, `STATUS`, `bus-read.jsonl`.
   **I did not guess.** Most are evidence or state and likely KEEP, but "likely" is not a
   classification.

## 12. TESTS PERFORMED

- `check-stale-gates.mjs` — **✓ no stale gates**, run after the rewrite.
- `build-inventory.mjs` — regenerated; the doc set is enumerated.
- `bus.py brief <agent>` — **verified delivering 329 lines** of doctrine + mission.
- Banner insertion verified non-destructive: **3,665 / 15,593 / 22,304 bytes preserved**.
- Archive verified: 4 files moved via `git mv`, history intact, README written.

**Not tested:** whether agents behave differently under the new doctrine. **That is unknowable until
they run**, and claiming it would violate §6 on the day it was written.

## 13. WHAT COULD NOT BE SAFELY AUTOMATED

- **The 21 agent contracts.** The audit showed they are **90% identical boilerplate with ~10
  differentiating lines**. Rewriting them mechanically would reproduce the defect in new words. Each
  needs a real contract: what it owns, decides, escalates, what done looks like, and a distinct
  personality that carries a constraint rather than decoration.
- **The 15 unclassified documents** — judgement calls with real consequences.
- **The orphaned `demand-intel` roster** — a different repo, and deletion is not a migration.

## THE NEXT STEP, NAMED

**Rewrite the 21 agent contracts against `DOCTRINE.md`.** Each gets: what it owns · what it may
decide alone · what it must escalate · what success and failure look like · how it works with others
· **a definition of done** · and **a personality that constrains rather than decorates**.

**Doer: the CEO session**, one agent at a time, verified against `check-stale-gates` and the doctrine.
Not delegated — the audit found the last template-generated roster is exactly what produced 21
identical agents.
