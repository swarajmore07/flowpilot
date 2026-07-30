"use client";

import { quickActions } from "@/data/dashboard/actions";
import { ArrowRight } from "lucide-react";

export function QuickActions() {
  return (
    <section className="mt-8">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-slate-900">
          Quick Actions
        </h2>

        <p className="text-sm text-slate-500">
          Frequently used operational tasks.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {quickActions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.title}
              className="group rounded-2xl border border-slate-200 bg-white p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
            >
              <Icon className="h-7 w-7 text-blue-600" />

              <h3 className="mt-6 font-semibold text-slate-900">
                {action.title}
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                {action.description}
              </p>

              <div className="mt-6 flex items-center gap-2 text-blue-600 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="text-sm font-medium">
                  Open
                </span>

                <ArrowRight className="h-4 w-4" />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}