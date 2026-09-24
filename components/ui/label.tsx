"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function Label({
  className,
  children,
  required = false,
  ...props
}: React.ComponentProps<"label"> & { required?: boolean }) {
  return (
    <label
      data-slot="label"
      className={cn(
        "flex items-center gap-1 text-sm font-medium text-ink select-none",
        className
      )}
      {...props}
    >
      {children}
      {required && (
        <span aria-hidden="true" className="text-critical">
          *
        </span>
      )}
    </label>
  )
}

export { Label }
