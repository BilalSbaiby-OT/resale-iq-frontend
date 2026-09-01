# FIRST REVENUE — they didn't ignore us. We broke it for them.

**Rewritten 2026-09-01 after the founder pushed back on "we can't tell whether anyone used it."
He was right. We can, and the answer changes everything below.**

---

## The correction that started this

I claimed no per-user usage telemetry existed. **It does.** `verdict_logs` — **432 rows, with a
`user_id` column.** I had searched for `query_log`, `api_requests`, `usage_log` and `verdict_log`
**singular**, missed the real table by one character, and asserted the data did not exist rather than
listing the tables. Production has **50 tables**; listing them took one query.

**Verify, don't assume — and I asserted an absence, which is the hardest claim to make and the one I
had least evidence for.**

## The answer

```
user  1   gmail      power   checks=11   last 2026-09-01
user 47   gmail      power   checks=0
user 68   gmail      free    trial ended 2026-08-30   checks=0
user 69   icloud     free    trial ends  2026-09-02   checks=0
user 70   gmail      free    trial ends  2026-09-02   checks=0
user 79   gmail      free    trial ends  2026-09-05   checks=0
user 80   mailinator free    (internal QA probe)      checks=0
```

**417 of 432 checks were run by ANONYMOUS visitors. 11 of the remaining 15 are the founder's own.**

**Every real registered user has run exactly zero checks.** Not few. Zero.

## Why — and this is not speculation, the dates line up exactly

**W1: "registering makes the product WORSE."** An anonymous visitor saw `buy_below` and `sell_avg`.
The moment they registered, a free logged-in account saw **less** for the same query — while the only
CTA on every result page read *"Unlock the rest →"* and pointed at `/register`, a page they had just
completed.

**The fix landed TODAY** — `demand-intel@5019fa0`, merged `d170987`, **2026-09-01**.

**Our four real users registered on 2026-08-23, 08-26, 08-26 and 08-29 — every one of them before
the fix.**

So the full story, end to end, with a number behind each step:

1. The free anonymous checker works. **417 anonymous checks** prove people use it and it delivers.
2. They liked it enough to **create an account and confirm their email** — the strongest intent
   signal a stranger can give us.
3. **Registering took the numbers away.** The product they had just chosen got worse the moment they
   committed to it.
4. **They never ran another check. Zero, all four.**
5. Their trials expired, and **nobody ever asked them to pay** — `LIFECYCLE_EMAILS` is still unset in
   production.

**They did not lose interest. We punished them for signing up, and then went quiet.**

**Tomorrow is the first day in this company's history that registering does not make the product
worse.**

## What to say to them — rewritten, because the old draft was wrong

My earlier draft asked "did it tell you anything useful?" That question is now answered: **they never
got to find out.** Asking it would look like we had not looked.

> Subject: we broke it, and I fixed it
>
> Hi — I'm Bilal, I built Resale IQ.
>
> You signed up a few days ago and I owe you an apology, because I've just found out what happened.
>
> Before you registered, the site showed you a price and a buy-below number. After you registered, a
> bug took those away and showed you *less* than you'd seen as a stranger. You created an account and
> the product got worse. I'm not surprised you didn't come back.
>
> That's fixed as of today. Your account now gets everything the anonymous page showed you, and more.
>
> Your trial's expired (or is about to) — but you never actually got to use it, so I've reset it.
> Fourteen days from now, no card, nothing to cancel. If you try one search and it's useless, tell me
> and I'll stop emailing you. If it's useful, Starter is €19/month.
>
> Either way, sorry. You were one of the first people who ever trusted this thing.
>
> — Bilal

**Why this shape:** it is true, it is checkable, and it is the single most persuasive thing we can
say — we know exactly what went wrong and we fixed it. **This is only sendable because it is honest.**
Manufacturing this story would be fatal; having actually lived it is an asset.

**Recipients:** users 68, 69, 70, 79. **Not** 80 (our own QA probe) and **not** 47.

## The gate

**Emailing users is a standing founder gate** (`APPROVALS.md`). A22 cleared publishing to social, not
writing to individuals. **I have contacted nobody.**

Resetting those four trials is a **database write against real user accounts** — also the founder's
call, and it should happen before the email goes out, not after, or the email promises something that
is not true yet.

## What this reframes

- **The `/register` funnel is not our worst problem. Activation is.** People sign up. They then hit a
  product that had been made worse by signing up.
- **A CRM was never the answer** — both `product-manager` and `monetization` said so independently,
  and this is why: the problem was never tracking these four people. It was what happened to them.
- **`LIFECYCLE_EMAILS=1` is worth more tomorrow than it was yesterday**, because for the first time
  the product a trial email points at is not broken.

## Corrections still standing from the earlier version

- **Stripe products are correctly named** "Resale IQ Starter"/"Resale IQ Pro" in production. The
  "Demand Intel" name is in the **local sandbox** `.env`. That was my second sandbox-key misread in
  one day.
- **7 users, not 6.**
- Portfolio P&L gating (`ae6c708`) and the `market_avg_price` evidence floor (`6c3552d`) are already
  fixed in production, whatever the older docs say.
