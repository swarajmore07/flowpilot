"use client";

import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { InventoryProduct } from "@/data/inventory/types";

import { ProductInfo } from "./product-info";

interface ProductSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: InventoryProduct | null;
  onEdit: (product: InventoryProduct) => void;
  onDelete: (product: InventoryProduct) => void;
  /** Total units held in the same warehouse, for the share row. */
  warehouseUnits: number;
}

export function ProductSheet({
  open,
  onOpenChange,
  product,
  onEdit,
  onDelete,
  warehouseUnits,
}: ProductSheetProps) {
  if (!product) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{product.name}</SheetTitle>

          <SheetDescription className="identifier mt-1.5">
            {product.id}
          </SheetDescription>
        </SheetHeader>

        <SheetBody>
          <ProductInfo product={product} warehouseUnits={warehouseUnits} />
        </SheetBody>

        <SheetFooter className="sm:justify-between">
          <Button variant="destructive" onClick={() => onDelete(product)}>
            <Trash2 />
            Delete
          </Button>

          <Button onClick={() => onEdit(product)}>
            <Pencil />
            Edit product
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
