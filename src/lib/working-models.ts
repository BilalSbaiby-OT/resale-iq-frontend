/**
 * Item-level queries that currently return a live WATCH with buy-below.
 * Bare-brand screens (Nike / Ralph Lauren / Nike Nocta) must offer these
 * as the next click — not "Nike sneaker" (a brand-average, not an item).
 *
 * WORKING_MODELS is the signed-in catalogue. FREE_MODELS is the anon
 * allowlist — live `/api/verdict` 200 with buy-below (checked 2026-09-21).
 * Levi's 501 and New Balance 550 402 for anonymous visitors; never put
 * them on a free chip.
 */
// FREE_MODELS drives the homepage/checker "try these" chips and the free
// sample gate in api/routes.py (_PUBLIC_SAMPLE_QUERIES — keep in sync).
//
// ORDER IS A CONVERSION DECISION. The first chip is the product's demo: for
// most visitors it is the only verdict they will ever see. It must return a
// real demand figure AND substitution alternatives, or the demo teaches people
// we have no data.
//
// 2026-09-22 (re-measured live AFTER the staleness fix, commit 34df8b4):
//   New Balance 530      WATCH/MEDIUM  buy<=€25.61  1235 sold/30d  3 alternatives
//   Nike Air Force 1     WATCH/MEDIUM  buy<=€31.24   181 sold/30d  3 alternatives
//   Adidas Samba         WATCH/MEDIUM  buy<=€31.83    88 sold/30d  3 alternatives
//   New Balance FuelCell WATCH/LOW     buy<=€47.23  NO demand fig  0 alternatives
//                        └─ "Too few comparable departures", reason=thin_comparables
// FuelCell was previously FIRST, chosen when it returned BUY on pre-outage data.
// That is no longer true: it is now the ONLY one of the four with no demand
// figure and no alternatives — our weakest possible first impression. Demoted
// to last. NB 530 leads: strongest evidence (1235/30d) and it is also our
// most-searched model, so the demo matches real intent.
// RE-CHECK THIS ORDER whenever the demand pipeline changes.
export const FREE_MODELS = ["New Balance 530", "Nike Air Force 1", "Adidas Samba", "New Balance FuelCell"] as const

export const WORKING_MODELS = ["New Balance 530", "Levi's 501", "New Balance 550"] as const
