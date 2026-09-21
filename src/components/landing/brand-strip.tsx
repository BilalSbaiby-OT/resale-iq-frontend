import Link from "next/link"
import { brandMarkSrc, brandStripMoreCount, brandStripNames } from "@/lib/brand-marks"
import { copy, type Locale } from "@/lib/i18n"
import { canonicalPath } from "@/lib/locale-routes"

/** Logo tiles only. No wordmarks. Brands without a local SVG are omitted. */
export function BrandStrip({
  names,
  total,
  locale,
}: {
  names: string[]
  total: number
  locale: Locale
}) {
  const shown = brandStripNames(names)
  if (shown.length === 0) return null
  const more = brandStripMoreCount(shown.length, total)
  const t = copy[locale]
  return (
    <section
      aria-label={t.brandStripCaption}
      data-testid="riq-brand-strip"
      className="riq-brand-band"
    >
      <p className="riq-brand-caption">{t.brandStripCaption}</p>
      <ul className="riq-brand-strip">
        {shown.map((name) => {
          const src = brandMarkSrc(name)
          if (!src) return null
          return (
            <li key={name} className="riq-brand-item" title={name}>
              <span className="riq-brand-mark">
                <img src={src} alt={name} width={28} height={28} />
              </span>
            </li>
          )
        })}
        {more > 0 ? (
          <li className="riq-brand-more">
            <Link
              href={canonicalPath(locale, "/data")}
              className="riq-brand-more-link"
              data-testid="riq-brand-more"
            >
              {t.brandStripMore(more)}
            </Link>
          </li>
        ) : null}
      </ul>
    </section>
  )
}
