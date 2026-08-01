import { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Layout */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Fixed Navbar */}
        <Navbar />

        {/* Scrollable Dashboard Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <div className="w-full p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}