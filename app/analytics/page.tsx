import type { Metadata } from "next";

import { AnalyticsOverview } from "@/components/analytics/analytics-overview";

export const metadata: Metadata = {
  title: "Analytics",
  description:
    "Cross-cuts of the inventory, supplier and production records held in this workspace. Nothing here is forecast.",
};

export default function AnalyticsPage() {
  return <AnalyticsOverview />;
}
