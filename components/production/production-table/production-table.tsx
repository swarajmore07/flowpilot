"use client";

import { Factory, SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableEmpty,
  TableFrame,
  TableHead,
  TableHeader,
  TableRow,
  TableSortButton,
} from "@/components/ui/table";
import type { ProductionRun } from "@/data/production/types";

import { ProductionTableRow } from "./production-table-row";

export type ProductionSortColumn = "product" | "progress" | "dueDate";

interface ProductionTableProps {
  runs: ProductionRun[];
  /** Reference day for every schedule reading in the table. */
  today: string;
  sortBy: ProductionSortColumn;
  sortDirection: "asc" | "desc";
  onSort: (column: ProductionSortColumn) => void;
  onView: (run: ProductionRun) => void;
  onEdit: (run: ProductionRun) => void;
  onDelete: (run: ProductionRun) => void;
  /** True when a search term or filter is narrowing the list. */
  isFiltered: boolean;
  onClearFilters: () => void;
  onAddRun: () => void;
}

const COLUMN_COUNT = 8;

export function ProductionTable({
  runs,
  today,
  sortBy,
  sortDirection,
  onSort,
  onView,
  onEdit,
  onDelete,
  isFiltered,
  onClearFilters,
  onAddRun,
}: ProductionTableProps) {
  function ariaSort(column: ProductionSortColumn) {
    if (sortBy !== column) return "none" as const;
    return sortDirection === "asc"
      ? ("ascending" as const)
      : ("descending" as const);
  }

  return (
    <TableFrame className="rounded-none border-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead aria-sort={ariaSort("product")}>
              <TableSortButton
                active={sortBy === "product"}
                direction={sortDirection}
                onClick={() => onSort("product")}
              >
                Run
              </TableSortButton>
            </TableHead>

            <TableHead>Line</TableHead>

            <TableHead aria-sort={ariaSort("progress")}>
              <TableSortButton
                active={sortBy === "progress"}
                direction={sortDirection}
                onClick={() => onSort("progress")}
              >
                Progress
              </TableSortButton>
            </TableHead>

            <TableHead numeric>Units</TableHead>

            <TableHead aria-sort={ariaSort("dueDate")}>
              <TableSortButton
                active={sortBy === "dueDate"}
                direction={sortDirection}
                onClick={() => onSort("dueDate")}
              >
                Schedule
              </TableSortButton>
            </TableHead>

            <TableHead>Priority</TableHead>

            <TableHead>Status</TableHead>

            <TableHead className="text-right">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {runs.length > 0 ? (
            runs.map((run) => (
              <ProductionTableRow
                key={run.id}
                run={run}
                today={today}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          ) : isFiltered ? (
            <TableEmpty
              colSpan={COLUMN_COUNT}
              icon={<SearchX className="size-4" />}
              title="No runs match this view"
              description="Widen the search term or clear the filters to see every run on the floor."
              action={
                <Button variant="outline" size="sm" onClick={onClearFilters}>
                  Clear search and filters
                </Button>
              }
            />
          ) : (
            <TableEmpty
              colSpan={COLUMN_COUNT}
              icon={<Factory className="size-4" />}
              title="No production runs yet"
              description="Schedule your first run to start tracking output, due dates and line load."
              action={
                <Button size="sm" onClick={onAddRun}>
                  Schedule run
                </Button>
              }
            />
          )}
        </TableBody>
      </Table>
    </TableFrame>
  );
}
