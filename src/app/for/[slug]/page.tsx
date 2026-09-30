import type { Metadata } from "next"
import { SeoLandingPage, landingMetadata } from "@/components/seo/landing-page"
import { generateLandingStaticParams, getLanding } from "@/lib/seo-landings"
import { notFound } from "next/navigation"

import { withFittedMetadata } from "@/lib/meta-fit"
export function generateStaticParams() {
  return generateLandingStaticParams("for")
}

async function generateMetadataRaw(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params
  if (!getLanding("for", slug)) return { title: "Not found — Resale IQ" }
  return landingMetadata("for", slug, "en")
}

export default async function ForLandingPage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  if (!getLanding("for", slug)) notFound()
  return <SeoLandingPage kind="for" slug={slug} locale="en" />
}

// Length-fit title/description (<=60/<=160) for every variant this generator returns.
export const generateMetadata = withFittedMetadata(generateMetadataRaw)
