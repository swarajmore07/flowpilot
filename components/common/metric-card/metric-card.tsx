import type { LucideIcon } from "lucide-react";

import { Rail } from "@/components/common/rail";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { SignalTone } from "@/types/signal";

export type { SignalTone };

interface MetricRail {
  /** Where the value sits in its operating band, 0–100. */
  fill: number;
  /** What the rail measures. Required — an unlabelled bar is decoration. */
  caption: string;
  /** Optional threshold tick, 0–100. Only pass a real threshold. */
  target?: number;
  tone?: SignalTone;
}

interface MetricCardProps {
  label: string;
  value: string;
  icon?: LucideIcon;
  status?: { text: string; tone: SignalTone };
  rail?: MetricRail;
  className?: string;
}

/*
 * The metric card pairs a figure with the tolerance rail, so a reading always
 * arrives with the band it is being judged against. A number alone tells you
 * the reading; the rail tells you whether the reading is where it should be.
 *
 * There is no delta slot, and that is deliberate. A card had one — an arrow, a
 * signed figure and a "vs last month" caption — but this workspace stores only
 * the records as they stand, with no history to difference against, so every
 * movement it could have shown would have been invented. The rail answers the
 * question the arrow was pretending to: is this figure where it should be.
 */
export function MetricCard({
  label,
  value,
  icon: Icon,
  status,
  rail,
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border border-line bg-panel p-4",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="label-micro">{label}</p>

        {Icon && (
          <Icon aria-hidden="true" className="size-4 shrink-0 text-ink-faint" />
        )}
      </div>

      <p className="figure mt-2.5 font-display text-[1.75rem] leading-none font-semibold text-ink">
        {value}
      </p>

      {rail && (
        <div className="mt-4">
          {/* Decorative here, and only here: the caption below is the same
              sentence the rail would otherwise carry as its label, so leaving
              both in place had a screen reader read every card twice. */}
          <Rail
            decorative
            value={rail.fill}
            label={rail.caption}
            target={rail.target}
            tone={rail.tone ?? "brand"}
          />

          <p className="mt-2 text-xs text-ink-faint">{rail.caption}</p>
        </div>
      )}

      {status && (
        <div className="mt-4 flex flex-wrap items-center justify-end gap-2 pt-0">
          <Badge withDot tone={status.tone}>
            {status.text}
          </Badge>
        </div>
      )}
    </div>
  );
}

interface MetricCardSkeletonProps {
  /** How many cards this row will hold once the records arrive. */
  count?: number;
  className?: string;
}

/*
 * The loading shape for a row of metric cards.
 *
 * It lives beside the card because it has to match it — same border, same
 * padding, four bands where the label, figure, rail and caption will be. Five
 * pages show this row while storage is being read, and five copies of the markup
 * would be five chances for one page to keep the old proportions after the card
 * itself changes.
 *
 * Withholding the figures is the point rather than a courtesy. Before storage has
 * been read the only numbers available are the seed's, and printing those under a
 * heading like "Total suppliers" would state a total the page does not yet know.
 */
export function MetricCardSkeleton({
  count = 4,
  className,
}: MetricCardSkeletonProps) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 xl:grid-cols-4", className)}>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="rounded-lg border border-line bg-panel p-4"
        >
          <Skeleton className="h-2.5 w-24" />
          <Skeleton className="mt-3.5 h-7 w-20" />
          <Skeleton className="mt-5 h-[3px] w-full" />
          <Skeleton className="mt-3 h-2.5 w-3/4" />
        </div>
      ))}
    </div>
  );
}
