import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface SectionCardProps {
  title: string;
  description?: string;
  /** Right-aligned controls in the card header. */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Drops body padding so a table can run edge to edge. */
  flush?: boolean;
  bodyClassName?: string;
}

/*
 * The single panel primitive. Structure comes from a hairline header rule
 * rather than a shadow, and nothing lifts on hover — panels are surfaces to
 * read, not buttons.
 */
export function SectionCard({
  title,
  description,
  action,
  children,
  className,
  flush = false,
  bodyClassName,
}: SectionCardProps) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-lg border border-line bg-panel",
        className
      )}
    >
      <div className="flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-[0.9375rem] leading-tight font-semibold text-ink">
            {title}
          </h2>

          {description && (
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">
              {description}
            </p>
          )}
        </div>

        {action && (
          <div className="flex shrink-0 items-center gap-2">{action}</div>
        )}
      </div>

      <div className={cn(flush ? undefined : "p-5", bodyClassName)}>
        {children}
      </div>
    </section>
  );
}
