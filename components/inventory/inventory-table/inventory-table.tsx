"use client";

import { PackageSearch, SearchX } from "lucide-react";

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
import type { InventoryProduct } from "@/data/inventory/types";

import { InventoryTableRow } from "./inventory-table-row";

export type InventorySortColumn = "name" | "stock";

interface InventoryTableProps {
  products: InventoryProduct[];
  sortBy: InventorySortColumn;
  sortDirection: "asc" | "desc";
  onSort: (column: InventorySortColumn) => void;
  onView: (product: InventoryProduct) => void;
  onEdit: (product: InventoryProduct) => void;
  onDelete: (product: InventoryProduct) => void;
  /** True when a search term or filter is narrowing the list. */
  isFiltered: boolean;
  onClearFilters: () => void;
  onAddProduct: () => void;
}

const COLUMN_COUNT = 7;

export function InventoryTable({
  products,
  sortBy,
  sortDirection,
  onSort,
  onView,
  onEdit,
  onDelete,
  isFiltered,
  onClearFilters,
  onAddProduct,
}: InventoryTableProps) {
  function ariaSort(column: InventorySortColumn) {
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
            <TableHead aria-sort={ariaSort("name")}>
              <TableSortButton
                active={sortBy === "name"}
                direction={sortDirection}
                onClick={() => onSort("name")}
              >
                Product
              </TableSortButton>
            </TableHead>

            <TableHead>SKU</TableHead>

            <TableHead>Warehouse</TableHead>

            <TableHead>Category</TableHead>

            <TableHead numeric aria-sort={ariaSort("stock")}>
              <TableSortButton
                align="end"
                active={sortBy === "stock"}
                direction={sortDirection}
                onClick={() => onSort("stock")}
              >
                Stock
              </TableSortButton>
            </TableHead>

            <TableHead>Status</TableHead>

            <TableHead className="text-right">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {products.length > 0 ? (
            products.map((product) => (
              <InventoryTableRow
                key={product.id}
                product={product}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          ) : isFiltered ? (
            <TableEmpty
              colSpan={COLUMN_COUNT}
              icon={<SearchX className="size-4" />}
              title="No products match this view"
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
              icon={<PackageSearch className="size-4" />}
              title="No products yet"
              description="Add your first product to start tracking stock levels and reorder signals."
              action={
                <Button size="sm" onClick={onAddProduct}>
                  Add product
                </Button>
              }
            />
          )}
        </TableBody>
      </Table>
    </TableFrame>
  );
}
