"use client";

import { Warehouse } from "lucide-react";
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
import { formatNumber } from "@/lib/format";

import { ChartTooltip } from "../chart-tooltip";

interface WarehouseExposureProps {
  model: AnalyticsModel;
}

/*
 * Line counts, not unit counts.
 *
 * A site holding 40,000 units across two healthy lines is not more exposed than
 * a site holding 300 units across nine lines where four are critical — exposure
 * is about how many things need a decision, so that is what is stacked.
 */
export function WarehouseExposure({ model }: WarehouseExposureProps) {
  return (
    <SectionCard
      flush
      title="Warehouse exposure"
      description="Stock lines by reorder state at each site. Taller red means more decisions."
    >
      {!model.ready ? (
        <div className="p-5">
          <Skeleton className="h-52 w-full" />
        </div>
      ) : model.warehouseMix.length === 0 ? (
        <EmptyState
          icon={Warehouse}
          title="No sites in use"
          description="Add a stock line and the site holding it appears here, split by how many of its lines need reordering."
        />
      ) : (
        <>
          {/* Hidden from assistive tech: a stacked SVG announces as a pile of
              numbers with no labels. The list below carries the same reading in
              words, the way the coverage panel does. */}
          <div aria-hidden="true" className="h-64 px-2 pt-5 pb-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={model.warehouseMix}
                margin={{ top: 0, right: 12, bottom: 0, left: -18 }}
              >
                <CartesianGrid
                  vertical={false}
                  stroke="var(--line)"
                  strokeDasharray="2 4"
                />

                <XAxis
                  dataKey="warehouse"
                  stroke="var(--ink-faint)"
                  tick={{ fontSize: 11, fill: "var(--ink-soft)" }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                />

                <YAxis
                  allowDecimals={false}
                  stroke="var(--ink-faint)"
                  tick={{ fontSize: 11, fill: "var(--ink-faint)" }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  cursor={{ fill: "var(--panel-sunken)" }}
                  content={<ChartTooltip format={formatNumber} unit="lines" />}
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
                  stackId="lines"
                  name="Healthy"
                  dataKey="healthy"
                  fill="var(--positive)"
                  barSize={26}
                  isAnimationActive={false}
                />

                <Bar
                  stackId="lines"
                  name="Low"
                  dataKey="low"
                  fill="var(--caution)"
                  barSize={26}
                  isAnimationActive={false}
                />

                <Bar
                  stackId="lines"
                  name="Critical"
                  dataKey="critical"
                  fill="var(--critical)"
                  radius={[2, 2, 0, 0]}
                  barSize={26}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <ul className="border-t border-line">
            {model.warehouseMix.map((site) => {
              const lines = site.healthy + site.low + site.critical;
              const decisions = site.low + site.critical;

              return (
                <li
                  key={site.warehouse}
                  className="border-b border-line px-5 py-3 last:border-0"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <p className="truncate text-sm font-medium text-ink">
                      {site.warehouse}
                    </p>

                    <p className="figure text-xs text-ink-faint">
                      {formatNumber(lines)} {lines === 1 ? "line" : "lines"}
                    </p>
                  </div>

                  <p className="mt-0.5 text-xs text-ink-faint">
                    {decisions === 0 ? (
                      "Every line here clears the watch level."
                    ) : (
                      <>
                        <span className="text-critical">
                          {formatNumber(site.critical)} below the floor
                        </span>{" "}
                        ·{" "}
                        <span className="text-caution">
                          {formatNumber(site.low)} under the watch level
                        </span>{" "}
                        · {formatNumber(site.healthy)} healthy
                      </>
                    )}
                  </p>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </SectionCard>
  );
}
