"use client";

import { Bell, Search, Sparkles } from "lucide-react";

import { Input } from "@/components/ui/input";

export function Navbar() {
  return (
    <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-8">
      {/* Left */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Operations
        </p>

        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          Dashboard
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          AI-Powered Supply Chain Command Center
        </p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <Input
            placeholder="Search anything..."
            className="w-80 rounded-xl pl-10"
          />
        </div>

        <div className="hidden items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 lg:flex">
          <Sparkles className="h-4 w-4 text-emerald-600" />

          <span className="text-sm font-medium text-emerald-700">
            AI Online
          </span>
        </div>

        <button className="rounded-xl border border-slate-200 p-2.5 transition-colors hover:bg-slate-100">
          <Bell className="h-5 w-5 text-slate-700" />
        </button>

        <div className="flex items-center gap-3 rounded-xl px-2 py-1">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
            S
          </div>

          <div className="hidden xl:block">
            <p className="text-sm font-semibold text-slate-900">
              Swaraj
            </p>

            <p className="text-xs text-slate-500">
              Operations Manager
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}