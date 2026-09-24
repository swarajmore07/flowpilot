import type { Metadata } from "next";

import { SettingsOverview } from "@/components/settings/settings-overview";

export const metadata: Metadata = {
  title: "Settings",
  description:
    "Appearance, the thresholds every reading is measured against, and where this workspace keeps its records.",
};

export default function SettingsPage() {
  return <SettingsOverview />;
}
