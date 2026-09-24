"use client";

import { Factory } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { EmptyState } from "@/components/common/empty-state";
import { SectionCard } from "@/components/common/section-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnalyticsModel } from "@/lib/analytics";
import { formatNumber, formatPercent } from "@/lib/format";

import { ChartTooltip } from "../chart-tooltip";

interface LineOutputProps {
  model: AnalyticsModel;
}

const toneFill: Record<string, string> = {
  neutral: "var(--ink-faint)",
  brand: "var(--brand)",
  caution: "var(--caution)",
  critical: "var(--critical)",
  positive: "var(--positive)",
};

/*
 * What each line has finished against what it still owes. The stack is the total
 * commitment on that line, so a tall bar with a short green segment is a line
 * that has been given a lot and delivered little — which is the reading that
 * matters when deciding where to move work.
 */
export function LineOutput({ model }: LineOutputProps) {
  const totalRuns = model.statusMix.reduce((sum, slice) => sum + slice.runs, 0);

  return (
    <SectionCard
      flush
      title="Line output"
      description="Units delivered against units still owed, per production line."
    >
      {!model.ready ? (
        <div className="p-5">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="mt-5 h-2 w-full" />
        </div>
      ) : model.lineOutput.length === 0 ? (
        <EmptyState
          icon={Factory}
          title="No runs recorded"
          description="Schedule a production run and the line building it appears here with its delivered and outstanding units."
        />
      ) : (
        <>
          {/* Hidden from assistive tech; the list below is the same reading in
              words. */}
          <div
            aria-hidden="true"
            className="px-2 pt-5 pb-2"
            style={{ height: model.lineOutput.length * 40 + 76 }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={model.lineOutput}
                margin={{ top: 0, right: 16, bottom: 0, left: 8 }}
              >
                <CartesianGrid
                  horizontal={false}
                  stroke="var(--line)"
                  strokeDasharray="2 4"
                />

                <XAxis
                  type="number"
                  tickFormatter={(value: number) => formatNumber(value)}
                  stroke="var(--ink-faint)"
                  tick={{ fontSize: 11, fill: "var(--ink-faint)" }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  type="category"
                  dataKey="line"
                  width={112}
                  stroke="var(--ink-faint)"
                  tick={{ fontSize: 11, fill: "var(--ink-soft)" }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  cursor={{ fill: "var(--panel-sunken)" }}
                  content={<ChartTooltip format={formatNumber} unit="units" />}
                />

                <Legend
                  verticalAlign="bottom"
                  height={28}
                  iconType="square"
                  iconSize={8}
                  wrapperStyle={{
                    fontSize: 11,
                    color: "var(--ink-soft)",
                    paddingTop: 8,
                  }}
                />

                <Bar
                  stackId="units"
                  name="Delivered"
                  dataKey="built"
                  fill="var(--positive)"
                  barSize={14}
                  isAnimationActive={false}
                />

                <Bar
                  stackId="units"
                  name="Still owed"
                  dataKey="open"
                  fill="var(--brand)"
                  radius={[0, 2, 2, 0]}
                  barSize={14}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <ul className="border-t border-line">
            {model.lineOutput.map((load) => {
              const committed = load.built + load.open;

              return (
                <li
                  key={load.line}
                  className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-line px-5 py-3 last:border-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">
                      {load.line}
                    </p>

                    <p className="mt-0.5 text-xs text-ink-faint">
                      {formatNumber(load.built)} delivered ·{" "}
                      {formatNumber(load.open)} still owed on open runs
                    </p>
                  </div>

                  <p className="figure shrink-0 text-xs text-ink-soft">
                    {formatPercent(load.built, committed)} complete
                  </p>
                </li>
              );
            })}
          </ul>

          {/* Status mix as one segmented rail rather than a pie: four values do
              not need a chart, and a bar can be read against a common baseline. */}
          {totalRuns > 0 && (
            <div className="border-t border-line px-5 py-4">
              <p className="label-micro">Run status mix</p>

              <div className="mt-2.5 flex h-[6px] gap-px overflow-hidden rounded-full bg-panel-sunken">
                {model.statusMix.map((slice) => (
                  <span
                    key={slice.status}
                    aria-hidden="true"
                    style={{
                      width: `${(slice.runs / totalRuns) * 100}%`,
                      backgroundColor: toneFill[slice.tone],
                    }}
                  />
                ))}
              </div>

              <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
                {model.statusMix.map((slice) => (
                  <div
                    key={slice.status}
                    className="flex items-center gap-1.5 text-xs"
                  >
                    {/* The swatch sits inside the term, not beside it. A dl's
                        div may hold only dt and dd elements, and a stray span
                        ahead of the dt breaks the list's structure for anything
                        reading it as a description list. */}
                    <dt className="flex items-center gap-1.5 text-ink-soft">
                      <span
                        aria-hidden="true"
                        className="size-2 shrink-0 rounded-[2px]"
                        style={{ backgroundColor: toneFill[slice.tone] }}
                      />
                      {slice.status}
                    </dt>

                    <dd className="figure text-ink">
                      {formatNumber(slice.runs)}
                      <span className="ml-1 text-ink-faint">
                        {formatPercent(slice.runs, totalRuns)}
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </>
      )}
    </SectionCard>
  );
}
