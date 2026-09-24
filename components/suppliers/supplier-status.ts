import type { SupplierStatus } from "@/data/suppliers/types";
import type { SignalTone } from "@/types/signal";

/*
 * One mapping from supplier status to signal tone, shared by the table, the
 * details sheet and the KPI row — so a "Pending" supplier is amber everywhere.
 */
export const supplierStatusTone: Record<SupplierStatus, SignalTone> = {
  Active: "positive",
  Pending: "caution",
  Inactive: "neutral",
};
