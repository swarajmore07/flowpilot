export type SupplierStatus =
  | "Active"
  | "Pending"
  | "Inactive";

export type SupplierCategory =
  | "Electronics"
  | "Mechanical"
  | "Electrical"
  | "Raw Materials";

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  category: SupplierCategory;
  location: string;
  products: number;
  totalSpend: number;
  status: SupplierStatus;
}