import { redirect } from "next/navigation"

/** Server redirect so crawlers/LLM bots (no JS) do not see an empty /check. */
export default async function Check({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const qs = q ? `?q=${encodeURIComponent(q)}` : ""
  redirect(`/tools${qs}`)
}
