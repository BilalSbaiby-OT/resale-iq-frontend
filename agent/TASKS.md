# TASKS — work top-down, never skip, one per session

Rules: P1 does not start until every P0 box is `[x]`.
Check the box in the SAME commit as the work.

## P0 — trust
- [x] **P0-0** Repo map into HANDOFF (stack, routes, where counts live, Stripe, extension path, i18n, test command)
- [x] **P0-1** `/data` never empty: if the live query returns 0, show the last-good snapshot + UTC timestamp
- [x] **P0-2** One warehouse for every "items tracked / sold 7d / brand weekly" number (homepage, `/data`, `/flip/*`, meta). Kill hardcoded drifting counts.
- [x] **P0-3** If sell-through is paused, show raw `units_sold_7d` and `active_listings`. No dead "measuring" hole. Do NOT unpause the % until the 20% discovery-rate check passes.
- [x] **P0-4** Homepage hero = screenshot of the extension panel on a Vinted listing + primary CTA "Add to Chrome". Methodology off the hero.
- [x] **P0-5** Pro CTA is self-serve checkout. Delete "Talk to us" on Pro. Business may keep it.
- [x] **P0-6** Hide the authenticity 0–100 score from homepage, pricing, and the default extension panel.
- [x] **P0-7** Extension listing copy in-repo: `support@resaleiq.dev` (not Outlook), "not affiliated with Vinted" in paragraph 1, screenshots if capturable.
- [x] **P0-8** Freshness line on homepage + `/data`. If the scrape is >2h old, warn — but still show the numbers.

## P1 — only after every P0 is [x]
- [x] **P1-1** Replace 10 lifetime unlocks with 7 days unlimited, then 10 checks/month.
- [x] **P1-2** Extension panel: buy-below, median sold, n, BUY/WATCH/SKIP. Never cover the Buy button. "I bought at €X" button. Logged-out first 10 views still show numbers.
- [x] **P1-3** Short homepage (hero under 80 words).
- [x] **P1-4** i18n FR + ES for marketing + panel. `vinted.fr` → French, `vinted.es` → Spanish.
- [x] **P1-5** Outcome log row for bought-at vs later sold. No public scorecard until n >= 30.

## P2 — not in the first 8h unless P0+P1 are done
- [ ] Deal alerts
- [ ] Median + n quality bar
- [ ] `/data` weekly table

## Hard no (do not do these, ever)
UK market · REST API · Order Planner · auto-buy · fake hit rates · fake users ·
authenticity marketing · rewriting the whole app.
