"use client";

import { AlertTriangle, Boxes, Factory, Truck } from "lucide-react";

import { MetricCard, MetricCardSkeleton } from "@/components/common/metric-card";
import { PageHeader } from "@/components/common/page-header";
import { formatNumber, formatPercent, toShare } from "@/lib/format";
import { useOperations } from "@/lib/use-operations";

import { LineLoadPanel } from "../line-load";
import { OperationsBrief } from "../operations-brief";
import { QuickActions } from "../quick-actions";
import { SignalFeed } from "../signal-feed";
import { SpendConcentration } from "../spend-concentration";
import { WarehouseCoveragePanel } from "../warehouse-coverage";

/*
 * The dashboard reads the same three stores the Inventory, Supplier and
 * Production pages write to, so an edit made on any of them is reflected here on
 * the next render — and, because the stores are backed by a storage listener, in
 * every other open tab as well.
 */
export function DashboardOverview() {
  const model = useOperations();

  const { ready, totals } = model;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Every reading on this page is computed from the inventory, supplier and production records held in this workspace."
      />

      <OperationsBrief model={model} />

      {ready ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
            label="Lines needing action"
            value={formatNumber(totals.atRisk)}
            icon={AlertTriangle}
            status={
              totals.critical > 0
                ? { text: "Act today", tone: "critical" }
                : totals.atRisk > 0
                  ? { text: "Reorder soon", tone: "caution" }
                  : { text: "All clear", tone: "positive" }
            }
            rail={{
              fill: toShare(totals.atRisk, totals.lines),
              caption: `${formatPercent(totals.atRisk, totals.lines)} of stock lines are below a threshold`,
              tone:
                totals.critical > 0
                  ? "critical"
                  : totals.atRisk > 0
                    ? "caution"
                    : "positive",
            }}
          />

          <MetricCard
            label="Active suppliers"
            value={formatNumber(totals.activeSuppliers)}
            icon={Truck}
            rail={{
              fill: toShare(totals.activeSuppliers, totals.suppliers),
              caption: `${formatNumber(totals.pendingSuppliers)} awaiting approval of ${formatNumber(totals.suppliers)} on the roster`,
              tone: totals.pendingSuppliers > 0 ? "caution" : "positive",
            }}
          />

          {/* Recorded spend is already stated in the brief and broken down in
              the concentration panel, so the fourth slot goes to the floor —
              the one part of the network the strip would otherwise ignore. */}
          <MetricCard
            label="Units still to build"
            value={formatNumber(totals.openUnits)}
            icon={Factory}
            status={
              totals.lateRuns > 0
                ? { text: `${totals.lateRuns} past due`, tone: "critical" }
                : totals.blockedRuns > 0
                  ? { text: `${totals.blockedRuns} blocked`, tone: "critical" }
                  : totals.openRuns > 0
                    ? { text: "On schedule", tone: "positive" }
                    : undefined
            }
            rail={{
              fill: toShare(totals.builtUnits, totals.targetUnits),
              caption:
                totals.runs === 0
                  ? "No production runs scheduled yet"
                  : `${formatPercent(totals.builtUnits, totals.targetUnits)} of ${formatNumber(totals.targetUnits)} committed units built across ${formatNumber(totals.openRuns)} open ${totals.openRuns === 1 ? "run" : "runs"}`,
              tone:
                totals.lateRuns > 0 || totals.blockedRuns > 0
                  ? "critical"
                  : "brand",
            }}
          />
        </div>
      ) : (
        <MetricCardSkeleton className="mt-6" />
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <SignalFeed model={model} />

        <div className="flex flex-col gap-6">
          <LineLoadPanel model={model} />
          <WarehouseCoveragePanel model={model} />
          <SpendConcentration model={model} />
        </div>
      </div>

      <div className="mt-6">
        <QuickActions />
      </div>
    </>
  );
}
