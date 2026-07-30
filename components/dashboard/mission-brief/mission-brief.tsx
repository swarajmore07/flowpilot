import { BadgeCheck, Brain, TriangleAlert } from "lucide-react";

import { dashboardData } from "@/data/dashboard/dashboard";

import { StatCard } from "../stat-card/stat-card";

export function MissionBrief() {
  const { missionBrief } = dashboardData;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-100 p-3">
            <Brain className="h-6 w-6 text-blue-600" />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
              AI Mission Brief
            </p>

            <h2 className="text-2xl font-bold text-slate-900">
              {missionBrief.title}
            </h2>
          </div>
        </div>

        <div className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-500">
          Generated {missionBrief.generatedAt}
        </div>
      </div>

      {/* Analysis */}
      <div className="grid gap-8 p-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Current Situation
            </h3>

            <p className="mt-2 text-slate-700">
              {missionBrief.situation}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Business Impact
            </h3>

            <p className="mt-2 text-slate-700">
              {missionBrief.impact}
            </p>
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
            <h3 className="font-semibold text-blue-900">
              AI Recommendation
            </h3>

            <p className="mt-3 text-blue-800">
              {missionBrief.recommendation}
            </p>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <div className="flex items-center gap-3">
            <TriangleAlert className="h-5 w-5 text-amber-500" />

            <div>
              <p className="text-xs uppercase text-slate-500">
                Risk Level
              </p>

              <p className="font-semibold text-slate-900">
                {missionBrief.risk}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <BadgeCheck className="h-5 w-5 text-green-600" />

            <div>
              <p className="text-xs uppercase text-slate-500">
                AI Confidence
              </p>

              <p className="font-semibold text-slate-900">
                {missionBrief.confidence}%
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase text-slate-500">
              Estimated Savings
            </p>

            <h3 className="mt-2 text-3xl font-bold text-emerald-600">
              {missionBrief.savings}
            </h3>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 border-t border-slate-200 p-8 md:grid-cols-3">
        {dashboardData.metrics.map((metric) => (
          <StatCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
            icon={metric.icon}
            iconColor={metric.iconColor}
            trend={metric.trend}
            trendLabel={metric.trendLabel}
            status={metric.status}
          />
        ))}
      </div>
    </section>
  );
}