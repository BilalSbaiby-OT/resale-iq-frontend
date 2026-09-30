/** BreadcrumbList JSON-LD from [name, path] pairs (path "/" = home). One builder so every family emits the same shape. */
const BASE = "https://resaleiq.dev"
export function breadcrumbJsonLd(trail: ReadonlyArray<readonly [string, string]>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map(([name, path], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: path === "/" ? BASE : `${BASE}${path}`,
    })),
  }
}
