"use client";

import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import type { Supplier } from "@/data/suppliers/types";
import { formatInr, formatInrCompact, formatNumber } from "@/lib/format";

import { supplierStatusTone } from "../supplier-status";

interface SupplierInfoProps {
  supplier: Supplier;
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
 * row. Denser than a grid of cards and far easier to scan for the one figure
 * you came for.
 */
export function SupplierInfo({ supplier }: SupplierInfoProps) {
  return (
    <div className="space-y-7">
      <Group title="Contact">
        <Row label="Email">
          <a
            href={`mailto:${supplier.email}`}
            className="break-all text-brand hover:underline"
          >
            {supplier.email}
          </a>
        </Row>

        <Row label="Phone">
          <a
            href={`tel:${supplier.phone.replace(/\s/g, "")}`}
            className="identifier text-brand hover:underline"
          >
            {supplier.phone}
          </a>
        </Row>
      </Group>

      <Group title="Sourcing">
        <Row label="Category">{supplier.category}</Row>
        <Row label="Location">{supplier.location}</Row>

        <Row label="Products supplied">
          <span className="figure font-medium">
            {formatNumber(supplier.products)}
          </span>
        </Row>

        <Row label="Status">
          <Badge withDot tone={supplierStatusTone[supplier.status]}>
            {supplier.status}
          </Badge>
        </Row>
      </Group>

      <section className="rounded-md border border-line bg-panel-sunken p-4">
        <p className="label-micro">Total spend to date</p>

        <p className="figure mt-2 font-display text-2xl leading-none font-semibold text-ink">
          {formatInr(supplier.totalSpend)}
        </p>

        <p className="mt-2 text-xs text-ink-faint">
          {formatInrCompact(supplier.totalSpend)} across{" "}
          {formatNumber(supplier.products)} products
        </p>
      </section>
    </div>
  );
}
