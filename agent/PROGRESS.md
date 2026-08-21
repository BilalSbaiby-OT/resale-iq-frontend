# PROGRESS — append only, newest at the bottom

## 2026-08-21T11:10Z — session 1 (bootstrap + P0-0)
- Built the unattended system: CLAUDE.md, agent/{TASKS,HANDOFF,PROGRESS,GUARDRAILS}.md,
  scripts/{unattended.sh,resume-prompt.md}, .claude/settings.json + 3 hooks.
- P0-0 done: repo map written into HANDOFF.md.
- Verified while mapping: `src/data/seo-brands.json` is a SECOND, static count
  source that `/flip/[brand]` reads exclusively — the main P0-2 obstacle.
  `extension/STORE-LISTING.md` has no email and no affiliation line (P0-7).
  No i18n of any kind exists (P1-4 is greenfield).
- NEXT: P0-1.

## 2026-08-21T09:12Z — session 1 (cont.) — loop debugged against reality, now BLOCKED
Started the loop and watched it, rather than assuming it worked. It did not.
Three faults, all found by running it:
1. **Expired OAuth token** — every session dies in 12s. Needs a human. This is
   the block; see HANDOFF for the exact commands.
2. **The rate-limit grep read its own log.** `tail $LOG | grep rate.?limit`
   matched the line the loop had just written, so any crash looked like a usage
   limit and slept 3h instead of retrying in 60s — it would have burnt the whole
   night on one bad session. Session output now goes to `agent/.session.out` and
   only that is inspected.
3. **StopFailure labelled every failure a rate limit.** Now it only writes
   RATE_LIMITED when the payload actually says so. Negative-controlled both ways:
   a `MODULE_NOT_FOUND` crash writes no marker; "hit your usage limit" does.
Added a preflight so a dead credential BLOCKS loudly instead of burning the
8h budget on retries. Verified: preflight fails -> HANDOFF set to BLOCKED, rc=0,
no session spawned.
NEXT (once unblocked): P0-1.
