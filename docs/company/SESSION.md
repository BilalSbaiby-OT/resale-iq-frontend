# SESSION

**Updated** 2026-09-02 10:5xZ — **the orchestrator is now OpenClaw, not Claude Code.**

## Read these first

1. `docs/company/OPEN-ITEMS.md` — the one honest status list.
2. `docs/company/OPENCLAW.md` — what runs where, and what is NOT built.
3. `~/.openclaw/workspaces/resaleiq/AGENTS.md` — the operating contract OpenClaw runs under.

## Handover state

**Telegram routes to the `resaleiq` agent** (`openclaw agents bindings`). It has its own workspace
with the operating contract, the founder gates, the publishing traps and who the founder is. Verified
answering unprompted: *"€0.00 MRR and has never had a paying customer... never manufacture proof."*

The gateway is a LaunchAgent (`RunAtLoad`, `KeepAlive`) on the founder's MacBook — **it survives the
terminal closing, Claude Code exiting, and a reboot. It stops when the Mac sleeps.** That is why the
four Hetzner cron jobs stay: `riq-heartbeat` :17, `riq-disk-guard` :37, `riq-decide` :47, brief 08:05.
Mac orchestrates; Hetzner keeps watch. **Do not delete the host cron.**

Previous OpenClaw content (a car-scraping project and an assistant persona) is archived to
`~/.openclaw/_archived-pre-resaleiq`, plus a 421 MB full backup in the session scratchpad.

`~/.openclaw` was added to `SCOPE` in `guard.py` on the founder's explicit instruction — the list
predated OpenClaw and was blocking setup of the thing meant to run the company.

## Localisation — actually done this time, verified on the live site

`/methodology` now serves **all six locales, 200, with zero English leakage**, checked against
production and not a build log:

```
es native ✓ english 0 · fr ✓ 0 · de ✓ 0 · it ✓ 0 · pt ✓ 0 · /methodology unchanged
```

113 keys × 6 locales, full parity, **zero figure drops**. Every sale-word that survives is a correct
translation of the page's own retraction ("not a confirmed sale"), checked in context.

**Earlier I called this done when W61 had only turned 404s into redirects** — its own code comment
says it does not translate. That was the founder catching me by using the site.

**Still English behind the same redirect:** `/blog`, `/manual`, `/tools`, `/check`, `/terms`,
`/support`, `/data`. The pipeline is reusable; the work is repetition and it is NOT done.

## I froze the deploy pipeline for most of today

`Agent Isolation` failed from 10:13, and `Deploy` only runs after it passes — so **every commit sat
unshipped**, including the merged locale routes. Cause: `dashboard/data.json` embeds SESSION.md
excerpts verbatim, and a SESSION.md line named an agent-infrastructure endpoint that
`check-agent-isolation.mjs` refuses anywhere in the repo.

**Third instance of one class of bug**, and the first two are already in `scrub.py`'s docstring: a
credential NAME in a recorded command (9 commits frozen), the same names in bus messages (2 more),
and now an ENDPOINT in a doc excerpt. The scrubber covered names, not endpoints. Now mirrored from
the checker's `INFRA_PATTERNS`, unit-tested per pattern, with a docstring saying the two lists must
grow together.

**Rule: do not name agent infrastructure in any doc the dashboard embeds.** The scrubber is a net,
not a licence.

## Do not

- **Do not call a redirect a translation**, or a 200 a translated page. Grep the body.
- **Do not report a fix without the artifact.** Production, not CI, not a build log.
- **Do not assert the result of an operation nobody performed.** A `GET` is not a completion.
- **Do not repeat "78% down"** — 182 probe samples across a full analyzer cycle were 100.00%.
- **Do not trust `ffprobe`.** Decode the last frame and look at it.
- **Do not delete the Hetzner cron.** It is the only thing running while the Mac sleeps.
- **Do not `git add -A`**; stage explicit paths. **Do not `grep` an env dump** — `grep -c '^VAR=.'`.

