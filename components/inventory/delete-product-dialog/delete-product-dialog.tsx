"use client";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import type { InventoryProduct } from "@/data/inventory/types";
import { formatNumber } from "@/lib/format";

interface DeleteProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: InventoryProduct | null;
  onConfirm: () => void;
}

export function DeleteProductDialog({
  open,
  onOpenChange,
  product,
  onConfirm,
}: DeleteProductDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete product"
      description="This removes the stock line from every list, filter and total. It cannot be undone."
      confirmLabel="Delete product"
      cancelLabel="Cancel"
      onConfirm={onConfirm}
      detail={
        product ? (
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">
                {product.name}
              </p>

              <p className="mt-0.5 text-xs text-ink-soft">
                {product.warehouse} · {formatNumber(product.stock)} units on hand
              </p>
            </div>

            <span className="identifier shrink-0 text-ink-soft">
              {product.sku}
            </span>
          </div>
        ) : undefined
      }
    />
  );
}
