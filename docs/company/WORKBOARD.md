# WORKBOARD — the only place work is tracked

**Created 2026-09-01 because the company produced 27,466 lines of documentation and 2,084 lines of
product code in one day.** Thirteen to one. The founder noticed before I did: *"we have 5
departments and 21 agents and the product didnt change much at all."*

## The cause, and it is structural

**Eight of 21 agents cannot change anything.** `monetization`, `finance-ops`, `ux-researcher`,
`legal-compliance`, `verifier`, `data-scientist`, `security-eng` and `tech-lead` hold read and write
grants only — by design, and correctly, since an auditor that edits the thing it audits is not an
auditor.

**But nothing converted their findings into shipped change except the CEO happening to notice.** So
their entire output was prose. `monetization` found the defect that was blocking revenue and wrote it
in a document. It shipped eight hours later, and only because I read the document.

## The rule

**An analysis agent's deliverable is a ROW ON THIS BOARD, not a document.** A finding with no row is
not delivered. A document may exist as evidence; the row is the deliverable.

**Every row names a DOER who can actually make the change.** If no doer is named, the finding is
CEO-blocked and that is my failure, not the finder's.

**The CEO's job is to keep this board moving, not to read documents.**

| # | Finding | Found by | DOER | Status |
|---|---|---|---|---|
| **W1** | **E2 — registering makes the product WORSE.** Anonymous sees `buy_below` + `sell_avg`; logged-in free sees **less** for the same query (`routes.py:975-995` vs `1022-1039`), while the only CTA on every result page is "Unlock the rest →" pointing at `/register` | `ux-researcher` → `monetization` | `backend-eng` | **CLOSED** — verified live pre-fix by driving the real `/auth/register` endpoint end-to-end and diffing the JSON (`buy_below`/`sell_avg` present anonymous, absent post-registration, still absent after attempting an unlock). Root cause: the free-logged-in redaction (`d74c2ac`, 2026-08-05) predates the anonymous teaser (`f67b7de`, 2026-08-22, "P1-2"), which was bolted on top of `_gate()` without reconciling the branch below it — an accident of build order, confirmed the anonymous side is the newer feature. Fixed in `demand-intel@5019fa0` (branch `claude/backend-eng/w1-free-teaser-parity`, not pushed/merged — CEO to land): free logged-in now gets AT LEAST what anonymous gets (`buy_below`, `sell_avg`, `sell_median`, `active_listings`); only depth (`sell_through_rate`, `top_sizes`, `size_velocity`, `opportunity_score`, `reasons`, `months_supply`) stays behind a plan or a spent unlock. `upgrade_url` for the free-logged-in teaser now points at `/stripe/plans`, not back at `/register`. 1276 tests pass (1274 baseline + 2 new: anon/free parity assertion, NULL-plan fail-closed regression), zero regressions |
| **W2** | **`/flip`: 136 of 157 URLs, and all 10 `/category`, have never earned one Google impression** | `seo` | `seo` | **OPEN** — needs Index Coverage first (new session; GSC creds fixed) |
| **W12** | **TWO POSTS PUBLISHED, aggregate-only, no per-model price.** `twitter.com/ResaleIQdev/status/2094748731514188031` (Nike concentration) and `.../2094758863832842553` (New Balance demand, n=309). Spanish version queued. **The pipeline is proven end to end for the first time.** | CEO | CEO | **CLOSED** |
| **W3** | **`resaleiq.com` is not ours, returns 200, someone else owns it.** Two queued posts pointed at it | CEO | **founder** | **OPEN** — buy it or accept the confusion |
| **W4** | **53 remaining queue drafts** carry retracted vocabulary and/or per-model prices | `content-social` | `content-social` | **CLOSED** — worked in a worktree (`claude/content-social/w4-rewrite-queue`, `resale-iq-growth`, no code diff — this was a data-only pass on the gitignored `data/growth.db`), applied directly to the live DB with row-level UPDATE/DELETE/INSERT and a pre-write drift check (none of the 53 target ids had moved since read). **29 rewritten** (ids 61-66, 73-84, 94-98, 100-105) to current `growth.db brand_stats` snapshot 14 numbers, `resaleiq.dev` links, "left the shelf"/"watched departures" vocabulary, no per-model figures — CTAs name the paid max-buy-price feature instead of teasing a number. **24 deleted as unsalvageable**, not rewritten: sourcing-list Balenciaga + 4 other per-model buy-below prices (ids 52-55, GTM §B3 + DATA_CONTRACT rule 4), New Balance 530 momentum (88-93, model-level, paid per `/api/trends`), Adidas Samba competition ratio (67-72, paid per DATA_CONTRACT intro), New Balance 9060 sell-through (85-87, paid per rule 4), Patagonia size_trap (56-60, paid per rule 4 "size data"). **4 new ES/FR rows added** (ids 106-109, X/x_thread, New Balance demand + Adidas concentration, vocabulary locked to `resale-iq src/lib/i18n.ts`) per the 71%-US/GB-impressions finding in `GTM.md`. Verified: automated regex scan of all 33 remaining drafts for "sold"-family words (incl. compounds like "outsold", caught and fixed post-first-pass), `resaleiq.com`, Balenciaga, and per-model price patterns — 0 hits; all `script` fields valid JSON; all 5 reddit rows carry a `review_note` target (`r/Flipping`) the publish path requires (`platformSettings()` throws without one — none of this DB's reddit rows, including outside this batch, had ever carried one); `npm test` 61/61 green in the worktree. All 33 remaining rows left `status='draft'` — none approved, scheduled or sent. **Found, out of scope for this row, flagged separately below:** a *published* Instagram reel (`content` id 51, live since 2026-08-30, `instagram.com/resaleiqx/reel/Dcq6Dq6tjGp/`) carries the same defects this row fixed in draft form — 5 brands' per-model buy-ceiling prices including Balenciaga, and "sold" language throughout. It predates this session and is not a draft, so it's outside W4; needs a founder/legal-compliance decision on takedown or edit. |
| **W5** | **`compute_authenticity_score` returns `market_avg_price`** — a paid field — to any authenticated user | `backend-eng` | `product-manager` decides, then `backend-eng` | **OPEN** |
| **W6** | **`ELEVENLABS_API_KEY` returns 401.** Voiceover dead; `ELEVENLABS_VOICE_ID` already set | CEO | **founder** | **OPEN** |
| **W7** | **Rotate `RESEND_API_KEY`** — reached a transcript today | `devops` | **founder** | **OPEN** |
| **W8** | **Video assets are B-roll, not marketing.** Need product-in-frame: listing in, verdict out, hook text frame one | **founder** | CEO | **CLOSED** — `docs/marketing/assets/samba-demo-9x16.mp4`, 1080×1920, 15.9s: hook card → the search typing out character by character → **BUY-BELOW €21 · MARKET €32 · LEFT SHELF 63 · STILL LISTED 19,016 · WATCH** → end card. **Captured live from production; no number composed.** Reproducible: `scripts/capture_demo.mjs` → `scripts/make_cards.mjs` → ffmpeg concat. `designer` could not do it — I gave it a browser and **no shell**, so `gen_video.py` was unreachable; **my briefing error**, and it reported the miss rather than faking an asset. Four obstacles solved rather than worked around: hidden Browser pane could not composite → headless Playwright; Playwright wanted an uninstalled headless-shell while four full Chromium builds sat cached → script **discovers** the newest; this ffmpeg has **no `drawtext`** → cards rendered in a browser, which uses the product's own tokens. Frames gitignored (134/run, build output). |
| **W9** | **`live-market-proof.tsx`, `extension-hero.tsx`, `watchedSampleNote()`** still English in all 5 markets | `frontend-eng` | `frontend-eng` | **OPEN** |
| **W10** | **Pricing proposal never implemented.** Recommendation was hold €19/€49 — but the *enforcement* half shipped and the *tier* half was never decided | `monetization` | `product-manager` | **OPEN** |
| **W11** | **A live Instagram reel (`growth.db` `content` id 51, published 2026-08-30, `instagram.com/resaleiqx/reel/Dcq6Dq6tjGp/`) is already carrying the exact defects W4 removed from the draft queue** — per-model buy-ceiling prices for 5 brands including a Balenciaga authenticity-adjacent claim (`under €106.50, sells ≈€171`), and "sold" language throughout. Found while auditing W4; it predates this session and isn't a draft, so it sat outside that row's scope | `content-social` | **founder** (takedown/edit needs Postiz/Instagram UI access) + `legal-compliance` (confirm the Balenciaga call) | **OPEN** |

## Rules that keep this board honest

1. **A finding is not done when the document is written. It is done when the row closes.**
2. **Rows close on evidence** — a commit, a URL, a test count. Not on a claim.
3. **If a row has no doer, the CEO is the blocker.** Say so in the row rather than leaving it to look
   like the finder's problem.
4. **Documents are evidence, not deliverables.** 27,466 lines of prose shipped nothing on their own.
