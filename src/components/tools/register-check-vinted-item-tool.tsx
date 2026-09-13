"use client"

import { useEffect } from "react"
import {
  CHECK_VINTED_ITEM_DESCRIPTION,
  CHECK_VINTED_ITEM_NAME,
  CHECK_VINTED_ITEM_QUERY_DESCRIPTION,
} from "@/lib/webmcp-tools"

/**
 * Imperative WebMCP fallback for check_vinted_item.
 *
 * Declarative toolname/tooldescription on the FreeChecker <form> are the
 * primary surface. This registers the same tool when
 * document.modelContext / navigator.modelContext exists so an agent can
 * get the /api/verdict payload back. Feature-detect; no-op if unsupported.
 * Never register checkout or payment tools.
 */

type CheckInput = { query?: unknown }

type ModelContext = {
  registerTool: (
    tool: {
      name: string
      description: string
      inputSchema: Record<string, unknown>
      execute: (input: CheckInput) => Promise<unknown>
    },
    options?: { signal?: AbortSignal },
  ) => unknown
}

function getModelContext(): ModelContext | undefined {
  if (typeof window === "undefined") return undefined
  const doc = document as Document & { modelContext?: ModelContext }
  const nav = navigator as Navigator & { modelContext?: ModelContext }
  const ctx = doc.modelContext ?? nav.modelContext
  if (ctx && typeof ctx.registerTool === "function") return ctx
  return undefined
}

async function executeCheck({ query }: CheckInput): Promise<unknown> {
  const q = String(query ?? "").trim()
  if (q.length < 2) return { error: "query must be at least 2 characters" }
  const r = await fetch(`/api/verdict?q=${encodeURIComponent(q)}`)
  try {
    return await r.json()
  } catch {
    // why: non-JSON /api/verdict is a transport miss, not a product crash.
    // Return a structured error so the agent sees a failed check, not a throw.
    return { error: "could not check" }
  }
}

export function RegisterCheckVintedItemTool({
  name = CHECK_VINTED_ITEM_NAME,
  description = CHECK_VINTED_ITEM_DESCRIPTION,
}: {
  name?: string
  description?: string
} = {}) {
  useEffect(() => {
    const ctx = getModelContext()
    if (!ctx) return
    const controller = new AbortController()
    try {
      const registered = ctx.registerTool(
        {
          name,
          description,
          inputSchema: {
            type: "object",
            properties: {
              query: { type: "string", description: CHECK_VINTED_ITEM_QUERY_DESCRIPTION },
            },
            required: ["query"],
          },
          execute: executeCheck,
        },
        { signal: controller.signal },
      )
      if (registered && typeof (registered as Promise<unknown>).catch === "function") {
        // why: registerTool rejecting (already registered) must not break the page.
        void (registered as Promise<unknown>).catch(() => undefined)
      }
    } catch {
      // why: declarative <form toolname> already registered this tool, or the
      // browser rejected a second registerTool. Feature-detect no-op is correct.
    }
    return () => controller.abort()
  }, [name, description])
  return null
}
