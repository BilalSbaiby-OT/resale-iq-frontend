Read CLAUDE.md, agent/HANDOFF.md, agent/TASKS.md, agent/GUARDRAILS.md.

If HANDOFF STATUS is DONE or BLOCKED: print one line confirming it and exit. Do nothing else.

Otherwise: do the single next unchecked task in agent/TASKS.md. Only that one.

- Smallest change that works. Match the existing stack. No new dependencies.
- Verify by EXECUTING: `npx tsc --noEmit` and `npm run build` must both pass.
  Reading the code is not verification.
- Tick the task's checkbox in agent/TASKS.md in the same commit.
- git commit locally. Message format: `P0-1: last-good snapshot on /data`
- Do NOT push. Do NOT deploy. See agent/GUARDRAILS.md.
- Update agent/HANDOFF.md (STATUS, what you did, what is next, anything the next
  session must know) and append a dated entry to agent/PROGRESS.md.
- If you need a human (secret, Stripe dashboard, Chrome store): set STATUS: BLOCKED
  with the exact action required, commit that, exit.
- If you pass ~40 tool calls and the task is not done: set STATUS: IN_PROGRESS,
  write exactly where you got to, commit what works, exit. The next session finishes it.

Then stop. Do not start another task. Do not ask questions.
