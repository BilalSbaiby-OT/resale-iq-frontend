import { redirect } from "next/navigation"

/**
 * /en/partners -> /partners.
 *
 * Founder found /partners unreachable in two ways at once: no page links to
 * it, AND /en/partners 404s while /de, /fr, /es, /it, /pt all redirect there
 * (via src/app/[locale]/[...rest]/page.tsx's catch-all, since "en" is
 * deliberately NOT a member of PATH_LOCALES — see locale-routes.ts and the
 * e2e test "/en 404s -- English is unprefixed at /, not duplicated at /en").
 *
 * This does NOT add "en" to PATH_LOCALES or otherwise widen locale routing —
 * that would resurrect the exact bug locale-routing.spec.ts's "a deep path
 * under an unsupported locale segment still 404s" test guards against for
 * every OTHER /en/* path (e.g. /en/pricing stays 404, on purpose: English is
 * unprefixed at "/pricing", not duplicated at "/en/pricing").
 *
 * A literal `src/app/en/partners/page.tsx` route wins over the dynamic
 * `src/app/[locale]/[...rest]/page.tsx` catch-all for this exact path in
 * Next's router (same "literal beats dynamic" rule [locale]/[...rest]'s own
 * header comment documents for /methodology and /pricing), so only
 * /en/partners specifically gets this one-off redirect.
 */
export default function EnPartnersRedirect() {
  redirect("/partners")
}
