import type { Metadata } from "next";

import { DashboardOverview } from "@/components/dashboard/dashboard-overview";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "One reading of the network: what is firing, what is holding and what needs a decision today.",
};

export default function DashboardPage() {
  return <DashboardOverview />;
}
