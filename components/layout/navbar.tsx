"use client";

import { usePathname } from "next/navigation";
import { ChevronRight, PanelLeft } from "lucide-react";

import { QuickJump } from "@/components/layout/quick-jump";
import { NotificationTray } from "@/components/layout/notification-tray";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { getPageConfig } from "@/data/page-config";

interface NavbarProps {
  onOpenSidebar: () => void;
}

export function Navbar({ onOpenSidebar }: NavbarProps) {
  const pathname = usePathname();
  const page = getPageConfig(pathname);

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-panel px-4 lg:px-6">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onOpenSidebar}
        aria-label="Open navigation"
        className="lg:hidden"
      >
        <PanelLeft />
      </Button>

      {/* The page's own header carries the title and description; the chrome
          only needs to say where you are. */}
      <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
        <ol className="flex items-center gap-1.5">
          <li className="label-micro hidden sm:block">{page.section}</li>

          <li aria-hidden="true" className="hidden sm:block">
            <ChevronRight className="size-3.5 text-ink-faint" />
          </li>

          <li className="truncate text-sm font-medium text-ink">
            {page.title}
          </li>
        </ol>
      </nav>

      <QuickJump />

      <div className="flex items-center gap-1">
        <ThemeToggle />
        <NotificationTray />
      </div>

      <div className="ml-1 flex items-center gap-2.5 border-l border-line pl-3">
        <span
          aria-hidden="true"
          className="flex size-8 shrink-0 items-center justify-center rounded-md bg-brand-soft text-sm font-semibold text-brand"
        >
          S
        </span>

        <div className="hidden xl:block">
          <p className="text-sm leading-tight font-medium text-ink">Swaraj</p>
          <p className="label-micro mt-0.5">Operations</p>
        </div>
      </div>
    </header>
  );
}
