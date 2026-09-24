import type {
  ProductionPriority,
  ProductionRun,
  ProductionStatus,
} from "./types";

export const productionData = {
  overview: {
    title: "Production",
    description:
      "Work in progress across every line, with the runs that need a decision today surfaced first.",
  },
};

/* The single source of truth for the option lists: the form writes only these
   values, so the filters can offer exactly the same set. */
export const productionLines = [
  "Assembly Line 1",
  "Assembly Line 2",
  "Winding Line",
  "Hydraulics Cell",
];

export const productionStatuses: ProductionStatus[] = [
  "Scheduled",
  "In Progress",
  "Blocked",
  "Completed",
];

export const productionPriorities: ProductionPriority[] = [
  "Low",
  "Normal",
  "High",
];

/*
 * Seed runs, used until the workspace has its own. The due dates are fixed
 * calendar days rather than offsets from today, so the same record reads the
 * same way on every machine — which does mean the older runs read as overdue
 * once this seed has been sitting a while. That is the honest behaviour: a run
 * with a past due date and unfinished units *is* late.
 */
export const productionRuns: ProductionRun[] = [
  {
    id: "RUN-1001",
    product: "Servo Motor",
    line: "Assembly Line 1",
    targetUnits: 400,
    completedUnits: 265,
    dueDate: "2026-08-28",
    priority: "High",
    status: "In Progress",
  },
  {
    id: "RUN-1002",
    product: "PCB Board",
    line: "Assembly Line 2",
    targetUnits: 1200,
    completedUnits: 0,
    dueDate: "2026-09-04",
    priority: "Normal",
    status: "Scheduled",
  },
  {
    id: "RUN-1003",
    product: "Hydraulic Pump",
    line: "Hydraulics Cell",
    targetUnits: 150,
    completedUnits: 42,
    dueDate: "2026-08-21",
    priority: "High",
    status: "Blocked",
  },
  {
    id: "RUN-1004",
    product: "Copper Coil",
    line: "Winding Line",
    targetUnits: 800,
    completedUnits: 800,
    dueDate: "2026-08-19",
    priority: "Normal",
    status: "Completed",
  },
  {
    id: "RUN-1005",
    product: "Bearing Set",
    line: "Assembly Line 1",
    targetUnits: 600,
    completedUnits: 310,
    dueDate: "2026-09-11",
    priority: "Low",
    status: "In Progress",
  },
  {
    id: "RUN-1006",
    product: "PCB Board",
    line: "Assembly Line 2",
    targetUnits: 450,
    completedUnits: 0,
    dueDate: "2026-08-26",
    priority: "High",
    status: "Blocked",
  },
];
