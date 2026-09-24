"use client";

import { Truck } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { Rail } from "@/components/common/rail";
import { SectionCard } from "@/components/common/section-card";
import { ButtonLink } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatInrCompact, formatPercent } from "@/lib/format";
import {
  SPEND_CONCENTRATION_LIMIT,
  type OperationsModel,
} from "@/lib/operations";

interface SpendConcentrationProps {
  model: OperationsModel;
}

/*
 * Spend by supplier, ranked. The rail is measured against total recorded spend
 * and carries a tick at the concentration limit, so a supplier the business
 * cannot easily replace shows up as a bar crossing the line.
 */
export function SpendConcentration({ model }: SpendConcentrationProps) {
  return (
    <SectionCard
      flush
      title="Spend concentration"
      description={`Recorded spend by supplier. The tick marks ${SPEND_CONCENTRATION_LIMIT}% of the total.`}
      action={
        <ButtonLink href="/suppliers" variant="outline" size="sm">
          View all
        </ButtonLink>
      }
    >
      {!model.ready ? (
        <div className="space-y-5 p-5">
          {[0, 1, 2, 3].map((index) => (
            <div key={index}>
              <Skeleton className="h-3.5 w-2/5" />
              <Skeleton className="mt-2.5 h-[3px] w-full" />
            </div>
          ))}
        </div>
      ) : model.topSuppliers.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="No suppliers recorded"
          description="Add a supplier with its spend to date and its share of procurement appears here."
          action={
            <ButtonLink href="/suppliers" variant="default" size="sm">
              Add a supplier
            </ButtonLink>
          }
        />
      ) : (
        <ul>
          {model.topSuppliers.map((supplier) => (
            <li
              key={supplier.id}
              className="border-b border-line px-5 py-4 last:border-0"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <p className="min-w-0 truncate text-sm font-medium text-ink">
                  {supplier.name}
                </p>

                <p className="figure text-sm text-ink">
                  {formatInrCompact(supplier.spend)}
                </p>
              </div>

              <Rail
                className="mt-3"
                value={supplier.share}
                target={SPEND_CONCENTRATION_LIMIT}
                tone={supplier.tone}
                label={`${supplier.name} share of recorded spend`}
              />

              <p className="mt-2.5 text-xs text-ink-faint">
                {formatPercent(supplier.spend, model.totals.spend)} of spend ·{" "}
                {supplier.category}
              </p>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
