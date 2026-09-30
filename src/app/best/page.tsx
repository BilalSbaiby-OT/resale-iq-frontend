import type { Metadata } from "next"
import { LandingHub, landingHubMetadata } from "@/components/seo/landing-page"

import { withFittedMetadata } from "@/lib/meta-fit"
async function generateMetadataRaw(): Promise<Metadata> {
  return landingHubMetadata("best", "en")
}

export default function BestHubPage() {
  return <LandingHub kind="best" locale="en" />
}

// Length-fit title/description (<=60/<=160) for every variant this generator returns.
export const generateMetadata = withFittedMetadata(generateMetadataRaw)
