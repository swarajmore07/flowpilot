import { PackageCheck } from "lucide-react";

import { SectionCard } from "@/components/shared/section-card";
import { inventoryHealth } from "@/data/dashboard/dashboard";

export function InventoryHealth() {
  const average = Math.round(
    inventoryHealth.reduce((sum, item) => sum + item.stock, 0) /
      inventoryHealth.length
  );

  return (
    <SectionCard
      title="Inventory Health"
      description="Warehouse stock availability across all locations."
    >
      <div className="space-y-5">
        {inventoryHealth.map((warehouse) => (
          <div key={warehouse.warehouse}>
            <div className="mb-2 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">
                  {warehouse.warehouse}
                </h3>

                <p className="text-sm text-slate-500">
                  {warehouse.status}
                </p>
              </div>

              <span className="font-bold text-slate-900">
                {warehouse.stock}%
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${warehouse.color}`}
                style={{
                  width: `${warehouse.stock}%`,
                }}
              />
            </div>
          </div>
        ))}

        <div className="mt-4 rounded-xl bg-blue-50 p-5">
          <div className="flex items-center gap-3">
            <PackageCheck className="h-6 w-6 text-blue-600" />

            <div>
              <p className="text-sm text-slate-500">
                Overall Inventory Coverage
              </p>

              <h3 className="text-3xl font-bold text-blue-700">
                {average}%
              </h3>
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}