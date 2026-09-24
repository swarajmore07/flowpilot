"use client";

import { useMemo, useState, type FormEvent } from "react";
import { flushSync } from "react-dom";
import { Factory } from "lucide-react";

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
import { inventoryStore } from "@/data/inventory/store";
import {
  productionLines,
  productionPriorities,
  productionStatuses,
} from "@/data/production/production";
import type {
  ProductionPriority,
  ProductionRun,
  ProductionStatus,
} from "@/data/production/types";
import { useStoredCollection } from "@/lib/collection-store";
import { formatDay, isIsoDate } from "@/lib/date";
import { firstErrorId, focusField } from "@/lib/focus";
import { formatNumber, formatPercent } from "@/lib/format";

interface ProductionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Receives a complete run minus the id, which the parent assigns. */
  onSubmit: (run: Omit<ProductionRun, "id">) => void;
  /** Pass a run to edit it; pass null (or nothing) to schedule a new one. */
  run?: ProductionRun | null;
}

type FieldName =
  | "product"
  | "line"
  | "targetUnits"
  | "completedUnits"
  | "dueDate"
  | "priority"
  | "status";

type FieldErrors = Partial<Record<FieldName, string>>;

/*
 * Each field paired with the DOM id it renders under, in the order they appear
 * in the sheet — which is not the order of the FieldName union above, because
 * the due date sits before the two unit counts on screen. A failed submit
 * focuses the topmost complaint, so this order is the one that matters.
 */
const FIELD_ORDER: readonly { field: FieldName; id: string }[] = [
  { field: "product", id: "run-product" },
  { field: "line", id: "run-line" },
  { field: "dueDate", id: "run-due" },
  { field: "targetUnits", id: "run-target" },
  { field: "completedUnits", id: "run-completed" },
  { field: "priority", id: "run-priority" },
  { field: "status", id: "run-status" },
];

/* Narrowing guards instead of casts, so a stray string can never reach the
   ProductionRun type through this form. */
function isProductionStatus(value: string): value is ProductionStatus {
  return (productionStatuses as string[]).includes(value);
}

function isProductionPriority(value: string): value is ProductionPriority {
  return (productionPriorities as string[]).includes(value);
}

/**
 * Schedule and edit share one form.
 *
 * The fields are initialised from the `run` prop and never synced to it
 * afterwards. That means the parent must remount this component each time it
 * opens the sheet — `<ProductionForm key={session} />` — which is React's own
 * answer to resetting state, and cheaper to reason about than an effect that
 * copies props into state on every open.
 */
export function ProductionForm({
  open,
  onOpenChange,
  onSubmit,
  run = null,
}: ProductionFormProps) {
  const isEditing = Boolean(run);

  /* A run builds something the workspace actually stocks, so the product list
     comes from Inventory rather than a second hardcoded list that could drift
     away from it. */
  const { items: products } = useStoredCollection(inventoryStore);

  const [product, setProduct] = useState(run?.product ?? "");
  const [line, setLine] = useState(run?.line ?? "");
  const [targetUnits, setTargetUnits] = useState(
    run ? String(run.targetUnits) : ""
  );
  const [completedUnits, setCompletedUnits] = useState(
    run ? String(run.completedUnits) : "0"
  );
  const [dueDate, setDueDate] = useState(run?.dueDate ?? "");
  const [priority, setPriority] = useState<ProductionPriority | "">(
    run?.priority ?? "Normal"
  );
  const [status, setStatus] = useState<ProductionStatus | "">(
    run?.status ?? "Scheduled"
  );

  const [errors, setErrors] = useState<FieldErrors>({});

  /* Set once, on a successful submit, and never cleared: the record is saved
     synchronously and the sheet is already closing, so there is nothing to
     return from. It exists to swallow a second submit during the sheet's exit
     animation, when the form is still mounted and the button still focused —
     a second Enter there would file the run twice. The parent remounts this
     component on every open, which is what resets the flag with the fields. */
  const [submitted, setSubmitted] = useState(false);

  /* The product being edited stays selectable even if its stock line was
     deleted — an existing run should not become unsaveable because the
     catalogue moved on. */
  const productOptions = useMemo(() => {
    const names = new Set(products.map((item) => item.name));
    if (run?.product) names.add(run.product);

    return [...names].sort((a, b) => a.localeCompare(b));
  }, [products, run]);

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

    if (product.trim().length < 2) {
      next.product = "Choose what this run builds.";
    }

    if (!productionLines.includes(line)) {
      next.line = "Choose a line.";
    }

    const target = Number(targetUnits);
    const done = Number(completedUnits);

    if (targetUnits.trim() === "") {
      next.targetUnits = "Enter how many units this run must deliver.";
    } else if (!Number.isInteger(target) || target < 1) {
      next.targetUnits = "Target must be a whole number of 1 or more.";
    }

    if (completedUnits.trim() === "") {
      next.completedUnits = "Enter how many units are already accepted.";
    } else if (!Number.isInteger(done) || done < 0) {
      next.completedUnits = "Completed must be a whole number, 0 or higher.";
    } else if (Number.isInteger(target) && done > target) {
      /* Every progress reading downstream divides by the target, so a run can
         never be more than finished. */
      next.completedUnits = `Completed cannot exceed the target of ${formatNumber(target)}.`;
    }

    if (dueDate.trim() === "") {
      next.dueDate = "Pick the day this run is due.";
    } else if (!isIsoDate(dueDate)) {
      next.dueDate = "Enter a real calendar date.";
    }

    if (!isProductionPriority(priority)) {
      next.priority = "Choose a priority.";
    }

    if (!isProductionStatus(status)) {
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
    if (!isProductionPriority(priority) || !isProductionStatus(status)) return;

    setSubmitted(true);

    onSubmit({
      product: product.trim(),
      line,
      targetUnits: Number(targetUnits),
      completedUnits: Number(completedUnits),
      dueDate,
      priority,
      status,
    });

    onOpenChange(false);
  }

  const target = Number(targetUnits);
  const done = Number(completedUnits);

  const showProgressHint =
    Number.isFinite(target) &&
    target > 0 &&
    Number.isFinite(done) &&
    done >= 0 &&
    done <= target;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <div className="flex items-start gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-line bg-panel-sunken">
              <Factory aria-hidden="true" className="size-4 text-ink-soft" />
            </span>

            <div className="min-w-0">
              <SheetTitle>
                {isEditing ? "Edit run" : "Schedule run"}
              </SheetTitle>

              <SheetDescription>
                {isEditing
                  ? `Update ${run?.id} on ${run?.line}.`
                  : "Commit a quantity to a line and a due date."}
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
            {isEditing && run && (
              <div className="mb-6 flex items-center justify-between rounded-md border border-line bg-panel-sunken px-3.5 py-2.5">
                <span className="label-micro">Run ID</span>
                <span className="identifier text-ink">{run.id}</span>
              </div>
            )}

            <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
              <FormField
                id="run-product"
                label="Product"
                error={errors.product}
                className="sm:col-span-2"
                hint={
                  productOptions.length > 0
                    ? "Drawn from the stock lines held in Inventory."
                    : undefined
                }
              >
                {productOptions.length > 0 ? (
                  <Select
                    value={product}
                    onValueChange={(value) => {
                      /* Base UI reports string | null. */
                      setProduct(value ?? "");
                      clearError("product");
                    }}
                  >
                    <SelectTrigger
                      id="run-product"
                      className="w-full"
                      aria-invalid={Boolean(errors.product)}
                      aria-describedby={
                        errors.product
                          ? "run-product-error"
                          : "run-product-hint"
                      }
                    >
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>

                    <SelectContent>
                      {productOptions.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  /* Inventory is empty, so there is nothing to pick from — the
                     run still needs a name, typed by hand. */
                  <Input
                    id="run-product"
                    value={product}
                    placeholder="Servo Motor"
                    aria-invalid={Boolean(errors.product)}
                    aria-describedby={
                      errors.product ? "run-product-error" : undefined
                    }
                    onChange={(event) => {
                      setProduct(event.target.value);
                      clearError("product");
                    }}
                  />
                )}
              </FormField>

              <FormField id="run-line" label="Line" error={errors.line}>
                <Select
                  value={line}
                  onValueChange={(value) => {
                    setLine(value ?? "");
                    clearError("line");
                  }}
                >
                  <SelectTrigger
                    id="run-line"
                    className="w-full"
                    aria-invalid={Boolean(errors.line)}
                    aria-describedby={
                      errors.line ? "run-line-error" : undefined
                    }
                  >
                    <SelectValue placeholder="Select a line" />
                  </SelectTrigger>

                  <SelectContent>
                    {productionLines.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField
                id="run-due"
                label="Due date"
                error={errors.dueDate}
                hint={
                  isIsoDate(dueDate) ? formatDay(dueDate) : "Day the run is due"
                }
              >
                <Input
                  id="run-due"
                  type="date"
                  value={dueDate}
                  aria-invalid={Boolean(errors.dueDate)}
                  aria-describedby={
                    errors.dueDate ? "run-due-error" : "run-due-hint"
                  }
                  onChange={(event) => {
                    setDueDate(event.target.value);
                    clearError("dueDate");
                  }}
                />
              </FormField>

              <FormField
                id="run-target"
                label="Target units"
                error={errors.targetUnits}
              >
                <Input
                  id="run-target"
                  type="number"
                  min="1"
                  step="1"
                  inputMode="numeric"
                  value={targetUnits}
                  placeholder="400"
                  aria-invalid={Boolean(errors.targetUnits)}
                  aria-describedby={
                    errors.targetUnits ? "run-target-error" : undefined
                  }
                  onChange={(event) => {
                    setTargetUnits(event.target.value);
                    clearError("targetUnits");
                  }}
                />
              </FormField>

              <FormField
                id="run-completed"
                label="Completed units"
                error={errors.completedUnits}
                hint={
                  showProgressHint
                    ? `${formatPercent(done, target)} complete`
                    : "Units already accepted off the line"
                }
              >
                <Input
                  id="run-completed"
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  value={completedUnits}
                  placeholder="0"
                  aria-invalid={Boolean(errors.completedUnits)}
                  aria-describedby={
                    errors.completedUnits
                      ? "run-completed-error"
                      : "run-completed-hint"
                  }
                  onChange={(event) => {
                    setCompletedUnits(event.target.value);
                    clearError("completedUnits");
                  }}
                />
              </FormField>

              <FormField
                id="run-priority"
                label="Priority"
                error={errors.priority}
              >
                <Select
                  value={priority}
                  onValueChange={(value) => {
                    const next = value ?? "";
                    setPriority(isProductionPriority(next) ? next : "");
                    clearError("priority");
                  }}
                >
                  <SelectTrigger
                    id="run-priority"
                    className="w-full"
                    aria-invalid={Boolean(errors.priority)}
                    aria-describedby={
                      errors.priority ? "run-priority-error" : undefined
                    }
                  >
                    <SelectValue placeholder="Select a priority" />
                  </SelectTrigger>

                  <SelectContent>
                    {productionPriorities.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField id="run-status" label="Status" error={errors.status}>
                <Select
                  value={status}
                  onValueChange={(value) => {
                    const next = value ?? "";
                    setStatus(isProductionStatus(next) ? next : "");
                    clearError("status");
                  }}
                >
                  <SelectTrigger
                    id="run-status"
                    className="w-full"
                    aria-invalid={Boolean(errors.status)}
                    aria-describedby={
                      errors.status ? "run-status-error" : undefined
                    }
                  >
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>

                  <SelectContent>
                    {productionStatuses.map((item) => (
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
              {isEditing ? "Save changes" : "Schedule run"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
