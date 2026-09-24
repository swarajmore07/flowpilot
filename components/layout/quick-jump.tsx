"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

import { useRouter } from "next/navigation";
import { CornerDownLeft, Search } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { navigation } from "@/data/navigation";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";
import type { NavigationItem } from "@/types/navigation";

/*
 * Replaces the old decorative "Search anything…" field. It only claims to do
 * what it actually does — jump between sections — so nothing in the chrome is
 * a prop.
 */

interface Destination extends NavigationItem {
  section: string;
}

const destinations: Destination[] = navigation.flatMap((group) =>
  group.items.map((item) => ({
    title: item.title,
    href: item.href,
    icon: item.icon,
    section: group.group,
  }))
);

export function QuickJump() {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const listRef = useRef<HTMLDivElement>(null);

  /* The modifier label differs per platform, and the server cannot know which
     one to print — so it stays blank until hydration settles the question. */
  const hydrated = useHydrated();
  const shortcut = hydrated
    ? /mac|iphone|ipad|ipod/i.test(navigator.userAgent)
      ? "⌘K"
      : "Ctrl K"
    : "";

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();

    if (term === "") return destinations;

    return destinations.filter(
      (destination) =>
        destination.title.toLowerCase().includes(term) ||
        destination.section.toLowerCase().includes(term) ||
        destination.href.toLowerCase().includes(term)
    );
  }, [query]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== "k") return;
      if (!event.metaKey && !event.ctrlKey) return;

      event.preventDefault();
      setOpen((current) => !current);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen);

    if (nextOpen) {
      setQuery("");
      setActiveIndex(0);
    }
  }, []);

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router]
  );

  function handleInputKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (results.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % results.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex(
        (current) => (current - 1 + results.length) % results.length
      );
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const target = results[activeIndex];
      if (target) go(target.href);
    }
  }

  /* Keep the highlighted row inside the scroll viewport. */
  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>('[data-active="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, results]);

  return (
    <>
      <button
        type="button"
        onClick={() => handleOpenChange(true)}
        className="hidden h-8 items-center gap-2 rounded-md border border-line bg-panel-sunken/60 pr-2 pl-2.5 text-sm text-ink-faint transition-colors hover:border-line-strong hover:text-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand md:flex lg:w-64"
      >
        <Search className="size-4 shrink-0" />

        <span className="flex-1 text-left">Jump to…</span>

        <kbd className="identifier hidden min-w-12 rounded-sm border border-line bg-panel px-1.5 py-0.5 text-[0.6875rem] text-ink-faint lg:inline-block">
          {shortcut}
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="top-[12vh] max-w-lg translate-y-0 overflow-hidden p-0">
          <DialogTitle className="sr-only">Jump to a section</DialogTitle>

          <DialogDescription className="sr-only">
            Type to filter, then press Enter to open the highlighted section.
          </DialogDescription>

          <div className="flex items-center gap-2.5 border-b border-line px-4">
            <Search className="size-4 shrink-0 text-ink-faint" />

            <input
              autoFocus
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={handleInputKeyDown}
              placeholder="Jump to a section…"
              aria-label="Jump to a section"
              className="h-12 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
            />
          </div>

          <div ref={listRef} className="max-h-80 overflow-y-auto p-2">
            {results.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-ink-faint">
                No section matches “{query.trim()}”.
              </p>
            ) : (
              results.map((destination, index) => {
                const Icon = destination.icon;
                const isActive = index === activeIndex;

                return (
                  <button
                    key={destination.href}
                    type="button"
                    data-active={isActive}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => go(destination.href)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                      isActive
                        ? "bg-brand-soft text-brand"
                        : "text-ink-soft hover:bg-panel-sunken"
                    )}
                  >
                    <Icon className="size-4 shrink-0" />

                    <span className="flex-1 truncate font-medium">
                      {destination.title}
                    </span>

                    <span className="label-micro shrink-0">
                      {destination.section}
                    </span>

                    {isActive ? (
                      <CornerDownLeft
                        aria-hidden="true"
                        className="size-3.5 shrink-0 opacity-70"
                      />
                    ) : (
                      <span aria-hidden="true" className="size-3.5 shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
