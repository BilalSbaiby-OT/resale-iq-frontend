@AGENTS.md

# Resale IQ — unattended agent rules

> **`docs/company/OBJECTIVE.md` sits above everything here. MAXIMIZE LONG-TERM PROFIT.**
> Where any rule below reads as "hedge, disclaim, qualify" applied to MARKETING or a
> LANDING SURFACE, the objective wins. The honesty rules in this repo were written for
> **data integrity** — what a number means, whether it is sourced — and they are correct
> there. They are not a marketing voice. **Do not let them leak into the sales surface.**
> The one hard line is the founder's own: **never manufacture proof.** Not for morality —
> our numbers are checkable, and one disproven statistic costs the channel permanently.


**Disk is memory. Chat is disposable.** Nothing you remember survives. Only files do.

## Every session, in order
0. Read `agent/LANES.md` — two agents share this repo. Know your lane and check
   the lock in HANDOFF (`OWNER`) before your first edit.
1. Read `agent/HANDOFF.md`
2. Read `agent/TASKS.md`
3. Do **ONE** unchecked task — the first one
4. Verify it (build/typecheck/run it — not by reading code)
5. `git commit` (message `P0-1: <what>`)
6. Update `agent/HANDOFF.md`, append to `agent/PROGRESS.md`
7. **Commit before you stop.** Never leave the tree dirty — the other agent
   cannot tell in-progress from abandoned.
8. **Stop.** Do not start a second task.

## STATUS in HANDOFF is exactly one of
`READY` | `IN_PROGRESS` | `BLOCKED` | `DONE`

- `DONE` or `BLOCKED` → do not invent work. One-line confirm, exit.
- Never ask "should I continue?"
- Never wait for a human unless `BLOCKED` (secrets, Stripe dashboard, Chrome store login).
- >40 tool calls and task not done → checkpoint HANDOFF as `IN_PROGRESS`, stop. Next session finishes it.

## The product, in one line
The highest price worth paying for a Vinted item:
`buy_below = avg_sale × 0.95 × 0.70` on **ES / FR / DE / IT / PT**.
Honesty lives on `/methodology`. The homepage sells the number.

## Hard no
REST API · Order Planner · auto-buy · fake hit rates · fake users ·
authenticity marketing · rewriting the app · new frameworks.

**UK market: no longer a hard no** (owner's decision, 2026-08-29). It was removed
because Search Console shows GB is the second-largest source of impressions after
the US. That lifts the ban on *considering* the UK — it does not mean the product
covers it. `market-numbers.ts` still serves ES/FR/DE/IT/PT only, so any page that
implies UK coverage is still wrong until the data actually exists. Say what we
cover, not what we might.

One task per session. Smallest change. Match the existing stack.

See `agent/GUARDRAILS.md` before anything that leaves this machine.
