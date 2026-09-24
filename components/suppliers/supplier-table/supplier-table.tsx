"use client";

import { SearchX, Truck } from "lucide-react";

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
import type { Supplier } from "@/data/suppliers/types";

import { SupplierTableRow } from "./supplier-table-row";

export type SupplierSortColumn = "name" | "totalSpend";

interface SupplierTableProps {
  suppliers: Supplier[];
  sortBy: SupplierSortColumn;
  sortDirection: "asc" | "desc";
  onSort: (column: SupplierSortColumn) => void;
  onView: (supplier: Supplier) => void;
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
  /** True when a search term or filter is narrowing the list. */
  isFiltered: boolean;
  onClearFilters: () => void;
  onAddSupplier: () => void;
}

const COLUMN_COUNT = 8;

export function SupplierTable({
  suppliers,
  sortBy,
  sortDirection,
  onSort,
  onView,
  onEdit,
  onDelete,
  isFiltered,
  onClearFilters,
  onAddSupplier,
}: SupplierTableProps) {
  function ariaSort(column: SupplierSortColumn) {
    if (sortBy !== column) return "none" as const;
    return sortDirection === "asc" ? ("ascending" as const) : ("descending" as const);
  }

  return (
    <TableFrame className="rounded-none border-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead aria-sort={ariaSort("name")}>
              <TableSortButton
                active={sortBy === "name"}
                direction={sortDirection}
                onClick={() => onSort("name")}
              >
                Supplier
              </TableSortButton>
            </TableHead>

            <TableHead>Supplier ID</TableHead>

            <TableHead>Category</TableHead>

            <TableHead>Location</TableHead>

            <TableHead numeric>Products</TableHead>

            <TableHead numeric aria-sort={ariaSort("totalSpend")}>
              <TableSortButton
                align="end"
                active={sortBy === "totalSpend"}
                direction={sortDirection}
                onClick={() => onSort("totalSpend")}
              >
                Total spend
              </TableSortButton>
            </TableHead>

            <TableHead>Status</TableHead>

            <TableHead className="text-right">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {suppliers.length > 0 ? (
            suppliers.map((supplier) => (
              <SupplierTableRow
                key={supplier.id}
                supplier={supplier}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          ) : isFiltered ? (
            <TableEmpty
              colSpan={COLUMN_COUNT}
              icon={<SearchX className="size-4" />}
              title="No suppliers match this view"
              description="Widen the search term or clear the filters to see the full list."
              action={
                <Button variant="outline" size="sm" onClick={onClearFilters}>
                  Clear search and filters
                </Button>
              }
            />
          ) : (
            <TableEmpty
              colSpan={COLUMN_COUNT}
              icon={<Truck className="size-4" />}
              title="No suppliers yet"
              description="Add your first supplier to start tracking spend, products and approval status."
              action={
                <Button size="sm" onClick={onAddSupplier}>
                  Add supplier
                </Button>
              }
            />
          )}
        </TableBody>
      </Table>
    </TableFrame>
  );
}
