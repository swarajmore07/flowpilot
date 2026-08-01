import {
  Brain,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

import { SectionCard } from "@/components/shared/section-card";
import { aiForecast } from "@/data/dashboard/dashboard";

export function AIForecast() {
  return (
    <SectionCard
      title="AI Forecast"
      description="Predictive operational intelligence."
    >
      <div className="space-y-6">
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center gap-3">
            <Brain className="h-8 w-8" />

            <div>
              <p className="text-sm opacity-90">
                AI Confidence
              </p>

              <h2 className="text-4xl font-bold">
                {aiForecast.confidence}%
              </h2>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />

            <h3 className="font-semibold text-slate-900">
              Prediction
            </h3>
          </div>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            {aiForecast.prediction}
          </p>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />

            <h3 className="font-semibold text-emerald-700">
              Risk Level: {aiForecast.risk}
            </h3>
          </div>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            {aiForecast.recommendation}
          </p>
        </div>
      </div>
    </SectionCard>
  );
}