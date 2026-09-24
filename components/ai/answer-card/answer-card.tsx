import type { SignalTone } from "@/types/signal";

import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import type { CopilotAnswer } from "@/lib/copilot";
import { cn } from "@/lib/utils";

/* The marker beside each reading. Colour is the state, not decoration. */
const markerTone: Record<SignalTone, string> = {
  critical: "bg-critical",
  caution: "bg-caution",
  positive: "bg-positive",
  brand: "bg-brand",
  neutral: "bg-line-strong",
};

interface AnswerCardProps {
  question: string;
  answer: CopilotAnswer;
}

/*
 * One question and its reading.
 *
 * Every card carries the rule that produced it and a link to the page where the
 * numbers live, so an answer can always be checked rather than trusted. When no
 * rule matches, the same card shape is used to say so and to list what can be
 * asked instead — a miss is an answer, not an error.
 */
export function AnswerCard({ question, answer }: AnswerCardProps) {
  return (
    <article className="overflow-hidden rounded-lg border border-line bg-panel">
      <header className="flex flex-col gap-3 border-b border-line bg-panel-sunken/60 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="label-micro">You asked</p>

          <p className="mt-1.5 font-display text-[0.9375rem] leading-snug font-semibold text-ink">
            {question}
          </p>
        </div>

        <Badge tone={answer.unmatched ? "caution" : "brand"} withDot>
          {answer.unmatched ? "No reading" : answer.intent}
        </Badge>
      </header>

      <div className="p-5">
        <p className="animate-rise max-w-prose text-[0.9375rem] leading-relaxed text-balance text-ink">
          {answer.headline}
        </p>

        {answer.facts.length > 0 && (
          <dl className="mt-5 grid gap-px overflow-hidden rounded-md border border-line bg-line">
            {answer.facts.map((fact) => (
              <div
                key={fact.label}
                className="flex flex-col gap-1 bg-panel px-4 py-3 sm:flex-row sm:items-baseline sm:gap-4"
              >
                <dt className="flex min-w-0 items-center gap-2 sm:w-52 sm:shrink-0">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "size-1.5 shrink-0 rounded-full",
                      markerTone[fact.tone ?? "neutral"]
                    )}
                  />

                  <span className="truncate text-sm text-ink-soft">
                    {fact.label}
                  </span>
                </dt>

                <dd className="min-w-0">
                  <span className="figure text-sm font-medium text-ink">
                    {fact.value}
                  </span>

                  {fact.detail && (
                    <span className="mt-0.5 block text-xs leading-relaxed text-ink-faint">
                      {fact.detail}
                    </span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        )}

        <footer className="mt-5 flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-prose text-xs leading-relaxed text-ink-faint">
            <span className="label-micro mr-1.5">Computed from</span>
            {answer.basis}
          </p>

          {answer.action && (
            <ButtonLink
              href={answer.action.href}
              variant="outline"
              size="sm"
              className="shrink-0"
            >
              {answer.action.label}
            </ButtonLink>
          )}
        </footer>
      </div>
    </article>
  );
}
