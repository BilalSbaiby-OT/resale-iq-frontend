import type { Metadata } from "next"
import { requestLocale } from "@/lib/request-locale"
import { RegisterForm } from "./register-form"
import { copy } from "@/lib/i18n"

// W19: server wrapper only. All markup/state lives in register-form.tsx
// (a client component — useState/useSearchParams need it) so this file can
// stay a server component and read the locale `src/proxy.ts` stamps via the
// `x-resaleiq-locale` header. See src/proxy.ts's W19 comment for why this
// route reads a cookie-derived header instead of moving under `[locale]`.

const PAID_PLANS = ["operator", "power"] as const
type PaidPlan = (typeof PAID_PLANS)[number]

// H14: plan-aware <title> on ?plan=operator|power.
// CRO Principle #3 (message match) + #8 (behavioral trigger: commitment
// language in the tab title reduces "is this the signup or the checkout?"
// hesitation). Generic "Create your account" gives no confirmation to a
// visitor who just clicked "Get Starter access" on the pricing page.
// Note: (auth)/layout.tsx already sets robots noindex, so this does not
// affect crawlability.
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>
}): Promise<Metadata> {
  const locale = await requestLocale()
  const t = copy[locale].auth.register
  const raw = searchParams ? (await searchParams).plan ?? "" : ""
  const plan = PAID_PLANS.includes(raw as PaidPlan) ? (raw as PaidPlan) : null
  const title =
    plan && t.paidHeading
      ? t.paidHeading.replace("{plan}", t.planNames[plan])
      : t.heading
  return { title: `${title} — Resale IQ` }
}

export default async function RegisterPage() {
  const locale = await requestLocale()
  return <RegisterForm locale={locale} />
}
