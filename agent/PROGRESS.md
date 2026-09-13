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

## 2026-08-21T09:35Z — session 2 — P0-1 done (driven by hand; loop still auth-blocked)
- Repaired the `claude` CLI: an npm update had left the package installed but the
  native binary missing (`bin/claude.exe` was a stub that only prints an error).
  `npm install -g @anthropic-ai/claude-code@2.1.238` restored it; `claude --version`
  now returns 2.1.238. The OAuth token is still expired — that needs a browser.
- Fixed a third loop bug: `unattended.sh` assumed `claude` was on PATH. It is not
  in a non-interactive shell (nvm is not sourced), so every session would have
  died with "command not found". It now resolves the binary explicitly and blocks
  with the install command if there is none.
- **P0-1**: `/data` now serves the last good snapshot when the live query fails or
  returns nothing, labelled and timestamped, instead of "check back shortly".
  New `src/lib/last-good-snapshot.ts` persists to disk (not memory — ISR
  re-renders in any worker and the container restarts on deploy, so an in-memory
  cache is empty exactly when it is needed).
  Also fixed the `b.sold_7d.toLocaleString()` null crash noted in the repo map.
- VERIFIED against a running server, not by reading:
  - dead backend + cache  -> 200, stale banner, "2026-08-21 07:30 UTC", cached
    rows rendered (3,942 / 2,661 / 1,567), dead-end message gone (0 occurrences)
  - live backend          -> 200, no banner, "Last updated 2026-08-21 09:28 UTC ·
    26 brands · 396,754 units", and the live fetch WROTE the cache (26 brands)
  - no cache + dead backend -> first-boot message returns, no false stale banner
  - JSON-LD `dateModified` tracks the snapshot, never the render — a stale page
    must not emit a fresh-looking machine-readable timestamp
  - NEGATIVE CONTROL: empty / null / error responses all REFUSE to overwrite a
    good cache; a good one replaces it. That guard is the whole safety property.
- NEXT: P0-2.

## 2026-08-21T09:36Z — session 2 (cont.) — loop hardened; 4 bugs, all found by running it
- **Bug 3 — preflight passed when auth was dead.** `head -3` truncated the CLI
  output; under tmux extra preamble pushed the auth error to line 4+, so the
  check silently PASSED and the loop span on 60s retries. Now greps the full
  output, and closes stdin (`< /dev/null`) — the CLI's own warning named that fix
  and it was costing 3s per invocation.
- **Bug 4 — the auth block was SELF-LATCHING.** Once STATUS was BLOCKED the loop
  exited at step 1 without ever re-testing, so signing in would have fixed
  nothing: it would have sat dead all night holding a working credential. Now an
  auth block carries `BLOCKED_REASON: auth`, re-tests every 5 min, and lifts
  itself. Every other block still needs a human, which is the point of them.
  VERIFIED both directions with a stub CLI: dead auth -> blocks and re-checks
  without spawning; working auth -> "auth recovered", STATUS back to READY,
  BLOCKED_REASON deleted, sessions start.
- **Added a no-progress guard.** A session exiting cleanly without committing
  makes no progress; three in a row means the loop is spinning (all tasks done
  but STATUS never set to DONE, or a crash that still exits 0). It now stops
  after 3 rather than burning the night at a session every 2 seconds. Verified.
- NEXT: P0-2.

## 2026-08-21T09:50Z — owner signed in; blocker moved from auth to credits
- Sign-in succeeded. The CLI authenticates. New error: "You're out of usage
  credits ... claude.ai/settings/usage".
- **Bug 5 — out-of-credits was invisible to the loop.** A THIRD state, distinct
  from "not signed in" and from a rolling rate limit: the credential is valid,
  the balance is not. `auth_ok()` did not match that string, so the preflight
  PASSED and every session would have died in seconds until the no-progress
  guard stopped it. Now detected as `BLOCKED_REASON: credits`, re-checked every
  5 min like auth, so a top-up resumes the loop with no human step.
- Also removed a duplicated preflight: the startup check had its own copy of the
  grep and had ALREADY drifted — it knew about expired sign-in but not about
  exhausted credit. It now calls `auth_ok()`, so there is one definition.
- VERIFIED against the real CLI: preflight reports `(credits)` with the real
  message, sets BLOCKED_REASON: credits, and re-checks rather than spinning.
- NEXT: P0-2.

## 2026-09-13 — EX-CTR-002 + EX-CTR-003 title/meta/H1
- `/blog/how-to-find-items-to-flip-on-vinted`: title+meta+H1 in `src/data/blog-posts.ts`.
- `/blog/how-to-spot-fake-items-vinted` 301s to `/manual/condition-and-authenticity`;
  title+meta+H1 updated on that chapter in `src/data/manual.ts`. Closest live slug.
- Title/meta/H1 only in the first commit; paid mid-CTAs added after Conversion greenlit.
- Verified on `next dev`: title, meta description, og tags, and H1 match on both
  pages; blog index lists the new flip title; 308 redirect still in place.
- PR: https://github.com/BilalSbaiby-OT/resale-iq-frontend/pull/78

## 2026-09-13 — EX-CTR-002/003 mid-article /pricing CTAs
- Conversion greenlit paid CTAs. After first how-to section on both pages.
- Flip: `ctr_flip_20260913` → `/pricing?...&utm_content=mid_cta`
- Authenticity chapter: `ctr_fake_20260913` → same pattern.
- Soft `/data` secondary. No free signup. Demo math from each page's own figures.
- Rebased onto main after #77. CTA commit `97e0099` on PR #78.
- Verified on next dev: CTA sits between first and second h2; hrefs exact.

## 2026-09-13 — Content-aligned mid-CTA copy (follow-up to #78)
- #78 merged as affa559 with old "Get buy-below on any item" / ctr_* UTMs.
- Button → "Get the numbers". Subline → "Buy-below + demand before cash sticks."
- Flip campaign `body_flips_20260913`. Fake campaign `body_fake_20260913`.
- Soft /data kept. No /register.

## 2026-09-13 — SEO CTR pack (views + how-to titles, #82)
- `/blog/how-to-get-more-views-on-vinted`: title/meta/H1 + mid-CTA
  `body_views_20260913` → `/pricing` (not `/register`).
  QC copy: button "Get the numbers", subline "Buy-below + demand before cash sticks."
- Other high-impression how-tos: bundles, seasonal, list-time, descriptions,
  start-no-money, closet, not-selling, thrift, photos — title and/or mid-CTA.
- How-to-price: same QC copy via shared helper; campaign `ctr_price_20260913`.
- Stretch: `/data` title/meta + H1 toward weekly brand volumes; `/flip` H1
  aligned to “what sells best on Vinted in 2026?”.
