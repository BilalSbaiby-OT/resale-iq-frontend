/**
 * Design preview — every primitive in every variant and state.
 * Route: /design-preview
 *
 * Not linked from the app. For internal QA only.
 */
"use client"

import React from "react"
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  CardFooter,
  Input,
  Select,
  Textarea,
  FieldLabel,
  FieldError,
  FieldHint,
  Table,
  Badge,
  VerdictBadge,
  PageHeader,
} from "@/components/ui/primitives"

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 48 }}>
      <h2
        style={{
          fontSize: "var(--text-title)",
          fontWeight: 600,
          color: "var(--color-text-primary)",
          marginBottom: 20,
          paddingBottom: 10,
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  )
}

function Row({ children, gap = 12 }: { children: React.ReactNode; gap?: number }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap }}>
      {children}
    </div>
  )
}

// ── Table data ────────────────────────────────────────────────────────────────

const TABLE_ROWS = [
  { model: "Nike Air Force 1 Low", brand: "Nike", departsWk: 2840, avgPrice: "€142", verdict: "BUY" },
  { model: "Adidas Samba OG", brand: "Adidas", departsWk: 1920, avgPrice: "€118", verdict: "WATCH" },
  { model: "New Balance 550", brand: "NB", departsWk: 1340, avgPrice: "€98", verdict: "BUY" },
  { model: "Balenciaga Triple S", brand: "Balenciaga", departsWk: 210, avgPrice: "€380", verdict: "SKIP" },
  { model: "Off-White Dunk", brand: "Nike", departsWk: 88, avgPrice: "€620", verdict: "UNKNOWN" },
]

const TABLE_COLS = [
  { key: "model", label: "Model", width: "35%" },
  { key: "brand", label: "Brand", width: "15%" },
  { key: "departsWk", label: "Departs/wk", width: "18%", align: "right" as const },
  { key: "avgPrice", label: "Avg price", width: "17%", align: "right" as const },
  {
    key: "verdict",
    label: "Verdict",
    width: "15%",
    render: (v: unknown) => <VerdictBadge verdict={v as string} />,
  },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DesignPreviewPage() {
  return (
    <div
      style={{
        background: "var(--color-bg)",
        minHeight: "100vh",
        padding: "var(--space-4) var(--space-card-pad)",
        maxWidth: 1040,
        margin: "0 auto",
        fontFamily: "var(--font-sans)",
      }}
    >
      <PageHeader
        title="Design system preview"
        description="Every primitive in every variant and state. Use this page to verify design tokens render correctly."
        actions={
          <Row gap={8}>
            <Button size="sm" variant="secondary">Share</Button>
            <Button size="sm" variant="primary">Export</Button>
          </Row>
        }
      />

      {/* ── Buttons ─────────────────────────────────────────────────────────── */}
      <Section title="Button">
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <p style={{ fontSize: "var(--text-meta)", color: "var(--color-text-muted)", marginBottom: 10 }}>
              Variants (md size)
            </p>
            <Row>
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
            </Row>
          </div>

          <div>
            <p style={{ fontSize: "var(--text-meta)", color: "var(--color-text-muted)", marginBottom: 10 }}>
              Sizes (primary variant)
            </p>
            <Row gap={10}>
              <Button variant="primary" size="sm">Small (36px)</Button>
              <Button variant="primary" size="md">Medium (44px)</Button>
              <Button variant="primary" size="lg">Large (52px)</Button>
            </Row>
          </div>

          <div>
            <p style={{ fontSize: "var(--text-meta)", color: "var(--color-text-muted)", marginBottom: 10 }}>
              States
            </p>
            <Row>
              <Button variant="primary" loading>Loading</Button>
              <Button variant="secondary" loading>Loading secondary</Button>
              <Button variant="primary" disabled>Disabled</Button>
              <Button variant="secondary" disabled>Disabled secondary</Button>
            </Row>
          </div>

          <div>
            <p style={{ fontSize: "var(--text-meta)", color: "var(--color-text-muted)", marginBottom: 10 }}>
              Full width
            </p>
            <Button variant="primary" fullWidth>Full width primary</Button>
          </div>
        </div>
      </Section>

      {/* ── Cards ───────────────────────────────────────────────────────────── */}
      <Section title="Card">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          <Card>
            <CardHeader>
              <CardTitle>Default card</CardTitle>
              <Button size="sm" variant="ghost">Action</Button>
            </CardHeader>
            <CardBody>
              Body content sits here. Uses var(--color-surface) background with a hairline border.
            </CardBody>
            <CardFooter>
              <span style={{ fontSize: "var(--text-meta)", color: "var(--color-text-muted)" }}>
                Footer meta
              </span>
            </CardFooter>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Elevated card</CardTitle>
            </CardHeader>
            <CardBody>
              Uses var(--color-surface-elevated) — lighter, not white. Appears raised on the canvas.
            </CardBody>
          </Card>

          <Card noPadding style={{ overflow: "hidden" }}>
            <div style={{ padding: "var(--space-card-pad)", borderBottom: "1px solid var(--color-border)" }}>
              <CardTitle>No-padding card</CardTitle>
            </div>
            <div style={{ padding: "var(--space-card-pad)" }}>
              <CardBody>Full-bleed inner sections via noPadding.</CardBody>
            </div>
          </Card>

          {/* Concentric radius demo */}
          <Card>
            <CardHeader>
              <CardTitle>Concentric radius</CardTitle>
            </CardHeader>
            <CardBody>
              <div
                style={{
                  background: "var(--color-surface-elevated)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "calc(var(--radius-card) - var(--space-card-pad) / 2)", // ~4px inner
                  padding: "var(--space-1)",
                  fontSize: "var(--text-meta)",
                  color: "var(--color-text-secondary)",
                }}
              >
                Inner element with reduced radius (14 − 20/2 ≈ concentric)
              </div>
            </CardBody>
          </Card>
        </div>
      </Section>

      {/* ── Inputs ──────────────────────────────────────────────────────────── */}
      <Section title="Input family">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          <div>
            <FieldLabel htmlFor="dp-input-default">Email address</FieldLabel>
            <Input id="dp-input-default" type="email" placeholder="you@example.com" />
            <FieldHint>We never share your email.</FieldHint>
          </div>

          <div>
            <FieldLabel htmlFor="dp-input-error">Email (error state)</FieldLabel>
            <Input
              id="dp-input-error"
              type="email"
              defaultValue="not-an-email"
              invalid
              aria-describedby="dp-input-error-msg"
            />
            <FieldError id="dp-input-error-msg">Enter a valid email address.</FieldError>
          </div>

          <div>
            <FieldLabel htmlFor="dp-input-disabled">Disabled input</FieldLabel>
            <Input id="dp-input-disabled" placeholder="Cannot edit" disabled />
          </div>

          <div>
            <FieldLabel htmlFor="dp-select">Brand</FieldLabel>
            <Select id="dp-select">
              <option value="">Select a brand...</option>
              <option value="nike">Nike</option>
              <option value="adidas">Adidas</option>
              <option value="nb">New Balance</option>
            </Select>
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <FieldLabel htmlFor="dp-textarea">Notes</FieldLabel>
            <Textarea
              id="dp-textarea"
              placeholder="Add any notes about this item..."
              rows={3}
            />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <FieldLabel htmlFor="dp-textarea-error">Notes (error)</FieldLabel>
            <Textarea
              id="dp-textarea-error"
              defaultValue="X"
              invalid
              aria-describedby="dp-textarea-error-msg"
            />
            <FieldError id="dp-textarea-error-msg">Minimum 10 characters required.</FieldError>
          </div>
        </div>
      </Section>

      {/* ── Table ───────────────────────────────────────────────────────────── */}
      <Section title="Table">
        <Card noPadding style={{ overflow: "hidden" }}>
          <Table
            columns={TABLE_COLS}
            rows={TABLE_ROWS as Record<string, unknown>[]}
            caption="Sneaker market overview — resize window to see mobile stack layout"
          />
        </Card>

        <div style={{ marginTop: 16 }}>
          <Card noPadding style={{ overflow: "hidden" }}>
            <Table
              columns={TABLE_COLS.slice(0, 3)}
              rows={[]}
              emptyText="No data available for this period."
            />
          </Card>
        </div>
      </Section>

      {/* ── Badges ──────────────────────────────────────────────────────────── */}
      <Section title="Badge & VerdictBadge">
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <p style={{ fontSize: "var(--text-meta)", color: "var(--color-text-muted)", marginBottom: 10 }}>
              VerdictBadge — all values (always shows text, never empty)
            </p>
            <Row gap={8}>
              <VerdictBadge verdict="BUY" />
              <VerdictBadge verdict="WATCH" />
              <VerdictBadge verdict="SKIP" />
              <VerdictBadge verdict="UNKNOWN" />
              <VerdictBadge verdict="NO DATA" />
              <VerdictBadge verdict={null} />
            </Row>
          </div>

          <div>
            <p style={{ fontSize: "var(--text-meta)", color: "var(--color-text-muted)", marginBottom: 10 }}>
              VerdictBadge — md size
            </p>
            <Row gap={8}>
              <VerdictBadge verdict="BUY" size="md" />
              <VerdictBadge verdict="WATCH" size="md" />
              <VerdictBadge verdict="SKIP" size="md" />
              <VerdictBadge verdict="UNKNOWN" size="md" />
            </Row>
          </div>

          <div>
            <p style={{ fontSize: "var(--text-meta)", color: "var(--color-text-muted)", marginBottom: 10 }}>
              VerdictBadge — with translated label
            </p>
            <Row gap={8}>
              <VerdictBadge verdict="BUY" label="Kopen" />
              <VerdictBadge verdict="WATCH" label="Wachten" />
              <VerdictBadge verdict="SKIP" label="Overslaan" />
            </Row>
          </div>

          <div>
            <p style={{ fontSize: "var(--text-meta)", color: "var(--color-text-muted)", marginBottom: 10 }}>
              Generic Badge
            </p>
            <Row gap={8}>
              <Badge color="var(--color-blue)">New</Badge>
              <Badge color="var(--color-purple)">Beta</Badge>
              <Badge color="var(--color-watch)">Warning</Badge>
              <Badge color="var(--color-text-secondary)">Neutral</Badge>
              <Badge color="var(--color-buy)" size="md">Live</Badge>
            </Row>
          </div>
        </div>
      </Section>

      {/* ── PageHeader ──────────────────────────────────────────────────────── */}
      <Section title="PageHeader">
        <Card variant="elevated" style={{ marginBottom: 16 }}>
          <PageHeader
            title="Market trends"
            description="Compare sell-through rates and demand signals across brands and categories."
            actions={
              <Row gap={8}>
                <Button size="sm" variant="secondary">Filter</Button>
                <Button size="sm" variant="primary">Export CSV</Button>
              </Row>
            }
            style={{ marginBottom: 0 }}
          />
        </Card>

        <Card variant="elevated">
          <PageHeader
            title="Watchlist"
            style={{ marginBottom: 0 }}
          />
        </Card>
      </Section>

      {/* ── Tap targets ─────────────────────────────────────────────────────── */}
      <Section title="Tap-target verification (≥44×44px)">
        <p style={{ fontSize: "var(--text-body-app)", color: "var(--color-text-secondary)", marginBottom: 16 }}>
          All controls below meet the 44×44px minimum. The sm button uses a hidden pseudo-element hit region.
        </p>
        <Row gap={16}>
          {(["sm", "md", "lg"] as const).map((size) => (
            <div key={size} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <Button variant="primary" size={size}>{size}</Button>
              <span style={{ fontSize: "var(--text-meta)", color: "var(--color-text-muted)" }}>
                {size === "sm" ? "36px visual / 44px tap" : size === "md" ? "44px" : "52px"}
              </span>
            </div>
          ))}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <Input style={{ width: 180 }} placeholder="Input (44px)" />
            <span style={{ fontSize: "var(--text-meta)", color: "var(--color-text-muted)" }}>44px</span>
          </div>
        </Row>
      </Section>

      {/* ── Focus ring demo ─────────────────────────────────────────────────── */}
      <Section title="Focus ring (tab through these)">
        <p style={{ fontSize: "var(--text-body-app)", color: "var(--color-text-secondary)", marginBottom: 16 }}>
          Tab through to see the 2px blue focus ring on each control.
        </p>
        <Row gap={12}>
          <Button variant="primary">Focus me</Button>
          <Button variant="secondary">Focus me</Button>
          <Input style={{ width: 200 }} placeholder="Focus me" />
          <Select style={{ width: 160 }}>
            <option>Focus me</option>
          </Select>
        </Row>
      </Section>
    </div>
  )
}
