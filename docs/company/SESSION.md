# SESSION

**Updated** 2026-09-05 ~21:00Z — read-only status pass, nothing changed

## The two CEOs are genuinely collaborating

36 messages exchanged over the bridge, ids climbing from 9 to 149, with clean round trips of 30-50s:
`PULLED -> MIRRORED-IN -> ANSWERED -> MIRRORED-OUT -> REPLIED`. One poller, no duplicates, no errors
in stderr.

**The CEO improved the bridge herself.** `poller.py` was edited at 19:00 (backup kept at
`poller.py.bak.20260905T185906`) to add message MIRRORING plus a durable
`TRANSCRIPT-ceo-grokbootu.md` — closing the exact gap grokbootu had complained about, that Telegram
forgets history once read. Not asked for, and correct.

## ONE THING IS STUCK — id=149, since 18:51Z

```
18:51:45 PULLED      id=149 from=grokbootu chars=292
18:51:53 MIRRORED-IN id=149 ok=True
(nothing since — over two hours)
```

Pulled and mirrored, never answered. `poller.err` is empty, the edited file parses, launchd reports
`state = running, runs = 4, pid 46439`. So the process is alive and has not logged in two hours —
most likely blocked inside a single agent turn. **grokbootu is waiting on a reply that is not coming.**

Not restarted: the founder asked for a status pass "without breaking nothing". The fix is almost
certainly `launchctl kickstart -k gui/501/dev.riq.bridge-poller`, which would pick up 149 and
anything queued behind it.

**Design fragility worth recording:** `/replies` marks messages delivered on read, so a poll that
succeeds and then crashes loses that reply permanently. Single-delivery, not durable.

## Pricing authority moved to the two CEOs

Founder, 2026-09-05: *"adjust it to allow collaboration including the price"*. The founder-gate on
pricing is lifted; spending money is not. Written into her contract with the constraints that keep it
learnable: announce in the group before shipping, one change at a time with a number attached,
anchored to measured evidence, and state up front what would make the change wrong.

**She used it the same minute, and split grokbootu's proposal rather than accepting it:**
EUR 14-intro-then-EUR 19 Starter *plus* EUR 49 Pro is two variables at once, so she committed to
**Starter EUR 19 only, Pro unchanged**, with a kill condition — *if `checkout_started` does not rise
within 7 days or 50 checkouts, revert and say so publicly.* The first falsifiable commitment anyone
has made here.

**And she disagreed with its diagnosis on evidence:** 51 of 52 checkouts expired unpaid, but one
EUR 49 completed unprompted on 08-28 — *"that reads as NOT TRUSTED, not TOO EXPENSIVE"*. So the price
move is the cheap experiment and the sell-through-truth fix is the real one.

She also refused a task on principle: asked to push a body over the bridge, she declined because it
meant handling the outbound key through a shell variable, and told grokbootu to poll again instead.

## Still true, still unfixed

- Product answers (`Adidas Samba -> WATCH n=20`), gateway 200, Telegram `audit ok`.
- The dashboard still shows **"Goal achieved ... EUR 2000 MRR by 2026-09-31"** while live Stripe
  reports **0 active subscriptions, EUR 0.00**. False banner, impossible date, wrong month.
- `paywall_shown` is not instrumented and `checkout_completed` has no first-party event — the funnel
  is blind exactly where conversion dies. This is what the EUR 19 experiment will be measured on, so
  it has to land first.

---

## Previous state

**Updated** 2026-09-02 ~12:45Z — **final Claude Code session. OpenClaw is the orchestrator now.**

## Start here

1. `~/.openclaw/workspaces/resaleiq/knowledge/CURRENT-STATE.md` — the handover, written for you.
2. `~/.openclaw/workspaces/resaleiq/AGENTS.md` — your operating contract.
3. `docs/company/OPEN-ITEMS.md` — the honest status list.
4. `docs/company/OPENCLAW.md` — what runs where, and what is NOT built.

## The product went down today and is MITIGATED, not fixed

Every anonymous visitor got `LIMIT_REACHED` with `used_today: 0` from 09:10Z. Proven with `tcpdump`
on both Traefik hops: the frontend calls the backend over a **public** hostname, so the request
hairpins back through the same Traefik, NAT rewrites the source to the bridge gateway, and Traefik
overwrites `x-forwarded-for` — every visitor on earth in one quota bucket.

Mitigated by raising the wide IP backstop (backend #4, deployed). **Verified on the body, not the
status:** `Adidas Samba -> WATCH n=58`, `New Balance 530 -> SKIP n=543`, `Nike Air Force 1 -> WATCH n=87`.

**The permanent fix is a founder decision — APPROVALS A25.** Put the ceiling back to 300 after it ships.

## Four backend PRs merged and deployed today

`#3` cutoff separator (~4 weeks live; merging it turned a "flaky" test green and unblocked the rest) ·
`#2` XFF double-hop · `#1` analyzer lock contention · `#4` ceiling mitigation.
Frontend `#7` is OPEN and **insufficient alone** — do not merge expecting it to fix the outage.

## Three corrections I made to my own claims today

Kept because the pattern matters more than any single error.

1. **"78% down"** → **"100.00% availability"** → **both wrong.** The first was a duty cycle. The
   second counted HTTP 200s — and `LIMIT_REACHED` returns 200, so I reported perfect health while the
   product refused everyone. My probing also helped exhaust the ceiling I was measuring.
2. **"nothing forwards x-forwarded-for on the rewrite"** — factually wrong. `frontend-eng` refuted it
   with packet captures: Traefik sets it, Next forwards it, and it dies at a *third* hop I had not
   looked for.
3. **"localisation is done"** — W61 had only turned 404s into redirects. Now genuinely done for
   `/methodology`, verified live in five languages; seven page families are still English.

## Do not

- **Do not assert on an HTTP status.** Check the response body. This cost the most today.
- **Do not trust the Deploy workflow's verdict** — it reported `failure` on a deploy that succeeded.
- **Do not query the local `demand-intel` DB.** ~53 GB, stale, `sold_observed = 0`, answers wrongly.
- **Do not name agent infrastructure in any doc** — this file ships to visitors inside `data.json`.
- **Do not call a redirect a translation, or a 200 a working page.**
- **Do not `git add -A`**; stage explicit paths. **Do not `grep` an env dump** — `grep -c '^VAR=.'`.

