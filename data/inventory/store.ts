import { createCollectionStore } from "@/lib/collection-store";
import { createIdSequence } from "@/lib/id-sequence";

import {
  inventoryCategories,
  inventoryProducts,
  inventoryStatuses,
  inventoryWarehouses,
} from "./inventory";
import type { InventoryProduct } from "./types";

/* Unchanged from the first implementation: existing browsers already have data
   under this key, and renaming it would silently orphan it. */
export const INVENTORY_STORAGE_KEY = "flowpilot-inventory-products";

/* Warehouse and category are free text in the type but fixed lists in the filter
   bar, so a stored record naming anything else would be a row no filter can
   reach — visible in the unfiltered table, missing from every narrowed view.
   Stock is checked for sign as well as type: a negative count would read as
   below the reorder floor and put a purchase order on the plan for a line that
   does not exist. */
function isInventoryProduct(value: unknown): value is InventoryProduct {
  if (typeof value !== "object" || value === null) return false;

  const record = value as Record<string, unknown>;

  return (
    typeof record.id === "string" &&
    record.id.trim().length > 0 &&
    typeof record.name === "string" &&
    record.name.trim().length > 0 &&
    typeof record.sku === "string" &&
    typeof record.warehouse === "string" &&
    (inventoryWarehouses as readonly string[]).includes(record.warehouse) &&
    typeof record.category === "string" &&
    (inventoryCategories as readonly string[]).includes(record.category) &&
    typeof record.stock === "number" &&
    Number.isFinite(record.stock) &&
    record.stock >= 0 &&
    typeof record.status === "string" &&
    (inventoryStatuses as string[]).includes(record.status)
  );
}

const productIds = createIdSequence({
  prefix: "INV",
  storageKey: "flowpilot-inventory-sequence",
});

export const inventoryStore = createCollectionStore<InventoryProduct>(
  INVENTORY_STORAGE_KEY,
  inventoryProducts,
  isInventoryProduct,
  { beforeWrite: productIds.observe, afterReset: productIds.clear }
);

/**
 * The next product ID, reserved.
 *
 * Deleting the highest INV number does not free it for reuse: the sequence keeps
 * its own high-water mark in storage, so an ID stays a permanent reference to the
 * one record that held it.
 */
export function generateProductId(current: InventoryProduct[]): string {
  return productIds.next(current);
}
