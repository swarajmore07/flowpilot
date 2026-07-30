import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/common/page-header";
import { MissionBrief } from "@/components/dashboard/mission-brief/mission-brief";
import { QuickActions } from "@/components/dashboard/quick-actions/quick-actions";

export default function Home() {
  return (
    <AppLayout>
  <PageHeader
    title="Dashboard"
    description="Monitor production, inventory, supplier performance, and AI-driven operational insights from a single command center."
  />

  <MissionBrief />

  <QuickActions />
</AppLayout>
  );
}