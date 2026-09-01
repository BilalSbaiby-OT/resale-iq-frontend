# UX RULES — Jakob's Law governs

**Founder instruction, 2026-09-01:** *"tell product growth department to use Jakob's law for the UX"*.

**Binding on Product & Growth** (`product-manager` head; `ux-researcher`, `designer`,
`content-social`, `seo`, `lifecycle`) and on `frontend-eng` for anything customer-facing.

---

## The law

> **Users spend most of their time on other sites. They prefer your site to work the same way as all
> the other sites they already know.** — Jakob Nielsen

**What it means for us in one sentence: we get no credit for originality on the plumbing.** A
visitor arrives with expectations built by Vinted, Amazon, Depop and every SaaS signup they have ever
completed. Every place we differ, they pay attention — and attention spent on our navigation is
attention not spent on the number we exist to show them.

**Where we SHOULD be different: the verdict.** BUY / WATCH / SKIP, the buy-below number, saying
UNKNOWN when the evidence is thin. That is the product and it should feel unlike anything else.
**Everywhere else, be boring.** Originality in a signup form is a bug.

---

## The three violations we have already measured

These are not hypothetical. They are on the live site and they map to real losses.

### 1. No language switcher. Anywhere.

We serve **six languages** and there is **no way for a visitor to choose one** — `grep` for a
switcher component in `src/` returns zero hits. Every multilingual site on the internet puts one in
the header or the footer. Ours has none.

**What it cost:** a visitor served the wrong language had no way back. When `/register` was rendering
Spanish to English speakers, the page was not merely wrong — it was **inescapable**. A switcher would
have reduced a conversion-killing bug to a two-second annoyance.

**Still live:** anyone carrying a wrong `NEXT_LOCALE` cookie keeps it for **up to a year**. The
detection fix protects new visitors only. **A switcher is the only thing that reaches the ones
already affected.**

### 2. `/register` has no way back to the site

The register page links to `/terms`, `/privacy` and `/login` — and **not to `/`**. On every signup
page a person has ever used, the logo goes home. Someone who lands there not ready to commit has no
exit but the browser back button.

**We get 3–4 people a day on that page. All of them left.**

### 3. The page you clicked from and the page you land on disagreed

Clicking a CTA on an English page and landing on a Spanish form breaks the most basic continuity
expectation there is. Fixed 2026-09-01 in `32508b8` / `49d36cc` — recorded because it is the purest
Jakob's Law failure we have had: nobody expects a link to change the language.

---

## How to apply it, concretely

**Before shipping any customer-facing surface, ask: where would a stranger expect this to be?**

- **Logo, top-left, links to `/`.** Always.
- **Language switcher, header or footer**, showing the current language. Standard.
- **One primary action per screen**, and it looks like a button.
- **Errors next to the field that caused them**, in the visitor's language.
- **Price displayed with the currency and the period** — €19/month, not "19".
- **A form that fails says what to do next.** "Something went wrong" is not that.
- **Back always works.** Never trap a person in a state they cannot leave — that is violation 1 and
  2 generalised, and it is the shape of our worst bugs.

**And the corollary, which matters as much:** if a convention exists and we are ignoring it, that is
a decision requiring a reason on the record. "It looks better" is not a reason. **The visitor's
existing habits are worth more than our taste.**

---

## What this does NOT license

- **Do not copy a competitor's dishonesty** because it is conventional. Everyone in resale shows
  confident numbers on thin data; we show UNKNOWN below **8 comparables**, and that stays.
- **Do not flatten the verdict into a generic dashboard** because dashboards are familiar. The
  verdict IS the product.
- Jakob's Law is about **removing friction from the parts nobody came for.** It is not permission to
  make the parts they did come for ordinary.

---

## First three tickets

| # | what | doer |
|---|---|---|
| 1 | **Language switcher**, header + footer, all six locales, sets `NEXT_LOCALE` — the only fix that reaches visitors already carrying a wrong cookie | `frontend-eng` |
| 2 | **Logo → `/` on `/register`**, plus every other unprefixed auth page | `frontend-eng` |
| 3 | **Jakob's Law audit** of the free checker and the verdict surface — the two screens that carry all our traffic — listing each deviation from convention and whether it is deliberate | `designer` |

Ticket 1 is the one with measured cost behind it. Do it first.
