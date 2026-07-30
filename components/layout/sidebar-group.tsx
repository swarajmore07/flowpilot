"use client";
import type { NavigationGroup } from "@/types/navigation";
import { SidebarItem } from "./sidebar-item";

interface SidebarGroupProps {
  group: NavigationGroup;
}

export function SidebarGroup({ group }: SidebarGroupProps) {
  return (
    <div className="space-y-2">
      <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
        {group.group}
      </h3>

      <div className="space-y-1">
        {group.items.map((item) => (
          <SidebarItem key={item.href} item={item} />
        ))}
      </div>
    </div>
  );
}