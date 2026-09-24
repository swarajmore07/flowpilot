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
import type { ProductionRun } from "@/data/production/types";

import { ProductionInfo } from "./production-info";

interface ProductionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  run: ProductionRun | null;
  /** Null until the browser reports the calendar day. */
  today: string | null;
  lineOpenUnits: number;
  onEdit: (run: ProductionRun) => void;
  onDelete: (run: ProductionRun) => void;
}

export function ProductionSheet({
  open,
  onOpenChange,
  run,
  today,
  lineOpenUnits,
  onEdit,
  onDelete,
}: ProductionSheetProps) {
  /* Every reading inside is measured against today, so there is nothing
     truthful to show until the day is known. */
  if (!run || !today) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{run.product}</SheetTitle>

          <SheetDescription className="identifier mt-1.5">
            {run.id} · {run.line}
          </SheetDescription>
        </SheetHeader>

        <SheetBody>
          <ProductionInfo
            run={run}
            today={today}
            lineOpenUnits={lineOpenUnits}
          />
        </SheetBody>

        <SheetFooter className="sm:justify-between">
          <Button variant="destructive" onClick={() => onDelete(run)}>
            <Trash2 />
            Delete
          </Button>

          <Button onClick={() => onEdit(run)}>
            <Pencil />
            Edit run
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
