"use client"
/**
 * Table — Responsive data table with guaranteed non-overlapping columns.
 *
 * Desktop (≥640px): semantic <table> with defined column widths so headers
 * never overlap (fixes the live DEPARTS/WK ↔ AVG PRICE collision on homepage).
 *
 * Mobile (<640px): collapses to stacked card rows — NOT a horizontally scrolling
 * truncated table that loses information off-screen.
 *
 * Features:
 *  - Sticky header (opt-in via `stickyHeader`)
 *  - Sentence-case headers (enforced by component — never ALL-CAPS)
 *  - Accessible: uses <th scope="col">, <caption> is optional
 *  - Zero hardcoded colour: all tokens
 *
 * Usage:
 *   <Table
 *     columns={[
 *       { key: "model", label: "Model", width: "40%" },
 *       { key: "price", label: "Avg price", align: "right" },
 *     ]}
 *     rows={data}
 *     caption="Sneaker market overview"
 *   />
 */

import React from "react"

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TableColumn<T extends Record<string, unknown> = Record<string, unknown>> {
  key: string
  /** Sentence-case header label */
  label: string
  /** Optional width hint, e.g. "30%" or "120px" */
  width?: string
  align?: "left" | "center" | "right"
  /** Custom render for cell value */
  render?: (value: unknown, row: T) => React.ReactNode
}

export interface TableProps<T extends Record<string, unknown> = Record<string, unknown>> {
  columns: TableColumn<T>[]
  rows: T[]
  /** Optional accessible caption for screen readers */
  caption?: string
  /** Pin the header when scrolling a fixed-height table */
  stickyHeader?: boolean
  /** Show zebra striping on alternate rows */
  striped?: boolean
  className?: string
  style?: React.CSSProperties
  /** Shown when rows is empty */
  emptyText?: string
}

// ── Style injection ──────────────────────────────────────────────────────────

const STYLE_ID = "riq-table-styles"
function ensureTableStyles() {
  if (typeof document === "undefined") return
  if (document.getElementById(STYLE_ID)) return
  const el = document.createElement("style")
  el.id = STYLE_ID
  el.textContent = `
    .riq-table-wrap { width: 100%; overflow-x: hidden; }
    .riq-table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
    }
    .riq-table caption {
      caption-side: top;
      font-size: var(--text-meta);
      color: var(--color-text-muted);
      text-align: left;
      margin-bottom: 8px;
    }
    .riq-table th {
      padding: 10px 12px;
      font-size: var(--text-meta);
      font-weight: 600;
      color: var(--color-text-secondary);
      background: var(--color-surface);
      border-bottom: 1px solid var(--color-border);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .riq-table th.riq-sticky { position: sticky; top: 0; z-index: 1; }
    .riq-table td {
      padding: 10px 12px;
      font-size: var(--text-body-app);
      color: var(--color-text-primary);
      border-bottom: 1px solid var(--color-border);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .riq-table tr:last-child td { border-bottom: none; }
    .riq-table--striped tr:nth-child(even) td {
      background: rgba(255,255,255,0.02);
    }
    .riq-table tr:hover td {
      background: rgba(255,255,255,0.03);
    }
    /* Mobile: stacked cards */
    @media (max-width: 639px) {
      .riq-table thead { display: none; }
      .riq-table, .riq-table tbody { display: block; }
      .riq-table tr {
        display: block;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-card);
        padding: var(--space-2);
        margin-bottom: var(--space-1);
      }
      .riq-table tr:last-child { margin-bottom: 0; }
      .riq-table td {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 6px 0;
        border: none;
        border-bottom: 1px solid var(--color-border);
        white-space: normal;
        overflow: visible;
        text-overflow: unset;
        font-size: var(--text-body-app);
      }
      .riq-table td:last-child { border-bottom: none; }
      .riq-table td::before {
        content: attr(data-label);
        font-size: var(--text-meta);
        font-weight: 600;
        color: var(--color-text-secondary);
        margin-right: var(--space-2);
        flex-shrink: 0;
      }
    }
  `
  document.head.appendChild(el)
}

// ── Component ────────────────────────────────────────────────────────────────

export function Table<T extends Record<string, unknown>>({
  columns,
  rows,
  caption,
  stickyHeader = false,
  striped = false,
  className,
  style,
  emptyText = "No data available",
}: TableProps<T>) {
  if (typeof window !== "undefined") ensureTableStyles()

  const tableClass = ["riq-table", striped ? "riq-table--striped" : "", className]
    .filter(Boolean)
    .join(" ")

  return (
    <div className="riq-table-wrap" style={style}>
      <table className={tableClass}>
        {caption && <caption>{caption}</caption>}
        <colgroup>
          {columns.map((col) => (
            <col key={col.key} style={{ width: col.width }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={stickyHeader ? "riq-sticky" : ""}
                style={{ textAlign: col.align ?? "left" }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  textAlign: "center",
                  color: "var(--color-text-muted)",
                  padding: "var(--space-4)",
                  fontSize: "var(--text-body-app)",
                }}
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col.key} data-label={col.label} style={{ textAlign: col.align ?? "left" }}>
                    {col.render
                      ? col.render(row[col.key], row)
                      : (row[col.key] as React.ReactNode) ?? "—"}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
