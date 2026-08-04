import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { SectionCard } from "@/components/common/section-card";
import { InventoryTableRow } from "./inventory-table-row";

interface Product {
  id: string;
  name: string;
  sku: string;
  warehouse: string;
  category: string;
  stock: number;
  status: string;
}

interface InventoryTableProps {
  products: Product[];
}

export function InventoryTable({
  products,
}: InventoryTableProps) {
  return (
    <SectionCard
      title="Products"
      description={`Showing ${products.length} product${
        products.length !== 1 ? "s" : ""
      }`}
    >
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Product</TableHead>

              <TableHead>SKU</TableHead>

              <TableHead>Warehouse</TableHead>

              <TableHead>Category</TableHead>

              <TableHead>Stock</TableHead>

              <TableHead>Status</TableHead>

              <TableHead className="text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {products.length > 0 ? (
              products.map((product) => (
                <InventoryTableRow
                  key={product.id}
                  product={product}
                />
              ))
            ) : (
              <TableRow>
                <td
                  colSpan={7}
                  className="py-10 text-center text-slate-500"
                >
                  No products found.
                </td>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </SectionCard>
  );
}