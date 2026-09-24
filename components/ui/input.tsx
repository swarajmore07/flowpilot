import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-md border border-line bg-panel px-2.5 text-sm text-ink shadow-none transition-[border-color,box-shadow] outline-none",
        "placeholder:text-ink-faint",
        "hover:border-line-strong",
        "focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/20 focus-visible:outline-none",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-panel-sunken disabled:text-ink-faint",
        "aria-invalid:border-critical aria-invalid:ring-2 aria-invalid:ring-critical/20",
        "file:mr-2 file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-ink",
        className
      )}
      {...props}
    />
  )
}

export { Input }
