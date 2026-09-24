"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Bell } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { firingSignals } from "@/lib/operations";
import { useOperations } from "@/lib/use-operations";

/*
 * The bell reads the same derived signals the dashboard renders, from the same
 * three stores, so the count in the chrome and the count on the page can never
 * disagree. Positive signals are informational and are not counted.
 */
export function NotificationTray() {
  const [open, setOpen] = useState(false);

  const model = useOperations();
  const ready = model.ready;

  const firing = firingSignals(model);

  /* Before hydration the seed data is showing, so the dot would be guessing.
     The tray stays quiet until the stores have actually read. */
  const count = ready ? firing.length : 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="relative"
            aria-label={
              !ready
                ? "Signals"
                : count > 0
                  ? `Signals, ${count} needing attention`
                  : "Signals, none needing attention"
            }
          >
            <Bell />

            {count > 0 && (
              <span
                aria-hidden="true"
                className="absolute top-1 right-1 size-1.5 rounded-full bg-critical ring-2 ring-panel"
              />
            )}
          </Button>
        }
      />

      <PopoverContent className="w-[min(23rem,calc(100vw-2rem))] p-0">
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <p className="text-sm font-semibold text-ink">Signals</p>

          {/* Withheld rather than defaulted. "All clear" before the records have
              been read is a claim the tray cannot support yet — and it is the
              reassuring one, which makes it the worse guess of the two. */}
          {ready && (
            <span className="label-micro">
              {count > 0 ? `${count} firing` : "All clear"}
            </span>
          )}
        </div>

        <div className="max-h-96 divide-y divide-line overflow-y-auto">
          {/* Gated on the same flag as the dot. Ungated, the list rendered
              signals derived from the seed data under a header that had already
              been told to say "All clear" — two contradictory readings of the
              same workspace, in the same popover. */}
          {ready ? (
            model.signals.map((signal) => (
              <div key={signal.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-ink">{signal.title}</p>

                  <Badge withDot tone={signal.tone} className="mt-px shrink-0">
                    {signal.tone === "critical"
                      ? "Critical"
                      : signal.tone === "caution"
                        ? "Watch"
                        : "Clear"}
                  </Badge>
                </div>

                <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                  {signal.detail}
                </p>

                <p className="mt-1.5 text-xs text-ink-faint">{signal.basis}</p>
              </div>
            ))
          ) : (
            <div className="space-y-4 p-4">
              {[0, 1, 2].map((index) => (
                <div key={index}>
                  <Skeleton className="h-3.5 w-2/3" />
                  <Skeleton className="mt-2 h-3 w-full" />
                  <Skeleton className="mt-1.5 h-3 w-1/2" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-line bg-panel-sunken/50 px-4 py-3">
          <Link
            href="/rescue-plan"
            onClick={() => setOpen(false)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Open rescue plan
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
