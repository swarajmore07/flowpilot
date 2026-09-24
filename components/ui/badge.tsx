import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/*
 * Status badges. Signal colour is load-bearing here: positive / caution /
 * critical map to real operational states, never to decoration. A badge
 * carries a 1px hairline so it holds its shape on both themes.
 */
const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-1.5 rounded-sm border px-2 py-0.5 text-xs font-medium whitespace-nowrap [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-3",
  {
    variants: {
      tone: {
        neutral: "border-line bg-panel-sunken text-ink-soft",
        positive: "border-positive-line bg-positive-soft text-positive",
        caution: "border-caution-line bg-caution-soft text-caution",
        critical: "border-critical-line bg-critical-soft text-critical",
        brand: "border-brand-line bg-brand-soft text-brand",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  }
)

function Badge({
  className,
  tone,
  withDot = false,
  children,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    /* A filled dot reads faster than colour alone at small sizes, and keeps
       the badge legible for colour-blind users. */
    withDot?: boolean
  }) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ tone }), className)}
      {...props}
    >
      {withDot && (
        <span
          aria-hidden="true"
          className="size-1.5 shrink-0 rounded-full bg-current"
        />
      )}
      {children}
    </span>
  )
}

export { Badge, badgeVariants }
