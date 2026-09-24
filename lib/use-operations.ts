"use client";

import { useMemo } from "react";

import { inventoryStore } from "@/data/inventory/store";
import { productionStore } from "@/data/production/store";
import { supplierStore } from "@/data/suppliers/store";

import { buildAnalytics, type AnalyticsModel } from "./analytics";
import { useStoredCollection } from "./collection-store";
import {
  buildOperationsModel,
  type OperationsInput,
  type OperationsModel,
} from "./operations";
import { buildRescuePlan, type RescuePlan } from "./rescue";
import { useToday } from "./use-today";

/**
 * The three stores and the calendar day, gathered once.
 *
 * Every page that reasons about the operation as a whole — the dashboard, the
 * notification tray, the rescue plan, the copilot, analytics — needs exactly
 * this. Assembling it in five places is five chances for one of them to forget
 * a store and quietly report a smaller network than the others.
 *
 * `ready` is false until all three stores have read from localStorage *and* the
 * browser has reported its date, because a schedule reading taken before then
 * would be a guess.
 *
 * Memoised on the four values it gathers rather than returned fresh. Each store
 * hands back the same array identity until something is written to it, so this
 * object changes only when the records do — which is what lets everything built
 * from it memoise on the object instead of re-deriving on every keystroke in a
 * search box three components away. (The React Compiler is not enabled on this
 * project, so nothing here is memoised for us.)
 */
export function useOperationsInput(): OperationsInput {
  const { items: products, ready: productsReady } =
    useStoredCollection(inventoryStore);
  const { items: suppliers, ready: suppliersReady } =
    useStoredCollection(supplierStore);
  const { items: runs, ready: runsReady } = useStoredCollection(productionStore);

  const today = useToday();

  const ready = productsReady && suppliersReady && runsReady && today !== null;

  return useMemo(
    () => ({ products, suppliers, runs, today, ready }),
    [products, suppliers, runs, today, ready]
  );
}

/** The whole workspace, derived. */
export function useOperations(): OperationsModel {
  const input = useOperationsInput();

  return useMemo(() => buildOperationsModel(input), [input]);
}

/**
 * Every derived reading, from one pass over the stores.
 *
 * Analytics and the rescue plan are both built from the same records the
 * dashboard model is built from, and three pages need all three at once. Each of
 * them used to assemble the chain by hand, which meant three places that had to
 * remember that the plan is built from the model and not from the input.
 */
export interface Workspace {
  operations: OperationsModel;
  analytics: AnalyticsModel;
  plan: RescuePlan;
}

export function useWorkspace(): Workspace {
  const input = useOperationsInput();

  const operations = useMemo(() => buildOperationsModel(input), [input]);
  const analytics = useMemo(() => buildAnalytics(input), [input]);

  /* Keyed on the model, not the input: the plan is a reading of the derived
     signals, and deriving it from the input again would be a second, separate
     answer to the same question. */
  const plan = useMemo(() => buildRescuePlan(operations), [operations]);

  return useMemo(
    () => ({ operations, analytics, plan }),
    [operations, analytics, plan]
  );
}
