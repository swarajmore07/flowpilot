"use client";

import { useState, type FormEvent } from "react";
import { flushSync } from "react-dom";
import { Truck } from "lucide-react";

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
  supplierCategories,
  supplierLocations,
  supplierStatuses,
} from "@/data/suppliers/suppliers";
import type {
  Supplier,
  SupplierCategory,
  SupplierStatus,
} from "@/data/suppliers/types";
import { isEmailShaped, isPhoneShaped, MIN_PHONE_DIGITS } from "@/lib/contact";
import { firstErrorId, focusField } from "@/lib/focus";
import { formatInr } from "@/lib/format";

interface SupplierFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Receives a complete supplier minus the id, which the parent assigns. */
  onSubmit: (supplier: Omit<Supplier, "id">) => void;
  /** Pass a supplier to edit it; pass null (or nothing) to add a new one. */
  supplier?: Supplier | null;
}

type FieldName =
  | "name"
  | "email"
  | "phone"
  | "category"
  | "location"
  | "products"
  | "totalSpend"
  | "status";

type FieldErrors = Partial<Record<FieldName, string>>;

/*
 * Each field paired with the DOM id it renders under, in the order they appear
 * in the sheet. Two jobs: a failed submit focuses the topmost complaint rather
 * than whichever validation rule happened to run first, and the ids stay in one
 * place instead of being spelled out twice per field.
 */
const FIELD_ORDER: readonly { field: FieldName; id: string }[] = [
  { field: "name", id: "supplier-name" },
  { field: "email", id: "supplier-email" },
  { field: "phone", id: "supplier-phone" },
  { field: "category", id: "supplier-category" },
  { field: "location", id: "supplier-location" },
  { field: "products", id: "supplier-products" },
  { field: "totalSpend", id: "supplier-spend" },
  { field: "status", id: "supplier-status" },
];

/* Narrowing guards instead of casts, so a stray string can never reach the
   Supplier type through this form. */
function isSupplierCategory(value: string): value is SupplierCategory {
  return (supplierCategories as string[]).includes(value);
}

function isSupplierStatus(value: string): value is SupplierStatus {
  return (supplierStatuses as string[]).includes(value);
}

/**
 * Add and edit share one form.
 *
 * The fields are initialised from the `supplier` prop and never synced to it
 * afterwards. That means the parent must remount this component each time it
 * opens the sheet — `<SupplierForm key={session} />` — which is React's own
 * answer to resetting state, and cheaper to reason about than an effect that
 * copies props into state on every open.
 */
export function SupplierForm({
  open,
  onOpenChange,
  onSubmit,
  supplier = null,
}: SupplierFormProps) {
  const isEditing = Boolean(supplier);

  const [name, setName] = useState(supplier?.name ?? "");
  const [email, setEmail] = useState(supplier?.email ?? "");
  const [phone, setPhone] = useState(supplier?.phone ?? "");
  const [category, setCategory] = useState<SupplierCategory | "">(
    supplier?.category ?? ""
  );
  const [location, setLocation] = useState(supplier?.location ?? "");
  const [products, setProducts] = useState(
    supplier ? String(supplier.products) : ""
  );
  const [totalSpend, setTotalSpend] = useState(
    supplier ? String(supplier.totalSpend) : ""
  );
  const [status, setStatus] = useState<SupplierStatus | "">(
    supplier?.status ?? ""
  );

  const [errors, setErrors] = useState<FieldErrors>({});

  /*
   * Set once, on a successful submit, and never cleared.
   *
   * The record is saved synchronously and the sheet is already closing, so there
   * is no in-flight state to return from — this exists to swallow a second
   * submit. The sheet animates out, which leaves the form mounted and the submit
   * button focused for a few hundred milliseconds, and a second Enter in that
   * window would file the supplier twice under two different IDs.
   *
   * The parent remounts this component on every open (see the note above), which
   * is what returns this flag, and the fields, to their initial state.
   */
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
      next.name = "Enter the supplier's registered name.";
    }

    if (!isEmailShaped(email)) {
      next.email = "Enter a valid email address, e.g. name@company.com.";
    }

    if (!isPhoneShaped(phone)) {
      next.phone = `Enter a phone number with at least ${MIN_PHONE_DIGITS} digits.`;
    }

    if (!isSupplierCategory(category)) {
      next.category = "Choose a category.";
    }

    if (!location) {
      next.location = "Choose a location.";
    }

    const productCount = Number(products);

    if (products.trim() === "") {
      next.products = "Enter how many products this supplier provides.";
    } else if (!Number.isInteger(productCount) || productCount < 0) {
      next.products = "Products must be a whole number, 0 or higher.";
    }

    const spend = Number(totalSpend);

    if (totalSpend.trim() === "") {
      next.totalSpend = "Enter the total spend to date.";
    } else if (!Number.isFinite(spend) || spend < 0) {
      next.totalSpend = "Total spend must be a number, 0 or higher.";
    }

    if (!isSupplierStatus(status)) {
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

    /* Both guards already passed inside validate(), so these narrow safely. */
    if (!isSupplierCategory(category) || !isSupplierStatus(status)) return;

    setSubmitted(true);

    onSubmit({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      category,
      location,
      products: Number(products),
      totalSpend: Number(totalSpend),
      status,
    });

    onOpenChange(false);
  }

  const spendPreview = Number(totalSpend);
  const showSpendPreview =
    totalSpend.trim() !== "" && Number.isFinite(spendPreview) && spendPreview >= 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <div className="flex items-start gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-line bg-panel-sunken">
              <Truck aria-hidden="true" className="size-4 text-ink-soft" />
            </span>

            <div className="min-w-0">
              <SheetTitle>
                {isEditing ? "Edit supplier" : "Add supplier"}
              </SheetTitle>

              <SheetDescription>
                {isEditing
                  ? `Update the record for ${supplier?.name}.`
                  : "Register a supplier so it appears across procurement and production."}
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
            {isEditing && supplier && (
              <div className="mb-6 flex items-center justify-between rounded-md border border-line bg-panel-sunken px-3.5 py-2.5">
                <span className="label-micro">Supplier ID</span>
                <span className="identifier text-ink">{supplier.id}</span>
              </div>
            )}

            <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
              <FormField
                id="supplier-name"
                label="Supplier name"
                error={errors.name}
                className="sm:col-span-2"
              >
                <Input
                  id="supplier-name"
                  value={name}
                  placeholder="Nova Components Ltd."
                  autoComplete="organization"
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={
                    errors.name ? "supplier-name-error" : undefined
                  }
                  onChange={(event) => {
                    setName(event.target.value);
                    clearError("name");
                  }}
                />
              </FormField>

              <FormField id="supplier-email" label="Email" error={errors.email}>
                <Input
                  id="supplier-email"
                  type="email"
                  inputMode="email"
                  value={email}
                  placeholder="procurement@company.com"
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={
                    errors.email ? "supplier-email-error" : undefined
                  }
                  onChange={(event) => {
                    setEmail(event.target.value);
                    clearError("email");
                  }}
                />
              </FormField>

              <FormField id="supplier-phone" label="Phone" error={errors.phone}>
                <Input
                  id="supplier-phone"
                  type="tel"
                  inputMode="tel"
                  value={phone}
                  placeholder="+91 98765 43210"
                  autoComplete="tel"
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={
                    errors.phone ? "supplier-phone-error" : undefined
                  }
                  onChange={(event) => {
                    setPhone(event.target.value);
                    clearError("phone");
                  }}
                />
              </FormField>

              <FormField
                id="supplier-category"
                label="Category"
                error={errors.category}
              >
                <Select
                  value={category}
                  onValueChange={(value) => {
                    /* Base UI reports string | null. */
                    const next = value ?? "";
                    setCategory(isSupplierCategory(next) ? next : "");
                    clearError("category");
                  }}
                >
                  <SelectTrigger
                    id="supplier-category"
                    className="w-full"
                    aria-invalid={Boolean(errors.category)}
                    aria-describedby={
                      errors.category ? "supplier-category-error" : undefined
                    }
                  >
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>

                  <SelectContent>
                    {supplierCategories.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField
                id="supplier-location"
                label="Location"
                error={errors.location}
              >
                <Select
                  value={location}
                  onValueChange={(value) => {
                    setLocation(value ?? "");
                    clearError("location");
                  }}
                >
                  <SelectTrigger
                    id="supplier-location"
                    className="w-full"
                    aria-invalid={Boolean(errors.location)}
                    aria-describedby={
                      errors.location ? "supplier-location-error" : undefined
                    }
                  >
                    <SelectValue placeholder="Select a location" />
                  </SelectTrigger>

                  <SelectContent>
                    {supplierLocations.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField
                id="supplier-products"
                label="Products supplied"
                error={errors.products}
              >
                <Input
                  id="supplier-products"
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  value={products}
                  placeholder="42"
                  aria-invalid={Boolean(errors.products)}
                  aria-describedby={
                    errors.products ? "supplier-products-error" : undefined
                  }
                  onChange={(event) => {
                    setProducts(event.target.value);
                    clearError("products");
                  }}
                />
              </FormField>

              <FormField
                id="supplier-spend"
                label="Total spend (₹)"
                error={errors.totalSpend}
                hint={
                  showSpendPreview ? formatInr(spendPreview) : "Amount in rupees"
                }
              >
                <Input
                  id="supplier-spend"
                  type="number"
                  min="0"
                  step="1000"
                  inputMode="numeric"
                  value={totalSpend}
                  placeholder="24500000"
                  aria-invalid={Boolean(errors.totalSpend)}
                  aria-describedby={
                    errors.totalSpend
                      ? "supplier-spend-error"
                      : "supplier-spend-hint"
                  }
                  onChange={(event) => {
                    setTotalSpend(event.target.value);
                    clearError("totalSpend");
                  }}
                />
              </FormField>

              <FormField
                id="supplier-status"
                label="Status"
                error={errors.status}
                className="sm:col-span-2"
              >
                <Select
                  value={status}
                  onValueChange={(value) => {
                    const next = value ?? "";
                    setStatus(isSupplierStatus(next) ? next : "");
                    clearError("status");
                  }}
                >
                  <SelectTrigger
                    id="supplier-status"
                    className="w-full"
                    aria-invalid={Boolean(errors.status)}
                    aria-describedby={
                      errors.status ? "supplier-status-error" : undefined
                    }
                  >
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>

                  <SelectContent>
                    {supplierStatuses.map((item) => (
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
              {isEditing ? "Save changes" : "Add supplier"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
