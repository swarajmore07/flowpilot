"use client";
import type { NavigationGroup } from "@/types/navigation";
import { SidebarItem } from "./sidebar-item";

interface SidebarGroupProps {
  group: NavigationGroup;
}

export function SidebarGroup({ group }: SidebarGroupProps) {
  return (
    <div className="space-y-3">
      <h3 className="px-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {group.group}
      </h3>

      <div className="space-y-2">
        {group.items.map((item) => (
          <SidebarItem key={item.href} item={item} />
        ))}
      </div>
    </div>
  );
}