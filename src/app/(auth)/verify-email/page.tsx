import { requestLocale } from "@/lib/request-locale"
import { VerifyEmailContent } from "./verify-email-content"

// W19 server wrapper — see src/app/(auth)/register/page.tsx for the pattern
// and src/proxy.ts for why this route reads a cookie-derived header instead
// of moving under `[locale]`.
export default async function VerifyEmailPage() {
  const locale = await requestLocale()
  return <VerifyEmailContent locale={locale} />
}
