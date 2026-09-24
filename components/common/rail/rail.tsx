import { cn } from "@/lib/utils";
import type { SignalTone } from "@/types/signal";

interface RailProps {
  /** Where the value sits in its operating band, 0–100. */
  value: number;
  /** What the rail measures. Required — an unlabelled bar is decoration. */
  label: string;
  /**
   * Set where the same reading is already in text beside the rail.
   *
   * The rail then goes aria-hidden and the visible sentence is the one that gets
   * announced. Without it, a metric card reads its caption out twice: once as
   * the bar's own label, once as the paragraph under it.
   *
   * `label` stays required either way. It is the invariant that keeps the fill
   * and the words describing it in the same place, whoever ends up reading it.
   */
  decorative?: boolean;
  /** Optional threshold tick, 0–100. Only pass a real threshold. */
  target?: number;
  tone?: SignalTone;
  className?: string;
}

const railFill: Record<SignalTone, string> = {
  neutral: "bg-ink-faint",
  positive: "bg-positive",
  caution: "bg-caution",
  critical: "bg-critical",
  brand: "bg-brand",
};

function clamp(value: number) {
  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

/*
 * The tolerance rail: this app's one signature device, borrowed from the dial
 * gauges on a shop floor. It shows where a figure sits inside its operating band
 * and — where a real threshold exists — marks it with a tick. A number alone
 * tells you the reading; the rail tells you whether the reading is where it
 * should be.
 *
 * It carries an aria-label rather than a progressbar role: this is a static
 * reading of a computed share, not a task in progress.
 */
export function Rail({
  value,
  label,
  decorative = false,
  target,
  tone = "brand",
  className,
}: RailProps) {
  return (
    <div
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? "true" : undefined}
      aria-label={
        decorative
          ? undefined
          : `${label} — ${Math.round(clamp(value))} percent of band`
      }
      className={cn(
        "relative h-[3px] w-full overflow-hidden rounded-full bg-panel-sunken",
        className
      )}
    >
      <span
        className={cn("absolute inset-y-0 left-0 rounded-full", railFill[tone])}
        style={{ width: `${clamp(value)}%` }}
      />

      {target !== undefined && (
        <span
          aria-hidden="true"
          className="absolute inset-y-0 w-px bg-ink"
          style={{ left: `${clamp(target)}%` }}
        />
      )}
    </div>
  );
}
