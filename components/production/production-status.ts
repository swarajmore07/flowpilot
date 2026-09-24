import type {
  ProductionPriority,
  ProductionRun,
  ProductionStatus,
} from "@/data/production/types";
import { differenceInCalendarDays, formatDay } from "@/lib/date";
import { formatNumber } from "@/lib/format";
import type { SignalTone } from "@/types/signal";

/*
 * One mapping from run state to signal tone, shared by the table, the details
 * sheet and the KPI row — so a blocked run is red everywhere.
 */
export const productionStatusTone: Record<ProductionStatus, SignalTone> = {
  Scheduled: "neutral",
  "In Progress": "brand",
  Blocked: "critical",
  Completed: "positive",
};

/* Only High earns a colour. If every priority were tinted, the tint would stop
   meaning anything. */
export const productionPriorityTone: Record<ProductionPriority, SignalTone> = {
  Low: "neutral",
  Normal: "neutral",
  High: "caution",
};

/** A run inside this many days of its due date is worth watching. */
export const DUE_SOON_DAYS = 3;

export interface ScheduleSignal {
  tone: SignalTone;
  label: string;
  detail: string;
  /** Whole days until the due date. Negative once the date has passed. */
  days: number;
  /** True for an unfinished run whose due date is in the past. */
  isLate: boolean;
}

/** Units still to build. Zero once the run has met its target. */
export function remainingUnits(run: ProductionRun): number {
  return Math.max(0, run.targetUnits - run.completedUnits);
}

/** Completion as a 0–100 share, for the rail and the progress column. */
export function runProgress(run: ProductionRun): number {
  if (run.targetUnits <= 0) return 0;
  return (run.completedUnits / run.targetUnits) * 100;
}

/**
 * How a run stands against its due date, stated as a rule rather than a score.
 *
 * `today` is passed in rather than read from the clock so the reading is a pure
 * function of its inputs — the caller gets the date from `useToday()`, which is
 * the only thing that knows what day it is in the reader's own time zone.
 */
export function getScheduleSignal(
  run: ProductionRun,
  today: string
): ScheduleSignal {
  const days = differenceInCalendarDays(run.dueDate, today) ?? 0;
  const open = remainingUnits(run);

  if (run.status === "Completed") {
    return {
      tone: "positive",
      label: "Delivered",
      detail: `All ${formatNumber(run.targetUnits)} units accepted off the line.`,
      days,
      isLate: false,
    };
  }

  if (days < 0) {
    const late = Math.abs(days);

    return {
      tone: "critical",
      label: late === 1 ? "1 day overdue" : `${late} days overdue`,
      detail: `Due ${formatDay(run.dueDate)}, with ${formatNumber(open)} units still open.`,
      days,
      isLate: true,
    };
  }

  if (days === 0) {
    return {
      tone: "critical",
      label: "Due today",
      detail: `${formatNumber(open)} units must come off the line today.`,
      days,
      isLate: false,
    };
  }

  if (days <= DUE_SOON_DAYS) {
    return {
      tone: "caution",
      label: days === 1 ? "Due tomorrow" : `Due in ${days} days`,
      detail: `${formatNumber(open)} units left, ${days === 1 ? "1 day" : `${days} days`} to build them.`,
      days,
      isLate: false,
    };
  }

  return {
    tone: "neutral",
    label: `Due in ${days} days`,
    detail: `${formatNumber(open)} units left, due ${formatDay(run.dueDate)}.`,
    days,
    isLate: false,
  };
}
