import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description: string;
  /** Primary action for the page, e.g. "Add supplier". */
  action?: ReactNode;
  className?: string;
}

/*
 * The page masthead. The navbar breadcrumb says where you are; this says what
 * the page is for. A single hairline closes it off so the page reads as a
 * document with a top edge rather than a stack of floating cards.
 */
export function PageHeader({
  title,
  description,
  action,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="min-w-0">
        <h1 className="text-2xl leading-tight font-semibold text-ink">
          {title}
        </h1>

        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-soft">
          {description}
        </p>
      </div>

      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}
