"use client";

import type { ReactNode } from "react";

import { Rail } from "@/components/common/rail";
import { Badge } from "@/components/ui/badge";
import type { InventoryProduct } from "@/data/inventory/types";
import { formatNumber, formatPercent } from "@/lib/format";

import { getReorderSignal, inventoryStatusTone } from "../inventory-status";

interface ProductInfoProps {
  product: InventoryProduct;
  /** Every product in the same warehouse, used to place this line in context. */
  warehouseUnits: number;
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-line py-2.5 last:border-0">
      <dt className="label-micro shrink-0">{label}</dt>
      <dd className="min-w-0 text-right text-sm text-ink">{children}</dd>
    </div>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="text-[0.9375rem] font-semibold text-ink">{title}</h3>
      <dl className="mt-2">{children}</dl>
    </section>
  );
}

/*
 * Read as a spec sheet: label on the left, value on the right, one hairline per
 * row. The reorder panel states the threshold it is measuring against, so the
 * recommendation can be checked rather than trusted.
 */
export function ProductInfo({ product, warehouseUnits }: ProductInfoProps) {
  const signal = getReorderSignal(product);

  return (
    <div className="space-y-7">
      <Group title="Identification">
        <Row label="SKU">
          <span className="identifier">{product.sku}</span>
        </Row>

        <Row label="Category">{product.category}</Row>

        <Row label="Status">
          <Badge withDot tone={inventoryStatusTone[product.status]}>
            {product.status}
          </Badge>
        </Row>
      </Group>

      <Group title="Location">
        <Row label="Warehouse">{product.warehouse}</Row>

        <Row label="Units on hand">
          <span className="figure font-medium">
            {formatNumber(product.stock)}
          </span>
        </Row>

        <Row label={`Share of ${product.warehouse}`}>
          <span className="figure">
            {formatPercent(product.stock, warehouseUnits)}
          </span>
        </Row>
      </Group>

      <section className="rounded-md border border-line bg-panel-sunken p-4">
        <div className="flex items-center justify-between gap-4">
          <p className="label-micro">Reorder signal</p>

          <Badge withDot tone={signal.tone}>
            {signal.label}
          </Badge>
        </div>

        <p className="figure mt-3 font-display text-2xl leading-none font-semibold text-ink">
          {formatNumber(product.stock)}
          <span className="ml-1.5 text-sm font-normal text-ink-faint">
            units
          </span>
        </p>

        <Rail
          className="mt-4"
          value={signal.fill}
          tone={signal.tone}
          label={`Stock against the reorder watch level for ${product.name}`}
        />

        <p className="mt-3 text-xs text-ink-soft">{signal.detail}</p>
      </section>
    </div>
  );
}
