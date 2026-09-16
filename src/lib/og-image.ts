/**
 * Shared OpenGraph image reference for all routes.
 *
 * The root src/app/opengraph-image.tsx generates the canonical social card,
 * but Next.js binds it only to the root route. When any child page sets an
 * explicit `openGraph: {...}` object it replaces (not merges) the parent's
 * entire openGraph, dropping the image unless we include it explicitly.
 *
 * Import OG_IMAGES and spread it into every page-level `openGraph` and
 * `twitter` metadata block so every link preview renders with the card.
 */
export const OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Resale IQ — know what to buy on Vinted, at what price, in which sizes",
  type: "image/png" as const,
}

export const OG_IMAGES = [OG_IMAGE]
