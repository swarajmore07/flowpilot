"use client";

import Link from "next/link";
import { ArrowRight, CircleCheck } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { RulebookList } from "@/components/common/rulebook-list";
import { SectionCard } from "@/components/common/section-card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/format";
import type { RescueStep } from "@/lib/rescue";
import { useWorkspace } from "@/lib/use-operations";

function Step({ step }: { step: RescueStep }) {
  return (
    <li className="grid grid-cols-[auto_1fr] gap-x-4 border-b border-line px-5 py-4 last:border-0">
      {/* The number is the sequence, not decoration — steps are worked in order. */}
      <span
        className={
          step.tone === "critical"
            ? "identifier mt-0.5 flex size-6 items-center justify-center rounded-full border border-critical-line bg-critical-soft text-[0.6875rem] text-critical"
            : "identifier mt-0.5 flex size-6 items-center justify-center rounded-full border border-line bg-panel-sunken text-[0.6875rem] text-ink-soft"
        }
      >
        {step.position}
      </span>

      <div className="min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <p className="min-w-0 text-sm font-medium text-ink">{step.action}</p>

          <Badge withDot tone={step.tone} className="shrink-0">
            {step.horizon}
          </Badge>
        </div>

        <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-ink-soft">
          {step.detail}
        </p>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link
            href={step.href}
            className="group inline-flex items-center gap-1.5 text-xs font-medium text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {step.actionLabel}
            <ArrowRight
              aria-hidden="true"
              className="size-3 transition-transform group-hover:translate-x-0.5"
            />
          </Link>

          <p className="text-xs text-ink-faint">{step.basis}</p>
        </div>
      </div>
    </li>
  );
}

/*
 * A recovery plan assembled from the rules currently firing, sequenced by how
 * long it can be left. Nothing here is generated: each step names the reading
 * that produced it and links to the page where it is cleared, and a step leaves
 * the plan when its rule stops firing rather than when someone marks it done.
 */
export function RescuePlanOverview() {
  const { operations: model, plan } = useWorkspace();

  return (
    <>
      <PageHeader
        title="Rescue plan"
        description="The recovery sequence for everything currently firing, worked from the top down."
      />

      <section className="overflow-hidden rounded-lg border border-line bg-panel">
        <div className="grid lg:grid-cols-[1.6fr_1fr]">
          <div className="p-6">
            {plan.ready ? (
              <>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="label-micro">Recovery sequence</p>

                  <Badge withDot tone={model.risk.tone}>
                    {model.risk.label}
                  </Badge>
                </div>

                <p className="animate-rise mt-4 font-display text-[1.375rem] leading-snug font-semibold text-balance text-ink sm:text-2xl">
                  {plan.headline}
                </p>

                <p className="mt-3 max-w-prose text-sm leading-relaxed text-ink-soft">
                  Steps are ordered by how long they can be left, then by
                  severity. There is nothing to tick off — a step leaves this
                  plan when the records stop satisfying its rule.
                </p>

                <p className="mt-6 text-xs text-ink-faint">
                  Assembled from {formatNumber(model.totals.lines)} stock{" "}
                  {model.totals.lines === 1 ? "line" : "lines"},{" "}
                  {formatNumber(model.totals.suppliers)}{" "}
                  {model.totals.suppliers === 1 ? "supplier" : "suppliers"} and{" "}
                  {formatNumber(model.totals.runs)} production{" "}
                  {model.totals.runs === 1 ? "run" : "runs"}.
                </p>
              </>
            ) : (
              <>
                <Skeleton className="h-2.5 w-32" />
                <Skeleton className="mt-4 h-6 w-full" />
                <Skeleton className="mt-2 h-6 w-3/5" />
                <Skeleton className="mt-6 h-2.5 w-2/3" />
              </>
            )}
          </div>

          {/* The rulebook: the thresholds every step above is measured against.
              Stating them is the point — a plan that will not show its rules is
              just an opinion. Shared with /settings so the two cannot disagree. */}
          <div className="border-t border-line bg-panel-sunken p-6 lg:border-t-0 lg:border-l">
            <p className="label-micro">Thresholds in use</p>

            <RulebookList layout="stack" className="mt-3" />
          </div>
        </div>
      </section>

      {!plan.ready ? (
        <div className="mt-6 space-y-6">
          {[0, 1].map((index) => (
            <div key={index} className="rounded-lg border border-line bg-panel">
              <div className="border-b border-line p-5">
                <Skeleton className="h-3.5 w-40" />
                <Skeleton className="mt-2 h-3 w-2/3" />
              </div>

              <div className="space-y-4 p-5">
                {[0, 1].map((row) => (
                  <div key={row}>
                    <Skeleton className="h-3.5 w-3/4" />
                    <Skeleton className="mt-2 h-3 w-1/2" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : plan.stages.length === 0 ? (
        <div className="mt-6">
          <SectionCard
            flush
            title="Nothing to recover"
            description="No reorder, approval or schedule rule is firing against these records."
          >
            <EmptyState
              icon={CircleCheck}
              title="No steps to work"
              description="This plan writes itself the moment a stock line drops below its watch level, a run passes its due date, or a supplier is left pending. Until then there is nothing to do here."
              action={<ButtonLink href="/">Open dashboard</ButtonLink>}
            />
          </SectionCard>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {plan.stages.map((stage) => (
            <SectionCard
              key={stage.horizon}
              flush
              title={stage.horizon}
              description={stage.rationale}
              action={
                <Badge
                  tone={stage.horizon === "Today" ? "critical" : "neutral"}
                >
                  {formatNumber(stage.steps.length)}{" "}
                  {stage.steps.length === 1 ? "step" : "steps"}
                </Badge>
              }
            >
              {/* Numbered from the step's own position in the whole plan, not
                  from 1 in each stage — otherwise assistive tech announces
                  "item 1 of 3" beside a rendered 4. */}
              <ol start={stage.steps[0].position}>
                {stage.steps.map((step) => (
                  <Step key={step.id} step={step} />
                ))}
              </ol>
            </SectionCard>
          ))}
        </div>
      )}
    </>
  );
}
