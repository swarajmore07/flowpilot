"use client";

import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import type { ComponentType } from "react";

import { SectionCard } from "@/components/common/section-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";

interface Choice {
  value: string;
  label: string;
  hint: string;
  Icon: ComponentType<{ className?: string }>;
}

const choices: Choice[] = [
  {
    value: "light",
    label: "Light",
    hint: "Paper-white panels on a cool grey canvas.",
    Icon: Sun,
  },
  {
    value: "dark",
    label: "Dark",
    hint: "Graphite panels for low-light control rooms.",
    Icon: Moon,
  },
  {
    value: "system",
    label: "System",
    hint: "Follows the appearance setting on this device.",
    Icon: Monitor,
  },
];

/*
 * The theme, as a real setting rather than a toggle you have to guess at.
 *
 * The header keeps its icon toggle for quick flips; this exposes the third
 * state — following the operating system — which a two-way toggle cannot reach.
 * The choice is written to localStorage by next-themes, so it survives a reload
 * and applies before first paint.
 */
export function AppearanceCard() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  /* The server cannot know the stored theme, so the selected state only appears
     once hydrated. Until then the row keeps its exact footprint. */
  const hydrated = useHydrated();

  /* Read back rather than assumed. A stored value from an older build — or from
     another tab writing the key — is not one of these three, and claiming "set
     to light" for it would be the page inventing a state it is not in. */
  const active = choices.find((choice) => choice.value === theme);

  return (
    <SectionCard
      title="Appearance"
      description="Applies to every page and is remembered on this device."
    >
      {hydrated ? (
        <>
          {/* A group of toggle buttons rather than a radiogroup. A radiogroup
              promises arrow-key navigation and a single tab stop; these are three
              ordinary buttons, and announcing them as radios would describe
              keyboard behaviour that does not exist. */}
          <div role="group" aria-label="Theme" className="grid gap-2 sm:grid-cols-3">
            {choices.map((choice) => {
              const selected = theme === choice.value;

              return (
                <Button
                  key={choice.value}
                  aria-pressed={selected}
                  variant="outline"
                  className={cn(
                    "h-auto flex-col items-start gap-1.5 px-3.5 py-3 text-left whitespace-normal",
                    selected &&
                      "border-brand-line bg-brand-soft text-brand hover:border-brand hover:bg-brand-soft"
                  )}
                  onClick={() => setTheme(choice.value)}
                >
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <choice.Icon className="size-3.5" />
                    {choice.label}
                  </span>

                  <span
                    className={cn(
                      "text-xs leading-relaxed",
                      selected ? "text-brand/80" : "text-ink-faint"
                    )}
                  >
                    {choice.hint}
                  </span>
                </Button>
              );
            })}
          </div>

          <p className="mt-4 text-xs leading-relaxed text-ink-faint">
            {theme === "system"
              ? `Following this device, which currently asks for ${resolvedTheme === "dark" ? "dark" : "light"}.`
              : active
                ? `Set to ${active.label.toLowerCase()}, regardless of the device setting.`
                : "A stored theme this build does not offer. Choose one above to replace it."}
          </p>
        </>
      ) : (
        <>
          <div className="grid gap-2 sm:grid-cols-3">
            {choices.map((choice) => (
              <Skeleton key={choice.value} className="h-[68px] rounded-md" />
            ))}
          </div>

          <Skeleton className="mt-4 h-3 w-56" />
        </>
      )}
    </SectionCard>
  );
}
