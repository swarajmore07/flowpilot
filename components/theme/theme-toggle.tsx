"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useHydrated } from "@/lib/use-hydrated";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  /*
   * The server cannot know the resolved theme, so the icon only appears once
   * hydrated. Reserving the exact button footprint up front keeps the navbar
   * from shifting when it does.
   */
  const hydrated = useHydrated();

  if (!hydrated) {
    return <div className="size-8" aria-hidden="true" />;
  }

  const isDark = resolvedTheme === "dark";
  const label = isDark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      title={label}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun /> : <Moon />}
    </Button>
  );
}
