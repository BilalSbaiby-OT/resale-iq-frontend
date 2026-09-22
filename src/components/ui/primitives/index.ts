/**
 * @file src/components/ui/primitives/index.ts
 * Barrel export for the ResaleIQ shared UI primitive layer.
 *
 * Import path for other agents and routes:
 *   import { Button, Card, VerdictBadge, ... } from "@/components/ui/primitives"
 */

// Button
export { Button } from "./button"
export type { ButtonVariant, ButtonSize } from "./button"

// Card
export { Card, CardHeader, CardTitle, CardBody, CardFooter } from "./card"
export type { CardProps } from "./card"

// Input family
export { Input, Select, Textarea, FieldLabel, FieldError, FieldHint } from "./input"
export type { InputProps, SelectProps, TextareaProps } from "./input"

// Table
export { Table } from "./table"
export type { TableProps, TableColumn } from "./table"

// Badge
export { Badge, VerdictBadge } from "./badge"
export type { BadgeProps, VerdictBadgeProps, VerdictValue } from "./badge"

// PageHeader
export { PageHeader } from "./page-header"
export type { PageHeaderProps } from "./page-header"
