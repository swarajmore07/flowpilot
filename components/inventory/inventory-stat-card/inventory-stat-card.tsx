import type { LucideIcon } from "lucide-react";

interface InventoryStatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  iconColor?: string;
  trend: string;
  trendLabel: string;
  status: string;
}

export function InventoryStatCard({
  title,
  value,
  icon: Icon,
  iconColor = "text-blue-600",
  trend,
  trendLabel,
  status,
}: InventoryStatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-center justify-between">
        <Icon className={`h-7 w-7 ${iconColor}`} />

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {status}
        </span>
      </div>

      <p className="mt-5 text-sm font-medium uppercase tracking-wide text-slate-500">
        {title}
      </p>

      <h3 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
        {value}
      </h3>

      <div className="mt-8 flex items-center gap-2">
        <span className="font-semibold text-emerald-600">
          {trend}
        </span>

        <span className="text-sm text-slate-500">
          {trendLabel}
        </span>
      </div>
    </div>
  );
}