"use client";

import { AlertTriangle, Boxes, Layers, Wallet } from "lucide-react";

import { MetricCard, MetricCardSkeleton } from "@/components/common/metric-card";
import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatInrCompact,
  formatNumber,
  formatPercent,
  formatShare,
  toShare,
} from "@/lib/format";
import { useWorkspace } from "@/lib/use-operations";

import { CoveragePanel } from "../coverage-panel";
import { LineOutput } from "../line-output";
import { SpendMix } from "../spend-mix";
import { WarehouseExposure } from "../warehouse-exposure";

/*
 * Analytics with no forecast in it.
 *
 * There is no invented history here and no trend line over data that does not
 * exist: every panel is a different cut of the records this workspace actually
 * holds. The page leads with build coverage because that is the one reading none
 * of the three modules can produce alone.
 */
export function AnalyticsOverview() {
  const { operations, analytics } = useWorkspace();

  const { totals } = operations;
  const { ready } = analytics;

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Cross-cuts of the inventory, supplier and production records held in this workspace. Nothing here is forecast."
      />

      <section className="overflow-hidden rounded-lg border border-line bg-panel">
        <div className="p-6">
          {ready ? (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <p className="label-micro">Reading</p>

                <Badge
                  withDot
                  tone={analytics.shortfalls > 0 ? "critical" : "positive"}
                >
                  {analytics.shortfalls > 0 ? "Shortfall" : "Buildable"}
                </Badge>
              </div>

              <p className="animate-rise mt-4 max-w-4xl font-display text-[1.375rem] leading-snug font-semibold text-balance text-ink sm:text-2xl">
                {analytics.headline}
              </p>

              <p className="mt-3 max-w-prose text-sm leading-relaxed text-ink-soft">
                Coverage compares units on hand against units still owed on open
                runs. It says nothing about lead times or supplier capacity —
                those are not recorded, so they are not claimed.
              </p>
            </>
          ) : (
            <>
              <Skeleton className="h-2.5 w-24" />
              <Skeleton className="mt-4 h-6 w-full" />
              <Skeleton className="mt-2 h-6 w-2/3" />
              <Skeleton className="mt-5 h-3 w-4/5" />
            </>
          )}
        </div>
      </section>

      {ready ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Products short"
            value={formatNumber(analytics.shortfalls)}
            icon={AlertTriangle}
            status={
              analytics.shortfalls > 0
                ? { text: "Cannot build", tone: "critical" }
                : { text: "Covered", tone: "positive" }
            }
            rail={{
              fill: toShare(analytics.shortfalls, analytics.coverage.length),
              caption:
                analytics.coverage.length === 0
                  ? "No open commitments to measure"
                  : `${formatPercent(analytics.shortfalls, analytics.coverage.length)} of committed products, ${formatNumber(analytics.shortfallUnits)} units short`,
              tone: analytics.shortfalls > 0 ? "critical" : "positive",
            }}
          />

          {/* The figure is what is left, so the label says so. It used to read
              "Units committed" above a rail measuring delivered progress, which
              put two different quantities in one card. */}
          <MetricCard
            label="Units still to build"
            value={formatNumber(totals.openUnits)}
            icon={Layers}
            rail={{
              fill: toShare(totals.builtUnits, totals.targetUnits),
              caption: `${formatNumber(totals.builtUnits)} of ${formatNumber(totals.targetUnits)} target units already delivered`,
              tone: "brand",
            }}
          />

          <MetricCard
            label="Units on hand"
            value={formatNumber(totals.units)}
            icon={Boxes}
            rail={{
              fill: toShare(totals.lines - totals.atRisk, totals.lines),
              caption: `${formatNumber(totals.lines - totals.atRisk)} of ${formatNumber(totals.lines)} lines above their watch level`,
              tone: totals.atRisk > 0 ? "caution" : "positive",
            }}
          />

          <MetricCard
            label="Recorded spend"
            value={formatInrCompact(totals.spend)}
            icon={Wallet}
            rail={{
              fill: analytics.categories[0]?.share ?? 0,
              caption: analytics.categories[0]
                ? `${analytics.categories[0].category} is the largest category at ${formatShare(analytics.categories[0].share)}`
                : "No supplier spend recorded yet",
              tone: "brand",
            }}
          />
        </div>
      ) : (
        <MetricCardSkeleton className="mt-6" />
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <CoveragePanel model={analytics} />

        <div className="flex flex-col gap-6">
          <WarehouseExposure model={analytics} />
          <SpendMix model={analytics} />
        </div>
      </div>

      <div className="mt-6">
        <LineOutput model={analytics} />
      </div>
    </>
  );
}
