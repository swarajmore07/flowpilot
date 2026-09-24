import type { InventoryProduct, InventoryStatus } from "./types";

export const inventoryData = {
  overview: {
    title: "Inventory",
    description:
      "Stock levels, reorder signals and warehouse coverage across the network.",
  },
};

/* The single source of truth for the option lists: the form writes only these
   values, so the filters can offer exactly the same set. */
export const inventoryWarehouses = [
  "Warehouse A",
  "Warehouse B",
  "Warehouse C",
  "Warehouse D",
];

export const inventoryCategories = [
  "Mechanical",
  "Electronics",
  "Electrical",
];

export const inventoryStatuses: InventoryStatus[] = [
  "In Stock",
  "Low Stock",
  "Critical",
];

export const inventoryProducts: InventoryProduct[] = [
  {
    id: "INV-1001",
    name: "Servo Motor",
    sku: "SM-1024",
    warehouse: "Warehouse A",
    category: "Mechanical",
    stock: 248,
    status: "In Stock",
  },
  {
    id: "INV-1002",
    name: "PCB Board",
    sku: "PCB-7782",
    warehouse: "Warehouse B",
    category: "Electronics",
    stock: 18,
    status: "Low Stock",
  },
  {
    id: "INV-1003",
    name: "Copper Coil",
    sku: "CC-2281",
    warehouse: "Warehouse C",
    category: "Electrical",
    stock: 412,
    status: "In Stock",
  },
  {
    id: "INV-1004",
    name: "Hydraulic Pump",
    sku: "HP-5560",
    warehouse: "Warehouse A",
    category: "Mechanical",
    stock: 6,
    status: "Critical",
  },
  {
    id: "INV-1005",
    name: "Bearing Set",
    sku: "BS-8722",
    warehouse: "Warehouse D",
    category: "Mechanical",
    stock: 123,
    status: "In Stock",
  },
];
