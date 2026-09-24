"use client";

/*
 * One tooltip for every chart on this page.
 *
 * Recharts' default tooltip ships its own white box and blue text, which would
 * be the only element in the app that ignores the token system and the only one
 * that stays light in dark mode. This is the same panel, hairline and type scale
 * as every other surface.
 */

interface TooltipEntry {
  name?: string;
  dataKey?: string | number;
  value?: string | number;
  color?: string;
}

interface ChartTooltipProps {
  /* Recharts injects these when it clones the element. */
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
  /** Formats each value — units, rupees or a plain count. */
  format?: (value: number) => string;
  /** Appended after the formatted value, e.g. "units". */
  unit?: string;
}

export function ChartTooltip({
  active,
  payload,
  label,
  format,
  unit,
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="shadow-overlay min-w-40 rounded-md border border-line bg-panel-raised p-3">
      <p className="label-micro">{label}</p>

      <dl className="mt-2 space-y-1.5">
        {payload.map((entry) => {
          const numeric =
            typeof entry.value === "number" ? entry.value : Number(entry.value);

          const display = Number.isFinite(numeric)
            ? format
              ? format(numeric)
              : String(numeric)
            : "—";

          return (
            <div
              key={String(entry.dataKey ?? entry.name)}
              className="flex items-center justify-between gap-4"
            >
              <dt className="flex items-center gap-2 text-xs text-ink-soft">
                <span
                  aria-hidden="true"
                  className="size-2 rounded-[2px]"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}
              </dt>

              <dd className="figure text-xs font-medium text-ink">
                {display}
                {unit ? (
                  <span className="ml-1 text-ink-faint">{unit}</span>
                ) : null}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
