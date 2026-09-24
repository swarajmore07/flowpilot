import { cn } from "@/lib/utils";

/*
 * The mark is a flow-rate glyph: three throughput lines of decreasing length
 * feeding a single indicator tick. It borrows the vocabulary of the dial
 * gauges on a shop floor rather than a generic app icon.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-md bg-brand text-brand-fg",
        className
      )}
    >
      <svg
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
        className="size-4"
      >
        <path
          d="M2.5 4.5h9M2.5 8h6.5M2.5 11.5h4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M13.5 8.5V13"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.55"
        />
      </svg>
    </span>
  );
}
