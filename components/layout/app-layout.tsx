"use client";

import { useEffect, useState, type ReactNode } from "react";

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { ToastProvider } from "@/components/ui/toast";

import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  /* If the viewport grows past the breakpoint where the permanent sidebar
     appears, close the drawer — otherwise it keeps the page scroll locked
     behind a sidebar that is already visible. */
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");

    function handleChange(event: MediaQueryListEvent) {
      if (event.matches) setMobileNavOpen(false);
    }

    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden bg-canvas">
        {/* Permanent sidebar from lg up */}
        <Sidebar className="hidden lg:flex" />

        {/* Drawer below lg */}
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetContent
            side="left"
            className="data-[side=left]:w-64 data-[side=left]:sm:max-w-64"
          >
            <SheetTitle className="sr-only">Navigation</SheetTitle>

            <Sidebar
              className="w-full border-r-0"
              onNavigate={() => setMobileNavOpen(false)}
            />
          </SheetContent>
        </Sheet>

        <div className="flex min-w-0 flex-1 flex-col">
          <Navbar onOpenSidebar={() => setMobileNavOpen(true)} />

          <main className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
