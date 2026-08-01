import {
  ArrowRight,
  Brain,
  ClipboardCheck,
  Package,
  Truck,
} from "lucide-react";

import { SectionCard } from "@/components/shared/section-card";

const actions = [
  {
    title: "Generate Rescue Plan",
    description: "Create an AI-powered recovery strategy.",
    icon: ClipboardCheck,
    color: "bg-blue-100 text-blue-600",
  },
  {
    title: "Open AI Copilot",
    description: "Analyze operational risks instantly.",
    icon: Brain,
    color: "bg-violet-100 text-violet-600",
  },
  {
    title: "Review Inventory",
    description: "Inspect warehouse stock levels.",
    icon: Package,
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    title: "Supplier Overview",
    description: "Review supplier performance.",
    icon: Truck,
    color: "bg-amber-100 text-amber-600",
  },
];

export function QuickActions() {
  return (
    <SectionCard
      title="Quick Actions"
      description="Frequently used operational tasks."
    >
      <div className="grid gap-4">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.title}
              className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${action.color}`}
                >
                  <Icon className="h-6 w-6" />
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900">
                    {action.title}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {action.description}
                  </p>
                </div>
              </div>

              <ArrowRight className="h-5 w-5 text-slate-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-blue-600" />
            </button>
          );
        })}
      </div>
    </SectionCard>
  );
}