import { bestLandingCopy } from "./seo-landings-best-copy.ts"
import { vsForLandingCopy } from "./seo-landings-rest-copy.ts"
import { personaLandingCopy } from "./seo-landings-personas-copy.ts"
import { forMoreLandingCopy } from "./seo-landings-for-more-copy.ts"
import type { LandingCopy } from "../lib/seo-landings.ts"
import type { Locale } from "../lib/i18n.ts"

export const landingCopy: Record<string, Record<Locale, LandingCopy>> = {
  ...bestLandingCopy,
  ...vsForLandingCopy,
  ...personaLandingCopy,
  ...forMoreLandingCopy,
}
