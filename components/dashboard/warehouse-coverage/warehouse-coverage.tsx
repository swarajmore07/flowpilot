"use client";

import { Warehouse } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { Rail } from "@/components/common/rail";
import { SectionCard } from "@/components/common/section-card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber, formatShare } from "@/lib/format";
import type { OperationsModel } from "@/lib/operations";

interface WarehouseCoveragePanelProps {
  model: OperationsModel;
}

/*
 * Where the stock physically is. The rail measures each warehouse against the
 * network total, so an over-concentrated site is visible without reading the
 * numbers; the badge counts the lines at that site that need a decision.
 */
export function WarehouseCoveragePanel({ model }: WarehouseCoveragePanelProps) {
  return (
    <SectionCard
      flush
      title="Warehouse coverage"
      description="Units on hand by site, as a share of the whole network."
    >
      {!model.ready ? (
        <div className="space-y-5 p-5">
          {[0, 1, 2, 3].map((index) => (
            <div key={index}>
              <Skeleton className="h-3.5 w-1/3" />
              <Skeleton className="mt-2.5 h-[3px] w-full" />
            </div>
          ))}
        </div>
      ) : model.warehouses.length === 0 ? (
        <EmptyState
          icon={Warehouse}
          title="No warehouses in use"
          description="Add a stock line and the site holding it appears here with its share of the network."
        />
      ) : (
        <ul>
          {model.warehouses.map((site) => (
            <li
              key={site.warehouse}
              className="border-b border-line px-5 py-4 last:border-0"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <p className="text-sm font-medium text-ink">{site.warehouse}</p>

                <p className="figure text-sm text-ink">
                  {formatNumber(site.units)}
                  <span className="ml-1 text-xs text-ink-faint">units</span>
                </p>
              </div>

              <Rail
                className="mt-3"
                value={site.share}
                tone={site.tone}
                label={`${site.warehouse} share of network units`}
              />

              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-ink-faint">
                  {/* The share the rail was drawn from, so the bar and the
                      figure beside it can never differ by a rounding step. */}
                  {formatShare(site.share)} of network ·{" "}
                  {formatNumber(site.lines)}{" "}
                  {site.lines === 1 ? "line" : "lines"}
                </p>

                {site.atRisk > 0 ? (
                  <Badge withDot tone={site.tone}>
                    {formatNumber(site.atRisk)} need reordering
                  </Badge>
                ) : (
                  <Badge withDot tone="positive">
                    Fully stocked
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
