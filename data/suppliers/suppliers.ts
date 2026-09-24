import type {
  Supplier,
  SupplierCategory,
  SupplierStatus,
} from "./types";

export const supplierData = {
  overview: {
    title: "Suppliers",
    description:
      "Manage supplier relationships, procurement activity, product sourcing, and supplier performance from a single command center.",
  },
};

export const supplierCategories: SupplierCategory[] = [
  "Electronics",
  "Mechanical",
  "Electrical",
  "Raw Materials",
];

export const supplierStatuses: SupplierStatus[] = [
  "Active",
  "Pending",
  "Inactive",
];

export const supplierLocations = [
  "Mumbai",
  "Pune",
  "Navi Mumbai",
  "Bengaluru",
  "Chennai",
];

export const suppliers: Supplier[] = [
  {
    id: "SUP-1001",
    name: "Nova Components Ltd.",
    email: "procurement@novacomponents.com",
    phone: "+91 98765 43210",
    category: "Electronics",
    location: "Mumbai",
    products: 42,
    totalSpend: 24500000,
    status: "Active",
  },
  {
    id: "SUP-1002",
    name: "Apex Mechanical Works",
    email: "sales@apexmechanical.com",
    phone: "+91 98220 11345",
    category: "Mechanical",
    location: "Pune",
    products: 28,
    totalSpend: 18200000,
    status: "Active",
  },
  {
    id: "SUP-1003",
    name: "VoltEdge Industries",
    email: "orders@voltedge.in",
    phone: "+91 97654 22891",
    category: "Electrical",
    location: "Navi Mumbai",
    products: 35,
    totalSpend: 14750000,
    status: "Active",
  },
  {
    id: "SUP-1004",
    name: "Bharat Raw Materials",
    email: "supply@bharatraw.in",
    phone: "+91 98111 67234",
    category: "Raw Materials",
    location: "Bengaluru",
    products: 19,
    totalSpend: 9800000,
    status: "Pending",
  },
  {
    id: "SUP-1005",
    name: "Precision Engineering Co.",
    email: "contact@precisioneng.com",
    phone: "+91 98900 45678",
    category: "Mechanical",
    location: "Chennai",
    products: 31,
    totalSpend: 12600000,
    status: "Active",
  },
  {
    id: "SUP-1006",
    name: "Electra Systems Pvt. Ltd.",
    email: "business@electrasystems.in",
    phone: "+91 99300 78451",
    category: "Electronics",
    location: "Mumbai",
    products: 24,
    totalSpend: 11300000,
    status: "Inactive",
  },
];