"use client";

import type { ReactNode } from "react";
import { TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  /** The record in question, rendered verbatim so there is no doubt what goes. */
  detail?: ReactNode;
  confirmLabel: string;
  pendingLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  tone?: "critical" | "brand";
  isPending?: boolean;
}

/*
 * One confirmation for every destructive action in the app, so the wording and
 * button order never drift between modules. Base UI handles focus trapping,
 * Escape and scroll locking.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  detail,
  confirmLabel,
  pendingLabel,
  cancelLabel = "Cancel",
  onConfirm,
  tone = "critical",
  isPending = false,
}: ConfirmDialogProps) {
  const isCritical = tone === "critical";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-start gap-3">
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-md border",
                isCritical
                  ? "border-critical-line bg-critical-soft text-critical"
                  : "border-brand-line bg-brand-soft text-brand"
              )}
            >
              <TriangleAlert aria-hidden="true" className="size-4" />
            </span>

            <div className="min-w-0">
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {detail && (
          <DialogBody>
            <div className="rounded-md border border-line bg-panel-sunken px-3.5 py-3">
              {detail}
            </div>
          </DialogBody>
        )}

        <DialogFooter className={detail ? undefined : "mt-5"}>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {cancelLabel}
          </Button>

          <Button
            variant={isCritical ? "destructiveSolid" : "default"}
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? (pendingLabel ?? confirmLabel) : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
