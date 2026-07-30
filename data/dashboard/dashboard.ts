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