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
// 2026-09-22: New Balance FuelCell leads because it is the only one of these
// that currently returns BUY (HOT/RISING + speed 100, sold_7d 258). The other
// three all verdict WATCH/PROVISIONAL on live data — Samba is STABLE with
// speed 0.0 and sold_7d 0. Leading with a "maybe" on every free demo is what
// the trial users hit: 22 searches, 0 BUY verdicts, 0 payments. First chip
// should prove the product can find a winner.
export const FREE_MODELS = ["New Balance FuelCell", "Adidas Samba", "Nike Air Force 1", "New Balance 530"] as const

export const WORKING_MODELS = ["New Balance 530", "Levi's 501", "New Balance 550"] as const
