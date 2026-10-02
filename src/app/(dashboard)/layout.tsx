import type { Metadata } from "next"
import { getT } from "@/lib/ui-t"

// Title is translated per request locale (the root layout's landing title is English-marketing copy).
export async function generateMetadata(): Promise<Metadata> {
  const tx = await getT()
  return { title: tx("Dashboard — Resale IQ"), robots: { index: false, follow: false } }
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
