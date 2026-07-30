"use client";

import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function Navbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-slate-400">
          Operations
        </p>

        <h2 className="text-xl font-semibold text-slate-900">
          Dashboard
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <Input
            placeholder="Search..."
            className="w-72 pl-9"
          />
        </div>

        <button className="rounded-lg border p-2 hover:bg-slate-100">
          <Bell className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-600" />

          <div className="hidden md:block">
            <p className="text-sm font-medium">
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