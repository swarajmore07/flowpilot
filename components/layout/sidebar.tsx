"use client";
import { navigation } from "@/data/navigation";
import { SidebarGroup } from "./sidebar-group";

export function Sidebar() {
  return (
    <aside className="flex h-screen w-72 flex-col border-r border-slate-200 bg-white">
      {/* Logo */}
      <div className="border-b border-slate-200 px-6 py-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          FlowPilot AI
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          AI-Powered Supply Chain
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-8 overflow-y-auto px-4 py-6">
        {navigation.map((group) => (
          <SidebarGroup key={group.group} group={group} />
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-200 p-4">
        <div className="rounded-lg bg-green-50 p-3">
          <p className="text-sm font-medium text-green-700">
            ● System Healthy
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Version 1.0.0
          </p>
        </div>
      </div>
    </aside>
  );
}