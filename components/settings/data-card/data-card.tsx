"use client";

import { useState } from "react";
import { Download, RotateCcw } from "lucide-react";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { SectionCard } from "@/components/common/section-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { inventoryStore } from "@/data/inventory/store";
import { productionStore } from "@/data/production/store";
import { supplierStore } from "@/data/suppliers/store";
import { useStoredCollection } from "@/lib/collection-store";
import { downloadJson, stampedFilename } from "@/lib/download";
import { formatNumber } from "@/lib/format";

interface StoreRow {
  id: string;
  name: string;
  slug: string;
  noun: string;
  storageKey: string;
  records: unknown[];
  reset: () => void;
}

/*
 * The workspace's own data, stated plainly.
 *
 * Everything here acts on real localStorage: the counts are what is stored, the
 * export is the stored JSON, and restore removes the key so the module falls
 * back to its sample records. No setting on this page is decorative — a control
 * that did nothing would be worse than no control at all.
 */
export function DataCard() {
  const { toast } = useToast();

  const inventory = useStoredCollection(inventoryStore);
  const suppliers = useStoredCollection(supplierStore);
  const production = useStoredCollection(productionStore);

  const [pending, setPending] = useState<string | null>(null);

  const ready = inventory.ready && suppliers.ready && production.ready;

  const rows: StoreRow[] = [
    {
      id: "inventory",
      name: "Inventory",
      slug: "inventory",
      noun: "stock lines",
      storageKey: inventoryStore.key,
      records: inventory.items,
      reset: inventory.reset,
    },
    {
      id: "suppliers",
      name: "Suppliers",
      slug: "suppliers",
      noun: "suppliers",
      storageKey: supplierStore.key,
      records: suppliers.items,
      reset: suppliers.reset,
    },
    {
      id: "production",
      name: "Production",
      slug: "production",
      noun: "runs",
      storageKey: productionStore.key,
      records: production.items,
      reset: production.reset,
    },
  ];

  const target = pending === null ? null : rows.find((row) => row.id === pending);
  const isResetAll = pending === "all";

  function exportRow(row: StoreRow) {
    downloadJson(stampedFilename(row.slug), row.records);
    toast(`${row.name} exported as JSON.`, "success");
  }

  function exportAll() {
    downloadJson(
      stampedFilename("workspace"),
      Object.fromEntries(rows.map((row) => [row.id, row.records]))
    );
    toast("Workspace exported as JSON.", "success");
  }

  function confirmReset() {
    if (isResetAll) {
      rows.forEach((row) => row.reset());
      toast("All modules restored to their sample records.", "info");
    } else if (target) {
      target.reset();
      toast(`${target.name} restored to its sample records.`, "info");
    }

    setPending(null);
  }

  return (
    <>
      <SectionCard
        flush
        title="Stored data"
        description="Records live in this browser's localStorage. There is no server, so nothing here leaves the device."
        action={
          <Button
            variant="outline"
            size="sm"
            disabled={!ready}
            onClick={exportAll}
          >
            <Download />
            Export all
          </Button>
        }
      >
        <ul>
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex flex-col gap-3 border-b border-line px-5 py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink">{row.name}</p>

                {/* A span, not a paragraph: the loading branch puts a Skeleton
                    div in here, and a div inside a p is re-parented by the HTML
                    parser — which would mean the server markup and the client
                    tree disagree about the shape of this row. */}
                <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-faint">
                  <span className="identifier">{row.storageKey}</span>

                  <span aria-hidden="true">·</span>

                  {ready ? (
                    <span className="figure">
                      {formatNumber(row.records.length)} {row.noun}
                    </span>
                  ) : (
                    <Skeleton className="h-3 w-20" />
                  )}
                </span>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!ready}
                  onClick={() => exportRow(row)}
                >
                  <Download />
                  Export
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  disabled={!ready}
                  onClick={() => setPending(row.id)}
                >
                  <RotateCcw />
                  Restore
                </Button>
              </div>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-3 border-t border-line bg-panel-sunken px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-prose text-xs leading-relaxed text-ink-faint">
            Restoring discards your edits for that module and puts the sample
            records back. Export first if you want to keep them.
          </p>

          <Button
            variant="destructive"
            size="sm"
            className="shrink-0"
            disabled={!ready}
            onClick={() => setPending("all")}
          >
            <RotateCcw />
            Restore everything
          </Button>
        </div>
      </SectionCard>

      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open) setPending(null);
        }}
        title={isResetAll ? "Restore all sample data?" : "Restore sample data?"}
        description={
          isResetAll
            ? "Every record you have added, edited or deleted across all three modules will be discarded."
            : `Every record you have added, edited or deleted in ${target?.name ?? "this module"} will be discarded.`
        }
        detail={
          <div className="text-sm text-ink">
            {isResetAll ? (
              <ul className="space-y-1.5">
                {rows.map((row) => (
                  <li key={row.id} className="flex justify-between gap-4">
                    <span className="text-ink-soft">{row.name}</span>

                    <span className="figure">
                      {formatNumber(row.records.length)} {row.noun}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex justify-between gap-4">
                <span className="text-ink-soft">
                  {target?.name ?? "Module"}
                </span>

                <span className="figure">
                  {formatNumber(target?.records.length ?? 0)}{" "}
                  {target?.noun ?? "records"}
                </span>
              </div>
            )}
          </div>
        }
        confirmLabel={isResetAll ? "Restore everything" : "Restore module"}
        onConfirm={confirmReset}
      />
    </>
  );
}
