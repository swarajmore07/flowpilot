"use client";

import { Eye, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import type { InventoryProduct } from "@/data/inventory/types";
import { formatNumber } from "@/lib/format";

import { inventoryStatusTone } from "../inventory-status";

interface InventoryTableRowProps {
  product: InventoryProduct;
  onView: (product: InventoryProduct) => void;
  onEdit: (product: InventoryProduct) => void;
  onDelete: (product: InventoryProduct) => void;
}

export function InventoryTableRow({
  product,
  onView,
  onEdit,
  onDelete,
}: InventoryTableRowProps) {
  return (
    <TableRow>
      <TableCell className="min-w-48 whitespace-normal">
        <p className="font-medium text-ink">{product.name}</p>

        <p className="identifier mt-0.5 text-xs text-ink-faint">{product.id}</p>
      </TableCell>

      <TableCell className="identifier text-ink-soft">{product.sku}</TableCell>

      <TableCell>{product.warehouse}</TableCell>

      <TableCell>{product.category}</TableCell>

      <TableCell numeric>{formatNumber(product.stock)}</TableCell>

      <TableCell>
        <Badge withDot tone={inventoryStatusTone[product.status]}>
          {product.status}
        </Badge>
      </TableCell>

      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-0.5">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onView(product)}
            aria-label={`View ${product.name}`}
            title="View details"
          >
            <Eye />
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onEdit(product)}
            aria-label={`Edit ${product.name}`}
            title="Edit product"
          >
            <Pencil />
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onDelete(product)}
            aria-label={`Delete ${product.name}`}
            title="Delete product"
            className="hover:bg-critical-soft hover:text-critical"
          >
            <Trash2 />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
