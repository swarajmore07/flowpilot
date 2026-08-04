import { AppLayout } from "@/components/layout/app-layout";
import { InventoryOverview } from "@/components/inventory/inventory-overview";

export default function InventoryPage() {
  return (
    <AppLayout>
      <InventoryOverview />
    </AppLayout>
  );
}