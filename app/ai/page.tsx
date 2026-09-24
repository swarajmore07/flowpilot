import type { Metadata } from "next";

import { CopilotConsole } from "@/components/ai/copilot-console";

export const metadata: Metadata = {
  title: "AI Copilot",
  description:
    "Ask about the state of the network. Answers are computed from the records in this workspace — no model is called.",
};

export default function AiPage() {
  return <CopilotConsole />;
}
