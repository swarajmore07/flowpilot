"use client";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import type { ProductionRun } from "@/data/production/types";
import { formatDay } from "@/lib/date";
import { formatNumber } from "@/lib/format";

interface DeleteRunDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  run: ProductionRun | null;
  onConfirm: () => void;
}

export function DeleteRunDialog({
  open,
  onOpenChange,
  run,
  onConfirm,
}: DeleteRunDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete run"
      description="This removes the work order from every list, filter and line total. It cannot be undone."
      confirmLabel="Delete run"
      cancelLabel="Cancel"
      onConfirm={onConfirm}
      detail={
        run ? (
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">
                {run.product}
              </p>

              <p className="mt-0.5 text-xs text-ink-soft">
                {run.line} · {formatNumber(run.completedUnits)} of{" "}
                {formatNumber(run.targetUnits)} units built · due{" "}
                {formatDay(run.dueDate)}
              </p>
            </div>

            <span className="identifier shrink-0 text-ink-soft">{run.id}</span>
          </div>
        ) : undefined
      }
    />
  );
}
