"use client";

import type { ReactNode } from "react";

import { Rail } from "@/components/common/rail";
import { Badge } from "@/components/ui/badge";
import type { ProductionRun } from "@/data/production/types";
import { formatDay } from "@/lib/date";
import { formatNumber, formatPercent } from "@/lib/format";

import {
  getScheduleSignal,
  productionPriorityTone,
  productionStatusTone,
  remainingUnits,
  runProgress,
} from "../production-status";

interface ProductionInfoProps {
  run: ProductionRun;
  today: string;
  /** Units the line has committed across every open run, for load context. */
  lineOpenUnits: number;
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-line py-2.5 last:border-0">
      <dt className="label-micro shrink-0">{label}</dt>
      <dd className="min-w-0 text-right text-sm text-ink">{children}</dd>
    </div>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="text-[0.9375rem] font-semibold text-ink">{title}</h3>
      <dl className="mt-2">{children}</dl>
    </section>
  );
}

/*
 * Read as a spec sheet: label on the left, value on the right, one hairline per
 * row. The progress panel at the bottom is the only place a figure is drawn
 * rather than stated, and it names the rule it is measuring against.
 */
export function ProductionInfo({
  run,
  today,
  lineOpenUnits,
}: ProductionInfoProps) {
  const schedule = getScheduleSignal(run, today);
  const open = remainingUnits(run);
  const progress = runProgress(run);

  return (
    <div className="space-y-7">
      <Group title="Work order">
        <Row label="Product">{run.product}</Row>
        <Row label="Line">{run.line}</Row>

        <Row label="Priority">
          <Badge tone={productionPriorityTone[run.priority]}>
            {run.priority}
          </Badge>
        </Row>

        <Row label="Status">
          <Badge withDot tone={productionStatusTone[run.status]}>
            {run.status}
          </Badge>
        </Row>
      </Group>

      <Group title="Quantity">
        <Row label="Target">
          <span className="figure font-medium">
            {formatNumber(run.targetUnits)}
          </span>
        </Row>

        <Row label="Completed">
          <span className="figure font-medium">
            {formatNumber(run.completedUnits)}
          </span>
        </Row>

        <Row label="Still open">
          <span className="figure font-medium">{formatNumber(open)}</span>
        </Row>

        <Row label="Share of line's open work">
          {open > 0 ? formatPercent(open, lineOpenUnits) : "—"}
        </Row>
      </Group>

      <Group title="Schedule">
        <Row label="Due date">{formatDay(run.dueDate)}</Row>

        <Row label="Reading">
          <Badge withDot tone={schedule.tone}>
            {schedule.label}
          </Badge>
        </Row>
      </Group>

      <section className="rounded-md border border-line bg-panel-sunken p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="label-micro">Progress</p>

          <Badge withDot tone={schedule.tone}>
            {schedule.label}
          </Badge>
        </div>

        <p className="figure mt-2 font-display text-2xl leading-none font-semibold text-ink">
          {formatPercent(run.completedUnits, run.targetUnits)}
        </p>

        <Rail
          value={progress}
          label="Units completed against target"
          tone={run.status === "Completed" ? "positive" : "brand"}
          className="mt-4"
        />

        <p className="mt-2.5 text-xs leading-relaxed text-ink-faint">
          {formatNumber(run.completedUnits)} of{" "}
          {formatNumber(run.targetUnits)} units accepted. {schedule.detail}
        </p>
      </section>
    </div>
  );
}
