"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import type { NavigationItem } from "@/types/navigation";

interface SidebarItemProps {
  item: NavigationItem;
  onNavigate?: () => void;
}

export function SidebarItem({ item, onNavigate }: SidebarItemProps) {
  const pathname = usePathname();

  /*
   * "/" only matches exactly; every other route also matches its children,
   * so /inventory stays lit on /inventory/anything.
   */
  const isActive =
    item.href === "/"
      ? pathname === "/"
      : pathname === item.href || pathname.startsWith(`${item.href}/`);

  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      onClick={onNavigate}
      className={cn(
        "group relative flex h-9 items-center gap-2.5 rounded-md pr-2.5 pl-4 text-sm transition-colors duration-100",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
        isActive
          ? "bg-brand-soft font-medium text-brand"
          : "text-ink-soft hover:bg-panel-sunken hover:text-ink"
      )}
    >
      {/* Active rail — a single 2px mark instead of a filled pill. */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute top-1/2 left-0 h-4 w-[2px] -translate-y-1/2 rounded-full transition-colors",
          isActive ? "bg-brand" : "bg-transparent"
        )}
      />

      <Icon
        className={cn(
          "size-4 shrink-0 transition-colors",
          isActive ? "text-brand" : "text-ink-faint group-hover:text-ink-soft"
        )}
      />

      <span className="truncate">{item.title}</span>
    </Link>
  );
}
