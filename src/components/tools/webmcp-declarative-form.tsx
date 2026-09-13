import "@/types/webmcp-jsx"

/**
 * Server-rendered WebMCP form. Injected as raw HTML so toolname= and
 * tooldescription= survive React's attribute filter and show up in curl
 * / view-source. Hidden — the visible FreeChecker / profit calculator
 * stay the human UI.
 */
export function WebmcpDeclarativeForm({ html }: { html: string }) {
  return (
    <div
      hidden
      aria-hidden="true"
      data-webmcp-declarative=""
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
