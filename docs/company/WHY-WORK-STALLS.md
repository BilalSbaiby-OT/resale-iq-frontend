# WHY WORK STALLS — measured, not guessed

**Founder, 2026-09-01:** *"all agents are not working, they have shit pending. First identify what's
this issue that causes the work to stay pending, or they overlook shit, or they do it, it's done and
it's not, or they don't even log it."*

**He named four possibilities. I measured all 27 open rows against them. Three are real, and one of
them is most of the problem.**

---

## The measurement

| category | rows | what it means |
|---|---|---|
| **Looks SHIPPED but still OPEN** | **19 of 27** | **the work is done and the board does not know** |
| No single spawnable owner | **12 of 27** | doer is `CEO`, or prose, or two names — **nobody can be assigned** |
| Genuinely blocked on the founder | 8 | real, but **3 of them are already resolved** and stale |
| Has one named agent and is genuinely open | **7** | the only ones that are *actually* pending |

**Of 27 "pending" rows, roughly 7 are really pending.** The founder's instinct that agents were idle
was reasonable and the cause was not idleness.

---

## Cause 1 — work ships and nobody closes the row (19 of 27)

**This is most of the problem.** Agents did the work, landed commits, and moved on. The row stayed
OPEN because closing it was a *separate manual act* nobody owned.

Every one of these shipped and stayed open: **W19** (signup localization, 73/73), **W41** (GDPR, 1286
tests), **W2** (36 dead pages killed), **W15** (orphan window closed), **W23** (trial machine),
**W11** (the founder deleted the reel hours before I stopped listing it).

**The board became a list of things we already did**, which is worse than no board: it hides the 7
real items inside 19 false ones, and it trains everyone to skim.

**Fix, already shipped:** `org.py` flags every OPEN row whose id appears in a commit on `main` —
`⚠ N OPEN rows look SHIPPED`. Deliberately loose: it *asks*, it does not close. **A grep does not get
to decide a finding is resolved, but it is perfectly capable of asking every hour.**

## Cause 2 — the doer field is prose, so nobody can be spawned (12 of 27)

A row saying `doer = CEO`, or `seo or analytics`, or `product-manager decides then backend-eng`
**cannot be handed to anybody.** It waits for a human to read it and interpret it — which means it
waits for me, which is the bottleneck the whole workboard existed to remove.

**`doer` must be exactly one roster agent, or the literal word `founder`.** Anything else is a row
that will sit. If a decision must precede the work, that is **two rows**, not one row with two names.

## Cause 3 — founder-blocked rows are not separated from stale ones (8, of which 3 are dead)

**W6** says *"ELEVENLABS_API_KEY returns 401"* — the founder rotated it hours ago and voiceover now
works. **W23**'s trial machine shipped. **W11**'s reel was deleted. **They still read as things the
founder owes us.**

**A stale row aimed at the founder is the most expensive kind**: it spends his attention on work that
is finished and makes the genuinely blocking rows less believable.

---

## What was NOT the cause

**Agents were not idle, and they did not fake completion.** Every claimed close today had a commit, a
test count or a URL behind it. `data-eng` even reported that its own fix had **not been exercised by a
real exception** rather than calling it proven.

**The failure was bookkeeping, and the bookkeeping was mine.** Agents ship and report; closing the row
was my job and I did it inconsistently while spawning the next thing.
