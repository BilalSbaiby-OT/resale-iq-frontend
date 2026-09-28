import type { Metadata } from "next"
import { ForgotPasswordContent } from "./forgot-password-content"

export const metadata: Metadata = {
  title: "Reset password — Resale IQ",
  robots: { index: false, follow: false },
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordContent />
}
