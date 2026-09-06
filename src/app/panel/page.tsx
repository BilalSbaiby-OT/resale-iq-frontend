import { redirect } from "next/navigation"

/** Convenience alias. Nothing in src links here; people type /panel. */
export default function PanelAlias() {
  redirect("/dashboard")
}
