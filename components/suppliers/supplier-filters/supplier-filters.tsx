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
  supplierCategories,
  supplierLocations,
  supplierStatuses,
} from "@/data/suppliers/suppliers";

interface SupplierFiltersProps {
  status: string;
  category: string;
  location: string;

  /* Base UI reports string | null from a Select, so every handler here takes
     null and the call site resolves it — never the other way round. */
  onStatusChange: (value: string | null) => void;
  onCategoryChange: (value: string | null) => void;
  onLocationChange: (value: string | null) => void;

  onReset: () => void;
}

export function SupplierFilters({
  status,
  category,
  location,
  onStatusChange,
  onCategoryChange,
  onLocationChange,
  onReset,
}: SupplierFiltersProps) {
  const hasFilters =
    status !== "all" || category !== "all" || location !== "all";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger aria-label="Filter by status" className="min-w-32">
          <SelectValue placeholder="Status" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>

          {supplierStatuses.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={category} onValueChange={onCategoryChange}>
        <SelectTrigger aria-label="Filter by category" className="min-w-36">
          <SelectValue placeholder="Category" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>

          {supplierCategories.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={location} onValueChange={onLocationChange}>
        <SelectTrigger aria-label="Filter by location" className="min-w-32">
          <SelectValue placeholder="Location" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">All locations</SelectItem>

          {supplierLocations.map((item) => (
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
