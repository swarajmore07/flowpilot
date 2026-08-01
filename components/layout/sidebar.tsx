"use client";

import { BriefcaseBusiness } from "lucide-react";

import { navigation } from "@/data/navigation";
import { SidebarGroup } from "./sidebar-group";

export function Sidebar() {
  return (
    <aside className="flex h-full w-80 shrink-0 flex-col border-r border-slate-200 bg-white shadow-sm">
      {/* Logo */}
      <div className="flex h-24 items-center border-b border-slate-200 px-7">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 shadow-sm">
          <BriefcaseBusiness className="h-6 w-6 text-white" />
        </div>

        <div className="ml-4">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            FlowPilot AI
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Supply Chain Command
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <div className="space-y-8">
          {navigation.map((group) => (
            <SidebarGroup key={group.group} group={group} />
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-200 p-4">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

            <span className="text-sm font-semibold text-emerald-700">
              System Healthy
            </span>
          </div>

          <p className="mt-2 text-sm text-slate-600">
            AI Engine Online
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Version 1.0.0
          </p>
        </div>
      </div>
    </aside>
  );
}