"use client"

import * as React from "react"
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"

/*
 * Dense data table. Rows are 44px, dividers are hairlines, and numeric
 * columns use tabular figures so digits line up vertically down the column —
 * the whole point of a table you scan for outliers.
 *
 * The frame scrolls sideways only. The header is not sticky: a sticky thead
 * needs a scrollport with a bounded height to stick inside, and the frame is
 * sized by its content so the page is what scrolls vertically. The classes for
 * it were here and did nothing.
 *
 * Composition:
 *   <TableFrame>            hairline-bordered, horizontally scrollable shell
 *     <Table>
 *       <TableHeader>       sunken, mono micro-labels
 *       <TableBody>
 *         <TableRow>        hover tint, no lift
 *         <TableEmpty>      spans all columns
 */

function TableFrame({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="table-frame"
      className={cn(
        "w-full overflow-x-auto rounded-lg border border-line bg-panel",
        className
      )}
      {...props}
    />
  )
}

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <table
      data-slot="table"
      className={cn("w-full caption-bottom border-collapse text-sm", className)}
      {...props}
    />
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        "bg-panel-sunken [&_tr]:border-b [&_tr]:border-line",
        className
      )}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t border-line bg-panel-sunken font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b border-line transition-colors duration-100 hover:bg-panel-sunken/70 data-[state=selected]:bg-brand-soft",
        className
      )}
      {...props}
    />
  )
}

function TableHead({
  className,
  numeric = false,
  ...props
}: React.ComponentProps<"th"> & { numeric?: boolean }) {
  return (
    <th
      data-slot="table-head"
      scope="col"
      className={cn(
        "label-micro h-10 px-4 text-left align-middle whitespace-nowrap",
        numeric && "text-right",
        className
      )}
      {...props}
    />
  )
}

function TableCell({
  className,
  numeric = false,
  ...props
}: React.ComponentProps<"td"> & { numeric?: boolean }) {
  return (
    <td
      data-slot="table-cell"
      data-numeric={numeric ? "" : undefined}
      className={cn(
        "h-11 px-4 align-middle text-ink-soft whitespace-nowrap",
        numeric && "figure text-right font-medium text-ink",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-ink-faint", className)}
      {...props}
    />
  )
}

/*
 * Sortable column header. Shared by every module so sort affordances behave
 * identically everywhere, and so `aria-sort` is never forgotten.
 */
function TableSortButton({
  active,
  direction,
  align = "start",
  className,
  children,
  ...props
}: React.ComponentProps<"button"> & {
  active: boolean
  direction: "asc" | "desc"
  align?: "start" | "end"
}) {
  const Icon = !active ? ChevronsUpDown : direction === "asc" ? ArrowUp : ArrowDown

  return (
    <button
      type="button"
      data-slot="table-sort-button"
      className={cn(
        "label-micro group/sort inline-flex items-center gap-1.5 rounded-sm transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
        active && "text-ink",
        align === "end" && "flex-row-reverse",
        className
      )}
      {...props}
    >
      {children}
      <Icon
        aria-hidden="true"
        className={cn(
          "size-3 shrink-0 transition-colors",
          active
            ? "text-brand"
            : "text-ink-faint/60 group-hover/sort:text-ink-faint"
        )}
      />
    </button>
  )
}

/*
 * Empty state row. `colSpan` must match the table's column count.
 */
function TableEmpty({
  colSpan,
  title,
  description,
  action,
  icon,
}: {
  colSpan: number
  title: string
  description?: string
  action?: React.ReactNode
  icon?: React.ReactNode
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-16">
        <div className="flex flex-col items-center text-center">
          {icon && (
            <div className="mb-4 flex size-10 items-center justify-center rounded-md border border-line bg-panel-sunken text-ink-faint">
              {icon}
            </div>
          )}

          <p className="font-display text-[0.9375rem] font-medium text-ink">
            {title}
          </p>

          {description && (
            <p className="mt-1.5 max-w-sm text-sm text-ink-faint">
              {description}
            </p>
          )}

          {action && <div className="mt-5">{action}</div>}
        </div>
      </td>
    </tr>
  )
}

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableEmpty,
  TableFooter,
  TableFrame,
  TableHead,
  TableHeader,
  TableRow,
  TableSortButton,
}
