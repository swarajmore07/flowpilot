"use client";

import { FilterX } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  inventoryCategories,
  inventoryStatuses,
  inventoryWarehouses,
} from "@/data/inventory/inventory";

interface InventoryFiltersProps {
  warehouse: string;
  status: string;
  category: string;

  /* Base UI reports string | null from a Select, so every handler here takes
     null and the call site resolves it — never the other way round. */
  onWarehouseChange: (value: string | null) => void;
  onStatusChange: (value: string | null) => void;
  onCategoryChange: (value: string | null) => void;

  onReset: () => void;
}

export function InventoryFilters({
  warehouse,
  status,
  category,
  onWarehouseChange,
  onStatusChange,
  onCategoryChange,
  onReset,
}: InventoryFiltersProps) {
  const hasFilters =
    warehouse !== "all" || status !== "all" || category !== "all";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={warehouse} onValueChange={onWarehouseChange}>
        <SelectTrigger aria-label="Filter by warehouse" className="min-w-36">
          <SelectValue placeholder="Warehouse" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">All warehouses</SelectItem>

          {inventoryWarehouses.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger aria-label="Filter by status" className="min-w-32">
          <SelectValue placeholder="Status" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>

          {inventoryStatuses.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={category} onValueChange={onCategoryChange}>
        <SelectTrigger aria-label="Filter by category" className="min-w-32">
          <SelectValue placeholder="Category" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>

          {inventoryCategories.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onReset}>
          <FilterX />
          Clear filters
        </Button>
      )}
    </div>
  );
}
