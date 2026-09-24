import type { Metadata } from "next";

import { RescuePlanOverview } from "@/components/rescue-plan/rescue-plan-overview";

export const metadata: Metadata = {
  title: "Rescue plan",
  description:
    "The signals firing right now, turned into an ordered set of steps with the reading behind each one.",
};

export default function RescuePlanPage() {
  return <RescuePlanOverview />;
}
