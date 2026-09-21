import type { Metadata } from "next"
import { LandingHub, landingHubMetadata } from "@/components/seo/landing-page"

export async function generateMetadata(): Promise<Metadata> {
  return landingHubMetadata("for", "en")
}

export default function ForHubPage() {
  return <LandingHub kind="for" locale="en" />
}
