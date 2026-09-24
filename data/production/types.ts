export type ProductionStatus =
  | "Scheduled"
  | "In Progress"
  | "Blocked"
  | "Completed";

export type ProductionPriority = "Low" | "Normal" | "High";

export interface ProductionRun {
  id: string;
  /** What is being built — matches an inventory product name where one exists. */
  product: string;
  line: string;
  /** Units the run is committed to deliver. */
  targetUnits: number;
  /** Units accepted off the line so far. Never exceeds the target. */
  completedUnits: number;
  /** Calendar day the run is due, as `YYYY-MM-DD`. */
  dueDate: string;
  priority: ProductionPriority;
  status: ProductionStatus;
}
