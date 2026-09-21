/**
 * Homepage example SKU. Cite, result card, and first free chip must be the
 * same model. Adidas Samba still 200 for anonymous visitors (checked
 * 2026-09-21); Levi's 501 / NB 550 402. Fall back to the 530 hero seed only
 * if the Samba teaser is unusable.
 */
import { getHeroVerdict, type HeroVerdict } from "./hero-verdict"
import { formatHomeCite, getTeaserVerdict } from "./teaser-verdict"

export async function getHomeExample(): Promise<{
  query: string
  result: HeroVerdict | null
  cite: string | null
}> {
  const samba = await getTeaserVerdict("Adidas Samba")
  const hero = await getHeroVerdict()
  return {
    query: samba ? "Adidas Samba" : hero.query,
    result: samba ?? hero.result,
    cite: formatHomeCite("Adidas Samba", samba),
  }
}
