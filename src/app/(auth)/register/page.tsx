import { requestLocale } from "@/lib/request-locale"
import { RegisterForm } from "./register-form"

// W19: server wrapper only. All markup/state lives in register-form.tsx
// (a client component — useState/useSearchParams need it) so this file can
// stay a server component and read the locale `src/proxy.ts` stamps via the
// `x-resaleiq-locale` header. See src/proxy.ts's W19 comment for why this
// route reads a cookie-derived header instead of moving under `[locale]`.
export default async function RegisterPage() {
  const locale = await requestLocale()
  return <RegisterForm locale={locale} />
}
