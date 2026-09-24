import type { InventoryProduct, InventoryStatus } from "@/data/inventory/types";
import type { SignalTone } from "@/types/signal";

/* One mapping, used by the table, the sheet and the KPI rails — so a status can
   never mean "healthy" in one place and "warning" in another. */
export const inventoryStatusTone: Record<InventoryStatus, SignalTone> = {
  "In Stock": "positive",
  "Low Stock": "caution",
  Critical: "critical",
};

/*
 * Reorder thresholds.
 *
 * These are the only numbers behind the reorder signal, and they are stated in
 * the UI copy rather than hidden behind a confidence score — a reader can check
 * the arithmetic themselves.
 */
export const REORDER_FLOOR = 20;
export const REORDER_WATCH = 80;

export interface ReorderSignal {
  tone: SignalTone;
  label: string;
  detail: string;
  /** How full the rail reads, measured against the watch level. */
  fill: number;
}

export function getReorderSignal(product: InventoryProduct): ReorderSignal {
  const fill = Math.min(
    100,
    Math.round((product.stock / REORDER_WATCH) * 100)
  );

  if (product.stock < REORDER_FLOOR) {
    return {
      tone: "critical",
      label: "Reorder now",
      detail: `${product.stock} units is below the ${REORDER_FLOOR}-unit floor for this line. Raise a purchase order today.`,
      fill,
    };
  }

  if (product.stock < REORDER_WATCH) {
    return {
      tone: "caution",
      label: "Reorder soon",
      detail: `${product.stock} units sits under the ${REORDER_WATCH}-unit watch level. Plan a purchase order this week.`,
      fill,
    };
  }

  return {
    tone: "positive",
    label: "Stock is healthy",
    detail: `${product.stock} units clears the ${REORDER_WATCH}-unit watch level. No action needed.`,
    fill,
  };
}

/*
 * The reorder state as arithmetic, for anything that needs to count lines rather
 * than describe one.
 *
 * The stored `status` field is not used for this. A record can carry any status
 * the person editing it chose, so counting statuses would let the dashboard say
 * "1 line below the floor" while this module's own reorder signal flags two.
 * Both now read the same two constants, so they cannot disagree.
 */
export function isBelowFloor(product: InventoryProduct): boolean {
  return product.stock < REORDER_FLOOR;
}

/** Under the watch level but still above the floor — reorder this week, not today. */
export function isUnderWatch(product: InventoryProduct): boolean {
  return product.stock >= REORDER_FLOOR && product.stock < REORDER_WATCH;
}

/** Either state: the line needs a decision. */
export function needsReorder(product: InventoryProduct): boolean {
  return product.stock < REORDER_WATCH;
}
