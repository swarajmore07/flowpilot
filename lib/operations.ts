import {
  isBelowFloor,
  isUnderWatch,
  needsReorder,
  REORDER_FLOOR,
  REORDER_WATCH,
} from "@/components/inventory/inventory-status";
import {
  DUE_SOON_DAYS,
  getScheduleSignal,
  remainingUnits,
} from "@/components/production/production-status";
import type { InventoryProduct } from "@/data/inventory/types";
import type { ProductionRun } from "@/data/production/types";
import type { Supplier } from "@/data/suppliers/types";
import type { SignalTone } from "@/types/signal";

import { formatInrCompact, formatNumber, formatPercent } from "./format";

/*
 * The dashboard's arithmetic, in one place.
 *
 * Every figure the command centre shows is computed here from the records the
 * user actually holds — there are no forecasts, no confidence scores and no
 * invented history. Each signal carries the rule that produced it, so a reader
 * can check the reasoning instead of trusting a number.
 */

/** Share of recorded spend above which a single supplier counts as a risk. */
export const SPEND_CONCENTRATION_LIMIT = 40;

/*
 * Share of units above which one warehouse counts as a single point of failure.
 *
 * A separate rule from spend concentration, and separate on purpose even though
 * the two currently sit at the same number. One is about who the money goes to,
 * the other about where the goods physically are; a change to either should not
 * quietly move the other.
 */
export const WAREHOUSE_CONCENTRATION_LIMIT = 40;

/** When a firing rule has to be dealt with. Also sequences the rescue plan. */
export type SignalHorizon = "Today" | "This week" | "This month";

export interface OperationsSignal {
  id: string;
  tone: SignalTone;
  title: string;
  detail: string;
  /** The rule that fired, stated plainly. */
  basis: string;
  /** The imperative step that clears this signal. */
  action: string;
  horizon: SignalHorizon;
  href: string;
  actionLabel: string;
}

export interface WarehouseCoverage {
  warehouse: string;
  lines: number;
  units: number;
  atRisk: number;
  /** Units held here as a share of all units, 0–100. */
  share: number;
  tone: SignalTone;
}

export interface SupplierSpendShare {
  id: string;
  name: string;
  category: string;
  spend: number;
  /** Spend with this supplier as a share of all spend, 0–100. */
  share: number;
  tone: SignalTone;
}

export interface LineLoad {
  line: string;
  runs: number;
  /** Units still to build on this line across every open run. */
  openUnits: number;
  late: number;
  /** This line's open units as a share of the floor's total, 0–100. */
  share: number;
  tone: SignalTone;
}

export interface OperationsInput {
  products: InventoryProduct[];
  suppliers: Supplier[];
  runs: ProductionRun[];
  /** Today as `YYYY-MM-DD`, or null before the browser has reported it. */
  today: string | null;
  /** True once every store has read from localStorage and the day is known. */
  ready: boolean;
}

export interface OperationsModel {
  /** True once every store has read and the calendar day is known. */
  ready: boolean;

  totals: {
    lines: number;
    units: number;
    lowStock: number;
    critical: number;
    atRisk: number;

    suppliers: number;
    activeSuppliers: number;
    pendingSuppliers: number;
    spend: number;

    runs: number;
    openRuns: number;
    lateRuns: number;
    blockedRuns: number;
    dueSoonRuns: number;
    openUnits: number;
    builtUnits: number;
    targetUnits: number;
  };

  risk: { tone: SignalTone; label: string; detail: string };
  headline: string;
  signals: OperationsSignal[];
  warehouses: WarehouseCoverage[];
  topSuppliers: SupplierSpendShare[];
  lines: LineLoad[];
}

/* Severity order, so the feed leads with what can stop a line today. */
const severity: Record<SignalTone, number> = {
  critical: 0,
  caution: 1,
  brand: 2,
  neutral: 3,
  positive: 4,
};

/**
 * The signals that represent work, in the order the model produced them.
 *
 * A positive signal is a statement that nothing is wrong — it belongs in the
 * feed, but it must never be counted as something to do. Three places needed
 * that distinction (the notification bell, the dashboard feed and the rescue
 * plan) and each had written the same `tone !== "positive"` filter by hand. One
 * of them mishandling a tone added later would have had the chrome and the page
 * disagree about how much is on fire.
 */
export function firingSignals(model: OperationsModel): OperationsSignal[] {
  return model.signals.filter((signal) => signal.tone !== "positive");
}

function share(value: number, total: number) {
  if (total <= 0) return 0;
  return (value / total) * 100;
}

export function buildOperationsModel({
  products,
  suppliers,
  runs,
  today,
  ready,
}: OperationsInput): OperationsModel {
  /* ---------------------------------------------------------- inventory -- */

  const units = products.reduce((sum, item) => sum + item.stock, 0);

  /* Classified by stock against the two thresholds, not by the stored status
     label — every `basis` string below names a threshold, so the count has to be
     the one that threshold produces. */
  const criticalLines = products.filter(isBelowFloor);
  const lowLines = products.filter(isUnderWatch);
  const atRisk = criticalLines.length + lowLines.length;

  const byWarehouse = new Map<string, InventoryProduct[]>();
  products.forEach((product) => {
    const existing = byWarehouse.get(product.warehouse);
    if (existing) existing.push(product);
    else byWarehouse.set(product.warehouse, [product]);
  });

  const warehouses: WarehouseCoverage[] = [...byWarehouse.entries()]
    .map(([warehouse, held]) => {
      const warehouseUnits = held.reduce((sum, item) => sum + item.stock, 0);
      const warehouseAtRisk = held.filter(needsReorder).length;

      const tone: SignalTone = held.some(isBelowFloor)
        ? "critical"
        : warehouseAtRisk > 0
          ? "caution"
          : "positive";

      return {
        warehouse,
        lines: held.length,
        units: warehouseUnits,
        atRisk: warehouseAtRisk,
        share: share(warehouseUnits, units),
        tone,
      };
    })
    .sort((a, b) => b.units - a.units);

  /* ---------------------------------------------------------- suppliers -- */

  const activeSuppliers = suppliers.filter(
    (item) => item.status === "Active"
  ).length;
  const pendingSuppliers = suppliers.filter(
    (item) => item.status === "Pending"
  ).length;

  const spend = suppliers.reduce((sum, item) => sum + item.totalSpend, 0);

  const ranked = [...suppliers].sort((a, b) => b.totalSpend - a.totalSpend);

  const topSuppliers: SupplierSpendShare[] = ranked
    .slice(0, 5)
    .map((supplier) => {
      const supplierShare = share(supplier.totalSpend, spend);

      return {
        id: supplier.id,
        name: supplier.name,
        category: supplier.category,
        spend: supplier.totalSpend,
        share: supplierShare,
        /* Compared at the precision the reader is shown. Testing the raw ratio
           would let a 40.4% share fire a rule that the label beside it rounds to
           "40%", which reads as the app arguing with itself. */
        tone:
          Math.round(supplierShare) >= SPEND_CONCENTRATION_LIMIT
            ? ("caution" as SignalTone)
            : ("brand" as SignalTone),
      };
    });

  /* --------------------------------------------------------- production -- */

  const openRuns = runs.filter((run) => run.status !== "Completed");
  const blockedRuns = runs.filter((run) => run.status === "Blocked");

  const targetUnits = runs.reduce((sum, run) => sum + run.targetUnits, 0);
  const builtUnits = runs.reduce((sum, run) => sum + run.completedUnits, 0);
  const openUnits = openRuns.reduce((sum, run) => sum + remainingUnits(run), 0);

  /* Lateness is a fact about today, so it can only be read once the browser has
     reported the day. Until then no run is claimed to be behind. */
  const lateRuns = today
    ? openRuns.filter((run) => getScheduleSignal(run, today).isLate)
    : [];

  const dueSoonRuns = today
    ? openRuns.filter((run) => {
        const signal = getScheduleSignal(run, today);
        return !signal.isLate && signal.days >= 0 && signal.days <= DUE_SOON_DAYS;
      })
    : [];

  const byLine = new Map<string, ProductionRun[]>();
  openRuns.forEach((run) => {
    const existing = byLine.get(run.line);
    if (existing) existing.push(run);
    else byLine.set(run.line, [run]);
  });

  const lines: LineLoad[] = [...byLine.entries()]
    .map(([line, lineRuns]) => {
      const lineOpenUnits = lineRuns.reduce(
        (sum, run) => sum + remainingUnits(run),
        0
      );

      const lineLate = lineRuns.filter((run) => lateRuns.includes(run)).length;
      const lineBlocked = lineRuns.some((run) => run.status === "Blocked");

      const tone: SignalTone =
        lineLate > 0 || lineBlocked
          ? "critical"
          : lineRuns.some((run) => dueSoonRuns.includes(run))
            ? "caution"
            : "brand";

      return {
        line,
        runs: lineRuns.length,
        openUnits: lineOpenUnits,
        late: lineLate,
        share: share(lineOpenUnits, openUnits),
        tone,
      };
    })
    .sort((a, b) => b.openUnits - a.openUnits);

  /* ------------------------------------------------------------ signals -- */

  const signals: OperationsSignal[] = [];

  criticalLines.forEach((product) => {
    signals.push({
      id: `critical-${product.id}`,
      tone: "critical",
      title: `${product.name} can stall a line`,
      detail: `${formatNumber(product.stock)} units left in ${product.warehouse}, against a ${REORDER_FLOOR}-unit floor.`,
      basis: `Stock is below the ${REORDER_FLOOR}-unit floor`,
      action: `Raise a purchase order for ${product.name} and confirm the lead time with its supplier.`,
      horizon: "Today",
      href: "/inventory",
      actionLabel: "Open inventory",
    });
  });

  if (lowLines.length > 0) {
    const names = lowLines
      .slice(0, 3)
      .map((item) => item.name)
      .join(", ");

    signals.push({
      id: "low-stock",
      tone: "caution",
      title: `${formatNumber(lowLines.length)} ${lowLines.length === 1 ? "line" : "lines"} need reordering this week`,
      detail:
        lowLines.length > 3
          ? `${names} and ${formatNumber(lowLines.length - 3)} more are under the watch level.`
          : `${names} ${lowLines.length === 1 ? "is" : "are"} under the watch level.`,
      basis: `Stock is under the ${REORDER_WATCH}-unit watch level`,
      action: `Reorder ${lowLines.length === 1 ? "this line" : "these lines"} before ${lowLines.length === 1 ? "it drops" : "they drop"} below the ${REORDER_FLOOR}-unit floor.`,
      horizon: "This week",
      href: "/inventory",
      actionLabel: "Open inventory",
    });
  }

  if (pendingSuppliers > 0) {
    signals.push({
      id: "pending-suppliers",
      tone: "caution",
      title: `${formatNumber(pendingSuppliers)} ${pendingSuppliers === 1 ? "supplier is" : "suppliers are"} waiting on approval`,
      detail:
        "Pending suppliers cannot be sourced from, which narrows the options when a line runs short.",
      basis: "Supplier status is Pending",
      action: `Approve or decline ${pendingSuppliers === 1 ? "the pending supplier" : "each pending supplier"} so the sourcing options are real.`,
      horizon: "This week",
      href: "/suppliers",
      actionLabel: "Review suppliers",
    });
  }

  const leader = topSuppliers[0];

  if (leader && Math.round(leader.share) >= SPEND_CONCENTRATION_LIMIT) {
    signals.push({
      id: "spend-concentration",
      tone: "caution",
      title: `${leader.name} holds ${formatPercent(leader.spend, spend)} of recorded spend`,
      detail: `${formatInrCompact(leader.spend)} of ${formatInrCompact(spend)} sits with one supplier. A delay there has no cheap substitute.`,
      basis: `One supplier is above ${SPEND_CONCENTRATION_LIMIT}% of total spend`,
      action: `Qualify a second source in ${leader.category} so ${leader.name} is not the only route.`,
      horizon: "This month",
      href: "/suppliers",
      actionLabel: "Review suppliers",
    });
  }

  const emptyWarehouses = warehouses.filter((item) => item.units === 0);

  emptyWarehouses.forEach((item) => {
    signals.push({
      id: `empty-${item.warehouse}`,
      tone: "caution",
      title: `${item.warehouse} is holding no stock`,
      detail: `${formatNumber(item.lines)} ${item.lines === 1 ? "line is" : "lines are"} recorded there with zero units on hand.`,
      basis: "Warehouse units on hand total zero",
      action: `Restock ${item.warehouse} or move its ${item.lines === 1 ? "line" : "lines"} to a site that holds them.`,
      horizon: "This month",
      href: "/inventory",
      actionLabel: "Open inventory",
    });
  });

  /* One signal per late run: a run past its due date is the most specific,
     most actionable thing on this page, so it is never rolled into a count. */
  lateRuns.forEach((run) => {
    const signal = today ? getScheduleSignal(run, today) : null;

    signals.push({
      id: `late-${run.id}`,
      tone: "critical",
      title: `${run.product} on ${run.line} is ${signal ? signal.label.toLowerCase() : "late"}`,
      detail: `${formatNumber(remainingUnits(run))} of ${formatNumber(run.targetUnits)} units are still open on ${run.id}.`,
      basis: "Due date has passed with units still open",
      action: `Re-cut the due date on ${run.id} or move the remaining ${formatNumber(remainingUnits(run))} units to a line with capacity.`,
      horizon: "Today",
      href: "/production",
      actionLabel: "Open production",
    });
  });

  if (blockedRuns.length > 0) {
    signals.push({
      id: "blocked-runs",
      tone: "critical",
      title: `${formatNumber(blockedRuns.length)} ${blockedRuns.length === 1 ? "run is" : "runs are"} blocked on the floor`,
      detail: `${formatNumber(blockedRuns.reduce((sum, run) => sum + remainingUnits(run), 0))} units cannot move until the blocker clears.`,
      basis: "Run status is Blocked",
      action: `Name the blocker on ${blockedRuns.length === 1 ? "the blocked run" : "each blocked run"} and either clear it or release the line to other work.`,
      horizon: "Today",
      href: "/production",
      actionLabel: "Open production",
    });
  }

  if (dueSoonRuns.length > 0) {
    signals.push({
      id: "due-soon-runs",
      tone: "caution",
      title: `${formatNumber(dueSoonRuns.length)} ${dueSoonRuns.length === 1 ? "run is" : "runs are"} due within ${DUE_SOON_DAYS} days`,
      detail: `${formatNumber(dueSoonRuns.reduce((sum, run) => sum + remainingUnits(run), 0))} units left to build before those dates land.`,
      basis: `Due date is inside the ${DUE_SOON_DAYS}-day window`,
      action: `Confirm the material for ${dueSoonRuns.length === 1 ? "this run" : "these runs"} is on hand before the date lands.`,
      horizon: "This week",
      href: "/production",
      actionLabel: "Open production",
    });
  }

  if (signals.length === 0) {
    signals.push({
      id: "all-clear",
      tone: "positive",
      title: "Nothing needs attention",
      detail: `All ${formatNumber(products.length)} stock ${products.length === 1 ? "line clears" : "lines clear"} the watch level, every supplier is approved and no run is behind.`,
      basis: "No reorder, approval or schedule rule is currently firing",
      action: "Nothing to do. Keep the records current and this stays true.",
      horizon: "This month",
      href: "/inventory",
      actionLabel: "Open inventory",
    });
  }

  signals.sort((a, b) => severity[a.tone] - severity[b.tone]);

  /* --------------------------------------------------------------- risk -- */

  /* Three things can stop work today: a stock line under the floor, a blocked
     run, or a run whose due date has already passed. Any one of them is
     enough to raise the posture — they are not averaged against the good news. */
  const stopWork = criticalLines.length + blockedRuns.length + lateRuns.length;

  /* The posture spells out only the clauses that actually apply, so it never
     reads "0 runs past due" — an absent clause is the absence of the problem. */
  const stopWorkClauses = [
    criticalLines.length > 0 &&
      `${formatNumber(criticalLines.length)} stock ${criticalLines.length === 1 ? "line" : "lines"} below the reorder floor`,
    lateRuns.length > 0 &&
      `${formatNumber(lateRuns.length)} ${lateRuns.length === 1 ? "run" : "runs"} past due`,
    blockedRuns.length > 0 && `${formatNumber(blockedRuns.length)} blocked`,
  ].filter((clause): clause is string => typeof clause === "string");

  const risk: OperationsModel["risk"] =
    stopWork > 0
      ? {
          tone: "critical",
          label: "Elevated",
          detail: `${stopWorkClauses.join(", ")}.`,
        }
      : atRisk > 0 || pendingSuppliers > 0 || dueSoonRuns.length > 0
        ? {
            tone: "caution",
            label: "Watch",
            detail: `${formatNumber(atRisk)} stock ${atRisk === 1 ? "line" : "lines"}, ${formatNumber(pendingSuppliers)} ${pendingSuppliers === 1 ? "supplier" : "suppliers"} and ${formatNumber(dueSoonRuns.length)} ${dueSoonRuns.length === 1 ? "run" : "runs"} need a decision this week.`,
          }
        : {
            tone: "positive",
            label: "Stable",
            detail:
              "No reorder, approval or schedule rule is firing across the network.",
          };

  /* The headline names the largest open question, then sizes the network it
     sits in. It never claims a figure the records do not contain. */
  const headline =
    products.length === 0 && suppliers.length === 0 && runs.length === 0
      ? "Nothing is being tracked yet. Add a stock line, a supplier or a run and this brief fills itself in."
      : lateRuns.length > 0
        ? `${formatNumber(lateRuns.length)} of ${formatNumber(openRuns.length)} open ${openRuns.length === 1 ? "run is" : "runs are"} past due with ${formatNumber(openUnits)} units left to build, against ${formatNumber(atRisk)} stock ${atRisk === 1 ? "line" : "lines"} needing a purchase order.`
        : atRisk > 0
          ? `${formatNumber(atRisk)} of ${formatNumber(products.length)} stock ${products.length === 1 ? "line needs" : "lines need"} a purchase order, against ${formatNumber(openUnits)} units still open on the floor and ${formatInrCompact(spend)} of spend across ${formatNumber(suppliers.length)} suppliers.`
          : `All ${formatNumber(products.length)} stock ${products.length === 1 ? "line is" : "lines are"} above their watch level, with ${formatNumber(openUnits)} units still open on the floor and ${formatInrCompact(spend)} of spend across ${formatNumber(suppliers.length)} suppliers.`;

  return {
    ready,
    totals: {
      lines: products.length,
      units,
      lowStock: lowLines.length,
      critical: criticalLines.length,
      atRisk,

      suppliers: suppliers.length,
      activeSuppliers,
      pendingSuppliers,
      spend,

      runs: runs.length,
      openRuns: openRuns.length,
      lateRuns: lateRuns.length,
      blockedRuns: blockedRuns.length,
      dueSoonRuns: dueSoonRuns.length,
      openUnits,
      builtUnits,
      targetUnits,
    },
    risk,
    headline,
    signals,
    warehouses,
    topSuppliers,
    lines,
  };
}
