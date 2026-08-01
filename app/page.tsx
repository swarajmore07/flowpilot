import { AppLayout } from "@/components/layout/app-layout";

import { PageHeader } from "@/components/common/page-header/page-header";

import { MissionBrief } from "@/components/dashboard/mission-brief/mission-brief";
import { StatCard } from "@/components/dashboard/stat-card";
import { SupplyHealth } from "@/components/dashboard/supply-health";
import { InventoryHealth } from "@/components/dashboard/inventory-health";
import { SupplierPerformance } from "@/components/dashboard/supplier-performance";
import { ProductionTrend } from "@/components/dashboard/analytics";
import { AIForecast } from "@/components/dashboard/ai-forecast";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { QuickActions } from "@/components/dashboard/quick-actions/quick-actions";
import { AlertsPanel } from "@/components/dashboard/alerts-panel/alerts-panel";

import { dashboardData } from "@/data/dashboard/dashboard";

export default function Home() {
  return (
    <AppLayout>
      <PageHeader
        title="Dashboard"
        description="Monitor production, inventory, supplier performance, and AI-driven operational insights from a single command center."
      />

      <div className="space-y-8">
        <MissionBrief />

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {dashboardData.metrics.map((metric) => (
            <StatCard
              key={metric.title}
              title={metric.title}
              value={metric.value}
              icon={metric.icon}
              iconColor={metric.iconColor}
              trend={metric.trend}
              trendLabel={metric.trendLabel}
              status={metric.status}
            />
          ))}
        </div>

        <div className="grid gap-8 xl:grid-cols-12">
          <div className="xl:col-span-6">
            <SupplyHealth />
          </div>

          <div className="xl:col-span-6">
            <QuickActions />
          </div>
        </div>

        <AlertsPanel />

        <div className="grid gap-8 xl:grid-cols-12">
          <div className="xl:col-span-6">
            <ProductionTrend />
          </div>

          <div className="xl:col-span-6">
            <InventoryHealth />
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-12">
          <div className="xl:col-span-6">
            <SupplierPerformance />
          </div>

          <div className="xl:col-span-6">
            <AIForecast />
          </div>
        </div>

        <ActivityTimeline />
      </div>
    </AppLayout>
  );
}