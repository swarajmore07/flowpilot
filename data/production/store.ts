import { createCollectionStore } from "@/lib/collection-store";
import { isIsoDate } from "@/lib/date";
import { createIdSequence } from "@/lib/id-sequence";

import {
  productionLines,
  productionPriorities,
  productionRuns,
  productionStatuses,
} from "./production";
import type { ProductionRun } from "./types";

export const PRODUCTION_STORAGE_KEY = "flowpilot-production";

/* Applied to every record read back from localStorage. Anything the user can
   edit by hand is untrusted input, so nothing reaches the ProductionRun type
   without passing this first. */
function isProductionRun(value: unknown): value is ProductionRun {
  if (typeof value !== "object" || value === null) return false;

  const record = value as Record<string, unknown>;

  if (
    typeof record.id !== "string" ||
    record.id.trim().length === 0 ||
    typeof record.product !== "string" ||
    record.product.trim().length === 0 ||
    typeof record.line !== "string" ||
    typeof record.dueDate !== "string" ||
    !isIsoDate(record.dueDate) ||
    typeof record.targetUnits !== "number" ||
    !Number.isFinite(record.targetUnits) ||
    typeof record.completedUnits !== "number" ||
    !Number.isFinite(record.completedUnits) ||
    typeof record.priority !== "string" ||
    !(productionPriorities as string[]).includes(record.priority) ||
    typeof record.status !== "string" ||
    !(productionStatuses as string[]).includes(record.status)
  ) {
    return false;
  }

  /* The line is free text in the type but a fixed list in the UI. A stored run
     naming a line the app no longer offers would be invisible behind the line
     filter, so it is rejected rather than left stranded. */
  if (!productionLines.includes(record.line)) return false;

  /* Completing more units than the run committed to is not a rounding error,
     it is a corrupt record — every progress figure downstream divides by the
     target and would report over 100%. */
  return (
    record.targetUnits > 0 &&
    record.completedUnits >= 0 &&
    record.completedUnits <= record.targetUnits
  );
}

const runIds = createIdSequence({
  prefix: "RUN",
  storageKey: "flowpilot-production-sequence",
});

export const productionStore = createCollectionStore<ProductionRun>(
  PRODUCTION_STORAGE_KEY,
  productionRuns,
  isProductionRun,
  { beforeWrite: runIds.observe, afterReset: runIds.clear }
);

/**
 * The next run ID, reserved.
 *
 * Deleting RUN-1003 does not free that number for reuse: the sequence keeps its
 * own high-water mark in storage, so an ID stays a permanent reference to the one
 * record that held it.
 */
export function generateRunId(current: ProductionRun[]): string {
  return runIds.next(current);
}
