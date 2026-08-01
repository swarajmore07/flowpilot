import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
} from "lucide-react";

import { SectionCard } from "@/components/shared/section-card";

const alerts = [
  {
    title: "Supplier Delay",
    severity: "High",
    description:
      "Pacific Components shipment delayed by 18 hours.",
    recommendation: "Switch to alternate supplier.",
    icon: AlertTriangle,
    color: "text-red-600",
    bg: "bg-red-100",
    badge: "bg-red-50 text-red-700",
  },
  {
    title: "Inventory Warning",
    severity: "Medium",
    description:
      "Servo Motors inventory has reached the reorder threshold.",
    recommendation: "Create purchase request.",
    icon: Clock3,
    color: "text-amber-600",
    bg: "bg-amber-100",
    badge: "bg-amber-50 text-amber-700",
  },
  {
    title: "Production Stable",
    severity: "Normal",
    description:
      "Assembly Line B is operating within expected efficiency.",
    recommendation: "Continue monitoring.",
    icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-emerald-100",
    badge: "bg-emerald-50 text-emerald-700",
  },
];

export function AlertsPanel() {
  return (
    <SectionCard
      title="Critical Alerts"
      description="Operational events requiring attention."
    >
      <div className="space-y-4">
        {alerts.map((alert) => {
          const Icon = alert.icon;

          return (
            <div
              key={alert.title}
              className="rounded-2xl border border-slate-200 p-5 transition-all duration-300 hover:border-blue-200 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${alert.bg}`}
                  >
                    <Icon className={`h-6 w-6 ${alert.color}`} />
                  </div>

                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-semibold text-slate-900">
                        {alert.title}
                      </h3>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${alert.badge}`}
                      >
                        {alert.severity}
                      </span>
                    </div>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {alert.description}
                    </p>

                    <div className="mt-4 flex items-center gap-2 text-sm font-medium text-blue-600">
                      <span>{alert.recommendation}</span>

                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}