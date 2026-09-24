import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  /** An empty screen is an invitation to act — give it a way forward. */
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-12 text-center",
        className
      )}
    >
      {Icon && (
        <span className="mb-3 flex size-9 items-center justify-center rounded-md border border-line bg-panel-sunken">
          <Icon aria-hidden="true" className="size-4 text-ink-faint" />
        </span>
      )}

      <p className="text-sm font-medium text-ink">{title}</p>

      <p className="mt-1 max-w-sm text-sm leading-relaxed text-ink-soft">
        {description}
      </p>

      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
