"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InventoryFiltersProps {
  warehouse: string;
  status: string;
  category: string;

  onWarehouseChange: (value: string) => void;
onStatusChange: (value: string) => void;
onCategoryChange: (value: string) => void;
}

export function InventoryFilters({
  warehouse,
  status,
  category,
  onWarehouseChange,
  onStatusChange,
  onCategoryChange,
}: InventoryFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <Select value={warehouse} onValueChange={(value) => onWarehouseChange(value ?? "all")}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Warehouse" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">All Warehouses</SelectItem>
          <SelectItem value="Warehouse A">Warehouse A</SelectItem>
          <SelectItem value="Warehouse B">Warehouse B</SelectItem>
          <SelectItem value="Warehouse C">Warehouse C</SelectItem>
          <SelectItem value="Warehouse D">Warehouse D</SelectItem>
        </SelectContent>
      </Select>

      <Select value={status} onValueChange={(value) => onStatusChange(value ?? "all")}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="In Stock">In Stock</SelectItem>
          <SelectItem value="Low Stock">Low Stock</SelectItem>
          <SelectItem value="Critical">Critical</SelectItem>
        </SelectContent>
      </Select>

      <Select value={category} onValueChange={(value) => onCategoryChange(value ?? "all")}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="Mechanical">Mechanical</SelectItem>
          <SelectItem value="Electronics">Electronics</SelectItem>
          <SelectItem value="Electrical">Electrical</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}