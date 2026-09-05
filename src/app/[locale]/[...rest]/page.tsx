import { notFound, redirect } from "next/navigation"
import { isPathLocale } from "@/lib/locale-routes"

/**
 * W61 (docs/company/WORKBOARD.md). Verified live 2026-09-02: only the
 * homepage was translated (see [locale]/page.tsx, [locale]/layout.tsx) --
 * every deeper locale path (/es/pricing, /es/blog, /es/deals, /es/terms,
 * and the same for fr/de/it/pt) had no route at all and 404'd. A 404 reads
 * as a broken site, and this is the only five markets we sell to.
 *
 * /methodology is no longer in that list: it has its own translated route
 * at src/app/[locale]/methodology/page.tsx (58 keys verified in all 6
 * locales, src/lib/methodology-copy.ts), added after this file was written.
 * No change was needed here for that -- a literal `[locale]/<path>/page.tsx`
 * always wins over this `[...rest]` catch-all in Next's router, so it
 * simply stops firing for /methodology on its own; see the note below.
 *
 * This does NOT translate the remaining pages -- that is a real, separate
 * content task (blog and terms are hundreds of lines each and deserve
 * native review, not a rushed machine pass, per W9's own flagged gaps in
 * i18n.ts). What it does for those is stop the 404: a locale-prefixed deep
 * path redirects to the real, English page at the same path rather than a
 * dead end. Per the founder's ranking on W61, "linking a Spanish reader to
 * an English page is survivable; linking them to a 404 is not."
 *
 * "pricing" USED to be special-cased here, redirecting "/es/pricing" to
 * "/es#pricing", because it was not a page -- it was the #pricing anchor on
 * the homepage, and "/pricing" itself was only a redirect (next.config.ts).
 * Both of those are now real routes (src/app/pricing/page.tsx,
 * src/app/[locale]/pricing/page.tsx), so the special case has been removed
 * rather than left as dead code: a literal "[locale]/pricing/page.tsx" wins
 * over this catch-all in Next's router, exactly as the paragraph above
 * describes for /methodology, so this file stops firing for /pricing on its
 * own and the branch could never have run again.
 *
 * Deliberately a redirect, not a render-English-in-place: the URL must stop
 * promising a language the page does not have. 307 (next/navigation's
 * `redirect()` default), matching proxy.ts's own convention for a
 * preference/fallback redirect rather than a permanent move. If any of
 * these paths gets a real translation later, this catch-all simply stops
 * firing for it -- a literal `[locale]/<path>/page.tsx` always wins over a
 * `[...rest]` catch-all in Next's router, so no route needs to be removed
 * here when that happens.
 */
export default async function LocaleDeepPathFallback({
  params,
}: {
  params: Promise<{ locale: string; rest: string[] }>
}) {
  const { locale, rest } = await params
  // The parent layout already 404s an invalid locale before this ever
  // renders (src/app/[locale]/layout.tsx); this mirrors [locale]/page.tsx's
  // own defensive re-check rather than assuming that invariant silently.
  if (!isPathLocale(locale)) notFound()

  redirect(`/${rest.join("/")}`)
}
