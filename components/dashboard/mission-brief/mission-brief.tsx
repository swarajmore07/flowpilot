import { BadgeCheck, Brain, TriangleAlert } from "lucide-react";

import { dashboardData } from "@/data/dashboard/dashboard";

import { StatCard } from "../stat-card/stat-card";

export function MissionBrief() {
  const { missionBrief } = dashboardData;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-8 py-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">
            <Brain className="h-7 w-7 text-blue-600" />
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-blue-600">
              AI Mission Brief
            </p>

            <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              {missionBrief.title}
            </h2>
          </div>
        </div>

        <div className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-500">
          Generated {missionBrief.generatedAt}
        </div>
      </div>

      {/* Analysis */}
      <div className="grid gap-6 p-6 lg:grid-cols-[2fr_1fr]">
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

          <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
            <h3 className="text-lg font-semibold text-blue-900">
              AI Recommendation
            </h3>

            <p className="mt-3 leading-7 text-blue-800">
              {missionBrief.recommendation}
            </p>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6 rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-7">
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

            <h3 className="mt-2 text-4xl font-bold tracking-tight text-emerald-600">
              {missionBrief.savings}
            </h3>
          </div>
        </div>
      </div>
    </section>
  );
}