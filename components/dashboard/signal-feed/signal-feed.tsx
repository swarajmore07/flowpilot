"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { SectionCard } from "@/components/common/section-card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/format";
import {
  firingSignals,
  type OperationsModel,
  type OperationsSignal,
} from "@/lib/operations";
import { cn } from "@/lib/utils";

interface SignalFeedProps {
  model: OperationsModel;
}

/* A single hairline in the signal tone, set against the row's left edge. The
   colour is the only decoration on the row, and it maps to a real severity. */
const edgeTone: Record<OperationsSignal["tone"], string> = {
  neutral: "bg-ink-faint",
  positive: "bg-positive",
  caution: "bg-caution",
  critical: "bg-critical",
  brand: "bg-brand",
};

function SignalRow({ signal }: { signal: OperationsSignal }) {
  return (
    <li className="relative border-b border-line last:border-0">
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-y-0 left-0 w-[2px]",
          edgeTone[signal.tone]
        )}
      />

      <div className="pl-5 pr-4 py-4">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <p className="min-w-0 text-sm font-medium text-ink">{signal.title}</p>

          <Badge withDot tone={signal.tone}>
            {signal.basis}
          </Badge>
        </div>

        <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-ink-soft">
          {signal.detail}
        </p>

        <Link
          href={signal.href}
          className="group mt-2.5 inline-flex items-center gap-1.5 text-xs font-medium text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          {signal.actionLabel}
          <ArrowRight
            aria-hidden="true"
            className="size-3 transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      </div>
    </li>
  );
}

/*
 * Signals, not alerts: each row names the rule that fired and links to the page
 * where it can be cleared. Nothing here is scheduled or predicted — a row exists
 * only while the records still satisfy its rule.
 */
export function SignalFeed({ model }: SignalFeedProps) {
  /* The count in the badge is work outstanding, so the all-clear row is not in
     it — but the list below still shows every signal, including that row. */
  const firing = firingSignals(model);

  return (
    <SectionCard
      flush
      title="Signals"
      description="Rules currently firing against the records in this workspace."
      action={
        model.ready ? (
          <Badge tone={firing.length > 0 ? "caution" : "positive"}>
            {firing.length > 0
              ? `${formatNumber(firing.length)} firing`
              : "All clear"}
          </Badge>
        ) : undefined
      }
    >
      {model.ready ? (
        <ul>
          {model.signals.map((signal) => (
            <SignalRow key={signal.id} signal={signal} />
          ))}
        </ul>
      ) : (
        <div className="space-y-4 p-5">
          {[0, 1, 2].map((index) => (
            <div key={index}>
              <Skeleton className="h-3.5 w-2/3" />
              <Skeleton className="mt-2 h-3 w-full" />
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
