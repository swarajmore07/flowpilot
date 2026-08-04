import {
  Boxes,
  Warehouse,
  AlertTriangle,
  IndianRupee,
} from "lucide-react";

export const inventoryData = {
  overview: {
    title: "Inventory",
    description:
      "Monitor warehouse stock, inventory value, AI reorder suggestions, and warehouse utilization from a single command center.",
  },

  stats: [
    {
      title: "Total Products",
      value: "12,842",
      icon: Boxes,
      iconColor: "text-blue-600",
      trend: "+182",
      trendLabel: "This Month",
      status: "Growing",
    },
    {
      title: "Warehouses",
      value: "8",
      icon: Warehouse,
      iconColor: "text-emerald-600",
      trend: "+1",
      trendLabel: "New Facility",
      status: "Operational",
    },
    {
      title: "Low Stock",
      value: "18",
      icon: AlertTriangle,
      iconColor: "text-amber-500",
      trend: "-6",
      trendLabel: "Since Yesterday",
      status: "Attention",
    },
    {
      title: "Inventory Value",
      value: "₹8.4Cr",
      icon: IndianRupee,
      iconColor: "text-violet-600",
      trend: "+₹42L",
      trendLabel: "This Quarter",
      status: "Healthy",
    },
  ],
};

export const inventoryProducts = [
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