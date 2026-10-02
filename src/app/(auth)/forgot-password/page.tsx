import type { Metadata } from "next"
import { getT } from "@/lib/ui-t"
import { ForgotPasswordContent } from "./forgot-password-content"

export async function generateMetadata(): Promise<Metadata> {
  const tx = await getT()
  return { title: tx("Reset password — Resale IQ"), robots: { index: false, follow: false } }
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordContent />
}
