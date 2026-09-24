"use client";

import { Wallet } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { Rail } from "@/components/common/rail";
import { SectionCard } from "@/components/common/section-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnalyticsModel } from "@/lib/analytics";
import { formatInrCompact, formatNumber, formatShare } from "@/lib/format";

interface SpendMixProps {
  model: AnalyticsModel;
}

/*
 * Spend by supplier category. Four values do not earn a chart library — a rail
 * per row against a shared baseline is more precise than a pie, and it reuses
 * the same rail the KPI cards and warehouse panel already use, so a reader
 * learns one visual grammar instead of three.
 *
 * Every rail is drawn in the brand tone. There is no rule about category
 * concentration: the 40% threshold this page used to colour against measures a
 * single *supplier*, and buying most of your steel from the steel category is
 * not a risk — it is what a category is. Colouring it amber would have invented
 * a warning the settings page does not list.
 */
export function SpendMix({ model }: SpendMixProps) {
  return (
    <SectionCard
      flush
      title="Spend by category"
      description="Where the recorded spend sits, as a share of the whole book."
    >
      {!model.ready ? (
        <div className="space-y-5 p-5">
          {[0, 1, 2, 3].map((index) => (
            <div key={index}>
              <Skeleton className="h-3.5 w-1/3" />
              <Skeleton className="mt-2.5 h-[3px] w-full" />
            </div>
          ))}
        </div>
      ) : model.categories.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No spend recorded"
          description="Add a supplier with a spend figure and its category appears here with its share of the book."
        />
      ) : (
        <ul>
          {model.categories.map((entry) => (
            <li
              key={entry.category}
              className="border-b border-line px-5 py-4 last:border-0"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <p className="text-sm font-medium text-ink">{entry.category}</p>

                <p className="figure text-sm text-ink">
                  {formatInrCompact(entry.spend)}
                </p>
              </div>

              <Rail
                className="mt-3"
                value={entry.share}
                tone="brand"
                label={`${entry.category} share of recorded spend`}
              />

              <p className="mt-2.5 text-xs text-ink-faint">
                {formatShare(entry.share)} of the book ·{" "}
                {formatNumber(entry.suppliers)}{" "}
                {entry.suppliers === 1 ? "supplier" : "suppliers"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
