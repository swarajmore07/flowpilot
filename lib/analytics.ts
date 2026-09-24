import type { ProductionStatus } from "@/data/production/types";
import type { SupplierCategory } from "@/data/suppliers/types";
import type { SignalTone } from "@/types/signal";

import {
  isBelowFloor,
  isUnderWatch,
} from "@/components/inventory/inventory-status";
import { remainingUnits } from "@/components/production/production-status";

import { formatNumber } from "./format";
import type { OperationsInput } from "./operations";

/*
 * Analytics, without a forecast in sight.
 *
 * Everything here is a different cut of the same records: no trend lines over
 * invented history, no projections, no confidence scores. The one genuinely
 * new reading is coverage — stock on hand set against the units the workspace
 * has already committed to building — which is the question the three modules
 * can only answer together.
 */

export interface CoverageRow {
  product: string;
  /** Units on hand across every warehouse holding this product. */
  stock: number;
  /** Units still to build across every open run for it. */
  required: number;
  runs: number;
  /** Units the commitment is short by, 0 when stock covers it. */
  shortfall: number;
  /** Stock as a share of what is required, capped at 100 for the bar. */
  coverage: number;
  /**
   * Stock divided by what is required — 1 is exactly enough, 2 is twice over.
   * Uncapped, because "2.4× cover" and "12× cover" are different situations.
   */
  multiple: number;
  /** False when no stock line exists for the product a run names. */
  tracked: boolean;
  tone: SignalTone;
}

export interface CategorySpend {
  category: SupplierCategory | string;
  spend: number;
  suppliers: number;
  /** Share of total recorded spend, 0–100. */
  share: number;
}

export interface WarehouseMix {
  warehouse: string;
  /** Line counts, not unit counts — this chart is about exposure, not volume. */
  healthy: number;
  low: number;
  critical: number;
}

export interface LineOutput {
  line: string;
  built: number;
  open: number;
}

export interface StatusSlice {
  status: ProductionStatus;
  runs: number;
  tone: SignalTone;
}

export interface AnalyticsModel {
  ready: boolean;
  headline: string;
  coverage: CoverageRow[];
  /** Products whose open commitment exceeds the stock on hand. */
  shortfalls: number;
  /** Total units the workspace is short across every product. */
  shortfallUnits: number;
  categories: CategorySpend[];
  warehouseMix: WarehouseMix[];
  lineOutput: LineOutput[];
  statusMix: StatusSlice[];
}

const statusTone: Record<ProductionStatus, SignalTone> = {
  Scheduled: "neutral",
  "In Progress": "brand",
  Blocked: "critical",
  Completed: "positive",
};

export function buildAnalytics({
  products,
  suppliers,
  runs,
  ready,
}: OperationsInput): AnalyticsModel {
  /* ----------------------------------------------------------- coverage -- */

  /* Stock is summed per product name rather than per record, because the same
     product can be held in more than one warehouse and a run does not care
     which shelf its units come off. */
  const stockByProduct = new Map<string, number>();
  products.forEach((item) => {
    stockByProduct.set(item.name, (stockByProduct.get(item.name) ?? 0) + item.stock);
  });

  const openRuns = runs.filter((run) => run.status !== "Completed");

  const requiredByProduct = new Map<string, { units: number; runs: number }>();
  openRuns.forEach((run) => {
    const current = requiredByProduct.get(run.product) ?? { units: 0, runs: 0 };

    requiredByProduct.set(run.product, {
      units: current.units + remainingUnits(run),
      runs: current.runs + 1,
    });
  });

  const coverage: CoverageRow[] = [...requiredByProduct.entries()]
    .map(([product, demand]) => {
      const tracked = stockByProduct.has(product);
      const stock = stockByProduct.get(product) ?? 0;
      const shortfall = Math.max(0, demand.units - stock);

      /* A run with nothing left to build is not a demand, so it reads as
         covered rather than dividing by zero. */
      const multiple = demand.units <= 0 ? Infinity : stock / demand.units;

      const tone: SignalTone = !tracked
        ? "critical"
        : shortfall > 0
          ? "critical"
          : /* Exactly enough is not comfortable: one scrapped batch and the run
               is short, so anything under 1.5× cover reads as a watch item. */
            multiple < 1.5
            ? "caution"
            : "positive";

      return {
        product,
        stock,
        required: demand.units,
        runs: demand.runs,
        shortfall,
        coverage: Math.min(100, multiple * 100),
        multiple,
        tracked,
        tone,
      };
    })
    /* Worst coverage first: the shortfalls are the reason to open this page.
       Two fully-covered rows both carry Infinity, and Infinity - Infinity is
       NaN — a comparator that returns NaN makes the sort order depend on the
       engine's partitioning, so the same records could list in a different order
       on a different browser. Compared rather than subtracted, so the infinities
       tie and fall through to the unit tiebreak. */
    .sort((a, b) => {
      if (a.multiple !== b.multiple) return a.multiple < b.multiple ? -1 : 1;

      /* Same cover: the larger commitment is the one worth reading first. */
      if (a.required !== b.required) return b.required - a.required;

      /* Named last, so the order is fully determined by the data. */
      return a.product.localeCompare(b.product);
    });

  const shortfalls = coverage.filter((row) => row.shortfall > 0).length;
  const shortfallUnits = coverage.reduce((sum, row) => sum + row.shortfall, 0);

  /* -------------------------------------------------------------- spend -- */

  const spendByCategory = new Map<string, { spend: number; suppliers: number }>();
  suppliers.forEach((supplier) => {
    const current = spendByCategory.get(supplier.category) ?? {
      spend: 0,
      suppliers: 0,
    };

    spendByCategory.set(supplier.category, {
      spend: current.spend + supplier.totalSpend,
      suppliers: current.suppliers + 1,
    });
  });

  const totalSpend = suppliers.reduce((sum, item) => sum + item.totalSpend, 0);

  const categories: CategorySpend[] = [...spendByCategory.entries()]
    .map(([category, entry]) => ({
      category,
      spend: entry.spend,
      suppliers: entry.suppliers,
      share: totalSpend <= 0 ? 0 : (entry.spend / totalSpend) * 100,
    }))
    .sort((a, b) => b.spend - a.spend);

  /* ---------------------------------------------------------- warehouse -- */

  const mix = new Map<string, WarehouseMix>();
  products.forEach((item) => {
    const current =
      mix.get(item.warehouse) ??
      ({ warehouse: item.warehouse, healthy: 0, low: 0, critical: 0 } satisfies WarehouseMix);

    /* Bucketed by stock against the reorder thresholds rather than by the stored
       status label, so this chart counts the same lines the reorder signal flags
       on /inventory. */
    const bucket = isBelowFloor(item)
      ? "critical"
      : isUnderWatch(item)
        ? "low"
        : "healthy";

    current[bucket] += 1;
    mix.set(item.warehouse, current);
  });

  const warehouseMix = [...mix.values()].sort(
    (a, b) =>
      b.critical + b.low - (a.critical + a.low) ||
      a.warehouse.localeCompare(b.warehouse)
  );

  /* --------------------------------------------------------- production -- */

  const output = new Map<string, LineOutput>();
  runs.forEach((run) => {
    const current =
      output.get(run.line) ?? ({ line: run.line, built: 0, open: 0 } satisfies LineOutput);

    /* Delivered counts every run, including finished ones — that is the point of
       the reading. Still owed counts only open runs: a run marked Completed at
       310 of 600 owes nothing, whatever the arithmetic says, and counting its
       remainder here would put a number on this chart that the dashboard's
       "units still to build" contradicts. */
    current.built += run.completedUnits;

    if (run.status !== "Completed") {
      current.open += remainingUnits(run);
    }

    output.set(run.line, current);
  });

  const lineOutput = [...output.values()].sort(
    (a, b) => b.built + b.open - (a.built + a.open)
  );

  const statusCounts = new Map<ProductionStatus, number>();
  runs.forEach((run) => {
    statusCounts.set(run.status, (statusCounts.get(run.status) ?? 0) + 1);
  });

  const statusMix: StatusSlice[] = (
    ["In Progress", "Scheduled", "Blocked", "Completed"] as ProductionStatus[]
  )
    .map((status) => ({
      status,
      runs: statusCounts.get(status) ?? 0,
      tone: statusTone[status],
    }))
    .filter((slice) => slice.runs > 0);

  /* ----------------------------------------------------------- headline -- */

  const headline =
    products.length === 0 && runs.length === 0
      ? "There is nothing to analyse yet. Add a stock line and a production run and every reading below fills itself in."
      : coverage.length === 0
        ? `No open production commitments, so nothing is drawing on the ${formatNumber(products.length)} stock ${products.length === 1 ? "line" : "lines"} held here.`
        : shortfalls > 0
          ? `${formatNumber(shortfalls)} of ${formatNumber(coverage.length)} committed ${coverage.length === 1 ? "product" : "products"} cannot be built from stock on hand — ${formatNumber(shortfallUnits)} units short.`
          : `Stock on hand covers all ${formatNumber(coverage.length)} committed ${coverage.length === 1 ? "product" : "products"}, with ${formatNumber(coverage.length)} ${coverage.length === 1 ? "line" : "lines"} drawing on it.`;

  return {
    ready,
    headline,
    coverage,
    shortfalls,
    shortfallUnits,
    categories,
    warehouseMix,
    lineOutput,
    statusMix,
  };
}
