import type { ComponentProps } from "react"
import Link from "next/link"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/*
 * Buttons are quiet by default. Only one action per view earns the solid
 * brand fill; everything else is an outline or a ghost. Press gives a 1px
 * downward nudge — the only motion a button makes. Nothing lifts.
 */
const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md border border-transparent bg-clip-padding text-sm font-medium tracking-[-0.006em] whitespace-nowrap transition-[background-color,border-color,color,box-shadow] duration-150 outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-45 aria-invalid:border-critical aria-invalid:ring-2 aria-invalid:ring-critical/25 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        /* The single primary action. */
        default: "bg-brand text-brand-fg hover:bg-brand-hover",

        /* The workhorse: reads as a control, not a call to action. */
        outline:
          "border-line bg-panel text-ink hover:border-line-strong hover:bg-panel-sunken aria-expanded:border-line-strong aria-expanded:bg-panel-sunken",

        secondary:
          "bg-panel-sunken text-ink hover:bg-accent aria-expanded:bg-accent",

        ghost:
          "text-ink-soft hover:bg-panel-sunken hover:text-ink aria-expanded:bg-panel-sunken aria-expanded:text-ink",

        /* Tinted destructive — for row-level actions. */
        destructive:
          "border-critical-line bg-critical-soft text-critical hover:border-critical hover:bg-critical hover:text-white focus-visible:outline-critical",

        /* Solid destructive — reserved for the confirm step of a deletion. */
        destructiveSolid:
          "bg-critical text-white hover:brightness-[0.92] focus-visible:outline-critical",

        link: "h-auto rounded-none p-0 text-brand underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-3",
        xs: "h-7 gap-1 rounded-sm px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 px-2.5 text-[0.8125rem] [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10 px-4",
        icon: "size-9",
        "icon-xs": "size-7 rounded-sm [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

/*
 * A link wearing the button's clothes. Navigation stays an anchor — keyboard
 * activation, middle-click and open-in-new-tab all keep working, which they do
 * not on a button with an onClick that pushes a route.
 */
function ButtonLink({
  className,
  variant = "outline",
  size = "default",
  ...props
}: ComponentProps<typeof Link> & VariantProps<typeof buttonVariants>) {
  return (
    <Link
      data-slot="button-link"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, ButtonLink, buttonVariants }
