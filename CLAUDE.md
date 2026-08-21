@AGENTS.md

# Resale IQ — unattended agent rules

**Disk is memory. Chat is disposable.** Nothing you remember survives. Only files do.

## Every session, in order
1. Read `agent/HANDOFF.md`
2. Read `agent/TASKS.md`
3. Do **ONE** unchecked task — the first one
4. Verify it (build/typecheck/run it — not by reading code)
5. `git commit` (message `P0-1: <what>`)
6. Update `agent/HANDOFF.md`, append to `agent/PROGRESS.md`
7. **Stop.** Do not start a second task.

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
UK market · REST API · Order Planner · auto-buy · fake hit rates · fake users ·
authenticity marketing · rewriting the app · new frameworks.

One task per session. Smallest change. Match the existing stack.

See `agent/GUARDRAILS.md` before anything that leaves this machine.
