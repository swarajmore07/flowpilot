"use client";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import type { Supplier } from "@/data/suppliers/types";

interface DeleteSupplierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: Supplier | null;
  onConfirm: () => void;
}

export function DeleteSupplierDialog({
  open,
  onOpenChange,
  supplier,
  onConfirm,
}: DeleteSupplierDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete supplier"
      description="This removes the supplier from every list, filter and total. It cannot be undone."
      confirmLabel="Delete supplier"
      cancelLabel="Cancel"
      onConfirm={onConfirm}
      detail={
        supplier ? (
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">
                {supplier.name}
              </p>

              <p className="mt-0.5 text-xs text-ink-soft">
                {supplier.category} · {supplier.location}
              </p>
            </div>

            <span className="identifier shrink-0 text-ink-soft">
              {supplier.id}
            </span>
          </div>
        ) : undefined
      }
    />
  );
}
