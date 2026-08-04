"use client";

import { useMemo, useState } from "react";

import { PageHeader } from "@/components/common/page-header/page-header";
import { SectionCard } from "@/components/common/section-card";

import {
  inventoryData,
  inventoryProducts,
} from "@/data/inventory/inventory";

import { InventoryStatCard } from "../inventory-stat-card";
import { InventorySearch } from "../inventory-search";
import { InventoryFilters } from "../inventory-filters";
import { InventoryTable } from "../inventory-table";

export function InventoryOverview() {
  const [search, setSearch] = useState("");

  const [warehouse, setWarehouse] = useState("all");
const [status, setStatus] = useState("all");
const [category, setCategory] = useState("all");

  const filteredProducts = useMemo(() => {
    return inventoryProducts.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.sku.toLowerCase().includes(search.toLowerCase());

      const matchesWarehouse =
        warehouse === "all" || warehouse === null
          ? true
          : product.warehouse === warehouse;

      const matchesStatus =
        status === "all" || status === null
          ? true
          : product.status === status;

      const matchesCategory =
        category === "all" || category === null
          ? true
          : product.category === category;

      return (
        matchesSearch &&
        matchesWarehouse &&
        matchesStatus &&
        matchesCategory
      );
    });
  }, [search, warehouse, status, category]);

  return (
    <>
      <PageHeader
        title={inventoryData.overview.title}
        description={inventoryData.overview.description}
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {inventoryData.stats.map((stat) => (
          <InventoryStatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            iconColor={stat.iconColor}
            trend={stat.trend}
            trendLabel={stat.trendLabel}
            status={stat.status}
          />
        ))}
      </div>

      <SectionCard
        className="mt-8"
        title="Inventory Management"
        description="Search, filter and manage inventory across all warehouses."
      >
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <InventorySearch
            value={search}
            onChange={setSearch}
          />

          <InventoryFilters
            warehouse={warehouse}
            status={status}
            category={category}
            onWarehouseChange={setWarehouse}
            onStatusChange={setStatus}
            onCategoryChange={setCategory}
          />
        </div>
      </SectionCard>

      <div className="mt-8">
        <InventoryTable products={filteredProducts} />
      </div>
    </>
  );
}