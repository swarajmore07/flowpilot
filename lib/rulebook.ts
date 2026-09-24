import {
  REORDER_FLOOR,
  REORDER_WATCH,
} from "@/components/inventory/inventory-status";
import { DUE_SOON_DAYS } from "@/components/production/production-status";

import {
  SPEND_CONCENTRATION_LIMIT,
  WAREHOUSE_CONCENTRATION_LIMIT,
} from "./operations";

/*
 * The thresholds every signal in the app is measured against.
 *
 * They live here rather than in the page that displays them because two pages
 * display them — the rescue plan, where they justify each step, and settings,
 * where they are the answer to "why is this line flagged". Values are read from
 * the constants the rules actually use, so this list cannot drift from the
 * behaviour it describes.
 *
 * These are constants, not preferences. Nothing here is editable at runtime, and
 * presenting them as a form would be a lie about what the app can do.
 */
export interface Rule {
  rule: string;
  value: string;
  reading: string;
}

export const rulebook: Rule[] = [
  {
    rule: "Reorder floor",
    value: `${REORDER_FLOOR} units`,
    reading: "Below this, a stock line is treated as able to stall a line.",
  },
  {
    rule: "Watch level",
    value: `${REORDER_WATCH} units`,
    reading:
      "Below this, a stock line needs reordering before it hits the floor.",
  },
  {
    rule: "Schedule window",
    value: `${DUE_SOON_DAYS} days`,
    reading: "A run due inside this window is called out before its date lands.",
  },
  {
    rule: "Spend concentration",
    value: `${SPEND_CONCENTRATION_LIMIT}%`,
    reading:
      "Above this share of total spend, one supplier is a single point of failure.",
  },
  {
    rule: "Warehouse concentration",
    value: `${WAREHOUSE_CONCENTRATION_LIMIT}%`,
    reading:
      "Above this share of units on hand, one warehouse is a single point of failure.",
  },
];
