import type { Metadata } from "next"
import { LandingHub, landingHubMetadata } from "@/components/seo/landing-page"

export async function generateMetadata(): Promise<Metadata> {
  return landingHubMetadata("vs", "en")
}

export default function VsHubPage() {
  return <LandingHub kind="vs" locale="en" />
}
