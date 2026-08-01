"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import type { NavigationItem } from "@/types/navigation";

interface SidebarItemProps {
  item: NavigationItem;
}

export function SidebarItem({ item }: SidebarItemProps) {
  const pathname = usePathname();

  const isActive = pathname === item.href;

  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300",
        isActive
          ? "bg-blue-600 text-white shadow-md"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
          isActive
            ? "bg-white/15"
            : "bg-slate-100 group-hover:bg-white"
        )}
      >
        <Icon className="h-5 w-5" />
      </div>

      <span className="flex-1">{item.title}</span>
    </Link>
  );
}