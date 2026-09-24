"use client";

import { PackageSearch } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { EmptyState } from "@/components/common/empty-state";
import { SectionCard } from "@/components/common/section-card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnalyticsModel } from "@/lib/analytics";
import { formatNumber } from "@/lib/format";

import { ChartTooltip } from "../chart-tooltip";

interface CoveragePanelProps {
  model: AnalyticsModel;
}

/* Enough rows to read at a glance; the table below the chart carries the rest. */
const CHART_ROWS = 6;
const ROW_HEIGHT = 34;

/*
 * The signature reading of this page: units on hand set against units already
 * committed to a production run, per product. It is the one question none of the
 * three modules can answer alone — Inventory knows the stock, Production knows
 * the commitment, and only together do they say whether the plan is buildable.
 *
 * A product whose "still to build" bar is longer than its "on hand" bar cannot
 * be finished from stock. That is a fact about the records, not a forecast.
 */
export function CoveragePanel({ model }: CoveragePanelProps) {
  const rows = model.coverage.slice(0, CHART_ROWS);

  return (
    <SectionCard
      flush
      title="Build coverage"
      description="Units on hand against units still committed to an open run, worst covered first."
      action={
        model.ready ? (
          <Badge
            withDot
            tone={model.shortfalls > 0 ? "critical" : "positive"}
          >
            {model.shortfalls > 0
              ? `${formatNumber(model.shortfallUnits)} units short`
              : "Fully covered"}
          </Badge>
        ) : undefined
      }
    >
      {!model.ready ? (
        <div className="space-y-4 p-5">
          {[0, 1, 2, 3, 4].map((index) => (
            <Skeleton key={index} className="h-5 w-full" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="Nothing is committed yet"
          description="Schedule a production run and this compares what it needs against the stock actually on the shelf."
        />
      ) : (
        <>
          {/* Hidden from assistive tech; the list below is the same reading in
              words, including the rows the chart truncates. */}
          <div
            aria-hidden="true"
            className="px-2 pt-5 pb-1"
            style={{ height: rows.length * ROW_HEIGHT + 56 }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={rows}
                barGap={2}
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
                  dataKey="product"
                  width={116}
                  stroke="var(--ink-faint)"
                  tick={{ fontSize: 11, fill: "var(--ink-soft)" }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  cursor={{ fill: "var(--panel-sunken)" }}
                  content={<ChartTooltip format={formatNumber} unit="units" />}
                />

                <Bar
                  name="On hand"
                  dataKey="stock"
                  /* Per-row Cells override this, but the series still needs a
                     fill: the tooltip and legend read the Bar's own colour, and
                     without one recharts falls back to a built-in hex that does
                     not flip with the theme. */
                  fill="var(--positive)"
                  radius={[0, 2, 2, 0]}
                  barSize={9}
                  isAnimationActive={false}
                >
                  {rows.map((row) => (
                    <Cell
                      key={row.product}
                      fill={
                        row.shortfall > 0 ? "var(--critical)" : "var(--positive)"
                      }
                    />
                  ))}
                </Bar>

                <Bar
                  name="Still to build"
                  dataKey="required"
                  fill="var(--brand)"
                  radius={[0, 2, 2, 0]}
                  barSize={9}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <ul className="border-t border-line">
            {model.coverage.map((row) => (
              <li
                key={row.product}
                className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-line px-5 py-3 last:border-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">
                    {row.product}
                  </p>

                  <p className="mt-0.5 text-xs text-ink-faint">
                    {formatNumber(row.stock)} on hand ·{" "}
                    {formatNumber(row.required)} committed across{" "}
                    {formatNumber(row.runs)} {row.runs === 1 ? "run" : "runs"}
                  </p>
                </div>

                {!row.tracked ? (
                  <Badge withDot tone="critical">
                    Not in inventory
                  </Badge>
                ) : row.shortfall > 0 ? (
                  <Badge withDot tone="critical">
                    {formatNumber(row.shortfall)} short
                  </Badge>
                ) : (
                  <Badge withDot tone={row.tone}>
                    {Number.isFinite(row.multiple)
                      ? `${row.multiple.toFixed(1)}× cover`
                      : "Nothing left to build"}
                  </Badge>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </SectionCard>
  );
}
