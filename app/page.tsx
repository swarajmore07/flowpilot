import { AppLayout } from "@/components/layout/app-layout";

export default function Home() {
  return (
    <AppLayout>
      <div className="rounded-xl border border-slate-200 bg-white p-8">
        <h1 className="text-3xl font-bold">
          FlowPilot AI
        </h1>

        <p className="mt-3 text-slate-600">
          AI-Powered Supply Chain Command Center
        </p>
      </div>
    </AppLayout>
  );
}