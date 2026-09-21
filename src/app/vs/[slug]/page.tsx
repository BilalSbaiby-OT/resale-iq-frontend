import type { Metadata } from "next"
import { SeoLandingPage, landingMetadata } from "@/components/seo/landing-page"
import { generateLandingStaticParams, getLanding } from "@/lib/seo-landings"
import { notFound } from "next/navigation"

export function generateStaticParams() {
  return generateLandingStaticParams("vs")
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params
  if (!getLanding("vs", slug)) return { title: "Not found — Resale IQ" }
  return landingMetadata("vs", slug, "en")
}

export default async function VsLandingPage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  if (!getLanding("vs", slug)) notFound()
  return <SeoLandingPage kind="vs" slug={slug} locale="en" />
}
