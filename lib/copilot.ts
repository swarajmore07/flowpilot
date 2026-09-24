import type { SignalTone } from "@/types/signal";

import type { AnalyticsModel } from "./analytics";
import { formatInrCompact, formatNumber, formatPercent } from "./format";
import type { OperationsModel } from "./operations";
import type { RescuePlan } from "./rescue";

/*
 * A copilot that does not pretend.
 *
 * There is no language model behind this page and no network call: every answer
 * is assembled from the records in this workspace by one of the rules below, and
 * every answer states which reading produced it. That is a smaller promise than
 * "ask me anything", and it is one the app can actually keep — an answer here is
 * either correct or absent, never plausible.
 *
 * Matching is keyword scoring over a fixed set of intents. A question that
 * matches nothing is told so, rather than being answered vaguely.
 */

export interface CopilotFact {
  label: string;
  value: string;
  detail?: string;
  tone?: SignalTone;
}

export interface CopilotAnswer {
  /** The intent that matched, for the "answered by" line. */
  intent: string;
  headline: string;
  facts: CopilotFact[];
  /** How the answer was computed, stated so it can be checked. */
  basis: string;
  action?: { label: string; href: string };
  /** True when no rule matched and the answer is a list of capabilities. */
  unmatched?: boolean;
}

export interface CopilotContext {
  operations: OperationsModel;
  analytics: AnalyticsModel;
  plan: RescuePlan;
}

interface Intent {
  id: string;
  name: string;
  /** What this intent can answer, shown in the capability list. */
  example: string;
  /**
   * Words that point at this reading and no other.
   *
   * Interrogatives are deliberately absent. "how", "what", "where", "should"
   * and "can" appear in most questions anyone types, so scoring them let a
   * question about suppliers match the warehouse reading on the strength of the
   * word "where" — the matcher was reading grammar instead of subject.
   */
  keywords: string[];
  answer: (context: CopilotContext) => CopilotAnswer;
}

function tone(value: number, warn = 0): SignalTone {
  return value > warn ? "critical" : "positive";
}

/*
 * Ordered narrowest subject first.
 *
 * A tie is broken by position, so "is the stock held in Pune late?" resolves to
 * the schedule reading rather than the stock one. The specific reading is the
 * one a person had in mind when they used a specific word.
 */
const intents: Intent[] = [
  {
    id: "schedule",
    name: "Runs behind schedule",
    example: "Is anything behind schedule?",
    keywords: [
      "late",
      "behind",
      "overdue",
      "schedule",
      "due",
      "delay",
      "delayed",
      "slipping",
      "date",
      "dates",
      "deadline",
      "deadlines",
    ],
    answer: ({ operations }) => ({
      intent: "Runs behind schedule",
      headline:
        operations.totals.lateRuns === 0
          ? `No run is past its due date. ${formatNumber(operations.totals.openRuns)} ${operations.totals.openRuns === 1 ? "run is" : "runs are"} still open.`
          : `${formatNumber(operations.totals.lateRuns)} of ${formatNumber(operations.totals.openRuns)} open runs are past their due date.`,
      facts: [
        {
          label: "Past due",
          value: formatNumber(operations.totals.lateRuns),
          detail: "Due date has passed with units still open.",
          tone: tone(operations.totals.lateRuns),
        },
        {
          label: "Blocked",
          value: formatNumber(operations.totals.blockedRuns),
          detail: "Cannot move until the blocker clears.",
          tone: tone(operations.totals.blockedRuns),
        },
        {
          label: "Due soon",
          value: formatNumber(operations.totals.dueSoonRuns),
          detail: "Inside the schedule window, not yet late.",
          tone: operations.totals.dueSoonRuns > 0 ? "caution" : "positive",
        },
        {
          label: "Units still open",
          value: formatNumber(operations.totals.openUnits),
        },
      ],
      basis: "Due dates compared against the browser's own calendar day.",
      action: { label: "Open production", href: "/production" },
    }),
  },

  {
    id: "coverage",
    name: "Build coverage",
    example: "Can we build everything we have committed to?",
    keywords: [
      "build",
      "buildable",
      "coverage",
      "cover",
      "enough",
      "shortfall",
      "shortfalls",
      "short",
      "commit",
      "commitment",
      "commitments",
      "committed",
      "material",
      "materials",
    ],
    answer: ({ analytics }) => ({
      intent: "Build coverage",
      headline: analytics.headline,
      facts:
        analytics.coverage.length === 0
          ? [
              {
                label: "Open commitments",
                value: "0",
                detail: "Nothing is drawing on stock right now.",
              },
            ]
          : analytics.coverage.slice(0, 4).map((row) => ({
              label: row.product,
              value: !row.tracked
                ? "No stock line recorded"
                : row.shortfall > 0
                  ? `${formatNumber(row.shortfall)} units short`
                  : Number.isFinite(row.multiple)
                    ? `${row.multiple.toFixed(1)}× cover`
                    : "Nothing left to build",
              /* An untracked product is a different problem from a shortfall —
                 it is not that the units are missing, it is that no shelf claims
                 to hold them. Reporting it as "N units short" would send someone
                 to reorder against a stock line that does not exist. */
              detail: row.tracked
                ? `${formatNumber(row.stock)} on hand against ${formatNumber(row.required)} committed across ${formatNumber(row.runs)} ${row.runs === 1 ? "run" : "runs"}.`
                : `${formatNumber(row.required)} units committed across ${formatNumber(row.runs)} ${row.runs === 1 ? "run" : "runs"}, with no inventory line to draw them from.`,
              tone: row.tone,
            })),
      basis:
        "Units on hand per product against units still owed on open runs. Lead times are not recorded, so they are not counted.",
      action: { label: "Open analytics", href: "/analytics" },
    }),
  },

  {
    id: "warehouses",
    name: "Where the stock is",
    example: "Which warehouse is holding the most stock?",
    keywords: [
      "warehouse",
      "warehouses",
      "site",
      "sites",
      "location",
      "locations",
      "held",
      "holds",
      "holding",
      "stored",
      "storage",
      "depot",
    ],
    answer: ({ operations }) => ({
      intent: "Where the stock is",
      headline:
        operations.warehouses.length === 0
          ? "No warehouse holds any recorded stock."
          : `${formatNumber(operations.totals.units)} units across ${formatNumber(operations.warehouses.length)} ${operations.warehouses.length === 1 ? "site" : "sites"}, led by ${operations.warehouses[0].warehouse}.`,
      facts: operations.warehouses.slice(0, 4).map((site) => ({
        label: site.warehouse,
        value: `${formatNumber(site.units)} units`,
        detail: `${formatPercent(site.units, operations.totals.units)} of the network · ${formatNumber(site.lines)} ${site.lines === 1 ? "line" : "lines"}, ${formatNumber(site.atRisk)} needing a decision.`,
        tone: site.tone,
      })),
      basis: "Units summed per warehouse from the inventory records.",
      action: { label: "Open inventory", href: "/inventory" },
    }),
  },

  {
    id: "suppliers",
    name: "Supplier exposure",
    example: "Is our supplier spend concentrated anywhere?",
    keywords: [
      "supplier",
      "suppliers",
      "vendor",
      "vendors",
      "spend",
      "spending",
      "buy",
      "buying",
      "sourcing",
      "concentration",
      "concentrated",
      "approval",
      "approvals",
      "pending",
      "cost",
      "costs",
      "money",
    ],
    answer: ({ operations, analytics }) => {
      const leader = operations.topSuppliers[0];

      return {
        intent: "Supplier exposure",
        headline: leader
          ? `${leader.name} holds ${formatPercent(leader.spend, operations.totals.spend)} of ${formatInrCompact(operations.totals.spend)} in recorded spend.`
          : "No supplier spend is recorded yet.",
        facts: [
          {
            label: "Largest supplier",
            value: leader ? leader.name : "—",
            detail: leader
              ? `${formatInrCompact(leader.spend)} in ${leader.category}.`
              : "Add a supplier to see concentration.",
            tone: leader?.tone,
          },
          {
            label: "Largest category",
            value: analytics.categories[0]
              ? analytics.categories[0].category
              : "—",
            detail: analytics.categories[0]
              ? `${formatInrCompact(analytics.categories[0].spend)} across ${formatNumber(analytics.categories[0].suppliers)} ${analytics.categories[0].suppliers === 1 ? "supplier" : "suppliers"}.`
              : undefined,
          },
          {
            label: "Awaiting approval",
            value: formatNumber(operations.totals.pendingSuppliers),
            detail: "Pending suppliers cannot be sourced from.",
            tone:
              operations.totals.pendingSuppliers > 0 ? "caution" : "positive",
          },
        ],
        basis: "Recorded spend per supplier and per category.",
        action: { label: "Review suppliers", href: "/suppliers" },
      };
    },
  },

  {
    id: "floor",
    name: "Line load",
    example: "Which line is carrying the most work?",
    keywords: [
      "line",
      "lines",
      "floor",
      "production",
      "run",
      "runs",
      "capacity",
      "load",
      "loaded",
      "busy",
      "workload",
      "work",
      "carrying",
      "assembly",
      "shift",
    ],
    answer: ({ operations }) => ({
      intent: "Line load",
      headline:
        operations.lines.length === 0
          ? "No line has open work."
          : `${operations.lines[0].line} carries ${formatPercent(operations.lines[0].openUnits, operations.totals.openUnits)} of the ${formatNumber(operations.totals.openUnits)} units still to build.`,
      facts: operations.lines.map((load) => ({
        label: load.line,
        value: `${formatNumber(load.openUnits)} units open`,
        detail: `${formatNumber(load.runs)} ${load.runs === 1 ? "run" : "runs"}${load.late > 0 ? `, ${formatNumber(load.late)} past due` : ", none past due"}.`,
        tone: load.tone,
      })),
      basis:
        "Remaining units grouped by line across every run that is not complete.",
      action: { label: "Open production", href: "/production" },
    }),
  },

  {
    id: "stock",
    name: "Stock at risk",
    example: "Which stock lines need reordering?",
    keywords: [
      "stock",
      "inventory",
      "reorder",
      "reordering",
      "reorders",
      "restock",
      "low",
      "critical",
      "shelf",
      "units",
      "hand",
      "order",
    ],
    answer: ({ operations }) => ({
      intent: "Stock at risk",
      headline:
        operations.totals.atRisk === 0
          ? `All ${formatNumber(operations.totals.lines)} stock lines are above their watch level.`
          : `${formatNumber(operations.totals.atRisk)} of ${formatNumber(operations.totals.lines)} stock lines are below a threshold.`,
      facts: [
        {
          label: "Below the reorder floor",
          value: formatNumber(operations.totals.critical),
          detail: "These can stall a line. Raise a purchase order today.",
          tone: tone(operations.totals.critical),
        },
        {
          label: "Under the watch level",
          value: formatNumber(operations.totals.lowStock),
          detail: "Reorder this week, before they reach the floor.",
          tone: operations.totals.lowStock > 0 ? "caution" : "positive",
        },
        {
          label: "Units on hand",
          value: formatNumber(operations.totals.units),
          detail: `Across ${formatNumber(operations.warehouses.length)} ${operations.warehouses.length === 1 ? "site" : "sites"}.`,
        },
      ],
      basis: "Stock counts against the reorder floor and watch level.",
      action: { label: "Open inventory", href: "/inventory" },
    }),
  },

  {
    id: "priority",
    name: "What to do first",
    example: "What should I do first?",
    keywords: [
      "first",
      "priority",
      "priorities",
      "next",
      "todo",
      "plan",
      "fix",
      "urgent",
      "act",
      "action",
      "attention",
      "start",
    ],
    answer: ({ plan }) => {
      const shown = Math.min(3, plan.steps.length);

      return {
        intent: "What to do first",
        headline:
          plan.steps.length === 0
            ? "Nothing is firing, so there is no step to work."
            : shown === 1
              ? `${plan.headline} That step is below.`
              : `${plan.headline} The first ${formatNumber(shown)} steps are below, in order.`,
        facts: plan.steps.slice(0, 3).map((step) => ({
          label: `Step ${step.position} · ${step.horizon}`,
          value: step.action,
          detail: step.basis,
          tone: step.tone,
        })),
        basis: "The rescue plan, which is the firing rules sequenced by horizon.",
        action: { label: "Open rescue plan", href: "/rescue-plan" },
      };
    },
  },

  {
    id: "posture",
    name: "Network posture",
    example: "How is the network doing right now?",
    keywords: [
      "doing",
      "status",
      "posture",
      "risk",
      "overall",
      "summary",
      "brief",
      "health",
      "everything",
      "generally",
    ],
    answer: ({ operations, plan }) => ({
      intent: "Network posture",
      headline: operations.headline,
      facts: [
        {
          label: "Risk posture",
          value: operations.risk.label,
          detail: operations.risk.detail,
          tone: operations.risk.tone,
        },
        {
          /* The plan already is the firing rules, counted. Recomputing the
             filter here would be a second definition of "firing" that could
             drift from the one /rescue-plan renders. */
          label: "Rules firing",
          value: formatNumber(plan.steps.length),
          detail: "Each one links to the page where it is cleared.",
        },
        {
          label: "Records held",
          value: `${formatNumber(operations.totals.lines)} lines · ${formatNumber(operations.totals.suppliers)} suppliers · ${formatNumber(operations.totals.runs)} runs`,
        },
      ],
      basis:
        "The same derived model the dashboard renders, over all three stores.",
      action: { label: "Open dashboard", href: "/" },
    }),
  },
];

/** Every question this console can answer, for the capability list. */
export const copilotExamples = intents.map((intent) => ({
  id: intent.id,
  name: intent.name,
  question: intent.example,
}));

const WORD = /[a-z]+/g;

function unmatchedAnswer(): CopilotAnswer {
  return {
    intent: "No matching reading",
    headline:
      "There is no rule here that answers that, so nothing will be guessed at.",
    facts: copilotExamples.map((example) => ({
      label: example.name,
      value: example.question,
    })),
    basis:
      "This console matches a question against a fixed set of readings. Anything outside that set is declined rather than approximated.",
    unmatched: true,
  };
}

/**
 * Match a question to one reading and compute it.
 *
 * Scoring is deliberately blunt — a count of matched subject words, with a tie
 * broken by the earlier, narrower intent. A cleverer matcher would be harder to
 * predict, and the point of this page is that the same question always gives the
 * same answer.
 */
export function answerQuestion(
  question: string,
  context: CopilotContext
): CopilotAnswer {
  const words = new Set(question.toLowerCase().match(WORD) ?? []);

  if (words.size === 0) return unmatchedAnswer();

  let best: Intent | null = null;
  let bestScore = 0;

  /* A for-of loop rather than forEach: assigning to `best` from inside a callback
     defeats narrowing, and the cast needed to get it back is worse than the
     loop. */
  for (const intent of intents) {
    const score = intent.keywords.reduce(
      (total, keyword) => (words.has(keyword) ? total + 1 : total),
      0
    );

    if (score > bestScore) {
      best = intent;
      bestScore = score;
    }
  }

  /* One subject word is enough, now that grammar words score nothing. "Late?" is
     a complete question on a factory floor, and refusing it to look rigorous
     would only make the console worse at its one job. */
  if (best === null) return unmatchedAnswer();

  return best.answer(context);
}
