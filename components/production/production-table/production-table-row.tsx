"use client";

import { Eye, Pencil, Trash2 } from "lucide-react";

import { Rail } from "@/components/common/rail";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import type { ProductionRun } from "@/data/production/types";
import { formatNumber, formatPercent } from "@/lib/format";

import {
  getScheduleSignal,
  productionPriorityTone,
  productionStatusTone,
  runProgress,
} from "../production-status";

interface ProductionTableRowProps {
  run: ProductionRun;
  /** Reference day for the schedule reading, as `YYYY-MM-DD`. */
  today: string;
  onView: (run: ProductionRun) => void;
  onEdit: (run: ProductionRun) => void;
  onDelete: (run: ProductionRun) => void;
}

export function ProductionTableRow({
  run,
  today,
  onView,
  onEdit,
  onDelete,
}: ProductionTableRowProps) {
  const schedule = getScheduleSignal(run, today);
  const progress = runProgress(run);

  return (
    <TableRow>
      <TableCell className="min-w-52 whitespace-normal">
        <p className="font-medium text-ink">{run.product}</p>

        <p className="identifier mt-0.5 text-xs text-ink-faint">{run.id}</p>
      </TableCell>

      <TableCell>{run.line}</TableCell>

      <TableCell className="min-w-44">
        <div className="flex items-center gap-3">
          <Rail
            value={progress}
            label={`${run.product} progress`}
            tone={run.status === "Completed" ? "positive" : "brand"}
            className="w-20"
          />

          <span className="figure text-xs font-medium text-ink">
            {formatPercent(run.completedUnits, run.targetUnits)}
          </span>
        </div>
      </TableCell>

      <TableCell numeric>
        {formatNumber(run.completedUnits)}
        <span className="text-ink-faint"> / {formatNumber(run.targetUnits)}</span>
      </TableCell>

      <TableCell>
        <Badge withDot tone={schedule.tone}>
          {schedule.label}
        </Badge>
      </TableCell>

      <TableCell>
        <Badge tone={productionPriorityTone[run.priority]}>{run.priority}</Badge>
      </TableCell>

      <TableCell>
        <Badge withDot tone={productionStatusTone[run.status]}>
          {run.status}
        </Badge>
      </TableCell>

      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-0.5">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onView(run)}
            aria-label={`View ${run.id}, ${run.product}`}
            title="View details"
          >
            <Eye />
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onEdit(run)}
            aria-label={`Edit ${run.id}, ${run.product}`}
            title="Edit run"
          >
            <Pencil />
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onDelete(run)}
            aria-label={`Delete ${run.id}, ${run.product}`}
            title="Delete run"
            className="hover:bg-critical-soft hover:text-critical"
          >
            <Trash2 />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
