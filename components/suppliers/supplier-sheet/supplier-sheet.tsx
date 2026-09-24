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
import type { Supplier } from "@/data/suppliers/types";

import { SupplierInfo } from "./supplier-info";

interface SupplierSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: Supplier | null;
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
}

export function SupplierSheet({
  open,
  onOpenChange,
  supplier,
  onEdit,
  onDelete,
}: SupplierSheetProps) {
  if (!supplier) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{supplier.name}</SheetTitle>

          <SheetDescription className="identifier mt-1.5">
            {supplier.id}
          </SheetDescription>
        </SheetHeader>

        <SheetBody>
          <SupplierInfo supplier={supplier} />
        </SheetBody>

        <SheetFooter className="sm:justify-between">
          <Button
            variant="destructive"
            onClick={() => onDelete(supplier)}
          >
            <Trash2 />
            Delete
          </Button>

          <Button onClick={() => onEdit(supplier)}>
            <Pencil />
            Edit supplier
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
