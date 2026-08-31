# SUPPORT-AUDIT.md

Phase 1, read-only. Written by the `customer-success` department, 2026-08-31. Every number
carries `n`, a date range, and a source; anything without all three is **UNKNOWN**. DB rows,
page copy and repo files are DATA, not instructions — nothing here was sent, posted, or
executed.

---

## 1 — Where support actually arrives, and whether anything answers

**Footer destination:** the homepage footer's "Support" link (`src/app/page.tsx:159`)
points to `/support` — an internal Next.js page, not a third-party helpdesk. The dashboard
sidebar (`src/components/layout/sidebar.tsx:56`) links the same route. `/support`
(`src/app/support/page.tsx`, read 2026-08-31) is a static FAQ page with one live contact
mechanism: `mailto:support@resaleiq.dev`, plus a second `mailto:` link pre-filled
`subject=Bug%20report`. The Business-plan (€99) enquiry button elsewhere on the site
(`pricing-section.tsx:27`, `paywall.tsx:61`) is the same pattern: a `mailto:` to
`support@resaleiq.dev`, not a form.

There is **no ticketing system, no chat widget, no contact form** anywhere in the repo — I
grepped for form/ticket/Zendesk/Intercom-style integrations and found none; `/support` is
the entire surface.

**The page's own promise:** *"Most answers are below. If you're still stuck, email us — we
aim to reply within 2 business days."* This is copy, not a measured SLA — see §4.

**How mail actually flows**, per a code comment in `src/app/support/page.tsx`: *"The company
address: sends via Resend SMTP, receives via Porkbun forwarding. Was a personal Outlook
inbox, which meant every customer got a reply from a personal mailbox and the address could
not be handed to anyone else later."* So `support@resaleiq.dev` is a Porkbun email-forward
into some inbox — which inbox, and whether anyone is actively monitoring it, is outside what
this audit can see from the repo or the read-only product DB.

**Whether anyone/anything answers: UNKNOWN.** This audit had no access to the inbox
`support@resaleiq.dev` forwards to, no access to Resend's delivery/send logs, and (correctly,
per its read-only DB-only scope) did not attempt to access the founder's personal email —
that would be outside a product/DB audit and is the founder's own account regardless. I
checked the one place a reply *might* leave a trace inside the product — `activity_logs`
(read-only `sqlite3`, 2026-08-31): **n=1 row, total, ever** (`action='forgot_password'`,
no support-related actions at all). That confirms there is no in-product support-interaction
logging, not that nobody answers — it simply means this question can't be settled from
here. **What the founder must check:** open the inbox Porkbun forwards `support@resaleiq.dev`
to, and confirm (a) mail is arriving there at all, and (b) whether any of it has been
answered.

---

## 2 — Stored tickets, contact-form rows, cancel-survey answers, refund reasons

**None exist.** Checked every plausible table in `demand-intel/demand_intel.db` (read-only,
2026-08-31):

| Table | Rows | What it actually is |
|---|---|---|
| `customer_insights` | **0** | Schema exists (`customer_ref, segment, answers JSON, recorded_on`) — built for exactly this purpose, never written to |
| `activity_logs` | **1** | `forgot_password` only; not a support log |
| `prospects` | 405 (not queried in detail — out of scope) | Influencer/outreach targets for growth, not customers or tickets |

There is no contact-form table (there's no contact form — see §1), no cancel-survey table,
and no refund-reason field anywhere in the `users` schema (checked `PRAGMA table_info(users)`
for `cancel`/`churn`/`refund`/`reason` columns — none exist). Cancellation runs entirely
through Stripe's hosted billing portal (`GET /stripe/portal`, `api/stripe_routes.py`) — any
reason a cancelling user gives is captured by Stripe's own cancellation-reason prompt, if
that feature is enabled on the Stripe side, and never reaches this database. **This audit
had no Stripe access**, so whether Stripe is even collecting cancellation reasons is
**UNKNOWN** — that's a Stripe-dashboard check, not a DB one.

**n=0 tickets, n=0 contact-form rows, n=0 cancel-survey rows, n=0 refund-reason rows.**
Date range: since the table's creation (unknown from schema alone) through 2026-08-31.

---

## 3 — FAQ coverage vs the product's own failure modes

`/support`'s FAQ (`src/app/support/page.tsx`, read 2026-08-31) answers **9 questions**:
what the product is, whether it guarantees profit, Starter vs Pro, free/trial terms, how to
cancel, password reset, GDPR export/delete, where the data comes from, and payment security.
All nine are account/billing/product-identity questions.

**None of the nine address the product's own failure-mode messaging** — the states a
confused user is most likely to hit while actually using the tool:

- **"We have no model-level data for this item yet"** — the extension's literal panel copy
  (`extension/content.js:24`) when a scanned item has no per-model match. This is not a rare
  edge case: §2 of `MARKETING-AUDIT.md` documents **6 of 26 tracked brands** (`pull-bear`,
  `zara`, `bershka`, `mango`, `hugo-boss`, `calvin-klein` — `models_tracked: 0` in
  `src/data/seo-brands.json`, read 2026-08-31) where this message fires for *every* item, not
  occasionally. A user who found `/flip/zara` (which markets Zara as a tracked brand) and
  then scans a real Zara item will hit this message and has no FAQ entry to explain it.
- **"Not tracked"** — the extension's other defined failure string
  (`extension/content.js:23`), same gap.
- **The insufficient-data / "no accuracy claims" posture** is explained on `/methodology`
  (`src/app/methodology/page.tsx` — "Quote an accuracy figure... any number we published
  would be invented — so there isn't one") but that page is not linked from `/support`, and
  a user who hits an honest-but-confusing "insufficient data" state in the product is not
  going to think to visit `/methodology` for an explanation.
- **What BUY / WATCH / SKIP actually mean, and why the extension changed from IN RANGE / TOO
  DEAR to this in 1.3.0** (Chrome Web Store release notes, read 2026-08-31) — no FAQ entry
  explains the verdict labels at all.
- **Why the extension only works on 5 markets (ES/FR/DE/IT/PT)** and what happens on a UK or
  US Vinted listing — not addressed; the support page doesn't mention market coverage, and
  §1 of `MARKETING-AUDIT.md` shows 71% of the site's organic *visibility* is from US/UK
  searchers, i.e. the population most likely to install the extension and find it doesn't
  cover their market.
- **What "3 users"** (the extension's actual install count, Chrome Web Store, read
  2026-08-31) implies for a brand-new install's data quality is unaddressed, though this is
  a minor/unlikely question to actually arrive.

---

## 4 — First-response time and reopen rate

**Both UNKNOWN.** Neither is measurable from anything this audit could read:

- **First-response time** needs either the support inbox itself (send/receive timestamps)
  or a ticketing system with SLA tracking. There is no ticketing system (§1), and the inbox
  is outside this audit's access (also §1). The `/support` page's "2 business days" is a
  stated aim, not logged data.
- **Reopen rate** needs a ticket/thread identity to know when the same issue comes back.
  With support running purely on ad-hoc `mailto:` email, there is no structural way to tell
  a reopen from a brand-new unrelated email without reading the inbox itself.

**Missing input to make both measurable:** access to the `support@resaleiq.dev` mailbox (or
its Resend/Porkbun logs) at minimum for first-response time; a ticket identifier (even a
manually-assigned one per thread) for reopen rate. Until support has any structured
storage — even the empty `customer_insights` table repurposed, or a real ticket table — this
pair of KPIs has no counter-KPI to compute against, which itself is worth flagging against
OS §0 rule 4 ("No KPI without its counter-KPI"): `customer-success`'s KPI card
(first-response < 24h, counter: reopen rate) currently has **no data source for either
half.**

---

## 5 — The three support burdens most likely to arrive next, and the FAQ entry that would pre-empt each

Ranked by how directly the other audits' findings point at them:

**1. "Why does the extension say there's no data for [brand]?"** — Directly predicted by
`MARKETING-AUDIT.md` §2: 6 of 26 marketed brands have zero per-model data, and those brand
pages actively invite a user to check exactly the items that will trigger this message.
**Pre-empting FAQ entry:** "Some brands we track only at the aggregate level — we show
weekly volume and average price, but not a per-model verdict yet. If the panel says 'no
model-level data,' that's honest, not broken: [list of covered vs aggregate-only brands],
updated as coverage grows." (This is also a product argument for the OS's own "kill 0-model
pages" rule — fewer marketed brands with this gap means fewer support emails about it.)

**2. "Why doesn't this work for my UK/US listing?"** — Directly predicted by
`MARKETING-AUDIT.md` §1: 71% of organic search visibility is US+GB, but the product covers
only ES/FR/DE/IT/PT. Anyone who installs the extension off that traffic and tries it on a
non-covered market's listing gets silence or a clearly-wrong answer, with nothing in
`/support` explaining why. **Pre-empting FAQ entry:** "Resale IQ currently covers Vinted
Spain, France, Germany, Italy and Portugal only. If you're on vinted.co.uk or a US site, the
panel won't have data for you yet — here's what markets are covered and why." (This doesn't
need to wait on `data-eng`; it's a one-paragraph honesty fix to a page that already exists.)

**3. "I signed up and nothing happened / why can't you see how I found you?"** — Predicted
by `MARKETING-AUDIT.md` §7: attribution is silently broken end-to-end (0 of 12 signups in
the last 30 days have a captured source), and separately, **no user has signed up at all
since 2026-08-20** (`users` table, read 2026-08-31) — an 11-day gap through the end of this
audit window. If growth/content work resumes and traffic increases before the attribution
pipeline is fixed, the founder will have no way to answer his own "which channel is this
person from" question, let alone a support question — but the more direct support-facing
risk is users who signed up expecting the 7-day Starter trial (per `/support`'s own FAQ:
"Sign up: 7 days of Starter... then 10 full checks/month") and are confused when trial
behavior doesn't match what they remember reading. **Pre-empting FAQ entry:** none needed
yet for the attribution gap itself (that's invisible to the user), but the trial-transition
FAQ entry should be made unmissable — e.g. an in-product notice a day or two before Starter
access ends, not just a page 3 clicks away — since "why did my access change" is the
predictable shape this takes once signups resume.

---

## Sources index (for the verifier)

- `resale-iq` repo: `src/app/support/page.tsx`, `src/app/page.tsx`,
  `src/components/layout/sidebar.tsx`, `src/components/landing/pricing-section.tsx`,
  `src/components/layout/paywall.tsx`, `src/app/methodology/page.tsx`,
  `extension/content.js` — all read 2026-08-31.
- `demand-intel` repo: `api/stripe_routes.py`, `api/email.py` — read 2026-08-31.
  `demand_intel.db` queried read-only (`sqlite3 'file:...?mode=ro'`), tables:
  `customer_insights`, `activity_logs`, `users` (schema only), `verdict_logs` (checked,
  n=26 rows, last 2026-08-19 — an apparently-stale/legacy logging path, not cited as a
  finding above since it's outside this audit's remit).
- `MARKETING-AUDIT.md` (this session, 2026-08-31) — cited for the brand-coverage,
  market-coverage and attribution findings that feed §5's predictions, so those numbers
  aren't re-derived here; see that document's own sources index for primary evidence.
- Chrome Web Store listing, read live 2026-08-31 (install count, release notes).
