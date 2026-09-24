import { rulebook } from "@/lib/rulebook";
import { cn } from "@/lib/utils";

interface RulebookListProps {
  /**
   * `grid` — a hairline card of cells, where the page has width for it.
   * `stack` — one divided column, for a sidebar.
   */
  layout?: "grid" | "stack";
  className?: string;
}

/*
 * The thresholds, rendered once.
 *
 * Both /settings and /rescue-plan list the rulebook, and both were carrying their
 * own copy of the row markup. Two copies of a definition list is two chances for
 * one of them to start presenting a value differently from the constant it came
 * from — which is exactly the drift moving the rulebook into lib was meant to end.
 *
 * Each rule gets two descriptions: the number, then the sentence that says what
 * the number does. That is what a `dl` is for, and it means a screen reader
 * announces "Reorder floor, 20 units, stock below this needs a purchase order
 * today" as one unit rather than three loose fragments.
 */
export function RulebookList({ layout = "grid", className }: RulebookListProps) {
  const grid = layout === "grid";

  return (
    <dl
      className={cn(
        grid &&
          "grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2",
        className
      )}
    >
      {rulebook.map((entry) => (
        <div
          key={entry.rule}
          className={cn(
            "grid grid-cols-[1fr_auto] items-baseline gap-x-3",
            grid
              ? "bg-panel px-4 py-3"
              : "border-b border-line py-3 last:border-0 last:pb-0"
          )}
        >
          <dt className="text-sm text-ink-soft">{entry.rule}</dt>

          <dd className="figure text-sm font-medium text-ink">{entry.value}</dd>

          <dd className="col-span-2 mt-1 text-xs leading-relaxed text-ink-faint">
            {entry.reading}
          </dd>
        </div>
      ))}
    </dl>
  );
}
