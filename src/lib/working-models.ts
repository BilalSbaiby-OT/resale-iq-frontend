/**
 * Item-level queries that currently return a live WATCH with buy-below.
 * Bare-brand screens (Nike / Ralph Lauren / Nike Nocta) must offer these
 * as the next click — not "Nike sneaker" (a brand-average, not an item).
 *
 * WORKING_MODELS is the signed-in catalogue. FREE_MODELS is the anon
 * allowlist — live `/api/verdict` 200 WITH A REAL MODEL-LEVEL VERDICT
 * (buy-below not null), checked 2026-09-29. Levi's 501 and New Balance 550
 * 402 for anonymous visitors; never put them on a free chip.
 */
// FREE_MODELS drives the homepage/checker "try these" chips and every
// free/no-account copy claim. api/routes.py's _PUBLIC_SAMPLE_QUERIES
// frozenset is broader (it also 200s "new balance fuelcell" and the BUY-
// ladder queries) but bypassing the paywall is not the same promise as
// "this model has a free buy-below" — copy must only name models that
// actually resolve to a priced verdict, not a brand-category fallback.
//
// ORDER IS A CONVERSION DECISION. The first chip is the product's demo: for
// most visitors it is the only verdict they will ever see. It must return a
// real demand figure AND substitution alternatives, or the demo teaches people
// we have no data.
//
// 2026-09-29: New Balance 530 REMOVED from this list. Measured live, it
// now 402s for anonymous visitors (previously verdicted SKIP with
// buy_below=null — 73 watched departures/7d vs 125,627 active listings —
// the single most-searched free query showed every new visitor a red
// dead-end with no price). It was also FIRST_CHECK_QUERY (src/lib/checkout.ts,
// since replaced with Nike AF1 by a separate fix) and the register-verify
// preview sample, so the WORST possible number was a new account's very
// first impression.
//
// 2026-09-29: New Balance FuelCell ALSO REMOVED. Measured live it 200s but
// verdicts BRAND_CATEGORIES with buy_below null — a brand-average fallback,
// not a model-level answer. It bypasses the backend paywall gate but is not
// a usable free sample and must not be named as one in copy.
//
// Replaced with Fred Perry Polo. Chosen by querying prod model_signals
// directly (comparable_n>=20, buy_below not null, sold_30d DESC) and
// confirming through engine.sufficiency.signal_verdict (the SAME function
// /api/verdict calls) — not guessed. Live: WATCH, buy_below €8.18,
// sold_30d 1656 (highest of every candidate clearing the n>=20 floor),
// comparable_n 65, 3 alternatives.
//
// 2026-09-29 figures, all three live 200 with a priced buy-below:
//   Fred Perry Polo   WATCH/MEDIUM  buy<=€8.18   sold_7d 66
//   Nike Air Force 1  WATCH/MEDIUM  buy<=€30.70
//   Adidas Samba      WATCH/MEDIUM  buy<=€20.64
// RE-CHECK THIS LIST whenever the demand pipeline or paywall gate changes.
export const FREE_MODELS = ["Fred Perry Polo", "Nike Air Force 1", "Adidas Samba"] as const

export const WORKING_MODELS = ["Fred Perry Polo", "Levi's 501", "New Balance 550"] as const
