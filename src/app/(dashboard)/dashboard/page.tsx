import { requestLocale } from "@/lib/request-locale"
import { DashboardContent } from "./dashboard-content"

// W19 server wrapper (first screen only — see src/proxy.ts's W19 note for
// why this route reads a cookie-derived header instead of moving under
// `[locale]`, and the workboard for why the rest of the dashboard's nav
// chrome and sub-pages are out of scope here: lower value, a visitor who
// got this far already converted).
export default async function DashboardPage() {
  const locale = await requestLocale()
  return <DashboardContent locale={locale} />
}
