import { firingSignals } from "./operations";
import type {
  OperationsModel,
  OperationsSignal,
  SignalHorizon,
} from "./operations";
import type { SignalTone } from "@/types/signal";

/*
 * The rescue plan is the signal feed, sequenced.
 *
 * It deliberately derives nothing of its own: every step is a rule that is
 * firing right now against the records in this workspace, which is what keeps
 * the plan, the dashboard feed and the notification count from ever disagreeing.
 * The only things added here are order and horizon — the judgement about what
 * has to be done first.
 *
 * There is nothing to tick off. A step leaves the plan when its rule stops
 * firing, so the plan is cleared by fixing the operation, not by marking it
 * done.
 */

export interface RescueStep extends OperationsSignal {
  /** 1-based position across the whole plan, so a step can be referred to. */
  position: number;
}

export interface RescueStage {
  horizon: SignalHorizon;
  /** Why this horizon exists, stated once above its steps. */
  rationale: string;
  steps: RescueStep[];
}

export interface RescuePlan {
  ready: boolean;
  /** Every firing rule, sequenced. Positive signals are not steps. */
  steps: RescueStep[];
  /** Only the horizons that actually contain work. */
  stages: RescueStage[];
  /** Steps that have to be worked today. */
  urgent: number;
  headline: string;
}

const horizonOrder: SignalHorizon[] = ["Today", "This week", "This month"];

const rationale: Record<SignalHorizon, string> = {
  Today:
    "Something is already stopped or past its date. Each of these has units or a line waiting on it.",
  "This week":
    "Nothing is stopped yet, but a threshold has been crossed and the margin is gone.",
  "This month":
    "Structural exposure. No single record is failing, but the network has a single point of failure.",
};

/* Within a horizon, the more severe rule is worked first. */
const severity: Record<SignalTone, number> = {
  critical: 0,
  caution: 1,
  brand: 2,
  neutral: 3,
  positive: 4,
};

export function buildRescuePlan(model: OperationsModel): RescuePlan {
  /* A plan made of positive signals would be a plan with no work in it. */
  const firing = firingSignals(model);

  const sequenced = [...firing].sort((a, b) => {
    const byHorizon =
      horizonOrder.indexOf(a.horizon) - horizonOrder.indexOf(b.horizon);

    if (byHorizon !== 0) return byHorizon;

    return severity[a.tone] - severity[b.tone];
  });

  const steps: RescueStep[] = sequenced.map((signal, index) => ({
    ...signal,
    position: index + 1,
  }));

  const stages: RescueStage[] = horizonOrder
    .map((horizon) => ({
      horizon,
      rationale: rationale[horizon],
      steps: steps.filter((step) => step.horizon === horizon),
    }))
    .filter((stage) => stage.steps.length > 0);

  const urgent = steps.filter((step) => step.horizon === "Today").length;

  const headline =
    steps.length === 0
      ? "No rule is firing, so there is no plan to work. This page fills itself in the moment one does."
      : urgent > 0
        ? `${urgent} of ${steps.length} ${steps.length === 1 ? "step" : "steps"} cannot wait past today.`
        : `${steps.length} ${steps.length === 1 ? "step" : "steps"}, none of them urgent. Working them this week keeps the floor clear.`;

  return {
    ready: model.ready,
    steps,
    stages,
    urgent,
    headline,
  };
}
