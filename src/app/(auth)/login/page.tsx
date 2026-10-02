import type { Metadata } from "next"
import { getT } from "@/lib/ui-t"
import { LoginForm } from "@/components/auth/login-form"

export async function generateMetadata(): Promise<Metadata> {
  const tx = await getT()
  return { title: tx("Log in — Resale IQ"), robots: { index: false, follow: false } }
}

export default function LoginPage() {
  return <LoginForm />
}
