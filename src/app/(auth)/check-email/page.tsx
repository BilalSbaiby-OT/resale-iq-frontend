import { requestLocale } from "@/lib/request-locale"
import { CheckEmailContent } from "./check-email-content"

// W19 server wrapper — see src/app/(auth)/register/page.tsx for the pattern
// and src/proxy.ts for why this route reads a cookie-derived header instead
// of moving under `[locale]`.
export default async function CheckEmailPage() {
  const locale = await requestLocale()
  return <CheckEmailContent locale={locale} />
}
