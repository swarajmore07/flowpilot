import { Skeleton } from "@/components/ui/skeleton";

interface TableSkeletonProps {
  /** How many placeholder rows to draw. Five is a screenful without filling it. */
  rows?: number;
}

/*
 * The placeholder shown while a table's records are being read out of
 * localStorage.
 *
 * Each bar is 44px — the same height a real row will be — so the panel does not
 * change height the instant the data lands. A loading state that resizes the page
 * under the reader's cursor is worse than one that takes a beat longer.
 *
 * Deliberately not animated beyond the shared Skeleton's own pulse, and
 * deliberately not labelled: the panel above it already carries the heading, and
 * a "Loading…" line here would be read out as content that is about to vanish.
 */
export function TableSkeleton({ rows = 5 }: TableSkeletonProps) {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className="h-11 w-full" />
      ))}
    </div>
  );
}
