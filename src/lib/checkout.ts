import type { Locale } from "./i18n"
import { BAKED_PRICE_IDS } from "./pricing.ts"

/**
 * Checkout Session extras the frontend can send on POST /stripe/checkout.
 *
 * Branding the customer sees ("Resale IQ" vs "Demand Intel") is mostly a
 * Stripe Dashboard setting (statement descriptor, Business name, Branding).
 * Checkout Sessions also accept `branding_settings.display_name` — that is a
 * backend Session.create field. We pass `display_name` / product copy /
 * `country` so demand-intel can forward them. Pydantic ignores unknown keys
 * by default; if production 422s, drop the extras and keep price_id/locale/
 * success_url/cancel_url (the fields the live handler already allow-lists).
 *
 * Guest cancel lands on locale /pricing, not /account (login wall after they
 * almost paid).
 */

export const FIRST_CHECK_QUERY = "Nike Air Force 1"
export const FIRST_CHECK_HREF = `/verdict?q=${encodeURIComponent(FIRST_CHECK_QUERY)}`

export const CHECKOUT_COUNTRIES = [
  { code: "ES", native: "España" },
  { code: "FR", native: "France" },
  { code: "DE", native: "Deutschland" },
  { code: "IT", native: "Italia" },
  { code: "PT", native: "Portugal" },
] as const

export type CheckoutCountry = (typeof CHECKOUT_COUNTRIES)[number]["code"]
export type CheckoutPlan = "operator" | "power"

const LOCALE_COUNTRY: Partial<Record<Locale, CheckoutCountry>> = {
  es: "ES",
  fr: "FR",
  de: "DE",
  it: "IT",
  pt: "PT",
}

const COUNTRY_KEY = "riq_billing_country"

export function isCheckoutCountry(v: string | null | undefined): v is CheckoutCountry {
  return CHECKOUT_COUNTRIES.some((c) => c.code === v)
}

export function countryFromLocale(locale: string | undefined): CheckoutCountry | undefined {
  if (!locale) return undefined
  const lang = locale.split("-")[0].toLowerCase()
  return LOCALE_COUNTRY[lang as Locale]
}

export function readStoredCountry(): CheckoutCountry | undefined {
  if (typeof window === "undefined") return undefined
  try {
    const v = window.localStorage.getItem(COUNTRY_KEY)
    return isCheckoutCountry(v) ? v : undefined
  } catch {
    // why: localStorage throws in private mode; VAT country falls back to locale.
    return undefined
  }
}

export function storeCountry(code: CheckoutCountry): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(COUNTRY_KEY, code)
  } catch {
    // why: private mode / blocked storage — country still lives on the form field.
  }
}

export function productCopy(plan?: CheckoutPlan | string, price_id?: string): {
  product_name: string
  product_description: string
} {
  const isPro = plan === "power" || price_id === BAKED_PRICE_IDS.power
  if (isPro) {
    return {
      product_name: "Resale IQ Pro",
      product_description:
        "Live Deal Finder, Order Planner and unlimited buy-below checks on ES/FR/DE/IT/PT Vinted.",
    }
  }
  return {
    product_name: "Resale IQ Starter",
    product_description:
      "Unlimited BUY/WATCH/SKIP buy-below checks on ES/FR/DE/IT/PT Vinted. Cancel anytime.",
  }
}

export function resolveCheckoutCountry(opts?: {
  country?: string
  locale?: string
  stored?: string
}): CheckoutCountry | undefined {
  if (isCheckoutCountry(opts?.country)) return opts.country
  if (isCheckoutCountry(opts?.stored)) return opts.stored
  return countryFromLocale(opts?.locale)
}

export function buildCheckoutBody(opts: {
  price_id: string
  origin: string
  locale?: string
  country?: string
  plan?: CheckoutPlan
  ref_code?: string
  /** H80 CRO: authenticated user's email — pre-populates Stripe's email field
   *  so the visitor sees their address already filled in rather than a blank box.
   *  Closes the 23/25 no-email gap measured in Stripe sessions.
   *  Backend uses this only when no auth-token-resolved email is available
   *  (belt-and-suspenders for edge cases where the JWT path is unavailable). */
  customer_email?: string
}): Record<string, string> {
  if (!opts.price_id) {
    throw new Error("createCheckout called without a price_id (plans not loaded yet)")
  }
  const locale = (opts.locale || "en").split("-")[0]
  const prefix = locale && locale !== "en" ? `/${locale}` : ""
  const copy = productCopy(opts.plan, opts.price_id)
  const country = resolveCheckoutCountry({ country: opts.country, locale })
  const body: Record<string, string> = {
    price_id: opts.price_id,
    locale,
    display_name: "Resale IQ",
    product_name: copy.product_name,
    product_description: copy.product_description,
    success_url: `${opts.origin}/billing/success`,
    // Always /pricing — guests used to land on /account (a login wall).
    cancel_url: `${opts.origin}${prefix}/pricing?checkout=cancelled`,
  }
  if (country) body.country = country
  // Affiliate attribution: forward the riq_ref cookie value so the backend
  // can store it as Stripe session metadata for commission tracking.
  // Validated as alphanumeric+hyphen/underscore, max 64 chars in referral.ts.
  if (opts.ref_code) body.ref_code = opts.ref_code
  // H80 CRO: email prefill — forward the authenticated user's email so the
  // backend can pass it to Stripe as customer_email (or as a Customer object
  // field when a country is also set). Belt-and-suspenders: the backend also
  // reads it from the JWT, but passing it explicitly covers edge cases where
  // the Authorization header path is unavailable (e.g. network proxy stripping
  // headers, short-lived token expiry between page load and click).
  if (opts.customer_email) body.customer_email = opts.customer_email
  return body
}
