import {
  Factory,
  Package,
  Truck,
  CircleCheck,
} from "lucide-react";

import { SectionCard } from "@/components/shared/section-card";

const healthData = [
  {
    title: "Production",
    status: "Excellent",
    value: 98,
    icon: Factory,
    color: "text-emerald-600",
    bg: "bg-emerald-100",
  },
  {
    title: "Suppliers",
    status: "Stable",
    value: 91,
    icon: Truck,
    color: "text-amber-600",
    bg: "bg-amber-100",
  },
  {
    title: "Inventory",
    status: "Healthy",
    value: 84,
    icon: Package,
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
];

export function SupplyHealth() {
  const overall = Math.round(
    healthData.reduce((sum, item) => sum + item.value, 0) /
      healthData.length
  );

  return (
    <SectionCard
      title="Supply Health Overview"
      description="Real-time operational health across your supply network."
    >
      <div className="space-y-5">
        {healthData.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="flex items-center justify-between rounded-xl border border-slate-200 p-4 transition-colors hover:bg-slate-50"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.bg}`}
                >
                  <Icon className={`h-5 w-5 ${item.color}`} />
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900">
                    {item.title}
                  </h4>

                  <p className="text-sm text-slate-500">
                    {item.status}
                  </p>
                </div>
              </div>

              <span className="text-xl font-bold text-slate-900">
                {item.value}%
              </span>
            </div>
          );
        })}

        <div className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CircleCheck className="h-5 w-5 text-emerald-600" />

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Overall Network Health
                </p>

                <p className="text-sm text-slate-500">
                  All critical systems operational
                </p>
              </div>
            </div>

            <span className="text-3xl font-bold text-emerald-600">
              {overall}%
            </span>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}