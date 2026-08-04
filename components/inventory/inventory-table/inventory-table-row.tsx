import { Eye } from "lucide-react";

import { Button } from "@/components/ui/button";

import { InventoryStatusBadge } from "./inventory-status-badge";

interface InventoryTableRowProps {
  product: {
    id: string;
    name: string;
    sku: string;
    warehouse: string;
    category: string;
    stock: number;
    status: string;
  };
}

export function InventoryTableRow({
  product,
}: InventoryTableRowProps) {
  return (
    <tr className="border-b transition-colors hover:bg-slate-50">
      <td className="px-6 py-4">
        <div>
          <p className="font-semibold text-slate-900">
            {product.name}
          </p>

          <p className="text-sm text-slate-500">
            {product.id}
          </p>
        </div>
      </td>

      <td className="px-6 py-4">{product.sku}</td>

      <td className="px-6 py-4">{product.warehouse}</td>

      <td className="px-6 py-4">{product.category}</td>

      <td className="px-6 py-4 font-semibold">
        {product.stock}
      </td>

      <td className="px-6 py-4">
        <InventoryStatusBadge
          status={product.status}
        />
      </td>

      <td className="px-6 py-4">
        <Button
          variant="outline"
          size="sm"
        >
          <Eye className="mr-2 h-4 w-4" />
          View
        </Button>
      </td>
    </tr>
  );
}