import { createCollectionStore } from "@/lib/collection-store";
import { isEmailShaped, isPhoneShaped } from "@/lib/contact";
import { createIdSequence } from "@/lib/id-sequence";

import {
  suppliers,
  supplierCategories,
  supplierLocations,
  supplierStatuses,
} from "./suppliers";
import type { Supplier } from "./types";

export const SUPPLIER_STORAGE_KEY = "flowpilot-suppliers";

/* Applied to every record read back from localStorage. Anything the user can
   edit by hand is untrusted input, so nothing reaches the Supplier type without
   passing this first.

   The three list-backed fields are checked against their lists, not just against
   `string`. The filter bar offers exactly those options, so a record holding
   anything else would be a row no filter can reach: present in the table, absent
   from every narrowed view, and impossible to account for from the UI.

   Names and figures are checked for sense as well as for type. An empty name
   renders an anonymous row, and a negative spend would move the concentration
   rail the wrong way — neither is reachable through the form, so either one means
   the stored copy was written by something other than this app.

   Email and phone are held to the same two rules the form applies, from the same
   module. The details panel renders the address as a mailto: link and the number
   as a tel: link, and an empty one of either is a link that goes nowhere — it
   looks live, and clicking it opens a blank compose window. */
function isSupplier(value: unknown): value is Supplier {
  if (typeof value !== "object" || value === null) return false;

  const record = value as Record<string, unknown>;

  return (
    typeof record.id === "string" &&
    record.id.trim().length > 0 &&
    typeof record.name === "string" &&
    record.name.trim().length > 0 &&
    typeof record.email === "string" &&
    isEmailShaped(record.email) &&
    typeof record.phone === "string" &&
    isPhoneShaped(record.phone) &&
    typeof record.location === "string" &&
    (supplierLocations as readonly string[]).includes(record.location) &&
    typeof record.products === "number" &&
    Number.isFinite(record.products) &&
    record.products >= 0 &&
    typeof record.totalSpend === "number" &&
    Number.isFinite(record.totalSpend) &&
    record.totalSpend >= 0 &&
    typeof record.category === "string" &&
    (supplierCategories as string[]).includes(record.category) &&
    typeof record.status === "string" &&
    (supplierStatuses as string[]).includes(record.status)
  );
}

const supplierIds = createIdSequence({
  prefix: "SUP",
  storageKey: "flowpilot-suppliers-sequence",
});

export const supplierStore = createCollectionStore<Supplier>(
  SUPPLIER_STORAGE_KEY,
  suppliers,
  isSupplier,
  { beforeWrite: supplierIds.observe, afterReset: supplierIds.clear }
);

/**
 * The next supplier ID, reserved.
 *
 * Deleting SUP-1005 does not free that number for reuse: the sequence keeps its
 * own high-water mark in storage, so an ID stays a permanent reference to the one
 * record that held it.
 */
export function generateSupplierId(current: Supplier[]): string {
  return supplierIds.next(current);
}
