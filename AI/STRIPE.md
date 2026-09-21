# Stripe (frontend)

Frontend never stores price IDs. It calls `/stripe/plans`, `/stripe/checkout`, `/stripe/portal`.

`src/lib/pricing.ts` placeholders: `__OPERATOR__` → plan id `operator` (Starter €19),
`__POWER__` → plan id `power` (Pro €49). Business has no priceId (mailto).

Env naming trap (backend):
- `STRIPE_PRO_PRICE_ID` = Starter / operator
- `STRIPE_OPERATOR_PRICE_ID` = Pro / power

Do not change Stripe **prices, price IDs, or webhook settings**. The inverted env names are
historical and intentional.

---

## Conversion P0 — Checkout must say Resale IQ, not Demand Intel

Live account `acct_1TmFnC1Mvj7CL8HQ` is still named **Demand Intel**. Bank statements and
Stripe Checkout historically showed that name. The product the customer just bought is
**Resale IQ**. That mismatch is a trust kill at the card form.

Checkout Session creation lives in **demand-intel** `api/stripe_routes.py` (`POST /stripe/checkout`).
This frontend now POSTs extra fields (`display_name`, `product_name`, `product_description`,
`country`) so the backend can forward them. Pydantic ignores unknown keys by default. If
production 422s, drop the extras and keep `price_id` / `locale` / `success_url` / `cancel_url`.

### Bilal — Stripe Dashboard (required; agents cannot do this)

Do these on the **live** account (the one in the browser, not the sandbox `acct_1TmFnX`).
Do **not** touch prices, price IDs, or webhooks.

1. **Business name (Checkout header)**
   - Settings → Business details (or Public details) → **Business name**
   - Set to: `Resale IQ`
   - Website: `https://resaleiq.dev`
   - Support email: `support@resaleiq.dev`
   - This is what Stripe Checkout shows as the merchant if `branding_settings.display_name`
     is not set on the Session.

2. **Branding (logo / colours)**
   - Settings → Branding
   - https://dashboard.stripe.com/settings/branding
   - Icon + logo: the Resale IQ mark (same as the site header)
   - Brand colour / button: `#34C759` (site buy/accent)
   - Background: dark `#0B0D10` if hosted Checkout allows it; otherwise leave light
   - Display name on Checkout: `Resale IQ`

3. **Statement descriptor (bank statement)**
   - Settings → Public info / Statement descriptor
   - https://docs.stripe.com/get-started/account/statement-descriptors
   - Static descriptor: `RESALE IQ` (5–22 Latin chars, no `<>\'"*`)
   - Shortened descriptor / prefix (cards): `RESALEIQ` (2–10 chars)
   - Subscriptions **cannot** set `statement_descriptor` on the Checkout Session
     PaymentIntent. The Product and the account default win. Also set the descriptor
     on each Product (Starter + Pro) to `RESALE IQ`.

4. **Product names + descriptions (line item on Checkout)**
   - Product catalog → the two live prices
     - `price_1U0psg1Mvj7CL8HQ58vsNbPF` → Starter / operator / €19
     - `price_1U0psh1Mvj7CL8HQd4eK0kVM` → Pro / power / €49
   - Rename products if they still say Demand Intel:
     - **Resale IQ Starter** — “Unlimited BUY/WATCH/SKIP buy-below checks on ES/FR/DE/IT/PT Vinted.”
     - **Resale IQ Pro** — “Live Deal Finder, Order Planner and unlimited buy-below checks on ES/FR/DE/IT/PT Vinted.”
   - Do not change the Price IDs or amounts.

5. **Tax friction (`requires_location_inputs`)**
   - Settings → Tax: keep Stripe Tax on if we are registered to collect VAT.
   - Prefer **not** requiring tax IDs at Checkout (`tax_id_collection` off) unless counsel
     says we must collect them.
   - `billing_address_collection` should be `auto`, not `required`. Country is now collected
     on `/pricing` and sent as `country` so the backend can prefill Customer.address.country.

6. **€0 trial still asking for a card**
   - If a Price or Checkout Session still has `trial_period_days` / a €0 first invoice:
     Checkout shows “€0 due today” and still collects a card by default.
   - **If the offer is pay €19 now** (HARD_PAYWALL / no Start-free): remove any trial
     period from the Price and from `subscription_data.trial_period_days` in Session.create.
     Then Checkout charges €19 and the card ask is honest.
   - **If a €0 trial is intentional:** backend must set
     `payment_method_collection: "if_required"` so a €0 first invoice does not demand a card.
     Stripe cannot bill later without a payment method, so this is a conversion vs collection
     trade. Founder call.

### Backend patch (demand-intel `api/stripe_routes.py` Session.create)

Frontend body now includes:

```json
{
  "price_id": "price_…",
  "locale": "es",
  "display_name": "Resale IQ",
  "product_name": "Resale IQ Starter",
  "product_description": "Unlimited BUY/WATCH/SKIP buy-below checks on ES/FR/DE/IT/PT Vinted. Cancel anytime.",
  "country": "ES",
  "success_url": "https://resaleiq.dev/billing/success",
  "cancel_url": "https://resaleiq.dev/es/pricing?checkout=cancelled"
}
```

Forward them. Exact kwargs:

```python
session = stripe.checkout.Session.create(
    mode="subscription",
    line_items=[{"price": price_id, "quantity": 1}],
    locale=locale or "auto",
    success_url=success_url,
    cancel_url=cancel_url,
    branding_settings={"display_name": display_name or "Resale IQ"},
    custom_text={
        "submit": {"message": product_description or "Resale IQ — buy-below checks on ES/FR/DE/IT/PT Vinted."},
    },
    billing_address_collection="auto",
    tax_id_collection={"enabled": False},
    # payment_method_collection="if_required",  # only if €0 trial is kept
    automatic_tax={"enabled": True},  # keep if already on; do not add without a Tax registration
    customer_update={"address": "auto", "name": "auto"} if customer else None,
)
```

If `country` is a two-letter EU5 code (ES/FR/DE/IT/PT), create or update the Stripe
Customer with `address={"country": country}` **before** Session.create and pass
`customer=`. That prefills tax location and is what removes `requires_location_inputs`
as a blank form.

Do **not** set `payment_intent_data.statement_descriptor` on a subscription Checkout
Session — Stripe ignores it. Dashboard Product + account descriptor only.

Repo: `BilalSbaiby-OT/resale-iq-backend` (demand-intel). This frontend PR cannot
land that file.
