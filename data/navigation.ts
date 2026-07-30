"use client";

import type { NavigationGroup } from "@/types/navigation";

import {
  ChartColumn,
  ClipboardCheck,
  Factory,
  LayoutDashboard,
  Package,
  Settings,
  Sparkles,
  Truck,
} from "lucide-react";

export const navigation: NavigationGroup[] = [
  {
    group: "Operations",
    items: [
      {
        title: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
      },
      {
        title: "Inventory",
        href: "/inventory",
        icon: Package,
      },
      {
        title: "Suppliers",
        href: "/suppliers",
        icon: Truck,
      },
      {
        title: "Production",
        href: "/production",
        icon: Factory,
      },
    ],
  },
  {
    group: "Intelligence",
    items: [
      {
        title: "Analytics",
        href: "/analytics",
        icon: ChartColumn,
      },
      {
        title: "AI Copilot",
        href: "/ai",
        icon: Sparkles,
      },
    ],
  },
  {
    group: "Execution",
    items: [
      {
        title: "Rescue Plan",
        href: "/rescue-plan",
        icon: ClipboardCheck,
      },
    ],
  },
  {
    group: "System",
    items: [
      {
        title: "Settings",
        href: "/settings",
        icon: Settings,
      },
    ],
  },
];