import seo from "@/data/seo-brands.json"

// Shared derivation of the programmatic SEO route space. The sitemap, the
// category hubs and the brand x category pages all have to agree on which
// slugs exist — deriving them in one place is what stops a page from being
// generated with no sitemap entry, or listed in the sitemap with no page.

export interface BrandSeo {
  brand: string
  slug: string
  sold_7d: number
  avg_price_eur: number
  top_categories: string[]
  categories: { category: string; sold_7d: number }[]
  models_tracked: number
}

export const BRANDS = seo.brands as BrandSeo[]

export const catSlug = (c: string) =>
  c.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")

/** One entry per brand that sells in this category, ranked by weekly volume. */
export interface CategoryEntry {
  brand: string
  slug: string
  sold_7d: number
  avg_price_eur: number
}

export interface CategoryData {
  category: string
  slug: string
  entries: CategoryEntry[]
  totalSold7d: number
}

/**
 * Invert the brand-keyed export into a category-keyed one.
 *
 * Note the volumes are per brand x category, so summing them gives the weekly
 * volume across *tracked* brands only — never call it the size of the category
 * on Vinted as a whole, which we do not measure.
 */
function buildCategories(): CategoryData[] {
  const byCategory = new Map<string, CategoryEntry[]>()

  for (const b of BRANDS) {
    for (const c of b.categories || []) {
      const list = byCategory.get(c.category) ?? []
      list.push({
        brand: b.brand,
        slug: b.slug,
        sold_7d: c.sold_7d,
        avg_price_eur: b.avg_price_eur,
      })
      byCategory.set(c.category, list)
    }
  }

  return [...byCategory.entries()]
    .map(([category, entries]) => {
      const ranked = [...entries].sort((x, y) => y.sold_7d - x.sold_7d)
      return {
        category,
        slug: catSlug(category),
        entries: ranked,
        totalSold7d: ranked.reduce((sum, e) => sum + e.sold_7d, 0),
      }
    })
    .sort((a, b) => b.totalSold7d - a.totalSold7d)
}

export const CATEGORIES: CategoryData[] = buildCategories()

export function getCategory(slug: string): CategoryData | undefined {
  return CATEGORIES.find((c) => c.slug === slug)
}
