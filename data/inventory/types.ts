export type InventoryStatus =
  | "In Stock"
  | "Low Stock"
  | "Critical";

export interface InventoryProduct {
  id: string;
  name: string;
  sku: string;
  warehouse: string;
  category: string;
  stock: number;
  status: InventoryStatus;
}