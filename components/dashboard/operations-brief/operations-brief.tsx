"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatInrCompact, formatNumber } from "@/lib/format";
import type { OperationsModel } from "@/lib/operations";

interface OperationsBriefProps {
  model: OperationsModel;
}

function Reading({
  label,
  value,
  caption,
}: {
  label: string;
  value: string;
  caption: string;
}) {
  return (
    <div className="border-b border-line py-3 first:pt-0 last:border-0 last:pb-0">
      <p className="label-micro">{label}</p>

      <p className="figure mt-1.5 font-display text-xl leading-none font-semibold text-ink">
        {value}
      </p>

      <p className="mt-1.5 text-xs leading-relaxed text-ink-faint">{caption}</p>
    </div>
  );
}

/*
 * The brief is the page's thesis: one sentence about the state of the network,
 * computed from the records in this workspace, with the readings behind it set
 * out alongside. No forecast, no confidence score — the arithmetic is stated so
 * it can be checked.
 */
export function OperationsBrief({ model }: OperationsBriefProps) {
  const { totals, risk } = model;

  if (!model.ready) {
    return (
      <section className="rounded-lg border border-line bg-panel">
        <div className="grid gap-px lg:grid-cols-[1.6fr_1fr]">
          <div className="p-6">
            <Skeleton className="h-2.5 w-32" />
            <Skeleton className="mt-4 h-6 w-full" />
            <Skeleton className="mt-2 h-6 w-4/5" />
            <Skeleton className="mt-6 h-2.5 w-2/3" />
          </div>

          <div className="border-t border-line p-6 lg:border-t-0 lg:border-l">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="py-3">
                <Skeleton className="h-2.5 w-20" />
                <Skeleton className="mt-2 h-5 w-16" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-lg border border-line bg-panel">
      <div className="grid lg:grid-cols-[1.6fr_1fr]">
        <div className="p-6">
          <div className="flex flex-wrap items-center gap-3">
            <p className="label-micro">Operations brief</p>

            <Badge withDot tone={risk.tone}>
              {risk.label}
            </Badge>
          </div>

          <p className="animate-rise mt-4 font-display text-[1.375rem] leading-snug font-semibold text-balance text-ink sm:text-2xl">
            {model.headline}
          </p>

          <p className="mt-3 max-w-prose text-sm leading-relaxed text-ink-soft">
            {risk.detail}
          </p>

          <p className="mt-6 text-xs text-ink-faint">
            Computed from {formatNumber(totals.lines)} stock{" "}
            {totals.lines === 1 ? "line" : "lines"},{" "}
            {formatNumber(totals.suppliers)}{" "}
            {totals.suppliers === 1 ? "supplier" : "suppliers"} and{" "}
            {formatNumber(totals.runs)} production{" "}
            {totals.runs === 1 ? "run" : "runs"} held in this workspace.
          </p>

          <div className="mt-5 flex flex-wrap gap-4">
            <Link
              href="/inventory"
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Open inventory
              <ArrowRight
                aria-hidden="true"
                className="size-3.5 transition-transform group-hover:translate-x-0.5"
              />
            </Link>

            <Link
              href="/production"
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Open production
              <ArrowRight
                aria-hidden="true"
                className="size-3.5 transition-transform group-hover:translate-x-0.5"
              />
            </Link>

            <Link
              href="/suppliers"
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Review suppliers
              <ArrowRight
                aria-hidden="true"
                className="size-3.5 transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </div>

        <div className="border-t border-line bg-panel-sunken p-6 lg:border-t-0 lg:border-l">
          <Reading
            label="Lines needing action"
            value={`${formatNumber(totals.atRisk)} of ${formatNumber(totals.lines)}`}
            caption={`${formatNumber(totals.critical)} below the reorder floor, ${formatNumber(totals.lowStock)} under the watch level`}
          />

          <Reading
            label="Runs behind schedule"
            value={`${formatNumber(totals.lateRuns)} of ${formatNumber(totals.openRuns)}`}
            caption={
              totals.openRuns === 0
                ? "No open work orders on the floor"
                : `${formatNumber(totals.openUnits)} units still open, ${formatNumber(totals.blockedRuns)} blocked`
            }
          />

          <Reading
            label="Units on hand"
            value={formatNumber(totals.units)}
            caption={`Across ${formatNumber(model.warehouses.length)} ${model.warehouses.length === 1 ? "warehouse" : "warehouses"}`}
          />

          <Reading
            label="Recorded spend"
            value={formatInrCompact(totals.spend)}
            caption={`${formatNumber(totals.activeSuppliers)} active, ${formatNumber(totals.pendingSuppliers)} awaiting approval`}
          />
        </div>
      </div>
    </section>
  );
}
