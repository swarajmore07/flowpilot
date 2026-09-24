import type { ReactNode } from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  /** Must match the control's own id — the label points at it. */
  id: string;
  label: string;
  /** Present only when validation failed; replaces the hint while shown. */
  error?: string;
  hint?: ReactNode;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

/*
 * One field wrapper for every form in the app: label above, control, then
 * either an error or a hint — never both, because two lines of guidance under
 * one input is one line too many.
 *
 * The ids it emits are the contract with the control inside it: pass
 * `aria-describedby={error ? `${id}-error` : `${id}-hint`}` on the input so a
 * screen reader hears the same guidance a sighted reader sees.
 */
export function FormField({
  id,
  label,
  error,
  hint,
  required = true,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>

      {children}

      {error ? (
        <p id={`${id}-error`} className="text-xs text-critical">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-ink-faint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
