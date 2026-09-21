import type { Metadata } from "next"
import { LandingHub, landingHubMetadata } from "@/components/seo/landing-page"

export async function generateMetadata(): Promise<Metadata> {
  return landingHubMetadata("best", "en")
}

export default function BestHubPage() {
  return <LandingHub kind="best" locale="en" />
}
