import {
  Brain,
  Factory,
  Package,
  ShoppingCart,
  Truck,
} from "lucide-react";

import { SectionCard } from "@/components/shared/section-card";
import { activityTimeline } from "@/data/dashboard/dashboard";

const icons = {
  AI: Brain,
  Supplier: Truck,
  Inventory: Package,
  Production: Factory,
  Operations: ShoppingCart,
};

export function ActivityTimeline() {
  return (
    <SectionCard
      title="Activity Timeline"
      description="Recent operational events across the supply network."
    >
      <div className="space-y-6">
        {activityTimeline.map((activity, index) => {
          const Icon =
            icons[activity.type as keyof typeof icons];

          return (
            <div
              key={index}
              className="flex gap-4"
            >
              <div className="flex flex-col items-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100">
                  <Icon className="h-5 w-5 text-blue-600" />
                </div>

                {index !== activityTimeline.length - 1 && (
                  <div className="mt-2 h-full w-px bg-slate-200" />
                )}
              </div>

              <div className="flex-1 pb-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900">
                    {activity.title}
                  </h3>

                  <span className="text-sm text-slate-400">
                    {activity.time}
                  </span>
                </div>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {activity.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}