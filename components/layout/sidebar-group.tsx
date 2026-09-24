"use client";

import type { NavigationGroup } from "@/types/navigation";
import { SidebarItem } from "./sidebar-item";

interface SidebarGroupProps {
  group: NavigationGroup;
  onNavigate?: () => void;
}

export function SidebarGroup({ group, onNavigate }: SidebarGroupProps) {
  return (
    <div>
      <h3 className="label-micro px-4 pb-2">{group.group}</h3>

      <div className="space-y-0.5">
        {group.items.map((item) => (
          <SidebarItem key={item.href} item={item} onNavigate={onNavigate} />
        ))}
      </div>
    </div>
  );
}
