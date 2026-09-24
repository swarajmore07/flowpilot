"use client";

import { Factory } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { Rail } from "@/components/common/rail";
import { SectionCard } from "@/components/common/section-card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber, formatShare } from "@/lib/format";
import type { OperationsModel } from "@/lib/operations";

interface LineLoadPanelProps {
  model: OperationsModel;
}

/*
 * Where the unbuilt work is sitting. The rail measures each line against the
 * floor's total open units, so a line carrying most of the backlog is visible
 * without reading the numbers, and the badge says whether anything on it is
 * already past its date. Completed runs are excluded — they are not load.
 */
export function LineLoadPanel({ model }: LineLoadPanelProps) {
  return (
    <SectionCard
      flush
      title="Line load"
      description="Units still to build by line, as a share of the floor's open work."
    >
      {!model.ready ? (
        <div className="space-y-5 p-5">
          {[0, 1, 2].map((index) => (
            <div key={index}>
              <Skeleton className="h-3.5 w-1/3" />
              <Skeleton className="mt-2.5 h-[3px] w-full" />
            </div>
          ))}
        </div>
      ) : model.lines.length === 0 ? (
        <EmptyState
          icon={Factory}
          title="No open work orders"
          description="Schedule a production run and the line carrying it appears here with its share of the floor."
        />
      ) : (
        <ul>
          {model.lines.map((load) => (
            <li
              key={load.line}
              className="border-b border-line px-5 py-4 last:border-0"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <p className="text-sm font-medium text-ink">{load.line}</p>

                <p className="figure text-sm text-ink">
                  {formatNumber(load.openUnits)}
                  <span className="ml-1 text-xs text-ink-faint">open</span>
                </p>
              </div>

              <Rail
                className="mt-3"
                value={load.share}
                tone={load.tone}
                label={`${load.line} share of open units`}
              />

              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-ink-faint">
                  {/* The same share the rail is drawn from, not a second
                      division of the same two numbers — a figure and the bar
                      beside it disagreeing by a rounding step is the kind of
                      thing a reader notices and then stops trusting. */}
                  {formatShare(load.share)} of the floor ·{" "}
                  {formatNumber(load.runs)} {load.runs === 1 ? "run" : "runs"}
                </p>

                {load.late > 0 ? (
                  <Badge withDot tone="critical">
                    {formatNumber(load.late)} past due
                  </Badge>
                ) : (
                  <Badge withDot tone={load.tone}>
                    On schedule
                  </Badge>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
