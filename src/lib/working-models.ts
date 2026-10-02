/**
 * WORKING_MODELS is the signed-in catalogue: item-level queries that
 * currently return a live WATCH with buy-below. Bare-brand screens (Nike /
 * Ralph Lauren / Nike Nocta) must offer these as the next click, not
 * "Nike sneaker" (a brand-average, not an item).
 *
 * The anonymous allow-list lives in ./free-samples.ts (FREE_SAMPLES), the
 * one list every free/no-account claim reads. Levi's 501 and New Balance
 * 550 402 for anonymous visitors; never put them on a free chip.
 */
export const WORKING_MODELS = ["Fred Perry Polo", "Levi's 501", "New Balance 550"] as const
