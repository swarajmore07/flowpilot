import type { Metadata } from "next";

import { SupplierOverview } from "@/components/suppliers/supplier-overview";

export const metadata: Metadata = {
  title: "Suppliers",
  description:
    "The supplier roster: sourcing reach, approvals outstanding and spend to date.",
};

export default function SuppliersPage() {
  return <SupplierOverview />;
}
