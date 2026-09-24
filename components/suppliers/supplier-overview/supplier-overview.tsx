"use client";

import { useMemo, useState } from "react";
import { Building2, Clock3, Plus, Users, Wallet } from "lucide-react";

import { MetricCard, MetricCardSkeleton } from "@/components/common/metric-card";
import { PageHeader } from "@/components/common/page-header";
import { SearchInput } from "@/components/common/search-input";
import { SectionCard } from "@/components/common/section-card";
import { TableSkeleton } from "@/components/common/table-skeleton";
import { TableStatusBar } from "@/components/common/table-status-bar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { generateSupplierId, supplierStore } from "@/data/suppliers/store";
import { supplierData, supplierLocations } from "@/data/suppliers/suppliers";
import type { Supplier } from "@/data/suppliers/types";
import { useStoredCollection } from "@/lib/collection-store";
import {
  formatInrCompact,
  formatNumber,
  formatPercent,
  toShare,
} from "@/lib/format";
import { SPEND_CONCENTRATION_LIMIT } from "@/lib/operations";

import { DeleteSupplierDialog } from "../delete-supplier-dialog";
import { SupplierFilters } from "../supplier-filters";
import { SupplierForm } from "../supplier-form";
import { SupplierSheet } from "../supplier-sheet";
import { SupplierTable, type SupplierSortColumn } from "../supplier-table";

export function SupplierOverview() {
  const { toast } = useToast();

  const {
    items: supplierList,
    ready,
    update: updateSuppliers,
  } = useStoredCollection(supplierStore);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [location, setLocation] = useState("all");

  const [sortBy, setSortBy] = useState<SupplierSortColumn>("name");
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

  const selectedSupplier =
    supplierList.find((item) => item.id === selectedId) ?? null;
  const editingSupplier =
    supplierList.find((item) => item.id === editingId) ?? null;
  const deleteTarget =
    supplierList.find((item) => item.id === deleteId) ?? null;

  /* ------------------------------------------------------------- derived -- */

  const metrics = useMemo(() => {
    const total = supplierList.length;
    const active = supplierList.filter(
      (item) => item.status === "Active"
    ).length;
    const pending = supplierList.filter(
      (item) => item.status === "Pending"
    ).length;
    const inactive = total - active - pending;

    const spend = supplierList.reduce((sum, item) => sum + item.totalSpend, 0);
    const topSpend = supplierList.reduce(
      (highest, item) => Math.max(highest, item.totalSpend),
      0
    );

    /* Cities with at least one supplier on the roster. The reading the roster
       count alone cannot give: six suppliers in one city is a different network
       from six spread across six. */
    const cities = new Set(supplierList.map((item) => item.location)).size;

    return { total, active, pending, inactive, spend, topSpend, cities };
  }, [supplierList]);

  const isFiltered =
    search.trim() !== "" ||
    status !== "all" ||
    category !== "all" ||
    location !== "all";

  const filteredSuppliers = useMemo(() => {
    const searchTerm = search.toLowerCase().trim();

    const filtered = supplierList.filter((supplier) => {
      const matchesSearch =
        searchTerm === "" ||
        supplier.name.toLowerCase().includes(searchTerm) ||
        supplier.id.toLowerCase().includes(searchTerm) ||
        supplier.email.toLowerCase().includes(searchTerm) ||
        supplier.location.toLowerCase().includes(searchTerm) ||
        supplier.category.toLowerCase().includes(searchTerm);

      const matchesStatus = status === "all" || supplier.status === status;
      const matchesCategory =
        category === "all" || supplier.category === category;
      const matchesLocation =
        location === "all" || supplier.location === location;

      return (
        matchesSearch && matchesStatus && matchesCategory && matchesLocation
      );
    });

    filtered.sort((a, b) => {
      if (sortBy === "name") {
        return sortDirection === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }

      return sortDirection === "asc"
        ? a.totalSpend - b.totalSpend
        : b.totalSpend - a.totalSpend;
    });

    return filtered;
  }, [supplierList, search, status, category, location, sortBy, sortDirection]);

  const spendInView = useMemo(
    () => filteredSuppliers.reduce((sum, item) => sum + item.totalSpend, 0),
    [filteredSuppliers]
  );

  /* ------------------------------------------------------------ handlers -- */

  function handleSort(column: SupplierSortColumn) {
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
    setCategory("all");
    setLocation("all");
  }

  /* Everything, for the empty state's "Clear search and filters": there the
     whole narrowed view is what the reader is trying to get out of. */
  function handleClearView() {
    setSearch("");
    handleClearFilters();
  }

  function handleView(supplier: Supplier) {
    setSelectedId(supplier.id);
    setSheetOpen(true);
  }

  function openForm(supplierId: string | null) {
    setEditingId(supplierId);
    setFormSession((session) => session + 1);
    setFormOpen(true);
  }

  function handleAddClick() {
    openForm(null);
  }

  function handleEditClick(supplier: Supplier) {
    /* One overlay at a time — the details sheet steps aside for the form. */
    setSheetOpen(false);
    openForm(supplier.id);
  }

  function handleDeleteClick(supplier: Supplier) {
    setSheetOpen(false);
    setDeleteId(supplier.id);
    setDeleteOpen(true);
  }

  function handleFormSubmit(values: Omit<Supplier, "id">) {
    /* Branched on the id the form was opened with, not on the record that id
       resolves to. Another tab can delete the supplier while this sheet is open,
       and branching on the resolved record would silently turn the edit into an
       add — registering a duplicate of the supplier somebody had just removed,
       under a new ID, with no sign anything unusual happened. */
    if (editingId !== null) {
      if (!editingSupplier) {
        toast("That supplier no longer exists. Nothing was saved.");
        return;
      }

      const updated: Supplier = { ...values, id: editingId };

      updateSuppliers((current) =>
        current.map((item) => (item.id === updated.id ? updated : item))
      );

      toast("Supplier updated successfully.");
      return;
    }

    /* Reserved before the write, so the updater stays a plain function of the
       array it is handed. Reserving inside it would tie a persisted side effect
       to a callback the store is free to call with either its cached snapshot or
       a fresh read of storage. */
    const id = generateSupplierId(supplierList);

    updateSuppliers((current) => [...current, { ...values, id }]);

    toast("Supplier added successfully.");
  }

  function handleDeleteConfirm() {
    /* The record can vanish between opening this dialog and confirming it —
       another tab removes it and the id here resolves to nothing. Close and say
       so, rather than returning silently: that left the dialog open on a button
       that did nothing, which reads as a broken delete. */
    if (!deleteTarget) {
      setDeleteOpen(false);
      toast("That supplier has already been removed.");
      return;
    }

    const removedId = deleteTarget.id;
    updateSuppliers((current) =>
      current.filter((item) => item.id !== removedId)
    );

    setDeleteOpen(false);
    toast("Supplier deleted successfully.");
  }

  /* ---------------------------------------------------------------- view -- */

  const activeShare = toShare(metrics.active, metrics.total);
  const concentration = toShare(metrics.topSpend, metrics.spend);

  /* Rounded before it is compared, so the tone flips on exactly the figure the
     caption prints — a rail reading "40% of spend" should not still be calm. */
  const isConcentrated =
    Math.round(concentration) >= SPEND_CONCENTRATION_LIMIT;

  return (
    <>
      <PageHeader
        title={supplierData.overview.title}
        description={supplierData.overview.description}
      />

      {ready ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {/* Reach, not health — the roster's active share is the next card's
              subject, and two cards carrying the same rail said one thing
              twice. */}
          <MetricCard
            label="Total suppliers"
            value={formatNumber(metrics.total)}
            icon={Building2}
            rail={{
              fill: toShare(metrics.cities, supplierLocations.length),
              caption: `Sourcing from ${formatNumber(metrics.cities)} of ${formatNumber(supplierLocations.length)} ${supplierLocations.length === 1 ? "city" : "cities"}`,
              tone: "brand",
            }}
          />

          {/* The caption leads with the figure the rail fills on, then itemises
              the remainder. It used to name only the remainder, which left the
              rail — and its accessible label — measuring something the words
              never mentioned. */}
          <MetricCard
            label="Active suppliers"
            value={formatNumber(metrics.active)}
            icon={Users}
            rail={{
              fill: activeShare,
              caption: `${formatNumber(metrics.active)} of ${formatNumber(metrics.total)} trading — ${formatNumber(metrics.pending)} pending, ${formatNumber(metrics.inactive)} inactive`,
              tone: "positive",
            }}
          />

          <MetricCard
            label="Pending approval"
            value={formatNumber(metrics.pending)}
            icon={Clock3}
            status={
              metrics.pending > 0
                ? { text: "Needs review", tone: "caution" }
                : { text: "All clear", tone: "positive" }
            }
            rail={{
              fill: toShare(metrics.pending, metrics.total),
              caption: `${formatPercent(metrics.pending, metrics.total)} of the roster awaits approval`,
              tone: metrics.pending > 0 ? "caution" : "positive",
            }}
          />

          <MetricCard
            label="Total spend"
            value={formatInrCompact(metrics.spend)}
            icon={Wallet}
            rail={{
              fill: concentration,
              caption: `Largest supplier holds ${formatPercent(metrics.topSpend, metrics.spend)} of spend`,
              tone: isConcentrated ? "caution" : "brand",
            }}
          />
        </div>
      ) : (
        <MetricCardSkeleton />
      )}

      <SectionCard
        flush
        className="mt-6"
        title="Supplier management"
        description="Search, filter and manage supplier relationships across the network."
        action={
          <Button onClick={handleAddClick}>
            <Plus />
            Add supplier
          </Button>
        }
      >
        <div className="flex flex-col gap-3 border-b border-line p-4 lg:flex-row lg:items-center lg:justify-between">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search name, ID, email, city or category"
            label="Search suppliers"
          />

          <SupplierFilters
            status={status}
            category={category}
            location={location}
            onStatusChange={(value) => setStatus(value ?? "all")}
            onCategoryChange={(value) => setCategory(value ?? "all")}
            onLocationChange={(value) => setLocation(value ?? "all")}
            onReset={handleClearFilters}
          />
        </div>

        {ready ? (
          <SupplierTable
            suppliers={filteredSuppliers}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSort={handleSort}
            onView={handleView}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            isFiltered={isFiltered}
            onClearFilters={handleClearView}
            onAddSupplier={handleAddClick}
          />
        ) : (
          <TableSkeleton />
        )}

        {/* Status bar: what is in view, and what it is worth. */}
        <TableStatusBar
          ready={ready}
          shown={filteredSuppliers.length}
          total={metrics.total}
          noun="supplier"
          summary={`${formatInrCompact(spendInView)} in view`}
        />
      </SectionCard>

      <SupplierSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        supplier={selectedSupplier}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />

      <SupplierForm
        key={formSession}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        supplier={editingSupplier}
      />

      <DeleteSupplierDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        supplier={deleteTarget}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
