# ResaleIQ UI Primitives

**Import path:** `@/components/ui/primitives`

These are the shared building blocks for every authed route. They consume only design tokens (`var(--color-*)`, `var(--space-*)`, `var(--radius-*)`) — zero hardcoded hex values.

---

## Components

### `Button`

Use for all interactive actions. Renders `<button>` by default; pass `as={Link}` for navigation.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `variant` | `primary \| secondary \| ghost \| danger` | `secondary` | primary = green BUY colour |
| `size` | `sm \| md \| lg` | `md` | md = 44px height (HIG default) |
| `loading` | `boolean` | `false` | Shows spinner, disables interaction |
| `disabled` | `boolean` | — | 45% opacity, non-interactive |
| `fullWidth` | `boolean` | `false` | |
| `as` | `ElementType` | `"button"` | e.g. `as={Link}` for Next.js links |

```tsx
import { Button } from "@/components/ui/primitives"
import Link from "next/link"

// Default (secondary)
<Button>View details</Button>

// Primary CTA
<Button variant="primary" size="lg">Buy now</Button>

// As a Next.js Link
<Button as={Link} href="/pricing" variant="primary">See plans</Button>

// Loading
<Button variant="primary" loading>Processing...</Button>

// Danger
<Button variant="danger">Cancel subscription</Button>
```

---

### `Card`, `CardHeader`, `CardTitle`, `CardBody`, `CardFooter`

Use for grouping related content. Never raw `<div>` with a background.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `variant` | `default \| elevated` | `default` | elevated = lighter surface |
| `noPadding` | `boolean` | `false` | For when you need a full-bleed child |

```tsx
import { Card, CardHeader, CardTitle, CardBody, CardFooter } from "@/components/ui/primitives"

<Card>
  <CardHeader>
    <CardTitle>Market overview</CardTitle>
    <Button size="sm" variant="ghost">Refresh</Button>
  </CardHeader>
  <CardBody>
    <p>Content here...</p>
  </CardBody>
  <CardFooter>
    <span style={{ fontSize: "var(--text-meta)", color: "var(--color-text-muted)" }}>
      Updated 2 min ago
    </span>
  </CardFooter>
</Card>
```

---

### `Input`, `Select`, `Textarea`, `FieldLabel`, `FieldError`, `FieldHint`

All form controls. 44px min height. 16px font (prevents iOS Safari zoom on focus).

```tsx
import { Input, FieldLabel, FieldError, FieldHint } from "@/components/ui/primitives"

<div>
  <FieldLabel htmlFor="email">Email address</FieldLabel>
  <Input
    id="email"
    type="email"
    placeholder="you@example.com"
    invalid={!!emailError}
    aria-describedby={emailError ? "email-error" : undefined}
  />
  {emailError ? (
    <FieldError id="email-error">{emailError}</FieldError>
  ) : (
    <FieldHint>We never share your email.</FieldHint>
  )}
</div>
```

---

### `Table`

Responsive semantic table. Desktop: real `<table>` with fixed column widths (no overlap). Mobile: stacked card rows.

```tsx
import { Table } from "@/components/ui/primitives"

const columns = [
  { key: "model", label: "Model", width: "35%" },
  { key: "departsWk", label: "Departs/wk", width: "20%", align: "right" as const },
  { key: "avgPrice", label: "Avg price", width: "20%", align: "right" as const },
  { key: "verdict", label: "Verdict", width: "25%",
    render: (v) => <VerdictBadge verdict={v as string} /> },
]

<Table columns={columns} rows={data} caption="Sneaker market data" />
```

---

### `Badge`, `VerdictBadge`

`Badge` is a generic coloured chip. `VerdictBadge` is ResaleIQ-specific and **always renders the verdict word** (never an empty pill — this is a live bug fix).

```tsx
import { Badge, VerdictBadge } from "@/components/ui/primitives"

// Generic badge
<Badge color="var(--color-blue)">New</Badge>

// Verdict — auto-colors and labels
<VerdictBadge verdict="BUY" />           // → green "Buy" chip
<VerdictBadge verdict="WATCH" />          // → orange "Watch" chip
<VerdictBadge verdict="SKIP" />           // → red "Skip" chip
<VerdictBadge verdict="UNKNOWN" />        // → grey "Unknown" chip
<VerdictBadge verdict="BUY" label="Kopen" />  // → translated label
```

---

### `PageHeader`

Use at the top of every authed page instead of rolling an H1+subtitle.

```tsx
import { PageHeader, Button } from "@/components/ui/primitives"

<PageHeader
  title="Market trends"
  description="Compare sell-through rates and demand across brands."
  actions={<Button variant="primary" size="sm">Export</Button>}
/>
```

---

## Migrating an existing page: before / after

Most pages hand-roll a title + div layout with hardcoded colours. Here's the migration pattern:

### Before (typical existing page)

```tsx
export default function TrendsPage() {
  return (
    <div style={{ padding: "24px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#e8ecf4" }}>Market trends</h1>
          <p style={{ fontSize: 14, color: "#8fa3c4", marginTop: 4 }}>
            Compare sell-through rates across brands.
          </p>
        </div>
        <button
          style={{ background: "#34C759", color: "#06090c", borderRadius: 10,
                   padding: "10px 18px", fontSize: 14, fontWeight: 600, border: "none" }}
        >
          Export
        </button>
      </div>

      <div style={{ background: "#12151d", border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 14, padding: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: "#e8ecf4", marginBottom: 12 }}>
          Top performers
        </h3>
        {/* content */}
      </div>
    </div>
  )
}
```

### After (using primitives)

```tsx
import { PageHeader, Button, Card, CardHeader, CardTitle, CardBody } from "@/components/ui/primitives"

export default function TrendsPage() {
  return (
    <div style={{ padding: "var(--space-3) var(--space-card-pad)" }}>
      <PageHeader
        title="Market trends"
        description="Compare sell-through rates across brands."
        actions={<Button variant="primary" size="sm">Export</Button>}
      />

      <Card>
        <CardHeader>
          <CardTitle>Top performers</CardTitle>
        </CardHeader>
        <CardBody>
          {/* content */}
        </CardBody>
      </Card>
    </div>
  )
}
```

**What changed:**
- Removed 3 hardcoded hex colours (#e8ecf4, #8fa3c4, #34C759, #06090c, #12151d, rgba(255,255,255,0.07))
- Typography is now from the type scale, not arbitrary px
- The button has proper press animation, focus ring, disabled/loading states
- The card uses the shared radius and border tokens

---

## Design token reference

All tokens live in `src/app/globals.css` `@theme` block. Key ones used by primitives:

| Token | Value | Use |
|---|---|---|
| `--color-buy` | `#34C759` | Primary / BUY verdict |
| `--color-watch` | `#FF9F0A` | WATCH verdict |
| `--color-skip` | `#FF453A` | SKIP / danger |
| `--color-unknown` | `#8b99b8` | UNKNOWN / NO DATA |
| `--color-blue` | `#0A84FF` | Focus rings, links |
| `--color-surface` | `#12151d` | Card background |
| `--color-surface-elevated` | `#1a2030` | Elevated card, inputs |
| `--color-border` | `rgba(255,255,255,0.07)` | Hairline border |
| `--radius-card` | `14px` | Card corner radius |
| `--radius-control` | `12px` | Button/input radius |
| `--text-h1-app` | `30px` | Page H1 |
| `--text-body-app` | `16px` | Body text (never below this) |
| `--text-meta` | `13px` | Labels, badges, hints |
| `--space-card-pad` | `20px` | Card internal padding |

> ⚠️ **Rule:** Never use a hardcoded hex in a component. If you need a colour that doesn't have a token, add it to `globals.css @theme` first.
