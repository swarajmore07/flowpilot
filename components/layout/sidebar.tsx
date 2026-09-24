"use client";

import { useMemo } from "react";

import { navigation } from "@/data/navigation";
import { localTimeZoneLabel } from "@/lib/date";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";

import { LogoMark } from "./logo-mark";
import { SidebarGroup } from "./sidebar-group";

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function Sidebar({ className, onNavigate }: SidebarProps) {
  /*
   * The footer reports two browser facts, so both wait for the browser.
   *
   * It used to read "AI engine online" over a pulsing green dot, which the
   * Copilot page then spent a card contradicting — nothing here calls a model.
   * A status light that reports something the product does not do is worse than
   * no status light: it is the one part of the shell a reader would check when
   * something looks wrong.
   */
  const hydrated = useHydrated();

  const timeZone = useMemo(
    () => (hydrated ? localTimeZoneLabel() : ""),
    [hydrated]
  );

  return (
    <aside
      className={cn(
        "flex h-full w-64 shrink-0 flex-col border-r border-line bg-panel",
        className
      )}
    >
      {/* Wordmark — height matches the navbar so the two rules align. */}
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-line px-4">
        <LogoMark />

        <div className="min-w-0">
          <p className="font-display text-sm leading-none font-semibold tracking-[-0.015em] text-ink">
            FlowPilot AI
          </p>
          <p className="label-micro mt-1">Supply Chain</p>
        </div>
      </div>

      {/* Navigation */}
      <nav
        aria-label="Main navigation"
        className="flex-1 space-y-6 overflow-y-auto px-3 py-5"
      >
        {navigation.map((group) => (
          <SidebarGroup
            key={group.group}
            group={group}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      {/* System status */}
      <div className="shrink-0 border-t border-line px-4 py-3.5">
        <div className="flex items-center gap-2">
          <span className="relative flex size-1.5 shrink-0">
            {/* The pulse is the claim that something is running, so it starts
                when something is: before hydration the dot sits still and
                grey. */}
            {hydrated && (
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-positive opacity-60" />
            )}

            <span
              className={cn(
                "relative inline-flex size-1.5 rounded-full",
                hydrated ? "bg-positive" : "bg-ink-faint/40"
              )}
            />
          </span>

          <p className="text-xs font-medium text-ink-soft">
            {hydrated ? "Running locally" : "Starting up"}
          </p>
        </div>

        <p className="identifier mt-2 text-[0.6875rem] text-ink-faint">
          {timeZone ? `v1.0.0 · ${timeZone}` : "v1.0.0"}
        </p>
      </div>
    </aside>
  );
}
