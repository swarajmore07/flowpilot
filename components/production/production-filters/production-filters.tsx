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
  productionLines,
  productionPriorities,
  productionStatuses,
} from "@/data/production/production";

interface ProductionFiltersProps {
  status: string;
  line: string;
  priority: string;

  /* Base UI reports string | null from a Select, so every handler here takes
     null and the call site resolves it — never the other way round. */
  onStatusChange: (value: string | null) => void;
  onLineChange: (value: string | null) => void;
  onPriorityChange: (value: string | null) => void;

  onReset: () => void;
}

export function ProductionFilters({
  status,
  line,
  priority,
  onStatusChange,
  onLineChange,
  onPriorityChange,
  onReset,
}: ProductionFiltersProps) {
  const hasFilters =
    status !== "all" || line !== "all" || priority !== "all";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger aria-label="Filter by status" className="min-w-32">
          <SelectValue placeholder="Status" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>

          {productionStatuses.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={line} onValueChange={onLineChange}>
        <SelectTrigger aria-label="Filter by line" className="min-w-40">
          <SelectValue placeholder="Line" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">All lines</SelectItem>

          {productionLines.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={priority} onValueChange={onPriorityChange}>
        <SelectTrigger aria-label="Filter by priority" className="min-w-32">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">All priorities</SelectItem>

          {productionPriorities.map((item) => (
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
