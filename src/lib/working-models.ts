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
export const FREE_MODELS = ["Adidas Samba", "Nike Air Force 1", "New Balance 530"] as const

export const WORKING_MODELS = ["New Balance 530", "Levi's 501", "New Balance 550"] as const
