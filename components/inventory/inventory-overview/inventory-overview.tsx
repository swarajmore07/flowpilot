"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Boxes, Layers, Plus, TriangleAlert } from "lucide-react";

import { MetricCard, MetricCardSkeleton } from "@/components/common/metric-card";
import { PageHeader } from "@/components/common/page-header";
import { SearchInput } from "@/components/common/search-input";
import { SectionCard } from "@/components/common/section-card";
import { TableSkeleton } from "@/components/common/table-skeleton";
import { TableStatusBar } from "@/components/common/table-status-bar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { inventoryData, inventoryWarehouses } from "@/data/inventory/inventory";
import { generateProductId, inventoryStore } from "@/data/inventory/store";
import type { InventoryProduct } from "@/data/inventory/types";
import { useStoredCollection } from "@/lib/collection-store";
import { formatNumber, formatPercent, toShare } from "@/lib/format";
import { WAREHOUSE_CONCENTRATION_LIMIT } from "@/lib/operations";

import { DeleteProductDialog } from "../delete-product-dialog";
import { InventoryFilters } from "../inventory-filters";
import {
  isBelowFloor,
  isUnderWatch,
  REORDER_FLOOR,
  REORDER_WATCH,
} from "../inventory-status";
import { InventoryTable, type InventorySortColumn } from "../inventory-table";
import { ProductForm } from "../product-form";
import { ProductSheet } from "../product-sheet";

export function InventoryOverview() {
  const { toast } = useToast();

  const {
    items: products,
    ready,
    update: updateProducts,
  } = useStoredCollection(inventoryStore);

  const [search, setSearch] = useState("");
  const [warehouse, setWarehouse] = useState("all");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");

  const [sortBy, setSortBy] = useState<InventorySortColumn>("name");
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

  const selectedProduct =
    products.find((item) => item.id === selectedId) ?? null;
  const editingProduct = products.find((item) => item.id === editingId) ?? null;
  const deleteTarget = products.find((item) => item.id === deleteId) ?? null;

  /* The sheet reports what share of its warehouse a line represents, so the
     figure needs that warehouse's total alongside it. */
  const selectedWarehouseUnits = selectedProduct
    ? products
        .filter((item) => item.warehouse === selectedProduct.warehouse)
        .reduce((sum, item) => sum + item.stock, 0)
    : 0;

  /* ------------------------------------------------------------- derived -- */

  const metrics = useMemo(() => {
    const total = products.length;
    const units = products.reduce((sum, item) => sum + item.stock, 0);

    /* Counted from the stock figure and the two reorder constants, not from the
       stored `status` label. The label is whatever the last editor picked, so
       counting labels let this page report one number while the table beside it,
       the product sheet and the dashboard — all of which read the arithmetic —
       reported another. The status dropdown still filters on the label, because
       there the label is what the reader asked to see. */
    const low = products.filter(isUnderWatch).length;
    const critical = products.filter(isBelowFloor).length;

    /* Units per warehouse, so the concentration rail says something real
       instead of inventing a target to measure against. */
    const perWarehouse = new Map<string, number>();
    products.forEach((item) => {
      perWarehouse.set(
        item.warehouse,
        (perWarehouse.get(item.warehouse) ?? 0) + item.stock
      );
    });

    let topWarehouse = "—";
    let topWarehouseUnits = 0;
    perWarehouse.forEach((warehouseUnits, name) => {
      if (warehouseUnits > topWarehouseUnits) {
        topWarehouseUnits = warehouseUnits;
        topWarehouse = name;
      }
    });

    return {
      total,
      units,
      low,
      critical,
      warehouses: perWarehouse.size,
      topWarehouse,
      topWarehouseUnits,
    };
  }, [products]);

  const isFiltered =
    search.trim() !== "" ||
    warehouse !== "all" ||
    status !== "all" ||
    category !== "all";

  const filteredProducts = useMemo(() => {
    const searchTerm = search.toLowerCase().trim();

    const filtered = products.filter((product) => {
      const matchesSearch =
        searchTerm === "" ||
        product.name.toLowerCase().includes(searchTerm) ||
        product.sku.toLowerCase().includes(searchTerm) ||
        product.id.toLowerCase().includes(searchTerm) ||
        product.warehouse.toLowerCase().includes(searchTerm);

      const matchesWarehouse =
        warehouse === "all" || product.warehouse === warehouse;
      const matchesStatus = status === "all" || product.status === status;
      const matchesCategory = category === "all" || product.category === category;

      return (
        matchesSearch && matchesWarehouse && matchesStatus && matchesCategory
      );
    });

    filtered.sort((a, b) => {
      if (sortBy === "name") {
        return sortDirection === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }

      return sortDirection === "asc" ? a.stock - b.stock : b.stock - a.stock;
    });

    return filtered;
  }, [products, search, warehouse, status, category, sortBy, sortDirection]);

  const unitsInView = useMemo(
    () => filteredProducts.reduce((sum, item) => sum + item.stock, 0),
    [filteredProducts]
  );

  /* ------------------------------------------------------------ handlers -- */

  function handleSort(column: InventorySortColumn) {
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
    setWarehouse("all");
    setStatus("all");
    setCategory("all");
  }

  /* Everything, for the empty state's "Clear search and filters": there the
     whole narrowed view is what the reader is trying to get out of. */
  function handleClearView() {
    setSearch("");
    handleClearFilters();
  }

  function handleView(product: InventoryProduct) {
    setSelectedId(product.id);
    setSheetOpen(true);
  }

  function openForm(productId: string | null) {
    setEditingId(productId);
    setFormSession((session) => session + 1);
    setFormOpen(true);
  }

  function handleAddClick() {
    openForm(null);
  }

  function handleEditClick(product: InventoryProduct) {
    /* One overlay at a time — the details sheet steps aside for the form. */
    setSheetOpen(false);
    openForm(product.id);
  }

  function handleDeleteClick(product: InventoryProduct) {
    setSheetOpen(false);
    setDeleteId(product.id);
    setDeleteOpen(true);
  }

  function handleFormSubmit(values: Omit<InventoryProduct, "id">) {
    /* Branched on the id the form was opened with, not on the record that id
       resolves to. Another tab can delete the line while this sheet is open, and
       branching on the resolved record would silently turn the edit into an add
       — filing a duplicate of the line somebody had just removed, under a new
       ID, with no sign anything unusual happened. */
    if (editingId !== null) {
      if (!editingProduct) {
        toast("That product no longer exists. Nothing was saved.");
        return;
      }

      const updated: InventoryProduct = { ...values, id: editingId };

      updateProducts((current) =>
        current.map((item) => (item.id === updated.id ? updated : item))
      );

      toast("Product updated successfully.");
      return;
    }

    /* Reserved before the write, so the updater stays a plain function of the
       array it is handed. Reserving inside it would tie a persisted side effect
       to a callback the store is free to call with either its cached snapshot or
       a fresh read of storage. */
    const id = generateProductId(products);

    updateProducts((current) => [...current, { ...values, id }]);

    toast("Product added successfully.");
  }

  function handleDeleteConfirm() {
    /* The record can vanish between opening this dialog and confirming it —
       another tab removes it and the id here resolves to nothing. Close and say
       so, rather than returning silently: that left the dialog open on a button
       that did nothing, which reads as a broken delete. */
    if (!deleteTarget) {
      setDeleteOpen(false);
      toast("That product has already been removed.");
      return;
    }

    const removedId = deleteTarget.id;
    updateProducts((current) => current.filter((item) => item.id !== removedId));

    setDeleteOpen(false);
    toast("Product deleted successfully.");
  }

  /* ---------------------------------------------------------------- view -- */

  /* Rounded before it is compared, so the tone flips on exactly the figure the
     caption prints — a rail reading "40% of units" should not still be calm. */
  const concentration = toShare(metrics.topWarehouseUnits, metrics.units);
  const isConcentrated =
    Math.round(concentration) >= WAREHOUSE_CONCENTRATION_LIMIT;

  return (
    <>
      <PageHeader
        title={inventoryData.overview.title}
        description={inventoryData.overview.description}
      />

      {ready ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {/* The rail measures how much of the network this book covers, which
              is what the caption reads. It used to fill on lines clear of a
              reorder threshold while the caption counted warehouses — two
              different quantities in one card, and the caption is also the
              rail's accessible label. */}
          <MetricCard
            label="Tracked products"
            value={formatNumber(metrics.total)}
            icon={Layers}
            rail={{
              fill: toShare(metrics.warehouses, inventoryWarehouses.length),
              caption: `Stocked in ${formatNumber(metrics.warehouses)} of ${formatNumber(inventoryWarehouses.length)} ${inventoryWarehouses.length === 1 ? "warehouse" : "warehouses"}`,
              tone: "brand",
            }}
          />

          <MetricCard
            label="Units on hand"
            value={formatNumber(metrics.units)}
            icon={Boxes}
            rail={{
              fill: concentration,
              caption: `${metrics.topWarehouse} holds ${formatPercent(metrics.topWarehouseUnits, metrics.units)} of units`,
              tone: isConcentrated ? "caution" : "brand",
            }}
          />

          <MetricCard
            label="Low stock"
            value={formatNumber(metrics.low)}
            icon={TriangleAlert}
            status={
              metrics.low > 0
                ? { text: "Reorder soon", tone: "caution" }
                : { text: "All clear", tone: "positive" }
            }
            rail={{
              fill: toShare(metrics.low, metrics.total),
              caption: `${formatPercent(metrics.low, metrics.total)} of lines sit under the ${REORDER_WATCH}-unit watch level`,
              tone: metrics.low > 0 ? "caution" : "positive",
            }}
          />

          <MetricCard
            label="Critical"
            value={formatNumber(metrics.critical)}
            icon={AlertTriangle}
            status={
              metrics.critical > 0
                ? { text: "Act today", tone: "critical" }
                : { text: "All clear", tone: "positive" }
            }
            rail={{
              fill: toShare(metrics.critical, metrics.total),
              caption:
                metrics.critical > 0
                  ? `${formatNumber(metrics.critical)} of ${formatNumber(metrics.total)} lines are below the ${REORDER_FLOOR}-unit floor`
                  : `No line is under the ${REORDER_FLOOR}-unit floor`,
              tone: metrics.critical > 0 ? "critical" : "positive",
            }}
          />
        </div>
      ) : (
        <MetricCardSkeleton />
      )}

      <SectionCard
        flush
        className="mt-6"
        title="Inventory management"
        description="Search, filter and manage stock lines across every warehouse."
        action={
          <Button onClick={handleAddClick}>
            <Plus />
            Add product
          </Button>
        }
      >
        <div className="flex flex-col gap-3 border-b border-line p-4 lg:flex-row lg:items-center lg:justify-between">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search name, SKU or warehouse"
            label="Search products"
          />

          <InventoryFilters
            warehouse={warehouse}
            status={status}
            category={category}
            onWarehouseChange={(value) => setWarehouse(value ?? "all")}
            onStatusChange={(value) => setStatus(value ?? "all")}
            onCategoryChange={(value) => setCategory(value ?? "all")}
            onReset={handleClearFilters}
          />
        </div>

        {ready ? (
          <InventoryTable
            products={filteredProducts}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSort={handleSort}
            onView={handleView}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            isFiltered={isFiltered}
            onClearFilters={handleClearView}
            onAddProduct={handleAddClick}
          />
        ) : (
          <TableSkeleton />
        )}

        {/* Status bar: what is in view, and how much stock it represents. */}
        <TableStatusBar
          ready={ready}
          shown={filteredProducts.length}
          total={metrics.total}
          noun="product"
          summary={`${formatNumber(unitsInView)} units in view`}
        />
      </SectionCard>

      <ProductSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        product={selectedProduct}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        warehouseUnits={selectedWarehouseUnits}
      />

      <ProductForm
        key={formSession}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        product={editingProduct}
      />

      <DeleteProductDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        product={deleteTarget}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
