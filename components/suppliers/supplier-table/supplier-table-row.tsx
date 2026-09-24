"use client";

import { Eye, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import type { Supplier } from "@/data/suppliers/types";
import { formatInr, formatNumber } from "@/lib/format";

import { supplierStatusTone } from "../supplier-status";

interface SupplierTableRowProps {
  supplier: Supplier;
  onView: (supplier: Supplier) => void;
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
}

export function SupplierTableRow({
  supplier,
  onView,
  onEdit,
  onDelete,
}: SupplierTableRowProps) {
  return (
    <TableRow>
      <TableCell className="min-w-56 whitespace-normal">
        <p className="font-medium text-ink">{supplier.name}</p>

        <p className="mt-0.5 text-xs break-all text-ink-faint">
          {supplier.email}
        </p>
      </TableCell>

      <TableCell className="identifier text-ink-soft">{supplier.id}</TableCell>

      <TableCell>{supplier.category}</TableCell>

      <TableCell>{supplier.location}</TableCell>

      <TableCell numeric>{formatNumber(supplier.products)}</TableCell>

      <TableCell numeric>{formatInr(supplier.totalSpend)}</TableCell>

      <TableCell>
        <Badge withDot tone={supplierStatusTone[supplier.status]}>
          {supplier.status}
        </Badge>
      </TableCell>

      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-0.5">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onView(supplier)}
            aria-label={`View ${supplier.name}`}
            title="View details"
          >
            <Eye />
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onEdit(supplier)}
            aria-label={`Edit ${supplier.name}`}
            title="Edit supplier"
          >
            <Pencil />
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onDelete(supplier)}
            aria-label={`Delete ${supplier.name}`}
            title="Delete supplier"
            className="hover:bg-critical-soft hover:text-critical"
          >
            <Trash2 />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
