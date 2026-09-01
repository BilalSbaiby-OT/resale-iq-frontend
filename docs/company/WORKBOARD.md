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
| **W1** | **E2 — registering makes the product WORSE.** Anonymous sees `buy_below` + `sell_avg`; logged-in free sees **less** for the same query (`routes.py:975-995` vs `1022-1039`), while the only CTA on every result page is "Unlock the rest →" pointing at `/register` | `ux-researcher` → `monetization` | `backend-eng` | **OPEN — highest conversion value on the board** |
| **W2** | **`/flip`: 136 of 157 URLs, and all 10 `/category`, have never earned one Google impression** | `seo` | `seo` | **OPEN** — needs Index Coverage first (new session; GSC creds fixed) |
| **W3** | **`resaleiq.com` is not ours, returns 200, someone else owns it.** Two queued posts pointed at it | CEO | **founder** | **OPEN** — buy it or accept the confusion |
| **W4** | **53 remaining queue drafts** carry retracted vocabulary and/or per-model prices | `content-social` | `content-social` | **OPEN** |
| **W5** | **`compute_authenticity_score` returns `market_avg_price`** — a paid field — to any authenticated user | `backend-eng` | `product-manager` decides, then `backend-eng` | **OPEN** |
| **W6** | **`ELEVENLABS_API_KEY` returns 401.** Voiceover dead; `ELEVENLABS_VOICE_ID` already set | CEO | **founder** | **OPEN** |
| **W7** | **Rotate `RESEND_API_KEY`** — reached a transcript today | `devops` | **founder** | **OPEN** |
| **W8** | **Video assets are B-roll, not marketing.** Need product-in-frame: listing in, verdict out, hook text frame one | **founder** | `designer` + `content-social` | **OPEN** |
| **W9** | **`live-market-proof.tsx`, `extension-hero.tsx`, `watchedSampleNote()`** still English in all 5 markets | `frontend-eng` | `frontend-eng` | **OPEN** |
| **W10** | **Pricing proposal never implemented.** Recommendation was hold €19/€49 — but the *enforcement* half shipped and the *tier* half was never decided | `monetization` | `product-manager` | **OPEN** |

## Rules that keep this board honest

1. **A finding is not done when the document is written. It is done when the row closes.**
2. **Rows close on evidence** — a commit, a URL, a test count. Not on a claim.
3. **If a row has no doer, the CEO is the blocker.** Say so in the row rather than leaving it to look
   like the finder's problem.
4. **Documents are evidence, not deliverables.** 27,466 lines of prose shipped nothing on their own.
