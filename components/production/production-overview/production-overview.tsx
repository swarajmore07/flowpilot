"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Factory, Gauge, PackageCheck, Plus } from "lucide-react";

import { MetricCard, MetricCardSkeleton } from "@/components/common/metric-card";
import { PageHeader } from "@/components/common/page-header";
import { SearchInput } from "@/components/common/search-input";
import { SectionCard } from "@/components/common/section-card";
import { TableSkeleton } from "@/components/common/table-skeleton";
import { TableStatusBar } from "@/components/common/table-status-bar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { productionData, productionLines } from "@/data/production/production";
import { generateRunId, productionStore } from "@/data/production/store";
import type { ProductionRun } from "@/data/production/types";
import { useStoredCollection } from "@/lib/collection-store";
import { formatNumber, formatPercent, toShare } from "@/lib/format";
import { useToday } from "@/lib/use-today";

import { DeleteRunDialog } from "../delete-run-dialog";
import { ProductionFilters } from "../production-filters";
import { ProductionForm } from "../production-form";
import { ProductionSheet } from "../production-sheet";
import { getScheduleSignal, remainingUnits } from "../production-status";
import { ProductionTable, type ProductionSortColumn } from "../production-table";

export function ProductionOverview() {
  const { toast } = useToast();

  const {
    items: runs,
    ready: storeReady,
    update: updateRuns,
  } = useStoredCollection(productionStore);

  /* Null until the browser reports its calendar day. Every schedule reading on
     this page is measured against it, so the page waits for it. */
  const today = useToday();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [line, setLine] = useState("all");
  const [priority, setPriority] = useState("all");

  const [sortBy, setSortBy] = useState<ProductionSortColumn>("dueDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  /* Overlays hold an id, not a copy of the record, so an edit is reflected
     everywhere at once and a deleted record cannot linger in a panel. */
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  /* Bumped on every open so the form remounts with fresh fields — resetting
     state by changing the key, rather than syncing props into state. */
  const [formSession, setFormSession] = useState(0);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const selectedRun = runs.find((item) => item.id === selectedId) ?? null;
  const editingRun = runs.find((item) => item.id === editingId) ?? null;
  const deleteTarget = runs.find((item) => item.id === deleteId) ?? null;

  /* ------------------------------------------------------------- derived -- */

  const metrics = useMemo(() => {
    const total = runs.length;

    const inProgress = runs.filter(
      (item) => item.status === "In Progress"
    ).length;
    const scheduled = runs.filter((item) => item.status === "Scheduled").length;
    const blocked = runs.filter((item) => item.status === "Blocked").length;
    const completed = runs.filter((item) => item.status === "Completed").length;

    const openRuns = total - completed;

    const targetUnits = runs.reduce((sum, item) => sum + item.targetUnits, 0);
    const builtUnits = runs.reduce((sum, item) => sum + item.completedUnits, 0);

    /* A run is late only once its due date has passed with units still open,
       which is a fact about today — not a status somebody typed. */
    const late = today
      ? runs.filter((item) => getScheduleSignal(item, today).isLate).length
      : 0;

    const committedLines = new Set(
      runs.filter((item) => item.status !== "Completed").map((item) => item.line)
    ).size;

    return {
      total,
      inProgress,
      scheduled,
      blocked,
      completed,
      openRuns,
      targetUnits,
      builtUnits,
      late,
      committedLines,
    };
  }, [runs, today]);

  const isFiltered =
    search.trim() !== "" ||
    status !== "all" ||
    line !== "all" ||
    priority !== "all";

  const filteredRuns = useMemo(() => {
    const searchTerm = search.toLowerCase().trim();

    const filtered = runs.filter((item) => {
      const matchesSearch =
        searchTerm === "" ||
        item.id.toLowerCase().includes(searchTerm) ||
        item.product.toLowerCase().includes(searchTerm) ||
        item.line.toLowerCase().includes(searchTerm);

      const matchesStatus = status === "all" || item.status === status;
      const matchesLine = line === "all" || item.line === line;
      const matchesPriority = priority === "all" || item.priority === priority;

      return (
        matchesSearch && matchesStatus && matchesLine && matchesPriority
      );
    });

    filtered.sort((a, b) => {
      if (sortBy === "product") {
        return sortDirection === "asc"
          ? a.product.localeCompare(b.product)
          : b.product.localeCompare(a.product);
      }

      if (sortBy === "progress") {
        const shareA = toShare(a.completedUnits, a.targetUnits);
        const shareB = toShare(b.completedUnits, b.targetUnits);

        return sortDirection === "asc" ? shareA - shareB : shareB - shareA;
      }

      /* ISO dates sort correctly as strings, which is the whole reason the due
         date is stored as one. */
      return sortDirection === "asc"
        ? a.dueDate.localeCompare(b.dueDate)
        : b.dueDate.localeCompare(a.dueDate);
    });

    return filtered;
  }, [runs, search, status, line, priority, sortBy, sortDirection]);

  const openUnitsInView = useMemo(
    () => filteredRuns.reduce((sum, item) => sum + remainingUnits(item), 0),
    [filteredRuns]
  );

  /* The sheet reports what share of its line's open work a run represents, so
     it needs that line's total alongside it. */
  const lineOpenUnits = selectedRun
    ? runs
        .filter((item) => item.line === selectedRun.line)
        .reduce((sum, item) => sum + remainingUnits(item), 0)
    : 0;

  /* ------------------------------------------------------------ handlers -- */

  function handleSort(column: ProductionSortColumn) {
    if (column === sortBy) {
      setSortDirection((previous) => (previous === "asc" ? "desc" : "asc"));
      return;
    }

    setSortBy(column);
    setSortDirection("asc");
  }

  /* The dropdowns only. The search box carries its own clear button, so each
     control clears exactly what it owns — a "Clear filters" that also wiped the
     search term would be quietly doing a second job nobody asked it to. */
  function handleClearFilters() {
    setStatus("all");
    setLine("all");
    setPriority("all");
  }

  /* Everything, for the empty state's "Clear search and filters": there the
     whole narrowed view is what the reader is trying to get out of. */
  function handleClearView() {
    setSearch("");
    handleClearFilters();
  }

  function handleView(run: ProductionRun) {
    setSelectedId(run.id);
    setSheetOpen(true);
  }

  function openForm(runId: string | null) {
    setEditingId(runId);
    setFormSession((session) => session + 1);
    setFormOpen(true);
  }

  function handleAddClick() {
    openForm(null);
  }

  function handleEditClick(run: ProductionRun) {
    /* One overlay at a time — the details sheet steps aside for the form. */
    setSheetOpen(false);
    openForm(run.id);
  }

  function handleDeleteClick(run: ProductionRun) {
    setSheetOpen(false);
    setDeleteId(run.id);
    setDeleteOpen(true);
  }

  function handleFormSubmit(values: Omit<ProductionRun, "id">) {
    /* Branched on the id the form was opened with, not on the record that id
       resolves to. Another tab can delete the run while this sheet is open, and
       branching on the resolved record would silently turn the edit into an add
       — scheduling a duplicate of the run somebody had just cancelled. */
    if (editingId !== null) {
      if (!editingRun) {
        toast("That run no longer exists. Nothing was saved.");
        return;
      }

      const updated: ProductionRun = { ...values, id: editingId };

      updateRuns((current) =>
        current.map((item) => (item.id === updated.id ? updated : item))
      );

      toast("Run updated successfully.");
      return;
    }

    /* Reserved before the write, so the updater stays a plain function of the
       array it is handed. */
    const id = generateRunId(runs);

    updateRuns((current) => [...current, { ...values, id }]);

    toast("Run added successfully.");
  }

  function handleDeleteConfirm() {
    /* The record can vanish between opening this dialog and confirming it —
       another tab removes it and the id here resolves to nothing. Close and say
       so, rather than returning silently: that left the dialog open on a button
       that did nothing, which reads as a broken delete. */
    if (!deleteTarget) {
      setDeleteOpen(false);
      toast("That run has already been removed.");
      return;
    }

    const removedId = deleteTarget.id;
    updateRuns((current) => current.filter((item) => item.id !== removedId));

    setDeleteOpen(false);
    toast("Run deleted successfully.");
  }

  /* ---------------------------------------------------------------- view -- */

  const ready = storeReady && today !== null;

  return (
    <>
      <PageHeader
        title={productionData.overview.title}
        description={productionData.overview.description}
      />

      {ready ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {/* The caption leads with the figure the rail fills on. It used to
              name only the other three states, which left the rail — and its
              accessible label — measuring something the words never
              mentioned. */}
          <MetricCard
            label="Runs in progress"
            value={formatNumber(metrics.inProgress)}
            icon={Factory}
            status={
              metrics.blocked > 0
                ? { text: `${metrics.blocked} blocked`, tone: "critical" }
                : undefined
            }
            rail={{
              fill: toShare(metrics.inProgress, metrics.openRuns),
              caption: `${formatNumber(metrics.inProgress)} of ${formatNumber(metrics.openRuns)} open ${metrics.openRuns === 1 ? "run" : "runs"} on the floor — ${formatNumber(metrics.scheduled)} scheduled, ${formatNumber(metrics.blocked)} blocked`,
              tone: metrics.blocked > 0 ? "caution" : "brand",
            }}
          />

          <MetricCard
            label="Units built"
            value={formatNumber(metrics.builtUnits)}
            icon={PackageCheck}
            rail={{
              fill: toShare(metrics.builtUnits, metrics.targetUnits),
              caption: `${formatPercent(metrics.builtUnits, metrics.targetUnits)} of ${formatNumber(metrics.targetUnits)} units committed`,
              tone: "positive",
            }}
          />

          <MetricCard
            label="Behind schedule"
            value={formatNumber(metrics.late)}
            icon={CalendarClock}
            status={
              metrics.late > 0
                ? { text: "Act today", tone: "critical" }
                : { text: "On schedule", tone: "positive" }
            }
            rail={{
              fill: toShare(metrics.late, metrics.openRuns),
              caption: `${formatPercent(metrics.late, metrics.openRuns)} of open runs are past their due date`,
              tone: metrics.late > 0 ? "critical" : "positive",
            }}
          />

          <MetricCard
            label="Lines committed"
            value={formatNumber(metrics.committedLines)}
            icon={Gauge}
            rail={{
              fill: toShare(metrics.committedLines, productionLines.length),
              caption: `${formatNumber(metrics.committedLines)} of ${formatNumber(productionLines.length)} ${productionLines.length === 1 ? "line has" : "lines have"} open work`,
              tone: "brand",
            }}
          />
        </div>
      ) : (
        <MetricCardSkeleton />
      )}

      <SectionCard
        flush
        className="mt-6"
        title="Production control"
        description="Every work order on the floor, with the ones past their due date called out."
        action={
          <Button onClick={handleAddClick}>
            <Plus />
            Schedule run
          </Button>
        }
      >
        <div className="flex flex-col gap-3 border-b border-line p-4 lg:flex-row lg:items-center lg:justify-between">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search run ID, product or line"
            label="Search production runs"
          />

          <ProductionFilters
            status={status}
            line={line}
            priority={priority}
            onStatusChange={(value) => setStatus(value ?? "all")}
            onLineChange={(value) => setLine(value ?? "all")}
            onPriorityChange={(value) => setPriority(value ?? "all")}
            onReset={handleClearFilters}
          />
        </div>

        {storeReady && today ? (
          <ProductionTable
            runs={filteredRuns}
            today={today}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSort={handleSort}
            onView={handleView}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            isFiltered={isFiltered}
            onClearFilters={handleClearView}
            onAddRun={handleAddClick}
          />
        ) : (
          <TableSkeleton />
        )}

        {/* Status bar: what is in view, and how much work is left in it. */}
        <TableStatusBar
          ready={ready}
          shown={filteredRuns.length}
          total={metrics.total}
          noun="run"
          summary={`${formatNumber(openUnitsInView)} units still open in view`}
        />
      </SectionCard>

      <ProductionSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        run={selectedRun}
        today={today}
        lineOpenUnits={lineOpenUnits}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />

      <ProductionForm
        key={formSession}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        run={editingRun}
      />

      <DeleteRunDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        run={deleteTarget}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
