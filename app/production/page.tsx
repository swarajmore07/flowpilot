import type { Metadata } from "next";

import { ProductionOverview } from "@/components/production/production-overview";

export const metadata: Metadata = {
  title: "Production",
  description:
    "Every work order on the floor, with the runs past their due date called out.",
};

export default function ProductionPage() {
  return <ProductionOverview />;
}
