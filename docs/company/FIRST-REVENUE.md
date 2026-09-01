# FIRST REVENUE — four real people, and nobody has ever asked them for money

**Written 2026-09-01 by the CEO after a roster consultation (`product-manager`, `monetization`).
Every figure below was re-queried against production, not taken from a doc.**

---

## The finding

Production `users`, queried live:

| domain | joined | trial ends | email verified |
|---|---|---|---|
| gmail.com | 2026-08-23 | **2026-08-30 — ALREADY EXPIRED** | yes |
| icloud.com | 2026-08-26 | **2026-09-02 — tomorrow** | yes |
| gmail.com | 2026-08-26 | **2026-09-02 — tomorrow** | yes |
| gmail.com | 2026-08-29 | 2026-09-05 | yes |
| mailinator.com | 2026-09-01 | 2026-09-08 | (internal QA probe — not a person) |

**7 users total. 0 have ever had a Stripe subscription.** Four are real people who signed up *and
confirmed their email* — which is the one act that separates curiosity from intent.

**Nobody has ever asked any of them to pay.** `LIFECYCLE_EMAILS` is **unset in the production
container** — verified with `grep -c`, not assumed. The trial→paid machine exists, is merged, is
tested (`alerts/lifecycle_emails.py`, `demand-intel@df9268b`) and has never been switched on.

**This is the only lever we have with a concrete, warm, non-zero n.** Everything else — TikTok, SEO,
the register funnel — is infrastructure for customers two through ten.

## What we cannot say, and must not guess

**We do not know whether any of them ever used the product.** `unlocks_used_total` is `0` for every
user *including the founder's own power accounts*, and `verdict_count_today` is `0` for everyone —
these fields are not written to. There is **no per-user request log** in production (`query_log`,
`api_requests`, `usage_log` do not exist).

So "they signed up and never came back" is **UNKNOWN**, not a finding. It matters, because it changes
what the email should say: an ask aimed at someone who loved the product and an ask aimed at someone
who never opened it are different emails. **A CRM cannot fix this. Telemetry can.**

## The gate

**Emailing users is a standing founder gate** (`APPROVALS.md`). A22 cleared *publishing to social*,
not writing to individuals. **I have not contacted anyone and will not without the founder saying so.**

Two ways to act, and they are not the same:

1. **Send to these four by hand.** Warm, specific, and it can go tonight. Drafts below.
2. **Flip `LIFECYCLE_EMAILS=1`.** One variable. **It only catches FUTURE cohorts** — it will not
   reach the four above, three of whom expire within days. Do both, or do (1) first.

## Drafts — for the founder to send, edit or bin

Deliberately not a discount and not a countdown. Four people is a conversation, not a campaign, and
we have never spoken to a user. The most valuable thing they can give us this week is a sentence
about why they stopped — which is worth more than €19.

**To the two expiring tomorrow, and the one already expired:**

> Subject: your Resale IQ trial (and a genuine question)
>
> Hi — I'm Bilal, I built Resale IQ.
>
> Your trial ends tomorrow and I noticed we never actually spoke. Before it lapses I wanted to ask
> you something directly, because you're one of the first people who ever signed up.
>
> Did it tell you anything useful? If it didn't, I'd genuinely rather know that than have you drift
> off quietly — you'd be doing me a bigger favour than paying would.
>
> If it did, Starter is €19/month and keeps the unlimited checks. If you want it, reply and I'll
> extend your trial another two weeks first, no card, so you can decide properly.
>
> Either way, thank you for trying it.
>
> — Bilal

**Why it is shaped like that:** we have no idea whether they used it (see above), so an email that
*assumes* they loved it would read as spam to someone who never opened it. Asking the question works
in both cases. Offering the extension costs nothing at zero revenue and buys the one thing we
actually lack: a real user's sentence about why the product did not stick.

## Corrections this consultation forced on me

**1. The Stripe product-name problem does not exist.** I briefed the roster that products were still
named "Demand Intel" on live checkout. `monetization` read the **production** key and found
**"Resale IQ Starter"** and **"Resale IQ Pro"**. The "Demand Intel" name is in the **local sandbox**
`.env`. **This is the second time in one day I read a sandbox key and reported it as production** —
the first was declaring Stripe in test mode. Anyone about to "fix" this: do not, it is not broken.

**2. We have 7 users, not 6.** `FUNNEL-BASELINE.md` says 6; production says 7. The artifact and the
doc disagreed and the artifact wins.

**3. `signup_attribution` has 1 row, not 0** — from today's QA signup. My earlier claim that it
"finally produces data" was loose: what started working today is **UTM tagging on `pageviews`**.
Attribution itself has one row, and it is ours.

**4. Two defects the older docs still list as open are already fixed** — Portfolio P&L gating
(`ae6c708`) and the evidence-floor gate on `market_avg_price` (`6c3552d`), both confirmed running in
production. A session spent "fixing" either would be wasted.

## The CRM question, answered

**Both `product-manager` and `monetization` said no, independently.** A CRM manages relationships
with customers; we have four warm trials and zero customers. RICE makes it mechanical rather than
rhetorical: **CRM's reach is hard-capped at 7 people**, while the funnel fix, lifecycle email and the
blog are each bounded by 28 visitors/day or every future trial — a strictly larger ceiling.

**Build the cheap version anyway, because it costs a day:** production already has **`prospects`
(16 columns) and `customer_insights` (5 columns)** tables — built, empty, unused. That is closer to
"CRM for the first ten" than anything worth designing. Notion is connected to the founder's own
session, so a Notion database fed from production is the shortest path if he wants a view he can
open on a phone. **Note:** an unattended agent cannot reach Notion the way this session can — it
would need a REST token, which is a founder-only step.

## What NOT to do this week

- **Do not expect the fixed `/register` page to produce a customer by itself.** At 3 people/day
  reaching it, tomorrow being the first unbroken day buys a cleaner *measurement*, not volume.
  Closing the visitor gap is a multi-month problem and saying so is worth more than a plan that
  quietly assumes Friday.
- **Do not change the price.** No willingness-to-pay data exists at any price. Change the pitch.
- **Do not build the CRM system.** Build the tracker.
