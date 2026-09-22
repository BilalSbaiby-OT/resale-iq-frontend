import type { Metadata } from "next"

/**
 * Keeps /design-preview out of every index. A metadata export cannot live in a
 * "use client" page, so the robots directive sits in this server layout.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
}

export default function DesignPreviewLayout({ children }: { children: React.ReactNode }) {
  return children
}
