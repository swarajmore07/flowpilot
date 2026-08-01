import {
  Building2,
  TrendingUp,
} from "lucide-react";

import { SectionCard } from "@/components/shared/section-card";
import { supplierPerformance } from "@/data/dashboard/dashboard";

export function SupplierPerformance() {
  return (
    <SectionCard
      title="Supplier Performance"
      description="Top suppliers ranked by delivery reliability."
    >
      <div className="space-y-4">
        {supplierPerformance.map((supplier) => (
          <div
            key={supplier.supplier}
            className="rounded-xl border border-slate-200 p-4 transition-all hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900">
                    {supplier.supplier}
                  </h3>

                  <p className="text-sm text-slate-500">
                    {supplier.deliveries} Deliveries
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xl font-bold text-slate-900">
                  {supplier.score}%
                </p>

                <div className="mt-1 flex items-center justify-end gap-1 text-sm text-emerald-600">
                  <TrendingUp className="h-4 w-4" />
                  {supplier.status}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}