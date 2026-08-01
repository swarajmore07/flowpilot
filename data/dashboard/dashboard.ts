import {
  ArrowRight,
  CircleAlert,
  TrendingUp,
} from "lucide-react";

export const dashboardData = {
  missionBrief: {
    title: "Operations Overview",

    generatedAt: "3 minutes ago",

    situation:
      "Production is operating normally, but Pacific Components has reported a logistics delay that may affect Assembly Line B within the next 24 hours.",

    risk: "Medium",

    impact:
      "Without intervention, production output could decrease by approximately 18% during the next manufacturing cycle.",

    recommendation:
      "Reroute procurement to Nova Plastics and increase warehouse allocation for Servo Motors.",

    confidence: 96,

    savings: "₹18.4L",
  },

  metrics: [
    {
      title: "Production Health",
      value: "98%",
      icon: TrendingUp,
      iconColor: "text-blue-600",
      trend: "+2.3%",
      trendLabel: "This Week",
      status: "Healthy",
    },
    {
      title: "Active Supplier Risks",
      value: "3",
      icon: CircleAlert,
      iconColor: "text-amber-500",
      trend: "-1",
      trendLabel: "Since Yesterday",
      status: "Needs Attention",
    },
    {
      title: "Estimated Savings",
      value: "₹18.4L",
      icon: ArrowRight,
      iconColor: "text-emerald-600",
      trend: "+₹2.1L",
      trendLabel: "Projected",
      status: "Opportunity",
    },
  ],
};

export const quickActions = [
  {
    title: "Generate Rescue Plan",
    description: "Create an AI-powered executive recovery strategy.",
    icon: ArrowRight,
  },
  {
    title: "Open AI Copilot",
    description: "Analyze operational risks using FlowPilot AI.",
    icon: TrendingUp,
  },
];

export const alerts = [
  {
    title: "Supplier Delay",
    severity: "High",
    description: "Pacific Components shipment delayed by 18 hours.",
  },
  {
    title: "Inventory Warning",
    severity: "Medium",
    description: "Servo Motors inventory below threshold.",
  },
];

export const supplyHealth = [
  {
    title: "Production",
    value: 98,
    color: "bg-emerald-500",
    status: "Excellent",
  },
  {
    title: "Suppliers",
    value: 91,
    color: "bg-amber-500",
    status: "Stable",
  },
  {
    title: "Inventory",
    value: 84,
    color: "bg-blue-500",
    status: "Healthy",
  },
  {
    title: "Logistics",
    value: 96,
    color: "bg-violet-500",
    status: "On Schedule",
  },
];

export const productionTrend = [
  { day: "Mon", output: 82 },
  { day: "Tue", output: 86 },
  { day: "Wed", output: 84 },
  { day: "Thu", output: 91 },
  { day: "Fri", output: 96 },
  { day: "Sat", output: 94 },
  { day: "Sun", output: 98 },
];

export const inventoryHealth = [
  {
    warehouse: "Warehouse A",
    stock: 92,
    status: "Healthy",
    color: "bg-emerald-500",
  },
  {
    warehouse: "Warehouse B",
    stock: 74,
    status: "Moderate",
    color: "bg-amber-500",
  },
  {
    warehouse: "Warehouse C",
    stock: 98,
    status: "Excellent",
    color: "bg-blue-500",
  },
  {
    warehouse: "Warehouse D",
    stock: 61,
    status: "Low",
    color: "bg-red-500",
  },
];

export const supplierPerformance = [
  {
    supplier: "Pacific Components",
    score: 96,
    deliveries: "148",
    status: "Excellent",
  },
  {
    supplier: "Nova Plastics",
    score: 91,
    deliveries: "136",
    status: "Good",
  },
  {
    supplier: "Prime Metals",
    score: 82,
    deliveries: "121",
    status: "Average",
  },
  {
    supplier: "Steel Works Ltd.",
    score: 74,
    deliveries: "104",
    status: "Needs Attention",
  },
];

export const aiForecast = {
  confidence: 96,
  prediction: "Production is expected to increase by 4.2% tomorrow.",
  risk: "Low",
  recommendation:
    "Maintain current supplier allocation and replenish Servo Motors inventory within the next 48 hours.",
};

export const activityTimeline = [
  {
    time: "16:42",
    title: "AI generated rescue plan",
    description: "Alternative supplier selected for Servo Motors.",
    type: "AI",
  },
  {
    time: "16:15",
    title: "Supplier shipment delayed",
    description: "Pacific Components reported an 18-hour delay.",
    type: "Supplier",
  },
  {
    time: "15:58",
    title: "Warehouse inventory updated",
    description: "Warehouse B stock synchronized successfully.",
    type: "Inventory",
  },
  {
    time: "15:26",
    title: "Production target achieved",
    description: "Assembly Line B exceeded today's target by 4%.",
    type: "Production",
  },
  {
    time: "14:48",
    title: "Purchase order approved",
    description: "Procurement approved order #PO-24781.",
    type: "Operations",
  },
];