# Stripe (frontend)

Frontend never stores price IDs. It calls `/stripe/plans`, `/stripe/checkout`, `/stripe/portal`.

`src/lib/pricing.ts` placeholders: `__OPERATOR__` → plan id `operator` (Starter €19),
`__POWER__` → plan id `power` (Pro €49). Business has no priceId (mailto).

Env naming trap (backend):
- `STRIPE_PRO_PRICE_ID` = Starter / operator
- `STRIPE_OPERATOR_PRICE_ID` = Pro / power

Do not change Stripe dashboard, prices, or webhook settings.
