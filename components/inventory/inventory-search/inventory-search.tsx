"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

interface InventorySearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function InventorySearch({
  value,
  onChange,
}: InventorySearchProps) {
  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search products, SKU, warehouse..."
        className="pl-10"
      />
    </div>
  );
}