# ACTIVATION — the funnel from click to signed-in, walked as a Spanish reseller

Written by `customer-success`, 2026-09-01, the first session this role has had Gmail (read-only) and
a browser. Two X posts went live in the last hour; strangers may actually click through for the first
time. This is what happens after the click.

**Read `docs/company/GAPS.md`, `docs/audit/SUPPORT-AUDIT.md`, `docs/product/LIFECYCLE.md` and
`docs/company/WORKBOARD.md` first — this file does not repeat what they already establish, it adds
what this session found new.**

---

## 0. A tooling failure, stated first because it limits everything below

**I could not walk `https://resaleiq.dev/es` live.** The Browser pane's tab (`tab-1`) was pinned to a
local file preview from a prior session, and every `navigate` call — including through
`browser_batch` and even `resize_window` — failed identically: *"Tab tab-1 is pinned to a local file
preview and cannot navigate. Open a new tab with `tabs_create` and open there instead."*
`tabs_create` is not in this session's tool list. I retried five times with different URLs
(`resaleiq.dev/es`, `example.com`, `about:blank`) and got the same deterministic error every time —
this is not flakiness, the tool is unusable this session.

**I am not fabricating a browser walk.** Everything below the line is a **static code read**, clearly
labelled as such, not a live observation. It is evidence-backed and file/line-cited, but it is not the
same claim as "I clicked through the live site and this is what rendered" — a build could differ from
what's on `main`, and the browser-based verification the founder actually asked for is still owed.
**WORKBOARD W16** below names the doer for the tooling fix so the next verification request doesn't
hit the same wall.

---

## 1. The registration-parity fix (W1) — confirmed in code, NOT confirmed live

`demand-intel/api/routes.py:968-1060` (`main` branch, read 2026-09-01): the `_gate()` function's
free-logged-in branch now mirrors the anonymous-teaser field set exactly (`buy_below`, `sell_avg`,
`sell_median`, `sold_7d`, `active_listings`, `confidence`, `n`) — the code, its own inline comment,
and the commit history all agree registering can only add access, never subtract it. This matches
what `WORKBOARD.md` W1 describes as fixed and what the task brief calls `d170987`.

**What I could not confirm:** whether the running production container serves this commit.
`demand-intel/SCOREBOARD.md` (written earlier today by `verifier`) independently flags the identical
gap — "Does the deployed container actually run commit 7a86966?" is still UNKNOWN, pending a
`docker exec` check nobody has run. **Code-correct is not the same claim as live-correct**, and this
session could not close that gap because of §0. Someone with shell/devops access needs to either run
that check or open a working browser tab against the live site.

---

## 2. Onboarding / the activation gap — narrower than "empty dashboard"

Confirmed from `resale-iq/src/app/(dashboard)/dashboard/page.tsx` (read in full): the page a
newly-verified user lands on (`verify-email/page.tsx:36`, `router.replace("/dashboard")`) is **not**
empty. It renders real aggregate data unconditionally — top opportunities, brand rankings, trending
models, recently-departed listings — plus, for a free-plan user specifically, a CTA banner: *"Analyze
an item before you spend... Check an item →"* linking to `/verdict`. So a user who lands there and
looks around has something to do and something to look at.

**The actual gap is narrower and matches `docs/product/LIFECYCLE.md`'s own diagnosis: nobody is ever
proactively told to come back and do that.** Confirmed: `LIFECYCLE_EMAILS_ENABLED` in
`demand-intel/config.py:298` defaults false, the job is registered conditionally in
`main.py:903-912`, and `docs/company/APPROVALS.md`'s founder gate for sending marketing email has not
been pulled. `SCOREBOARD.md` independently flags that even the *env var's* production state — as
opposed to the code default — is still unverified (`docker exec env | grep LIFECYCLE_EMAILS`, not
yet run). Net: the welcome/recap/ending sequence in `LIFECYCLE.md` §3 is ready-to-approve copy sitting
behind a real founder gate, correctly not fired, and the dashboard itself is not the problem — the
silence between "verified" and "next visit" is.

---

## 3. Support inbox — checked for the first time, via Gmail

**Confirmed the inbox is real and forwarding works.** `support@resaleiq.dev` forwards to the Gmail
account this session has read access to — proven by that account's own 2026-08-14 round-trip test
(`support@resaleiq.dev` → `support@resaleiq.dev`, landed). `SUPPORT-AUDIT.md` §1 correctly flagged
this as UNKNOWN on 2026-08-31; it is now KNOWN.

**Volume, ever, at `support@resaleiq.dev`: one message.** 2026-08-15, from `sbaibyrayhana@gmail.com`
("Rayhana Sbaïby" — shares the founder's surname, "Sbaiby"), body: "Hi". Replied 25 seconds later
("hello"). That is not a customer enquiry in any useful sense — no product question, no account
reference, near-certainly a personal/family test of the address, not a reseller. **No Stripe customer
notification exists in the inbox either** — the only Stripe event on this product, ever, is
`notifications@stripe.com`, 2026-08-04, *"Payment of €19.00 from Bilal Sbaiby for Demand Intel"* — the
founder's own name, same-day as server setup. **No bounce, no `mailer-daemon`, nothing else.**

**"Nothing" is the honest answer, per the brief, and it is delivered as that — not manufactured as
volume.** `SUPPORT-AUDIT.md` §4's "first-response time UNKNOWN, reopen rate UNKNOWN" both remain
technically true (n=1 is not a rate), but the KPI card's own primary ("first response < 24h") would
currently read as **met, n=1, response time ~25 seconds** if anyone scored it — flagging that reading
as real but useless at this population, per OS §0.2.

---

## 4. The refund that was never a refund — corrected on disk

Confirmed via the same inbox: the "1 customer, refunded and cancelled" fact repeated across four
company documents is false. The only Stripe subscription event this product has ever generated is the
founder's own €19 test (§3 above) — no refund or cancellation notification for it, or for anyone else,
exists anywhere in the inbox. The founder separately confirmed this was him testing Stripe.

**Corrected this session, with a dated inline note (not silently rewritten) in:**
- `docs/company/PATH-TO-TEN.md` — the claim anchored §1.1's Pro-tier risk argument and §1.2's entire
  trial→paid range; both sections' *arithmetic* conclusions are unaffected (C11 still gates Pro on its
  own), only the false narrative is corrected.
- `docs/company/GTM.md` §0 — the situation table.
- `docs/audit/MONETIZATION.md` — the headline number and a specific false attribution to
  `customer-success` having "a read" on what the non-existent refunder wanted. No such read was ever
  produced by this role.
- `docs/company/DIGEST-2026-09-01.md` — used the fake refund as evidence for pausing GTM execution;
  the pause argument (funnel loses most visitors before it can answer honestly) does not need the
  fabricated refund and stands without it.

**Not corrected: `docs/company/GOALS.md:117`.** It carries the same false "1 customer ever
(refunded, cancelled)" line, but per `DIGEST-2026-09-01.md` that file is **sha256-hashed specifically
so a later edit is detectable** — editing it myself would look identical to tampering with a
pre-registered goal. Flagging it for whoever holds the hash to re-issue deliberately (WORKBOARD W17).

---

## 5. The core question: why does a Spanish reseller leave without signing up?

**Static code read, not a live walk (§0). Answer: localization stops at exactly the moment of highest
commitment.**

`src/app/[locale]/page.tsx` + `src/lib/i18n.ts` confirm the `/es` (and `/fr`, `/de`, `/it`, `/pt`)
landing pages are genuinely translated — hero, features, footer nav labels, the "4 in 10" honesty line
correctly removed from the hero on 2026-09-01 (`landing-content.tsx:85-103`, applies to all locales
since they share one component). The pitch itself is not the problem.

**Every link off that page is not locale-aware.** `landing-content.tsx` — read for every `href` — the
"Create free account" CTA (`/register?plan=free`), "Sign in" (`/login`), and every footer link
(`/support`, `/terms`, `/privacy`) point at the bare English routes with no `/es` prefix and no
`?locale=` param. There is no `[locale]` route for any of them — `Glob` of
`src/app/**/page.tsx` finds locale routing exists **only** for the homepage. Confirmed by reading each
page in the actual signup path:

- **`(auth)/register/page.tsx`** — plan names, descriptions, the Terms/Privacy consent checkbox, and
  — specifically — the **EU 14-day-withdrawal-waiver checkbox** (a legally load-bearing sentence a
  paying user must tick to lose a real consumer right) are English-only.
- **`(auth)/check-email/page.tsx`** and **`(auth)/verify-email/page.tsx`** — English-only.
- **`(dashboard)/dashboard/page.tsx`** (§2 above) — English-only, including the free-tier CTA banner.
- **`/support`** — English-only (also independently flagged by `SUPPORT-AUDIT.md` §3 for a different
  reason: it doesn't address market coverage either).

**So the walk, as a Spanish reseller who does not read English fluently:** the pitch and the honesty
line make sense; the visitor decides to try it; the instant they click "crear cuenta gratis" they hit
a plan-selector, a password field, and a legal checkbox about waiving a withdrawal right, entirely in
a language they may not trust themselves to read correctly. That is the single highest-friction,
highest-stakes point in the entire funnel — a legal consent — and it is also the exact point
localization silently stops. **This is a different and larger gap than `WORKBOARD` W9** (which names
three specific English components inside the already-logged-in product); this is the **entire
authentication path**, unlocalized, structurally, with no per-string fix possible short of adding
locale awareness to the auth/account/support route group itself. New row: **WORKBOARD W16.**

---

## Sources

Gmail (`emmanuelbilal33@gmail.com`, the account `support@resaleiq.dev` forwards to): thread
`1a004c2913ecf371` (the one inbound support email), thread `19fcec0ac9fec422` (the founder's own
Stripe payment notification), thread `1a0015cf304458bd` (the forwarding round-trip test), plus a full
`in:anywhere` and `to:support@resaleiq.dev` search, read 2026-09-01. `demand-intel/api/routes.py:940-1060`,
`demand-intel/config.py:296-298`, `demand-intel/main.py:720-912`, `demand-intel/SCOREBOARD.md`,
`resale-iq/src/app/(auth)/register/page.tsx`, `.../check-email/page.tsx`, `.../verify-email/page.tsx`,
`resale-iq/src/app/(dashboard)/dashboard/page.tsx`, `resale-iq/src/components/landing/landing-content.tsx`,
`resale-iq/src/lib/i18n.ts`, `resale-iq/src/app/[locale]/page.tsx` — all read 2026-09-01, `main` branch
of each repo.
