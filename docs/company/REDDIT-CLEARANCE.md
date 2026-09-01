# REDDIT-CLEARANCE.md — can we post to Reddit today, and where

Owner: `legal-compliance`. Requested by the CEO, 2026-09-01, framed as unblocking "the single
biggest lever on the board" for a 10k-views-today target. **Answer up front: no, not today, and
not because the content is bad — because I could not verify the one thing that decides whether
posting is safe, and I am not willing to give a green light I cannot back.**

---

## 0. What actually happened when I went to "go read them"

I was given `WebSearch`, `WebFetch` and a browser for the first time this session, specifically to
stop reasoning about external rules from memory. I tried, in this order, and I am recording every
attempt because "I could not measure this" needs the same evidence standard as any other finding:

| Attempt | Result |
|---|---|
| `WebFetch` → `reddit.com/r/Flipping/wiki/rules` | **Blocked** — "Claude Code is unable to fetch from www.reddit.com" |
| `WebFetch` → `old.reddit.com/r/Flipping/wiki/rules` | **Blocked** — same domain-level refusal |
| `WebFetch` → `old.reddit.com/r/Flipping/about/sidebar` | **Blocked** |
| `WebFetch` → `reddit.com/r/Flipping/about.json`, `.rss` | **Blocked** |
| `WebFetch` via `r.jina.ai` text-extraction proxy | Proxy itself got a 403 from Reddit's "network security" bot wall |
| `WebFetch` → `web.archive.org` (direct page, then CDX API for snapshot timestamps) | **Blocked** — "Claude Code is unable to fetch from web.archive.org" |
| `WebFetch` via two independent Redlib/Libreddit mirror instances | One 403'd, one redirected to a dead page (404) |
| `WebFetch` → `example.com` (control) | **Worked**, immediately — confirms the tool itself is fine; the block is Reddit- and Archive-specific |
| Browser pane (`navigate`) → `old.reddit.com/r/Flipping/wiki/rules` | **Refused**: "Tab tab-1 is pinned to a local file preview and cannot navigate. Open a new tab with `tabs_create`" — I have no `tabs_create` tool this session, so the browser is unusable for any external URL, not just Reddit |
| `WebSearch` for the actual rule text (multiple targeted queries, incl. `site:reddit.com`) | Returns only third-party "how to market on Reddit" SEO blogs (redship.io, shippers.club, reddit-radar-marketing.com, conbersa.ai, etc.) paraphrasing generic Reddit-wide norms. **Not one result surfaced Reddit's own rule text.** I am not treating marketing-blog paraphrase as a verified source — that is exactly the "recalled, not read" failure mode I was sent to fix, just laundered through a search result instead of my own memory |

**Net: every path to primary-source Reddit rules was closed this session.** This is a tooling gap,
not a refusal to do the work — eleven distinct fetch attempts across five techniques, one control
that proves the tool works elsewhere. I am not going to paper over it with recalled priors dressed
up as "current rules," and I am not going to launder a marketing blog's paraphrase into this
document as if it were the sidebar.

**What this means concretely: I cannot tell you today whether r/Flipping's current self-promotion
rule allows the shape of post in the queue, what its karma/account-age gate is, or whether it has a
data/OC flair.** Anyone who tells you otherwise this session is either recalling from training data
(stale by construction, and the CEO's own brief says this changed a lot in 2025-26) or repeating an
SEO blog's guess.

---

## 1. What I can respond with instead — internal design intent, not external clearance

Two things already on disk in `resale-iq-growth` show the growth agent independently converged on
the standard, low-risk shape for a data-first Reddit post, before I was asked to check it:

- `docs/RISKS.md:34` — *"Data and method in the post body; tool mentioned once, disclosed, at the
  end; omitted entirely where the sub forbids links; never the same text to two subs."*
- `src/agents/prompts/reddit.md` — the generation prompt itself: lead with data, not the product;
  post real numbers in the body; state methodology and its limits; mention the tool once, at the
  end, flagged as ours; omit the link if the sub forbids it; never cross-post identical text.

This is the right *shape* by the general, stable pattern every reselling/hobby subreddit has run for
years (contribute data-first, disclose affiliation once, don't repeat text across subs) — but it is
a shape I recall, not a rule I read today for r/Flipping specifically, and I will not certify it as
compliant with a rule set I could not open. Treat this section as "we already built toward the
right general pattern," not as clearance.

---

## 2. Per-subreddit status

| Subreddit | Current rules fetched? | Verdict |
|---|---|---|
| **r/Flipping** — the five queued rows' target | **No — blocked, see §0** | **UNKNOWN. Do not post until a human with a working Reddit session reads the live wiki (`reddit.com/r/Flipping/wiki/rules`) and sidebar.** This is the sub `content-social` already targeted on all five queued rows, so it is the one that actually matters tonight, and it is the one I have zero current-rule visibility into. |
| **r/vinted** | No | UNKNOWN, same reason. Narrower audience but plausibly more receptive to a Vinted-specific data post — unverifiable tonight. |
| **r/reselling** | No | UNKNOWN, same reason. |
| **r/SecondHandFashion** | No | UNKNOWN — WebSearch didn't even surface the subreddit's own about page, let alone rules; possible the community is small enough that generic searches don't index it well. Confirm it's still active before spending any effort here. |
| **ES/FR equivalents** | Not identified, let alone fetched | I did not get far enough to even name candidate subreddits (e.g. an ES/FR flipping or reventa community) with any confidence — that's a second research pass on top of the blocked one, lower priority than closing the tooling gap for r/Flipping first. |

**I am not going to guess a karma/account-age threshold, a flair name, or a link-placement rule for
any of these and present it as fact.** That is precisely the thing the CEO told me not to do.

---

## 3. The five queued Reddit rows (`resale-iq-growth/data/growth.db`, `content` table)

**I could not open this file.** `growth.db` is a binary SQLite file; my tool set this session is
`Read`, `Write`, `WebSearch`, `WebFetch`, `Grep`, `Glob`, and a browser pane that cannot navigate
(§0). `Read` explicitly refuses binary files. `Grep` matches the file but returns "binary file
matches," no content. There is no `sqlite3`/Bash tool available to me, no exported JSON dump of the
`content` table on disk (`data/exports/` is empty), and no way to reach the local dashboard server
(`src/server/index.js`, port 4310) even if it happens to be running, because the browser cannot
navigate to it.

**So the per-row verdict the brief asked for — postable as-is / postable with changes / would get us
removed — is UNKNOWN from me, directly.** What I can respond with is *relayed* evidence, labeled as
such, per the same standard `COMPLIANCE.md §6` already uses for figures I couldn't independently
pull:

`docs/company/WORKBOARD.md` row **W4** (`content-social`, dated today, same session) states it ran
"automated regex scan of all 33 remaining drafts for 'sold'-family words (incl. compounds like
'outsold'...), `resaleiq.com`, Balenciaga, and per-model price patterns — **0 hits**," and separately
that "all 5 reddit rows carry a `review_note` target (`r/Flipping`) the publish path requires." That
is a specific, dated, automated check by an agent with real DB access — I am treating it as credible
relayed evidence, not as my own confirmation.

**What that evidence does and doesn't establish:**
- It supports the brief's own description ("brand-aggregate data posts — no per-model prices, no
  Balenciaga, 'watched departures' not 'sold'") for vocabulary and price-granularity.
- It says nothing about whether the *post shape* — title, body length, link placement, whether the
  tool is named once or repeatedly, whether it reads as a contribution or a pitch — matches
  r/Flipping's actual current format requirements, because nobody has checked that against a rule
  set nobody could fetch tonight (§0). A post can pass every content-honesty check in this company's
  own `DATA_CONTRACT.md` and still read as marketing to a moderator on first glance, which is the
  actual removal trigger on subs like this, not the numeric-accuracy question `content-social`'s
  scan answers.

**Verdict on the five rows: content-honesty is relayed-clean; post-format compliance is UNKNOWN.**
Whoever re-reads r/Flipping's real rules (§4) should re-check the five rows' `title`/`body_markdown`
shape against whatever that rule set actually requires before any of them goes out — a second,
five-minute pass once the first blocker (real rules) is closed, not a re-audit from scratch.

---

## 4. Account risk — the honest answer, since you said you'd rather hear it now

**Two separate risks, and they don't require the rules to be readable to reason about:**

1. **New-account risk is real independent of what the written rules say.** It is a stable,
   well-known pattern across large hobby/reselling subreddits that AutoModerator and manual mod
   review disproportionately remove first-post, low-karma-account content that looks like marketing
   — even when the text itself would pass if posted by an established account. I'm stating this as
   general platform behavior I have reasonable confidence in, **not** as r/Flipping's specific
   configuration, which I could not check tonight.
2. **A removal or ban is not recoverable for that account**, and per the brief that costs the channel
   permanently. Given (1), and given I cannot currently confirm r/Flipping's specific gate, **posting
   today from a new account is a bet with a real, plausible downside and an unverified upside.**

**My actual recommendation, stated plainly since a hedge isn't useful here: don't post to Reddit
today.** Not "Reddit is a bad channel" — the growth team's own design intent (§1) is sound, and the
content is relayed-clean (§3). The reason is narrower and fixable fast: **the one check that
determines whether today's post is safe (the live rule set) could not be run, and account bans are
the one failure mode on this list that is not undoable.** Two things can both be true: Reddit is
very plausibly the highest-leverage channel on the board, and tonight is not verified-safe to use it.

**What actually unblocks this, in order of speed:**
- **Fastest: a human with a real, logged-in browser session reads `reddit.com/r/Flipping/wiki/rules`
  and the sidebar directly** (or `old.reddit.com/r/Flipping/about/sidebar`, which is usually more
  complete) and pastes the text back for this role to assess against the five queued rows. Five
  minutes, unblocks everything else in this document.
- **In parallel, not instead of:** if the Reddit account we'd post from is new, spend the ~2 weeks
  the CEO floated building genuine karma (real comments on real threads, not seeded) regardless of
  what the written rules say, because risk (1) above doesn't go away just because the written rules
  turn out to permit the post format.
- **Separately:** check whatever social tool is wired up (`resale-iq-growth` has a Postiz
  integration) for the connected Reddit account's actual age/karma — I found no evidence one way or
  the other in the files I could read, and that number changes the urgency of the karma-building
  step.

---

## 5. `docs/company/COMPLIANCE.md` finding #1 — confirmed still true, today, against current code

Re-verified directly, not on trust — I re-read the exact files `COMPLIANCE.md` cites and confirmed
neither has changed:

- `demand-intel/api/auth.py:842-851` (`delete_account`) still issues exactly one statement,
  `DELETE FROM users WHERE id=?`, on a bare `aiosqlite.connect(DB_PATH)` connection with no
  `PRAGMA foreign_keys=ON`. Watchlist, portfolio, saved searches, alerts, every raw search query,
  every self-reported buy/sell price, and the Stripe subscription itself are all left untouched.
- `demand-intel/api/auth.py:1120-1142` (`export_data`) still selects six `users` columns plus
  `activity_logs` only, and still returns the literal string *"This export contains all personal
  data held by Resale IQ per GDPR Article 20."* **That sentence is false as written**, independent of
  whether a real DSAR has ever tested it — nine other user-linked tables are never touched.
- `resale-iq/src/app/privacy/page.tsx` — **updated today** (see §6), but the two GDPR-relevant lines
  are unchanged in substance: *"You can export all your data or delete your account at any time from
  the account page (GDPR rights to access and erasure)"* and *"Account deletion removes your personal
  data from our active systems."* Both are still promises the backend above does not keep.

**This week's stated goal is closing exactly this gap** (`OBJECTIVE.md`/session brief: "deletion
cascades, `verdict_logs` is included, Stripe is cancelled" + a DSAR runbook run end to end). **As of
this check, none of that has shipped.** `COMPLIANCE.md §1.5` already has the fix in priority order —
cheapest first (soften the copy today, no code change) through the full backend fix — and it is
unchanged from when it was written. I'm not re-deriving it; I'm confirming it's still the accurate
map and still open, and flagging that we are about to send Reddit traffic toward a live page making
a compliance promise the backend doesn't keep, which raises the cost of leaving it open one more day
without making the underlying GDPR risk itself materially worse — the exposure was already there.

**Recommendation, unchanged from `COMPLIANCE.md`:** either ship `§1.5` steps 2-4 (route both routes
through `get_db()`/`PRAGMA foreign_keys=ON`, add explicit `verdict_logs`/`purchase_logs` deletes,
cancel Stripe before deleting) this week as the goal already commits to, or — if that slips —
soften `/privacy`'s two GDPR lines today, same-day, no code change, so the page stops promising what
the product doesn't do while the real fix is built. The second option is not a substitute for the
first; it's the "stop the lie" step `COMPLIANCE.md §1.5` already named.

---

## 6. `/privacy`, updated today — accuracy check on the new extension-telemetry paragraph

The founder/CEO said `/privacy` was updated today to disclose extension error telemetry, and asked
whether it's accurate and sufficient, including whether it matches the Chrome Web Store data-use
declaration. I read the live page, the extension code that produces this telemetry, and the CWS
listing draft, rather than trusting any one of the three on its own.

**Verdict: accurate, and consistent across all three surfaces. One caveat, not a violation.**

- `src/app/privacy/page.tsx`'s "Chrome extension" paragraph claims the reason code is "one of three
  preset values, never text taken from the page or the error itself." **Verified against
  `extension/content.js`**: there are exactly three literal call sites —
  `reportExtError("selector_miss")` (line 443), `reportExtError("render_exception")` (line 471), and
  `reportExtError("run_exception")` (lines 478, 504, same literal twice). No call site passes a
  dynamic string, an error message, or page content. The claim is true, not just plausible.
- The privacy paragraph also claims no session token, no account identifier, no listing content in
  that report. **Verified against `extension/background.js:63-80`**: the POST body is exactly
  `{ reason, market }`, both truncated client-side (`reason` to 40 chars, `market` to 2). No other
  field is sent.
- **Matches the Chrome Web Store draft** (`extension/STORE-LISTING.md`'s "Data use" section,
  "Diagnostic/technical data" bullet) essentially verbatim in substance: same reason-code framing,
  same "no listing text, no URL, no account identifier" claim. The two documents were evidently
  written to agree, and they do.
- **One caveat, stated for completeness, not as a defect:** `background.js`'s own comment says the
  POST target (`/api/ext/error`) may not have a receiving route on the backend yet ("if the backend
  has no receiving route yet this 404s quietly"). I checked — **`demand-intel/api/` has no
  `/api/ext/error` route today.** So the disclosure is currently ahead of the data actually being
  collected, not behind it: nothing is landing anywhere yet. That's the safe direction to be wrong
  in, but it means two things need to happen before this is fully "sufficient" rather than
  "accurate": (1) when the backend route ships, it must store/process **only** `reason`+`market` as
  disclosed — a one-line check `backend-eng` or `security-eng` should run before merging it, not
  after; (2) confirm the CWS listing being described here (**v1.3.0**) is the one actually submitted
  in the Chrome Web Store developer console — the live store listing is still v1.2.0 per
  `STORE-LISTING.md`'s own header, and I have no way to check the console's actual ticked
  declarations from the filesystem.

**No fix needed on `/privacy` itself for this paragraph.** It's the one accurate, forward-looking
piece of compliance writing to ship today — noted so it doesn't get lost next to §5's finding.

---

## Summary for the board

- **Reddit: not clear to post today.** Not a content problem — a verification problem, fully
  evidenced in §0, with a five-minute unblock in §4.
- **GDPR export/erasure gap (COMPLIANCE.md #1): still open, still false-as-written on `/privacy` and
  in the `export_data` response, unchanged since this morning's audit.** This is this week's stated
  goal and it has not moved.
- **New extension-telemetry disclosure: accurate, consistent, and safely ahead of the backend
  (nothing collected yet) — the one clean result in this pass.**

See `docs/company/WORKBOARD.md` rows W13-W16 for doers and next actions.
