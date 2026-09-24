"use client";

import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  ChartColumn,
  ClipboardCheck,
  Factory,
  Sparkles,
  Truck,
  type LucideIcon,
} from "lucide-react";

import { SectionCard } from "@/components/common/section-card";

interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

/* Every destination here is a route that exists. A shortcut that goes nowhere
   is worse than no shortcut. */
const actions: QuickAction[] = [
  {
    title: "Inventory",
    description: "Stock levels, reorder signals and warehouse coverage.",
    href: "/inventory",
    icon: Boxes,
  },
  {
    title: "Suppliers",
    description: "Sourcing, approvals and spend to date.",
    href: "/suppliers",
    icon: Truck,
  },
  {
    title: "Production",
    description: "Runs in progress and line output.",
    href: "/production",
    icon: Factory,
  },
  {
    title: "Analytics",
    /* Not "trends": the page says in its own subtitle that nothing on it is
       forecast, and every reading there is a cross-cut of the records as they
       stand today. A shortcut promising trends would send readers looking for a
       time series that does not exist. */
    description: "Cross-cuts of stock, spend and output as they stand.",
    href: "/analytics",
    icon: ChartColumn,
  },
  {
    title: "AI Copilot",
    description: "Ask questions about the records in this workspace.",
    href: "/ai",
    icon: Sparkles,
  },
  {
    title: "Rescue plan",
    description: "Turn firing signals into an ordered set of steps.",
    href: "/rescue-plan",
    icon: ClipboardCheck,
  },
];

export function QuickActions() {
  return (
    <SectionCard
      flush
      title="Jump to"
      description="The six places work usually starts."
    >
      <ul className="grid sm:grid-cols-2">
        {actions.map((action, index) => {
          const Icon = action.icon;

          return (
            <li
              key={action.href}
              className={
                /* A single hairline grid: no gaps, no cards inside cards. */
                index % 2 === 0
                  ? "border-b border-line last:border-b-0 sm:border-r sm:[&:nth-last-child(-n+2)]:border-b-0"
                  : "border-b border-line last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0"
              }
            >
              <Link
                href={action.href}
                className="group flex items-start gap-3 px-5 py-4 transition-colors hover:bg-panel-sunken focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand"
              >
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border border-line bg-panel-sunken transition-colors group-hover:border-line-strong">
                  <Icon aria-hidden="true" className="size-4 text-ink-soft" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 text-sm font-medium text-ink">
                    {action.title}

                    <ArrowRight
                      aria-hidden="true"
                      className="size-3.5 text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:text-brand"
                    />
                  </span>

                  <span className="mt-0.5 block text-xs leading-relaxed text-ink-soft">
                    {action.description}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </SectionCard>
  );
}
