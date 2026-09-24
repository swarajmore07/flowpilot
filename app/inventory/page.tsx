import type { Metadata } from "next";

import { InventoryOverview } from "@/components/inventory/inventory-overview";

export const metadata: Metadata = {
  title: "Inventory",
  description:
    "Stock lines across every warehouse, with reorder signals and warehouse concentration called out.",
};

export default function InventoryPage() {
  return <InventoryOverview />;
}
