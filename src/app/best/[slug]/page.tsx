import type { Metadata } from "next"
import { SeoLandingPage, landingMetadata } from "@/components/seo/landing-page"
import { generateLandingStaticParams, getLanding } from "@/lib/seo-landings"
import { notFound } from "next/navigation"

export function generateStaticParams() {
  return generateLandingStaticParams("best")
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params
  if (!getLanding("best", slug)) return { title: "Not found — Resale IQ" }
  return landingMetadata("best", slug, "en")
}

export default async function BestLandingPage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  if (!getLanding("best", slug)) notFound()
  return <SeoLandingPage kind="best" slug={slug} locale="en" />
}
