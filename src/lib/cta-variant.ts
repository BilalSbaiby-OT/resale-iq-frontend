/**
 * Active CTA-copy variant for every trial button. The ONE place to flip it.
 * Add the label under copy[locale].trial.cta.<variant> (all six locales) first.
 * The value rides on checkout_started / checkout_intent_guest / checkout_from_blog
 * (see analytics.ts) so a variant's clicks are attributable.
 */
export const CTA_VARIANT = "A"
