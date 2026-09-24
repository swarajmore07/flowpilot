"use client";

import { useRef, useState } from "react";
import { CornerDownLeft, Cpu, Eraser, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { answerQuestion, copilotExamples } from "@/lib/copilot";
import { useWorkspace } from "@/lib/use-operations";

import { AnswerCard } from "../answer-card";

interface AskedQuestion {
  id: number;
  text: string;
}

/* The three things a reader deserves to know before trusting an answer. */
const disclosures = [
  {
    title: "No model is called",
    body: "Nothing here leaves the browser. There is no API key, no request and no external service — the name on the page is the product's, not a claim about this console.",
  },
  {
    title: "Every answer is arithmetic",
    body: "A question is matched to one reading, and that reading is computed from your inventory, supplier and production records. The same question always returns the same answer.",
  },
  {
    title: "A miss is a miss",
    body: "Questions outside the set below are declined rather than approximated. An answer here is either correct or absent.",
  },
];

/*
 * A copilot that shows its working.
 *
 * The transcript stores the questions, not the answers. Every reading is
 * recomputed from the live records on each render, so an answer given five
 * minutes ago cannot still be claiming a shortfall that has since been cleared
 * in another tab — the page can go out of date only by being wrong about now,
 * which it cannot be.
 */
export function CopilotConsole() {
  const { operations, analytics, plan } = useWorkspace();

  const { ready } = operations;

  const [draft, setDraft] = useState("");
  const [asked, setAsked] = useState<AskedQuestion[]>([]);
  const nextId = useRef(1);

  function ask(question: string) {
    const text = question.trim();

    if (text.length === 0) return;

    setAsked((current) => [{ id: nextId.current++, text }, ...current]);
    setDraft("");
  }

  return (
    <>
      <PageHeader
        title="AI Copilot"
        description="Ask about the state of the network. Answers are computed from the records in this workspace, and each one names the reading behind it."
      />

      <section className="overflow-hidden rounded-lg border border-line bg-panel">
        <div className="grid lg:grid-cols-[1.1fr_1fr]">
          <div className="p-6">
            <div className="flex flex-wrap items-center gap-3">
              <p className="label-micro">How this works</p>

              <Badge tone="neutral" withDot>
                Local · deterministic
              </Badge>
            </div>

            <p className="animate-rise mt-4 max-w-xl font-display text-[1.375rem] leading-snug font-semibold text-balance text-ink sm:text-2xl">
              Answers are computed, not generated.
            </p>

            <p className="mt-3 max-w-prose text-sm leading-relaxed text-ink-soft">
              {ready
                ? operations.headline
                : "Reading the workspace records…"}
            </p>

            <p className="mt-3 max-w-prose text-sm leading-relaxed text-ink-soft">
              That sentence is the same one the dashboard shows, from the same
              derived model. This console is a way to query it in words.
            </p>
          </div>

          <div className="grid gap-px bg-line lg:border-l lg:border-line">
            {disclosures.map((item) => (
              <div key={item.title} className="bg-panel-sunken px-6 py-4">
                <div className="flex items-center gap-2">
                  <Cpu className="size-3.5 shrink-0 text-ink-faint" />

                  <p className="text-[0.8125rem] font-semibold text-ink">
                    {item.title}
                  </p>
                </div>

                <p className="mt-1.5 text-xs leading-relaxed text-ink-faint">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionCard
        className="mt-6"
        title="Ask a question"
        description="Plain words are fine. The question is matched against the readings below."
        action={
          asked.length > 0 ? (
            <Button variant="ghost" size="sm" onClick={() => setAsked([])}>
              <Eraser />
              Clear
            </Button>
          ) : undefined
        }
      >
        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            ask(draft);
          }}
        >
          <label className="sr-only" htmlFor="copilot-question">
            Your question
          </label>

          <Input
            id="copilot-question"
            value={draft}
            disabled={!ready}
            placeholder={
              ready
                ? "Is anything behind schedule?"
                : "Loading your records…"
            }
            autoComplete="off"
            onChange={(event) => setDraft(event.target.value)}
          />

          <Button type="submit" disabled={!ready || draft.trim().length === 0}>
            <CornerDownLeft />
            Ask
          </Button>
        </form>

        <div className="mt-4">
          <p className="label-micro">Readings it can answer</p>

          <ul className="mt-2.5 flex flex-wrap gap-2">
            {copilotExamples.map((example) => (
              <li key={example.id}>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!ready}
                  onClick={() => ask(example.question)}
                >
                  <Sparkles className="text-ink-faint" />
                  {example.question}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </SectionCard>

      <div className="mt-6 flex flex-col gap-4">
        {!ready && <Skeleton className="h-40 w-full rounded-lg" />}

        {ready && asked.length === 0 && (
          <p className="rounded-lg border border-dashed border-line bg-panel-sunken/50 px-5 py-8 text-center text-sm text-ink-faint">
            Nothing asked yet. Pick a reading above, or type a question in your
            own words.
          </p>
        )}

        {ready &&
          asked.map((question) => (
            <AnswerCard
              key={question.id}
              question={question.text}
              answer={answerQuestion(question.text, {
                operations,
                analytics,
                plan,
              })}
            />
          ))}
      </div>
    </>
  );
}
