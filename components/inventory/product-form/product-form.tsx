"use client";

import { useState, type FormEvent } from "react";
import { flushSync } from "react-dom";
import { Package } from "lucide-react";

import { FormField } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  inventoryCategories,
  inventoryStatuses,
  inventoryWarehouses,
} from "@/data/inventory/inventory";
import type {
  InventoryProduct,
  InventoryStatus,
} from "@/data/inventory/types";
import { firstErrorId, focusField } from "@/lib/focus";
import { formatNumber } from "@/lib/format";

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Receives a complete product minus the id, which the parent assigns. */
  onSubmit: (product: Omit<InventoryProduct, "id">) => void;
  /** Pass a product to edit it; pass null (or nothing) to add a new one. */
  product?: InventoryProduct | null;
}

type FieldName = "name" | "sku" | "warehouse" | "category" | "stock" | "status";

type FieldErrors = Partial<Record<FieldName, string>>;

/*
 * Each field paired with the DOM id it renders under, in the order they appear
 * in the sheet. Two jobs: a failed submit focuses the topmost complaint rather
 * than whichever validation rule happened to run first, and the ids stay in one
 * place instead of being spelled out twice per field.
 */
const FIELD_ORDER: readonly { field: FieldName; id: string }[] = [
  { field: "name", id: "product-name" },
  { field: "sku", id: "product-sku" },
  { field: "warehouse", id: "product-warehouse" },
  { field: "category", id: "product-category" },
  { field: "stock", id: "product-stock" },
  { field: "status", id: "product-status" },
];

/* A narrowing guard instead of a cast, so a stray string can never reach the
   InventoryProduct type through this form. */
function isInventoryStatus(value: string): value is InventoryStatus {
  return (inventoryStatuses as string[]).includes(value);
}

/* SKUs are typed by hand and read back by warehouse staff, so the format is
   enforced: letters, digits and dashes, upper-cased on submit. */
const SKU_PATTERN = /^[A-Za-z0-9-]{4,}$/;

/**
 * Add and edit share one form.
 *
 * The fields are initialised from the `product` prop and never synced to it
 * afterwards. That means the parent must remount this component each time it
 * opens the sheet — `<ProductForm key={session} />` — which is React's own
 * answer to resetting state, and cheaper to reason about than an effect that
 * copies props into state on every open.
 */
export function ProductForm({
  open,
  onOpenChange,
  onSubmit,
  product = null,
}: ProductFormProps) {
  const isEditing = Boolean(product);

  const [name, setName] = useState(product?.name ?? "");
  const [sku, setSku] = useState(product?.sku ?? "");
  const [warehouse, setWarehouse] = useState(product?.warehouse ?? "");
  const [category, setCategory] = useState(product?.category ?? "");
  const [stock, setStock] = useState(product ? String(product.stock) : "");
  const [status, setStatus] = useState<InventoryStatus | "">(
    product?.status ?? ""
  );

  const [errors, setErrors] = useState<FieldErrors>({});

  /* Set once, on a successful submit, and never cleared: the record is saved
     synchronously and the sheet is already closing, so there is nothing to
     return from. It exists to swallow a second submit during the sheet's exit
     animation, when the form is still mounted and the button still focused —
     a second Enter there would file the product twice. The parent remounts this
     component on every open, which is what resets the flag with the fields. */
  const [submitted, setSubmitted] = useState(false);

  function clearError(field: FieldName) {
    setErrors((current) => {
      if (!current[field]) return current;

      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function validate(): FieldErrors {
    const next: FieldErrors = {};

    if (name.trim().length < 2) {
      next.name = "Enter the product name as it appears on the bin label.";
    }

    if (!SKU_PATTERN.test(sku.trim())) {
      next.sku = "Use at least 4 characters: letters, digits and dashes only.";
    }

    if (!warehouse) {
      next.warehouse = "Choose the warehouse holding this stock.";
    }

    if (!category) {
      next.category = "Choose a category.";
    }

    const stockCount = Number(stock);

    if (stock.trim() === "") {
      next.stock = "Enter the units currently on hand.";
    } else if (!Number.isInteger(stockCount) || stockCount < 0) {
      next.stock = "Stock must be a whole number, 0 or higher.";
    }

    if (!isInventoryStatus(status)) {
      next.status = "Choose a status.";
    }

    return next;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitted) return;

    const nextErrors = validate();

    if (Object.keys(nextErrors).length > 0) {
      /* Flushed, so the error text is in the DOM before focus moves onto the
         control that points at it. A screen reader reads a description when
         focus lands; batched, the description would land second. */
      flushSync(() => setErrors(nextErrors));
      focusField(firstErrorId(FIELD_ORDER, nextErrors));
      return;
    }

    /* The guard already passed inside validate(), so this narrows safely. */
    if (!isInventoryStatus(status)) return;

    setSubmitted(true);

    onSubmit({
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      warehouse,
      category,
      stock: Number(stock),
      status,
    });

    onOpenChange(false);
  }

  const stockPreview = Number(stock);
  const showStockPreview =
    stock.trim() !== "" && Number.isInteger(stockPreview) && stockPreview >= 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <div className="flex items-start gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-line bg-panel-sunken">
              <Package aria-hidden="true" className="size-4 text-ink-soft" />
            </span>

            <div className="min-w-0">
              <SheetTitle>
                {isEditing ? "Edit product" : "Add product"}
              </SheetTitle>

              <SheetDescription>
                {isEditing
                  ? `Update the stock line for ${product?.name}.`
                  : "Add a stock line so it appears in reorder signals and production planning."}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <form
          noValidate
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <SheetBody>
            {isEditing && product && (
              <div className="mb-6 flex items-center justify-between rounded-md border border-line bg-panel-sunken px-3.5 py-2.5">
                <span className="label-micro">Product ID</span>
                <span className="identifier text-ink">{product.id}</span>
              </div>
            )}

            <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
              <FormField
                id="product-name"
                label="Product name"
                error={errors.name}
                className="sm:col-span-2"
              >
                <Input
                  id="product-name"
                  value={name}
                  placeholder="Servo Motor"
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={
                    errors.name ? "product-name-error" : undefined
                  }
                  onChange={(event) => {
                    setName(event.target.value);
                    clearError("name");
                  }}
                />
              </FormField>

              <FormField
                id="product-sku"
                label="SKU"
                error={errors.sku}
                hint="Letters, digits and dashes — stored upper-case"
              >
                <Input
                  id="product-sku"
                  value={sku}
                  placeholder="SRV-MTR-001"
                  autoCapitalize="characters"
                  spellCheck={false}
                  className="identifier"
                  aria-invalid={Boolean(errors.sku)}
                  aria-describedby={
                    errors.sku ? "product-sku-error" : "product-sku-hint"
                  }
                  onChange={(event) => {
                    setSku(event.target.value);
                    clearError("sku");
                  }}
                />
              </FormField>

              <FormField
                id="product-warehouse"
                label="Warehouse"
                error={errors.warehouse}
              >
                <Select
                  value={warehouse}
                  onValueChange={(value) => {
                    /* Base UI reports string | null. */
                    setWarehouse(value ?? "");
                    clearError("warehouse");
                  }}
                >
                  <SelectTrigger
                    id="product-warehouse"
                    className="w-full"
                    aria-invalid={Boolean(errors.warehouse)}
                    aria-describedby={
                      errors.warehouse ? "product-warehouse-error" : undefined
                    }
                  >
                    <SelectValue placeholder="Select a warehouse" />
                  </SelectTrigger>

                  <SelectContent>
                    {inventoryWarehouses.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField
                id="product-category"
                label="Category"
                error={errors.category}
              >
                <Select
                  value={category}
                  onValueChange={(value) => {
                    setCategory(value ?? "");
                    clearError("category");
                  }}
                >
                  <SelectTrigger
                    id="product-category"
                    className="w-full"
                    aria-invalid={Boolean(errors.category)}
                    aria-describedby={
                      errors.category ? "product-category-error" : undefined
                    }
                  >
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>

                  <SelectContent>
                    {inventoryCategories.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField
                id="product-stock"
                label="Units on hand"
                error={errors.stock}
                hint={
                  showStockPreview
                    ? `${formatNumber(stockPreview)} units`
                    : "Whole units, as counted"
                }
              >
                <Input
                  id="product-stock"
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  value={stock}
                  placeholder="248"
                  aria-invalid={Boolean(errors.stock)}
                  aria-describedby={
                    errors.stock ? "product-stock-error" : "product-stock-hint"
                  }
                  onChange={(event) => {
                    setStock(event.target.value);
                    clearError("stock");
                  }}
                />
              </FormField>

              <FormField
                id="product-status"
                label="Status"
                error={errors.status}
                className="sm:col-span-2"
              >
                <Select
                  value={status}
                  onValueChange={(value) => {
                    const next = value ?? "";
                    setStatus(isInventoryStatus(next) ? next : "");
                    clearError("status");
                  }}
                >
                  <SelectTrigger
                    id="product-status"
                    className="w-full"
                    aria-invalid={Boolean(errors.status)}
                    aria-describedby={
                      errors.status ? "product-status-error" : undefined
                    }
                  >
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>

                  <SelectContent>
                    {inventoryStatuses.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          </SheetBody>

          <SheetFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitted}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={submitted}>
              {isEditing ? "Save changes" : "Add product"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
